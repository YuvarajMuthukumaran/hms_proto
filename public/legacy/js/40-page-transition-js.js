
/* Page transition (5 Nov 2026, owner request): when the page changes (a new route or another patient tab), the content fades and
   slides in quickly. It runs only when the address changes, not on every redraw, so taps and ticks on the same page do not flicker.
   It is off for people who ask their device to reduce motion. Applies to every role (it changes no screen, only how a page appears). */
(function(){
  const css=document.createElement('style');css.id='pg-trans-css';
  css.textContent=`
  @keyframes pgIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
  #view.pg-in{animation:pgIn .26s cubic-bezier(.2,.7,.2,1) backwards}
  @media (prefers-reduced-motion:reduce){#view.pg-in{animation:none}}`;
  document.head.appendChild(css);
  let last=null;
  const __render=render;
  render=function(){
    const out=__render.apply(this,arguments);
    const h=location.hash||'#/';
    if(last!==null&&h!==last){
      const el=document.getElementById('view');
      if(el){el.classList.remove('pg-in');void el.offsetWidth;el.classList.add('pg-in');
        clearTimeout(window.__pgT);window.__pgT=setTimeout(()=>el.classList.remove('pg-in'),400);}
    }
    last=h;
    return out;
  };
})();
