// Pin the workspace identity for the lifetime of this page, including other-tab logins.
let identity=null;
try { identity=JSON.parse(sessionStorage.getItem('general_user')||localStorage.getItem('general_user')||'null'); if(identity) sessionStorage.setItem('general_user',JSON.stringify(identity)); } catch {}
export function currentUser() { return identity; }
export function tenantKey(key) { return 'general:'+ (identity?.id || 'signed-out') + ':'+key; }
