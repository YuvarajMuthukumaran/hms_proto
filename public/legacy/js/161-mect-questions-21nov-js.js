/* 21 Nov 2026, team lead: the MECT order (Orders and Consents) asked every task the same "Outcome or notes". Each of the six tasks now asks
   its own questions, taken from the Tulasi MECT document (documents/MECT FINAL.docx: Pre-ECT checklist, anaesthesia consent, MECT consent,
   MMSE, work-up, contraindications, fasting). A task is done when every required question is answered; the answers are kept on the step
   (step.ans) and written as one line into step.note, so the order log still shows them. Other orders (ketamine, DTMS ...) are unchanged. */
(function(){
  if(typeof window.psyTmOpen!=='function'||typeof window.psyTmSave!=='function')return;
  const E=s=>hesc(String(s==null?'':s));
  const yn=(k,l)=>({k,l,t:'yn'}),sel=(k,l,o)=>({k,l,t:'sel',o}),multi=(k,l,o)=>({k,l,t:'multi',o}),num=(k,l)=>({k,l,t:'num'}),
        txt=(k,l,ph)=>({k,l,t:'txt',ph,opt:1}),date=(k,l)=>({k,l,t:'date'}),time=(k,l)=>({k,l,t:'time'});
  const MEDP=['None','Hypertension','Diabetes','Heart disease','Kidney failure','Hypothyroidism','Bronchial asthma','Jaundice','Thyrotoxicosis','Steroid therapy','Drug allergy','Bleeding disorder','Epilepsy or seizures','Complication with earlier anaesthesia','Other'];
  const Q={
    'Consent for MECT':[
      yn('cap','Patient has capacity to make decisions (Section 4, MHCA 2017)'),
      yn('nr','Patient needs full support from the nominated representative'),
      txt('acc','Accompanied by (name and relation)','e.g. Ananya Bose, sister'),
      yn('capf','Capacity assessment form is on file'),
      yn('adm','Admission consent signed by the patient or nominated representative'),
      yn('info','MECT information sheet given and explained: how it is given, risks, benefits, alternatives'),
      yn('mc','MECT consent signed by the patient or nominated representative and two psychiatrists')],
    'Anaesthesia fitness':[
      yn('ac','Anaesthesia consent signed by the patient or representative and one family member'),
      multi('med','Medical problems (tick all that apply)',MEDP),
      sel('pac','Pre-anaesthetic check (PAC) fitness',['Fit','Fit with precautions','Not fit']),
      yn('ci','No contraindication: raised pressure in the head, recent heart attack, large aneurysm, brain mass'),
      yn('fast','Fasting of 6 to 8 hours before MECT explained')],
    'Blood work':[
      yn('rt','Routine blood tests sent'),
      yn('st','Special tests sent, if the anaesthetist advised any'),
      sel('res','Results checked by the RMO',['Normal','Abnormal, doctor informed','Waiting for results']),
      txt('abn','Abnormal values, if any','e.g. potassium 3.1')],
    'Mini-Mental State Exam (MMSE)':[
      num('score','MMSE score before MECT (out of 30)'),
      sel('int','Cognition',['Normal','Mild impairment','Moderate impairment','Severe impairment']),
      date('on','Date done')],
    'Physical examination and ECG':[
      yn('pe','Physical examination done'),
      txt('vit','BP and pulse','e.g. 124/80, 78 per minute'),
      sel('ecg','ECG',['Normal','Abnormal, doctor informed','Not done']),
      yn('fun','Fundus examination done'),
      yn('teeth','Loose teeth and dentures checked')],
    'Schedule the first session':[
      date('d','Date of the first session'),
      time('t','Time'),
      num('n','Number of sessions planned'),
      yn('nbm','Ward told to keep the patient nil by mouth for 6 to 8 hours'),
      yn('fam','Family told the date')]
  };
  const orderOf=id=>((psyPx(S.pid)||{}).tmp||[]).find(o=>o.id===id);
  const ansOf=(id,i)=>{const o=orderOf(id);if(!o)return {};const s=o.steps[i];return s.ans=s.ans||{};};
  const done=(q,a)=>q.opt||(q.t==='multi'?(a[q.k]||[]).length>0:a[q.k]!==undefined&&a[q.k]!=='');
  const chip=(on,label,attrs,cls)=>`<button type="button" class="tog ${on?'on':''}" style="height:30px;font-size:12.5px;${on&&cls?cls:''}" ${attrs}>${E(label)}</button>`;
  function field(id,i,q,a){
    const at=`data-id="${E(id)}" data-i="${i}" data-k="${q.k}"`;
    let c='';
    if(q.t==='yn')c='<div class="mini-chips">'+['Yes','No'].map(v=>chip(a[q.k]===v,v,`${at} data-v="${v}" onclick="mtPick(this)"`,v==='Yes'?'border-color:#12b76a;color:#067647;':'border-color:#f79009;color:#b54708;')).join('')+'</div>';
    else if(q.t==='sel')c='<div class="mini-chips">'+q.o.map(v=>chip(a[q.k]===v,v,`${at} data-v="${E(v)}" onclick="mtPick(this)"`)).join('')+'</div>';
    else if(q.t==='multi')c='<div class="mini-chips">'+q.o.map(v=>chip((a[q.k]||[]).includes(v),v,`${at} data-v="${E(v)}" data-m="1" onclick="mtPick(this)"`)).join('')+'</div>';
    else c=`<input class="input" style="max-width:${q.t==='txt'?'100%':'220px'}" type="${q.t==='num'?'number':q.t==='date'?'date':q.t==='time'?'time':'text'}" ${q.t==='num'?'min="0" max="60"':''} value="${E(a[q.k]||'')}" placeholder="${E(q.ph||'')}" ${at} oninput="mtTxt(this)">`;
    return `<div class="field" style="margin-bottom:12px"><span class="lbl">${E(q.l)}${q.opt?' <span class="tiny muted">(optional)</span>':''}</span>${c}</div>`;
  }
  const short=l=>l.split(' (')[0];
  const summary=(qs,a,extra)=>qs.map(q=>{const v=q.t==='multi'?(a[q.k]||[]).join(', '):a[q.k];return v===undefined||v===''?'':short(q.l)+': '+v;}).filter(Boolean).join('; ')+(extra?'; Note: '+extra:'');
  window.mtPick=function(b){
    const d=b.dataset,a=ansOf(d.id,+d.i);
    if(d.m){const cur=a[d.k]||[];let n=cur.includes(d.v)?cur.filter(x=>x!==d.v):cur.concat(d.v);if(d.v==='None')n=cur.includes('None')?[]:['None'];else n=n.filter(x=>x!=='None');a[d.k]=n;}
    else a[d.k]=a[d.k]===d.v?'':d.v;
    window.psyTmOpen(d.id,+d.i);
  };
  window.mtTxt=function(el){const d=el.dataset;ansOf(d.id,+d.i)[d.k]=el.value;};
  const __open=window.psyTmOpen,__save=window.psyTmSave;
  window.psyTmOpen=function(id,i){
    const r=__open.apply(this,arguments);
    try{
      const o=orderOf(id);if(!o||o.key!=='mect')return r;
      i=Math.max(0,Math.min(i,o.steps.length-1));const s=o.steps[i],qs=Q[s.n];if(!qs)return r;
      const ta=document.getElementById('tm9_t');if(!ta)return r;
      const lab=ta.closest('label'),a=ansOf(id,i);
      const box=document.createElement('div');box.id='mtForm';
      box.innerHTML=qs.map(q=>field(id,i,q,a)).join('')+`<label class="field"><span class="lbl">Anything else to note <span class="tiny muted">(optional)</span></span><textarea class="input" id="tm9_x" rows="2" placeholder="Only if there is something to add">${E(a.__x||'')}</textarea></label><textarea id="tm9_t" style="display:none"></textarea>`;
      lab.replaceWith(box);
      const x=document.getElementById('tm9_x');if(x)x.addEventListener('input',()=>{a.__x=x.value;});
      const e=document.getElementById('tm9_e');if(e)e.textContent='Answer every question first';
    }catch(err){}
    return r;
  };
  window.psyTmSave=function(id,i){
    const o=orderOf(id);
    if(o&&o.key==='mect'&&Q[o.steps[i].n]){
      const qs=Q[o.steps[i].n],a=ansOf(id,i),x=document.getElementById('tm9_x'),extra=x?x.value.trim():(a.__x||'');
      if(x)a.__x=x.value;
      if(!qs.every(q=>done(q,a))){const e=document.getElementById('tm9_e');if(e){e.textContent='Answer every question first';e.style.display='block';}return;}
      const ta=document.getElementById('tm9_t');if(ta)ta.value=summary(qs,a,extra)||'Done';
    }
    return __save.apply(this,arguments);
  };
})();
