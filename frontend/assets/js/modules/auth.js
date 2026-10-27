import { api, getToken, setToken, clearToken } from './api.js';
export async function login(username,password,remember) {
 const res=await api.login(username,password);
 setToken(res.token,remember);
 // Identity is stored alongside the session, so tabs never share an active account.
 sessionStorage.setItem('general_user',JSON.stringify(res.user));
 if(remember) localStorage.setItem('general_user',JSON.stringify(res.user));
 else localStorage.removeItem('general_user');
 return res.username;
}
export async function updatePassword(currentPassword,newPassword) {
 const result=await api.changePassword(currentPassword,newPassword);
 clearToken(); window.location.replace('./login.html'); return result;
}
export function isLoggedIn() { return !!getToken(); }
export function requireAuth() { if(!isLoggedIn()) { window.location.replace('./login.html'); return false; } return true; }
export async function logout() {
 const pending=api.logout(); clearToken(); sessionStorage.removeItem('general_user'); localStorage.removeItem('general_user');
 try { await pending; } catch {}
}
