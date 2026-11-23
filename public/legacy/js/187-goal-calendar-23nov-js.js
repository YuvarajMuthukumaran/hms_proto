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
  /* 23 Nov (owner): a relevant icon per goal or group instead of colours and numbers; green = met, red = not met, amber = part */
  const ICP={
    sleep:'<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
    people:'<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14.6c2.8.2 5 2.1 5 5.4"/>',
    talk:'<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9.5h8M8 12.5h5"/>',
    food:'<path d="M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10"/><path d="M17 3c-2 1.5-3 4-3 7h3v11"/>',
    pill:'<rect x="3" y="9" width="18" height="7" rx="3.5" transform="rotate(-35 12 12.5)"/><path d="M9.5 9l4.5 6.5"/>',
    walk:'<circle cx="13" cy="4.5" r="2"/><path d="M10 21l2-6 3 3v3M9 12l2-4.5 4 2 2 3M11 7.5L8 10"/>',
    book:'<path d="M4 5.5C6.5 4.5 9.5 4.5 12 6c2.5-1.5 5.5-1.5 8-.5V19c-2.5-1-5.5-1-8 .5-2.5-1.5-5.5-1.5-8-.5z"/><path d="M12 6v13.5"/>',
    heart:'<path d="M12 20s-7.5-4.5-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10C19.5 15.5 12 20 12 20z"/>',
    phone:'<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
    calm:'<path d="M3 12c2-3 4-3 6 0s4 3 6 0 4-3 6 0"/><path d="M3 17c2-3 4-3 6 0s4 3 6 0 4-3 6 0"/>',
    art:'<path d="M12 3a9 9 0 1 0 0 18c1.2 0 1.6-1 1-2s-.2-2.5 1.5-2.5H17a4 4 0 0 0 4-4C21 7 17 3 12 3z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10.5" cy="7.5" r="1"/><circle cx="15" cy="7.5" r="1"/>',
    target:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r=".8"/>'
  };
  const icKey=t=>{t=String(t||'').toLowerCase();
    return /sleep|bed|night|rest/.test(t)?'sleep':/eat|meal|food|diet|weight|breakfast|lunch|dinner/.test(t)?'food':/medic|tablet|pill|dose/.test(t)?'pill':/walk|exercise|yoga|gym|physical|run|sport/.test(t)?'walk':/read|journal|write|diary|study/.test(t)?'book':/call|phone|family|visit/.test(t)?'phone':/talk|worr|share|speak|therap|counsel|express/.test(t)?'talk':/group|activit|social|friend|peer|team/.test(t)?'people':/mood|feel|happy|self|esteem/.test(t)?'heart':/calm|relax|breath|anxi|meditat|anger/.test(t)?'calm':/art|music|draw|paint|craft|dance/.test(t)?'art':'target';};
  const icon=(t,sz)=>'<svg viewBox="0 0 24 24" width="'+(sz||14)+'" height="'+(sz||14)+'" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+ICP[icKey(t)]+'</svg>';
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
    const mark=e=>{const st=e.ok===true?'ok':e.ok==='half'?'half':'no',w=st==='ok'?(seg==='grp'?'attended':seg==='fam'?'reached':'aim met'):st==='half'?'part of it':(seg==='grp'?'refused':seg==='fam'?'not reached':'not met');
      return '<i class="gc-m '+st+'" title="'+E((D.series[e.s]||'')+': '+w+(e.v!==''?' ('+e.v+')':'')+(e.txt?' · '+e.txt:''))+'">'+icon(D.series[e.s]||e.txt)+'</i>';};
    let cells='';for(let i=0;i<lead;i++)cells+='<div class="gc-d gc-x"></div>';
    for(let d=1;d<=days;d++){const dt=new Date(y,m,d),L=by[key(dt)]||[],today=key(dt)===key(now),fut=dt>now;
      cells+='<div class="gc-d'+(today?' today':'')+(fut?' fut':'')+(L.length?' has':'')+'"><span class="gc-n">'+d+'</span><span class="gc-ms">'+L.map(mark).join('')+'</span></div>';}
    const tail=(7-(lead+days)%7)%7;for(let i=0;i<tail;i++)cells+='<div class="gc-d gc-x"></div>';
    const legend=D.series.length?D.series.map((t,i)=>'<span><i class="gc-ic">'+icon(t,15)+'</i>'+E(t)+'</span>').join(''):'';
    const statRow=(t,i)=>{const L=inM.filter(e=>e.s===i),dset={},okd={};L.forEach(e=>{dset[key(e.d)]=1;if(e.ok===true)okd[key(e.d)]=1;});
      const n=Object.keys(dset).length,o=Object.keys(okd).length;
      const lab=D.what==='goal'?'aim met '+o+' of '+n+' logged day'+(n===1?'':'s'):D.what==='group'?o+' attended of '+n+' day'+(n===1?'':'s')+' marked':o+' of '+L.length+' reached';
      return '<div class="gc-st"><i class="gc-ic">'+icon(t,15)+'</i><div><b>'+E(t)+'</b><small>'+(n?lab:'nothing this month')+'</small></div></div>';};
    const dayCount=Object.keys(by).length;
    const side='<div class="gc-side"><div class="gc-big">'+dayCount+'<small> day'+(dayCount===1?'':'s')+' with a record in '+MN[m]+'</small></div>'+D.series.map(statRow).join('')+'</div>';
    const title=seg==='grp'?'Group attendance calendar':seg==='fam'?'Family contact calendar':'Goals calendar';
    const key3=(a,b,c)=>'<span class="gc-k3"><i class="gc-m ok">'+icon('x')+'</i>'+a+'<i class="gc-m half">'+icon('x')+'</i>'+b+'<i class="gc-m no">'+icon('x')+'</i>'+c+'</span>';
    const sub=seg==='grp'?'Each group has its own icon. '+key3('Attended','Part of it','Refused'):seg==='fam'?key3('Spoke with the family','','Not reached').replace(/<i class="gc-m half">[\s\S]*?<\/i><i/,'<i'):'Each goal has its own icon. '+key3('Aim met','Part way','Not met')+' Hover a day for the value logged.';
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
    '.gc .gc-m{min-width:22px;height:22px;padding:0;border-radius:6px;border:1.5px solid}.gc .gc-m.ok{background:#ecfdf3;color:#067647;border-color:#75e0a7}.gc .gc-m.no{background:#fef3f2;color:#b42318;border-color:#fda29b}.gc .gc-m.half{background:#fffaeb;color:#b54708;border-color:#fedf89}'+
    '.gc-ic{display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:6px;background:#f2f4f7;color:#344054;flex:none;font-style:normal;vertical-align:middle;margin-right:6px}'+
    '.gc-k3{display:inline-flex;align-items:center;gap:5px;flex-wrap:wrap}.gc-k3 .gc-m{min-width:18px;height:18px;margin-left:6px}.gc-k3 .gc-m svg{width:11px;height:11px}'+
    '.gc-side{display:grid;gap:12px;border-left:1px solid #eef2f6;padding-left:20px}'+
    '.gc-big{font-size:28px;font-weight:700;color:#101828;line-height:1.1}.gc-big small{display:block;font-size:12px;font-weight:400;color:#667085}'+
    '.gc-st{display:grid;grid-template-columns:28px minmax(0,1fr);gap:8px;align-items:start}.gc-st .gc-sw{margin-top:3px}.gc-st b{display:block;font-size:13px;color:#101828;line-height:1.3}.gc-st small{font-size:12px;color:#667085}'+
    '@media(max-width:900px){.gc-body{grid-template-columns:1fr}.gc-side{border-left:0;padding-left:0}.gc-d{min-height:48px}}';
  document.head.appendChild(css);

  const __r=render;
  render=function(){const o=__r.apply(this,arguments);try{place();}catch(e){}return o;};
})();
