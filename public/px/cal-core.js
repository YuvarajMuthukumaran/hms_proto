/* Patient Experience team calendar: shared logic for the Calendar page and the Today page (same origin, same localStorage).
   Roster, leave, visits and family meetings in one place. Demo data until greytHR gives the real roster; leave is entered by the PX lead for now.
   Family meetings are made from each patient's stay (admission, end of week 1, discharge briefing) so nobody types them twice. */
(function(){
  const KEY='px_cal_v2';
  const DAY=86400000;
  const pad=n=>String(n).padStart(2,'0');
  const iso=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
  const parse=s=>{const p=s.split('-');return new Date(+p[0],+p[1]-1,+p[2]);};
  const addDays=(s,n)=>{const d=parse(s);d.setDate(d.getDate()+n);return iso(d);};
  const todayISO=()=>iso(new Date());
  const DN=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const MN=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const label=s=>{const d=parse(s);return DN[d.getDay()]+' '+d.getDate()+' '+MN[d.getMonth()];};
  const FLOORS=['Floor 1','Floor 2','Floor 3','Call centre','Whole hospital'];
  const TYPES=['Family meeting','Ward visit or floor round','Staff training','MHRB or external visit','VIP visit','Other'];
  const SHIFTS={M:{n:'Morning',t:'8 am to 4 pm',from:8,to:16},E:{n:'Evening',t:'12 noon to 8 pm',from:12,to:20},O:{n:'Off',t:'',from:0,to:0}};
  const TEAM=[
    {id:'ka',name:'Kanika',role:'Patient Experience Coordinator',floor:'Floor 2'},
    {id:'pr',name:'Prabh',role:'Backup coordinator',floor:'Floor 1'},
    {id:'px',name:'PX Lead',role:'Patient Experience Lead',floor:'Whole hospital'}
  ];
  /* weekly pattern by weekday (0 = Sunday) */
  const PAT={ka:'OMMMMMO',pr:'MEEEEEO',px:'OMMMMMO'};
  /* patients on the floors: the family meetings come from these stays. admit and discharge are days from today. */
  const STAYS=[
    {p:'Sameer Das',room:'213 A',floor:'Floor 2',admit:-6,dis:null,who:'ka'},
    {p:'Neel Bose',room:'213 A',floor:'Floor 2',admit:-2,dis:null,who:'ka'},
    {p:'Rohit Kapoor',room:'Suite 201',floor:'Floor 2',admit:-8,dis:2,who:'ka'},
    {p:'Varun Rao',room:'211',floor:'Floor 2',admit:-11,dis:6,who:'ka'},
    {p:'Arjun Mehta',room:'210',floor:'Floor 2',admit:-1,dis:null,who:'ka'},
    {p:'Kavya Menon',room:'313',floor:'Floor 3',admit:-1,dis:null,who:'pr'},
    {p:'Rahul Sethi',room:'Suite 305',floor:'Floor 3',admit:-13,dis:0,who:'pr'}
  ];
  /* grievances that a person owns and that are due on a day (demo) */
  const GRV=[{id:'G-0141',who:'ka',due:1,text:'Call the family back (pending close)'},{id:'G-0139',who:'pr',due:3,text:'Check the fix with the family'}];
  const nameOf=id=>(TEAM.find(t=>t.id===id)||{name:id}).name;
  const idOf=n=>(TEAM.find(t=>t.name===n)||{}).id;
  let S=null;
  function seed(){
    const t=todayISO();
    let fri=addDays(t,1);while(parse(fri).getDay()!==5)fri=addDays(fri,1);
    let mon=addDays(t,1);while(parse(mon).getDay()!==1)mon=addDays(mon,1);
    return {
      leave:[{id:'l1',who:'ka',from:fri,to:fri,type:'Planned leave',cover:'pr'},{id:'l2',who:'px',from:mon,to:mon,type:'Comp off',cover:'pr'}],
      shifts:{},
      events:[
        {id:'e1',type:'Ward visit or floor round',date:addDays(t,5),time:'14:00',owner:'pr',patient:'',floor:'Floor 3',note:'NABH walk-through of the common areas',status:'planned'},
        {id:'e2',type:'VIP visit',date:addDays(t,6),time:'14:00',owner:'ka',patient:'',floor:'Whole hospital',note:'Board member visit, show the Floor 2 activity room',status:'planned'},
        {id:'e3',type:'MHRB or external visit',date:addDays(t,4),time:'11:00',owner:'ka',patient:'',floor:'Whole hospital',note:'Mental Health Review Board visit. Keep the register and consent files ready.',status:'planned'}
      ],
      ev:{},   /* status and owner overrides for family meetings and training made from other pages */
      n:3
    };
  }
  function load(){try{S=JSON.parse(localStorage.getItem(KEY)||'null');}catch(e){S=null;}if(!S||!S.leave)S=seed();S.ev=S.ev||{};S.shifts=S.shifts||{};}
  function save(){try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}}
  load();
  window.addEventListener('storage',e=>{if(e.key===KEY){load();if(window.PXCalChanged)window.PXCalChanged();}});
  /* ---- who is on a day ---- */
  function leaveOf(id,d){return S.leave.find(l=>l.who===id&&l.from<=d&&l.to>=d)||null;}
  function shift(id,d){
    const l=leaveOf(id,d);if(l)return {code:'L',leave:l};
    const o=S.shifts[id+'|'+d];if(o)return {code:o};
    const p=PAT[id]||'OOOOOOO';return {code:p[parse(d).getDay()]};}
  const onShift=(id,d,hour)=>{const s=shift(id,d);if(s.code==='L'||s.code==='O')return false;if(hour==null)return true;const sh=SHIFTS[s.code];return hour>=sh.from&&hour<sh.to;};
  /* ---- events: stored ones, family meetings from stays, training from the Staff training page ---- */
  function trainingEvents(){
    let T=null;try{T=JSON.parse(localStorage.getItem('px_training_v1')||'null');}catch(e){}
    const sess=(T&&T.sess)||[{id:'s1',when:todayISO()+'T15:00',mod:'rights',place:'Training room',invited:['p3','p6','p8','p12'],came:null}];
    const MODN={rights:'Patient rights and dignity',listen:'Listening and tone',concern:'Handling a concern',n1:'Talking with families',n2:'Following patient preferences',n3:'Calming and safe handling',c1:'Enquiry and admission calls',c2:'Crisis calls',c3:'Privacy on the phone',f1:'Welcoming a family at admission',f2:'Visitors and privacy',f3:'Upset visitors and DAMA requests',w1:'Respect on the floor'};
    return sess.map(s=>({id:'tr-'+s.id,type:'Staff training',date:s.when.slice(0,10),time:s.when.slice(11,16),owner:'ka',patient:'',floor:'Whole hospital',note:(MODN[s.mod]||s.mod)+' · '+(s.place||'Training room')+' · '+(s.invited||[]).length+' invited'+(s.came?' · attendance saved':''),status:s.came?'done':'planned',auto:'Staff training'}));}
  function familyEvents(){
    const t=todayISO(),out=[];
    STAYS.forEach(s=>{
      const a=addDays(t,s.admit);
      const mk=(k,date,time,txt)=>{const id='fm-'+s.p.replace(/\s/g,'')+'-'+k;out.push({id,type:'Family meeting',date,time,owner:s.who,patient:s.p,floor:s.floor,room:s.room,note:txt,status:date<t?'done':'planned',auto:'Stay: '+k});};
      mk('admission',addDays(a,1),'13:00','Admission family meeting (within 24 h)');
      mk('week 1',addDays(a,7),'13:00','End of week 1 family meeting');
      if(s.dis!==null)mk('discharge',addDays(t,s.dis-1),'14:00','Discharge briefing with the family');
    });
    return out;}
  function allEvents(from,to){
    let list=[...S.events.map(e=>Object.assign({},e)),...familyEvents(),...trainingEvents()];
    list=list.map(e=>{const o=S.ev[e.id];if(o){if(o.owner)e.owner=o.owner;if(o.status)e.status=o.status;if(o.time)e.time=o.time;if(o.date)e.date=o.date;}return e;});
    if(from)list=list.filter(e=>e.date>=from);if(to)list=list.filter(e=>e.date<=to);
    return list.sort((a,b)=>a.date===b.date?a.time.localeCompare(b.time):a.date.localeCompare(b.date));}
  /* ---- clashes: an active event or grievance owned by someone on leave or off, or booked outside their shift ---- */
  function eventClash(e){
    if(e.status!=='planned')return null;
    const s=shift(e.owner,e.date);const h=parseInt((e.time||'0').slice(0,2),10);
    if(s.code==='L')return {kind:'leave',why:nameOf(e.owner)+' is on '+s.leave.type.toLowerCase()};
    if(s.code==='O')return {kind:'off',why:nameOf(e.owner)+' is off'};
    const sh=SHIFTS[s.code];if(h<sh.from||h>=sh.to)return {kind:'hours',why:nameOf(e.owner)+' is on '+sh.n.toLowerCase()+' ('+sh.t+'), the meeting is at '+e.time};
    return null;}
  function coverFor(e){
    /* the named cover first (if the person is on leave), then anyone else on shift at that hour, same floor first */
    const h=parseInt((e.time||'0').slice(0,2),10);const l=leaveOf(e.owner,e.date);const out=[];
    if(l&&l.cover&&onShift(l.cover,e.date,h))out.push(l.cover);
    TEAM.filter(t=>t.id!==e.owner&&!out.includes(t.id)&&onShift(t.id,e.date,h)).sort((a,b)=>(b.floor===e.floor)-(a.floor===e.floor)).forEach(t=>out.push(t.id));
    return out;}
  function clashes(from,to){
    /* grouped by person and day: what needs cover */
    const g={};
    allEvents(from,to).forEach(e=>{const c=eventClash(e);if(!c||c.kind==='hours')return;const k=e.owner+'|'+e.date;(g[k]=g[k]||{who:e.owner,date:e.date,why:c.why,events:[],grv:[],kind:c.kind}).events.push(e);});
    GRV.forEach(x=>{const d=addDays(todayISO(),x.due);if(d<from||d>to)return;const s=shift(x.who,d);if(s.code!=='L'&&s.code!=='O')return;const k=x.who+'|'+d;(g[k]=g[k]||{who:x.who,date:d,why:nameOf(x.who)+(s.code==='L'?' is on '+s.leave.type.toLowerCase():' is off'),events:[],grv:[],kind:s.code==='L'?'leave':'off'}).grv.push(x);});
    return Object.values(g).sort((a,b)=>a.date.localeCompare(b.date)).map(c=>{
      const probe=c.events[0]||{owner:c.who,date:c.date,time:'12:00',floor:(TEAM.find(t=>t.id===c.who)||{}).floor};
      c.cover=coverFor(probe);return c;});}
  function summary(c){const a=[];if(c.events.length)a.push(c.events.length+' '+(c.events.every(e=>e.type==='Family meeting')?'family meeting':'event')+(c.events.length>1?'s':''));if(c.grv.length)a.push(c.grv.length+' grievance'+(c.grv.length>1?'s':''));
    return nameOf(c.who)+(c.kind==='leave'?' on leave ':' off ')+label(c.date).split(' ')[0]+': '+a.join(' and ')+' need cover';}
  function onToday(d){d=d||todayISO();return TEAM.map(t=>{const s=shift(t.id,d);return {id:t.id,name:t.name,floor:t.floor,code:s.code,leave:s.leave||null};});}
  /* ---- changes ---- */
  function addEvent(e){S.n++;e.id='e'+S.n+'-'+Date.now().toString(36);e.status='planned';S.events.push(e);save();return e;}
  function setStatus(id,st){const e=S.events.find(x=>x.id===id);if(e)e.status=st;else{S.ev[id]=Object.assign(S.ev[id]||{},{status:st});}save();}
  function setOwner(id,who){const e=S.events.find(x=>x.id===id);if(e)e.owner=who;else{S.ev[id]=Object.assign(S.ev[id]||{},{owner:who});}save();}
  function addLeave(l){S.n++;l.id='l'+S.n+'-'+Date.now().toString(36);S.leave.push(l);save();return l;}
  function removeLeave(id){S.leave=S.leave.filter(l=>l.id!==id);save();}
  function setShift(id,d,code){if(code==='')delete S.shifts[id+'|'+d];else S.shifts[id+'|'+d]=code;save();}
  window.PXCal={TEAM,TYPES,FLOORS,SHIFTS,STAYS,GRV,DN,MN,iso,parse,addDays,todayISO,label,nameOf,idOf,shift,onShift,leaveOf,allEvents,eventClash,coverFor,clashes,summary,onToday,addEvent,setStatus,setOwner,addLeave,removeLeave,setShift,reload:load,get state(){return S;}};
})();
