'use strict';
document.body.classList.add('js');
const toggle=document.querySelector('.menu-toggle');
const nav=document.querySelector('nav');
function closeMenu(){nav.classList.remove('open');toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','Открыть меню');}
toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';nav.classList.toggle('open',open);toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Закрыть меню':'Открыть меню');});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&toggle.getAttribute('aria-expanded')==='true'){closeMenu();toggle.focus();}});
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
let navigationTimer;
function resetNavigation(){
 clearTimeout(navigationTimer);
 document.body.classList.remove('page-leaving');
 nav.querySelectorAll('[data-pending]').forEach(a=>a.removeAttribute('data-pending'));
}
window.addEventListener('pageshow',resetNavigation);
nav.addEventListener('click',e=>{
 const anchor=e.target.closest('a');
 if(!anchor||e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||anchor.target||anchor.hasAttribute('download'))return;
 const destination=new URL(anchor.href,location.href);
 if(destination.origin!==location.origin)return;
 closeMenu();
 if(destination.pathname===location.pathname&&destination.search===location.search)return;
 if(reducedMotion.matches)return;
 e.preventDefault();
 resetNavigation();
 anchor.setAttribute('data-pending','');
 document.body.classList.add('page-leaving');
 navigationTimer=setTimeout(()=>location.assign(destination.href),140);
});
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

// Screenshot language changes only the supplied app captures.
document.querySelectorAll('.race-gallery').forEach(gallery=>{
 gallery.querySelectorAll('[data-screen-lang]').forEach(button=>button.addEventListener('click',()=>{
  const language=button.dataset.screenLang;
  gallery.querySelectorAll('[data-screen-lang]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
  gallery.querySelectorAll('[data-shot]').forEach(link=>{
   const img=link.querySelector('img');
   link.href=img.src.replace(/-(ru|en)\.png$/,`-${language}.png`);
   img.src=link.href;
   img.alt=link.closest('figure').querySelector('h3').textContent+' — '+(language==='ru'?'русский':'английский')+' интерфейс ME Race';
  });
 }));
});

// Keep native details semantics, with an interruptible height transition.
document.querySelectorAll('.project-details').forEach(details=>{
 const summary=details.querySelector('summary');
 let animation=null,expanded=details.open;
 summary.addEventListener('click',event=>{
  if(reducedMotion.matches||!details.animate)return;
  event.preventDefault();
  if(!animation)expanded=details.open;
  const start=details.getBoundingClientRect().height;
  expanded=!expanded;
  animation?.cancel();
  details.style.height='';
  details.open=true;
  const end=expanded?details.getBoundingClientRect().height:summary.getBoundingClientRect().height;
  details.style.overflow='hidden';
  animation=details.animate({height:[`${start}px`,`${end}px`]},{duration:expanded?280:200,easing:'cubic-bezier(.22,1,.36,1)'});
  animation.onfinish=()=>{details.open=expanded;details.style.overflow='';animation=null;};
 });
 reducedMotion.addEventListener('change',()=>{
  if(reducedMotion.matches&&animation){animation.cancel();animation=null;details.open=expanded;details.style.overflow='';}
 });
});

// Native dialog keeps keyboard focus inside the image viewer.
const imageLinks=document.querySelectorAll('.screen-preview, .concept-figure a, .race-shot a');
if(imageLinks.length){
 const viewer=document.createElement('dialog');
 viewer.className='image-viewer';
 viewer.setAttribute('aria-label','Просмотр изображения');
 viewer.innerHTML='<button type="button" class="image-viewer-close" aria-label="Закрыть просмотр">×</button><img alt="">';
 document.body.append(viewer);
 const picture=viewer.querySelector('img');
 let opener,previousOverflow,closing=false;
 function closeViewer(){
  if(closing||!viewer.open)return;
  if(reducedMotion.matches||!viewer.animate){viewer.close();return;}
  closing=true;
  viewer.classList.add('is-closing');
  const exit=viewer.animate({opacity:[1,0]},{duration:150,easing:'ease-in'});
  exit.finished.then(()=>viewer.close()).catch(()=>viewer.close());
 }
 imageLinks.forEach(link=>{
  link.removeAttribute('target');
  link.addEventListener('click',event=>{
   if(event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
   event.preventDefault();opener=link;
   picture.src=link.href;picture.alt=link.querySelector('img').alt;
   previousOverflow=document.body.style.overflow;
   document.body.style.overflow='hidden';viewer.showModal();
  });
 });
 viewer.querySelector('button').addEventListener('click',closeViewer);
 viewer.addEventListener('cancel',event=>{event.preventDefault();closeViewer();});
 viewer.addEventListener('click',event=>{if(event.target===viewer)closeViewer();});
 viewer.addEventListener('close',()=>{closing=false;viewer.classList.remove('is-closing');document.body.style.overflow=previousOverflow;picture.removeAttribute('src');opener?.focus({preventScroll:true});});
}
