/* Psychologist only (10 Nov 2026, team meeting with Anu: second batch).
   1. Today: room number on each row; the "High risk" tag in the name cell is gone (Risk of harm already shows next to the psychopathology).
   2. Daily notes filters: Today and Yesterday are gone; Last 7 days and Last 1 month.
   3. Vitals: one default table (BP and pulse morning and evening, temperature, weight, sleep); extra tables only for monitoring the doctor orders.
   4. Handover: reasons are Going on leave, Transfer to another ward, Transfer to another hospital, Change of duty (no Night duty); "Sent by you" is a handover log.
   5. Therapy Plans: Start session writes a transcript only (the voice is never recorded or stored) and keeps it under Session transcripts.
   Every change is gated by S.role==='psychologist'. */
(function(){
  const me=()=>S.role==='psychologist';
  const tpl=h=>{const t=document.createElement('template');t.innerHTML=h;return t;};
  const px=()=>psyPx(S.pid);

  /* ---------- 1. Today rows ---------- */
  const __md=ROLE.psychologist.myday;
  ROLE.psychologist.myday=function(){
    const h=__md.apply(this,arguments);
    if(!me()||typeof h!=='string')return h;
    try{
      const T=tpl(h),R=T.content;
      R.querySelectorAll('tr[data-dt]').forEach(tr=>{
        const pid=(tr.innerHTML.match(/#\/patient\/([^/']+)\//)||[])[1],p=pid&&ptFind(pid);if(!p)return;
        const sub=tr.querySelector('.pd-sub');
        if(sub&&p.room&&!/Room/.test(sub.textContent))sub.append(' · '+(/^room/i.test(p.room)?'':'Room ')+p.room);
        tr.querySelectorAll('.pd-nm .pd-tag').forEach(t=>{if(/high risk/i.test(t.textContent))t.remove();});
      });
      return T.innerHTML;
    }catch(e){return h;}
  };

  /* ---------- 2. Daily notes filters ---------- */
  const DEMO_TODAY=new Date(2026,9,24); /* the demo "today" (24 Oct 2026), same as the psychiatrist's filter */
  const dayOf=n=>{const d=new Date(String(n.d)+' '+String(n.my));return isNaN(d)?null:d;};
  const __nl=noteList;
  noteList=function(id,items){
    if(window.__pgIn&&id==='dn'&&Array.isArray(items)&&S.dnWhen==='month'){
      const t0=new Date(DEMO_TODAY.getFullYear(),DEMO_TODAY.getMonth(),DEMO_TODAY.getDate());
      const keep=items.filter(n=>{const d=dayOf(n);if(!d)return false;const diff=Math.round((t0-d)/864e5);return diff>=0&&diff<=30;});
      const w=S.dnWhen;S.dnWhen='';
      try{return __nl.apply(this,[id,keep]);}finally{S.dnWhen=w;}
    }
    return __nl.apply(this,arguments);
  };
  const __pd=pDaily;
  pDaily=function(){
    if(!me())return __pd.apply(this,arguments);
    let h;window.__pgIn=true;
    try{h=__pd.apply(this,arguments);}finally{window.__pgIn=false;}
    if(typeof h!=='string')return h;
    const T=tpl(h),R=T.content;
    R.querySelectorAll('button.tog').forEach(b=>{if(/^(Today|Yesterday)$/.test(b.textContent.trim()))b.remove();});
    const wk=[...R.querySelectorAll('button.tog')].find(b=>/^Last 7 days$/.test(b.textContent.trim()));
    if(wk&&!R.querySelector('[data-pg-month]'))wk.insertAdjacentHTML('afterend',`<button class="tog ${S.dnWhen==='month'?'on':''}" data-pg-month="1" onclick="psyDnWhen('month')">Last 1 month</button>`);
    return T.innerHTML;
  };

  /* ---------- 3, 4, 5: touch up the page after it is drawn ---------- */
  const mergeVitals=v=>{
    const by={};v.querySelectorAll('section.vm9').forEach(s=>{const h=s.querySelector('h3');if(h)by[h.textContent.trim()]=s;});
    const bp=by['Blood pressure'];if(!bp)return;
    const rowsOf=s=>{const m={};if(!s)return m;s.querySelectorAll('tbody tr').forEach(tr=>{const c=[...tr.children];if(c.length<2)return;m[c[0].textContent.trim()]=c.slice(1).map(x=>{const q=x.querySelector('.v');return (q?q.textContent:x.textContent).trim();});});return m;};
    const B=rowsOf(bp),P=rowsOf(by['Pulse']),T=rowsOf(by['Temperature']),W=rowsOf(by['Weight']),L=rowsOf(by['Sleep']);
    const dates=[...bp.querySelectorAll('tbody tr')].map(tr=>tr.children[0].textContent.trim()).filter(d=>B[d]);
    const two=a=>a?(a.length>1?a[0]+' · '+a[a.length-1]:a[0]):'—',one=a=>a?a[0]:'—';
    const sec=document.createElement('section');sec.className='card vm9';
    sec.innerHTML=`<div class="hd"><h3>Vitals</h3><span class="tiny muted">Usual checks: BP and pulse morning · evening, temperature once, weight weekly, sleep daily</span></div>
      <div class="vscroll"><table><thead><tr><th>Date</th><th>BP (mmHg)</th><th>Pulse (bpm)</th><th>Temp (°F)</th><th>Weight (kg)</th><th>Sleep (h)</th></tr></thead><tbody>${dates.length?dates.map(d=>`<tr><td class="d">${hesc(d)}</td><td>${hesc(two(B[d]))}</td><td>${hesc(two(P[d]))}</td><td>${hesc(one(T[d]))}</td><td>${hesc(one(W[d]))}</td><td>${hesc(one(L[d]))}</td></tr>`).join(''):'<tr><td colspan="6" class="muted small">No readings in this date range.</td></tr>'}</tbody></table></div>
      <div class="tiny muted" style="padding:8px 16px 12px">If the doctor orders more frequent checks (for example temperature four times a day), that check gets its own table.</div>`;
    bp.parentNode.insertBefore(sec,bp);
    ['Blood pressure','Pulse','Temperature','SpO2','Weight','Sleep'].forEach(k=>{if(by[k])by[k].remove();});
    monExtras(sec);
  };

  /* ---------- 3b. separate monitoring tables the psychologist adds (e.g. temperature four times on one day) ---------- */
  const MON=[['Temperature','°F'],['Blood pressure','mmHg'],['Pulse','bpm'],['SpO2','%'],['Weight','kg'],['Sleep','hours'],['Blood sugar','mg/dL'],['Other (type the name)','']];
  const TIMES={2:['9 am','9 pm'],3:['9 am','1 pm','9 pm'],4:['6 am','12 pm','6 pm','12 am'],5:['6 am','10 am','2 pm','6 pm','10 pm'],6:['6 am','9 am','12 pm','3 pm','6 pm','9 pm']};
  const monList=()=>{const x=px();return x.monTables=x.monTables||[];};
  const nextDay=lab=>{const d=new Date(String(lab)+' 2026');if(isNaN(d))return lab;d.setDate(d.getDate()+1);return d.toLocaleDateString('en-GB',{day:'numeric',month:'short'});};
  const todayLab=()=>{try{return new Date(2026,9,24).toLocaleDateString('en-GB',{day:'numeric',month:'short'});}catch(e){return '';}};
  window.pgMonAdd=function(){
    V3.modal('Add a monitoring table','A separate table for one check that is taken more often than the usual vitals, for example temperature four times on the same day.',
      `<div style="display:flex;flex-direction:column;gap:12px"><label class="field"><span class="lbl">What is being monitored</span><select class="input" id="pgMn" onchange="document.getElementById('pgMnOW').style.display=this.selectedIndex===${MON.length-1}?'block':'none'">${MON.map(m=>`<option>${hesc(m[0])}</option>`).join('')}</select></label>
        <label class="field" id="pgMnOW" style="display:none"><span class="lbl">Name</span><input class="input" id="pgMnO" placeholder="e.g. Fluid intake"></label>
        <label class="field"><span class="lbl">How many times a day</span><select class="input" id="pgMnT">${[2,3,4,5,6].map(n=>`<option ${n===4?'selected':''}>${n}</option>`).join('')}</select></label>
        <div class="tiny muted">Times are filled in by default (for example 6 am, 12 pm, 6 pm, 12 am for four times) and the table starts with today.</div></div>`,
      `<button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="pgMonSave()">Add table</button>`);
  };
  window.pgMonSave=function(){
    const i=$('pgMn').selectedIndex,m=MON[i];let name=m[0];
    if(i===MON.length-1){name=(($('pgMnO')||{}).value||'').trim();if(!name){toast('Type the name of the check');return;}}
    const n=+$('pgMnT').value||4;
    monList().push({id:'mt'+Date.now(),name,unit:m[1],slots:TIMES[n].slice(),rows:[{d:todayLab(),v:{}}],by:signer()});
    closeModal();render();toast(name+' table added');
  };
  window.pgMonSet=function(id,r,c,v){const t=monList().find(x=>x.id===id);if(t&&t.rows[r])t.rows[r].v[c]=v;};
  window.pgMonDay=function(id){const t=monList().find(x=>x.id===id);if(!t)return;t.rows.unshift({d:nextDay(t.rows[0].d),v:{}});render();};
  window.pgMonDel=function(id){
    const t=monList().find(x=>x.id===id);if(!t)return;
    V3.modal('Remove this table?','The '+hesc(t.name)+' table and the readings in it will be removed.','',`<button class="btn" onclick="closeModal()">Keep it</button><button class="btn pri" onclick="pgMonDelYes('${id}')">Remove</button>`);
  };
  window.pgMonDelYes=function(id){const x=px();x.monTables=monList().filter(t=>t.id!==id);closeModal();render();};
  const monExtras=sec=>{
    const hd=sec.querySelector('.hd');
    if(hd){hd.style.alignItems='center';hd.insertAdjacentHTML('beforeend','<button type="button" class="btn sm pri keep" style="margin-left:auto" onclick="pgMonAdd()">+ Add monitoring table</button>');}
    const html=monList().map(t=>`<section class="card vm9" data-mt="${t.id}"><div class="hd" style="align-items:center"><h3>${hesc(t.name)}</h3><span class="tiny muted">${hesc(t.unit?t.unit+' · ':'')}${t.slots.length} times a day · added by ${hesc(t.by)}</span><span style="margin-left:auto;display:flex;gap:8px"><button type="button" class="btn sm keep" onclick="pgMonDay('${t.id}')">+ Add next day</button><button type="button" class="btn sm keep" onclick="pgMonDel('${t.id}')">Remove table</button></span></div>
      <div class="vscroll"><table><thead><tr><th>Date</th>${t.slots.map(x=>`<th>${hesc(x)}</th>`).join('')}</tr></thead><tbody>${t.rows.map((r,ri)=>`<tr><td class="d">${hesc(r.d)}</td>${t.slots.map((x,ci)=>`<td><input class="input" style="min-height:32px;max-width:110px" value="${hesc(r.v[ci]||'')}" placeholder="${hesc(t.unit||'')}" aria-label="${hesc(t.name+' '+r.d+' '+x)}" onchange="pgMonSet('${t.id}',${ri},${ci},this.value)"></td>`).join('')}</tr>`).join('')}</tbody></table></div></section>`).join('');
    if(html)sec.insertAdjacentHTML('afterend',html);
  };
  const fixHandover=v=>{
    const sel=v.querySelector('#pgWhy');
    if(sel&&!sel.dataset.pg){
      sel.dataset.pg='1';const cur=sel.value;
      const R=['Going on leave','Transfer to another ward','Transfer to another hospital','Change of duty'];
      sel.innerHTML=R.map(r=>`<option ${r===cur?'selected':''}>${r}</option>`).join('');
      if(typeof pgHoWhy==='function')pgHoWhy(sel.value);
    }
    v.querySelectorAll('.lbl').forEach(l=>{if(/^Sent by you$/.test(l.textContent.trim()))l.textContent='Handover log (what you sent, to whom, and when)';});
  };

  const fmtToday=()=>new Date().toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'});
  let rec=null,stream=null,chunks=[],cancelled=false;
  const stopRec=()=>{try{if(rec&&rec.state==='recording'){cancelled=true;rec.stop();}}catch(e){}try{if(stream)stream.getTracks().forEach(t=>t.stop());}catch(e){}rec=null;stream=null;chunks=[];};
  window.pgSession=function(){
    const ok=!!(navigator.mediaDevices&&window.MediaRecorder);
    V3.modal('Start session','The conversation is turned into text (a transcript). The recording is not saved anywhere: it is thrown away as soon as the text is ready. Tell the patient before you start; if they do not want it, type the notes instead.',
      `<div class="row" style="gap:12px;margin-bottom:10px;align-items:center"><button class="btn pri" id="pgRecB" onclick="pgSessionToggle()" ${ok?'':'disabled'}>Start recording</button><span class="small muted" id="pgRecS">${ok?'Not recording':'This browser cannot record. Type or paste the transcript below.'}</span></div>
       <label class="field"><span class="lbl">Session transcript</span><textarea class="input" id="pgTx" rows="9" placeholder="The conversation appears here as text after you stop"></textarea></label>`,
      `<button class="btn" onclick="pgSessionClose()">Cancel</button><button class="btn pri" onclick="pgSessionSave()">Save session</button>`);
  };
  window.pgSessionClose=function(){stopRec();closeModal();};
  window.pgSessionToggle=async function(){
    const b=$('pgRecB'),s=$('pgRecS');if(!b)return;
    if(rec&&rec.state==='recording'){cancelled=false;rec.stop();b.disabled=true;b.textContent='Transcribing…';s.textContent='Turning the conversation into text…';return;}
    try{stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true}});}
    catch(e){s.textContent='Microphone blocked. Allow it for this site, or type the transcript below.';return;}
    const mime=['audio/webm;codecs=opus','audio/webm','audio/mp4'].find(t=>MediaRecorder.isTypeSupported(t))||'';
    chunks=[];cancelled=false;
    const r=rec=new MediaRecorder(stream,Object.assign({audioBitsPerSecond:24000},mime?{mimeType:mime}:{}));
    r.ondataavailable=e=>{if(e.data&&e.data.size)chunks.push(e.data);};
    r.onstop=async()=>{
      try{stream&&stream.getTracks().forEach(t=>t.stop());}catch(e){}
      const parts=chunks,type=(r.mimeType||'audio/webm').split(';')[0];chunks=[];rec=null;stream=null;
      if(cancelled)return;
      const bb=$('pgRecB'),ss=$('pgRecS'),ta=$('pgTx');
      try{
        const blob=new Blob(parts,{type}),fd=new FormData();
        fd.append('audio',blob,'session.'+(type.includes('mp4')?'mp4':'webm'));
        fd.append('schema',JSON.stringify({mode:'transcript',hint:'Therapy session between a psychologist and a patient.'}));
        const resp=await fetch(waCfg().url+'/scribe',{method:'POST',body:fd,signal:AbortSignal.timeout(90000)});
        const j=await resp.json().catch(()=>({}));
        if(!resp.ok||!j.ok)throw new Error(j.error||'Transcription error '+resp.status);
        if(ta){ta.value+=(ta.value&&!/\s$/.test(ta.value)?'\n\n':'')+j.transcript;}
        if(ss)ss.textContent='Done. Read the transcript and correct anything before saving.';
      }catch(e){if(ss)ss.textContent=/fetch|network|TypeError/i.test(e.message+e.name)?'Could not reach the transcription service. Type the transcript below.':e.message;}
      finally{if(bb){bb.disabled=false;bb.textContent='Record more';}}
    };
    r.start(1000);b.textContent='Stop recording';s.textContent='Recording… press Stop when the session ends';
  };
  window.pgSessionSave=function(){
    const t=((($('pgTx')||{}).value)||'').trim();
    if(!t){toast('The transcript is empty');return;}
    stopRec();
    try{psyTherapyPage();}catch(e){}
    const x=px();if(!x.th||!x.th.ind){toast('Could not save here. Open the patient first.');return;}
    x.th.ind.unshift({date:fmtToday(),by:signer(),modality:'Session (transcript)',mins:'',note:'Transcript saved. Write the progress note from it.',plan:'',transcript:t});
    closeModal();render();toast('Session transcript saved by '+signer());
  };
  window.pgTxView=function(i){
    const e=((px().th||{}).ind||[]).filter(r=>r.transcript)[i];if(!e)return;
    V3.modal('Session transcript · '+hesc(e.date),hesc(e.by),`<div style="white-space:pre-wrap;max-height:55vh;overflow:auto;font-size:14.5px;line-height:1.55">${hesc(e.transcript)}</div>`,`<button class="btn" onclick="closeModal()">Close</button>`);
  };
  const therapyBits=v=>{
    const add=v.querySelector('button[onclick^="psyThAdd"]');
    if(add&&!v.querySelector('.pg-start')&&(S.thTab||'ind')==='ind'){
      const b=document.createElement('button');b.className='pg-add pg-start';b.style.marginRight='10px';b.innerHTML='<span class="pg-pl"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg></span>Start session';b.setAttribute('onclick','pgSession()');
      add.parentNode.insertBefore(b,add);
    }
    const sec=v.querySelector('.th9-tabs')&&v.querySelector('.th9-tabs').closest('section');
    if(sec&&!v.querySelector('#pgTxCard')&&(S.thTab||'ind')==='ind'){
      const L=((px().th||{}).ind||[]).filter(r=>r.transcript);
      if(L.length)sec.insertAdjacentHTML('afterend',`<section class="card" id="pgTxCard"><div class="hd"><h3>Session transcripts</h3><span class="tiny muted">Text only. No voice is stored.</span></div><div style="padding:0 16px 16px">${L.map((r,i)=>`<div class="row" style="justify-content:space-between;padding:8px 0;border-top:1px solid var(--line)"><span>${hesc(r.date)} · ${hesc(r.by)}</span><button class="btn sm" onclick="pgTxView(${i})">View transcript</button></div>`).join('')}</div></section>`);
    }
  };

  const __r=render;
  render=function(){
    const out=__r.apply(this,arguments);
    if(me()){try{const v=$('view');if(v){mergeVitals(v);fixHandover(v);therapyBits(v);}}catch(e){}}
    return out;
  };
})();
