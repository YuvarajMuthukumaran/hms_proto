/* 21 Nov 2026: a psychologist covers one floor. Psychologist login only, real-data mode only (floor leads and every other role keep all floors).
   The Inpatients > Patients list shows one floor. The login does not say which floor it is, so the floor is picked once with a small bar and remembered on this browser. */
(function(){
  const role=String((window.__TULASI__||{}).role||'');
  if(role!=='psychologist')return;
  const KEY='tulasi.psy.floor';
  const get=()=>{try{return parseInt(localStorage.getItem(KEY)||'',10)||0;}catch(e){return 0;}};
  window.psyFloorSet=function(n){try{localStorage.setItem(KEY,String(n));}catch(e){}render();};
  const __ip=ipdPage;
  ipdPage=function(o){
    if(!window.__realMode||!o||!o.list||o.lead)return __ip(o);
    const floors=[...new Set(o.list.map(floorNo))].sort((a,b)=>a-b);
    if(!floors.length)return __ip(o);
    let f=get();if(!floors.includes(f))f=floors[0];
    const list=o.list.filter(p=>floorNo(p)===f);
    const bar=floors.length>1?`<div class="row" style="gap:6px;flex-wrap:wrap;padding:8px 16px;align-items:center"><span class="tiny muted">My floor</span>${floors.map(k=>`<button class="tog ${k===f?'on':''}" aria-pressed="${k===f}" onclick="psyFloorSet(${k})">${ORD(k)} floor</button>`).join('')}</div>`:'';
    return __ip(Object.assign({},o,{list:list,total:list.length,filters:(o.filters||'')+bar}));
  };
})();
