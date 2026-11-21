/* 21 Nov 2026, Trello backlog.
   1. "Cancel button / completing the task on deep dive pop up should open this on dashboard" (psychiatrist, floor lead psychiatrist):
      a pop-up opened from the eye window (daily note, rounds, review, action taken) goes back to the eye window of that patient
      when it is cancelled, closed or saved. Not when it leaves the dashboard (Open full record).
   2. "Remove this red box items" (Admission, treatment chart step): the "What the risk is for" drop-down is removed
      (the risk of harm to others and of suicide or self-harm stay). Every role that sees the admission form. */
(function(){
  const ROLE=String((window.__TULASI__||{}).role||'');
  const DOC=/^(psychiatrist|floor-lead-psychiatrist)$/.test(ROLE);

  /* ---------- 1. back to the eye window ---------- */
  if(DOC){
    let eyePid=null,shown=false,back=null,lastEye=null;
    const open=()=>{const s=document.getElementById('scrim');return !!(s&&s.classList.contains('show'));};
    const wrapEye=()=>{
      const e=window.psyEye;
      if(typeof e==='function'&&!e.__back){window.psyEye=function(pid){const r=e.apply(this,arguments);eyePid=pid;shown=open();back=null;return r;};
        Object.keys(e).forEach(k=>{if(k.indexOf('__')===0)window.psyEye[k]=e[k];});window.psyEye.__back=1;}
      /* every pop-up that can be opened from inside the eye window */
      ['psyPopNote','psyEyePop','psyActionTaken','psyReview','psyCallFam'].forEach(n=>{
        const f=window[n];if(typeof f!=='function'||f.__back)return;
        /* the eye buttons close the eye window first, then open the pop-up: "from the eye" = the eye is open or closed a moment ago */
        window[n]=function(){const from=(shown&&open())||(lastEye&&Date.now()-lastEye.t<400)?eyePid:null;lastEye=null;const r=f.apply(this,arguments);if(from){back=from;shown=false;}return r;};
        Object.keys(f).forEach(k=>{if(k.indexOf('__')===0)window[n][k]=f[k];});window[n].__back=1;
      });
    };
    const __close=closeModal;
    closeModal=function(){
      const r=__close.apply(this,arguments);
      if(back){const pid=back,h=location.hash;back=null;
        setTimeout(()=>{if(location.hash!==h||open())return;try{window.psyEye(pid);}catch(e){}},120);}
      else{if(shown)lastEye={t:Date.now()};shown=false;}
      return r;
    };
    const __r=render;
    render=function(){const o=__r.apply(this,arguments);try{wrapEye();}catch(e){}return o;};
  }

  /* ---------- 2. no "What the risk is for" ---------- */
  const __r2=render;
  render=function(){
    const o=__r2.apply(this,arguments);
    try{const v=document.getElementById('view');if(v)v.querySelectorAll('label.field > .lbl').forEach(l=>{if(l.textContent.trim()==='What the risk is for')l.parentElement.remove();});}catch(e){}
    return o;
  };
})();
