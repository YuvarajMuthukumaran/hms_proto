
/* ---- AI scribe for forms: one recorder popup for Dictate (daily notes), the therapy note and the detailed history.
   Records, sends the audio and the form's fields to /api/scribe, fills only what was said; the clinician reviews before saving. ---- */
let __sfRec=null,__sfChunks=[],__sfTimer=null,__sfTick=null;
const __sfClose=closeModal;
closeModal=function(){if(__sfRec&&__sfRec.state==='recording'){__sfRec._cancel=true;__sfRec.stop();}__sfClose();};
async function scribeForm(o){
  if(!navigator.mediaDevices||!window.MediaRecorder){toast('This browser cannot record. Fill the form by hand.');return;}
  
  let stream;try{stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true}});}
  catch(e){toast('Microphone blocked. Allow the microphone for this site, or fill the form by hand.');return;}
  const mime=['audio/webm;codecs=opus','audio/webm','audio/mp4'].find(t=>MediaRecorder.isTypeSupported(t))||'';
  __sfChunks=[];const rec=__sfRec=new MediaRecorder(stream,Object.assign({audioBitsPerSecond:24000},mime?{mimeType:mime}:{}));
  rec.ondataavailable=e=>{if(e.data&&e.data.size)__sfChunks.push(e.data);};
  const t0=Date.now();
  __sfClose();openModal(`<div class="mh"><h3>AI scribe · ${hesc(o.title)}</h3><button class="x" aria-label="Cancel recording" onclick="closeModal()">×</button></div>
   <div class="mb"><div class="row" style="gap:12px;align-items:center"><span class="rec"><i></i>Recording</span><b id="sfT" style="font-size:20px">0:00</b></div>
   <div class="small muted">Talk as you normally would. When you stop, the AI fills the form from what was said. You review everything before saving.</div></div>
   <div class="mf"><button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" id="sfStop" onclick="scribeFormStop()">Stop and fill the form</button></div>`);
  __sfTick=setInterval(()=>{const s=Math.floor((Date.now()-t0)/1000),e=$('sfT');if(e)e.textContent=Math.floor(s/60)+':'+String(s%60).padStart(2,'0');},500);
  rec.onstop=async()=>{
    stream.getTracks().forEach(t=>t.stop());clearInterval(__sfTick);clearTimeout(__sfTimer);
    if(rec._cancel){toast('Recording discarded');if(o.cancel)o.cancel();return;}
    const blob=new Blob(__sfChunks,{type:(rec.mimeType||'audio/webm').split(';')[0]});
    const b=$('sfStop');if(b){b.disabled=true;b.innerHTML='<span class="rec"><i></i>Filling the form…</span>';}
    try{
      const fd=new FormData();fd.append('audio',blob,'recording.'+(blob.type.includes('mp4')?'mp4':'webm'));
      fd.append('schema',JSON.stringify({form:o.form,context:o.context,fields:o.fields}));
      const c=waCfg(),r=await fetch(c.url+'/scribe',{method:'POST',body:fd,signal:AbortSignal.timeout(90000)});
      const j=await r.json().catch(()=>({}));if(!r.ok||!j.ok)throw new Error(j.error||'Scribe error '+r.status);
      __sfClose();const n=Object.keys(j.values).length;o.apply(j.values,j);
      toast(n?`Filled ${n} of ${o.fields.length} from the recording${j.unclear.length?'. Check: '+j.unclear.join('; '):''}. Review before saving.`:'Nothing in the recording matched this form. Fill it by hand.');
    }catch(e){__sfClose();if(o.cancel)o.cancel();toast(/fetch|network|TypeError/i.test(e.message+e.name)?'Could not reach the AI scribe. Fill the form by hand.':e.message);}
  };
  rec.start(1000);__sfTimer=setTimeout(scribeFormStop,15*60*1000);
}
function scribeFormStop(){if(__sfRec&&__sfRec.state==='recording')__sfRec.stop();}

/* 1. psychologist daily note (Dictate) */
psyDictate=function(kind,id){
  const p=allPts().find(x=>x.id===id)||{};
  const fields=Object.keys(PSY_F).map(k=>{const f=PSY_F[k];return {key:k,label:f.l,type:f.t?'text':f.m?'many':'one',options:f.t?undefined:f.o.map(x=>x[0])};});
  scribeForm({title:'Daily note · '+(p.name||''),form:'Psychologist daily note',context:p.name,fields,apply:v=>{
    Object.keys(v).forEach(k=>psySet(kind,id,k,v[k]));if(v.evl&&!v.evy)psySet(kind,id,'evy','Something happened');
    if(S.psyPin)delete S.psyPin[psyCtx(kind,id)];psyRepaint(kind,id);}});
};
/* 2. psychiatrist daily note (Dictate) */
dnDictate=function(){
  const sp=dnSpec(),fields=[];
  sp.groups.forEach(g=>g[2].forEach(([k,l,opts,multi])=>fields.push({key:k,label:l,type:(opts==='text'||opts==='area')?'text':multi?'many':'one',options:Array.isArray(opts)?opts:undefined})));
  scribeForm({title:'Daily note · Neel Bose',form:isPsych()?'Psychologist daily note':'Psychiatrist daily note',context:'Neel Bose',fields,apply:v=>{
    S.dn=S.dn||{};fields.forEach(f=>{if(v[f.key]===undefined)return;S.dn[f.key]=f.type==='one'?[v[f.key]]:v[f.key];});render();}});
};
/* 3. individual therapy note: opens blank; Record session fills it; Sign saves what is in the fields */
const TH_DUR=['30 minutes','45 minutes','60 minutes'];
therapyModal=function(v){v=v||{};const today=new Date().toLocaleDateString('en-IN',{day:'numeric',month:'short'})+', '+clock();
  __sfClose();openModal(`<div class="mh"><h3>Individual therapy note</h3><button class="x" aria-label="Close" onclick="closeModal()">×</button></div>
 <div class="mb"><div class="callout ${v._ai?'blue':'grey'}">${v._ai?'Drafted by the AI scribe from the session recording. Review every field; nothing enters the record until you sign.':'Tap <b>Record session</b> and the AI scribe drafts this note from the session, or type it yourself.'}</div>
 <div class="row" style="justify-content:flex-start"><button class="btn ${v._ai?'':'pri'}" onclick="thRecord()">${icon.mic} ${v._ai?'Record again':'Record session'}</button></div>
 <div class="grid2"><label class="field"><span class="lbl">Date and time</span><input class="input" id="thW" value="${hesc(v.when||today)}"></label><label class="field"><span class="lbl">Duration</span><select class="input" id="thD">${TH_DUR.map(d=>`<option ${(v.dur||'45 minutes')===d?'selected':''}>${d}</option>`).join('')}</select></label></div>
 <label class="field"><span class="lbl">Aim of the intervention</span><input class="input" id="thA" value="${hesc(v.aim||'')}"></label>
 <label class="field"><span class="lbl">Intervention</span><textarea class="input" id="thI">${hesc(v.iv||'')}</textarea></label>
 <label class="field"><span class="lbl">Outcome</span><textarea class="input" id="thO">${hesc(v.out||'')}</textarea></label>
 <label class="field"><span class="lbl">Plan for next session</span><input class="input" id="thP" value="${hesc(v.plan||'')}"></label>
 <div id="thE" class="small" style="color:var(--red);display:none">Write the aim and the intervention first</div></div>
 <div class="mf"><button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="thSign()">Sign note</button></div>`);};
function thVals(){return {when:$('thW').value,dur:$('thD').value,aim:$('thA').value.trim(),iv:$('thI').value.trim(),out:$('thO').value.trim(),plan:$('thP').value.trim()};}
function thRecord(){const keep=thVals();
  scribeForm({title:'Therapy session · Neel Bose',form:'Individual therapy note',context:'Neel Bose, individual psychology session',
    fields:[{key:'aim',label:'Aim of the intervention',type:'text'},{key:'iv',label:'Intervention (what was done in the session)',type:'text'},{key:'out',label:'Outcome (how the patient responded)',type:'text'},{key:'plan',label:'Plan for next session',type:'text'},{key:'dur',label:'Duration',type:'one',options:TH_DUR}],
    apply:v=>therapyModal(Object.assign({},keep,v,{_ai:true})),cancel:()=>therapyModal(keep)});}
function thSign(){const v=thVals();if(!v.aim||!v.iv){$('thE').style.display='block';return;}
  const d=v.when.split(',')[0].trim();
  S.therapyNotes.unshift({d,wk:2,t:'Individual session · '+v.aim,by:signer(),body:`Aim: ${v.aim}. Duration ${v.dur}. Intervention: ${v.iv}${v.out?' Outcome: '+v.out:''}${v.plan?' Next: '+v.plan:''}`});
  S.psychRows[1].done=String((+S.psychRows[1].done||0)+1);S.done.ther=true;__sfClose();render();toast('Note signed by '+signer()+'. Sessions done updated in the psychology plan.');}
/* 4. detailed history: fills the sections this clinician owns; unspoken fields stay empty for them to complete */
scribeHistory=function(){
  const mine=w=>w==='both'||(w==='psy'?isPsy():isPsych()),fields=[],lab={};
  HIST.filter(s=>mine(s.who)).forEach(s=>s.f.forEach(([l,ty,op],i)=>{const key=s.k+'_'+i;lab[key]=l;fields.push({key,label:s.t+' · '+l,type:ty==='o'?'one':(ty==='m'||ty==='ap')?'many':'text',options:Array.isArray(op)?op:undefined});}));
  scribeForm({title:'Detailed history · Neel Bose',form:'Psychiatric history and evaluation (Tulasi)',context:'Neel Bose, 23, male, admitted for bipolar affective disorder, manic',fields,apply:v=>{
    Object.keys(lab).forEach(k=>{delete HDRAFT[lab[k]];});Object.keys(v).forEach(k=>{HDRAFT[lab[k]]=v[k];});
    S.historyDraft=true;S.hview='form';render();}});
};
/* history form: show "pick any" answers from the draft as selected */
const __fldSc=fld;fld=function(f,ro){let h=__fldSc(f,ro);const [l,ty]=f,v=S.historyDraft?HDRAFT[l]:null;
  if((ty==='m'||ty==='ap')&&Array.isArray(v))v.forEach(o=>{h=h.replace(new RegExp('class="tog( ap)?"([^>]*)>'+String(o).replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'</button>'),'class="tog$1 on"$2>'+o+'</button>');});
  return h;};
