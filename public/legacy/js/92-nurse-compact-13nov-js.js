/* 13 Nov 2026, Nikita's feedback: the nursing part is extensive and hard to use in practice. Nurse login only.
   Ward care keeps the three things done every shift (Shift charts, Vitals, SOS and PRN) on the main strip; Movement, Admission and Handover sit behind "More".
   The "Alerts you raised" card shows the first two alerts (the rest on "Show all") and loses its long explanation. */
(function(){
  const nurse=()=>S.role==='nurse'&&String((window.__TULASI__||{}).role||'nurse')==='nurse';
  const css=document.createElement('style');css.textContent=`.nx-more-btn{border:0;background:none;font:inherit;font-size:13px;font-weight:650;color:#1e5bb8;cursor:pointer;padding:6px 10px}.nx-hide{display:none!important}.nx-all{display:block;margin:6px auto 2px}`;document.head.appendChild(css);
  window.nxMore=()=>{S.nxMore=!S.nxMore;render();};
  window.nxAlerts=()=>{S.nxAl=!S.nxAl;render();};
  function paint(){
    const v=$('view');if(!v||!nurse())return;
    const tabs=v.querySelector('.v3tabs');
    if(tabs&&!tabs.dataset.nx&&/Shift charts/.test(tabs.textContent)){
      tabs.dataset.nx='1';const b=[...tabs.children],extra=b.slice(3);
      const activeExtra=extra.some(x=>/\bon\b|active|sel/.test(x.className)||x.getAttribute('aria-selected')==='true'||x.getAttribute('aria-current'));
      const open=!!S.nxMore||activeExtra;
      extra.forEach(x=>{if(!open)x.classList.add('nx-hide');});
      const m=document.createElement('button');m.type='button';m.className='nx-more-btn';m.textContent=open?'Less ▴':'More ▾';m.onclick=window.nxMore;tabs.appendChild(m);
    }
    const al=v.querySelector('#v3wa');
    if(al&&!al.dataset.nx){
      al.dataset.nx='1';const sub=al.querySelector('.hd .small');if(sub)sub.remove();
      const list=al.querySelector('.v3al-list');
      if(list&&list.children.length>2){
        const kids=[...list.children];if(!S.nxAl)kids.slice(2).forEach(k=>k.classList.add('nx-hide'));
        const b=document.createElement('button');b.type='button';b.className='nx-more-btn nx-all';b.textContent=S.nxAl?'Show fewer':'Show all '+kids.length;b.onclick=window.nxAlerts;list.after(b);
      }
    }
  }
  const __r=render;render=function(){const out=__r.apply(this,arguments);try{paint();}catch(e){}return out;};
})();
