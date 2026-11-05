
/* Psychiatrist only (5 Nov 2026). Trello (Anu): "we cant have daily notes inside a patient profile, it makes it difficult to fill daily notes in one go".
   Decision (owner): the notes stay in each patient's profile, and the all-patients page is the place to write them in one go.
   - "Daily notes" is its own button in the left rail (it was only inside the Patients menu), opening the all-patients page (#/notes).
   - A note saved on that page also goes into the patient's Earlier notes, so the profile shows the same note (one record, no second copy).
   - The Daily notes tab inside a patient's profile points to the all-patients page. */
(function(){
  const psy=()=>S.role==='psychiatrist';
  const NICON='<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 4h11l3 3v13H5z"/><path d="M9 11h6M9 15h6"/></svg>';

  /* left rail: Daily notes right after Rounds */
  const __rs=renderSide;
  renderSide=function(){
    const out=__rs.apply(this,arguments);
    if(psy()){
      const dd=document.querySelector('#side .sgdd');
      if(dd&&!dd.querySelector('[data-dnall]')){
        const on=/^#\/notes/.test(location.hash||'');
        const b=document.createElement('button');b.dataset.dnall='1';b.title='Daily notes';b.setAttribute('aria-label','Daily notes');b.setAttribute('onclick',"go('#/notes')");
        if(on){b.className='on';b.setAttribute('aria-current','page');dd.querySelectorAll('button.on:not([data-dnall])').forEach(x=>{x.classList.remove('on');x.removeAttribute('aria-current');});}
        b.innerHTML=`<span class="si">${NICON}</span><span class="sl">Daily notes</span>`;
        const r=dd.querySelector('[data-rounds]');
        (r?r.after(b):dd.appendChild(b));
      }
    }
    return out;
  };

  /* a note saved on the all-patients page is also the patient's note in Earlier notes */
  window.psyNoteToProfile=function(id){
    try{
      const e=(S.eod||{})[id]||{},d=new Date(),L=a=>Array.isArray(a)?a.join(', '):(a||'');
      const bio=[e.sleep&&'Sleep: '+e.sleep,e.meal&&'Appetite: '+e.meal,e.care&&'Self-care: '+e.care,e.bl&&'Bladder: '+e.bl,e.bw&&'Bowel: '+e.bw].filter(Boolean).join('. ');
      const beh=[e.mood&&'Mood: '+e.mood,e.beh&&'Behaviour: '+e.beh,e.part&&'Activities: '+e.part].filter(Boolean).join('. ');
      const fam=[L(e.sess)&&'Sessions: '+L(e.sess),L(e.fam)&&'Family: '+L(e.fam),e.brief&&'Therapy brief: '+e.brief].filter(Boolean).join('. ');
      const ev=(e.line||'').trim();
      const secs=[];
      if(bio)secs.push(['Sleep, appetite and self-care',bio]);
      if(beh)secs.push(['Mood and behaviour',beh]);
      if(fam)secs.push(['Sessions and family',fam]);
      secs.push(['Significant event',ev||'None reported',!!ev&&!/^none/i.test(ev)]);
      const sum=[e.sleep,e.meal,e.mood,e.beh].filter(Boolean).join(' · ')||'Daily note';
      ptRun(id,()=>{
        S.dnHist=(S.dnHist||DN_HIST).filter(x=>!x.eodNote);
        S.dnHist.unshift({d:String(d.getDate()),my:d.toLocaleString('en-GB',{month:'short'})+' '+d.getFullYear(),type:'Daily note',tc:'c-blue',by:signer(),role:'Psychiatrist',sum,signed:atNow(),secs,eodNote:true});
        return '';});
    }catch(err){}
  };
  const __en=eodNotes;
  eodNotes=function(){
    const h=__en.apply(this,arguments);if(!psy())return h;
    /* team review, 5 Nov: no "Skip for now". If you opened Daily notes you mean to fill it, so Save and next is the only way forward. */
    return h.replace(/S\.eod\['([^']+)'\]\.saved=true;S\.eodI=0;/g,"S.eod['$1'].saved=true;psyNoteToProfile('$1');S.eodI=0;")
      .replace(/<button class="btn sm"\s+(?:disabled\s+)?onclick="S\.eodI=\d+;render\(\)">Skip for now ›<\/button>/,'');
  };

  /* the Daily notes tab inside a patient's profile points to the all-patients page */
  const __pd=pDaily;
  pDaily=function(){
    const h=__pd.apply(this,arguments);if(!psy())return h;
    const bar=`<section class="card"><div class="pad row" style="justify-content:space-between;gap:12px;flex-wrap:wrap"><div><div style="font-weight:600">Writing notes for several patients?</div><div class="small muted">Fill them all in one go on the Daily notes page. Each saved note also shows here under Earlier notes.</div></div><button class="btn pri" onclick="go('#/notes')">Open Daily notes for all patients</button></div></section>`;
    return bar+h;
  };
})();
