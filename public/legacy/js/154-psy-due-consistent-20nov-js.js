/* 20 Nov 2026, owner: the Today "Due today" lines and the eye pop-up must show the same things (psychologist and floor lead psychologist only).
   - The eye pop-up now also lists the assessments the doctor assigned (the Today table already did), each with Mark done.
   - The Today table was drawn before alerts raised a moment later by the automation (e.g. "Daily note not written", "Unsigned note")
     existed, so it listed fewer lines than the eye. It is redrawn once when a new alert arrives.
   (The capacity assessment and the duplicate daily-note line are removed in block 62, which both the table and the eye read.) */
(function(){
  const ROLE=String((window.__TULASI__||{}).role||'');
  if(!/^(psychologist|floor-lead-psychologist)$/.test(ROLE))return;
  const __d=window.pgDueItems;
  if(typeof __d==='function'){
    window.pgDueItems=function(pid){
      const L=(__d.apply(this,arguments)||[]).slice();
      try{
        const me1=signer(),A=(psyPx(pid).assignedAssess||[]);
        const mine=A.map((a,i)=>({a,i})).filter(o=>!o.a.to||o.a.to===me1).map(o=>({cat:'Assigned',asg:o.i,txt:String(o.a.name).split(' (')[0],due:(o.a.by||'')+(o.a.at?' · '+String(o.a.at).split(',')[0].split(' ').slice(0,2).join(' '):'')}));
        return mine.concat(L);
      }catch(e){return L;}
    };
  }
  /* redraw Today once when an alert is added after the page was drawn */
  try{
    const __al=V3.alert;let t=0;
    V3.alert=function(){
      const r=__al.apply(this,arguments);
      clearTimeout(t);t=setTimeout(()=>{try{if(/^#\/myday/.test(location.hash||'')&&!document.getElementById('scrim').classList.contains('show'))render();}catch(e){}},400);
      return r;
    };
  }catch(e){}
})();
