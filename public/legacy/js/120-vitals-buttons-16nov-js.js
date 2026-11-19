/* 16 Nov 2026, Yuvaraj: in "Vitals and monitoring" the two buttons (Add vitals, Order monitoring) sat at opposite ends of the card. They now sit together,
   on the right, and are blue. Psychiatrist screens only. */
(function(){
  if(String((window.__TULASI__||{}).role||'')!=='psychiatrist')return;
  const css=document.createElement('style');css.id='vit-buttons-css';
  css.textContent='.vit-btns{display:flex!important;justify-content:flex-end!important;align-items:center;gap:10px;flex-wrap:wrap}.vit-btns .btn{margin:0!important}';
  document.head.appendChild(css);
  function fix(){
    const v=document.getElementById('view');if(!v)return;
    const bs=[...v.querySelectorAll('button')].filter(b=>/^(\+\s*)?Add vitals$/.test(b.textContent.trim())||b.textContent.trim()==='Order monitoring');
    bs.forEach(b=>{b.classList.add('pri');});
    const groups=new Set(bs.map(b=>b.parentElement));
    groups.forEach(g=>{if(g&&g.querySelectorAll('button').length<=3)g.classList.add('vit-btns');});
    /* when the two buttons are in different wrappers, bring them together */
    const add=bs.find(b=>/Add vitals/.test(b.textContent)),ord=bs.find(b=>b.textContent.trim()==='Order monitoring');
    if(add&&ord&&add.parentElement!==ord.parentElement&&add.closest('section,.card')===ord.closest('section,.card')){
      const host=ord.parentElement;host.classList.add('vit-btns');host.insertBefore(add,ord);
    }
  }
  const __r=render;
  render=function(){const r=__r.apply(this,arguments);try{fix();}catch(e){}return r;};
})();
