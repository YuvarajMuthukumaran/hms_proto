/* 23 Nov 2026: the Reports redesign (da9271f) showed 0 of 0 on real data with sample "Down 96 pts from last week" changes.
   In real mode it now counts what is logged in this app (one team row, because PX shares one login), the "Needs attention"
   lists are real, and the change line says there is no earlier period yet. */
const rep=require('./rep.cjs');
const F='public/px/reports.html';
const REAL=String.raw`/* ── real mode: count what is logged in this app ── */
if(window.PX_REAL){
  const J=(k,d)=>{try{return JSON.parse(localStorage.getItem(k)||'null')||d;}catch(e){return d;}};
  const pts=(window.HMS_PATIENTS&&window.HMS_PATIENTS.patients)||[],now=Date.now(),D=864e5,LEN=[7,30];
  const steps=J('px_steps_v1',{}),calls=J('px_calls_v1',[]),gone=J('px_gone_v1',{});
  const admT=h=>h.adm?new Date(h.adm).getTime():NaN;
  const called=(id,from,to)=>calls.some(c=>c.pid===id&&c.outcome==='Connected'&&(t=>t>=from&&t<to)(new Date(c.at).getTime()));
  let st=null;try{const P=window.parent&&window.parent!==window&&window.parent.PXG;st=P&&P.self&&P.self.state;}catch(e){}
  const cs=(st&&st.concernStatus)||{},con=((st&&st.extraConcerns)||[]).map(c=>Object.assign({},c,cs[c.id]||{}));
  const fig=k=>LEN.map(n=>{const from=now-n*D;
    if(k==='adm'){const L=pts.filter(h=>admT(h)>=from);return [L.filter(h=>steps[h.id+0]&&steps[h.id+3]).length,L.length];}
    if(k==='calls'){let due=0,ok=0;pts.forEach(h=>{const a=admT(h),start=isNaN(a)?from:Math.max(a,from),w=Math.floor((now-start)/(7*D));if(w>0){due+=w;ok+=Math.min(w,calls.filter(c=>c.pid===h.id&&c.outcome==='Connected'&&new Date(c.at).getTime()>=start).length);}});return [ok,due];}
    if(k==='fb'){const L=Object.keys(gone).filter(id=>gone[id].gone>=from);return [L.filter(id=>(J('px_dc_'+id,{}).fb||{}).on).length,L.length];}
    const L=con.filter(c=>(c.at||0)>=from);return [L.filter(c=>/Resolved|Closed/i.test(c.status||'')).length,L.length];});
  PEOPLE.length=0;
  PEOPLE.push(Object.assign({n:'Patient Experience (one shared login)',s:'Gurgaon'},Object.fromEntries(KEYS.map(k=>[k,fig(k)]))));
  KEYS.forEach(k=>{PREV[k]=[null,null];});
  const nm=h=>esc(h.name||'Patient')+(h.room?' · Room '+esc(String(h.room).replace(/^Room\s*/,'')):'');
  const open=con.filter(c=>!/Resolved|Closed/i.test(c.status||''));
  ATT[0].items=open.filter(c=>c.at&&now-c.at>6*36e5).map(c=>[esc(c.id+' · '+(c.pname||'')),esc((c.owner||'owner')+' · '+Math.round((now-c.at-6*36e5)/36e5)+' h over')]);
  ATT[1].items=open.filter(c=>/safety|rights|serious/i.test((c.category||'')+' '+(c.severity||''))).map(c=>[esc(c.id+' · '+(c.pname||'')),esc(c.owner||'')]);
  ATT[2].items=pts.filter(h=>{const a=admT(h);return !isNaN(a)&&now-a>=7*D&&!called(h.id,now-7*D,now+1);}).map(h=>[nm(h),'no call in 7 days']);
  ATT[3].items=pts.filter(h=>{const a=admT(h);return !isNaN(a)&&now-a<2*D&&!steps[h.id+0];}).map(h=>[nm(h),'admitted '+Math.max(1,Math.round((now-admT(h))/36e5))+' h ago']);
  RAISE.length=0; ROOT.length=0; COMPL.length=0;
}`;
rep(F,[
 ["/* ── real mode overrides ── */\nif(window.PX_REAL){\n  /* In real mode, zero out sample numbers; real data would come from the database */\n  PEOPLE.forEach(p=>{KEYS.forEach(k=>{p[k]=[[0,0],[0,0]];});});\n  ATT.forEach(a=>{a.items=[];});\n  RAISE.length=0; ROOT.length=0; COMPL.length=0;\n}",REAL],
 ["KEYS.forEach(k=>{const a=tot(k),p=pc(a[0],a[1]),d=p-PREV[k][S.per];","KEYS.forEach(k=>{const a=tot(k),p=pc(a[0],a[1]),d=PREV[k][S.per]==null?'':p-PREV[k][S.per];"],
 ["    const changeText=(d>=0?'Up ':'Down ')+Math.abs(d)+' pts from last '+(S.per?'month':'week');",
  "    const changeText=prev==null?'No earlier '+(S.per?'month':'week')+' to compare yet':(d>=0?'Up ':'Down ')+Math.abs(d)+' pts from last '+(S.per?'month':'week');"],
]);
/* discharge NPS from the feedback scores saved on discharge forms (real mode); the sample line stays in the demo */
rep(F,[["  const npsText='Discharge NPS 42 from 19 answers';",
 "  let npsText='Discharge NPS 42 from 19 answers';\n  if(window.PX_REAL){const sc=Object.keys(localStorage).filter(x=>x.indexOf('px_dc_')===0).map(x=>{try{return (JSON.parse(localStorage.getItem(x))||{}).form||{};}catch(e){return {};}}).filter(f=>f.fbScore!==undefined&&f.fbScore!=='').map(f=>+f.fbScore);\n    npsText=sc.length?'Discharge NPS '+Math.round((sc.filter(v=>v>=9).length-sc.filter(v=>v<=6).length)/sc.length*100)+' from '+sc.length+' answer'+(sc.length===1?'':'s'):'Discharge NPS: no answers yet';}"]]);
