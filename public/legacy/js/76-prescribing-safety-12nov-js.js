/* 12 Nov 2026, Trello card 100: Prescribing safety (psychiatrist workspace, which the RMO also uses).
   On top of the Add medicine window in 38-psy-prescribing:
   1. Allergy hard stop: no prescribing until the allergy status is recorded, and a drug the patient is allergic to is blocked (no tick-box way round).
   2. Interaction warnings: lithium + NSAID, lithium + ACE inhibitor or diuretic, two antipsychotics, clozapine + benzodiazepine, SSRI + tramadol, valproate + lamotrigine.
   3. Dose range and maximum per day: warns when a single dose is outside the usual range or the daily total is over the maximum.
   4. New routes and forms: oral liquid, orodispersible, IM depot (next due date, shown on the nursing chart under the medicine), and an "observe swallow" flag for nurses.
   Dose limits and interaction lists are a starter set for the prototype; the clinical team should review them. */
(function(){
  const psy=()=>S.role==='psychiatrist';
  const px=()=>psyPx(S.pid);
  const base=n=>String(n||'').replace(/\s*·.*$/,'').replace(/\s+\d[\d.,]*\s*(mg|mcg|µg|g|ml|iu|units?)\b.*$/i,'').trim().toLowerCase();
  const has=(n,list)=>list.some(x=>base(n).startsWith(x));
  const ANTIPSY=['quetiapine','olanzapine','risperidone','aripiprazole','clozapine','haloperidol','chlorpromazine','amisulpride','paliperidone','lurasidone'];
  const BZD=['lorazepam','clonazepam','diazepam','alprazolam','midazolam','chlordiazepoxide','oxazepam'];
  const NSAID=['ibuprofen','diclofenac','naproxen','ketorolac','aceclofenac','mefenamic','indomethacin','etoricoxib','piroxicam','nimesulide'];
  const ACEI_DIU=['enalapril','ramipril','lisinopril','losartan','telmisartan','furosemide','hydrochlorothiazide','torsemide','spironolactone'];
  const SSRI=['sertraline','escitalopram','fluoxetine','paroxetine','fluvoxamine','citalopram'];
  const PAIRS=[
    {a:['lithium'],b:NSAID,msg:'Lithium + NSAID: NSAIDs raise the lithium level and can cause toxicity. Avoid, or check a lithium level within 5 days.'},
    {a:['lithium'],b:ACEI_DIU,msg:'Lithium + ACE inhibitor, ARB or diuretic: the lithium level can rise. Check the level and kidney function.'},
    {a:ANTIPSY,b:ANTIPSY,msg:'Two antipsychotics together: more sedation, QT and metabolic risk. Confirm this is intended and review the plan.',same:true},
    {a:['clozapine'],b:BZD,msg:'Clozapine + benzodiazepine: risk of sedation and breathing depression, mostly with IM lorazepam. Watch closely.'},
    {a:SSRI,b:['tramadol','linezolid'],msg:'SSRI + tramadol or linezolid: risk of serotonin syndrome. Avoid, or monitor closely.'},
    {a:['sodium valproate','valproate'],b:['lamotrigine'],msg:'Valproate + lamotrigine: valproate roughly doubles the lamotrigine level. Start lamotrigine low and titrate slowly.'}
  ];
  /* [lowest single dose, highest single dose, highest total per day], all in mg */
  const DOSE={lithium:[300,1200,1800],olanzapine:[2.5,20,20],quetiapine:[25,800,800],risperidone:[0.5,6,8],aripiprazole:[2,30,30],haloperidol:[0.5,10,20],clozapine:[12.5,450,900],chlorpromazine:[25,300,1000],amisulpride:[50,800,1200],
    lorazepam:[0.5,4,10],clonazepam:[0.25,2,8],diazepam:[2,20,40],alprazolam:[0.25,2,6],sertraline:[25,200,200],escitalopram:[5,20,20],fluoxetine:[10,80,80],paroxetine:[10,50,60],
    'sodium valproate':[200,1500,2500],valproate:[200,1500,2500],lamotrigine:[12.5,400,500],carbamazepine:[100,800,1600],paracetamol:[500,1000,4000],naltrexone:[25,50,50],thiamine:[100,300,900]};
  const PER_DAY={'1-0-1':2,'0-0-1':1,'1-0-0':1,'1-1-1':3,'STAT':1,'Weekly':0};
  const ROUTES=['Oral','Oral liquid','Orodispersible tablet','Sublingual','IM','IM depot','IV','Topical'];
  const DEPOT_DAYS=14;

  const css=document.createElement('style');css.id='rx-safety-12nov-css';
  css.textContent=`.rx-block{border:1.5px solid #f3a6a1;background:#fff3f2;color:#912018;border-radius:12px;padding:12px 14px;margin:10px 0;font-size:13.5px}
  .rx-block b{display:block;margin-bottom:4px}.rx-block .btn{margin-top:8px}
  .rx-w2{display:flex;flex-direction:column;gap:6px;margin:8px 0}.rx-w2 div{border-radius:8px;padding:8px 10px;font-size:13px;background:var(--amber-bg,#fffaeb);color:var(--amber,#b54708);border:1px solid var(--amber-line,#fedf89)}
  .rx-w2 .lbl2{font-size:11.5px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;border:0;background:none;padding:0 2px;color:#667085}
  .rx-ex{display:flex;flex-direction:column;gap:8px;margin-top:8px}`;
  document.head.appendChild(css);

  const iso=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  const lab=s=>{const d=new Date(s+'T12:00:00');return d.toLocaleDateString('en-GB',{day:'numeric',month:'short'});};

  /* ---- checks ---- */
  function allergyState(name){
    const al=px().allergy;
    if(!al)return {block:'unrecorded'};
    const b=base(name);
    const hit=(al.list||[]).find(a=>{const x=String(a.drug||'').toLowerCase();return x&&b&&(b.includes(x)||x.includes(b));});
    return hit?{block:'match',drug:hit.drug,rx:hit.rx}:{block:''};
  }
  function currentMeds(){
    const a=(S.meds||[]).map(m=>m.name),b=((S.rounds&&S.rounds.mc)||[]).filter(c=>c.rx).map(c=>c.rx.name);
    return a.concat(b);
  }
  function interactions(name){
    const out=[],cur=currentMeds();
    PAIRS.forEach(p=>{
      if(p.same){
        if(has(name,p.a))cur.forEach(n=>{if(has(n,p.b)&&base(n)!==base(name))out.push(p.msg+' (with '+base(n)+')');});
      }else{
        if(has(name,p.a))cur.forEach(n=>{if(has(n,p.b))out.push(p.msg+' (with '+base(n)+')');});
        if(has(name,p.b))cur.forEach(n=>{if(has(n,p.a))out.push(p.msg+' (with '+base(n)+')');});
      }
    });
    return [...new Set(out)];
  }
  function doseChecks(name,freq){
    const out=[],b=Object.keys(DOSE).find(k=>base(name).startsWith(k));if(!b)return out;
    const m=String(name).match(/(\d+(?:\.\d+)?)\s*mg/i);if(!m)return out;
    const dose=+m[1],[lo,hi,day]=DOSE[b];
    if(dose>hi)out.push('Dose '+dose+' mg is above the usual single dose for '+b+' (up to '+hi+' mg).');
    else if(dose<lo)out.push('Dose '+dose+' mg is below the usual lowest dose for '+b+' ('+lo+' mg).');
    let times=PER_DAY[freq];
    if(freq==='SOS'){const mx=+(($('rxMax')||{}).value||0);times=mx||0;}
    if(times>0&&dose*times>day)out.push('Total '+(dose*times)+' mg a day is over the maximum of '+day+' mg a day for '+b+'.');
    return out;
  }

  const __open=window.psyRxOpen;
  window.psyRxOpen=function(){
    const r=__open.apply(this,arguments);
    if(!psy())return r;
    const sel=$('rxR');
    if(sel){
      sel.innerHTML=ROUTES.map(x=>'<option>'+x+'</option>').join('');
      sel.setAttribute('onchange','psyRxRoute()');
    }
    const food=$('rxFood');
    if(food&&!$('rxExtra')){
      const next=new Date();next.setDate(next.getDate()+DEPOT_DAYS);
      food.closest('label').insertAdjacentHTML('afterend',`<div class="full rx-ex" id="rxExtra"><label class="row small" style="gap:8px"><input type="checkbox" id="rxSwallow"> Observe swallow: the nurse watches the patient swallow and checks the mouth (for refusal or cheeking)</label>
        <div id="rxDepotW" style="display:none"><label class="field"><span class="lbl">Next depot due (required)</span><input class="input" type="date" id="rxDepot" value="${iso(next)}"></label><div class="tiny muted">Shows on the nursing chart under the medicine.</div></div></div>`);
    }
    psyRxCheck();return r;
  };
  window.psyRxRoute=function(){
    const r=($('rxR')||{}).value,w=$('rxDepotW');
    if(w)w.style.display=r==='IM depot'?'':'none';
    if(r==='Orodispersible tablet'||r==='Oral liquid'){const s=$('rxSwallow');if(s&&!s.dataset.set){s.checked=true;s.dataset.set='1';}}
    psyRxCheck();
  };

  const __chk=window.psyRxCheck;
  window.psyRxCheck=function(){
    const r=__chk.apply(this,arguments);
    if(!psy()||!$('rxM'))return r;
    const name=$('rxM').value.trim(),freq=($('rxF')||{}).value;
    let box=$('rxSafe');
    if(!box){box=document.createElement('div');box.id='rxSafe';const w=$('rxWarn');w.parentNode.insertBefore(box,w);}
    const add=document.querySelector('#modal .mf .btn.pri');
    let html='',blocked=false;
    const al=allergyState(name);
    if(al.block==='unrecorded'){
      blocked=true;
      html+=`<div class="rx-block"><b>Record the allergy status first</b>Nothing can be prescribed until this patient's allergies are recorded (or "no known allergies").<br><button class="btn sm" type="button" onclick="closeModal();psyAllergy('${S.pid}')">Record allergies</button></div>`;
    }else if(al.block==='match'){
      blocked=true;
      html+=`<div class="rx-block"><b>Blocked: allergy to ${hesc(al.drug)}</b>This patient is allergic to ${hesc(al.drug)}${al.rx?' ('+hesc(al.rx)+')':''}. It cannot be prescribed. Choose another medicine, or change the allergy record if it is wrong.</div>`;
    }
    const ix=name?interactions(name):[],dz=name?doseChecks(name,freq):[];
    if(ix.length||dz.length){
      html+=`<div class="rx-w2">${ix.length?'<div class="lbl2">Interactions</div>':''}${ix.map(x=>'<div>'+hesc(x)+'</div>').join('')}${dz.length?'<div class="lbl2">Dose</div>':''}${dz.map(x=>'<div>'+hesc(x)+'</div>').join('')}<label class="row small" style="gap:8px"><input type="checkbox" id="rxAck2" ${$('rxAck2')&&$('rxAck2').checked?'checked':''}> I have read these and still want to prescribe</label></div>`;
    }
    const keep=$('rxAck2')&&$('rxAck2').checked;
    box.innerHTML=html;
    if($('rxAck2')&&keep)$('rxAck2').checked=true;
    if(add){add.disabled=blocked;add.title=blocked?'Blocked until the allergy check is clear':'';}
    return r;
  };

  const __add=window.psyRxAdd;
  window.psyRxAdd=function(){
    if(!psy())return __add.apply(this,arguments);
    const name=($('rxM')||{}).value||'';
    if(name.trim()){
      const al=allergyState(name);
      if(al.block==='unrecorded'){toast('Record the allergy status first');return;}
      if(al.block==='match'){toast('Blocked: allergy to '+al.drug);return;}
      const freq=($('rxF')||{}).value;
      if((interactions(name).length||doseChecks(name,freq).length)&&!($('rxAck2')&&$('rxAck2').checked)){toast('Tick "I have read these" to go on');return;}
      if((($('rxR')||{}).value)==='IM depot'&&!($('rxDepot')||{}).value){toast('Choose when the next depot is due');return;}
    }
    const route=($('rxR')||{}).value,swallow=!!($('rxSwallow')||{}).checked,next=($('rxDepot')||{}).value;
    const nMeds=(S.meds||[]).length,mc=(S.rounds&&S.rounds.mc)||[],nMc=mc.length;
    const r=__add.apply(this,arguments);
    let spec=null;
    if((S.meds||[]).length>nMeds)spec=S.meds[S.meds.length-1];
    else{const m2=(S.rounds&&S.rounds.mc)||[];if(m2.length>nMc&&m2[m2.length-1].rx)spec=m2[m2.length-1].rx;}
    if(spec){
      spec.form=route;spec.observeSwallow=swallow;
      const bits=[];
      if(spec.time)bits.push(spec.time);
      if(route==='IM depot'&&next){spec.nextDue=next;bits.push('next due '+lab(next));}
      if(swallow)bits.push('observe swallow');
      spec.time=bits.join(' · ');
      if(swallow)spec.adv=(spec.adv?spec.adv+'. ':'')+'Observe swallow: watch the patient swallow and check the mouth.';
      try{render();}catch(e){}
    }
    return r;
  };
})();
