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
    t.content.querySelectorAll('.pr-lab .pr-lo').forEach((row,i)=>{
      const c=inv[i];if(!c)return;
      const when=row.children[1];if(!when||when.tagName!=='SPAN')return;
      const sel=(id,opts,cur,fn,lab)=>`<label class="pr-ls"><span class="tiny muted">${lab}</span><select class="input" aria-label="${lab} for ${hesc(c[0])}" onchange="${fn}(${i},this.value)">${opts.map(o=>`<option ${o===cur?'selected':''}>${o}</option>`).join('')}</select></label>`;
      const box=document.createElement('div');box.className='pr-lo-sel';
      box.innerHTML=sel('w',WHEN,c[1],'prLabWhen','Collect')+sel('f',FREQ,c[3]||'Once','prLabFreq','Frequency');
      when.replaceWith(box);
    });
    return t.innerHTML;
  };
  const css=document.createElement('style');css.id='psy-review-fixes-css';
  css.textContent=`.pr-lab .pr-lo>.pr-lo-sel{grid-area:when;display:flex;gap:10px;flex-wrap:wrap}.pr-ls{display:flex;align-items:center;gap:6px}.pr-ls select{width:auto;min-height:32px;padding:3px 8px}`;
  document.head.appendChild(css);
  /* the frequency travels with the order into the nursing instruction */
  const __cr=confirmRound;
  confirmRound=function(){
    if(psy()){const R=S.rounds;(R.inv||[]).forEach(c=>{if(c[3]&&c[3]!=='Once'&&!c[4]){c[1]=c[1]+' · '+c[3];c[4]=1;}});}
    return __cr.apply(this,arguments);
  };

  /* ---------- 2. Past admission: a 30 day stay with a note for every day ---------- */
  (function seed(){
    try{
      const a=(S.pastAdm||[])[0];if(!a||a.__seeded9||(a.notes||[]).length>12)return;
      a.__seeded9=1;
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
        if(i%3===1)add.push([dt,'Round note · Dr. Aanya Sharma',Rd[Math.floor(i/3)%Rd.length]]);
      });
      add.push(['12 Feb','Weekly re-assessment · Dr. Aanya Sharma','Improving. Continue lithium and olanzapine.'],['26 Feb','Weekly re-assessment · Dr. Aanya Sharma','Settled; planning discharge in the next week.'],['18 Feb','Management plan · Dr. Aanya Sharma','Lithium maintenance, sleep hygiene, family psychoeducation.']);
      const ord=n=>{const p=String(n[0]).split(' ');return (p[1]==='Mar'?100:0)+(+p[0]);};
      a.notes=a.notes.concat(add).sort((x,y)=>ord(y)-ord(x));
    }catch(e){}
  })();
  /* ---------- 3. 'Observation' is not written after a room on the Daily notes tabs or the Rounds ward order (it is a level, shown as a tag when it matters) ---------- */
  const noObs=h=>psy()&&typeof h==='string'?h.replace(/ · Observation(?=<)/g,''):h;
  const __vn=vNotes;vNotes=function(){return noObs(__vn.apply(this,arguments));};
  const __vr=vRounds;vRounds=function(){return noObs(__vr.apply(this,arguments));};
})();
