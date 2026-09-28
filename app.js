'use strict';
document.body.classList.add('js');
const toggle=document.querySelector('.menu-toggle');
const nav=document.querySelector('nav');
function closeMenu(){nav.classList.remove('open');toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','Открыть меню');}
toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';nav.classList.toggle('open',open);toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Закрыть меню':'Открыть меню');});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&toggle.getAttribute('aria-expanded')==='true'){closeMenu();toggle.focus();}});
nav.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu();});
if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
 document.querySelector('.hero')?.classList.add('enter');

}
const form=document.querySelector('#contact-form');
if(form){
 const status=document.querySelector('#form-status'),submit=form.querySelector('button[type=submit]');
 const topic=new URLSearchParams(location.search).get('topic');
 if([...form.elements.topic.options].some(o=>o.value===topic))form.elements.topic.value=topic;
 if(location.hash==='#contact')document.querySelector('#contact').focus({preventScroll:true});
 const submitMarkup=submit.innerHTML;
 let attempted=false,id=crypto.randomUUID();
 function data(){return Object.fromEntries(['name','email','topic','message','website'].map(k=>[k,form.elements[k].value.trim()]).concat([['privacyAcknowledged',form.elements.privacyAcknowledged.checked],['sourcePage',location.pathname],['requestId',id]]));}
 function validate(d){const e={};if(d.name.length<2||d.name.length>100)e.name='Введите имя от 2 до 100 символов.';if(!d.email||!form.elements.email.validity.valid)e.email='Укажите корректный email для ответа.';if(!d.topic)e.topic='Выберите тему обращения.';if(d.message.length<10||d.message.length>5000)e.message='Введите сообщение от 10 до 5000 символов.';if(!d.privacyAcknowledged)e.privacyAcknowledged='Подтвердите ознакомление с условиями.';return e;}
 function errors(e){for(const key of ['name','email','topic','message','privacyAcknowledged']){document.getElementById(key+'-error').textContent=e[key]?'Ошибка: '+e[key]:'';form.elements[key].setAttribute('aria-invalid',String(!!e[key]));}}
 form.addEventListener('input',()=>{if(attempted)errors(validate(data()));});
 form.addEventListener('submit',async event=>{event.preventDefault();if(submit.disabled)return;attempted=true;const d=data(),e=validate(d);errors(e);if(Object.keys(e).length){form.elements[Object.keys(e)[0]].focus();return;}if(document.body.dataset.contactMode==='download'){
 const topicLabel=form.elements.topic.selectedOptions[0].textContent;
 const body=['ME Systems — обращение','Имя: '+d.name,'Email: '+d.email,'Тема: '+topicLabel,'',d.message,'','Файл создан на устройстве. Обращение не отправлено в компанию.'].join('\n');
 const url=URL.createObjectURL(new Blob(['\uFEFF'+body],{type:'text/plain;charset=utf-8'}));
 const download=document.createElement('a');download.href=url;download.download='ME-Systems-request.txt';document.body.append(download);download.click();download.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
 status.textContent='Текст обращения подготовлен для скачивания. Отправка в компанию не выполнялась.';return;
 }
 submit.disabled=true;submit.textContent='Сохраняем…';status.textContent='';try{const response=await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(d)});const result=await response.json();if(!response.ok){if(result.errors){errors(result.errors);form.elements[Object.keys(result.errors)[0]]?.focus();}throw new Error(response.status===429?'Слишком много обращений. Повторите через минуту.':result.message||'Не удалось сохранить обращение. Повторите попытку.');}status.textContent='Обращение сохранено на этом компьютере. Отправка в компанию не выполнялась.';form.reset();attempted=false;errors({});id=crypto.randomUUID();}catch(error){status.textContent='Ошибка: '+(error instanceof TypeError?'Нет связи с локальным сервером. Ваш текст сохранён в форме — попробуйте ещё раз.':error.message);}finally{submit.disabled=false;submit.innerHTML=submitMarkup;}});
}
