
/* Psychiatrist (5 Nov 2026), Trello "IPD prescribing safety: route, STAT, PRN limits, end dates, monitoring prompts".
   One "Add medicine" window, used by Rounds and by Orders (Medicines), with the same fields as the live prescription:
     medicine + strength in one field, Route (Oral / IM / IV / Sublingual / Topical), Frequency (1-0-1 style, Weekly, SOS, STAT),
     Before / After food, From and Until dates.
   1 Route is its own field.            2 STAT and Weekly are in the Frequency list.
   3 SOS / PRN needs a reason and a maximum number of doses in 24 h; the nurse's chart blocks the dose after the maximum.
   4 (Reversed 5 Nov, Trello "Rounds": there is NO end date any more, so a medicine can never be stopped by a date by mistake. The
     automatic-stop code below stays and only acts on an old medicine that already carries an endISO.)
   Rounds also has "Plan for" (Clozapine, Ketamine, ECT, Long acting injection): it creates the starter tasks a treatment needs.
   5 Warnings, never blocks (tick "I have read this"): drug allergy match, two medicines of the same class, the same medicine twice.
   6 Monitoring prompts when starting: lithium (level, kidney, thyroid), clozapine (blood count schedule, required), any antipsychotic
     (weight, BMI, sugar, lipids). Ticked tests are ordered with the medicine.
   7 Reconciliation: Admission tab "Medicines before admission" (Continue / Stop / Changed) and Discharge tab "Discharge medicines check".
   9 The countersign card on the dashboard shows the time left (within 24 h).
   The nurse chart (marTap) and the automatic stop apply to any medicine that carries a max or an end date; older medicines behave as before. */
(function(){
  const psy=()=>S.role==='psychiatrist';
  const ROUTES=['Oral','IM','IV','Sublingual','Topical'];
  const FREQS=['1-0-1','0-0-1','1-0-0','1-1-1','Weekly','SOS','STAT'];
  const CLS={
    antipsychotic:['quetiapine','olanzapine','risperidone','aripiprazole','clozapine','haloperidol','chlorpromazine','amisulpride','paliperidone','lurasidone'],
    benzodiazepine:['lorazepam','clonazepam','diazepam','alprazolam','midazolam','chlordiazepoxide','oxazepam'],
    'mood stabiliser':['lithium','sodium valproate','valproate','lamotrigine','carbamazepine'],
    antidepressant:['sertraline','escitalopram','fluoxetine','paroxetine','fluvoxamine','mirtazapine','venlafaxine','duloxetine']};
  const iso=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  const lab=s=>{const d=new Date(s+'T12:00:00');return d.toLocaleDateString('en-GB',{day:'numeric',month:'short'});};
  const baseOf=n=>String(n||'').replace(/\s*·.*$/,'').replace(/\s+\d[\d.,]*\s*(mg|mcg|µg|g|ml|iu|units?)\b.*$/i,'').trim();
  const classOf=n=>{const b=baseOf(n).toLowerCase();return Object.keys(CLS).find(k=>CLS[k].some(x=>b.startsWith(x)))||'';};
  const css=document.createElement('style');css.id='psy-rx-css';
  css.textContent=`
  .rx-w{display:flex;flex-direction:column;gap:6px;margin:8px 0}.rx-w div{border-radius:8px;padding:8px 10px;font-size:13px;background:var(--amber-bg);color:var(--amber);border:1px solid var(--amber-line)}
  .rx-w div.red{background:var(--red-bg);color:var(--red);border-color:#f3c3be}
  .rx-m{border:1px solid var(--line);border-radius:10px;padding:10px 12px;margin:8px 0;background:var(--soft);font-size:13px}.rx-m label{display:flex;gap:8px;align-items:flex-start;margin:4px 0}
  .rx-g{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.rx-g .full{grid-column:1/-1}
  .rx-chip{border:1px solid var(--line);background:#fff;border-radius:99px;padding:2px 10px;font:inherit;font-size:12px;cursor:pointer}`;
  document.head.appendChild(css);

  const px=pid=>(window.psyPx?psyPx(pid):(ptCtxOf(pid).psyx=ptCtxOf(pid).psyx||{}));
  let CTX='rounds',PRE='',LASTW='';

  /* ---------- the window ---------- */
  window.psyRxOpen=function(o){
    o=o||{};CTX=o.ctx||'rounds';PRE=o.name||'';LASTW='';
    const today=iso(new Date());
    openModal(`<div class="mh"><h3>Add medicine</h3><button class="x" aria-label="Close" onclick="closeModal()">×</button></div>
      <div class="mb"><div class="rx-g">
        <label class="field full"><span class="lbl">Medicine and strength</span><input class="input" id="rxM" list="rxDrugs" value="${hesc(PRE)}" placeholder="Type to search, e.g. Quetiapine 50 mg" oninput="psyRxCheck()" onchange="psyRxCheck()" autocomplete="off"><datalist id="rxDrugs">${DRUGS.map(d=>`<option value="${hesc(d)}">`).join('')}</datalist></label>
        <label class="field"><span class="lbl">Route</span><select class="input" id="rxR">${ROUTES.map(r=>`<option>${r}</option>`).join('')}</select></label>
        <label class="field"><span class="lbl">Frequency</span><select class="input" id="rxF" onchange="psyRxCheck()">${FREQS.map(f=>`<option ${f==='1-0-1'?'selected':''}>${f}</option>`).join('')}</select></label>
        <label class="field"><span class="lbl">Food</span><select class="input" id="rxFood"><option>After food</option><option>Before food</option></select></label>
        <label class="field"><span class="lbl">From</span><input class="input" type="date" id="rxFrom" value="${today}"></label>
        <label class="field full"><span class="lbl">Advice for nursing (optional)</span><input class="input" id="rxAdv" placeholder="e.g. give with milk, watch for drowsiness, hold if BP is low"></label>
        <div class="full" id="rxPrn" style="display:none"><div class="rx-g"><label class="field"><span class="lbl">Reason (required)</span><input class="input" id="rxWhy" list="rxWhyL" placeholder="e.g. for agitation"><datalist id="rxWhyL"><option value="for agitation"><option value="for nausea"><option value="for anxiety"><option value="for insomnia"><option value="for pain"></datalist></label>
          <label class="field"><span class="lbl">Most doses in 24 hours (required)</span><input class="input" type="number" min="1" max="12" id="rxMax" placeholder="e.g. 3"></label></div></div>
      </div>
      <div id="rxWarn"></div><div id="rxMon"></div></div>
      <div class="mf"><button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri big" onclick="psyRxAdd()">Add medicine</button></div>`);
    psyRxCheck();
  };

  function pending(){return CTX==='rounds'?((S.rounds&&S.rounds.mc)||[]).filter(c=>c.rx).map(c=>c.rx.name):[];}
  function warnings(name){
    const b=baseOf(name).toLowerCase(),out=[];if(!b)return out;
    const al=px(S.pid).allergy;
    /* Anu (Trello, 4 Nov): the allergy warning comes only when the patient is allergic to something. "Not recorded yet" is no longer shown here. */
    if(al)(al.list||[]).forEach(a=>{const x=String(a.drug||'').toLowerCase();if(x&&(b.includes(x)||x.includes(b)))out.push(['red','Allergy match: '+a.drug+(a.rx?' ('+a.rx+')':'')+'. This patient has a recorded allergy to this medicine.']);});
    const cur=S.meds.map(m=>m.name).concat(pending()),cls=classOf(name);
    cur.forEach(n=>{
      if(baseOf(n).toLowerCase()===b)out.push(['','Already prescribed: '+n+'. The same medicine twice.']);
      else if(cls&&classOf(n)===cls)out.push(['','Already on '+baseOf(n)+': two medicines of the same class ('+cls+'). Confirm this is intended.']);
    });
    return out;
  }
  function prompts(name){
    const b=baseOf(name).toLowerCase(),out=[];if(!b)return out;
    if(b.startsWith('lithium'))out.push({id:'li',label:'Order serum lithium level (this week), plus kidney (RFT) and thyroid (TSH) tests at baseline',tests:[['Serum lithium','This week'],['RFT','Today'],['TSH','Today']]});
    if(b.startsWith('clozapine'))out.push({id:'cz',req:true,label:'Blood count (ANC) schedule: weekly for the first 18 weeks. Required before continuing.',tests:[['CBC','Today']]});
    if(classOf(name)==='antipsychotic')out.push({id:'ap',label:'Metabolic baseline: weight, BMI, sugar and lipids',tests:[['Lipid profile','This week'],['Fasting sugar','This week']],note:'Weigh the patient and record BMI at baseline.'});
    return out;
  }
  window.psyRxCheck=function(){
    const name=($('rxM')||{}).value||'',f=($('rxF')||{}).value;
    if(!$('rxM'))return;
    $('rxPrn').style.display=f==='SOS'?'':'none';
    const w=warnings(name),p=prompts(name);
    /* redrawing must not lose what was ticked: keep the tick while the warnings are the same, and the check boxes while the prompts are */
    const wKey=w.map(x=>x[1]).join('|'),ackWas=$('rxAck')?$('rxAck').checked:false,keepAck=ackWas&&wKey===LASTW;LASTW=wKey;
    const ticks={};p.forEach(x=>{const c=document.querySelector('input[name="rxP_'+x.id+'"]:checked');if(c)ticks[x.id]=c.value;});
    $('rxWarn').innerHTML=w.length?`<div class="rx-w">${w.map(x=>`<div class="${x[0]}">${hesc(x[1])}</div>`).join('')}<label class="row small" style="gap:8px"><input type="checkbox" id="rxAck" ${keepAck?'checked':''}> I have read this</label></div>`:'';
    /* Anu (Trello): nothing is ticked by default, because baseline tests are often already done. Each check is answered with one of two options. */
    $('rxMon').innerHTML=p.length?`<div class="lbl" style="margin-top:10px">Baseline checks for this medicine</div>${p.map(x=>`<div class="rx-m"><div style="font-size:13px">${hesc(x.label)}${x.note?`<div class="tiny muted">${hesc(x.note)}</div>`:''}</div><div class="row" style="gap:14px;margin-top:4px"><label class="row small" style="gap:6px"><input type="radio" name="rxP_${x.id}" value="done" ${ticks[x.id]==='done'?'checked':''}> Already done</label><label class="row small" style="gap:6px"><input type="radio" name="rxP_${x.id}" value="send" ${ticks[x.id]==='send'?'checked':''}> Send investigations</label></div></div>`).join('')}`:'';
  };

  /* ---------- add ---------- */
  function fail(msg,id){toast(msg);const e=$(id);if(e){e.focus();}return false;}
  window.psyRxAdd=function(){
    const name=$('rxM').value.trim(),f=$('rxF').value,route=$('rxR').value,food=$('rxFood').value,from=$('rxFrom').value;
    if(!name)return fail('Choose or type the medicine and strength','rxM');
    if(!from)return fail('Choose the start date','rxFrom');
    let why='',max=0;
    if(f==='SOS'){why=($('rxWhy').value||'').trim();max=+$('rxMax').value;if(!why)return fail('Write the reason for the SOS dose, for example "for agitation"','rxWhy');if(!(max>=1))return fail('Write the most doses allowed in 24 hours','rxMax');}
    if($('rxAck')&&!$('rxAck').checked)return fail('Tick "I have read this" to go on','rxAck');
    const p=prompts(name);let tests=[];
    for(const x of p){const c=document.querySelector('input[name="rxP_'+x.id+'"]:checked');if(!c)return fail('Choose Already done or Send investigations: '+x.label,null);if(c.value==='send')tests=tests.concat(x.tests);}
    const w=whoAt(),b=baseOf(name),nm=name+(route!=='Oral'?' · '+route:'');
    /* no end date (owner, 5 Nov): a medicine only stops when the doctor stops it, so it can never be dropped by a date by mistake */
    const range=f==='STAT'?'Single dose, '+lab(from):lab(from)+' to ongoing';
    const spec={name:nm,base:b,route,freq:f,time:food,range,startISO:from,reason:why,max,adv:($('rxAdv')&&$('rxAdv').value||'').trim(),by:w.by,at:w.at};
    const text=[nm,f,food.toLowerCase(),f==='STAT'?'once now':'from '+lab(from)].concat(why?[why+', most '+max+' in 24 h']:[]).join(', ');
    if(CTX==='rounds'){
      const R=S.rounds;R.mc.push({act:'Start',text,src:'Typed',rx:spec});R.inv=R.inv||[];
      tests.forEach(t=>{if(!R.inv.some(y=>y[0]===t[0]))R.inv.push([t[0],t[1]]);});
      closeModal();render();toast('Added to this round: '+nm+(tests.length?'. '+tests.length+' test'+(tests.length>1?'s':'')+' added to Investigations.':''));
    }else{
      if(b.toLowerCase().startsWith('clozapine')){S.consents.push({name:'Clozapine consent',who:'Family',st:'Requested from front desk by '+w.by+' · '+w.at,c:'c-amber'});S.meds.push(Object.assign({},spec,{name:nm+' · waiting for consent',range:'Starts once signed'}));}
      else S.meds.push(spec);
      tests.forEach(t=>{try{v3().pending.unshift({pid:S.pid,test:t[0],when:'Collect: '+t[1],st:'Ordered'});}catch(e){}});
      S.rx=[];closeModal();render();toast(nm+' ordered'+(tests.length?'. '+tests.length+' test'+(tests.length>1?'s':'')+' ordered with it.':'')+' Nurses will see it.');
    }
  };

  /* Orders: choosing a medicine (search, Frequent, Repeat last change) opens the window instead of adding a bare draft row */
  const __rxAdd=rxAdd;
  rxAdd=function(name){if(!psy())return __rxAdd.apply(this,arguments);psyRxOpen({ctx:'orders',name});};

  /* Rounds: the structured medicines are written to the chart when the round is saved */
  const __cr=confirmRound;
  confirmRound=function(){
    if(!psy())return __cr.apply(this,arguments);
    const R=S.rounds,w=R.ward,before=R.idx[w],WP=WARDS[w],p=WP[Math.min(before,WP.length-1)];
    const specs=(R.mc||[]).filter(c=>c.act==='Start'&&c.rx).map(c=>c.rx);
    const out=__cr.apply(this,arguments);
    if(specs.length&&p&&(R.idx[w]!==before)){ptRun(p.id,()=>{specs.forEach(s=>S.meds.push(s));return '';});render();}
    return out;
  };

  /* ---------- end date = hard stop; PRN maximum ---------- */
  function expireAll(){
    const t=iso(new Date()),seen=new Set();
    [S,...Object.keys(PT_CTX||{}).filter(k=>k!==S.pid).map(k=>PT_CTX[k])].forEach(c=>{
      if(!c||seen.has(c)||!Array.isArray(c.meds))return;seen.add(c);
      const gone=c.meds.filter(m=>m.endISO&&m.endISO<t);if(!gone.length)return;
      c.meds=c.meds.filter(m=>!(m.endISO&&m.endISO<t));c.medsOff=c.medsOff||[];
      gone.forEach(m=>{let doses=[];try{if(c===S)doses=medDoseDates(m);}catch(e){}c.medsOff.unshift(Object.assign({},m,{doses,offBy:'Auto-stopped',offAt:atNow(),why:'End date reached ('+lab(m.endISO)+'). To continue, the doctor renews it with a new order.'}));});
    });
  }
  const __render=render;
  render=function(){try{expireAll();}catch(e){console.warn('expire',e);}return __render.apply(this,arguments);};

  const __mt=marTap;
  marTap=function(mi,k){
    const m=(S.meds||[])[mi];
    if(m&&m.endISO&&m.endISO<iso(new Date())){toast('This medicine ended on '+lab(m.endISO)+'. Ask the doctor to renew it.');return;}
    if(m&&m.max&&k==='SOS'){
      /* the SOS cell cycles empty > given > refused > held > empty; every time it becomes "given" that is one dose, and a cleared tap does not hand the dose back */
      const key=(S.pid||'neel')+':'+mi+'-6-SOS',cur=MAR_ST[key]||'',next=cur===''?'G':cur==='G'?'R':cur==='R'?'H':'';
      S.sosN=S.sosN||{};const n=S.sosN[key]||0;
      if(next==='G'){
        if(n>=m.max){toast('Most '+m.max+' doses in 24 hours already given. Call the doctor before giving more.');return;}
        S.sosN[key]=n+1;toast('Dose '+(n+1)+' of '+m.max+' recorded');
      }
    }
    return __mt.apply(this,arguments);
  };

  /* ---------- show the new details in lists ---------- */
  const note=m=>(m.reason?`<div class="tiny muted">${hesc(m.reason)} · most ${m.max} in 24 h</div>`:'')+(m.adv?`<div class="tiny muted">Advice: ${hesc(m.adv)}</div>`:'');
  const __po=pOrders;
  /* Trello "also add a way to stop or add medicine in nursing chart view": the one nursing chart (marCard) gets Add medicine in its
     header and a Stop button under each ongoing medicine, for the psychiatrist. It is the same chart on the Nursing chart page,
     the Orders tab and the full-chart window. */
  const __mc=marCard;
  marCard=function(){
    const h0=__mc.apply(this,arguments);if(!psy())return h0;
    /* Anu: a Vitals tab inside the medication chart. The button sits left of Add medicine and swaps the chart for the vitals table (no redraw, so it also works in the Rounds window). */
    const onVitalsPage=/\/vitals/.test(location.hash||'');
    const VDEF=[['18 Oct','138/88','104','98.8','97','72.4','3'],['19 Oct','134/86','98','98.6','98','—','4'],['20 Oct','130/84','96','98.4','98','—','3.5'],['21 Oct','128/82','92','98.6','98','—','5'],['22 Oct','126/80','90','98.4','99','71.8','4'],['23 Oct','124/80','88','98.6','98','—','6.5']];
    const VR=(S.vit||VDEF).slice().reverse();
    /* Mock repeat reading for 22 Oct, with the navigation requested for multiple pulses on one day. */
    window.__psyPulseReadings=window.__psyPulseReadings||{'22 Oct':[{value:'90',time:'8:00 am',by:'BJ'},{value:'96',time:'4:00 pm',by:'SR'}]};
    const pulseCell=v=>{const a=window.__psyPulseReadings[v[0]];if(!a||a.length<2)return hesc(String(v[2]));return `<div class="psy-pulse-cell"><button type="button" class="psy-pulse-nav" aria-label="Previous pulse reading" onclick="psyPulseNav(this,-1)">‹</button><span><b class="psy-pulse-value">${hesc(a[0].value)}</b><small class="psy-pulse-meta">${hesc(a[0].time)} · ${hesc(a[0].by)}</small></span><button type="button" class="psy-pulse-nav" aria-label="Next pulse reading" onclick="psyPulseNav(this,1)">›</button><small class="psy-pulse-count">1/${a.length}</small></div>`;};
    const vit=`<div class="pv-vit"><div class="scroll"><table class="t"><thead><tr><th>Date</th><th>BP</th><th>Pulse</th><th>Temp (°F)</th><th>SpO2 (%)</th><th>Weight (kg)</th><th>Sleep (h)</th></tr></thead><tbody>${VR.map(v=>`<tr>${v.map((x,i)=>`<td ${i===0?'style="font-weight:600"':''}>${i===2?pulseCell(v):hesc(String(x))}</td>`).join('')}</tr>`).join('')}</tbody></table></div><div class="pad tiny muted">Recorded by the nurses on the ward. Press Medicines to go back to the chart.</div></div>`;
    let h=h0.replace('<div class="row" style="gap:8px"><button class="btn sm" onclick="marJump(0)">','<div class="row" style="gap:8px">'+(onVitalsPage?'':'<button class="btn sm" onclick="psyChartTab(this)">Vitals</button>')+'<button class="btn pri sm" onclick="psyRxOpen({ctx:\'orders\'})">Add medicine</button><button class="btn sm" onclick="marJump(0)">');
    if(!onVitalsPage)h=h.replace('<div class="scroll mscroll" id="marScroll">',vit+'<div class="scroll mscroll" id="marScroll">');
    const act=S.meds.filter(m=>!m.name.includes('waiting'));let k=0;
    h=h.replace(/<div class="mm-l mm-on">Ongoing<\/div>/g,()=>{const m=act[k++],i=S.meds.indexOf(m);return '<div class="mm-l mm-on">Ongoing</div>'+(i>=0?'<button class="btn sm" style="margin-top:6px" onclick="medStopModal('+i+')">Stop</button>':'');});
    S.meds.concat(S.medsOff||[]).filter(m=>m.adv).forEach(m=>{const t='<div class="mm-n">'+hesc(m.name)+'</div>';h=h.split(t).join(t+'<div class="mm-l" style="color:#344054">Advice: '+hesc(m.adv)+'</div>');});
    return h;
  };
  /* "Change medicines" on the patient overview opens that patient's nursing chart (Add and Stop are there), not the Orders tab */
  window.psyToChart=id=>{S.ncP=id;go('#/nursing/'+id);};
  window.psyChartTab=function(btn){const card=btn.closest('.mchart');if(!card)return;const on=card.classList.toggle('showvit');btn.textContent=on?'Medicines':'Vitals';};
  window.psyPulseNav=function(btn,delta){const cell=btn.closest('.psy-pulse-cell');if(!cell)return;const row=btn.closest('tr'),date=(row&&row.cells[0]||{}).textContent.trim(),a=(window.__psyPulseReadings||{})[date];if(!a||a.length<2)return;let i=Number(cell.dataset.index||0);i=(i+delta+a.length)%a.length;cell.dataset.index=String(i);cell.querySelector('.psy-pulse-value').textContent=a[i].value;cell.querySelector('.psy-pulse-meta').textContent=a[i].time+' · '+a[i].by;cell.querySelector('.psy-pulse-count').textContent=(i+1)+'/'+a.length;};
  (function(){const st=document.createElement('style');st.id='psy-chart-tab-css';st.textContent='.mchart .pv-vit{display:none}.mchart.showvit .pv-vit{display:block}.mchart.showvit .mscroll,.mchart.showvit .mleg{display:none}.psy-pulse-cell{display:flex;align-items:center;gap:5px;min-width:112px}.psy-pulse-nav{width:23px;height:23px;border:1px solid #cbd5e1;border-radius:7px;background:#fff;color:#175cd3;font-size:18px;line-height:16px;cursor:pointer}.psy-pulse-cell>span{display:flex;flex-direction:column;align-items:center;min-width:43px}.psy-pulse-meta{font-size:10px;color:#667085;white-space:nowrap}.psy-pulse-count{font-size:9px;color:#667085}';document.head.appendChild(st);})();
  const __ch=compactHeader;
  compactHeader=function(){
    const h=__ch.apply(this,arguments);if(!psy())return h;
    return h.replace(/onclick="go\('#\/patient\/[^']*\/orders'\)">Change medicines/,'onclick="psyToChart(\''+(S.pid||'neel')+'\')">Change medicines');
  };

  /* remove one balanced <div ...> block that starts with `open` */
  const cutDiv=(h,open)=>{const a=h.indexOf(open);if(a<0)return h;let depth=0,i=-1;const re=/<div\b|<\/div>/g;re.lastIndex=a;let m;
    while((m=re.exec(h))){depth+=m[0]==='</div>'?-1:1;if(depth===0){i=m.index+m[0].length;break;}}
    return i>a?h.slice(0,a)+h.slice(i):h;};
  pOrders=function(){
    if(!psy())return __po.apply(this,arguments);
    /* Trello "Keep same nursing chart everywhere": the Orders tab shows the one nursing chart (marCard), not its own list of dose dates */
    const __mh=medHistoryTable;
    medHistoryTable=function(){if(S.__noChart)return '';return marCard().replace('<section class="card mchart">','<section class="mchart" style="border-top:1px solid var(--line-2)">');};
    let h;try{h=__po.apply(this,arguments);}finally{medHistoryTable=__mh;}
    /* the row of four counters (Active medicines, Tests ordered, Consents waiting, Restraint this stay) is removed (owner, 5 Nov) */
    h=cutDiv(h,'<div class="ostrip">');
    /* Trello "No way to add medication here": a visible + Add medicine at the top of the Medicines card; the old search box at the bottom is gone */
    h=h.replace('<button class="btn sm" onclick="rxAdd(\'Olanzapine 15 mg\')">Repeat last change</button>','<button class="btn pri" onclick="psyRxOpen({ctx:\'orders\'})">Add medicine</button>');
    h=cutDiv(h,'<div style="padding:14px 20px 18px;border-top:1px solid var(--line-2)">');
    h=h.replace('Same fields as the live prescription: medicine with strength, 1-0-1, before or after food, dates','Current medicines. The chart below shows every dose given, from Day 1.');
    S.meds.filter(m=>m.reason||m.adv).forEach(m=>{const t='<b>'+m.name+'</b>';h=h.split(t).join(t+note(m));});
    return h;
  };

  /* ---------- 7. reconciliation ---------- */
  const DEC=['Continue','Stop','Changed'];
  const recon=()=>{const x=px(S.pid);x.recon=x.recon||{adm:[],admNone:false,dis:{},disExtra:[]};return x.recon;};
  window.psyReconAdd=function(){const n=($('rcN').value||'').trim();if(!n){toast('Type the medicine and dose');return;}recon().adm.push({name:n,dec:$('rcD').value,note:($('rcT').value||'').trim(),by:signer(),at:atNow()});render();};
  window.psyReconSet=function(i,k,v){recon().adm[i][k]=v;render();};
  window.psyReconDel=function(i){recon().adm.splice(i,1);render();};
  window.psyReconNone=function(){const r=recon();r.admNone=true;r.admBy=signer();r.admAt=atNow();render();};
  function admCard(){
    const r=recon(),done=r.adm.length||r.admNone;
    return `<section class="card" id="reconadm"><div class="hd"><div><h3>Medicines before admission</h3><div class="small muted" style="margin-top:4px">What the patient was taking at home. Mark each one Continue, Stop or Changed so nothing is lost.</div></div>${done?chip('Recorded','c-green'):chip('Not recorded yet','c-amber')}</div>
      ${r.adm.map((m,i)=>`<div class="li"><div class="grow"><div style="font-weight:600">${hesc(m.name)}</div><div class="tiny muted">${hesc(m.by)} · ${hesc(m.at)}</div></div><select class="input" style="width:auto;min-height:32px" onchange="psyReconSet(${i},'dec',this.value)" aria-label="Decision for ${hesc(m.name)}">${DEC.map(d=>`<option ${m.dec===d?'selected':''}>${d}</option>`).join('')}</select><input class="input" style="width:220px;min-height:32px" placeholder="Note (new dose, reason)" value="${hesc(m.note||'')}" onchange="psyReconSet(${i},'note',this.value)"><button class="btn sm" onclick="psyReconDel(${i})">Remove</button></div>`).join('')}
      ${r.admNone?`<div class="pad small muted">Recorded: no medicines before admission (${hesc(r.admBy||'')}, ${hesc(r.admAt||'')}).</div>`:''}
      <div class="pad row" style="gap:8px;flex-wrap:wrap;align-items:center"><input class="input" id="rcN" style="flex:1 1 220px;min-height:36px" placeholder="Medicine and dose, e.g. Sodium valproate 500 mg twice a day"><select class="input" id="rcD" style="width:auto;min-height:36px">${DEC.map(d=>`<option>${d}</option>`).join('')}</select><input class="input" id="rcT" style="flex:1 1 160px;min-height:36px" placeholder="Note"><button class="btn sm pri" onclick="psyReconAdd()">Add</button>${r.adm.length||r.admNone?'':'<button class="btn sm" onclick="psyReconNone()">No medicines before admission</button>'}</div></section>`;
  }
  const __pa=pAdmission;
  pAdmission=function(){
    const h=__pa.apply(this,arguments);if(!psy())return h;
    /* the allergy tag is hidden in the header unless an allergy exists, so allergies are recorded and edited here */
    const al=(window.psyPx&&psyPx(S.pid).allergy)||null;
    const alTxt=!al?'Not recorded yet':(al.list&&al.list.length?'Drug allergy: '+al.list.map(i=>hesc(i.drug)+(i.rx?' ('+hesc(i.rx)+')':'')).join(', '):'No known drug allergies')+' · '+hesc(al.by)+', '+hesc(al.at);
    const alCard=`<section class="card"><div class="pad row" style="justify-content:space-between;gap:12px;flex-wrap:wrap"><div><div style="font-weight:600">Allergies</div><div class="small muted">${alTxt}</div></div><button class="btn sm" onclick="psyAllergy('${S.pid}')">${al?'Edit':'Record allergies'}</button></div></section>`;
    return alCard+h;
  };

  window.psyDisSet=function(key,k,v){const r=recon();r.dis[key]=r.dis[key]||{};r.dis[key][k]=v;render();};
  window.psyDisAdd=function(){const n=($('dsN').value||'').trim();if(!n){toast('Type the medicine and dose');return;}recon().disExtra.push({name:n,note:($('dsT').value||'').trim(),by:signer(),at:atNow()});render();};
  window.psyDisDel=function(i){recon().disExtra.splice(i,1);render();};
  function disCard(){
    const r=recon(),stay=S.meds.map(m=>m.name),home=r.adm.filter(m=>m.dec!=='Stop').map(m=>m.name);
    const rows=[...new Set([...stay,...home])];
    const decided=rows.filter(n=>(r.dis[n]||{}).d).length;
    return `<section class="card" id="recondis"><div class="hd"><div><h3>Discharge medicines check</h3><div class="small muted" style="margin-top:4px">Every medicine from the stay and from home: decide Continue, Stop or Changed, so nothing is dropped by accident.</div></div>${rows.length&&decided<rows.length?chip((rows.length-decided)+' not decided','c-amber'):chip(rows.length?'All decided':'No medicines','c-green')}</div>
      ${rows.map(n=>{const e=r.dis[n]||{};const isHome=home.includes(n)&&!stay.includes(n);return `<div class="li"><div class="grow"><div style="font-weight:600">${hesc(n)}</div><div class="tiny muted">${isHome?'Taking at home before admission':'Prescribed during this stay'}</div></div><select class="input" style="width:auto;min-height:32px" onchange="psyDisSet('${hesc(n).replace(/'/g,"\\'")}','d',this.value)" aria-label="Decision for ${hesc(n)}"><option value="">Not decided</option>${DEC.map(d=>`<option ${e.d===d?'selected':''}>${d}</option>`).join('')}</select><input class="input" style="width:220px;min-height:32px" placeholder="Note (new dose, reason)" value="${hesc(e.note||'')}" onchange="psyDisSet('${hesc(n).replace(/'/g,"\\'")}','note',this.value)"></div>`;}).join('')||'<div class="pad small muted">No medicines to check.</div>'}
      ${r.disExtra.map((m,i)=>`<div class="li"><div class="grow"><div style="font-weight:600">${hesc(m.name)}</div><div class="tiny muted">New at discharge · ${hesc(m.by)}, ${hesc(m.at)}${m.note?' · '+hesc(m.note):''}</div></div><button class="btn sm" onclick="psyDisDel(${i})">Remove</button></div>`).join('')}
      <div class="pad row" style="gap:8px;flex-wrap:wrap;align-items:center"><input class="input" id="dsN" style="flex:1 1 220px;min-height:36px" placeholder="New medicine at discharge, with dose"><input class="input" id="dsT" style="flex:1 1 160px;min-height:36px" placeholder="Note"><button class="btn sm pri" onclick="psyDisAdd()">Add</button></div></section>`;
  }
  const __pd=pDischarge;
  pDischarge=function(){const h=__pd.apply(this,arguments);return psy()?disCard()+h:h;};

  /* ---------- Plan for ---------- */
  const PLANS={
    'Clozapine':{consent:'Clozapine consent (patient and relative)',tests:[['CBC','Today']],tasks:['Weekly blood count (ANC) for the first 18 weeks','Baseline ECG and weight']},
    'Ketamine':{consent:'Ketamine treatment consent',tests:[['ECG','Today']],tasks:['Blood pressure and pulse before and after each session','Nothing to eat or drink before each session, as the anaesthetist advises']},
    'ECT':{consent:'ECT consent (patient and relative)',tests:[['ECG','Today'],['CBC','Today'],['RFT','Today']],tasks:['Pre-ECT work-up: anaesthetist review','Nil by mouth from midnight before the session']},
    'Long acting injection':{consent:'Long acting injection consent',tests:[['LFT','This week'],['Lipid profile','This week']],tasks:['Check the oral medicine was tolerated before the first injection','Set the date of the next injection']}};
  let PLAN='';
  window.psyPlanOpen=function(kind){
    const P=PLANS[kind];if(!P)return;PLAN=kind;
    openModal(`<div class="mh"><h3>Plan for ${hesc(kind)}</h3><button class="x" aria-label="Close" onclick="closeModal()">×</button></div>
      <div class="mb"><div class="small muted">Tick what to create. These are starter tasks; the team will define the full algorithm for each plan later.</div>
        <label class="rx-m" style="display:flex;gap:8px;align-items:flex-start"><input type="checkbox" id="pl_c" checked><span><b>Take consent</b> · ${hesc(P.consent)}<div class="tiny muted">A request goes to the front desk to take the family's signature.</div></span></label>
        <div class="lbl" style="margin-top:8px">Blood tests and investigations</div>
        ${P.tests.map((t,i)=>`<label class="row small" style="gap:8px;margin:4px 0"><input type="checkbox" id="pl_t${i}" checked>${hesc(t[0])} <span class="muted">· ${hesc(t[1])}</span></label>`).join('')}
        <div class="lbl" style="margin-top:8px">Tasks for the team</div>
        ${P.tasks.map((t,i)=>`<label class="row small" style="gap:8px;margin:4px 0"><input type="checkbox" id="pl_k${i}" checked>${hesc(t)}</label>`).join('')}</div>
      <div class="mf"><button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri big" onclick="psyPlanCreate()">Create tasks</button></div>`);
  };
  window.psyPlanCreate=function(){
    const P=PLANS[PLAN];if(!P)return;const R=S.rounds,w=whoAt();let n=0;R.inv=R.inv||[];R.adv=R.adv||[];
    if($('pl_c').checked){S.consents.push({name:P.consent,who:'Family',st:'Requested from front desk by '+w.by+' · '+w.at+' · plan for '+PLAN,c:'c-amber'});n++;}
    P.tests.forEach((t,i)=>{if($('pl_t'+i).checked&&!R.inv.some(y=>y[0]===t[0])){R.inv.push([t[0],t[1]]);n++;}});
    P.tasks.forEach((t,i)=>{if($('pl_k'+i).checked){R.adv.push({to:'Nursing staff',ty:'Other',text:PLAN+': '+t,until:'Until the plan is done',inform:'No one extra',by:signer()});n++;}});
    const x=px(S.pid);x.plans=x.plans||[];x.plans.unshift({kind:PLAN,by:signer(),at:atNow()});
    closeModal();render();toast('Plan for '+PLAN+': '+n+' task'+(n===1?'':'s')+' created. Tests and team tasks go out when you save the round.');
  };

  /* ---------- 9. time left to countersign ---------- */
  window.psyOrderLeft=function(id){
    const o=v3().orders.find(x=>x.id===id);if(!o||o.t==null)return '';
    const left=1440-(V3.now()-o.t),a=Math.abs(left),txt=a>=60?Math.floor(a/60)+' h':Math.round(a)+' min';
    return 'Countersign within 24 h · '+(left>=0?txt+' left':'overdue by '+txt);
  };
})();
