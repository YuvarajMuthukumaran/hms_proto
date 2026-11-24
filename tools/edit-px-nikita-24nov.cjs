/* 24 Nov 2026 (Nikita, WhatsApp): Grievances buttons say what they do; Reports "Needs attention now" rows open the
   grievance or the patient, and Needs attention + Team sit side by side. */
const rep=require('./rep.cjs');
rep('public/px/grievances.html',[
 [`<button class="btn ic" data-a="remind" title="Remind '+esc(c.owner||'the owner')+'" aria-label="Remind the owner">🔔</button><button class="btn ic" data-a="esc" title="Raise to Chandra ji" aria-label="Raise to Chandra ji" style="color:var(--red)">↑</button>`,
  `<button class="btn" data-a="remind" title="Send a reminder to '+esc(c.owner||'the owner')+' to finish this">🔔 Remind owner</button><button class="btn" data-a="esc" title="Raise it to Chandra ji (GM Operations)" style="color:var(--red)">↑ Raise to Chandra ji</button>`],
 [`/* the app may hand over which grievance to open */`,
  `/* the app may hand over which grievance to open (Reports sets px_gopen before switching here) */
function gOpen(id){V.sel=id;const c=all().find(x=>x.id===id);V.f=c?(c.st>=4?'closed':c.st>=2?'confirm':'open'):'open';}
try{const g=localStorage.getItem('px_gopen');if(g){localStorage.removeItem('px_gopen');gOpen(g);}}catch(e){}`],
]);
rep('public/px/reports.html',[
 [`ATT[0].items=open.filter(c=>c.at&&now-c.at>6*36e5).map(c=>[esc(c.id+' · '+(c.pname||'')),`,
  `const pn=c=>{const h=pts.find(x=>x.id===c.pid);return c.id+' · '+((h&&h.name)||c.pname||'Patient')+((h&&h.room)?' · Room '+String(h.room).replace(/^Room\\s*/,''):'');};
  ATT[0].items=open.filter(c=>c.at&&now-c.at>6*36e5).map(c=>[esc(pn(c)),`],
 [`' h over')]);`, `' h over'),'g:'+c.id]);`],
 [`.map(c=>[esc(c.id+' · '+(c.pname||'')),esc(c.owner||'')]);`, `.map(c=>[esc(pn(c)),esc(c.owner||''),'g:'+c.id]);`],
 [`.map(h=>[nm(h),'no call in 7 days']);`, `.map(h=>[nm(h),'no call in 7 days','p:'+(h.name||'')]);`],
 [`' h ago']);
  RAISE.length=0;`, `' h ago','p:'+(h.name||'')]);
  RAISE.length=0;`],
 [`(n?a.items.map(x=>'<div><span>'+x[0]+'</span><span>'+x[1]+'</span></div>').join('')`,
  `(n?a.items.map(x=>'<div'+(x[2]?' class="go" role="button" tabindex="0" data-go="'+esc(x[2])+'" title="'+(x[2][0]==='g'?'Open this grievance':'Open the patient')+'"':'')+'><span>'+x[0]+'</span><span>'+x[1]+(x[2]?' ›':'')+'</span></div>').join('')`],
 [`  '<div class="card">'+
    '<div class="ch"><h3>Needs attention now</h3>`, `  '<div class="two">'+
  '<div class="card">'+
    '<div class="ch"><h3>Needs attention now</h3>`],
 [`    '<div id="team">'+teamRows+teamTotal+teamLegend+'</div>'+
  '</div>'+`, `    '<div id="team">'+teamRows+teamTotal+teamLegend+'</div>'+
  '</div>'+
  '</div>'+`],
 [`  const t=e.target.closest('[data-seg],[data-att],[data-mtab],[data-dl]');`,
  `  const g=e.target.closest('[data-go]');
  if(g){const v=g.dataset.go,id=v.slice(2);
    if(v[0]==='g'){try{localStorage.setItem('px_gopen',id);}catch(x){}try{if(window.parent!==window){window.parent.postMessage({pxNav:'grievances'},'*');return;}}catch(x){}location.href='grievances.html';}
    else{try{if(window.parent!==window){window.parent.postMessage({pxNav:'patients',pxOpen:id},'*');return;}}catch(x){}try{localStorage.setItem('pxopen',id);}catch(x){}location.href='patients.html';}
    return;}
  const t=e.target.closest('[data-seg],[data-att],[data-mtab],[data-dl]');`],
 [`.two{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}`,
  `.two{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;align-items:start}.two>.card{margin:0}.sub-att .go{cursor:pointer}.sub-att .go:hover{background:#EEF4FD}.sub-att .go:hover span:first-child{color:#1e6cdb;text-decoration:underline}`],
]);
/* Rounds: Step 2 is the grievance category set (the lead app's routes: same names and owners); Step 3 is the
   sub-category of the one picked. A list saved in Setting before this (old topics) is ignored for this part. */
rep('public/px/rounds.html',[
 [`const AB=[
 ['Food',`, `const AB=[
 ['Doctor communication','Treating psychiatrist','Doctor communication',['Wants to talk to the doctor','Doctor not seen today','Not told about the diagnosis','Wants a second opinion']],
 ['Treatment progress','Treating psychiatrist','Treatment progress',['Medicine side effects','Not feeling better','Wants to know when they go home','Unhappy with the treatment plan']],
 ['Therapist continuity','Psychology team lead','Therapist continuity',['Therapy sessions missed','Therapist changed','Wants more sessions']],
 ['Family updates','Psychology team lead','Family updates',['Wants to call family','Wants a visit','Family not getting updates','Does not want a certain visitor']],
 ['Nursing care','Nursing in-charge','Nursing care',['Ignored when asked for help','Medicine given late','Cannot sleep','Spoke rudely']],
 ['Food and dietary','Kitchen supervisor','Food and dietary',['Food served cold','Not the diet I asked for','Not enough, still hungry','Meal times','Taste or quality','Drinking water']],
 ['Room and housekeeping','Housekeeping supervisor','Room and housekeeping',['Not clean','Bathroom','Too noisy at night','Too hot or cold, AC','Bed or bedding','Light, fan or TV not working','Disturbed by roommate']],
 ['Attendants and security','Floor supervisor','Attendants and security',['Attendant spoke rudely','Argument with another patient','Wants a room change','Felt threatened by another patient'],['Felt threatened by another patient']],
 ['Belongings','Front desk','Belongings',['Item missing','Laundry not returned','Needs things from home','Wants phone or money back']],
 ['Billing and insurance','Billing desk','Billing and insurance',['Billing question','Charges not explained','Insurance or TPA']],
 ['Medicines at discharge','Pharmacy desk','Medicines at discharge',['Medicines not ready','Prescription not clear']],
 ['Rights','Kanika and Chandraji','Rights',['Wants to leave now','Does not know why they are here','Wants to make a formal complaint','Wants to see own records']],
 ['Safety','Chandraji and treating doctor','Safety',['Rough handling or force','Felt unsafe with a staff member','Felt threatened by another patient','Talks of self-harm'],['Rough handling or force','Felt unsafe with a staff member','Felt threatened by another patient','Talks of self-harm']],
 ['Other','You','Other',['Nothing to do, bored','Wants outdoor time','Wants yoga, gym or games','Something else']]
];
const AB_OLD=[
 ['Food',`],
 [`try{const L=JSON.parse(localStorage.getItem(LKEY)||'null');if(L&&L.RG&&L.CG&&L.AB)applyLists(L);}catch(e){}`,
  `try{const L=JSON.parse(localStorage.getItem(LKEY)||'null');if(L&&L.RG&&L.CG&&L.AB){if(!L.AB.some(x=>x[0]==='Safety'))delete L.AB;applyLists(L);}}catch(e){}`],
]);
rep('public/px/rounds-v2.js',[
 [`(T ? '<div class="rv-fl" style="margin-top:8px">' + (T[3] || [])`, `(T ? '<h4 style="margin-top:12px">Step 3 · ' + esc(T[0]) + ': what exactly?</h4><div class="rv-fl" style="margin-top:6px">' + (T[3] || [])`],
 [`(GOES[T[0]] || T[1])) + '</div>'`, `(GOES[T[0]] || (T[1] === 'You' ? 'Patient experience (you)' : T[1]) + ' · 6 h')) + '</div>'`],
 [`'Leaving or rights': 'Treating psychiatrist now, DAMA flag on Today',`, `'Leaving or rights': 'Treating psychiatrist now, DAMA flag on Today', Rights: 'Kanika and Chandraji · 6 h, DAMA flag on Today if leaving', Safety: 'Chandraji and the treating doctor · now',`],
]);
/* Log a call or concern: "Someone raised a concern" opens the new pop-up (public/px/px-log-concern.js) with Nikita's
   fields; the old concern part of the lead modal is no longer reached. */
rep('public/px-lead-prototype.html',[
 [`{ label: 'Someone raised a concern', cls: 'lz-chip' + (NZ.isConcern ? ' on' : ''), pick: function () { self.setState({ form: Object.assign({}, self.state.form, { kind: 'concern' }) }); } }`,
  `{ label: 'Someone raised a concern', cls: 'lz-chip' + (NZ.isConcern ? ' on' : ''), pick: function () { var pid0 = self.state.form.pid || window.__pxCtxPid || ''; if (window.PXLog) { self.setState({ logOpen: false }); window.PXLog.open(self, pid0); return; } self.setState({ form: Object.assign({}, self.state.form, { kind: 'concern' }) }); } }`],
 [`<script src="/px/px-real.js"></script>`, `<script src="/px/px-real.js"></script><script src="/px/px-log-concern.js"></script>`],
]);
/* the lead app looks up c.src in its own source table; the new "Came in as" names are not in it */
rep('public/px-lead-prototype.html',[
 [`var srcKeyOf = function (c) { return c.src || (`, `var srcKeyOf = function (c) { return (c.src && SRCL[c.src]) ? c.src : (`],
]);
/* Team rows fit the half-width card */
rep('public/px/reports.html',[
 [`.two>.card{margin:0}`, `.two>.card{margin:0}.two .row{grid-template-columns:150px minmax(0,1fr) 96px;gap:12px}`],
 [`const teamLegend='<div class="row" style="padding-top:8px;padding-bottom:12px"><span></span><span style="font-size:12.5px;color:var(--mute)">The line is the '+t+'% target. Orange is below it.</span><span></span></div>';`,
  `const teamLegend='<div style="padding:8px 18px 12px;font-size:12.5px;color:var(--mute)">The line is the '+t+'% target. Orange is below it.</div>';`],
]);
