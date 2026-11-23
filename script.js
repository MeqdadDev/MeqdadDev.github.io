const menu = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
function closeMenu(){ menu.setAttribute('aria-expanded','false'); navigation.classList.remove('open'); }
menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));navigation.classList.toggle('open',open);});
navigation.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu.getAttribute('aria-expanded')==='true'){closeMenu();menu.focus();}});
document.addEventListener('click',e=>{if(!e.target.closest('.header'))closeMenu();});
const themeButton=document.querySelector('.theme-toggle');
const systemTheme=matchMedia('(prefers-color-scheme: dark)');
function updateTheme(theme){document.documentElement.dataset.theme=theme;const dark=theme==='dark';themeButton.setAttribute('aria-pressed',String(dark));themeButton.setAttribute('aria-label',`Switch to ${dark?'light':'dark'} mode`);themeButton.querySelector('.theme-label').textContent=dark?'Light':'Dark';document.querySelector('meta[name="theme-color"]').content=dark?'#121c17':'#f5f4ed';}
updateTheme(document.documentElement.dataset.theme);
themeButton.addEventListener('click',()=>{const theme=document.documentElement.dataset.theme==='dark'?'light':'dark';updateTheme(theme);try{localStorage.setItem('portfolio-theme',theme);}catch(e){}});
systemTheme.addEventListener('change',e=>{try{if(localStorage.getItem('portfolio-theme'))return;}catch(err){}updateTheme(e.matches?'dark':'light');});
let selectedService='';
const emailButton=document.querySelector('#email-cta');
document.querySelectorAll('.service-select').forEach(button=>button.addEventListener('click',()=>{selectedService=button.dataset.service;document.querySelectorAll('.service-select').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));document.querySelector('.selected-interest').textContent=`Let’s talk about: ${selectedService}.`;emailButton.focus();}));
emailButton.addEventListener('click',e=>{e.preventDefault();const address=['meqdad.darweesh','gmail.com'].join('@');const subject=selectedService?`Let’s collaborate: ${selectedService}`:'Let’s build something together';const body='Hi Meqdad,\n\nI’d like to discuss '+(selectedService||'an idea')+'.\n\nGoal:\nWho it’s for:\nTimeline and constraints:\n\n';window.location.href='mailto:'+address+'?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);});
document.querySelector('#year').textContent=new Date().getFullYear();

// Automatic rotation pauses for interaction, hidden tabs, and reduced motion.
const carousel=document.querySelector('.carousel');
const slides=Array.from(carousel.querySelectorAll('.carousel-slide'));
const photoButtons=Array.from(carousel.querySelectorAll('.carousel-dot'));
let photoIndex=0;
function showPhoto(index){
  photoIndex=(index+slides.length)%slides.length;
  slides.forEach((slide,i)=>{slide.hidden=i!==photoIndex;});
  photoButtons.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===photoIndex)));
  const img=slides[photoIndex].querySelector('img');
  img.loading='eager';
  slides[(photoIndex+1)%slides.length].querySelector('img').loading='eager';
  const count=carousel.querySelector('.carousel-count');
  if(count)count.textContent=(photoIndex+1)+' / '+slides.length;
  carousel.querySelector('.carousel-status').textContent=`Photo ${photoIndex+1} of ${slides.length}: ${img.alt}`;
}
if(slides.length>1){
  carousel.querySelector('.carousel-controls').hidden=false;
  carousel.querySelector('.carousel-prev').addEventListener('click',()=>showPhoto(photoIndex-1));
  carousel.querySelector('.carousel-next').addEventListener('click',()=>showPhoto(photoIndex+1));
  photoButtons.forEach((button,i)=>button.addEventListener('click',()=>showPhoto(i)));
  carousel.addEventListener('keydown',event=>{
    if(event.key==='ArrowRight'){event.preventDefault();showPhoto(photoIndex+1);}
    if(event.key==='ArrowLeft'){event.preventDefault();showPhoto(photoIndex-1);}
  });
  let touchStart=null;
  carousel.addEventListener('touchstart',event=>{touchStart={x:event.changedTouches[0].clientX,y:event.changedTouches[0].clientY};},{passive:true});
  carousel.addEventListener('touchend',event=>{
    if(!touchStart)return;
    const dx=event.changedTouches[0].clientX-touchStart.x,dy=event.changedTouches[0].clientY-touchStart.y;
    if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)*1.5)showPhoto(photoIndex+(dx<0?1:-1));
    touchStart=null;
  },{passive:true});
}

if(slides.length>1){
  const pauseButton=carousel.querySelector('.carousel-pause');
  const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
  let paused=reducedMotion.matches,hovered=false,focused=false,timer=null;
  function syncRotation(){
    clearInterval(timer);
    const rotating=!paused&&!hovered&&!focused&&!document.hidden;
    carousel.querySelector('.carousel-status').setAttribute('aria-live',rotating?'off':'polite');
    pauseButton.classList.toggle('is-paused',paused);
    pauseButton.setAttribute('aria-label',paused?'Start automatic photo rotation':'Pause automatic photo rotation');
    if(rotating)timer=setInterval(()=>showPhoto(photoIndex+1),6000);
  }
  pauseButton.addEventListener('click',()=>{paused=!paused;syncRotation();});
  carousel.addEventListener('mouseenter',()=>{hovered=true;syncRotation();});
  carousel.addEventListener('mouseleave',()=>{hovered=false;syncRotation();});
  carousel.addEventListener('focusin',()=>{focused=true;syncRotation();});
  carousel.addEventListener('focusout',e=>{focused=carousel.contains(e.relatedTarget);syncRotation();});
  carousel.addEventListener('touchstart',()=>{paused=true;syncRotation();},{passive:true});
  document.addEventListener('visibilitychange',syncRotation);
  reducedMotion.addEventListener('change',e=>{paused=e.matches;syncRotation();});
  syncRotation();
}

// Photo viewer for the Moments gallery. Without JavaScript the links open the full image.
(function(){
  const dlg=document.getElementById('lightbox');
  if(!dlg||typeof dlg.showModal!=='function')return;
  const links=Array.from(document.querySelectorAll('.gallery a'));
  const img=dlg.querySelector('#lb-img'),cap=dlg.querySelector('#lb-cap');
  let index=0;
  function show(i){
    index=(i+links.length)%links.length;
    const a=links[index],thumb=a.querySelector('img');
    img.src=a.href;img.alt=thumb.alt;
    cap.textContent=(a.dataset.caption||thumb.alt)+' ('+(index+1)+' of '+links.length+')';
  }
  links.forEach((a,i)=>a.addEventListener('click',e=>{e.preventDefault();show(i);dlg.showModal();}));
  dlg.querySelector('.lb-close').addEventListener('click',()=>dlg.close());
  dlg.querySelector('.lb-prev').addEventListener('click',()=>show(index-1));
  dlg.querySelector('.lb-next').addEventListener('click',()=>show(index+1));
  dlg.addEventListener('click',e=>{if(e.target===dlg)dlg.close();});
  dlg.addEventListener('keydown',e=>{
    if(e.key==='ArrowLeft'){e.preventDefault();show(index-1);}
    if(e.key==='ArrowRight'){e.preventDefault();show(index+1);}
  });
  dlg.addEventListener('close',()=>{if(!dlg.open)img.removeAttribute('src');});
})();

// About photo carousel: manual only (buttons, dots, arrow keys, swipe).
document.querySelectorAll('.travel-carousel').forEach(root=>{
  const slides=Array.from(root.querySelectorAll('.tc-slide'));
  const dots=Array.from(root.querySelectorAll('.tc-dot'));
  const caption=root.querySelector('.tc-caption'),status=root.querySelector('.tc-status');
  if(slides.length<2)return;
  let index=0;
  function show(n){
    index=(n+slides.length)%slides.length;
    slides.forEach((s,i)=>{s.hidden=i!==index;});
    dots.forEach((d,i)=>d.setAttribute('aria-pressed',String(i===index)));
    const img=slides[index].querySelector('img');
    img.loading='eager';
    caption.textContent=slides[index].dataset.caption;
    status.textContent='Photo '+(index+1)+' of '+slides.length+': '+caption.textContent;
  }
  root.querySelector('.tc-controls').hidden=false;
  root.querySelector('.tc-prev').addEventListener('click',()=>show(index-1));
  root.querySelector('.tc-next').addEventListener('click',()=>show(index+1));
  dots.forEach((d,i)=>d.addEventListener('click',()=>show(i)));
  root.addEventListener('keydown',e=>{
    if(e.key==='ArrowLeft'){e.preventDefault();show(index-1);}
    if(e.key==='ArrowRight'){e.preventDefault();show(index+1);}
  });
  let start=null;
  root.addEventListener('touchstart',e=>{start={x:e.changedTouches[0].clientX,y:e.changedTouches[0].clientY};},{passive:true});
  root.addEventListener('touchend',e=>{
    if(!start)return;
    const dx=e.changedTouches[0].clientX-start.x,dy=e.changedTouches[0].clientY-start.y;
    if(Math.abs(dx)>40&&Math.abs(dx)>Math.abs(dy)*1.5)show(index+(dx<0?1:-1));
    start=null;
  },{passive:true});
});
