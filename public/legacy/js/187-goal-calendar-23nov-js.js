/* 23 Nov 2026, meeting with Dr. Anu and Nikita: Therapy Plans as a month calendar ("make it more visual, one calendar,
   each goal its own colour with a legend, summary stats on the side; for individual, family and group").
   Psychiatrist, psychologist and their floor leads (the Therapy Plans page they all open).
   - Individual: every goal has a colour. A day shows a mark per goal logged that day (session note or Log now):
     a tick when the aim was met, a cross when not (yes/no goals), the value for a scale or a number.
     Side: per goal "aim met on x of y logged days" this month.
   - Group: a mark per group attended that day (tick attended, half for part of it, cross refused).
   - Family: a mark per family contact that day (calls from Call family, signed family sessions).
   Month arrows move back and forward. Nothing is stored here; it only reads what is already saved. */
(function(){
  const ROLE=String((window.__TULASI__||{}).role||'');
  if(!/^(psychiatrist|floor-lead-psychiatrist|psychologist|floor-lead-psychologist)$/.test(ROLE))return;
  const E=s=>hesc(String(s==null?'':s));
  const COL=['#1e6cdb','#c11574','#0e9384','#dc6803','#6941c6','#4e5ba6','#b42318','#3b7c0f'];
  const MON={jan:0,feb:1,mar:2,apr:3,may:4,jun:5,jul:6,aug:7,sep:8,oct:9,nov:10,dec:11};
  const MN=['January','February','March','April','May','June','July','August','September','October','November','December'];
  const st=window.__gcM=window.__gcM||{};
  const key=d=>d.getFullYear()+'-'+d.getMonth()+'-'+d.getDate();
  function dayOf(r){
    if(r&&r.ts)return new Date(r.ts);
    const m=String((r&&(r.at||r.date))||'').match(/(\d{1,2})\s+([A-Za-z]{3})[a-z]*\.?,?\s*(\d{4})?/);
    if(!m||MON[m[2].toLowerCase()]===undefined)return null;
    return new Date(m[3]?+m[3]:new Date().getFullYear(),MON[m[2].toLowerCase()],+m[1]);
  }
  const isNum=v=>v!==''&&v!==null&&v!==undefined&&!isNaN(+v);
  function met(g,v){
    if(g.type==='yn')return v==='yes';
    if(g.type==='scale'){const a=+(g.aim==null?8:g.aim),s=+(g.start==null?2:g.start);return isNum(v)&&(a>=s?+v>=a:+v<=a);}
    if(g.type==='choice'){const o=g.opts||[],i=o.indexOf(v),ai=o.indexOf(g.aimOpt);return i>=0&&i>=(ai<0?o.length-1:ai);}
    if(g.type==='num')return isNum(v)&&(g.dir==='atmost'?+v<=+g.aim:+v>=+g.aim);
    return false;
  }
  const short=(g,v)=>g.type==='yn'||g.type==='choice'?'':g.type==='scale'?String(v):String(v);

  /* every entry: {d:Date, s:series index, ok:true|false|'half', txt} */
  function indData(pid){
    const x=psyPx(pid),sn=x.sn||{},goals=sn.goals||[],out=[];
    const notes=(sn.notes||[]).filter(n=>n&&n.status==='signed');
    goals.forEach((g,i)=>{
      notes.forEach(n=>{const v=(n.goalR||{})[i];if(v===undefined||v===''||v===null)return;const d=dayOf(n);if(d)out.push({d,s:i,ok:met(g,v),v:short(g,v),txt:g.t+': '+v});});
      (((sn.goalLog)||{})[i]||[]).forEach(r=>{const d=dayOf(r);if(d)out.push({d,s:i,ok:met(g,r.v),v:short(g,r.v),txt:g.t+': '+r.v+(r.by?' ('+r.by+')':'')});});
    });
    return {series:goals.map(g=>g.t),out,what:'goal'};
  }
  function grpData(pid){
    const x=psyPx(pid),rows=((x.sn||{}).grp||[]).concat(((x.th||{}).grp)||[]),names=[],out=[];
    rows.forEach(r=>{const nm=r.group||'Group';if(names.indexOf(nm)<0)names.push(nm);const d=dayOf(r);if(!d)return;
      const t=String(r.took||'');out.push({d,s:names.indexOf(nm),ok:/refus|not attend/i.test(t)?false:/part/i.test(t)?'half':true,v:'',txt:nm+': '+(t||'Attended')});});
    return {series:names,out,what:'group'};
  }
  function famData(pid){
    const x=psyPx(pid),names=['Family call','Family session'],out=[];
    let log=[];try{log=((window.__faApi&&__faApi.famState(pid))||x.fam||{}).log||[];}catch(e){log=(x.fam||{}).log||[];}
    log.forEach(l=>{const d=dayOf(l);if(!d)return;const spoke=!/attempt|no answer|not reach/i.test((l.what||'')+' '+(l.note||''));out.push({d,s:0,ok:spoke,v:'',txt:(l.what||'Family call')+(spoke?'':' (not reached)')});});
    ((x.sn||{}).notes||[]).filter(n=>n&&n.status==='signed'&&(n.kind==='fam'||n.mod==='Family therapy')).forEach(n=>{const d=dayOf(n);if(d)out.push({d,s:1,ok:true,v:'',txt:'Family session'});});
    (((x.th||{}).fam)||[]).forEach(r=>{const d=dayOf(r);if(d)out.push({d,s:1,ok:true,v:'',txt:'Family session'+(r.who?' with '+r.who:'')});});
    return {series:names,out,what:'contact'};
  }

  function cal(pid,seg){
    const D=seg==='grp'?grpData(pid):seg==='fam'?famData(pid):indData(pid);
    const now=new Date(),k='m_'+pid+'_'+seg;
    if(!st[k]){const last=D.out.reduce((a,e)=>e.d>a?e.d:a,null);const b=last&&last<now?last:now;st[k]={y:b.getFullYear(),m:b.getMonth()};}
    const {y,m}=st[k],first=new Date(y,m,1),days=new Date(y,m+1,0).getDate(),lead=(first.getDay()+6)%7;
    const inM=D.out.filter(e=>e.d.getFullYear()===y&&e.d.getMonth()===m),by={};
    inM.forEach(e=>{(by[key(e.d)]=by[key(e.d)]||[]).push(e);});
    const mark=e=>{const c=COL[e.s%COL.length];
      const sym=e.ok===true?(e.v!==''?E(e.v):'✓'):e.ok==='half'?'½':(e.v!==''?E(e.v):'✗');
      return '<i class="gc-m'+(e.ok===true?'':e.ok==='half'?' half':' no')+'" style="--c:'+c+'" title="'+E(e.txt)+'">'+sym+'</i>';};
    let cells='';for(let i=0;i<lead;i++)cells+='<div class="gc-d gc-x"></div>';
    for(let d=1;d<=days;d++){const dt=new Date(y,m,d),L=by[key(dt)]||[],today=key(dt)===key(now),fut=dt>now;
      cells+='<div class="gc-d'+(today?' today':'')+(fut?' fut':'')+(L.length?' has':'')+'"><span class="gc-n">'+d+'</span><span class="gc-ms">'+L.map(mark).join('')+'</span></div>';}
    const tail=(7-(lead+days)%7)%7;for(let i=0;i<tail;i++)cells+='<div class="gc-d gc-x"></div>';
    const legend=D.series.length?D.series.map((t,i)=>'<span><i class="gc-sw" style="background:'+COL[i%COL.length]+'"></i>'+E(t)+'</span>').join(''):'';
    const statRow=(t,i)=>{const L=inM.filter(e=>e.s===i),dset={},okd={};L.forEach(e=>{dset[key(e.d)]=1;if(e.ok===true)okd[key(e.d)]=1;});
      const n=Object.keys(dset).length,o=Object.keys(okd).length;
      const lab=D.what==='goal'?'aim met '+o+' of '+n+' logged day'+(n===1?'':'s'):D.what==='group'?o+' attended of '+n+' day'+(n===1?'':'s')+' marked':o+' of '+L.length+' reached';
      return '<div class="gc-st"><i class="gc-sw" style="background:'+COL[i%COL.length]+'"></i><div><b>'+E(t)+'</b><small>'+(n?lab:'nothing this month')+'</small></div></div>';};
    const dayCount=Object.keys(by).length;
    const side='<div class="gc-side"><div class="gc-big">'+dayCount+'<small> day'+(dayCount===1?'':'s')+' with a record in '+MN[m]+'</small></div>'+D.series.map(statRow).join('')+'</div>';
    const title=seg==='grp'?'Group attendance calendar':seg==='fam'?'Family contact calendar':'Goals calendar';
    const sub=seg==='grp'?'Each group has its own colour: ✓ attended, ½ part of it, ✗ refused':seg==='fam'?'✓ spoke with the family, ✗ tried but not reached':'Each goal has its own colour: ✓ aim met, ✗ not met, a number is the value logged';
    const empty=!D.series.length?'<div class="small muted" style="padding:8px 0">'+(seg==='grp'?'No group attendance marked yet.':seg==='fam'?'No family contact logged yet.':'No goals set yet.')+'</div>':'';
    return '<section class="gc" data-seg="'+seg+'" aria-label="'+title+'"><div class="gc-hd"><div><h3>'+title+'</h3><p>'+sub+'</p></div>'
      +'<div class="gc-nav"><button type="button" class="btn sm" aria-label="Previous month" onclick="gcMove(\''+seg+'\',-1)">‹</button><b>'+MN[m]+' '+y+'</b><button type="button" class="btn sm" aria-label="Next month" onclick="gcMove(\''+seg+'\',1)">›</button></div></div>'
      +(legend?'<div class="gc-key">'+legend+'</div>':'')+empty
      +'<div class="gc-body"><div class="gc-cal"><div class="gc-w">'+['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(w=>'<span>'+w+'</span>').join('')+'</div><div class="gc-g">'+cells+'</div></div>'+side+'</div></section>';
  }
  window.gcMove=function(seg,dir){const k='m_'+S.pid+'_'+seg,c=st[k];if(!c)return;let m=c.m+dir,y=c.y;if(m<0){m=11;y--;}if(m>11){m=0;y++;}st[k]={y,m};
    const el=document.querySelector('#view .gc[data-seg="'+seg+'"]');if(el)el.outerHTML=cal(S.pid,seg);};

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
    '.gc-key{display:flex;flex-wrap:wrap;gap:6px 18px;margin-top:12px;font-size:12.5px;color:#344054}.gc-key span{display:inline-flex;align-items:center;gap:6px}'+
    '.gc-sw{display:inline-block;flex:none;width:12px;height:12px;border-radius:3px}'+
    '.gc-body{display:grid;grid-template-columns:minmax(0,1fr) 230px;gap:24px;margin-top:14px;align-items:start}'+
    '.gc-w,.gc-g{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:4px}.gc-w span{font-size:11.5px;font-weight:600;color:#667085;text-align:center;padding-bottom:4px}'+
    '.gc-d{min-height:62px;border:1px solid #eef2f6;border-radius:8px;padding:4px 5px;display:flex;flex-direction:column;gap:3px;background:#fff}'+
    '.gc-d.gc-x{border:0;background:none}.gc-d.fut{background:#fafbfc}.gc-d.today{border-color:#1e6cdb;box-shadow:inset 0 0 0 1px #1e6cdb}'+
    '.gc-n{font-size:11.5px;color:#667085;font-variant-numeric:tabular-nums}.gc-d.today .gc-n{color:#1e6cdb;font-weight:700}'+
    '.gc-ms{display:flex;flex-wrap:wrap;gap:3px}'+
    '.gc-m{display:inline-flex;align-items:center;justify-content:center;min-width:18px;height:18px;padding:0 3px;border-radius:5px;background:var(--c);color:#fff;font-style:normal;font-size:11px;font-weight:700;line-height:1;cursor:default;box-sizing:border-box}'+
    '.gc-m.no{background:#fff;color:var(--c);border:1.5px solid var(--c)}.gc-m.half{background:linear-gradient(135deg,var(--c) 50%,#fff 50%);color:#101828;border:1.5px solid var(--c)}'+
    '.gc-side{display:grid;gap:12px;border-left:1px solid #eef2f6;padding-left:20px}'+
    '.gc-big{font-size:28px;font-weight:700;color:#101828;line-height:1.1}.gc-big small{display:block;font-size:12px;font-weight:400;color:#667085}'+
    '.gc-st{display:grid;grid-template-columns:12px minmax(0,1fr);gap:8px;align-items:start}.gc-st .gc-sw{margin-top:3px}.gc-st b{display:block;font-size:13px;color:#101828;line-height:1.3}.gc-st small{font-size:12px;color:#667085}'+
    '@media(max-width:900px){.gc-body{grid-template-columns:1fr}.gc-side{border-left:0;padding-left:0}.gc-d{min-height:48px}}';
  document.head.appendChild(css);

  const __r=render;
  render=function(){const o=__r.apply(this,arguments);try{place();}catch(e){}return o;};
})();
