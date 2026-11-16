/* 14 Nov 2026, card 122 Rounds: rooms and patients come from the HMS roster (17 patients), the gaps (not spoken to, no session logged, safety) are worked out, not typed,
   and the limits come from Setting (px_settings_v1). The Setting page edits the lists in this same file (setting=1). */
const fs=require('fs'),f='public/px/rounds.html';let s=fs.readFileSync(f,'utf8');
function rep(a,b,n){const c=s.split(a).length-1;if(c!==(n||1))throw new Error('match '+c+': '+a.slice(0,70));s=s.split(a).join(b);}
/* 1 floors from the HMS */
const i0=s.indexOf('const FLOORS={'),i1=s.indexOf("Object.keys(FLOORS).forEach(f=>FLOORS[f].push(mk('Common areas'");
if(i0<0||i1<0)throw new Error('floors block');
const NEW=`/* the rooms and patients are the HMS roster (public/px/hms-patients.js). Gaps are worked out: no one types them. */
const SETV=()=>{try{return JSON.parse(localStorage.getItem('px_settings_v1')||'{}')||{};}catch(e){return {};}};
const LIM={roomH:()=>+SETV().roomH||4,safetyMin:()=>+SETV().safetyMin||30,spokenDays:()=>+SETV().spokenDays||4};
const SPOKEN_SEED={kabir:5,arjun:4,tarun:6};   /* days since a PX round last spoke to them, before any round is logged here */
const FLOORS=(function(){
  const out={'Floor 1':[],'Floor 2':[],'Floor 3':[]},fl={f1:'Floor 1',f2:'Floor 2',f3:'Floor 3'};
  const H=(window.HMS_PATIENTS&&window.HMS_PATIENTS.patients)||[];
  const num=r=>parseInt(String(r).replace(/\D/g,''),10)||0;
  H.forEach(h=>{const room=String(h.room).replace(/^(Room|Suite)\s+/,(m,w)=>w==='Suite'?'Suite ':'').replace(/\s*·.*$/,'').trim();
    const p={n:h.name,hms:h.id,last:SPOKEN_SEED[h.id]!==undefined?SPOKEN_SEED[h.id]:1};
    if(h.safetyOpen)p.safety=1;
    if(h.noSession!=null)p.rec='No session logged for '+h.noSession+' days';
    out[fl[h.floor]||'Floor 2'].push(mk(room,[p],'todo'));});
  Object.keys(out).forEach(k=>out[k].sort((a,b)=>num(a.room)-num(b.room)||String(a.room).localeCompare(String(b.room))));
  return out;
})();
`;
s=s.slice(0,i0)+NEW+s.slice(i1);
/* 2 flags use the Setting limit */
rep("p.last>=4?`${p.n.split(' ')[0]}: not spoken to in ${p.last} days`:null","p.last>=LIM.spokenDays()?`${p.n.split(' ')[0]}: not spoken to in ${p.last} days`:null");
/* 3 room clock and safety repeat from Setting */
rep("due:x[2]?'Chandraji told now':'4 h 0 m left'","due:x[2]?'Chandraji told now':LIM.roomH()+' h 0 m left'");
rep("t0:Date.now()-110*M,lim:4*H,by:'Prabh',id:'RI-001'}","t0:Date.now()-110*M,lim:LIM.roomH()*H,by:'Prabh',id:'RI-001'}");
rep("{room:'206',what:'Exhaust fan not working'","{room:'210',what:'Exhaust fan not working'",2);
rep("left(i.t0,i.lim||4*H)","left(i.t0,i.lim||LIM.roomH()*H)",2);
rep("st:'open',t0:Date.now(),lim:4*H,by:'Prabh'","st:'open',t0:Date.now(),lim:LIM.roomH()*H,by:'Prabh'");
rep("now-a.last>=30*M","now-a.last>=LIM.safetyMin()*M");
/* 4 days since last spoken: from what was logged here, otherwise the seed */
rep("function sync(){\n    Object.keys(FLOORS).forEach(f=>FLOORS[f].forEach(r=>{const k=f+'|'+r.room;if(ST.rooms[k])r.st=ST.rooms[k];}));",
"function sync(){\n    Object.keys(FLOORS).forEach(f=>FLOORS[f].forEach(r=>{const k=f+'|'+r.room;if(ST.rooms[k])r.st=ST.rooms[k];\n      r.pts.forEach(p=>{const e=(ST.log||[]).filter(x=>x.patient===p.n).map(x=>x.t).sort((a,b)=>b-a)[0];if(e)p.last=Math.floor((Date.now()-e)/86400000);});}));");
/* 5 setting mode */
rep("<script>if(/[?&]embed=1/.test(location.search))document.documentElement.classList.add('embed');</script>","<script>if(/[?&]embed=1/.test(location.search))document.documentElement.classList.add('embed');if(/[?&]setting=1/.test(location.search))document.documentElement.classList.add('setmode');</script><style>html.setmode #root{display:none}html.setmode{background:transparent}</style>");
rep("  render();\n})();\n\n</script>","  if(document.documentElement.classList.contains('setmode')){const h=document.createElement('div');h.id='setHost';h.style.cssText='padding:4px 2px;display:flex;flex-direction:column;gap:10px;background:#fff';h.innerHTML=listsHtml();document.body.appendChild(h);}\n  render();\n})();\n\n</script>");
fs.writeFileSync(f,s);console.log('ok');
