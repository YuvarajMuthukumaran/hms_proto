
/* ---- WhatsApp messages (ported from Nikita's Tulasi-HMS-prototype) ----
   1. RMO shift report for the doctors' group, built from today's exceptions on the Handover page.
   2. Psychologist daily progress update for the family group, built from the saved daily note.
   "Send" posts to the Tulasi WhatsApp bridge, which sends through OpenWA; patient groups are named by UHID. */
const WA_ADMTAGS=['Attendant refused by family','Consent sent by family on WhatsApp','Phone allowed conditionally','Aggressive on arrival, injectables given','No family came with patient'];
const WA_CONF=['CONFIDENTIALITY NOTE:','This update is confidential and intended solely for the patient’s authorized caregivers. Please do not share or forward.'];
const waFmt=t=>hesc(t).replace(/\*([^*\n]+)\*/g,'<b>$1</b>');
const waWho=role=>{const n=signer();return n.toLowerCase().includes(role.toLowerCase())?n:n+' ('+role+')';};
const waDate=()=>new Date().toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short',year:'numeric'});
/* Real sending goes through this site's own /api (Vercel functions), which talk to OpenWA.
   No token is asked for or kept in the browser (owner's decision): the API accepts requests from the portal's own pages. */
const WA_DEF_URL=location.origin+'/api';
function waCfg(){return {url:WA_DEF_URL};}
async function waPost(p,body){
  /* card 142 (13 Nov): no network call at all in the demo. Real sending needs window.TULASI_LIVE_SEND === true, which is not set anywhere. */
  if(window.TULASI_LIVE_SEND!==true){toast('Demo mode: would send to the WhatsApp group. Nothing was sent.');return {ok:true,simulated:true};}
  const c=waCfg();
  let r;try{r=await fetch(c.url+p,{method:body?'POST':'GET',headers:{'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(45000)});}
  catch(e){throw new Error('WhatsApp bridge not running at '+c.url+'. Nothing was sent; use Copy for WhatsApp.');}
  const j=await r.json().catch(()=>({}));if(!r.ok||!j.ok)throw new Error(j.error||('Bridge error '+r.status));if(j.simulated)toast('Demo mode: this would be sent to the WhatsApp group. Nothing was sent.');return j;}
function waBusy(btn,on){if(!btn)return;btn.disabled=on;if(on){btn.dataset.l=btn.innerHTML;btn.innerHTML='Sending…';}else if(btn.dataset.l)btn.innerHTML=btn.dataset.l;}
function waCopy(text,okMsg){
  const bad=()=>{const ta=document.createElement('textarea');ta.value=text;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();
    let ok=false;try{ok=document.execCommand('copy');}catch(e){}ta.remove();toast(ok?okMsg:'Copy blocked by the browser. Select the preview text and copy it.');};
  try{navigator.clipboard.writeText(text).then(()=>toast(okMsg),bad);}catch(e){bad();}
}

/* ===== 1. RMO shift report ===== */
function waR(){return S.waR=S.waR||{adm:{},rnd:{},skip:{},sent:[]};}
const waAuto=()=>{const m=nowMin();return (m>=480&&m<1200)?'day':'night';};
function waShift(){return waR().shift||waAuto();}
function waEvents(){
  const st=waR(),wardOf={};rmoPts().forEach(r=>{wardOf[r.p.name]=r.k;});
  const secs=hoItems(),ev=[];
  secs[0][1].forEach(x=>ev.push({pn:x.pn,t:x.t,src:'From today’s exceptions'}));
  secs[1][1].forEach(x=>ev.push({pn:x.pn,t:x.t,src:'Referral'}));
  (S.hoNotes||[]).forEach(n=>ev.push({pn:n.pn,t:n.text,src:'Added by you · '+n.at}));
  return ev.map(e=>Object.assign(e,{id:e.pn+'|'+e.t,k:wardOf[e.pn]})).filter(e=>e.k&&!st.skip[e.id]);
}
function waAdmPts(){return rmoPts().filter(r=>r.p.day===0);}
function waRText(){
  const st=waR(),night=waShift()==='night',evs=waEvents(),adm=waAdmPts();
  const L=[night?"*Good Morning Sir and Ma'am*":"*Good evening Ma'am and Sir*",`${night?'Night report':'Day report'} · ${waDate()} · ${waWho('RMO')}`,''];
  adm.forEach(({p,k})=>{const d=st.adm[p.id]||{};
    L.push(`*New admission · ${k}*`,`Name- ${p.name}`,`Age - ${p.age} yrs`,`UHID - ${p.uhid}`,`C/O  ${d.co||'—'}`,`K/C/O  ${d.kco||'—'}`,`Vitals ${d.vit||'stable'}`);
    (d.tags||[]).forEach(x=>L.push(`*${x}`));if(d.note)L.push(`*${d.note}`);L.push('');});
  FLOORS.forEach(k=>{const fe=evs.filter(e=>e.k===k);if(!fe.length)return;L.push(`*${k}*`);fe.forEach(e=>L.push(`• pt ${e.pn}, ${e.t}`));L.push('');});
  L.push(evs.length||adm.length?'Rest all patients are stable':'All patients are stable');
  const rnd=evs.filter(e=>st.rnd[e.id]);
  if(rnd.length){L.push('','*For the morning round*');rnd.forEach(e=>L.push(`• pt ${e.pn} (${e.k}) · ${e.t}`));}
  return L.join('\n');
}
function waRPaint(){const el=$('waRPrev');if(el)el.innerHTML=waFmt(waRText());}
function waRSet(fn){fn(waR());render();}
function waRAdm(id,k,v){const st=waR();st.adm[id]=st.adm[id]||{};st.adm[id][k]=v;waRPaint();}
function waRTag(id,t){const st=waR();const d=st.adm[id]=st.adm[id]||{};const a=d.tags||[];d.tags=a.includes(t)?a.filter(x=>x!==t):a.concat(t);render();}
async function waRSend(btn){
  waBusy(btn,true);
  try{const r=await waPost('/send/doctors',{text:waRText(),by:signer(),kind:'rmo-'+waShift()});
    const st=waR();st.sent.unshift({at:clock(),by:signer(),shift:waShift(),group:r.groupName});render();toast(`Sent to "${r.groupName}" on WhatsApp from Tulasi's number`);}
  catch(e){waBusy(btn,false);toast(e.message);}}
function waRCard(){
  const st=waR(),sh=waShift(),evs=waEvents(),adm=waAdmPts();window.__waEv=evs;
  const tog=(k,l)=>`<button class="tog ${sh===k?'on':''}" onclick="waRSet(s=>s.shift='${k}')">${l}</button>`;
  const admH=adm.map(({p,k})=>{const d=st.adm[p.id]||{},vit=d.vit||'stable';
    return `<div class="wa-blk"><div class="row" style="justify-content:space-between;gap:8px"><div><strong>${p.name}</strong><div class="tiny muted">${p.age} yrs · ${p.room} · ${k} · admitted this shift</div></div>${chip('New admission','c-blue')}</div>
      <div class="wa-row2"><input class="input" placeholder="C/O · chief complaints" value="${hesc(d.co||'')}" oninput="waRAdm('${p.id}','co',this.value)"><input class="input" placeholder="K/C/O · known case of" value="${hesc(d.kco||'')}" oninput="waRAdm('${p.id}','kco',this.value)"></div>
      <div class="mini-chips">${['stable','not stable'].map(v=>`<button class="tog ${vit===v?'on':''}" onclick="waRSet(s=>{s.adm['${p.id}']=Object.assign(s.adm['${p.id}']||{},{vit:'${v}'})})">Vitals ${v}</button>`).join('')}</div>
      <div class="wa-tags">${WA_ADMTAGS.map((t,i)=>`<button class="tog ${(d.tags||[]).includes(t)?'on':''}" onclick="waRTag('${p.id}',WA_ADMTAGS[${i}])">${t}</button>`).join('')}</div>
      <input class="input" placeholder="Anything else for the doctors (optional)" value="${hesc(d.note||'')}" oninput="waRAdm('${p.id}','note',this.value)"></div>`;}).join('');
  const evH=evs.length?evs.map((e,i)=>{const on=!!st.rnd[e.id];return `<div class="wa-ev"><div class="grow"><div class="small"><strong>${e.pn}</strong> · ${hesc(e.k)}</div><div class="small">${hesc(e.t)}</div><div class="tiny muted">${hesc(e.src)}</div></div>
      <button class="tog ${on?'on':''}" onclick="waRSet(s=>{const id=__waEv[${i}].id;s.rnd[id]=!s.rnd[id]})">${on?'✓ For round':'For round'}</button><button class="x" aria-label="Leave out of the report" onclick="waRSet(s=>{s.skip[__waEv[${i}].id]=true})">×</button></div>`;}).join('')
    :'<div class="small muted">Nothing happened on your floors. The report will say all patients are stable.</div>';
  const nSkip=Object.keys(st.skip).length;
  const log=st.sent.length?`<div class="wa-log">${st.sent.map(x=>`Sent ${x.at} · ${x.shift==='night'?'night':'day'} report · by ${hesc(x.by)}`).join('<br>')}</div>`:'';
  return `<section class="card" id="waRCard"><div class="hd"><div><h3>RMO shift report ${chip('WhatsApp','c-green')}</h3><div class="small muted" style="margin-top:4px">Same format as the doctors' WhatsApp group. Only what happened, floor by floor. Everyone else is "stable".</div></div>
    <div class="mini-chips" role="group" aria-label="Shift">${tog('night','Night report · Good morning'+(waAuto()==='night'?' · your shift':''))}${tog('day','Day report · Good evening'+(waAuto()==='day'?' · your shift':''))}</div></div>
    <div class="wa-grid"><div class="wa-ed">
      ${adm.length?`<div><div class="tg" style="margin-bottom:8px">New admissions ${chip(String(adm.length),'c-blue')}</div><div class="wa-ed">${admH}</div></div>`:''}
      <div class="wa-blk"><h4>Events this shift · ${evs.length}</h4>${evH}${nSkip?`<button class="btn sm" style="align-self:flex-start" onclick="waRSet(s=>{s.skip={}})">Bring back ${nSkip} left out</button>`:''}<div class="tiny muted">Add more with "Add a note" in the handover sheet below; notes appear here too.</div></div>
    </div><div class="wa-side"><div class="row" style="justify-content:space-between"><strong>WhatsApp preview</strong><span class="tiny muted">${sh==='night'?'Night shift 8 pm to 8 am':'Day shift 8 am to 8 pm'}</span></div>
      <div class="wa-pv" id="waRPrev">${waFmt(waRText())}</div>
      <span class="tiny muted">Words between *stars* show in bold on WhatsApp.</span>
      <div class="wa-acts"><button class="btn wa-copy" onclick="waCopy(waRText(),'Copied. Paste it in the doctors\\u2019 WhatsApp group.')">Copy for WhatsApp</button><button class="btn pri" onclick="waRSend(this)">Send to doctors' group</button></div>
      ${log}</div></div></section>`;
}
const __waHo0=vHandover;vHandover=function(){const h=__waHo0();if(S.role!=='rmo')return h;const k=h.indexOf('<section class="card sheet">');return k<0?h+waRCard():h.slice(0,k)+waRCard()+h.slice(k);};

/* ===== 2. Psychologist daily progress update ===== */
const WA_HIST={neel:'The patient remained manageable under supervision throughout the day. He took his medicines with assistance and partially participated in activities. No other significant behavioural concerns were noted.'};
const waNorm=x=>(x||'').toLowerCase().replace(/\s+/g,' ').trim();
function waD(){return S.waD=S.waD||{};}
function waDText(kind,id){
  const p=allPts().find(x=>x.id===id)||{name:id,uhid:'',day:''},g=k=>psyGet(kind,id,k),v=x=>Array.isArray(x)?(x.length?x.join(', '):'—'):(x||'—');
  const L=['*TULASI HEALTHCARE – DAILY PATIENT PROGRESS UPDATE*','',`Patient: ${p.name} · UHID ${p.uhid}${p.day!==''?' · Day '+p.day:''}`,`Date: ${waDate()}`,`Reported by: ${waWho('Psychologist')}`,''];
  PSY_SECS.forEach((s,i)=>{L.push(`*${i+1}. ${s.t.toUpperCase()}*`);
    s.ks.forEach(k=>{if(k==='brief'||k==='evl')return;let t=v(g(k));if(k==='evy'&&g(k)==='Something happened'&&g('evl').trim())t=g('evl').trim();L.push(`${PSY_F[k].l}: ${t}`);});L.push('');});
  const b=g('brief').trim();
  L.push('*Brief Update:*',b||(kind==='dn'?famUpdate():'—'),'',WA_CONF[0],WA_CONF[1]);
  return L.join('\n');
}
function waDWarn(kind,id){const my=waNorm(psyGet(kind,id,'brief'));if(!my)return '';
  if(WA_HIST[id]&&waNorm(WA_HIST[id])===my)return 'This is the same text sent on the last 3 days. Families notice repeated updates. Write what was different today.';
  const same=PSY_EOD().filter(p=>p.id!==id&&waNorm(psyGet('eod',p.id,'brief'))===my).length;
  return same>=2?`This brief is word-for-word the same as ${same} other patients' updates today. Each family should get their own update.`:'';}
/* send one patient's update; records the result (sent or the error in plain words) and returns it */
async function waDSendCore(kind,id){
  const p=allPts().find(x=>x.id===id);if(!p||!p.uhid)return {ok:false,msg:'This patient has no UHID'};
  S.waErr=S.waErr||{};
  try{const r=await waPost('/send/patient',{uhid:p.uhid,text:waDText(kind,id),by:signer(),kind:'daily-update'});
    waD()[kind+':'+id]={at:clock(),by:signer(),group:r.groupName,created:r.created};delete S.waErr[kind+':'+id];if(kind==='dn')S.familySent=true;
    return {ok:true,msg:`${r.created?`Group "${r.groupName}" created and update sent`:`Sent to group "${r.groupName}"`}`};}
  catch(e){const m=/No phone numbers/.test(e.message)?'No WhatsApp numbers saved for this patient yet. Ask the admin to add the family numbers.':e.message;S.waErr[kind+':'+id]=m;return {ok:false,msg:m};}}
async function waDSend(kind,id,btn){
  waBusy(btn,true);const r=await waDSendCore(kind,id);render();toast(r.ok?r.msg+' on WhatsApp from Tulasi\'s number':r.msg);}
async function waSendAll(btn){
  const L=PSY_EOD().filter(p=>(S.eod[p.id]||{}).saved&&!waD()['eod:'+p.id]);if(!L.length){toast('Nothing waiting to send');return;}
  waBusy(btn,true);let ok=0;const bad=[];
  for(const p of L){if(btn)btn.innerHTML=`Sending ${ok+bad.length+1} of ${L.length}…`;const r=await waDSendCore('eod',p.id);r.ok?ok++:bad.push(p.name.split(' ')[0]);}
  render();toast(`${ok} sent on WhatsApp${bad.length?` · not sent: ${bad.join(', ')} (see the reason next to each name)`:''}`);}
function waDBlock(kind,id,draft){
  const s=waD()[kind+':'+id],w=waDWarn(kind,id),uhid=(allPts().find(x=>x.id===id)||{}).uhid||'';
  return `<div class="wa-side" style="position:static">${draft?`<div class="wa-warn">Draft preview. Save the note first, then send it to the patient's WhatsApp group (UHID ${hesc(uhid)}).</div>`:''}${w?`<div class="wa-warn">${hesc(w)}</div>`:''}<div class="wa-pv">${waFmt(waDText(kind,id))}</div>
    <div class="wa-acts"><button class="btn wa-copy" ${draft?'disabled':''} onclick="waCopy(waDText('${kind}','${id}'),'Copied. Paste it in the family WhatsApp chat.')">Copy for WhatsApp</button><button class="btn pri" ${s||draft?'disabled':''} onclick="waDSend('${kind}','${id}',this)">${s?'Sent':'Send to UHID group'}</button>${s?`<span class="wa-log">Sent ${s.at} · by ${hesc(s.by)} · group ${hesc(s.group||'')}${s.created?' (created)':''}</span>`:''}</div>
    </div>`;
}
const __waPd0=pDaily;pDaily=function(){const h=__waPd0();if(!isPsych())return h;
  const k=h.indexOf('<h3>Family update');if(k<0)return h;const e=h.indexOf('</section>',k);if(e<0)return h;
  const card=`<section class="card" id="waDCard"><div class="hd"><div><h3>WhatsApp progress update ${chip('Family group','c-green')}</h3><div class="small muted" style="margin-top:4px">Built from your note in the format families already get on WhatsApp. Sent to the patient's UHID group from Tulasi's number.</div></div></div>
    <div class="pad">${waDBlock('dn','neel',!S.dailySaved)}</div></section>`;
  return h.slice(0,e+10)+card+h.slice(e+10);};
/* after saving the daily note, bring the WhatsApp card into view */
const __psySaveWa=psySave;psySave=function(kind,id){__psySaveWa(kind,id);if(kind==='dn'&&S.dailySaved)setTimeout(()=>{const c=$('waDCard');if(c&&c.scrollIntoView)c.scrollIntoView({block:'start',behavior:'smooth'});},120);};
/* psychologist Daily notes page: the WhatsApp strip sits on top, so updates are sent right after the notes */
const __waEod0=psyEodPage;psyEodPage=function(){const h=__waEod0(),all=PSY_EOD(),sv=all.filter(p=>(S.eod[p.id]||{}).saved);
  const sent=sv.filter(p=>waD()['eod:'+p.id]),ready=sv.filter(p=>!waD()['eod:'+p.id]),err=S.waErr||{};
  const st=p=>{const s=waD()['eod:'+p.id],e=err['eod:'+p.id];return s?`<span class="wa-ok">✓ Sent ${hesc(s.at)} · by ${hesc(s.by)}</span>`:e?`<span class="wa-bad">Not sent: ${hesc(e)}</span>`:`<span class="wa-rdy">Ready to send</span>`;};
  const row=p=>{const s=waD()['eod:'+p.id];return `<div class="wa-row"><div class="grow"><strong>${p.name}</strong> <span class="tiny muted">${p.room} · UHID ${p.uhid}</span><div class="small">${st(p)}</div></div>
    <button class="btn sm" onclick="S.waOpen=S.waOpen==='${p.id}'?'':'${p.id}';render()">${S.waOpen===p.id?'Hide message':'See message'}</button>
    <button class="btn sm pri" ${s?'disabled':''} onclick="waDSend('eod','${p.id}',this)">${s?'Sent':'Send'}</button></div>${S.waOpen===p.id?`<div style="padding:0 0 12px">${waDBlock('eod',p.id)}</div>`:''}`;};
  const strip=`<section class="card wa-strip" id="waStrip"><div class="hd"><div><h3>WhatsApp updates to families</h3><div class="small muted" style="margin-top:4px">${sv.length?`${sent.length} of ${sv.length} sent · each saved note becomes the message for that patient's family group`:'Save a patient\'s note below and their WhatsApp update appears here, ready to send.'}</div></div>
    <div class="row" style="gap:8px">${ready.length?`<button class="btn pri" onclick="waSendAll(this)">Send all ${ready.length} ready</button>`:''}</div></div>
    ${sv.length?`<div class="pad" style="padding-top:4px">${sv.map(row).join('')}</div>`:''}</section>`;
  return strip+h;};

if(/^(handover|patient|notes)/.test((location.hash||'').slice(2)))render();
