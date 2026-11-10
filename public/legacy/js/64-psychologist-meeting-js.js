/* Psychologist only (10 Nov 2026), things the team asked for in the meeting audio that were still open:
   1. Handover page: the "handed over to you" card is only on Today (main page), not on the Handover page.
   2. No "Read only ..." notes in the psychologist's screens (the team: "you don't even have to mention that this is read only").
   3. Vitals: a "Show" drop-down to look at one vital (BP, pulse, temperature, weight, sleep) or all of them.
   4. Dictate next to the Therapy brief uses the same Groq transcription as Start session (record, then the words appear).
   Gated by S.role==='psychologist'. */
(function(){
  const me=()=>S.role==='psychologist';

  /* ---------- 3. Vitals: show one vital ---------- */
  const COLS=['All vitals','BP','Pulse','Temp','Weight','Sleep'];
  window.pgVitCol=function(v){S.pgVit=v;render();};
  const vitals=v=>{
    const sec=[...v.querySelectorAll('section.vm9')].find(s=>{const h=s.querySelector('h3');return h&&h.textContent.trim()==='Vitals';});
    if(!sec||sec.dataset.pgF)return;sec.dataset.pgF='1';
    const th=[...sec.querySelectorAll('thead th')];if(th.length<6)return;
    const cur=S.pgVit||'All vitals',hd=sec.querySelector('.hd');
    if(hd){
      const opts=COLS.map(c=>`<option ${c===cur?'selected':''}>${c}</option>`).join('');
      hd.insertAdjacentHTML('beforeend',`<label class="small" style="display:inline-flex;align-items:center;gap:8px;margin-left:auto"><span class="muted">Show</span><select class="input keep" style="min-height:34px;width:auto;padding:4px 30px 4px 12px" aria-label="Which vital to show" onchange="pgVitCol(this.value)">${opts}</select></label>`);
    }
    if(cur==='All vitals')return;
    const keep=th.findIndex((t,i)=>i>0&&t.textContent.trim().toLowerCase().startsWith(cur.toLowerCase()));
    if(keep<0)return;
    sec.querySelectorAll('tr').forEach(r=>[...r.children].forEach((c,i)=>{if(i!==0&&i!==keep)c.style.display='none';}));
  };

  /* ---------- 4. Dictate with the Groq transcription ---------- */
  let rec=null,stream=null,chunks=[],cancelled=false;
  const stopAll=()=>{try{if(rec&&rec.state==='recording'){cancelled=true;rec.stop();}}catch(e){}try{if(stream)stream.getTracks().forEach(t=>t.stop());}catch(e){}rec=null;stream=null;chunks=[];};
  const reset=b=>{if(b){b.classList.remove('live');b.disabled=false;b.textContent='Dictate';}};
  window.pgDictate=async function(id,btn){
    const ta=$(id);
    if(!ta||!navigator.mediaDevices||!window.MediaRecorder){toast('This browser cannot record. Type the brief instead.');return;}
    if(rec&&rec.state==='recording'){cancelled=false;rec.stop();btn.disabled=true;btn.textContent='Writing it down…';return;}
    try{stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true}});}
    catch(e){toast('Microphone blocked. Allow it for this site, or type the brief.');return;}
    const mime=['audio/webm;codecs=opus','audio/webm','audio/mp4'].find(t=>MediaRecorder.isTypeSupported(t))||'';
    chunks=[];cancelled=false;
    const r=rec=new MediaRecorder(stream,Object.assign({audioBitsPerSecond:24000},mime?{mimeType:mime}:{}));
    r.ondataavailable=e=>{if(e.data&&e.data.size)chunks.push(e.data);};
    r.onstop=async()=>{
      try{stream&&stream.getTracks().forEach(t=>t.stop());}catch(e){}
      const parts=chunks,type=(r.mimeType||'audio/webm').split(';')[0];chunks=[];rec=null;stream=null;
      const b=document.querySelector('.pg-dict');
      if(cancelled){reset(b);return;}
      try{
        const fd=new FormData();fd.append('audio',new Blob(parts,{type}),'brief.'+(type.includes('mp4')?'mp4':'webm'));
        fd.append('schema',JSON.stringify({mode:'transcript',hint:'Therapy brief written by a psychologist: what was worked on today.'}));
        const resp=await fetch(waCfg().url+'/scribe',{method:'POST',body:fd,signal:AbortSignal.timeout(90000)});
        const j=await resp.json().catch(()=>({}));
        if(!resp.ok||!j.ok)throw new Error(j.error||'Transcription error '+resp.status);
        const t=$(id);if(t){t.value+=(t.value&&!/\s$/.test(t.value)?' ':'')+j.transcript;t.dispatchEvent(new Event('input',{bubbles:true}));}
        toast('Dictation added. Check it.');
      }catch(e){toast(/fetch|network|TypeError/i.test(e.message+e.name)?'Could not reach the transcription service. Type the brief instead.':e.message);}
      finally{reset(document.querySelector('.pg-dict'));}
    };
    r.start(1000);btn.classList.add('live');btn.textContent='Stop dictating';
  };

  const __r=render;
  render=function(){
    const out=__r.apply(this,arguments);
    if(me()){try{
      const v=$('view');if(v){
        /* 1. no incoming-handover card on the Handover page */
        if(/^#\/handover/.test(location.hash||''))v.querySelectorAll('.hv-rc').forEach(x=>x.remove());
        /* 2. no "Read only ..." notes */
        v.querySelectorAll('.callout,.small.muted,.tiny.muted,.pg-ro').forEach(x=>{
          const t=(x.textContent||'').trim();
          if(/^read only\b/i.test(t)||/\bread only here\b/i.test(t))x.remove();
        });
        vitals(v);
      }
    }catch(e){}}
    return out;
  };
})();
