/* 16 Nov 2026: Today worklist layout. A long patient name ran out of the Patient column over the Event text.
   Names now wrap inside their column (the table is fixed-width), long words break, and the avatar keeps its size. */
(function(){
  if(document.getElementById('ui16nov'))return;
  const s=document.createElement('style');s.id='ui16nov';
  s.textContent='.pd-t td .pd-nm{white-space:normal;flex-wrap:nowrap;align-items:flex-start;min-width:0}'
   +'.pd-t td .pd-nm>*{min-width:0}'
   +'.pd-t td .pd-nm b{white-space:normal;overflow-wrap:anywhere;word-break:normal;line-height:1.25}'
   +'.pd-t td .pd-nm .av,.pd-t td .pd-nm [class*=av]{flex:0 0 auto}';
  document.head.appendChild(s);
})();
