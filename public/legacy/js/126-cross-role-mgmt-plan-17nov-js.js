/* 17 Nov 2026, Trello: "Psychiatrist should be able to see the management plan by psychologist and vice-versa
   (as read only)". Both plans already live on the same per-patient object (psyPx(pid).mgmt for the psychiatrist,
   .mgmtPsych for the psychologist) -- wraps pPlans once more (after 54's psychiatrist form and 55's psychologist
   form) and appends a read-only card of the OTHER role's plan underneath the one being edited. Nothing new is
   saved here; this only reads and displays. Empty (nothing filled in by the other role yet): no card. */
(function(){
  const px=()=>psyPx(S.pid);
  const esc=s=>hesc(String(s==null?'':s));
  const PSY_MP=[['dx','Diagnosis'],['goals','Goals of treatment'],['exp','Expectation from treatment'],['meds','Medicines and why'],['therapy','Therapies planned'],['risk','Risk management'],['mon','Monitoring'],['stay','Expected length of stay'],['dc','Plan for discharge'],['rev','Review date']];
  const PSYCH_MP=[['therapyPlan','Therapy plan'],['formulation','Psychological formulation'],['goals','Goals of therapy'],['expect','Expectation from treatment'],['family','Family involvement'],['risk','Risks to watch for'],['assess','Planned assessments'],['acts','Planned behavioural activations'],['review','Review date']];
  function readOnlyCard(title,sub,fields,m){
    m=m||{};
    const val=v=>Array.isArray(v)?v.join(', '):v;
    const rows=fields.filter(([k])=>{const v=val(m[k]);return v&&String(v).trim();}).map(([k,l])=>`<div class="box small"><div class="lbl">${esc(l)}</div><div style="margin-top:4px">${esc(val(m[k]))}</div></div>`).join('');
    /* 18 Nov 2026: the card is always there, so the other role's plan can be found even before it is written */
    if(!rows)return `<section class="card" style="margin-top:14px"><div class="hd"><div><h3>${title}</h3><div class="small muted" style="margin-top:4px">${sub}</div></div></div><div class="pad"><div class="callout grey small">${/Psychologist/.test(title)?'The psychologist':'The psychiatrist'} has not written a plan for this stay yet.</div></div></section>`;
    const status=m.signed?`Signed by ${esc(m.signed.by)}, ${esc(m.signed.at)}.`:'Not signed yet.';
    return `<section class="card" style="margin-top:14px"><div class="hd"><div><h3>${title}</h3><div class="small muted" style="margin-top:4px">${sub}</div></div></div>
      <div class="pad grid2">${rows}</div>
      <div class="pad" style="padding-top:0"><div class="callout grey small">${status}</div></div></section>`;
  }
  const __pl=pPlans;
  pPlans=function(){
    const h=__pl.apply(this,arguments);
    if(typeof h!=='string')return h;
    if(S.role==='psychiatrist')return h+readOnlyCard('Management Plan · Psychologist',"The psychologist's plan for this stay. Read only.",PSYCH_MP,px().mgmtPsych);
    if(S.role==='psychologist')return h+readOnlyCard('Management Plan · Psychiatrist',"The psychiatrist's plan for this stay. Read only.",PSY_MP,px().mgmt);
    return h;
  };
})();
