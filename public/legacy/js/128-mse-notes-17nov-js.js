/* 17 Nov 2026, Trello, Mental status examination:
   1. Add an optional text box under every question from Thought stream through Hallucinations, once any
      selection is made on that question (it stays optional -- nothing forces it open or required).
   2. The two Speech questions (intensity/pitch/reaction time/speed, and relevance/coherence/goal direction)
      share ONE such box between them, not one each.
   Psychiatrist and psychologist screens only. The note is kept in hf() under its own key so Read only and the
   AI summary can find it without touching the tag-picker's own storage. */
(function(){
  const isPsy=()=>/^(psychiatrist|psychologist)$/.test(String((window.__TULASI__||{}).role||''));
  if(!isPsy())return;
  const px=()=>psyPx(S.pid);
  const hf=()=>{const x=px();return x.hf=x.hf||{};};
  const css=document.createElement('style');css.id='mse-note-css';
  css.textContent='.mse-note{margin-top:8px;min-height:52px;width:100%}';
  document.head.appendChild(css);
  /* the exact question labels this covers, in form order; the two Speech ones share NOTE_KEY's box */
  const RANGE=['Thought stream','Thought possession','Formal thought disorder','Thought content','Delusions','Hallucinations'];
  const SPEECH=['Speech: intensity, pitch, reaction time, speed','Speech: relevance, coherence, goal direction'];
  const NOTE_KEY=l=>l+' · notes';
  window.mseNoteSet=function(key,v){hf()[key]=v;};
  function hasAnswer(hfEl){
    const sel=hfEl.querySelector('select.input');if(sel)return !!sel.value;
    const tags=hfEl.querySelector('.hf-tags');if(tags)return tags.children.length>0;
    const tog=hfEl.querySelector('.mini-chips .tog.on');if(tog)return true;
    return false;
  }
  function labelOf(hfEl){return ((hfEl.querySelector(':scope>.lbl')||{}).textContent||'').replace(/\s*\(.*?\)\s*$/,'').trim();}
  function place(){
    if(String(S.hsec||'')!=='mse')return;
    const els=[...document.querySelectorAll('#view .hwrap .hgrid>.hf')];
    let speechBox=null;
    els.forEach(el=>{
      const lbl=labelOf(el);
      const inRange=RANGE.includes(lbl),inSpeech=SPEECH.includes(lbl);
      if(!inRange&&!inSpeech)return;
      const key=inSpeech?NOTE_KEY('Speech'):NOTE_KEY(lbl);
      let box=el.querySelector('.mse-note');
      if(inSpeech){
        /* the second Speech question reuses the first one's box instead of making its own */
        if(speechBox){if(box)box.remove();return;}
      }
      if(!hasAnswer(el)){if(box)box.remove();return;}
      if(!box){
        box=document.createElement('textarea');
        box.className='input mse-note';box.placeholder='Notes (optional)';
        box.value=hf()[key]||'';
        box.oninput=function(){mseNoteSet(key,this.value);};
        el.appendChild(box);
      }
      if(inSpeech)speechBox=box;
    });
  }
  const __r=render;
  render=function(){const r=__r.apply(this,arguments);try{place();}catch(e){}return r;};
  /* psyMse (72) toggles its buttons' classes directly and does not call render(), so the note box
     would only show up on the next unrelated re-render without this */
  const __mse=window.psyMse;
  if(typeof __mse==='function'){
    window.psyMse=function(){const r=__mse.apply(this,arguments);try{place();}catch(e){}return r;};
  }
})();
