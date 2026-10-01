/* Explicit RU/EN routes work without JavaScript. Remember the visitor's choice. */
(()=>{
 const current=document.documentElement.lang;
 const alternate=document.querySelector('link[rel="alternate"][hreflang="en"]');
 try{
  if(current==='en')localStorage.setItem('me-site-language','en');
  else if(localStorage.getItem('me-site-language')==='en'&&alternate){
   const url=new URL(alternate.href,location.href);url.search=location.search;url.hash=location.hash;location.replace(url.href);
  }
 }catch(_){/* Language links remain usable when storage is unavailable. */}
 document.addEventListener('DOMContentLoaded',()=>{
  document.querySelectorAll('[data-site-lang]').forEach(link=>{
   const url=new URL(link.href,location.href);url.search=location.search;url.hash=location.hash;link.href=url.href;
   link.addEventListener('click',()=>{try{localStorage.setItem('me-site-language',link.dataset.siteLang);}catch(_){}});
  });
 });
})();
