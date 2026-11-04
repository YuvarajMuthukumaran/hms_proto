
/* Psychiatrist and floor lead: the Nursing chart page shows only the medicine chart, one patient at a time.
   The ward cards (alerts, ward care, instructions, today by patient) stay on the nurse and RMO views. */
const __vNurseViewDoc=vNurseView;
vNurseView=function(){
  if(S.role!=='psychiatrist'&&S.role!=='lead')return __vNurseViewDoc();
  $('title').textContent='Nursing chart';
  const pts=rmoPts().map(r=>r.p),want=S.ncP||S.nFocus||'neel',sel=pts.find(p=>p.id===want)||pts[0];
  const pill=p=>`<button class="tog ${p.id===sel.id?'on':''}" onclick="S.ncP='${p.id}';render()">${hesc(p.name)} <span class="tiny" style="opacity:.7">${hesc(p.room.replace('Room ','R-'))}</span></button>`;
  return `<div><h2 style="font-size:26px">Nursing chart</h2><div class="muted" style="margin-top:4px">Medicines given, refused or held, as logged by the nurses at each round. Pick a patient.</div></div>
    ${floorTabs()}
    <div class="row" style="gap:8px;flex-wrap:wrap">${pts.map(pill).join('')}</div>
    ${ptRun(sel.id,marCard)}`;
};
