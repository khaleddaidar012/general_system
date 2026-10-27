const KEYS = ['projects','suppliers','contractors','clients','others','materials','moneyTransactions','materialTransactions','deductions'];
const encoder = new TextEncoder();
const reply = (data, status=200) => new Response(JSON.stringify(data), {status, headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}});
const fail = (message,status=400) => { throw Object.assign(new Error(message),{status}); };
const hex = bytes => Array.from(new Uint8Array(bytes), b=>b.toString(16).padStart(2,'0')).join('');
async function digest(value) { return hex(await crypto.subtle.digest('SHA-256',encoder.encode(value))); }
async function passwordHash(password, salt=hex(crypto.getRandomValues(new Uint8Array(16)))) {
 const key=await crypto.subtle.importKey('raw',encoder.encode(password),'PBKDF2',false,['deriveBits']);
 return salt+':'+hex(await crypto.subtle.deriveBits({name:'PBKDF2',salt:encoder.encode(salt),iterations:100000,hash:'SHA-256'},key,256));
}
async function passwordMatches(password,hash) { return typeof password==='string' && await passwordHash(password,hash.split(':')[0])===hash; }
function validatePassword(value) { if(typeof value!=='string'||value.length<12||value.length>256) fail('Password must contain 12 to 256 characters'); }
function publicUser(u) { return {id:u.id,username:u.username,displayName:u.display_name,role:u.role,active:!!u.active,createdAt:u.created_at}; }
async function bodyOf(request) { try { return await request.json(); } catch { fail('Invalid JSON'); } }
async function authenticate(request,db) {
 const token=(request.headers.get('Authorization')||'').replace(/^Bearer /,'');
 const user=await db.prepare('SELECT a.* FROM accounts a JOIN sessions s ON a.id=s.user_id WHERE s.token_hash=? AND s.expires_at>? AND s.version=a.session_version AND a.active=1').bind(await digest(token),Date.now()).first();
 if(!user) fail('Unauthorized',401); return user;
}
function recordStatement(db,user,collection,item) {
 if(!KEYS.includes(collection)||!item||typeof item.id!=='string'||!item.id||item.id.length>256) fail('Invalid collection or item');
 return db.prepare('INSERT INTO tenant_records(user_id,collection,id,data) VALUES(?,?,?,?) ON CONFLICT(user_id,collection,id) DO UPDATE SET data=excluded.data').bind(user.id,collection,item.id,JSON.stringify(item));
}
async function snapshot(db,user) {
 const out=Object.fromEntries(KEYS.map(k=>[k,[]]));
 const {results}=await db.prepare('SELECT collection,data FROM tenant_records WHERE user_id=?').bind(user.id).all();
 for(const row of results||[]) if(out[row.collection]) out[row.collection].push(JSON.parse(row.data)); return out;
}
export async function onRequest({request,env}) {
 try {
 const path=new URL(request.url).pathname.replace(/\/$/,''); const method=request.method; const db=env.DB;
 if(path==='/api/health') return reply({status:'ok',service:'general-system'});
 if(!db) fail('D1 DB binding is required',503);
 if(path==='/api/auth/login' && method==='POST') {
  const b=await bodyOf(request); const username=String(b.username||'').trim().toLowerCase();
  if(!username || typeof b.password!=='string'||b.password.length>256) fail('Invalid credentials',401);
  const throttle=await digest((request.headers.get('CF-Connecting-IP')||'local')+':'+username);
  const attempt=await db.prepare('SELECT * FROM login_attempts WHERE key=?').bind(throttle).first();
  if(attempt && attempt.expires_at>Date.now() && attempt.attempts>=10) fail('Too many attempts. Try again in 15 minutes',429);
  await db.prepare('INSERT INTO login_attempts(key,attempts,expires_at) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET attempts=CASE WHEN expires_at<? THEN 1 ELSE attempts+1 END, expires_at=CASE WHEN expires_at<? THEN excluded.expires_at ELSE expires_at END').bind(throttle,Date.now()+900000,Date.now(),Date.now()).run();
  // Provision the first administrator only with explicitly configured deployment credentials.
  if(username===String(env.SPARK_ADMIN_USERNAME||'').toLowerCase() && env.SPARK_ADMIN_PASSWORD && b.password===env.SPARK_ADMIN_PASSWORD) {
   validatePassword(b.password);
   const hash=await passwordHash(b.password);
   await db.prepare("INSERT INTO accounts(id,username,display_name,password_hash,role,created_at) SELECT ?,?,?,?,'admin',? WHERE NOT EXISTS(SELECT 1 FROM accounts WHERE role='admin') ON CONFLICT(username) DO NOTHING").bind(crypto.randomUUID(),username,'Administrator',hash,Date.now()).run();
  }
  const u=await db.prepare('SELECT * FROM accounts WHERE username=?').bind(username).first();
  if(!u||!u.active||!await passwordMatches(b.password,u.password_hash)) fail('Invalid username or password',401);
  await db.prepare('DELETE FROM login_attempts WHERE key=?').bind(throttle).run();
  const token=hex(crypto.getRandomValues(new Uint8Array(32)));
  await db.prepare('INSERT INTO sessions(token_hash,user_id,version,expires_at) VALUES(?,?,?,?)').bind(await digest(token),u.id,u.session_version,Date.now()+86400000).run();
  return reply({token,username:u.username,user:publicUser(u)});
 }
 const user=await authenticate(request,db);
 if(path==='/api/auth/me' && method==='GET') return reply({user:publicUser(user)});
 if(path==='/api/auth/logout' && method==='POST') {
  await db.prepare('DELETE FROM sessions WHERE token_hash=?').bind(await digest((request.headers.get('Authorization')||'').replace(/^Bearer /,''))).run(); return reply({ok:true});
 }
 if(path==='/api/auth/verify' && method==='POST') return reply({ok:await passwordMatches((await bodyOf(request)).password,user.password_hash)});
 if(path==='/api/auth/change-password' && method==='POST') {
  const b=await bodyOf(request); validatePassword(b.newPassword);
  if(!await passwordMatches(b.currentPassword,user.password_hash)) fail('Wrong current password',403);
  await db.prepare('UPDATE accounts SET password_hash=?,session_version=session_version+1 WHERE id=?').bind(await passwordHash(b.newPassword),user.id).run(); return reply({ok:true,reauthenticate:true});
 }
 if(path.startsWith('/api/admin/')) {
  if(user.role!=='admin') fail('Forbidden',403);
  if(path==='/api/admin/users' && method==='GET') { const r=await db.prepare('SELECT * FROM accounts ORDER BY created_at DESC').all(); return reply({users:r.results.map(publicUser)}); }
  if(path==='/api/admin/users' && method==='POST') {
   const b=await bodyOf(request); const name=String(b.username||'').trim().toLowerCase();
   if(!/^[a-z0-9_.-]{3,64}$/.test(name)) fail('Username must be 3-64 letters, numbers, dots, underscores or hyphens'); validatePassword(b.password);
   if(!String(b.displayName||'').trim()||b.displayName.length>120) fail('Display name is required (max 120 characters)');
   const id=crypto.randomUUID();
   try { await db.prepare("INSERT INTO accounts(id,username,display_name,password_hash,role,created_at) VALUES(?,?,?,?,'user',?)").bind(id,name,b.displayName.trim(),await passwordHash(b.password),Date.now()).run(); } catch(e) { if(String(e).includes('UNIQUE')) fail('Username already exists',409); throw e; }
   return reply({ok:true,id},201);
  }
  const match=path.match(/^\/api\/admin\/users\/([^/]+)$/);
  if(match && method==='PATCH') {
   const id=decodeURIComponent(match[1]); const b=await bodyOf(request);
   const target=await db.prepare('SELECT * FROM accounts WHERE id=?').bind(id).first(); if(!target) fail('User not found',404);
   if(target.role==='admin') fail('Administrator accounts cannot be changed here',403);
   const statements=[];
   if(b.active!==undefined) { if(typeof b.active!=='boolean') fail('Invalid active value'); statements.push(db.prepare('UPDATE accounts SET active=?,session_version=session_version+1 WHERE id=?').bind(b.active?1:0,id)); }
   if(b.password!==undefined) { validatePassword(b.password); statements.push(db.prepare('UPDATE accounts SET password_hash=?,session_version=session_version+1 WHERE id=?').bind(await passwordHash(b.password),id)); }
   if(b.displayName!==undefined) { if(typeof b.displayName!=='string'||!b.displayName.trim()||b.displayName.length>120) fail('Invalid display name'); statements.push(db.prepare('UPDATE accounts SET display_name=? WHERE id=?').bind(b.displayName.trim(),id)); }
   if(!statements.length) fail('No changes supplied'); await db.batch(statements); return reply({ok:true});
  }
  fail('Not found',404);
 }
 if(path==='/api/data' && method==='GET') return reply(await snapshot(db,user));
 if(path==='/api/data' && method==='POST') { const b=await bodyOf(request); await recordStatement(db,user,b.collection,b.item).run(); return reply({ok:true}); }
 if(path==='/api/data' && method==='DELETE') { const b=await bodyOf(request); if(!KEYS.includes(b.collection)||!b.id) fail('Invalid record'); await db.prepare('DELETE FROM tenant_records WHERE user_id=? AND collection=? AND id=?').bind(user.id,b.collection,b.id).run(); return reply({ok:true}); }
 if(path==='/api/data/reset' && method==='POST') { await db.prepare('DELETE FROM tenant_records WHERE user_id=?').bind(user.id).run(); return reply({ok:true}); }
 if(path==='/api/data/seed' && method==='POST') return reply({ok:true,seeded:false});
 if(path==='/api/data/restore' && method==='POST') {
  const b=await bodyOf(request); if(!b.db||typeof b.db!=='object'||Array.isArray(b.db)) fail('Invalid backup');
  const statements=[db.prepare('DELETE FROM tenant_records WHERE user_id=?').bind(user.id)];
  for(const k of KEYS) { if(b.db[k]!==undefined&&!Array.isArray(b.db[k])) fail('Invalid collection'); for(const item of b.db[k]||[]) statements.push(recordStatement(db,user,k,item)); }
  await db.batch(statements); return reply({ok:true});
 }
 if(path==='/api/sync/push' && method==='POST') {
  const b=await bodyOf(request); if(!Array.isArray(b.operations)||b.operations.length>100) fail('Invalid operations (max 100)'); const statements=[];
  for(const op of b.operations) { if(!KEYS.includes(op.entity)) fail('Unknown collection'); if(op.operation==='delete') { const id=op.entityId||op.payload?.id; if(typeof id!=='string'||!id) fail('Invalid id'); statements.push(db.prepare('DELETE FROM tenant_records WHERE user_id=? AND collection=? AND id=?').bind(user.id,op.entity,id)); } else { if(!['create','update','upsert'].includes(op.operation)) fail('Invalid operation'); statements.push(recordStatement(db,user,op.entity,op.payload)); } }
  if(statements.length) await db.batch(statements); return reply({ok:true,processed:b.operations.map(x=>x.id),serverTime:Date.now()});
 }
 // Full snapshots propagate deletions and resets across devices without clock assumptions.
 if(path==='/api/sync/pull' && method==='GET') return reply({ok:true,data:await snapshot(db,user),serverTime:Date.now()});
 if(path==='/api/backup' && method==='POST') { const b=await bodyOf(request); await db.prepare('INSERT INTO tenant_backups(user_id,data,updated_at) VALUES(?,?,?) ON CONFLICT(user_id) DO UPDATE SET data=excluded.data,updated_at=excluded.updated_at').bind(user.id,JSON.stringify(b),Date.now()).run(); return reply({ok:true}); }
 if(path==='/api/backup/latest' && method==='GET') { const row=await db.prepare('SELECT data FROM tenant_backups WHERE user_id=?').bind(user.id).first(); if(!row) fail('No backup yet',404); return reply(JSON.parse(row.data)); }
 fail('Not found',404);
 } catch(e) { if(!e.status) console.error(e); return reply({error:e.status?e.message:'Internal server error'},e.status||500); }
}
