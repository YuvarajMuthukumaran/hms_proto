/* Basic workspaces for the two new prototype roles.
   Floor Lead Psychiatrist reuses the psychiatrist workspace and its tabs; Patient Experience Lead reuses the psychologist workspace. */
(function(){
  const requested=window.__TULASI__&&window.__TULASI__.role;

  if(requested==='floor-lead-psychiatrist'){
    ROLE.psychiatrist.myday=function(){
      const pts=allPts(),newPts=pts.filter(p=>p.day<=1),highRisk=pts.filter(p=>p.risk),alerts=V3.openAlerts(a=>!a.ack);
      const actions=`<div class="row" style="gap:8px;flex-wrap:wrap"><button class="btn pri" onclick="go('#/admissions')">New admission</button><button class="btn" onclick="go('#/inpatients')">All patients</button></div>`;
      const admissions=newPts.length?newPts.map(p=>`<div class="li"><div class="grow"><b>${hesc(p.name)}</b><div class="tiny muted">${hesc(p.room||'Room not assigned')} · ${hesc(p.dx||'Diagnosis pending')}</div></div><button class="btn sm pri" onclick="go('#/patient/${p.id}/admission')">Open admission workup</button></div>`).join(''):'<div class="pad small muted">No new admissions need follow-up.</div>';
      const roster=pts.map(p=>`<tr><td><b>${hesc(p.name)}</b>${p.risk?` <span class="chip c-red">High risk</span>`:''}</td><td>${hesc(p.room||'—')}</td><td class="small">${hesc(p.dx||'—')}</td><td style="text-align:right"><div class="row" style="justify-content:flex-end;gap:6px"><button class="btn sm pri" onclick="psyPopNote('${p.id}')">Write daily note</button><button class="btn sm" onclick="go('#/patient/${p.id}/overview')">Open record</button></div></td></tr>`).join('');
      return V3.head('Floor Lead Psychiatrist','Psychiatry oversight across the floor: follow new admissions, review high-risk patients and complete daily notes.',actions)
        +`<div class="v3kpis">${V3.kpi('Patients on the floor',pts.length,'Current inpatient census','')}${V3.kpi('New admissions',newPts.length,'Admission workup follow-up',newPts.length?'warn':'ok')}${V3.kpi('High risk',highRisk.length,'Patients to coordinate closely',highRisk.length?'warn':'ok')}${V3.kpi('Unacknowledged alerts',alerts.length,'Alerts awaiting psychiatrist review',alerts.length?'warn':'ok')}</div>`
        +`<section class="card"><div class="hd"><div><h3>Admission follow-up</h3><div class="small muted" style="margin-top:4px">Newly admitted patients and their workup</div></div></div>${admissions}</section>`
        +`<section class="card"><div class="hd"><div><h3>Floor patient list</h3><div class="small muted" style="margin-top:4px">Write a daily note without leaving the dashboard, or open the patient record</div></div></div><div class="scroll"><table class="t"><thead><tr><th>Patient</th><th>Room</th><th>Diagnosis</th><th></th></tr></thead><tbody>${roster}</tbody></table></div></section>`;
    };
  }

  if(requested==='patient-experience-lead'){
    ROLE.psychologist.myday=function(){
      const pts=allPts();
      const concerns=pts.flatMap(p=>{
        const c=ptCtxOf(p.id)||{};
        return (Array.isArray(c.pgriev)?c.pgriev:[]).map((g,i)=>({p,g,i}));
      });
      const open=concerns.filter(x=>!(/^(resolved|closed)$/i.test(String(x.g.st||''))));
      const queue=open.length?open.map(({p,g})=>`<div class="li" style="align-items:flex-start"><div class="grow"><div class="row" style="gap:8px;flex-wrap:wrap"><b>${hesc(p.name)}</b>${chip(g.sla||'Open','c-amber')}</div><div class="small" style="margin-top:4px">${hesc(g.from||'Concern')}: ${hesc(g.t||'Details not entered')}</div><div class="tiny muted">${hesc(g.via||'Patient or family')} · ${hesc(p.room||'')}</div></div><button class="btn sm pri" onclick="go('#/patient/${p.id}/prefs')">Open experience</button></div>`).join(''):'<div class="pad small muted">No open concerns. Review a patient record to update preferences or log feedback.</div>';
      const patients=pts.map(p=>`<div class="li"><div class="grow"><b>${hesc(p.name)}</b><div class="tiny muted">${hesc(p.room||'Room not assigned')} · ${hesc(p.dx||'Diagnosis pending')}</div></div><button class="btn sm" onclick="go('#/patient/${p.id}/prefs')">Patient Experience</button></div>`).join('');
      const actions=`<div class="row" style="gap:8px;flex-wrap:wrap"><button class="btn pri" onclick="go('#/inpatients')">Find a patient</button></div>`;
      return V3.head('Patient Experience','Review concerns, open patient experience records, and log feedback on a patient’s record.',actions)
        +`<div class="v3kpis">${V3.kpi('Patients',pts.length,'Open a record to review preferences','')}${V3.kpi('Open concerns',open.length,'Grievances awaiting follow-up',open.length?'warn':'ok')}</div>`
        +`<section class="card"><div class="hd"><div><h3>Open concerns</h3><div class="small muted" style="margin-top:4px">Review the patient’s record to respond or log new feedback</div></div></div>${queue}</section>`
        +`<section class="card"><div class="hd"><div><h3>Patient experience records</h3><div class="small muted" style="margin-top:4px">Preferences, family communication and grievances</div></div></div>${patients}</section>`;
    };
  }
})();
