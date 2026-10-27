import { api } from '../modules/api.js';
import { requireAuth } from '../modules/auth.js';
const message=document.getElementById('message');
const dialog=document.getElementById('passwordDialog');
let target=null;
const report=e=>{message.textContent=e.message||String(e);};
async function load() {
 const {users}=await api.request('/admin/users');
 document.getElementById('count').textContent=`${users.length} حساب`;
 const root=document.getElementById('users'); root.replaceChildren();
 for(const u of users) {
  const row=document.createElement('tr');
  for(const value of [u.displayName,u.username,u.role==='admin'?'أدمن':'مستخدم',u.active?'نشط':'معطل']) { const td=document.createElement('td'); td.textContent=value; row.append(td); }
  const actions=document.createElement('td');
  if(u.role!=='admin') {
   const toggle=document.createElement('button'); toggle.textContent=u.active?'تعطيل الحساب':'تفعيل الحساب';
   toggle.onclick=async()=>{toggle.disabled=true;try{await api.request('/admin/users/'+encodeURIComponent(u.id),{method:'PATCH',body:{active:!u.active}});await load();message.textContent='تم تحديث حالة الحساب';}catch(e){report(e);toggle.disabled=false;}};
   const reset=document.createElement('button');reset.textContent='تغيير كلمة المرور';reset.onclick=()=>{target=u.id;document.getElementById('resetPassword').reset();dialog.showModal();};
   actions.append(toggle,reset);
  }
  row.append(actions);root.append(row);
 }
}
document.getElementById('createUser').onsubmit=async e=>{
 e.preventDefault();const button=e.target.querySelector('button');button.disabled=true;
 try{await api.request('/admin/users',{method:'POST',body:Object.fromEntries(new FormData(e.target))});e.target.reset();await load();message.textContent='تم إنشاء الحساب. بيانات المستخدم تبدأ فارغة ومعزولة.';}catch(e){report(e);}finally{button.disabled=false;}
};
document.getElementById('cancelPassword').onclick=()=>dialog.close();
document.getElementById('resetPassword').onsubmit=async e=>{
 e.preventDefault();const button=e.target.querySelector('button');button.disabled=true;
 try{await api.request('/admin/users/'+encodeURIComponent(target),{method:'PATCH',body:{password:new FormData(e.target).get('password')}});dialog.close();e.target.reset();message.textContent='تم تغيير كلمة المرور وإنهاء جلسات المستخدم القديمة';}catch(e){report(e);}finally{button.disabled=false;}
};
if(requireAuth()) {
 try{const {user}=await api.request('/auth/me');if(user.role!=='admin'){location.replace('./dashboard.html');}else{await load();}}catch(e){report(e);document.getElementById('createUser').hidden=true;}
}
