/* 19 Nov 2026, Trello (Anu, meeting 19 Nov). Every login.
   1. Daily notes alert: one alert per patient, "Daily note not written on 18 Nov 2026" for one missed day, or
      "Daily note not written for 3 days" for several; click "Show dates" to see every missed date. No patient name, no time.
   2. Call family: a saved call also ticks the patient's own call record, so the Therapy tab and "Due for this patient"
      stop showing the call as due now. */
(function(){
  const E=s=>hesc(String(s==null?'':s));
  const DN=/^Daily note not written/;
  const fmt=d=>d.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'});
  const dateOf=t=>{const m=String(t||'').match(/on (\d{1,2} \w{3} \d{4})/);return m?m[1]:fmt(new Date());};
  const key=s=>{const d=new Date(s);return isNaN(d)?s:d.toISOString().slice(0,10);};
  const titleFor=ds=>ds.length===1?'Daily note not written on '+ds[0]:'Daily note not written for '+ds.length+' days';
  const setDates=(a,ds)=>{const u=[...new Set(ds)].sort((x,y)=>key(x)<key(y)?-1:1);a.dnDates=u;a.title=titleFor(u);a.detail='Not written on: '+u.join(', ');};
  const S3=()=>{try{return v3();}catch(e){return null;}};

  /* merge alerts already raised the old way (one per day, with the name and "by 9 pm") */
  function merge(){
    const s=S3();if(!s||!s.alerts)return;
    const by={};s.alerts.forEach(a=>{if(!a.closed&&!a.ack&&DN.test(a.title||''))(by[a.pid]=by[a.pid]||[]).push(a);});
    Object.keys(by).forEach(pid=>{const g=by[pid],keep=g[0];
      const ds=[].concat(...g.map(a=>a.dnDates||[dateOf(a.title)]));
      if(g.length===1&&keep.dnDates&&keep.title===titleFor(keep.dnDates))return;
      setDates(keep,ds);
      g.slice(1).forEach(a=>{const i=s.alerts.indexOf(a);if(i>=0)s.alerts.splice(i,1);});
    });
  }
  if(window.V3&&typeof V3.alert==='function'){
    const __al=V3.alert;
    V3.alert=function(o){
      if(o&&DN.test(o.title||'')){
        const s=S3(),d=dateOf(o.title);
        const ex=s&&s.alerts.find(a=>!a.closed&&!a.ack&&a.pid===o.pid&&DN.test(a.title||''));
        if(ex){setDates(ex,(ex.dnDates||[dateOf(ex.title)]).concat([d]));try{V3.tick();}catch(e){}return ex;}
        const a=__al.call(this,Object.assign({},o,{title:titleFor([d]),detail:'Not written on: '+d}));
        if(a)a.dnDates=[d];return a;
      }
      return __al.apply(this,arguments);
    };
  }

  /* "Show dates" next to a multi-day alert, wherever it is listed */
  window.dnxToggle=function(ev,btn){ev.stopPropagation();ev.preventDefault();const l=btn.nextElementSibling;if(!l)return;const open=l.style.display==='none';l.style.display=open?'block':'none';btn.textContent=open?'Hide dates ▴':'Show dates ▾';};
  function expand(){
    const s=S3();if(!s)return;
    const list=s.alerts.filter(a=>!a.closed&&a.dnDates&&a.dnDates.length>1);if(!list.length)return;
    const roots=[document.getElementById('view'),document.getElementById('modal')].filter(Boolean);
    roots.forEach(root=>{
      const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>/Daily note not written for \d+ days/.test(n.nodeValue)?1:3});
      const hits=[];let n;while((n=w.nextNode()))hits.push(n);
      hits.forEach(tn=>{
        const el=tn.parentElement;if(!el||el.querySelector(':scope > .dnx-b'))return;
        const cnt=+((tn.nodeValue.match(/for (\d+) days/)||[])[1]||0);
        let a=null,up=el;
        for(let i=0;i<10&&up&&!a;i++,up=up.parentElement){const h=(up.getAttribute&&up.getAttribute('onclick')||'')+(up.innerHTML.length<30000?up.innerHTML:'');a=list.find(x=>x.dnDates.length===cnt&&(h.indexOf("'"+x.id+"'")>=0||h.indexOf("'"+x.pid+"'")>=0));}
        if(!a){const same=list.filter(x=>x.dnDates.length===cnt);if(same.length===1)a=same[0];}
        if(!a)return;
        const b=document.createElement('button');b.type='button';b.className='lnk dnx-b';b.style.cssText='margin:0 0 0 8px;font-size:13px';b.textContent='Show dates ▾';b.setAttribute('onclick','dnxToggle(event,this)');
        const l=document.createElement('div');l.className='dnx-l tiny';l.style.cssText='display:none;margin-top:4px';l.innerHTML=a.dnDates.map(d=>'• '+E(d)).join('<br>');
        l.onclick=e=>e.stopPropagation();
        el.appendChild(b);el.appendChild(l);
      });
    });
  }

  /* 2. call family -> the patient's own call record */
  let LAST=null;
  const kindNow=()=>/psychologist/.test(String((window.__TULASI__||{}).role||''))?'psychologist':'psychiatrist';
  function tick(pid,k){
    if(!pid||!k||typeof ptRun!=='function')return;
    try{ptRun(pid,()=>{S.calls=S.calls||{};if(k==='c24')S.calls.h24='done';if(k==='c34'){if(kindNow()==='psychologist')S.calls.d34psych='done';else S.calls.d34psy='done';}return '';});}catch(e){}
  }
  function sync(pid){
    const A=window.__faApi;if(!A||!pid)return;
    let f=null;try{f=A.famState(pid);}catch(e){}if(!f)return;
    if(f.c24)tick(pid,'c24');if(f.c34)tick(pid,'c34');
  }
  /* 3. (19 Nov 2026, owner) Sensitisation topics are ticked in the Call family pop-up, under "How long was the call?".
     They are saved in the patient's family record (psyx.fam, which both the psychiatrist and the psychologist may write). */
  const TOPICS=['What the illness is','How reassurance feeds it','Responding at home','Medicines','Relapse signs','Stigma','Caregiver self-care','Discharge plan'];
  const famOf=pid=>{try{return window.__faApi?__faApi.famState(pid):null;}catch(e){return null;}};
  function addTopics(pid){
    const m=document.getElementById('modal');if(!m||m.querySelector('#fcTopics'))return;
    const f=famOf(pid)||{},had=f.topics||{};
    const html=`<div class="field" id="fcTopicsW"><span class="lbl">Sensitisation topics covered <span class="tiny muted" style="font-weight:400">(tap all that apply)</span></span><div class="pm-b" id="fcTopics">${TOPICS.map(t=>`<button type="button" class="tog" data-t="${E(t)}" onclick="this.classList.toggle('on')" title="${had[t]?'Covered '+E(had[t].at)+' by '+E(had[t].by):'Not covered yet'}">${had[t]?'✓ ':''}${E(t)}</button>`).join('')}</div>
      <div class="tiny muted" style="margin-top:4px">${Object.keys(had).length} of ${TOPICS.length} covered so far</div></div>`;
    const dur=m.querySelector('#pmB_dur');const anchor=dur&&dur.closest('.field');
    if(anchor)anchor.insertAdjacentHTML('afterend',html);
    else{const n=m.querySelector('#faN'),fld=n&&n.closest('.field');if(fld)fld.insertAdjacentHTML('beforebegin',html);}
  }
  function saveTopics(pid,picked){
    if(!picked.length)return;const f=famOf(pid);if(!f)return;
    f.topics=f.topics||{};const w={at:atNow(),by:signer()};picked.forEach(t=>{f.topics[t]=w;});
    if(f.log&&f.log[0]&&!f.log[0].topics)f.log[0].topics=picked.slice();
    try{V3.log(pid,S.role,'family','Sensitisation topics covered: '+picked.join(', '));}catch(e){}
  }
  const wrapCall=()=>{
    if(typeof window.faCall==='function'&&!window.faCall.__dnx){const o=window.faCall;window.faCall=function(pid,k){LAST={pid,k};const r=o.apply(this,arguments);try{addTopics(pid);}catch(e){}return r;};window.faCall.__dnx=1;}
    ['pmCallSave','faCallSave'].forEach(n=>{const o=window[n];if(typeof o!=='function'||o.__dnx)return;
      window[n]=function(){const L=LAST||{pid:arguments[0],k:arguments[1]};
        const picked=[...document.querySelectorAll('#fcTopics .tog.on')].map(b=>b.dataset.t);
        const spoke=n==='faCallSave'||/^Spoke to family$/.test(((document.querySelector('#pmB_out .tog.on')||{}).textContent||'').trim());
        const f0=L&&L.pid&&famOf(L.pid),n0=f0&&f0.log?f0.log.length:0;
        const r=o.apply(this,arguments);
        if(L&&L.pid){const f1=famOf(L.pid);if(spoke&&f1&&f1.log&&f1.log.length>n0)saveTopics(L.pid,picked);sync(L.pid);try{render();}catch(e){}}
        return r;};window[n].__dnx=1;});
  };
  wrapCall();

  const __r=render;
  render=function(){
    try{merge();}catch(e){}
    try{const m=String(location.hash||'').match(/^#\/patient\/([^/?]+)/);if(m)sync(decodeURIComponent(m[1]));}catch(e){}
    const o=__r.apply(this,arguments);
    try{wrapCall();expand();}catch(e){}
    return o;
  };
  /* the eye window and Take Action list are opened outside render */
  if(typeof openModal==='function'){const __om=openModal;openModal=function(){const o=__om.apply(this,arguments);try{expand();}catch(e){}return o;};}
})();
