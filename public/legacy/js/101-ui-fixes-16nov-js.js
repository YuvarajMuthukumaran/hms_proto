/* 16 Nov 2026: Today worklist layout. A long patient name ran out of the Patient column over the Event text.
   Names now wrap inside their column (the table is fixed-width), long words break, and the avatar keeps its size. */
(function(){
  if(document.getElementById('ui16nov'))return;
  const s=document.createElement('style');s.id='ui16nov';
  s.textContent='.pd-t td .pd-nm{white-space:normal;flex-wrap:nowrap;align-items:flex-start;min-width:0}'
   +'.pd-t td .pd-nm>*{min-width:0}'
   +'.pd-t td .pd-nm b{white-space:normal;overflow-wrap:anywhere;word-break:normal;line-height:1.25}'
   +'.pd-t td .pd-nm .av,.pd-t td .pd-nm [class*=av]{flex:0 0 auto}';
  s.textContent+='dl.reg-kv{display:grid!important;grid-template-columns:120px minmax(0,1fr);gap:10px 18px;margin:0;padding:6px 4px}'
   +'dl.reg-kv dt{margin:0;font-size:12px;font-weight:700;letter-spacing:.03em;text-transform:uppercase;color:#667085;align-self:start;padding-top:2px}'
   +'dl.reg-kv dd{margin:0!important;font-size:15px;color:#101828;overflow-wrap:anywhere}'
   +'@media(max-width:560px){dl.reg-kv{grid-template-columns:1fr;gap:2px}dl.reg-kv dd{margin-bottom:10px!important}}';
  document.head.appendChild(s);

  /* 16 Nov: "Add medicine" button on Current medicines box must be "Add medicine" (not "Change medicines") and blue (btn pri) */
  function fixMedbox(){
    document.querySelectorAll('.medbox').forEach(mb=>{
      mb.querySelectorAll('button').forEach(b=>{
        if(/Change medicines|Add medicine/.test(b.textContent)){
          b.classList.add('pri');
          if(/Change medicines/.test(b.innerHTML)){
            b.innerHTML=b.innerHTML.replace(/Change medicines/g,'Add medicine');
          }
        }
      });
      const mn=mb.querySelector('.med-none');
      if(mn&&mn.textContent.includes('Change medicines')){
        mn.textContent=mn.textContent.replace('Change medicines','Add medicine');
      }
    });
  }
  const __r101=render;
  render=function(){
    const x=__r101.apply(this,arguments);
    try{fixMedbox();}catch(e){}
    return x;
  };
  setTimeout(fixMedbox,200);
})();
