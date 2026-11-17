/* 17 Nov 2026, Trello: "Psychiatrist should be able to see the management plan by psychologist and vice-versa
   (as read only)". Both plans already live on the same per-patient object (psyPx(pid).mgmt for the psychiatrist,
   .mgmtPsych for the psychologist) -- wraps pPlans once more (after 54's psychiatrist form and 55's psychologist
   form) and appends a read-only card of the OTHER role's plan underneath the one being edited. Nothing new is
   saved here; this only reads and displays. Empty (nothing filled in by the other role yet): no card. */
(function(){
  const px=()=>psyPx(S.pid);
  const esc=s=>hesc(String(s==null?'':s));
  const PSY_MP=[['dx','Diagnosis'],['goals','Goals of treatment'],['meds','Medicines and why'],['therapy','Therapies planned'],['risk','Risk management'],['mon','Monitoring'],['stay','Expected length of stay'],['dc','Plan for discharge'],['rev','Review date']];
  const PSYCH_MP=[['formulation','Psychological formulation'],['goals','Goals of therapy'],['therapies','Therapies planned and how often'],['family','Family involvement'],['risk','Risks to watch for'],['review','Review date']];
  function readOnlyCard(title,sub,fields,m){
    const rows=fields.filter(([k])=>m&&m[k]).map(([k,l])=>`<div class="box small"><div class="lbl">${esc(l)}</div><div style="margin-top:4px">${esc(m[k])}</div></div>`).join('');
    if(!rows)return '';
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
