/* 20 Nov 2026, meeting with Dr. Anu and Nikita (recording 20 Nov). "Drafts from one recording" (AI scribe).
   Psychiatrist, floor lead psychiatrist, psychologist, floor lead psychologist (the roles that have the scribe).
   1. One recording fills the page you are on, and only that page: every patient tab from Stay summary to Discharge summary has the
      button, and "Fill this page" sends the empty fields of the open page (their labels and choices) with the transcript.
      Fields that already have text are left as they are; tick boxes and sign-offs are never filled. Filled fields are marked
      "Filled by the AI scribe: check it" until you edit them. Nothing is saved until the page's own save or sign.
   2. English only: the transcript and every filled answer come back in English, whether the conversation was in Hindi, English or
      both (server: api/scribe.js uses Whisper translation and an English check). The Hindi family update draft is gone.
   3. After it is used, a pop-up says where the recording and the text went and what is kept. */
(function(){
  const ROLE=String((window.__TULASI__||{}).role||'');
  if(!/^(psychiatrist|floor-lead-psychiatrist|psychologist|floor-lead-psychologist)$/.test(ROLE))return;
  const E=s=>hesc(String(s==null?'':s));
  const $id=id=>document.getElementById(id);
  const route=()=>{const m=String(location.hash||'').match(/^#\/patient\/([^/?]+)(?:\/([^/?]+))?/);return m?{pid:decodeURIComponent(m[1]),tab:m[2]||'overview'}:null;};
  const pt=pid=>{try{return ptFind(pid)||{};}catch(e){return {};}};
  const api=()=>{try{return waCfg().url;}catch(e){return '/api';}};

  const css=document.createElement('style');css.id='m20-scribe-css';
  css.textContent=
    '.m20-ai{outline:2px solid #7a5af8!important;outline-offset:1px;background:#f6f3ff!important}'+
    '.m20-ait{display:block;font-size:11.5px;font-weight:700;color:#5925dc;margin-top:3px}'+
    '.m20-note{position:fixed;inset:0;background:rgba(16,24,40,.45);z-index:10050;display:flex;align-items:center;justify-content:center;padding:16px}'+
    '.m20-note>div{background:#fff;border-radius:16px;max-width:560px;width:100%;padding:20px 22px;box-shadow:0 20px 50px rgba(16,24,40,.25);display:flex;flex-direction:column;gap:10px;font-size:14px;line-height:1.5}'+
    '.m20-note h3{margin:0;font-size:17px}.m20-note ul{margin:0;padding-left:20px;display:flex;flex-direction:column;gap:6px}';
  document.head.appendChild(css);

  /* ---------- the page's fillable fields ---------- */
  const SKIP=el=>!!el.closest('#modal,.modal,.dph,.subtabs,.m20-tabs,#m20Role,.m20-note,nav,header,#side,.sgtabs,[data-noai]');
  const vis=el=>!!(el.offsetParent||el.getClientRects().length);
  function labelOf(el){
    const t=x=>String(x||'').replace(/\s+/g,' ').trim();
    const f=el.closest('label.field,.field');let l=f?t((f.querySelector('.lbl,.tiny')||{}).textContent):'';
    if(!l)l=t(el.getAttribute('aria-label'))||t(el.placeholder);
    /* a drop-down without a label says what it is in its first, empty choice ("Frequency", "With food?") */
    if(!l&&el.tagName==='SELECT'&&el.options.length&&el.options[0].value==='')l=t(el.options[0].textContent).replace(/…$/,'');
    if(!l){const prev=el.previousElementSibling;if(prev&&prev.tagName!=='SELECT'&&prev.textContent)l=t(prev.textContent).slice(0,80);}
    const med=el.closest('.m20-med');if(med){const b=med.querySelector('b');if(b)l=t(b.textContent)+': '+(l||'note');}
    const card=el.closest('section.card,.tn-q,.card');const h=card?t((card.querySelector('h3,.tn-qh')||{}).textContent):'';
    return (h&&l.indexOf(h)<0?h+' > ':'')+(l||'Field');
  }
  function collect(){
    const v=$id('view');if(!v)return [];
    const out=[];
    v.querySelectorAll('textarea,input,select').forEach(el=>{
      if(SKIP(el)||!vis(el)||el.disabled||el.readOnly)return;
      if(el.tagName==='INPUT'&&!/^(text|search|)$/.test(String(el.getAttribute('type')||'').toLowerCase()))return;
      if(el.tagName==='INPUT'&&/search|type a name|find/i.test(el.placeholder||''))return;
      const label=labelOf(el);
      if(/sign(ing|ed)? (psychiatrist|by)|signature|pin\b/i.test(label))return;
      if(el.tagName==='SELECT'){
        if(el.value)return;
        const opts=[...el.options].filter(o=>o.value!==''&&!/^choose|^select|…$/i.test(o.textContent.trim())).map(o=>o.textContent.trim());
        if(!opts.length||opts.length>40)return;
        out.push({el,key:'f'+out.length,label,type:'one',options:opts});
      }else{
        if(String(el.value||'').trim())return;
        out.push({el,key:'f'+out.length,label,type:'text'});
      }
    });
    return out.slice(0,80);
  }
  const pageName=()=>{const v=$id('view');const on=v&&v.querySelector('.subtabs .on, .subtabs [aria-selected="true"]');const inner=v&&v.querySelector('.m20-tab.on');const a=on?on.textContent.trim():'',b=inner?inner.textContent.replace(/\d+\/\d+$/,'').trim():'';return (a&&b&&a.toLowerCase()!==b.toLowerCase()?a+' > '+b:(a||b))||'Patient record';};

  /* ---------- fill ---------- */
  function mark(el){
    el.classList.add('m20-ai');
    const host=el.closest('label.field,.field')||el.parentElement;
    if(host&&!host.querySelector('.m20-ait'))host.insertAdjacentHTML('beforeend','<span class="m20-ait">Filled by the AI scribe: check it</span>');
    const clear=()=>{el.classList.remove('m20-ai');const t=host&&host.querySelector('.m20-ait');if(t)t.remove();el.removeEventListener('input',clear);};
    setTimeout(()=>el.addEventListener('input',clear),0);
  }
  window.m20FillPage=async function(pid){
    const t=(($id('scTx')||{}).value||'').trim(),st=$id('m20FillS');
    const say=s=>{if(st)st.textContent=s;};
    if(t.length<20){toast('Record or type the conversation first');return;}
    if(!(($id('scC')||{}).checked)){toast('Consent for recording is needed');return;}
    const F=collect();
    if(!F.length){say('Every field on this page already has text, or there is nothing to fill here.');return;}
    say('Filling '+F.length+' empty field'+(F.length>1?'s':'')+' on '+pageName()+'…');
    let j=null;
    try{
      const p=pt(pid);
      const r=await fetch(api()+'/scribe',{method:'POST',headers:{'Content-Type':'application/json'},signal:AbortSignal.timeout(60000),
        body:JSON.stringify({mode:'fill',transcript:t,form:pageName(),context:'Patient diagnosis: '+(p.dx||'not given')+'. Clinician: '+ROLE.replace(/-/g,' ')+'.',fields:F.map(f=>({key:f.key,label:f.label,type:f.type,options:f.options}))})});
      j=await r.json().catch(()=>({}));
      if(!r.ok||!j.ok)throw new Error(j.error||('Error '+r.status));
    }catch(e){say(/fetch|network|TypeError|abort/i.test(String(e.message)+e.name)?'Could not reach the AI service. Nothing was filled.':String(e.message));return;}
    const vals=j.values||{};let n=0;
    /* text first (typing does not redraw the page), then choices one by one (a choice can redraw the page, so each is found again) */
    F.filter(f=>f.type==='text'&&vals[f.key]).forEach(f=>{if(!document.body.contains(f.el)||String(f.el.value||'').trim())return;f.el.value=String(vals[f.key]);f.el.dispatchEvent(new Event('input',{bubbles:true}));mark(f.el);n++;});
    for(const f of F.filter(x=>x.type==='one'&&vals[x.key])){
      let el=f.el;if(!document.body.contains(el)){el=collect().find(x=>x.label===f.label&&x.type==='one');el=el&&el.el;}
      if(!el||el.value)continue;
      const o=[...el.options].find(o=>o.textContent.trim()===vals[f.key]);if(!o)continue;
      el.value=o.value;el.dispatchEvent(new Event('change',{bubbles:true}));n++;
      await new Promise(r=>setTimeout(r,60));
      const again=collect().find(x=>x.label===f.label);if(again)mark(again.el);else if(document.body.contains(el))mark(el);
    }
    const un=(j.unclear||[]).filter(Boolean);
    say(n?`${n} field${n>1?'s':''} filled on ${pageName()}. Check each one (marked in purple) before you save or sign.${un.length?' Not clear in the recording: '+un.join('; ')+'.':''}`:'The conversation did not answer any empty field on this page. Nothing was filled.');
    if(n)toast(n+' field'+(n>1?'s':'')+' filled from the recording. Check them before saving.');
    notice();
  };

  /* ---------- where the data went ---------- */
  function notice(){
    if(document.querySelector('.m20-note'))return;
    const d=document.createElement('div');d.className='m20-note';d.setAttribute('role','dialog');d.setAttribute('aria-modal','true');
    d.innerHTML=`<div><h3>Where this recording went</h3><ul>
      <li>The <b>audio</b> was sent to the AI service (Groq, USA) only to turn it into English text. The portal does not save the audio anywhere.</li>
      <li>The <b>text</b> was sent to the same service to write the drafts or fill this page. The portal's server keeps no copy; it logs only how many words and fields there were.</li>
      <li>The transcript stays in this window until you close it. It is not saved in the patient record.</li>
      <li>Only what you check and then <b>save or sign</b> on the page is stored, in the patient's record (Tulasi database, Mumbai), with your name and the time.</li></ul>
      <div class="row" style="justify-content:flex-end"><button class="btn pri" onclick="this.closest('.m20-note').remove()">OK, understood</button></div></div>`;
    document.body.appendChild(d);
    const b=d.querySelector('button');if(b)b.focus();
  }
  window.m20ScribeNotice=notice;

  /* ---------- the drafts window ---------- */
  function wrap(){
    const o=window.auScribe;if(typeof o!=='function'||o.__m20)return;
    window.auScribe=function(pid){
      const r=o.apply(this,arguments);
      try{
        const m=$id('modal');if(!m)return r;
        const sub=[...m.querySelectorAll('*')].find(e=>e.children.length===0&&/^One recording gives/.test((e.textContent||'').trim()));
        if(sub)sub.textContent='Speak Hindi, English or both: everything comes back in English. Fill this page fills only the open page; Make the drafts writes a note and a family update. Everything is a draft you check.';
        const tx=$id('scTx');
        if(tx&&!$id('m20FillB')){
          tx.placeholder='Transcript (always in English, even if you spoke Hindi). You can also type or paste it.';
          tx.insertAdjacentHTML('afterend',`<div class="row" style="gap:10px;align-items:center;margin-top:10px;flex-wrap:wrap"><button class="btn pri" id="m20FillB" onclick="m20FillPage('${String(pid).replace(/'/g,"\\'")}')">Fill this page</button><span class="small muted" id="m20FillS">Fills only the empty fields on ${E(pageName())}. Nothing is saved until you save or sign.</span></div>`);
        }
        const mk=[...m.querySelectorAll('.mf button')].find(b=>/Make the drafts/.test(b.textContent));if(mk){mk.classList.remove('pri');mk.textContent='Make the drafts (note, family update)';}
        const h=m.querySelector('h3');if(h)h.textContent='Drafts from one recording · '+(pt(pid).name||'');
      }catch(e){}
      return r;
    };
    window.auScribe.__m20=1;
    const mk=window.auScribeMake;
    if(typeof mk==='function'&&!mk.__m20){window.auScribeMake=async function(){const r=await mk.apply(this,arguments);try{
        /* the Hindi family update is no longer drafted */
        const hi=$id('sc_familyHi');if(hi){const l=hi.closest('label.field');if(l)l.remove();}
        if(($id('scOut')||{}).innerText&&!/Making the drafts/.test($id('scOut').innerText))notice();}catch(e){}return r;};window.auScribeMake.__m20=1;}
  }
  wrap();

  /* ---------- the button on every patient tab ---------- */
  function button(){
    const rt=route();if(!rt)return;const v=$id('view');if(!v||v.querySelector('#auScribeBtn'))return;
    if(typeof window.auScribe!=='function')return;
    const b=document.createElement('button');b.id='auScribeBtn';b.className='btn';b.textContent='Drafts from one recording';
    b.style.cssText='margin:0 0 10px;width:auto;align-self:flex-start;display:inline-flex';b.onclick=()=>auScribe(rt.pid);
    const first=v.querySelector('section.card');first?first.parentNode.insertBefore(b,first):v.appendChild(b);
  }
  const __r=render;
  render=function(){const o=__r.apply(this,arguments);try{wrap();button();}catch(e){}return o;};
})();
