
/* ---- AI scribe on Rounds: records the round, sends it to /api/scribe (Groq), fills the draft for the doctor to review ----
   Uses the same site address and token as the WhatsApp connection. Nothing enters the record until the doctor confirms. */
let __scRec=null,__scChunks=[],__scTimer=null;
const SCRIBE_MAX_MS=15*60*1000;
function scribePt(){const R=S.rounds,WP=WARDS[R.ward];return WP[Math.min(R.idx[R.ward],WP.length-1)];}
listenRound=async function(){
  const R=S.rounds;if(R.scribing)return;
  if(R.listening){if(__scRec&&__scRec.state!=='inactive')__scRec.stop();return;}
  if(!navigator.mediaDevices||!window.MediaRecorder){toast('This browser cannot record. Type the round note instead.');return;}
  if(!waCfg().token){waCfgModal();toast('Paste the connection token once, then tap Start listening again');return;}
  let stream;try{stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true}});}
  catch(e){toast('Microphone blocked. Allow the microphone for this site, or type the round note.');return;}
  const mime=['audio/webm;codecs=opus','audio/webm','audio/mp4'].find(t=>MediaRecorder.isTypeSupported(t))||'';
  __scChunks=[];__scRec=new MediaRecorder(stream,Object.assign({audioBitsPerSecond:24000},mime?{mimeType:mime}:{}));
  __scRec.ondataavailable=e=>{if(e.data&&e.data.size)__scChunks.push(e.data);};
  __scRec.onstop=()=>{stream.getTracks().forEach(t=>t.stop());clearTimeout(__scTimer);R.listening=false;scribeUpload(new Blob(__scChunks,{type:(__scRec.mimeType||'audio/webm').split(';')[0]}));};
  __scRec.start(1000);R.listening=true;R.scribe=null;R.drafted=false;render();
  __scTimer=setTimeout(()=>{if(__scRec&&__scRec.state==='recording'){__scRec.stop();toast('Recording stopped at 15 minutes');}},SCRIBE_MAX_MS);
};
async function scribeUpload(blob){
  const R=S.rounds,p=scribePt();R.scribing=true;render();
  const meds=p.id==='neel'?S.meds.map(m=>m.name+' '+m.freq):[];
  const qs=new URLSearchParams({patient:p.name,dx:p.dx||'',meds:meds.join('|')}),c=waCfg();
  try{
    const r=await fetch(c.url+'/scribe?'+qs,{method:'POST',headers:{'Content-Type':blob.type||'audio/webm','X-Bridge-Token':c.token},body:blob,signal:AbortSignal.timeout(90000)});
    const j=await r.json().catch(()=>({}));if(!r.ok||!j.ok)throw new Error(j.error||'Scribe error '+r.status);
    R.scribe=Object.assign({},j,{pid:p.id,at:clock(),by:signer()});R.drafted=true;
    R.mc=(R.mc||[]).filter(x=>x.src!=='From scribe').concat(j.medChanges.map(m=>({act:m.act,text:m.text,src:'From scribe'})));
    toast('Draft ready. Review it before confirming.');
  }catch(e){toast(/fetch|network|TypeError/i.test(e.message+e.name)?'Could not reach the AI scribe. Type the round note instead.':e.message);}
  finally{R.scribing=false;render();}
}
function scribeEdit(){const R=S.rounds;if(R.scribe){R.scribeNote=R.scribe.note;render();const t=document.querySelector('textarea[placeholder="Type the round note here"]');if(t){t.focus();t.scrollIntoView({block:'center'});}}}
const __vRoundsSc=vRounds;vRounds=function(){
  let h=__vRoundsSc();const R=S.rounds,p=scribePt(),sc=R.scribe;
  if(R.scribing)h=h.replace(/<button class="btn pri" onclick="listenRound\(\)">[\s\S]*?<\/button>/,'<button class="btn" disabled><span class="rec"><i></i>Writing the note from the recording…</span></button>');
  else if(R.listening)h=h.replace('Listening… tap to stop','Recording the round… tap to stop and write the note');
  if(R.drafted&&sc&&sc.pid===p.id){
    const a=h.indexOf('<div><div class="lbl">Round note</div>'),b=h.indexOf('<div class="row" style="justify-content:flex-end"><button class="btn" onclick="toast(\'Opens the draft for editing\')">Edit draft</button>');
    if(a>=0&&b>a){
      const body=`<div><div class="lbl">Round note <span class="tiny muted" style="text-transform:none;letter-spacing:0">· AI draft from the recording, ${hesc(sc.at)} · check before confirming</span></div><div class="note small" style="margin-top:6px">${hesc(sc.note)}</div></div>
    <div><div class="lbl">Risk</div><div class="small" style="margin-top:4px">${hesc(sc.risk)}</div></div>
    ${sc.unclear&&sc.unclear.length?`<div class="wa-warn"><b>Check these, the scribe was not sure:</b> ${sc.unclear.map(hesc).join(' · ')}</div>`:''}
    ${sc.medChanges.length?`<div class="small muted">${sc.medChanges.length} medicine change${sc.medChanges.length>1?'s':''} added to Medicine below as "From scribe". Remove any that are wrong.</div>`:''}
    <div class="lbl">To-dos</div>
    ${sc.todos.length?sc.todos.map(t=>`<div class="box row"><span class="grow">${hesc(t.text)}</span><span class="tiny muted">${hesc(t.owner)}</span></div>`).join(''):'<div class="small muted">None mentioned</div>'}
    <details class="small"><summary style="cursor:pointer">What the scribe heard</summary><div class="note small" style="margin-top:6px;white-space:pre-wrap">${hesc(sc.transcript)}</div></details>
    `;
      h=h.slice(0,a)+body+h.slice(b).replace(`<button class="btn" onclick="toast('Opens the draft for editing')">Edit draft</button>`,'<button class="btn" onclick="listenRound()">Record again</button><button class="btn" onclick="scribeEdit()">Edit draft</button>');
    }
  }
  return h;};
