/* 16 Nov 2026: Add "Start AI scribe" button to Group and Family tabs in Therapy Plans,
   matching the button that already exists on the Individual tab (106-therapy-scribe-button-16nov-js.js).
   Pressing it records the session and prefills the structured note via scribeForm.
   On real patients the button explains that the scribe is off until consent is in place. */
(function(){
  if(String((window.__TULASI__||{}).role||'')!=='psychologist')return;
  const MIC='<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>';
  const BTN_HTML='<span style="display:flex;align-items:center;gap:6px">'+MIC+'Start AI scribe</span>';

  /* Group: records the group session and prefills the structured note */
  window.pgStartScribeGrp=function(){
    if(window.__realMode){toast('The AI scribe is off for real patients until patient consent and a data agreement are in place. Nothing was recorded.');return;}
    if(typeof scribeForm!=='function'||typeof snOpen!=='function')return;
    const p=(window.ptFind&&ptFind(S.pid))||{name:''};
    scribeForm({title:'Group session · '+p.name,form:'Group therapy session note',context:p.name+', group therapy session',
      fields:[
        {key:'summary',label:'One-line summary of the session',type:'text'},
        {key:'gt',label:'Group type',type:'one',options:['Anxiety and stress group','Relapse prevention group','Social skills group','Psychoeducation group','CBT group','Other']},
        {key:'response',label:"Patient's response and participation",type:'text'}
      ],
      apply:v=>{snOpen(S.pid,'grp',{summary:String(v.summary||''),gt:v.gt,response:v.response});},
      cancel:()=>{}});
  };

  /* Family: records the family session and prefills the structured note */
  window.pgStartScribeFam=function(){
    if(window.__realMode){toast('The AI scribe is off for real patients until patient consent and a data agreement are in place. Nothing was recorded.');return;}
    if(typeof scribeForm!=='function'||typeof snOpen!=='function')return;
    const p=(window.ptFind&&ptFind(S.pid))||{name:''};
    scribeForm({title:'Family session · '+p.name,form:'Family therapy note',context:p.name+', family counselling session',
      fields:[
        {key:'summary',label:'One-line summary of the session',type:'text'},
        {key:'who',label:'Who attended',type:'text'},
        {key:'purpose',label:'Purpose',type:'one',options:['Education','Conflict resolution','Boundaries','Relapse planning','Discharge prep','Other']},
        {key:'outcome',label:'Outcome',type:'text'}
      ],
      apply:v=>{snOpen(S.pid,'fam',{summary:String(v.summary||''),who:v.who,purpose:v.purpose,outcome:v.outcome});},
      cancel:()=>{}});
  };

  /* Inject the scribe button before the Group / Family action buttons after each render */
  function place(){
    /* Group tab: button targets tpAttend or snOpen(...,'grp') */
    document.querySelectorAll(
      'button[onclick*="tpAttend"], button[onclick*="snOpen(S.pid,\'grp\')"]'
    ).forEach(b=>{
      const prev=b.previousElementSibling;
      if(prev&&prev.classList.contains('pg-scribe-grp'))return;
      const s=document.createElement('button');
      s.type='button';
      s.className='btn sm pg-scribe-grp';
      s.style.marginRight='8px';
      s.setAttribute('onclick','pgStartScribeGrp()');
      s.setAttribute('aria-label','Start the AI scribe for group session');
      s.innerHTML=BTN_HTML;
      b.parentNode.insertBefore(s,b);
    });

    /* Family tab: button targets snOpen(...,'fam') or Start family session */
    document.querySelectorAll(
      'button[onclick*="snOpen(S.pid,\'fam\')"]'
    ).forEach(b=>{
      const prev=b.previousElementSibling;
      if(prev&&prev.classList.contains('pg-scribe-fam'))return;
      const s=document.createElement('button');
      s.type='button';
      s.className='btn sm pg-scribe-fam';
      s.style.marginRight='8px';
      s.setAttribute('onclick','pgStartScribeFam()');
      s.setAttribute('aria-label','Start the AI scribe for family session');
      s.innerHTML=BTN_HTML;
      b.parentNode.insertBefore(s,b);
    });
  }

  const __r=render;
  render=function(){const x=__r.apply(this,arguments);try{place();}catch(e){}return x;};
  setTimeout(()=>{try{place();}catch(e){}},300);
})();
