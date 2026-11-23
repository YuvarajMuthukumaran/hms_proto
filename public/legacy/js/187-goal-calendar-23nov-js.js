/* 23 Nov 2026, meeting with Dr. Anu and Nikita: Therapy Plans as a month calendar ("make it more visual, one calendar,
   each goal its own colour with a legend, summary stats on the side; for individual, family and group").
   Psychiatrist, psychologist and their floor leads (the Therapy Plans page they all open).
   - Individual: a mark per goal logged that day (session note or Log now).
   - Group: a mark per group attended that day.
   - Family: a mark per family contact that day (calls from Call family, WhatsApp messages, signed family sessions).
   Month arrows move back and forward. Nothing is stored here; it only reads what is already saved.
   23 Nov, second meeting (Anu): colours per goal / group / contact type instead of icons ("icons are too complicated to read");
   the days are colour coded (green all met, amber part, red not met); tapping a day shows everything from that day on the right
   (for family: who called, which family member, how it went, how long, what was said, topics, the WhatsApp message sent). */
(function(){
  const ROLE=String((window.__TULASI__||{}).role||'');
  if(!/^(psychiatrist|floor-lead-psychiatrist|psychologist|floor-lead-psychologist)$/.test(ROLE))return;
  const E=s=>hesc(String(s==null?'':s));
  const COL=['#1e6cdb','#c11574','#0e9384','#dc6803','#6941c6','#4e5ba6','#3b7c0f','#b42318'];
  const FAMC={'Family call':'#1e6cdb','WhatsApp':'#16a34a','Family session':'#6941c6'};
  const MON={jan:0,feb:1,mar:2,apr:3,may:4,jun:5,jul:6,aug:7,sep:8,oct:9,nov:10,dec:11};
  const MN=['January','February','March','April','May','June','July','August','September','October','November','December'];
  const st=window.__gcM=window.__gcM||{};
  const key=d=>d.getFullYear()+'-'+d.getMonth()+'-'+d.getDate();
  function dayOf(r){
    if(r&&r.ts)return new Date(r.ts);
    const m=String((r&&(r.at||r.date||r.when))||'').match(/(\d{1,2})\s+([A-Za-z]{3})[a-z]*\.?,?\s*(\d{4})?/);
    if(m&&MON[m[2].toLowerCase()]!==undefined)return new Date(m[3]?+m[3]:new Date().getFullYear(),MON[m[2].toLowerCase()],+m[1]);
    const i=String((r&&(r.date||r.when))||'').match(/^(\d{4})-(\d{2})-(\d{2})/);
    return i?new Date(+i[1],+i[2]-1,+i[3]):null;
  }
  const isNum=v=>v!==''&&v!==null&&v!==undefined&&!isNaN(+v);
  function met(g,v){
    if(g.type==='yn')return v==='yes';
    if(g.type==='scale'){const a=+(g.aim==null?8:g.aim),s=+(g.start==null?2:g.start);return isNum(v)&&(a>=s?+v>=a:+v<=a);}
    if(g.type==='choice'){const o=g.opts||[],i=o.indexOf(v),ai=o.indexOf(g.aimOpt);return i>=0&&i>=(ai<0?o.length-1:ai);}
    if(g.type==='num')return isNum(v)&&(g.dir==='atmost'?+v<=+g.aim:+v>=+g.aim);
    return false;
  }
  const short=(g,v)=>g.type==='yn'||g.type==='choice'?'':String(v);

  /* every entry: {d:Date, s:series index, ok:true|false|'half', v, txt, det:[[label,value]]} */
  function indData(pid){
    const x=psyPx(pid),sn=x.sn||{},goals=sn.goals||[],out=[];
    const notes=(sn.notes||[]).filter(n=>n&&n.status==='signed');
    goals.forEach((g,i)=>{
      notes.forEach(n=>{const v=(n.goalR||{})[i];if(v===undefined||v===''||v===null)return;const d=dayOf(n);if(d)out.push({d,s:i,ok:met(g,v),v:short(g,v),txt:g.t,det:[['Logged',String(v)],['From','Session note'+(n.by?' by '+n.by:'')]]});});
      (((sn.goalLog)||{})[i]||[]).forEach(r=>{const d=dayOf(r);if(d)out.push({d,s:i,ok:met(g,r.v),v:short(g,r.v),txt:g.t,det:[['Logged',String(r.v)],['By',(r.by||'')+(r.at?' · '+r.at:'')]]});});
    });
    return {series:goals.map(g=>g.t),out,what:'goal'};
  }
  function grpData(pid){
    const x=psyPx(pid),rows=((x.sn||{}).grp||[]).concat(((x.th||{}).grp)||[]),names=[],out=[];
    rows.forEach(r=>{const nm=r.group||'Group';if(names.indexOf(nm)<0)names.push(nm);const d=dayOf(r);if(!d)return;
      const t=String(r.took||'');out.push({d,s:names.indexOf(nm),ok:/refus|not attend/i.test(t)?false:/part/i.test(t)?'half':true,v:'',txt:nm,
        det:[['Attendance',t||'Attended'],['Led by',r.leader||r.by||''],['Note',r.note||''],['From',r.src||'']]});});
    return {series:names,out,what:'group'};
  }
  function famData(pid){
    const x=psyPx(pid),names=['Family call','WhatsApp','Family session'],out=[];
    let log=[];try{log=((window.__faApi&&__faApi.famState(pid))||x.fam||{}).log||[];}catch(e){log=(x.fam||{}).log||[];}
    log.forEach(l=>{const d=dayOf(l);if(!d)return;const parts=String(l.note||'').split(' · '),dur=/min/i.test(parts[1]||'')?parts[1]:'',said=parts.slice(dur?2:1).join(' · ');
      const spoke=!/attempt|no answer|not reach/i.test((l.what||'')+' '+(l.note||''));
      out.push({d,s:0,ok:spoke,v:'',txt:(l.what||'Family call')+(spoke?'':' (not reached)'),det:[['Call',l.what||'Family call'],['Called by',l.by||''],['When',l.at||''],['How it went',parts[0]||''],['How long',dur],['What was said',said],['Topics covered',(l.topics||[]).join(', ')]]});});
    (((x.th||{}).comm)||[]).forEach(c=>{const d=dayOf({date:c.date});if(!d)return;const wa=/whatsapp/i.test(c.type||'');
      out.push({d,s:wa?1:0,ok:true,v:'',txt:wa?'WhatsApp to the family':(c.type||'Call')+(c.who?' with '+c.who:''),det:[[wa?'Message sent':'What was discussed',c.what||c.note||c.summary||''],['With',c.who||''],['When',c.date||''],['Logged by',c.by||'']]});});
    ((x.sn||{}).notes||[]).filter(n=>n&&n.status==='signed'&&(n.kind==='fam'||n.mod==='Family therapy')).forEach(n=>{const d=dayOf(n);if(d)out.push({d,s:2,ok:true,v:'',txt:'Family session',det:[['Session','Family session (signed note)'],['By',n.by||''],['When',n.at||''],['Family member',((n.blk||{}).who)||'']]});});
    (((x.th||{}).fam)||[]).forEach(r=>{const d=dayOf(r);if(d)out.push({d,s:2,ok:true,v:'',txt:'Family session'+(r.who?' with '+r.who:''),det:[['Session','Family session'],['Family member',r.who||''],['When',r.date||''],['Topics covered',(r.tlist||[]).join(', ')]]});});
    return {series:names,out,what:'contact'};
  }
  const colOf=(seg,D,i)=>seg==='fam'?(FAMC[D.series[i]]||COL[0]):COL[i%COL.length];

  function cal(pid,seg){
    const D=seg==='grp'?grpData(pid):seg==='fam'?famData(pid):indData(pid);
    const now=new Date(),k='m_'+pid+'_'+seg;
    if(!st[k]){const last=D.out.reduce((a,e)=>e.d>a?e.d:a,null);const b=last&&last<now?last:now;st[k]={y:b.getFullYear(),m:b.getMonth()};}
    const {y,m}=st[k],first=new Date(y,m,1),days=new Date(y,m+1,0).getDate(),lead=(first.getDay()+6)%7;
    const inM=D.out.filter(e=>e.d.getFullYear()===y&&e.d.getMonth()===m),by={};
    inM.forEach(e=>{(by[key(e.d)]=by[key(e.d)]||[]).push(e);});
    const todayK=key(now),canLog=seg==='ind'&&D.series.length>0,selRaw=st['s_'+pid+'_'+seg];
    const sel=(selRaw===undefined||selRaw==='')?(canLog?todayK:''):selRaw==='sum'?'':selRaw;
    const due=canLog?D.series.map((t,i)=>i).filter(i=>!D.out.some(e=>e.s===i&&key(e.d)===todayK)):[];
    const word=s=>s==='ok'?(seg==='grp'?'attended':seg==='fam'?'reached':'aim met'):s==='half'?'part of it':(seg==='grp'?'refused':seg==='fam'?'not reached':'not met');
    const glyph=s=>s==='ok'?'✓':s==='half'?'½':'✕';
    const mark=e=>{const s=e.ok===true?'ok':e.ok==='half'?'half':'no';
      return '<i class="gc-c '+s+'" style="--c:'+colOf(seg,D,e.s)+'" title="'+E((D.series[e.s]||'')+': '+word(s)+(e.v!==''?' ('+e.v+')':''))+'">'+(e.v!==''&&e.v.length<=3?E(e.v):glyph(s))+'</i>';};
    let cells='';for(let i=0;i<lead;i++)cells+='<div class="gc-d gc-x"></div>';
    for(let d=1;d<=days;d++){const dt=new Date(y,m,d),L=by[key(dt)]||[],today=key(dt)===key(now),fut=dt>now;
      const nOk=L.filter(e=>e.ok===true).length,tone=!L.length?'':nOk===L.length?' t-ok':L.some(e=>e.ok===true||e.ok==='half')?' t-half':' t-no';
      cells+='<button type="button" class="gc-d'+(today?' today':'')+(fut?' fut':'')+(L.length?' has':'')+tone+(sel===key(dt)?' sel':'')+'" aria-label="'+d+' '+MN[m]+(L.length?', '+L.length+' record'+(L.length>1?'s':''):'')+'" onclick="gcDay(\''+seg+'\',\''+key(dt)+'\')"><span class="gc-n">'+d+'</span><span class="gc-ms">'+L.map(mark).join('')+(key(dt)===todayK?due.map(i=>'<i class="gc-c due" style="--c:'+colOf(seg,D,i)+'" title="'+E(D.series[i])+': due today, not logged yet"></i>').join(''):'')+'</span></button>';}
    const tail=(7-(lead+days)%7)%7;for(let i=0;i<tail;i++)cells+='<div class="gc-d gc-x"></div>';
    /* 23 Nov (owner): the goal rows above the calendar are gone, so on the Goals calendar each goal in the key opens its pop-up (Log now, history) */
    const legend=D.series.map((t,i)=>D.what==='goal'&&typeof window.tpGoal==='function'?'<button type="button" class="gc-kb" title="Log this goal or see its history" onclick="tpGoal(\''+E(pid)+'\','+i+')"><i class="gc-sw" style="background:'+colOf(seg,D,i)+'"></i>'+E(t)+'<em>Log</em></button>':'<span><i class="gc-sw" style="background:'+colOf(seg,D,i)+'"></i>'+E(t)+'</span>').join('');
    const statRow=(t,i)=>{const L=inM.filter(e=>e.s===i),dset={},okd={};L.forEach(e=>{dset[key(e.d)]=1;if(e.ok===true)okd[key(e.d)]=1;});
      const n=Object.keys(dset).length,o=Object.keys(okd).length;
      const lab=D.what==='goal'?'aim met '+o+' of '+n+' logged day'+(n===1?'':'s'):D.what==='group'?o+' attended of '+n+' day'+(n===1?'':'s')+' marked':L.length+' this month';
      return '<div class="gc-st"><i class="gc-sw" style="background:'+colOf(seg,D,i)+'"></i><div><b>'+E(t)+'</b><small>'+(n?lab:'nothing this month')+'</small></div></div>';};
    const dayCount=Object.keys(by).length;
    let side;
    if(canLog&&sel===todayK)side=todayPanel(pid,seg,D,by[sel]||[],due);
    else if(sel&&by[sel]){const L=by[sel],dd=L[0].d;
      side='<div class="gc-side gc-det"><div class="gc-dh"><b>'+E(dd.toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'}))+'</b><button type="button" class="btn sm" onclick="gcDay(\''+seg+'\',\'\')">Month summary</button></div>'
        +L.map(e=>{const s=e.ok===true?'ok':e.ok==='half'?'half':'no';return '<div class="gc-ev" style="--c:'+colOf(seg,D,e.s)+'"><div class="gc-et"><i class="gc-sw" style="background:var(--c)"></i><b>'+E(e.txt||D.series[e.s]||'')+'</b><span class="gc-es '+s+'">'+word(s)+'</span></div>'
          +(e.det||[]).filter(r=>r[1]).map(r=>'<div class="gc-er"><span>'+E(r[0])+'</span><span>'+E(r[1])+'</span></div>').join('')+'</div>';}).join('')+'</div>';}
    else if(sel){side='<div class="gc-side gc-det"><div class="gc-dh"><b>Nothing recorded that day</b><button type="button" class="btn sm" onclick="gcDay(\''+seg+'\',\'\')">Month summary</button></div></div>';}
    else side='<div class="gc-side"><div class="gc-big">'+dayCount+'<small> day'+(dayCount===1?'':'s')+' with a record in '+MN[m]+'</small></div>'+D.series.map(statRow).join('')+'<div class="tiny muted">Tap a day to see everything from it.</div></div>';
    const title=seg==='grp'?'Group attendance calendar':seg==='fam'?'Family contact calendar':'Goals calendar';
    const key3=(a,b,c)=>'<span class="gc-k3"><i class="gc-c ok" style="--c:#667085">✓</i>'+a+(b?'<i class="gc-c half" style="--c:#667085">½</i>'+b:'')+'<i class="gc-c no" style="--c:#667085">✕</i>'+c+'</span>';
    const sub=seg==='grp'?'Each group has its own colour. '+key3('Attended','Part of it','Refused'):seg==='fam'?'Each kind of contact has its own colour. '+key3('Reached','','Not reached'):'Each goal has its own colour. '+key3('Aim met','Part way','Not met');
    const empty=!D.out.length?'<div class="small muted" style="padding:8px 0">'+(seg==='grp'?'No group attendance marked yet.':seg==='fam'?'No family contact logged yet.':'No goals logged yet.')+'</div>':'';
    return '<section class="gc" data-seg="'+seg+'" aria-label="'+title+'"><div class="gc-hd"><div><h3>'+title+'</h3><p>'+sub+'</p></div>'
      +'<div class="gc-nav"><button type="button" class="btn sm" aria-label="Previous month" onclick="gcMove(\''+seg+'\',-1)">‹</button><b>'+MN[m]+' '+y+'</b><button type="button" class="btn sm" aria-label="Next month" onclick="gcMove(\''+seg+'\',1)">›</button></div></div>'
      +(legend?'<div class="gc-key">'+legend+'</div>':'')+empty
      +'<div class="gc-body"><div class="gc-cal"><div class="gc-w">'+['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((w,i)=>'<span'+(i>4?' class="we"':'')+'>'+w+'</span>').join('')+'</div><div class="gc-g">'+cells+'</div></div>'+side+'</div></section>';
  }
  const redraw=seg=>{const el=document.querySelector('#view .gc[data-seg="'+seg+'"]');if(el)el.outerHTML=cal(S.pid,seg);};
  window.gcMove=function(seg,dir){const k='m_'+S.pid+'_'+seg,c=st[k];if(!c)return;let m=c.m+dir,y=c.y;if(m<0){m=11;y--;}if(m>11){m=0;y++;}st[k]={y,m};st['s_'+S.pid+'_'+seg]='';redraw(seg);};
  window.gcDay=function(seg,k){const s='s_'+S.pid+'_'+seg;st[s]=(k===''||st[s]===k)?'sum':k;redraw(seg);};
  /* today's panel: every goal with its aim, what is logged today, and the buttons to log it here */
  const aimT=g=>{const t=g.type||'scale';if(t==='yn')return 'Aim: Yes';if(t==='num')return 'Aim: '+(g.dir==='atmost'?'at most ':'at least ')+g.aim+(g.unit?' '+g.unit:'');if(t==='choice')return 'Aim: '+(g.aimOpt||((g.opts||[]).slice(-1)[0])||'');return 'Aim: '+(g.aim==null?8:g.aim)+' of 10';};
  function todayPanel(pid,seg,D,L,due){
    const goals=((psyPx(pid).sn||{}).goals)||[],P=E(pid);
    const rows=goals.map((g0,i)=>{const g=Object.assign({},g0,{type:g0.type||'scale'}),mine=L.filter(e=>e.s===i),isDue=due.indexOf(i)>=0;
      const got=mine.map(e=>(e.det.find(r=>r[0]==='Logged')||[])[1]).filter(v=>v!==undefined);
      const lastV=got.length?got[got.length-1]:'',ok=got.length?met(g,g.type==='scale'?+lastV:lastV):null;
      let opts=null;if(g.type==='yn')opts=[['yes','Yes'],['no','No']];else if(g.type==='choice')opts=(g.opts||[]).map(o=>[o,o]);else if(g.type==='scale'){opts=[];for(let k=0;k<=10;k++)opts.push([String(k),String(k)]);}
      const inp=opts?`<div class="gc-lo${g.type==='scale'?' sc':''}">${opts.map(o=>`<button type="button" class="gc-lb${String(lastV)===String(o[0])?' on':''}" data-p="${P}" data-i="${i}" data-v="${E(o[0])}" onclick="gcLog(this)">${E(o[1])}</button>`).join('')}</div>`
        :`<div class="gc-lo"><input type="number" step="any" inputmode="decimal" class="input gc-ni" id="gcN${i}" placeholder="0" aria-label="${E(g.t)}" onkeydown="if(event.key==='Enter')gcLogNum(this.nextElementSibling)"><button type="button" class="btn sm pri" data-p="${P}" data-i="${i}" onclick="gcLogNum(this)">Save</button>${g.unit?`<span class="tiny muted">${E(g.unit)}</span>`:''}</div>`;
      const stt=isDue?'<span class="gc-es due">Due</span>':`<span class="gc-es ${ok?'ok':'no'}">${E(got.length>1?got.length+' logs, last '+lastV:'Logged '+lastV)}</span>`;
      return `<div class="gc-lg${isDue?' is-due':''}" style="--c:${colOf(seg,D,i)}"><div class="gc-et"><i class="gc-sw" style="background:var(--c)"></i><b>${E(g.t)}</b>${stt}</div><div class="tiny muted">${E(aimT(g))}</div>${inp}</div>`;}).join('');
    const nd=due.length;
    return `<div class="gc-side gc-det"><div class="gc-dh"><b>Today · ${E(new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'}))}</b><button type="button" class="btn sm" data-s="${seg}" onclick="gcDay(this.dataset.s,'')">Month summary</button></div><div class="small ${nd?'':'muted'}" style="${nd?'color:#475467':''}">${nd?nd+' of '+goals.length+' goal'+(goals.length===1?'':'s')+' still to log today':'All goals logged today'}</div>${rows}</div>`;
  }
  function gcSave(pid,i,v){
    const x=psyPx(pid);x.sn=x.sn||{ladder:[],notes:[],goals:null,relapse:null,ybocs:'',planned:8,hwLog:{},hwWhy:{},told:{},grp:[]};
    const g=((x.sn.goals||[])[i])||{};x.sn.goalLog=x.sn.goalLog||{};const k=String(i);x.sn.goalLog[k]=x.sn.goalLog[k]||[];
    const d=new Date(),at=d.toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})+', '+d.toLocaleTimeString('en-IN',{hour:'numeric',minute:'2-digit'}),role=ROLE;
    x.sn.goalLog[k].push({at,ts:Date.now(),by:(typeof signer==='function'?signer():'')||role,role,v});
    try{if(typeof V3!=='undefined'&&V3.log)V3.log(pid,S.role,'note','Goal logged: '+(g.t||'')+' = '+v);}catch(e){}
    if(typeof window.tpPlanChanged==='function')window.tpPlanChanged(pid);
    render();toast('Logged: '+(g.t||'goal'));
  }
  window.gcLog=function(b){const pid=b.dataset.p,i=+b.dataset.i,g=(((psyPx(pid).sn||{}).goals)||[])[i]||{};let v=b.dataset.v;if((g.type||'scale')==='scale')v=+v;gcSave(pid,i,v);};
  window.gcLogNum=function(b){const i=+b.dataset.i,el=document.getElementById('gcN'+i),s=String((el||{}).value||'').trim();if(s===''||isNaN(+s)){if(el)el.focus();toast('Type a number first');return;}gcSave(b.dataset.p,i,+s);};

  function place(){
    if(!/^#\/patient\/[^/]+\/therapy/.test(location.hash||''))return;
    const body=document.querySelector('#view .tp-body');if(!body||body.querySelector('.gc'))return;
    const seg=(S.tp&&S.tp.seg)||'ind',pid=S.pid;if(!pid)return;
    const w=document.createElement('div');w.innerHTML=cal(pid,seg);const el=w.firstChild;
    if(seg==='ind'){const g=[...body.querySelectorAll('.tp-sec')].find(s=>/^Goals/.test(((s.querySelector('.tp-h')||{}).textContent||'').trim()));if(g)g.appendChild(el);else body.appendChild(el);}
    else if(seg==='grp'){const ga=body.querySelector('.ga');if(ga)ga.after(el);else{const s=body.querySelector('.tp-segs');s?s.after(el):body.prepend(el);}}
    else{const tf=body.querySelector('.tf');if(tf)tf.before(el);else body.appendChild(el);}
  }

  const css=document.createElement('style');css.id='m23-gc-css';
  css.textContent=
    '.gc{border:1px solid #e3eaf2;border-radius:14px;background:#fff;padding:16px 20px;margin:14px 0}'+
    '.gc-hd{display:flex;justify-content:space-between;align-items:flex-start;gap:10px 20px;flex-wrap:wrap}.gc-hd h3{margin:0;font-size:15px;color:#101828}.gc-hd p{margin:2px 0 0;font-size:12.5px;color:#667085}'+
    '.gc-nav{display:flex;align-items:center;gap:10px}.gc-nav b{min-width:120px;text-align:center;font-size:14px}'+
    '.gc-kb{display:inline-flex;align-items:center;gap:7px;border:1px solid #d0d5dd;background:#fff;border-radius:99px;padding:4px 6px 4px 10px;font:inherit;font-size:12.5px;color:#344054;cursor:pointer}.gc-kb:hover{border-color:#1e6cdb;background:#f5f9ff}.gc-kb em{font-style:normal;font-weight:700;color:#1e6cdb;background:#eef4fd;border-radius:99px;padding:1px 8px}'+
    '.gc-key{display:flex;flex-wrap:wrap;gap:6px 18px;margin-top:12px;font-size:12.5px;color:#344054}.gc-key span{display:inline-flex;align-items:center;gap:7px}'+
    '.gc-c.due{background:#f2f4f7;border-color:#98a2b3;position:relative}.gc-c.due::after{content:"";width:6px;height:6px;border-radius:50%;background:var(--c)}.gc-es.due{background:#f2f4f7;color:#475467}'+
    '.gc-lg{border:1px solid #eef2f6;border-left:4px solid var(--c);border-radius:10px;padding:10px 12px;display:grid;gap:6px}.gc-lg.is-due{background:#fafbfc}'+
    '.gc-lo{display:flex;flex-wrap:wrap;gap:5px;align-items:center}.gc-lo.sc{display:grid;grid-template-columns:repeat(6,minmax(0,1fr))}'+
    '.gc-lb{all:unset;box-sizing:border-box;min-width:40px;min-height:34px;padding:0 10px;border:1.5px solid #d0d8e3;border-radius:8px;background:#fff;font-size:13px;font-weight:600;color:#1d2939;text-align:center;cursor:pointer;display:inline-flex;align-items:center;justify-content:center}'+
    '.gc-lb:hover{border-color:var(--c)}.gc-lb:focus-visible{outline:2px solid #1e6cdb;outline-offset:1px}.gc-lb.on{background:var(--c);border-color:var(--c);color:#fff}.gc-lo.sc .gc-lb{min-width:0;padding:0}'+
    '.gc-ni{width:96px;min-height:34px;font-size:15px;font-weight:700;text-align:center}'+
    '.gc-sw{display:inline-block;flex:none;width:12px;height:12px;border-radius:4px}'+
    '.gc-body{display:grid;grid-template-columns:minmax(0,1fr) 280px;gap:24px;margin-top:14px;align-items:start}'+
    '.gc-w,.gc-g{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:5px}.gc-w span{font-size:11.5px;font-weight:600;color:#475467;text-align:center;padding:4px 0;border-radius:6px;background:#f2f4f7}.gc-w span.we{background:#eef4ff;color:#3538cd}'+
    '.gc-d{all:unset;box-sizing:border-box;cursor:pointer;min-height:64px;border:1px solid #eef2f6;border-radius:9px;padding:5px 6px;display:flex;flex-direction:column;gap:4px;background:#fff;transition:border-color .15s,box-shadow .15s,transform .12s}'+
    '.gc-d:hover{border-color:#b9c6d8}.gc-d:focus-visible{outline:2px solid #1e6cdb;outline-offset:1px}.gc-d:active{transform:scale(.98)}'+
    '.gc-d.gc-x{border:0;background:none;cursor:default}.gc-d.fut{background:#fafbfc}'+
    '.gc-d.t-ok{background:#f0fdf4;border-color:#bbf7d0}.gc-d.t-half{background:#fffbeb;border-color:#fde68a}.gc-d.t-no{background:#fef2f2;border-color:#fecaca}'+
    '.gc-d.today{box-shadow:inset 0 0 0 2px #1e6cdb}.gc-d.sel{box-shadow:0 0 0 2px #101828;border-color:#101828}'+
    '.gc-n{font-size:11.5px;color:#667085;font-variant-numeric:tabular-nums}.gc-d.today .gc-n{color:#1e6cdb;font-weight:700}'+
    '.gc-ms{display:flex;flex-wrap:wrap;gap:3px}'+
    '.gc-c{display:inline-flex;align-items:center;justify-content:center;min-width:20px;height:20px;padding:0 4px;border-radius:6px;font-style:normal;font-size:11px;font-weight:800;line-height:1;box-sizing:border-box;border:2px solid var(--c)}'+
    '.gc-c.ok{background:var(--c);color:#fff}.gc-c.half{background:color-mix(in srgb,var(--c) 30%,#fff);color:var(--c)}.gc-c.no{background:#fff;color:var(--c);border-style:dashed}'+
    '.gc-k3{display:inline-flex;align-items:center;gap:5px;flex-wrap:wrap}.gc-k3 .gc-c{min-width:18px;height:18px;margin-left:6px;font-size:10px}'+
    '.gc-side{display:grid;gap:12px;border-left:1px solid #eef2f6;padding-left:20px;align-content:start}'+
    '.gc-big{font-size:28px;font-weight:700;color:#101828;line-height:1.1}.gc-big small{display:block;font-size:12px;font-weight:400;color:#667085}'+
    '.gc-st{display:grid;grid-template-columns:18px minmax(0,1fr);gap:8px;align-items:start}.gc-st .gc-sw{margin-top:3px}.gc-st b{display:block;font-size:13px;color:#101828;line-height:1.3}.gc-st small{font-size:12px;color:#667085}'+
    '.gc-det{animation:gcIn .2s ease-out}.gc-dh{display:flex;align-items:center;justify-content:space-between;gap:8px}.gc-dh b{font-size:14px;color:#101828}'+
    '.gc-ev{border:1px solid #eef2f6;border-left:4px solid var(--c);border-radius:10px;padding:10px 12px;display:grid;gap:5px}'+
    '.gc-et{display:flex;align-items:center;gap:7px}.gc-et b{font-size:13px;color:#101828;flex:1;min-width:0}.gc-es{font-size:11.5px;font-weight:600;padding:2px 8px;border-radius:99px}.gc-es.ok{background:#ecfdf3;color:#067647}.gc-es.half{background:#fffaeb;color:#b54708}.gc-es.no{background:#fef3f2;color:#b42318}'+
    '.gc-er{display:grid;grid-template-columns:92px minmax(0,1fr);gap:8px;font-size:12.5px}.gc-er span:first-child{color:#667085}.gc-er span:last-child{color:#101828;white-space:pre-wrap}'+
    '@keyframes gcIn{from{opacity:0;transform:translateX(6px)}to{opacity:1;transform:none}}'+
    '@media(prefers-reduced-motion:reduce){.gc-det{animation:none}.gc-d{transition:none}}'+
    '@media(max-width:900px){.gc-body{grid-template-columns:1fr}.gc-side{border-left:0;padding-left:0}.gc-d{min-height:50px}}';
  document.head.appendChild(css);

  const __r=render;
  render=function(){const o=__r.apply(this,arguments);try{place();}catch(e){}return o;};
})();
