/* 16 Nov 2026: Therapy Plans (psychologist) - the "Start AI scribe" button is back, left of "New session note".
   It had been attached to the old Add button; "New session note" (block 77/82) replaced that button, so the scribe button stopped appearing.
   Pressing it records the session and fills the one-line summary of a new session note (the clinician checks and signs it).
   On real patients the AI scribe stays off until patient consent and a data agreement are in place: the button explains that and records nothing. */
(function(){
  if(String((window.__TULASI__||{}).role||'')!=='psychologist')return;
  const MIC='<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>';
  window.pgStartScribe=function(){
    if(window.__realMode){toast('The AI scribe is off for real patients until patient consent and a data agreement are in place. Nothing was recorded.');return;}
    if(typeof scribeForm!=='function'||typeof snOpen!=='function')return;
    const p=(window.ptFind&&ptFind(S.pid))||{name:''};
    scribeForm({title:'Session note · '+p.name,form:'Therapy session: one-line summary of the session',context:p.name+', therapy session',
      fields:[{key:'summary',label:'One-line summary of the session',type:'text'}],
      apply:v=>{snOpen(S.pid,'ind',{summary:String(v.summary||'')});},cancel:()=>{}});
  };
  function place(){
    document.querySelectorAll('button[onclick="snOpen(S.pid,\'ind\')"]').forEach(b=>{
      const prev=b.previousElementSibling;
      if(prev&&prev.classList.contains('pg-scribe'))return;
      const s=document.createElement('button');s.type='button';s.className='btn sm th10-rec pg-scribe';s.style.marginRight='10px';
      s.setAttribute('onclick','pgStartScribe()');s.setAttribute('aria-label','Start the AI scribe');
      s.innerHTML='<span class="rc-ic" aria-hidden="true">'+MIC+'<span class="rc-bars"><i></i><i></i><i></i><i></i></span></span><span>Start AI scribe</span>';
      b.parentNode.insertBefore(s,b);
    });
  }
  const __r=render;
  render=function(){const x=__r.apply(this,arguments);try{place();}catch(e){}return x;};
  setTimeout(()=>{try{place();}catch(e){}},300);
})();
