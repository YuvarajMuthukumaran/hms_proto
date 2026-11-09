/* Psychiatrist only (9 Nov 2026, evening). Fixes after the second team review call:
   1. Investigations: each ordered test has its own collection period and a frequency (once, daily, alternate days, weekly).
   2. Past admission 1 is a 30 day stay, so it carries a daily note from the psychiatrist and the psychologist for every day, and a round note every third day
      (the notes folders scroll). */
(function(){
  const psy=()=>S.role==='psychiatrist';

  /* ---------- 1. Investigations: period and frequency per test ---------- */
  const WHEN=['Today','Tomorrow morning','This week'],FREQ=['Once','Daily','Alternate days','Weekly'];
  window.prLabWhen=function(i,v){const R=S.rounds;if(R&&R.inv&&R.inv[i])R.inv[i][1]=v;};
  window.prLabFreq=function(i,v){const R=S.rounds;if(R&&R.inv&&R.inv[i]){R.inv[i][3]=v;}};
  const __rm=roundMon;
  roundMon=function(){
    const h=__rm.apply(this,arguments);if(!psy()||typeof h!=='string')return h;
    const t=document.createElement('template');t.innerHTML=h;
    const R=S.rounds,inv=R.inv||[];
    /* the Collect box above the test list is gone: every test carries its own period and frequency, and each new test starts at the default */
    R.invW='Tomorrow morning';
    t.content.querySelectorAll('.pr-lab > div > label').forEach(l=>{if(l.querySelector('select[aria-label="Collect"]'))l.remove();});
    t.content.querySelectorAll('.pr-lab .pr-lo').forEach((row,i)=>{
      const c=inv[i];if(!c)return;
      const adv=row.querySelector('input');
      const sel=(opts,cur,fn,lab)=>`<label class="pr-ls"><span class="tiny muted">${lab}</span><select class="input" aria-label="${lab} for ${hesc(c[0])}" onchange="${fn}(${i},this.value)">${opts.map(o=>`<option ${o===cur?'selected':''}>${o}</option>`).join('')}</select></label>`;
      const n=document.createElement('div');n.className='pr-lo9';
      n.innerHTML=`<div class="pr-lo9-h"><b>${hesc(c[0])}</b><button class="x" aria-label="Remove ${hesc(c[0])}" onclick="S.rounds.inv.splice(${i},1);render()">×</button></div><div class="pr-lo9-s">${sel(WHEN,c[1],'prLabWhen','Collect')}${sel(FREQ,c[3]||'Once','prLabFreq','Frequency')}</div>`;
      if(adv){adv.removeAttribute('style');n.appendChild(adv);}
      row.replaceWith(n);
    });
    return t.innerHTML;
  };
  const css=document.createElement('style');css.id='psy-review-fixes-css';
  css.textContent=`.pr-lo9{margin-top:12px;padding:12px 14px;border:1px solid var(--line-2,#e4e7ec);border-radius:14px;background:linear-gradient(180deg,#fff,#fafbfd);display:flex;flex-direction:column;gap:10px}
  .pr-lo9-h{display:flex;align-items:center;justify-content:space-between;gap:10px}.pr-lo9-h b{font-size:14.5px}
  .pr-lo9-h .x{width:30px;height:30px;border:0;border-radius:50%;background:#f2f4f7;color:#475467;font-size:18px;cursor:pointer;transition:background .15s,transform .15s}.pr-lo9-h .x:hover{background:#fee4e2;color:#b42318;transform:scale(1.06)}
  .pr-lo9-s{display:flex;gap:16px;flex-wrap:wrap}.pr-ls{display:flex;align-items:center;gap:8px}.pr-ls select{width:auto;min-height:34px;padding:4px 10px}
  .pr-lo9>input{width:100%;min-height:38px;box-sizing:border-box}`;
  document.head.appendChild(css);
  /* the frequency travels with the order into the nursing instruction */
  const __cr=confirmRound;
  confirmRound=function(){
    if(psy()){const R=S.rounds;(R.inv||[]).forEach(c=>{if(c[3]&&c[3]!=='Once'&&!c[4]){c[1]=c[1]+' · '+c[3];c[4]=1;}});}
    return __cr.apply(this,arguments);
  };

  /* ---------- 2. Past admission: a 30 day stay with a note for every day ---------- */
  function seed(){
    try{
      const a=(S.pastAdm||[])[0];if(!a||a.n!==1||(a.notes||[]).length>=100)return;
      a.dates='4 Feb to 6 Mar 2025';a.days=30;
      a.notes=[['6 Mar','Discharge round · Dr. Aanya Sharma','Settled, partial insight. Continue lithium; follow-up after 7 days.'],['1 Mar','Family session · Priya Nair','Sister briefed on early warning signs and medicine supervision.'],['10 Feb','Capacity assessment','Needs 100% support from nominated representative.'],['5 Feb','Detailed history','First manic episode after job stress; maternal uncle treated for bipolar disorder.']];
      const add=[],day=[];
      for(let d=5;d<=28;d++)day.push([d,'Feb']);
      for(let d=1;d<=5;d++)day.push([d,'Mar']);
      const Sx=['Calm, slept 7 hours, took medicines.','Elated, talkative in the morning, settled by evening.','Slept 5 hours, irritable at breakfast, redirected.','Joined group therapy, mood brighter.','Mild restlessness at night, no events.','Ate all meals, attended yoga.','Less pressure of speech, cooperative.'];
      const Py=['Session on sleep routine; engaged well.','Talked about job stress; named two warning signs.','Family contact by phone; supportive.','Group session on medicine routine.','Practised relaxation; reported calmer mood.','Reviewed daily schedule, took part fully.'];
      const Rd=['Elation easing, sleep improving. Continue current plan.','Olanzapine reviewed, no side effects. Lithium level in range.','Insight improving; discussed relapse signs.','Settled on the ward; plan for discharge discussed with family.'];
      day.forEach(([d,m],i)=>{
        const dt=d+' '+m;
        add.push([dt,'Daily note · Dr. Aanya Sharma',Sx[i%Sx.length]]);
        add.push([dt,'Daily note · Priya Nair',Py[i%Py.length]]);
        add.push([dt,'Round note · Dr. Aanya Sharma',Rd[i%Rd.length]]);
      });
      add.push(['6 Mar','Daily note · Dr. Aanya Sharma','Settled, ready for discharge.'],['6 Mar','Daily note · Priya Nair','Discharge session with the family; plan agreed.']);
      a.notes=a.notes.filter(n=>!/^(Round note|Daily note)/.test(String(n[1])));
      add.push(['12 Feb','Weekly re-assessment · Dr. Aanya Sharma','Improving. Continue lithium and olanzapine.'],['26 Feb','Weekly re-assessment · Dr. Aanya Sharma','Settled; planning discharge in the next week.'],['18 Feb','Management plan · Dr. Aanya Sharma','Lithium maintenance, sleep hygiene, family psychoeducation.']);
      const ord=n=>{const p=String(n[0]).split(' ');return (p[1]==='Mar'?100:0)+(+p[0]);};
      a.notes=a.notes.concat(add).sort((x,y)=>ord(y)-ord(x));
    }catch(e){}
  }
  seed();
  /* the saved copy of this stay (kept on the server) can be older than the code, so it is checked every time the page is drawn */
  const __pp=pPast;pPast=function(){if(psy()&&S.pid==='neel')seed();return __pp.apply(this,arguments);};
  /* team review (Nikita): inside a notes folder the type ("Round note") is not repeated on every row. Columns: date | doctor or psychologist | note.
     A row whose type differs from the folder's usual one (e.g. "Discharge round") keeps its type in front of the note. */
  const pfCss=document.createElement('style');pfCss.id='psy-pf-compact-css';
  pfCss.textContent=`.pf-scroll .pf-e>summary{grid-template-columns:104px 190px minmax(0,1fr)}.pf-scroll .pf-e>summary .pf-t{display:none}.pf-scroll .pf-e>summary .pf-s{white-space:normal;overflow:visible;text-overflow:clip}.pf-s b.ty{color:#175cd3;font-weight:700;margin-right:6px}.pf-scroll .pf-body{padding-left:304px}`;
  document.head.appendChild(pfCss);
  const __pp0=pPast;
  pPast=function(){
    const h=__pp0.apply(this,arguments);if(!psy()||typeof h!=='string')return h;
    const t=document.createElement('template');t.innerHTML=h;
    t.content.querySelectorAll('.pf-scroll').forEach(box=>{
      const rows=[...box.querySelectorAll(':scope > .pf-e')],cnt={};
      rows.forEach(r=>{const k=((r.querySelector('.pf-t')||{}).textContent||'').trim();cnt[k]=(cnt[k]||0)+1;});
      const top=Object.keys(cnt).sort((a,b)=>cnt[b]-cnt[a])[0];
      rows.forEach(r=>{const k=((r.querySelector('.pf-t')||{}).textContent||'').trim(),s=r.querySelector('.pf-s');
        if(s&&k&&k!==top)s.insertAdjacentHTML('afterbegin','<b class="ty">'+hesc(k)+'</b>');});
    });
    return t.innerHTML;
  };
  /* ---------- 3. 'Observation' is not written after a room on the Daily notes tabs or the Rounds ward order (it is a level, shown as a tag when it matters) ---------- */
  const noObs=h=>psy()&&typeof h==='string'?h.replace(/ · Observation(?=<)/g,''):h;
  const __vn=vNotes;vNotes=function(){return noObs(__vn.apply(this,arguments));};
  const __vr=vRounds;vRounds=function(){return noObs(__vr.apply(this,arguments));};
})();
