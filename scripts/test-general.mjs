import assert from 'node:assert/strict';
import fs from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
const source=fs.readFileSync('functions/api/[[path]].js','utf8');
const {onRequest}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const sqlite=new DatabaseSync(':memory:');
for(const file of fs.readdirSync('migrations').filter(x=>x.endsWith('.sql')).sort())sqlite.exec(fs.readFileSync('migrations/'+file,'utf8'));
class Statement {
 constructor(sql,values=[]){this.sql=sql;this.values=values;}
 bind(...values){return new Statement(this.sql,values);}
 async run(){return sqlite.prepare(this.sql).run(...this.values);}
 async first(){return sqlite.prepare(this.sql).get(...this.values)||null;}
 async all(){return {results:sqlite.prepare(this.sql).all(...this.values)};}
}
const env={DB:{prepare:sql=>new Statement(sql),batch:async statements=>{sqlite.exec('BEGIN');try{const result=[];for(const s of statements)result.push(await s.run());sqlite.exec('COMMIT');return result;}catch(e){sqlite.exec('ROLLBACK');throw e;}}},SPARK_ADMIN_USERNAME:'admin',SPARK_ADMIN_PASSWORD:'StrongAdminPassword123!'};
async function call(path,method='GET',body,token){const response=await onRequest({env,request:new Request('https://test/api'+path,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:body===undefined?undefined:JSON.stringify(body)})});return {status:response.status,data:await response.json()};}
const pass='UserPassword123!';
assert.equal((await call('/data')).status,401);
assert.equal((await call('/auth/login','POST',{username:'admin',password:'Spark@2026#ERP'})).status,401);
const admin=(await call('/auth/login','POST',{username:'admin',password:env.SPARK_ADMIN_PASSWORD})).data.token;assert.ok(admin);
for(const username of ['alice','bob'])assert.equal((await call('/admin/users','POST',{username,password:pass,displayName:username},admin)).status,201);
const alice=(await call('/auth/login','POST',{username:'alice',password:pass})).data.token;
const bob=(await call('/auth/login','POST',{username:'bob',password:pass})).data.token;
assert.equal((await call('/admin/users','GET',undefined,alice)).status,403);
assert.equal((await call('/admin/users','POST',{username:'alice',password:pass,displayName:'duplicate'},admin)).status,409);
for(const [token,name] of [[alice,'A'],[bob,'B']])assert.equal((await call('/data','POST',{collection:'projects',item:{id:'same-id',name}},token)).status,200);
assert.equal((await call('/data','GET',undefined,alice)).data.projects[0].name,'A');
assert.equal((await call('/data','GET',undefined,bob)).data.projects[0].name,'B');
await call('/backup','POST',{secret:'alice backup'},alice);
assert.equal((await call('/backup/latest','GET',undefined,bob)).status,404);
await call('/data','DELETE',{collection:'projects',id:'same-id'},alice);
assert.equal((await call('/sync/pull?since=1','GET',undefined,alice)).data.data.projects.length,0);
assert.equal((await call('/data','GET',undefined,bob)).data.projects.length,1);
await call('/data/restore','POST',{db:{projects:[{id:'restored',name:'restored'}]}},alice);
assert.equal((await call('/data','GET',undefined,bob)).data.projects[0].name,'B');
assert.equal((await call('/sync/push','POST',{operations:[{id:'op',entity:'projects',operation:'create',payload:{id:'sync',name:'Synced'}}]},alice)).status,200);
assert.equal((await call('/sync/push','POST',{operations:[{entity:'accounts',operation:'create',payload:{id:'bad'}}]},alice)).status,400);
await call('/data/reset','POST',{},alice);
assert.equal((await call('/data','GET',undefined,bob)).data.projects.length,1);
const users=(await call('/admin/users','GET',undefined,admin)).data.users;
assert.ok(users.every(u=>!u.password_hash));
const aid=users.find(u=>u.username==='alice').id;
await call('/admin/users/'+aid,'PATCH',{active:false},admin);
assert.equal((await call('/data','GET',undefined,alice)).status,401);
assert.equal((await call('/auth/login','POST',{username:'alice',password:pass})).status,401);
await call('/admin/users/'+aid,'PATCH',{active:true,password:'ReplacementPassword123!'},admin);
assert.equal((await call('/auth/login','POST',{username:'alice',password:pass})).status,401);
assert.equal((await call('/auth/login','POST',{username:'alice',password:'ReplacementPassword123!'})).status,200);
assert.equal((await call('/auth/change-password','POST',{currentPassword:'wrong',newPassword:'NewPassword12345!'},bob)).status,403);
assert.equal((await call('/auth/change-password','POST',{currentPassword:pass,newPassword:'NewPassword12345!'},bob)).status,200);
assert.equal((await call('/data','GET',undefined,bob)).status,401);
await call('/auth/logout','POST',{},admin);
assert.equal((await call('/admin/users','GET',undefined,admin)).status,401);
console.log('PASS: migrations, bootstrap, accounts, authorization, duplicate users, tenant CRUD, backups, restore/reset, sync, suspension, password resets, session revocation and logout.');
