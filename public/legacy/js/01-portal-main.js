

/* ---------- data ---------- */
const S = {
  role: 'psychiatrist',
  done: {}, // task ids done
  dailySaved: false, familySent: false, scribeDaily: false,
  historyStatus: 'overdue', historyDraft: false,
  capacityOpen: false, capacityDone: false, section: '89',
  plansSigned: {psy:false, psych:false},
  psychRows: [
    {area:'Poor sleep and irritability', iv:'Sleep hygiene, relaxation training', req:'4', done:'2', when:'Mon, Thu 4 pm', out:'Sleep improving'},
    {area:'Limited insight', iv:'Psychoeducation on bipolar disorder', req:'3', done:'1', when:'Wed 11 am', out:'Engaging'}
  ],
  dx: 'Bipolar affective disorder, current episode manic without psychotic symptoms',
  meds: [
    {name:'Lithium carbonate 400 mg', freq:'1-0-1', time:'After food', range:'18 Oct to 17 Nov', by:'Dr. Aanya Sharma', at:'18 Oct 2026, 11:40 am'},
    {name:'Olanzapine 10 mg', freq:'0-0-1', time:'After food', range:'18 Oct to 17 Nov', by:'Dr. Aanya Sharma', at:'18 Oct 2026, 11:40 am'},
    {name:'Lorazepam 1 mg', freq:'SOS', time:'As needed', range:'18 Oct to 24 Oct', by:'Dr. Sameer Khan', at:'18 Oct 2026, 11:55 pm'}
  ],
  medsOff: [
    {name:'Olanzapine 5 mg', freq:'0-0-1', time:'After food', range:'18 Oct to 18 Oct', by:'Dr. Aanya Sharma', at:'18 Oct 2026, 11:20 am', offBy:'Dr. Aanya Sharma', offAt:'18 Oct 2026, 11:40 am', why:'Dose increased to 10 mg', doses:[]}
  ],
  consents: [
    {name:'Admission consent and letter of undertaking', who:'Family', st:'Signed 18 Oct 2026, 11:05 am by Ananya Bose (sister) · taken by Meena Arora, front desk · witness Sister Rekha', c:'c-green'},
    {name:'Form E · Admission with high support needs', who:'Family', st:'Signed 18 Oct 2026, 11:10 am by Ananya Bose (sister) · taken by Meena Arora, front desk', c:'c-green'},
    {name:'Form C · Independent admission', who:'Patient', st:'Not taken at admission · noted by Dr. Aanya Sharma, 18 Oct 2026, 11:30 am', c:'c-grey'},
    {name:'High risk informed consent', who:'Family', st:'Signed 18 Oct 2026, 11:15 am by Ananya Bose (sister) · explained by Dr. Aanya Sharma · taken by Meena Arora, front desk', c:'c-green'}
  ],
  calls: {h24:'done', d34psy:'due', d34psych:'due'},
  therapyNotes: [{d:'22 Oct', wk:1, t:'Individual session · Psychoeducation on mood episodes', by:'Priya Nair', body:'Aim: understand mood episodes. Used a mood chart to map the last 3 weeks. Neel linked reduced sleep to the start of spending. Outcome: engaged, partial insight. Next: early warning signs.'},{d:'19 Oct', wk:1, t:'Intake session · Rapport and goals', by:'Priya Nair', body:'Aim: build rapport and agree goals. Irritable at start, settled after 15 minutes. Goals agreed: sleep routine, understanding the illness, plan with sister. Next: psychoeducation.'}],
  team: {psy:'Dr. Aanya Sharma', psych:'Priya Nair'},
  discharge: {capacity:false, risk:false, formC:false, meds:false, followups:false, family:false, summary:false, dconsent:false},
  obs: 'Every 15 minutes', edd: '2026-11-02', eddShared: false, labs: [{t:'Serum lithium', d:'Tomorrow, 7:00', st:'Ordered', by:'Dr. Aanya Sharma', at:'23 Oct 2026, 10:40 am'}], restraints: [],
  obsBy: {by:'Dr. Aanya Sharma', at:'18 Oct 2026, 11:45 am'}, eddBy: {by:'Dr. Aanya Sharma', at:'24 Oct 2026, 10:15 am'},
  dischargeDrafted:false, draftBy:'', signer:'', discharged:false, dtype:'Planned', reassessDone:false,
  rounds: {mc:[], adv:[], ward:'Male ward', idx:{'Male ward':0,'Female ward':0,'De-addiction ward':0}, listening:false, drafted:false},
  admNo: 2,
  events: [
    {id:1,when:'24 Oct, 2:10 am',type:'Fall',sev:'Minor',by:'Sister Rekha · nurse',duty:'Dr. Sameer Khan · duty doctor',detail:'Slipped on the way to the bathroom. No head injury, small bruise on left knee. Vitals stable; neuro checks every 2 hours till morning. Bed lowered, night light on.',ack:false},
    {id:2,when:'22 Oct, 11:30 am',type:'Adverse drug reaction',sev:'Minor',by:'Brother Joseph · nurse',duty:'Dr. Aanya Sharma',detail:'Mild hand tremor after morning doses. Reviewed on round; lithium level ordered.',ack:true}
  ],
  pastAdm: [{n:1,dates:'4 Feb to 6 Mar 2025',days:30,psy:'Dr. Aanya Sharma',psych:'Priya Nair',sec:'Section 89',dx:'Bipolar affective disorder, current episode manic',
    cond:'Settled, partial insight',meds:['Lithium carbonate 400 mg · 1-0-1','Olanzapine 10 mg · 0-0-1'],plan:'Lithium maintenance; psychoeducation; relapse signs agreed with family',
    notes:[['6 Mar','Discharge round · Dr. Aanya Sharma','Settled, partial insight. Continue lithium; follow-up after 7 days.'],['4 Mar','Daily note · Priya Nair','Slept well, ate all meals, joined group therapy and yoga.'],['1 Mar','Family session · Priya Nair','Sister briefed on early warning signs and medicine supervision.'],['20 Feb','Round note · Dr. Aanya Sharma','Elation reducing, sleeping 6 hours. Olanzapine continued.'],['10 Feb','Capacity assessment','Needs 100% support from nominated representative.'],['5 Feb','Detailed history','First manic episode after job stress; maternal uncle treated for bipolar disorder.']]}],
  scope: 'floor', diet: {type:'Vegetarian', avoid:'None known', notes:'No onion or garlic on Tuesdays; prefers roti to rice'}, pgriev: [{from:'Family',t:'Updates feel repetitive',via:'Detractor feedback',own:'Priya Nair',st:'Open',sla:'5 h left',by:'Pooja Malhotra, family coordinator',at:'24 Oct 2026, 10:58 am'},{from:'Patient',t:'Room too noisy at night',via:'Told ward staff',own:'Nursing head (Sister Mary)',st:'Resolved: quiet hours after 22:00',by:'Sister Rekha, nurse',at:'21 Oct 2026, 11:40 pm',doneBy:'Sister Mary, nursing head',doneAt:'22 Oct 2026, 9:15 am'}],
  rp: true, rpt: 'timeline', dn: {}, rx: [], ptq: '',
};
const PTS = [
  {id:'arjun', age:34, sex:'M', uhid:'2026-27RG6812', name:'Arjun Mehta', ini:'AM', room:'Room 210', day:12, sec:'89', risk:false, dx:'Severe depressive episode'},
  {id:'varun', age:41, sex:'M', uhid:'2026-27RG6870', name:'Varun Rao', ini:'VR', room:'Room 211', day:4, sec:'89', risk:false, dx:'Alcohol dependence, withdrawal'},
  {id:'kabir', age:26, sex:'M', uhid:'2026-27RG6731', name:'Karan Malhotra', ini:'KM', room:'Room 212 A', day:21, sec:'90', risk:false, dx:'Schizophrenia'},
  {id:'sameer', age:22, sex:'M', uhid:'2026-27RG6905', name:'Sameer Das', ini:'SD', room:'Room 213 A', day:7, sec:'89', risk:false, dx:'Obsessive-compulsive disorder'},
  {id:'neel', age:23, sex:'M', uhid:'2026-27RG6990', name:'Neel Bose', ini:'NB', room:'Room 213 A', day:6, sec:'89', risk:true, dx:'Bipolar affective disorder, manic'},
  {id:'rohit', age:38, sex:'M', uhid:'2026-27RG7012', name:'Rohit Kapoor', ini:'RK', room:'Suite 201', day:0, sec:'89', risk:false, dx:'Admitted today'},
  {id:'dev', age:31, sex:'M', uhid:'2026-27RG6788', name:'Dev Kumar', ini:'DK', room:'Room 215 A', day:15, sec:'89', risk:false, dx:'Opioid dependence', dischargeToday:true},
  {id:'tarun', age:19, sex:'M', uhid:'2026-27RG6961', name:'Tarun Roy', ini:'TR', room:'Room 216 · Observation', day:3, sec:'89', risk:true, dx:'Acute psychotic episode'}
];
const EX = {arjun:['Routine','Re-assessment · Mon','28 Oct'],varun:['Every 30 minutes','Daily note','Not set'],kabir:['Routine','Re-assessment · today','30 Oct'],sameer:['Routine','Capacity · 1 day late','Not set'],neel:['Every 15 minutes','History · 1 day late','2 Nov'],rohit:['Every 15 minutes','Workup · today','Not set'],dev:['Routine','Summary to sign','Today'],tarun:['1:1 constant','Day 3 to 4 call · today','Not set']};
const PTS_F = [
  {id:'meera', name:'Meera Iyer', ini:'MI', room:'Room 310 A', day:9, sec:'89', risk:false, dx:'Severe depressive episode'},
  {id:'sana', name:'Sana Qureshi', ini:'SQ', room:'Room 311', day:3, sec:'89', risk:true, dx:'Acute psychotic episode'},
  {id:'ritu', name:'Ritu Malhotra', ini:'RM', room:'Room 312 B', day:14, sec:'90', risk:false, dx:'Bipolar affective disorder, depressed'},
  {id:'kavya', name:'Kavya Menon', ini:'KM', room:'Room 313', day:6, sec:'89', risk:false, dx:'Anorexia nervosa'},
  {id:'pooja', name:'Pooja Bhatt', ini:'PB', room:'Room 314 A', day:1, sec:'89', risk:false, dx:'Admitted yesterday'}
];
const PTS_D = [
  {id:'aman', name:'Aman Gill', ini:'AG', room:'Room 120', day:5, sec:'89', risk:false, dx:'Alcohol dependence, withdrawal'},
  {id:'yash', name:'Yash Arora', ini:'YA', room:'Room 121 A', day:11, sec:'89', risk:false, dx:'Opioid dependence'},
  {id:'nikhil', name:'Nikhil Jain', ini:'NJ', room:'Room 122', day:2, sec:'89', risk:true, dx:'Alcohol withdrawal, delirium risk'},
  {id:'rahul', name:'Rahul Sethi', ini:'RS', room:'Room 123 B', day:18, sec:'89', risk:false, dx:'Cannabis dependence'}
];
const WARDS = {'Male ward':PTS,'Female ward':PTS_F,'De-addiction ward':PTS_D};
Object.assign(EX,{meera:['Routine'],sana:['1:1 constant'],ritu:['Routine'],kavya:['Every 30 minutes'],pooja:['Every 15 minutes'],aman:['Every 30 minutes'],yash:['Routine'],nikhil:['Every 15 minutes'],rahul:['Routine']});
function obsChip(id){const o=EX[id][0];return chip(o,o.startsWith('1:1')?'c-red':(o.includes('15')?'c-amber':'c-grey'));}
const ICD = [
  ['6A60.0','Bipolar type I disorder, current episode manic, without psychotic symptoms'],
  ['6A60.1','Bipolar type I disorder, current episode manic, with psychotic symptoms'],
  ['6A70','Single episode depressive disorder'],
  ['6A71','Recurrent depressive disorder'],
  ['6A20','Schizophrenia'],
  ['6B20','Obsessive-compulsive disorder'],
  ['6C40.3','Alcohol dependence'],
  ['6C43.2','Opioid dependence']
];
const role = () => S.role;
const isLead = () => S.role === 'lead';
const isPsy = () => S.role === 'psychiatrist' || S.role === 'lead';
const isPsych = () => S.role === 'psychologist';
const isWard = () => S.role === 'nurse' || S.role === 'rmo';
const __me0 = () => S.role==='nurse' ? {name:'Sister Rekha', short:'Sister Rekha', ini:'SR', title:'Nurse in charge · Male ward'} : S.role==='rmo' ? {name:'Dr. Sameer Khan', short:'Dr. Sameer', ini:'SK', title:'RMO on duty'} : isLead() ? {name:'Dr. Nandini Rao', short:'Dr. Nandini', ini:'NR', title:'Floor lead · Male ward'} : S.role==='psychiatrist' ? {name:'Dr. Aanya Sharma', short:'Dr. Aanya', ini:'AS', title:'Psychiatrist'} : {name:'Priya Nair', short:'Priya', ini:'PN', title:'Psychologist'};
const PSYCHOF = {arjun:'Priya Nair',varun:'Kiran Mehra',kabir:'Priya Nair',sameer:'Kiran Mehra',neel:'Priya Nair',rohit:'',dev:'Priya Nair',tarun:'Kiran Mehra'};
const RTYPE={arjun:'Standard',varun:'Standard',kabir:'Twin sharing',sameer:'Twin sharing',neel:'Deluxe',rohit:'Suite',dev:'Standard',tarun:'Observation'};
const VIP={rohit:'Suite room · VVIP'};
const SENIOR={'Dr. Nandini Rao':'Floor lead','Dr. Aanya Sharma':'Senior consultant','Dr. Rohan Mehta':'Consultant','Dr. Kunal Sethi':'Consultant'};
const rtype=p=>RTYPE[p.id]||'Standard',isVipRoom=p=>!!VIP[p.id]||rtype(p)==='Suite';
const PSYOF = {arjun:'Dr. Aanya Sharma',varun:'Dr. Kunal Sethi',kabir:'Dr. Aanya Sharma',sameer:'Dr. Rohan Mehta',neel:'Dr. Aanya Sharma',rohit:'Dr. Aanya Sharma',dev:'Dr. Rohan Mehta',tarun:'Dr. Aanya Sharma'};

/* ---------- helpers ---------- */
const $ = id => document.getElementById(id);
function toast(msg){const t=$('toast');t.textContent=msg;t.classList.add('show');clearTimeout(t._h);t._h=setTimeout(()=>t.classList.remove('show'),3400);}
function go(h){location.hash=h;}
function chip(text,c){return `<span class="chip ${c}">${text}</span>`;}
/* SNDT (signature, name, date, time): every entry says who did it and when */
const atNow=()=>{const d=new Date();return d.toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})+', '+d.toLocaleTimeString('en-IN',{hour:'numeric',minute:'2-digit'});};
const signer=()=>__me0().name;
const whoAt=()=>({by:signer(),at:atNow()});
const byl=(by,at,verb)=>by?`<span class="byl">${verb?verb+' ':''}${by}${at?' · '+at:''}</span>`:'';
/* every task marked done records who did it and when */
S.doneBy={};S.done=new Proxy(S.done,{set(o,k,v){o[k]=v;try{if(v)S.doneBy[k]=whoAt();else delete S.doneBy[k];}catch(e){}return true;},deleteProperty(o,k){delete o[k];delete S.doneBy[k];return true;}});
function taskBy(t){if(t.by)return t.by;if(t.lead)return 'the HMS, from overdue deadlines';if(/^cn/.test(t.id))return 'consent request';if(t.ref)return 'the referring doctor';return 'the HMS, from the care plan';}
function av(ini,size,c){return `<div class="avatar ${c||'c-blue'}" style="width:${size}px;height:${size}px;font-size:${Math.round(size/3)}px">${ini}</div>`;}
function openModal(html){$('modal').innerHTML=html;$('scrim').classList.add('show');const f=$('modal').querySelector('input,select,textarea,button');f&&f.focus();}
function closeModal(){$('scrim').classList.remove('show');$('modal').style.width='';}
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal();});
const icon = {
  dash:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/></svg>',
  users:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="9" cy="8" r="3.5"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M21 20c0-2.6-1.6-4.8-4-5.6"/></svg>',
  bed:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M3 18V7M3 14h18v4M21 14v-2a3 3 0 0 0-3-3h-7v5"/><circle cx="7" cy="11" r="2"/></svg>',
  cal:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/></svg>',
  clock:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/></svg>',
  msg:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 5h16v11H8l-4 4z"/></svg>',
  book:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 5a2 2 0 0 1 2-2h5v17H6a2 2 0 0 0-2 2zM20 5a2 2 0 0 0-2-2h-5v17h5a2 2 0 0 1 2 2z"/></svg>',
  gear:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/></svg>',
  mic:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>',
  eye:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
  phone:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg>',
};

/* ---------- sidebar ---------- */
function renderSide(route){
  const m = me();
  const sec = route[0];
  const inIpd = ['myday','inpatients','rounds','patient','notes','nursing','handover','floor','ward','duty','escalation','timeline','permissions','clinical-docs','admissions'].includes(sec);
  const sub = (h,label,key)=>`<button class="sub ${sec===key?'on':''}" onclick="go('${h}')">${label}</button>`;
  const nav = (h,ic,label,on,extra)=>`<button class="nav ${on?'on':''}" onclick="go('${h}')" title="${label}" aria-label="${label}">${ic}<span class="tx">${label}</span>${extra||''}</button>`;
  $('side').innerHTML = `
    <div class="brand"><div class="mark" style="background:#fff;padding:2px"><img src="logo.png" alt="Tulasi Healthcare" style="width:100%;height:100%;object-fit:contain"></div><div class="tx" style="font-weight:700;font-size:15px">Tulasi Healthcare</div></div>
    <div class="lbl" style="padding:6px 14px">Main menu</div>
    ${nav('#/existing/Dashboard',icon.dash,'Dashboard',false)}
    ${nav('#/existing/All Patients',icon.users,'All Patients',false)}
    ${nav('#/myday',icon.bed,'Inpatients',inIpd,'<span class="newtag">NEW</span>')}
    ${inIpd?sub('#/myday','Inpatient dashboard','myday')+(isWard()?'':sub('#/rounds','Rounds','rounds'))+(((isPsy()&&!isLead())||isPsych())?sub('#/notes','Daily notes','notes'):'')+(S.role!=='nurse'&&S.role!=='psychologist'?sub('#/nursing','Nursing chart','nursing'):'')+(S.role==='rmo'?sub('#/handover','Handover','handover'):'')+sub('#/inpatients',isLead()?'Floor inpatients':isWard()?'Ward inpatients':'My inpatients','inpatients')+sub('#/admissions','New admission','admissions')+(['lead','psychiatrist','psychologist'].includes(S.role)?sub('#/clinical-docs','Clinical documentation','clinical-docs'):'')+V3.subs(sec):''}
    ${S.role==='rmo'?'':nav('#/existing/My Calendar',icon.cal,'My Calendar',false)}
    ${S.role==='rmo'?'':nav('#/existing/Schedule',icon.clock,'Schedule',false)}
    ${nav('#/existing/Messages',icon.msg,'Messages',false)}
    ${nav('#/existing/Blogs',icon.book,'Blogs',false)}
    ${nav('#/existing/Setting',icon.gear,'Setting',false)}
    <div class="me" style="cursor:pointer" onclick="accountModal()" title="Account and log out"><div class="row" style="gap:10px">${av(m.ini,32)}<div class="who"><div style="font-weight:600;font-size:13px">${m.name}</div><div class="tiny muted">${m.title}</div></div></div></div>`;
  $('topAv').textContent = m.ini; $('topName').textContent = m.short;
  $('roleSeg').innerHTML = [['lead','Floor lead'],['psychiatrist','Psychiatrist'],['psychologist','Psychologist'],['nurse','Nurse'],['rmo','RMO on duty']].map(([k,l])=>`<button class="${S.role===k?'on':''}" onclick="setRole('${k}')">${l}</button>`).join('');
}

/* ---------- journey ---------- */
function vJourney(){
  $('title').textContent='Patient journey and scope';
  const rows = [
    ['Before admission','OPD consult recommends admission','Consultation flow, Care Plan step','Add one action in Care Plan: Recommend admission. It sends the request to the front desk queue.','c-reuse','Reuse + small add'],
    ['Admission day','Front desk opens the file, family signs forms, bed assigned','','Doctor gets a notification and the admission workup task. Psychiatrist decides on Form C. Form signing, deposit and bed stay in the admin portal.','c-new','New'],
    ['First 72 hours','Admission workup and capacity assessment at admission; detailed history within 72 hours','Clinical history fields and risk screen from the consult flow','Admission tab reuses those fields; AI scribe drafts the detailed history; 72-hour deadline tracked.','c-new','New, reuses fields'],
    ['Week 1','Diagnosis, psychiatry plan, psychology plan','ICD-11 diagnosis picker','Plans tab: two separate plans, due day 7.','c-new','New, reuses picker'],
    ['Every day','Daily notes; family update; ward rounds','','Daily notes tab (dropdowns + one line); family update drafted from the note; Rounds view with AI scribe.','c-new','New'],
    ['Every week','Re-assessment; capacity weekly for 30 days, fortnightly under Section 90','','Recurring tasks in Inpatient dashboard; schedule switches with the admission section.','c-new','New'],
    ['Medicines and procedures','Prescriptions, clozapine, MECT','Prescription form (1-0-1 frequency, before/after food, date range)','Orders tab reuses the form. Clozapine and MECT orders ask the front desk to get the family consent signed.','c-reuse','Reuse + consent link'],
    ['Therapy and family','Therapy notes, family counselling (optional), 24-hour and day 3 to 4 calls','Session notes format','Therapy and family tab; calls placed through the HMS and logged.','c-new','New'],
    ['Floor leads','A head psychiatrist per floor with 3 to 4 psychiatrists','','Floor view on the Inpatient dashboard: team load and overdue work, assign new admissions, approve transfers','c-new','New'],
    ['Vitals and medicines','Nurses record vitals and each dose given or refused','Med Adherence tab (patient app data)','Vitals and medicines section with ward adherence; app data resumes after discharge','c-new','New'],
    ['Diet','Food preferences, allergies, fasting days','','Diet card on the Preferences for admin tab; kitchen and ward see it','c-new','New'],
    ['Grievances','Complaints from the patient or family, or about services','','Grievances section; goes to the patient experience team with a 6-hour clock','c-new','New'],
    ['Readmission and records','Patient comes back; records kept after discharge','Discharge summary in Care Management','Inpatient stay tab shows only while admitted. At discharge the summary moves to Care Management and the stay file closes read only. On readmission the tab returns with a Past admissions section (summaries and clinical notes from earlier stays)','c-reuse','Reuse + add'],
    ['Referrals, outings, leave','Visiting doctor referral; outing or leave of absence','','Ordered from Orders and consents; the front desk takes the family signature.','c-new','New'],
    ['Change of doctor','Transfer between psychiatrists or psychologists','Treating team chips with + Add','Transfer case with a required handover note.','c-new','New'],
    ['Discharge','Discharge checklist, Form C again, summary, follow-ups; or leaving against advice (LAMA), transfer, absconding','Discharge summary viewer and post-discharge check-ins in Care Management','Discharge tab drafts the summary from the stay and runs the checklist; follow-ups land in the existing check-ins.','c-reuse','Reuse + new checklist'],
  ];
  const out = [
    ['Bed board, room moves','Admin portal, IPD'],
    ['Deposits, bills, payment reminders','Admin portal, Billing'],
    ['Family signatures on admission forms','Admin portal, Admissions (tablet or link)'],
    ['Family call schedules beyond the doctor\'s own calls, grievances, feedback','Admin portal, Patient experience'],
    ['Nursing: vitals, medicine rounds, handover','Later module (nursing)'],
    ['Video and audio consults','Not used during a stay'],
    ['Mood, journal and medicine adherence from the patient app','Paused during the stay: patients have no phone. Resumes at discharge.'],
  ];
  return `
  <section class="card pad" style="display:flex;flex-direction:column;gap:8px">
    <h2>One stay, from OPD to follow-up</h2>
    <div class="muted">The doctor portal is live, so the inpatient side reuses its patient profile, clinical history fields, ICD-11 picker, prescription form, discharge summary and post-discharge check-ins. It adds one menu item (Inpatients) and one patient tab (Inpatient stay). Anything the front desk, billing or ops handle stays out of the doctor portal.</div>
    <div class="row" style="margin-top:6px">${chip('NEW','c-new')} new screen ${chip('Reuse','c-reuse')} built on a live screen ${chip('Not here','c-out')} handled elsewhere</div>
  </section>
  <section class="card scroll">
    <table class="t"><thead><tr><th style="width:150px">Stage</th><th>What happens</th><th>Already live</th><th>In the doctor portal</th><th style="width:150px">Status</th></tr></thead>
    <tbody>${rows.map(r=>`<tr><td style="font-weight:600">${r[0]}</td><td>${r[1]}</td><td class="muted">${r[2]||'Nothing today'}</td><td>${r[3]}</td><td>${chip(r[5],r[4])}</td></tr>`).join('')}</tbody></table>
  </section>
  <section class="card">
    <div class="hd"><h3>Not in the doctor portal</h3>${chip('Not here','c-out')}</div>
    ${out.map(o=>`<div class="li"><span class="grow" style="font-weight:600">${o[0]}</span><span class="muted">${o[1]}</span></div>`).join('')}
  </section>
  <section class="card pad row" style="justify-content:space-between"><div><h3>Walk through it</h3><div class="muted small">Start at Inpatient dashboard, open Neel Bose, then try Rounds. Switch between psychiatrist and psychologist at the bottom of the menu.</div></div><button class="btn pri" onclick="go('#/myday')">Open Inpatient dashboard</button></section>`;
}

/* ---------- my day ---------- */
function tasks(){
  const griev = {id:'griev', late:true, title:'Grievance raised · Neel Bose', meta:'Family: updates feel repetitive · patient experience team has it, 5 h left on the 6-hour clock', due:'New grievance', go:'#/patient/neel/griev'};
  const psy = [griev,
    {id:'hist', late:true, title:'Detailed history · Neel Bose', meta:'72-hour deadline passed yesterday, 10:30 · with Priya Nair', due:'1 day late', go:'#/patient/neel/admission'},
    {id:'cap', late:true, title:'Capacity assessment, week 2 · Sameer Das', meta:'Weekly for 30 days under Section 89', due:'Due yesterday', go:'#/patient/neel/forms'},
    {id:'addps', title:'Add psychologist · Rohit Kapoor', meta:'Assigned to you by ward · no psychologist on the team yet', due:'New', chipc:'c-blue', addps:true},
    {id:'workup', title:'Admission workup · Rohit Kapoor', meta:'Admitted 10:30 · Suite 201 · Form C decision pending', due:'New', chipc:'c-blue', go:'#/patient/neel/admission'},
    {id:'call24', title:'24-hour family call · Rohit Kapoor', meta:'Meera Kapoor, wife · logged automatically', due:'By 11:00 tomorrow', call:true},
    {id:'reassess', title:'Weekly re-assessment · Karan Malhotra', meta:'Day 21 · Section 90, capacity now fortnightly', due:'Today', go:'#/patient/neel/forms'},
    {id:'daily', title:'Daily notes · 7 patients', meta:'Done during rounds, or one at a time', due:'Today', go:'#/rounds'},
    {id:'sum', title:'Discharge summary to sign · Dev Kumar', meta:'Draft by Priya Nair, psychologist · needs a psychiatrist\'s signature', due:'Sign', chipc:'c-blue', go:'#/patient/neel/discharge'},
  ];
  const psych = [griev,
    {id:'hist', late:true, title:'Detailed history · Neel Bose', meta:'Your parts: personal and family history, premorbid personality', due:'1 day late', go:'#/patient/neel/admission'},
    {id:'d34', title:'Day 3 to 4 family call · Tarun Roy', meta:'Suresh Roy, father · logged automatically', due:'Today', call:true},
    {id:'daily', title:'Daily notes and family updates · 5 patients', meta:'Each note drafts that family\'s update', due:'Today', go:'#/patient/neel/daily'},
    {id:'sumd', title:'Draft discharge summary · Dev Kumar', meta:'Built from the stay\'s notes, plans and orders · goes to the psychiatrist to sign', due:'Today', chipc:'c-blue', go:'#/patient/neel/discharge'},
    {id:'ther', title:'Individual session · Neel Bose', meta:'4 pm · therapy note optional, AI scribe available', due:'4 pm', go:'#/patient/neel/therapy'},
  ];
  const lead = [
    {id:'griev',late:true,title:'Grievance raised · Neel Bose',meta:'Family: updates feel repetitive · Dr. Aanya Sharma and Priya Nair alerted',due:'New grievance',lead:true,go:'#/patient/neel/griev'},
    {id:'l0',title:'Confirm team · Rohit Kapoor',meta:'New admission 10:30 · Suite 201 · VVIP · Dr. Aanya Sharma (senior) assigned by ward · psychologist not added',due:'Check',chipc:'c-blue',assign:true},
    {id:'l1',late:true,title:'Detailed history · Neel Bose',meta:'Dr. Aanya Sharma · deadline passed yesterday',due:'1 day late',lead:true,go:'#/patient/neel/admission'},
    {id:'l2',late:true,title:'Capacity assessment · Sameer Das',meta:'Dr. Rohan Mehta · due yesterday',due:'Due yesterday',lead:true,go:'#/patient/neel/admission'},
    {id:'l3',late:true,title:'Daily notes · 3 patients',meta:'Dr. Kunal Sethi · not written yesterday',due:'1 day late',lead:true,go:'#/inpatients'},
    {id:'l5',title:'Sign discharge summary · Dev Kumar',meta:'Dr. Rohan Mehta is off duty today · draft by Priya Nair is ready',due:'Cover sign-off',chipc:'c-blue',go:'#/patient/neel/discharge'},
    {id:'l4',title:'Transfer request · Varun Rao',meta:'Dr. Kunal Sethi to Dr. Rohan Mehta · workload',due:'Needs your approval',chipc:'c-blue',approve:true},
  ];
  const nurse = [
    {id:'n1',late:true,title:'Sugar reading missed · Neel Bose',meta:'After-lunch CBG was 192 yesterday; before-lunch reading not entered',due:'Overdue',go:'#/patient/neel/vitals'},
    {id:'n2',title:'Medicine round · 2 pm · Male ward',meta:'8 patients · tap each dose on the medicine chart',due:'2 pm',chipc:'c-blue',go:'#/patient/neel/vitals'},
    {id:'n3',title:'New from rounds · Neel Bose',meta:'Dr. Aanya Sharma: neuro checks every 2 hours; serum lithium 7 am tomorrow',due:'New',chipc:'c-blue',go:'#/patient/neel/overview'},
    {id:'n4',title:'Every 15 minute checks · Neel Bose, Rohit Kapoor',meta:'Tarun Roy on 1:1 constant observation',due:'Ongoing',go:'#/inpatients'},
    {id:'n5',title:'Vitals · 4 pm · Male ward',meta:'BP, pulse, SpO2 for all patients; weight on Thursdays',due:'4 pm',go:'#/patient/neel/vitals'},
    {id:'n6',title:'Shift handover note',meta:'Due at 8 pm for the night shift',due:'8 pm',go:'#/patient/neel/vitals'},
  ];
  const rmo = (S.referrals||[]).map(refTask).concat(RMO_DAILY()).concat([
    {id:'r1',late:true,title:'Fall · Neel Bose · not reviewed by psychiatrist',meta:'Logged 2:10 am by Sister Rekha · neuro checks every 2 hours',due:'Event',go:'#/nursing/neel'},
    {id:'r2',title:'Admission workup · Rohit Kapoor',meta:'Admitted 10:30 · vitals, physical exam, admission bloods',due:'New',chipc:'c-blue',go:'#/patient/neel/admission'},
    {id:'r3',title:'Sugar out of range · Neel Bose',meta:'192 mg/dL after lunch yesterday',due:'Review',go:'#/nursing/neel'},
    {id:'r4',title:'Pre-MECT work-up · Karan Malhotra',meta:'Pre-anaesthetic check before Thursday session',due:'Today',go:'#/patient/neel/orders'},
    {id:'r5',title:'Night handover to duty doctor',meta:'Out-of-hours admissions and events to the night team',due:'9 pm',go:'#/handover'},
  ]);
  if(S.role==='nurse') return nurse;
   if(S.role==='rmo') return rmoScope(consentTasks('rmo').concat(rmo));
  const pfT=PFORMS.flatMap(g=>g[1]).filter(f=>(S.pf[f[0]]||f[3])==='printed').map(f=>({id:'pfup_'+f[0],title:'Upload signed copy · '+f[1],meta:'Neel Bose · printed '+((S.pfAt||{})[f[0]]||'earlier')+' · get it signed, then scan and upload',due:'Awaiting',chipc:'c-amber',pfk:f[0]}));
   if(isLead()) return (S.scope==='floor'?lead:psy.slice(4).filter(t=>t.id!=='daily').concat(pfT)).concat(V3.homeTaskItems());
   return isPsy()?psy.concat(pfT,V3.homeTaskItems()):psych;
}
function statTile(sty,on,act,aria,inner){return `<div class="card stat clk ${on?'on':''}" ${sty?`style="${sty}"`:''} role="button" tabindex="0" aria-pressed="${on?'true':'false'}" aria-label="${aria}" onclick="${act}" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();${act}}">${inner}<span class="sgo" aria-hidden="true">›</span></div>`;}
function dashJump(sel){setTimeout(()=>{const e=document.querySelector(sel);if(e)e.scrollIntoView({behavior:'smooth',block:'start'});},30);}
function dashTf(k){S.tf=S.tf===k?'':k;render();if(S.tf)dashJump('#dashTasks');}
function rmoTf(k){S.rtf=S.rtf===k?'':k;render();if(S.rtf)dashJump('.rwrap');}
function nTile(f){const L=lst('nurse');L.f=(f!=='all'&&L.f===f)?'all':f;render();dashJump('#nurseBoard');}
const TF_LBL={late:'Overdue',open:'Due today and new',done:'Done today'};
function vMyDay(){
  $('title').textContent='Inpatients';
  const T = tasks(); const open = T.filter(t=>!S.done[t.id]);
  const late = open.filter(t=>t.late).length;
  const tf=S.tf||'',TV=tf==='late'?T.filter(t=>!S.done[t.id]&&t.late):tf==='open'?T.filter(t=>!S.done[t.id]&&!t.late):tf==='done'?T.filter(t=>S.done[t.id]):T;
  const list = (arr)=>arr.map(t=>{
    const d = S.done[t.id];
    const c = d?'c-green':(t.late?'c-amber':(t.chipc||'c-grey'));
    const fx=(S.flx||{})[t.id],nz=(S.nudged||{})[t.id];
    const act = d?'':t.pfk?`<button class="btn sm" onclick="go('#/patient/neel/forms')">Open</button><button class="btn sm pri" onclick="pfUpModal('${t.pfk}')">Upload signed copy</button>`:t.diet?`<button class="btn sm pri" onclick="dietModal()">Add diet plan</button>`:t.ref?`<button class="btn sm" onclick="go('${t.go}')">Open</button><button class="btn sm pri" onclick="S.done['${t.id}']=true;render();toast('Referral marked done. The psychiatrist can see it.')">Mark done</button>`:t.addps?`<button class="btn sm pri" onclick="S.done['${t.id}']=true;addPsychModal()">Add psychologist</button>`:(t.assign?`<button class="btn sm pri" onclick="assignModal('${t.id}')">Review</button>`:t.approve?`<button class="btn sm pri" onclick="flApprove('${t.id}')">Approve</button><button class="btn sm" onclick="flDecline('${t.id}')">Decline</button>`:t.call?`<button class="btn sm" onclick="schedMsg('${t.meta.split(',')[0]}')">Message caregiver</button><button class="btn sm pri" onclick="callFamily('${t.id}')">${icon.phone}Call via HMS</button>`:`${t.lead?`<button class="btn sm" onclick="flNudge('${t.id}')">${nz?'Nudge again':'Nudge'}</button>`:''}<button class="btn sm ${t.late?'pri':''}" onclick="${flHas(t.id)?`flOpen('${t.id}')`:`go('${t.go}')`}">Open</button>`);
     if(t.homeRow) return t.homeRow;
     const db=S.doneBy[t.id];
     return `<div class="li"><div class="grow"><div style="font-weight:600;${d?'text-decoration:line-through;color:#8a94a6':''}">${t.title}</div><div class="small muted">${t.meta}${nz&&!d?' · Nudged '+nz.at:''}</div>${d?(db?byl(db.by,db.at,'Done by'):''):`<span class="byl">Assigned to ${hesc(signer())} · by ${hesc(taskBy(t))}</span>`}</div>${chip(d?'Done':(fx?fx.text:t.due),(fx&&!d)?fx.cls:c)}${act}</div>`;}).join('');
  const splitTaskAreas=['psychiatrist','lead'].includes(S.role);
  const alertItems=TV.filter(t=>t.taskType==='alert'), rmoItems=TV.filter(t=>t.taskType==='countersign');
  const otherItems=splitTaskAreas?TV.filter(t=>t.taskType!=='alert'&&t.taskType!=='countersign'):TV;
  const taskContent=splitTaskAreas
    ? `<div class="home-task-sections"><section><div class="tg">Alerts ${chip(String(alertItems.length),'c-red')}</div>${alertItems.length?list(alertItems):'<div class="pad small muted">No alerts are waiting for you.</div>'}</section><section><div class="tg">RMO tasks ${chip(String(rmoItems.length),'c-violet')}</div>${rmoItems.length?list(rmoItems):'<div class="pad small muted">No RMO orders need countersigning.</div>'}</section><section><div class="tg">Other tasks</div>${otherItems.length?taskGroups(otherItems,list):'<div class="pad small muted">No other tasks due.</div>'}</section></div>`
    : TV.length?taskGroups(TV,list):`<div class="pad small muted">${{late:'No overdue tasks.',open:'Nothing else is open today.',done:'Nothing completed yet. Tasks you finish show here.'}[tf]||'Nothing due.'}</div>`;
  return `
  <div class="row" style="justify-content:space-between"><div><h2>Inpatient dashboard</h2><div class="muted" style="margin-top:4px">${dashSub()}</div></div>${isPsych()?`<button class="btn pri" onclick="go('#/notes')">✎ Add daily notes ${(()=>{const L=isPsych()?PTS.slice(0,5):PTS;const d=L.filter(p=>((S.eod||{})[p.id]||{}).saved).length;return `<span class="fcount">${d}/${L.length}</span>`})()}</button>`:''}${isPsy()?`<button class="btn pri" onclick="go('#/rounds')">Start rounds</button>`:''}</div>
  ${V3.homeCards()}
  ${S.role==='rmo'?rmoFloorList():''}
  ${rmoInbox()}${isLead()?teamCard():''}

  <section class="card" id="dashTasks"><div class="hd"><div class="row" style="gap:10px;flex-wrap:wrap"><h3>${isLead()&&S.scope==='floor'?'Floor tasks':'Tasks'}</h3>${tf?`<button class="tfchip" onclick="dashTf('${tf}')" aria-label="Clear filter, show all tasks">${TF_LBL[tf]} · ${TV.length} <span aria-hidden="true">✕</span></button>`:''}<button class="task-summary-pill patients" onclick="go('#/inpatients')"><span class="task-pill-icon">${V3.i('users',16)}</span><span>My inpatients</span><b>${isWard()?(S.role==='rmo'?scopePts().length:17):(isLead()&&S.scope==='floor'?28:(isLead()?6:(isPsy()?8:5)))}</b></button><button class="task-summary-pill admit" onclick="go('#/admissions')"><span class="task-pill-icon">${V3.i('users',16)}</span><span>New admission</span><b>${((S.role==='lead'||S.role==='rmo')?allPts():PTS).filter(p=>p.day<=1).length}</b></button><button class="task-summary-pill overdue" onclick="dashTf('late')"><span class="task-pill-icon">${V3.i('alert',16)}</span><span>Overdue tasks</span><b>${late}</b></button></div>${isLead()?`<div class="seg" style="min-width:230px"><button class="${S.scope==='floor'?'on':''}" onclick="S.scope='floor';render()">My floor</button><button class="${S.scope==='mine'?'on':''}" onclick="S.scope='mine';render()">My patients</button></div>`:S.role==='psychiatrist'?'':'<span class="small muted">Created automatically from admissions, schedules and rounds</span>'}</div>${taskContent}</section>`;
}
function vNotes(){
  $('title').textContent='Daily notes';
  const L=isPsych()?PTS.slice(0,5):PTS; const done=L.filter(p=>((S.eod||{})[p.id]||{}).saved).length;
  return `<nav class="crumb"><a href="#/myday">Inpatient dashboard</a> / <strong>Daily notes</strong></nav>
  <div class="row" style="justify-content:space-between;align-items:flex-end"><div><h2 style="font-size:26px">Daily notes</h2><div class="muted" style="margin-top:4px">Today · ${done} of ${L.length} written</div></div><button class="btn" onclick="go('#/myday')">Back to dashboard</button></div>
  ${eodNotes()}
  <section class="card"><div class="hd"><h3>Written earlier today</h3><span class="small muted">From rounds and patient files</span></div>
    ${[['Arjun Mehta','Round note · 10:20','Calmer; sleeping better; continue plan'],['Varun Rao','Round note · 10:35','Mild tremor; withdrawal settling']].map(n=>`<div class="li"><div class="grow"><div style="font-weight:600">${n[0]}</div><div class="tiny muted">${n[1]} · ${n[2]}</div></div>${chip('Counts as daily note','c-green')}</div>`).join('')}</section>`;
}
const CONOTE={
 psych:{neel:['4:30 pm','Calmer in session; named two early warning signs. Still guarded about medicines.','Calmer','Fair','No change'],arjun:['3:15 pm','Talked about returning to work; mood brighter than yesterday.','Calmer','Good','Lower'],varun:['2:40 pm','Cravings lower; attended group therapy.','Same','Fair','No change'],tarun:['5:10 pm','Suspicious in group, left early. Needs close watch tonight.','Irritable','Poor','Higher']},
 psy:{neel:['10:20 am · round','Pressured speech less; olanzapine reviewed; lithium level tomorrow.','Calmer','Fair','No change'],arjun:['10:05 am · round','Sleeping better; continue sertraline.','Calmer','Good','No change'],kabir:['11:00 am','Clozapine dose stable; WBC due.','Same','Good','No change'],sameer:['10:45 am','Rituals reduced; continue fluoxetine.','Same','Fair','No change']}
};
function coNote(pid){const src=isPsych()?'psy':'psych';const n=CONOTE[src][pid];const who=isPsych()?S.team.psy+' · psychiatrist':S.team.psych+' · psychologist';
  if(!n) return `<div class="conote empty"><span class="tiny muted">No note yet today from the ${isPsych()?'psychiatrist':'psychologist'}</span></div>`;
  return `<div class="conote ${n[4]==='Higher'?'risk':''}"><div class="row" style="justify-content:space-between;gap:8px"><span class="tiny" style="font-weight:700;color:var(--violet)">Today from ${who}</span><span class="tiny muted">${n[0]}</span></div><div class="row" style="gap:5px;margin:5px 0">${[n[2],n[3],'Risk: '+n[4]].map(x=>`<span class="chip ${x==='Risk: Higher'?'c-red':'c-grey'}" style="font-size:11px">${x}</span>`).join('')}</div><div class="small" style="color:var(--ink-2)">${n[1]}</div><div class="tiny muted" style="margin-top:4px">View only</div></div>`;}
function eodNotes(){
  const dnPtLabel=p=>p.name+'-'+String(p.room||'').replace(/^Room\s*/i,'');
  S.eod=S.eod||{}; const L0=isPsych()?PTS.slice(0,5):PTS; const L=L0.slice(); /* ward order, first patient first (3 Nov) */
  const done=L.filter(p=>(S.eod[p.id]||{}).saved).length, pct=Math.round(done/L.length*100);
  const set=(id,k,v)=>`S.eod['${id}']=S.eod['${id}']||{};S.eod['${id}']['${k}']='${v}';render()`;
  const mseg=(id,k,opts)=>{const cur=(S.eod[id]||{})[k]||[];return `<div class="mini-chips">${opts.map(o=>`<button class="tog ${cur.includes(o)?'on':''}" style="height:28px;font-size:12px" onclick="S.eod['${id}']=S.eod['${id}']||{};const a=S.eod['${id}']['${k}']||[];S.eod['${id}']['${k}']=a.includes('${o}')?a.filter(x=>x!=='${o}'):a.concat('${o}');render()">${o}</button>`).join('')}</div>`;};
  const dnGroup=(t,fs)=>`<div class="dngrp"><div class="dng2">${t}</div><div class="dnfields">${fs.map(([l,c])=>`<div class="ef"><span class="lbl">${l}</span>${c}</div>`).join('')}</div></div>`;
  const seg=(id,k,opts)=>{const cur=(S.eod[id]||{})[k];return `<div class="eseg" role="group" aria-label="${k}">${opts.map(([v,c])=>`<button class="${cur===v?'on '+c:''}" onclick="${set(id,k,v)}">${v}</button>`).join('')}</div>`;};
  const row=p=>{const e=S.eod[p.id]||{};
    if(e.saved) return `<div class="erow saved"><div class="epat">${av(p.ini,34,p.risk?'c-red':'c-blue')}<div><div style="font-weight:600">${dnPtLabel(p)}</div></div></div>
      <div class="esum">${eodSum(e).map(x=>`<span class="chip ${/Higher|Refused|Harm to self|Aggression/.test(x)?'c-red':'c-grey'}">${x}</span>`).join('')}<span class="small" style="color:var(--ink-2)">${e.line||''}</span></div>
      <div class="eact"><span class="chip c-green">✓ Saved</span><button class="lnk" onclick="S.eod['${p.id}'].saved=false;render()">Edit</button></div></div>`;
    return `<div class="erow ecard ${p.risk?'risk':''}"><div class="epat">${av(p.ini,34,p.risk?'c-red':'c-blue')}<div><div style="font-weight:600">${dnPtLabel(p)}</div><div class="tiny muted">Day ${p.day}</div>${p.risk?'<span class="chip c-red" style="margin-top:4px">High risk</span>':''}</div></div>
      <div class="efields">
        <div style="grid-column:1/-1">${coNote(p.id)}</div>
        ${eodGroups(p,dnGroup,seg,mseg)}
      </div>
      <div class="eact"><button class="btn sm pri" onclick="S.eod['${p.id}']=S.eod['${p.id}']||{};S.eod['${p.id}'].saved=true;S.eodI=0;render();toast('Daily note saved for ${p.name}${(e.hs&&e.hs!=='None')?'; treating team alerted':''}')">Save and next</button></div></div>`;};
  return `<section class="card eod"><div class="eodhd"><div><div class="row" style="gap:8px"><h3>End of day notes</h3></div></div>
    <div class="eprog"><div class="row" style="justify-content:space-between"><strong>${done} of ${L.length} done</strong></div><div class="ebar"><i style="width:${pct}%"></i></div></div></div>
    ${(()=>{const pend=L.filter(p=>!(S.eod[p.id]||{}).saved);const idx=Math.min(S.eodI||0,Math.max(0,pend.length-1));const cur=pend[idx];
      const strip=`<div class="estrip">${L.map(p=>{const sv=(S.eod[p.id]||{}).saved,on=cur&&p.id===cur.id;return `<button class="espill ${sv?'sv':''} ${on?'on':''} ${p.risk?'rk':''}" onclick="${sv?`S.eod['${p.id}'].saved=false;S.eodI=0`:`S.eodI=${pend.indexOf(p)}`};render()">${sv?'✓ ':''}${dnPtLabel(p)}</button>`}).join('')}</div>`;
      if(!cur) return strip+`<div class="edone">All notes saved for today. Tap a name to edit one.</div>`;
      return strip+`<div class="estage">${row(cur)}
        <div class="row" style="justify-content:space-between;margin-top:10px"><button class="btn sm" ${idx===0?'disabled':''} onclick="S.eodI=${idx-1};render()">‹ Previous</button><button class="btn sm" ${idx>=pend.length-1?'disabled':''} onclick="S.eodI=${idx+1};render()">Skip for now ›</button></div></div>`;})()}</section>`;
}
function teamCard(){
  const T=[['Dr. Nandini Rao (you)',6,0,1,'Floor lead'],['Dr. Aanya Sharma',8,2,6,''],['Dr. Rohan Mehta',7,1,4,''],['Dr. Kunal Sethi',7,2,5,'']];
  const P=[['Priya Nair',9,1,5],['Kiran Mehra',8,0,4],['Surabhi Sengar',5,0,2]];
  const cg='<colgroup><col style="width:32%"><col style="width:14%"><col style="width:20%"><col style="width:14%"><col style="width:20%"></colgroup>';
  const tb=(rows,ps)=>`<table class="t tt fx">${cg}<thead><tr><th>${ps?'Psychologist':'Psychiatrist'}</th><th>Inpatients</th><th>Overdue</th><th>Due today</th><th></th></tr></thead><tbody>${rows.map(r=>`<tr><td class="nm" style="font-weight:600"><span class="rl ${ps?'s':'d'}" style="margin-right:6px">${ps?'P':'D'}</span>${r[0]} ${r[4]?chip(r[4],'c-violet'):''}${r[0].includes('(you)')?'<div class="tiny muted" style="font-weight:400;margin-left:26px">Complex and VVIP cases · no daily notes</div>':''}</td><td>${r[1]}</td><td>${r[2]?chip(r[2]+' overdue','c-amber'):chip('None','c-green')}</td><td>${r[3]}</td><td style="text-align:right"><button class="btn sm" onclick="${ps?"go('#/inpatients')":`S.psyF='${r[0].includes('(you)')?'':r[0]}';go('#/inpatients')`}">View patients</button></td></tr>`).join('')}</tbody></table>`;
  const alert=S.flPsy?'':`<div class="tmalert"><span class="dot" style="background:var(--amber)"></span><div class="grow"><strong>1 new admission has no psychologist yet</strong><div class="tiny">Rohit Kapoor · Suite 201 · VVIP · admitted 10:30</div></div><button class="btn sm" onclick="assignModal('l0')">Review team</button></div>`;
  return `<section class="card"><div class="hd"><h3>Floor team · Male ward</h3><span class="small muted">Psychiatrists and psychologists on your floor</span></div>${alert}<div class="scroll" style="margin-top:6px">${tb(T,false)}<div style="height:8px"></div>${tb(P,true)}</div></section>`;
}
/* ===== floor lead: task popups (nudge, details, team, sign-off, transfer) ===== */
const FL_P=id=>PTS.find(p=>p.id===id);
function flHas(id){return ['griev','l1','l2','l3','l5'].includes(id);}
function flTop(title,sub){return `<div class="mh"><div><h3>${title}</h3>${sub?`<div class="tiny muted" style="margin-top:2px">${sub}</div>`:''}</div><button class="x" aria-label="Close" onclick="closeModal()">×</button></div>`;}
function flHead(p,right,sub){return `<div class="flh">${av(p.ini,40,'c-blue')}<div class="grow"><div class="nm">${p.name} <span class="tiny muted" style="font-weight:400">· ${window.psyPatientLine?psyPatientLine(p):`${p.age}/${p.sex} ${p.room}`} · ${p.day?'Day '+p.day:'Admitted today'}</span></div><div class="small muted">${sub||p.dx}</div></div>${right||''}</div>`;}
function flFx(id,text,cls){S.flx=S.flx||{};S.flx[id]={text,cls};}
function flWide(w){$('modal').style.width=w||'min(640px,100%)';}
const FL_NUDGE={
  griev:{what:'Grievance raised · Neel Bose',due:'New grievance',to:['Dr. Aanya Sharma','Priya Nair'],msg:'The family of Neel Bose says the updates they get feel repetitive. Please call or message them today and note what you will change. The grievance has 5 hours left on its response time.'},
  l1:{what:'Detailed history · Neel Bose',due:'1 day late',to:['Dr. Aanya Sharma'],msg:'The detailed history for Neel Bose was due yesterday. Please complete it today so the plan and orders can be reviewed.'},
  l2:{what:'Capacity assessment · Sameer Das',due:'Due yesterday',to:['Dr. Rohan Mehta'],msg:'The capacity assessment for Sameer Das was due yesterday. Please record it today.'},
  l3:{what:'Daily notes · 3 patients',due:'1 day late',to:['Dr. Kunal Sethi'],msg:'Daily notes for Varun Rao, Karan Malhotra and Tarun Roy were not written yesterday. Please add them today.'}
};
function flNudge(id){
  const n=FL_NUDGE[id];if(!n){toast('Reminder sent');return;}
  const pr=(S.nudged||{})[id];
  openModal(flTop('Nudge '+n.to.join(' and '),n.what+' · '+n.due)+`<div class="mb">
    ${pr?`<div class="callout grey small">Last nudged at ${pr.at}. Sending again adds a second entry on the task.</div>`:''}
    <div class="field"><span class="lbl">Send to</span><div class="radios" id="nTo">${n.to.map(x=>`<button class="tog on" onclick="this.classList.toggle('on')">${x}</button>`).join('')}</div></div>
    <div class="field"><span class="lbl">Send through</span><div class="radios" id="nCh"><button class="tog on" onclick="this.classList.toggle('on')">Portal alert</button><button class="tog on" onclick="this.classList.toggle('on')">Push to phone</button><button class="tog" onclick="this.classList.toggle('on')">WhatsApp</button></div></div>
    <label class="field"><span class="lbl">Message</span><textarea class="input" id="nMsg" rows="4">${hesc(n.msg)}</textarea><span class="tiny muted">Short and specific works best. No clinical details over WhatsApp.</span></label>
    <label class="field"><span class="lbl">If it is still open</span><select class="input" id="nRep"><option>Do not remind again</option><option>Remind again in 2 hours</option><option>Remind again tomorrow at 9 am</option></select></label>
    <div class="callout grey small">The nudge is saved on the task, so anyone opening it can see who was reminded and when.</div></div>
    <div class="mf"><button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="flNudgeSend('${id}')">Send nudge</button></div>`);
}
function flNudgeSend(id){
  const to=[...document.querySelectorAll('#nTo .on')].map(b=>b.textContent);
  if(!to.length){toast('Pick who to send it to');return;}
  if(!$('nMsg').value.trim()){toast('Write a short message first');$('nMsg').focus();return;}
  S.nudged=S.nudged||{};S.nudged[id]={at:clock(),to};
  closeModal();render();toast('Nudge sent to '+to.join(' and '));
}
function flOpen(id){
  ({griev:flGriev,l1:()=>flPend('l1'),l2:()=>flPend('l2'),l3:flNotes,l5:flSign}[id]||(()=>{}))();
}
function flGriev(){
  const g=S.flg||(S.flg={owner:'Priya Nair',note:'',ack:false});
  const O=['Priya Nair · psychologist','Dr. Aanya Sharma · psychiatrist','Dr. Nandini Rao · me'];
  openModal(flTop('Grievance · Neel Bose','Raised today 10:58 · reply due in 5 hours')+`<div class="mb">
    ${flHead(FL_P('neel'),chip('5 h left','c-amber'),'Raised by the family · Ananya Bose')}
    <div class="field"><span class="lbl">What the family said</span><div class="flq">Updates feel repetitive.<div class="tiny muted" style="margin-top:4px">Came in as detractor feedback after the last family call</div></div></div>
    <div class="field"><span class="lbl">So far</span><ul class="fltl">
      <li class="dn"><div>Grievance raised from the feedback</div><div class="tm">10:58</div></li>
      <li class="dn"><div>Dr. Aanya Sharma and Priya Nair alerted</div><div class="tm">10:58</div></li>
      <li class="${g.ack?'dn':'now'}"><div>${g.ack?'Acknowledged by the floor lead · owner '+hesc(g.owner):'Floor lead to acknowledge and pick an owner'}</div><div class="tm">${g.ack?g.at:'Now'}</div></li>
      <li><div>Reply to the family</div><div class="tm">Within 5 hours</div></li></ul></div>
    <div class="grid2"><label class="field"><span class="lbl">Owner</span><select class="input" id="gOwn">${O.map(o=>`<option ${o.startsWith(g.owner)?'selected':''}>${o}</option>`).join('')}</select></label>
      <label class="field"><span class="lbl">Reply by</span><select class="input" id="gBy"><option>Phone call from the owner</option><option>WhatsApp message</option><option>At the next family meeting · 12:00</option></select></label></div>
    <label class="field"><span class="lbl">Note for the owner (optional)</span><textarea class="input" id="gNote" rows="2" placeholder="e.g. Offer a fixed update time each day">${hesc(g.note)}</textarea></label></div>
    <div class="mf"><button class="btn" style="margin-right:auto" onclick="closeModal();go('#/patient/neel/griev')">Open grievance</button><button class="btn" onclick="closeModal()">Close</button><button class="btn pri" onclick="flGrievSave()">${g.ack?'Update owner':'Acknowledge and assign'}</button></div>`);
}
function flGrievSave(){
  const g=S.flg;g.owner=$('gOwn').value.split(' · ')[0];g.note=$('gNote').value.trim();g.ack=true;g.at=clock();
  flFx('griev','Acknowledged · '+g.owner,'c-green');
  closeModal();render();toast('Assigned to '+g.owner+'. They have been told to reply within 5 hours.');
}
const FL_PEND={
  l1:{pid:'neel',doc:'Dr. Aanya Sharma',ini:'AS',role:'Treating psychiatrist',title:'Detailed history',sub:'Deadline passed yesterday · 6 pm',late:'1 day late',
    items:[['Chief complaints','Recorded 21 Oct',1],['History of presenting illness','Not written',0],['Physical examination','Done by the RMO',1],['Observation','Not written',0],['Behaviour','Not written',0]],
    ext:['Until today 6 pm','Until tomorrow 12 pm'],go:'#/patient/neel/admission'},
  l2:{pid:'sameer',doc:'Dr. Rohan Mehta',ini:'RM',role:'Treating psychiatrist',title:'Capacity assessment',sub:'Was due yesterday',late:'Due yesterday',
    items:[['Understands the information about treatment','Recorded',1],['Appreciates what the choice means for them','Not recorded',0],['Retains it long enough to decide','Not recorded',0],['Communicates a decision','Not recorded',0]],
    ext:['Until today 6 pm','Until tomorrow 12 pm'],go:'#/patient/neel/admission'}
};
function flPend(id){
  const c=FL_PEND[id],p=FL_P(c.pid),fx=(S.flx||{})[id],done=c.items.filter(i=>i[2]).length,pr=(S.nudged||{})[id];
  openModal(flTop(c.title+' · '+p.name,c.sub)+`<div class="mb">
    ${flHead(p,chip(fx?fx.text:c.late,fx?fx.cls:'c-amber'),p.dx)}
    <div class="flh" style="background:#fff">${av(c.ini,36,'c-violet')}<div class="grow"><div class="nm">${c.doc}</div><div class="small muted">${c.role}${pr?' · nudged '+pr.at:' · not nudged yet'}</div></div><button class="btn sm" onclick="flNudge('${id}')">${pr?'Nudge again':'Nudge'}</button></div>
    <div class="field"><span class="lbl">What is missing · ${done} of ${c.items.length} done</span><div class="flck">${c.items.map(i=>`<div class="r ${i[2]?'ok':''}"><span class="ic">${i[2]?'✓':''}</span><div class="grow">${i[0]}</div><span class="small ${i[2]?'muted':''}" style="${i[2]?'':'color:var(--amber);font-weight:600'}">${i[1]}</span></div>`).join('')}</div></div>
    <div class="field"><span class="lbl">Give more time</span><div class="row" style="gap:8px"><select class="input" id="pExt" style="flex:1">${c.ext.map(x=>`<option>${x}</option>`).join('')}</select><button class="btn" onclick="flExtend('${id}')">Extend deadline</button></div><span class="tiny muted">The task stays on your list until it is done. The doctor is told the new time.</span></div></div>
    <div class="mf"><button class="btn" onclick="closeModal()">Close</button><button class="btn pri" onclick="closeModal();go('${c.go}')">Open patient file</button></div>`);
}
function flExtend(id){
  const t=$('pExt').value;flFx(id,'Extended · '+t.replace('Until ','to '),'c-blue');
  closeModal();render();toast('New deadline '+t.toLowerCase().replace('until ','')+'. '+FL_PEND[id].doc+' has been told.');
}
function flNotes(){
  const R=[['varun','Dr. Kunal Sethi'],['kabir','Dr. Kunal Sethi'],['tarun','Dr. Kunal Sethi']],pr=(S.nudged||{}).l3;
  openModal(flTop('Daily notes · 3 patients','Dr. Kunal Sethi · not written yesterday, 28 Oct')+`<div class="mb">
    <div class="flh" style="background:#fff">${av('KS',36,'c-violet')}<div class="grow"><div class="nm">Dr. Kunal Sethi</div><div class="small muted">Treating psychiatrist · 7 inpatients${pr?' · nudged '+pr.at:' · not nudged yet'}</div></div>${chip('2 overdue','c-amber')}</div>
    <div class="field"><span class="lbl">Notes missing for yesterday</span><div class="flck">${R.map(r=>{const p=FL_P(r[0]);return `<div class="r">${av(p.ini,30,'c-blue')}<div class="grow"><strong>${p.name}</strong><div class="tiny muted">${p.room} · Day ${p.day} · ${p.dx}</div></div>${chip('Not written','c-amber')}</div>`;}).join('')}</div></div>
    <div class="callout grey small">Today's notes are due by 6 pm. Nudging now reminds him about both days.</div></div>
    <div class="mf"><button class="btn" style="margin-right:auto" onclick="S.psyF='Dr. Kunal Sethi';closeModal();go('#/inpatients')">View his patients</button><button class="btn" onclick="closeModal()">Close</button><button class="btn pri" onclick="flNudge('l3')">${pr?'Nudge again':'Nudge Dr. Kunal Sethi'}</button></div>`);
}
function flSign(){
  const p=FL_P('dev');
  openModal(flTop('Sign discharge summary · Dev Kumar','Cover sign-off · draft by Priya Nair, psychologist, 10:20')+`<div class="mb">
    ${flHead(p,chip('Leaves today','c-blue'),p.dx+' · admitted 14 Oct')}
    <div class="callout blue small">Dr. Rohan Mehta is off duty today. You can sign for him so Dev can leave on time. His name stays as the treating psychiatrist, and your signature is recorded as covering.</div>
    <div class="flsum">${[['Discharge diagnosis','Opioid dependence, early remission'],['During the stay','Detox completed. 5 group sessions, 3 individual sessions, 1 family session'],['Condition at discharge','Stable. Sleeping well, no withdrawal signs for 4 days, no risk events'],['Medicines','Naltrexone 50 mg once daily · 30 days<br>Vitamin B complex once daily · 30 days'],['Follow-up','Call after 7 days · OPD review in 2 weeks · check-ins at 30, 60 and 90 days']].map(r=>`<div class="r"><div class="k">${r[0]}</div><div>${r[1]}</div></div>`).join('')}</div>
    <div id="sRetBox" hidden><label class="field"><span class="lbl">What should Priya change?</span><textarea class="input" id="sRet" rows="2" placeholder="e.g. Add the relapse warning signs agreed with the family"></textarea></label></div>
    <label class="check" style="border:0;padding:0"><input type="checkbox" id="sOk" onchange="$('sGo').disabled=!this.checked"><span><strong>I have read the full summary and sign as covering doctor for Dr. Rohan Mehta</strong><br><span class="tiny muted">Recorded with your name, the date and the time.</span></span></label></div>
    <div class="mf"><button class="btn" style="margin-right:auto" onclick="closeModal();go('#/patient/neel/discharge')">Open full summary</button><button class="btn" id="sRetBtn" onclick="flSignReturn()">Return to Priya</button><button class="btn pri" id="sGo" disabled onclick="flSignDo()">Sign as covering doctor</button></div>`);
}
function flSignReturn(){
  const b=$('sRetBox');
  if(b.hidden){b.hidden=false;$('sRetBtn').textContent='Send back with comment';$('sRet').focus();return;}
  if(!$('sRet').value.trim()){toast('Say what Priya should change');$('sRet').focus();return;}
  flFx('l5','Returned to Priya','c-amber');closeModal();render();toast('Sent back to Priya Nair with your comment');
}
function flSignDo(){
  S.done.l5=true;closeModal();render();toast('Signed as covering doctor for Dr. Rohan Mehta. Summary filed and the family briefing can go ahead.');
}
function flApprove(id){
  const p=FL_P('varun'),T=S.flTr||(S.flTr={eff:'Today'});
  const who=['Dr. Kunal Sethi · current psychiatrist','Dr. Rohan Mehta · new psychiatrist','Priya Nair · psychologist','Nursing station · Male ward','Family · on WhatsApp'];
  openModal(flTop('Approve transfer · Varun Rao','Request from Dr. Kunal Sethi · 9:05')+`<div class="mb">
    ${flHead(p,chip('Needs your approval','c-blue'),p.dx)}
    <div class="fltr"><div class="bx"><div class="tiny muted">From</div><strong>Dr. Kunal Sethi</strong><div class="small muted">7 inpatients now</div><b>7 → 6</b></div><div class="ar">→</div><div class="bx to"><div class="tiny muted">To</div><strong>Dr. Rohan Mehta</strong><div class="small muted">7 inpatients now</div><b>7 → 8</b></div></div>
    <div class="callout grey small"><strong>Reason given: workload.</strong> Dr. Sethi has 2 overdue tasks and 5 due today.</div>
    <div class="field"><span class="lbl">Starts from</span><div class="radios">${['Today','Tomorrow rounds'].map(x=>`<button class="tog ${T.eff===x?'on':''}" onclick="S.flTr.eff='${x}';document.querySelectorAll('#tEff button').forEach(b=>b.classList.toggle('on',b===this))">${x}</button>`).join('')}</div></div>
    <div class="field"><span class="lbl">Who is told</span><div class="flck">${who.map((w,i)=>`<label class="r" style="cursor:pointer"><input type="checkbox" checked style="accent-color:var(--blue);width:16px;height:16px"><div class="grow">${w}</div></label>`).join('')}</div></div>
    <label class="field"><span class="lbl">Note for both doctors (optional)</span><input class="input" id="tNote" placeholder="e.g. Hand over the detox plan in person"></label></div>
    <div class="mf"><button class="btn" style="margin-right:auto" onclick="flDecline('${id}')">Decline</button><button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="flApproveDo('${id}')">Approve transfer</button></div>`);
  document.querySelector('#modal .radios').id='tEff';
}
function flApproveDo(id){
  const n=document.querySelectorAll('#modal .flck input:checked').length;
  S.done[id]=true;closeModal();render();toast('Transfer approved. Varun Rao moves to Dr. Rohan Mehta '+((S.flTr||{}).eff==='Today'?'today':'from tomorrow\'s rounds')+'. '+n+' people told.');
}
function flDecline(id){
  openModal(flTop('Decline transfer · Varun Rao','Request from Dr. Kunal Sethi · workload')+`<div class="mb">
    <div class="callout amber small">Varun Rao stays with Dr. Kunal Sethi. He sees your reason, so keep it clear and kind.</div>
    <label class="field"><span class="lbl">Reason</span><select class="input" id="dRes"><option>Continuity of care for this patient</option><option>Dr. Rohan Mehta has no room this week</option><option>Patient is high risk right now</option><option>Another doctor suits better</option><option>Other</option></select></label>
    <label class="field"><span class="lbl">Note for Dr. Kunal Sethi (required)</span><textarea class="input" id="dNote" rows="3" placeholder="e.g. Varun is on day 4 of withdrawal. Let's move him after day 7. I will take 2 of your overdue notes meanwhile."></textarea><div id="dErr" class="small" style="color:var(--red);display:none">Write a short note so he knows why</div></label></div>
    <div class="mf"><button class="btn" style="margin-right:auto" onclick="flApprove('${id}')">Back</button><button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="flDeclineDo('${id}')">Send decline</button></div>`);
}
function flDeclineDo(id){
  if(!$('dNote').value.trim()){$('dErr').style.display='block';$('dNote').focus();return;}
  S.done[id]=true;closeModal();render();toast('Declined. Dr. Kunal Sethi has your note and Varun Rao stays with him.');
}
function assignModal(id){
  const r=FL_P('rohit');
  openModal(flTop('Treating team · Rohit Kapoor','Admitted 10:30 · Suite 201 · Male ward, floor 2')+`<div class="mb">
    ${flHead(r,chip('New admission','c-blue')+(VIP.rohit?'<span class="tagvip" style="font-size:11px;padding:3px 8px">VVIP</span>':''),'Recommended for admission in OPD by Dr. Aanya Sharma')}
    ${VIP.rohit?`<div class="callout small" style="background:#f6f2ff;border:1px solid #ddd3fb;color:#43308a"><strong>Suite room · VVIP.</strong> Suite patients go to a senior doctor. Senior doctors are marked below.</div>`:''}
    <label class="field"><span class="lbl">Psychiatrist <span class="chip c-blue" style="margin-left:6px;text-transform:none;letter-spacing:0">Auto: by ward</span></span><select class="input" id="asPy" onchange="assignChk()"><option>Dr. Aanya Sharma · Senior consultant · Male ward, floor 2 · 8 inpatients</option><option>Dr. Nandini Rao (you) · Floor lead · 6 inpatients</option><option>Dr. Rohan Mehta · Consultant · 7 inpatients</option><option>Dr. Kunal Sethi · Consultant · 7 inpatients</option></select><span class="tiny muted" id="asW">Filled in from where the patient is admitted, and already a senior doctor. The floor lead can change it.</span></label>
    <label class="field"><span class="lbl">Psychologist (optional now)</span><select class="input" id="asPs"><option value="">Leave for the psychiatrist to add</option><option>Surabhi Sengar · 5 inpatients · fewest</option><option>Kiran Mehra · 8 inpatients</option><option>Priya Nair · 9 inpatients</option></select><span class="tiny muted">Usually added by the treating psychiatrist or the front desk. Surabhi Sengar has the lightest list.</span></label>
    <div class="field"><span class="lbl">When you confirm</span><ul class="fltl"><li class="dn"><div>Rohit appears in the psychiatrist's patient list</div></li><li class="dn"><div>Admission workup goes to the RMO</div></li><li class="dn"><div>Family call and consent tasks are created</div></li></ul></div></div>
    <div class="mf"><button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="assignDo('${id}')">Confirm team</button></div>`);
}
function assignChk(){const v=$('asPy').value,sn=v.startsWith('Dr. Aanya')||v.startsWith('Dr. Nandini'),w=$('asW');
  w.innerHTML=sn?'Senior doctor, suitable for a suite patient.':'<strong style="color:var(--amber)">Not a senior doctor.</strong> This is a suite patient. Consider Dr. Aanya Sharma or yourself.';}
function assignDo(id){
  const ps=$('asPs').value;if(ps)S.flPsy=ps;
  S.done[id]=true;closeModal();render();toast(ps?'Team confirmed with '+ps.split(' · ')[0]+' as psychologist. Admission workup and calls created.':'Team confirmed. Admission workup and calls created.');
}
function addPsychModal(){openModal(`<div class="mh"><h3>Add psychologist</h3><button class="x" aria-label="Close" onclick="closeModal()">×</button></div>
 <div class="mb"><label class="field"><span class="lbl">Psychologist</span><select class="input" id="aps"><option>Priya Nair · 5 inpatients</option><option>Kiran Mehra · 4 inpatients</option><option>Surabhi Sengar · 3 inpatients</option></select></label>
 <div class="callout grey small">The treating psychiatrist or the front desk adds the psychologist. They get the patient in their list with the history, plan and call tasks.</div></div>
 <div class="mf"><button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="if(location.hash.includes('patient'))S.team.psych=$('aps').value.split(' · ')[0];closeModal();render();toast('Psychologist added to the treating team')">Add</button></div>`);}
function schedMsg(who){openModal(`<div class="mh"><h3>Message ${who}</h3><button class="x" aria-label="Close" onclick="closeModal()">×</button></div>
 <div class="mb"><div class="small muted">Offer times for the call. The family picks one with a tap on WhatsApp, and the call task moves to that time.</div>
 <div class="field"><span class="lbl">Times to offer</span><div class="radios" id="slots">${['Today 13:00','Today 16:00','Today 18:30','Tomorrow 10:00'].map((t,i)=>`<button class="tog ${i<3?'on':''}" onclick="this.classList.toggle('on')">${t}</button>`).join('')}</div></div>
 <label class="field"><span class="lbl">Message</span><textarea class="input">Namaste, this is ${signer()} from Tulasi Healthcare. I would like to call you for an update on your family member. Please pick a time that suits you.</textarea></label>
 <div class="callout grey">Goes from Tulasi's WhatsApp number, not your personal phone, and is saved on the record. No clinical details in messages.</div></div>
 <div class="mf"><button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="if(!document.querySelector('#slots .on')){toast('Pick at least one time');return;}closeModal();toast('Sent to ${who} on WhatsApp. You will be notified when they pick a time.')">Send</button></div>`);}
function callFamily(id){
  toast('Calling through CallerDesk… connected. Call logged: 4 min, recording saved.');
  setTimeout(()=>openModal(`<div class="mh"><h3>How did the call go?</h3><button class="x" aria-label="Close" onclick="closeModal()">×</button></div>
   <div class="mb"><div class="callout grey">Logged automatically: today, 4 min 12 s, recording saved. Pick the outcome; that's all.</div>
   <label class="field"><span class="lbl">Outcome</span><select class="input"><option>Spoke to family, update given</option><option>No answer, retry later</option><option>Family has a concern, raise grievance</option></select></label>
   <label class="field"><span class="lbl">Note (optional)</span><input class="input" placeholder="Anything the team should know"></label></div>
   <div class="mf"><button class="btn pri" onclick="S.done['${id}']=true;S.calls.d34psy='done';closeModal();render();toast('Call marked done')">Save</button></div>`),900);
}

/* ---------- inpatient list ---------- */
let filt='all';
function ptFilters(DOCS){
  const sel=(lab,cur,opts,key)=>`<select class="input fsel" aria-label="${lab}" onchange="S.${key}=this.value;render()">${opts.map(([v,t])=>`<option value="${v}" ${cur===v?'selected':''}>${t}</option>`).join('')}</select>`;
  const cnt=fn=>PTS.filter(fn).length,RT=['Suite','Deluxe','Twin sharing','Standard','Observation'];
  const act=[];
  if(S.psyF)act.push([S.psyF,'psyF']);if(S.pcF)act.push([S.pcF==='__none'?'No psychologist':S.pcF,'pcF']);if(S.rtF)act.push([S.rtF+' rooms','rtF']);
  return `<div class="ptfil"><span class="lbl">Filter</span>
    ${sel('Psychiatrist',S.psyF||'',[['','All psychiatrists · '+PTS.length]].concat(DOCS.map(d=>[d,d+' · '+cnt(p=>PSYOF[p.id]===d)])),'psyF')}
    ${sel('Psychologist',S.pcF||'',[['','All psychologists'],['Priya Nair','Priya Nair · '+cnt(p=>PSYCHOF[p.id]==='Priya Nair')],['Kiran Mehra','Kiran Mehra · '+cnt(p=>PSYCHOF[p.id]==='Kiran Mehra')],['__none','No psychologist · '+cnt(p=>!PSYCHOF[p.id])]],'pcF')}
    ${sel('Room type',S.rtF||'',[['','All room types']].concat(RT.map(t=>[t,t+' · '+cnt(p=>rtype(p)===t)])),'rtF')}
    ${act.length?`<button class="lnk" style="margin:0" onclick="S.psyF='';S.pcF='';S.rtF='';render()">Clear all</button>`:''}</div>`;
}
/* ---------- inpatient list: one layout for every role ---------- */
const IPD_SEG=[['all','All inpatients','','Everyone currently admitted'],['h24','New in 24 h','b','Admission workup and 24-hour call due'],['risk','High risk','r','On close observation'],['new','First 72 hours','','Early-stay assessments'],['dis','Discharge planned','','Expected dates can change'],['vip','VVIP','v','']];
const ipdIn=(k,p,dis)=>k==='all'||(k==='h24'&&p.day<=1)||(k==='risk'&&p.risk)||(k==='new'&&p.day<=3)||(k==='dis'&&dis(p))||(k==='vip'&&isVipRoom(p));
const ipdCmp=s=>s==='room'?((a,b)=>String(a.room).localeCompare(String(b.room),undefined,{numeric:true})):s==='day'?((a,b)=>a.day-b.day):((a,b)=>(b.risk?1:0)-(a.risk?1:0)||(a.day<=1?0:1)-(b.day<=1?0:1));
function ipdSeg(cur,set,count,keys){
  /* One row of filters. "First 72 hours" overlaps "New in 24 h", and empty filters add noise, so both are left out. */
  const on=IPD_SEG.filter(s=>keys.includes(s[0])&&(s[0]!=='new'||cur==='new')).filter(s=>s[0]==='all'||s[0]===cur||count(s[0])>0);
  return `<div class="ipv" role="group" aria-label="Show inpatients">${on.map(([k,l,c,t])=>`<button class="${c} ${cur===k?'on':''}" aria-pressed="${cur===k}" title="${t}" onclick="${set(k)};render()"><b>${count(k)}</b><span>${l}</span></button>`).join('')}</div>`;
}
function ipdBar(scr,srt,onSort,id,shown,total){
  const L=lst(scr);
  return `<div class="ptbar"><div class="psearch"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg><input id="lq_${scr}" placeholder="Search" aria-label="Search inpatients by name, UHID, room or diagnosis" value="${hesc(L.q)}" oninput="lstQ('${scr}',this.value)"></div>${shown<total?`<span class="small muted">${shown} of ${total}</span>`:''}<select class="input" ${id?`id="${id}" `:''}aria-label="Sort inpatients" style="width:auto;min-height:36px;padding:6px 10px" onchange="${onSort}">${[['att','Needs attention first'],['room','Room'],['day','Day of stay']].map(([v,t])=>`<option value="${v}" ${srt===v?'selected':''}>${t}</option>`).join('')}</select></div>`;
}
/* ---------- inpatient list: one row and one page layout for every role ---------- */
function ipdRow(p,o){
  const flags=`${p.day<=1?'<span class="tagnew">NEW · 24 H</span>':''}${p.risk?'<span class="tagrisk">HIGH RISK</span>':''}${VIP[p.id]?`<span class="tagvip" title="${VIP[p.id]}">VVIP</span>`:''}`;
  const dn=o.doc(p),pc=o.psy(p);
  const team=dn==='Unassigned'?chip('Unassigned','c-amber'):`${o.showDoc?`<div class="ctr"><span class="rl d">D</span>${dn}</div>`:''}<div class="ctr"><span class="rl s">P</span>${pc||`<button class="lnk" style="margin:0" onclick="addPsychModal()">Add psychologist</button>`}</div>`;
  const dc=o.dc(p),hasDc=dc&&dc!=='Not set';
  const sub=[rtype(p)==='Standard'?'':rtype(p),o.lead?floorName(p):'','Day '+p.day,'Sec '+p.sec].filter(Boolean).join(' · ');
  return `<tr><td><div class="row" style="gap:12px;flex-wrap:nowrap"><span class="avatar pav">${p.ini}</span><div><div style="font-weight:600">${p.name}</div><div class="tiny muted" title="UHID ${p.uhid||'–'}">${o.id(p)}</div>${flags?`<div class="ipf">${flags}</div>`:''}</div></div></td>
  <td style="white-space:nowrap"><div style="font-weight:600">${p.room.replace('Room ','R-').replace(' · Observation','')}</div><div class="tiny muted">${sub}</div>${hasDc?`<div class="dcl" title="Expected discharge date; can change">Discharge ${dc}</div>`:''}</td>
  <td class="small dxt">${p.dx}</td><td class="small">${team}</td><td>${obsChip(p.id)}${o.c6l?'':`<div class="small" style="margin-top:6px">${o.c6(p)}</div>`}</td>${o.c6l?`<td class="small">${o.c6(p)}</td>`:''}
  <td><div class="row" style="gap:6px;flex-wrap:nowrap"><button class="ibtn" title="Message caregiver" aria-label="Message ${hesc(p.name)}'s caregiver" onclick="schedMsg('the caregiver')">${icon.msg}</button><button class="viewbtn" onclick="go('${o.go(p)}')">View</button></div></td></tr>`;
}
function ipdPage(o){
  const L=lst(o.scr),vis=p=>lstMatch(p,L,o.att),shown=o.list.filter(vis).length;
  const docs=[...new Set(o.list.map(o.doc))],one=!o.lead&&docs.length===1&&docs[0]!=='Unassigned';
  o.showDoc=!o.lead&&!one;
  const nc=o.c6l?7:6,rf=p=>ipdRow(p,o),flat=!o.lead&&new Set(o.list.map(floorNo)).size<2;
  const body=o.groups?o.groups(rf,vis):(flat?o.list.filter(vis).map(rf).join(''):grpRows(o.list,rf,nc,o.scr,o.att));
  return `<div class="ipd">
  <div><h2 style="font-size:26px">${o.title}</h2><div class="muted" style="margin-top:4px">${o.total} patient${o.total===1?'':'s'} · ${o.where}${one?' · '+docs[0]:''}</div></div>
  <section class="card ptable"><div class="ipbar">${ipdSeg(o.cur,o.set,o.count,o.keys)}${ipdBar(o.scr,o.srt,o.onSort,o.sid||'',shown,o.total)}</div>${o.filters||''}
  <div class="scroll"><table class="t pt dn-${dens(o.list.length)}"><thead><tr><th>Patient</th><th>Room</th><th>Diagnosis</th><th>Care team</th><th>${o.c6l?'Monitoring':(o.mh||'Monitoring · next due')}</th>${o.c6l?`<th>${o.c6l}</th>`:''}<th></th></tr></thead><tbody>${body||`<tr><td colspan="${nc}" class="pad small muted">No patient matches</td></tr>`}</tbody></table></div></section>${o.after||''}</div>`;
}
function vInpatients(){
  $('title').textContent='Inpatients';
  const L=isLead(),srt=S.ipdSort||'att',dis=p=>EX[p.id][2]!=='Not set';
  const DOCS=['Dr. Aanya Sharma','Dr. Rohan Mehta','Dr. Kunal Sethi'];
  const f=PTS.filter(p=>ipdIn(filt,p,dis)&&(!L||!S.psyF||PSYOF[p.id]===S.psyF)&&(!L||!S.pcF||(S.pcF==='__none'?!PSYCHOF[p.id]:PSYCHOF[p.id]===S.pcF))&&(!L||!S.rtF||rtype(p)===S.rtF)).sort(ipdCmp(srt));
  return ipdPage({scr:'ipd',lead:L,list:f,total:PTS.length,srt,att:p=>p.risk,onSort:'S.ipdSort=this.value;render()',
    title:L?'Floor inpatients':isWard()?'Ward inpatients':'My inpatients',where:'Gurgaon · Male ward'+(L?' · grouped by psychiatrist':''),
    cur:filt,set:k=>`filt='${k}'`,count:k=>PTS.filter(p=>ipdIn(k,p,dis)).length,keys:['all','h24','risk','new','dis','vip'],filters:L?ptFilters(DOCS):'',
    doc:p=>PSYOF[p.id],psy:p=>PSYCHOF[p.id]||'',dc:p=>EX[p.id][2],go:()=>'#/patient/neel/overview',
    id:p=>`${p.age}/${p.sex} ${p.room.replace(/^Room\s*/i,'R ')} · TH-${1040+PTS.indexOf(p)}`,c6l:'',c6:p=>`<span style="white-space:nowrap;${/late/.test(EX[p.id][1])?'color:var(--amber);font-weight:600':''}">${EX[p.id][1]}</span>`,
    groups:L?(rf,vis)=>DOCS.filter(d=>!S.psyF||d===S.psyF).map(d=>{const g=f.filter(p=>PSYOF[p.id]===d&&vis(p));if(!g.length)return '';const od=g.filter(p=>/late/.test(EX[p.id][1])).length;
      return `<tr class="fh"><td colspan="6"><div class="row" style="gap:8px;padding:9px 14px"><strong>${d}</strong>${SENIOR[d]?chip(SENIOR[d],'c-violet'):''}<span class="tiny muted">${g.length} patient${g.length>1?'s':''}</span>${od?chip(od+' overdue','c-amber'):''}${d==='Unassigned'?`<button class="btn sm" style="margin-left:auto" onclick="assignModal('l0')">Assign</button>`:''}</div></td></tr>${g.map(rf).join('')}`}).join(''):null});
}

/* ---------- rounds ---------- */
function vRounds(){
  $('title').textContent='Rounds';
  const R=S.rounds; const WP=WARDS[R.ward]; const RI=R.idx[R.ward]; const p=WP[Math.min(RI,WP.length-1)]; const done = RI>=WP.length;
  const tot=Object.values(WARDS).reduce((a,w)=>a+w.length,0), seen=Object.keys(WARDS).reduce((a,k)=>a+Math.min(R.idx[k],WARDS[k].length),0);
  const wardTabs=`<div class="row" style="gap:10px;flex-wrap:wrap">${Object.keys(WARDS).map(k=>{const n=WARDS[k].length,sn=Math.min(R.idx[k],n);return `<button class="tog ${R.ward===k?'on':''}" style="height:auto;padding:8px 14px;display:flex;flex-direction:column;align-items:flex-start;gap:2px" onclick="S.rounds.ward='${k}';S.rounds.drafted=false;S.rounds.listening=false;render()"><span style="font-weight:600">${k}</span><span class="tiny">${sn===n?'Done':sn+' of '+n+' seen'}</span></button>`}).join('')}</div>`;
  const q = WP.map((x,j)=>{const st=j<RI?'Seen':(j===RI?'Now':'Next');const c=st==='Seen'?'c-green':(st==='Now'?'c-blue':'c-grey');
    return `<button class="rpill ${st==='Now'?'on':''}" onclick="S.rounds.idx[S.rounds.ward]=${j};S.rounds.drafted=false;S.rounds.mc=[];S.rounds.adv=[];S.rounds.mon=[];S.rounds.inv=[];S.rounds.ref=[];render()"><span style="text-align:left"><span style="display:block;font-weight:600;font-size:13px">${x.name}</span><span class="tiny muted">${x.room}</span></span>${chip(st,c)}</button>`}).join('');
  const draft = R.drafted?`
    <div><div class="lbl">Round note</div><div class="note small" style="margin-top:6px">Calmer today, sleep improved, engaging in groups. Pressured speech at times. Plan: increase olanzapine, check lithium level.</div></div>
    <div class="lbl">To-dos</div>
    <div class="box row"><span class="grow">Serum lithium level tomorrow morning</span>${chip('Nurse','c-grey')}</div>
    <div class="box row"><span class="grow">Individual session today</span>${chip('Priya Nair','c-violet')}</div>
    <div class="box row"><span class="grow">Family meeting this week on progress</span>${chip('Family coordinator','c-grey')}</div>
    <div class="row" style="justify-content:flex-end"><button class="btn" onclick="toast('Opens the draft for editing')">Edit draft</button><button class="btn pri" onclick="confirmRound()">Confirm and next patient</button></div>`
   : `<button class="btn ${R.listening?'':'pri'}" onclick="listenRound()">${R.listening?'<span class="rec"><i></i>Listening… tap to stop</span>':icon.mic+' Start listening'}</button>`;
  return `
  <div class="row" style="justify-content:space-between"><div><h2>Rounds · ${R.ward}</h2><div class="muted small" style="margin-top:4px">${Math.min(RI,WP.length)} of ${WP.length} seen in this ward · ${seen} of ${tot} across your wards today</div></div><button class="btn" onclick="go('#/myday')">End rounds</button></div>
  ${S.role==='lead'?wardTabs:''}
  ${done?`<section class="card pad"><h3>${R.ward} complete</h3><p class="muted">All round notes saved as today's daily notes. Orders and to-dos went to their owners.</p><div class="row" style="gap:8px">${Object.keys(WARDS).filter(k=>R.idx[k]<WARDS[k].length).slice(0,1).map(k=>`<button class="btn pri" onclick="S.rounds.ward='${k}';render()">Next: ${k}</button>`).join('')}<button class="btn" onclick="S.rounds.idx[S.rounds.ward]=0;render()">Restart this ward</button></div></section>`:`
  <div class="rlayout"><aside class="card rqueue" aria-label="Ward order"><div style="padding:4px 6px 6px"><div class="lbl">Ward order</div><div class="tiny muted" style="margin-top:2px">${WP.length} patients · ${Math.min(RI,WP.length)} seen</div></div>${q}</aside>
  <div style="display:flex;flex-direction:column;gap:16px;min-width:0">
      <section class="card pad row">${av(p.ini,52,p.risk?'c-red':'c-blue')}<div class="grow"><div class="row" style="gap:10px"><h2>${p.name}</h2><span class="muted">${window.psyPatientLine?psyPatientLine(p):`${p.age}/${p.sex} ${p.room}`} · Day ${p.day} · Section ${p.sec}</span></div><div class="row" style="gap:8px;margin-top:8px">${p.risk?chip('High risk','c-red'):''}${chip('Slept 6 to 7 h','c-grey')}${chip('All doses taken','c-grey')}${chip('Joined group therapy','c-grey')}${obsChip(p.id)}${vitChips(p)}</div></div><div class="row" style="gap:8px"><button class="btn" ${RI===0?'disabled':''} onclick="S.rounds.idx[S.rounds.ward]=Math.max(0,S.rounds.idx[S.rounds.ward]-1);S.rounds.drafted=false;S.rounds.mc=[];S.rounds.adv=[];S.rounds.mon=[];S.rounds.inv=[];S.rounds.ref=[];S.rounds.tnote='';render()">‹ Previous patient</button><button class="btn" onclick="S.rounds.idx[S.rounds.ward]++;S.rounds.drafted=false;S.rounds.mc=[];S.rounds.adv=[];S.rounds.mon=[];S.rounds.inv=[];S.rounds.ref=[];S.rounds.tnote='';render()">Next patient ›</button><button class="btn" onclick="go('#/patient/${p.id}/overview')">Open full record</button></div></section>
      <div class="rtop">
        <section style="display:flex;flex-direction:column;gap:8px;padding:0 4px"><h3>Since last round</h3><div class="small" style="color:var(--ink-2)">Yesterday: under 4 hours sleep, irritable. Psychologist today: slept through, joined group therapy.</div><div class="row" style="gap:8px">${chip('Detailed history overdue 1 day','c-amber')}</div></section>
        <section style="display:flex;flex-direction:column;gap:10px;padding:0 4px"><div class="row" style="justify-content:space-between"><h3>AI scribe</h3>${R.drafted?chip('Draft ready','c-blue'):''}</div>${draft}
        <label class="field" style="margin-top:2px"><span class="tiny muted">In case AI scribe is not working, type the round note here</span><textarea class="input" rows="3" placeholder="Type the round note here" oninput="S.rounds.scribeNote=this.value">${hesc(R.scribeNote||'')}</textarea></label></section>
      </div>
      <section class="card rbox">
        <div class="rquad">${roundMeds()}${roundMon()}</div>
        <div class="rquad">${roundAdvice()}${roundRef()}</div>
      </section>${roundFooter()}
    </div>
  </div>`}`;
}
function roundMedsOld(){
  const R=S.rounds; const mc=R.mc;
  if(!isPsy()) return `<section class="card"><div class="hd"><h3>Medicines</h3><button class="btn sm" onclick="medChartModal()">View full medication chart</button></div>${S.meds.map(m=>`<div class="li"><span class="grow" style="font-weight:600">${m.name}</span><span class="small muted">${m.freq}</span></div>`).join('')}${mc.length?`<div class="pad small"><span class="muted">Changes from this round:</span> ${mc.map(c=>c.act+' '+c.text).join('; ')}</div>`:''}</section>`;
  const cur=S.meds.filter(m=>!m.name.includes('waiting'));
  return `<section class="card"><div class="hd"><div><h3>Medicine changes</h3><div class="small muted" style="margin-top:4px">Type changes yourself; the scribe only suggests. Each change becomes an order once you confirm.</div></div><div class="row" style="gap:8px">${mc.length?chip(mc.length+' pending','c-blue'):''}<button class="btn sm" onclick="medChartModal()">View full medication chart</button></div></div>
    <div class="scroll"><table class="t"><thead><tr><th>Current medicine</th><th>Freq.</th><th style="text-align:right">Change</th></tr></thead><tbody>
    ${cur.map((m,i)=>`<tr><td style="font-weight:600">${m.name}</td><td>${m.freq}</td><td style="text-align:right"><div class="row" style="justify-content:flex-end;gap:6px">
      <select class="input" style="width:auto;max-width:150px;min-height:30px;padding:3px 8px" aria-label="New dose for ${m.name}" onchange="if(this.value){rmAdd('Change','${m.name}: '+this.value.toLowerCase())}"><option value="">Change dose or timing</option>${['Increase dose','Reduce dose','Change to 1-0-1','Change to 0-0-1','Change to SOS','Before food','After food'].map(o=>`<option>${o}</option>`).join('')}</select>
      <button class="btn sm" onclick="rmAdd('Stop','${m.name}')">Stop</button></div></td></tr>`).join('')}
    </tbody></table></div>
    <div style="padding:12px 20px;border-top:1px solid var(--line-2)" class="row">
      <select class="input" id="rmNew" style="width:auto;min-height:34px" aria-label="New medicine"><option value="">Add a new medicine</option>${DRUGS.map(d=>`<option>${d}</option>`).join('')}</select>
      <div class="mini-chips" role="group" aria-label="Frequency" id="rmF">${FREQ.map((f,i)=>`<button class="tog ${i===1?'on':''}" onclick="document.querySelectorAll('#rmF .tog').forEach(b=>b.classList.remove('on'));this.classList.add('on')">${f}</button>`).join('')}</div>
      <button class="btn sm" onclick="const v=$('rmNew').value;if(!v){toast('Pick a medicine');return;}rmAdd('Start',v+', '+document.querySelector('#rmF .tog.on').textContent)">Add</button></div>
    ${mc.length?`<div style="padding:4px 20px 16px;display:flex;flex-direction:column;gap:8px"><div class="lbl">Pending changes</div>${mc.map((c,i)=>`<div class="box row">${chip(c.act,c.act==='Stop'?'c-grey':'c-blue')}<span class="grow small">${c.text}</span>${chip(c.src,c.src==='From scribe'?'c-violet':'c-grey')}<button class="x" aria-label="Remove" onclick="S.rounds.mc.splice(${i},1);render()">×</button></div>`).join('')}
</div>`:''}
  </section>`;
}
const ADV_QUICK=[['Floor manager','Safety','Fall precautions: low bed, night light',1],['Nursing staff','Monitor','Neuro checks every 2 hours',1],['Nursing staff','Monitor','Blood sugar (CBG) 4 times a day',1],['Nursing staff','Monitor','BP and pulse twice a day',1],['Nursing staff','Monitor','Tremor and stiffness daily'],['Nursing staff','Monitor','Sleep chart, hourly checks at night'],['Nursing staff','Monitor','Fluid intake and output daily'],['Nursing staff','Monitor','Weight weekly']];
const THER_QUICK=[['Family coordinator','Family','Arrange a family meeting this week'],['Floor manager','Outing','Plan a supervised outing'],['Psychologist','Therapy','Schedule an individual therapy session'],['Activity team','Therapy','Add to group therapy'],['Activity team','Activity','Occupational therapy'],['Activity team','Activity','Yoga and physical activity'],['Psychologist','Therapy','Psychoeducation session with family'],['Nursing staff','Behaviour guidance','Behaviour plan for ward staff']];
const ADV_TYPES=['Monitor','Safety','Behaviour guidance','Activity','Therapy task','Routine','Family','Other'];
const ADV_TO=['Nursing staff','Floor manager','Activity team','Psychologist','Family coordinator','Kitchen'];
function roundAdviceOld(){
  const R=S.rounds; const a=R.adv; const pending=(R.mc.length||a.length)&&!R.drafted;
  const ps=isPsy(); const QK=ps?ADV_QUICK:THER_QUICK;
  return `<section class="card"><div class="hd"><div><h3>${ps?'Advice and guidance for the team':'Therapeutic plan and notes'}</h3><div class="small muted" style="margin-top:4px">${ps?'What nurses or the floor manager should monitor, and anything else to do for this patient. Each item goes to the person it is for and shows on the ward until stopped.':'Therapeutic advice only: family meetings, outings, therapy and activities. Medicines and medical advice stay with the psychiatrist.'}</div></div>${a.length?chip(a.length+' pending','c-blue'):''}</div>
    <div style="padding:12px 20px;display:flex;flex-direction:column;gap:10px">
      ${ps?'':`<label class="field"><span class="lbl">Therapeutic note</span><textarea class="input" rows="3" oninput="S.rounds.tnote=this.value" placeholder="e.g. More open in today's session; working on sleep routine and anger triggers. Family needs guidance on how to talk about medicines.">${R.tnote||''}</textarea></label>`}
      ${ps?`<div class="lbl">Safety and significant</div>
      <div class="row" style="gap:6px">${QK.map((q,i)=>q[3]?`<button class="tog" style="height:28px;font-size:12px;border-color:var(--amber-line);background:#fffaf2;color:var(--amber);font-weight:600" onclick="advAdd(${i},0)">${q[2]}</button>`:'').join('')}</div>
      <div class="lbl" style="margin-top:4px">Routine monitoring</div>
      <div class="row" style="gap:6px">${QK.map((q,i)=>q[3]?'':`<button class="tog" style="height:28px;font-size:12px" onclick="advAdd(${i},0)">${q[2]}</button>`).join('')}</div>`
      :`<div class="lbl">Quick actions</div>
      <div class="row" style="gap:6px">${QK.map((q,i)=>`<button class="tog" style="height:28px;font-size:12px" onclick="advAdd(${i},1)">${q[2]}</button>`).join('')}</div>
      <div class="row" style="justify-content:flex-end"><button class="btn pri" onclick="confirmRound()">${(R.tnote||a.length)?'Save and next patient':'Next patient'}</button></div>`}
      <div class="lbl" style="margin-top:4px">Write your own</div>
      <div class="row" style="gap:8px;flex-wrap:wrap">
        <select class="input" id="advTo" style="width:auto;min-height:34px" aria-label="For">${(ps?ADV_TO:['Family coordinator','Floor manager','Activity team','Psychologist','Nursing staff']).map(o=>`<option>${o}</option>`).join('')}</select>
        <select class="input" id="advTy" style="width:auto;min-height:34px" aria-label="Type">${(ps?ADV_TYPES:['Therapy','Family','Outing','Activity','Behaviour guidance','Routine','Other']).map(o=>`<option>${o}</option>`).join('')}</select>
        <input class="input" id="advTx" style="flex:1 1 100%;min-height:34px" placeholder="${ps?'e.g. check sugar before each meal for 3 days':'e.g. family meeting with sister on Saturday about relapse signs'}">
        <button class="btn sm" onclick="const t=$('advTx').value.trim();if(!t){toast('Write the guidance first');return;}S.rounds.adv.push({to:$('advTo').value,ty:$('advTy').value,text:t,by:signer()});render()">Add</button>
      </div>
      ${a.length?`<div class="lbl" style="margin-top:4px">Pending</div>${a.map((x,i)=>`<div class="box row">${chip(x.ty,x.ty==='Monitor'||x.ty==='Safety'?'c-blue':'c-violet')}<span class="grow small">${x.text}</span><span class="tiny muted">For ${x.to} · ${x.by}</span><button class="x" aria-label="Remove" onclick="S.rounds.adv.splice(${i},1);render()">×</button></div>`).join('')}`:''}
      ${pending?`<div class="row" style="justify-content:flex-end"><button class="btn pri" onclick="confirmRound()">Save and next patient</button></div>`:''}
    </div></section>`;
}
function advAdd(i,t){const q=(t?THER_QUICK:ADV_QUICK)[i];S.rounds.adv.push({to:q[0],ty:q[1],text:q[2],by:signer()});render();toast('Added for '+q[0]);}
function rmAdd(act,text){S.rounds.mc.push({act,text,src:'Typed'});render();toast(act+' added to pending changes');}
function scribeMeds(){const R=S.rounds;if(!R.mc.some(c=>c.src==='From scribe'))R.mc.push({act:'Change',text:'Olanzapine 10 mg to 15 mg, 0-0-1, after food',src:'From scribe'},{act:'Stop',text:'Lorazepam 1 mg SOS',src:'From scribe'});}
function listenRound(){const R=S.rounds; if(R.listening){R.listening=false;R.drafted=true;scribeMeds();render();return;} R.listening=true;render();setTimeout(()=>{if(S.rounds.listening){S.rounds.listening=false;S.rounds.drafted=true;scribeMeds();render();toast('Draft ready. Review before confirming.');}},2200);}

/* ---------- patient ---------- */
const STAY = [['overview','Stay summary'],['admission','Admission'],['vitals','Vitals and medicines'],['daily','Daily notes'],['orders','Orders and consents'],['forms','Forms to print'],['therapy','Therapy and family'],['prefs','Preferences for admin'],['griev','Grievances'],['discharge','Discharge']];
const stayTabs = () => { const t = S.pastAdm.length ? STAY.slice(0,1).concat([['past','Past admissions']],STAY.slice(1)) : STAY; return S.role==='nurse' ? t.filter(x=>['overview','admission','vitals','update','orders'].includes(x[0])) : t; };
function ptRows(){
  const q=(S.ptq||'').toLowerCase();
  const due=['neel','sameer','rohit'];
  const L=PTS.filter(p=>(p.name+' '+p.room).toLowerCase().includes(q));
  const row=p=>`<button class="${p.id===S.pid?'on':''}" onclick="go('#/patient/${p.id}/'+(location.hash.split('/')[3]||'overview'))">
      ${av(p.ini,32,p.risk?'c-red':'c-blue')}
      <span style="flex:1;min-width:0"><span style="display:block;font-weight:600;font-size:13px">${p.name}</span><span class="tiny muted">${window.psyPatientLine?psyPatientLine(p):`${p.age}/${p.sex} ${p.room}`}</span></span>
      ${due.includes(p.id)?'<span class="st" style="background:var(--amber)" title="Something is due"></span>':''}</button>`;
  const a=L.filter(p=>due.includes(p.id)), b=L.filter(p=>!due.includes(p.id));
  return (a.length?`<div class="lbl" style="padding:8px 10px 4px">Needs you now · ${a.length}</div>${a.map(row).join('')}`:'')+
         (b.length?`<div class="lbl" style="padding:12px 10px 4px">Other inpatients · ${b.length}</div>${b.map(row).join('')}`:'')||'<div class="small muted" style="padding:10px">No match</div>';
}
function ptList(){
  return `<div style="padding:12px 12px 8px;border-bottom:1px solid var(--line-2);display:flex;flex-direction:column;gap:8px">
      <div class="row" style="justify-content:space-between"><strong>My inpatients</strong><span class="chip c-grey">${PTS.length}</span></div>
      <input class="input" style="min-height:36px;padding:7px 10px" placeholder="Search name or room" value="${S.ptq||''}" oninput="S.ptq=this.value;$('ptl').innerHTML=ptRows()" aria-label="Search inpatients">
    </div><div class="pq" id="ptl">${ptRows()}</div>`;
}
function dueItems(){
  if(S.role==='rmo')return rmoDue();
  const d=[];
  if(S.historyStatus!=='signed') d.push(['Detailed history','1 day late',true,'admission']);
  if(!S.dailySaved) d.push(['Daily note','today',false,'daily']);
  if((isPsy()?S.calls.d34psy:S.calls.d34psych)==='due') d.push(['Day 3 to 4 family call','today',false,'therapy']);
  if(!S.capacityDone) d.push(['Capacity assessment','25 Oct',false,'forms']);
  if(!S.reassessDone) d.push(['Re-assessment','25 Oct',false,'forms']);
  return d;
}
function callCaregiver(){
  const k=isPsy()?'d34psy':'d34psych';
  const type=S.calls.h24!=='done'?'24-hour family call':(S.calls[k]==='due'?'Day 3 to 4 family call':'Other call');
  toast('Calling Ananya Bose through CallerDesk… connected');
  setTimeout(()=>openModal(`<div class="mh"><h3>Call with Ananya Bose</h3><button class="x" aria-label="Close" onclick="closeModal()">×</button></div>
   <div class="mb"><div class="callout grey">Logged automatically: today, 6 min 05 s, recording saved.</div>
   <label class="field"><span class="lbl">Counts as</span><select class="input" id="ct"><option>${type}</option>${type!=='Other call'?'<option>Other call</option>':''}</select></label>
   ${type!=='Other call'?`<div class="small" style="color:var(--green)">This was due today, so it will be ticked off in the Inpatient dashboard and the patient experience tracker.</div>`:''}
   <label class="field"><span class="lbl">Outcome</span><select class="input"><option>Spoke to family, update given</option><option>No answer, retry later</option><option>Family raised a concern</option></select></label>
   <label class="field"><span class="lbl">Note (optional)</span><input class="input" placeholder="Anything the team should know"></label></div>
   <div class="mf"><button class="btn pri" onclick="if($('ct').value!=='Other call'){S.calls['${k}']='done';S.done.d34=true;}closeModal();render();toast('Call logged as '+$('ct').value)">Save</button></div>`),900);
}
function msgModal(){openModal(`<div class="mh"><h3>Message Ananya Bose</h3><button class="x" aria-label="Close" onclick="closeModal()">×</button></div>
 <div class="mb"><label class="field"><span class="lbl">Template</span><select class="input" id="mt" onchange="$('mx').value=this.value==='Free text'?'':this.value"><option>Please call me back when you are free</option><option>Reminder: family meeting tomorrow at 12:00</option><option>Visiting hours this weekend are 11:00 to 13:00</option><option>Free text</option></select></label>
 <label class="field"><span class="lbl">Message</span><textarea class="input" id="mx">Please call me back when you are free</textarea></label>
 <div class="callout grey">Goes from Tulasi's WhatsApp number, not your personal phone, and is saved on the record. No clinical details in messages.</div></div>
 <div class="mf"><button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="closeModal();toast('Sent on WhatsApp and logged')">Send</button></div>`);}
function pastSummary(i){const a=S.pastAdm[i||0];openModal(`<div class="mh"><h3>Discharge summary · Admission ${a.n}</h3><button class="x" aria-label="Close" onclick="closeModal()">×</button></div>
 <div class="mb">${[['Stay',a.dates+' · '+a.days+' days · '+a.sec],['Discharge diagnosis',a.dx],['Condition at discharge',a.cond],['Medicines',a.meds.join('; ')],['Plan',a.plan],['Treating team',a.psy+' · '+a.psych]].map(r=>`<div class="row" style="justify-content:space-between;border-top:1px solid var(--line-2);padding-top:8px"><span class="small muted">${r[0]}</span><strong class="small" style="text-align:right;max-width:60%">${r[1]}</strong></div>`).join('')}<div class="callout grey">Read only. Kept in Care Management with the rest of that stay's file.</div></div>
 <div class="mf"><button class="btn" onclick="pastFile(${i||0})">Open stay file</button><button class="btn pri" onclick="toast('PDF downloaded')">Download PDF</button></div>`);}
function pastFile(i){const a=S.pastAdm[i||0];openModal(`<div class="mh"><h3>Stay file · Admission ${a.n} · ${a.dates}</h3><button class="x" aria-label="Close" onclick="closeModal()">×</button></div>
 <div class="mb">${[['Admission forms and consents','5 signed forms'],['Admission workup and detailed history','2 documents'],['Capacity assessments','2'],['Management plans','Psychiatry, psychology'],['Daily notes and round notes','24'],['Orders and medicine record','All doses given or refused'],['Vitals','12 days'],['Therapy and family sessions','6 notes'],['Grievances','None'],['Discharge summary and consent','Signed at discharge']].map(r=>`<div class="row" style="justify-content:space-between;border-top:1px solid var(--line-2);padding-top:8px"><span class="small">${r[0]}</span><span class="small muted">${r[1]}</span></div>`).join('')}
 <div class="callout grey">Closed at discharge and read only: nothing can be edited or deleted. Medical records holds it in the admin portal; doctors open it from here or Care Management. Retention period to be confirmed with Sanchita.</div></div>
 <div class="mf"><button class="btn pri" onclick="toast('Complete stay file downloaded as one PDF')">Download complete file</button></div>`);}
function compactHeader(){
  const ic={dx:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4z"/><path d="M14 17h6M17 14v6"/></svg>',bed:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M3 18V7M3 14h18v4M21 14v-2a3 3 0 0 0-3-3h-7v5"/><circle cx="7" cy="11" r="2"/></svg>',ph:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg>',user:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/></svg>',hist:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/></svg>'};
  const card=(i,l,v,sub,extra)=>`<div class="dpc"><div class="dpi">${i}</div><div style="min-width:0"><div class="lbl">${l}</div><div class="dpv">${v}</div>${sub?`<div class="tiny muted">${sub}</div>`:''}${extra||''}</div></div>`;
  const tm=(ini,n,r,c)=>`<span class="tpill"><span class="avatar ${c}" style="width:26px;height:26px;font-size:10px">${ini}</span><span><b>${n}</b><span class="tiny muted" style="display:block">${r}</span></span></span>`;
  const ini=n=>n.replace('Dr. ','').split(' ').map(x=>x[0]).join('').slice(0,2);
  return `<nav class="crumb"><a href="#/myday">Inpatients</a> / <a href="#/inpatients">${isLead()?'Floor inpatients':'My inpatients'}</a> / <strong>Neel Bose</strong></nav>
  <section class="card dph">
    <div class="dpav"><div class="avbig">NB</div><span class="chip c-green" style="font-size:11px">${S.admNo>2?'Admitted today':'Day '+(S.admNo>2?0:6)+' of stay'}</span></div>
    <div class="dpmain">
      <div class="row" style="gap:10px;align-items:baseline"><h2 style="font-size:26px">Neel Bose</h2><span class="muted" style="font-weight:600">TH-1042 · 23/M R 213 A</span><span class="tiny muted">UHID 2026-27RG6990</span></div>
      <div class="row" style="gap:6px;flex-wrap:nowrap;overflow-x:auto">${chip('⚠ High risk','c-red')}${chip('No known allergies','c-grey')}${chip('Admission # '+S.admNo,'c-blue')}${chip('Section '+S.section,'c-violet')}${chip('R 213 A','c-grey')}${chip(S.diet.type,'c-grey')}${S.discharged?chip('Discharged','c-green'):''}</div>
      <div class="dpcards">
        ${card(ic.dx,'Primary diagnosis',S.dx,'6A60.0 · ICD-11')}
        ${card(ic.bed,'Admitted',S.admNo>2?'24 Oct, 16:40':'18 Oct, 11:20','Referred by Dr. Aanya Sharma, OPD')}
        ${card(ic.hist,S.pastAdm.length>1?'Past admissions · latest':'Past admission',S.pastAdm.length?S.pastAdm[0].dates:'None, first admission',S.pastAdm.length?`<div>${S.pastAdm[0].psy}</div><div>${S.pastAdm[0].psych}</div>`:'',S.pastAdm.length?`<button class="lnk" onclick="go('#/patient/neel/past')">View records</button>`:'')}
        ${card(ic.user,'Emergency contact','Ananya Bose (Sister)','+91 98XXX XXX21')}
      </div>
      <div class="row dpteam"><span class="lbl">Treating team</span>${tm(ini(S.team.psy),S.team.psy.replace('Dr. ',''),'Psychiatrist','c-blue')}${tm(ini(S.team.psych),S.team.psych,'Psychologist','c-violet')}${isPsy()?`<button class="tpadd" onclick="addPsychModal()">＋ Add psychologist</button>`:''}${isPsy()||isPsych()?`<button class="tpadd" onclick="transferModal()">⇄ Transfer patient</button>`:''}</div>
      ${trHist()}
    </div>
    <div class="dpact">
      <button class="btn pri" onclick="callCaregiver()">${icon.phone} Call caregiver</button>
      <button class="btn soft" onclick="msgModal()">${icon.msg} Message caregiver</button>
      <button class="btn soft" onclick="eventModal()">＋ Log event</button>
      <div class="tiny muted" style="text-align:center">Expected discharge ${new Date(S.edd).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</div>
    </div>
    <div class="kv dpbelow" style="border:0">
      ${standRow()}<div style="grid-column:1/-1;border:0;padding:0"><span class="lbl">Due for this patient · ${__due().length}</span><div class="row" style="gap:6px;margin-top:6px">${__due().map(d=>`<button class="tog" style="height:28px;font-size:12px;${d[2]?'border-color:var(--amber-line);background:#fffaf2;color:var(--amber)':''}" onclick="${d[4]||`go('#/patient/neel/${d[3]}')`}">${d[0]} · ${d[1]}</button>`).join('')||'<span class="small muted">Nothing due</span>'}</div></div>
      ${isPsy()?`<div style="grid-column:1/-1;border:0;padding:12px 0 0"><div class="medbox"><div class="row" style="justify-content:space-between"><span class="lbl" style="color:var(--blue-ink)">Current medicines · ${S.meds.length}</span><div class="row" style="gap:8px"><button class="btn sm" onclick="medChartModal()">View full medication chart</button><button class="btn sm" onclick="go('#/patient/neel/orders')">Change medicines</button></div></div><div class="medlist">${S.meds.map(m=>{const nm=m.name.split(' · ')[0],mt=nm.match(/^(.*?)\s+([\d.]+\s*mg)$/),f=m.freq.split('-'),sos=m.freq==='SOS';
  return `<div class="medrow"><div class="pill" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="8" width="18" height="8" rx="4" transform="rotate(-35 12 12)"/><path d="M9.5 7.5l5 9" transform="rotate(-35 12 12)"/></svg></div>
    <div class="mname"><div style="font-weight:700;font-size:15px">${mt?mt[1]:nm} <span class="mdose">${mt?mt[2]:''}</span></div><div class="tiny muted">${m.range}</div>${byl(m.by,m.at,'Prescribed by')}</div>
    <div class="slots">${sos?'<span class="chip c-amber">SOS · as needed</span>':['Morning','Afternoon','Night'].map((t,i)=>`<span class="slot ${f[i]!=='0'?'on':''}" title="${t}${f[i]!=='0'?'':' · none'}"><b>${t[0]}</b></span>`).join('')}</div>
    <span class="chip ${m.time.includes('Before')?'c-violet':'c-grey'}">${m.time}</span>${(()=>{const a=sos?null:[100,86,100][S.meds.indexOf(m)]||95;return a===null?'<span class="tiny muted">As needed</span>':`<div class="adh"><div class="row" style="justify-content:space-between"><span class="tiny muted">Ward adherence</span><b class="tiny" style="color:${a<90?'var(--amber)':'var(--green)'}">${a}%</b></div><div class="adhb"><i style="width:${a}%;background:${a<90?'#e0a43a':'#22a05a'}"></i></div></div>`})()}</div>`}).join('')}</div></div></div>`:''}
    </div>
  </section>`;
}
function spark(vals,max,label,unit,color){
  const w=280,h=64,px=10,py=10,n=vals.length;
  const X=i=>px+i*(w-2*px)/(n-1), Y=v=>h-py-(v/max)*(h-2*py);
  const pts=vals.map((v,i)=>`${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(' ');
  return `<div class="mini"><div class="row" style="justify-content:space-between"><span class="lbl">${label}</span><strong class="small">${vals[n-1]}${unit} today</strong></div>
    <svg viewBox="0 0 ${w} ${h+14}" width="100%" role="img" aria-label="${label}: ${vals.join(', ')}">
      <polyline points="${pts}" fill="none" stroke="${color}" stroke-width="2"/>
      ${vals.map((v,i)=>`<circle cx="${X(i)}" cy="${Y(v)}" r="3" fill="${i===n-1?color:'#fff'}" stroke="${color}" stroke-width="1.5"/>`).join('')}
      ${vals.map((v,i)=>`<text x="${X(i)}" y="${h+12}" text-anchor="middle" font-size="10" fill="#5b6475">D${i+1}</text>`).join('')}
    </svg></div>`;
}
const EVGROUPS=[['Medical or safety',['Fall','Seizure','Self-harm attempt','Aggression or violence','Absconding attempt','Choking','Adverse drug reaction','Fever or infection','Medical emergency or transfer out']],
  ['Admission and paperwork',['Admission out of hours, workup pending','History or paperwork incomplete','Consent or form pending from family','Handover to the next team']],
  ['Ward and family',['Behaviour on the ward','Family or visitor issue','Belongings or property','Refused food or medicines','Other']]];
const EVTYPES=EVGROUPS.flatMap(g=>g[1]);
const EVMED=EVGROUPS[0][1];
const evChip=e=>!EVMED.includes(e.type)?chip(e.type,'c-blue'):chip(e.type+(e.sev?' · '+e.sev:''),['Seizure','Self-harm attempt','Medical emergency or transfer out','Choking'].includes(e.type)||e.sev==='Major'?'c-red':'c-amber');
function eventsBar(){
  const open=S.events.filter(e=>!e.ack); if(!open.length) return '';
  const e=open[0];
  return `<div class="callout row" style="background:#fff6ec;border:1px solid #f3c58c;justify-content:space-between;gap:12px"><div class="row" style="gap:10px;flex-wrap:nowrap">${evChip(e)}<span class="small"><strong>${e.when}</strong> · reported by ${e.by}. ${open.length>1?(open.length-1)+' more not yet reviewed.':''}</span></div>
    <div class="row" style="gap:8px"><button class="btn sm" onclick="go('#/patient/neel/overview');setTimeout(()=>{const x=document.getElementById('evcard');x&&x.scrollIntoView({behavior:'smooth'})},50)">View</button>${isPsy()?`<button class="btn sm pri" onclick="S.events.find(x=>x.id===${e.id}).ack=true;render();toast('Marked reviewed by ${signer()}')">Mark reviewed</button>`:''}</div></div>`;
}
function eventsCard(){
  return `<section class="card" id="evcard"><div class="hd"><div><h3>Events log</h3><div class="small muted" style="margin-top:4px">Medical and safety events, plus anything the RMO or team needs to record: out-of-hours admissions, pending paperwork, handovers, ward and family issues.</div></div><button class="btn sm" onclick="eventModal()">Log event</button></div>
    ${S.events.length?S.events.map(e=>`<div class="li" style="align-items:flex-start;${e.ack?'':'background:#fff9f2'}"><div class="grow"><div class="row" style="gap:8px">${evChip(e)}<span class="small" style="font-weight:600">${e.when}</span>${e.ack?chip('Reviewed','c-green'):chip('Not reviewed','c-amber')}</div>
      <div class="small" style="margin-top:6px">${e.detail}</div><div class="tiny muted" style="margin-top:4px">Reported by ${e.by} · seen by ${e.duty}</div></div>
      ${!e.ack&&isPsy()?`<button class="btn sm" onclick="S.events.find(x=>x.id===${e.id}).ack=true;render();toast('Marked reviewed')">Mark reviewed</button>`:''}</div>`).join(''):'<div class="pad small muted">No events this stay.</div>'}
  </section>`;
}
function eventModal(pick){openModal(`<div class="mh"><h3>${pick?'Report a significant event':'Log an event · Neel Bose'}</h3><button class="x" aria-label="Close" onclick="closeModal()">×</button></div>
 <div class="mb">${pick?`<label class="field"><span class="lbl">Patient</span><select class="input">${PTS.map(p=>`<option>${p.name} · ${p.room}</option>`).join('')}</select></label>`:''}<div class="tiny muted" style="margin-bottom:10px">Anyone on the team can log: RMO, nurses, psychiatrist, psychologist, floor manager. Pick a category and write what happened in your own words.</div>
 <div class="grid2"><label class="field"><span class="lbl">Category</span><select class="input" id="evt" onchange="$('evsW').style.display=EVMED.includes(this.value)?'':'none'">${EVGROUPS.map(g=>`<optgroup label="${g[0]}">${g[1].map(t=>`<option>${t}</option>`).join('')}</optgroup>`).join('')}</select></label>
 <label class="field"><span class="lbl">Logged by</span><select class="input" id="evb"><option>RMO on duty</option><option>Nurse on duty</option><option>Floor manager</option><option>${signer()}</option></select></label>
 <label class="field" id="evsW"><span class="lbl">Severity</span><select class="input" id="evs"><option>Minor</option><option>Moderate</option><option>Major</option></select></label>
 <label class="field"><span class="lbl">When</span><input class="input" value="Today, now"></label></div>
 <label class="field"><span class="lbl">What happened</span><textarea class="input" id="evd" rows="5" placeholder="e.g. Admitted at 11:40 pm by the RMO. Family left before the detailed history and admission forms could be completed; history and Form E to be done by the treating team tomorrow morning."></textarea></label>
 <div id="evErr" class="small" style="color:var(--red);display:none">Write what happened</div>
 <div class="tiny muted">Medical and safety events alert the treating psychiatrist, psychologist and floor lead at once; major ones also go to the medical superintendent. Paperwork items also create a to-do for the treating team.</div></div>
 <div class="mf"><button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="if(!$('evd').value.trim()){$('evErr').style.display='block';return;}const t=$('evt').value,m=EVMED.includes(t);S.events.unshift({id:Date.now(),when:'Today, now',type:t,sev:m?$('evs').value:'',by:$('evb').value,duty:m?'Duty doctor':'Treating team',detail:$('evd').value,ack:false});closeModal();render();toast(m?'Event logged; treating team alerted':'Logged; treating team notified and a to-do created')">Log event</button></div>`);}
function rightPanel(){
  if(!S.rp) return `<button class="btn sm" style="width:32px;padding:0" aria-label="Open stay record" title="Open stay record" onclick="S.rp=true;render()">‹</button>`;
  const t=S.rpt||'timeline';
  const tb=(k,l)=>`<button class="${t===k?'on':''}" onclick="S.rpt='${k}';render()">${l}</button>`;
  const copy=(what)=>`<button class="btn sm" onclick="toast('${what} copied into today\\'s note')">Copy to note</button>`;
  let b='';
  if(t==='timeline') b=V3.rpTimeline(); if(false) b=[
      ['Today','Daily note '+(S.dailySaved?'saved':'pending'),S.dailySaved?'c-green':'c-grey'],
      ...S.events.map(e=>[e.when.split(',')[0],'<strong style="color:var(--amber)">'+e.type+'</strong> · '+(e.ack?'reviewed':'not reviewed'),'c-amber']),
      ['23 Oct','Round: olanzapine reviewed','c-grey'],['22 Oct','Capacity week 1 · needs support','c-grey'],
      ['22 Oct','Individual session · psychoeducation','c-grey'],['21 Oct','Detailed history due','c-amber'],
      ['19 Oct','24-hour family call · 6 min','c-grey'],['18 Oct','Admitted · Section 89','c-blue']
    ].map(e=>`<div class="row" style="flex-wrap:nowrap;align-items:flex-start;gap:10px"><span class="tiny muted" style="width:46px;flex:0 0 46px;padding-top:2px">${e[0]}</span><span class="small" style="flex:1">${e[1]}</span></div>`).join('');
  if(t==='trends') b = spark([3,4,3.5,5,4,6.5],9,'Sleep','h','#1e6cdb')+spark([2,2,3,3,2,4],5,'Mood (1 low to 5 settled)','','#5b3fb5')+spark([0,1,1,2,1,2],3,'Sessions attended','','#11703a')+
      `<div class="callout grey">From daily notes. Nurses' vitals and observations join here once nursing is live.</div>`;
  if(t==='meds') b = S.meds.map(m=>`<div class="mini"><div style="font-weight:600;font-size:13px">${m.name}</div><div class="tiny muted">${m.freq} · ${m.time} · ${m.range}</div></div>`).join('')+copy('Current medicines');
  if(t==='records') b = `
      <div class="lbl">Lab results</div>
      <div class="mini row" style="justify-content:space-between"><span class="small"><strong>Serum lithium</strong><br><span class="tiny muted">22 Oct</span></span><span class="small">[RESULT] mmol/L</span></div>
      <div class="mini row" style="justify-content:space-between"><span class="small"><strong>CBC, LFT, KFT, TFT</strong><br><span class="tiny muted">18 Oct · admission panel</span></span>${chip('Uploaded','c-grey')}</div>
      <div class="lbl" style="margin-top:4px">Earlier visits</div>
      <div class="mini"><div class="small"><strong>OPD · 12 Jun 2026</strong> · Dr. Aanya Sharma</div><div class="tiny muted">Follow-up · lithium continued</div><div style="margin-top:8px">${copy('June visit findings')}</div></div>
      <div class="mini"><div class="small"><strong>OPD · 4 Mar 2026</strong> · Dr. Aanya Sharma</div><div class="tiny muted">First consult · bipolar disorder diagnosed</div></div>
      <div class="callout grey">Lab upload and view are live today; results file here automatically.</div>`;
  return `<div class="rtabs" role="tablist">${tb('timeline','Timeline')}${tb('trends','Trends')}${tb('meds','Medicines')}${tb('records','Records')}<button aria-label="Hide stay record" title="Hide" onclick="S.rp=false;render()" style="flex:0 0 28px">›</button></div><div class="rbody">${b}</div>`;
}
function vPatient(sub){
  if(S.discharged) return vCare();
  $('title').textContent='Patients';
  sub = sub||(S.role==='nurse'?'vitals':'overview');
  if(!stayTabs().some(t=>t[0]===sub)) sub = S.role==='nurse'?'vitals':'overview';
  const exTabs = ['Overview','Assessments','Clinical Notes','Prescriptions','Lab Reports','Mood & Journal','Med Adherence','Care Management'];
  const lateDot = (k)=> (k==='admission'&&S.historyStatus!=='signed')||(k==='daily'&&!S.dailySaved)||(k==='plans'&&!(S.plansSigned.psy&&S.plansSigned.psych)) ? '<span class="dot" aria-label="Needs attention"></span>':'';
  const body = {overview:pOverview,admission:pAdmission,plans:pPlans,daily:pDaily,update:pUpdate,past:pPast,vitals:pVitals,griev:pGriev,prefs:pPrefs,forms:pForms,orders:pOrders,therapy:pTherapy,discharge:pDischarge}[sub]();
  return `<div>
    <section class="ws-mid">
      ${compactHeader()}
      <div class="subtabs" role="tablist">${stayTabs().map(([k,l])=>`<button class="subtab ${sub===k?'on':''}" role="tab" aria-selected="${sub===k}" onclick="go('#/patient/neel/${k}')">${l} ${sub===k?'':lateDot(k)}</button>`).join('')}</div>
      ${sub==='overview'?'':eventsBar()}
      ${body}
    </section>
  </div>`;
}
function pOverview(){
  const item=(when,cls,title,meta,act)=>`<div class="tl"><div class="when">${when}</div><div class="rail"><div class="pip ${cls}"></div><div class="bar"></div></div><div class="what"><div style="font-weight:600">${title}</div><div class="small muted">${meta}</div>${act||''}</div></div>`;
  const box=(lbl,val,sub,act,tone)=>`<div class="sbox ${tone||''}"><div class="lbl">${lbl}</div><div class="sval">${val}</div>${sub?`<div class="tiny muted">${sub}</div>`:''}${act?`<div style="margin-top:auto;padding-top:6px">${act}</div>`:''}</div>`;
  const lnk=(t,h)=>`<button class="btn sm" onclick="${h}">${t}</button>`;
  const openEv=S.events.filter(e=>!e.ack), ev=S.events[0];
  const hist=S.historyStatus==='signed', plans=S.plansSigned.psy&&S.plansSigned.psych;
  return `
  <section class="card pad"><h3 style="margin-bottom:14px">Stay timeline</h3><div class="timeline">
      ${item('18 Oct','done','Admitted, Section 89 supported admission','Admitted by Dr. Aanya Sharma, 10:50 am · front desk (Meena Arora): admission form, undertaking and Form E signed by Ananya Bose (sister). Form C not taken.')}
      ${item('18 Oct','done','Admission workup','Done by Dr. Aanya Sharma · 18 Oct 2026, 12:30 pm · vitals and physical exam by Dr. Sameer Khan (RMO), 11:20 am')}
      ${item('18 Oct','done','Capacity assessment at admission','Assessed by Dr. Aanya Sharma · 18 Oct 2026, 1:10 pm · needs 100% support from nominated representative')}
      ${item('19 Oct','done','24-hour family call','Called by Dr. Aanya Sharma · 19 Oct 2026, 11:00 am · 6 min · logged automatically')}
      ${item('21 Oct', S.historyStatus==='signed'?'done':'late','Detailed history', S.historyStatus==='signed'?'Signed by '+S.team.psy+' and '+S.team.psych+(S.historySignedAt?' · '+S.historySignedAt:''):'Assigned to '+S.team.psy+' and '+S.team.psych+' · due 21 Oct 10:30 · overdue', S.historyStatus==='signed'?'':`<button class="btn sm" style="margin-top:6px" onclick="go('#/patient/neel/admission')">Open</button>`)}
      ${item('22 Oct','done','Capacity assessment, week 1 review','Reviewed by Dr. Aanya Sharma · 22 Oct 2026, 10:30 am · still needs 100% support')}
      ${item('24 Oct','', 'Diagnosis and management plans','Assigned to '+S.team.psy+' (psychiatry) and '+S.team.psych+' (psychology) · due day 7')}
      ${item('25 Oct','', 'Capacity assessment, week 2','Assigned to '+S.team.psy+' · weekly until day 30, then fortnightly under Section 90')}
      ${item('Planned','', 'Discharge','Expected date set by '+S.eddBy.by+' · '+S.eddBy.at+(S.eddShared?' · shared with the family':''))}
    </div></section>
  <div class="sumgrid">
    ${box('Events log', ev?`${ev.type} · ${ev.sev}`:'None this stay', ev?`${ev.when} · ${openEv.length?openEv.length+' not reviewed':'all reviewed'} · ${S.events.length} this stay`:'', lnk(S.evOpen?'Hide events':'View events',"S.evOpen=!S.evOpen;render()"), openEv.length?'warn':'')}
    ${box('Nursing · last shift','Calm, slept 6.5 h','BP 124/80 · pulse 88 · sugar 146 · all doses given · by Sister Rekha, night shift · 24 Oct 2026, 7:00 am',lnk('Vitals and monitoring',"go('#/patient/neel/vitals')"))}
    ${box('Last round','23 Oct · Dr. Aanya Sharma','Olanzapine reviewed; lithium level ordered · round at 10:30 am',lnk('Round notes',"go('#/patient/neel/daily')"))}
    ${box('Daily note', S.dailySaved?'Saved today':'Pending today',S.dailySaved?'Saved by '+signer()+(S.dailyAt?' · '+S.dailyAt:''):'Assigned to '+S.team.psych+' · yesterday by Priya Nair, 23 Oct 2026, 6:10 pm: under 4 h sleep, irritable; yoga only',lnk('Daily notes',"go('#/patient/neel/daily')"), S.dailySaved?'':'warn')}
    ${box('Medicines', S.meds.length+' active','Adherence 94% this week · 1 refusal · prescribed by '+[...new Set(S.meds.map(m=>m.by).filter(Boolean))].join(', '),lnk('Medicines',"go('#/patient/neel/orders')"))}
    ${box('Family','24-hour call done · 19 Oct','By Dr. Aanya Sharma · Ananya Bose, sister · updates in Hindi',lnk('Therapy and family',"go('#/patient/neel/therapy')"))}
    ${box('Mental Healthcare Act','Section '+S.section+' · day 6 of 30','Nominated representative: Ananya Bose · rights explained by Dr. Aanya Sharma, 18 Oct 2026, 11:00 am')}
    <div class="sbox"><div class="lbl">Observation level</div>
      <select class="input" style="min-height:34px" ${isPsy()?'':'disabled'} onchange="S.obs=this.value;S.obsBy=whoAt();render();toast('Observation changed to '+this.value+' by '+S.obsBy.by+'. Ward notified.')">${['1:1 constant','Every 15 minutes','Every 30 minutes','Routine'].map(o=>`<option ${S.obs===o?'selected':''}>${o}</option>`).join('')}</select>
      ${byl(S.obsBy.by,S.obsBy.at,'Set by')}</div>
    <div class="sbox"><div class="lbl">Expected discharge</div>
      <input class="input" style="min-height:34px" type="date" value="${S.edd}" ${isPsy()?'':'disabled'} onchange="S.edd=this.value;S.eddBy=whoAt();render();toast('Expected discharge date updated by '+S.eddBy.by)" aria-label="Expected discharge date">
      <label class="row tiny" style="gap:6px"><input type="checkbox" ${S.eddShared?'checked':''} ${isPsy()?'':'disabled'} onchange="S.eddShared=this.checked;S.eddShareBy=whoAt();render();toast(this.checked?'Shared with Ananya Bose in the caretaker app':'No longer shown to the family')"> Show to the family</label>
      ${byl(S.eddBy.by,S.eddBy.at,'Set by')}${S.eddShareBy?byl(S.eddShareBy.by,S.eddShareBy.at,S.eddShared?'Shared by':'Hidden by'):''}</div>
    ${box('Restraint', S.restraints.length?S.restraints.length+' this stay':'None this stay', S.restraints.length?S.restraints[0].when+' · '+S.restraints[0].reason+' · authorised by '+S.restraints[0].by:'Psychiatrist authorises; nominated representative told within 24 hours', isPsy()?lnk('Authorise restraint','restraintModal()'):'')}
    ${box('Previous admissions', S.pastAdm.length+' earlier stay'+(S.pastAdm.length===1?'':'s'), S.pastAdm.map(x=>'Admission '+x.n+' · '+x.dates).join(' · '), lnk('Open',"go('#/patient/neel/past')"))}
  </div>
  ${S.evOpen?eventsCard():''}`;
}
const WK_DUR=['3 days','7 days','14 days','30 days','Until review'];
const WK_SLOTS={'1-0-1':['8 am','9 pm'],'0-0-1':['9 pm'],'1-0-0':['8 am'],'1-1-1':['8 am','2 pm','9 pm'],'SOS':['2 pm']};
function wkTreatment(){
  const can=!isPsych()&&S.role!=='nurse',sent=S.wkSent||[],rx=S.wkRx||[],last=sent[sent.length-1],seenL=last&&(S.seen||{})[last.id];
  const head=`<div class="row" style="justify-content:space-between;align-items:center;gap:8px"><span class="lbl">Treatment chart</span>${last?(seenL?chip('Seen by nursing · '+seenL.at,'c-green'):chip('Sent to nursing · '+last.at,'c-blue')):(can?chip('Added straight to the nursing chart','c-grey'):'')}</div>`;
  const srow=r=>{const sn=(S.seen||{})[r.id];return `<tr><td style="font-weight:600">${hesc(r.name)}</td><td>${hesc(r.freq)}</td><td>${hesc(r.when)}</td><td>${hesc(r.days)}</td><td>${sn?chip('Seen by nursing','c-green'):chip('Sent '+r.at,'c-blue')}<div class="tiny muted" style="margin-top:2px">${hesc(r.first)}</div></td><td></td></tr>`;};
  const prow=(r,i)=>`<tr><td style="font-weight:600">${hesc(r.name)}</td><td>${hesc(r.freq)}</td><td>${hesc(r.when)}</td><td>${hesc(r.days)}</td><td>${chip('Not sent yet','c-amber')}</td><td style="text-align:right"><button class="x" aria-label="Remove ${hesc(r.name)}" onclick="S.wkRx.splice(${i},1);render()">×</button></td></tr>`;
  const body=sent.map(srow).join('')+rx.map(prow).join('')||`<tr><td colspan="6" class="small muted">${can?'No medicines in the chart yet. Add the first one below.':'Not entered yet'}</td></tr>`;
  const sel=(id,label,opts,pick,st)=>`<select class="input" id="${id}" aria-label="${label}" style="${st||'width:auto'};min-height:34px">${opts}</select>`;
  const add=can?`<div class="lbl" style="margin-top:14px">Add medicine</div><div class="row" style="gap:8px;flex-wrap:wrap;margin-top:6px">${sel('wkN','Medicine name',`<option value="">Choose medicine</option>${DRUGS.map(d=>`<option>${d}</option>`).join('')}`,0,'flex:1 1 180px;min-width:0;width:auto')}${sel('wkF','Frequency',FREQ.map((f,i)=>`<option ${i===1?'selected':''}>${f}</option>`).join(''))}${sel('wkW','When',MED_WHEN.map(o=>`<option>${o}</option>`).join(''))}${sel('wkD','Duration',WK_DUR.map((o,i)=>`<option ${i===1?'selected':''}>${o}</option>`).join(''))}<button class="btn sm" onclick="wkAdd()">Add</button></div><div id="wkEr" class="small" style="color:var(--red);display:none;margin-top:6px"></div><div class="row" style="justify-content:space-between;align-items:center;gap:8px;margin-top:12px"><span class="tiny muted">A medicine you add goes straight into the nursing Medicine chart at its dose times.</span></div>`:'';
  return `<div class="box small" style="grid-column:1/-1">${head}<div class="scroll" style="margin-top:8px"><table class="t"><thead><tr><th>Medicine</th><th>Frequency</th><th>When</th><th>Duration</th><th>Status</th><th></th></tr></thead><tbody>${body}</tbody></table></div>${add}</div>`;
}
function wkErr(t){const e=$('wkEr');e.textContent=t;e.style.display='block';}
function wkAdd(){
  const n=$('wkN').value;if(!n){wkErr('Choose a medicine first');return;}
  S.wkRx=S.wkRx||[];if(S.wkRx.concat(S.wkSent||[]).some(r=>r.name===n)||S.meds.some(m=>m.name===n)){wkErr(n+' is already in the chart');return;}
  const r={name:n,freq:$('wkF').value,when:$('wkW').value,days:$('wkD').value};
  S.wkRx.push(r);
  /* team review (Trello "Admission note"): no Send to nursing button. The medicine goes into the nursing Medicine chart (S.meds) at once, and to the nurses' dose times */
  const w=whoAt(),day=new Date().toLocaleDateString('en-IN',{day:'numeric',month:'short'});
  S.meds.push({name:r.name,freq:r.freq,time:r.when,range:day+' · '+r.days.toLowerCase(),by:w.by,at:w.at});
  wkSend();
}
function wkSend(){
  const rx=S.wkRx||[];if(!rx.length){wkErr('Add at least one medicine first');return;}
  S.wkSent=S.wkSent||[];S.minfo=S.minfo||{};NMEDS.neel=NMEDS.neel||{};
  S.nInstr=S.nInstr||[];S.nN=(S.nN||0)+1;const id='n'+S.nN,at=clock();
  rx.forEach(r=>{
    const sl=WK_SLOTS[r.freq]||['9 pm'],nm=r.freq==='SOS'?r.name+' · SOS':r.name,today=sl.filter(x=>NSLOTS.indexOf(x)>=NOWI);
    today.forEach(x=>{const L=NMEDS.neel[x]=NMEDS.neel[x]||[];if(!L.includes(nm))L.push(nm);});
    S.minfo['neel|'+nm]={freq:r.freq,when:r.when,days:r.days};
    S.wkSent.push({name:r.name,freq:r.freq,when:r.when,days:r.days,at,id,first:today.length?(today[0]===NSLOTS[NOWI]?'Due now, '+today[0]:'First dose '+today[0]+' today'):'First dose tomorrow, '+sl[0]});
  });
  S.nInstr.unshift(['Neel Bose',signer()+' · just now','Treatment chart: '+rx.map(r=>r.name+', '+r.freq+', '+r.when.toLowerCase()+', '+r.days).join('; '),'Treatment','c-blue','',id]);
  S.wkRx=[];render();toast(rx.length+' medicine'+(rx.length===1?'':'s')+' sent to nursing');
}
function pAdmission(){
  const sec=S.admSec||'hist';
  const sect = (t,txt)=>`<div class="field"><span class="lbl">${t}</span><textarea class="input">${S.historyDraft?txt:''}</textarea></div>`;
  const hs=S.historyStatus==='signed';
  const steps=[
    ['forms','Front desk forms','Signed 18 Oct','Admission form, undertaking, Form E','c-green'],
    ['workup','Admission workup','Signed 18 Oct','Dr. Aanya Sharma, on the day','c-green'],
    ['capadm','Detailed capacity at admission','Done 18 Oct','Needs 100% support from nominated representative','c-green'],
    ['hist','Detailed history', hs?'Signed':(S.historyDraft?'Draft ready':'1 day late'),'Within 72 hours · psychiatrist and psychologist', hs?'c-green':'c-amber'],
    ['formc','Form C · independent admission','Clinical review pending','Psychiatrist or psychologist decides whether Form C is indicated','c-amber']
  ];
  const grid=`<div class="sumgrid">${steps.map(x=>`<div class="sbox pick ${sec===x[0]?'sel':''} ${x[4]==='c-amber'?'warn':''}" role="button" tabindex="0" onclick="S.admSec='${x[0]}';render()" onkeydown="if(event.key==='Enter'){S.admSec='${x[0]}';render()}"><div class="lbl">${x[1]}</div><div>${chip(x[2],x[4])}</div><div class="tiny muted">${x[3]}</div></div>`).join('')}</div>`;
  const hist = hs?chip('Signed','c-green'):(S.historyDraft?chip('Draft ready','c-blue'):chip('1 day late','c-amber'));
  const panels={
    forms:`<section class="card"><div class="hd"><h3>Front desk forms</h3>${chip('Taken by front desk','c-grey')}</div>${[['Admission consent form','Signed 18 Oct by Ananya Bose, sister'],['Letter of undertaking (advance and charges)','Signed 18 Oct'],['Form E · request for admission with high support needs (rule 8)','Signed by Ananya Bose, sister'],['High risk informed consent','Signed 18 Oct']].map(f=>`<div class="li"><span class="grow" style="font-weight:600">${f[0]}</span><span class="small muted">${f[1]}</span>${chip('Signed','c-green')}</div>`).join('')}<div class="pad small muted">Taken in the admin portal on the tablet. Other consents are on Orders and consents.</div></section>`,
    workup:`<section class="card"><div class="hd"><h3>Admission workup</h3>${chip('Signed 18 Oct · Dr. Aanya Sharma','c-green')}</div><div class="pad grid2">${[['Reason for admission','Manic symptoms, overspending, irritability for 3 weeks'],['Risk at admission','Harm to others: moderate · suicide: low'],['Physical examination','Unremarkable; BP 138/88'],['Investigations sent','CBC, LFT, RFT, TSH, serum lithium']].map(f=>`<div class="box small"><div class="lbl">${f[0]}</div><div style="margin-top:4px">${f[1]}</div></div>`).join('')}${wkTreatment()}</div></section>`,
    capadm:`<section class="card"><div class="hd"><div><h3>Capacity assessment at admission</h3><div class="small muted" style="margin-top:4px">MHA 2017 capacity assessment for treatment decisions including admission</div></div>${chip('Done 18 Oct','c-green')}</div><div class="pad grid2">${[['Purpose','Admission'],['Advance directive','Absent · NR: Ananya Bose, sister'],['Obvious lack of capacity','No'],['1A Oriented · 1B Informed · 1C Follows commands · 1D Acknowledges illness','Yes · Yes · Yes · No'],['2A Agrees to treatment · 2C Explains refusal','No · No'],['3A Communicates decision','Yes'],['Conclusion','4B · Needs 100% support from nominated representative'],['Assessed by','Dr. Aanya Sharma · 18 Oct, 1:30 pm · NR signed']].map(f=>`<div class="box small"><div class="lbl">${f[0]}</div><div style="margin-top:4px;font-weight:600">${f[1]}</div></div>`).join('')}</div></section>`,
    hist:`<section class="card"><div class="hd"><div><h3>Detailed history ${hist}</h3><div class="small muted" style="margin-top:4px">Tulasi Psychiatric History and Evaluation form · due within 72 hours · psychiatrist and psychologist each fill their sections</div></div>
        <button type="button" style="position:relative;z-index:2;pointer-events:auto" class="btn ${S.historyDraft?'':'pri'}" onclick="scribeHistory()" id="scrH">${icon.mic} ${S.historyDraft?'Record again':'Draft with AI scribe'}</button></div>
        <div class="pad" style="display:flex;flex-direction:column;gap:14px">
          <div class="seg" style="align-self:flex-start;min-width:240px"><button class="${S.hview!=='read'?'on':''}" onclick="S.hview='form';render()">Fill form</button><button class="${S.hview==='read'?'on':''}" onclick="S.hview='read';render()">Read only</button></div>
          ${S.hview==='read'?`<div class="nitem open" style="border:1px solid var(--line);border-radius:14px"><div class="nhead" style="cursor:default"><div class="ndate"><b>21</b><span>Oct 2026</span></div><div class="nmeta"><div class="row" style="gap:8px">${chip('Detailed history','c-green')}<span class="small"><strong>Dr. Aanya Sharma, Priya Nair</strong> <span class="muted">· Psychiatrist, Psychologist</span></span></div><div class="small muted" style="margin-top:3px">Relapse of bipolar disorder after stopping lithium; no suicidal ideation; moderate risk to others</div></div></div><div class="nbody">${secList(HREAD)}</div></div>`:histForm()}
          <div class="callout amber"><strong>Risk screen</strong> (same as consultations): no suicidal ideation today; risk of harm card updates from here.</div>
          <div class="row" style="justify-content:flex-end"><button class="btn" onclick="toast('Saved as draft')">Save draft</button><button class="btn pri" ${S.historyStatus==='signed'?'disabled':''} onclick="S.historyStatus='signed';S.historySignedAt=atNow();S.historySignedBy=signer();S.done.hist=true;render();toast('Detailed history signed. Task closed in Inpatient dashboard.')">Review and sign</button></div>
        </div></section>`,
    ...(isPsy()&&S.capAdmOpen?{capadm:`<section class="card pad" style="display:flex;flex-direction:column;gap:10px">${capForm(true)}</section>`}:{}),
    formc:`<section class="card pad" style="display:flex;flex-direction:column;gap:10px"><h3>Form C · Independent admission</h3><div class="small muted">Optional at admission, based on the psychiatrist or psychologist's clinical judgement. Required again before discharge.</div>
        ${['psychiatrist','psychologist'].includes(S.role)?`<button class="btn pri" style="align-self:flex-start" onclick="cdSelect('${S.pid}|form-c|admission')">Review Form C</button>`:'<span class="small muted">Clinical review assigned to the psychiatrist or psychologist</span>'}</section>`
  };
  return grid+panels[sec];
}
function weeklyReviews(){
  return `<div class="lbl" style="margin-top:6px">Weekly reviews</div><section class="card"><div class="hd"><div><h3>Capacity assessment, ongoing</h3><div class="small muted" style="margin-top:4px">At admission, then weekly for 30 days under Section 89, fortnightly once moved to Section 90</div></div>
        <label class="row small" style="gap:8px">Admitted under <select class="input" style="width:auto" onchange="S.section=this.value;render();toast(this.value==='90'?'Capacity now scheduled fortnightly':'Capacity back to weekly')"><option value="89" ${S.section==='89'?'selected':''}>Section 89</option><option value="90" ${S.section==='90'?'selected':''}>Section 90</option></select></label></div>
        <div class="pad" style="display:flex;flex-direction:column;gap:12px">
          <div class="row">${chip('At admission · 18 Oct · Needs 100% support','c-grey')}${chip('Week 1 · 22 Oct · Needs 100% support','c-grey')}${chip(S.capacityDone?'Week 2 · done today':'Week 2 · due 25 Oct',S.capacityDone?'c-green':'c-blue')}${chip(S.section==='90'?'Next: in 2 weeks':'Next: weekly','c-grey')}</div>
          ${S.capacityOpen?capForm():`<div class="row"><button class="btn ${isPsy()?'pri':''}" ${isPsy()?'':'disabled title="Done by the psychiatrist"'} onclick="S.capacityOpen=true;render()">Start week 2 assessment</button>${isPsy()?'':'<span class="small muted">Done by the psychiatrist</span>'}</div>`}
        </div></section><section class="card pad" style="display:flex;flex-direction:column;gap:10px"><h3>Weekly re-assessment ${chip(S.reassessDone?'Week 1 signed today':'Week 1 · due 25 Oct',S.reassessDone?'c-green':'c-grey')}</h3><div class="small muted">Psychiatrist, every week of the stay. Fields follow the paper re-assessment form once a readable copy is shared.</div>
        ${isPsy()&&!S.reassessDone?`<button class="btn pri" style="align-self:flex-start" onclick="reassessModal()">Start re-assessment</button>`:''}</section>`;
}
function scribeHistory(){const b=$('scrH');b.innerHTML='<span class="rec"><i></i>Listening to the interview…</span>';b.disabled=true;setTimeout(()=>{S.historyDraft=true;render();toast('Draft ready from the interview. Review every field before signing.');},2000);}
function pPlans(){
  const psyPlan=`
    <section class="card"><div class="hd"><div><h3>Diagnosis and psychiatry management plan ${isPsy()?'':chip('View only','c-grey')}</h3><div class="small muted" style="margin-top:4px">Psychiatrist · due within 1 week of admission</div></div>${S.plansSigned.psy?chip('Signed','c-green'):chip('Due tomorrow','c-grey')}</div>
      <div class="pad" style="display:flex;flex-direction:column;gap:14px">
        <div class="field"><span class="lbl">Diagnosis · ICD-11 (same picker as consultations)</span>${isPsy()?`<input class="input" id="icdq" placeholder="Search diagnosis or code" oninput="icdFilter(this.value)" value=""><div id="icdl" class="box" style="display:flex;flex-direction:column;gap:2px;max-height:170px;overflow:auto">${icdList('')}</div>`:''}<div class="small">Selected: <strong id="icds">${S.dx}</strong></div></div>
        ${['Chief complaints','1 · Assessment: capacity assessment','1 · Assessment: physical examination, routine and special investigations (positive findings)','1 · Assessment: psychological examination','2 · Clarification (further exploration, serial MSE)','3 · Consultation-liaison','4 · Start appropriate psychotropics','5 · Monitoring: psychopathology, response and side effects','6 · Somatic treatment'].map((h,i)=>`<label class="field"><span class="lbl">${h}</span><textarea class="input" style="min-height:56px" ${isPsy()?'':'readonly'}>${i===6?'Continue lithium; review olanzapine dose after rounds.':''}</textarea></label>`).join('')}
        <div class="row" style="justify-content:flex-end"><button class="btn pri" ${isPsy()&&!S.plansSigned.psy?'':'disabled'} style="${isPsy()?'':'display:none'}" onclick="S.plansSigned.psy=true;S.done.plan=true;render();toast('Psychiatry plan signed')">Sign plan</button></div>
      </div></section>`;
  const psychPlan=`
    <section class="card"><div class="hd"><div><h3>Psychology management plan ${isPsych()?'':chip('View only','c-grey')}</h3><div class="small muted" style="margin-top:4px">Psychologist · due within 1 week · sessions done count up from therapy notes</div></div>${S.plansSigned.psych?chip('Signed','c-green'):chip('Due tomorrow','c-grey')}</div>
      <div class="scroll"><table class="t"><thead><tr><th>Problem area</th><th>Intervention required</th><th>Sessions proposed</th><th>Sessions conducted</th><th>Day and time</th><th>Outcome of intervention</th></tr></thead><tbody>
      ${S.psychRows.map(r=>`<tr><td>${r.area}</td><td>${r.iv}</td><td>${r.req}</td><td>${r.done} ${chip('auto','c-grey')}</td><td>${r.when}</td><td>${r.out}</td></tr>`).join('')}
      </tbody></table></div>
      <div class="pad" style="display:flex;flex-direction:column;gap:12px">
        ${isPsych()?`<button class="btn sm" style="align-self:flex-start" onclick="S.psychRows.push({area:'Family conflict around spending',iv:'Family session',req:'2',done:'0',when:'Sat 11 am',out:'—'});render()">Add row</button>`:''}
        <label class="field"><span class="lbl">Psychodiagnostic scores and interpretation (if any)</span><input class="input" value="YMRS 28 on 19 Oct" ${isPsych()?'':'readonly'}></label>
        <label class="field"><span class="lbl">Long-term goals and future guidance</span><textarea class="input" style="min-height:56px" ${isPsych()?'':'readonly'}>Insight into early warning signs; medicine adherence plan with family.</textarea></label>
        <div class="row" style="justify-content:flex-end"><button class="btn pri" ${isPsych()&&!S.plansSigned.psych?'':'disabled'} onclick="S.plansSigned.psych=true;S.done.pplan=true;render();toast('Psychology plan signed')">Sign plan</button></div>
      </div></section>`;
  return `<div class="callout grey">Two separate plans. Each clinician edits their own; the other plan is view only.</div>${isPsych()?psychPlan+psyPlan:psyPlan+psychPlan}${weeklyReviews()}`;
}
function icdList(q){return ICD.filter(x=>(x[0]+' '+x[1]).toLowerCase().includes(q.toLowerCase())).map(x=>`<button class="tab" style="text-align:left;white-space:normal" onclick="S.dx='${x[1].replace(/'/g,"\\'")}';document.getElementById('icds').textContent='${x[1].replace(/'/g,"\\'")}';toast('Diagnosis updated across the profile')"><strong>${x[0]}</strong> · ${x[1]}</button>`).join('')||'<span class="small muted">No match</span>';}
function icdFilter(v){$('icdl').innerHTML=icdList(v);}
const DNG={sleep:'Biological functions (sleep and appetite)',mood:'Behavioural analysis',risk:'Significant observation'};
const DN = [
  ['sleep','Sleep',['Under 4 h','4 to 6 h','6 to 7 h','Over 8 h','Disturbed'],false],
  ['meals','Meals',['All meals','Partial','Skipped one or more'],false],
  ['mood','Mood',['Calmer','Irritable','Low','Elated'],false],
  ['meds','Medicines',['All doses taken','Refused a dose','Side effects'],false],
  ['sessions','Sessions',['Group therapy','Yoga','Individual session','Occupational therapy','Family visit'],true],
  ['part','Participation',['Active','Attended, quiet','Withdrew'],false],
  ['risk','Risk since yesterday',['No change','Lower','Higher, alert the team'],false],
  ['beh','Behaviour on the ward',['Calm','Restless','Agitated','Aggressive','Withdrawn'],false],
  ['care','Self-care',['Independent','Needs prompting','Needs help'],false],
  ['ins','Insight',['Poor','Partial','Good'],false],
  ['fam','Family contact',['Phone call','Visit','None today'],true],
  ['phys','Physical complaints',['None','Headache','Constipation','Tremor','Stiffness','Other'],true]
];
const TEMPLATES = {
  'Stable day': {sleep:['6 to 7 h'],meals:['All meals'],mood:['Calmer'],meds:['All doses taken'],sessions:['Group therapy'],part:['Active'],risk:['No change']},
  'Settling in': {sleep:['4 to 6 h'],meals:['Partial'],mood:['Irritable'],meds:['All doses taken'],sessions:[],part:['Attended, quiet'],risk:['No change']},
  'Good progress': {sleep:['6 to 7 h'],meals:['All meals'],mood:['Calmer'],meds:['All doses taken'],sessions:['Group therapy','Yoga'],part:['Active'],risk:['Lower']},
};
const YESTERDAY = {sleep:['Under 4 h'],meals:['Partial'],mood:['Irritable'],meds:['All doses taken'],sessions:['Yoga'],part:['Attended, quiet'],risk:['No change']};
function dnPick(k,v,multi){
  S.dn=S.dn||{}; const cur=S.dn[k]||[];
  S.dn[k]= multi ? (cur.includes(v)?cur.filter(x=>x!==v):cur.concat(v)) : [v];
  const btns=document.querySelectorAll(`[data-k="${k}"]`); btns.forEach(b=>b.classList.toggle('on',S.dn[k].includes(b.dataset.v)));
  if(k==='risk'&&v.startsWith('Higher')) toast('The treating team and the ward will be alerted when you save');
}
function dnApply(src,msg){S.dn=JSON.parse(JSON.stringify(src));render();toast(msg);}
function famUpdate(){
  const d=S.dn||{}, one=k=>(d[k]||[])[0];
  const sl={'Under 4 h':'had a short night','4 to 6 h':'slept a few hours','6 to 7 h':'slept well','Over 7 h':'had a long sleep','Disturbed':'had a disturbed night'}[one('sleep')]||'rested';
  const ml={'All meals':'ate all his meals','Partial':'ate part of his meals','Skipped one or more':'skipped a meal','Refused food':'ate very little'}[one('meals')]||'had his meals';
  const md={'Calmer':'He seemed calmer than yesterday.','Irritable':'He had a harder day and was irritable at times.','Low':'He was quieter than usual.','Elated':'He was in high spirits.'}[one('mood')]||'';
  const ss=(d.sessions||[]).map(x=>x.toLowerCase());
  const st=ss.length?` He took part in ${ss.length>1?ss.slice(0,-1).join(', ')+' and '+ss[ss.length-1]:ss[0]}.`:'';
  return `Namaste Ananya ji, today's update on Neel: he ${sl} and ${ml}. ${md}${st} Tomorrow he has an individual session with ${isPsy()?'Priya Nair':'me'}. Warm regards, ${signer()}`;
}
function saveDaily(){S.dn=S.dn||{};if(!S.dn.line)S.dn.line=(document.getElementById('dnLine')||{}).value||'';S.dailySaved=true;S.dailyAt=atNow();S.done.daily=true;render();toast('Note saved. Family update drafted.');}
function scribeDaily(){const b=$('scrD');b.innerHTML='<span class="rec"><i></i>Listening…</span>';b.disabled=true;setTimeout(()=>{S.dn=JSON.parse(JSON.stringify(TEMPLATES['Good progress']));S.dn.line='Slept through the night for the first time; joined group therapy and spoke once.';render();toast('Filled from your dictation. Check and save.');},1600);}
document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key==='s'&&location.hash.endsWith('/daily')){e.preventDefault();if(isPsych())psySave('dn','neel');else saveDaily();}});
const DRUGS = ['Quetiapine 25 mg','Quetiapine 50 mg','Quetiapine 100 mg','Olanzapine 5 mg','Olanzapine 15 mg','Risperidone 2 mg','Aripiprazole 10 mg','Clozapine 25 mg','Sodium valproate 500 mg','Lithium carbonate 300 mg','Lorazepam 2 mg','Clonazepam 0.5 mg','Sertraline 50 mg','Escitalopram 10 mg','Propranolol 20 mg','Trihexyphenidyl 2 mg'];
const FREQ = ['1-0-1','0-0-1','1-0-0','1-1-1','SOS'];
function rxSugg(v){
  const m=$('rxm'); if(!v){m.style.display='none';return;}
  const hits=DRUGS.filter(d=>d.toLowerCase().includes(v.toLowerCase())).slice(0,8);
  m.style.display='block';
  m.innerHTML=hits.map(d=>`<button onclick="rxAdd('${d}')"><span>${d}</span><span class="tiny muted">${d.startsWith('Clozapine')?'Needs consent':'Add'}</span></button>`).join('')||'<div class="small muted" style="padding:8px">No match. Free-text medicines need pharmacy review.</div>';
}
function rxAdd(name){S.rx=S.rx||[];S.rx.push({name,freq:name.includes('Lorazepam')||name.includes('Clonazepam')?'SOS':'0-0-1',food:'After food',days:'30 days'});render();setTimeout(()=>{const i=$('rxq');i&&i.focus();},0);}
function rxSet(i,k,v){S.rx[i][k]=v;render();}
function rxSave(){
  (S.rx||[]).forEach(r=>{
    const w=whoAt();
    if(r.name.startsWith('Clozapine')){S.consents.push({name:'Clozapine consent',who:'Family',st:'Requested from front desk by '+w.by+' · '+w.at,c:'c-amber'});S.meds.push({name:r.name+' · waiting for consent',freq:r.freq,time:r.food,range:'Starts once signed',...w});}
    else S.meds.push({name:r.name,freq:r.freq,time:r.food,range:'24 Oct, '+r.days,...w});
  });
  const n=(S.rx||[]).length;S.rx=[];render();toast(n+' order'+(n>1?'s':'')+' saved. Prescription PDF updated in Prescriptions.');
}
/* medication history: every medicine this stay, one row each, nothing struck through.
   Doses taken come from the nurses' dose chart (MAR); a stopped medicine keeps the list it had when stopped. */
const MAR_SLOTS=f=>f==='1-0-1'?['M','N']:f==='0-0-1'?['N']:f==='1-0-0'?['M']:f==='1-1-1'?['M','A','N']:['SOS'];
const MAR_TIME={M:'8 am',A:'2 pm',N:'9 pm',SOS:''};
const MON3='JanFebMarAprMayJunJulAugSepOctNovDec';
const marDay=lbl=>{if(lbl==='Today'){const d=new Date();return new Date(d.getFullYear(),d.getMonth(),d.getDate());}const [dd,mm]=lbl.split(' ');return new Date(2026,MON3.indexOf(mm)/3,+dd);};
const atDay=at=>{const m=String(at||'').match(/(\d{1,2}) ([A-Z][a-z]{2})(?: (\d{4}))?/);return m?new Date(+(m[3]||2026),MON3.indexOf(m[2])/3,+m[1]):null;};
function medDoseDates(m){
  if(m.doses)return m.doses;
  const days=marDays(),ti=days.length-1,out=[];
  days.forEach((day,di)=>{const g=MAR_SLOTS(m.freq).filter(k=>marStat(m,day,k,di,di===ti).st==='G');if(g.length){const tm=g.map(k=>MAR_TIME[k]).filter(Boolean);out.push((di===ti?marDLab(day):marDLab(day))+(tm.length?' ('+tm.join(', ')+')':''));}});
  return out;}
function medHistoryTable(){
  const rows=S.meds.map(m=>({m,on:true})).concat((S.medsOff||[]).map(m=>({m,on:false})));if(!rows.length)return '';
  const when=(at,by)=>`<div>${hesc(at||'Not recorded')}</div><div class="tiny muted">${hesc(by||'Doctor not recorded')}</div>`;
  return `<div class="pad" style="padding-bottom:6px"><div class="lbl">Medication history this stay · ${S.meds.length} ongoing · ${(S.medsOff||[]).length} stopped</div></div>
    <div class="scroll"><table class="t smt"><thead><tr><th>Medicine and dose</th><th>Frequency</th><th>Start date and time</th><th>Doses taken</th><th>Stopped date and time</th><th>Reason</th></tr></thead><tbody>
    ${rows.map(({m,on})=>{const ds=medDoseDates(m);return `<tr><td style="font-weight:600">${hesc(m.name)}</td><td>${hesc(m.freq)}${m.time?`<div class="tiny muted">${hesc(m.time)}</div>`:''}</td><td class="when small">${when(m.at,m.by)}</td><td class="small doses">${ds.length?ds.map(hesc).join('<br>'):'<span class="muted">None given</span>'}${ds.length?`<div class="tiny muted">${ds.length} day${ds.length===1?'':'s'}</div>`:''}</td><td class="when small">${on?'<span class="muted">Ongoing</span>':when(m.offAt,m.offBy)}</td><td class="why small">${on?'<span class="muted">—</span>':hesc(m.why||'Not given')}</td></tr>`;}).join('')}
    </tbody></table></div>`;}
function medStopModal(i){const m=S.meds[i];openModal(`<div class="mh"><h3>Stop ${hesc(m.name)}</h3><button class="x" aria-label="Close" onclick="closeModal()">×</button></div>
 <div class="mb"><div class="small muted">Started by ${m.by||'not recorded'}${m.at?' · '+m.at:''}. It stays on the chart as stopped, with your name and the time.</div>
 <label class="field"><span class="lbl">Reason</span><select class="input" id="msW"><option>Dose change (new order follows)</option><option>Side effects</option><option>Not effective</option><option>Course complete</option><option>Patient or family refused</option><option>Other</option></select></label></div>
 <div class="mf"><button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="rxStopMed(${i},$('msW').value)">Stop medicine</button></div>`);}
function rxStopMed(i,why){const doses=medDoseDates(S.meds[i]),snap=marSnap(S.meds[i]),m=S.meds.splice(i,1)[0],w=whoAt();m.doses=doses;m.snap=snap;S.medsOff=S.medsOff||[];S.medsOff.unshift({...m,offBy:w.by,offAt:w.at,why});closeModal();render();toast(`${m.name} stopped by ${w.by}. Moved to Stopped medicines; nurses no longer give it.`);}
function pOrders(){
  const rx=S.rx||[];
  const draft = rx.map((r,i)=>`<div class="rxrow">
      <div><div style="font-weight:600">${r.name}</div>${rxWarn(r)}${r.name.startsWith('Clozapine')?`<div class="tiny" style="color:var(--amber)">Held until the patient and relative sign the clozapine consent (agranulocytosis, seizures, cardiac risk explained); weekly WBC counts scheduled</div>`:''}</div>
      <div class="mini-chips" role="group" aria-label="Frequency">${FREQ.map(f=>`<button class="tog ${r.freq===f?'on':''}" onclick="rxSet(${i},'freq','${f}')">${f}</button>`).join('')}</div>
      <div class="mini-chips" role="group" aria-label="Timing">${['Before food','After food'].map(f=>`<button class="tog ${r.food===f?'on':''}" onclick="rxSet(${i},'food','${f}')">${f.replace(' food','')}</button>`).join('')}</div>
      <select class="input" style="width:auto;min-height:30px;padding:3px 8px" onchange="rxSet(${i},'days',this.value)" aria-label="Duration">${['7 days','14 days','30 days','Till review'].map(d=>`<option ${r.days===d?'selected':''}>${d}</option>`).join('')}</select>
      <button class="x" aria-label="Remove" onclick="S.rx.splice(${i},1);render()">×</button>
    </div>`).join('');
  const pend=S.consents.filter(c=>c.c==='c-amber').length;
  const act=(ic,t,sub,st,btn)=>`<div class="ocard"><div class="row" style="gap:10px;flex-wrap:nowrap"><div class="oic">${ic}</div><div style="flex:1;min-width:0"><div style="font-weight:600">${t}</div><div class="tiny muted">${sub}</div></div></div><div class="row" style="justify-content:space-between;margin-top:auto">${st}${btn}</div></div>`;
  const I=(d)=>`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">${d}</svg>`;
  const stage=c=>c.c==='c-green'?2:c.c==='c-amber'?1:0;
  return `
  <div class="ostrip">
    <div><span class="lbl">Active medicines</span><b>${S.meds.length}</b></div>
    <div><span class="lbl">Tests ordered</span><b>${S.labs.length}</b></div>
    <div class="${pend?'warn':''}"><span class="lbl">Consents waiting</span><b>${pend}</b></div>
    <div><span class="lbl">Restraint this stay</span><b>${S.restraints.length}</b></div>
  </div>
  <section class="card">
    <div class="hd"><div><h3>Medicines</h3><div class="small muted" style="margin-top:4px">Same fields as the live prescription: medicine with strength, 1-0-1, before or after food, dates</div></div>
      ${isPsy()?`<div class="row" style="gap:8px"><button class="btn sm" onclick="rxAdd('Olanzapine 15 mg')">Repeat last change</button></div>`:''}</div>
    <div class="scroll"><table class="t"><thead><tr><th>Medicine</th><th>Freq.</th><th>Time</th><th>Duration</th><th>Prescribed by</th>${isPsy()?'<th></th>':''}</tr></thead><tbody>
      ${S.meds.map((m,i)=>`<tr><td><b>${m.name}</b></td><td>${m.freq}</td><td>${m.time}</td><td>${m.range}</td><td class="small">${m.by?`${m.by}<span class="byl">${m.at||''}</span>`:'Not recorded'}</td>${isPsy()?`<td style="text-align:right"><button class="btn sm" onclick="medStopModal(${i})">Stop</button></td>`:''}</tr>`).join('')}
    </tbody></table></div>
    ${medHistoryTable()}
    <div class="pad tiny muted" style="padding-top:8px">Medicines are never edited. A dose change is a stop plus a new order, so the chart keeps who started and stopped each one, and when.</div>
    ${isPsy()?`<div style="padding:14px 20px 18px;border-top:1px solid var(--line-2)">
      <div class="lbl" style="margin-bottom:8px">Add medicines</div>
      <div class="sugg"><input class="input" id="rxq" placeholder="Type a medicine, e.g. quet" oninput="rxSugg(this.value)" autocomplete="off" aria-label="Search medicine"><div class="menu" id="rxm" style="display:none"></div></div>
      <div class="row" style="gap:6px;margin-top:8px"><span class="tiny muted">Frequent:</span>${['Quetiapine 50 mg','Sodium valproate 500 mg','Trihexyphenidyl 2 mg'].map(d=>`<button class="tog" style="height:28px;font-size:12px" onclick="rxAdd('${d}')">${d}</button>`).join('')}</div>
      ${draft}
      ${rx.length?`<div class="row" style="justify-content:flex-end;margin-top:12px"><button class="btn" onclick="S.rx=[];render()">Discard</button><button class="btn pri" onclick="rxSave()">Save ${rx.length} order${rx.length>1?'s':''}</button></div>`:''}
    </div>`:'<div class="pad small muted">Orders are written by the psychiatrist.</div>'}
  </section>
  <section class="card"><div class="hd"><div><h3>Requests and procedures</h3><div class="small muted" style="margin-top:4px">Each request tells the front desk which family signature to take</div></div></div>
    <div class="ogrid">
      ${act(I('<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3"/>'),'Lab tests',S.labs.map(l=>l.t+' · '+l.d+(l.by?' · ordered by '+l.by+(l.at?', '+l.at:''):'')).join('; ')||'None ordered',chip(S.labs.length+' ordered','c-blue'),isPsy()?`<button class="btn sm" onclick="labModal()">Order tests</button>`:'')}
      ${act(I('<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>'),'MECT','Checklist and consents before scheduling',chip(S.consents.some(c=>c.name.startsWith('MECT'))?'Requested':'Not ordered',S.consents.some(c=>c.name.startsWith('MECT'))?'c-amber':'c-grey'),isPsy()?`<button class="btn sm" onclick="mectModal()">Order MECT</button>`:'')}
      ${act(I('<circle cx="9" cy="8" r="3.5"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M17 8h5M19.5 5.5v5"/>'),'Visiting doctor referral','Medicine, neurology, dermatology and others',chip(S.consents.some(c=>c.name.startsWith('Referral'))?'Sent':'None','c-grey'),isPsy()?`<button class="btn sm" onclick="referralModal()">Refer</button>`:'')}
      ${act(I('<path d="M4 20h16M6 20V9l6-5 6 5v11M10 20v-5h4v5"/>'),'Outing or leave','With family; front desk logs exit and return',chip(S.consents.some(c=>c.name.startsWith('Outing'))?'Approved':'None','c-grey'),`<button class="btn sm" onclick="outingModal()">Approve outing</button>`)}
      ${act(I('<rect x="4" y="10" width="16" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>'),'Restraint','Psychiatrist only · goes into the Review Board report',chip(S.restraints.length?S.restraints.length+' this stay':'None','c-grey'),isPsy()?`<button class="btn sm" onclick="restraintModal()">Authorise</button>`:'')}
    </div></section>
  <section class="card"><div class="hd"><div><h3>Consents</h3><div class="small muted" style="margin-top:4px">Create a task and choose who takes the signature: the front desk on the tablet, the RMO or the nurse. You see where each one is</div></div>${isPsy()||S.role==='rmo'?`<button class="btn pri sm" onclick="consentModal()">Request consent</button>`:''}</div>
    <div class="scroll"><table class="t"><thead><tr><th>Consent</th><th>Signed by</th><th>Requested</th><th>With staff</th><th>Signed</th><th></th></tr></thead><tbody>
    ${S.consents.map((c,ci)=>{const st=stage(c),mine=c.id&&c.c==='c-amber'&&CN_ROLE[c.to]===S.role,canc=c.id&&c.c==='c-amber'&&(isPsy()||S.role==='rmo');return `<tr><td style="font-weight:600">${c.name}</td><td class="small">${c.who}</td>${[0,1,2].map(i=>`<td><span class="cdot ${st===0?'off':(i<=st?'on':'')}"></span></td>`).join('')}<td style="text-align:right;white-space:nowrap">${mine?`<button class="btn sm pri" onclick="consentTake(${ci})">Take consent</button>`:''}${canc?`<button class="btn sm" style="margin-left:6px" onclick="consentCancel(${ci})">Cancel</button>`:''}</td></tr><tr><td colspan="6" class="tiny muted" style="padding-top:0;border-bottom:1px solid var(--line-2)">${c.st}</td></tr>`;}).join('')}
    </tbody></table></div></section>`;
}
/* ---- consent tasks: the doctor creates a task, someone takes the signature ---- */
const CONSENT_TYPES=[
 ['mect','MECT consent','MECT consent','Patient or NR, two psychiatrists, family member','mect'],
 ['dtms','dTMS consent','dTMS consent','Patient or NR','dtms'],
 ['ket','Ketamine therapy consent','Ketamine therapy consent','Patient or NR','ket'],
 ['lai','Long-acting injection consent','Long-acting injection consent','Patient or NR','lai'],
 ['inj','Injection consent · patient refuses oral medicine','Injection consent','Patient or NR, family member','inj'],
 ['out','Outing consent','Outing consent','Patient and guardian','out'],
 ['rest','Restraint consent','Restraint consent','Family member','rest'],
 ['cloz','Clozapine consent','Clozapine consent','Patient and relative','cloz'],
 ['ref','Referral consultation consent','Referral consultation consent','Relative','ref']];
const CN_SIGN=['Patient','Nominated representative','Family member','Relative','Guardian'];
const CONSENT_TO=['Front desk','RMO on duty','Nurse in charge'],CN_ROLE={'RMO on duty':'rmo','Nurse in charge':'nurse'},LAI_DRUGS=['Olanzapine','Risperidone','Paliperidone'];
const consentTasks=role=>(S.consents||[]).filter(c=>c.id&&c.c==='c-amber'&&CN_ROLE[c.to]===role).map(c=>({id:c.id,pid:'neel',title:'Take consent · '+c.name+' · Neel Bose',meta:'Requested by '+c.by+' · signed by '+c.who,due:c.need,chipc:'c-blue',go:'#/patient/neel/orders'}));
function consentModal(){
  openModal(`<div class="mh"><h3>Request consent · Neel Bose</h3><button class="x" aria-label="Close" onclick="closeModal()">×</button></div>
  <div class="mb"><div class="tiny muted">Creates a task for whoever takes the signature. It moves to Signed in the Consents list once it is taken.</div>
  <label class="field"><span class="lbl">Consent</span><select class="input" id="cnT" onchange="cnKind()">${CONSENT_TYPES.map(t=>`<option value="${t[0]}">${t[1]}</option>`).join('')}</select></label>
  <div id="cnX"></div>
  <label class="field"><span class="lbl">Signed by</span><select class="input" id="cnW">${CN_SIGN.map(x=>`<option>${x}</option>`).join('')}</select></label>
  <div class="grid2"><label class="field"><span class="lbl">Taken by</span><select class="input" id="cnTo">${CONSENT_TO.map(x=>`<option>${x}</option>`).join('')}</select></label>
  <label class="field"><span class="lbl">Needed</span><select class="input" id="cnN">${['Today','Tomorrow','Before the procedure'].map(x=>`<option>${x}</option>`).join('')}</select></label></div>
  <label class="field"><span class="lbl">Note (optional)</span><input class="input" id="cnNote" maxlength="120" placeholder="e.g. explain risks to the sister first"></label>
  <div id="cnE" class="small" style="color:var(--red);display:none"></div></div>
  <div class="mf"><button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="consentSave()">Create task</button></div>`);
  cnKind();
}
function cnKind(){
  const t=CONSENT_TYPES.find(x=>x[0]===$('cnT').value),k=t[0],oral=S.meds.filter(m=>m.freq!=='SOS'&&!m.name.includes('waiting')).map(m=>m.name.split(' · ')[0]);
  $('cnW').value=CN_SIGN.find(o=>t[3].toLowerCase().startsWith(o.toLowerCase()))||CN_SIGN[0];
  $('cnX').innerHTML=(k==='lai'?`<label class="field"><span class="lbl">Medicine</span><select class="input" id="cnD">${LAI_DRUGS.map(d=>`<option>${d}</option>`).join('')}</select></label>`
   :k==='inj'?`<label class="field"><span class="lbl">Medicine the patient refuses by mouth</span><select class="input" id="cnD">${oral.map(d=>`<option>${d}</option>`).join('')}</select></label><div class="callout amber small" style="margin-bottom:10px">New form: injection in place of oral medicine. It prints from Forms to print.</div>`:'')
   +`<div class="tiny muted" style="margin-bottom:10px">Form: <button class="lnk" style="margin:0" onclick="pfPrint('${t[4]}')">Preview ${t[1].toLowerCase()}</button></div>`;
}
function consentSave(){
  const t=CONSENT_TYPES.find(x=>x[0]===$('cnT').value),d=$('cnD')?$('cnD').value:'',name=t[2]+(d?' · '+d:''),er=$('cnE');
  if(S.consents.some(c=>c.name===name&&c.c==='c-amber')){er.textContent=name+' is already requested';er.style.display='block';return;}
  const to=$('cnTo').value,need=$('cnN').value,note=hesc($('cnNote').value.trim()),who=hesc($('cnW').value.trim())||t[3];
  S.cnN=(S.cnN||0)+1;
  S.consents.push({id:'cn'+S.cnN,name,who,st:'Requested by '+signer()+' · '+clock()+' · to '+to+' · needed '+need.toLowerCase()+(note?' · '+note:''),c:'c-amber',to,need,form:t[4],by:signer()});
  if(to==='Nurse in charge'){S.nInstr=S.nInstr||[];S.nN=(S.nN||0)+1;S.nInstr.unshift(['Neel Bose',signer()+' · just now','Take consent: '+name+', signed by '+who+'. Needed '+need.toLowerCase()+'. Record it from Orders and consents.','Consent','c-violet','','n'+S.nN]);}
  closeModal();render();toast('Consent task created for '+to+(to==='Front desk'?'. It shows on the front desk tablet.':'.'));
}
function consentCancel(i){const c=S.consents[i];S.consents.splice(i,1);render();toast(c.name+' request cancelled');}
function consentTake(i){
  const c=S.consents[i];
  openModal(`<div class="mh"><h3>Take consent · Neel Bose</h3><button class="x" aria-label="Close" onclick="closeModal()">×</button></div>
  <div class="mb"><div class="box"><div style="font-weight:600">${c.name}</div><div class="tiny muted">Requested by ${c.by} · signed by ${c.who} · needed ${(c.need||'').toLowerCase()}</div>${c.form?`<div style="margin-top:6px"><button class="lnk" style="margin:0" onclick="pfPrint('${c.form}')">Print the form with Neel's details</button></div>`:''}</div>
  <label class="field"><span class="lbl">Who signed</span><select class="input" id="ctS">${['Patient','Nominated representative','Family member','Patient and guardian'].map(x=>`<option>${x}</option>`).join('')}</select></label>
  <label class="field"><span class="lbl">Name of the person who signed</span><input class="input" id="ctN" value="Ananya Bose (sister)" maxlength="60"></label>
  <label class="field"><span class="lbl">Witness</span><input class="input" id="ctW" value="${hesc(signer())}" maxlength="60"></label>
  <label class="check"><input type="checkbox" id="ctX"> <span>Purpose, benefits and risks explained in a language they understand, and the signed paper form is on file</span></label>
  <div id="ctE" class="small" style="color:var(--red);display:none"></div></div>
  <div class="mf"><button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="consentSign(${i})">Record consent</button></div>`);
}
function consentSign(i){
  const c=S.consents[i];if(!$('ctX').checked){$('ctE').textContent='Tick that the risks were explained and the signed form is on file';$('ctE').style.display='block';return;}
  const nm=hesc($('ctN').value.trim()),wt=hesc($('ctW').value.trim());
  c.c='c-green';c.st='Signed '+new Date().toLocaleDateString('en-IN',{day:'numeric',month:'short'})+', '+clock()+' · '+$('ctS').value+(nm?' ('+nm+')':'')+' · taken by '+signer()+(wt?' · witness '+wt:'');
  if(c.form)S.pf[c.form]='signed';
  closeModal();render();toast('Consent recorded. '+c.by+' can see it as signed.');
}
function mectModal(){openModal(`<div class="mh"><h3>Order MECT</h3><button class="x" aria-label="Close" onclick="closeModal()">×</button></div>
 <div class="mb"><div class="callout grey">Sessions can be scheduled once the checklist is complete. Checklist items come from the MECT form.</div>
 ${['Capacity assessment on file','Admission consent signed','MECT consent signed by patient or NR and two psychiatrists','Anaesthesia consent signed by patient or NR and a family member','PAC and pre-MECT work-up (routine and special tests, ECG, fundus) checked by RMO','MMSE score recorded'].map((t,i)=>`<label class="check"><input type="checkbox" ${i<2?'checked':''}> <span>${t}</span></label>`).join('')}
 <label class="field"><span class="lbl">Planned sessions</span><select class="input"><option>6 sessions, 3 a week</option><option>8 sessions, 2 a week</option></select></label></div>
 <div class="mf"><button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="closeModal();S.consents.push({name:'MECT and anaesthesia consents',who:'Patient or NR, family',st:'Requested from front desk by '+signer()+' · '+atNow(),by:signer(),c:'c-amber'});render();toast('MECT ordered. Consents requested; scheduling unlocks when the checklist is complete.')">Order MECT</button></div>`);}
function pTherapy(){
  const doc=isPsy(),G=[['Group therapy',[0,1,0,1,1,null]],['Yoga',[1,1,1,0,1,null]],['Occupational therapy',[null,0,null,1,null,null]],['Psychoeducation',[1,null,1,null,null,null]]];
  const planReq=S.psychRows.reduce((a,r)=>a+(+r.req||0),0),planDone=S.psychRows.reduce((a,r)=>a+(+r.done||0),0);
  const wk2=S.therapyNotes.filter(n=>(n.wk||2)===2).length;
  const CALLS=[['h24','24-hour call','Psychiatrist',true],['d34psy','Day 3 to 4 call','Psychiatrist',true],['d34psych','Day 3 to 4 call','Psychologist',false]];
  const cd=k=>S.calls[k]==='done',mine=c=>c[3]===doc,nCalls=CALLS.filter(c=>cd(c[0])).length;
  const att=G.reduce((a,r)=>a+r[1].filter(v=>v===1).length,0),held=G.reduce((a,r)=>a+r[1].filter(v=>v!==null).length,0);
  const due=[];
  if(!doc&&!wk2)due.push(`<div class="li"><div class="grow"><div style="font-weight:600">Weekly therapy note</div><div class="tiny muted">Week 2 · at least one a week · the scribe drafts it from the session</div></div>${chip('Due by 31 Oct','c-amber')}<button class="btn sm pri" onclick="therapyModal()">${icon.mic} New note with AI scribe</button></div>`);
  CALLS.filter(c=>mine(c)&&!cd(c[0])).forEach(c=>due.push(`<div class="li"><div class="grow"><div style="font-weight:600">${c[1]} · ${c[2].toLowerCase()}</div><div class="tiny muted">Ananya Bose, sister · assigned to ${c[3]?S.team.psy:S.team.psych} · call is placed and logged through the HMS with the caller's name and time</div></div>${chip('Due today','c-blue')}<button class="btn sm" onclick="schedMsg('Ananya Bose')">Message caregiver</button><button class="btn sm pri" onclick="S.calls['${c[0]}']='done';callFamily('x')">${icon.phone}Call via HMS</button></div>`));
  const tile=(l,v,sub,c)=>`<div class="card stat"><div class="lbl">${l}</div><b${c?` style="color:var(--${c})"`:''}>${v}</b><span class="small muted">${sub}</span></div>`;
  const wk=w=>{const ns=S.therapyNotes.filter(n=>(n.wk||2)===w),dueW=w===2&&!ns.length;
    return `<div class="wkhd"><strong>Week ${w}</strong><span class="tiny muted">${w===1?'18 to 24 Oct':'25 to 31 Oct'}</span>${ns.length?chip(ns.length+' note'+(ns.length>1?'s':''),'c-green'):chip(dueW?'Weekly note due by 31 Oct':'None','c-amber')}</div>
      <div style="padding:0 16px 8px">${ns.length?noteList('tn'+w,ns.map(n=>({d:n.d.split(' ')[0],my:(n.d.split(' ')[1]||'Oct')+' 2026',type:n.t.split(' · ')[0],tc:'c-violet',by:n.by,role:'Psychologist',sum:n.t.split(' · ')[1]||'',secs:(n.body||'').split('. ').filter(Boolean).map(x=>{const m=x.match(/^(Aim|Duration|Intervention|Outcome|Next):?\s*(.*)$/i);return m?[m[1]==='Next'?'Plan for next session':m[1],m[2]]:['Note',x]})}))):'<div class="small muted" style="padding:6px 4px 10px">No note yet this week.</div>'}</div>`;};
  return `
  <section class="card thdue"><div class="hd"><div><h3>Due now</h3><div class="small muted" style="margin-top:4px">${doc?'Your family calls':'Your note and family call'} for ${due.length?'today':'this week'}</div></div>${due.length?chip(due.length+' to do','c-amber'):chip('All caught up','c-green')}</div>
    ${due.length?due.join(''):'<div class="pad small muted">Nothing is waiting on you. The weekly note and the day 3 to 4 call are done or not due yet.</div>'}</section>
  <div class="grid4">${tile('Therapy sessions',planDone+' of '+planReq,'Done against the psychology plan')}${tile('Notes this week',wk2+' of 1',wk2?'Weekly note written':'Weekly note due by 31 Oct',wk2?'green':'amber')}${tile('Family calls',nCalls+' of '+CALLS.length,'24-hour and day 3 to 4')}${tile('Group sessions',att+' of '+held,'Attended this week')}</div>
  <div class="thcols">
    <div class="thmain">
      <section class="card"><div class="hd"><div><h3>Therapy plan</h3><div class="small muted" style="margin-top:4px">Sessions done count up from each signed note</div></div></div>
        ${S.psychRows.map(r=>{const pc=Math.min(100,Math.round((+r.done||0)/Math.max(1,+r.req||1)*100));return `<div class="li" style="align-items:flex-start"><div class="grow"><div style="font-weight:600">${r.area}</div><div class="tiny muted">${r.iv} · ${r.when}</div>${byl(r.by||S.team.psych,r.at||'24 Oct 2026, 4:30 pm','Planned by')}<div class="row" style="gap:10px;margin-top:8px;flex-wrap:nowrap"><div class="ebar" style="flex:1;max-width:260px"><i style="width:${pc}%"></i></div><span class="tiny"><b>${r.done}</b> of ${r.req} sessions</span></div></div>${chip(r.out,'c-grey')}</div>`;}).join('')}</section>
      <section class="card"><div class="hd"><div><h3>Therapy notes</h3><div class="small muted" style="margin-top:4px">Newest week first · each note counts toward sessions done</div></div>${!doc?`<button class="btn pri sm" onclick="therapyModal()">${icon.mic} New note with AI scribe</button>`:''}</div>${wk(2)}${wk(1)}</section>
    </div>
    <div class="thside">
      <section class="card"><div class="hd"><h3>Family</h3>${chip('Calls logged by the HMS','c-grey')}</div>
        <div class="lbl" style="padding:14px 20px 4px">Calls</div>
        ${CALLS.map(c=>`<div class="li" style="padding:10px 20px;flex-wrap:nowrap"><span class="thdot ${cd(c[0])?'ok':''}">${cd(c[0])?'✓':''}</span><div class="grow"><div style="font-weight:600;font-size:14px">${c[1]}</div><div class="tiny muted">${c[2]}${mine(c)?' · yours':''}</div></div>${chip(cd(c[0])?'Done · logged':(mine(c)?'Due today':'Due'),cd(c[0])?'c-green':(mine(c)?'c-blue':'c-grey'))}</div>`).join('')}
        <div class="pad tiny muted" style="padding-top:10px">Random and weekly calls are run by the family coordinator (Pooja Malhotra) in the admin portal; each call is logged with who called and when.</div>
        <div class="hd" style="border-top:1px solid var(--line-2);border-bottom:0;flex-wrap:nowrap"><div><h3 style="font-size:15px">Visits and counselling</h3><div class="tiny muted" style="margin-top:2px">Optional · agenda, family's view, next visit</div></div>${!doc?`<button class="btn sm" onclick="familyModal()">New session</button>`:''}</div>
        <div class="li" style="padding:10px 20px;flex-wrap:nowrap"><div class="grow"><div style="font-weight:600;font-size:14px">Planned visit · Ananya Bose (sister)</div><div class="tiny muted">Counselled by Priya Nair · 20 Oct 2026, 3:00 pm</div></div><button class="btn sm" onclick="toast('Opens the note')">View</button></div>
      </section>
    </div>
  </div>
  <section class="card"><div class="hd"><div><h3>Group sessions this week</h3><div class="small muted" style="margin-top:4px">Marked by each session lead: group therapy Kiran Mehra · yoga Rahul Verma · occupational therapy Surabhi Sengar · psychoeducation Priya Nair. Feeds the daily note and discharge summary</div></div>${chip(att+' of '+held+' attended','c-green')}</div>
    <div class="scroll"><table class="t thgrid"><thead><tr><th>Session</th>${['Mon','Tue','Wed','Thu','Fri','Sat'].map(d=>`<th style="text-align:center">${d}</th>`).join('')}</tr></thead><tbody>
    ${G.map(r=>`<tr><td style="font-weight:600">${r[0]}</td>${r[1].map(v=>`<td style="text-align:center">${v===null?'<span class="thc n" title="No session">–</span>':(v?'<span class="thc y" title="Attended">✓</span>':'<span class="thc m" title="Missed">✕</span>')}</td>`).join('')}</tr>`).join('')}
    </tbody></table></div>
    <div class="row tiny muted" style="gap:14px;padding:4px 20px 14px"><span><span class="thc y sm">✓</span> Attended</span><span><span class="thc m sm">✕</span> Missed</span><span><span class="thc n sm">–</span> No session</span></div></section>`;
}
function pPast(){
  return S.pastAdm.map((a,ai)=>`
  <section class="card">
    <div class="hd"><div><h3>Admission ${a.n} · ${a.dates}</h3><div class="small muted" style="margin-top:4px">${a.days} days · ${a.sec} · ${a.psy} · ${a.psych} · read only</div></div>
      <div class="row" style="gap:8px"><button class="btn sm" onclick="pastSummary(${ai})">Discharge summary</button><button class="btn sm" onclick="pastFile(${ai})">Stay file</button></div></div>
    <div class="grid3" style="padding:14px 20px">
      <div class="box"><div class="lbl">Discharge diagnosis</div><div class="small" style="font-weight:600;margin-top:4px">${a.dx}</div></div>
      <div class="box"><div class="lbl">Condition at discharge</div><div class="small" style="font-weight:600;margin-top:4px">${a.cond}</div></div>
      <div class="box"><div class="lbl">Medicines at discharge</div>${a.meds.map(m=>`<div class="small" style="font-weight:600;margin-top:4px">${m}</div>`).join('')}</div>
    </div>
    <div class="lbl" style="padding:4px 20px 6px">Clinical records</div>
    ${PASTREC.map((r,ri)=>`<div class="li"><div class="grow"><div style="font-weight:600" class="small">${r[0]}</div><div class="tiny muted">${r[1](a)}</div></div><button class="btn sm" aria-expanded="${!!(S.recOpen||{})[ai+'-'+ri]}" onclick="S.recOpen=S.recOpen||{};S.recOpen['${ai}-${ri}']=!S.recOpen['${ai}-${ri}'];render()">${(S.recOpen||{})[ai+'-'+ri]?'Close ▴':'Open ▾'}</button></div>
      ${(S.recOpen||{})[ai+'-'+ri]?`<div class="recx">${PASTREC_FIELDS[r[0]].map(f=>`<div class="box small"><div class="lbl">${f}</div><div style="margin-top:4px;${r[0]==='Detailed case history'?'color:var(--ink)':''}" class="${r[0]==='Detailed case history'?'':'muted'}">${r[0]==='Detailed case history'?CASEHX[f]:'As recorded during the stay'}</div></div>`).join('')}<div class="row" style="grid-column:1/-1;gap:8px"><button class="btn sm" onclick="toast('Copied into today\'s note')">Copy to today's note</button><span class="tiny muted">Read only</span></div></div>`:''}`).join('')}
    <div class="pad small"><span class="muted">Plan last time:</span> ${a.plan}</div>
  </section>`).join('')+`<div class="callout grey">Past stays are read only. OPD visits between admissions stay in the live Clinical Notes tab; discharge summaries also sit in Care Management.</div>`;
}
const CASEHX={'Informant and reliability':'Sister (Ananya Bose) · good','Chief complaints with duration':'Decreased need for sleep, talkativeness, overspending for 2 weeks; irritability for 5 days','Onset, course and precipitating factors':'Acute onset · episodic · job stress after a missed promotion','History of present illness':'First episode. Sleeping 2 to 3 hours a night, spending on credit cards, starting new business plans; angry when stopped by family.','Past psychiatric history':'None before this episode','Past medical history':'No major illness; no known drug allergies','Family history':'Maternal uncle treated for bipolar disorder','Personal history':'Graduate, works in sales; unmarried, lives with sister in Gurgaon','Premorbid personality':'Sociable, ambitious, quick tempered','Substance use':'Social alcohol, 2 to 3 times a month; no other substances','MSE: appearance and behaviour':'Well kempt, overfamiliar, restless','MSE: speech':'Pressured, increased rate and volume','MSE: mood and affect':'Elated, irritable at times; affect labile','MSE: thought':'Flight of ideas; grandiose ideas, no delusions','MSE: perception':'No hallucinations','MSE: cognition':'Oriented; attention distractible','MSE: insight and judgement':'Insight grade II; judgement impaired','Risk assessment':'Harm to others: moderate · suicide: low · financial risk: high','Provisional diagnosis':'Bipolar affective disorder, current episode manic without psychotic symptoms'};
const PASTREC=[
  ['Detailed case history',a=>'Within 72 hours · signed by '+a.psy],
  ['Detailed capacity assessment',a=>'At admission, then weekly for 30 days · '+a.sec],
  ['Management plans',a=>'Psychiatry and psychology plans'],
  ['Weekly re-assessments',a=>'By the treating team'],
  ['Round notes',a=>'Medicine changes and actions from rounds'],
  ['Daily notes',a=>'One per day of the stay'],
  ['Therapy and family sessions',a=>'Sessions by '+a.psych],
  ['Discharge summary',a=>'Signed at discharge']
];
const PASTREC_FIELDS={
  'Detailed case history':['Informant and reliability','Chief complaints with duration','Onset, course and precipitating factors','History of present illness','Past psychiatric history','Past medical history','Family history','Personal history','Premorbid personality','Substance use','MSE: appearance and behaviour','MSE: speech','MSE: mood and affect','MSE: thought','MSE: perception','MSE: cognition','MSE: insight and judgement','Risk assessment','Provisional diagnosis'],
  'Detailed capacity assessment':['Understands information','Retains information','Weighs information','Communicates decision','Level of support needed','Assessed by and date'],
  'Management plans':['Psychiatry plan','Psychology plan','Goals for the stay','Review date'],
  'Weekly re-assessments':['Week','Progress against goals','Changes to plan'],
  'Round notes':['Date','Findings','Medicine changes','Actions'],
  'Daily notes':['Date','Sleep, meals, mood','Sessions','Risk'],
  'Therapy and family sessions':['Date','Type of session','Focus','Next steps'],
  'Discharge summary':['Discharge diagnosis','Condition at discharge','Medicines','Follow-up plan']
};
function pastRec(ai,ri){const a=S.pastAdm[ai];const h=PASTREC[ri][0];openModal(`<div class="mh"><h3>${h} · Admission ${a.n}</h3><button class="x" aria-label="Close" onclick="closeModal()">×</button></div>
  <div class="mb"><div class="tiny muted" style="margin-bottom:10px">${a.dates} · read only</div>${PASTREC_FIELDS[h].map(f=>`<div class="box small" style="margin-bottom:8px"><div class="lbl">${f}</div><div class="muted" style="margin-top:4px">As recorded during the stay</div></div>`).join('')}</div>
  <div class="mf"><button class="btn" onclick="toast('Copied into today\'s note')">Copy to today\'s note</button><button class="btn pri" onclick="closeModal()">Close</button></div>`);}
function readmit(){
  S.pastAdm.unshift({n:S.admNo,dates:'18 to 24 Oct 2026',days:6,psy:S.team.psy,psych:S.team.psych,sec:'Section 89',dx:S.dx,cond:'Calmer, sleeping 6 to 7 hours, partial insight',
    meds:S.meds.map(m=>m.name+' · '+m.freq),plan:'Continue lithium; relapse prevention plan with sister; follow-up after 7 days',
    notes:[['24 Oct','Discharge summary · Dr. Aanya Sharma','Signed at discharge.'],['23 Oct','Daily note · Priya Nair','Under 4 h sleep, partial meals, irritable; yoga only.'],['23 Oct','Round note · Dr. Aanya Sharma','Pressured speech less; olanzapine reviewed.'],['22 Oct','Capacity assessment','Needs 100% support from nominated representative.'],['21 Oct','Detailed history','Second episode after stopping lithium.']]});
  S.admNo++; S.discharged=false; S.dischargeDrafted=false; S.dailySaved=false; S.familySent=false; S.historyStatus='overdue'; S.historyDraft=false;
  Object.keys(S.discharge).forEach(k=>S.discharge[k]=false);
  go('#/patient/neel/past'); toast('Neel Bose readmitted (Admission '+S.admNo+'). Inpatient stay tab is back, with past admissions.');
}
function pVitalsOld(){
  const V=S.vit||[['18 Oct','138/88','104','98.8','97','72.4','3'],['19 Oct','134/86','98','98.6','98','—','4'],['20 Oct','130/84','96','98.4','98','—','3.5'],['21 Oct','128/82','92','98.6','98','—','5'],['22 Oct','126/80','90','98.4','99','71.8','4'],['23 Oct','124/80','88','98.6','98','—','6.5']];
  const meds=S.meds.filter(m=>!m.name.includes('waiting'));
  const doses=f=>f==='1-0-1'?['M','N']:f==='0-0-1'?['N']:f==='1-0-0'?['M']:f==='1-1-1'?['M','A','N']:['SOS'];
  const st=(mi,d,k)=>{if(k==='SOS')return d<2?'Given':'—';if(mi===1&&d===2)return 'Refused';if(mi===0&&d===0&&k==='M')return 'Held';return 'Given';};
  const grid=meds.map((m,mi)=>{const cells=[];let given=0,total=0;for(let d=0;d<6;d++){const ks=doses(m.freq);cells.push(ks.map(k=>{const x=st(mi,d,k);if(x!=='—'){total++;if(x==='Given')given++;}return x==='Given'?`<span class="chip c-green" title="${k} given">${k}</span>`:x==='Refused'?`<span class="chip c-amber" title="${k} refused">${k} refused</span>`:x==='Held'?`<span class="chip c-grey" title="${k} held">${k} held</span>`:'<span class="tiny muted">—</span>';}).join(' '));}
    const pct=total?Math.round(given/total*100):100;
    return `<tr><td style="font-weight:600">${m.name}<br><span class="tiny muted">${m.freq}</span></td>${cells.map(c=>`<td>${c}</td>`).join('')}<td>${chip(pct+'%',pct<90?'c-amber':'c-green')}</td></tr>`;}).join('');
  const top = isWard()? marCard()+vChartsCard() : adhSummary()+vChartsCard();
  return (isWard()?'':nursingSummary(true))+top+`
  <section class="card"><div class="hd"><div><h3>Blood sugar monitoring</h3><div class="small muted" style="margin-top:4px">${S.sugarHd||'Ordered 18 Oct (on olanzapine)'} · finger-prick CBG by nurses · target 80 to 180 mg/dL</div></div><div class="row" style="gap:8px">${chip('4 times a day','c-grey')}<button class="btn sm" onclick="sugarModal()">Add reading</button></div></div>
    <div class="scroll"><table class="t"><thead><tr><th>Date</th><th>Fasting</th><th>After breakfast</th><th>After lunch</th><th>Bedtime</th><th>Entered by</th></tr></thead><tbody>
    ${(S.sugarNew||[]).map(r=>`<tr><td style="font-weight:600">${hesc(r.at)}</td>${['Fasting','After breakfast','After lunch','Bedtime'].map(k=>`<td>${k===r.when||(r.when==='Random'&&k==='Fasting')?`<b style="${+r.v>180?'color:var(--amber)':''}">${hesc(r.v)}${r.when==='Random'?' (random)':''}</b>`:''}</td>`).join('')}<td class="small">${hesc(r.by)}</td></tr>`).join('')}
    ${(S.sugar||SUGAR).map((r,ri)=>`<tr><td style="font-weight:600">${r[0]}</td>${r.slice(1,5).map(v=>`<td>${v>180?`<b style="color:var(--amber)">${v}</b>`:v}</td>`).join('')}<td class="small">${SUGAR_BY[ri]||'Not recorded'}</td></tr>`).join('')}</tbody></table></div>
    <div class="pad small muted">Readings outside the target alert the treating team. HbA1c and lipid profile requested for 25 Oct.</div></section>
  <section class="card"><div class="hd"><h3>Other monitoring by nurses</h3></div>
    ${(S.monx||[['Weight','Weekly · 71.8 kg on 22 Oct (down 0.6 kg)','On track','c-green'],['Serum lithium level','Tomorrow 8 am, 12 hours after the night dose','Due','c-blue'],['Fluid intake and output','Daily · intake about 2 L','On track','c-green'],['Bowel and bladder','Daily · normal','On track','c-green'],['Sleep chart','Hourly checks at night · 6.5 h last night','Improving','c-green'],['Extrapyramidal side effects','Daily check · mild tremor noted 22 Oct','Watch','c-amber']]).map(x=>`<div class="li"><div class="grow"><div style="font-weight:600">${x[0]}</div><div class="tiny muted">${x[1]}</div></div>${chip(x[2],x[3])}</div>`).join('')}
    <div class="pad small"><button class="btn sm" onclick="toast('Monitoring order sent to the nursing station')">Order monitoring</button></div></section>
  <section class="card"><div class="hd"><div><h3>Vitals</h3><div class="small muted" style="margin-top:4px">Recorded by nurses on the ward (nursing module later; until then the RMO or nurse enters them here)</div></div><button class="btn sm" onclick="vitalsModal()">Add vitals</button></div>
    <div class="scroll"><table class="t"><thead><tr><th>Date</th><th>BP</th><th>Pulse</th><th>Temp (°F)</th><th>SpO2 (%)</th><th>Weight (kg)</th><th>Sleep (h)</th></tr></thead><tbody>${V.slice().reverse().map(v=>`<tr>${v.map((x,i)=>`<td ${i===0?'style="font-weight:600"':''}>${x}</td>`).join('')}</tr>`).join('')}</tbody></table></div></section>
  ${isWard()?nursingSummary(true):marCard()}`;
}
const DAYS6=['18 Oct','19 Oct','20 Oct','21 Oct','22 Oct','23 Oct'];
function lineChart(title,unit,series,lo,hi,band){
  const w=300,h=120,px=30,py=12,n=series[0].v.length;
  const X=i=>px+i*(w-px-10)/(n-1),Y=v=>h-py-((v-lo)/(hi-lo))*(h-2*py);
  const ticks=[lo,(lo+hi)/2,hi];
  const last=series.map(x=>x.v[n-1]).join('/');
  return `<div class="chartc"><div class="row" style="justify-content:space-between"><span style="font-weight:600">${title}</span><span class="small"><strong>${last}</strong> <span class="muted">${unit}</span></span></div>
  <svg viewBox="0 0 ${w} ${h+16}" width="100%" role="img" aria-label="${title}">
    ${band?`<rect x="${px}" y="${Y(band[1])}" width="${w-px-10}" height="${Y(band[0])-Y(band[1])}" fill="#e3f7ea" opacity=".7"/>`:''}
    ${ticks.map(t=>`<line x1="${px}" x2="${w-10}" y1="${Y(t)}" y2="${Y(t)}" stroke="#eef2f6"/><text x="${px-6}" y="${Y(t)+3}" text-anchor="end" font-size="9" fill="#5b6475">${Math.round(t)}</text>`).join('')}
    ${series.map(sr=>`<polyline points="${sr.v.map((v,i)=>X(i)+','+Y(v)).join(' ')}" fill="none" stroke="${sr.c}" stroke-width="2.2" stroke-linejoin="round"/>${sr.v.map((v,i)=>`<circle cx="${X(i)}" cy="${Y(v)}" r="3.2" fill="#fff" stroke="${sr.c}" stroke-width="2"/>`).join('')}`).join('')}
    ${DAYS6.map((d,i)=>`<text x="${X(i)}" y="${h+12}" text-anchor="middle" font-size="9" fill="#5b6475">${d.split(' ')[0]}</text>`).join('')}
  </svg>${series.length>1?`<div class="row tiny" style="gap:12px">${series.map(sr=>`<span class="row" style="gap:4px"><i style="width:10px;height:3px;background:${sr.c};display:inline-block;border-radius:2px"></i>${sr.n}</span>`).join('')}</div>`:''}</div>`;
}
function barChart(title,unit,vals,max){
  const w=300,h=120,px=30,py=12,n=vals.length,bw=(w-px-10)/n*0.55;
  const X=i=>px+(i+0.5)*(w-px-10)/n,Y=v=>h-py-(v/max)*(h-2*py);
  return `<div class="chartc"><div class="row" style="justify-content:space-between"><span style="font-weight:600">${title}</span><span class="small"><strong>${vals[n-1]}${unit}</strong> <span class="muted">today</span></span></div>
  <svg viewBox="0 0 ${w} ${h+16}" width="100%" role="img" aria-label="${title}">${[0,max/2,max].map(t=>`<line x1="${px}" x2="${w-10}" y1="${Y(t)}" y2="${Y(t)}" stroke="#eef2f6"/><text x="${px-6}" y="${Y(t)+3}" text-anchor="end" font-size="9" fill="#5b6475">${t}</text>`).join('')}
  ${vals.map((v,i)=>`<rect x="${X(i)-bw/2}" y="${Y(v)}" width="${bw}" height="${h-py-Y(v)}" rx="4" fill="${v<90&&unit==='%'?'#e0a43a':'#1e6cdb'}"/>`).join('')}
  ${DAYS6.map((d,i)=>`<text x="${X(i)}" y="${h+12}" text-anchor="middle" font-size="9" fill="#5b6475">${d.split(' ')[0]}</text>`).join('')}</svg></div>`;
}
function adhSummary(){
  const M=S.adh||[['Lithium carbonate 400 mg','12/12 doses',100],['Olanzapine 10 mg','5/6 doses',83],['Lorazepam 1 mg','SOS · 2 given',null]];const AT=S.adhT||{};
  const tile=(l,v,sub,c)=>`<div class="card stat"><div class="lbl">${l}</div><b style="color:${c||'inherit'}">${v}</b><span class="small muted">${sub}</span></div>`;
  return `<div class="grid4">${tile('Overall this stay',AT.o||'94%','Ward adherence','var(--green)')}${tile('Doses given',AT.g||'17 <span style="font-size:16px;color:var(--muted)">/ 18</span>','Last 6 days')}${tile('Refused or held',AT.r||'2',AT.rs||'1 refused · 1 held','var(--red)')}${tile('On time',AT.t||'89%','Within the round window','var(--amber)')}</div>
  <section class="card"><div class="hd"><h3>Adherence by medicine</h3><span class="small" style="color:var(--blue-ink)">This stay</span></div><div style="padding:6px 20px 18px">${M.map(m=>`<div style="padding:10px 0"><div class="row" style="justify-content:space-between"><span><strong>${m[0]}</strong> <span class="muted small">· ${m[1]}</span></span>${m[2]===null?'<span class="small muted">As needed</span>':`<strong style="color:${m[2]<90?'var(--amber)':'var(--green)'}">${m[2]}%</strong>`}</div>${m[2]===null?'':`<div class="adhb" style="height:8px;margin-top:8px"><i style="width:${m[2]}%;background:${m[2]<90?'#e0a43a':'#22a05a'}"></i></div>`}</div>`).join('')}</div></section>`;
}
function vChartsCard(){const VC=S.vc||{sys:[138,134,130,128,126,124],dia:[88,86,84,82,80,80],pulse:[104,98,96,92,90,88],sugar:[162,170,184,184,176,192],sleep:[3,4,3.5,5,4,6.5],adh:[100,100,86,100,100,100],wt:[72.4,72.3,72.1,72,71.8,71.8],wlo:70,whi:74};
  return `<section class="card"><div class="hd"><div><h3>Trends this stay</h3><div class="small muted" style="margin-top:4px">From nurses' entries · green band is the target range</div></div>${chip('Last 6 days','c-grey')}</div>
  <div class="chartgrid">
    ${lineChart('Blood pressure','mmHg',[{n:'Systolic',c:'#1e6cdb',v:VC.sys},{n:'Diastolic',c:'#5b3fb5',v:VC.dia}],60,160,[60,130])}
    ${lineChart('Pulse','bpm',[{n:'Pulse',c:'#b42318',v:VC.pulse}],60,120,[60,100])}
    ${lineChart('Blood sugar, after lunch','mg/dL',[{n:'After lunch',c:'#92500a',v:VC.sugar}],80,220,[80,180])}
    ${barChart('Sleep','h',VC.sleep,9)}
    ${barChart('Medicine adherence','%',VC.adh,100)}
    ${lineChart('Weight','kg',[{n:'Weight',c:'#11703a',v:VC.wt}],VC.wlo,VC.whi)}
  </div></section>`;
}
const MAR_ST={};
function marCell(mi,d,k){const key=(S.pid||'neel')+':'+mi+'-'+d+'-'+k;if(MAR_ST[key])return MAR_ST[key];if(d===6)return '';if(k==='SOS')return d<2?'G':'';if(mi===1&&d===2)return 'R';if(mi===0&&d===0&&k==='M')return 'H';return 'G';}
const MAR_WHO={};
function marTap(mi,k){const key=(S.pid||'neel')+':'+mi+'-6-'+k;const c=MAR_ST[key]||'';MAR_ST[key]=c===''?'G':c==='G'?'R':c==='R'?'H':'';
  if(MAR_ST[key]){const m=__me0();MAR_WHO[key]={ini:m.ini||ini(m.name),by:m.name,at:clock()};}else delete MAR_WHO[key];render();}
function medChartModal(){const nm=location.hash.includes('rounds')?(()=>{const R=S.rounds,WP=WARDS[R.ward];return WP[Math.min(R.idx[R.ward],WP.length-1)].name})():'Neel Bose';
  openModal(`<div class="mh"><h3>Medication chart · ${nm}</h3><button class="x" aria-label="Close" onclick="closeModal()">×</button></div><div class="mb" style="padding:0">${marCard().replace('<section class="card">','<section>')}</div>`);$('modal').style.width='min(1400px,100%)';}
/* ---- medication chart: every medicine (ongoing and stopped), one column per day from admission (Day 1) to today ----
   Each box: ✓ given / R refused / H held, with the nurse's initials; empty before the start, grey after the stop. */
const ADM_DAY=new Date(2026,9,18);
const MAR_NURSE={SR:'Sister Rekha',BJ:'Brother Joseph',SA:'Sister Anita'};
const SLOT_H={M:8,A:14,N:21,SOS:12};
const marDLab=d=>d.toLocaleDateString('en-IN',{day:'numeric',month:'short'});
function marDays(){const out=[],t=marDay('Today');for(let d=new Date(S.admD||ADM_DAY);d<=t;d.setDate(d.getDate()+1))out.push(new Date(d));return out;}
function atDT(at){const m=String(at||'').match(/(\d{1,2}) ([A-Z][a-z]{2})(?: (\d{4}))?(?:,\s*(\d{1,2}):(\d{2})\s*(am|pm))?/i);if(!m)return null;
  let h=+(m[4]||0);if(m[6]){const pm=/pm/i.test(m[6]);if(pm&&h<12)h+=12;if(!pm&&h===12)h=0;}return new Date(+(m[3]||2026),MON3.indexOf(m[2])/3,+m[1],h,+(m[5]||0));}
const marHash=s=>{let h=0;for(const c of s)h=(h*31+c.charCodeAt(0))>>>0;return h;};
function marStat(m,day,k,di,isToday){
  const st=atDT(m.at),sp=m.offAt?atDT(m.offAt):null,slot=new Date(day);
  if(k==='SOS')slot.setHours(23,59,0,0);else slot.setHours(SLOT_H[k],0,0,0);
  if(st&&slot<st)return {st:'pre'};
  if(sp&&slot>sp)return {st:'off'};
  if(m.snap&&m.snap[di+'|'+k])return m.snap[di+'|'+k];
  const act=S.meds.filter(x=>!x.name.includes('waiting')),mi=act.indexOf(m);
  if(isToday){if(mi<0)return {st:''};const key=(S.pid||'neel')+':'+mi+'-6-'+k,w=MAR_WHO[key];return {st:MAR_ST[key]||'',ini:w?w.ini:'',by:w?w.by:'',at:w?w.at:''};}
  const lbl=marDLab(day),d6=DAYS6.indexOf(lbl),ini=k==='N'?'SR':(day.getDate()%2?'BJ':'SA');
  let s;
  if(d6>=0&&mi>=0)s=marCell(mi,d6,k);
  else{const h=marHash(m.name+'|'+lbl+'|'+k);s=k==='SOS'?(h%4===0?'G':''):(h%19===0?'R':h%29===0?'H':'G');}
  return {st:s,ini:s?ini:'',by:s?MAR_NURSE[ini]:'',at:s?(k==='SOS'?'':MAR_TIME[k])+(k==='SOS'?'':', ')+lbl:''};
}
function marSnap(m){const days=marDays(),snap={},today=days.length-1;days.forEach((day,di)=>MAR_SLOTS(m.freq).forEach(k=>{const r=marStat(m,day,k,di,di===today);if(r.st&&r.st!=='pre')snap[di+'|'+k]=r;}));return snap;}
function marCard(){
  const days=marDays(),ti=days.length-1,act=S.meds.filter(m=>!m.name.includes('waiting')),off=S.medsOff||[];
  const T={M:'8 am',A:'2 pm',N:'9 pm',SOS:'SOS'},W={G:'Given',R:'Refused',H:'Held'};
  const short=at=>String(at||'').replace(/ 20\d\d/,'');
  const box=(m,day,k,di,on)=>{const isT=di===ti,r=marStat(m,day,k,di,isT),mi=act.indexOf(m),tc=isT?' mtoday':'';
    if(r.st==='pre')return `<td class="mday${tc}"></td>`;
    if(r.st==='off'){const first=!(di>0&&marStat(m,days[di-1],k,di-1,di-1===ti).st==='off');return `<td class="mday moffc${first?' mfirst':''}${tc}" title="Stopped"></td>`;}
    const cls=r.st==='G'?'mg':r.st==='R'?'mr':r.st==='H'?'mh':'me',lab=r.st==='G'?'✓':r.st||(isT&&isWard()&&on?'+':'');
    const tip=r.st?`${W[r.st]} · ${r.by||MAR_NURSE[r.ini]||''}${r.at?' · '+r.at:''}`:(isT&&isWard()&&on?'Tap to log this dose':'');
    const inner=`${lab}${r.st&&r.ini?'<span>'+r.ini+'</span>':''}`;
    return `<td class="mday${tc}">${isT&&isWard()&&on&&mi>=0?`<button class="mc ${cls}" title="${hesc(tip)}" onclick="marTap(${mi},'${k}')" aria-label="Log dose">${inner}</button>`:(r.st?`<span class="mc ${cls}" title="${hesc(tip)}">${inner}</span>`:'')}</td>`;};
  const medCell=(m,on,n)=>`<td rowspan="${n}" class="mmed${on?'':' moffm'}"><div class="mm-n">${hesc(m.name)}</div><div class="mm-f">${hesc(m.freq)}${m.time?' · '+hesc(m.time):''}</div>
    <div class="mm-l">Started ${hesc(short(m.at)||'not recorded')} · ${hesc(m.by||'doctor not recorded')}</div>
    ${on?'<div class="mm-l mm-on">Ongoing</div>':`<div class="mm-l mm-s">Stopped ${hesc(short(m.offAt))} · ${hesc(m.offBy||'')}</div><div class="mm-l mm-s">Reason: ${hesc(m.why||'not given')}</div>`}</td>`;
  let rows='';
  act.map(m=>[m,true]).concat(off.map(m=>[m,false])).forEach(([m,on])=>{const ks=MAR_SLOTS(m.freq);
    ks.forEach((k,ki)=>{rows+=`<tr class="${ki===ks.length-1?'mlast':''}">${ki===0?medCell(m,on,ks.length):''}<td class="mtime">${T[k]}</td>${days.map((day,di)=>box(m,day,k,di,on)).join('')}</tr>`;});});
  const months=[];days.forEach(d=>{const l=d.toLocaleDateString('en-IN',{month:'short',year:'numeric'});if(months.length&&months[months.length-1][0]===l)months[months.length-1][1]++;else months.push([l,1]);});
  setTimeout(marToEnd,0);
  return `<section class="card mchart"><div class="hd"><div><h3>Medicine chart</h3><div class="small muted" style="margin-top:4px">${isWard()?'Tap today\'s box at each round: ✓ given, then R refused, then H held.':'Every medicine this stay, from Day 1 to today.'} Scroll sideways for earlier days; the medicine column stays in place.</div></div>
    <div class="row" style="gap:8px"><button class="btn sm" onclick="marJump(0)">‹ Day 1</button><button class="btn sm" onclick="marJump(1)">Today ›</button></div></div>
    <div class="scroll mscroll" id="marScroll"><table class="mar4"><thead>
      <tr><th class="mmed" rowspan="2">Medicine</th><th class="mtime" rowspan="2">Time</th>${months.map(([l,n])=>`<th class="mmon" colspan="${n}"><span>${l}</span></th>`).join('')}</tr>
      <tr>${days.map((d,i)=>`<th class="mday${i===ti?' mtoday':''}" title="Day ${i+1} · ${marDLab(d)}">${i===ti?'Today':d.getDate()}</th>`).join('')}</tr>
    </thead><tbody>${rows}</tbody></table></div>
    <div class="pad tiny muted mleg"><span><span class="mc mg sm">✓</span> Given</span><span><span class="mc mr sm">R</span> Refused</span><span><span class="mc mh sm">H</span> Held</span><span><i class="moff-key"></i> Stopped</span><span>Initials = nurse who logged it (hover for name and time): SR Sister Rekha · BJ Brother Joseph · SA Sister Anita</span><span>Prototype: 24 Oct to 1 Nov are demo data</span></div></section>`;
}
function marToEnd(){document.querySelectorAll('#marScroll').forEach(el=>{el.scrollLeft=el.scrollWidth;});}
function marJump(toEnd){document.querySelectorAll('#marScroll').forEach(el=>{el.scrollTo({left:toEnd?el.scrollWidth:0,behavior:'smooth'});});}
const SUGAR=[['23 Oct',104,168,192,146],['22 Oct',98,154,176,138],['21 Oct',110,172,184,150],['20 Oct',96,148,162,132]];
const SUGAR_BY=['Brother Joseph (day) · Sister Rekha (night)','Sister Anita (day) · Sister Rekha (night)','Brother Joseph (day) · Sister Rekha (night)','Sister Anita (day) · Sister Rekha (night)'];
function nursingSummary(full){
  return `<section class="card"><div class="hd"><div><h3>Nursing summary</h3><div class="small muted" style="margin-top:4px">From the nurses' shift handover · Night shift, Sister Rekha · 24 Oct, 7:00 am</div></div>${full?'':`<button class="btn sm" onclick="go('#/patient/neel/vitals')">All vitals and monitoring</button>`}</div>
    <div class="pad" style="display:flex;flex-direction:column;gap:12px">
      <div class="note small">${S.nsum?S.nsum.note:`Slept about 6.5 hours, woke once at 3 am and settled without SOS medicine. Took night doses. BP 124/80, pulse 88. Bedtime sugar 146 mg/dL. Ate full dinner. Calm, no aggression; checks every 15 minutes continued.`}</div>
      <div class="row" style="gap:8px;flex-wrap:wrap">${S.nsum?S.nsum.chips.map(c=>chip(c[0],c[1])).join(''):chip('BP 124/80','c-grey')+chip('Pulse 88','c-grey')+chip('SpO2 98%','c-grey')+chip('Sugar 146 bedtime','c-grey')+chip('After-lunch sugar 192 yesterday','c-amber')+chip('Doses: all given','c-green')+chip('Sleep 6.5 h','c-green')}</div>
      ${full?`<div class="tiny muted">${S.nsum?S.nsum.earlier:`Earlier shifts: Day shift 23 Oct (Brother Joseph): refused morning olanzapine once, took it after counselling; mild tremor noted. Evening shift 23 Oct (Sister Anita): joined group, phone call with sister for 10 minutes.`}</div>`:''}
    </div></section>`;
}
function sugarModal(){openModal(`<div class="mh"><h3>Add sugar reading</h3><button class="x" aria-label="Close" onclick="closeModal()">×</button></div>
 <div class="mb"><div class="grid2"><label class="field"><span class="lbl">When</span><select class="input" id="sgW"><option>Fasting</option><option>After breakfast</option><option>After lunch</option><option>Bedtime</option><option>Random</option></select></label><label class="field"><span class="lbl">Reading (mg/dL)</span><input class="input" id="sgV" inputmode="numeric" value="102"></label></div>
 <div class="tiny muted">Saved as entered by ${hesc(signer())}, with today's date and time.</div></div>
 <div class="mf"><button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="const v=$('sgV').value.trim();if(!/^\\d{2,3}$/.test(v)){toast('Enter the reading in mg/dL');return;}const w=whoAt();S.sugarNew=S.sugarNew||[];S.sugarNew.unshift({when:$('sgW').value,v,by:w.by,at:w.at});closeModal();render();toast('Reading saved by '+w.by)">Save</button></div>`);}
function vitalsModal(){openModal(`<div class="mh"><h3>Add vitals · today</h3><button class="x" aria-label="Close" onclick="closeModal()">×</button></div>
 <div class="mb"><div class="grid2">${[['BP','124/80'],['Pulse','86'],['Temp (°F)','98.6'],['SpO2 (%)','98'],['Weight (kg)',''],['Sleep (h)','6.5']].map(f=>`<label class="field"><span class="lbl">${f[0]}</span><input class="input" value="${f[1]}"></label>`).join('')}</div></div>
 <div class="mf"><button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="closeModal();toast('Vitals saved; trends updated')">Save</button></div>`);}
const DIET_CARD=()=>`<section class="card pad" style="display:flex;flex-direction:column;gap:8px"><h3>Diet</h3><div class="small muted">Psychologist or psychiatrist updates it; the kitchen and the ward see it.</div>
        <div class="radios">${['Vegetarian','Non-vegetarian','Eggetarian','Jain','Vegan'].map(o=>`<button class="tog ${S.diet.type===o?'on':''}" onclick="S.diet.type='${o}';render()">${o}</button>`).join('')}</div>
        <label class="field"><span class="lbl">Allergies or foods to avoid</span><input class="input" value="${S.diet.avoid}" oninput="S.diet.avoid=this.value"></label>
        <label class="field"><span class="lbl">Likes, dislikes, fasting days</span><input class="input" value="${S.diet.notes}" oninput="S.diet.notes=this.value"></label>
        <button class="btn sm" style="align-self:flex-start" onclick="toast('Diet saved; kitchen and ward notified')">Save diet</button></section>`;
const ALLOW_CARD=()=>`<section class="card pad" style="display:flex;flex-direction:column;gap:8px"><h3>Allowances during the stay</h3><div class="small muted">Set by the treating team, logged by nurses, visible to the family.</div>
        <label class="field"><span class="lbl">Phone calls (hospital phone)</span><select class="input"><option>2 a day, 10 minutes</option><option>1 a day</option><option>On request only</option></select></label>
        <label class="field"><span class="lbl">Visits</span><select class="input"><option>Family, weekends</option><option>Not yet</option></select></label></section>`;
function pPrefs(){
  const vis=(...w)=>`<span class="row" style="gap:4px">${w.map(x=>chip(x,'c-grey')).join('')}</span>`;
  const sel=(l,opts)=>`<label class="field"><span class="lbl">${l}</span><select class="input">${opts.map(o=>`<option>${o}</option>`).join('')}</select></label>`;
  const inp=(l,v,ph)=>`<label class="field"><span class="lbl">${l}</span><input class="input" value="${v}" placeholder="${ph||''}"></label>`;
  return `<div class="callout blue">Management information from the clinical team for admin, front desk, nursing, kitchen and patient experience. Nothing clinical goes here; it shows in the admin portal under this patient.<br><strong>The psychologist fills it first, within 24 hours of admission.</strong> After that anyone on the treating team can update it, and each change is logged with their name.</div>
  <div class="ovgrid">
  ${DIET_CARD().replace('<h3>Diet</h3>','<div class="row" style="justify-content:space-between"><h3>Diet</h3>'+vis('Kitchen','Ward')+'</div>')}
  ${ALLOW_CARD().replace('<h3>Allowances during the stay</h3>','<div class="row" style="justify-content:space-between"><h3>Calls and visits</h3>'+vis('Front desk','Ward')+'</div>')}
  <section class="card pad" style="display:flex;flex-direction:column;gap:8px"><div class="row" style="justify-content:space-between"><h3>Approved visitors</h3>${vis('Front desk','Security')}</div>
    ${(S.contacts||[['Ananya Bose','Sister · nominated representative','Allowed','c-green'],['Rakesh Bose','Father','Allowed','c-green'],['Kunal Arora','Friend','Not for now','c-grey']]).map(v=>`<div class="box row" style="justify-content:space-between"><span class="small"><strong>${v[0]}</strong><br><span class="muted">${v[1]}</span></span>${chip(v[2],v[3])}</div>`).join('')}
    <button class="btn sm" style="align-self:flex-start" onclick="toast('Visitor added; front desk notified')">Add visitor</button></section>
  <section class="card pad" style="display:flex;flex-direction:column;gap:8px"><div class="row" style="justify-content:space-between"><h3>Room and belongings</h3>${vis('Front desk','Housekeeping')}</div>
    ${sel('Room',['Keep in current room','Single room preferred','Shared room is fine','Move closer to the nursing station'])}
    ${sel('Roommate',['No restriction','Not with a high-risk roommate','Same age group preferred'])}
    ${sel('Belongings',['Belts, laces and sharps held at nursing station','Usual hospital rules','Phone kept with front desk'])}</section>
  <section class="card pad" style="display:flex;flex-direction:column;gap:8px"><div class="row" style="justify-content:space-between"><h3>Activities and outings</h3>${vis('Ward','Activity team')}</div>
    ${sel('Activities allowed',['Yoga, group therapy, indoor games','All activities','Ward only for now'])}
    ${sel('Gym and outdoor walks',['Supervised only','Allowed','Not yet'])}
    ${sel('Outings',['Not yet','With family, day outing','Approved by psychiatrist only'])}
</section>
  <section class="card pad" style="display:flex;flex-direction:column;gap:8px"><div class="row" style="justify-content:space-between"><h3>Communication with family</h3>${vis('Patient experience','Billing')}</div>
    ${sel('Language for updates',['Hindi','English','Bengali'])}
    ${inp('Clinical updates go to','Ananya Bose (sister) only')}
    ${inp('Billing and payments contact',S.billing||'Rakesh Bose (father)')}
    ${inp('Do not share information with','','e.g. extended family, employer')}</section>
  <section class="card pad" style="display:flex;flex-direction:column;gap:8px"><div class="row" style="justify-content:space-between"><h3>Other requests</h3>${vis('Admin','Ward')}</div>
    ${inp('Religious or cultural needs','Fasts on Tuesdays')}
    ${inp('Routine','Wakes early; likes newspaper in the morning')}
    ${inp('Anything else for admin','','e.g. needs help with insurance forms')}</section>
  </div>
  <div class="row" style="justify-content:flex-end;gap:8px"><span class="tiny muted">First filled by Priya Nair · 19 Oct · last updated by Dr. Aanya Sharma · 23 Oct</span><button class="btn pri" onclick="toast('Preferences saved; admin portal updated')">Save and send to admin</button></div>`;
}
function pGriev(){
  return `<section class="card"><div class="hd"><div><h3>Grievances · Neel Bose</h3><div class="small muted" style="margin-top:4px">Complaints from the patient or family, or about services. They go to the patient experience team with a 6-hour clock, and the treating psychiatrist and psychologist get an alert and a task on their Inpatient dashboard.</div></div><button class="btn sm pri" onclick="pgModal()">Log grievance</button></div>
    ${S.pgriev.map(g=>`<div class="li"><div class="grow"><div style="font-weight:600">${g.from}: ${g.t}</div><div class="tiny muted">${g.via} · assigned to ${g.own}</div>${byl(g.by,g.at,'Logged by')}${g.doneBy?byl(g.doneBy,g.doneAt,'Resolved by'):''}</div>${g.st==='Open'?chip(g.sla,'c-amber'):chip(g.st,'c-green')}</div>`).join('')}</section>`;
}
function pgModal(){openModal(`<div class="mh"><h3>Log grievance</h3><button class="x" aria-label="Close" onclick="closeModal()">×</button></div>
 <div class="mb"><div class="grid2"><label class="field"><span class="lbl">Raised by</span><select class="input" id="gf"><option>Family</option><option>Patient</option><option>Staff, about the family</option></select></label>
 <label class="field"><span class="lbl">About</span><select class="input" id="ga"><option>Food and diet</option><option>Room and facilities</option><option>Communication and updates</option><option>Staff behaviour</option><option>Billing</option><option>Family conduct on visits</option></select></label></div>
 <label class="field"><span class="lbl">What happened</span><textarea class="input" id="gt"></textarea></label>
 <div id="gErr" class="small" style="color:var(--red);display:none">Describe what happened</div></div>
 <div class="mf"><button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="if(!$('gt').value.trim()){$('gErr').style.display='block';return;}S.pgriev.unshift({from:$('gf').value,t:$('gt').value.slice(0,60),via:$('ga').value,own:'Patient experience team',st:'Open',sla:'6 h left',...whoAt()});closeModal();render();toast('Logged; patient experience team and the treating psychiatrist and psychologist alerted')">Log</button></div>`);}
function pDischarge(){
  const D=S.discharge; const all=Object.values(D).every(Boolean);
  const ck=(k,t,sub,act)=>`<label class="check"><input type="checkbox" ${D[k]?'checked':''} onchange="S.discharge['${k}']=this.checked;S.dcBy=S.dcBy||{};if(this.checked)S.dcBy['${k}']=whoAt();else delete S.dcBy['${k}'];render()"><span class="grow"><span style="font-weight:600">${t}</span><br><span class="tiny muted">${sub}</span>${D[k]&&(S.dcBy||{})[k]?byl(S.dcBy[k].by,S.dcBy[k].at,'Ticked by'):''}</span>${act||''}</label>`;
  if(S.discharged) return `<section class="card pad" style="display:flex;flex-direction:column;gap:12px"><h3>Discharged · stay file closed ${chip('Read only','c-grey')}</h3>
    <div class="muted">The discharge summary is filed in Care Management, next to the summary from Admission 1. 7-day call and 30/60/90 day check-ins are created there and in the patient app, with reminders on. The bed is released to the front desk.</div>
    <div class="callout grey">Every form, note, plan, order, medicine record, vital and grievance from this stay is now one read-only stay file. Medical records holds it in the admin portal; doctors open it from Care Management. If Neel is admitted again, this stay shows under Previous admissions. Retention period to be confirmed with Sanchita.</div>
    <div class="row"><button class="btn pri" onclick="go('#/existing/Care Management')">Open Care Management</button><button class="btn" onclick="toast('Complete stay file downloaded as one PDF')">Download stay file</button></div></section>`;
  return `
  <section class="card pad row" style="justify-content:space-between">
    <div><div class="lbl">Expected discharge</div><div style="font-weight:600;margin-top:4px">${new Date(S.edd).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})} · ${S.eddShared?'shared with family':'not shared with family yet'}</div><div class="small muted">Set on Stay summary. Discharge briefing with the family is booked for the day before.</div></div>
    <div class="row" style="gap:8px">${chip('Length of stay: 6 days so far','c-grey')}${chip('Follow-up after 7 days','c-blue')}</div>
  </section>
  <div class="split">
    <section class="card wide"><div class="hd"><div><h3>Discharge summary</h3><div class="small muted" style="margin-top:4px">Psychologist or psychiatrist drafts it from the stay; only a psychiatrist signs</div></div>${S.dischargeDrafted?chip('Draft by '+S.draftBy,'c-blue'):`<button class="btn pri sm" onclick="S.dischargeDrafted=true;S.draftBy=signer();render();toast(isPsy()?'Summary drafted from notes, plans and orders':'Draft saved and sent to '+S.team.psy+' to sign')">Draft summary</button>`}</div>
      ${S.dischargeDrafted?`<div class="pad" style="display:flex;flex-direction:column;gap:12px">
        ${[['Admitting diagnosis (provisional)','Bipolar affective disorder, current episode manic'],['Discharge diagnosis',S.dx],['History and complaints','From the detailed history, 21 Oct'],['Allergy','No known allergies'],['Examination, physical and MSE','From the admission workup and last re-assessment'],['Intervention during stay (medical and psychological)','Lithium and olanzapine; 6 group sessions, 3 individual sessions, 1 family session'],['Condition at the time of discharge','From the last daily note and capacity assessment'],['Treatment advice on discharge','Continue medicines below; relapse signs agreed with family'],['Suggestions','Follow-up advised after 7 days']].map(r=>`<label class="field"><span class="lbl">${r[0]}</span><textarea class="input" style="min-height:48px">${r[1]}</textarea></label>`).join('')}
        <div class="lbl">Rx (from current orders)</div><div class="scroll"><table class="t"><thead><tr><th>No.</th><th>Drug</th><th>Dose</th><th>Duration</th></tr></thead><tbody>${S.meds.map((m,i)=>`<tr><td>${i+1}</td><td style="font-weight:600">${m.name}</td><td>${m.freq} · ${m.time}</td><td>${m.range.includes('Nov')?'30 days':'Till review'}</td></tr>`).join('')}</tbody></table></div>
        <div class="lbl">Treating team</div><table class="t"><thead><tr><th>Role</th><th>Treating team</th><th>Date</th><th>Day</th></tr></thead><tbody><tr><td>Psychiatrist</td><td>${S.team.psy}</td><td>2 Nov 2026</td><td>Day 15</td></tr><tr><td>Psychologist</td><td>${S.team.psych}</td><td>2 Nov 2026</td><td>Day 15</td></tr></tbody></table></div>`:`<div class="pad small muted">Nothing to type from scratch: diagnosis, history, interventions and medicines come from the stay's records.</div>`}
    </section>
    <section class="card narrow"><div class="hd"><h3>Discharge checklist</h3></div><div class="pad">
      <label class="field" style="margin-bottom:10px"><span class="lbl">Discharge type</span><select class="input" onchange="S.dtype=this.value;render()">${['Planned','Against medical advice (LAMA)','Transfer to another hospital','Absconded'].map(o=>`<option ${S.dtype===o?'selected':''}>${o}</option>`).join('')}</select></label>
      ${S.dtype==='Against medical advice (LAMA)'?`<div class="callout amber" style="margin-bottom:10px;display:flex;flex-direction:column;gap:8px"><strong>Self discharge against medical advice</strong><span class="tiny">The doctor confirms the patient declines the proposed treatment and has been told the risks and alternatives clearly.</span><label class="field"><span class="lbl">State of mental health</span><textarea class="input" style="min-height:48px"></textarea></label><label class="field"><span class="lbl">Treatment proposed by the doctor</span><textarea class="input" style="min-height:48px"></textarea></label><label class="field"><span class="lbl">Medical risks of leaving early</span><textarea class="input" style="min-height:48px"></textarea></label><span class="tiny">Signed by the doctor with date and time. The form has no line for the patient or a witness; Sanchita to confirm before build.</span></div>`:''}
      ${ck('capacity','Capacity status recorded','Latest assessment within the last week')}
      ${ck('risk','Risk reviewed for discharge','Risk screen updated; safety plan shared with family')}
      ${ck('formC','Form C signed again by the patient','Request for independent admission · legal safeguard before discharge',`<button class="btn sm" onclick="event.preventDefault();S.discharge.formC=true;S.dcBy=S.dcBy||{};S.dcBy.formC={by:'Meena Arora, front desk (requested by '+signer()+')',at:atNow()};render();toast('Front desk took Form C on the tablet')">Request</button>`)}
      ${ck('summary','Summary reviewed','Both clinicians')}
      ${ck('meds','Discharge medicines confirmed','Go to the patient app with reminders on')}
      ${ck('followups','Follow-ups booked','7-day call, 30/60/90 day check-ins')}
      ${ck('family','Family briefed','Discharge briefing done')}
      ${ck('dconsent','Discharge consent signed','Patient and guardian, at the front desk: follow-up instructions accepted, all belongings taken')}
      <div class="small muted" style="margin-top:10px">Belongings, bill clearance and bed release are done by the front desk.</div>
      <label class="field" style="margin-top:12px"><span class="lbl">Signing psychiatrist</span><select class="input" ${isPsy()?'':'disabled'} onchange="S.signer=this.value;render()">${[S.team.psy+' · treating',...['Dr. Rohan Mehta','Dr. Kunal Sethi','Dr. Nandini Rao · floor lead'].filter(x=>!x.startsWith(S.team.psy)).map(x=>x+' · covering')].map(o=>`<option ${S.signer===o?'selected':''}>${o}</option>`).join('')}</select></label>
      <div class="tiny muted" style="margin-top:4px">If the treating psychiatrist is off duty, another psychiatrist or the floor lead signs. The summary records who signed and that they covered.</div>
      ${isPsy()?'':`<div class="callout grey" style="margin-top:10px">Psychologists draft the summary; a psychiatrist signs it. ${S.dischargeDrafted?'Your draft is with '+S.team.psy+'; the floor lead sees it if they are off duty.':''}</div>`}
      <button class="btn pri" style="width:100%;margin-top:12px" ${all&&S.dischargeDrafted&&isPsy()?'':'disabled'} onclick="S.discharged=true;go('#/existing/Care Management');toast('Discharged. Inpatient stay tab closed; summary moved to Care Management.')">Sign and discharge</button>
      ${!(all&&S.dischargeDrafted)?'<div class="tiny muted" style="margin-top:6px">Unlocks when the summary is drafted and every item is ticked.</div>':''}
    </div></section>
  </div>`;
}
function notifModal(){openModal(`<div class="mh"><h3>Notifications</h3><button class="x" aria-label="Close" onclick="closeModal()">×</button></div>
 <div class="mb" style="gap:0;padding:6px 0">
 ${[['Grievance raised · Neel Bose','Family: updates feel repetitive · patient experience team has it','#/patient/neel/griev','10:58'],['Rohit Kapoor admitted to Suite 201','Admission workup and 24-hour call added to Inpatient dashboard','#/myday','10:42'],['Detailed history overdue · Neel Bose','72-hour deadline passed yesterday','#/patient/neel/admission','Yesterday'],['Dev Kumar discharge summary drafted','Review and sign','#/patient/neel/discharge','09:15'],['Clozapine consent signed by family','Order released to the ward','#/patient/neel/orders','Mon']].map(n=>`<div class="li"><div class="grow"><div style="font-weight:600">${n[0]}</div><div class="tiny muted">${n[1]} · ${n[3]}</div></div><button class="btn sm" onclick="closeModal();go('${n[2]}')">Open</button></div>`).join('')}</div>`);}
function rxWarn(r){
  const ap=['Quetiapine','Olanzapine','Risperidone','Aripiprazole','Clozapine'];
  const isAp=ap.some(a=>r.name.startsWith(a));
  const cur=S.meds.find(m=>ap.some(a=>m.name.startsWith(a))&&!m.name.startsWith(r.name.split(' ')[0]));
  return isAp&&cur?`<div class="tiny" style="color:var(--amber)">Already on ${cur.name.split(' · ')[0]}: two antipsychotics, confirm this is intended</div>`:'';
}
function labModal(){openModal(`<div class="mh"><h3>Order lab tests</h3><button class="x" aria-label="Close" onclick="closeModal()">×</button></div>
 <div class="mb"><div class="field"><span class="lbl">Tests</span><div class="radios" id="labs">${['Serum lithium','Valproate level','CBC','LFT','KFT','TFT','Lipid profile','Fasting glucose','ECG'].map(t=>`<button class="tog" onclick="this.classList.toggle('on')">${t}</button>`).join('')}</div></div>
 <label class="field"><span class="lbl">When</span><select class="input" id="labw"><option>Tomorrow, 7:00 (fasting)</option><option>Today</option><option>Weekly, Mondays</option></select></label>
 <div class="callout grey">Results come back through the live lab upload and file into Records automatically.</div></div>
 <div class="mf"><button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="const t=[...document.querySelectorAll('#labs .on')].map(b=>b.textContent);if(!t.length){toast('Pick at least one test');return;}t.forEach(x=>S.labs.push({t:x,d:document.getElementById('labw').value,st:'Ordered',...whoAt()}));closeModal();render();toast(t.length+' test'+(t.length>1?'s':'')+' ordered by '+signer())">Order</button></div>`);}
function restraintModal(){openModal(`<div class="mh"><h3>Authorise restraint</h3><button class="x" aria-label="Close" onclick="closeModal()">×</button></div>
 <div class="mb"><div class="callout amber">Only when there is an immediate risk of harm and other ways have failed. Rules on seclusion to be confirmed with Sanchita before build.</div>
 <label class="field"><span class="lbl">Reason</span><select class="input" id="rr"><option>Immediate risk of harm to self</option><option>Immediate risk of harm to others</option></select></label>
 <div class="field"><span class="lbl">Tried first</span><div class="radios">${['Talking down','Medication offered','1:1 observation','Quiet room'].map(t=>`<button class="tog" onclick="this.classList.toggle('on')">${t}</button>`).join('')}</div></div>
 <label class="field"><span class="lbl">Review by</span><select class="input" id="rv"><option>30 minutes</option><option>1 hour</option></select></label>
 <div class="callout grey">Nurses log the start, checks and end on the ward. The nominated representative is told within 24 hours, and the entry goes into the monthly Mental Health Review Board report.</div></div>
 <div class="mf"><button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="S.restraints.push({when:atNow(),reason:document.getElementById('rr').value,by:signer(),review:'in '+document.getElementById('rv').value});closeModal();render();toast('Authorised by '+signer()+'. Ward and nominated representative notified.')">Authorise</button></div>`);}
/* ---- Transfer patient (treating team): psychiatrist or psychologist hands the patient to a colleague with transfer notes ---- */
const TR_TO={psy:['Dr. Rohan Mehta','Dr. Kunal Sethi','Dr. Nandini Rao','Dr. Aanya Sharma'],psych:['Kiran Mehra','Surabhi Sengar','Priya Nair']};
const TR_ROLE={psy:'Psychiatrist',psych:'Psychologist'};
function trStamp(){const d=new Date();return d.toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})+', '+d.toLocaleTimeString('en-IN',{hour:'numeric',minute:'2-digit'});}
function trOpts(r){return TR_TO[r].filter(n=>n!==S.team[r]).map(n=>`<option>${n}</option>`).join('');}
function trPending(){return dueItems().map(d=>d[0]+' · '+d[1]).join('\n');}
function transferModal(){const r=isPsych()?'psych':'psy';
  openModal(`<div class="mh"><h3>Transfer patient · Neel Bose</h3><button class="x" aria-label="Close" onclick="closeModal()">×</button></div>
 <div class="mb"><div class="grid2"><label class="field"><span class="lbl">Transferring</span><select class="input" id="tr" onchange="$('tf').value=S.team[this.value];$('tt').innerHTML=trOpts(this.value)"><option value="psy" ${r==='psy'?'selected':''}>Psychiatrist</option><option value="psych" ${r==='psych'?'selected':''}>Psychologist</option></select></label>
 <label class="field"><span class="lbl">From</span><input class="input" id="tf" value="${S.team[r]}" disabled></label></div>
 <div class="grid2"><label class="field"><span class="lbl">Transfer to</span><select class="input" id="tt">${trOpts(r)}</select></label>
 <label class="field"><span class="lbl">From when</span><select class="input" id="te"><option>Today</option><option>From tomorrow's rounds</option></select></label></div>
 <label class="field"><span class="lbl">Reason</span><select class="input" id="trs"><option>Workload</option><option>Clinician leaving Tulasi</option><option>Clinician on leave</option><option>Patient or family request</option><option>Clinical fit</option><option>Change of floor</option></select></label>
 <div class="lbl" style="margin-top:4px">Transfer notes</div>
 <label class="field"><span class="lbl">Current status and plan (required)</span><textarea class="input" id="th" rows="3" placeholder="Diagnosis, where treatment stands, current plan and response"></textarea></label>
 <label class="field"><span class="lbl">Pending work carried over</span><textarea class="input" id="tpw" rows="3">${hesc(trPending())}</textarea></label>
 <label class="field"><span class="lbl">Risks and what to watch for</span><textarea class="input" id="trk" rows="2" placeholder="Risk, observation level, family concerns, anything sensitive"></textarea></label>
 <label class="row small" style="gap:8px"><input type="checkbox" id="tfam" checked> Tell the family who their new clinician is (WhatsApp from Tulasi's number)</label>
 <div class="callout grey">The new clinician gets Neel in their list with these notes and the pending work. Everything written so far stays under its author's name, date and time; new entries carry the new clinician's name. The floor lead is informed.</div>
 <div id="terr" class="small" style="color:var(--red);display:none">Write the current status and plan first</div></div>
 <div class="mf"><button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="doTransfer()">Transfer patient</button></div>`);}
function doTransfer(){
  if(!$('th').value.trim()){$('terr').style.display='block';$('th').focus();return;}
  const r=$('tr').value,to=$('tt').value,from=S.team[r];if(!to)return;
  S.trLog=S.trLog||[];
  S.trLog.unshift({role:r,from,to,eff:$('te').value,reason:$('trs').value,status:$('th').value.trim(),pending:$('tpw').value.trim(),risk:$('trk').value.trim(),fam:$('tfam').checked,by:signer(),at:trStamp()});
  S.team[r]=to;closeModal();render();
  toast(`Transferred to ${to}. Transfer notes sent; floor lead informed${S.trLog[0].fam?'; family told on WhatsApp':''}.`);}
function trHist(){const L=S.trLog||[];if(!L.length)return '';
  return `<details class="trhist" open><summary><b>Transfers · ${L.length}</b> <span class="tiny muted">Earlier entries stay under each author's name</span></summary>${L.map(t=>`<div class="tritem">
    <div class="row" style="justify-content:space-between;gap:8px;flex-wrap:wrap"><span><b>${TR_ROLE[t.role]}: ${hesc(t.from)} → ${hesc(t.to)}</b> <span class="small muted">· ${hesc(t.reason)} · ${hesc(t.eff.toLowerCase())}</span></span><span class="tiny muted">${hesc(t.at)} · by ${hesc(t.by)}</span></div>
    <div class="small"><span class="muted">Status and plan:</span> ${hesc(t.status)}</div>
    ${t.pending?`<div class="small"><span class="muted">Pending work:</span> ${hesc(t.pending).replace(/\n/g,'; ')}</div>`:''}
    ${t.risk?`<div class="small"><span class="muted">Watch for:</span> ${hesc(t.risk)}</div>`:''}
    <div class="tiny muted">${t.fam?'Family told on WhatsApp':'Family not told yet'} · floor lead informed</div></div>`).join('')}</details>`;}

/* ---------- existing ---------- */
function vCare(){
  $('title').textContent='Patients';
  return `<nav class="small muted"><a href="#/patient/neel/overview">Neel Bose</a> / <strong style="color:var(--ink)">Care Management</strong></nav>
  <section class="card pad row"><div class="grow"><h2>Care Management ${chip('Live today','c-green')}</h2><div class="small muted" style="margin-top:4px">The live tab, with one addition: discharge summaries and stay files listed by admission.</div></div>${S.discharged?'':`<button class="btn" onclick="go('#/patient/neel/overview')">Back to Inpatient stay</button>`}</section>
  <div class="split">
    <section class="card wide"><div class="hd"><h3>Discharge summaries ${chip('NEW: by admission','c-new')}</h3></div>
      ${S.discharged?'':`<div class="li"><div class="grow"><div style="font-weight:600">Admission ${S.admNo} · current stay</div><div class="tiny muted">In progress · summary is drafted at discharge</div></div>${chip('Inpatient now','c-blue')}<button class="btn sm" onclick="go('#/patient/neel/overview')">Open Inpatient stay</button></div>`}
      ${S.discharged?`<div class="li" style="background:#f3f8ff"><div class="grow"><div style="font-weight:600">Admission ${S.admNo} · 18 to 24 Oct 2026</div><div class="tiny muted">Discharged today · summary signed by ${S.team.psy}</div></div>${chip('Just discharged','c-green')}<button class="btn sm" onclick="toast('Opens the signed summary in the live viewer')">View summary</button><button class="btn sm" onclick="toast('Complete stay file downloaded')">Stay file</button></div>`:''}
      ${S.pastAdm.map((a,ai)=>`<div class="li"><div class="grow"><div style="font-weight:600">Admission ${a.n} · ${a.dates}</div><div class="tiny muted">${a.psy} · ${a.days} days</div></div><button class="btn sm" onclick="pastSummary(${ai})">View summary</button><button class="btn sm" onclick="pastFile(${ai})">Stay file</button></div>`).join('')}
      ${S.discharged?`<div class="pad"><div class="callout blue row" style="justify-content:space-between"><span>Prototype: try what happens when Neel comes back.</span><button class="btn sm pri" onclick="readmit()">Readmit Neel Bose</button></div></div>`:''}
    </section>
    <section class="card narrow"><div class="hd"><h3>Post-discharge check-ins ${chip('Live','c-green')}</h3></div>
      ${[['7-day call',S.discharged?'Created':'At discharge'],['30-day check-in',S.discharged?'Scheduled':'At discharge'],['60-day check-in',S.discharged?'Scheduled':'At discharge'],['90-day check-in',S.discharged?'Scheduled':'At discharge'],['Family check-in (FAM)','Live']].map(r=>`<div class="li"><span class="grow small" style="font-weight:600">${r[0]}</span>${chip(r[1],'c-grey')}</div>`).join('')}
    </section>
  </div>`;
}
/* ---- Dashboard: brought over from the main HMS prototype, per-role KPIs and sections ---- */
function vDashboard(){
  $('title').textContent='Dashboard';
  const r=S.role;
  const T=tasks(); const late=T.filter(t=>!S.done[t.id]&&t.late).length;
  const totW=Object.values(WARDS).reduce((a,w)=>a+w.length,0), seenW=Object.keys(WARDS).reduce((a,k)=>a+Math.min(S.rounds.idx[k],WARDS[k].length),0), roundsLeft=Math.max(totW-seenW,0);
  const notesDue=PTS.length-PTS.filter(p=>((S.eod||{})[p.id]||{}).saved).length;
  const openAct=pid=>`go('#/patient/${pid}/overview')`;
  const row=(name,text,pill,pid)=>`<div class="li"><div class="grow"><div style="font-weight:600">${name}</div><div class="small muted">${text}</div></div>${pill?chip(pill[0],pill[1]):''}${pid?`<button class="btn sm" onclick="${openAct(pid)}">Open</button>`:''}</div>`;
  const sec=(title,sub,body)=>`<section class="card"><div class="hd"><div><h3>${title}</h3>${sub?`<div class="small muted" style="margin-top:4px">${sub}</div>`:''}</div></div>${body}</section>`;
  const kpi=(label,val,sub,color,act)=>act?statTile('',false,act,label,`<div class="lbl">${label}</div><b${color?` style="color:${color}"`:''}>${val}</b><span class="small muted">${sub||''}</span>`):`<div class="card stat" style="cursor:default"><div class="lbl">${label}</div><b${color?` style="color:${color}"`:''}>${val}</b><span class="small muted">${sub||''}</span></div>`;
  let sub='',kpis='',sections='';
  if(r==='psychiatrist'){
    sub='Thursday 30 October · 8 inpatients under your care on the male ward';
    kpis=[kpi('My inpatients','8','2 on close observation'),
      kpi('Rounds left',String(roundsLeft),roundsLeft?'Next: '+WARDS['Male ward'][Math.min(S.rounds.idx['Male ward'],WARDS['Male ward'].length-1)].name:'All seen',roundsLeft?'':'var(--green)',"go('#/rounds')"),
      kpi('Daily notes due',String(notesDue),'Before 6 pm',notesDue?'':'var(--green)',"go('#/notes')"),
      kpi('Overdue tasks',String(late),'Across admissions, MHCA and discharges',late?'var(--amber)':'var(--green)')].join('');
    sections=sec('Tasks','Created from admissions, MHCA and discharges',[
        row('Neel Bose','Detailed history · 72-hour deadline passed yesterday 10:30 · with Priya Nair',['Overdue','c-red'],'neel'),
        row('Sameer Das','Capacity assessment, week 2 · weekly for 30 days under Section 89',['Overdue','c-red'],'sameer'),
        row('Rohit Kapoor','24-hour family call · Meera Kapoor, wife',['Due today','c-amber'],'rohit'),
        row('Dev Kumar','Discharge summary to sign · draft by Priya Nair',['Before 5 pm','c-amber'],'dev')
      ].join(''));
  } else if(r==='psychologist'){
    sub='Thursday 30 October · 5 inpatients under your care';
    kpis=[kpi('My inpatients','5',''),kpi('Sessions today','4','1 done'),
      kpi('Daily notes due',String(notesDue),'Before 6 pm',notesDue?'':'var(--green)',"go('#/notes')"),
      kpi('Assessments due','3','1 today','var(--amber)')].join('');
    sections=sec("Today's sessions",'',[
        row('Neel Bose','10:40 am · Brief supportive session',['Done','c-green'],'neel'),
        row('Arjun Mehta','11:30 am · CBT, behavioural activation before home leave',null,'arjun'),
        row('Karan Malhotra','3:00 pm · Family psychoeducation with parents',null,'karan'),
        row('Dev Kumar','4:00 pm · Relapse prevention before discharge',null,'dev')
      ].join(''))+
      sec('Assessments due','',[
        row('Karan Malhotra','PANSS re-assessment',['Today','c-amber'],'karan'),
        row('Neel Bose','Insight scale (SAI-E)',['Tomorrow','c-grey'],'neel'),
        row('Arjun Mehta','HAM-D re-assessment',['Monday','c-grey'],'arjun')
      ].join(''))+
      sec('Tasks','Created from admissions and family contact rules',[
        row('Neel Bose','Detailed history, your parts: personal and family history, premorbid personality',['Overdue','c-red'],'neel'),
        row('Tarun Roy',"Day 3 to 4 family call, Tarun Roy's father at 5 pm",['Due today','c-amber'],'tarun')
      ].join(''));
  } else if(r==='lead'){
    sub='Psychiatry lead · Male ward · Thursday 30 October';
    kpis=[kpi('Beds in use','22/30','All three wards'),kpi('Approvals waiting','2','Leave, transfers, countersigns','var(--amber)'),
      kpi('MHCA overdue','1','Sameer Das · capacity','var(--red)'),kpi('Discharges today','1','Dev Kumar')].join('');
    sections=sec('Approvals waiting','Only the floor lead can approve',[
        row('Rohit Kapoor','Home leave request, pending approval',['Review','c-blue'],'rohit'),
        row('Dev Kumar','Discharge summary ready to sign off',['Review','c-blue'],'dev')
      ].join(''))+
      sec('RMO orders to countersign','',[
        row('Neel Bose','Olanzapine dose increase, ordered by Dr. Sameer Khan (RMO)',['Countersign','c-blue'],'neel'),
        row('Tarun Roy','IM lorazepam SOS, ordered by Dr. Sameer Khan (RMO)',['Countersign','c-blue'],'tarun')
      ].join(''))+
      sec('MHCA deadlines','Next 7 days',[
        row('Sameer Das','Capacity assessment, week 2 · due today',['Overdue','c-red'],'sameer'),
        row('Neel Bose','Detailed history · 72-hour deadline passed',['Overdue','c-red'],'neel')
      ].join(''));
  } else if(r==='nurse'){
    sub='Day shift 8 am to 8 pm · Male ward · 8 patients';
    kpis=[kpi('Due now · 2 pm','4','Doses on the chart','var(--amber)'),kpi('Missed or late','2','Neel refused · Rohit obs late','var(--red)'),
      kpi('On close observation','3','1:1 · every 15 min'),kpi('Instructions open','4','From the treating team','var(--amber)')].join('');
    sections=sec('Instructions from the treating team','',[
        row('Neel Bose','Re-offer olanzapine at 10 pm. If refused, call RMO for IM SOS. — Dr. Aanya Sharma · 11:30 am',null,'neel'),
        row('Tarun Roy','1:1 constant. No sharps. Check belongings after every visit. — Dr. Aanya Sharma · 9:30 am',null,'tarun'),
        row('Varun Rao','Check pulse, BP, sweating and shaking every 2 hours. Call RMO if pulse goes above 100. — Dr. Sameer Khan · 1:50 pm',null,'varun'),
        row('Rohit Kapoor','Belongings list and risk screen by 4 pm. — Dr. Nandini Rao · 11:15 am',null,'rohit')
      ].join(''))+
      sec('Observation checks','',[
        row('Rohit Kapoor','Every 15 minutes · last 2:00 pm',['Late 5 min','c-red'],'rohit'),
        row('Tarun Roy','1:1 constant · log every 15 minutes',['Due 2:30 pm','c-amber'],'tarun'),
        row('Neel Bose','Every 15 minutes · last 2:10 pm',['Due 2:25 pm','c-amber'],'neel'),
        row('Varun Rao','Every 30 minutes · last 2:15 pm',['Next 2:45 pm','c-grey'],'varun')
      ].join(''));
  } else {
    sub='Day duty · Thursday 30 October · on call for all floors';
    kpis=[kpi('Alerts open','2','Respond within 10 min','var(--red)'),kpi('Awaiting countersign','2','Your orders'),
      kpi('Workups due','1','Rohit Kapoor'),kpi('Labs to review','2','')].join('');
    sections=sec('Incoming alerts','From nurses on the floor',[
        row('Tarun Roy','Pulse 112, agitated · nurse flagged for review',['Open','c-red'],'tarun'),
        row('Varun Rao','Refused evening dose · nurse logged',['Open','c-amber'],'varun')
      ].join(''))+
      sec('Coming up','',[
        row('Rohit Kapoor','Physical exam within 24 h of admission, due by 11 am tomorrow',null,'rohit'),
        row('Dev Kumar','Discharge medicines to reconcile before 5 pm',null,'dev'),
        row('Varun Rao','CIWA-Ar review at 4 pm',['4:00 pm','c-grey'],'varun')
      ].join(''));
  }
  return `<div class="row" style="justify-content:space-between"><div><h2>Dashboard</h2><div class="muted" style="margin-top:4px">${sub}</div></div></div>
  <div class="grid4 dashstats">${kpis}</div>
  ${sections}`;
}
function vExisting(name){
  if(decodeURIComponent(name)==='Dashboard') return vDashboard();
  if(decodeURIComponent(name)==='Care Management') return vCare();
  $('title').textContent=decodeURIComponent(name);
  return `<div class="existing"><h3>${decodeURIComponent(name)}</h3><p>Live today and unchanged by the inpatient work.</p><button class="btn" onclick="history.back()">Back</button></div>`;
}

/* ---------- real IPD form templates ---------- */
const O=(...a)=>a; // option list helper
const CHG=O('No change','Mildly reduced','Markedly reduced','Enhanced');
const HIST=[
 {k:'id',t:'Patient details',who:'both',f:[
  ['Marital status','o',O('Single','Married','Separated','Divorced','Widow/Widower','Remarried')],
  ['Occupation','o',O('Business','Executive','Housewife','Corporate job','Student','Retired','Other')],
  ['Mother tongue','o',O('Hindi','Punjabi','Haryanvi','Other')],
  ['Education','o',O('Nil','Primary','Middle','Secondary','Graduate','Post graduate','Doctorate')],
  ['Residence','o',O('Urban','Rural','Sub-urban')],
  ['Socioeconomic status','o',O('Upper class','Upper middle class','Lower middle class','Lower class')],
  ['Source of referral','o',O('Self','Organisation','Doctor')],
  ['Provisional diagnosis with ICD code','i']]},
 {k:'pt',t:"Patient's report",who:'both',f:[
  ['Identification marks','i'],
  ['Reliability','o',O('Good','Satisfactory','Unsatisfactory','Denies symptoms','Non-communicative','Collect on next visit')],
  ['Chief complaints (chronological, with duration)','t'],
  ['History of present illness (narrative, sequence, impact, negative history)','t']]},
 {k:'inf',t:"Informant's report",who:'both',f:[
  ['Name of family member','i'],['Relationship with patient','i'],['Duration of relationship','i'],
  ['Reliability','o',O('Good','Satisfactory','Unsatisfactory')],
  ['Presenting complaints (chronological, with duration)','t'],
  ['Predisposing factors','i'],['Perpetuating factors','i'],['Precipitating factors','i'],
  ['Mode of onset','o',O('Abrupt','Acute','Sub-acute','Insidious')],
  ['Course','o',O('Continuous','Episodic','Not known')],
  ['Progress','o',O('Deteriorating','Improving','Fluctuating','Static')],
  ['History of present illness','t']]},
 {k:'chg',t:'Concomitant changes',who:'both',f:[
  ['Socialising with people','o',CHG],['Interest in work','o',CHG],['Self-confidence','o',CHG],['Enthusiasm or optimism','o',CHG],['Experiencing pleasure','o',CHG],
  ['Appetite','o',O('Normal','Mildly reduced','Markedly reduced','Enhanced')],
  ['Libido','o',O('Normal','Mildly reduced','Markedly reduced','Enhanced')],
  ['Sexual functions','o',O('Normal','Mildly impaired','Markedly impaired','No information')],
  ['Sleep','m',O('Normal','Inability to fall asleep','Frequent awakening','Early morning insomnia','Total insomnia','Reversal of sleep habit','Nightmares','Night terror','Somnolence','Hypersomnia','Sleep talking','Sleep walking','Hypnagogic phenomena')],
  ['Bladder and bowel habits','i']]},
 {k:'tx',t:'Treatment and past illness',who:'both',f:[
  ['Treated by (present illness)','m',O('Psychiatrist','Psychologist','GP','Neurologist')],
  ['Treatment given (dose, duration, response, side effects)','t'],
  ['Past medical or surgical illness','o',O('Absent','Present')],['Details','i'],
  ['Past psychiatric illness','o',O('Absent','Present')],['Number of episodes, nature, treatment and response','t'],['History of self-harm or suicidal ideation (current or past)','t'],['Forensic history','i']]},
 {k:'fam',t:'Family history',who:'psych',f:[
  ['Consanguinity in parents','o',O('Absent','Present')],
  ['Father: living or deceased, age, education, occupation, personality, attitude to patient, health','t'],
  ['Mother: living or deceased, age, education, occupation, personality, attitude to patient, health','t'],
  ['Family tree (siblings, spouse, children: age, sex, marital, education, occupation)','t'],
  ['Mental illness, suicide, alcohol or drug dependence, epilepsy in family','ap',O('Father','Mother','Brother(s)','Sister(s)','Son(s)','Daughter(s)','Paternal grandparents','Maternal grandparents','Paternal uncles or aunts','Maternal uncles or aunts','Cousins')],
  ['Symptoms, duration, treatment, course and present status','t'],
  ['Significant physical illness in family (neurological, hypertension, diabetes, TB)','i']]},
 {k:'per',t:'Personal history',who:'psych',f:[
  ['Perinatal complications','o',O('Absent','Present')],['Birth','o',O('Normal','Abnormal')],['Birth cry','o',O('Present','Absent')],['Milestones','o',O('Normal','Abnormal')],
  ['Birth order','o',O('Only child','First child','Middle child','Last child')],
  ['Childhood disorders','ap',O('Thumb sucking','Bed wetting','Night terrors','Sleep walking','Nail biting','Stammering','Phobias','School phobia','Truancy','Delinquency','Obstinacy','Temper tantrums','Food fads','Febrile convulsions','Fits')],
  ['Home situation in childhood','o',O('Congenial','Broken home','Disturbing')],
  ['Parental loss before 18 years','o',O('No','Yes')],
  ['Education: highest grade, performance, peers, discipline, games, hobbies','t'],
  ['Occupation: age started, job changes, present job, work record, satisfaction','t'],
  ['Worked at least 6 of the past 12 months','o',O('Yes','No')],
  ['Sexual history and current functioning (enquire discreetly)','t'],
  ['Marital history: age, type of marriage, marital and sexual adjustment','t'],
  ["Relationship with family members",'o',O('Cordial','Strained')],
  ['Family support system','o',O('Adequate','Inadequate')],
  ['Present living conditions','t'],
  ['Substance use','ap',O('Smoking','Alcohol','Drug use','Snuff','Tobacco chewing')],
  ['Duration, frequency, quantity, withdrawal','i'],
  ['Menstrual history (if applicable): menarche, LMP, cycle, menopause','i']]},
 {k:'pmp',t:'Premorbid personality',who:'psych',f:[
  ['Nature of personality (mood, aspirations, relations, attitude to work)','t'],
  ["Examiner's impression",'o',O('Balanced','Avoidant','Histrionic','Narcissistic','Paranoid','Obsessive compulsive','Schizoid','Dependent','Schizotypal','Borderline','Antisocial')]]},
 {k:'phy',t:'Physical examination',who:'psy',f:[
  ['Physique','o',O('Average','Ectomorphic','Mesomorphic','Endomorphic')],['Handedness','o',O('Right','Left')],
  ['General examination','m',O('Pallor','Cyanosis','Oedema','Clubbing','Icterus','Lymphadenopathy','Tremors','Thyroid','Skin')],
  ['Pulse, BP, temperature','i'],
  ['Consciousness','o',O('Alert','Confusion','Clouding','Stupor','Delirium','Coma','Dreamy state')],
  ['Speech','o',O('Normal','Dysarthria','Aphasia','Mute')],
  ['Cranial nerves, motor, reflexes, sensory, cerebellar, meningeal signs','t'],
  ['Respiratory, cardiovascular, abdominal, musculoskeletal','t'],
  ['Physical diagnosis and investigation results','t']]},
 {k:'mse',t:'Mental status examination',who:'psy',f:[
  ['General appearance','o',O('Well kempt','Overly made-up','Perplexed','Unkempt and untidy','Sickly','Bewildered')],
  ['Touch with surroundings','o',O('Present','Partial','Absent')],['Eye contact','o',O('Present','Partial','Absent')],
  ['Rapport','o',O('Easily established','With difficulty','Not possible')],
  ['Attitude towards examiner','m',O('Cooperative','Attentive','Frank','Playful','Hostile','Evasive','Guarded','Attention seeking','Uncooperative','Suspicious','Defensive')],
  ['Motor behaviour','m',O('Appropriate','Hyperactive','Aimless','Destructive','Aggressive','Self-injurious','Mannerisms','Retarded','Restless','Waxy flexibility','Odd posture','Hallucinatory')],
  ['Speech: intensity, pitch, reaction time, speed','m',O('Audible','Excessively loud','Abnormally soft','Monotonous','Delayed','Rapid','Pressure of speech')],
  ['Speech: relevance, coherence, goal direction','m',O('Relevant','Irrelevant','Flight of ideas','Coherent','Incoherent','Circumstantial','Tangential')],
  ['Volition','ap',O('Suggestibility','Echolalia','Ambivalence','Echopraxia','Passivity','Negativism','Automatic obedience')],
  ['Mood, subjective','i'],
  ['Affect, objective','m',O('Normal','Irritable','Anxious','Enraged','Blunted','Fearful','Apathetic','Depressed','Euphoric','Elated','Weeping spells')],
  ['Affect: appropriate, reactive, related','m',O('Appropriate','Inappropriate','Reactive','Non-reactive')],
  ['Thought stream','o',O('Normal','Retarded','Accelerated')],
  ['Thought possession','ap',O('Blocking','Broadcasting','Insertion','Withdrawal','Echo','Alienation')],
  ['Formal thought disorder','m',O('Absent','Loosening of association','Illogical thinking','Derailment','Neologisms','Word salad','Overinclusion')],
  ['Thought content','ap',O('Obsessions','Compulsions','Phobia','Hopelessness','Worthlessness','Suicidal ideas','Homicidal ideas','Hypochondriacal ideas','Depersonalisation','Derealisation','Ideas of reference')],
  ['Delusions','ap',O('Persecutory','Grandeur','Reference','Control','Love','Infidelity','Sin and guilt','Hypochondriacal','Poverty','Nihilistic')],
  ['Hallucinations','m',O('Absent','Auditory','Visual','Olfactory','Gustatory','Tactile','Kinaesthetic')],
  ['Attention and concentration','o',O('Easily aroused and sustained','Difficult to arouse and sustain','Aroused, not sustained','Difficult to arouse, sustained')],
  ['Memory: remote, recent past, recent, immediate','m',O('All normal','Remote impaired','Recent past impaired','Recent impaired','Immediate impaired')],
  ['Orientation','m',O('Time','Place','Person')],
  ['Intelligence and abstract thinking','i'],
  ['Judgement','m',O('Social intact','Social impaired','Personal intact','Personal impaired','Test intact','Test impaired')],
  ['Insight','o',O('Grade I','Grade II','Grade III','Grade IV','Grade V','Grade VI')]]},
 {k:'dx',t:'Diagnostic formulation',who:'psy',f:[
  ['Diagnostic formulation','t'],['Provisional diagnosis (ICD)','i'],['Final diagnosis (ICD)','i'],['Subsequent change in diagnosis, if any','i']]}
];
const HDRAFT={'Marital status':'Single','Occupation':'Executive','Mother tongue':'Hindi','Education':'Graduate','Residence':'Urban','Source of referral':'Doctor','Reliability':'Good','Chief complaints (chronological, with duration)':'Decreased need for sleep, talkativeness and overspending for 3 weeks; irritability for 1 week.','History of present illness (narrative, sequence, impact, negative history)':'Second episode. Stopped lithium 4 months ago. Symptoms rose after a work deadline; family noticed spending and anger at home.','Name of family member':'Ananya Bose','Relationship with patient':'Sister','Mode of onset':'Acute','Course':'Episodic','Progress':'Fluctuating','Appetite':'Normal','Insight':'Grade III','General appearance':'Well kempt','Thought stream':'Accelerated','Rapport':'Easily established'};
const pickOne="this.parentNode.querySelectorAll('.tog').forEach(b=>b.classList.remove('on'));this.classList.add('on')";
function fld(f,ro){
  const [l,ty,op]=f; const v=S.historyDraft?HDRAFT[l]:null; const dis=ro?'disabled':'';
  if(ty==='o') return `<div class="hf"><span class="lbl">${l}</span><div class="mini-chips">${op.map(o=>`<button class="tog ${v===o?'on':''}" ${dis} onclick="${pickOne}">${o}</button>`).join('')}</div></div>`;
  if(ty==='m') return `<div class="hf"><span class="lbl">${l} <span class="tiny" style="text-transform:none;letter-spacing:0">(any)</span></span><div class="mini-chips">${op.map(o=>`<button class="tog" ${dis} onclick="this.classList.toggle('on')">${o}</button>`).join('')}</div></div>`;
  if(ty==='ap') return `<div class="hf"><span class="lbl">${l} <span class="tiny" style="text-transform:none;letter-spacing:0">(tap the ones present)</span></span><div class="mini-chips">${op.map(o=>`<button class="tog ap" ${dis} onclick="this.classList.toggle('on')">${o}</button>`).join('')}</div></div>`;
  if(ty==='t') return `<label class="hf wide"><span class="lbl">${l}</span><textarea class="input" ${ro?'readonly':''} style="min-height:64px">${v||''}</textarea></label>`;
  return `<label class="hf"><span class="lbl">${l}</span><input class="input" ${ro?'readonly':''} value="${v||''}"></label>`;
}
function histForm(){
  const cur=S.hsec||'id'; const sec=HIST.find(x=>x.k===cur); const i=HIST.indexOf(sec);
  const mine=w=>w==='both'||(w==='psy'?isPsy():isPsych());
  const whoChip=w=>w==='both'?chip('Both','c-grey'):w==='psy'?chip('Psychiatrist','c-blue'):chip('Psychologist','c-violet');
  return `<div class="hwrap"><nav class="hnav" aria-label="History sections">${HIST.map((x,j)=>`<button class="${x.k===cur?'on':''}" onclick="S.hsec='${x.k}';render()"><span class="hn">${j+1}</span><span style="flex:1">${x.t}</span>${x.who==='both'?'':`<i class="hw ${x.who}"></i>`}</button>`).join('')}</nav>
    <div class="hbody"><div class="row" style="justify-content:space-between"><h3>${i+1}. ${sec.t}</h3>${whoChip(sec.who)}</div>
    ${mine(sec.who)?'':`<div class="callout grey small">Filled by the ${sec.who==='psy'?'psychiatrist':'psychologist'}; view only for you.</div>`}
    <div class="hgrid">${sec.f.map(f=>fld(f,!mine(sec.who))).join('')}</div>
    <div class="row" style="justify-content:space-between;margin-top:6px"><button class="btn sm" ${i===0?'disabled':''} onclick="S.hsec='${(HIST[i-1]||{}).k}';render()">‹ Previous section</button><button class="btn sm" ${i===HIST.length-1?'disabled':''} onclick="S.hsec='${(HIST[i+1]||{}).k}';render()">Next section ›</button></div></div></div>`;
}
/* capacity: real MHA form */
function capQ(id,t,opts){opts=opts||['Yes','No','Cannot assess'];return `<div class="q"><div class="small" style="font-weight:600">${t}</div><div class="radios">${opts.map(o=>`<button class="tog" onclick="${pickOne}">${o}</button>`).join('')}</div><input class="input" style="min-height:34px" placeholder="Explanation"></div>`;}
function capForm(adm){
  return `<div class="grid2"><label class="field"><span class="lbl">Purpose of assessment</span><select class="input"><option>${adm?'Admission':'Treatment'}</option><option>Admission</option><option>Treatment</option><option>Advance directive</option><option>Any other</option></select></label>
  <label class="field"><span class="lbl">Place of assessment</span><input class="input" value="${adm?'Admission room':'Male ward, Room 214'}"></label>
  <div class="field"><span class="lbl">Advance directive</span><div class="radios"><button class="tog" onclick="${pickOne}">Present</button><button class="tog on" onclick="${pickOne}">Absent</button></div></div>
  <label class="field"><span class="lbl">Nominated representative</span><input class="input" value="Ananya Bose, sister"></label></div>
  <div class="tiny muted">If admitted under Section 102 or 103 of the MHA 2017, the rest of the assessment can happen in the ward.</div>
  <div class="capsec"><strong>Obvious lack of capacity</strong></div>
  ${capQ('0','Is the person in a condition where no meaningful conversation is possible (violent, excited, catatonic, stuporous, delirious, intoxicated or in severe withdrawal)? If yes, go to the conclusion.',['Yes','No'])}
  <div class="capsec"><strong>1 · Understanding the information</strong> <span class="tiny muted">relevant to the decision on treatment, admission or personal assistance</span></div>
  ${capQ('1a','A. Oriented to time, place and person?')}${capQ('1b','B. Given relevant information about mental healthcare and treatment for this illness?',['Yes','No'])}${capQ('1c','C. Able to follow simple commands (show your tongue, close your eyes)?')}${capQ('1d','D. Acknowledges having a mental illness?')}
  <div class="capsec"><strong>2 · Appreciating foreseeable consequences</strong> <span class="tiny muted">of a decision or lack of one</span></div>
  ${capQ('2a','A. Agrees to receive the treatment suggested by the treating team? (Yes: 2B · No: 2C · Cannot assess: 3)')}${capQ('2b','B. Explains why they agreed to treatment?')}${capQ('2c','C. Explains why they do not agree to treatment?',['Yes','No'])}
  <div class="capsec"><strong>3 · Communicating the decision</strong></div>
  ${capQ('3a','A. Able to communicate the decision by speech, writing, expression, gesture or other means?')}
  <div class="capsec"><strong>4 · Conclusion</strong> <span class="tiny muted">based on history, observation, clinical findings and MSE</span></div>
  <div class="radios"><button class="tog" onclick="${pickOne}">4A · Has capacity for treatment decisions including admission</button><button class="tog on" onclick="${pickOne}">4B · Needs 100% support from nominated representative</button></div>
  <div class="callout grey small">4A: the patient signs that they agree to make their own treatment decisions. 4B: the nominated representative signs that they agree to make decisions with respect to treatment. The front desk takes the signature on the tablet.</div>`;
}
function reassessModal(){openModal(`<div class="mh"><h3>Re-assessment (IPD) · psychiatrist</h3><button class="x" aria-label="Close" onclick="closeModal()">×</button></div>
 <div class="mb">
 <label class="field"><span class="lbl">1 · Current clinical status (history and MSE, specifically)</span><textarea class="input">Less pressured speech; sleeping 6 to 7 hours; still overfamiliar at times.</textarea></label>
 <div class="field"><span class="lbl">2 · Change in clinical status (use a rating scale where possible)</span><div class="radios"><button class="tog on" onclick="${pickOne}">Improving</button><button class="tog" onclick="${pickOne}">No change</button><button class="tog" onclick="${pickOne}">Worsening</button></div><input class="input" placeholder="Specify, e.g. YMRS 28 to 19" value="YMRS 28 to 19"></div>
 <label class="field"><span class="lbl">3 · Side effects, toxicity or complications</span><input class="input" value="Mild hand tremor"></label>
 <label class="field"><span class="lbl">4 · Further investigations required</span><input class="input" value="Serum lithium level"></label>
 <label class="field"><span class="lbl">5 · Change in management and treatment plan (including prescription)</span><textarea class="input">Increase olanzapine to 15 mg at night.</textarea></label>
 <label class="field"><span class="lbl">6 · Any other remarks</span><input class="input"></label></div>
 <div class="mf"><button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="S.reassessDone=true;S.done.reassess=true;closeModal();render();toast('Re-assessment signed. Next one in a week.')">Sign</button></div>`);}
function therapyModal(){openModal(`<div class="mh"><h3>Individual therapy note</h3><button class="x" aria-label="Close" onclick="closeModal()">×</button></div>
 <div class="mb"><div class="callout blue">Drafted by the AI scribe from today's session. Review before saving; nothing enters the record until you sign.</div>
 <div class="grid2"><label class="field"><span class="lbl">Date and time</span><input class="input" value="26 Oct, 4:00 pm"></label><label class="field"><span class="lbl">Duration</span><select class="input"><option>45 minutes</option><option>30 minutes</option><option>60 minutes</option></select></label></div>
 <label class="field"><span class="lbl">Aim of the intervention</span><input class="input" value="Identify early warning signs of mania"></label>
 <label class="field"><span class="lbl">Intervention</span><textarea class="input">Psychoeducation using a mood chart; listed three personal warning signs (less sleep, spending, irritability).</textarea></label>
 <label class="field"><span class="lbl">Outcome</span><textarea class="input">Engaged; named two signs without prompting.</textarea></label>
 <label class="field"><span class="lbl">Plan for next session</span><input class="input" value="Relapse prevention plan with sister"></label></div>
 <div class="mf"><button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="closeModal();S.therapyNotes.unshift({d:'26 Oct',wk:2,t:'Individual session · Early warning signs',by:'Priya Nair',body:'Aim: identify early warning signs of mania. Duration 45 minutes. Intervention: mood chart; listed three personal signs (less sleep, spending, irritability). Outcome: named two without prompting. Next: relapse prevention plan with sister.'});S.psychRows[1].done='2';S.done.ther=true;render();toast('Note signed. Sessions done updated in the psychology plan.')">Sign note</button></div>`);}
function familyModal(){openModal(`<div class="mh"><h3>Family counselling</h3><button class="x" aria-label="Close" onclick="closeModal()">×</button></div>
 <div class="mb"><div class="grid2">
 <label class="field"><span class="lbl">Name of the visitor</span><input class="input" value="Ananya Bose"></label><label class="field"><span class="lbl">Relation</span><input class="input" value="Sister"></label>
 <label class="field"><span class="lbl">Phone</span><input class="input" value="+91 98XXX XXX21"></label><label class="field"><span class="lbl">Email</span><input class="input"></label></div>
 <div class="field"><span class="lbl">Visit</span><div class="radios"><button class="tog on" onclick="${pickOne}">Planned</button><button class="tog" onclick="${pickOne}">Unplanned</button></div></div>
 <label class="field"><span class="lbl">Agenda of the family visit</span><textarea class="input">Progress update; early warning signs; medicine supervision at home.</textarea></label>
 <label class="field"><span class="lbl">Family's comments and viewpoints</span><textarea class="input"></textarea></label>
 <label class="field"><span class="lbl">Comments of the psychologist</span><textarea class="input"></textarea></label>
 <label class="field"><span class="lbl">Patient's requirements</span><input class="input" placeholder="e.g. clothes, books, phone call time"></label>
 <label class="field"><span class="lbl">Next visit agenda or instructions</span><input class="input"></label>
 <div class="callout grey small">The visitor signs the family visit consent on the tablet at the front desk.</div></div>
 <div class="mf"><button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="closeModal();toast('Family counselling note signed; visitor signature requested at the front desk')">Sign note</button></div>`);}
function referralModal(){openModal(`<div class="mh"><h3>Referral consultation</h3><button class="x" aria-label="Close" onclick="closeModal()">×</button></div>
 <div class="mb"><div class="grid2"><label class="field"><span class="lbl">Referral department</span><select class="input"><option>Medicine</option><option>Neurology</option><option>Dermatology</option><option>Gynaecology</option><option>Dental</option></select></label>
 <label class="field"><span class="lbl">Visiting doctor</span><input class="input" placeholder="Name of the visiting doctor"></label></div>
 <label class="field"><span class="lbl">Patient has presented with the following symptoms</span><textarea class="input">Tremor in both hands since the lithium dose change.</textarea></label>
 <div class="callout grey small">The family member signs the referral consultation consent (aware of the condition, the risks of referral and the extra charges) on the tablet at the front desk. The visiting doctor's recommendations and signature are added to this record after the visit.</div></div>
 <div class="mf"><button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="closeModal();S.consents.push({name:'Referral consultation consent',who:'Family',st:'Requested from front desk by '+signer()+' · '+atNow(),by:signer(),c:'c-amber'});render();toast('Referral sent; consent requested from the family')">Send referral</button></div>`);}
function outingModal(){openModal(`<div class="mh"><h3>Outing consent · Neel Bose</h3><button class="x" aria-label="Close" onclick="closeModal()">×</button></div>
 <div class="mb"><div class="tiny muted">IP No. IP-2026-1042 · Referred by ${signer()}</div><div class="grid2">
 <label class="field"><span class="lbl">Name of the guardian</span><select class="input"><option>Ananya Bose</option><option>Rakesh Bose</option></select></label><label class="field"><span class="lbl">Relation of the guardian</span><input class="input" value="Sister"></label>
 <label class="field"><span class="lbl">Contact details</span><input class="input" value="+91 98XXX XXX21"></label><label class="field"><span class="lbl">Email ID</span><input class="input" placeholder="Optional"></label>
 <label class="field"><span class="lbl">Place of outing</span><input class="input" placeholder="e.g. home, temple, market"></label><span></span>
 <label class="field"><span class="lbl">Time and date of exit</span><input class="input" value="27 Oct, 11:00"></label><label class="field"><span class="lbl">Time and date of entry</span><input class="input" value="27 Oct, 17:00"></label></div>
 <label class="field"><span class="lbl">Remarks of the psychiatrist or psychologist (if any)</span><input class="input" placeholder="e.g. no alcohol, back before dinner medicines"></label>
 <div class="box small" style="background:var(--soft)"><div class="lbl" style="margin-bottom:4px">Patient declaration</div>Takes responsibility for themself, agrees to be observed and checked for intoxication on return, and to return on the agreed time or inform the treating team. <span class="muted">Patient signs with date and time.</span></div>
 <div class="box small" style="background:var(--soft)"><div class="lbl" style="margin-bottom:4px">Guardian declaration</div>Takes full responsibility for the patient's safety, will return on the agreed time or inform the treating team, and is aware the patient will be observed and checked for intoxication on return. <span class="muted">Guardian marks Yes or No and signs with date and time.</span></div>
 <div class="callout grey small">Both signatures are taken by the front desk on the tablet. On return, nursing records the entry time and the intoxication check.</div></div>
 <div class="mf"><button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="closeModal();S.consents.push({name:'Outing consent · 27 Oct',who:'Patient and guardian',st:'Approved by '+signer()+' · '+atNow()+' · awaiting both signatures',by:signer(),c:'c-amber'});render();toast('Outing approved; front desk will take patient and guardian signatures')">Approve outing</button></div>`);}

/* ---------- nurse shift dashboard ---------- */
const NSLOTS=['8 am','10 am','12 pm','2 pm','4 pm','6 pm','8 pm','9 pm'];
const NOWI=3;
const NPLAN={
 neel:{'8 am':['med:Lithium 400','sugar'],'10 am':['vit'],'12 pm':['sugar'],'2 pm':['med:SOS check','sugar'],'4 pm':['vit'],'8 pm':['sugar'],'9 pm':['med:Lithium 400','med:Olanzapine 10']},
 rohit:{'8 am':['vit'],'10 am':['adm:Admission bloods'],'12 pm':['vit'],'2 pm':['med:Lorazepam 2'],'4 pm':['vit'],'9 pm':['med:Olanzapine 10']},
 tarun:{'8 am':['med:Risperidone 2'],'10 am':['vit'],'2 pm':['vit'],'6 pm':['vit'],'9 pm':['med:Risperidone 2','med:Clonazepam 0.5']},
 arjun:{'8 am':['med:Sertraline 50'],'4 pm':['vit'],'9 pm':['med:Quetiapine 50']},
 varun:{'8 am':['med:Thiamine 100','vit'],'2 pm':['med:Lorazepam 1'],'9 pm':['med:Lorazepam 1']},
 kabir:{'8 am':['med:Clozapine 100'],'10 am':['lab:Weekly WBC'],'4 pm':['vit'],'9 pm':['med:Clozapine 200']},
 sameer:{'8 am':['med:Fluoxetine 40'],'4 pm':['vit'],'9 pm':['med:Clonazepam 0.5']},
 dev:{'8 am':['med:Buprenorphine 2'],'10 am':['vit'],'12 pm':['dis:Discharge vitals'],'9 pm':[]}
};
S.nd=S.nd||{};S.nm=S.nm||{};
const NMEDS={
 neel:{'8 am':['Lithium carbonate 400 mg','Sodium valproate 500 mg','Propranolol 20 mg','Vitamin B complex'],'2 pm':['Olanzapine 5 mg','Trihexyphenidyl 2 mg'],'9 pm':['Lithium carbonate 400 mg','Olanzapine 10 mg','Sodium valproate 500 mg','Clonazepam 0.5 mg','Trihexyphenidyl 2 mg']},
 tarun:{'8 am':['Risperidone 2 mg','Trihexyphenidyl 2 mg','Escitalopram 10 mg'],'2 pm':['Risperidone 1 mg'],'9 pm':['Risperidone 2 mg','Clonazepam 0.5 mg','Trihexyphenidyl 2 mg','Melatonin 3 mg']},
 arjun:{'8 am':['Sertraline 100 mg','Vitamin D3','Omega 3'],'9 pm':['Quetiapine 50 mg','Mirtazapine 15 mg']},
 varun:{'8 am':['Thiamine 100 mg','Multivitamin','Baclofen 10 mg','Pantoprazole 40 mg','Lorazepam 2 mg'],'2 pm':['Lorazepam 1 mg','Baclofen 10 mg'],'9 pm':['Lorazepam 1 mg','Baclofen 10 mg','Thiamine 100 mg']},
 kabir:{'8 am':['Clozapine 100 mg','Amisulpride 200 mg','Metformin 500 mg'],'9 pm':['Clozapine 200 mg','Amisulpride 200 mg','Metformin 500 mg','Glycopyrrolate 1 mg']},
 sameer:{'8 am':['Fluoxetine 40 mg','Aripiprazole 5 mg'],'9 pm':['Clonazepam 0.5 mg','Fluvoxamine 100 mg']},
 rohit:{'8 am':['Pantoprazole 40 mg'],'2 pm':['Lorazepam 2 mg','Haloperidol 5 mg','Promethazine 25 mg'],'9 pm':['Olanzapine 10 mg','Lorazepam 2 mg']},
 dev:{'8 am':['Buprenorphine 2 mg','Naltrexone 50 mg','Pantoprazole 40 mg']}
};
Object.assign(NPLAN,{
 meera:{'8 am':['vit'],'4 pm':['vit']},
 sana:{'8 am':['vit'],'10 am':['vit'],'2 pm':['vit'],'6 pm':['vit']},
 ritu:{'8 am':['lab:Lithium level'],'4 pm':['vit']},
 kavya:{'8 am':['vit'],'12 pm':['sugar'],'4 pm':['vit']},
 pooja:{'8 am':['adm:Admission bloods'],'12 pm':['vit'],'4 pm':['vit']},
 aman:{'8 am':['vit'],'10 am':['vit'],'12 pm':['vit'],'2 pm':['vit'],'4 pm':['vit']},
 yash:{'8 am':['vit'],'4 pm':['vit']},
 nikhil:{'8 am':['vit'],'10 am':['vit'],'12 pm':['vit'],'2 pm':['vit'],'4 pm':['vit'],'6 pm':['vit']},
 rahul:{'8 am':['vit'],'4 pm':['vit']}
});
Object.assign(NMEDS,{
 meera:{'8 am':['Escitalopram 10 mg','Vitamin D3'],'9 pm':['Mirtazapine 15 mg']},
 sana:{'8 am':['Olanzapine 10 mg','Trihexyphenidyl 2 mg'],'2 pm':['Lorazepam 1 mg'],'9 pm':['Olanzapine 10 mg','Clonazepam 0.5 mg']},
 ritu:{'8 am':['Lithium carbonate 300 mg','Lamotrigine 50 mg'],'9 pm':['Lithium carbonate 300 mg','Quetiapine 50 mg']},
 kavya:{'8 am':['Fluoxetine 20 mg','Multivitamin'],'12 pm':['Olanzapine 2.5 mg'],'9 pm':['Olanzapine 2.5 mg']},
 pooja:{'8 am':['Sertraline 50 mg'],'9 pm':['Quetiapine 25 mg']},
 aman:{'8 am':['Thiamine 100 mg','Lorazepam 2 mg','Multivitamin'],'2 pm':['Lorazepam 1 mg'],'9 pm':['Lorazepam 1 mg','Thiamine 100 mg']},
 yash:{'8 am':['Buprenorphine 4 mg','Pantoprazole 40 mg'],'9 pm':['Clonidine 0.1 mg']},
 nikhil:{'8 am':['Diazepam 10 mg','Thiamine 100 mg'],'2 pm':['Diazepam 10 mg'],'9 pm':['Diazepam 5 mg','Thiamine 100 mg']},
 rahul:{'8 am':['Naltrexone 50 mg'],'9 pm':['Mirtazapine 15 mg']}
});
Object.values(NPLAN).forEach(pl=>Object.keys(pl).forEach(k=>pl[k]=pl[k].filter(t=>!t.startsWith('med'))));
const medStop=(pid,name)=>!!(S.mstop||{})[pid+'|'+name];
function nmState(pid,slot,i,si){const k=pid+'|'+slot;const v=(S.nm[k]||{})[i];if(v)return v;if(si>=NOWI&&medStop(pid,((NMEDS[pid]||{})[slot]||[])[i]))return 'stop';if(si<NOWI)return (pid==='tarun'&&slot==='8 am'&&i===2)?'ref':'done';return '';}
function medCell(pid,slot,si){const L=(NMEDS[pid]||{})[slot];if(!L)return '';
  const st=L.map((_,i)=>nmState(pid,slot,i,si)).filter(x=>x!=='stop');
  const go=`onclick="nMeds('${pid}','${slot}',${si})"`;
  if(!st.length)return `<button class="ntask tmed" style="opacity:.6" ${go}><span class="ni">💊</span><span style="flex:1;text-decoration:line-through">Medicines</span><span class="mcount">Stopped</span></button>`;
  const n=st.length,g=st.filter(x=>x==='done').length,rec=st.filter(Boolean).length,bad=st.filter(x=>x==='ref'||x==='held').length,open=n-rec;
  const cls=open===0?(bad?'ref':'done'):(si<NOWI?'late':'');
  return `<button class="ntask tmed ${cls}" ${go}${bad?` title="${bad} refused or held"`:''}><span class="ni">${open===0&&!bad?'✓':'💊'}</span><span style="flex:1">Medicines</span><span class="mcount">${rec?g+'/'+n:n}</span></button>`;}
function nMeds(pid,slot,si){const L=NMEDS[pid][slot];const p=allPts().find(x=>x.id===pid);const k=pid+'|'+slot;S.nm[k]=S.nm[k]||{};const dr=S.role==='rmo';
  L.forEach((_,i)=>{if(!S.nm[k][i]){const v=nmState(pid,slot,i,si);if(v&&v!=='stop')S.nm[k][i]=v;}});
  const row=(m,i)=>{const v=S.nm[k][i]||'',sp=nmState(pid,slot,i,si)==='stop',sv=(S.mstop||{})[pid+'|'+m];
    if(sp)return `<div class="mrow"><div style="flex:1;min-width:0"><div style="font-weight:600;text-decoration:line-through;color:var(--muted)">${m}</div><div class="tiny muted">Stopped by ${sv.by} · ${sv.at} · remaining doses cancelled</div></div>${dr?`<button class="btn sm" onclick="resumeMed('${pid}',${i},'${slot}',${si})">Resume</button>`:chip('Stopped','c-grey')}</div>`;
    return `<div class="mrow"><div style="flex:1;min-width:0"><div style="font-weight:600">${m}</div><div class="tiny muted">${(inf=>inf?[slot,inf.freq,(inf.when||'').toLowerCase(),inf.days].filter(Boolean).join(' · '):slot+' · after food')((S.minfo||{})[pid+'|'+m])}</div>${V3.reasonLine(k,i)}</div>${dr?'':`<div class="eseg">${[['done','Given','g'],['ref','Refused','r'],['held','Held','a']].map(([val,l,c])=>`<button class="${v===val?'on '+c:''}" onclick="V3.medSet('${k}',${i},'${val}','${pid}','${slot}',${si})">${l}</button>`).join('')}</div>`}${dr?`<button class="btn sm" title="Cancel all remaining doses of this medicine" onclick="stopMed('${pid}',${i},'${slot}',${si})">Stop</button>`:''}</div>`;};
  const done=L.filter((_,i)=>S.nm[k][i]).length,act=L.filter((_,i)=>nmState(pid,slot,i,si)!=='stop').length;
  openModal(`<div class="mh"><div><h3>${p.name} · ${slot} medicines</h3><div class="tiny muted" style="margin-top:2px">${p.room} · ${act} medicine${act===1?'':'s'}${act<L.length?' · '+(L.length-act)+' stopped':''}${dr?'':' · '+done+' recorded'}</div></div><button class="x" aria-label="Close" onclick="closeModal();render()">×</button></div>
   <div class="mb" style="gap:0;padding-top:8px">${p.risk&&!dr?'<div class="callout amber small" style="margin-bottom:10px">High risk: check the medicine is swallowed.</div>':''}${L.map(row).join('')}${dr?`<button class="btn" style="width:100%;margin-top:12px" onclick="addMedModal('${pid}','${slot}')">Add medication</button>`:''}
   <div class="tiny muted" style="margin-top:10px">${dr?'Stop cancels every remaining dose of that medicine and tells nursing.':'Refused or held alerts the treating psychiatrist. Each dose is signed with your initials and time.'}</div></div>
   <div class="mf">${dr?`<button class="btn pri" onclick="closeModal();render()">Close</button>`:`${p.risk?'<span class="tiny muted" style="margin-right:auto;align-self:center">High risk: record each medicine one at a time.</span>':`<button class="btn" onclick="medRest('${pid}','${slot}',${si})">Mark rest as given</button>`}<button class="btn" onclick="V3.prnGive('${pid}')">Give SOS dose</button><button class="btn pri" onclick="closeModal();render();toast('${p.name}: ${slot} medicines saved')">Save</button>`}</div>`);}
function medRest(pid,slot,si){const k=pid+'|'+slot;S.nm[k]=S.nm[k]||{};NMEDS[pid][slot].forEach((_,i)=>{if(!S.nm[k][i]&&nmState(pid,slot,i,si)!=='stop')S.nm[k][i]='done';});nMeds(pid,slot,si);}
function medNotice(pid,text,tag,c){const p=allPts().find(x=>x.id===pid);S.nInstr=S.nInstr||[];S.nN=(S.nN||0)+1;S.nInstr.unshift([p.name,signer()+' · just now',text,tag,c,'','n'+S.nN]);}
function stopMed(pid,i,slot,si){const m=NMEDS[pid][slot][i];S.mstop=S.mstop||{};S.mstop[pid+'|'+m]={by:signer(),at:clock()};medNotice(pid,'Stopped: '+m+'. Remaining doses cancelled.','Stopped','c-grey');nMeds(pid,slot,si);toast(m+' stopped. Nursing is told.');}
function resumeMed(pid,i,slot,si){const m=NMEDS[pid][slot][i];if(S.mstop)delete S.mstop[pid+'|'+m];medNotice(pid,'Resumed: '+m,'Resumed','c-blue');nMeds(pid,slot,si);toast(m+' resumed. Nursing is told.');}
function addMedModal(pid,slot){
  const pts=scopePts(),pre=slot==='8 am'?'1-0-0':slot==='9 pm'?'0-0-1':'1-0-1';
  openModal(`<div class="mh"><h3>Add medication</h3><button class="x" aria-label="Close" onclick="closeModal()">×</button></div>
  <div class="mb"><label class="field"><span class="lbl">Patient</span>${pid?`<div class="box" style="font-weight:600">${allPts().find(x=>x.id===pid).name}</div><input type="hidden" id="amP" value="${pid}">`:`<select class="input" id="amP">${pts.map(p=>`<option value="${p.id}">${p.name} · ${p.room}</option>`).join('')}</select>`}</label>
  <label class="field"><span class="lbl">Medicine and dose</span><input class="input" id="amN" placeholder="e.g. Paracetamol 500 mg" maxlength="60"></label>
  <div class="field"><span class="lbl">Frequency</span><div class="row" style="gap:6px;flex-wrap:wrap" id="amS">${['1-0-0','1-0-1','0-0-1','1-1-1','SOS'].map(x=>`<button type="button" class="tog ${x===pre?'on':''}" data-v="${x}" onclick="amPick(this)">${x}</button>`).join('')}</div><div class="small" id="amH" style="margin-top:8px">${amHint(pre)}</div></div>
  <div id="amE" class="small" style="color:var(--red);display:none"></div>
  <div class="tiny muted">Dose times follow the ward rule: morning 8 am, afternoon 2 pm, night 9 pm. It shows on the nursing chart and nursing is told.</div></div>
  <div class="mf"><button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="addMedSave()">Add medication</button></div>`);
}
function amHint(f){return f==='SOS'?'Only when needed. It sits on the chart at 2 pm.':'Given at '+(WK_SLOTS[f]||[]).join(' and ');}
function amPick(b){document.querySelectorAll('#amS .tog').forEach(x=>x.classList.remove('on'));b.classList.add('on');$('amH').textContent=amHint(b.dataset.v);}
function addMedSave(){
  const pid=$('amP').value,name=$('amN').value.replace(/['"<>\\]/g,'').trim(),on=document.querySelector('#amS .tog.on'),er=$('amE');
  if(!name){er.textContent='Enter the medicine and dose';er.style.display='block';return;}
  const fq=on.dataset.v,sl=WK_SLOTS[fq],nm=fq==='SOS'?name+' · SOS':name,today=sl.filter(x=>NSLOTS.indexOf(x)>=NOWI);
  NMEDS[pid]=NMEDS[pid]||{};today.forEach(x=>{const L=NMEDS[pid][x]=NMEDS[pid][x]||[];if(!L.includes(nm))L.push(nm);});
  S.minfo=S.minfo||{};S.minfo[pid+'|'+nm]={freq:fq,when:'After food',days:''};
  medNotice(pid,'New medicine: '+name+', '+fq+(today.length?' · '+today.join(', ')+' today':' · first dose tomorrow '+sl[0]),'New medicine','c-blue');
  const p=allPts().find(x=>x.id===pid);closeModal();render();toast(name+' added for '+p.name+', '+fq+(today.length?'':'. First dose tomorrow')+'. Nursing is told.');
}
function ntype(t){const k=t.split(':')[0];return {med:['Medicine','💊','c-blue'],vit:['Vitals','♡','c-green'],sugar:['Sugar','◉','c-amber'],adm:['Admission','＋','c-violet'],lab:['Lab','⚗','c-violet'],dis:['Discharge','⇥','c-grey'],mon:['Monitoring','◔','c-green']}[k];}
function ncell(pid,slot,si){
  const items=(NPLAN[pid]||{})[slot]||[]; const mc=medCell(pid,slot,si); if(!items.length&&!mc) return `<td class="nc ${si===NOWI?'now':''}"></td>`;
  return `<td class="nc ${si===NOWI?'now':''}">${mc}${items.map((t,ti)=>{const key=pid+'|'+slot+'|'+ti;const st=S.nd[key]||(si<NOWI?(key==='neel|12 pm|0'?'':'done'):'');const late=!st&&si<NOWI;const [lab,ic]=ntype(t);const nm=(t.split(':')[1]||lab).replace(/\|/g,' · ').replace(' (PR)','');
    return `<button class="ntask t${t.split(':')[0]} ${st==='done'?'done':''} ${st==='ref'?'ref':''} ${late?'late':''}" onclick="nRecord('${pid}','${slot}',${ti})"><span class="ni">${st==='done'?'✓':st==='ref'?'✕':ic}</span><span>${nm}</span></button>`;}).join('')}</td>`;
}
function nRecord(pid,slot,ti){
  const t=NPLAN[pid][slot][ti]; const k=t.split(':')[0]; const p=allPts().find(x=>x.id===pid); const key=pid+'|'+slot+'|'+ti;
  const body = k==='med'?`<div class="box row" style="justify-content:space-between"><span><strong>${t.split(':')[1]} mg</strong><br><span class="tiny muted">${slot} dose · after food</span></span>${p.risk?chip('High risk','c-red'):''}</div>
     <div class="field"><span class="lbl">Dose</span><div class="radios" id="nst"><button class="tog on" data-v="done" onclick="${pickOne}">Given</button><button class="tog" data-v="ref" onclick="${pickOne}">Refused</button><button class="tog" data-v="held" onclick="${pickOne}">Held</button></div></div>
     <label class="field"><span class="lbl">Note (optional)</span><input class="input" placeholder="e.g. took after counselling"></label><div class="tiny muted">Refused or held alerts the treating psychiatrist.</div>`
   : (k==='vit'||k==='dis')?`<div class="grid2">${[['BP','124/80'],['Pulse','86'],['Temp (°F)','98.6'],['SpO2 (%)','98']].map(f=>`<label class="field"><span class="lbl">${f[0]}</span><input class="input" value="${f[1]}"></label>`).join('')}</div>${t.includes('CIWA')?'<label class="field"><span class="lbl">CIWA-Ar score</span><input class="input" value="8"></label>':''}<div class="tiny muted">Out-of-range values alert the duty doctor.</div><span id="nst"><span class="tog on" data-v="done" hidden></span></span>`
   : k==='mon'?`<div class="grid2">${t.split(':')[1].split('|').map(par=>{const m=MON_PARAMS.find(x=>x[0]===par)||[par,'',''];return `<label class="field"><span class="lbl">${par}${m[1]?' ('+m[1]+')':''}</span><input class="input" value="${m[2]}"></label>`;}).join('')}</div><div class="tiny muted">Out-of-range values alert the duty doctor.</div><span id="nst"><span class="tog on" data-v="done" hidden></span></span>`
   : k==='sugar'?`<label class="field"><span class="lbl">Blood sugar (mg/dL)</span><input class="input" value="132"></label><div class="field"><span class="lbl">When</span><div class="radios"><button class="tog on" onclick="${pickOne}">Before meal</button><button class="tog" onclick="${pickOne}">After meal</button></div></div><span id="nst"><span class="tog on" data-v="done" hidden></span></span>`
   : `<div class="small">${t.split(':')[1]}</div><span id="nst"><span class="tog on" data-v="done" hidden></span></span>`;
  openModal(`<div class="mh"><h3>${ntype(t)[0]} · ${p.name} · ${slot}</h3><button class="x" aria-label="Close" onclick="closeModal()">×</button></div><div class="mb">${body}</div>
   <div class="mf"><button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="S.nd['${key}']=document.querySelector('#nst .on').dataset.v;closeModal();render();toast('Recorded by ${signer()}')">Save</button></div>`);
}
function nbFloorCards(rows,rowFn){
  const L=lst('nurse'),groups={};
  rows.forEach(p=>{(groups[floorNo(p)]=groups[floorNo(p)]||[]).push(p);});
  const keys=Object.keys(groups).map(Number).sort((a,b)=>a-b),filtering=!!(L.q.trim()||L.f!=='all');
  const thead=`<thead><tr><th class="np">Patient</th>${NSLOTS.map((s,i)=>`<th class="${i===NOWI?'now':''}">${s}${i===NOWI?'<span class="nowtag">NOW</span>':''}</th>`).join('')}</tr></thead>`;
  const out=keys.map(k=>{
    const all=groups[k],vis=all.filter(p=>lstMatch(p,L,nAtt));if(!vis.length)return '';
    const open=filtering?true:(L.x['f'+k]!==undefined?L.x['f'+k]:(rows.length<=30||keys.length===1));
    const wards=[...new Set(all.map(p=>wardOf(p.id)))],nr=all.filter(p=>p.risk).length,na=all.filter(nAtt).length;
    return `<section class="nfl nfs"><button class="fhb nfh" aria-expanded="${open}" onclick="grpTog('nurse','f${k}',${open})"><span class="caret">${open?'▾':'▸'}</span><strong>${ORD(k)} floor</strong>${wards.map(w=>chip(w,'c-blue')).join('')}<span class="tiny muted">${filtering?vis.length+' of '+all.length:all.length} patient${all.length===1?'':'s'}${nr?' · '+nr+' high risk':''}${na&&na!==nr?' · '+na+' need attention':''}</span></button>${open?`<div class="scroll nbscroll"><table class="nb dn-${dens(all.length)}">${thead}<tbody>${vis.map(rowFn).join('')}</tbody></table></div>`:''}</section>`;}).join('');
  return out||'<section class="nfs"><div class="pad small muted">No patient matches</div></section>';
}
function vNurseDay(){
  $('title').textContent='Inpatients';
  const rmoV=chartLikeRmo(),rows=(rmoV?rmoPts().map(r=>r.p):PTS.slice()).sort((a,b)=>(b.risk?1:0)-(a.risk?1:0));
  const wl=rmoV?(rmoEffFloor()==='All floors'?FLOORS.length+' floors':rmoEffFloor()):'Male ward';
  const NL=lst('nurse');
  const obsN=rows.filter(p=>/^(1:1|Every 15)/.test(EX[p.id][0])).length,obs11=rows.filter(p=>EX[p.id][0].startsWith('1:1')).map(p=>p.name);
  let due=0,late=0,done=0;rows.forEach(p=>NSLOTS.forEach((sl,si)=>((NPLAN[p.id]||{})[sl]||[]).forEach((t,ti)=>{const key=p.id+'|'+sl+'|'+ti;const st=S.nd[key]||(si<NOWI&&key!=='neel|12 pm|0'?'done':'');if(st)done++;else if(si<NOWI)late++;else if(si===NOWI)due++;})));
  {const g=V3.gridCounts(rows);due+=g.due;late+=g.late;done+=g.done;}
  const medsNow=rows.filter(p=>(NMEDS[p.id]||{})[NSLOTS[NOWI]]).length;
  rows.forEach(p=>NSLOTS.forEach((sl,si)=>((NMEDS[p.id]||{})[sl]||[]).forEach((_,i)=>{const v=nmState(p.id,sl,i,si);if(v==='stop')return;if(v)done++;else if(si<NOWI)late++;else if(si===NOWI)due++;})));
  const nbRow=p=>`<tr><td class="np"><div class="row" style="gap:10px;flex-wrap:nowrap"><span class="avatar pav ${p.risk?'r':''}">${p.ini}</span><div><div style="font-weight:600;white-space:nowrap">${p.name}</div><div class="tiny muted">${p.room.replace('Room ','R-')} · ${EX[p.id][0]}</div>${standChips(p.id)}</div></div></td>${NSLOTS.map((sl,si)=>ncell(p.id,sl,si)).join('')}</tr>`;
  return `<div class="row" style="justify-content:space-between;align-items:flex-end"><div><h2 style="font-size:26px">Shift board</h2><div class="muted" style="margin-top:4px">${wl} · Day shift 8 am to 8 pm · Sister Rekha · ${rows.length} patients</div></div>
    <div class="row" style="gap:8px">${(!rmoV&&(S.nHandovers||[])[0])?chip('Handover sent '+S.nHandovers[0].at,'c-green'):''}<button class="btn soft" onclick="nHandoverModal()">Handover note</button><button class="btn pri" onclick="toast('Starts the 2 pm medicine round, patient by patient')">Start 2 pm medicine round</button></div></div>
  ${wardAlerts()}${V3.wardHome()}
  <div class="grid4">
    ${statTile('',false,"nTile('all')",`Due now, ${due}. Go to the board`,`<div class="lbl">Due now · 2 pm</div><b style="color:var(--blue-ink)">${due}</b><span class="small muted">${medsNow} patients due medicines now</span>`)}
    ${statTile(late?'border-color:var(--amber-line)':'',NL.f==='att',"nTile('att')",`Missed or late, ${late}. Show only patients with these`,`<div class="lbl">Missed or late</div><b style="color:${late?'var(--amber)':'inherit'}">${late}</b><span class="small muted">From earlier slots</span>`)}
    ${statTile('',false,"nTile('all')",`Done this shift, ${done}. Go to the board`,`<div class="lbl">Done this shift</div><b style="color:var(--green)">${done}</b><span class="small muted">Doses, vitals, sugars</span>`)}
    ${statTile('',NL.f==='obs',"nTile('obs')",`Observation, ${obsN}. Show only these patients`,`<div class="lbl">Observation</div><b>${obsN}</b><span class="small muted">Every 15 min or 1:1${obs11.length?' · 1:1: '+obs11.join(', '):''}</span>`)}
  </div>
  <section class="card" id="nurseBoard"><div class="hd"><div><h3>Today by patient</h3><div class="small muted" style="margin-top:4px">Tap a box to record it. Medicines, vitals and sugars come from the doctors' orders.</div></div>
    <div class="row tiny" style="gap:10px"><span class="ntask tmed sm"><span class="ni">💊</span>Medicine</span><span class="ntask tvit sm"><span class="ni">♡</span>Vitals</span><span class="ntask tsugar sm"><span class="ni">◉</span>Sugar</span><span class="ntask done sm"><span class="ni">✓</span>Done</span><span class="ntask late sm"><span class="ni">!</span>Late</span></div></div>
    ${listBar(rows,'nurse',nAtt,1)}
  ${nbFloorCards(rows,nbRow)}</section>
  <div class="split"><section class="card wide"><div class="hd"><div><h3>Instructions from the treating team</h3><div class="small muted" style="margin-top:4px">New orders and monitoring from today's rounds and admissions</div></div>${chip(nUnseen()+' new','c-blue')}</div>
    ${(S.nInstr||[]).concat([['Neel Bose','Dr. Aanya Sharma · round 10:20','Neuro checks every 2 hours; serum lithium 7 am tomorrow','','','','s1'],['Rohit Kapoor','Dr. Aanya Sharma · admission','Observation every 15 minutes; admission bloods','','','','s2'],['Karan Malhotra','Dr. Aanya Sharma','Weekly WBC before clozapine dose','','','','s3']]).map(x=>`<div class="li"><div class="grow"><div style="font-weight:600">${x[0]}</div><div class="tiny muted">${x[1]}</div><div class="small" style="margin-top:2px">${x[3]?chip(x[3],x[4])+' ':''}${x[2]}</div>${x[5]?`<div class="tiny muted" style="margin-top:2px">${x[5]}</div>`:''}</div>${instrAct(x[0],x[6])}</div>`).join('')}</section>
</div>`;
}

/* ---------- printable forms ---------- */
const PFORMS=[
 ['Admission',[['adm','Admission consent and letter of undertaking','Patient or relative, witness','signed'],['formE','Form E · Request for admission with high support needs','Nominated representative','signed'],['formC','Form C · Request for independent admission','Patient','none'],['hr','High risk informed consent','Relative','signed'],['cap','Capacity assessment','Psychiatrist; patient or NR','signed']]],
 ['Clinical',[['hist','Psychiatric history and evaluation','Psychologist and psychiatrist','printed'],['mpp','Management plan, psychiatry','Psychiatrist','none'],['mpc','Management plan, psychology','Psychologist','none'],['re','Re-assessment form (IPD)','Psychiatrist','none'],['dn','Daily notes','Psychologist','none'],['tn','Individual therapy notes','Psychologist','none'],['fc','Family counselling and family visit consent','Psychologist, visitor','none']]],
 ['Treatment and requests',[['cloz','Informed consent for clozapine therapy','Patient and relative','none'],['mect','MECT information sheet, checklist and anaesthesia consent','Patient or NR, two psychiatrists, family member','none'],['ref','Referral consultation consent','Relative, visiting doctor','none'],['out','Outing consent','Patient and guardian','none'],['dtms','dTMS consent','Patient or NR','none'],['ket','Ketamine therapy consent','Patient or NR','none'],['lai','Long-acting injection consent (olanzapine, risperidone, paliperidone)','Patient or NR','none'],['inj','Injection consent · patient refuses oral medicine','Patient or NR, family member','none'],['rest','Restraint consent','Family member','none']]],
 ['Discharge',[['dc','Discharge consent','Patient and guardian','none'],['ds','Discharge summary','Psychiatrist','none'],['lama','Self discharge against medical advice (LAMA)','Doctor','none']]]
];
const PFIELDS={adm:['Name, age, relation (S/o, D/o, W/o)','Consent to testing, treatment and hospital care','Advance remitted (Rs.)','Person authorised for refunds'],cap:['Purpose of assessment','Advance directive · Nominated representative','Obvious lack of capacity','1A to 1D · Understanding','2A to 2C · Appreciating consequences','3A · Communicating the decision','4A or 4B · Conclusion'],hist:['Patient details and source of referral',"Patient's and informant's report",'Concomitant changes','Treatment, past, family and personal history','Premorbid personality','Physical examination','Mental status examination','Diagnostic formulation'],mpp:['Chief complaints','1 Assessment: capacity, physical, psychological','2 Clarification (serial MSE)','3 Consultation-liaison','4 Psychotropics','5 Monitoring','6 Somatic treatment'],mpc:['Problem area · Intervention · Sessions proposed · Sessions conducted · Outcome','Psychodiagnostic scores','Long-term goals and future guidance'],re:['1 Current clinical status','2 Change in clinical status: Improving / No change / Worsening','3 Side effects, toxicity, complications','4 Further investigations','5 Change in management and treatment plan','6 Any other remarks'],dn:['Biological functions (sleep and appetite)','Assessment: Yes / No','Behavioural analysis','Significant observation'],tn:['Aim of the intervention','Duration','Intervention','Outcome','Plan for next session'],fc:['Visitor name, relation, phone, email','Planned / Unplanned visit','Agenda of the family visit',"Family's comments and viewpoints",'Comments of the psychologist',"Patient's requirements",'Next visit agenda or instructions'],cloz:['Relative and relationship','Risks explained: agranulocytosis, cardiac or respiratory arrest, seizures, common side effects','Periodic WBC testing agreed'],mect:['Pre-MECT checklist','MMSE score','Peri and post-MECT assessment','Anaesthesia consent: medical problems'],ref:['Visiting doctor and department','Symptoms','Visiting doctor recommendations','Relative consent to referral and charges'],out:['Guardian, relation, contact, email','Place of outing','Exit and entry, date and time','Remarks of psychiatrist or psychologist','Patient declaration','Guardian declaration (Yes / No aware of intoxication check)'],dc:['Admission and discharge dates','Consent to discharge','Follow-up instructions accepted','All belongings taken'],ds:['Admitting diagnosis (provisional)','Discharge diagnosis','History and complaints','Allergy','Examination, physical and MSE','Intervention during stay','Condition at discharge','Rx: drug, dose, duration','Treatment advice and suggestions','Treating team'],lama:['State of mental health','Treatment proposed','Medical risks of leaving early'],formE:['Statutory form under rule 8 (printed as approved)'],formC:['Statutory form under rule 8 (printed as approved)'],hr:['High risk informed consent text (printed as approved)']};
Object.assign(PFIELDS,{dtms:['Indication and treatment plan','Number and frequency of sessions','Common side effects explained: scalp discomfort, headache, rarely a seizure','Contraindications checked: metal implants, pacemaker, seizure history','Declaration of patient or nominated representative'],ket:['Indication and treatment plan','Route, dose and planned sessions','Risks explained: dissociation, raised blood pressure, nausea, misuse potential','Monitoring during and after each session','Declaration of patient or nominated representative'],lai:['Medicine: olanzapine, risperidone or paliperidone','Dose and interval','Why a long-acting injection is advised','Risks explained: injection site pain, side effects, effect cannot be reversed quickly','Declaration of patient or nominated representative'],inj:['Medicine to be given by injection and dose','Reason: patient refuses oral medicine (dates and refusals)','Route of injection and who will give it','Risks and side effects explained','Declaration of patient or nominated representative (family member when the patient lacks capacity)','Declaration of the treating doctor'],rest:['Reason for restraint','Type: physical, mechanical or seclusion','Duration and monitoring plan','Family informed and informed of review','Declaration of family member and treating psychiatrist']});
S.pf=S.pf||{};S.pfAt=S.pfAt||{hist:'yesterday, 5:10 pm'};S.pfUp=S.pfUp||{};
const PFST={none:['Not started','c-grey'],printed:['Printed · awaiting signed copy','c-amber'],signed:['Signed copy on file','c-green']};
function pForms(){
  const st=k=>S.pf[k]||PFORMS.flatMap(g=>g[1]).find(f=>f[0]===k)[3];
  const all=PFORMS.flatMap(g=>g[1]); const waiting=all.filter(f=>st(f[0])==='printed').length, signed=all.filter(f=>st(f[0])==='signed').length;
  return `<div class="callout blue">Every Tulasi IPD form can be printed with Neel's details already filled in (name, age, UHID, IP No., room, treating team, date). Print it, get it signed on paper, then upload the scan. Once printed, the psychiatrist gets a task to upload the signed copy; once it is uploaded, only the signed copy is shown.</div>
  <div class="ostrip"><div><span class="lbl">Forms</span><b>${all.length}</b></div><div class="${waiting?'warn':''}"><span class="lbl">Awaiting signature</span><b>${waiting}</b></div><div><span class="lbl">Signed copies on file</span><b>${signed}</b></div><div><span class="lbl">Not started</span><b>${all.length-waiting-signed}</b></div></div>
  ${PFORMS.map(([g,fs])=>`<section class="card"><div class="hd"><h3>${g}</h3><span class="small muted">${fs.length} forms</span></div>
    ${fs.map(([k,t,who])=>{const s0=st(k),at=(S.pfAt||{})[k],up=(S.pfUp||{})[k];
      const pb=(S.pfBy||{})[k]||S.team.psy;
      const sub=s0==='printed'?`Printed by ${pb} · ${at||'earlier'} · upload task assigned to ${S.team.psy}`:s0==='signed'?`Signed by: ${who} · uploaded by ${up?up.by+' · '+up.at:'Meena Arora, front desk · 18 Oct 2026'}`:`Signed by: ${who} · not printed yet`;
      const act=s0==='none'?`<button class="btn sm pri" onclick="pfPrint('${k}')">⎙ Print</button>`
        :s0==='printed'?`<button class="lnk" style="margin:0" onclick="pfPrint('${k}')">Print again</button><button class="btn sm pri" onclick="pfUpModal('${k}')">Upload signed copy</button>`
        :`<button class="btn sm" onclick="pfView('${k}')">View signed</button>`;
      return `<div class="li"><div class="grow"><div style="font-weight:600">${t}${k==='inj'?' '+chip('NEW','c-new'):''}</div><div class="tiny muted">${sub}</div></div>${chip(PFST[s0][0],PFST[s0][1])}${act}</div>`}).join('')}</section>`).join('')}`;
}
function pfUpModal(k){
  const f=PFORMS.flatMap(g=>g[1]).find(x=>x[0]===k);
  openModal(flTop('Upload signed copy',f[1]+' · Neel Bose')+`<div class="mb"><label class="pfdrop"><input type="file" id="pfFile" accept=".pdf,image/*" onchange="pfFileSel(this)"><span id="pfFn"><strong>Choose the scan</strong> or drop it here<br><span class="tiny muted">PDF or photo · signed by ${f[2]}</span></span></label>
    <div class="callout grey small">The scan is saved in the stay file next to this form. After that the Print button goes away and only the signed copy is shown. In this prototype, uploading without a file uses a sample scan.</div></div>
    <div class="mf"><button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="pfUp('${k}')">Upload</button></div>`);
}
function pfFileSel(i){const f=i.files[0];$('pfFn').innerHTML=f?'<strong>'+hesc(f.name)+'</strong><br><span class="tiny muted">'+Math.max(1,Math.round(f.size/1024))+' KB · ready to upload</span>':'<strong>Choose the scan</strong> or drop it here';}
function pfUp(k){const fl=($('pfFile')||{files:[]}).files[0];S.pf[k]='signed';S.pfUp=S.pfUp||{};S.pfUp[k]={at:'today, '+clock(),by:signer(),name:fl?fl.name:'signed-scan.pdf'};closeModal();render();toast('Signed copy uploaded. The upload task is cleared.');}
function pfView(k){
  const f=PFORMS.flatMap(g=>g[1]).find(x=>x[0]===k),u=(S.pfUp||{})[k]||{at:'earlier',by:S.team.psy,name:'signed-scan.pdf'};
  openModal(flTop(f[1],'Signed copy · '+hesc(u.name)+' · uploaded '+u.at+' by '+hesc(u.by))+`<div class="mb"><div class="pfpaper"><div class="row" style="justify-content:space-between"><strong>TULASI HEALTHCARE</strong><span class="tiny">Gurugram</span></div><div style="text-align:center;font-weight:700;margin:10px 0 14px;text-transform:uppercase">${f[1]}</div>
    <div class="pfln"></div><div class="pfln"></div><div class="pfln s"></div><div class="pfln"></div>
    <div class="row" style="justify-content:space-around;margin-top:22px">${f[2].split(/,|;| and /).map(x=>x.trim()).filter(Boolean).slice(0,3).map(x=>`<div style="text-align:center"><div class="pfsig">Signed</div><div class="tiny muted" style="border-top:1px solid #9aa5b5;padding-top:3px">${x}</div></div>`).join('')}</div></div></div>
    <div class="mf"><span class="tiny muted" style="margin-right:auto">Sample scan for the prototype</span><button class="btn" onclick="closeModal()">Close</button><button class="btn pri" onclick="toast('Downloads the signed scan')">Download</button></div>`);
  $('modal').style.width='min(640px,100%)';
}
function pfPrint(k){
  const f=PFORMS.flatMap(g=>g[1]).find(x=>x[0]===k);
  const html=`<!doctype html><html><head><meta charset="utf-8"><title>${f[1]} · Neel Bose</title><style>body{font:13px Arial,sans-serif;color:#000;margin:32px}h1{font-size:16px;text-align:center;margin:4px 0 14px;text-transform:uppercase}.hd{display:flex;justify-content:space-between;border-bottom:2px solid #000;padding-bottom:6px;margin-bottom:12px}table{width:100%;border-collapse:collapse;margin-bottom:14px}td{border:1px solid #000;padding:6px 8px;vertical-align:top}.f{border:1px solid #000;padding:8px;margin-bottom:8px;min-height:54px}.f b{display:block;margin-bottom:24px}.sig{display:flex;justify-content:space-between;margin-top:40px}.sig div{border-top:1px solid #000;width:30%;padding-top:4px;text-align:center}</style></head><body>
  <div class="hd"><strong>TULASI HEALTHCARE</strong><span>Gurugram</span></div><h1>${f[1]}</h1>
  <table><tr><td>Name: <b>Neel Bose</b></td><td>Age/Sex: <b>23/M</b></td><td>UHID: <b>2026-27RG6990</b></td></tr><tr><td>IP No.: <b>IP-2026-1042</b></td><td>Room: <b>213 A, Male ward</b></td><td>Date: <b>26 Oct 2026</b></td></tr><tr><td colspan="2">Treating team: <b>${S.team.psy}, ${S.team.psych}</b></td><td>Section: <b>${S.section}</b></td></tr></table>
  ${(PFIELDS[k]||[]).map(x=>`<div class="f"><b>${x}</b></div>`).join('')}
  <div class="sig">${f[2].split(/,|;| and /).map(x=>x.trim()).filter(Boolean).slice(0,3).map(x=>`<div>Signature · ${x}<br><small>Date and time</small></div>`).join('')}</div></body></html>`;
  openModal(`<div class="mh"><h3>Print · ${f[1]}</h3><button class="x" aria-label="Close" onclick="closeModal()">×</button></div>
   <div class="mb" style="padding:0"><iframe id="pfr" style="width:100%;height:60vh;border:0;background:#fff"></iframe></div>
   <div class="mf"><span class="tiny muted" style="margin-right:auto">Pre-filled with patient details. ${__dl?'Saves a file you can open, print and sign.':'Layout follows the approved Tulasi form.'}</span><button class="btn" onclick="closeModal()">Close</button><button class="btn pri" onclick="pfDo('${k}')">${__dl?'Download':'Print'}</button></div>`);
  $('modal').style.width='min(860px,100%)'; $('pfr').srcdoc=html;
}

/* ---------- doctor-portal style note list + read-only view ---------- */
S.nx=S.nx||{};
function noteList(id,items){
  return `<div class="nlist">${items.map((n,i)=>{const k=id+'-'+i,open=S.nx[k];return `<div class="nitem ${open?'open':''}">
    <button class="nhead" onclick="S.nx['${k}']=!S.nx['${k}'];render()" aria-expanded="${!!open}"><div class="ndate"><b>${n.d}</b><span>${n.my}</span></div>
      <div class="nmeta"><div class="row" style="gap:8px">${chip(n.type,n.tc||'c-blue')}<span class="small"><strong>${n.by}</strong> <span class="muted">· ${n.role||''} · ${n.d} ${n.my}${(n.tm||{'Daily note':'6:10 pm','Round note':'10:30 am'}[n.type])?', '+(n.tm||{'Daily note':'6:10 pm','Round note':'10:30 am'}[n.type]):''}</span></span></div><div class="small muted" style="margin-top:3px">${n.sum}</div></div><span class="nchev">${open?'▴':'▾'}</span></button>
    ${open?`<div class="nbody">${secList(n.secs||[['Note',n.sum]])}</div>`:''}</div>`}).join('')}</div>`;
}
function secList(secs){return `<ol class="slist">${secs.map(([h,t,alert],i)=>`<li class="${alert?'alert':''}"><span class="sn">${alert?'!':i+1}</span><div><div class="sh">${h}</div><div class="sb">${Array.isArray(t)?`<ul>${t.map(x=>`<li>${x}</li>`).join('')}</ul>`:t}</div></div></li>`).join('')}</ol>`;}
const HREAD=[
 ['Informant and reliability','Patient himself (reliable) and sister Ananya Bose (cohabiting; information adequate and consistent).'],
 ['Onset, course and progress','Acute onset · episodic course · fluctuating'],
 ['Chief complaints',['Decreased need for sleep for 3 weeks','Talkativeness and overspending for 3 weeks','Irritability and anger at home for 1 week']],
 ['History of presenting illness','Second episode. Stopped lithium 4 months ago without telling the family. Symptoms rose after a work deadline: sleeping 2 to 3 hours, spending on credit cards, starting new business plans, angry when stopped.'],
 ['History of self-harm or suicidal ideation (current or past)','No past attempts. No current suicidal ideation, intent or plan. Risk of harm to others: moderate (verbal aggression at home).',true],
 ['Treatment history','First episode Feb to Mar 2025, admitted at Tulasi for 30 days; lithium 400 mg twice daily and olanzapine 10 mg, good response. Stopped lithium on his own 4 months ago.'],
 ['Past history (medical and surgical)','No diabetes, hypertension, thyroid disorder, seizures or head injury. No known drug allergies.'],
 ['Family history','Maternal uncle treated for bipolar disorder. No family history of suicide or substance use.'],
 ['Personal history','Graduate, works in sales for 6 years. Unmarried, lives with sister in Gurgaon. Normal birth and milestones.'],
 ['Premorbid personality','Sociable, ambitious, quick tempered. Examiner\'s impression: balanced.'],
 ['Substance use history','Social alcohol 2 to 3 times a month; no tobacco or other substances.'],
 ['Forensic history','Nil. No police or legal involvement.'],
 ['Physical examination','Vitals stable: BP 138/88, pulse 104. Systemic examination normal. CNS: no focal deficit.'],
 ['Mental status examination','Well kempt, overfamiliar, restless. Pressured speech, elated and irritable affect, flight of ideas, grandiose ideas without delusions, no hallucinations. Oriented. Insight grade III, judgement impaired.'],
 ['Diagnostic formulation','Bipolar affective disorder, current episode manic without psychotic symptoms (6A60.0), relapse after stopping lithium.']
];

/* ---------- router ---------- */
function nFocus(pid){
  const L=lst('nurse');
  if(pid){const p=allPts().find(x=>x.id===pid);if(p&&S.nFocus!==pid){L.q=p.name;L.f='all';S.nFocus=pid;
    setTimeout(()=>{const h=[...document.querySelectorAll('#view h3')].find(x=>x.textContent.trim().startsWith('Today by patient')),c=h&&h.closest('section');if(c){c.style.scrollMarginTop='96px';c.scrollIntoView({behavior:'smooth',block:'start'});}},80);}}
  else if(S.nFocus){L.q='';S.nFocus=null;}
}
function render(){
  const r=(location.hash||'#/myday').slice(2).split('/');
  if(r[0]!=='nursing'&&S.nFocus){S.nFocus=null;lst('nurse').q='';}
  if(r[0]==='timeline'&&!r[1]){window.__histNav=true;if(S.focusPid&&typeof ptFind==='function'&&ptFind(S.focusPid)){location.replace('#/patient/'+S.focusPid+'/overview');}else if(typeof ptPickHist==='function'){renderSide(r);$('app').classList.remove('compact');$('view').innerHTML=ptPickHist();}else{location.replace('#/patient/neel/overview');}return;}
  if(r[0]!=='patient')window.__histNav=false;
  V3.pre();if(S.role==='rmo')rmoInit();rmoLocBar();scaleBar();
  if(V3.deny(r)||(r[0]==='nursing'&&S.role==='psychologist')||(r[0]==='handover'&&!['rmo','psychiatrist'].includes(S.role))||(r[0]==='patient'&&S.role==='rmo'&&!inScope(r[1]))||(isWard()&&(r[0]==='rounds'||r[0]==='notes'))||(r[0]==='notes'&&!((isPsy()&&!isLead())||isPsych()))){go('#/myday');return;}
  $('app').classList.toggle('compact', r[0]==='patient'||r[0]==='rounds'||r[0]==='notes');
  renderSide(r);
  let html='';
  if(V3.isV3(r[0])) html=V3.route(r); else if(r[0]==='myday') html=window.__roleMyDay?window.__roleMyDay():(S.role==='nurse'?vNurseDay():(S.role==='rmo'?vRmoDay():vMyDay()));
  else if(r[0]==='nursing'){nFocus(r[1]);html=vNurseView();}
  else if(r[0]==='handover') html=S.role==='psychiatrist'&&window.psyHandoverPage?window.psyHandoverPage():vHandover();
  else if(r[0]==='admissions') html=vNewAdm();
  else if(r[0]==='inpatients') html=S.role==='rmo'?vRmoWards():vInpatients();
  else if(r[0]==='rounds') html=vRounds();
  else if(r[0]==='notes') html=vNotes();
  else if(r[0]==='patient') html=vPatient(r[2]);
  else if(r[0]==='existing') html=vExisting(r.slice(1).join('/'));
  else html=vJourney();
  $('view').innerHTML=html;
}
window.addEventListener('hashchange',()=>{if(!window.__in)return;render();window.scrollTo(0,0);});

const __due = () => S.role==='nurse' ? dueItems().filter(d=>['vitals','orders'].includes(d[3])) : dueItems();


/* ===== login hand-off, file saving, demo reset ===== */
const ROLES = {lead:{name:'Floor lead',short:'Floor lead',ini:'FL',title:'Male ward'},psychiatrist:{name:'Psychiatrist',short:'Psychiatrist',ini:'PS',title:'Treating doctor'},psychologist:{name:'Psychologist',short:'Psychologist',ini:'PY',title:'Therapy and counselling'},rmo:{name:'RMO on duty',short:'RMO',ini:'RMO',title:'Ward duty doctor'},nurse:{name:'Nurse',short:'Nurse',ini:'NU',title:'Male ward'}};
const me = () => ROLES[S.role] || __me0();
let __dl = null;
try { if (window.claude && window.claude.use) window.claude.use('downloads').then(d => { __dl = d || null; }).catch(() => {}); } catch (e) {}
function __slug(s){return String(s).replace(/<[^>]+>/g,'').replace(/[^\w\- ]+/g,'').trim().replace(/\s+/g,'_').slice(0,60)||'document';}
async function __saveFile(name, data){
  if(!__dl) return false;
  try { await __dl.save({filename:name, data}); toast('Saved '+name); return true; }
  catch(e){ if(e && e.code==='declined') return false; toast('This view cannot save files. Open the page in claude.ai to download.'); return false; }
}
async function pfDo(k){
  const f=PFORMS.flatMap(g=>g[1]).find(x=>x[0]===k);
  if(__dl){ const ok=await __saveFile(__slug(f[1]+' Neel Bose')+'.html', $('pfr').srcdoc); if(!ok) return; }
  else { try{$('pfr').contentWindow.print()}catch(e){} }
  S.pf[k]=S.pf[k]==='signed'?'signed':'printed'; if(S.pf[k]==='printed'){S.pfAt=S.pfAt||{};S.pfAt[k]='today, '+clock();S.pfBy=S.pfBy||{};S.pfBy[k]=signer();} closeModal(); render();
  toast((__dl?'Saved. Open the file and print it. ':'Sent to printer. ')+'A task to upload the signed copy is now on '+S.team.psy+'\'s list.');
}
window.__S0 = JSON.stringify(S);
function setRole(r){S.role=r;S.tf='';S.rtf='';closeModal();if(location.hash==='#/myday')render();else location.hash='#/myday';window.scrollTo(0,0);toast('Viewing as '+me().name);}
function __resetDemo(){
  const role = S.role, o = JSON.parse(window.__S0);
  Object.keys(S).forEach(k => delete S[k]); Object.assign(S, o); S.role = role;
  closeModal(); render(); toast('Demo data reset');
}
function accountModal(){
  const m = me();
  openModal(`<div class="mh"><h3>Viewing as</h3><button class="x" aria-label="Close" onclick="closeModal()">×</button></div>
  <div class="mb"><div class="row" style="gap:12px;flex-wrap:nowrap">${av(m.ini,48)}<div><div style="font-weight:700;font-size:16px">${m.name}</div><div class="muted small">${m.title}</div></div></div>
  <div class="callout grey small">To switch role, log out from the account menu and pick another role on the login page. Each role shows only its own screens. Advice from rounds reaches the nurse shift board, and events nursing reports reach the doctors, while this page stays open.</div>
  <button class="lnk" onclick="__resetDemo()">Reset demo data to the starting state</button></div>
  <div class="mf"><button class="btn pri" onclick="closeModal()">Close</button></div>`);
}

/* ===== Rounds v2: every order is a choice from a list, so nursing gets exact information ===== */
const MON_PARAMS=[['BP','mmHg','124/80'],['Pulse (PR)','bpm','86'],['RR','per min','18'],['Temp','°F','98.6'],['Sugar (CBG)','mg/dL','132'],['Weight','kg','68'],['Urine output','ml','800']];
const MON_FREQ=[['1-0-0',['8 am']],['1-0-1',['8 am','8 pm']],['1-1-1',['8 am','2 pm','8 pm']],['1-1-1-1',['8 am','12 pm','4 pm','8 pm']],['Every 4 hours',['8 am','12 pm','4 pm','8 pm']],['Every 2 hours',['8 am','10 am','12 pm','2 pm','4 pm','6 pm','8 pm']],['Alternate days',[]],['Weekly',[]],['SOS (when needed)',[]]];
const MON_DEFAULT_FREQ={'BP':'1-0-1','Pulse (PR)':'1-0-1','RR':'1-0-1','Temp':'1-0-0','Sugar (CBG)':'1-1-1-1','Weight':'Weekly','Urine output':'1-1-1'};
const MON_WORDS={'1-0-0':'once daily','1-0-1':'twice daily','1-1-1':'three times daily','1-1-1-1':'four times daily (QID)'};
const monLabel=f=>MON_WORDS[f]?f+' · '+MON_WORDS[f]:f;
const MON_CUR=[['BP','1-0-1'],['Pulse (PR)','1-0-1'],['Temp','1-0-0'],['Sugar (CBG)','1-1-1-1'],['Weight','Weekly']];
const INV_LIST=['Serum lithium','Valproate level','CBC','LFT','RFT','Lipid profile','HbA1c','Fasting sugar','TSH','Prolactin','ECG','Urine drug screen'];
const INV_WHEN=['Today','Tomorrow morning','This week'];
const MED_WHEN=['After food','Before food','At bedtime','Only when needed'];
const MED_DUR=['7 days','14 days','30 days','Until next review'];

/* instruction, how long, who to inform, chip (1 amber, 2 routine), who it is for */
const ADV_OPTS={
 'Safety and supervision':[
  ['Risk of harm to self: 24 hour supervision','Until next review','Duty doctor (DOD)',1],
  ['Risk of absconding: 24 hour supervision','Until next review','Duty doctor (DOD)',1],
  ['One to one observation','Until next review','Duty doctor (DOD)',1],
  ['Observation every 15 minutes','Until next review','Duty doctor (DOD)',1],
  ['Fall precautions: low bed, night light','Till discharge','Floor manager',2,'Floor manager'],
  ['Escort for all movement outside the ward','7 days','Floor manager',0,'Floor manager']],
 'Medication':[
  ['Medication under supervision: risk of poor compliance','Until next review','Treating psychiatrist',1],
  ['Mouth check after each dose','7 days','Treating psychiatrist'],
  ['Hold the dose and inform if drowsy or giddy','3 days','Duty doctor (DOD)']],
 'Watch for':[
  ['Watch for sedation and inform DOD','Until next review','Duty doctor (DOD)',1],
  ['Watch for tremor and stiffness','Until next review','Treating psychiatrist',2],
  ['Neuro checks every 2 hours','24 hours','Duty doctor (DOD)',2],
  ['Withdrawal symptoms: CIWA chart','3 days','Duty doctor (DOD)'],
  ['Sleep chart: hourly checks at night','3 days','Treating psychiatrist',2],
  ['Fluid intake and output chart','3 days','Duty doctor (DOD)',2]],
 'Diet and activity':[
  ['Diabetic diet','Till discharge','No one extra',0,'Kitchen'],
  ['Low salt diet','Till discharge','No one extra',0,'Kitchen'],
  ['Fluid restriction: 1.5 litres a day','Until next review','Duty doctor (DOD)'],
  ['Encourage meals and report if refused','7 days','Treating psychiatrist'],
  ['Supervised walk twice a day','7 days','No one extra',0,'Activity team']],
 'Call the doctor if':[
  ['Sugar above 250 or below 70 mg/dL','Until next review','Duty doctor (DOD)'],
  ['BP above 160/100','Until next review','Duty doctor (DOD)'],
  ['Pulse above 120 or below 50','Until next review','Duty doctor (DOD)'],
  ['Temperature above 100.4 °F','Until next review','Duty doctor (DOD)'],
  ['A dose is refused twice in a row','Until next review','Treating psychiatrist']],
 'Other':[['Other (write below)','Until next review','Duty doctor (DOD)']]
};
const ADV_UNTIL=['Until next review','24 hours','3 days','7 days','Till discharge'];
const ADV_INFORM=['Duty doctor (DOD)','RMO','Treating psychiatrist','Floor manager','No one extra'];
const ADV_HIGH=['Risk','Safety and supervision','Medication','Watch for'];
const ADV_FORM_CATS=['Watch for','Diet and activity','Call the doctor if','Other'];

/* ---- medicines: medicine, how often, when, how long ---- */
function roundMeds(){
  if(!isPsy()) return roundMedsOld();
  const R=S.rounds; const mc=R.mc; R.mon=R.mon||[];
  const cur=S.meds.filter(m=>!m.name.includes('waiting'));
  return `<section class="card"><div class="hd"><h3>Medicine</h3><div class="row" style="gap:8px">${mc.length?chip(mc.length+' pending','c-blue'):''}<button class="btn sm" onclick="medChartModal()">Full chart</button></div></div>
    <div class="scroll"><table class="t"><thead><tr><th>Current medicine</th><th>Freq.</th><th style="text-align:right">Change</th></tr></thead><tbody>
    ${cur.map((m,i)=>`<tr><td style="font-weight:600">${m.name}</td><td>${m.freq}</td><td style="text-align:right"><div class="row" style="justify-content:flex-end;gap:6px;flex-wrap:wrap">
      <button class="btn sm" aria-label="Edit ${m.name}" onclick="rmAct(${i},'Edit')">Edit</button><button class="btn sm" aria-label="Stop ${m.name}" onclick="rmAct(${i},'Stop')">Stop</button>
      <span id="rmE${i}" class="row" style="gap:6px;display:none"><select class="input" id="rmEf${i}" style="width:auto;min-height:30px;padding:3px 8px" aria-label="New frequency for ${m.name}">${FREQ.map(f=>`<option ${f===m.freq?'selected':''}>${f}</option>`).join('')}</select><select class="input" id="rmEd${i}" style="width:auto;min-height:30px;padding:3px 8px" aria-label="Dose for ${m.name}">${['Same dose','Increase dose','Reduce dose'].map(o=>`<option>${o}</option>`).join('')}</select><button class="btn sm pri" onclick="rmEdit(${i})">Apply</button></span></div></td></tr>`).join('')}
    </tbody></table></div>
    <div style="padding:12px 20px;border-top:1px solid var(--line-2);display:flex;flex-direction:column;gap:8px">
      <div class="lbl">Add medicine</div>
      <div class="row" style="gap:8px;flex-wrap:wrap">
        <select class="input" id="rmNew" style="flex:1 1 150px;min-width:0;width:auto;min-height:34px" aria-label="Medicine name"><option value="">Choose medicine</option>${DRUGS.map(d=>`<option>${d}</option>`).join('')}</select>
        <select class="input" id="rmF" style="width:auto;min-height:34px" aria-label="Frequency">${FREQ.map((f,i)=>`<option ${i===1?'selected':''}>${f}</option>`).join('')}</select>
        <select class="input" id="rmW" style="width:auto;min-height:34px" aria-label="When">${MED_WHEN.map(o=>`<option>${o}</option>`).join('')}</select>
        <button class="btn sm" onclick="const v=$('rmNew').value;if(!v){toast('Pick a medicine');return;}rmAdd('Start',v+', '+$('rmF').value+', '+$('rmW').value.toLowerCase())">Add</button></div></div>
    ${mc.length?`<div style="padding:4px 20px 16px;display:flex;flex-direction:column;gap:8px"><div class="lbl">Pending</div>${mc.map((c,i)=>`<div class="box row">${chip(c.act,c.act==='Stop'?'c-grey':'c-blue')}<span class="grow small">${c.text}</span>${chip(c.src,c.src==='From scribe'?'c-violet':'c-grey')}<button class="x" aria-label="Remove" onclick="S.rounds.mc.splice(${i},1);render()">×</button></div>`).join('')}
</div>`:''}
  </section>`;
}

/* ---- monitoring: parameter and how often, plus one-tap investigations ---- */
function monList(pid){S.mon=S.mon||{};return S.mon[pid]||(S.mon[pid]=MON_CUR.map(x=>[x[0],x[1],{by:'Dr. Aanya Sharma',at:'18 Oct 2026, 11:45 am'}]));}
function monTaskOf(par){return par==='Sugar (CBG)'?'sugar':'mon:'+par;}
function monRebuild(pid){
  const plan=NPLAN[pid]=NPLAN[pid]||{};
  Object.keys(plan).forEach(sl=>{plan[sl]=plan[sl].filter(t=>t!=='vit'&&t!=='sugar'&&!t.startsWith('mon:'));});
  const bySlot={},sugar=[];
  monList(pid).forEach(([par,f])=>{const slots=(MON_FREQ.find(x=>x[0]===f)||[0,[]])[1];
    slots.forEach(sl=>{if(par==='Sugar (CBG)')sugar.push(sl);else(bySlot[sl]=bySlot[sl]||[]).push(par);});});
  Object.keys(bySlot).forEach(sl=>{(plan[sl]=plan[sl]||[]).push('mon:'+bySlot[sl].join('|'));});
  sugar.forEach(sl=>{(plan[sl]=plan[sl]||[]).push('sugar');});
}
function monAdd(act,p,f){const R=S.rounds;R.mon=R.mon||[];R.mon=R.mon.filter(x=>x.p!==p);R.mon.push({act,p,f});render();toast(act==='Stop'?'Stop '+p+' added to pending':p+': '+monLabel(f)+' added to pending');}
function monActE(i){const b=$('monE'+i);if(b)b.style.display=b.style.display==='none'||!b.style.display?'flex':'none';}
function monEditApply(i,p){const v=$('monEf'+i).value;if(!v){toast('Pick a new frequency first');return;}monAdd('Change',p,v);}
function monAddForm(){const v=$('monP').value;if(!v){toast('Pick what to monitor');return;}monAdd('Start',v,$('monFs').value);}
function monQuickAdd(v){if(!v)return;const [act,p,f]=decodeURIComponent(v).split('|');if(!p||!f)return;monAdd(act==='Change'?'Change':'Start',p,f)}
function monShowFreq(i){const p=MON_PARAMS[i]?.[0],box=$('monFreqList');if(!p||!box)return;const R=S.rounds,WP=WARDS[R.ward],patient=WP[Math.min(R.idx[R.ward],WP.length-1)],active=monList(patient.id).find(x=>x[0]===p);box.innerHTML=`<div class="mon-freq-title">${p}</div>${MON_FREQ.map(f=>`<button type="button" class="mon-freq-option ${active&&active[1]===f[0]?'current':''}" onclick="monQuickAdd('${encodeURIComponent((active?'Change':'Start')+'|'+p+'|'+f[0])}')">${monLabel(f[0])}</button>`).join('')}`;document.querySelectorAll('.mon-param-option').forEach((b,j)=>b.classList.toggle('on',j===i))}
function monToggleMenu(){const m=$('monCascadeMenu'),b=$('monCascadeToggle');if(!m||!b)return;const open=m.hidden;m.hidden=!open;b.setAttribute('aria-expanded',String(open));if(open)monShowFreq(0)}
function invTog(x){const R=S.rounds;R.inv=R.inv||[];const i=R.inv.findIndex(y=>y[0]===x);if(i>=0)R.inv.splice(i,1);else R.inv.push([x,R.invW||'Tomorrow morning']);render();}
function roundMon(){
  if(!isPsy()) return '';
  const R=S.rounds; R.mon=R.mon||[]; R.inv=R.inv||[];
  const WP=WARDS[R.ward]; const p=WP[Math.min(R.idx[R.ward],WP.length-1)]; const cur=monList(p.id);
  const n=R.inv.length;
  const tot=n+R.mon.length;
  return `<section class="card"><div class="hd"><h3>Monitoring</h3>${tot?chip(tot+' pending','c-blue'):''}</div>
    <div class="mon-add-top"><div class="lbl" style="margin-bottom:6px">Add monitoring</div><div class="mon-cascade"><button type="button" id="monCascadeToggle" class="input mon-cascade-toggle" aria-haspopup="true" aria-expanded="false" onclick="monToggleMenu()">Choose parameter and frequency <span>▾</span></button><div id="monCascadeMenu" class="mon-cascade-menu" hidden><div class="mon-param-list">${MON_PARAMS.map((m,i)=>`<button type="button" class="mon-param-option ${i===0?'on':''}" onmouseenter="monShowFreq(${i})" onclick="monShowFreq(${i})">${m[0]} <span>›</span></button>`).join('')}</div><div id="monFreqList" class="mon-freq-list"></div></div></div></div>
    <div style="padding:12px 20px;border-top:1px solid var(--line-2);display:flex;flex-direction:column;gap:8px"><div class="row" style="justify-content:space-between"><div class="lbl">Investigations</div>
      <span class="row" style="gap:6px"><span class="tiny muted">Collect</span><select class="input" style="width:auto;min-height:30px;padding:3px 8px" aria-label="Collect" onchange="S.rounds.invW=this.value">${INV_WHEN.map(w=>`<option ${(R.invW||'Tomorrow morning')===w?'selected':''}>${w}</option>`).join('')}</select></span></div>
      <div class="row" style="gap:6px">${INV_LIST.map(x=>`<button class="tog ${R.inv.some(y=>y[0]===x)?'on':''}" style="height:28px;font-size:12px" onclick="invTog('${x}')">${x}</button>`).join('')}</div></div>
    ${tot?`<div style="padding:4px 20px 16px;display:flex;flex-direction:column;gap:8px"><div class="lbl">Pending</div>${R.mon.map((c,i)=>`<div class="box row">${chip('Monitor','c-green')}<span class="grow small">${c.act==='Stop'?'Stop monitoring '+c.p:c.p+': '+monLabel(c.f)}</span><button class="x" aria-label="Remove" onclick="S.rounds.mon.splice(${i},1);render()">×</button></div>`).join('')}${R.inv.map((c,i)=>`<div class="box row">${chip('Lab','c-violet')}<span class="grow small">${c[0]} · ${c[1]}</span><button class="x" aria-label="Remove" onclick="S.rounds.inv.splice(${i},1);render()">×</button></div>`).join('')}</div>`:''}
  </section>`;
}

/* ---- advice and guidance for the team: all lists ---- */
function roundAdvice(){ return isPsy()?roundAdviceDoc():roundAdviceOld(); }
function roundAdviceDoc(){
  const R=S.rounds; const a=R.adv; R.mon=R.mon||[]; R.inv=R.inv||[];
  R.ref=R.ref||[];const pending=(R.mc.length||a.length||R.mon.length||R.inv.length||R.ref.length)&&!R.drafted;
  const riskChoices=RISKS.filter(r=>{const c=riskCur(r.k);return !c.active&&!c.pending;}).map(r=>({risk:r.k,act:r.acts[0],label:r.label+': '+r.acts[0]}));
  const sel=(L,v)=>L.map(x=>`<option ${x===v?'selected':''}>${x}</option>`).join('');
  return `<section class="card"><div class="hd"><h3>Risks and instructions</h3>${pending?chip('Pending','c-blue'):''}</div>
    <div style="padding:12px 20px;display:flex;flex-direction:column;gap:10px">
      ${roundStand()}
      <label class="field"><span class="lbl">Add a risk instruction</span><select class="input" id="riskChoice" onchange="if(this.value!=='')riskPreset(this.value)"><option value="">Select a risk and instruction…</option>${riskChoices.map(x=>`<option value="${x.risk}|${encodeURIComponent(x.act)}">${x.label}</option>`).join('')}</select></label>
      ${a.length?`<div class="lbl" style="margin-top:4px">Pending</div>${a.map((x,i)=>`<div class="box row" style="align-items:flex-start">${chip(x.ty,ADV_HIGH.includes(x.ty)?'c-amber':'c-blue')}<span class="grow small">${x.text}<span class="tiny muted" style="display:block;margin-top:2px">For ${x.to}${x.until?' · '+x.until:''}${x.inform&&x.inform!=='No one extra'?' · Inform '+x.inform:''} · ${x.by}</span></span><button class="x" aria-label="Remove" onclick="S.rounds.adv.splice(${i},1);render()">×</button></div>`).join('')}`:''}
    </div></section>`;
}
function advCat(c){$('advI').innerHTML=ADV_OPTS[c].map(o=>`<option>${o[0]}</option>`).join('');advOpt();}
function advOpt(){const c=$('advC').value,o=ADV_OPTS[c].find(x=>x[0]===$('advI').value)||ADV_OPTS[c][0];$('advU').value=o[1];$('advN').value=o[2];$('advTo').value=o[4]||'Nursing staff';$('advXw').style.display=o[0].startsWith('Other')?'':'none';}
function advPush(c,o,text){S.rounds.adv.push({to:o[4]||'Nursing staff',ty:c,text,until:o[1],inform:o[2],by:signer()});}
function advQuick(c,i){const o=ADV_OPTS[c][i];advPush(c,o,o[0]);render();toast('Added for '+(o[4]||'Nursing staff'));}
function advAddForm(){
  const c=$('advC').value,o=ADV_OPTS[c].find(x=>x[0]===$('advI').value)||ADV_OPTS[c][0];let text=o[0];
  if(text.startsWith('Other')){text=$('advX').value.trim();if(!text){toast('Write the instruction');return;}}
  S.rounds.adv.push({to:$('advTo').value,ty:c,text,until:$('advU').value,inform:$('advN').value,by:signer()});render();toast('Added for '+$('advTo').value);
}

/* ---- confirm: orders reach the nurse shift board ---- */
function monApply(pid,c){
  const L=monList(pid),i=L.findIndex(x=>x[0]===c.p);
  if(c.act==='Stop'){if(i>=0)L.splice(i,1);}else if(i>=0){L[i][1]=c.f;L[i][2]=whoAt();}else L.push([c.p,c.f,whoAt()]);
  monRebuild(pid);
}
function confirmRound(){
  const R=S.rounds; R.mon=R.mon||[]; R.inv=R.inv||[];
  const WP=WARDS[R.ward], p=WP[Math.min(R.idx[R.ward],WP.length-1)], pn=p.name, by=signer()+' · round just now';
  R.ref=R.ref||[]; const n=R.mc.length+R.mon.length+R.inv.length, g=R.adv.length, rf=R.ref.length;
  S.nInstr=S.nInstr||[]; const add=(text,ty,cls,detail)=>{S.nN=(S.nN||0)+1;S.nInstr.unshift([pn,by,text,ty,cls,detail||'','n'+S.nN]);};
  R.adv.forEach(a=>add(a.text,a.ty||'Advice',ADV_HIGH.includes(a.ty)?'c-amber':'c-blue',[a.until?(/^(Until|Till)/.test(a.until)?a.until:'For '+a.until):'',a.inform&&a.inform!=='No one extra'?'Inform '+a.inform:'',a.to&&a.to!=='Nursing staff'?'For '+a.to:''].filter(Boolean).join(' · ')));
  R.inv.forEach(c=>add(c[0],'Lab','c-violet','Collect: '+c[1]));
  R.mon.forEach(c=>add(c.act==='Stop'?'Stop monitoring '+c.p:c.p+': '+monLabel(c.f),'Monitoring','c-green',c.act==='Change'?'Frequency changed':''));
  R.mc.forEach(c=>add(c.act+' '+c.text,'Medicine','c-blue',''));
  R.mon.forEach(c=>monApply(p.id,c));
  S.stand=S.stand||[]; S.standN=S.standN||0;
  R.adv.slice().reverse().forEach(a=>S.stand.unshift({id:'st'+(++S.standN),pid:p.id,pn,risk:a.risk,text:a.text,ty:a.ty,until:a.until,inform:a.inform,to:a.to,by:signer(),when:clock()}));
  S.referrals=S.referrals||[]; S.refN=S.refN||0;
  R.ref.slice().reverse().forEach(r=>S.referrals.unshift(Object.assign({id:'ref'+(++S.refN),pid:p.id,pn,by:signer()},r)));
  R.idx[R.ward]++;R.drafted=false;R.mc=[];R.adv=[];R.mon=[];R.inv=[];R.ref=[];R.tnote='';S.done.daily=R.idx['Male ward']>=PTS.length;render();
  {const parts=[];if(n)parts.push(n+' order'+(n===1?'':'s'));if(g)parts.push(g+' instruction'+(g===1?'':'s'));if(rf)parts.push(rf+' referral'+(rf===1?'':'s')+' to the RMO');toast('Saved'+(parts.length?': '+parts.join(', '):'')+((n||g)?'. Sent to nursing and the team':''));}
}
function vitChips(p){return p.id==='neel'?chip('BP 128/82','c-grey')+chip('Pulse 90','c-grey')+chip('Temp 98.8 °F','c-grey')+chip('SpO₂ 99%','c-grey')+chip('Wt 68 kg','c-grey'):'';}

/* ---- referral: becomes a task for the RMO (RMO care, or an outside doctor the RMO arranges) ---- */
const REF_KIND=['RMO (inside Tulasi)','Outside doctor (RMO arranges)'];
const REF_RMO_WHY=['Monitoring of medically unstable patient','Observation of medically unstable patient','Dressing','First aid','Monitoring of vitals','Physical examination','Diet plan: diabetic','Diet plan: weight gain','Diet plan: weight loss','Diet plan: low sodium','Other reason'];
const REF_OUT_TO=['General physician','Endocrinologist','Cardiologist','Neurologist','Dermatologist','ENT','Ophthalmologist','Orthopaedic surgeon','General surgeon','Gastroenterologist','Nephrologist','Chest physician','Gynaecologist','Dentist','Other specialist'];
const REF_OUT_WHY=['Uncontrolled blood sugar','Abnormal ECG or chest pain','High or low blood pressure','Tremor, weakness or seizure','Skin rash or drug reaction','Fever or infection','Pain or injury after a fall','Abnormal blood reports','Fitness before MECT or procedure','Other reason'];
const REF_URG=['Routine (within 3 days)','Within 24 hours','Urgent today'];
const REF_RMO_HOW=['RMO sees the patient on the ward'];
const REF_OUT_HOW=['Doctor visits Tulasi','Take patient to the doctor with escort','Phone or video consult'];
const REF_QUICK=[
 {kind:REF_KIND[0],to:'RMO on duty',why:'Monitoring of medically unstable patient',urg:'Urgent today',how:REF_RMO_HOW[0]},
 {kind:REF_KIND[0],to:'RMO on duty',why:'Dressing',urg:'Within 24 hours',how:REF_RMO_HOW[0]},
 {kind:REF_KIND[0],to:'RMO on duty',why:'Diet plan: diabetic',urg:'Routine (within 3 days)',how:REF_RMO_HOW[0]},
 {kind:REF_KIND[1],to:'Endocrinologist',why:'Uncontrolled blood sugar',urg:'Within 24 hours',how:REF_OUT_HOW[1]},
 {kind:REF_KIND[1],to:'General physician',why:'Abnormal blood reports',urg:'Within 24 hours',how:REF_OUT_HOW[0]}];
const refOut=r=>r.kind===REF_KIND[1];
function refTask(r){return {id:r.id,pid:r.pid,ref:true,late:r.urg==='Urgent today',title:refOut(r)?'Arrange '+r.to+' · '+r.pn:r.why+' · '+r.pn,meta:(refOut(r)?r.why+' · '+r.how:'Referred to RMO')+' · from '+r.by+' on rounds',due:r.urg,chipc:'c-blue',go:'#/patient/'+(r.pid||'neel')+'/overview'};}
function refKind(){
  const o=$('refK').value===REF_KIND[1],sel=L=>L.map(x=>`<option>${x}</option>`).join('');
  $('refTo').innerHTML=o?sel(REF_OUT_TO):'<option>RMO on duty</option>';$('refTo').disabled=!o;
  $('refWhy').innerHTML=sel(o?REF_OUT_WHY:REF_RMO_WHY);$('refHow').innerHTML=sel(o?REF_OUT_HOW:REF_RMO_HOW);refOpt();
}
function refOpt(){const o=$('refTo').value.startsWith('Other')||$('refWhy').value.startsWith('Other');$('refXw').style.display=o?'':'none';}
function refPush(r){const R=S.rounds;R.ref=R.ref||[];R.ref.push(r);render();toast('Referral added: it becomes a task for the RMO when you confirm');}
function refQuick(i){refPush(Object.assign({},REF_QUICK[i]));}
function refAddChoice(){const destination=$('refChoice').value,reason=$('refFreeReason').value.trim();if(!destination){toast('Choose who to refer to first');return}if(!reason){toast('Enter a referral reason');$('refFreeReason').focus();return}const outside=destination==='outside';refPush({kind:outside?REF_KIND[1]:REF_KIND[0],to:outside?'Outside Tulasi':'RMO on duty',why:reason,urg:'Routine (within 3 days)',how:outside?REF_OUT_HOW[0]:REF_RMO_HOW[0]})}
function refAddForm(){
  let to=$('refTo').value,why=$('refWhy').value;const x=$('refX').value.trim();
  if(to.startsWith('Other')||why.startsWith('Other')){if(!x){toast('Write the specialty or reason');return;}if(to.startsWith('Other'))to=x;else why=x;}
  refPush({kind:$('refK').value,to,why,urg:$('refUrg').value,how:$('refHow').value});
}
function roundRef(){
  if(!isPsy()) return '';
  const R=S.rounds;R.ref=R.ref||[];const WP=WARDS[R.ward];const p=WP[Math.min(R.idx[R.ward],WP.length-1)];
  const sent=(S.referrals||[]).filter(r=>r.pid===p.id), sel=L=>L.map(o=>`<option>${o}</option>`).join('');
  const lab=r=>refOut(r)?r.to+' · '+r.why:'RMO · '+r.why;
  return `<section class="card"><div class="hd"><h3>Referral</h3>${R.ref.length?chip(R.ref.length+' pending','c-blue'):''}</div>
    <div style="padding:12px 20px;display:flex;flex-direction:column;gap:10px">
      <label class="field"><span class="lbl">Refer to</span><select class="input" id="refChoice"><option value="">Select destination…</option><option value="rmo">RMO</option><option value="outside">Outside Tulasi</option></select></label>
      <label class="field"><span class="lbl">Reason</span><textarea class="input" id="refFreeReason" rows="2" placeholder="Write the reason for this referral"></textarea></label>
      <div class="row" style="justify-content:flex-end"><button class="btn sm pri" onclick="refAddChoice()">Add referral</button></div>
      ${R.ref.length?`<div class="lbl" style="margin-top:4px">Pending</div>${R.ref.map((r,i)=>`<div class="box row">${chip(refOut(r)?'Outside doctor':'RMO',r.urg==='Urgent today'?'c-amber':'c-violet')}<span class="grow small">${lab(r)}<span class="tiny muted" style="display:block;margin-top:2px">${r.urg} · ${r.how} · task for the RMO</span></span><button class="x" aria-label="Remove" onclick="S.rounds.ref.splice(${i},1);render()">×</button></div>`).join('')}<div class="row" style="justify-content:flex-end"></div>`:''}
      ${sent.length?`<div class="lbl" style="margin-top:4px">Sent for ${p.name}</div>${sent.map(r=>`<div class="box row">${chip(S.done[r.id]?'Done':'With RMO',S.done[r.id]?'c-green':'c-amber')}<span class="grow small">${lab(r)}</span><span class="tiny muted">${r.urg}</span></div>`).join('')}`:''}
    </div></section>`;
}

/* ---- RMO daily tasks (from Anu), nursing chart for the RMO, diet plans ---- */
const DIETS=['Diabetic diet','Weight gain diet','Weight loss diet','Low sodium diet','Normal diet'];
const RMO_DAILY=()=>{const n=(S.referrals||[]).filter(r=>/medically unstable/i.test(r.why)&&!S.done[r.id]&&inScope(r.pid)).length;return [
 {id:'rm1',title:'Physical exams',meta:peMeta(),due:'Today',chipc:'c-blue',go:'#/inpatients'},
 {id:'rm2',title:'Review nursing chart',meta:'Medicines, vitals and monitoring',due:'Open',chipc:'c-grey',go:'#/nursing'},
 {id:'rm3',title:'Dressings and vitals',meta:'Dressings due and out-of-range vitals',due:'Today',chipc:'c-blue',go:'#/nursing'},
 {id:'rm4',title:'Unstable patients',meta:n?n+' referred by the psychiatrist and not yet done':(inScope('neel')?'None referred today · Neel Bose had sugar 192 yesterday':'None referred today'),due:n?'Ongoing':'Today',chipc:'c-blue',go:'#/inpatients'},
 {id:'rm5',title:'Diet plans',meta:'Kitchen and nursing see the diet',due:'Today',chipc:'c-blue',diet:true}];};
/* ---- RMO: what is due for this patient (only the RMO's own tasks) ---- */
function rmoDue(){
  const d=[],pid='neel',pe=(S.pe||{})[pid];
  if(S.admNo>2&&!S.rmoAdm)d.push(['Admission forms and short note','today',true,'',"rmoAdmModal()"]);
  if(!pe)d.push(['Physical exam and nutrition','today',false,'',"peModal('neel')"]);
  else if(pe.stable!=='Stable')d.push(['Retake physical exam','today',true,'',"peModal('neel')"]);
  const vs=NSLOTS.find((sl,si)=>si>=NOWI&&((NPLAN[pid]||{})[sl]||[]).includes('vit'));
  if(vs)d.push(['Vitals and sugar check',vs,false,'vitals']);
  (S.referrals||[]).filter(r=>r.pid===pid&&!refOut(r)&&!S.done[r.id]).forEach(r=>d.push([r.why,r.urg,r.urg==='Urgent today','','go(\'#/myday\')']));
  if(!standFor(pid).some(x=>x.diet))d.push(['Diet plan','today',false,'',"dietModal('neel')"]);
  return d;
}
function rmoAdmModal(){
  const a=S.rmoAdm||{},pe=(S.pe||{}).neel,F=[['cc','Chief complaints','e.g. Irritability and overspending for 3 weeks'],['hopi','History of presenting illness (HOPI)','Onset, course, what the family noticed'],['pe','Physical examination',pe?'Done on '+pe.on+', '+pe.stable.toLowerCase():'Vitals and systemic findings'],['obs','Observation','Sleep, appetite, orientation, ward behaviour so far'],['beh','Behaviour','e.g. Restless, talkative, cooperative with staff']];
  openModal(`<div class="mh"><h3>Admission · Neel Bose</h3><button class="x" aria-label="Close" onclick="closeModal()">×</button></div>
  <div class="mb"><div class="field"><span class="lbl">Admission forms</span><div style="display:flex;flex-direction:column;gap:6px">${['Admission consent form','Letter of undertaking (advance and charges)','Form E · request for admission (rule 8)','High risk informed consent'].map((x,i)=>`<label class="row" style="gap:8px;flex-wrap:nowrap"><input type="checkbox" class="rmF" ${a.forms?'checked':''}><span class="small">${x}</span></label>`).join('')}</div></div>
  <div class="lbl" style="margin-top:4px">Short admission note</div>
  ${F.map(f=>`<label class="field"><span class="lbl">${f[1]}</span><textarea class="input" id="ra_${f[0]}" rows="2" placeholder="${f[2]}">${hesc(a[f[0]]||'')}</textarea></label>`).join('')}
  <div id="raE" class="small" style="color:var(--red);display:none"></div></div>
  <div class="mf"><button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="rmoAdmSave()">Save admission</button></div>`);
}
function rmoAdmSave(){
  const v=k=>$('ra_'+k).value.trim(),boxes=[...document.querySelectorAll('.rmF')];
  if(!v('cc')){$('raE').textContent='Write the chief complaints first';$('raE').style.display='block';return;}
  if(!boxes.every(b=>b.checked)){$('raE').textContent='Tick every admission form that has been taken';$('raE').style.display='block';return;}
  S.rmoAdm={forms:true,cc:v('cc'),hopi:v('hopi'),pe:v('pe'),obs:v('obs'),beh:v('beh'),by:signer(),at:clock()};
  closeModal();render();toast('Admission saved. The psychiatrist can see the note.');
}
function dietModal(pid){
  openModal(`<div class="mh"><h3>Diet plan</h3><button class="x" aria-label="Close" onclick="closeModal()">×</button></div>
  <div class="mb"><label class="field"><span class="lbl">Patient</span><select class="input" id="dtP">${(S.role==='rmo'?scopePts():PTS).map(p=>`<option value="${p.id}" ${p.id===pid?'selected':''}>${p.name} · ${p.room}</option>`).join('')}</select></label>
  <label class="field"><span class="lbl">Diet</span><select class="input" id="dtD">${DIETS.map(d=>`<option>${d}</option>`).join('')}</select></label>
  <div class="tiny muted">The kitchen and nursing see it on the patient until it is changed.</div></div>
  <div class="mf"><button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="dietSave()">Save diet plan</button></div>`);
}
function dietSave(){
  const p=allPts().find(x=>x.id===$('dtP').value),d=$('dtD').value;S.stand=S.stand||[];S.standN=S.standN||0;
  S.stand.forEach(x=>{if(x.pid===p.id&&x.diet)x.stopped=true;});
  if(d!=='Normal diet') S.stand.unshift({id:'st'+(++S.standN),pid:p.id,pn:p.name,text:d,ty:'Diet and activity',until:'Until changed',inform:'No one extra',to:'Kitchen',by:signer(),when:clock(),diet:true});
  S.nInstr=S.nInstr||[];S.nN=(S.nN||0)+1;S.nInstr.unshift([p.name,signer()+' · just now',d,'Diet','c-blue','Kitchen and nursing','n'+S.nN]);
  closeModal();render();toast('Diet plan saved for '+p.name);
}
function vNurseView(){
  let h=vNurseDay();
  if(S.role!=='nurse'){$('title').textContent='Nursing chart';
    if(chartLikeRmo())h=floorTabs()+h;
    h=h.replace('Shift board','Nursing chart').replace(' · Sister Rekha · ',' · ')
       .replace(`<button class="btn soft" onclick="nHandoverModal()">Handover note</button><button class="btn pri" onclick="toast('Starts the 2 pm medicine round, patient by patient')">Start 2 pm medicine round</button>`,S.role==='psychologist'?'':`<button class="btn pri" onclick="addMedModal()">Add medication</button>`);}
  return h;
}

/* ===== nurse shift handover note: written by the nurse in charge, read by the next shift and the RMO ===== */
const NH_TO=['Night shift nurse in charge (8 pm)','Evening shift nurse in charge'];
function nhStats(){
  let given=0,late=0;const bad=new Set();
  PTS.forEach(p=>{
    NSLOTS.forEach((sl,si)=>{
      ((NMEDS[p.id]||{})[sl]||[]).forEach((_,i)=>{const v=nmState(p.id,sl,i,si);if(v==='stop')return;if(v==='done')given++;else if(v==='ref'||v==='held')bad.add(p.name);else if(si<NOWI)late++;});
      ((NPLAN[p.id]||{})[sl]||[]).forEach((t,ti)=>{const key=p.id+'|'+sl+'|'+ti;const st=S.nd[key]||(si<NOWI&&key!=='neel|12 pm|0'?'done':'');if(!st&&si<NOWI)late++;});
    });
  });
  late+=V3.gridCounts(PTS).late;return {pts:PTS.length,given,late,risk:PTS.filter(p=>p.risk).length,bad:[...bad]};
}
function nHandoverModal(){
  const st=nhStats(),last=(S.nHandovers||[])[0];
  const wmap={};(last?last.watch:PTS.filter(p=>p.risk).map(p=>({pid:p.id,text:''}))).forEach(w=>{wmap[w.pid]=w.text||'';});
  const draft=last?last.sum:`Day shift, Male ward: ${st.pts} patients. ${st.given} doses given${st.bad.length?'; refused or held: '+st.bad.join(', '):''}${st.late?'; '+st.late+' task'+(st.late===1?'':'s')+' missed or late':''}.`;
  const rows=PTS.slice().sort((a,b)=>(b.risk?1:0)-(a.risk?1:0)).map(p=>{const on=wmap[p.id]!==undefined;
    return `<div class="r ${on?'on':''}" data-pid="${p.id}" data-pn="${hesc(p.name)}"><div class="nm"><strong>${hesc(p.name)}</strong> ${p.risk?chip('High risk','c-red'):''}<div class="tiny muted">${p.room.replace('Room ','R-')} · ${EX[p.id][0]}</div></div><button class="tog ${on?'on':''}" onclick="nhWatch(this)">Watch closely</button><input class="input nt" ${on?'':'hidden'} value="${hesc(wmap[p.id]||'')}" placeholder="What the next shift should watch for" aria-label="Note for ${hesc(p.name)}"></div>`;}).join('');
  openModal(`<div class="mh"><div><h3>Shift handover note</h3><div class="tiny muted" style="margin-top:2px">Day shift 8 am to 8 pm · Male ward · Sister Rekha</div></div><button class="x" aria-label="Close" onclick="closeModal()">×</button></div>
  <div class="mb">
    <div class="nhstats"><div><span class="tiny muted">Patients</span><b>${st.pts}</b></div><div><span class="tiny muted">Doses given</span><b style="color:var(--green)">${st.given}</b></div><div><span class="tiny muted">Missed or late</span><b style="color:${st.late?'var(--amber)':'inherit'}">${st.late}</b></div><div><span class="tiny muted">High risk</span><b>${st.risk}</b></div></div>
    <div class="tiny muted" style="margin-top:-6px">Counted from the shift board${st.bad.length?'. Refused or held: '+st.bad.join(', '):''}.</div>
    <div class="grid2"><label class="field"><span class="lbl">Handing over to</span><select class="input" id="nhTo">${NH_TO.map(x=>`<option ${last&&last.to===x?'selected':''}>${x}</option>`).join('')}</select></label>
      <label class="check" style="border:0;padding:22px 0 0;align-items:center"><input type="checkbox" id="nhRmo" ${!last||last.rmo?'checked':''}><span><strong>Also send to the RMO on duty</strong></span></label></div>
    <label class="field"><span class="lbl">How the shift went (required)</span><textarea class="input" id="nhSum" rows="3" placeholder="Sleep, meals, behaviour, anything that changed">${hesc(draft)}</textarea><span class="tiny muted">Drafted from the board. Edit it before you send.</span><div id="nhErr" class="small" style="color:var(--red);display:none">Write how the shift went first</div></label>
    <div class="field"><span class="lbl">Patients to watch</span><div class="nhw">${rows}</div></div>
    <label class="field"><span class="lbl">Still pending for the next shift</span><textarea class="input" id="nhPend" rows="2" placeholder="e.g. 8 pm sugar for Neel Bose; serum lithium at 7 am tomorrow">${hesc(last?last.pend:'')}</textarea></label>
  </div>
  <div class="mf"><button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="nhSend()">${last?'Send update':'Send handover'}</button></div>`);
  $('modal').style.width='min(720px,100%)';
}
function nhWatch(b){const r=b.closest('.r'),on=!b.classList.contains('on');b.classList.toggle('on',on);r.classList.toggle('on',on);const i=r.querySelector('.nt');i.hidden=!on;if(on)i.focus();}
function nhSend(){
  const sum=$('nhSum').value.trim();
  if(!sum){$('nhErr').style.display='block';$('nhSum').focus();return;}
  const watch=[...document.querySelectorAll('#modal .nhw .r.on')].map(r=>({pid:r.dataset.pid,pn:r.dataset.pn,text:r.querySelector('.nt').value.trim()}));
  const to=$('nhTo').value,rmo=$('nhRmo').checked;
  S.nHandovers=S.nHandovers||[];
  S.nHandovers.unshift({id:Date.now(),at:clock(),by:'Sister Rekha',shift:'Day shift 8 am to 8 pm',to,rmo,sum,pend:$('nhPend').value.trim(),watch,st:nhStats(),read:false});
  S.done.n6=true;
  closeModal();render();
  toast('Handover note sent to the '+to.split(' (')[0].toLowerCase()+(rmo?' and the RMO on duty':''));
}
function nhRead(id){const h=(S.nHandovers||[]).find(x=>x.id===id);if(h)h.read=true;render();toast('Marked read');}
function nhRmoCard(){
  const L=(S.nHandovers||[]).filter(h=>h.rmo);
  if(!L.length||!locFloors().includes('Male ward'))return '';
  const unread=L.filter(h=>!h.read).length;
  return `<section class="card"><div class="hd"><div><h3>From nursing · Male ward ${unread?chip(unread+' new','c-blue'):''}</h3><div class="small muted" style="margin-top:4px">Shift handover notes the nurse in charge sent to the RMO</div></div></div>
    <div class="pad" style="display:flex;flex-direction:column;gap:12px">${L.slice(0,3).map(h=>`<div class="nhsent"><div class="row" style="justify-content:space-between;gap:8px"><div><strong>${hesc(h.shift)} · ${hesc(h.by)}</strong><div class="tiny muted">Sent ${h.at} to ${hesc(h.to.split(' (')[0])}</div></div>${h.read?chip('Read','c-green'):`<button class="btn sm" onclick="nhRead(${h.id})">Mark read</button>`}</div>
      <div class="small" style="margin-top:8px">${hesc(h.sum)}</div>
      <div class="row" style="gap:6px;margin-top:8px">${chip(h.st.given+' doses given','c-green')}${h.st.late?chip(h.st.late+' missed or late','c-amber'):''}${h.st.bad.length?chip('Refused or held: '+hesc(h.st.bad.join(', ')),'c-red'):''}</div>
      ${h.watch.length?`<div class="lbl" style="margin-top:10px">Watch closely</div>${h.watch.map(w=>`<div class="small" style="margin-top:4px"><strong>${hesc(w.pn)}</strong>${w.text?' · '+hesc(w.text):''}</div>`).join('')}`:''}
      ${h.pend?`<div class="lbl" style="margin-top:10px">Still pending</div><div class="small" style="margin-top:4px">${hesc(h.pend)}</div>`:''}</div>`).join('')}</div></section>`;
}

/* ===== nursing follow-through: standing orders, seen, inform the doctor, monitoring order sheet ===== */
const NSTATIC=['s1','s2','s3'];
const clock=()=>{try{return V3.clockStr()}catch(e){return new Date().toLocaleTimeString('en-IN',{hour:'numeric',minute:'2-digit'})}};
const standFor=pid=>(S.stand||[]).filter(x=>x.pid===pid&&!x.stopped);
const informLabel=i=>{const m=String(i||'').match(/\((.*)\)/);return m?m[1]:i;};
const nUnseen=()=>(S.nInstr||[]).map(x=>x[6]).concat(NSTATIC).filter(i=>!(S.seen||{})[i]).length;
function seenCell(id){const v=(S.seen||{})[id];if(!v&&S.role==='rmo')return '';return v?`<span class="tiny muted" style="text-align:right">Seen by ${v.by}<br>${v.at}</span>`:`<button class="btn sm" onclick="nSeen('${id}')">Mark seen</button>`;}
function instrAct(name,id){const v=(S.seen||{})[id];const open="go('#/patient/"+((allPts().find(x=>x.name===name)||{id:'neel'}).id)+"/overview')";
  return `<div class="row" style="gap:8px;flex-wrap:nowrap;margin-left:auto"><button class="btn sm" onclick="${open}">Open patient</button>${v?`<span class="tiny muted" style="text-align:right">Seen by ${v.by}<br>${v.at}</span>`:`<button class="btn sm pri" onclick="nSeen('${id}')">Mark seen</button>`}</div>`;}
function nSeen(id){S.seen=S.seen||{};S.seen[id]={by:signer(),at:clock()};render();toast('Marked seen by '+signer());}
function standChips(pid){const L=standFor(pid);if(!L.length)return '';return `<div class="row" style="gap:4px;margin-top:4px;flex-wrap:wrap">${L.slice(0,2).map(x=>`<span class="chip ${ADV_HIGH.includes(x.ty)?'c-amber':'c-blue'}" title="${x.text}">${x.text.split(':')[0]}</span>`).join('')}${L.length>2?`<span class="chip c-grey" title="${L.slice(2).map(x=>x.text).join('; ')}">+${L.length-2}</span>`:''}</div>`;}
function standRow(){
  const L=standFor('neel'); if(!L.length) return '';
  const nurse=S.role==='nurse';
  return `<div style="grid-column:1/-1;border:0;padding:0 0 6px"><span class="lbl">Standing orders · ${L.length}</span><div style="display:flex;flex-direction:column;gap:6px;margin-top:6px">${L.map(x=>`<div class="box row" style="align-items:flex-start;gap:10px">${chip(x.ty,ADV_HIGH.includes(x.ty)?'c-amber':'c-blue')}<span class="grow small"><strong>${x.text}</strong><span class="tiny muted" style="display:block;margin-top:2px">${x.until||''}${x.inform&&x.inform!=='No one extra'?' · Inform '+x.inform:''} · ordered by ${x.by}, ${x.when}${x.inf?' · '+informLabel(x.inform)+' informed '+x.inf:''}</span></span>${nurse&&x.inform&&x.inform!=='No one extra'?`<button class="btn sm" onclick="informDoc('${x.id}')">Inform ${informLabel(x.inform)}</button>`:''}${isPsy()?`<button class="btn sm" onclick="stopStand('${x.id}')">Stop</button>`:''}</div>`).join('')}</div></div>`;
}
function informDoc(id){
  const x=(S.stand||[]).find(y=>y.id===id);if(!x)return;x.inf=clock();
  S.events.unshift({id:Date.now(),when:'Today, now',type:'Nurse concern',sev:'',by:signer(),duty:x.inform,detail:'Nurse informed '+informLabel(x.inform)+': '+x.text+' ('+x.pn+')',ack:false});
  render();toast(informLabel(x.inform)+' informed. It shows in the doctors\' events log.');
}
function stopStand(id){
  const x=(S.stand||[]).find(y=>y.id===id);if(!x)return;x.stopped=true;
  S.nInstr=S.nInstr||[];S.nN=(S.nN||0)+1;S.nInstr.unshift([x.pn,signer()+' · just now','Stopped: '+x.text,'Stopped','c-grey','','n'+S.nN]);
  render();toast('Stopped. Nursing is told.');
}
function roundStand(){
  const R=S.rounds,WP=WARDS[R.ward],p=WP[Math.min(R.idx[R.ward],WP.length-1)],L=standFor(p.id);
  if(!L.length) return '';
  return `<div class="lbl">Active for ${p.name} · until stopped</div>${L.map(x=>`<div class="box row" style="align-items:flex-start">${chip(x.ty,ADV_HIGH.includes(x.ty)?'c-amber':'c-blue')}<span class="grow small">${x.text}<span class="tiny muted" style="display:block;margin-top:2px">${x.until||''}${x.inform&&x.inform!=='No one extra'?' · Inform '+x.inform:''} · ${x.by}, ${x.when}${x.inf?' · '+informLabel(x.inform)+' informed '+x.inf:''}</span></span><button class="btn sm" onclick="stopStand('${x.id}')">Stop</button></div>`).join('')}`;
}
function monSheet(){
  const L=monList(S.pid||'neel');
  return `<section class="card"><div class="hd"><div><h3>Monitoring orders</h3><div class="small muted" style="margin-top:4px">Ordered by the treating team along with the medicines. Each one appears on the shift board at the times shown.</div></div></div>
    <div class="scroll"><table class="t"><thead><tr><th>Monitor</th><th>How often</th><th>On the shift board</th><th>Ordered by</th></tr></thead><tbody>${L.map(c=>{const sl=(MON_FREQ.find(f=>f[0]===c[1])||[0,[]])[1],w=c[2]||{};return `<tr><td style="font-weight:600">${c[0]}</td><td>${monLabel(c[1])}</td><td class="small muted">${sl.length?sl.join(', '):'Not on the daily board'}</td><td class="small">${w.by||'Not recorded'}<span class="byl">${w.at||''}</span></td></tr>`;}).join('')||'<tr><td colspan="4" class="small muted">No monitoring ordered.</td></tr>'}</tbody></table></div></section>`;
}
function pVitals(){return monSheet()+pVitalsOld();}

/* ---- risk-based nursing instructions: "Risk of harm to self: 24 hour supervision" ---- */
const RISKS=[
 {k:'harm',label:'Risk of harm to self',inform:'Duty doctor (DOD)',acts:['24 hour supervision','One to one observation','Observation every 15 minutes','Remove sharps and ligature risks']},
 {k:'abscond',label:'Risk of absconding',inform:'Duty doctor (DOD)',acts:['24 hour supervision','Escort for all movement outside the ward','Door and gate checks every hour']},
 {k:'comp',label:'Risk of poor compliance',inform:'Treating psychiatrist',acts:['Medication under supervision','Mouth check after each dose','Inform psychiatrist if a dose is refused']},
 {k:'sed',label:'Risk of sedation',inform:'Duty doctor (DOD)',acts:['Watch for sedation and inform DOD','Hold the dose and inform DOD if drowsy','Check vitals 2 hours after each dose']},
 {k:'others',label:'Risk of harm to others',inform:'Duty doctor (DOD)',more:1,acts:['24 hour supervision','One to one observation','Call for help early; do not confront alone']},
 {k:'fall',label:'Risk of falls',inform:'Floor manager',more:1,acts:['Fall precautions: low bed, night light','Assist with walking','Neuro checks every 2 hours']},
 {k:'seiz',label:'Risk of seizure',inform:'Duty doctor (DOD)',more:1,acts:['Seizure precautions','Watch for withdrawal symptoms (CIWA chart)']},
 {k:'intake',label:'Risk of poor intake',inform:'Treating psychiatrist',more:1,acts:['Encourage meals and report if refused','Fluid intake and output chart','Weigh weekly']}];
function riskCur(k){const R=S.rounds,WP=WARDS[R.ward],p=WP[Math.min(R.idx[R.ward],WP.length-1)];return {p,active:standFor(p.id).find(x=>x.risk===k),pending:(R.adv||[]).some(x=>x.risk===k)};}
function riskPush(k,act){const r=RISKS.find(x=>x.k===k);S.rounds.adv.push({to:'Nursing staff',ty:'Risk',risk:k,text:r.label+': '+act,until:S.rounds.rkU||'Until next review',inform:r.inform,by:signer()});render();toast(r.label+' added for nursing');}
function riskAdd(k){riskPush(k,$('rk_'+k).value);}
function riskPreset(v){const [k,a]=v.split('|');if(!k||!a)return;riskPush(k,decodeURIComponent(a));}
function riskMore(){riskPush($('rkM').value,$('rkMa').value);}
function riskMoreCat(){const r=RISKS.find(x=>x.k===$('rkM').value);$('rkMa').innerHTML=r.acts.map(a=>`<option>${a}</option>`).join('');}

/* ---- stop or edit a current medicine ---- */
function rmCur(){return S.meds.filter(m=>!m.name.includes('waiting'));}
function rmAct(i,v){const m=rmCur()[i];if(!m)return;if(v==='Stop'){rmAdd('Stop',m.name);return;}const b=$('rmE'+i);if(b)b.style.display=b.style.display==='none'||!b.style.display?'flex':'none';}
function rmEdit(i){const m=rmCur()[i],f=$('rmEf'+i).value,d=$('rmEd'+i).value;
  const parts=[f!==m.freq?f:null,d!=='Same dose'?d.toLowerCase():null].filter(Boolean);
  if(!parts.length){toast('Change the frequency or the dose first');return;}
  rmAdd('Change',m.name+': '+parts.join(', '));}

function roundCount(){const R=S.rounds;return (R.mc||[]).length+(R.adv||[]).length+(R.mon||[]).length+(R.inv||[]).length+(R.ref||[]).length;}
function roundFooter(){const n=roundCount();if(!n||S.rounds.drafted)return '';
  return `<div class="rfoot"><span class="small"><b>${n}</b> ready to send: medicine, monitoring, risks and referrals</span><button class="btn pri" onclick="confirmRound()">Save and next patient</button></div>`;}

/* ---- Daily patient progress update (nurse fills, doctors and RMO view) ---- */
const UPD=[
 ['1. Overall medical status',[
  ['cond','Condition',['Stable under supervision','Symptomatic']],
  ['meds','Medications administered',['Yes','No']],
  ['sleep','Sleep (last night)',['Adequate','Disturbed']],
  ['appetite','Appetite',['Adequate','Reduced','Increased']]]],
 ['2. Mental status and psychological well-being',[
  ['cons','Consciousness',['Alert','Drowsy','Confused','Disoriented']],
  ['mood','Mood',['Calm','Anxious','Depressed','Irritable','Elated','Fluctuating']]]],
 ['3. Self-care and daily functioning',[
  ['care','Self-care',['Independent','Assisted','Refused']],
  ['group','Group sessions',['Attended','Not attended','Partially']]]],
 ['4. Behavioural and safety status',[
  ['agit','Agitation',['None','Mild','Moderate','Severe']],
  ['risk','Risk',['None','Self-harm risk','Harm to others']],
  ['phys','Physical aggression',['None','Self','Others','Property']],
  ['verb','Verbal aggression',['None','Present']],
  ['social','Social interaction',['Adequate','Minimal']],
  ['intv','Interventions used',['None','Verbal de-escalation','SOS medication','Close monitoring','Restraint','Supportive session'],1]]],
 ['5. Therapeutic input',[
  ['ther','Therapy participation',['Active','Partial','Refused']]]]];
const UPD_FIELDS=UPD.reduce((a,g)=>a.concat(g[1]),[]);
const UPD_CONF='This update is confidential and intended only for the patient’s authorized caregivers. Please do not share or forward.';
function updDraft(){S.upd=S.upd||{};return S.upd;}
function updPick(k,v,multi){const d=updDraft();
  if(multi){let a=d[k]||[];if(v==='None')a=['None'];else{a=a.filter(x=>x!=='None');a=a.includes(v)?a.filter(x=>x!==v):a.concat(v);}d[k]=a;}
  else d[k]=d[k]===v?undefined:v;
  render();}
function updMissing(){const d=updDraft();return UPD_FIELDS.filter(f=>f[3]?!(d[f[0]]&&d[f[0]].length):!d[f[0]]).map(f=>f[1]);}
function updFlags(d){const f=[];
  if(d.risk&&d.risk!=='None')f.push(d.risk);
  if(d.phys&&d.phys!=='None')f.push('Physical aggression: '+d.phys);
  if(['Moderate','Severe'].includes(d.agit))f.push('Agitation '+d.agit.toLowerCase());
  (d.intv||[]).forEach(x=>{if(['Restraint','SOS medication'].includes(x))f.push(x);});
  return f;}
function updSave(){
  const m=updMissing();if(m.length){toast('Still to answer: '+m.slice(0,3).join(', ')+(m.length>3?' and '+(m.length-3)+' more':''));return;}
  const d=JSON.parse(JSON.stringify(updDraft()));
  const u={id:'u'+((S.updates||[]).length+1),when:'Today, '+clock(),by:signer(),d,note:(S.updNote||'').trim()};
  S.updates=S.updates||[];S.updates.unshift(u);
  const fl=updFlags(d);
  if(fl.length)S.events.unshift({id:Date.now(),when:'Today, now',type:'Nurse concern',sev:'',by:signer(),duty:'Duty doctor (DOD)',detail:'Daily update flagged: '+fl.join(', ')+' (Neel Bose)',ack:false});
  S.upd={};S.updNote='';render();toast('Daily update saved. Doctors and the RMO can see it.');
}
function updView(u,full){
  const rows=UPD.map(g=>`<div class="lbl" style="margin-top:10px">${g[0]}</div><div class="mini-chips" style="gap:6px">${g[1].map(f=>{const v=u.d[f[0]];const val=Array.isArray(v)?v.join(', '):v;const bad=(f[0]==='risk'||f[0]==='phys'||f[0]==='agit')&&val&&!['None','Mild'].includes(val)||(f[0]==='intv'&&/Restraint|SOS/.test(val||''));
    return `<span class="chip ${bad?'c-amber':'c-grey'}" style="height:auto;padding:4px 9px"><span class="muted">${f[1]}:</span>&nbsp;<b>${val||'-'}</b></span>`;}).join('')}</div>`).join('');
  return `<div style="padding:12px 16px"><div class="row" style="justify-content:space-between;gap:10px"><div style="font-weight:700">${u.when}</div><div class="small muted">Reported by ${u.by}</div></div>${full?rows:''}${u.note?`<div class="lbl" style="margin-top:12px">Note</div><div>${u.note.replace(/</g,'&lt;')}</div>`:''}${full?`<div class="tiny muted" style="margin-top:12px">${UPD_CONF}</div>`:''}</div>`;
}
function pUpdate(){
  const us=S.updates||[],edit=S.role==='nurse',d=updDraft();
  const form=edit?`<section class="card"><div class="hd"><h3>Daily patient progress update</h3><span class="small muted">Neel Bose · Reported by ${signer()}</span></div>
    <div style="padding:4px 16px 14px">${UPD.map(g=>`<div class="dng" style="margin-top:12px">${g[0]}</div>${g[1].map(f=>{const multi=f[3];return `<div class="pad-row"><span class="lbl">${f[1]}${multi?' <span class="tiny" style="text-transform:none;letter-spacing:0">(any)</span>':''}</span><div class="mini-chips" role="group" aria-label="${f[1]}">${f[2].map(o=>`<button class="tog ${(multi?(d[f[0]]||[]).includes(o):d[f[0]]===o)?'on':''}" data-k="${f[0]}" data-v="${o}" onclick="updPick('${f[0]}','${o}',${multi?1:0})">${o}</button>`).join('')}</div></div>`;}).join('')}`).join('')}
      <label class="field" style="margin-top:12px"><span class="lbl">Note (optional)</span><textarea class="input" id="updNote" rows="3" oninput="S.updNote=this.value" placeholder="e.g. In the morning he appeared irritable and engaged in physical aggression; calmed through verbal de-escalation. An individual session was conducted.">${S.updNote||''}</textarea></label>
      <div class="tiny muted" style="margin-top:8px">${UPD_CONF}</div>
      <div class="row" style="justify-content:space-between;margin-top:10px"><span class="small muted">${updMissing().length?updMissing().length+' still to answer':'All answered'}</span><button class="btn pri" onclick="updSave()">Save daily update</button></div></div></section>`:'';
  const latest=us.length?`<section class="card"><div class="hd"><h3>${edit?'Last saved update':'Latest daily update'}</h3>${chip(us.length+' saved','c-grey')}</div>${updView(us[0],true)}</section>`:`<section class="card"><div class="hd"><h3>Daily patient progress update</h3></div><div class="pad small muted">${edit?'':'No update from nursing yet today. The nurse fills this in on the ward and it shows here.'}</div></section>`;
  const hist=us.length>1?`<section class="card"><div class="hd"><h3>Earlier updates</h3></div>${us.slice(1).map(u=>updView(u,true)).join('<hr style="border:0;border-top:1px solid var(--line-2);margin:0">')}</section>`:'';
  return (edit?form:'')+(edit&&!us.length?'':latest)+hist;
}

/* ---- Daily notes: reorganised into grouped sections with progress ---- */
/* Anu's structure: different daily notes for the doctor and the psychologist */
const DN_DOC={
 groups:[
  ['Overall behaviour','In the ward and with other patients',[
    ['soc','Social engagement',['Adequate','Minimal','Withdrawn']],
    ['agit','Agitation',['None','Mild','Moderate','Severe']],
    ['pagg','Physical aggression',['None','Towards self','Towards others','Property']],
    ['vagg','Verbal aggression',['None','Mild','Severe']],
    ['hs','Harm to self',['None','Thoughts only','Self-harm act']]]],
  ['Mood and consciousness','',[
    ['mood','Mood',['Calm','Anxious','Low','Irritable','Elated','Fluctuating']],
    ['cons','Consciousness',['Alert','Drowsy','Confused','Disoriented']]]],
  ['Medication adherence and side effects','',[
    ['adh','Adherence',['All doses taken','Took after persuasion','Refused a dose']],
    ['se','Side effects',['None','Sedation','Tremor','Stiffness','Restlessness','Dizziness','Weight gain'],1]]],
  ['Any other event','',[
    ['evt','Event today',['None','Fall','Aggression incident','Absconding attempt','Refused food','Medical concern','Other'],1],
    ['evl','Event details','text','One line, only if there was an event']]]],
 tpl:{'Stable day':{soc:['Adequate'],agit:['None'],pagg:['None'],vagg:['None'],hs:['None'],mood:['Calm'],cons:['Alert'],adh:['All doses taken'],se:['None'],evt:['None']},
      'Settling in':{soc:['Minimal'],agit:['Mild'],pagg:['None'],vagg:['None'],hs:['None'],mood:['Irritable'],cons:['Alert'],adh:['Took after persuasion'],se:['Sedation'],evt:['None']},
      'Needs attention':{soc:['Withdrawn'],agit:['Moderate'],pagg:['Towards others'],vagg:['Mild'],hs:['Thoughts only'],mood:['Irritable'],cons:['Alert'],adh:['Refused a dose'],se:['None'],evt:['Aggression incident'],evl:'Pushed a co-patient in the morning; calmed with verbal de-escalation.'}},
 yday:{soc:['Minimal'],agit:['Mild'],pagg:['None'],vagg:['None'],hs:['None'],mood:['Irritable'],cons:['Alert'],adh:['All doses taken'],se:['None'],evt:['None']},
 ytxt:'Yesterday (Day 5, Dr. Aanya Sharma): minimal social engagement, mildly agitated, irritable, all doses taken, no event.'};
const DN_PSY={
 groups:[
  ['Biological function','',[
    ['sleep','Sleep',['Over 7 h','6 to 7 h','4 to 6 h','Under 4 h','Disturbed']],
    ['meals','Appetite',['All meals','Partial','Skipped one or more','Refused food']],
    ['care','Self-care and hygiene',['Independent','Needs prompting','Needs help']],
    ['bl','Bladder',['Normal','Frequent','Incontinent']],
    ['bw','Bowel',['Normal','Constipation','Loose stools']]]],
  ['Ward behaviour','',[
    ['mood','Mood',['Calmer','Anxious','Irritable','Low','Elated']],
    ['beh','Behaviour on the ward',['Calm','Restless','Withdrawn','Agitated','Aggressive']],
    ['part','Participation in activities',['Active','Attended, quiet','Refused']],
    ['sessions','Sessions today',['Group therapy','Yoga','Individual session','Occupational therapy','Psychoeducation'],1]]],
  ['Therapy brief and family','',[
    ['brief','Therapy brief','area','e.g. More open in session; named two early warning signs; working on sleep routine and anger triggers.'],
    ['fam','Family contact',['Phone call','Visit','None today'],1]]],
  ['Any significant event','',[
    ['evl','Significant event','text','None, or write one line']]]],
 tpl:{'Stable day':{sleep:['6 to 7 h'],meals:['All meals'],care:['Independent'],bl:['Normal'],bw:['Normal'],mood:['Calmer'],beh:['Calm'],part:['Active'],sessions:['Group therapy'],fam:['Phone call']},
      'Settling in':{sleep:['4 to 6 h'],meals:['Partial'],care:['Needs prompting'],bl:['Normal'],bw:['Normal'],mood:['Irritable'],beh:['Restless'],part:['Attended, quiet'],sessions:['Individual session'],fam:['None today']},
      'Good progress':{sleep:['6 to 7 h'],meals:['All meals'],care:['Independent'],bl:['Normal'],bw:['Normal'],mood:['Calmer'],beh:['Calm'],part:['Active'],sessions:['Group therapy','Yoga'],fam:['Visit'],brief:'Open in session and joined group therapy; practising the sleep routine.'}},
 yday:{sleep:['Under 4 h'],meals:['Partial'],care:['Needs prompting'],bl:['Normal'],bw:['Normal'],mood:['Irritable'],beh:['Restless'],part:['Attended, quiet'],sessions:['Yoga'],fam:['None today']},
 ytxt:'Yesterday (Day 5, Priya Nair): under 4 hours sleep, ate partially, irritable in the morning; yoga only.'};
function dnSpec(){return isPsych()?DN_PSY:DN_DOC;}
function dnKeys(sp){return [].concat(...sp.groups.map(g=>g[2].filter(f=>f[2]!=='text'&&f[2]!=='area').map(f=>f[0])));}
const DN_HIST=[
 {d:'23',my:'Oct 2026',type:'Daily note',tc:'c-blue',by:'Priya Nair',role:'Psychologist',sum:'Under 4 h sleep · partial meals · irritable · yoga',secs:[['Biological functions (sleep and appetite)','Slept under 4 hours, woke twice. Ate breakfast and half of lunch.'],['Assessment','Yes'],['Behavioural analysis','Irritable in the morning, calmer after yoga. Engaged in short conversation, guarded about medicines.'],['Significant observation','Asked twice to call his office; reassured.']]},
 {d:'23',my:'Oct 2026',type:'Round note',tc:'c-violet',by:'Dr. Aanya Sharma',role:'Psychiatrist',sum:'Pressured speech less; olanzapine reviewed; lithium level ordered',secs:[['Findings','Pressured speech less, still overfamiliar. Sleep improving.'],['Medicine changes','Olanzapine continued at 10 mg; review tomorrow.'],['Actions','Serum lithium level; individual session today.']]},
 {d:'22',my:'Oct 2026',type:'Daily note',tc:'c-blue',by:'Priya Nair',role:'Psychologist',sum:'4 to 6 h sleep · all meals · irritable · group therapy, yoga'},
 {d:'21',my:'Oct 2026',type:'Daily note',tc:'c-blue',by:'Dr. Aanya Sharma',role:'Psychiatrist',sum:'Settling in · refused one dose · no change in risk',secs:[['Biological functions','Disturbed sleep; partial meals.'],['Behavioural analysis','Refused morning olanzapine once, took it after counselling.'],['Significant observation','Risk unchanged.',true]]},
 {d:'20',my:'Oct 2026',type:'Daily note',tc:'c-blue',by:'Priya Nair',role:'Psychologist',sum:'Disturbed sleep · partial meals · family visit'}];
function dnRow(f){
  const [k,l,opts,multi,ph]=f;const dn=S.dn||{};
  if(opts==='text')return `<div class="dnr"><div class="dnl">${l}</div><input class="input" value="${(dn[k]||'').replace(/"/g,'&quot;')}" oninput="S.dn=S.dn||{};S.dn['${k}']=this.value" placeholder="${multi||''}"></div>`;
  if(opts==='area')return `<div class="dnr"><div class="dnl">${l}</div><textarea class="input" rows="3" oninput="S.dn=S.dn||{};S.dn['${k}']=this.value" placeholder="${multi||''}">${dn[k]||''}</textarea></div>`;
  return `<div class="dnr"><div class="dnl">${l}${multi?' <span class="dnany">pick any</span>':''}</div><div class="mini-chips" role="group" aria-label="${l}">${opts.map(o=>`<button class="tog ${(dn[k]||[]).includes(o)?'on':''}" data-k="${k}" data-v="${o}" onclick="dnPick('${k}','${o}',${multi?1:0})">${o}</button>`).join('')}</div></div>`;}
function dnSet(f){S.dnF=f;render();}
function pDaily(){
  const dn=S.dn||{};const sp=dnSpec();const keys=dnKeys(sp);
  const done=keys.filter(k=>(dn[k]||[]).length).length;const pct=Math.round(done/keys.length*100);
  const f=S.dnF||'All';const hist=(S.dnHist||DN_HIST).filter(h=>f==='All'||h.type===f);
  const update=famUpdate();
  const step=(n,t,on)=>`<span class="dstep ${on?'on':''}"><b>${n}</b>${t}</span>`;
  return `
  <section class="card">
    <div class="hd">
      <h3>Daily note · Day 6 ${chip(me().title,'c-grey')}</h3>
      <div class="dtools">
        <button class="btn sm pri" id="scrD" onclick="dnDictate()">${icon.mic} Dictate</button>
      </div>
    </div>
    <div class="dprog"><div class="dbar" aria-hidden="true"><i style="width:${pct}%"></i></div><span class="small"><b>${done} of ${keys.length}</b> answered</span><span class="tiny muted">${S.dnY||sp.ytxt}</span></div>
    <div class="eq" style="margin:16px 20px">${[0,2].map(k=>`<div class="eqrow">${sp.groups.slice(k,k+2).map(g=>`<div class="eqc ${g[2].length===1?'one':''}"><div class="dng2">${g[0]}</div>${g[2].map(dnRow).join('')}</div>`).join('')}</div>`).join('')}</div>
    <div class="dsave"><span class="tiny muted"><span class="kbd">Ctrl</span> + <span class="kbd">S</span> to save</span><button class="btn pri" onclick="saveDaily()">Save note</button></div>
  </section>
  <section class="card">
    <div class="hd"><h3>Family update</h3>${S.dailySaved?chip(S.familySent?'Sent on WhatsApp':'Unique to Neel','c-green'):chip('Save the note first','c-grey')}</div>
    <div class="dsteps">${step(1,'Fill the note',done>0)}${step(2,'Save note',S.dailySaved)}${step(3,'Review and send',S.familySent)}</div>
    <div class="pad" style="display:flex;flex-direction:column;gap:12px">
    ${S.dailySaved?`<div class="note small">${update}</div>      <div class="row"><button class="btn" onclick="toast('Opens the text to edit')">Edit</button><button class="btn" onclick="toast('Translated draft shown in Hindi')">Show in Hindi</button><button class="btn pri" ${S.familySent?'disabled':''} onclick="S.familySent=true;render();toast('Sent to Ananya Bose on WhatsApp from Tulasi\\'s number')">Approve and send</button></div>`
     :``}
    </div>
  </section>
  <section class="card"><div class="hd"><h3>Earlier notes</h3><div class="mini-chips" role="group" aria-label="Filter notes">${['All','Daily note','Round note'].map(x=>`<button class="tog ${f===x?'on':''}" onclick="dnSet('${x}')">${x==='All'?'All':x+'s'}</button>`).join('')}</div></div>
    <div style="padding:6px 16px 16px">${noteList('dn',hist)}</div>
  </section>`;
}

function dnProg(){const dn=S.dn||{};const keys=dnKeys(dnSpec());const done=keys.filter(k=>(dn[k]||[]).length).length;
  const bar=document.querySelector('.dbar i');if(bar)bar.style.width=Math.round(done/keys.length*100)+'%';const t=document.querySelector('.dprog b');if(t)t.textContent=done+' of '+keys.length;
  const s1=document.querySelector('.dstep');if(s1)s1.classList.toggle('on',done>0);}
function dnDictate(){const b=$('scrD');b.innerHTML='<span class="rec"><i></i>Listening…</span>';b.disabled=true;setTimeout(()=>{const sp=dnSpec();S.dn=JSON.parse(JSON.stringify(sp.tpl[isPsych()?'Good progress':'Stable day']));render();toast('Filled from your dictation. Check and save.');},1600);}
const __dnPick0=dnPick;dnPick=function(k,v,m){__dnPick0(k,v,m);dnProg();};

/* ---- All-patient daily notes page: different fields for the doctor and the psychologist ---- */
function eodGroups(p,dnGroup,seg,mseg){
  const id=p.id,e=S.eod[id]||{};
  const ta=(k,ph)=>`<textarea class="input eline" style="min-height:56px" placeholder="${ph}" oninput="S.eod['${id}']=S.eod['${id}']||{};S.eod['${id}'].${k}=this.value">${e[k]||''}</textarea>`;
  const f=(l,c)=>`<div class="ef"><span class="lbl">${l}</span>${c}</div>`;
  const cell=(t,fs)=>`<div class="eqc"><div class="dng2">${t}</div><div class="eqf">${fs.join('')}</div></div>`;
  const box=(a,b,c,d)=>`<div class="eq" style="grid-column:1/-1"><div class="eqrow">${a}${b}</div><div class="eqrow">${c}${d}</div></div>`;
  if(isPsych())return box(
    cell('Biological function',[
      f('Sleep',seg(id,'sleep',[['Over 7 h','g'],['5 to 7 h','n'],['Under 5 h','a'],['Disturbed','a']])),
      f('Appetite',seg(id,'meal',[['All meals','g'],['Partial','n'],['Skipped','a'],['Refused food','r']])),
      f('Self-care and hygiene',seg(id,'care',[['Independent','g'],['Needs prompting','n'],['Needs help','a']])),
      f('Bladder',seg(id,'bl',[['Normal','g'],['Frequent','a'],['Incontinent','a']])),
      f('Bowel',seg(id,'bw',[['Normal','g'],['Constipation','a'],['Loose stools','a']]))]),
    cell('Ward behaviour',[
      f('Mood',seg(id,'mood',[['Calmer','g'],['Irritable','a'],['Low','a'],['Elated','a'],['Anxious','a']])),
      f('Behaviour on the ward',seg(id,'beh',[['Calm','g'],['Restless','a'],['Agitated','a'],['Aggressive','r'],['Withdrawn','a']])),
      f('Participation in activities',seg(id,'part',[['Active','g'],['Attended, quiet','n'],['Refused','a']])),
      f('Sessions today',mseg(id,'sess',['Group therapy','Yoga','Individual session','Occupational therapy','Psychoeducation','Family session']))]),
    cell('Therapy brief and family',[f('Therapy brief',ta('brief','What was worked on today')),f('Family contact',mseg(id,'fam',['Phone call','Visit','None today']))]),
    cell('Any significant event',[ta('line','None, or what happened')]));
  return box(
    cell('Overall behaviour',[
      f('Behaviour',mseg(id,'overallBeh',['Withdrawn','Overfamiliar','Agitated','Physically aggressive','Verbally aggressive','Self harm']))]),
    cell('Mood and consciousness',[
      f('Mood',seg(id,'mood',[['Calm','g'],['Anxious','a'],['Low','a'],['Irritable','a'],['Elated','a'],['Fluctuating','a']])),
      f('Consciousness',seg(id,'cons',[['Alert','g'],['Drowsy','a'],['Confused','a'],['Disoriented','r']]))]),
    cell('Medication adherence and side effects',[
      f('Adherence',seg(id,'med',[['All taken','g'],['Took after persuasion','n'],['Refused a dose','r']])),
      f('Side effects',seg(id,'seYN',[['No','g'],['Yes','a']])+(e.seYN==='Yes'?ta('seText','Describe the side effects'):''))]),
    cell('Any other event',[f('Event today',mseg(id,'inc',['None','Fall','Aggression incident','Absconding attempt','Refused food','Medical concern','Other'])),ta('line','Event details, only if there was an event')]));
}
function eodYday(){return isPsych()?{sleep:'5 to 7 h',meal:'All meals',care:'Independent',bl:'Normal',bw:'Normal',mood:'Calmer',beh:'Calm',part:'Active',sess:['Group therapy'],fam:['None today'],brief:'',line:'No change from yesterday'}
  :{overallBeh:[],mood:'Calm',cons:'Alert',med:'All taken',se:['None'],inc:['None'],line:''};}
function eodSum(e){const behaviour=(e.overallBeh||[]).length?'Overall behaviour: '+e.overallBeh.join(', '):[e.hs&&e.hs!=='None'?'Harm to self: '+e.hs:'',e.pagg&&e.pagg!=='None'?'Aggression: '+e.pagg:''].filter(Boolean).join(' · ');return [e.mood,e.cons||e.sleep,e.med||e.beh,behaviour].filter(Boolean);}

/* ===== psychologist daily note: one guided component for the patient tab and the all-patients page ===== */
const PSY_F={
  sleep:{l:'Sleep last night',o:[['Over 7 h','g'],['6 to 7 h','g'],['4 to 6 h','a'],['Under 4 h','a'],['Disturbed','a']]},
  meals:{l:'Appetite and meals',o:[['All meals','g'],['Partial','n'],['Skipped one or more','a'],['Refused food','r']]},
  care:{l:'Self-care and hygiene',o:[['Independent','g'],['Needs prompting','n'],['Needs help','a']]},
  bl:{l:'Bladder',o:[['Normal','g'],['Frequent','a'],['Incontinent','a']]},
  bw:{l:'Bowel',o:[['Normal','g'],['Constipation','a'],['Loose stools','a']]},
  mood:{l:'Mood',o:[['Calmer','g'],['Anxious','a'],['Irritable','a'],['Low','a'],['Elated','a']]},
  beh:{l:'Behaviour on the ward',o:[['Calm','g'],['Restless','a'],['Withdrawn','a'],['Agitated','a'],['Aggressive','r']]},
  part:{l:'Took part in activities',o:[['Active','g'],['Attended, quiet','n'],['Refused','a']]},
  sessions:{l:'Sessions today',m:1,o:[['Group therapy'],['Yoga'],['Individual session'],['Occupational therapy'],['Psychoeducation']]},
  fam:{l:'Family contact',m:1,ex:'None today',o:[['Phone call'],['Visit'],['None today']]},
  brief:{l:'Therapy brief',t:1,ph:'What was worked on today, in a line or two'},
  evy:{l:'Anything significant today?',o:[['None today','g'],['Something happened','r']]},
  evl:{l:'What happened',t:1,ph:'One or two lines: what happened, when, and what was done'}
};
const PSY_SECS=[
  {t:'Body and routine',sub:'Sleep, food, self-care, bladder and bowel',ks:['sleep','meals','care','bl','bw']},
  {t:'Mood and behaviour',sub:'How the day went on the ward',ks:['mood','beh','part']},
  {t:'Sessions and family',sub:'Optional · what was done and who was in touch',opt:1,ks:['sessions','fam','brief']},
  {t:'Significant events',sub:'Anything the psychiatrist should know about',ks:['evy','evl']}
];
const PSY_BRIEF=['Engaged well in session','Practised relaxation','Worked on sleep routine','Discussed medicines','Explored anger triggers','Talked through family concerns','Set a goal for tomorrow'];
const PSY_EK={meals:'meal',sessions:'sess',evl:'line'};
const PSY_USUAL={sleep:'6 to 7 h',meals:'All meals',care:'Independent',bl:'Normal',bw:'Normal',mood:'Calmer',beh:'Calm',part:'Active',evy:'None today'};
const psyCtx=(kind,id)=>kind+':'+id;
const psyKey=(kind,k)=>kind==='eod'?(PSY_EK[k]||k):k;
function psyStore(kind,id){if(kind==='dn'){S.dn=S.dn||{};return S.dn;}S.eod=S.eod||{};return (S.eod[id]=S.eod[id]||{});}
function psyGet(kind,id,k){const f=PSY_F[k],v=psyStore(kind,id)[psyKey(kind,k)];
  if(f.t)return typeof v==='string'?v:(Array.isArray(v)?(v[0]||''):'');
  if(f.m)return Array.isArray(v)?v.slice():(v?[v]:[]);
  return Array.isArray(v)?(v[0]||''):(v||'');}
function psySet(kind,id,k,val){const f=PSY_F[k],st=psyStore(kind,id);st[psyKey(kind,k)]=(f.t||f.m)?val:(kind==='dn'?(val===''?[]:[val]):val);}
const psyEmpty=v=>Array.isArray(v)?!v.length:!String(v||'').trim();
const psyL=s=>String(s).charAt(0).toLowerCase()+String(s).slice(1);
function psyReq(kind,id){const r=['sleep','meals','care','bl','bw','mood','beh','part','evy'];if(psyGet(kind,id,'evy')==='Something happened')r.push('evl');return r;}
function psyMiss(kind,id){return psyReq(kind,id).filter(k=>psyEmpty(psyGet(kind,id,k)));}
function psyFlags(kind,id){const g=k=>psyGet(kind,id,k),f=[];
  if(g('beh')==='Aggressive'||g('beh')==='Agitated')f.push(g('beh')+' on the ward');
  if(g('meals')==='Refused food')f.push('Refused food');
  if(g('evy')==='Something happened')f.push('Event reported');
  return f;}
function psySum(kind,id,i){const g=k=>psyGet(kind,id,k);const a=[];
  if(i===0){if(g('sleep'))a.push(g('sleep')+' sleep');if(g('meals'))a.push(g('meals'));if(g('care'))a.push(g('care'));if(g('bl'))a.push('bladder '+psyL(g('bl')));if(g('bw'))a.push('bowel '+psyL(g('bw')));}
  if(i===1){['mood','beh','part'].forEach(k=>{if(g(k))a.push(g(k));});}
  if(i===2){const s=g('sessions'),f=g('fam'),b=g('brief').trim();if(s.length)a.push(s.join(', '));if(f.length)a.push('Family: '+f.join(', ').toLowerCase());if(b)a.push(b.length>60?b.slice(0,57)+'…':b);}
  if(i===3){const y=g('evy');if(y==='None today')a.push('None today');else if(y){const t=g('evl').trim();a.push(t?(t.length>70?t.slice(0,67)+'…':t):'Something happened · add what happened');}}
  return a.map(hesc).join(' · ');}
function psySec(kind,id,i){const s=PSY_SECS[i],miss=psyMiss(kind,id).filter(k=>s.ks.includes(k)),any=s.ks.some(k=>!psyEmpty(psyGet(kind,id,k)));
  return {miss,done:s.opt?any:!miss.length};}
function psyOpenIdx(kind,id){const pin=(S.psyPin||{})[psyCtx(kind,id)];if(pin!==undefined)return pin;
  for(let i=0;i<PSY_SECS.length;i++){if(!PSY_SECS[i].opt&&psySec(kind,id,i).miss.length)return i;}return -1;}
function psyHeadIn(kind,id,i){const s=PSY_SECS[i],st=psySec(kind,id,i),open=psyOpenIdx(kind,id)===i,sum=psySum(kind,id,i);
  const badge=s.opt?(st.done?chip('Added','c-green'):chip('Optional','c-grey')):(st.miss.length?chip(st.miss.length+' left','c-amber'):chip('Done','c-green'));
  return `<span class="pn-n">${st.done&&(!s.opt||sum)?'✓':i+1}</span><span class="pn-ht"><b>${s.t}</b><span>${open?s.sub:(sum||s.sub)}</span></span>${badge}<span class="pn-chev" aria-hidden="true">›</span>`;}
function psyQ(kind,id,k){const f=PSY_F[k],v=psyGet(kind,id,k),miss=(S.psyTried||{})[psyCtx(kind,id)]&&psyMiss(kind,id).includes(k);let body;
  if(f.t){body=`<textarea class="input" id="pnT-${k}" rows="${k==='brief'?3:2}" placeholder="${f.ph}" oninput="psyTxt('${kind}','${id}','${k}',this.value)">${hesc(v)}</textarea>${k==='brief'?`<div class="pn-ph">${PSY_BRIEF.map((q,i)=>`<button type="button" onclick="psyBrief('${kind}','${id}',${i})">+ ${q}</button>`).join('')}</div>`:''}`;}
  else body=`<div class="pn-os" role="group" aria-label="${f.l}">${f.o.map(([o,t])=>{const on=f.m?v.includes(o):v===o;return `<button type="button" class="pn-o ${on?'on '+(f.m?'':(t||'')):''}" data-k="${k}" data-v="${o}" aria-pressed="${on}" onclick="psyPick('${kind}','${id}','${k}',this.dataset.v)">${on?'<i>✓</i>':''}${o}</button>`;}).join('')}</div>`;
  return `<div class="pn-q ${miss?'miss':''}" id="q-${k}"><div class="pn-ql">${f.l}${f.m?'<span>pick any</span>':''}${miss?'<em>Needed</em>':''}</div>${body}</div>`;}
function psyStep(kind,id,i){const s=PSY_SECS[i],open=psyOpenIdx(kind,id)===i,st=psySec(kind,id,i),nxt=PSY_SECS[i+1];
  const qs=s.ks.filter(k=>k!=='evl'||psyGet(kind,id,'evy')==='Something happened');
  return `<div class="pn-step ${open?'open':''} ${st.done?'ok':''}" id="pnS-${i}"><button type="button" class="pn-h" id="pnH-${i}" aria-expanded="${open}" onclick="psyGo('${kind}','${id}',${i})">${psyHeadIn(kind,id,i)}</button>${open?`<div class="pn-body">${qs.map(k=>psyQ(kind,id,k)).join('')}${nxt?`<div class="pn-nx"><button type="button" class="btn ${st.done?'pri':''}" onclick="psyGo('${kind}','${id}',${i+1},1)">Next: ${nxt.t} →</button></div>`:''}</div>`:''}</div>`;}
function psyStart(kind,id){const rec=S.psyRec===psyCtx(kind,id);
  const y=kind==='dn'?DN_PSY.ytxt:(id!=='neel'&&typeof ptCtxOf==='function'?ptCtxOf(id).dnY:'Yesterday ('+S.team.psych+'): 6 to 7 h sleep, all meals, calmer, calm on the ward, group therapy.');
  return `<div class="pn-start"><span class="t">Start from</span><button type="button" class="btn sm" onclick="psyFill('${kind}','${id}','usual')">Usual day</button><button type="button" class="btn sm" onclick="psyFill('${kind}','${id}','yday')">Same as yesterday</button><button type="button" class="btn sm" ${rec?'disabled':''} onclick="psyDictate('${kind}','${id}')">${rec?'<span class="rec"><i></i>Listening…</span>':icon.mic+' Dictate'}</button><div class="y">${hesc(y)} Only blank answers are filled, so nothing you chose is replaced.</div></div>`;}
function psySide(kind,id){const miss=psyMiss(kind,id),tot=psyReq(kind,id).length,n=tot-miss.length,fl=psyFlags(kind,id);
  return `<div class="pn-card"><div class="row" style="justify-content:space-between;gap:8px"><div><div class="pn-lb">Progress</div><div style="font-size:20px;font-weight:700;line-height:1.3">${n} of ${tot} answered</div></div>${miss.length?'':chip('Ready','c-green')}</div>
    <div class="ebar"><i style="width:${Math.round(n/tot*100)}%"></i></div>
    ${miss.length?`<div><div class="tiny muted" style="margin-bottom:6px">Still to answer. Tap to jump there.</div><div class="pn-miss">${miss.map(k=>`<button type="button" onclick="psyJump('${kind}','${id}','${k}')">${PSY_F[k].l}</button>`).join('')}</div></div>`:`<div class="small" style="color:var(--green)">Everything needed is filled in. Sessions, family contact and the therapy brief are optional.</div>`}</div>
    ${fl.length?`<div class="callout amber small"><strong>${hesc(S.team.psy)}</strong> will be alerted when you save<div style="margin-top:4px">${fl.map(hesc).join(' · ')}</div></div>`:''}
    ${kind==='eod'?coNote(id):''}
    <div class="pn-card"><div class="pn-lb">Note preview</div><div class="pn-pv">${PSY_SECS.map((s,i)=>{const t=psySum(kind,id,i);return `<div><div class="pn-lb" style="font-size:10.5px">${s.t}</div><div class="v ${t?'':'e'}">${t||'Not answered yet'}</div></div>`;}).join('')}</div></div>`;}
function psyBar(kind,id){const miss=psyMiss(kind,id),lab=kind==='dn'?(S.dailySaved?'Update note':'Save note'):'Save and next';
  return `<div>${miss.length?`<b>${miss.length} left</b> <span class="small muted pn-bs">before this note is complete</span>`:`<b style="color:var(--green)">Ready to save</b>`}${kind==='dn'?` <span class="tiny muted" style="margin-left:6px"><span class="kbd">Ctrl</span> + <span class="kbd">S</span></span>`:''}</div><button type="button" class="btn pri" onclick="psySave('${kind}','${id}')">${lab}</button>`;}
function psyInner(kind,id){return `<div class="pn-main">${psyStart(kind,id)}${PSY_SECS.map((s,i)=>psyStep(kind,id,i)).join('')}<div class="pn-bar" id="pnBar">${psyBar(kind,id)}</div></div><div class="pn-side" id="pnSide">${psySide(kind,id)}</div>`;}
function psyNote(kind,id){
  const top=kind==='dn'?`<div class="pn-top"><div><h3>Daily note · Day 6 ${chip(me().title,'c-grey')}</h3><div class="small muted" style="margin-top:4px">Four short steps. Tap what applies; the preview on the right builds as you go.</div></div>${S.dailySaved?chip('Saved · you can still update it','c-green'):''}</div>`:'';
  return `<div class="pn-wrap">${top}<div class="pn" id="pn">${psyInner(kind,id)}</div></div>`;}
function psyRepaint(kind,id,fk,fv){const el=$('pn');if(!el)return;el.innerHTML=psyInner(kind,id);
  if(fk){const b=el.querySelector(`.pn-o[data-k="${fk}"][data-v="${fv}"]`);if(b)b.focus({preventScroll:true});}
  if(kind==='dn')dnProg();}
function psyPaint(kind,id){const b=$('pnBar'),s=$('pnSide');if(b)b.innerHTML=psyBar(kind,id);if(s)s.innerHTML=psySide(kind,id);
  PSY_SECS.forEach((_,i)=>{const h=$('pnH-'+i),st=$('pnS-'+i);if(h)h.innerHTML=psyHeadIn(kind,id,i);if(st)st.classList.toggle('ok',psySec(kind,id,i).done);});
  if(kind==='dn')dnProg();}
function psyPick(kind,id,k,v){const f=PSY_F[k];
  if(f.m){let a=psyGet(kind,id,k);if(f.ex&&v===f.ex)a=a.includes(v)?[]:[v];else{a=a.filter(x=>x!==f.ex);a=a.includes(v)?a.filter(x=>x!==v):a.concat(v);}psySet(kind,id,k,a);}
  else{psySet(kind,id,k,psyGet(kind,id,k)===v?'':v);if(k==='evy'&&v==='None today')psySet(kind,id,'evl','');}
  S.psyPin=S.psyPin||{};S.psyPin[psyCtx(kind,id)]=PSY_SECS.findIndex(s=>s.ks.includes(k));
  psyRepaint(kind,id,k,v);}
function psyTxt(kind,id,k,v){psySet(kind,id,k,v);psyPaint(kind,id);}
function psyBrief(kind,id,i){const t=psyGet(kind,id,'brief').trim(),nv=(t?t+(/[.!?]$/.test(t)?' ':'. '):'')+PSY_BRIEF[i]+'.';psySet(kind,id,'brief',nv);const ta=$('pnT-brief');if(ta)ta.value=nv;psyPaint(kind,id);}
function psyGo(kind,id,i,scroll){const c=psyCtx(kind,id);S.psyPin=S.psyPin||{};S.psyPin[c]=(psyOpenIdx(kind,id)===i&&!scroll)?-1:i;psyRepaint(kind,id);
  if(scroll){const el=$('pnS-'+i);if(el&&el.scrollIntoView)el.scrollIntoView({block:'start',behavior:'smooth'});}}
function psyJump(kind,id,k){S.psyPin=S.psyPin||{};S.psyPin[psyCtx(kind,id)]=PSY_SECS.findIndex(s=>s.ks.includes(k));psyRepaint(kind,id);
  const el=$('q-'+k);if(el&&el.scrollIntoView)el.scrollIntoView({block:'center',behavior:'smooth'});}
function psyYday(kind,id){if(id&&id!=='neel'&&typeof ptCtxOf==='function'&&ptCtxOf(id).ydayAns)return ptCtxOf(id).ydayAns;return kind==='dn'?{sleep:'Under 4 h',meals:'Partial',care:'Needs prompting',bl:'Normal',bw:'Normal',mood:'Irritable',beh:'Restless',part:'Attended, quiet',sessions:['Yoga'],fam:['None today'],evy:'None today'}
  :{sleep:'6 to 7 h',meals:'All meals',care:'Independent',bl:'Normal',bw:'Normal',mood:'Calmer',beh:'Calm',part:'Active',sessions:['Group therapy'],fam:['None today'],evy:'None today'};}
function psyFill(kind,id,mode){const src=mode==='usual'?PSY_USUAL:psyYday(kind,id);let n=0;
  Object.keys(src).forEach(k=>{if(psyEmpty(psyGet(kind,id,k))){psySet(kind,id,k,Array.isArray(src[k])?src[k].slice():src[k]);n++;}});
  if(S.psyPin)delete S.psyPin[psyCtx(kind,id)];psyRepaint(kind,id);
  toast(n?(mode==='usual'?'Usual day filled into '+n+' blank answers. Change what is different.':'Yesterday copied into '+n+' blank answers. Change what is different.'):'Nothing blank to fill. Your answers are kept.');}
function psyDictate(kind,id){S.psyRec=psyCtx(kind,id);psyRepaint(kind,id);
  setTimeout(()=>{S.psyRec=null;const d={sleep:'6 to 7 h',meals:'All meals',care:'Independent',bl:'Normal',bw:'Normal',mood:'Calmer',beh:'Calm',part:'Active',sessions:['Group therapy','Individual session'],fam:['Phone call'],brief:'Engaged well in session. Worked on the sleep routine.',evy:'None today'};
    Object.keys(d).forEach(k=>psySet(kind,id,k,d[k]));if(S.psyPin)delete S.psyPin[psyCtx(kind,id)];
    psyRepaint(kind,id);toast('Filled from your dictation. Check it and save.');},1600);}
function psySave(kind,id){
  const c=psyCtx(kind,id),miss=psyMiss(kind,id);
  if(miss.length){S.psyTried=S.psyTried||{};S.psyTried[c]=true;S.psyPin=S.psyPin||{};S.psyPin[c]=PSY_SECS.findIndex(s=>s.ks.includes(miss[0]));psyRepaint(kind,id);
    const el=$('q-'+miss[0]);if(el&&el.scrollIntoView)el.scrollIntoView({block:'center',behavior:'smooth'});
    toast(miss.length+' still to answer: '+miss.slice(0,3).map(k=>PSY_F[k].l.toLowerCase()).join(', ')+(miss.length>3?'…':''));return;}
  const fl=psyFlags(kind,id),al=fl.length?'; '+S.team.psy+' alerted':'';
  if(S.psyTried)delete S.psyTried[c];if(S.psyPin)delete S.psyPin[c];
  if(kind==='dn'){S.dn.line=psyGet('dn',id,'evy')==='Something happened'?psyGet('dn',id,'evl'):'None';saveDaily();toast('Note saved'+al+'. Family update drafted.');return;}
  const p=PTS.find(x=>x.id===id);S.eod[id].saved=true;S.eodI=0;render();toast('Daily note saved for '+p.name+al);
}
const PSY_EOD=()=>PTS.slice(0,5); /* ward order, first patient first (3 Nov) */
function psyEodEdit(id){S.eod[id].saved=false;const pend=PSY_EOD().filter(p=>!(S.eod[p.id]||{}).saved);S.eodI=Math.max(0,pend.findIndex(p=>p.id===id));render();}
function psyEodPage(){
  S.eod=S.eod||{};const L=PSY_EOD();
  const done=L.filter(p=>(S.eod[p.id]||{}).saved).length,pct=Math.round(done/L.length*100);
  const pend=L.filter(p=>!(S.eod[p.id]||{}).saved),idx=Math.min(S.eodI||0,Math.max(0,pend.length-1)),cur=pend[idx];
  const strip=`<div class="estrip">${L.map(p=>{const sv=(S.eod[p.id]||{}).saved,on=cur&&p.id===cur.id;return `<button class="espill ${sv?'sv':''} ${on?'on':''} ${p.risk?'rk':''}" onclick="${sv?`psyEodEdit('${p.id}')`:`S.eodI=${pend.indexOf(p)};render()`}">${sv?'✓ ':''}${p.name.split(' ')[0]}${sv&&psyFlags('eod',p.id).length?'<span class="dot" style="background:var(--red);margin-left:6px" title="Psychiatrist alerted"></span>':''}</button>`;}).join('')}</div>`;
  let stage;
  if(!cur)stage=`<div class="edone">All notes saved for today. Tap a name to edit one.</div>`;
  else stage=`<div class="estage"><div class="pn-pt">${av(cur.ini,44,cur.risk?'c-red':'c-blue')}<div class="grow"><div style="font-size:17px;font-weight:700">${cur.name} ${cur.risk?chip('High risk','c-red'):''}</div><div class="small muted">${cur.room} · Day ${cur.day} · ${cur.dx}</div></div><div class="tiny muted">Patient ${idx+1} of ${pend.length} left</div></div>
    ${psyNote('eod',cur.id)}
    <div class="row" style="justify-content:space-between;margin-top:14px"><button class="btn sm" ${idx===0?'disabled':''} onclick="S.eodI=${idx-1};render()">‹ Previous</button><button class="btn sm" ${idx>=pend.length-1?'disabled':''} onclick="S.eodI=${idx+1};render()">Skip for now ›</button></div></div>`;
  return `<section class="card eod"><div class="eodhd"><div><div class="row" style="gap:8px"><h3>End of day notes</h3></div></div>
    <div class="eprog"><div class="row" style="justify-content:space-between"><strong>${done} of ${L.length} done</strong></div><div class="ebar"><i style="width:${pct}%"></i></div></div></div>${strip}${stage}</section>`;
}
const __eodNotes0=eodNotes;eodNotes=function(){return isPsych()?psyEodPage():__eodNotes0();};
const __pDaily0=pDaily;pDaily=function(){const h=__pDaily0();if(!isPsych())return h;
  const k=h.indexOf('<h3>Family update');if(k<0)return h;const s=h.lastIndexOf('<section',k);return psyNote('dn','neel')+h.slice(s);};


/* ===== RMO: many floors, take assignment (goes to review), physical exam + hard copy,
   what other doctors said, Handover tab ===== */
const FLOORS=Object.keys(WARDS);
const WARD_PSY={'Female ward':'Dr. Kunal Sethi','De-addiction ward':'Dr. Rohan Mehta'};
const peOk=p=>{const e=(S.pe||{})[p.id];return !!e&&e.stable==='Stable';};
const peRetake=p=>{const e=(S.pe||{})[p.id];return !!e&&e.stable!=='Stable';};
const admDate=p=>{const d=new Date();d.setDate(d.getDate()-(p.day||0));return d.toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'});};
const hesc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const wardOf=pid=>FLOORS.find(k=>WARDS[k].some(p=>p.id===pid))||'Male ward';
const psyOfP=p=>PSYOF[p.id]||WARD_PSY[wardOf(p.id)]||'Dr. Aanya Sharma';
const allPts=()=>FLOORS.flatMap(k=>WARDS[k]);
/* two RMOs on duty: each sees only the floor they are on duty at */
const locFloors=()=>(S.role!=='rmo'||!S.rmoLoc||S.rmoLoc==='All floors')?FLOORS:[S.rmoLoc];
/* psychiatrist and floor lead see the nursing chart the way the RMO does: every floor, floor tabs, ward care */
function chartLikeRmo(){return ['rmo','psychiatrist','lead'].includes(S.role);}
const scopePts=()=>locFloors().flatMap(k=>WARDS[k]);
const inScope=pid=>scopePts().some(p=>p.id===pid);
const rmoPts=()=>{const fl=locFloors(),f=fl.includes(S.rmoFloor)?[S.rmoFloor]:fl;return f.flatMap(k=>WARDS[k].map(p=>({p,k})));};
const rmoEffFloor=()=>locFloors().includes(S.rmoFloor)?S.rmoFloor:(locFloors().length===1?locFloors()[0]:'All floors');
const rmoScope=L=>L.filter(t=>t.pid?inScope(t.pid):(['r1','r2','r3','r4'].includes(t.id)?inScope('neel'):true));
function rmoSetLoc(l){S.rmoLoc=l;S.rmoFloor=l;render();toast(l==='All floors'?'Only RMO on duty: all floors':'RMO on duty at '+l+'. Other floors are not shown');}
function rmoLocBar(){
  document.body.classList.toggle('rmo',S.role==='rmo');
  const b=$('locBar');if(b)b.innerHTML='';
}
function rmoLocSel(){
  return `<label class="loc"><span class="locl">You are on duty at</span><select class="input" id="locSel" aria-label="RMO duty location" onchange="rmoSetLoc(this.value)">${['All floors'].concat(FLOORS).map(k=>`<option value="${k}" ${(S.rmoLoc||'All floors')===k?'selected':''}>${k==='All floors'?'All floors':k}</option>`).join('')}</select></label>`;
}
function rmoInit(){
  if(S.rmoInit)return; S.rmoInit=true;
  S.rmoFloor=S.rmoFloor||'All floors'; S.pe=S.pe||{}; S.refLog=S.refLog||{};
  S.hoNotes=S.hoNotes||[]; S.handovers=S.handovers||[];
  S.referrals=S.referrals||[]; S.refN=S.refN||0;
  if(!S.referrals.some(refOut)) S.referrals.push({id:'refx1',pid:'neel',pn:'Neel Bose',by:'Dr. Aanya Sharma',kind:REF_KIND[1],to:'Endocrinologist',why:'Uncontrolled blood sugar',urg:'Within 24 hours',how:REF_OUT_HOW[0]});
}
function floorTabs(){
  if(locFloors().length===1){const k=locFloors()[0];return `<div class="row" style="gap:8px;flex-wrap:wrap"><span class="lbl">Floor</span><span class="tog on" style="cursor:default;display:inline-flex;align-items:center;line-height:1">${wardFloor(k)} · ${k}</span><span class="tiny muted">Your floor. Patients on other floors are not shown to you.</span></div>`;}
  return `<div class="row" style="gap:8px;flex-wrap:wrap"><span class="lbl">Floor</span>${['All floors'].concat(FLOORS).map(k=>`<button class="tog ${(S.rmoFloor||'All floors')===k?'on':''}" onclick="S.rmoFloor='${k}';render()">${k==='All floors'?k:wardFloor(k)+' · '+k}</button>`).join('')}</div>`;
}
function printHtml(h){
  const f=document.createElement('iframe');f.style.cssText='position:fixed;right:0;bottom:0;width:0;height:0;border:0';f.srcdoc=h;
  f.onload=()=>{try{f.contentWindow.focus();f.contentWindow.print();}catch(e){}setTimeout(()=>f.remove(),3000);};document.body.appendChild(f);
}
async function hardCopy(name,html){
  if(__dl){const ok=await __saveFile(__slug(name)+'.html',html);if(ok)toast('Saved. Open the file and print it for the hard copy.');return ok;}
  printHtml(html);toast('Sent to printer for the hard copy');return true;
}
const docHtml=(title,sub,body)=>`<!doctype html><html><head><meta charset="utf-8"><title>${hesc(title)}</title><style>body{font:14px/1.5 Arial,sans-serif;color:#111;margin:32px}h1{font-size:20px;margin:0}h2{font-size:15px;margin:22px 0 6px;border-bottom:1px solid #999;padding-bottom:3px}.sub{color:#555;margin:2px 0 14px}table{width:100%;border-collapse:collapse}td,th{border:1px solid #bbb;padding:6px 8px;text-align:left;vertical-align:top}th{background:#f1f1f1;width:34%}.sig{display:flex;gap:40px;margin-top:48px}.sig div{flex:1;border-top:1px solid #333;padding-top:4px;font-size:12px}@media print{body{margin:14mm}}</style></head><body><h1>Tulasi Healthcare</h1><div class="sub">${hesc(title)} · ${hesc(sub)}</div>${body}</body></html>`;

function rmoInbox(){
  if(!isPsy())return '';
  const L=S.events.filter(e=>e.type==='Referral reply'&&!e.ack);
  if(!L.length)return '';
  return `<section class="card" id="rmoInbox"><div class="hd"><div><h3>From the RMO</h3><div class="small muted" style="margin-top:4px">What other doctors said about your patients</div></div>${chip(L.length+' to review','c-amber')}</div>
    ${L.map(e=>`<div class="li" style="align-items:flex-start"><div class="grow"><div class="row" style="gap:8px">${chip(e.type,'c-blue')}<span class="small" style="font-weight:600">${e.when}</span></div><div class="small" style="margin-top:6px">${e.detail}</div></div><button class="btn sm pri" onclick="rmoReviewed(${e.id})">Mark reviewed</button></div>`).join('')}</section>`;
}
function rmoReviewed(id){const e=S.events.find(x=>x.id===id);if(e)e.ack=true;render();toast('Marked reviewed');}

/* ---- RMO dashboard: the shift bar, what needs you now, floors, who you are waiting on ---- */
const SHIFT_ST=540, SHIFT_EN=1260;           /* 9:00 to 21:00 */
const nowMin=()=>{const n=new Date();return n.getHours()*60+n.getMinutes();};
const hhmm=m=>Math.floor(m/60)+' h '+String(m%60).padStart(2,'0')+' m';
function rmoShiftBar(T){
  const open=T.filter(t=>!S.done[t.id]);
  const urgent=open.filter(t=>t.late).length, rest=open.length-urgent, closed=T.length-open.length;
  const left=SHIFT_EN-nowMin(), over=left<=0;
  const nf=locFloors().length, np=scopePts().length;
  const where=nf===1?locFloors()[0]:nf+' floors';
  const hr=new Date().getHours(), greet=hr<12?'Good morning':(hr<17?'Good afternoon':'Good evening');
  const I=d=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const iClock=I('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>'), iFloor=I('<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>'), iPt=I('<circle cx="9" cy="8" r="3.5"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M21 20c0-2.6-1.6-4.8-4-5.6"/>');
  return `<section class="shb" aria-label="Your shift">
    <div class="hdr">
      <div class="who">
        <div class="idr">${av(me().ini,56)}<div class="idt"><div class="eyb">${greet}</div><div class="nmr"><span class="nm">${me().name}</span>${over?chip('Shift over','c-amber'):chip('On shift','c-green')}</div></div></div>
        <div class="facts"><span class="fact">${iClock}<span>Day shift <b>9:00 to 21:00</b></span></span><span class="fact">${iFloor}<span><b>${where}</b></span></span><span class="fact">${iPt}<span><b>${np}</b> patients</span></span></div>
      </div>
      <div class="act">${rmoLocSel()}<button class="btn" onclick="go('#/inpatients')">All patients · ${np}</button><button class="btn ${over||left<=60?'pri':''}" onclick="go('#/handover')">Hand over${over||left<=60?'':' · at 9 pm'}</button></div>
    </div>
    <div class="ct">
      <button class="c ${urgent?'u':'z'}${S.rtf==='now'?' on':''}" aria-pressed="${S.rtf==='now'}" onclick="rmoTf('now')" aria-label="${urgent} tasks need immediate medical attention. Show only these"><b>${urgent}</b><span>${urgent?(urgent===1?'needs':'need')+' immediate medical attention':'nothing urgent'}</span></button>
      <button class="c o${S.rtf==='later'?' on':''}" aria-pressed="${S.rtf==='later'}" onclick="rmoTf('later')" aria-label="${rest} tasks later this shift. Show only these"><b>${rest}</b><span>later this shift</span></button>
      <button class="c d${S.rtf==='done'?' on':''}" aria-pressed="${S.rtf==='done'}" onclick="rmoTf('done')" aria-label="${closed} tasks done. Show only these"><b>${closed}</b><span>done</span></button>
    </div>
    ${rmoFloorList()}
  </section>`;
}
function rmoAct(t){
  if(S.done[t.id])return '';
  if(t.diet)return `<button class="btn sm pri" onclick="dietModal()">Add diet plan</button>`;
  if(t.ref)return `<span class="opn">Open ›</span><button class="btn sm pri" onclick="S.done['${t.id}']=true;render();toast('Referral marked done. The psychiatrist can see it.')">Mark done</button>`;
  return t.late?`<button class="btn sm pri" onclick="go('${t.go}')">Open</button>`:`<span class="opn">Open ›</span>`;
}
function rmoItem(t,showMeta){
  const d=S.done[t.id];
  const cls=d?'d':(t.late?'u':(t.chipc==='c-blue'?'n':(t.chipc==='c-grey'?'q':'w')));
  const clk=d?'':(t.diet?'dietModal()':(t.go?`go('${t.go}')`:''));
  return `<div class="rit ${cls} ${clk?'clk':''}" ${clk?`onclick="if(!event.target.closest('button'))${clk}"`:''} title="${hesc(t.meta||'')}"><div style="min-width:0"><div class="tt">${t.title}</div>${showMeta?`<div class="mt">${t.meta}</div>`:''}</div>
    <div class="rt">${(d||t.due!=='Open')?`<span class="rwhen ${d?'d':(t.late?'u':'')}">${d?'Done':t.due}</span>`:''}${rmoAct(t)}</div></div>`;
}
function rmoNext(T){
  const open=T.filter(t=>!S.done[t.id]);const t=open.find(x=>x.late)||open[0];if(!t)return '';
  const act=t.diet?`<button class="btn pri" onclick="dietModal()">Add diet plan</button>`:`<button class="btn pri" onclick="go('${t.go}')">Open</button>`+(t.ref?`<button class="btn" onclick="S.done['${t.id}']=true;render();toast('Referral marked done. The psychiatrist can see it.')">Mark done</button>`:'');
  const ni=t.late?'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3.5l9 16H3z"/><path d="M12 10v4.5M12 17.2v.1"/></svg>':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>';
  return `<section class="nxt ${t.late?'u':''}"><span class="nxi">${ni}</span><div class="nxb"><div class="nxl">${t.late?'Needs immediate medical attention':'Next up'}</div><div class="nxt-t">${t.title}</div><div class="nxt-m">${t.meta||''}</div></div><div class="nxt-a">${act}${t.due&&t.due!=='Open'?`<span class="nxt-w">${t.due}</span>`:''}</div></section>`;
}
function rmoTasks(T,skip){
  const rf=S.rtf||''; if(rf) skip=null;
  const open=T.filter(t=>!S.done[t.id]&&t.id!==skip);
  const now=open.filter(t=>t.late), later=open.filter(t=>!t.late), done=T.filter(t=>S.done[t.id]);
  const LIM=rf?999:4,more=!!S.rmoMore,rest=rf==='now'?now:rf==='later'?later:rf==='done'?[]:now.concat(later),shown=more?rest:rest.slice(0,LIM);
  const grp=(label,cls,all,vis)=>vis.length?`<div class="rgl ${cls}"><span>${label}</span><i>${all.length}</i></div>${vis.map(t=>rmoItem(t,true)).join('')}`:'';
  const body=(rest.length?`<div class="rlist">${grp('Needs immediate medical attention','u',now,shown.filter(t=>t.late))}${grp('Later this shift','',later,shown.filter(t=>!t.late))}</div>`
      +(rest.length>LIM?`<div class="rmore"><button class="btn" onclick="S.rmoMore=${!more};render()">${more?'Show fewer tasks':'Show '+(rest.length-LIM)+' more tasks'}</button></div>`:''):'')
    +(done.length&&(!rf||rf==='done')?`<details class="rdone" ${rf==='done'?'open':''}><summary>Done <span class="muted">${done.length}</span></summary><div class="rlist">${done.map(t=>rmoItem(t,false)).join('')}</div></details>`:'');
  return body||`<div class="rnone">${rf?{now:'Nothing needs immediate attention.',later:'Nothing else is due this shift.',done:'Nothing done yet.'}[rf]:'All done for this shift.'}</div>`;
}
function rmoFloorList(){
  const ks=locFloors().slice().sort((a,b)=>floorNo(WARDS[a][0])-floorNo(WARDS[b][0]));
  const rows=ks.map(k=>{
    const L=WARDS[k], ok=L.filter(peOk).length, rt=L.filter(peRetake).length, no=L.length-ok-rt;
    const hrNo=L.filter(p=>p.risk&&!S.pe[p.id]).length, w=n=>(n/L.length*100).toFixed(2);
    const badges=(hrNo?`<span class="chip c-red">${hrNo} high risk not examined</span>`:'')+(rt?`<span class="chip c-amber">${rt} to retake</span>`:'')+(!hrNo&&!rt&&ok===L.length?'<span class="chip c-green">All examined</span>':(!hrNo&&!rt?`<span class="chip c-grey">${no} to examine</span>`:''));
    return `<button class="ft" onclick="S.rmoFloor='${k}';go('#/inpatients')" aria-label="Open ${k}, ${wardFloor(k)}, ${L.length} patients, ${ok} examined">
      <span class="fth"><span class="flrn">${floorNo(L[0])}</span><span class="ftt"><span class="nmw">${wardFloor(k)} · ${k}</span><span class="meta">${L.length} patients</span></span><span class="ftc"><b>${ok}</b>of ${L.length} examined</span></span>
      <span class="ftf"><span class="flb">${badges}</span><span class="opn">Open ›</span></span></button>`;}).join('');
  const tot=ks.reduce((n,k)=>n+WARDS[k].length,0), exm=ks.reduce((n,k)=>n+WARDS[k].filter(peOk).length,0);
  return `<div class="fband"><div class="fbh"><div><h3>${ks.length===1?'Your floor':'Your floors'}</h3><div class="small muted" style="margin-top:2px">Physical exam coverage</div></div>${chip(exm+' of '+tot+' examined',exm===tot?'c-green':'c-blue')}</div><div class="ftg">${rows}</div></div>`;
}
function rmoWaitCard(){
  const L=(S.referrals||[]).filter(r=>refOut(r)&&inScope(r.pid)&&!S.done[r.id]);
  const body=L.length?L.map(r=>{const lg=(S.refLog||{})[r.id]||[],l=lg[lg.length-1];
    return `<div class="rit ${r.urg==='Urgent today'?'u':'w'}"><div style="min-width:0"><div class="tt">${r.pn} · ${r.to}</div>
      <div class="mt">${l?l.doc+' said: '+l.out.toLowerCase()+' · follow-up '+l.fu.toLowerCase():r.why+' · '+r.urg}</div></div>
      <div class="rt"><button class="btn sm pri" onclick="refReplyModal('${r.id}')">${lg.length?'Add update':'Record reply'}</button></div></div>`;}).join('')
    :'<div class="rnone">No patient is with another doctor right now.</div>';
  return `<section class="card"><div class="hd"><div><h3>Referrals</h3><div class="small muted" style="margin-top:4px">Write down what each doctor said; the psychiatrist is told at once</div></div>${L.length?chip(L.length+' open','c-blue'):''}</div>${body}</section>`;
}
function vRmoDay(){
  $('title').textContent='Inpatients';
  const T=tasks();const _o=T.filter(t=>!S.done[t.id]),_n=_o.find(x=>x.late)||_o[0];
  return `<div><h2>Inpatient dashboard</h2><div class="muted" style="margin-top:4px">${dashSub()}</div></div>
  ${rmoShiftBar(T)}${V3.dutyHome()}
  <div class="rwrap">
    <div class="rcol">${S.rtf?'':rmoNext(T)}<section class="card"><div class="hd"><div><h3>Coming up</h3><div class="small muted" style="margin-top:2px">Tap a task to open it</div></div>${S.rtf?`<button class="tfchip" onclick="rmoTf('${S.rtf}')" aria-label="Clear filter, show all tasks">${{now:'Needs attention',later:'Later this shift',done:'Done'}[S.rtf]} <span aria-hidden="true">✕</span></button>`:(()=>{const k=_o.filter(t=>!_n||t.id!==_n.id).length;return k?chip(k+' open','c-blue'):chip('All clear','c-green');})()}</div>${rmoTasks(T,_n&&_n.id)}</section></div>
  </div>`;
}
/* ---- RMO ward list: same table as the psychiatrist's My inpatients ---- */
const PR_ICON='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M7 9V4h10v5M7 17H5a1 1 0 0 1-1-1v-5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v5a1 1 0 0 1-1 1h-2"/><rect x="7" y="14" width="10" height="6" rx="1"/></svg>';
function peCell(p){const e=S.pe[p.id],rt=peRetake(p);
  return `<div class="row" style="gap:8px;flex-wrap:nowrap">${e?(rt?chip('Retake due','c-amber'):chip('Stable · '+e.on,'c-green')):chip('Not examined','c-grey')}${e?`<button class="ibtn" title="Print exam record" aria-label="Print ${hesc(p.name)}'s exam record" onclick="peCopy('${p.id}')">${PR_ICON}</button>`:''}<button class="viewbtn" onclick="peModal('${p.id}')">${e?(rt?'Retake exam':'View exam'):'Physical exam'}</button></div>`;}
/* Sample values so every ward row has the same fields as the psychiatrist's table. The prototype only defines these for the male ward. */
const RMO_FILL={meera:['Summary to sign','Not set','Priya Nair','F',36,1048],sana:['Re-assessment · today','Not set','Kiran Mehra','F',24,1049],ritu:['Daily note','3 Nov','Priya Nair','F',41,1050],kavya:['History · 1 day late','Not set','Kiran Mehra','F',19,1051],pooja:['Workup · today','Not set','','F',28,1052],aman:['Re-assessment · Mon','1 Nov','Kiran Mehra','M',45,1053],yash:['Daily note','30 Oct','Priya Nair','M',29,1054],nikhil:['Capacity · 1 day late','Not set','Kiran Mehra','M',38,1055],rahul:['Summary to sign','Today','Priya Nair','M',22,1056]};
const rmoEx=p=>{const e=EX[p.id]||[],f=RMO_FILL[p.id];return e.length>2||!f?e:[e[0]||'Routine',f[0],f[1]];};
const rmoPsych=p=>PSYCHOF[p.id]!==undefined?PSYCHOF[p.id]:((RMO_FILL[p.id]||[])[2]||'');
function vRmoWards(){
  $('title').textContent='Inpatients';
  const rows=rmoPts(),srt=S.rmoSort||'att',flt=S.rmoFilt||'all';
  const dis=p=>{const d=rmoEx(p)[2];return !!d&&d!=='Not set';};
  const plist=rows.map(r=>r.p).sort(ipdCmp(srt)).filter(p=>ipdIn(flt,p,dis));
  return ipdPage({scr:'rmo',lead:false,list:plist,total:scopePts().length,srt,att:p=>p.risk,sid:'rmoSortSel',onSort:'S.rmoSort=this.value;render()',
    title:'Ward inpatients',where:`Gurgaon · ${FLOORS.length} wards`,
    cur:flt,set:k=>`S.rmoFilt='${k}'`,count:k=>rows.filter(r=>ipdIn(k,r.p,dis)).length,keys:['all','h24','risk','new','dis'],filters:`<div class="ptfil">${floorTabs()}</div>`,
    doc:p=>psyOfP(p),psy:p=>rmoPsych(p),dc:p=>rmoEx(p)[2],go:p=>`#/patient/${p.id}/overview`,
    id:p=>{const fl=RMO_FILL[p.id]||[],sx=p.sex||fl[3],ag=p.age||fl[4],th=PTS.indexOf(p)>=0?1040+PTS.indexOf(p):fl[5];return `${sx?ag+'/'+sx+' '+p.room.replace(/^Room\s*/i,'R '):p.room}${th?' · TH-'+th:''}`;},
    mh:'Monitoring · physical exam',c6l:'',c6:p=>`<div class="pew">${peCell(p)}</div>`,after:rmoRefCard()});
}
/* ---- physical exam, nutrition status, hard copy ---- */
const NUTR=['Well nourished','Mildly undernourished','Moderately undernourished','Severely undernourished','Overweight','Obese'];
const PE_APP=['Comfortable','Pale','Dehydrated','In pain or distress','Drowsy or sedated'];
const PE_SYS=[['cvs','Heart and circulation'],['rs','Chest and breathing'],['abd','Abdomen'],['cns','Nervous system'],['skin','Skin, injuries and dressings']];
const PE_STABLE=['Stable','Not stable · retake the exam'];
const PE_END=['Fit, nothing to act on','Needs close monitoring','Refer to another doctor','Needs dressing or first aid'];
const peMeta=()=>{const L=scopePts(),d=L.filter(peOk).length,rt=L.filter(peRetake).length;return d+' of '+L.length+' patients examined'+(rt?' · '+rt+' to retake':'')+' · not daily, retake when a patient is not stable';};
function peBmi(){const w=parseFloat($('peW').value),h=parseFloat($('peH').value);$('peB').textContent=(w>0&&h>0)?(w/((h/100)*(h/100))).toFixed(1):'–';}
function peModal(pid){
  const p=allPts().find(x=>x.id===pid),e=S.pe[pid]||{},o=(L,v)=>L.map(x=>`<option ${x===v?'selected':''}>${x}</option>`).join('');
  const sys=PE_SYS.map(([k,l])=>`<div class="rrow" style="grid-template-columns:150px 120px 1fr;gap:8px;align-items:center"><span class="small" style="font-weight:600">${l}</span><select class="input" id="peS_${k}" aria-label="${l}">${o(['Normal','Abnormal'],(e.sys||{})[k]&&e.sys[k][0]||'Normal')}</select><input class="input" id="peN_${k}" aria-label="${l} note" placeholder="Note, if any" value="${hesc((e.sys||{})[k]&&e.sys[k][1]||'')}"></div>`).join('');
  openModal(`<div class="mh"><h3>Physical examination · ${p.name}</h3><button class="x" aria-label="Close" onclick="closeModal()">×</button></div>
  <div class="mb" style="max-height:68vh;overflow:auto"><div class="tiny muted">${p.room} · ${wardOf(pid)} · ${p.dx}${e.at?' · last saved '+e.at:''}</div>
  <div class="row" style="gap:10px;flex-wrap:wrap"><label class="field" style="width:110px"><span class="lbl">Weight (kg)</span><input class="input" id="peW" type="number" min="0" step="0.1" value="${e.w||''}" oninput="peBmi()"></label>
  <label class="field" style="width:110px"><span class="lbl">Height (cm)</span><input class="input" id="peH" type="number" min="0" step="1" value="${e.h||''}" oninput="peBmi()"></label>
  <div class="field" style="width:70px"><span class="lbl">BMI</span><div id="peB" style="font-weight:700;padding-top:8px">${e.bmi||'–'}</div></div>
  <label class="field grow" style="min-width:200px"><span class="lbl">Nutrition status</span><select class="input" id="peNu">${o(NUTR,e.nut)}</select></label></div>
  <label class="field"><span class="lbl">General appearance</span><select class="input" id="peA">${o(PE_APP,e.app)}</select></label>
  <div class="lbl">Systems</div>${sys}
  <label class="field"><span class="lbl">Conclusion</span><select class="input" id="peC">${o(PE_END,e.end)}</select></label>
  <label class="field"><span class="lbl">Is the patient stable?</span><select class="input" id="peSt">${o(PE_STABLE,e.stable)}</select><span class="tiny muted">The exam is not repeated daily. If the patient is not stable, it is marked to retake.</span></label>
  <label class="field"><span class="lbl">Notes (optional)</span><textarea class="input" id="peT" rows="2">${hesc(e.note||'')}</textarea></label></div>
  <div class="mf"><button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="peSave('${pid}')">Save</button></div>`);
  setTimeout(peBmi,0);
}
function peSave(pid){
  const w=$('peW').value,h=$('peH').value;let bmi='';if(parseFloat(w)>0&&parseFloat(h)>0)bmi=(w/((h/100)*(h/100))).toFixed(1);
  const sys={};PE_SYS.forEach(([k])=>{sys[k]=[$('peS_'+k).value,$('peN_'+k).value.trim()];});
  S.pe[pid]={at:clock(),on:new Date().toLocaleDateString('en-IN',{day:'numeric',month:'short'}),stable:$('peSt').value,by:signer(),w,h,bmi,nut:$('peNu').value,app:$('peA').value,sys,end:$('peC').value,note:$('peT').value.trim()};
  S.done.rm1=scopePts().every(peOk);
  closeModal();render();
  toast('Physical exam saved'+(S.pe[pid].stable!=='Stable'?'. Marked to retake.':''));
}
function peHtml(pid){
  const p=allPts().find(x=>x.id===pid),e=S.pe[pid];
  const r=(a,b)=>`<tr><th>${a}</th><td>${hesc(b)||'–'}</td></tr>`;
  const body=`<table>${r('Patient',p.name+(p.age?' · '+p.age+' y':''))}${r('UHID',p.uhid||'–')}${r('Room',p.room+' · '+wardOf(pid))}${r('Diagnosis',p.dx)}${r('Examined',new Date().toLocaleDateString('en-IN')+' · '+e.at+' by '+e.by)}</table>
  <h2>Nutrition status</h2><table>${r('Weight',e.w?e.w+' kg':'')}${r('Height',e.h?e.h+' cm':'')}${r('BMI',e.bmi)}${r('Nutrition status',e.nut)}</table>
  <h2>Examination</h2><table>${r('General appearance',e.app)}${PE_SYS.map(([k,l])=>r(l,e.sys[k][0]+(e.sys[k][1]?' · '+e.sys[k][1]:''))).join('')}</table>
  <h2>Conclusion</h2><table>${r('Conclusion',e.end)}${r('Notes',e.note)}</table>
  <div class="sig"><div>RMO on duty · signature</div><div>Treating psychiatrist · signature</div></div>`;
  return docHtml('Physical examination record',p.name,body);
}
function peCopy(pid){const p=allPts().find(x=>x.id===pid);hardCopy('Physical exam '+p.name,peHtml(pid));}

/* ---- referred to other doctors: what they said, told to the psychiatrist ---- */
const REF_SAID=['Advice only, no change here','Medicine started or changed','Tests advised','Fit to stay at Tulasi','Needs a medical ward or hospital','Needs to be seen again'];
const REF_FU=['No follow-up','In 3 days','In 1 week','In 2 weeks','When symptoms return'];
function rmoRefCard(){
  const L=(S.referrals||[]).filter(r=>refOut(r)&&inScope(r.pid)),open=L.filter(r=>!S.done[r.id]).length;
  return `<section class="card" id="rmoRef"><div class="hd"><div><h3>Referred to other doctors</h3><div class="small muted" style="margin-top:4px">Write down what each doctor said, from time to time. The psychiatrist is told each time.</div></div>${chip(open+' open','c-blue')}</div>
  ${L.length?L.map(r=>{const lg=(S.refLog||{})[r.id]||[];
    return `<div class="li" style="align-items:flex-start"><div class="grow"><div class="row" style="gap:8px"><span style="font-weight:600">${r.pn}</span>${chip(r.to,'c-violet')}${S.done[r.id]?chip('Closed','c-green'):chip(r.urg,r.urg==='Urgent today'?'c-amber':'c-grey')}</div>
      <div class="small muted" style="margin-top:4px">${r.why} · ${r.how} · referred by ${r.by}</div>
      ${lg.map(x=>`<div class="small" style="margin-top:6px;padding:8px 10px;background:var(--soft);border-radius:8px"><strong>${x.at}</strong> · ${hesc(x.doc)} said: ${x.out}${x.adv?' · '+hesc(x.adv):''} · Follow-up: ${x.fu}<div class="tiny muted">Told ${x.psy}</div></div>`).join('')}</div>
      ${S.done[r.id]?'':`<button class="btn sm pri" onclick="refReplyModal('${r.id}')">${lg.length?'Add update':'Record what the doctor said'}</button>`}</div>`;}).join(''):'<div class="pad small muted">No patient is referred to another doctor.</div>'}</section>`;
}
function refReplyModal(id){
  const r=S.referrals.find(x=>x.id===id),psy=psyOfP({id:r.pid}),o=L=>L.map(x=>`<option>${x}</option>`).join('');
  openModal(`<div class="mh"><h3>What the doctor said · ${r.pn}</h3><button class="x" aria-label="Close" onclick="closeModal()">×</button></div>
  <div class="mb"><div class="tiny muted">${r.to} · ${r.why}</div>
  <label class="field"><span class="lbl">Doctor's name (optional)</span><input class="input" id="rfDoc" placeholder="${r.to}"></label>
  <label class="field"><span class="lbl">What they said</span><select class="input" id="rfOut">${o(REF_SAID)}</select></label>
  <label class="field"><span class="lbl">Medicines, tests or advice</span><textarea class="input" id="rfAdv" rows="2" placeholder="In the doctor's words"></textarea></label>
  <label class="field"><span class="lbl">Follow-up</span><select class="input" id="rfFu">${o(REF_FU)}</select></label>
  <label class="row" style="gap:8px"><input type="checkbox" id="rfClose"> <span class="small">Close this referral. Nothing more to do.</span></label>
  <div class="tiny muted">${psy} sees this right away on their dashboard.</div></div>
  <div class="mf"><button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="refReplySave('${id}')">Save and tell ${psy}</button></div>`);
}
function refReplySave(id){
  const r=S.referrals.find(x=>x.id===id),psy=psyOfP({id:r.pid}),doc=$('rfDoc').value.trim()||r.to,out=$('rfOut').value,adv=$('rfAdv').value.trim(),fu=$('rfFu').value;
  S.refLog[id]=S.refLog[id]||[];S.refLog[id].push({at:clock(),doc,out,adv,fu,psy});
  S.events.unshift({id:Date.now(),when:'Today, '+clock(),type:'Referral reply',sev:'',by:'RMO on duty',duty:psy,pid:r.pid,
    detail:`${hesc(doc)} saw ${r.pn} for ${r.why.toLowerCase()}. Said: ${out.toLowerCase()}.${adv?' '+hesc(adv)+'.':''} Follow-up: ${fu.toLowerCase()}.`,ack:false});
  if($('rfClose').checked)S.done[id]=true;
  closeModal();render();toast(psy+' is told what the '+r.to.toLowerCase()+' said');
}

/* ---- Handover (during the day) ---- */
const HO_TO=['Afternoon RMO (2 pm)','Evening RMO (8 pm)','Night duty doctor (9 pm)'];
function hoItems(){
  const pts=rmoPts(),ids=new Set(pts.map(r=>r.p.id)),watch=[],wait=[],todo=[];
  (S.referrals||[]).filter(r=>!S.done[r.id]&&!refOut(r)&&ids.has(r.pid)).forEach(r=>watch.push({pn:r.pn,t:r.why+' · '+r.urg}));
  if(ids.has('neel')&&!S.done.r3)watch.push({pn:'Neel Bose',t:'Sugar 192 mg/dL after lunch yesterday · recheck before the next meal'});
  if(ids.has('neel')&&!S.done.r1)watch.push({pn:'Neel Bose',t:'Fall at 2:10 am · neuro checks every 2 hours'});
  (S.referrals||[]).filter(r=>refOut(r)&&!S.done[r.id]&&ids.has(r.pid)).forEach(r=>{const lg=(S.refLog||{})[r.id]||[],l=lg[lg.length-1];
    wait.push({pn:r.pn,t:l?r.to+' said: '+l.out.toLowerCase()+(l.adv?' · '+l.adv:'')+' · follow-up: '+l.fu.toLowerCase():'Waiting for '+r.to+' · '+r.why+' · '+r.urg});});
  pts.filter(r=>peRetake(r.p)).forEach(r=>watch.push({pn:r.p.name,t:'Not stable · physical exam to be retaken'}));
  const npe=pts.filter(r=>!S.pe[r.p.id]);if(npe.length)todo.push({pn:'Physical exam pending',t:npe.slice(0,6).map(r=>r.p.name).join(', ')+(npe.length>6?' and '+(npe.length-6)+' more':'')});
  if(ids.has('rohit')&&!S.done.r2)todo.push({pn:'Rohit Kapoor',t:'Admission workup: vitals, physical exam, admission bloods'});
  return [['Watch closely',watch,'c-amber'],['Referrals',wait,'c-violet'],['Still to do',todo,'c-grey']];
}
function vHandover(){
  $('title').textContent='Handover';
  const secs=hoItems(),total=secs.reduce((a,s)=>a+s[1].length,0),pts=rmoPts(),flo=S.rmoFloor||'All floors';
  const left=SHIFT_EN-nowMin();
  const nHo=total+S.hoNotes.length,empt=secs.filter(s=>!s[1].length).map(s=>s[0]);
  const logL=S.handovers.filter(h=>locFloors().length===FLOORS.length||h.floor===S.rmoLoc);
  const log=logL.map(h=>`<div class="li" style="align-items:flex-start"><div class="grow"><div class="row" style="gap:8px"><span style="font-weight:600">${h.at} · to ${h.to}</span>${h.recv?chip('Received','c-green'):chip('Not received yet','c-amber')}</div>
      <div class="small muted" style="margin-top:4px">${h.floor} · ${h.count} item${h.count===1?'':'s'} · ${h.notes.length} note${h.notes.length===1?'':'s'} · by ${h.by}</div></div>
      ${h.recv?'':`<button class="btn sm" onclick="hoRecv(${h.id})">Mark received</button>`}<button class="btn sm" onclick="hoCopy(${h.id})">Hard copy</button></div>`).join('');
  const carry=secs.filter(s=>s[1].length).map(([t,L,c])=>`<div class="csec"><h4>${t} ${chip(String(L.length),c)}</h4></div>`
      +L.map(x=>`<div class="ci"><div><div class="pn">${x.pn}</div><div class="tx">${hesc(x.t)}</div></div></div>`).join('')).join('')
    +(S.hoNotes.length?`<div class="csec"><h4>Your notes ${chip(String(S.hoNotes.length),'c-blue')}</h4></div>`+S.hoNotes.map((nt,i)=>`<div class="ci"><div><div class="pn">${nt.pn}</div><div class="tx">${hesc(nt.text)}</div></div><div class="row" style="gap:8px"><span class="tm">${nt.at}</span><button class="x" aria-label="Remove note" onclick="S.hoNotes.splice(${i},1);render()">×</button></div></div>`).join(''):'')
    +(!nHo?'<div class="cnone" style="padding-top:18px">Nothing to carry over.</div>':(empt.length?`<div class="cnone" style="padding-top:12px">Nothing for: ${empt.join(', ')}</div>`:''));
  return `<nav class="crumb"><a href="#/myday">Inpatient dashboard</a> / <strong>Handover</strong></nav>
  <div class="row" style="justify-content:space-between;align-items:flex-end"><div><h2 style="font-size:26px">Handover</h2><div class="muted" style="margin-top:4px">${left>0?hhmm(left)+' left on this shift':'Your shift has ended'} · ${flo==='All floors'?FLOORS.length+' floors':flo}</div></div></div>
  ${floorTabs()}
  <div style="display:flex;flex-direction:column;gap:16px">
    ${nhRmoCard()}
    <section class="card sheet">
      <div class="shhd" style="align-items:center">
        <div><div style="font-size:30px;font-weight:600;letter-spacing:-.6px;line-height:1">${nHo}</div><div class="tiny muted" style="margin-top:4px">items to carry · ${flo} · ${pts.length} patients · prepared ${clock()}</div></div>
        <div class="row" style="gap:10px"><select class="input" id="hoTo" aria-label="Hand over to" style="width:auto">${HO_TO.map(x=>`<option>${x}</option>`).join('')}</select><button class="btn pri" onclick="hoGo()">Hand over now</button></div>
      </div>
      <div class="carry">${carry}</div>
      <div class="hoadd" style="flex-direction:row;flex-wrap:wrap;align-items:center;gap:10px;padding:12px 24px;border-top:1px solid var(--line)">
        <select class="input" id="hoP" aria-label="Patient" style="width:190px">${pts.map(r=>`<option value="${r.p.id}">${r.p.name}</option>`).join('')}</select>
        <input class="input grow" id="hoT" aria-label="Note" placeholder="Add a note: what to watch for, what to do, or who to call" onkeydown="if(event.key==='Enter')hoAdd()">
        <button class="btn" onclick="hoAdd()">Add note</button>
      </div>
    </section>
    <details class="card"><summary style="padding:14px 20px;cursor:pointer;font-weight:600">Handovers today · ${logL.length}</summary><div class="holog">${log||'<div class="pad small muted">None yet today.</div>'}</div></details>
  </div>`;
}
function hoAdd(){
  const t=$('hoT').value.trim();if(!t){toast('Write the note');return;}
  const p=allPts().find(x=>x.id===$('hoP').value);S.hoNotes.push({pid:p.id,pn:p.name,text:t,at:clock()});render();
}
function hoGo(){
  const secs=hoItems(),count=secs.reduce((a,s)=>a+s[1].length,0),to=$('hoTo').value;
  S.handovers.unshift({id:Date.now(),at:clock(),to,floor:S.rmoFloor||'All floors',by:signer(),count,secs:secs.map(s=>[s[0],s[1]]),notes:S.hoNotes.slice(),recv:false});
  S.hoNotes=[];render();toast('Handed over to '+to);
}
function hoRecv(id){const h=S.handovers.find(x=>x.id===id);if(h)h.recv=true;render();toast('Marked received');}
function hoCopy(id){
  const h=S.handovers.find(x=>x.id===id);
  const body=h.secs.map(([t,L])=>`<h2>${t}</h2>${L.length?`<table>${L.map(x=>`<tr><th>${hesc(x.pn)}</th><td>${hesc(x.t)}</td></tr>`).join('')}</table>`:'<div>Nothing</div>'}`).join('')
    +`<h2>Notes from ${hesc(h.by)}</h2>${h.notes.length?`<table>${h.notes.map(x=>`<tr><th>${hesc(x.pn)}</th><td>${hesc(x.text)}</td></tr>`).join('')}</table>`:'<div>None</div>'}<div class="sig"><div>Handing over · signature</div><div>Receiving ${hesc(h.to)} · signature</div></div>`;
  hardCopy('Handover '+h.at,docHtml('Handover during the day',h.floor+' · '+h.at+' to '+h.to,body));
}

/* ===== scale: floors as headings, density follows the patient count, search, collapse ===== */
const ORD=n=>n+(['th','st','nd','rd'][(n%100>=11&&n%100<=13)?0:(n%10<4?n%10:0)]);
const floorNo=p=>{const m=String(p.room).match(/(\d{3})/);return m?(Math.floor(parseInt(m[1],10)/100)||1):1;};
const floorName=p=>ORD(floorNo(p))+' floor';
const wardFloor=k=>floorName(WARDS[k][0]);
const dens=n=>n>30?'dense':(n>12?'compact':'cozy');
const lst=scr=>{S.lst=S.lst||{};return S.lst[scr]=S.lst[scr]||{q:'',f:'all',x:{}};};
const nAtt=p=>V3.attX(p)||NSLOTS.some((sl,si)=>si<NOWI&&(((NPLAN[p.id]||{})[sl]||[]).some((t,ti)=>{const k=p.id+'|'+sl+'|'+ti;return !(S.nd[k]||(k==='neel|12 pm|0'?'':'done'));})||((NMEDS[p.id]||{})[sl]||[]).some((_,i)=>!nmState(p.id,sl,i,si))));
function lstMatch(p,L,att){const q=L.q.trim().toLowerCase();return (!q||(p.name+' '+p.room+' '+(p.dx||'')+' '+(p.uhid||'')).toLowerCase().includes(q))&&(L.f==='all'||(L.f==='risk'&&p.risk)||(L.f==='att'&&att(p))||(L.f==='obs'&&/^(1:1|Every 15)/.test((EX[p.id]||[''])[0])));}
function grpRows(list,rowFn,cols,scr,att){
  att=att||(p=>p.risk);const L=lst(scr),groups={};
  list.forEach(p=>{(groups[floorNo(p)]=groups[floorNo(p)]||[]).push(p);});
  const keys=Object.keys(groups).map(Number).sort((a,b)=>a-b),filtering=!!(L.q.trim()||L.f!=='all');
  if(scr==='rmo'&&keys.length===1){const v=list.filter(p=>lstMatch(p,L,att));if(v.length)return v.map(rowFn).join('');}
  const out=keys.map(k=>{const all=groups[k],vis=all.filter(p=>lstMatch(p,L,att));if(!vis.length)return '';
    const key='f'+k,open=filtering?true:(L.x[key]!==undefined?L.x[key]:(list.length<=30||keys.length===1));
    const wards=[...new Set(all.map(p=>wardOf(p.id)))],nr=all.filter(p=>p.risk).length,na=all.filter(att).length;
    return `<tr class="fh"><td colspan="${cols}"><button class="fhb" aria-expanded="${open}" onclick="grpTog('${scr}','${key}',${open})"><span class="caret">${open?'▾':'▸'}</span><strong>${ORD(k)} floor</strong>${wards.map(w=>chip(w,'c-blue')).join('')}<span class="tiny muted">${filtering?vis.length+' of '+all.length:all.length} patient${all.length===1?'':'s'}${nr?' · '+nr+' high risk':''}${na&&na!==nr?' · '+na+' need attention':''}</span></button></td></tr>${open?vis.map(rowFn).join(''):''}`;}).join('');
  return out||`<tr><td colspan="${cols}" class="pad small muted">No patient matches</td></tr>`;
}
function grpTog(scr,key,open){lst(scr).x[key]=!open;render();}
function lstSet(scr,k,v){lst(scr)[k]=v;render();}
function lstQ(scr,v){lst(scr).q=v;render();const i=$('lq_'+scr);if(i){i.focus();i.setSelectionRange(v.length,v.length);}}
function lstAll(scr,open,floors){const L=lst(scr);floors.forEach(k=>{L.x['f'+k]=open;});L.q='';L.f='all';render();}
function lstJump(scr,k){const L=lst(scr);L.x['f'+k]=true;L.q='';L.f='all';render();setTimeout(()=>{const b=[...document.querySelectorAll('#view .fhb')].find(x=>x.innerText.includes(ORD(k)+' floor'));if(b)b.scrollIntoView({block:'center'});},30);}
function listBar(list,scr,att,always,attLabel,noJump){
  if(list.length<=12&&!always)return '';att=att||(p=>p.risk);const L=lst(scr),n=list.length;attLabel=attLabel||'Needs attention';
  const floors=[...new Set(list.map(floorNo))].sort((a,b)=>a-b),nr=list.filter(p=>p.risk).length,na=list.filter(att).length,shown=list.filter(p=>lstMatch(p,L,att)).length;
  const pill=(k,l,c)=>`<button class="tog ${L.f===k?'on':''}" onclick="lstSet('${scr}','f','${k}')">${l}</button>`;
  return `<div class="lbar"><div class="psearch"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg><input id="lq_${scr}" aria-label="Search patients" placeholder="Search name, room or diagnosis" value="${hesc(L.q)}" oninput="lstQ('${scr}',this.value)"></div>
    <div class="row" style="gap:6px;flex-wrap:wrap">${pill('all','All',n)}${pill('risk','High risk',nr)}${pill('att',attLabel,na)}${scr==='nurse'?pill('obs','Observation',list.filter(p=>/^(1:1|Every 15)/.test((EX[p.id]||[''])[0])).length):''}</div>
    <div class="row" style="gap:6px;flex-wrap:wrap;margin-left:auto">${floors.length>1&&!noJump?`<span class="tiny muted">Go to</span>${floors.map(k=>`<button class="tog" onclick="lstJump('${scr}',${k})">${ORD(k)} floor</button>`).join('')}`:''}${floors.length>1?(()=>{const allOpen=floors.every(k=>L.x['f'+k]!==undefined?L.x['f'+k]:(list.length<=30||floors.length===1));return `<button class="lnk" style="margin:0" onclick="lstAll('${scr}',${!allOpen},[${floors}])">${allOpen?'Collapse all':'Expand all'}</button>`;})():''}</div>
    ${(L.q.trim()||L.f!=='all')?`<span class="tiny muted" style="flex-basis:100%">Showing ${shown} of ${n}</span>`:''}</div>`;
}

/* ---- preview with 60 patients (synthetic names) so the layout can be judged at scale ---- */
const BIG_FN=['Aarav','Vihaan','Kabir','Rohan','Ishaan','Arnav','Dhruv','Karthik','Manoj','Sanjay','Vikram','Harish','Naveen','Prakash','Suresh','Anil','Ravi','Mohan','Ajay','Deepak','Nitin','Gaurav','Tejas','Yogesh','Siddharth','Rahul','Imran','Farhan','Joseph','Thomas'];
const BIG_FF=['Anika','Diya','Kavita','Lakshmi','Nisha','Pallavi','Rhea','Shreya','Tanvi','Uma','Vidya','Zoya','Aditi','Bhavna','Charu','Divya','Esha','Fatima','Gayatri','Hema'];
const BIG_LN=['Nair','Reddy','Iyer','Kapoor','Verma','Joshi','Menon','Gupta','Bhat','Rao','Das','Sethi','Khan','Pillai','Shah','Mishra','Chopra','Bose','Roy','Kulkarni'];
const BIG_DX={'Male ward':['Schizophrenia','Bipolar affective disorder','Major depressive disorder','Alcohol dependence','OCD','Acute psychotic episode'],'Female ward':['Severe depressive episode','Bipolar affective disorder','Anorexia nervosa','Acute psychotic episode','Generalised anxiety'],'De-addiction ward':['Alcohol dependence, withdrawal','Opioid dependence','Cannabis dependence','Alcohol withdrawal, delirium risk']};
function bigMode(on){
  const plan={'Male ward':[PTS,16,2],'Female ward':[PTS_F,15,3],'De-addiction ward':[PTS_D,12,1]};
  Object.values(plan).forEach(([A])=>{for(let i=A.length-1;i>=0;i--)if(A[i].syn)A.splice(i,1);});
  window.__big=!!on;
  if(on){let c=0;Object.keys(plan).forEach(w=>{const [A,n,fl]=plan[w];for(let i=0;i<n;i++,c++){
    const female=w==='Female ward',fn=(female?BIG_FF:BIG_FN)[(c*7)%(female?BIG_FF:BIG_FN).length],ln=BIG_LN[(c*3+i)%BIG_LN.length],id='sx'+c,room=fl*100+1+Math.floor(i/2);
    A.push({id,syn:true,age:20+(c*7)%40,sex:female?'F':'M',uhid:'2026-27RG'+(9000+c),name:fn+' '+ln,ini:fn[0]+ln[0],room:'Room '+room+' '+'AB'[i%2],day:1+(c*5)%19,sec:(c%5===0)?'90':'89',risk:c%7===3,dx:BIG_DX[w][c%BIG_DX[w].length]});
    EX[id]=[['Routine','Every 30 minutes','Every 15 minutes'][c%3],['Daily note','Re-assessment · Mon','Capacity · 1 day late'][c%3],['Not set','2 Nov','30 Oct'][c%3]];
    PSYOF[id]=w==='Male ward'?['Dr. Aanya Sharma','Dr. Rohan Mehta','Dr. Kunal Sethi'][c%3]:(WARD_PSY[w]||'Dr. Aanya Sharma');PSYCHOF[id]=['Priya Nair','Kiran Mehra',''][c%3];
    if(w==='Male ward'){NPLAN[id]={'8 am':c%2?['vit']:['sugar'],'12 pm':c%3?[]:['sugar'],'4 pm':['vit']};NMEDS[id]={'8 am':['Sertraline 50 mg','Vitamin D3'],'9 pm':['Quetiapine 50 mg']};}
  }});}
  render();toast(on?'Previewing 60 patients across 3 floors':'Back to the sample patients');
}
function scaleBar(){
  let b=$('bigBtn');if(!b){b=document.createElement('button');b.id='bigBtn';b.className='btn sm';b.style.cssText='margin-left:12px';b.onclick=()=>bigMode(!window.__big);$('roleSeg').parentNode.appendChild(b);}
  b.textContent=window.__big?'Back to sample patients':'Preview 60 patients';
}

/* ---- ward alerts and events: first thing on the nurse board ---- */
function wardAlerts(){
  const A=[['Sugar 192 after lunch · Neel Bose','Yesterday · duty doctor told','var(--amber)'],['Fall · Neel Bose','24 Oct, 2:10 am · neuro checks every 2 h','var(--ink)']];
  return `<section class="card" id="wardAlerts" style="border-color:#f3c58c"><div class="hd"><div><h3>Ward alerts and events</h3><div class="small muted" style="margin-top:4px">Fall, seizure, self-harm attempt, aggression, absconding, choking, drug reaction. Alerts the treating team and duty doctor at once.</div></div>
    <button class="btn" style="border-color:#f6caca;background:#fff7f7;color:var(--red)" onclick="eventModal(true)">⚠ Report significant event</button></div>
    <div class="grid4" style="padding:12px 20px 16px;gap:12px;grid-template-columns:repeat(auto-fit,minmax(240px,1fr))">${A.map(a=>`<div class="box"><div style="font-weight:600;color:${a[2]}">${a[0]}</div><div class="tiny muted" style="margin-top:2px">${a[1]}</div></div>`).join('')}</div></section>`;
}

/* ---- inpatient dashboard: header line and grouped tasks ---- */
function dashSub(){
  const d=new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'});
  const where=S.role==='rmo'?(locFloors().length===1?locFloors()[0]:'All floors'):(S.role==='nurse'?'Male ward':(isLead()?'Floor lead':'Your inpatients'));
  return S.role==='rmo'?`${d} · ${where}`:`${d} · ${where} · everything due, oldest first`;
}
function taskGroups(T,list){
  const al=T.filter(t=>t.taskType==='alert'&&!S.done[t.id]),cs=T.filter(t=>t.taskType==='countersign'&&!S.done[t.id]);
  const rest=T.filter(t=>!t.taskType),od=rest.filter(t=>!S.done[t.id]&&t.late),td=rest.filter(t=>!S.done[t.id]&&!t.late),dn=rest.filter(t=>S.done[t.id]);
  const g=(t,a,c)=>a.length?`<div class="tg"><span>${t}</span>${chip(String(a.length),c)}</div>${list(a)}`:'';
  return g('Alerts that reached you',al,'c-red')+g('RMO orders to countersign',cs,'c-violet')+g('Overdue',od,'c-amber')+g('Due today and new',td,'c-blue')+g('Done today',dn,'c-green')||'<div class="pad small muted">Nothing due.</div>';
}

/* ---- ward summary (male, female, de-addiction) for the RMO ---- */
function wardSummary(){
  const sh={'Male ward':'Male','Female ward':'Female','De-addiction ward':'De-addiction'};
  return `<div class="wsum">${locFloors().slice().sort((a,b)=>floorNo(WARDS[a][0])-floorNo(WARDS[b][0])).map(k=>`<span title="${wardFloor(k)} · ${k}">${sh[k]||k} <b>${WARDS[k].length}</b></span>`).join('')}</div>`;
}

/* ===== v3 additions ===== */
/* ======================================================================
   v3 · Floor command (lead) · Ward care (nurse) · Duty desk (RMO)
        Escalation chain · Patient timeline · Roles and permissions
   All new state lives in S.v3 so "Reset demo data" restores it.
   ====================================================================== */
const V3 = {};
const v3 = () => S.v3 || (S.v3 = V3.seed());

/* ---------- prototype clock (starts 2:10 pm, the 2 pm slot is "now" on the shift board) ---------- */
V3.T0 = 14*60+10; V3.CAP = 15*60+55;
V3.now = () => V3.T0 + v3().sim;
V3.hm = m => { m=((Math.round(m)%1440)+1440)%1440; const h=Math.floor(m/60), mm=m%60; return ((h+11)%12+1)+':'+String(mm).padStart(2,'0')+' '+(h>=12?'pm':'am'); };
V3.clockStr = () => V3.hm(V3.now());
V3.day = t => Math.floor(t/1440);
V3.stamp = t => { const d=V3.day(t), m=t-d*1440; if(d===0)return V3.hm(m); if(d===-1)return 'Yesterday '+V3.hm(m); const dt=new Date(); dt.setDate(dt.getDate()+d); return dt.toLocaleDateString('en-IN',{day:'numeric',month:'short'})+' '+V3.hm(m); };
V3.dayLabel = d => { if(d===0)return 'Today'; if(d===-1)return 'Yesterday'; const dt=new Date(); dt.setDate(dt.getDate()+d); return dt.toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short'}); };
V3.mins = m => { m=Math.max(0,Math.round(m)); return m<60?m+' min':Math.floor(m/60)+' h'+(m%60?' '+m%60+' min':''); };
V3.ago = t => { const x=V3.now()-t; return x<=0?'just now':V3.mins(x)+' ago'; };
V3.dateOf = off => { const dt=new Date(); dt.setDate(dt.getDate()+off); return dt.toLocaleDateString('en-IN',{day:'numeric',month:'short'}); };
V3.adv = n => {
  const s=v3(), nx=Math.min(V3.CAP-V3.T0, s.sim+n);
  if(nx===s.sim){ toast('The prototype clock stops at '+V3.hm(V3.CAP)+', before the 4 pm round'); return; }
  s.sim=nx; V3.tick(); V3.movesTick(); render(); toast('Prototype clock: '+V3.clockStr());
};
V3.clockUI = () => { const e=$('v3clock'); if(!e)return; e.innerHTML=`<span class="small muted">Prototype clock</span><b class="v3clk">${V3.clockStr()}</b><button class="btn sm" onclick="V3.adv(5)" aria-label="Move the clock forward 5 minutes">+5 min</button><button class="btn sm" onclick="V3.adv(15)" aria-label="Move the clock forward 15 minutes">+15 min</button>`; };

/* ---------- small helpers ---------- */
V3.who = { nurse:'Sister Rekha', rmo:'Dr. Sameer Khan', psychiatrist:'Dr. Aanya Sharma', lead:'Dr. Nandini Rao', psychologist:'Priya Nair' };
V3.roleName = { nurse:'Nurse', rmo:'RMO', psychiatrist:'Psychiatrist', lead:'Floor lead', psychologist:'Psychologist', family:'Family', system:'System' };
V3.byMe = () => V3.who[S.role] || 'Staff';
V3.P = pid => allPts().find(x => x.id === pid);
V3.pn = pid => (V3.P(pid)||{}).name || pid;
V3.ward = pid => wardOf(pid);
V3.fl = pid => { const p=V3.P(pid); return p ? floorNo(p) : 2; };
V3.tone = { ok:'c-green', warn:'c-amber', crit:'c-red', info:'c-blue', mute:'c-grey', viol:'c-violet' };
V3.esc = hesc;
V3.ic = (d,s) => `<svg width="${s||16}" height="${s||16}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
V3.I = {
  bed:'<path d="M3 18V7M3 14h18v4M21 14v-2a3 3 0 0 0-3-3h-7v5"/><circle cx="7" cy="11" r="2"/>',
  check:'<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  alert:'<path d="M12 3.5l9 16H3z"/><path d="M12 10v4.5M12 17.2v.1"/>',
  clock:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  phone:'<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
  shield:'<path d="M12 3l8 3v6c0 4.5-3.2 7.8-8 9-4.8-1.2-8-4.5-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
  doc:'<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M10 13h6M10 17h6"/>',
  pill:'<rect x="3" y="8" width="18" height="8" rx="4" transform="rotate(-35 12 12)"/><path d="M9.5 7.5l5 9" transform="rotate(-35 12 12)"/>',
  users:'<circle cx="9" cy="8" r="3.5"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M21 20c0-2.6-1.6-4.8-4-5.6"/>',
  flow:'<path d="M4 7h10M4 12h16M4 17h10"/><path d="M17 5l3 2-3 2"/>',
  heart:'<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>',
  flask:'<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3"/>',
  door:'<path d="M5 21V4h9v17M14 8h5v13M3 21h18M11 12v.1"/>',
  up:'<path d="M12 19V5M6 11l6-6 6 6"/>',
  list:'<path d="M8 6h12M8 12h12M8 18h12M4 6h.1M4 12h.1M4 18h.1"/>',
  moon:'<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/>',
  truck:'<path d="M3 7h11v9H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>',
  scale:'<path d="M12 4v16M6 20h12M5 8h14"/><path d="M5 8l-3 7a3 3 0 0 0 6 0zM19 8l-3 7a3 3 0 0 0 6 0z"/>',
  search:'<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  lock:'<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  pulse:'<path d="M3 12h4l2-6 4 12 2-6h6"/>',
  walk:'<circle cx="13" cy="4.5" r="1.8"/><path d="M10 21l2-6-3-3 2-5 4 2 2 3M12 15l3 2v4"/>',
  chat:'<path d="M4 5h16v11H8l-4 4z"/>',
  star:'<path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.9 6.8 19.7l1-5.9L3.5 9.7l5.9-.8z"/>'
};
V3.i = (k,s) => V3.ic(V3.I[k]||'',s);
V3.avatar = (name,size,cls) => av((name||'').replace(/^(Dr\.|Sister|Brother)\s+/,'').split(' ').map(x=>x[0]).join('').slice(0,2).toUpperCase(), size||30, cls||'c-blue');
V3.rd = role => `<span class="v3rd r-${role}" title="${V3.roleName[role]||role}">${(V3.roleName[role]||'?')[0]}</span>`;
V3.head = (title, sub, actions) => `<div class="v3h"><div><h2>${title}</h2>${sub?`<div class="muted" style="margin-top:4px">${sub}</div>`:''}</div>${actions?`<div class="row" style="gap:8px">${actions}</div>`:''}</div>`;
V3.tabs = (base, list, cur) => `<nav class="v3tabs" aria-label="Sections">${list.map(([k,l,n,tone])=>`<button class="${cur===k?'on':''}" ${cur===k?'aria-current="page"':''} onclick="go('#/${base}/${k}')">${l}${n?`<span class="n ${tone||''}">${n}</span>`:''}</button>`).join('')}</nav>`;
V3.kpi = (label, val, sub, tone, onclick) => `<${onclick?'button':'div'} class="v3k ${tone||''}" ${onclick?`onclick="${onclick}"`:''}><span class="k-l">${label}</span><b class="k-v">${val}</b>${sub?`<span class="k-s">${sub}</span>`:''}</${onclick?'button':'div'}>`;
V3.empty = (t, s) => `<div class="v3empty"><b>${t}</b>${s?`<span>${s}</span>`:''}</div>`;
V3.sel = (id, opts, val) => `<select class="input" id="${id}">${opts.map(o=>{const v=Array.isArray(o)?o[0]:o,l=Array.isArray(o)?o[1]:o;return `<option value="${hesc(v)}" ${String(v)===String(val)?'selected':''}>${hesc(l)}</option>`;}).join('')}</select>`;
V3.ptOpts = (list) => (list||allPts()).map(p => [p.id, p.name+' · '+p.room.replace('Room ','R-')]);
V3.modal = (title, sub, body, foot, width) => { openModal(`<div class="mh"><div><h3>${title}</h3>${sub?`<div class="tiny muted" style="margin-top:2px">${sub}</div>`:''}</div><button class="x" aria-label="Close" onclick="closeModal()">×</button></div><div class="mb">${body}</div>${foot?`<div class="mf">${foot}</div>`:''}`); $('modal').style.width = width || 'min(620px,100%)'; };
V3.bar = (pct, tone) => `<span class="v3bar ${tone||''}"><i style="width:${Math.max(0,Math.min(100,pct))}%"></i></span>`;
V3.pick = (btn, group) => { document.querySelectorAll('[data-g="'+group+'"]').forEach(b=>b.classList.toggle('on', b===btn)); };
V3.val = id => { const e=$(id); return e ? e.value : ''; };

/* ---------- patient timeline log: every role writes here ---------- */
V3.log = (pid, role, kind, text, extra) => { const s=v3(); s.tl.unshift(Object.assign({ id:'t'+(++s.tlN), pid, t:V3.now(), role, kind, text, by:V3.who[role]||V3.byMe() }, extra||{})); };
V3.KIND = { order:['Order','c-blue'], dose:['Dose','c-green'], note:['Note','c-grey'], alert:['Alert','c-red'], ack:['Acknowledged','c-violet'], vital:['Vitals','c-green'], event:['Event','c-amber'], move:['Movement','c-grey'], approval:['Approval','c-blue'], call:['Call','c-violet'], protocol:['Protocol','c-red'], lab:['Lab','c-violet'], transfer:['Referral','c-amber'], family:['Family','c-grey'], handover:['Handover','c-grey'], admit:['Admission','c-blue'], chart:['Chart','c-grey'], exam:['Exam','c-violet'] };

/* ---------- alert engine: nurse > RMO > psychiatrist > floor lead, with response times ---------- */
V3.alert = ({pid, sev, title, detail, src, by, t}) => { const s=v3(); const a={ id:'a'+(++s.alertN), pid, sev:sev||'urgent', title, detail:detail||'', src:src||'Nurse', by:by||V3.byMe(), t:t||V3.now(), ack:null, seen:null, closed:null, esc:[] }; s.alerts.unshift(a); V3.log(pid, S.role==='rmo'?'rmo':'nurse', 'alert', title+(detail?' · '+detail:''), {aid:a.id, by:a.by}); V3.tick(); return a; };
V3.sla = sev => v3().escRules[sev] || v3().escRules.urgent;
V3.tick = () => {
  const s=v3(), now=V3.now();
  s.alerts.forEach(a => {
    if(a.closed) return;
    const r=V3.sla(a.sev);
    const toPsy=a.t+r.rmo, toLead=toPsy+r.psy, end=toLead+r.lead;
    const stageDue = [[toPsy,'psychiatrist'],[toLead,'lead']];
    stageDue.forEach(([when,to]) => {
      const have=a.esc.some(e=>e.to===to);
      const ackedBefore = a.ack && a.ack.t <= when;
      if(!have && now>=when && !ackedBefore) { a.esc.push({to, t:when}); V3.log(a.pid,'system','alert','Not acknowledged in time: escalated to '+(to==='psychiatrist'?'the treating psychiatrist':'the floor lead')+' · '+a.title,{aid:a.id,by:'Escalation chain'}); }
    });
    a.overdue = !a.ack && now>=end;
  });
};
V3.holder = a => { if(a.closed) return 'closed'; if(a.ack) return a.ack.role; const e=a.esc[a.esc.length-1]; return e ? e.to : 'rmo'; };
V3.deadlineFor = a => { const r=V3.sla(a.sev); const h=V3.holder(a); if(a.ack) return a.seen?null:a.t+r.see; if(h==='rmo')return a.t+r.rmo; if(h==='psychiatrist')return a.t+r.rmo+r.psy; if(h==='lead')return a.t+r.rmo+r.psy+r.lead; return null; };
V3.canAck = a => { if(a.closed||a.ack) return false; return ['rmo','psychiatrist','lead'].includes(S.role); };
V3.ackAlert = id => { const a=v3().alerts.find(x=>x.id===id); if(!a||a.ack) return; a.ack={by:V3.byMe(), role:S.role, t:V3.now()}; V3.log(a.pid,S.role,'ack','Acknowledged: '+a.title+' · '+V3.roleName[S.role]+' '+V3.byMe()); render(); toast('Acknowledged at '+V3.hm(a.ack.t)+'. The nurse can see it.'); };
V3.seenAlert = id => { const a=v3().alerts.find(x=>x.id===id); if(!a) return;
  V3.modal('Seen the patient · '+hesc(V3.pn(a.pid)), hesc(a.title), `<div class="callout grey small">This stamps the time you reached the bedside. The nurse and the treating team see it on the alert.</div><label class="field"><span class="lbl">What you found and what you did (required)</span><textarea class="input" id="v3sn" rows="3" placeholder="e.g. Pulse 100 on recheck, CIWA 9, oral fluids encouraged, repeat vitals in 30 min"></textarea><div id="v3sne" class="small" style="color:var(--red);display:none">Write what you found first</div></label>`,
  `<button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="V3.seenDo('${id}')">Record: seen the patient</button>`); };
V3.seenDo = id => { const a=v3().alerts.find(x=>x.id===id), n=V3.val('v3sn').trim(); if(!n){$('v3sne').style.display='block';return;}
  if(!a.ack) a.ack={by:V3.byMe(),role:S.role,t:V3.now()};
  a.seen={by:V3.byMe(),role:S.role,t:V3.now(),note:n}; V3.log(a.pid,S.role,'ack','Saw the patient: '+n+' · '+a.title); closeModal(); render(); toast('Recorded at '+V3.hm(a.seen.t)); };
V3.closeAlert = id => { const a=v3().alerts.find(x=>x.id===id); if(!a) return; a.closed={by:V3.byMe(),role:S.role,t:V3.now()}; if(!a.ack)a.ack={by:V3.byMe(),role:S.role,t:V3.now()}; V3.log(a.pid,S.role,'note','Alert closed: '+a.title); render(); toast('Alert closed'); };
V3.statusLine = a => {
  const parts=[];
  if(a.ack) parts.push(`<span class="v3st ok">${V3.roleName[a.ack.role]} acknowledged ${V3.hm(a.ack.t)}</span>`); else parts.push(`<span class="v3st crit">Not acknowledged · ${V3.mins(V3.now()-a.t)}</span>`);
  if(a.seen) parts.push(`<span class="v3st ok">Saw patient ${V3.hm(a.seen.t)}</span>`); else if(a.ack){ const r=V3.sla(a.sev), due=a.t+r.see; parts.push(`<span class="v3st ${V3.now()>due?'warn':''}">Bedside by ${V3.hm(due)}${V3.now()>due?' · late':''}</span>`); }
  a.esc.forEach(e => parts.push(`<span class="v3st warn">Escalated to ${e.to==='psychiatrist'?'psychiatrist':'floor lead'} ${V3.hm(e.t)}</span>`));
  if(a.closed) parts.push(`<span class="v3st">Closed ${V3.hm(a.closed.t)}</span>`);
  return parts.join('');
};
V3.alertCard = (a, opts) => {
  opts=opts||{}; const h=V3.holder(a), r=V3.sla(a.sev), dl=V3.deadlineFor(a), left=dl==null?null:dl-V3.now();
  const sevC={critical:'c-red',urgent:'c-amber',routine:'c-grey'}[a.sev];
  const btns = a.closed ? '' :
    (V3.canAck(a)?`<button class="btn sm pri" onclick="V3.ackAlert('${a.id}')">Acknowledge</button>`:'') +
    (opts.act!==false && ['rmo','psychiatrist','lead'].includes(S.role) && !a.seen ? `<button class="btn sm" onclick="V3.seenAlert('${a.id}')">I have seen the patient</button>`:'') +
    (opts.act!==false && S.role==='rmo' && !a.closed ? `<button class="btn sm" onclick="V3.callModal('${a.pid}','${a.id}')">${V3.i('phone',14)} Call consultant</button>`:'') +
    (opts.act!==false && ['rmo','psychiatrist','lead'].includes(S.role) && a.ack && a.seen ? `<button class="btn sm" onclick="V3.closeAlert('${a.id}')">Close alert</button>`:'');
  return `<article class="v3al ${a.closed?'closed':a.sev}${a.overdue?' over':''}">
    <div class="v3al-h"><div class="row" style="gap:8px;flex-wrap:wrap">${chip({critical:'Critical',urgent:'Urgent',routine:'Routine'}[a.sev],sevC)}<strong>${hesc(V3.pn(a.pid))}</strong><span class="tiny muted">${hesc(V3.ward(a.pid))} · ${hesc(a.src)} · raised ${V3.hm(a.t)} by ${hesc(a.by)}</span></div>${!a.closed&&left!=null?`<span class="v3due ${left<0?'late':left<=2?'soon':''}">${left<0?'Overdue '+V3.mins(-left):left===0?'Due now':(a.ack?'Bedside in ':'Respond in ')+V3.mins(left)} · ${a.ack?V3.roleName[a.ack.role]:h==='rmo'?'RMO':h==='psychiatrist'?'Psychiatrist':'Floor lead'}</span>`:''}</div>
    <div class="v3al-t">${hesc(a.title)}</div>${a.detail?`<div class="small muted">${hesc(a.detail)}</div>`:''}
    <div class="v3al-s">${V3.statusLine(a)}</div>
    ${a.seen&&a.seen.note?`<div class="small" style="margin-top:6px"><span class="muted">Finding:</span> ${hesc(a.seen.note)}</div>`:''}
    ${btns?`<div class="row" style="gap:8px;margin-top:10px;flex-wrap:wrap">${btns}</div>`:''}
  </article>`;
};
V3.openAlerts = (filter) => v3().alerts.filter(a => !a.closed && (!filter || filter(a)));
V3.nurseAlertsStrip = () => {
  const L=v3().alerts.filter(a=>V3.ward(a.pid)==='Male ward').slice(0,4);
  if(!L.length) return '';
  return `<section class="card" id="v3wa"><div class="hd"><div><h3>Alerts you raised · who has responded</h3><div class="small muted" style="margin-top:4px">Every alert shows when the RMO acknowledged it and when they reached the patient. Unanswered alerts move up the chain on their own.</div></div><button class="btn sm" onclick="go('#/escalation')">Escalation chain</button></div><div class="v3al-list">${L.map(a=>V3.alertCard(a,{act:false})).join('')}</div></section>`;
};

/* ---------- timeline: merge the v3 log with what the older screens already record ---------- */
V3.timeline = pid => {
  const s=v3(), out=s.tl.filter(e=>e.pid===pid).map(e=>Object.assign({},e));
  const parse = w => { const m=String(w).match(/(\d{1,2}):(\d{2})\s*(am|pm)/i); let t=0; if(m){let h=+m[1]%12; if(/pm/i.test(m[3]))h+=12; t=h*60+(+m[2]);} const d=/Today/i.test(w)||/24 Oct/.test(w)?0:/22 Oct/.test(w)?-2:-1; return d*1440+t; };
  (S.events||[]).filter(e => (e.pid||'neel')===pid).forEach(e => out.push({id:'ev'+e.id, pid, t:/Today, now/.test(e.when)?V3.now():parse(e.when), role:/nurse/i.test(e.by)?'nurse':/RMO|duty/i.test(e.by)?'rmo':'psychiatrist', kind:'event', text:e.type+(e.sev?' ('+e.sev+')':'')+' · '+e.detail+(e.ack?' · reviewed':' · not yet reviewed'), by:e.by, derived:true}));
  const pnm=V3.pn(pid);
  (S.nInstr||[]).filter(x=>x[0]===pnm).forEach((x,i)=>out.push({id:'in'+x[6], pid, t:V3.now()-1-i, role:'psychiatrist', kind:'order', text:x[3]+' · '+x[2], by:String(x[1]).split(' · ')[0], derived:true}));
  return out.sort((a,b)=>b.t-a.t);
};

/* ---------- routing, sidebar, access ---------- */
V3.ROUTES = { floor:['lead'], ward:['nurse','rmo','psychiatrist','lead'], duty:['rmo'], escalation:['lead','nurse','rmo','psychiatrist'], timeline:['lead','nurse','rmo','psychiatrist','psychologist'], permissions:['lead','nurse','rmo','psychiatrist'] };
V3.deny = r => { const k=r[0]; return !!V3.ROUTES[k] && !V3.ROUTES[k].includes(S.role); };
V3.isV3 = k => !!V3.ROUTES[k];
V3.route = r => {
  const k=r[0], tab=r[1];
  if(k==='floor') return V3.floorPage(tab||'flow');
  if(k==='ward') return V3.wardPage(tab||'charts');
  if(k==='duty') return V3.dutyPage(tab||'night');
  if(k==='escalation') return V3.escPage();
  if(k==='timeline') return V3.tlPage(tab);
  if(k==='permissions') return V3.permPage();
  return '';
};
V3.subs = sec => {
  const b=(h,l,key,n)=>`<button class="sub ${sec===key?'on':''}" onclick="go('${h}')">${l}${n?`<span class="newtag" style="margin-left:6px">${n}</span>`:''}</button>`;
  const mine = S.role==='lead' ? b('#/floor/flow','Floor command','floor') : S.role==='nurse' ? b('#/ward/charts','Ward care','ward') : S.role==='rmo' ? b('#/duty/night','Duty desk','duty') : '';
  const shared = ['lead','nurse','rmo'].includes(S.role) ? b('#/escalation','Escalation chain','escalation')+b('#/timeline','Patient timeline','timeline')+b('#/permissions','Roles and permissions','permissions') : (S.role==='psychiatrist'?b('#/escalation','Escalation chain','escalation')+b('#/timeline','Patient timeline','timeline'):b('#/timeline','Patient timeline','timeline'));
  return mine+shared;
};

/* ---------- units ---------- */
V3.unit = {};

/* ---------- seed data for the new modules (example data, clearly a prototype) ---------- */
V3.seed = () => {
  const H = (h,m,d) => (d||0)*1440 + h*60 + (m||0);
  const all = allPts();
  const s = {
    sim:0, ui:{}, tlN:0, alertN:0, tl:[], alerts:[],
    escRules:{ critical:{rmo:2,psy:5,lead:10,see:10}, urgent:{rmo:5,psy:10,lead:20,see:20}, routine:{rmo:15,psy:30,lead:60,see:60} },
    grid:[], sched:{}, future:[], prn:{orders:[],log:[]}, refusals:{}, reasons:{}, vit:{last:{},ranges:{}}, charts:{}, adm:{}, moves:[],
    ho:{cur:null,prev:null}, orders:[], calls:[], proto:{active:null,done:[]}, labs:[], transfers:[], serious:[], exam:{}, beds:{}, alloc:{}, mhca:{}, apps:[], quality:{}, family:{}
  };
  const L = (pid,t,role,kind,text,by) => s.tl.push({id:'t'+(++s.tlN),pid,t,role,kind,text,by:by||V3.who[role]||''});
  const A = (pid,sev,title,detail,src,by,t,ack,seen,closed) => s.alerts.push({id:'a'+(++s.alertN),pid,sev,title,detail,src,by,t,ack:ack||null,seen:seen||null,closed:closed||null,esc:[]});

  /* alerts: one unanswered, one acknowledged, one closed, one critical already escalated */
  A('varun','urgent','Vitals out of range: BP 150/98, pulse 108','Day 4 of alcohol withdrawal · CIWA 11 at 1:40 pm','Vitals','Sister Rekha',H(14,7));
  A('tarun','urgent','Repeated refusal: Escitalopram 10 mg, 2nd in 24 hours','Refused again at 8 am. Says he does not want tablets.','Refusal','Sister Rekha',H(13,55),{by:'Dr. Sameer Khan',role:'rmo',t:H(13,58)});
  A('sana','urgent','Lorazepam 1 mg given at 1:15 pm: no effect after 30 minutes','Still pacing and shouting. Alert, no sedation.','SOS or PRN','Sister Maya',H(13,48),{by:'Dr. Sameer Khan',role:'rmo',t:H(13,52)},{by:'Dr. Sameer Khan',role:'rmo',t:H(13,58),note:'Settled after talking. Repeat check in 1 hour. Dr. Kunal Sethi informed.'},{by:'Dr. Sameer Khan',role:'rmo',t:H(14,3)});
  A('nikhil','critical','Temp 100.4 °F, pulse 118, tremor: possible withdrawal delirium','Day 2 of alcohol withdrawal. Restless, not oriented to time.','Vitals','Brother Anil',H(14,9));
  A('neel','urgent','Demo alert: elevated pulse after rounds','Repeat pulse 118 bpm. Nurse has not received a response yet.','Vitals','Sister Rekha',H(13,40));

  /* ---------- patient timeline seeds (Neel Bose is the worked example) ---------- */
  L('neel',H(13,30,-1),'nurse','vital','Sugar 192 mg/dL after lunch. Duty doctor told.','Sister Rekha');
  L('neel',H(23,5,-1),'nurse','dose','Lorazepam 1 mg oral SOS for sleeplessness. Settled after 30 minutes, drowsy.','Brother Joseph');
  L('neel',H(2,10),'nurse','event','Fall on the way to the bathroom. No head injury, small bruise on the left knee. Bed lowered, night light on.','Sister Rekha');
  L('neel',H(2,12),'nurse','vital','Vitals after the fall: BP 126/80, pulse 88, SpO₂ 99%, temp 98.4 °F.','Sister Rekha');
  L('neel',H(2,15),'rmo','call','Called Dr. Aanya Sharma (on call). Advice: neuro checks every 2 hours, review at the morning round.','Dr. Sameer Khan');
  L('neel',H(2,20),'rmo','order','Telephonic order: neuro checks every 2 hours until the morning round. Awaiting countersign.','Dr. Sameer Khan');
  L('neel',H(4,0),'nurse','vital','Neuro check: GCS 15, pupils equal and reactive, moves all limbs.','Brother Joseph');
  L('neel',H(6,0),'nurse','vital','Neuro check: GCS 15, pupils equal and reactive. Slept 4.5 hours.','Brother Joseph');
  L('neel',H(8,0),'nurse','dose','Morning medicines given: lithium, valproate, propranolol, vitamin B complex.','Sister Rekha');
  L('neel',H(10,20),'psychiatrist','order','Round: neuro checks every 2 hours continue; serum lithium at 7 am tomorrow. Countersigned the night order.','Dr. Aanya Sharma');
  L('neel',H(12,5),'nurse','vital','Neuro check: GCS 15, pupils equal and reactive.','Sister Rekha');
  L('neel',H(13,10),'psychologist','family','Spoke to Ananya Bose (sister) for 6 minutes. Updates will go out twice a day.','Priya Nair');
  L('tarun',H(8,0,-1),'nurse','dose','Escitalopram 10 mg refused. Reason: does not want tablets.','Brother Joseph');
  L('tarun',H(13,5),'rmo','order','STAT order: haloperidol 5 mg IM for severe agitation. Given 1:12 pm. Awaiting countersign.','Dr. Sameer Khan');
  L('tarun',H(13,12),'nurse','dose','Haloperidol 5 mg IM given with a second nurse signing. Sedation and breathing checked at 15 minutes.','Sister Rekha');
  L('tarun',H(8,0),'nurse','dose','Escitalopram 10 mg refused again. Reason: does not want tablets. Alert raised to the RMO.','Sister Rekha');
  L('varun',H(8,0),'nurse','dose','Morning medicines given including lorazepam 2 mg.','Sister Rekha');
  L('varun',H(13,40),'nurse','vital','CIWA-Ar 11. Tremor and sweating.','Sister Rekha');
  L('varun',H(13,42),'nurse','dose','Lorazepam 2 mg oral SOS for CIWA 11. Second nurse signed. Effect check due 2:12 pm.','Sister Rekha');
  L('rohit',H(10,30),'system','admit','Admitted to Suite 201. Dr. Aanya Sharma assigned by ward.','Front desk');
  L('rohit',H(10,50),'nurse','vital','Admission vitals: BP 130/84, pulse 96, temp 98.6 °F, SpO₂ 98%.','Sister Rekha');
  L('rohit',H(11,20),'nurse','note','Admitted with wife. Belongings list started. Risk screen not yet done.','Sister Rekha');
  L('nikhil',H(14,9),'nurse','vital','Temp 100.4 °F, pulse 118, BP 158/100. CIWA 17. Critical alert raised.','Brother Anil');
  L('sana',H(13,15),'nurse','dose','Lorazepam 1 mg oral SOS for agitation. Second nurse signed.','Sister Maya');
  L('sana',H(13,48),'nurse','alert','No effect after 30 minutes. Alert raised.','Sister Maya');
  all.forEach(p => { if(p.day>0) L(p.id, H(10,0,-p.day), 'system','admit','Admitted · Section '+p.sec+' · '+p.room+' · '+p.dx,'Front desk'); });

  /* ---------- nurse: doctor instructions that became slots on the grid ---------- */
  s.grid.push({id:'g1',pid:'neel',slot:'12 pm',kind:'neu',label:'Neuro check',src:'s1',st:'done',by:'Sister Rekha',at:H(12,5)});
  ['2 pm','4 pm','6 pm','8 pm'].forEach((sl,i)=>s.grid.push({id:'g'+(i+2),pid:'neel',slot:sl,kind:'neu',label:'Neuro check',src:'s1',st:''}));
  s.sched.s1 = {n:5, txt:'Neuro check every 2 hours · 12 pm to 8 pm'};
  s.future.push({id:'f1',pid:'neel',label:'Serum lithium',when:'Tomorrow, 7 am',src:'s1'});

  /* ---------- SOS and PRN orders ---------- */
  const PO = (id,pid,drug,dose,route,ind,max,gap,ds,rmo,by,cs) => s.prn.orders.push({id,pid,drug,dose,route,ind,max,gap,ds:!!ds,rmo:!!rmo,by:by||'Dr. Aanya Sharma',cs:cs||'done'});
  PO('p1','neel','Lorazepam','1 mg','Oral','Agitation or sleeplessness',3,6,1,0);
  PO('p2','neel','Haloperidol','5 mg','IM','Severe agitation not settling with the oral dose',2,1,1,1);
  PO('p4','tarun','Lorazepam','2 mg','IM','Acute agitation',2,2,1,1);
  PO('p5','tarun','Promethazine','25 mg','IM','Given with haloperidol to prevent stiffness',2,4,0,0);
  PO('p6','rohit','Lorazepam','2 mg','Oral','Agitation or insomnia',3,6,1,0);
  PO('p7','varun','Lorazepam','2 mg','Oral','CIWA score 10 or more',4,4,1,0,'Dr. Kunal Sethi');
  PO('p8','varun','Ondansetron','4 mg','Oral','Nausea or vomiting',3,8,0,0,'Dr. Sameer Khan','pending');
  PO('p9','sana','Lorazepam','1 mg','Oral','Agitation',3,6,1,0,'Dr. Kunal Sethi');
  PO('p10','nikhil','Diazepam','10 mg','Oral','CIWA score 15 or more',4,4,1,0,'Dr. Rohan Mehta');
  all.forEach(p => { if(!s.prn.orders.some(o=>o.pid===p.id&&o.drug==='Paracetamol')) PO('pg'+p.id,p.id,'Paracetamol','650 mg','Oral','Pain or fever',4,4,0,0,V3.psyOf?V3.psyOf(p.id):'Dr. Aanya Sharma'); });
  s.prn.log.push({id:'l1',oid:'p9',pid:'sana',drug:'Lorazepam 1 mg oral',t:H(13,15),reason:'Agitation, pacing and shouting',by:'Sister Maya',co:'Sister Anita',due:H(13,45),effect:{r:'No effect',sed:'Alert',at:H(13,48),by:'Sister Maya'}});
  s.prn.log.push({id:'l2',oid:'p7',pid:'varun',drug:'Lorazepam 2 mg oral',t:H(13,42),reason:'CIWA 11, tremor and sweating',by:'Sister Rekha',co:'Brother Joseph',due:H(14,12),effect:null});
  s.prn.log.push({id:'l3',oid:'p1',pid:'neel',drug:'Lorazepam 1 mg oral',t:H(23,5,-1),reason:'Could not sleep',by:'Brother Joseph',co:'Sister Maya',due:H(23,35,-1),effect:{r:'Settled',sed:'Drowsy',at:H(23,38,-1),by:'Brother Joseph'}});
  s.refusals['tarun|Escitalopram 10 mg'] = 2;

  /* ---------- vitals with actual values ---------- */
  all.forEach((p,i) => { s.vit.last[p.id] = {t:H(8,0)+(i%3)*5, sbp:112+((i*7)%24), dbp:70+((i*5)%14), hr:68+((i*9)%26), rr:15+(i%4), temp:+(98.1+((i*3)%7)/10).toFixed(1), spo2:97+(i%3), by:wardOf(p.id)==='Male ward'?'Sister Rekha':wardOf(p.id)==='Female ward'?'Sister Maya':'Brother Anil'}; });
  Object.assign(s.vit.last.neel,{sbp:128,dbp:82,hr:90,rr:18,temp:98.8,spo2:99,t:H(12,5)});
  Object.assign(s.vit.last.varun,{sbp:150,dbp:98,hr:108,rr:20,temp:99.4,spo2:97,t:H(14,2)});
  Object.assign(s.vit.last.nikhil,{sbp:158,dbp:100,hr:118,rr:22,temp:100.4,spo2:96,t:H(14,6)});
  Object.assign(s.vit.last.tarun,{sbp:122,dbp:78,hr:104,rr:18,temp:98.6,spo2:98,t:H(13,30)});
  Object.assign(s.vit.last.kavya,{sbp:92,dbp:58,hr:52,rr:14,temp:97.6,spo2:98,t:H(12,0)});
  s.vit.ranges.kavya = {sbp:[85,140,75,180],hr:[45,100,40,130]};

  /* ---------- shift charts: night 8 pm to 8 am and day 8 am to 8 pm ---------- */
  const moods = ['Calm, cooperative','Cheerful, talkative','Low, quiet, joined group','Restless in the evening','Settled, watched TV','Irritable, settled after talking'];
  all.forEach((p,i) => {
    s.charts[p.id] = { night:{sleep:6+((i*3)%3)*0.5+0.5, sleepQ:['Sound','Broken','Sound'][i%3], oral:1300+((i*130)%500), meals:['All','Most','All','Half'][i%4], urine:1000+((i*90)%500), stool:'Normal', diet:'Followed', mood:moods[i%moods.length], note:'', by:'Brother Joseph', done:true},
                       day:(i%2===0)?{oral:700+((i*60)%300), meals:['All','Most'][i%2], urine:500+((i*40)%200), stool:i%4===0?'Normal':'', diet:'Followed', mood:moods[(i+2)%moods.length], note:'', by:'Sister Rekha', done:i%4===0}:{done:false} };
  });
  Object.assign(s.charts.tarun.night,{sleep:3,sleepQ:'Broken',mood:'Agitated, paced the corridor from 1 am',note:'Needed 1:1. Refused morning tablets.'});
  Object.assign(s.charts.neel.night,{sleep:4.5,sleepQ:'Broken',mood:'Talkative. Fall at 2:10 am.',note:'Neuro checks done every 2 hours.'});
  Object.assign(s.charts.kavya.night,{meals:'Quarter',oral:700,note:'Refused dinner and supper. Weight check due.'});
  Object.assign(s.charts.nikhil.night,{sleep:2.5,sleepQ:'Broken',mood:'Restless, sweating',note:'Tremor worse at 4 am.'});

  /* ---------- admission nursing ---------- */
  s.adm.pooja = {risk:{ans:{sui1:0,sui2:0,fall1:1,fall2:0,abs1:0,abs2:0,wd1:0},by:'Sister Maya',t:H(11,0,-1)}, belong:{items:[['Clothes (4 sets)','Kept in room'],['Mobile phone','Kept safe at nursing station'],['Charger','Retained after check']],contraband:[],by:'Sister Maya',t:H(11,15,-1),witness:'Sister Anita'}, recheck:null};
  s.adm.rohit = {risk:null, belong:null, recheck:null};
  s.adm.arjun = {risk:{ans:{},by:'Sister Rekha',t:H(10,0,-12)}, belong:{items:[['Clothes (3 sets)','Kept in room'],['Mobile phone','With family']],contraband:[],by:'Sister Rekha',t:H(10,30,-12),witness:'Brother Joseph'}, recheck:{reason:'Visitors 1:20 to 1:58 pm (wife)',since:H(13,58)}};
  s.adm.sana = {risk:{ans:{sui1:1,sui2:1,abs1:1},by:'Sister Maya',t:H(10,0,-3)}, belong:{items:[['Clothes (3 sets)','Kept in room'],['Hair accessories','Retained, no sharp parts']],contraband:[['Hair clip with sharp edge','Removed and sealed']],by:'Sister Maya',t:H(10,30,-3),witness:'Sister Anita'}, recheck:null};

  /* ---------- patient movement ---------- */
  s.moves = [
    {id:'m1',pid:'kabir',type:'Test',where:'ECG room, general block',withWho:'Brother Joseph',out:H(13,55),due:H(14,15),st:'out'},
    {id:'m2',pid:'sameer',type:'Therapy',where:'Group therapy room',withWho:'Priya Nair',out:H(13,50),due:H(14,40),st:'out'},
    {id:'m3',pid:'arjun',type:'Visitors',where:'Visiting room, with his wife',withWho:'Front desk',out:H(13,20),due:H(14,0),back:H(13,58),st:'back'},
    {id:'m4',pid:'varun',type:'Therapy',where:'Yoga hall',withWho:'Activity team',out:H(11,30),due:H(12,30),back:H(12,26),st:'back'}
  ];

  /* ---------- handover: last night shift to this day shift, acknowledged ---------- */
  s.ho.prev = {id:'h0',from:'Brother Joseph',to:'Sister Rekha',shift:'Night shift 8 pm to 8 am',t:H(7,50),ackBy:'Sister Rekha',ackAt:H(8,4),summary:'Quiet night apart from the fall at 2:10 am (Neel Bose) and Tarun Roy needing 1:1 from 1 am. Rohit Kapoor arrives today.',items:[{k:'Neuro checks every 2 hours for Neel Bose until the round',pid:'neel',carried:true},{k:'Tarun Roy on 1:1. Refused morning tablets.',pid:'tarun',carried:true},{k:'Weekly WBC for Karan Malhotra before the clozapine dose',pid:'kabir',carried:true}]};

  /* ---------- RMO orders, calls, labs, referrals, serious events ---------- */
  s.orders = [
    {id:'o1',pid:'neel',type:'Telephonic',text:'Neuro checks every 2 hours until the morning round',by:'Dr. Sameer Khan',via:'Dr. Aanya Sharma',t:H(2,20),cs:{by:'Dr. Aanya Sharma',t:H(10,20)},given:null},
    {id:'o2',pid:'tarun',type:'STAT',text:'Haloperidol 5 mg IM for severe agitation',by:'Dr. Sameer Khan',via:'Dr. Aanya Sharma',t:H(13,5),cs:null,given:{by:'Sister Rekha',t:H(13,12)}},
    {id:'o3',pid:'varun',type:'SOS',text:'Ondansetron 4 mg oral for nausea, up to 3 in 24 hours',by:'Dr. Sameer Khan',via:'Dr. Kunal Sethi',t:H(11,30),cs:null,given:null}
  ];
  s.calls = [{id:'c1',pid:'neel',to:'Dr. Aanya Sharma',t:H(2,15),dur:4,by:'Dr. Sameer Khan',sbar:{s:'Fall at 2:10 am on the way to the bathroom, no head injury.',b:'Bipolar disorder, manic, day 6. Lithium, olanzapine, valproate.',a:'Vitals stable, GCS 15, small bruise on the left knee.',r:'Neuro checks every 2 hours; review at the morning round.'},advice:'Neuro checks every 2 hours until the morning round. Call again if GCS drops or he vomits.',orders:['o1'],readback:true}];
  s.labs = [
    {id:'b1',pid:'neel',test:'Serum lithium',val:0.9,unit:'mmol/L',lo:0.6,hi:1.2,crit:1.5,t:H(7,0,-3),rev:{by:'Dr. Aanya Sharma',t:H(10,0,-3),finding:'In range. Continue the same dose.',action:'No action'}},
    {id:'b2',pid:'kabir',test:'WBC',val:3.2,unit:'×10⁹/L',lo:4,hi:11,t:H(9,40)},
    {id:'b3',pid:'kabir',test:'Absolute neutrophil count',val:1.4,unit:'×10⁹/L',lo:1.5,hi:7.5,critLow:1.0,t:H(9,40)},
    {id:'b4',pid:'nikhil',test:'Sodium',val:131,unit:'mmol/L',lo:135,hi:145,critLow:125,t:H(11,5)},
    {id:'b5',pid:'sana',test:'Prolactin',val:62,unit:'ng/mL',lo:3,hi:25,t:H(9,15),rev:{by:'Dr. Sameer Khan',t:H(12,10),finding:'High on risperidone. Passed to Dr. Kunal Sethi for a dose review.',action:'Inform psychiatrist'}},
    {id:'b6',pid:'varun',test:'ALT',val:78,unit:'U/L',lo:7,hi:40,t:H(9,0),rev:{by:'Dr. Sameer Khan',t:H(11,40),finding:'Raised, expected with alcohol use. Repeat in a week.',action:'Repeat test'}},
    {id:'b7',pid:'tarun',test:'QTc (ECG)',val:468,unit:'ms',lo:300,hi:450,critHigh:500,t:H(12,20)}
  ];
  s.pending = [{pid:'neel',test:'Serum lithium',when:'Tomorrow, 7 am',st:'Ordered'},{pid:'rohit',test:'Admission bloods',when:'Collected 11:00 am',st:'Awaiting result'}];
  s.transfers = [
    {id:'x1',pid:'neel',kind:'Visiting specialist',to:'Endocrinologist',why:'Blood sugar above 180 on 2 days',by:'Dr. Aanya Sharma',urg:'Within 24 hours',stage:1,log:[[H(9,10),'Requested by Dr. Aanya Sharma','Dr. Sameer Khan'],[H(11,0),'Slot confirmed: Dr. R. Pillai, today 5:30 pm','Dr. Sameer Khan']],closed:null},
    {id:'x2',pid:'kavya',kind:'General hospital',to:'City General Hospital, medicine ward',why:'Low potassium and low BP with poor intake',by:'Dr. Kunal Sethi',urg:'Urgent today',stage:1,log:[[H(10,40),'Requested by Dr. Kunal Sethi','Dr. Sameer Khan'],[H(12,30),'Hospital accepted. Bed ready by 3 pm.','Dr. Sameer Khan']],closed:null},
    {id:'x3',pid:'rahul',kind:'Visiting specialist',to:'ENT',why:'Ear pain for 3 days',by:'Dr. Rohan Mehta',urg:'Routine',stage:4,log:[[H(10,0,-2),'Requested','Dr. Sameer Khan'],[H(15,0,-1),'Seen by ENT, drops started','Dr. Sameer Khan']],closed:{t:H(9,0),outcome:'Advice only, no change here',by:'Dr. Sameer Khan'}}
  ];
  s.serious = [{id:'se1',pid:'dev',type:'Absconding',t:H(16,10,-7),where:'Garden gate',found:H(16,35,-7),by:'Sister Rekha',narr:'Left the garden while walking with the group. Brought back by security after 25 minutes.',inform:{lead:H(16,15,-7),consultant:H(16,18,-7),ms:H(16,40,-7),family:H(16,50,-7)},police:'Not needed: found within the hour',closed:true}];

  /* ---------- floor lead: beds, allocation, approvals, quality, family ---------- */
  s.beds.reserved = {};
  s.beds.expected = [
    {id:'e1',name:'Aditya Verma',age:33,sex:'M',ward:'Male ward',src:'OPD, Dr. Aanya Sharma',dx:'Mania with psychotic features',eta:H(17,0),room:'Standard',st:'Confirmed',bed:null},
    {id:'e2',name:'Ishita Rao',age:27,sex:'F',ward:'Female ward',src:'OPD, Dr. Kunal Sethi',dx:'Severe depression',eta:H(18,0),room:'Standard',st:'Confirmed',bed:null},
    {id:'e3',name:'Mohan Das',age:52,sex:'M',ward:'De-addiction ward',src:'City General ED, after detox',dx:'Alcohol dependence',eta:H(10,0,1),room:'Standard',st:'Likely',bed:null}
  ];
  s.beds.dis = {
    dev:{when:'Today, 4 pm',chk:{sum:false,meds:true,fam:true,fu:true,bill:true}},
    arjun:{when:'Tomorrow, 11 am',chk:{sum:false,meds:false,fam:true,fu:false,bill:false}},
    meera:{when:'In 2 days',chk:{sum:false,meds:false,fam:false,fu:false,bill:false}}
  };
  s.beds.longNote = {kabir:'Clozapine titration. Case conference today 5:30 pm.', rahul:'Waiting for family to agree to follow-up.'};
  s.beds.maint = {};

  s.alloc.psy = {}; s.alloc.psych = {};
  all.forEach(p => { s.alloc.psy[p.id] = V3.psyOf(p.id); const w=wardOf(p.id); s.alloc.psych[p.id] = PSYCHOF[p.id]!==undefined ? PSYCHOF[p.id] : (w==='Female ward'?'Kiran Mehra':'Surabhi Sengar'); });
  s.alloc.leave = {'Dr. Rohan Mehta':{from:0,to:0,cover:{dev:'Dr. Nandini Rao'},why:'Off duty today'}};
  s.alloc.newDone = false;

  s.apps = [
    {id:'ap1',kind:'Home leave',pid:'arjun',by:'Dr. Aanya Sharma',t:H(9,30),ask:'Saturday, 6 hours, with his wife',why:'Day 12, mood improving. First step before discharge planning.',chk:[['Capacity assessed this week',1],['No risk events in 7 days',1],['Family consent signed',1],['Medicines for the day packed',0]],st:'open'},
    {id:'ap2',kind:'LAMA',pid:'aman',by:'Dr. Rohan Mehta',t:H(11,0),ask:'Family wants to take him home today',why:'Day 5 of withdrawal. Family worried about cost.',chk:[['Capacity assessment today',0],['Doctor counselled patient and family',0],['Risks explained and signed',0],['Medicines and follow-up plan ready',0]],st:'open',block:'Dr. Rohan Mehta is off duty. Ask Dr. Nandini Rao or another consultant to counsel first.'},
    {id:'ap3',kind:'ECT',pid:'kabir',by:'Dr. Aanya Sharma',t:H(8,45),ask:'Modified ECT, 6 sessions, first on Thursday',why:'Not responding to clozapine and amisulpride. Pre-MECT work-up in progress.',chk:[['Written informed consent on file',1],['Capacity assessed at consent',1],['Anaesthesia fitness cleared',0],['Second psychiatrist opinion',1]],st:'open'},
    {id:'ap4',kind:'Early discharge',pid:'sameer',by:'Dr. Rohan Mehta',t:H(10,15),ask:'Leave on 2 Nov, three days before plan',why:'Family travelling. Settled, no compulsions for 4 days.',chk:[['Capacity and risk review done',1],['Follow-up booked',0],['Discharge summary drafted',0],['Family agrees to supervise medicines',1]],st:'open'},
    {id:'ap5',kind:'Outing',pid:'neel',by:'Priya Nair',t:H(9,0),ask:'Supervised outing Sunday, 3 hours, with his sister',why:'High risk, observation every 15 minutes. Asking for staff escort as well.',chk:[['Risk review within 24 hours',1],['Escort named',1],['Family consent signed',1],['Fall precautions explained',0]],st:'open'}
  ];
  s.quality = {
    spot:[
      {id:'sc1',t:H(16,0,-1),type:'Daily note quality',who:'Dr. Kunal Sethi',pid:'varun',finding:'3 notes sampled. 2 repeat yesterday’s text.',rating:'Needs work',owner:'Dr. Kunal Sethi',due:'Tomorrow',st:'Open'},
      {id:'sc2',t:H(11,0,-1),type:'Medicine chart signing',who:'Male ward nursing',pid:'',finding:'20 doses sampled. All signed with time and initials.',rating:'Good',owner:'Sister Rekha',due:'',st:'Closed'},
      {id:'sc3',t:H(15,0,-2),type:'Consent forms',who:'Front desk',pid:'rohit',finding:'Form C decision not recorded at admission.',rating:'Needs work',owner:'Dr. Aanya Sharma',due:'Today',st:'Open'}
    ],
    dsum:{target:24, hist:[6,9,31,12,5,26,8,14], pending:[{pid:'dev',ordered:H(9,0),draft:'Priya Nair, 10:20 am',block:'Dr. Rohan Mehta is off duty'}]},
    griev:[
      {id:'g1',pid:'neel',who:'Family',text:'Updates feel repetitive',raised:H(13,10),clock:6,owner:'Priya Nair',st:'Open'},
      {id:'g2',pid:'aman',who:'Family',text:'Bill statement not clear',raised:H(8,0,-1),clock:24,owner:'Accounts',st:'Open'},
      {id:'g3',pid:'neel',who:'Patient',text:'Room too noisy at night',raised:H(20,0,-2),clock:24,owner:'Nursing head',st:'Resolved',closedAt:H(10,0,-1)}
    ]
  };
  const CG = [['Ananya Bose','Sister'],['Meera Kapoor','Wife'],['Suresh Roy','Father'],['Rekha Mehta','Wife'],['Dinesh Rao','Brother'],['Pushpa Das','Mother'],['Anil Malhotra','Father'],['Seema Kumar','Wife'],['Vikram Iyer','Husband'],['Kamala Gill','Mother'],['Rajiv Arora','Brother'],['Neha Jain','Wife'],['Lata Sethi','Mother'],['Farah Qureshi','Sister'],['Suman Malhotra','Mother'],['Joseph Menon','Father'],['Anita Bhatt','Mother']];
  all.forEach((p,i) => { const c=CG[i%CG.length]; s.family[p.id] = {cg:c[0],rel:c[1],ph:'+91 98XXX XXX'+String(10+i*3).padStart(2,'0'),last:p.day<2?null:H(12,10)-((i%3)*1440),call24:p.day>=2?{st:'done',t:H(11,0,-p.day+1),min:5+(i%4)}:{st:'due'},meet:{when:p.day%7===0?'Today':'In '+(7-(p.day%7))+' days',st:p.day%7===0?'due':'planned'}}; });
  s.family.rohit.call24 = {st:'due',by:H(11,0,1)};
  s.family.pooja.call24 = {st:'late',by:H(15,0)};
  s.family.neel.meet = {when:'Today, 12:00',st:'held'};
  s.family.neel.last = H(12,10);
  s.family.tarun.d34 = {st:'due',when:'Today'};
  s.family.kabir.meet = {when:'Yesterday',st:'late'};
  s.family.varun.meet = {when:'Today, 5 pm',st:'planned'};
  s.exam = {rules:{high:24,newAdm:24,newDays:3,other:168}, last:{neel:H(9,30), kabir:H(9,0,-2)}};
  return s;
};
V3.psyOf = pid => { const m = PSYOF[pid]; if(m) return m; const w = wardOf(pid); return WARD_PSY[w] || 'Dr. Aanya Sharma'; };

/* ======================================================================
   FLOOR LEAD · Floor command
   ====================================================================== */
V3.STAFF = { psy:[{n:'Dr. Nandini Rao',tag:'Floor lead',senior:1,note:'Complex and VVIP cases'},{n:'Dr. Aanya Sharma',tag:'Senior consultant',senior:1},{n:'Dr. Rohan Mehta',tag:'Consultant'},{n:'Dr. Kunal Sethi',tag:'Consultant'}], psych:[{n:'Priya Nair'},{n:'Kiran Mehra'},{n:'Surabhi Sengar'}] };
V3.eff = (kind,pid) => { const a=v3().alloc, o=a[kind][pid], lv=a.leave[o]; return (lv && lv.cover && lv.cover[pid]) ? lv.cover[pid] : o; };
V3.onLeave = name => { const lv=v3().alloc.leave[name]; return (lv && lv.from<=0 && lv.to>=0) ? lv : null; };
V3.load = (name,kind) => allPts().filter(p => V3.eff(kind,p.id)===name).length;
V3.owned = (name,kind) => allPts().filter(p => v3().alloc[kind][p.id]===name);
V3.uncovered = name => V3.owned(name,'psy').filter(p => { const lv=V3.onLeave(name); return lv && !(lv.cover&&lv.cover[p.id]); });

V3.floorBadges = () => {
  const m=V3.mhItems().filter(i=>i.status==='late').length, ap=V3.openApprovals().length, ex=v3().beds.expected.filter(e=>!e.bed).length;
  const unc=['Dr. Rohan Mehta','Dr. Kunal Sethi','Dr. Aanya Sharma','Dr. Nandini Rao'].reduce((n,x)=>n+V3.uncovered(x).length,0)+(v3().alloc.newDone?0:1);
  const q=v3().quality, qn=q.spot.filter(x=>x.st==='Open').length+q.dsum.pending.length;
  const f=Object.values(v3().family).filter(x=>x.call24.st==='late'||x.meet.st==='late').length+allPts().filter(p=>v3().family[p.id].call24.st==='due').length;
  return {flow:ex,allocate:unc,mhca:m,approvals:ap,quality:qn,family:f};
};
V3.floorPage = tab => {
  $('title').textContent='Floor command';
  const B=V3.floorBadges();
  const T=[['flow','Beds and flow',B.flow,'amber'],['allocate','Allocation',B.allocate,'amber'],['mhca','MHCA compliance',B.mhca,'crit'],['approvals','Approvals',B.approvals,'blue'],['quality','Quality',B.quality,'amber'],['family','Family comms',B.family,'amber']];
  if(!T.some(x=>x[0]===tab)) tab='flow';
  const body = {flow:V3.pFlow,allocate:V3.pAlloc,mhca:V3.pMhca,approvals:V3.pApprovals,quality:V3.pQuality,family:V3.pFamily}[tab]();
  return V3.head('Floor command','Beds, teams, statutory deadlines, approvals, quality and families for '+V3.dateLabel()+'. Everything you need to run the floor in one place.')+V3.tabs('floor',T,tab)+body;
};
V3.dateLabel = () => new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'});

/* ---------------- 1. Beds and flow ---------------- */
V3.BEDS = {
  'Male ward':['Suite 201|Suite','Suite 202|Suite','Room 210|Single','Room 211|Single','Room 212 A|Twin sharing','Room 212 B|Twin sharing','Room 213 A|Twin sharing','Room 213 B|Twin sharing','Room 214 A|Deluxe','Room 214 B|Deluxe','Room 215 A|Standard','Room 215 B|Standard','Room 216 · Observation|Observation','Room 217 · Observation|Observation'],
  'Female ward':['Room 310 A|Standard','Room 310 B|Standard','Room 311|Single','Room 312 A|Twin sharing','Room 312 B|Twin sharing','Room 313|Single','Room 314 A|Deluxe','Room 314 B|Deluxe','Room 315|Standard','Room 316 · Observation|Observation'],
  'De-addiction ward':['Room 120|Standard','Room 121 A|Twin sharing','Room 121 B|Twin sharing','Room 122|Single','Room 123 A|Twin sharing','Room 123 B|Twin sharing','Room 124|Standard','Room 125 · Detox|Observation']
};
V3.bedsOf = w => V3.BEDS[w].map(x => { const [label,type]=x.split('|'); return {label,type,patient:WARDS[w].find(p=>p.room===label)||null}; });
V3.bedState = (w,b) => { const s=v3().beds; if(b.patient) return 'occ'; if(s.reserved[b.label]) return 'res'; if(s.maint[b.label]) return 'clean'; return 'free'; };
V3.occ = w => { const L=V3.bedsOf(w), o=L.filter(b=>b.patient).length; return {total:L.length,occ:o,free:L.filter(b=>V3.bedState(w,b)==='free').length,res:L.filter(b=>V3.bedState(w,b)==='res').length,clean:L.filter(b=>V3.bedState(w,b)==='clean').length}; };
V3.dischargeReady = pid => { const d=v3().beds.dis[pid]; if(!d) return {n:0,t:5,chk:{}}; const c=Object.assign({},d.chk); if(pid==='dev'&&S.done.l5) c.sum=true; const n=Object.values(c).filter(Boolean).length; return {n,t:5,chk:c}; };
V3.DCHK = [['sum','Discharge summary signed'],['meds','Medicines ready'],['fam','Family told and transport set'],['fu','Follow-up booked'],['bill','Bill cleared']];
V3.pFlow = () => {
  const s=v3(), u=s.ui; u.bedWard=u.bedWard||'Male ward'; u.longN=u.longN||14;
  const wards=Object.keys(WARDS), W=u.bedWard;
  const totals=wards.reduce((a,w)=>{const o=V3.occ(w);a.t+=o.total;a.o+=o.occ;a.f+=o.free;return a;},{t:0,o:0,f:0});
  const todayExp=s.beds.expected.filter(e=>V3.day(e.eta)===0), dis=Object.entries(s.beds.dis);
  const disToday=dis.filter(([,d])=>/^Today/.test(d.when)).length, disTom=dis.filter(([,d])=>/^Tomorrow/.test(d.when)).length;
  const long=allPts().filter(p=>p.day>=u.longN).sort((a,b)=>b.day-a.day);
  const kp=[V3.kpi('Beds occupied',totals.o+' of '+totals.t,Math.round(totals.o/totals.t*100)+'% across the floor',''),
    V3.kpi('Beds free now',totals.f,wards.map(w=>V3.occ(w).free+' '+w.replace(' ward','')).join(' · '),'ok'),
    V3.kpi('Expected admissions',s.beds.expected.length,todayExp.length+' today · '+s.beds.expected.filter(e=>!e.bed).length+' without a bed',s.beds.expected.some(e=>!e.bed)?'warn':'ok',"document.getElementById('v3exp').scrollIntoView({behavior:'smooth'})"),
    V3.kpi('Planned discharges',dis.length,disToday+' today · '+disTom+' tomorrow','',"document.getElementById('v3dis').scrollIntoView({behavior:'smooth'})"),
    V3.kpi('Long stay',long.length,'Day '+u.longN+' or more','',"document.getElementById('v3long').scrollIntoView({behavior:'smooth'})")].join('');
  const wsw=wards.map(w=>{const o=V3.occ(w);return `<button class="v3ws ${W===w?'on':''}" onclick="S.v3.ui.bedWard='${w}';render()"><span><b>${w}</b><span class="tiny muted">Floor ${floorNo(WARDS[w][0])}</span></span><span class="v3ws-n">${o.occ}<small>/${o.total}</small></span>${V3.bar(o.occ/o.total*100,o.free===0?'crit':o.free<=1?'warn':'')}</button>`;}).join('');
  const tile=b=>{const st=V3.bedState(W,b),p=b.patient,dis=p&&v3().beds.dis[p.id],res=v3().beds.reserved[b.label];
    if(st==='occ'){const lv=/^Today/.test((dis||{}).when||'');
      return `<button class="bed occ ${p.risk?'risk':''}" onclick="V3.bedModal('${W}','${hesc(b.label)}')" aria-label="${hesc(b.label)}, ${hesc(p.name)}">
        <span class="bed-h"><span>${hesc(b.label.replace('Room ','R-'))}</span><span class="tiny muted">${hesc(b.type)}</span></span>
        <span class="bed-p">${av(p.ini,30,p.risk?'c-red':'c-blue')}<span class="bed-n"><b>${hesc(p.name)}</b><span class="tiny muted">Day ${p.day||0} · Sec ${p.sec}</span></span></span>
        <span class="bed-f">${p.risk?chip('High risk','c-red'):''}${/^(1:1|Every 15)/.test(EX[p.id][0])?chip(EX[p.id][0].replace('Every ','q'),'c-amber'):''}${lv?chip('Leaves today','c-green'):''}</span></button>`;}
    return `<button class="bed ${st}" onclick="V3.bedModal('${W}','${hesc(b.label)}')" aria-label="${hesc(b.label)}, ${st==='free'?'free':st==='res'?'reserved':'being cleaned'}">
      <span class="bed-h"><span>${hesc(b.label.replace('Room ','R-'))}</span><span class="tiny muted">${hesc(b.type)}</span></span>
      <span class="bed-e">${st==='free'?V3.i('bed',20)+'<b>Free</b>':st==='res'?V3.i('clock',20)+'<b>Reserved</b><span class="tiny">'+hesc(res.name)+' · '+V3.hm(res.eta)+'</span>':V3.i('shield',20)+'<b>'+hesc(s.beds.maint[b.label])+'</b>'}</span></button>`;};
  const exp=s.beds.expected.map(e=>`<div class="li" style="align-items:flex-start"><div class="grow"><div class="row" style="gap:8px"><strong>${hesc(e.name)}</strong><span class="tiny muted">${e.age} ${e.sex} · ${hesc(e.ward)}</span></div><div class="small muted">${hesc(e.dx)} · ${hesc(e.src)}</div><div class="row" style="gap:6px;margin-top:6px">${chip((V3.day(e.eta)===0?'Today ':'Tomorrow ')+V3.hm(e.eta),'c-blue')}${chip(e.st,e.st==='Confirmed'?'c-green':'c-grey')}${e.bed?chip('Bed '+hesc(e.bed.replace('Room ','R-')),'c-green'):chip('No bed yet','c-amber')}${e.team?chip('Team set','c-green'):chip('Team not set','c-grey')}</div></div><div class="col-end"><button class="btn sm ${e.bed?'':'pri'}" onclick="V3.assignBed('${e.id}')">${e.bed?'Change bed':'Assign bed'}</button><button class="btn sm" onclick="V3.allocModal('exp','${e.id}')">${e.team?'Team':'Allocate team'}</button></div></div>`).join('');
  const dr=dis.map(([pid,d])=>{const p=V3.P(pid),r=V3.dischargeReady(pid);return `<div class="li" style="align-items:flex-start"><div class="grow"><div class="row" style="gap:8px"><strong>${hesc(p.name)}</strong><span class="tiny muted">${hesc(p.room)} · Day ${p.day}</span></div><div class="small muted">${hesc(d.when)} · ${hesc(V3.eff('psy',pid))}</div><div class="row" style="gap:10px;margin-top:6px;flex-wrap:nowrap">${V3.bar(r.n/r.t*100,r.n===r.t?'ok':'')}<span class="tiny" style="white-space:nowrap">${r.n} of ${r.t} ready</span></div></div><button class="btn sm" onclick="V3.dischModal('${pid}')">Checklist</button></div>`;}).join('');
  const lg=long.map(p=>{const lim=String(p.sec)==='90'?90:30,note=s.beds.longNote[p.id];return `<div class="li" style="align-items:flex-start"><div class="grow"><div class="row" style="gap:8px"><strong>${hesc(p.name)}</strong>${chip('Section '+p.sec,'c-violet')}<span class="tiny muted">${hesc(wardOf(p.id))}</span></div><div class="small muted">${hesc(p.dx)}</div><div class="row" style="gap:10px;margin-top:6px;flex-wrap:nowrap">${V3.bar(p.day/lim*100,p.day/lim>.8?'warn':'')}<span class="tiny" style="white-space:nowrap">Day ${p.day} of ${lim}</span></div>${note?`<div class="small" style="margin-top:6px">${hesc(note)}</div>`:''}</div><button class="btn sm" onclick="V3.longModal('${p.id}')">${note?'Edit note':'Review note'}</button></div>`;}).join('');
  const proj=wards.map(w=>{const o=V3.occ(w),ex=s.beds.expected.filter(e=>e.ward===w&&V3.day(e.eta)===0).length,dt=dis.filter(([pid,d])=>wardOf(pid)===w&&/^Today/.test(d.when)).length;return {w,now:o.occ,ex,dt,end:o.occ+ex-dt,total:o.total};});
  const flow=`<div class="v3flow">${proj.map(x=>`<div class="v3flow-r"><span class="v3flow-w">${x.w.replace(' ward','')}</span><span class="v3flow-b">${V3.bar(x.now/x.total*100)}</span><span class="tiny"><b>${x.now}</b> now <span class="up">+${x.ex}</span> <span class="dn">−${x.dt}</span> → <b>${x.end}</b> of ${x.total} by tonight</span></div>`).join('')}</div>`;
  return `<div class="v3kpis">${kp}</div>
  <section class="card"><div class="hd"><div><h3>Bed map</h3><div class="small muted" style="margin-top:4px">Tap a bed for the patient or to reserve it.</div></div><div class="row tiny" style="gap:12px"><span class="v3lg occ">Occupied</span><span class="v3lg free">Free</span><span class="v3lg res">Reserved</span><span class="v3lg clean">Cleaning or blocked</span></div></div>
    <div class="v3wsw">${wsw}</div><div class="bedgrid">${V3.bedsOf(W).map(tile).join('')}</div>
    <div class="pad" style="border-top:1px solid var(--line-2)"><div class="lbl" style="margin-bottom:8px">Where the floor will be by tonight</div>${flow}</div></section>
  <div class="v3cols"><section class="card" id="v3exp"><div class="hd"><div><h3>Expected admissions</h3><div class="small muted" style="margin-top:4px">Give each one a bed and a team before they arrive</div></div></div>${exp}</section>
  <section class="card" id="v3dis"><div class="hd"><div><h3>Planned discharges</h3><div class="small muted" style="margin-top:4px">Five things must be ready before the patient leaves</div></div></div>${dr}</section></div>
  <section class="card" id="v3long"><div class="hd"><div><h3>Long-stay patients</h3><div class="small muted" style="margin-top:4px">Every one needs a reason on file for the stay</div></div><label class="row" style="gap:8px"><span class="small muted">Show day</span><select class="input" style="width:90px;min-height:34px" onchange="S.v3.ui.longN=+this.value;render()">${[7,14,21,30].map(n=>`<option ${u.longN===n?'selected':''} value="${n}">${n}+</option>`).join('')}</select></label></div>${lg||V3.empty('Nobody has stayed this long')}</section>`;
};
V3.bedModal = (w,label) => {
  const b=V3.bedsOf(w).find(x=>x.label===label), st=V3.bedState(w,b), s=v3(), p=b.patient;
  if(st==='occ'){ const r=V3.dischargeReady(p.id);
    return V3.modal(hesc(p.name)+' · '+hesc(label),hesc(w)+' · '+hesc(b.type),`<div class="flh">${av(p.ini,40,p.risk?'c-red':'c-blue')}<div class="grow"><div class="nm">${hesc(p.name)} <span class="tiny muted" style="font-weight:400">· ${window.psyPatientLine?psyPatientLine(p):`${p.age||''}/${p.sex||''} ${p.room||''}`} · Day ${p.day||0}</span></div><div class="small muted">${hesc(p.dx)}</div></div>${p.risk?chip('High risk','c-red'):''}</div>
      <div class="kv"><div><span class="tiny muted">Psychiatrist</span><b>${hesc(V3.eff('psy',p.id))}</b></div><div><span class="tiny muted">Psychologist</span><b>${hesc(V3.eff('psych',p.id)||'Not set')}</b></div><div><span class="tiny muted">Observation</span><b>${hesc(EX[p.id][0])}</b></div></div>
      ${s.beds.dis[p.id]?`<div class="callout blue small">Planned discharge: ${hesc(s.beds.dis[p.id].when)} · ${r.n} of ${r.t} ready.</div>`:''}`,
      `<button class="btn" onclick="V3.timelineOf('${p.id}')">Timeline</button><button class="btn" onclick="V3.allocModal('pt','${p.id}')">Change team</button><button class="btn pri" onclick="closeModal();go('#/patient/${p.id}/overview')">Open patient file</button>`);
  }
  if(st==='free'){ const exp=s.beds.expected.filter(e=>!e.bed&&e.ward===w);
    return V3.modal('Bed '+hesc(label),hesc(w)+' · '+hesc(b.type)+' · free',`<label class="field"><span class="lbl">Reserve for</span>${V3.sel('v3rs',[['','Choose an expected admission']].concat(exp.map(e=>[e.id,e.name+' · '+V3.hm(e.eta)])),'')}<span class="tiny muted">${exp.length?'Only expected admissions to this ward are listed.':'No expected admission to this ward needs a bed.'}</span></label><div class="callout grey small">Or take the bed out of use for cleaning or maintenance. It will not count as free.</div>`,
      `<button class="btn" onclick="V3.bedMaint('${hesc(label)}','Being cleaned')">Mark cleaning</button><button class="btn" onclick="V3.bedMaint('${hesc(label)}','Blocked for repair')">Block for repair</button><button class="btn pri" onclick="V3.bedReserve('${w}','${hesc(label)}')">Reserve bed</button>`);
  }
  if(st==='res'){ const r=s.beds.reserved[label]; return V3.modal('Bed '+hesc(label),'Reserved',`<div class="callout blue small">Reserved for <strong>${hesc(r.name)}</strong>, arriving ${V3.hm(r.eta)}.</div>`,`<button class="btn" onclick="closeModal()">Close</button><button class="btn pri" onclick="V3.bedRelease('${hesc(label)}')">Release bed</button>`); }
  V3.modal('Bed '+hesc(label),hesc(s.beds.maint[label]),`<div class="callout grey small">This bed is out of use. Put it back when it is ready.</div>`,`<button class="btn" onclick="closeModal()">Close</button><button class="btn pri" onclick="V3.bedMaint('${hesc(label)}',null)">Bed is ready</button>`);
};
V3.bedReserve = (w,label) => { const id=V3.val('v3rs'); const e=v3().beds.expected.find(x=>x.id===id); if(!e){toast('Choose an expected admission first');return;} e.bed=label; v3().beds.reserved[label]={name:e.name,eta:e.eta,id:e.id}; closeModal(); render(); toast(label+' reserved for '+e.name); };
V3.bedRelease = label => { const r=v3().beds.reserved[label]; const e=v3().beds.expected.find(x=>x.id===(r||{}).id); if(e)e.bed=null; delete v3().beds.reserved[label]; closeModal(); render(); toast('Bed released'); };
V3.bedMaint = (label,why) => { if(why) v3().beds.maint[label]=why; else delete v3().beds.maint[label]; closeModal(); render(); toast(why?label+': '+why.toLowerCase():label+' is free again'); };
V3.assignBed = id => {
  const e=v3().beds.expected.find(x=>x.id===id), free=V3.bedsOf(e.ward).filter(b=>V3.bedState(e.ward,b)==='free'||b.label===e.bed);
  V3.modal('Bed for '+hesc(e.name),hesc(e.ward)+' · arriving '+V3.hm(e.eta),`<div class="field"><span class="lbl">Free beds in ${hesc(e.ward)}</span><div class="bedpick">${free.length?free.map(b=>`<button class="tog ${e.bed===b.label?'on':''}" data-g="bp" onclick="V3.pick(this,'bp');S.v3.ui.bp='${hesc(b.label)}'">${hesc(b.label.replace('Room ','R-'))} · ${hesc(b.type)}</button>`).join(''):V3.empty('No free bed in this ward','Open Beds and flow, free one up, or plan a transfer.')}</div></div><div class="callout grey small">Suite and deluxe rooms go to patients who asked for them. Observation beds stay for high-risk patients.</div>`,
    `<button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="V3.assignBedDo('${id}')">Reserve bed</button>`); S.v3.ui.bp=e.bed||null;
};
V3.assignBedDo = id => { const e=v3().beds.expected.find(x=>x.id===id), b=v3().ui.bp; if(!b){toast('Pick a bed');return;} if(e.bed) delete v3().beds.reserved[e.bed]; e.bed=b; v3().beds.reserved[b]={name:e.name,eta:e.eta,id:e.id}; closeModal(); render(); toast(b+' reserved for '+e.name); };
V3.dischModal = pid => {
  const p=V3.P(pid), r=V3.dischargeReady(pid);
  V3.modal('Discharge checklist · '+hesc(p.name),hesc(v3().beds.dis[pid].when),`<div class="flck">${V3.DCHK.map(([k,l])=>`<label class="r" style="cursor:pointer"><input type="checkbox" style="accent-color:var(--blue);width:16px;height:16px" ${r.chk[k]?'checked':''} ${pid==='dev'&&k==='sum'&&S.done.l5?'disabled':''} onchange="v3().beds.dis['${pid}'].chk.${k}=this.checked"><div class="grow">${l}</div>${k==='sum'&&pid==='dev'&&!S.done.l5?`<button class="btn sm" onclick="closeModal();flSign()">Sign as covering doctor</button>`:''}</label>`).join('')}</div>`,`<button class="btn pri" onclick="closeModal();render()">Done</button>`);
};
V3.longModal = pid => { const p=V3.P(pid); V3.modal('Stay review · '+hesc(p.name),'Day '+p.day+' · Section '+p.sec,`<label class="field"><span class="lbl">Why is this patient still here, and what is the plan?</span><textarea class="input" id="v3ln" rows="4" placeholder="e.g. Clozapine titration needs 2 more weeks. Family meeting on Friday to plan discharge.">${hesc(v3().beds.longNote[pid]||'')}</textarea></label>`,`<button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="v3().beds.longNote['${pid}']=V3.val('v3ln');V3.log('${pid}','lead','note','Long-stay review: '+V3.val('v3ln'));closeModal();render();toast('Review note saved')">Save</button>`); };
V3.timelineOf = pid => { closeModal(); S.v3.ui.tlPid=pid; go('#/timeline/'+pid); };

/* ---------------- 2. Allocation ---------------- */
V3.recommend = (ward, suite) => {
  const list=V3.STAFF.psy.map(d=>{const lv=V3.onLeave(d.n), l=V3.load(d.n,'psy'); let sc=-l; const why=[]; if(lv){sc-=100;why.push('On leave');} if(/floor lead/i.test(d.tag||'')){sc-=4;} if(suite&&d.senior){sc+=6;why.push('Senior, suite patient');} if(WARD_PSY[ward]===d.n||(ward==='Male ward'&&d.n==='Dr. Aanya Sharma')){sc+=4;why.push('Covers this ward');} why.push(l+(l===1?' patient':' patients')); return {n:d.n,sc,why,lv};}).sort((a,b)=>b.sc-a.sc);
  const ps=V3.STAFF.psych.map(d=>({n:d.n,l:V3.load(d.n,'psych')})).sort((a,b)=>a.l-b.l);
  return {psy:list, psych:ps};
};
V3.pAlloc = () => {
  const s=v3(), a=s.alloc;
  const rohit=V3.P('rohit'), todo=[];
  if(!a.newDone) todo.push({kind:'pt',id:'rohit',name:rohit.name,sub:'Admitted 10:30 today · Suite 201 · VVIP',psy:V3.eff('psy','rohit'),psych:null,suite:true,ward:'Male ward',why:'Psychiatrist set by ward. Psychologist not added yet.'});
  s.beds.expected.filter(e=>!e.team).forEach(e=>todo.push({kind:'exp',id:e.id,name:e.name,sub:'Expected '+(V3.day(e.eta)===0?'today ':'tomorrow ')+V3.hm(e.eta)+' · '+e.ward,psy:null,psych:null,suite:false,ward:e.ward,why:e.dx+' · '+e.src}));
  const card=t=>{const rec=V3.recommend(t.ward,t.suite), best=rec.psy[0], bp=rec.psych[0]; return `<div class="v3al ${t.kind==='pt'?'urgent':''}" style="margin:0"><div class="v3al-h"><div class="row" style="gap:8px"><strong>${hesc(t.name)}</strong>${chip(t.kind==='pt'?'New admission':'Expected','c-blue')}${t.suite?'<span class="tagvip" style="font-size:11px;padding:3px 8px">VVIP</span>':''}</div></div><div class="small muted">${hesc(t.sub)}</div><div class="small" style="margin-top:4px">${hesc(t.why)}</div>
    <div class="v3rec"><div><span class="tiny muted">Suggested psychiatrist</span><b>${hesc(best.n)}</b><span class="tiny muted">${hesc(best.why.join(' · '))}</span></div><div><span class="tiny muted">Suggested psychologist</span><b>${hesc(bp.n)}</b><span class="tiny muted">${bp.l} ${bp.l===1?'patient':'patients'}, lightest list</span></div></div>
    <div class="row" style="gap:8px;margin-top:10px"><button class="btn sm pri" onclick="V3.allocQuick('${t.kind}','${t.id}')">Confirm suggested team</button><button class="btn sm" onclick="V3.allocModal('${t.kind}','${t.id}')">Choose someone else</button></div></div>`;};
  const staffRow=(d,kind)=>{const lv=V3.onLeave(d.n), l=V3.load(d.n,kind), own=V3.owned(d.n,kind).length, unc=kind==='psy'?V3.uncovered(d.n).length:0;
    return `<tr><td><div class="row" style="gap:10px;flex-wrap:nowrap">${V3.avatar(d.n,32,kind==='psy'?'c-blue':'c-violet')}<div><div style="font-weight:600">${hesc(d.n)}</div><div class="tiny muted">${hesc(d.tag||'Psychologist')}${d.note?' · '+hesc(d.note):''}</div></div></div></td>
    <td><div class="row" style="gap:8px;flex-wrap:nowrap">${V3.bar(l/9*100,l>=8?'warn':'')}<b>${l}</b></div>${l!==own?`<div class="tiny muted">${own} own, ${l-own>=0?'+':''}${l-own} cover</div>`:''}</td>
    <td>${lv?chip('On leave · '+hesc(lv.why),'c-amber'):chip('On duty','c-green')}${unc?`<div class="tiny" style="color:var(--amber);font-weight:600;margin-top:4px">${unc} patient${unc===1?'':'s'} without cover</div>`:''}</td>
    <td style="text-align:right">${lv?`<button class="btn sm ${unc?'pri':''}" onclick="V3.coverModal('${kind}','${hesc(d.n)}')">${unc?'Assign cover':'Cover plan'}</button><button class="btn sm" onclick="V3.leaveEnd('${kind}','${hesc(d.n)}')">Back at work</button>`:`<button class="btn sm" onclick="V3.leaveModal('${kind}','${hesc(d.n)}')">Mark on leave</button>`}</td></tr>`;};
  const tbl=(rows,kind,label)=>`<table class="t"><thead><tr><th>${label}</th><th style="width:22%">Patients now</th><th style="width:26%">Today</th><th></th></tr></thead><tbody>${rows.map(d=>staffRow(d,kind)).join('')}</tbody></table>`;
  const pts=allPts().map(p=>{const lvP=V3.eff('psy',p.id)!==a.psy[p.id];return `<tr><td><b>${hesc(p.name)}</b><div class="tiny muted">${hesc(wardOf(p.id))} · ${hesc(p.room)}</div></td><td>${hesc(V3.eff('psy',p.id))}${lvP?` <span class="tiny muted">covering for ${hesc(a.psy[p.id])}</span>`:''}</td><td>${hesc(V3.eff('psych',p.id)||'Not set')}</td><td style="text-align:right"><button class="btn sm" onclick="V3.allocModal('pt','${p.id}')">Reassign</button></td></tr>`;}).join('');
  return `<div class="v3kpis">${V3.kpi('To allocate',todo.length,'New and expected admissions',todo.length?'warn':'ok')}${V3.kpi('On leave today',V3.STAFF.psy.concat(V3.STAFF.psych).filter(d=>V3.onLeave(d.n)).length,'Clinicians away',V3.STAFF.psy.concat(V3.STAFF.psych).some(d=>V3.onLeave(d.n))?'warn':'ok')}${V3.kpi('Without cover',['Dr. Rohan Mehta','Dr. Kunal Sethi','Dr. Aanya Sharma','Dr. Nandini Rao'].reduce((n,x)=>n+V3.uncovered(x).length,0),'Patients with no covering doctor',['Dr. Rohan Mehta','Dr. Kunal Sethi','Dr. Aanya Sharma','Dr. Nandini Rao'].some(x=>V3.uncovered(x).length)?'crit':'ok')}${V3.kpi('Heaviest list',Math.max(...V3.STAFF.psy.map(d=>V3.load(d.n,'psy'))),V3.STAFF.psy.slice().sort((x,y)=>V3.load(y.n,'psy')-V3.load(x.n,'psy'))[0].n,'')}</div>
  <div class="v3cols v3one">
    <section class="card"><div class="hd"><div><h3>New admissions to allocate</h3><div class="small muted" style="margin-top:4px">Suggestions use the ward, seniority for suite patients and the lightest list. You can overrule them.</div></div></div><div class="pad v3todo">${todo.map(card).join('')||V3.empty('Everyone has a team','Expected admissions appear here when they are booked.')}</div></section>
    <section class="card"><div class="hd"><div><h3>Team and leave</h3><div class="small muted" style="margin-top:4px">When someone is away, their patients move to a named doctor</div></div></div><div class="scroll">${tbl(V3.STAFF.psy,'psy','Psychiatrist')}<div style="height:8px"></div>${tbl(V3.STAFF.psych,'psych','Psychologist')}</div></section>
  </div>
  <section class="card"><div class="hd"><div><h3>All patients and their team</h3><div class="small muted" style="margin-top:4px">${allPts().length} inpatients</div></div></div><div class="scroll"><table class="t"><thead><tr><th>Patient</th><th>Psychiatrist</th><th>Psychologist</th><th></th></tr></thead><tbody>${pts}</tbody></table></div></section>`;
};
V3.allocModal = (kind,id) => {
  let name,sub,cur={psy:'',psych:''},ward='Male ward',suite=false;
  if(kind==='pt'){const p=V3.P(id);name=p.name;sub=p.room+' · '+wardOf(id);cur={psy:v3().alloc.psy[id],psych:v3().alloc.psych[id]||''};ward=wardOf(id);suite=isVipRoom(p);}
  else if(kind==='exp'){const e=v3().beds.expected.find(x=>x.id===id);name=e.name;sub='Expected · '+e.ward;ward=e.ward;cur=e.team||{psy:'',psych:''};}
  else {const p=V3.P('rohit');name=p.name;sub='Suite 201 · Male ward';cur={psy:v3().alloc.psy.rohit,psych:''};suite=true;}
  if(kind==='rohit')kind='pt';
  const rec=V3.recommend(ward,suite);
  V3.modal('Treating team · '+hesc(name),hesc(sub),`<label class="field"><span class="lbl">Psychiatrist</span><select class="input" id="v3py">${rec.psy.map(r=>`<option value="${hesc(r.n)}" ${(cur.psy||rec.psy[0].n)===r.n?'selected':''}>${hesc(r.n)} · ${hesc(r.why.join(', '))}</option>`).join('')}</select></label>
    <label class="field"><span class="lbl">Psychologist</span><select class="input" id="v3ps"><option value="">Leave for the psychiatrist to add</option>${rec.psych.map(r=>`<option value="${hesc(r.n)}" ${(cur.psych||rec.psych[0].n)===r.n?'selected':''}>${hesc(r.n)} · ${r.l} ${r.l===1?'patient':'patients'}</option>`).join('')}</select></label>
    <div class="callout grey small">The psychiatrist sees the patient in the list straight away. Admission workup goes to the RMO. Family call and consent tasks are created.</div>`,
    `<button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="V3.allocDo('${kind}','${id}')">Confirm team</button>`);
};
V3.allocDo = (kind,id) => { const py=V3.val('v3py'), ps=V3.val('v3ps'); V3.allocSet(kind,id,py,ps); closeModal(); render(); toast('Team confirmed: '+py+(ps?' and '+ps:'')); };
V3.allocQuick = (kind,id) => { const w=kind==='pt'?'Male ward':(v3().beds.expected.find(x=>x.id===id)||{}).ward, rec=V3.recommend(w,kind==='pt'); V3.allocSet(kind,id,kind==='pt'?V3.eff('psy','rohit'):rec.psy[0].n,rec.psych[0].n); render(); toast('Team confirmed'); };
V3.allocSet = (kind,id,py,ps) => {
  const s=v3();
  if(kind==='exp'){ const e=s.beds.expected.find(x=>x.id===id); e.team={psy:py,psych:ps}; return; }
  s.alloc.psy[id]=py; s.alloc.psych[id]=ps||''; V3.log(id,'lead','note','Team set: '+py+(ps?' and '+ps:'')+' by the floor lead');
  if(id==='rohit'){ s.alloc.newDone=true; S.done.l0=true; if(ps)S.flPsy=ps; }
};
V3.leaveModal = (kind,name) => V3.modal('Mark '+hesc(name)+' on leave','Their patients will need a named covering '+(kind==='psy'?'doctor':'psychologist'),`<div class="grid2"><label class="field"><span class="lbl">From</span>${V3.sel('v3lf',[[0,'Today'],[1,'Tomorrow']],0)}</label><label class="field"><span class="lbl">For how long</span>${V3.sel('v3lt',[[0,'Today only'],[1,'2 days'],[2,'3 days'],[6,'1 week']],0)}</label></div><label class="field"><span class="lbl">Reason</span>${V3.sel('v3lw',['Off duty','Sick leave','Conference','Personal leave'],'Off duty')}</label>`,`<button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="V3.leaveDo('${kind}','${hesc(name)}')">Continue to cover plan</button>`);
V3.leaveDo = (kind,name) => { const f=+V3.val('v3lf'), t=f+(+V3.val('v3lt')); v3().alloc.leave[name]={from:f,to:t,cover:{},why:V3.val('v3lw')}; closeModal(); V3.coverModal(kind,name); };
V3.leaveEnd = (kind,name) => { delete v3().alloc.leave[name]; render(); toast(name+' is back. Patients return to them.'); };
V3.coverModal = (kind,name) => {
  const lv=v3().alloc.leave[name]; const mine=V3.owned(name,kind), pool=(kind==='psy'?V3.STAFF.psy:V3.STAFF.psych).filter(d=>d.n!==name&&!V3.onLeave(d.n));
  const sug={}; const loads={}; pool.forEach(d=>loads[d.n]=V3.load(d.n,kind));
  mine.forEach(p=>{ const cur=(lv.cover||{})[p.id]; if(cur){sug[p.id]=cur;return;} const pick=pool.slice().sort((a,b)=>loads[a.n]-loads[b.n])[0]; sug[p.id]=pick.n; loads[pick.n]++; });
  V3.modal('Cover plan · '+hesc(name),hesc(lv.why)+' · '+(lv.from===lv.to?'one day':(lv.to-lv.from+1)+' days')+' · '+mine.length+' patients',`<div class="flck">${mine.map(p=>`<div class="r">${av(p.ini,30,p.risk?'c-red':'c-blue')}<div class="grow"><strong>${hesc(p.name)}</strong><div class="tiny muted">${hesc(p.room)} · ${hesc(p.dx)}${p.risk?' · high risk':''}</div></div><select class="input" style="width:200px;min-height:34px" id="cv_${p.id}">${pool.map(d=>`<option ${sug[p.id]===d.n?'selected':''}>${hesc(d.n)}</option>`).join('')}</select></div>`).join('')||'<div class="r">No patients to cover.</div>'}</div><div class="callout blue small">Cover is balanced by current list size. Change any row. Patients return to ${hesc(name)} when the leave ends.</div>`,`<button class="btn" onclick="closeModal();render()">Later</button><button class="btn pri" onclick="V3.coverDo('${kind}','${hesc(name)}')">Save cover plan</button>`);
};
V3.coverDo = (kind,name) => { const lv=v3().alloc.leave[name]; lv.cover=lv.cover||{}; V3.owned(name,kind).forEach(p=>{ const v=V3.val('cv_'+p.id); if(v){ lv.cover[p.id]=v; V3.log(p.id,'lead','note',name+' is away. '+v+' is covering.'); } }); closeModal(); render(); toast('Cover saved. Each covering clinician is told.'); };

/* ---------------- 3. MHCA compliance ---------------- */
V3.MH = { rev:'Section review', board:'MHRB intimation', cap:'Capacity assessment', nr:'Nominated representative', ect:'ECT consent' };
V3.MH_LATE = ['kavya|nr'];
V3.MH_OVR = { 'sameer|cap':-1 };
V3.mhItems = () => {
  const s=v3(), out=[], D=v3().mhca.done||(v3().mhca.done={});
  const push=(p,type,dueOff,label,owner,def)=>{ const key=p.id+'|'+type, d=D[key]; let st; if(d) st='done'; else if(def==='done') st='done'; else st=dueOff<0?'late':dueOff===0?'today':dueOff<=7?'soon':'later';
    out.push({key,pid:p.id,type,label,dueOff,owner,status:st,done:d||null}); };
  allPts().forEach(p => {
    const w=wardOf(p.id), female=w==='Female ward', sec=String(p.sec), day=p.day||0, psy=V3.eff('psy',p.id);
    if(sec==='89') push(p,'rev',30-day,'Supported admission ends: discharge or move to Section 90',psy);
    else push(p,'rev',90-day,'Board permission period ends: review for discharge or extension',psy);
    if(sec==='89'){ const lim=female?3:7, off=lim-day; push(p,'board',off,'Report to the Mental Health Review Board within '+lim+' days'+(female?' (woman)':''),'Front desk',off<0&&!V3.MH_LATE.includes(p.id+'|board')?'done':''); }
    const iv=sec==='90'?15:7; let due; if(V3.MH_OVR[p.id+'|cap']!==undefined) due=V3.MH_OVR[p.id+'|cap']; else due=(day%iv===0)?0:(iv-(day%iv)); push(p,'cap',due,'Capacity assessment every '+iv+' days while the nominated representative consents',psy);
    const nrOff=-day; push(p,'nr',nrOff,'Nominated representative named, with consent on file','Front desk',nrOff<0&&!V3.MH_LATE.includes(p.id+'|nr')?'done':'');
  });
  [['kabir',2,'Written consent before the first ECT session on Thursday','done'],['meera',4,'Written consent and capacity check before ECT is started','']].forEach(([pid,off,label,def])=>{ const p=V3.P(pid); push(p,'ect',off,label,V3.eff('psy',pid),def); });
  return out;
};
V3.mhDate = off => off===0?'Today':off===1?'Tomorrow':off===-1?'Yesterday':V3.dateOf(off);
V3.mhRel = off => off===0?'due today':off<0?Math.abs(off)+' day'+(off===-1?'':'s')+' late':'in '+off+' day'+(off===1?'':'s');
V3.MHST = { late:['Overdue','c-red'], today:['Due today','c-amber'], soon:['Next 7 days','c-blue'], later:['Later','c-grey'], done:['Done','c-green'] };
V3.pMhca = () => {
  const u=v3().ui; u.mhT=u.mhT||'all'; u.mhV=u.mhV||'deadline'; u.mhO=u.mhO||'all';
  const all=V3.mhItems(), open=all.filter(i=>i.status!=='done');
  const cnt={late:open.filter(i=>i.status==='late').length,today:open.filter(i=>i.status==='today').length,soon:open.filter(i=>i.status==='soon').length};
  let list=all.filter(i=>(u.mhT==='all'||i.type===u.mhT)&&(u.mhO==='all'||i.owner===u.mhO));
  const owners=[...new Set(all.map(i=>i.owner))].sort();
  const kp=V3.kpi('Overdue',cnt.late,'Past the legal or policy date',cnt.late?'crit':'ok')+V3.kpi('Due today',cnt.today,'Finish before the end of the day',cnt.today?'warn':'ok')+V3.kpi('Next 7 days',cnt.soon,'Coming up','')+V3.kpi('On track',Math.round(all.filter(i=>i.status==='done').length/all.length*100)+'%',all.filter(i=>i.status==='done').length+' of '+all.length+' obligations done','ok');
  const row=i=>{const p=V3.P(i.pid),st=V3.MHST[i.status]; return `<div class="li v3mh" style="align-items:flex-start"><div class="v3mh-d ${i.status}"><b>${i.status==='done'?'✓':V3.mhDate(i.dueOff)}</b><span class="tiny">${i.status==='done'?'Done':V3.mhRel(i.dueOff)}</span></div><div class="grow"><div class="row" style="gap:8px;flex-wrap:wrap"><strong>${hesc(p.name)}</strong>${chip('Section '+p.sec,'c-violet')}<span class="tiny muted">${hesc(wardOf(p.id))}</span></div><div class="small"><b>${V3.MH[i.type]}</b> · ${hesc(i.label)}</div><div class="tiny muted">Owner: ${hesc(i.owner)}${i.done?' · done '+V3.stamp(i.done.t)+' by '+hesc(i.done.by):''}</div></div>${chip(st[0],st[1])}<div class="row" style="gap:6px">${i.status==='done'?`<button class="btn sm" onclick="V3.mhDone('${i.key}')">View</button>`:`<button class="btn sm" onclick="V3.mhNudge('${i.key}')">Nudge owner</button><button class="btn sm pri" onclick="V3.mhDone('${i.key}')">Mark done</button>`}</div></div>`;};
  const groups=[['late','Overdue'],['today','Due today'],['soon','Next 7 days'],['later','Later'],['done','Done']];
  const byDeadline=groups.map(([k,t])=>{const L=list.filter(i=>i.status===k).sort((a,b)=>a.dueOff-b.dueOff); if(k==='done'||k==='later')return L.length?`<details class="rdone"><summary>${t} <span class="muted">${L.length}</span></summary>${L.map(row).join('')}</details>`:''; return L.length?`<div class="tg"><span>${t}</span>${chip(String(L.length),V3.MHST[k][1])}</div>${L.map(row).join('')}`:'';}).join('')||V3.empty('Nothing matches these filters');
  const cell=(pid,type)=>{const i=all.find(x=>x.pid===pid&&x.type===type); if(!i)return '<td class="mxc"><span class="mxd na" title="Does not apply">–</span></td>'; return `<td class="mxc"><button class="mxd ${i.status}" onclick="V3.mhDone('${i.key}')" title="${hesc(V3.MH[type]+': '+(i.status==='done'?'done':V3.mhRel(i.dueOff)))}"><b>${i.status==='done'?'✓':V3.mhDate(i.dueOff).replace('Tomorrow','Tmrw').replace('Yesterday','Yest')}</b></button></td>`;};
  const matrix=`<div class="scroll"><table class="t mx"><thead><tr><th>Patient</th>${Object.keys(V3.MH).map(k=>`<th class="mxh">${V3.MH[k]}</th>`).join('')}</tr></thead><tbody>${allPts().map(p=>`<tr><td><b>${hesc(p.name)}</b><div class="tiny muted">Section ${p.sec} · ${hesc(wardOf(p.id).replace(' ward',''))} · day ${p.day||0}</div></td>${Object.keys(V3.MH).map(k=>cell(p.id,k)).join('')}</tr>`).join('')}</tbody></table></div>`;
  const rules=`<details class="card v3rules"><summary><span>${V3.i('scale',16)} Rules behind these dates</span><span class="tiny muted">Tulasi policy, based on MHCA 2017 sections 89 and 90</span></summary><div class="pad v3rules-b"><ul><li><b>Section 89 (supported admission):</b> up to 30 days. After that the patient is discharged, stays as an independent patient, or moves to Section 90.</li><li><b>Capacity:</b> reviewed every 7 days under Section 89, every 15 days under Section 90, while the nominated representative is consenting.</li><li><b>MHRB intimation:</b> within 3 days of admission for a woman or a minor, within 7 days for others.</li><li><b>Section 90 (beyond 30 days):</b> two psychiatrists examine within the last 7 days, and the Board must permit it. The first period is 90 days.</li><li><b>ECT:</b> informed consent and a capacity check on file before a course starts.</li></ul><div class="callout amber small">These intervals are set in Tulasi policy and can be changed by the floor lead. Have compliance confirm them against the Act and your State rules before go-live. Read the text: <a href="https://www.advocatekhoj.com/library/bareacts/mentalhealthcare/89.php" target="_blank" rel="noopener">Section 89</a> · <a href="https://nyaaya.org/?p=5173" target="_blank" rel="noopener">Plain-language summary</a></div></div></details>`;
  const types=[['all','All']].concat(Object.entries(V3.MH));
  return `<div class="v3kpis">${kp}</div>
  <section class="card"><div class="hd"><div class="row" style="gap:6px;flex-wrap:wrap">${types.map(([k,l])=>`<button class="tog ${u.mhT===k?'on':''}" onclick="S.v3.ui.mhT='${k}';render()">${l}</button>`).join('')}</div>
    <div class="row" style="gap:10px"><label class="row" style="gap:6px"><span class="small muted">Owner</span><select class="input" style="width:190px;min-height:34px" onchange="S.v3.ui.mhO=this.value;render()"><option value="all">Everyone</option>${owners.map(o=>`<option ${u.mhO===o?'selected':''}>${hesc(o)}</option>`).join('')}</select></label><div class="seg" style="min-width:230px"><button class="${u.mhV==='deadline'?'on':''}" onclick="S.v3.ui.mhV='deadline';render()">By deadline</button><button class="${u.mhV==='patient'?'on':''}" onclick="S.v3.ui.mhV='patient';render()">By patient</button></div></div></div>
    ${u.mhV==='deadline'?byDeadline:matrix}</section>${rules}`;
};
V3.mhNudge = key => { const i=V3.mhItems().find(x=>x.key===key); V3.log(i.pid,'lead','note','Floor lead reminded '+i.owner+': '+V3.MH[i.type]); toast('Reminder sent to '+i.owner); };
V3.mhDone = key => {
  const i=V3.mhItems().find(x=>x.key===key), p=V3.P(i.pid);
  if(i.done) return V3.modal(V3.MH[i.type]+' · '+hesc(p.name),'Done','<div class="callout blue small">Recorded '+V3.stamp(i.done.t)+' by '+hesc(i.done.by)+(i.done.note?'.<br><br>'+hesc(i.done.note):'.')+'</div>','<button class="btn pri" onclick="closeModal()">Close</button>');
  V3.modal('Record: '+V3.MH[i.type]+' · '+hesc(p.name),hesc(i.label),`<div class="grid2"><label class="field"><span class="lbl">Done by</span>${V3.sel('v3mb',[i.owner,'Dr. Nandini Rao','Front desk'],i.owner)}</label><label class="field"><span class="lbl">Done on</span><input class="input" value="Today, ${V3.clockStr()}" disabled></label></div><label class="field"><span class="lbl">Evidence or note (required)</span><textarea class="input" id="v3mn" rows="3" placeholder="e.g. Board intimation emailed, reference 2026/1187"></textarea><div id="v3mne" class="small" style="color:var(--red);display:none">Say how this was done</div></label>`,
    `<button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="V3.mhSave('${key}')">Mark done</button>`);
};
V3.mhSave = key => { const n=V3.val('v3mn').trim(); if(!n){$('v3mne').style.display='block';return;} const i=V3.mhItems().find(x=>x.key===key); v3().mhca.done[key]={t:V3.now(),by:V3.val('v3mb'),note:n}; V3.log(i.pid,'lead','note',V3.MH[i.type]+' recorded: '+n); closeModal(); render(); toast(V3.MH[i.type]+' marked done'); };

/* ---------------- 4. Approvals ---------------- */
V3.openApprovals = () => { const L=v3().apps.filter(a=>a.st==='open'); if(!S.done.l4) L.push({id:'ap6',kind:'Transfer',pid:'varun',st:'open'}); return L; };
V3.counters = () => v3().orders.filter(o=>!o.cs && (S.role==='lead' || (S.role==='psychiatrist' && V3.eff('psy',o.pid)===V3.who.psychiatrist)));
V3.pApprovals = () => {
  const s=v3(), u=s.ui; u.apK=u.apK||'all'; const canA=S.role==='lead';
  const kinds=['Home leave','LAMA','ECT','Early discharge','Transfer','Outing'];
  const open=V3.openApprovals(), decided=s.apps.filter(a=>a.st!=='open').concat(S.done.l4?[{id:'ap6',kind:'Transfer',pid:'varun',st:'approved',by:'Dr. Kunal Sethi',dec:{by:'Dr. Nandini Rao',t:V3.now(),note:'Approved from the task list'}}]:[]);
  const list=open.filter(a=>u.apK==='all'||a.kind===u.apK);
  const card=a=>{ if(a.id==='ap6') return `<article class="v3ap"><div class="v3ap-h"><div class="row" style="gap:10px">${av('VR',36)}<div><strong>Varun Rao</strong> ${chip('Transfer','c-violet')}<div class="tiny muted">Dr. Kunal Sethi asks to hand him to Dr. Rohan Mehta · workload</div></div></div></div><div class="small" style="margin:8px 0">Dr. Kunal Sethi has 2 overdue tasks and 5 due today. Varun is on day 4 of alcohol withdrawal.</div>${canA?`<div class="row" style="gap:8px"><button class="btn pri" onclick="flApprove('l4')">Review and decide</button></div>`:V3.lockNote()}</article>`;
    const p=V3.P(a.pid), openChk=a.chk.filter(c=>!c[1]).length;
    return `<article class="v3ap"><div class="v3ap-h"><div class="row" style="gap:10px">${av(p.ini,36,p.risk?'c-red':'c-blue')}<div><strong>${hesc(p.name)}</strong> ${chip(a.kind,a.kind==='LAMA'?'c-red':a.kind==='ECT'?'c-violet':'c-blue')}${p.risk?chip('High risk','c-red'):''}<div class="tiny muted">Asked by ${hesc(a.by)} · ${V3.stamp(a.t)} · ${hesc(wardOf(p.id))}</div></div></div></div>
      <div style="margin:8px 0"><div style="font-weight:600">${hesc(a.ask)}</div><div class="small muted">${hesc(a.why)}</div></div>
      <div class="v3chk">${a.chk.map(c=>`<span class="${c[1]?'ok':'open'}">${c[1]?'✓':'○'} ${hesc(c[0])}</span>`).join('')}</div>
      ${a.block?`<div class="callout amber small" style="margin-top:10px">${hesc(a.block)}</div>`:''}
      ${canA?`<div class="row" style="gap:8px;margin-top:12px;flex-wrap:wrap"><button class="btn pri" ${a.block?'disabled title="Not ready to approve"':''} onclick="V3.apDecide('${a.id}','approve')">${openChk?'Approve with conditions':'Approve'}</button><button class="btn" onclick="V3.apDecide('${a.id}','info')">Ask for more</button><button class="btn" onclick="V3.apDecide('${a.id}','decline')">Decline</button></div>`:V3.lockNote()}</article>`;};
  const ctr=V3.counters();
  return `<div class="v3kpis">${V3.kpi('Waiting for you',open.length,'Across all request types',open.length?'warn':'ok')}${kinds.map(k=>V3.kpi(k,open.filter(a=>a.kind===k).length,'',open.some(a=>a.kind===k)?'':'', `S.v3.ui.apK='${k}';render()`)).join('')}</div>
  ${canA?'':`<div class="callout blue small" style="display:flex;gap:10px;align-items:center">${V3.i('lock',16)}<span>You can see these requests. Only the floor lead approves home leave, LAMA, ECT, early discharge and transfers.</span></div>`}
  <section class="card"><div class="hd"><div class="row" style="gap:6px;flex-wrap:wrap">${['all'].concat(kinds).map(k=>`<button class="tog ${u.apK===k?'on':''}" onclick="S.v3.ui.apK='${k}';render()">${k==='all'?'All requests':k}</button>`).join('')}</div></div><div class="pad v3aplist">${list.map(card).join('')||V3.empty('Nothing waiting','New requests from doctors and the team land here.')}</div></section>
  ${ctr.length||S.role==='lead'?`<section class="card"><div class="hd"><div><h3>RMO orders to countersign</h3><div class="small muted" style="margin-top:4px">Stat, SOS and phone orders written out of hours. The treating consultant countersigns by next morning.</div></div>${ctr.length?chip(ctr.length+' waiting','c-amber'):chip('All signed','c-green')}</div>${V3.counterRows(ctr)}</section>`:''}
  ${decided.length?`<section class="card"><div class="hd"><h3>Decided today</h3></div>${decided.map(a=>`<div class="li"><div class="grow"><strong>${hesc(V3.pn(a.pid))}</strong> ${chip(a.kind,'c-grey')}<div class="tiny muted">${hesc((a.dec||{}).note||'')} · ${hesc((a.dec||{}).by||'')} ${a.dec?V3.hm(a.dec.t):''}</div></div>${chip(a.st==='approved'?'Approved':a.st==='declined'?'Declined':'More info asked',a.st==='approved'?'c-green':a.st==='declined'?'c-red':'c-amber')}</div>`).join('')}</section>`:''}`;
};
V3.lockNote = () => `<div class="tiny muted" style="display:flex;gap:6px;align-items:center;margin-top:10px">${V3.i('lock',14)} Waiting for the floor lead</div>`;
V3.counterRows = L => L.length ? L.map(o=>`<div class="li" style="align-items:flex-start"><div class="grow"><div class="row" style="gap:8px"><strong>${hesc(V3.pn(o.pid))}</strong>${chip(o.type,o.type==='STAT'?'c-red':o.type==='SOS'?'c-amber':'c-violet')}</div><div class="small">${hesc(o.text)}</div><div class="tiny muted">Written by ${hesc(o.by)} ${V3.stamp(o.t)}${o.via?' after speaking to '+hesc(o.via):''}${o.given?' · given '+V3.hm(o.given.t)+' by '+hesc(o.given.by):''}</div></div><button class="btn sm pri" onclick="V3.countersign('${o.id}')">Countersign</button></div>`).join('') : '<div class="pad small muted">Nothing to countersign.</div>';
V3.countersign = id => { const o=v3().orders.find(x=>x.id===id); if(!o||!['lead','psychiatrist'].includes(S.role)){toast('Only a consultant countersigns');return;} o.cs={by:V3.byMe(),t:V3.now()}; const p=v3().prn.orders.find(x=>x.src===id); if(p)p.cs='done'; V3.log(o.pid,S.role,'order','Countersigned '+o.type.toLowerCase()+' order: '+o.text); render(); toast('Countersigned. The RMO and nurse can see it.'); };
V3.apDecide = (id,how) => {
  const a=v3().apps.find(x=>x.id===id), p=V3.P(a.pid), openChk=a.chk.filter(c=>!c[1]);
  const T={approve:['Approve','Approved'],info:['Ask for more information','More info asked'],decline:['Decline','Declined']}[how];
  V3.modal(T[0]+' · '+hesc(a.kind)+' · '+hesc(p.name),'Asked by '+hesc(a.by),`${how==='approve'&&openChk.length?`<div class="callout amber small"><strong>${openChk.length} check${openChk.length===1?' is':'s are'} still open:</strong> ${openChk.map(c=>hesc(c[0])).join('; ')}. Your approval is recorded with these as conditions.</div>`:''}<label class="field"><span class="lbl">${how==='approve'?'Conditions or note (optional)':'Note for '+hesc(a.by)+' (required)'}</span><textarea class="input" id="v3an" rows="3" placeholder="${how==='decline'?'Say why, so the doctor can plan the next step':how==='info'?'What do you need to see?':'e.g. Escort must stay with him the whole time'}"></textarea><div id="v3ane" class="small" style="color:var(--red);display:none">Write a short note first</div></label>`,
    `<button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="V3.apDo('${id}','${how}')">${T[0]}</button>`);
};
V3.apDo = (id,how) => { const a=v3().apps.find(x=>x.id===id), n=V3.val('v3an').trim(); if(how!=='approve'&&!n){$('v3ane').style.display='block';return;}
  const st={approve:'approved',info:'info',decline:'declined'}[how]; if(how==='info'){a.st='open';a.ask+=' (more information asked)';toast('Sent back to '+a.by);closeModal();V3.log(a.pid,'lead','approval',a.kind+': more information asked. '+n);render();return;}
  a.st=st; a.dec={by:'Dr. Nandini Rao',t:V3.now(),note:n||'Approved'}; V3.log(a.pid,'lead','approval',a.kind+' '+st+' by the floor lead'+(n?': '+n:'')); closeModal(); render(); toast(a.kind+' '+st+'. '+a.by+' and the ward are told.'); };

/* ---------------- 5. Quality ---------------- */
V3.pQuality = () => {
  const q=v3().quality, ds=q.dsum, within=ds.hist.filter(h=>h<=ds.target).length, med=ds.hist.slice().sort((a,b)=>a-b)[Math.floor(ds.hist.length/2)];
  const clockLeft=g=>g.raised+g.clock*60-V3.now();
  const gOpen=q.griev.filter(g=>g.st==='Open'), spotOpen=q.spot.filter(x=>x.st==='Open');
  const kp=V3.kpi('Spot checks open',spotOpen.length,q.spot.length+' done this week',spotOpen.length?'warn':'ok')+V3.kpi('Summaries on time',Math.round(within/ds.hist.length*100)+'%','Signed within '+ds.target+' hours · median '+med+' h',within/ds.hist.length<.8?'warn':'ok')+V3.kpi('Unsigned summaries',ds.pending.length,ds.pending.length?'Oldest waiting '+V3.mins(V3.now()-ds.pending[0].ordered):'None waiting',ds.pending.length?'warn':'ok')+V3.kpi('Grievances open',gOpen.length,gOpen.some(g=>clockLeft(g)<120)?'One is close to its clock':'All inside their clock',gOpen.some(g=>clockLeft(g)<120)?'warn':'ok');
  const max=Math.max(36,...ds.hist), W=320,Hh=120,pad=26, bw=(W-pad)/ds.hist.length;
  const svg=`<svg viewBox="0 0 ${W} ${Hh+24}" role="img" aria-label="Hours to sign the last ${ds.hist.length} discharge summaries. Target ${ds.target} hours." style="width:100%;height:auto"><g font-size="10" fill="var(--muted)">${[0,12,24,36].map(v=>`<text x="0" y="${Hh-v/max*Hh+3}">${v}</text><line x1="${pad}" x2="${W}" y1="${Hh-v/max*Hh}" y2="${Hh-v/max*Hh}" stroke="var(--line-2)"/>`).join('')}</g><line x1="${pad}" x2="${W}" y1="${Hh-ds.target/max*Hh}" y2="${Hh-ds.target/max*Hh}" stroke="var(--amber)" stroke-width="1.5" stroke-dasharray="4 3"/>${ds.hist.map((h,i)=>`<rect x="${pad+i*bw+6}" y="${Hh-h/max*Hh}" width="${bw-12}" height="${h/max*Hh}" rx="3" fill="${h>ds.target?'#e0a43a':'#1e6cdb'}"/><text x="${pad+i*bw+bw/2}" y="${Hh-h/max*Hh-4}" font-size="10" text-anchor="middle" fill="var(--ink-2)">${h}</text><text x="${pad+i*bw+bw/2}" y="${Hh+14}" font-size="9" text-anchor="middle" fill="var(--muted)">−${ds.hist.length-i}</text>`).join('')}</svg>`;
  return `<div class="v3kpis">${kp}</div>
  <div class="v3cols"><section class="card"><div class="hd"><div><h3>Discharge summary turnaround</h3><div class="small muted" style="margin-top:4px">Hours from discharge order to signed summary. Dashed line is the ${ds.target}-hour target.</div></div></div><div class="pad">${svg}<div class="tiny muted" style="margin-top:4px">Last ${ds.hist.length} discharges, oldest on the left.</div></div>
    ${ds.pending.map(d=>`<div class="li" style="align-items:flex-start"><div class="grow"><strong>${hesc(V3.pn(d.pid))}</strong> ${chip('Unsigned · '+V3.mins(V3.now()-d.ordered),'c-amber')}<div class="small muted">Draft by ${hesc(d.draft)} · ${hesc(d.block)}</div></div><button class="btn sm pri" onclick="flSign()">Sign as covering doctor</button></div>`).join('')}</section>
  <section class="card"><div class="hd"><div><h3>Grievance clocks</h3><div class="small muted" style="margin-top:4px">First response is due inside the clock set for each one</div></div></div>${q.griev.map(g=>{const left=clockLeft(g),res=g.st==='Resolved';return `<div class="li" style="align-items:flex-start"><div class="grow"><div class="row" style="gap:8px"><strong>${hesc(V3.pn(g.pid))}</strong>${chip(g.who,'c-grey')}</div><div class="small">${hesc(g.text)}</div><div class="tiny muted">Owner ${hesc(g.owner)} · raised ${V3.stamp(g.raised)} · ${g.clock}-hour clock</div>${res?'':`<div class="row" style="gap:10px;margin-top:6px;flex-wrap:nowrap">${V3.bar(100-Math.max(0,left)/(g.clock*60)*100,left<120?'warn':'')}<span class="tiny" style="white-space:nowrap;font-weight:600;color:${left<120?'var(--amber)':'inherit'}">${left<=0?'Overdue':V3.mins(left)+' left'}</span></div>`}</div>${res?chip('Resolved','c-green'):`<button class="btn sm" onclick="go('#/patient/${g.pid}/griev')">Open</button>`}</div>`;}).join('')}</section></div>
  <section class="card"><div class="hd"><div><h3>Spot checks</h3><div class="small muted" style="margin-top:4px">Short notes on what you looked at, what you found, and who fixes it</div></div><button class="btn pri" onclick="V3.spotModal()">${V3.i('plus',14)} Log spot check</button></div>
    <div class="scroll"><table class="t"><thead><tr><th>When</th><th>Checked</th><th>Finding</th><th>Rating</th><th>Owner</th><th></th></tr></thead><tbody>${q.spot.map(x=>`<tr><td class="small">${V3.stamp(x.t)}</td><td><b>${hesc(x.type)}</b><div class="tiny muted">${hesc(x.who)}${x.pid?' · '+hesc(V3.pn(x.pid)):''}</div></td><td class="small" style="max-width:320px">${hesc(x.finding)}</td><td>${chip(x.rating,x.rating==='Good'?'c-green':'c-amber')}</td><td class="small">${hesc(x.owner)}${x.due?'<div class="tiny muted">Due '+hesc(x.due)+'</div>':''}</td><td>${x.st==='Open'?`<button class="btn sm" onclick="V3.spotClose('${x.id}')">Close</button>`:chip('Closed','c-grey')}</td></tr>`).join('')}</tbody></table></div></section>`;
};
V3.spotModal = () => V3.modal('Log a spot check','What you looked at and what you found',`<div class="grid2"><label class="field"><span class="lbl">What did you check</span>${V3.sel('v3st',['Daily note quality','Medicine chart signing','Consent forms','Handover note','Restraint or seclusion record','Family call log','Belongings check'],'Daily note quality')}</label><label class="field"><span class="lbl">Patient (optional)</span>${V3.sel('v3sp',[['','None']].concat(V3.ptOpts()),'')}</label></div><label class="field"><span class="lbl">Finding (required)</span><textarea class="input" id="v3sf" rows="3" placeholder="What you saw, in a sentence or two"></textarea><div id="v3sfe" class="small" style="color:var(--red);display:none">Write what you found</div></label><div class="grid3"><label class="field"><span class="lbl">Rating</span>${V3.sel('v3sr',['Good','Needs work','Unsafe'],'Good')}</label><label class="field"><span class="lbl">Who fixes it</span>${V3.sel('v3so',['None needed','Dr. Aanya Sharma','Dr. Rohan Mehta','Dr. Kunal Sethi','Priya Nair','Nursing head','Front desk'],'None needed')}</label><label class="field"><span class="lbl">Fix by</span>${V3.sel('v3sd',['Today','Tomorrow','This week'],'Tomorrow')}</label></div>`,`<button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="V3.spotSave()">Save</button>`);
V3.spotSave = () => { const f=V3.val('v3sf').trim(); if(!f){$('v3sfe').style.display='block';return;} const o=V3.val('v3so'), r=V3.val('v3sr'); v3().quality.spot.unshift({id:'sc'+Date.now(),t:V3.now(),type:V3.val('v3st'),who:'Floor lead check',pid:V3.val('v3sp'),finding:f,rating:r,owner:o==='None needed'?'':o,due:o==='None needed'?'':V3.val('v3sd'),st:(r==='Good'||o==='None needed')?'Closed':'Open'}); closeModal(); render(); toast(o==='None needed'?'Spot check saved':'Saved. '+o+' is asked to fix it.'); };
V3.spotClose = id => { const x=v3().quality.spot.find(y=>y.id===id); x.st='Closed'; render(); toast('Closed'); };

/* ---------------- 6. Family comms ---------------- */
V3.pFamily = () => {
  const s=v3(), F=s.family, u=s.ui; u.fmF=u.fmF||'attn'; const all=allPts();
  const need=p=>{const f=F[p.id];return f.call24.st==='late'||f.call24.st==='due'||(f.d34&&f.d34.st==='due')||f.meet.st==='late'||f.meet.st==='due';};
  const L=all.filter(p=>u.fmF==='all'||need(p));
  const n24=all.filter(p=>F[p.id].call24.st==='due'||F[p.id].call24.st==='late').length, late24=all.filter(p=>F[p.id].call24.st==='late').length, mt=all.filter(p=>['due','late'].includes(F[p.id].meet.st)).length, stale=all.filter(p=>F[p.id].last&&V3.now()-F[p.id].last>24*60).length;
  const kp=V3.kpi('24-hour calls pending',n24,late24?late24+' late':'All inside the window',late24?'crit':n24?'warn':'ok')+V3.kpi('Day 3 to 4 calls due',all.filter(p=>F[p.id].d34&&F[p.id].d34.st==='due').length,'Psychologist makes these','')+V3.kpi('Family meetings due',mt,'Today or late',mt?'warn':'ok')+V3.kpi('No update in 24 hours',stale,'Daily update not sent',stale?'warn':'ok');
  const c24=f=>f.call24.st==='done'?`${chip('Done','c-green')}<div class="tiny muted">${f.call24.min} min · ${V3.stamp(f.call24.t)}</div>`:f.call24.st==='late'?`${chip('Late','c-red')}<div class="tiny muted">Was due by ${V3.hm(f.call24.by)}</div>`:`${chip('Due','c-amber')}<div class="tiny muted">By ${V3.stamp(f.call24.by||V3.now()+1440)}</div>`;
  const mtg=f=>({held:chip('Held','c-green'),planned:chip('Planned','c-blue'),due:chip('Due','c-amber'),late:chip('Late','c-red')}[f.meet.st])+`<div class="tiny muted">${hesc(f.meet.when)}</div>`;
  const rows=L.map(p=>{const f=F[p.id];return `<tr><td><b>${hesc(p.name)}</b><div class="tiny muted">${hesc(wardOf(p.id))} · day ${p.day||0}</div></td><td>${hesc(f.cg)}<div class="tiny muted">${hesc(f.rel)} · <span class="v3sel">${hesc(f.ph)}</span></div></td><td>${c24(f)}${f.d34?`<div style="margin-top:4px">${chip('Day 3 to 4 call '+f.d34.st,'c-amber')}</div>`:''}</td><td>${mtg(f)}</td><td class="small">${f.last?V3.ago(f.last):'<span class="muted">Not yet</span>'}</td><td style="text-align:right;white-space:nowrap"><button class="btn sm" onclick="V3.famMeet('${p.id}')">${V3.i('users',14)} Meeting</button> <button class="btn sm pri" onclick="V3.famCall('${p.id}')">${V3.i('phone',14)} Call via HMS</button></td></tr>`;}).join('');
  return `<div class="v3kpis">${kp}</div><section class="card"><div class="hd"><div class="row" style="gap:6px"><button class="tog ${u.fmF==='attn'?'on':''}" onclick="S.v3.ui.fmF='attn';render()">Needs attention · ${all.filter(need).length}</button><button class="tog ${u.fmF==='all'?'on':''}" onclick="S.v3.ui.fmF='all';render()">All patients · ${all.length}</button></div><span class="small muted">Calls are made through the hospital phone system and logged on the patient timeline</span></div><div class="scroll"><table class="t"><thead><tr><th>Patient</th><th>Caregiver</th><th>First calls</th><th>Family meeting</th><th>Last update</th><th></th></tr></thead><tbody>${rows||`<tr><td colspan="6">${V3.empty('Every family is up to date')}</td></tr>`}</tbody></table></div></section>`;
};
V3.famCall = pid => { const p=V3.P(pid), f=v3().family[pid]; V3.modal('Call '+hesc(f.cg),hesc(p.name)+' · '+hesc(f.rel)+' · '+hesc(f.ph),`<div class="callout grey small">The call goes through the hospital phone system so it is recorded against the patient. After the call, note what was said.</div><div class="grid2"><label class="field"><span class="lbl">Call type</span>${V3.sel('v3ct',['24-hour call','Day 3 to 4 call','Update on progress','Other'],f.call24.st==='done'?'Update on progress':'24-hour call')}</label><label class="field"><span class="lbl">Length (minutes)</span><input class="input" id="v3cm" type="number" min="1" value="5"></label></div><label class="field"><span class="lbl">What was discussed (required)</span><textarea class="input" id="v3cn" rows="3" placeholder="e.g. Told her he slept well and joined group therapy. She will visit Saturday."></textarea><div id="v3cne" class="small" style="color:var(--red);display:none">Add a short note</div></label>`,`<button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="V3.famCallDo('${pid}')">Log call</button>`); };
V3.famCallDo = pid => { const n=V3.val('v3cn').trim(); if(!n){$('v3cne').style.display='block';return;} const f=v3().family[pid], ty=V3.val('v3ct'); if(ty==='24-hour call'){f.call24={st:'done',t:V3.now(),min:+V3.val('v3cm')||5};} if(ty==='Day 3 to 4 call')f.d34=null; f.last=V3.now(); V3.log(pid,S.role==='rmo'?'rmo':'lead','family',ty+' with '+f.cg+' ('+f.rel+'), '+V3.val('v3cm')+' min: '+n); closeModal(); render(); toast('Call logged for '+V3.pn(pid)); };
V3.famMeet = pid => { const p=V3.P(pid), f=v3().family[pid]; V3.modal('Family meeting · '+hesc(p.name),hesc(f.cg)+' ('+hesc(f.rel)+')',`<div class="grid2"><label class="field"><span class="lbl">When</span>${V3.sel('v3mw',['Today, 5 pm','Tomorrow, 11 am','Tomorrow, 4 pm','In 2 days, 11 am'],'Tomorrow, 11 am')}</label><label class="field"><span class="lbl">Who joins</span>${V3.sel('v3mj',['Psychiatrist and psychologist','Psychiatrist only','Psychologist only','Floor lead, psychiatrist and psychologist'],'Psychiatrist and psychologist')}</label></div><div class="callout grey small">The caregiver gets a message with the time. Both clinicians see it on their schedule.</div>`,`<button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="V3.famMeetDo('${pid}')">Schedule</button>`); };
V3.famMeetDo = pid => { const f=v3().family[pid]; f.meet={when:V3.val('v3mw'),st:'planned'}; V3.log(pid,'lead','family','Family meeting set for '+f.meet.when+' with '+f.cg); closeModal(); render(); toast('Meeting set for '+f.meet.when); };

/* ======================================================================
   NURSE · Ward care
   ====================================================================== */
V3.SH = [8,10,12,14,16,18,20,21];                       // hour of each column in NSLOTS
V3.NURSES = ['Sister Rekha','Sister Anita','Sister Maya','Brother Joseph','Brother Anil'];
V3.scope = () => S.role==='nurse' ? WARDS['Male ward'] : allPts();
V3.second = () => V3.NURSES.filter(n => n !== V3.who.nurse);

/* ---------- 1. Doctor instructions become slots on the grid ---------- */
V3.KINDS = {
  neu:['Neuro check','◐','c-violet'], vit:['Vitals','♡','c-green'], sug:['Sugar','◉','c-amber'], ciwa:['CIWA score','☷','c-amber'],
  obs:['Observation','◎','c-blue'], wt:['Weight','⚖','c-grey'], io:['Fluid chart','≈','c-blue'], oth:['Check','✓','c-grey']
};
V3.parseInstr = text => {
  const out = [];
  String(text).split(/;|\. (?=[A-Z])/).forEach(frag => {
    const f = frag.trim(); if(!f) return;
    let kind = null, label = '';
    const rules = [[/neuro/i,'neu','Neuro check'],[/ciwa/i,'ciwa','CIWA score'],[/\b(vitals?|bp\b|pulse|temperature)/i,'vit','Vitals'],[/(sugar|cbg|glucose)/i,'sug','Sugar'],[/weigh(t|ing)/i,'wt','Weight'],[/(intake|output|fluid chart|i\/o)/i,'io','Fluid chart'],[/(observation|obs\b)/i,'obs','Observation']];
    for(const [re,k,l] of rules){ if(re.test(f)){ kind=k; label=l; break; } }
    const lab = /(serum|level|bloods?|ecg|ecg|test|culture|x-?ray|scan|mri|ct\b)/i.test(f) && !kind;
    let every = null;
    let m = f.match(/every\s+(\d+(?:\.\d+)?)\s*(hours?|hrs?|h|minutes?|mins?)/i) || f.match(/(\d+)[-\s]?(hourly|hrly)/i);
    if(m) every = /min/i.test(m[2]) ? (+m[1])/60 : (/hourly|hrly/i.test(m[2]) ? +m[1] : +m[1]);
    else if(/\bhourly\b/i.test(f)) every = 1;
    else if(/(twice|two times)\s+(a\s+)?(day|daily)/i.test(f)) every = 12;
    else if(/(once|daily)/i.test(f)) every = 24;
    if(kind && every) out.push({kind,label,every,text:f});
    else if(lab || /tomorrow/i.test(f)) out.push({kind:'later',label:f.replace(/^\W+/,''),every:null,text:f,when:(f.match(/tomorrow[^,.;]*/i)||[''])[0] || 'Later'});
  });
  return out;
};
V3.syncInstr = () => {
  const s = v3(); (S.nInstr||[]).forEach(row => {
    const id = row[6]; if(!id || s.sched[id]) return;
    const p = allPts().find(x => x.name === row[0]); if(!p){ s.sched[id] = {n:0}; return; }
    const tasks = V3.parseInstr(row[2]); let n = 0; const added = [];
    tasks.forEach(t => {
      if(t.kind==='later'){ s.future.push({id:'f'+(++s.tlN),pid:p.id,label:t.label.charAt(0).toUpperCase()+t.label.slice(1),when:t.when||'Later',src:id}); added.push(t.label); return; }
      const startSi = 3, step = Math.max(t.every,2);
      let si = startSi, lastH = V3.SH[startSi] - step;
      for(let i=startSi;i<V3.SH.length;i++){
        const h = V3.SH[i];
        if(t.every >= 2 && h - lastH < step - 0.01) continue;
        s.grid.push({id:'g'+(++s.tlN),pid:p.id,slot:NSLOTS[i],kind:t.kind,label:t.label+(t.every<2?' (every '+(t.every*60)+' min)':''),bundle:t.every<2?Math.round(120/ (t.every*60)):0,src:id,st:''});
        n++; lastH = h;
      }
    });
    s.sched[id] = {n, txt:row[2]};
    if(n) V3.log(p.id,'system','order','Doctor instruction put on the shift grid: '+n+' slot'+(n===1?'':'s')+' · '+row[2],{by:'Shift grid'});
  });
  NSTATIC.forEach(id => { if(!s.sched[id]) s.sched[id] = {n:0}; });
};
V3.gridLate = (g, si) => !g.st && (si < NOWI || V3.now() > V3.SH[si]*60 + 60);
V3.gridCell = (pid, slot, si) => {
  const L = v3().grid.filter(g => g.pid===pid && g.slot===slot); if(!L.length) return '';
  return L.map(g => { const K = V3.KINDS[g.kind]||V3.KINDS.oth, late = V3.gridLate(g,si), now = si===NOWI && !g.st && !late;
    return `<button class="ntask tgrid ${g.kind==='stat'?'tstat':''} ${g.st==='done'?'done':''} ${g.st==='missed'?'missed':''} ${late?'late':''} ${now?'dueNow':''}" onclick="V3.gridOpen('${g.id}')" title="${hesc(g.label)} · from the doctor's instruction${g.st==='done'?' · done by '+hesc(g.by):g.st==='missed'?' · missed: '+hesc(g.reason||'')+' · recorded by '+hesc(g.by||''):''}"><span class="ni">${g.st==='done'?'✓':g.st==='missed'?'×':late?'!':K[1]}</span><span>${hesc(g.label.replace(/ \(every.*/,''))}${g.bundle?` ×${g.bundle}`:''}</span></button>`; }).join('');
};
V3.gridCounts = list => { const ids = new Set(list.map(p=>p.id)); let due=0, late=0, done=0;
  v3().grid.filter(g => ids.has(g.pid)).forEach(g => { const si = NSLOTS.indexOf(g.slot); if(g.st) done++; else if(V3.gridLate(g,si)) late++; else if(si===NOWI) due++; });
  return {due,late,done}; };
V3.attX = p => v3().grid.some(g => g.pid===p.id && V3.gridLate(g, NSLOTS.indexOf(g.slot))) || V3.prnDue().some(l => l.pid===p.id) || v3().moves.some(m => m.pid===p.id && m.st==='out' && V3.now() > m.due);

V3.gridOpen = id => {
  const g = v3().grid.find(x=>x.id===id), p = V3.P(g.pid), K = V3.KINDS[g.kind]||V3.KINDS.oth;
  const src = (S.nInstr||[]).find(r=>r[6]===g.src);
  const head = `<div class="callout blue small">From the doctor's instruction${src?': <strong>'+hesc(src[2])+'</strong>':''}. ${g.st==='done'?'Recorded by '+hesc(g.by)+' at '+V3.hm(g.at)+'.':'Nothing else to mark. Record the result here.'}</div>`;
  let body = head;
  if(g.kind==='neu') body += `<div class="grid2"><label class="field"><span class="lbl">Glasgow Coma Score (3 to 15)</span>${V3.sel('gx_gcs',[15,14,13,12,11,10,9,8],15)}</label><label class="field"><span class="lbl">Pupils</span>${V3.sel('gx_pup',['Equal and reactive','Unequal','Sluggish','Fixed'],'Equal and reactive')}</label><label class="field"><span class="lbl">Limbs</span>${V3.sel('gx_limb',['Moves all four','Weakness on one side','Not moving a limb'],'Moves all four')}</label><label class="field"><span class="lbl">Vomiting or severe headache</span>${V3.sel('gx_vom',['No','Yes'],'No')}</label></div>`;
  else if(g.kind==='sug') body += `<label class="field"><span class="lbl">Blood sugar (mg/dL)</span><input class="input" id="gx_val" type="number" inputmode="numeric" placeholder="e.g. 142"><span class="tiny muted">Safe range 70 to 180. Outside this the RMO is told.</span></label>`;
  else if(g.kind==='ciwa') body += `<label class="field"><span class="lbl">CIWA-Ar score (0 to 67)</span><input class="input" id="gx_val" type="number" min="0" max="67" inputmode="numeric"><span class="tiny muted">10 or more: SOS lorazepam may be needed and the RMO is told. 15 or more is critical.</span></label>`;
  else if(g.kind==='wt') body += `<label class="field"><span class="lbl">Weight (kg)</span><input class="input" id="gx_val" type="number" step="0.1" inputmode="decimal"></label>`;
  else if(g.kind==='vit') body += `<div class="callout grey small">Vitals use the full form with safe ranges.</div>`;
  else body += `<label class="field"><span class="lbl">Result or note</span><textarea class="input" id="gx_note" rows="2"></textarea></label>`;
  V3.modal(hesc(g.label)+' · '+hesc(p.name), hesc(g.slot)+' slot · '+hesc(p.room), body,
    g.st==='done' ? `<button class="btn pri" onclick="closeModal()">Close</button>` : (g.kind==='vit' ? `<button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="closeModal();V3.vitModal('${p.id}','${g.id}')">Open vitals form</button>` : `<button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="V3.gridSave('${g.id}')">Save and sign</button>`));
};
V3.gridSave = id => {
  const g = v3().grid.find(x=>x.id===id), p = V3.P(g.pid); let summary = g.label, sev = null, why = '';
  if(g.kind==='neu'){ const gcs=+V3.val('gx_gcs'), pu=V3.val('gx_pup'), lb=V3.val('gx_limb'), vm=V3.val('gx_vom'); summary = `GCS ${gcs}, pupils ${pu.toLowerCase()}, ${lb.toLowerCase()}${vm==='Yes'?', vomiting or severe headache':''}`;
    if(gcs<=13||/Unequal|Fixed/.test(pu)||lb!=='Moves all four'){ sev='critical'; why='Neuro check worse: '+summary; } else if(gcs===14||vm==='Yes'||pu==='Sluggish'){ sev='urgent'; why='Neuro check changed: '+summary; } }
  else if(['sug','ciwa','wt'].includes(g.kind)){ const v=parseFloat(V3.val('gx_val')); if(isNaN(v)){ toast('Enter the value first'); return; } g.val=v;
    if(g.kind==='sug'){ summary='Sugar '+v+' mg/dL'; if(v<54||v>300){sev='critical';why='Blood sugar '+v+' mg/dL';} else if(v<70||v>180){sev='urgent';why='Blood sugar '+v+' mg/dL, outside 70 to 180';} }
    if(g.kind==='ciwa'){ summary='CIWA-Ar '+v; if(v>=15){sev='critical';why='CIWA-Ar '+v;} else if(v>=10){sev='urgent';why='CIWA-Ar '+v+', SOS lorazepam may be needed';} }
    if(g.kind==='wt') summary='Weight '+v+' kg'; }
  else { const n=V3.val('gx_note'); summary = g.label+(n?': '+n:''); }
  g.st='done'; g.by=V3.who.nurse; g.at=V3.now(); g.res=summary;
  V3.log(g.pid,'nurse','vital',summary+' · '+g.slot+' slot',{by:g.by});
  closeModal();
  if(sev) V3.alert({pid:g.pid,sev,title:why,detail:'Found at the '+g.slot+' check. Raised automatically.',src:'Shift grid',by:V3.who.nurse});
  render(); toast(sev?'Saved. The RMO has been alerted.':'Saved: '+summary);
};

/* ---------- 2. Vitals with actual values and safe ranges ---------- */
V3.VR = { sbp:{l:'Systolic BP',u:'mmHg',r:[90,140,80,180],step:1}, dbp:{l:'Diastolic BP',u:'mmHg',r:[60,90,50,110],step:1}, hr:{l:'Pulse',u:'per min',r:[55,100,45,130],step:1}, rr:{l:'Breathing',u:'per min',r:[12,20,8,28],step:1}, temp:{l:'Temperature',u:'°F',r:[97,99.5,95,101],step:0.1}, spo2:{l:'SpO₂',u:'%',r:[94,100,90,101],step:1} };
V3.rangeFor = (pid,k) => ((v3().vit.ranges[pid]||{})[k]) || V3.VR[k].r;
V3.vstat = (pid,k,val) => { if(val===''||val==null||isNaN(val)) return ''; const r=V3.rangeFor(pid,k); return (val<r[2]||val>r[3])?'crit':(val<r[0]||val>r[1])?'warn':'ok'; };
V3.vitOut = (pid,v) => Object.keys(V3.VR).filter(k => ['warn','crit'].includes(V3.vstat(pid,k,v[k])));
V3.vitText = v => `BP ${v.sbp}/${v.dbp}, pulse ${v.hr}, breathing ${v.rr}, ${v.temp} °F, SpO₂ ${v.spo2}%`;
V3.vitCells = (pid,v) => Object.keys(V3.VR).filter(k=>k!=='dbp').map(k => { const st = k==='sbp' ? (['crit','warn'].find(x=>[V3.vstat(pid,'sbp',v.sbp),V3.vstat(pid,'dbp',v.dbp)].includes(x))||'ok') : V3.vstat(pid,k,v[k]); return `<div class="vc ${st}"><span class="tiny muted">${k==='sbp'?'BP':V3.VR[k].l}</span><b>${k==='sbp'?v.sbp+'/'+v.dbp:v[k]}</b><span class="tiny muted">${k==='sbp'?'mmHg':V3.VR[k].u}</span></div>`; }).join('');
V3.pVitals = () => {
  const s = v3(), L = V3.scope(), rows = L.map(p => ({p, v:s.vit.last[p.id]})).filter(x=>x.v);
  const out = rows.filter(x => V3.vitOut(x.p.id,x.v).length), stale = rows.filter(x => V3.now() - x.v.t > 6*60);
  rows.sort((a,b) => V3.vitOut(b.p.id,b.v).length - V3.vitOut(a.p.id,a.v).length || a.v.t - b.v.t);
  const kp = V3.kpi('Out of range now',out.length,out.length?out.map(x=>x.p.name.split(' ')[0]).join(', '):'Everyone inside their safe range',out.length?'crit':'ok') + V3.kpi('Not checked for 6 hours',stale.length,stale.length?stale.map(x=>x.p.name.split(' ')[0]).slice(0,3).join(', '):'All checked today',stale.length?'warn':'ok') + V3.kpi('Recorded today',rows.filter(x=>V3.day(x.v.t)===0).length,'of '+rows.length+' patients','');
  const range = `<details class="card v3rules"><summary><span>${V3.i('pulse',16)} Safe ranges</span><span class="tiny muted">Outside the range, the RMO is alerted</span></summary><div class="pad"><div class="scroll"><table class="t"><thead><tr><th>Reading</th><th>Safe range</th><th>Critical below or above</th></tr></thead><tbody>${Object.keys(V3.VR).map(k=>`<tr><td>${V3.VR[k].l}</td><td>${V3.VR[k].r[0]} to ${V3.VR[k].r[1]} ${V3.VR[k].u}</td><td>below ${V3.VR[k].r[2]} or above ${V3.VR[k].r[3]}</td></tr>`).join('')}</tbody></table></div><div class="small muted" style="margin-top:8px">The psychiatrist can set a different range for a patient (for example, a low normal BP on clozapine). Those patients show a <em>Custom range</em> tag.</div></div></details>`;
  const cards = rows.map(({p,v}) => { const o=V3.vitOut(p.id,v), custom=!!s.vit.ranges[p.id];
    return `<article class="v3vcard ${o.length?'out':''}"><div class="row" style="justify-content:space-between;gap:8px;flex-wrap:nowrap"><div class="row" style="gap:10px;flex-wrap:nowrap">${av(p.ini,32,p.risk?'c-red':'c-blue')}<div><strong>${hesc(p.name)}</strong><div class="tiny muted">${hesc(p.room.replace('Room ','R-'))}${custom?' · Custom range':''}</div></div></div>${o.length?chip(o.length+' out of range','c-red'):chip('In range','c-green')}</div><div class="vgrid">${V3.vitCells(p.id,v)}</div><div class="row" style="justify-content:space-between"><span class="tiny muted">${V3.ago(v.t)} · ${hesc(v.by)}</span><button class="btn sm ${o.length?'pri':''}" onclick="V3.vitModal('${p.id}')">Record vitals</button></div></article>`; }).join('');
  return `<div class="v3kpis">${kp}</div><div class="v3vgrid">${cards}</div>${range}`;
};
V3.vitModal = (pid, gid) => {
  const p = V3.P(pid), l = v3().vit.last[pid]||{};
  const f = k => `<label class="field v3vf"><span class="lbl">${V3.VR[k].l} <span class="muted">(${V3.VR[k].u})</span></span><input class="input" id="vt_${k}" type="number" step="${V3.VR[k].step}" inputmode="decimal" oninput="V3.vitLive('${pid}')" placeholder="${l[k]!=null?l[k]:''}"><span class="tiny muted" id="vh_${k}">Safe ${V3.rangeFor(pid,k)[0]} to ${V3.rangeFor(pid,k)[1]}</span></label>`;
  V3.modal('Record vitals · '+hesc(p.name), hesc(p.room)+' · last '+(l.t?V3.ago(l.t):'not recorded'), `<div class="grid3">${f('sbp')}${f('dbp')}${f('hr')}${f('rr')}${f('temp')}${f('spo2')}</div><div id="vt_msg" class="callout grey small">Type the readings. Anything outside the safe range turns red and the RMO is alerted when you save.</div><label class="field"><span class="lbl">Note (optional)</span><input class="input" id="vt_note" placeholder="e.g. Sweating, tremor, restless"></label>`,
    `${gid?`<button class="btn" onclick="V3.vitMiss('${pid}','${gid}')">Record missed check</button>`:''}<button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="V3.vitSave('${pid}','${gid||''}')">Save vitals</button>`);
};
V3.vitMiss = (pid,gid) => { const p=V3.P(pid);V3.modal('Record missed vitals · '+hesc(p.name),'Keep the scheduled check visible and record why no reading was taken.',`<label class="field"><span class="lbl">Reason</span>${V3.sel('vt_miss',['Patient refused','Patient asleep','Non-cooperative','Patient unavailable','Equipment unavailable','Other'],'Patient refused')}</label><label class="field"><span class="lbl">Details (optional)</span><textarea id="vt_miss_note" class="input" rows="2" placeholder="Add context or follow-up"></textarea></label>`,`<button class="btn" onclick="closeModal();V3.vitModal('${pid}','${gid}')">Back to vitals</button><button class="btn pri" onclick="V3.vitMissSave('${pid}','${gid}')">Save missed check</button>`);};
V3.vitMissSave = (pid,gid) => { const g=v3().grid.find(x=>x.id===gid);if(!g)return;const reason=V3.val('vt_miss'),note=V3.val('vt_miss_note');g.st='missed';g.reason=reason+(note?': '+note:'');g.by=V3.who.nurse;g.at=V3.now();V3.log(pid,'nurse','vital','Missed vitals check · '+reason+(note?': '+note:'')+' · '+g.slot+' slot',{by:g.by});closeModal();render();toast('Missed check recorded for '+V3.pn(pid));};
V3.vitRead = () => { const v = {}; Object.keys(V3.VR).forEach(k => { const e=$('vt_'+k); v[k] = e && e.value!=='' ? parseFloat(e.value) : NaN; }); return v; };
V3.vitLive = pid => { const v = V3.vitRead(); let worst = 'ok', bad = [];
  Object.keys(V3.VR).forEach(k => { const st = V3.vstat(pid,k,v[k]); const inp = $('vt_'+k), h = $('vh_'+k); if(!inp) return; inp.classList.toggle('bad', st==='crit'); inp.classList.toggle('warnv', st==='warn'); h.style.color = st==='crit'?'var(--red)':st==='warn'?'var(--amber)':''; h.style.fontWeight = st&&st!=='ok'?600:''; if(st==='crit'){worst='crit';bad.push(V3.VR[k].l);} else if(st==='warn'){ if(worst!=='crit')worst='warn'; bad.push(V3.VR[k].l); } });
  const m = $('vt_msg'); if(m){ m.className = 'callout small ' + (worst==='crit'?'red':worst==='warn'?'amber':'grey'); m.textContent = bad.length ? (worst==='crit'?'Critical: ':'Outside the safe range: ')+bad.join(', ')+'. Saving will alert the RMO.' : 'All readings so far are in range.'; } };
V3.vitSave = (pid, gid) => {
  const v = V3.vitRead(), need = Object.keys(V3.VR).filter(k => isNaN(v[k]));
  if(need.length){ toast('Enter '+need.map(k=>V3.VR[k].l.toLowerCase()).join(', ')); return; }
  v.t = V3.now(); v.by = V3.byMe(); const s = v3(); s.vit.last[pid] = v; (s.vit.hist = s.vit.hist||{})[pid] = (s.vit.hist[pid]||[]).concat([v]);
  const out = V3.vitOut(pid,v), crit = out.some(k => V3.vstat(pid,k,v[k])==='crit'), note = V3.val('vt_note');
  V3.log(pid,'nurse','vital','Vitals: '+V3.vitText(v)+(note?'. '+note:''),{by:v.by});
  if(gid){ const g = s.grid.find(x=>x.id===gid); if(g){ g.st='done'; g.by=v.by; g.at=v.t; g.res=V3.vitText(v); } }
  closeModal();
  if(out.length) V3.alert({pid,sev:crit?'critical':'urgent',title:'Vitals out of range: '+out.map(k=>V3.VR[k].l.toLowerCase()+' '+(k==='sbp'?v.sbp+'/'+v.dbp:v[k])).join(', '),detail:V3.vitText(v)+(note?' · '+note:''),src:'Vitals',by:v.by});
  render(); toast(out.length?'Saved. The RMO has been alerted.':'Vitals saved for '+V3.pn(pid));
};

/* ---------- 3. SOS and PRN medicines ---------- */
V3.prnDue = () => v3().prn.log.filter(l => !l.effect);
V3.prnCount24 = oid => v3().prn.log.filter(l => l.oid===oid && V3.now()-l.t < 1440).length;
V3.prnLast = oid => v3().prn.log.filter(l => l.oid===oid).sort((a,b)=>b.t-a.t)[0];
V3.pPrn = () => {
  const s = v3(), L = V3.scope(), ids = new Set(L.map(p=>p.id)), due = V3.prnDue().filter(l=>ids.has(l.pid)), log = s.prn.log.filter(l=>ids.has(l.pid)).sort((a,b)=>b.t-a.t);
  const late = due.filter(l => V3.now() > l.due + 10);
  const ord = s.prn.orders.filter(o => ids.has(o.pid) && o.drug!=='Paracetamol').sort((a,b)=>V3.pn(a.pid).localeCompare(V3.pn(b.pid)));
  const kp = V3.kpi('Effect checks due',due.length,due.length?(late.length?late.length+' late':'Check 30 minutes after the dose'):'None waiting',late.length?'crit':due.length?'warn':'ok') + V3.kpi('Given today',log.filter(l=>V3.day(l.t)===0).length,'SOS and PRN doses','') + V3.kpi('Need two signatures',ord.filter(o=>o.ds).length,'Sedatives and controlled drugs','') + V3.kpi('Awaiting countersign',ord.filter(o=>o.cs==='pending').length,'Written by the RMO, usable now',ord.some(o=>o.cs==='pending')?'warn':'ok');
  const dueCards = due.map(l => { const left = l.due - V3.now(), p = V3.P(l.pid);
    return `<div class="li" style="align-items:flex-start"><div class="grow"><div class="row" style="gap:8px"><strong>${hesc(p.name)}</strong>${chip(left<=0?(left< -10?'Late by '+V3.mins(-left):'Check now'):'In '+V3.mins(left),left< -10?'c-red':left<=0?'c-amber':'c-blue')}</div><div class="small">${hesc(l.drug)} given ${V3.hm(l.t)} for ${hesc(l.reason.toLowerCase())}</div><div class="tiny muted">By ${hesc(l.by)}${l.co?' and '+hesc(l.co):''} · check due ${V3.hm(l.due)}</div></div><button class="btn sm ${left<=0?'pri':''}" onclick="V3.prnEffect('${l.id}')">Record effect</button></div>`; }).join('');
  const ordRows = ord.map(o => { const n = V3.prnCount24(o.id), last = V3.prnLast(o.id), gap = last ? last.t + o.gap*60 - V3.now() : 0, blocked = n >= o.max, wait = gap > 0;
    return `<tr><td><b>${hesc(V3.pn(o.pid))}</b><div class="tiny muted">${hesc(V3.P(o.pid).room.replace('Room ','R-'))}</div></td><td><b>${hesc(o.drug)} ${hesc(o.dose)}</b> <span class="tiny muted">${hesc(o.route)}</span><div class="tiny muted">${hesc(o.ind)}</div></td><td class="small">${n} of ${o.max} in 24 h<div class="tiny muted">${o.gap} h apart${wait?' · next at '+V3.hm(last.t+o.gap*60):''}</div></td><td>${o.ds?chip('2 signatures','c-violet'):''}${o.cs==='pending'?chip('Countersign due','c-amber'):''}${o.rmo?chip('RMO order','c-grey'):''}</td><td style="text-align:right"><button class="btn sm ${blocked||wait?'':'pri'}" onclick="V3.prnGive('${o.pid}','${o.id}')">${blocked?'Limit reached':wait?'Too soon':'Give'}</button></td></tr>`; }).join('');
  const logRows = log.slice(0,10).map(l => `<tr><td class="small" style="white-space:nowrap">${V3.stamp(l.t)}</td><td><b>${hesc(V3.pn(l.pid))}</b></td><td class="small">${hesc(l.drug)}</td><td class="small" style="max-width:240px">${hesc(l.reason)}</td><td class="small">${hesc(l.by)}${l.co?'<div class="tiny muted">and '+hesc(l.co)+'</div>':''}</td><td class="small">${l.effect?chip(l.effect.r,l.effect.r==='Settled'?'c-green':l.effect.r==='Partly settled'?'c-amber':'c-red')+'<div class="tiny muted">'+hesc(l.effect.sed)+' · '+V3.hm(l.effect.at)+'</div>':'<span class="tiny muted">Check due '+V3.hm(l.due)+'</span>'}</td></tr>`).join('');
  return `<div class="v3kpis">${kp}</div>
  ${due.length?`<section class="card"><div class="hd"><div><h3>Effect checks</h3><div class="small muted" style="margin-top:4px">Record the effect 30 minutes after every SOS dose. No effect alerts the RMO.</div></div></div>${dueCards}</section>`:''}
  <section class="card"><div class="hd"><div><h3>SOS and PRN orders</h3><div class="small muted" style="margin-top:4px">Reason, time, and who signed are recorded with every dose. The limits come from the order.</div></div></div><div class="scroll"><table class="t"><thead><tr><th>Patient</th><th>Order</th><th>Used</th><th></th><th></th></tr></thead><tbody>${ordRows}</tbody></table></div></section>
  <section class="card"><div class="hd"><h3>Given recently</h3></div><div class="scroll"><table class="t"><thead><tr><th>Time</th><th>Patient</th><th>Medicine</th><th>Reason</th><th>Given by</th><th>Effect</th></tr></thead><tbody>${logRows||'<tr><td colspan="6" class="muted">None yet</td></tr>'}</tbody></table></div></section>`;
};
V3.prnGive = (pid, oid) => {
  const s = v3(), p = V3.P(pid), orders = s.prn.orders.filter(o => o.pid===pid);
  if(!orders.length) return V3.modal('SOS dose · '+hesc(p.name),'No SOS order on file','<div class="callout amber small">There is no SOS or PRN order for this patient. Ask the RMO to write one. You cannot give an SOS medicine without an order.</div>','<button class="btn pri" onclick="closeModal()">Close</button>');
  const cur = orders.find(o=>o.id===oid) || orders[0];
  s.ui.prnO = cur.id;
  V3.modal('Give SOS dose · '+hesc(p.name), hesc(p.room)+(p.risk?' · High risk':''), `
    <label class="field"><span class="lbl">Order</span><select class="input" id="pg_o" onchange="S.v3.ui.prnO=this.value;V3.prnCheck()">${orders.map(o=>`<option value="${o.id}" ${o.id===cur.id?'selected':''}>${hesc(o.drug)} ${hesc(o.dose)} ${hesc(o.route)} · ${hesc(o.ind)}</option>`).join('')}</select></label>
    <div id="pg_chk"></div>
    <div class="field"><span class="lbl">Reason for giving it (required)</span><div class="row" style="gap:6px;flex-wrap:wrap">${['Agitation','Anxiety','Could not sleep','Pain','Fever','Nausea','Tremor or sweating'].map(r=>`<button type="button" class="tog" data-g="pgr" onclick="V3.pick(this,'pgr');$('pg_r').value=this.textContent">${r}</button>`).join('')}</div><textarea class="input" id="pg_r" rows="2" placeholder="What you saw that made you give it"></textarea><div id="pg_re" class="small" style="color:var(--red);display:none">Say why you are giving it</div></div>
    <div class="grid2"><label class="field"><span class="lbl">Time given</span><input class="input" value="${V3.clockStr()} (now)" disabled></label><label class="field"><span class="lbl">Effect check due</span><input class="input" value="${V3.hm(V3.now()+30)}" disabled></label></div>
    <div id="pg_ds"></div>`,
    `<button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" id="pg_go" onclick="V3.prnSave('${pid}')">Record dose</button>`);
  V3.prnCheck();
};
V3.prnCheck = () => {
  const s = v3(), o = s.prn.orders.find(x=>x.id===V3.val('pg_o')); if(!o) return; const n = V3.prnCount24(o.id), last = V3.prnLast(o.id), wait = last ? last.t + o.gap*60 - V3.now() : 0;
  let html = '', block = false;
  if(n >= o.max){ block = true; html += `<div class="callout red small"><strong>Daily limit reached:</strong> ${n} of ${o.max} doses in 24 hours. Call the RMO before giving more.</div>`; }
  else if(wait > 0){ block = true; html += `<div class="callout red small"><strong>Too soon:</strong> the last dose was ${V3.hm(last.t)}. This order needs ${o.gap} hours between doses. Earliest is ${V3.hm(last.t+o.gap*60)}.</div>`; }
  else html += `<div class="callout grey small">${n} of ${o.max} doses used in 24 hours${last?'. Last dose '+V3.hm(last.t):''}.</div>`;
  if(o.cs==='pending') html += `<div class="callout amber small">Written by ${hesc(o.by)} on the phone. Usable now. The consultant countersigns by tomorrow morning.</div>`;
  $('pg_chk').innerHTML = html;
  $('pg_ds').innerHTML = o.ds ? `<div class="v3ds"><div class="row" style="gap:8px">${V3.i('shield',16)}<strong>Second nurse signs for this drug</strong></div><div class="grid2"><label class="field"><span class="lbl">Second nurse</span>${V3.sel('pg_co',[['','Choose']].concat(V3.second()),'')}</label><label class="field"><span class="lbl">Checked together</span><label class="check" style="border:0;padding:6px 0"><input type="checkbox" id="pg_ck" style="accent-color:var(--blue)"><span class="small">Drug, dose, route and patient</span></label></label></div></div>` : '';
  $('pg_go').disabled = block;
};
V3.prnSave = pid => {
  const s = v3(), o = s.prn.orders.find(x=>x.id===V3.val('pg_o')), r = V3.val('pg_r').trim();
  if(!r){ $('pg_re').style.display='block'; return; }
  let co = '';
  if(o.ds){ co = V3.val('pg_co'); if(!co || !$('pg_ck').checked){ toast('A second nurse must be named and tick the check'); return; } }
  const l = {id:'l'+(++s.tlN),oid:o.id,pid,drug:o.drug+' '+o.dose+' '+o.route.toLowerCase(),t:V3.now(),reason:r,by:V3.who.nurse,co,due:V3.now()+30,effect:null};
  s.prn.log.unshift(l); V3.log(pid,'nurse','dose',`${l.drug} given for ${r.toLowerCase()}${co?'. '+co+' signed as second nurse':''}. Effect check due ${V3.hm(l.due)}.`,{by:V3.who.nurse});
  closeModal(); render(); toast('Dose recorded. Effect check at '+V3.hm(l.due)+'.');
};
V3.prnEffect = lid => {
  const l = v3().prn.log.find(x=>x.id===lid), p = V3.P(l.pid);
  V3.modal('Effect of SOS dose · '+hesc(p.name), hesc(l.drug)+' given '+V3.hm(l.t)+' for '+hesc(l.reason.toLowerCase()), `<div class="grid2"><label class="field"><span class="lbl">Effect</span>${V3.sel('pe_r',['Settled','Partly settled','No effect','Worse or side effect'],'Settled')}</label><label class="field"><span class="lbl">How awake</span>${V3.sel('pe_s',['Alert','Calm and awake','Drowsy','Sedated, rousable','Hard to wake'],'Calm and awake')}</label></div><label class="field"><span class="lbl">Note (optional)</span><input class="input" id="pe_n" placeholder="e.g. Sleeping, breathing easy"></label><div class="callout grey small">No effect, worse, or hard to wake alerts the RMO straight away.</div>`,
    `<button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="V3.prnEffectSave('${lid}')">Save</button>`);
};
V3.prnEffectSave = lid => {
  const l = v3().prn.log.find(x=>x.id===lid), r = V3.val('pe_r'), sd = V3.val('pe_s'), n = V3.val('pe_n');
  l.effect = {r, sed:sd, at:V3.now(), by:V3.who.nurse, note:n};
  V3.log(l.pid,'nurse','dose',`Effect of ${l.drug}: ${r.toLowerCase()}, ${sd.toLowerCase()}${n?'. '+n:''}`,{by:V3.who.nurse});
  closeModal(); const bad = /No effect|Worse/.test(r), hard = sd==='Hard to wake';
  if(bad||hard) V3.alert({pid:l.pid,sev:hard?'critical':'urgent',title:`${l.drug}: ${hard?'hard to wake':r.toLowerCase()} after 30 minutes`,detail:`Given ${V3.hm(l.t)} for ${l.reason.toLowerCase()}. ${sd}.${n?' '+n:''}`,src:'SOS or PRN',by:V3.who.nurse});
  render(); toast(bad||hard?'Saved. The RMO has been alerted.':'Effect recorded');
};

/* ---------- 4. Refused or held needs a reason; repeated refusal alerts the doctor ---------- */
V3.REF = ['Does not want tablets','Side effects (sedation, stiffness, dry mouth)','Says medicine is not needed','Suspicious about medicines','Nausea or vomiting','Spat out or hid in cheek'];
V3.HOLD = ['Drowsy or sedated','Low BP or pulse','Fasting for a test','Doctor asked to hold','Medicine not available'];
V3.medSet = (k, i, val, pid, slot, si) => {
  S.nm[k] = S.nm[k]||{};
  if(val==='done'){ S.nm[k][i]='done'; delete v3().reasons[k+'|'+i]; V3.log(pid,'nurse','dose',NMEDS[pid][slot][i]+' given · '+slot,{by:V3.who.nurse}); nMeds(pid,slot,si); return; }
  const drug = NMEDS[pid][slot][i], opts = val==='ref' ? V3.REF : V3.HOLD, p = V3.P(pid);
  V3.modal((val==='ref'?'Refused':'Held')+': '+hesc(drug), hesc(p.name)+' · '+hesc(slot)+' dose', `<div class="field"><span class="lbl">Reason (required)</span><div class="v3reasons">${opts.map(r=>`<button type="button" class="tog" data-g="mr" onclick="V3.pick(this,'mr');S.v3.ui.mr=this.textContent">${hesc(r)}</button>`).join('')}</div><div id="mr_e" class="small" style="color:var(--red);display:none">Choose a reason</div></div><label class="field"><span class="lbl">What the patient said or did (optional)</span><input class="input" id="mr_n" placeholder="Short note for the doctor"></label>${val==='ref'?`<div class="callout amber small">${V3.refCount(pid,drug)>=1?'<strong>This is the next refusal of this medicine in 24 hours.</strong> The RMO and the treating psychiatrist will be alerted.':'The treating psychiatrist is told. A second refusal in 24 hours alerts the RMO.'}</div>`:''}${p.risk?'<div class="callout blue small">High-risk patient: stay and check the next dose is taken.</div>':''}`,
    `<button class="btn" onclick="nMeds('${pid}','${slot}',${si})">Back</button><button class="btn pri" onclick="V3.medReason('${k}',${i},'${val}','${pid}','${slot}',${si})">Record ${val==='ref'?'refusal':'hold'}</button>`);
  v3().ui.mr = null;
};
V3.refCount = (pid, drug) => (v3().refusals[pid+'|'+drug]||0);
V3.medReason = (k, i, val, pid, slot, si) => {
  const r = v3().ui.mr; if(!r){ $('mr_e').style.display='block'; return; }
  const drug = NMEDS[pid][slot][i], note = V3.val('mr_n'), s = v3(), p = V3.P(pid);
  S.nm[k][i] = val; s.reasons[k+'|'+i] = {val, reason:r, note, by:V3.who.nurse, t:V3.now()};
  const key = pid+'|'+drug; let n = 0;
  if(val==='ref'){ n = (s.refusals[key]||0) + 1; s.refusals[key] = n; }
  V3.log(pid,'nurse','dose',`${drug} ${val==='ref'?'refused':'held'} at ${slot}. Reason: ${r.toLowerCase()}${note?'. '+note:''}`,{by:V3.who.nurse});
  if(S.nInstr && typeof medNotice==='function') medNotice(pid, `${drug} ${val==='ref'?'refused':'held'} at ${slot}: ${r.toLowerCase()}`, val==='ref'?'Refused':'Held', val==='ref'?'c-red':'c-amber');
  if(val==='ref' && n>=2) V3.alert({pid,sev:'urgent',title:`Repeated refusal: ${drug}, ${n===2?'2nd':n+'th'} in 24 hours`,detail:`${r}${note?'. '+note:''}`,src:'Refusal',by:V3.who.nurse});
  closeModal(); nMeds(pid,slot,si);
  toast(val==='ref'&&n>=2?'Recorded. The RMO and psychiatrist have been alerted.':'Recorded with reason');
};
V3.reasonLine = (k, i) => { const r = v3().reasons[k+'|'+i]; return r ? `<div class="tiny" style="color:${r.val==='ref'?'var(--red)':'var(--amber)'};font-weight:600;margin-top:2px">${r.val==='ref'?'Refused':'Held'}: ${hesc(r.reason)}${r.note?' · '+hesc(r.note):''}</div>` : ''; };

/* ---------- 5. Per-shift charts ---------- */
V3.pCharts = () => {
  const s = v3(), u = s.ui; u.chSh = u.chSh||'day'; const sh = u.chSh, L = V3.scope();
  const rows = L.map(p => ({p, c:(s.charts[p.id]||{})[sh]||{done:false}}));
  const done = rows.filter(r=>r.c.done).length, flags = rows.filter(r=>V3.chartFlags(r.c).length);
  const kp = V3.kpi('Charts filled',done+' of '+rows.length,sh==='night'?'Night shift, 8 pm to 8 am':'Day shift, 8 am to 8 pm in progress',done<rows.length&&sh==='night'?'warn':'ok') + V3.kpi('Worth a look at rounds',flags.length,flags.length?flags.map(r=>r.p.name.split(' ')[0]).slice(0,3).join(', '):'Nothing unusual',flags.length?'warn':'ok') + V3.kpi('Slept under 4 hours',rows.filter(r=>sh==='night'&&r.c.sleep!=null&&r.c.sleep<4).length,'Last night','') ;
  const tr = rows.map(({p,c}) => { const fl = V3.chartFlags(c);
    return `<tr><td><b>${hesc(p.name)}</b><div class="tiny muted">${hesc(p.room.replace('Room ','R-'))}${p.risk?' · High risk':''}</div></td>
    <td>${sh==='night'?(c.done?`<b>${c.sleep} h</b><div class="tiny muted">${hesc(c.sleepQ)}</div>`:'<span class="muted">–</span>'):'<span class="tiny muted">Not charted by day</span>'}</td>
    <td>${c.done?`<b>${c.oral} ml</b> oral<div class="tiny muted">Meals: ${hesc(c.meals)}</div>`:'<span class="muted">–</span>'}</td>
    <td>${c.done?`<b>${c.urine} ml</b> urine<div class="tiny muted">Stool: ${hesc(c.stool||'none')}</div>`:'<span class="muted">–</span>'}</td>
    <td>${c.done?hesc(c.diet):'<span class="muted">–</span>'}</td>
    <td class="small" style="min-width:210px">${c.done?`${hesc(c.mood)}${c.note?'<div class="tiny muted">'+hesc(c.note)+'</div>':''}`:'<span class="muted">Not filled</span>'}${fl.length?`<div class="row" style="gap:4px;margin-top:4px">${fl.map(f=>chip(f,'c-amber')).join('')}</div>`:''}</td>
    <td style="text-align:right"><button class="btn sm ${c.done?'':'pri'}" onclick="V3.chartModal('${p.id}','${sh}')">${c.done?'Edit':'Fill chart'}</button></td></tr>`; }).join('');
  return `<div class="v3kpis">${kp}</div><section class="card"><div class="hd"><div><h3>Shift charts</h3><div class="small muted" style="margin-top:4px">Sleep, food and fluids, and a short mood note. They go straight to the psychiatrist's round view and the patient timeline.</div></div><div class="seg" style="min-width:240px"><button class="${sh==='night'?'on':''}" onclick="S.v3.ui.chSh='night';render()">Last night</button><button class="${sh==='day'?'on':''}" onclick="S.v3.ui.chSh='day';render()">This day shift</button></div></div><div class="scroll"><table class="t"><thead><tr><th>Patient</th><th>Sleep</th><th>Intake</th><th>Output</th><th>Diet</th><th>Behaviour and mood</th><th></th></tr></thead><tbody>${tr}</tbody></table></div></section>`;
};
V3.chartFlags = c => { const f = []; if(!c||!c.done) return f; if(c.sleep!=null&&c.sleep<4) f.push('Slept '+c.sleep+' h'); if(['Quarter','None'].includes(c.meals)) f.push('Ate '+c.meals.toLowerCase()); if(c.oral!=null&&c.oral<900) f.push('Low fluids'); if(c.urine!=null&&c.urine<400) f.push('Low urine'); if(/agitat|aggress|restless|paced|low|withdrawn/i.test(c.mood||'')) f.push('Mood to review'); return f; };
V3.MOODS = ['Calm','Cooperative','Cheerful','Low','Withdrawn','Restless','Irritable','Agitated','Suspicious','Settled'];
V3.chartModal = (pid, sh) => {
  const p = V3.P(pid), c = ((v3().charts[pid]||{})[sh])||{}; const night = sh==='night';
  V3.modal((night?'Night':'Day')+' shift chart · '+hesc(p.name), hesc(p.room)+' · '+(night?'8 pm to 8 am':'8 am to 8 pm'), `${night?`<div class="grid2"><label class="field"><span class="lbl">Sleep (hours)</span><input class="input" id="ch_sl" type="number" step="0.5" min="0" max="12" value="${c.sleep!=null?c.sleep:''}"></label><label class="field"><span class="lbl">Sleep quality</span>${V3.sel('ch_sq',['Sound','Broken','Could not sleep'],c.sleepQ||'Sound')}</label></div>`:''}
    <div class="grid3"><label class="field"><span class="lbl">Oral fluids (ml)</span><input class="input" id="ch_or" type="number" step="50" value="${c.oral!=null?c.oral:''}"></label><label class="field"><span class="lbl">Urine (ml)</span><input class="input" id="ch_ur" type="number" step="50" value="${c.urine!=null?c.urine:''}"></label><label class="field"><span class="lbl">Stool</span>${V3.sel('ch_st',['None','Normal','Loose','Constipated'],c.stool||'None')}</label></div>
    <div class="grid2"><label class="field"><span class="lbl">Meals eaten</span>${V3.sel('ch_me',['All','Most','Half','Quarter','None'],c.meals||'All')}</label><label class="field"><span class="lbl">Diet followed</span>${V3.sel('ch_di',['Followed','Partly followed','Refused diet'],c.diet||'Followed')}</label></div>
    <div class="field"><span class="lbl">Behaviour and mood (one line, required)</span><div class="row" style="gap:6px;flex-wrap:wrap">${V3.MOODS.map(m=>`<button type="button" class="tog" data-g="chm" onclick="V3.pick(this,'chm');$('ch_mo').value=(($('ch_mo').value?$('ch_mo').value+', ':'')+this.textContent.toLowerCase()).replace(/^./,x=>x.toUpperCase())">${m}</button>`).join('')}</div><input class="input" id="ch_mo" maxlength="140" value="${hesc(c.mood||'')}" placeholder="e.g. Calm in the morning, restless after the visit"><div id="ch_e" class="small" style="color:var(--red);display:none">Add a short mood note</div></div>
    <label class="field"><span class="lbl">Anything the psychiatrist should know (optional)</span><input class="input" id="ch_no" maxlength="160" value="${hesc(c.note||'')}"></label>`,
    `<button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="V3.chartSave('${pid}','${sh}')">Save chart</button>`);
};
V3.chartSave = (pid, sh) => {
  const mo = V3.val('ch_mo').trim(); if(!mo){ $('ch_e').style.display='block'; return; }
  const night = sh==='night', c = {done:true, by:V3.byMe(), t:V3.now(), oral:+V3.val('ch_or')||0, urine:+V3.val('ch_ur')||0, stool:V3.val('ch_st')==='None'?'':V3.val('ch_st'), meals:V3.val('ch_me'), diet:V3.val('ch_di'), mood:mo, note:V3.val('ch_no').trim()};
  if(night){ c.sleep = parseFloat(V3.val('ch_sl')); if(isNaN(c.sleep)){ toast('Enter hours slept'); return; } c.sleepQ = V3.val('ch_sq'); }
  (v3().charts[pid] = v3().charts[pid]||{})[sh] = c;
  V3.log(pid,'nurse','chart',`${night?'Night':'Day'} chart: ${night?'slept '+c.sleep+' h ('+c.sleepQ.toLowerCase()+'), ':''}fluids ${c.oral} ml, meals ${c.meals.toLowerCase()}, urine ${c.urine} ml. ${mo}${c.note?'. '+c.note:''}`,{by:c.by});
  closeModal(); render(); toast('Chart saved for '+V3.pn(pid));
};
V3.chartSummary = pid => { const c = ((v3().charts[pid]||{}).night); if(!c||!c.done) return ''; return `Last night: slept ${c.sleep} h (${c.sleepQ.toLowerCase()}), ate ${c.meals.toLowerCase()}, fluids ${c.oral} ml, urine ${c.urine} ml. ${c.mood}`; };

/* ---------- 6. Patient movement ---------- */
V3.MOVE = ['ECT','Therapy','Test','Outing','Visitors','Other'];
V3.movesTick = () => {
  const s = v3(), now = V3.now();
  s.moves.forEach(m => { if(m.st!=='out') return;
    if(now > m.due && !m.lateAt){ m.lateAt = now; V3.log(m.pid,'system','move',`Not back at ${V3.hm(m.due)} from ${m.type.toLowerCase()}`,{by:'Movement board'}); }
    if(now >= m.due + 15 && !m.alertId){ const a = V3.alert({pid:m.pid,sev:'critical',title:'Not back on time: check for absconding',detail:`Left ${V3.hm(m.out)} for ${m.type.toLowerCase()} (${m.where}) with ${m.withWho}. Due back ${V3.hm(m.due)}.`,src:'Movement',by:'Movement board'}); m.alertId = a.id; }
  });
};
V3.pMoves = () => {
  const s = v3(), L = V3.scope(), ids = new Set(L.map(p=>p.id)), mv = s.moves.filter(m=>ids.has(m.pid)), out = mv.filter(m=>m.st==='out');
  const late = out.filter(m => V3.now() > m.due);
  const kp = V3.kpi('Out of the ward',out.length,out.length?out.map(m=>V3.pn(m.pid).split(' ')[0]).join(', '):'Everyone is on the ward',out.length?'warn':'ok') + V3.kpi('Late coming back',late.length,late.length?'Absconding alert at 15 minutes late':'None late',late.length?'crit':'ok') + V3.kpi('Back today',mv.filter(m=>m.st==='back').length,'','');
  const card = m => { const p = V3.P(m.pid), left = m.due - V3.now(), isOut = m.st==='out', over = isOut && left<0;
    return `<article class="v3mv ${over?'late':isOut?'out':''}"><div class="row" style="justify-content:space-between;gap:8px;flex-wrap:nowrap"><div class="row" style="gap:10px;flex-wrap:nowrap">${av(p.ini,34,p.risk?'c-red':'c-blue')}<div><strong>${hesc(p.name)}</strong> ${p.risk?chip('High risk','c-red'):''}<div class="tiny muted">${hesc(m.type)} · ${hesc(m.where)}</div></div></div>${isOut?chip(over?'Late '+V3.mins(-left):'Back in '+V3.mins(left),over?'c-red':left<=10?'c-amber':'c-blue'):chip('Back '+V3.hm(m.back),'c-green')}</div>
    <div class="v3mv-b"><div><span class="tiny muted">Left</span><b>${V3.hm(m.out)}</b></div><div><span class="tiny muted">Due back</span><b>${V3.hm(m.due)}</b></div><div><span class="tiny muted">With</span><b>${hesc(m.withWho)}</b></div></div>
    ${over&&m.alertId?`<div class="callout red small">Absconding alert sent to the RMO at ${V3.hm(m.due+15)}.</div>`:over?`<div class="callout amber small">Alert goes to the RMO at ${V3.hm(m.due+15)} if not back.</div>`:''}
    ${isOut?`<div class="row" style="gap:8px"><button class="btn sm pri" onclick="V3.moveBack('${m.id}')">Mark back on ward</button><button class="btn sm" onclick="V3.moveExtend('${m.id}')">More time</button></div>`:(m.type==='Visitors'?`<div class="tiny muted">Belongings re-check ${(s.adm[m.pid]||{}).recheck?'<b style="color:var(--amber)">due</b>':'done'}</div>`:'')}</article>`; };
  return `<div class="v3kpis">${kp}</div><section class="card"><div class="hd"><div><h3>Out of the ward</h3><div class="small muted" style="margin-top:4px">Every trip has a time to be back. Not back by 15 minutes after that raises an absconding alert on its own.</div></div><button class="btn pri" onclick="V3.moveOut()">${V3.i('plus',14)} Send patient out</button></div><div class="pad v3mvgrid">${out.map(card).join('')||V3.empty('Nobody is out','Use Send patient out for ECT, therapy, tests, outings and visitors.')}</div></section>
  ${mv.filter(m=>m.st==='back').length?`<section class="card"><div class="hd"><h3>Back today</h3></div><div class="pad v3mvgrid">${mv.filter(m=>m.st==='back').map(card).join('')}</div></section>`:''}`;
};
V3.moveOut = pid => {
  const L = V3.scope().filter(p => !v3().moves.some(m=>m.pid===p.id&&m.st==='out'));
  V3.modal('Send patient out','The patient leaves the ward and a return time starts', `<div class="grid2"><label class="field"><span class="lbl">Patient</span>${V3.sel('mo_p',V3.ptOpts(L),pid||'')}</label><label class="field"><span class="lbl">Reason</span>${V3.sel('mo_t',V3.MOVE,'Therapy')}</label></div><label class="field"><span class="lbl">Where</span><input class="input" id="mo_w" placeholder="e.g. ECT suite, group therapy room, visiting room"></label><div class="grid2"><label class="field"><span class="lbl">With whom</span>${V3.sel('mo_s',['Brother Joseph','Sister Anita','Priya Nair','Front desk','Security','Family'],'Brother Joseph')}</label><label class="field"><span class="lbl">Expected back in</span>${V3.sel('mo_m',[[30,'30 minutes'],[45,'45 minutes'],[60,'1 hour'],[90,'1 hour 30 minutes'],[180,'3 hours']],45)}</label></div><div class="callout grey small">If the patient is not back 15 minutes after this time, the RMO gets an absconding alert. For visitors, belongings are checked again when the patient returns.</div>`,
    `<button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="V3.moveOutSave()">Send out</button>`);
};
V3.moveOutSave = () => { const pid = V3.val('mo_p'), type = V3.val('mo_t'), where = V3.val('mo_w').trim() || ({ECT:'ECT suite',Therapy:'Therapy room',Test:'Test room',Visitors:'Visiting room'}[type]||'Off the ward'); const s = v3(); s.moves.unshift({id:'m'+(++s.tlN),pid,type,where,withWho:V3.val('mo_s'),out:V3.now(),due:V3.now()+(+V3.val('mo_m')),st:'out'}); V3.log(pid,'nurse','move',`Left the ward for ${type.toLowerCase()} (${where}) with ${V3.val('mo_s')}. Due back ${V3.hm(V3.now()+(+V3.val('mo_m')))}.`,{by:V3.who.nurse}); closeModal(); render(); toast(V3.pn(pid)+' is out. Return time set.'); };
V3.moveBack = id => { const m = v3().moves.find(x=>x.id===id); m.st='back'; m.back=V3.now(); V3.log(m.pid,'nurse','move',`Back on the ward from ${m.type.toLowerCase()}${m.lateAt?' (late)':''}`,{by:V3.who.nurse});
  if(m.alertId){ const a = v3().alerts.find(x=>x.id===m.alertId); if(a && !a.closed){ a.closed={by:V3.who.nurse,role:'nurse',t:V3.now()}; if(!a.ack) a.ack={by:V3.who.nurse,role:'nurse',t:V3.now()}; } }
  if(m.type==='Visitors'){ const a = (v3().adm[m.pid] = v3().adm[m.pid]||{risk:null,belong:null,recheck:null}); a.recheck = {reason:`Visitors ${V3.hm(m.out)} to ${V3.hm(m.back)}`, since:m.back}; toast(V3.pn(m.pid)+' is back. Check belongings now.'); } else toast(V3.pn(m.pid)+' is back on the ward');
  render(); };
V3.moveExtend = id => { const m = v3().moves.find(x=>x.id===id); V3.modal('More time · '+hesc(V3.pn(m.pid)),'Currently due back '+V3.hm(m.due), `<label class="field"><span class="lbl">Add</span>${V3.sel('mx_m',[[15,'15 minutes'],[30,'30 minutes'],[60,'1 hour']],15)}</label><label class="field"><span class="lbl">Reason (required)</span><input class="input" id="mx_r" placeholder="e.g. Session running over"><div id="mx_e" class="small" style="color:var(--red);display:none">Say why</div></label>`, `<button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="V3.moveExtendSave('${id}')">Extend</button>`); };
V3.moveExtendSave = id => { const r = V3.val('mx_r').trim(); if(!r){ $('mx_e').style.display='block'; return; } const m = v3().moves.find(x=>x.id===id); m.due += +V3.val('mx_m'); m.lateAt = null; V3.log(m.pid,'nurse','move',`Return time moved to ${V3.hm(m.due)}: ${r}`,{by:V3.who.nurse}); closeModal(); render(); toast('Now due back at '+V3.hm(m.due)); };

/* ---------- 7. Admission nursing ---------- */
V3.RISKQ = [['sui1','Suicide or self-harm','Talks about wanting to die or harm themself'],['sui2','Suicide or self-harm','Earlier attempt, or marks of self-harm seen'],['fall1','Falls','Unsteady, dizzy, or on sedating medicines'],['fall2','Falls','Over 65, or uses a stick or walker'],['abs1','Absconding','Says they want to leave, or tried to'],['abs2','Absconding','Brought against their will, or has absconded before'],['wd1','Withdrawal','Drinks or uses substances daily, last use within 48 hours']];
V3.riskLevel = ans => { const g = k => Object.keys(ans).filter(x=>x.startsWith(k)&&ans[x]).length; return {sui:g('sui'),fall:g('fall'),abs:g('abs'),wd:g('wd')}; };
V3.CONTRA = ['Sharp objects (blade, scissors, nail cutter)','Lighter or matches','Medicines not prescribed here','Alcohol or other substances','Cords, belts, laces or cables','Glass or metal containers'];
V3.admState = pid => { const a = v3().adm[pid]; const p = V3.P(pid); if(!a) return {risk:p.day<=1?'todo':'file',belong:p.day<=1?'todo':'file',recheck:false};
  return {risk:a.risk?'done':'todo', belong:a.belong?'done':'todo', recheck:!!a.recheck}; };
V3.pAdmission = () => {
  const L = V3.scope(), rows = L.map(p => ({p, st:V3.admState(p.id), a:v3().adm[p.id]||{}})).filter(r => r.st.risk!=='file' || r.st.recheck || r.p.day<=3);
  const todo = rows.filter(r => r.st.risk==='todo' || r.st.belong==='todo' || r.st.recheck);
  const kp = V3.kpi('Need nursing admission work',todo.length,todo.length?todo.map(r=>r.p.name.split(' ')[0]).join(', '):'All done','' + (todo.length?'warn':'ok')) + V3.kpi('Re-check after visits',rows.filter(r=>r.st.recheck).length,'Belongings to check again',rows.some(r=>r.st.recheck)?'warn':'ok') + V3.kpi('Contraband found',rows.reduce((n,r)=>n+((r.a.belong||{}).contraband||[]).length,0),'Removed and sealed','');
  const stat = (s, done, todoLbl) => s==='done'?chip(done,'c-green'):s==='file'?chip('On file','c-grey'):chip(todoLbl,'c-amber');
  const tr = rows.map(({p,st,a}) => { const rl = a.risk ? V3.riskLevel(a.risk.ans) : null;
    return `<tr><td><b>${hesc(p.name)}</b><div class="tiny muted">${hesc(p.room.replace('Room ','R-'))} · Day ${p.day||0}</div></td>
    <td>${stat(st.risk,'Screened '+(a.risk?V3.stamp(a.risk.t):''),'Risk screen due')}${rl?`<div class="row" style="gap:4px;margin-top:4px;flex-wrap:wrap">${rl.sui?chip('Suicide risk','c-red'):''}${rl.abs?chip('Absconding','c-amber'):''}${rl.fall?chip('Falls','c-amber'):''}${rl.wd?chip('Withdrawal','c-violet'):''}${!(rl.sui||rl.abs||rl.fall||rl.wd)?'<span class="tiny muted">No risks flagged</span>':''}</div>`:''}</td>
    <td>${stat(st.belong,'Checked '+(a.belong?V3.stamp(a.belong.t):''),'Belongings due')}${a.belong&&a.belong.contraband.length?`<div class="tiny" style="color:var(--red);margin-top:4px">${a.belong.contraband.length} item${a.belong.contraband.length===1?'':'s'} removed</div>`:''}</td>
    <td>${st.recheck?`${chip('Re-check due','c-red')}<div class="tiny muted">${hesc(a.recheck.reason)}</div>`:'<span class="tiny muted">None due</span>'}</td>
    <td style="text-align:right;white-space:nowrap"><button class="btn sm ${st.risk==='todo'?'pri':''}" onclick="V3.riskModal('${p.id}')">Risk screen</button> <button class="btn sm ${st.belong==='todo'?'pri':''}" onclick="V3.belongModal('${p.id}')">Belongings</button>${st.recheck?` <button class="btn sm pri" onclick="V3.recheckModal('${p.id}')">Re-check</button>`:''}</td></tr>`; }).join('');
  return `<div class="v3kpis">${kp}</div><section class="card"><div class="hd"><div><h3>Admission nursing</h3><div class="small muted" style="margin-top:4px">Risk screen and belongings check within the first hour. Belongings are checked again after every visit.</div></div><div class="row" style="gap:8px"><select class="input" id="am_p" style="width:200px;min-height:34px">${V3.ptOpts(L).map(o=>`<option value="${o[0]}">${hesc(o[1])}</option>`).join('')}</select><button class="btn" onclick="V3.riskModal($('am_p').value)">Open</button></div></div><div class="scroll"><table class="t"><thead><tr><th>Patient</th><th>Risk screen</th><th>Belongings and contraband</th><th>After visits</th><th></th></tr></thead><tbody>${tr}</tbody></table></div></section>`;
};
V3.riskModal = pid => { const p = V3.P(pid), a = (v3().adm[pid]||{}).risk, ans = a?a.ans:{}; v3().ui.rk = Object.assign({}, ans);
  V3.modal('Risk screen · '+hesc(p.name), hesc(p.room)+(a?' · done '+V3.stamp(a.t)+' by '+hesc(a.by):' · not done yet'), `<div class="rk">${['Suicide or self-harm','Falls','Absconding','Withdrawal'].map(g=>`<div class="rkg"><div class="lbl">${g}</div>${V3.RISKQ.filter(q=>q[1]===g).map(q=>`<div class="rkq"><span class="small">${q[2]}</span><div class="eseg"><button id="rk_${q[0]}_y" class="${ans[q[0]]?'on r':''}" onclick="V3.riskSet('${q[0]}',1)">Yes</button><button id="rk_${q[0]}_n" class="${ans[q[0]]===0||ans[q[0]]===false?'on g':''}" onclick="V3.riskSet('${q[0]}',0)">No</button></div></div>`).join('')}</div>`).join('')}</div><div id="rk_sum" class="callout grey small"></div>`,
    `<button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="V3.riskSave('${pid}')">Save screen</button>`); V3.riskSum(); };
V3.riskSet = (k, v) => { v3().ui.rk[k] = v; $('rk_'+k+'_y').className = v ? 'on r' : ''; $('rk_'+k+'_n').className = v ? '' : 'on g'; V3.riskSum(); };
V3.riskSum = () => { const r = V3.riskLevel(v3().ui.rk), bits = []; if(r.sui) bits.push('observation every 15 minutes, remove ligature risks, room near the nursing station'); if(r.abs) bits.push('door check, tell security, note clothes worn'); if(r.fall) bits.push('bed low, night light, help to walk'); if(r.wd) bits.push('CIWA-Ar every 2 to 4 hours, thiamine per order'); const e = $('rk_sum'); if(!e) return; e.className = 'callout small ' + (r.sui?'red':bits.length?'amber':'grey'); e.innerHTML = bits.length ? '<strong>Suggested precautions:</strong> '+bits.join('; ')+'. The psychiatrist confirms the observation level.' : 'No risks flagged yet.'; };
V3.riskSave = pid => { const ans = v3().ui.rk, s = v3(); if(RISKQ_MISSING(ans)){ toast('Answer every question'); return; } (s.adm[pid] = s.adm[pid]||{risk:null,belong:null,recheck:null}).risk = {ans:Object.assign({},ans), by:V3.who.nurse, t:V3.now()};
  const r = V3.riskLevel(ans); V3.log(pid,'nurse','admit',`Risk screen done: ${[r.sui?'suicide risk':'',r.abs?'absconding':'',r.fall?'falls':'',r.wd?'withdrawal':''].filter(Boolean).join(', ')||'no risks flagged'}`,{by:V3.who.nurse}); closeModal();
  if(r.sui) V3.alert({pid,sev:'urgent',title:'Risk screen: suicide risk flagged',detail:'Admission screening. Observation every 15 minutes suggested; psychiatrist to confirm.',src:'Risk screen',by:V3.who.nurse});
  else if(r.abs) V3.alert({pid,sev:'routine',title:'Risk screen: absconding risk flagged',detail:'Tell security and check the doors.',src:'Risk screen',by:V3.who.nurse});
  render(); toast('Risk screen saved'); };
const RISKQ_MISSING = ans => V3.RISKQ.some(q => ans[q[0]] === undefined);
V3.belongModal = pid => { const p = V3.P(pid), b = (v3().adm[pid]||{}).belong;
  V3.modal('Belongings and contraband · '+hesc(p.name), hesc(p.room), `<label class="field"><span class="lbl">Items brought in, one per line, with where kept</span><textarea class="input" id="bl_i" rows="5" placeholder="Clothes, 4 sets, kept in room&#10;Mobile phone, kept at the nursing station">${hesc(b?b.items.map(x=>x[0]+', '+x[1]).join('\n'):'')}</textarea></label>
    <div class="field"><span class="lbl">Contraband found (tick what you removed)</span><div class="v3checks">${V3.CONTRA.map(c=>`<label class="check small"><input type="checkbox" class="bl_c" value="${hesc(c)}" style="accent-color:var(--blue)" ${b&&b.contraband.some(x=>x[0]===c)?'checked':''}><span>${c}</span></label>`).join('')}</div></div>
    <div class="grid2"><label class="field"><span class="lbl">Where the removed items went</span>${V3.sel('bl_a',['Removed and sealed','Handed to family','Handed to security'],'Removed and sealed')}</label><label class="field"><span class="lbl">Witness (second staff member)</span>${V3.sel('bl_w',[['','Choose']].concat(V3.second()),b?b.witness:'')}</label></div>`,
    `<button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="V3.belongSave('${pid}')">Save and sign</button>`); };
V3.belongSave = pid => { const w = V3.val('bl_w'); if(!w){ toast('A witness must sign'); return; } const items = V3.val('bl_i').split('\n').map(x=>x.trim()).filter(Boolean).map(x=>{ const i = x.lastIndexOf(','); return i>0 ? [x.slice(0,i).trim(), x.slice(i+1).trim()] : [x,'Kept in room']; });
  const act = V3.val('bl_a'), con = [...document.querySelectorAll('.bl_c:checked')].map(c => [c.value, act]); const s = v3(); (s.adm[pid] = s.adm[pid]||{risk:null,belong:null,recheck:null}).belong = {items, contraband:con, by:V3.who.nurse, t:V3.now(), witness:w};
  V3.log(pid,'nurse','admit',`Belongings checked with ${w}: ${items.length} item${items.length===1?'':'s'}${con.length?'; contraband removed: '+con.map(c=>c[0].split(' (')[0].toLowerCase()).join(', '):'; no contraband'}`,{by:V3.who.nurse}); closeModal(); render(); toast('Belongings saved'); };
V3.recheckModal = pid => { const a = v3().adm[pid]; V3.modal('Belongings re-check · '+hesc(V3.pn(pid)), hesc(a.recheck.reason), `<div class="callout amber small">Check bags, pockets, and food or gifts brought by the visitors. Two staff members sign.</div><div class="field"><span class="lbl">What did you find</span><div class="eseg"><button id="rc_n" class="on g" onclick="$('rc_n').className='on g';$('rc_f').className='';$('rc_t').style.display='none'">Nothing</button><button id="rc_f" onclick="$('rc_f').className='on r';$('rc_n').className='';$('rc_t').style.display='block'">Found something</button></div><textarea class="input" id="rc_t" rows="2" style="display:none;margin-top:8px" placeholder="What was found and what you did"></textarea></div><label class="field"><span class="lbl">Second staff member</span>${V3.sel('rc_w',[['','Choose']].concat(V3.second()),'')}</label>`, `<button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="V3.recheckSave('${pid}')">Save re-check</button>`); };
V3.recheckSave = pid => { const w = V3.val('rc_w'); if(!w){ toast('Name the second staff member'); return; } const found = $('rc_f').classList.contains('on'), t = V3.val('rc_t').trim(); if(found && !t){ toast('Say what was found'); return; } const a = v3().adm[pid]; (a.rechecks = a.rechecks||[]).push({reason:a.recheck.reason, found:found?t:'', t:V3.now(), w}); a.recheck = null;
  V3.log(pid,'nurse','admit',`Belongings re-checked after visit with ${w}: ${found?'found '+t:'nothing found'}`,{by:V3.who.nurse}); closeModal(); if(found) V3.alert({pid,sev:'urgent',title:'Contraband found after a visit',detail:t,src:'Belongings',by:V3.who.nurse}); render(); toast('Re-check saved'); };

/* ---------- 8. Handover: acknowledged by the receiving nurse; pending items carry over ---------- */
V3.pending = () => { const out = [], s = v3(), L = V3.scope(), ids = new Set(L.map(p=>p.id));
  s.grid.filter(g=>ids.has(g.pid)&&!g.st).forEach(g => out.push({pid:g.pid,text:`${g.label} at ${g.slot}${V3.gridLate(g,NSLOTS.indexOf(g.slot))?' (missed)':''}`,tag:'grid'}));
  V3.prnDue().filter(l=>ids.has(l.pid)).forEach(l => out.push({pid:l.pid,text:`Effect check for ${l.drug}, due ${V3.hm(l.due)}`,tag:'prn'}));
  s.moves.filter(m=>ids.has(m.pid)&&m.st==='out').forEach(m => out.push({pid:m.pid,text:`Still out for ${m.type.toLowerCase()}, due back ${V3.hm(m.due)}`,tag:'move'}));
  s.alerts.filter(a=>ids.has(a.pid)&&!a.closed).forEach(a => out.push({pid:a.pid,text:`Open alert: ${a.title}`,tag:'alert'}));
  L.forEach(p => { const c = (s.charts[p.id]||{}).day; if(!c||!c.done) out.push({pid:p.id,text:'Day shift chart not filled',tag:'chart'}); const st = V3.admState(p.id); if(st.risk==='todo') out.push({pid:p.id,text:'Risk screen not done',tag:'adm'}); if(st.belong==='todo') out.push({pid:p.id,text:'Belongings check not done',tag:'adm'}); if(st.recheck) out.push({pid:p.id,text:'Belongings re-check after visit',tag:'adm'}); });
  s.future.filter(f=>ids.has(f.pid)).forEach(f => out.push({pid:f.pid,text:`${f.label}, ${f.when.toLowerCase()}`,tag:'future'}));
  return out; };
V3.pHandover = () => {
  const s = v3(), prev = s.ho.prev, cur = s.ho.cur, pend = V3.pending();
  const carried = (prev?prev.items:[]).map((it,i) => { const done = (s.ho.carriedDone||{})[i]; return `<label class="li" style="cursor:pointer;align-items:flex-start"><input type="checkbox" style="accent-color:var(--blue);width:16px;height:16px;margin-top:3px" ${done?'checked':''} onchange="(S.v3.ho.carriedDone=S.v3.ho.carriedDone||{})[${i}]=this.checked;V3.log('${it.pid}','nurse','handover','Carried-over item '+(this.checked?'done':'reopened')+': ${hesc(it.k).replace(/'/g,'')}');render()"><div class="grow"><div class="small ${done?'muted':''}" style="${done?'text-decoration:line-through':''}">${hesc(it.k)}</div><div class="tiny muted">${hesc(V3.pn(it.pid))} · carried over from last night</div></div></label>`; }).join('');
  const byTag = {grid:'Missed or upcoming checks',prn:'SOS effect checks',move:'Patients out of the ward',alert:'Open alerts',chart:'Charts not filled',adm:'Admission nursing',future:'Later today and tomorrow'};
  const groups = Object.keys(byTag).map(k => { const L = pend.filter(x=>x.tag===k); return L.length ? `<div class="tg"><span>${byTag[k]}</span>${chip(String(L.length),'c-grey')}</div>${L.slice(0,8).map(x=>`<div class="li small"><div class="grow"><strong>${hesc(V3.pn(x.pid))}</strong> · ${hesc(x.text)}</div></div>`).join('')}${L.length>8?`<div class="pad tiny muted">and ${L.length-8} more</div>`:''}` : ''; }).join('');
  return `<div class="v3cols">
   <section class="card"><div class="hd"><div><h3>Received this morning</h3><div class="small muted" style="margin-top:4px">${prev?hesc(prev.shift)+' · from '+hesc(prev.from):'No handover'}</div></div>${prev&&prev.ackBy?chip('Acknowledged '+V3.hm(prev.ackAt),'c-green'):chip('Not acknowledged','c-amber')}</div>
     <div class="pad"><div class="small">${hesc(prev.summary)}</div><div class="tiny muted" style="margin-top:6px">Acknowledged by ${hesc(prev.ackBy)} at ${V3.hm(prev.ackAt)}. Items below were carried over automatically.</div></div>${carried}</section>
   <section class="card"><div class="hd"><div><h3>Handing over tonight</h3><div class="small muted" style="margin-top:4px">${cur?'Sent '+V3.hm(cur.t)+' to '+hesc(cur.to):'Open items are collected for you. Write the note, then send.'}</div></div>${cur?(cur.ackBy?chip('Acknowledged by '+hesc(cur.ackBy)+' '+V3.hm(cur.ackAt),'c-green'):chip('Waiting for the night nurse','c-amber')):chip(pend.length+' open items','c-blue')}</div>
     ${cur?`<div class="pad"><div class="small">${hesc(cur.summary)}</div>${cur.items.length?`<div class="lbl" style="margin-top:12px">Carried over automatically · ${cur.items.length}</div>${cur.items.slice(0,6).map(it=>`<div class="small" style="margin-top:4px"><strong>${hesc(V3.pn(it.pid))}</strong> · ${hesc(it.k)}</div>`).join('')}${cur.items.length>6?`<div class="tiny muted">and ${cur.items.length-6} more</div>`:''}`:''}
       ${cur.ackBy?'':`<div class="callout blue small" style="margin-top:12px">The night nurse must acknowledge before the handover counts as received. Until then you stay responsible for the ward.</div><button class="btn pri" onclick="V3.hoAck()">Prototype: acknowledge as the night nurse</button>`}</div>`
     :`<div class="scroll" style="max-height:420px">${groups||V3.empty('Nothing pending')}</div><div class="pad" style="border-top:1px solid var(--line-2)"><button class="btn pri" onclick="nHandoverModal()">Write handover note</button></div>`}</section></div>`;
};
V3.hoAck = () => { const h = v3().ho.cur; h.ackBy = 'Brother Joseph'; h.ackAt = V3.now(); v3().ho.prev = Object.assign({}, h, {from:h.from}); V3.log('neel','nurse','handover',`Handover to ${h.to} acknowledged by Brother Joseph. ${h.items.length} open item${h.items.length===1?'':'s'} carried over.`,{by:'Brother Joseph'}); render(); toast('Acknowledged. Open items now sit on the night nurse list.'); };

/* ---------- Ward care page shell and tab strip on the shift board ---------- */
V3.wardBadges = () => { const s = v3(), L = V3.scope(), ids = new Set(L.map(p=>p.id));
  const ch = L.filter(p => !(((s.charts[p.id]||{}).day)||{}).done).length, vo = L.filter(p => s.vit.last[p.id] && V3.vitOut(p.id,s.vit.last[p.id]).length).length, pr = V3.prnDue().filter(l=>ids.has(l.pid)).length, mv = s.moves.filter(m=>ids.has(m.pid)&&m.st==='out').length, ad = L.filter(p => { const st = V3.admState(p.id); return st.risk==='todo'||st.belong==='todo'||st.recheck; }).length;
  return {charts:ch, vitals:vo, prn:pr, moves:mv, admission:ad, handover:(s.ho.cur&&!s.ho.cur.ackBy)?1:0}; };
V3.wardPage = tab => { $('title').textContent = 'Ward care'; const B = V3.wardBadges();
  const T = [['charts','Shift charts',B.charts,'amber'],['vitals','Vitals',B.vitals,'crit'],['prn','SOS and PRN',B.prn,'amber'],['moves','Movement',B.moves,'blue'],['admission','Admission',B.admission,'amber'],['handover','Handover',B.handover,'amber']];
  if(!T.some(x=>x[0]===tab)) tab = 'charts';
  const body = {charts:V3.pCharts, vitals:V3.pVitals, prn:V3.pPrn, moves:V3.pMoves, admission:V3.pAdmission, handover:V3.pHandover}[tab]();
  return V3.head('Ward care', 'Day shift 8 am to 8 pm · Male ward · '+V3.who.nurse, `<button class="btn" onclick="go('#/myday')">Shift board</button>`) + V3.nurseAlertsStrip() + V3.tabs('ward',T,tab) + body; };
V3.wardHome = () => { if(S.role!=='nurse' && !chartLikeRmo()) return ''; const B = V3.wardBadges(), s = v3(), ids = new Set(V3.scope().map(p=>p.id));
  const T = [['charts','Shift charts','sleep, food, mood',B.charts,'pulse'],['vitals','Vitals','with safe ranges',B.vitals,'heart'],['prn','SOS and PRN','effect checks',B.prn,'pill'],['moves','Movement','who is off the ward',B.moves,'walk'],['admission','Admission','risk and belongings',B.admission,'shield'],['handover','Handover','carried over',B.handover,'users']];
  const carry = s.ho.prev ? s.ho.prev.items.filter((it,i)=>!(s.ho.carriedDone||{})[i]) : [];
  return `<section class="card"><div class="hd"><div><h3>Ward care</h3><div class="small muted" style="margin-top:4px">Doctor instructions now appear as boxes on the board. These cover everything else on the shift.</div></div></div><div class="v3tiles">${T.map(t=>`<button class="v3tile" onclick="go('#/ward/${t[0]}')"><span class="v3tile-i">${V3.i(t[4],18)}</span><span class="v3tile-t"><b>${t[1]}</b><span class="tiny muted">${t[2]}</span></span>${t[3]?`<span class="n ${t[0]==='vitals'?'crit':'amber'}">${t[3]}</span>`:''}</button>`).join('')}</div>${carry.length?`<div class="pad" style="border-top:1px solid var(--line-2)"><div class="lbl" style="margin-bottom:6px">Carried over from last night · ${carry.length}</div>${carry.map(it=>`<div class="small" style="margin-top:4px"><strong>${hesc(V3.pn(it.pid))}</strong> · ${hesc(it.k)}</div>`).join('')}</div>`:''}</section>${V3.nurseAlertsStrip()}`; };

/* ---------- hooks into the existing nurse screens ---------- */
(() => {
  const _ncell = ncell; ncell = (pid, slot, si) => { const g = V3.gridCell(pid, slot, si); const h = _ncell(pid, slot, si); return g ? h.replace(/<\/td>\s*$/, g + '</td>') : h; };
  const _instr = instrAct; instrAct = (name, id) => { const sc = v3().sched[id], h = _instr(name, id); return (sc && sc.n) ? h.replace('margin-left:auto">', 'margin-left:auto"><span class="chip c-green" title="Created from the instruction">'+sc.n+' on the grid</span>') : h; };
  const _rest = medRest; medRest = (pid, slot, si) => { const p = allPts().find(x=>x.id===pid); if(p && p.risk){ toast('High-risk patient: record each medicine one at a time'); return; } _rest(pid, slot, si); };
  const _hm = nHandoverModal; nHandoverModal = () => { _hm(); const ta = $('nhPend'); if(ta){ if(!ta.value.trim()) ta.value = V3.pending().map(x => '• '+V3.pn(x.pid)+': '+x.text).join('\n'); const lb = ta.closest('label').querySelector('.lbl'); if(lb) lb.textContent = 'Still pending for the next shift (filled in from open items)'; ta.rows = 6; } };
  const _hs = nhSend; nhSend = () => { const had = $('nhSum') && $('nhSum').value.trim(), pend = V3.pending(); _hs(); if(had && S.nHandovers && S.nHandovers[0]){ const h = S.nHandovers[0]; v3().ho.cur = {id:'h'+Date.now(), from:V3.who.nurse, to:h.to, shift:h.shift, t:V3.now(), ackBy:null, ackAt:null, summary:h.sum, items:pend.map(x=>({k:x.text,pid:x.pid,carried:true}))}; V3.log('neel','nurse','handover',`Handover sent to ${h.to.split(' (')[0]}: ${pend.length} open item${pend.length===1?'':'s'} carried over`,{by:V3.who.nurse}); } };
})();

/* ======================================================================
   RMO · Duty desk
   ====================================================================== */
V3.ONCALL = {
  'Male ward':{n:'Dr. Aanya Sharma',b:'Dr. Nandini Rao',ph:'+91 98XXX XXX01'},
  'Female ward':{n:'Dr. Kunal Sethi',b:'Dr. Nandini Rao',ph:'+91 98XXX XXX02'},
  'De-addiction ward':{n:'Dr. Kunal Sethi',b:'Dr. Nandini Rao',ph:'+91 98XXX XXX03',note:'Dr. Rohan Mehta is off duty'}
};
V3.SEDATIVE = /(lorazepam|diazepam|midazolam|clonazepam|haloperidol|chlorpromazine|morphine|buprenorphine|phenobarbital)/i;
V3.rmoPts = () => S.role==='rmo' ? scopePts() : allPts();
V3.isNight = () => !!v3().ui.night;

V3.dutyBadges = () => { const s = v3(), ids = new Set(V3.rmoPts().map(p=>p.id));
  return {
    night: 0,
    alerts: s.alerts.filter(a=>!a.closed&&!a.ack&&ids.has(a.pid)).length,
    orders: s.orders.filter(o=>!o.cs).length,
    protocols: s.proto.active ? 1 : 0,
    labs: s.labs.filter(l=>ids.has(l.pid)&&!l.rev&&V3.labFlag(l)!=='ok').length,
    referrals: s.transfers.filter(x=>!x.closed).length,
    events: s.serious.filter(x=>!x.closed).length,
    exam: V3.examRows().filter(r=>r.st==='over').length
  }; };
V3.dutyPage = tab => { $('title').textContent = 'Duty desk'; const B = V3.dutyBadges();
  const T = [['night','Night desk',0,''],['alerts','Alerts',B.alerts,'crit'],['orders','Orders',B.orders,'amber'],['protocols','Emergency',B.protocols,'crit'],['labs','Lab results',B.labs,'amber'],['referrals','Referrals',B.referrals,'blue'],['events','Serious events',B.events,'crit'],['exam','Physical exam rule',B.exam,'amber']];
  if(!T.some(x=>x[0]===tab)) tab = 'night';
  const body = {night:V3.pNight,alerts:V3.pAlerts,orders:V3.pOrders,protocols:V3.pProtocols,labs:V3.pLabs,referrals:V3.pRefer,events:V3.pEvents,exam:V3.pExam}[tab]();
  return V3.head('Duty desk', V3.dateLabel()+' · '+V3.clockStr()+' · '+(V3.isNight()?'Night duty':'Day duty'), '') + V3.protoBanner() + V3.tabs('duty',T,tab) + body; };
V3.protoBanner = () => { const a = v3().proto.active; if(!a) return ''; return `<div class="v3pbanner" onclick="go('#/duty/protocols')"><span class="pulse"></span><b>${hesc(V3.PROTO[a.type].name)} protocol running</b><span>${hesc(V3.pn(a.pid))} · started ${V3.hm(a.start)} · ${V3.mins(V3.now()-a.start)} elapsed</span><span class="go">Open checklist →</span></div>`; };

/* ---------- 1. Night desk ---------- */
V3.pNight = () => {
  const s = v3(), night = V3.isNight(), ids = new Set(V3.rmoPts().map(p=>p.id));
  const open = s.alerts.filter(a=>!a.closed&&ids.has(a.pid)).sort((a,b)=>({critical:0,urgent:1,routine:2}[a.sev]-{critical:0,urgent:1,routine:2}[b.sev])||a.t-b.t);
  const unack = open.filter(a=>!a.ack).length, newAdm = ['rohit'].filter(id=>ids.has(id)).map(V3.P);
  const exp = s.beds.expected.filter(e=>V3.day(e.eta)===0);
  const kp = V3.kpi('Alerts waiting',unack,unack?'Respond inside the time on each card':'All acknowledged',unack?'crit':'ok') + V3.kpi('Open alerts',open.length,open.filter(a=>a.sev==='critical').length+' critical','') + V3.kpi('Admissions to see',newAdm.length+exp.length,newAdm.length+' in, '+exp.length+' arriving today',newAdm.length?'warn':'') + V3.kpi('Orders to be countersigned',s.orders.filter(o=>!o.cs).length,'Consultants sign by morning','');
  const mode = `<div class="v3mode ${night?'night':''}"><div class="row" style="gap:12px;flex-wrap:nowrap"><span class="v3mode-i">${V3.i(night?'moon':'clock',22)}</span><div><b>${night?'Night duty: you are the first call for everything':'Day duty: treating teams lead, you back them up'}</b><div class="small" style="opacity:.85">${night?'Nurses call you first on every ward. Consultants are on call by phone. Unanswered alerts go up the chain on their own.':'Alerts still reach you first and escalate to the psychiatrist and floor lead if nobody responds.'}</div></div></div><div class="seg"><button class="${night?'':'on'}" onclick="S.v3.ui.night=false;render()">Day duty</button><button class="${night?'on':''}" onclick="S.v3.ui.night=true;render()">Night duty, 8 pm to 8 am</button></div></div>`;
  const alerts = open.length ? open.slice(0,4).map(a=>V3.alertCard(a)).join('') : V3.empty('No open alerts','New alerts from nurses appear here the moment they are raised.');
  const admRows = newAdm.map(p=>`<div class="li" style="align-items:flex-start"><div class="grow"><div class="row" style="gap:8px"><strong>${hesc(p.name)}</strong>${chip('Admitted 10:30 am','c-blue')}${chip('Suite 201','c-violet')}</div><div class="small muted">${hesc(p.dx)} · ${hesc(V3.eff('psy',p.id))}</div><div class="tiny muted">${V3.admState(p.id).risk==='todo'?'Nursing risk screen not done. ':''}Admission workup open.</div></div><button class="btn sm pri" onclick="go('#/patient/${p.id}/admission')">Open workup</button></div>`).join('') + exp.map(e=>`<div class="li" style="align-items:flex-start"><div class="grow"><div class="row" style="gap:8px"><strong>${hesc(e.name)}</strong>${chip('Arriving '+V3.hm(e.eta),'c-amber')}${e.bed?chip('Bed '+hesc(e.bed.replace('Room ','R-')),'c-green'):chip('No bed','c-red')}</div><div class="small muted">${hesc(e.dx)} · ${hesc(e.ward)} · ${hesc(e.src)}</div></div></div>`).join('');
  const oc = FLOORS.slice().sort((a,b)=>floorNo(WARDS[a][0])-floorNo(WARDS[b][0])).map(w=>{ const o = V3.ONCALL[w]; const a = open.filter(x=>V3.ward(x.pid)===w).length;
    return `<tr><td><b>${floorNo(WARDS[w][0])}${['st','nd','rd'][floorNo(WARDS[w][0])-1]||'th'} floor</b><div class="tiny muted">${hesc(w)} · ${WARDS[w].length} patients</div></td><td>${a?chip(a+' open alert'+(a===1?'':'s'),'c-red'):chip('Quiet','c-green')}</td><td><b>${hesc(o.n)}</b><div class="tiny muted">On call tonight${o.note?' · '+hesc(o.note):''}</div></td><td class="small">${hesc(o.b)}<div class="tiny muted">Backup</div></td><td class="small"><span class="v3sel">${hesc(o.ph)}</span></td><td style="text-align:right"><button class="btn sm pri" onclick="V3.callModal('','','${w}')">${V3.i('phone',14)} Call</button></td></tr>`; }).join('');
  return `${mode}<div class="v3kpis">${kp}</div>
   <section class="card"><div class="hd"><div><h3>Incoming alerts</h3><div class="small muted" style="margin-top:4px">Acknowledge first, then go to the bedside. Both times are shown to the nurse.</div></div>${open.length>4?`<button class="btn sm" onclick="go('#/duty/alerts')">All ${open.length}</button>`:''}</div><div class="v3al-list">${alerts}</div></section>
   <div class="v3cols v3one"><section class="card"><div class="hd"><div><h3>New admissions</h3><div class="small muted" style="margin-top:4px">Workup within 24 hours, physical exam on admission</div></div></div>${admRows||V3.empty('No admissions to see')}</section>
   <section class="card"><div class="hd"><div><h3>On call tonight</h3><div class="small muted" style="margin-top:4px">One tap opens the call log with the alert already filled in</div></div></div><div class="scroll"><table class="t"><thead><tr><th>Floor</th><th>Now</th><th>Consultant</th><th>Backup</th><th>Phone</th><th></th></tr></thead><tbody>${oc}</tbody></table></div></section></div>`;
};

/* ---------- 2. Alerts page ---------- */
V3.pAlerts = () => { const s = v3(), u = s.ui; u.alF = u.alF||'open'; const ids = new Set(V3.rmoPts().map(p=>p.id));
  let L = s.alerts.filter(a=>ids.has(a.pid)); const cnt = {open:L.filter(a=>!a.closed).length, closed:L.filter(a=>a.closed).length};
  L = u.alF==='open' ? L.filter(a=>!a.closed) : u.alF==='closed' ? L.filter(a=>a.closed) : L;
  const done = s.alerts.filter(a=>ids.has(a.pid)&&a.ack), avg = done.length ? Math.round(done.reduce((n,a)=>n+(a.ack.t-a.t),0)/done.length) : 0, seen = s.alerts.filter(a=>ids.has(a.pid)&&a.seen);
  const kp = V3.kpi('Not acknowledged',L.filter(a=>!a.ack&&!a.closed).length,'Escalates by the minute',L.some(a=>!a.ack&&!a.closed)?'crit':'ok') + V3.kpi('Average time to acknowledge',avg+' min','Target 2 to 15 min by severity','') + V3.kpi('Reached the bedside',seen.length,'of '+done.length+' acknowledged','') + V3.kpi('Escalated up the chain',s.alerts.filter(a=>ids.has(a.pid)&&a.esc.length).length,'Not answered in time',s.alerts.some(a=>a.esc.length&&!a.closed)?'warn':'ok');
  return `<div class="v3kpis">${kp}</div><section class="card"><div class="hd"><div class="row" style="gap:6px">${[['open','Open · '+cnt.open],['closed','Closed · '+cnt.closed],['all','All']].map(([k,l])=>`<button class="tog ${u.alF===k?'on':''}" onclick="S.v3.ui.alF='${k}';render()">${l}</button>`).join('')}</div><button class="btn sm" onclick="go('#/escalation')">Response times and chain</button></div><div class="v3al-list">${L.map(a=>V3.alertCard(a)).join('')||V3.empty('Nothing here')}</div></section>`; };

/* ---------- 3. Call consultant and log the advice ---------- */
V3.callModal = (pid, aid, ward) => {
  const s = v3(), a = aid ? s.alerts.find(x=>x.id===aid) : null; pid = pid || (a ? a.pid : '');
  const w = ward || (pid ? V3.ward(pid) : 'Male ward'), oc = V3.ONCALL[w], p = pid ? V3.P(pid) : null, opts = [[oc.n,oc.n+' · on call for '+w],[oc.b,oc.b+' · backup, floor lead']];
  if(pid){ const t = V3.eff('psy',pid); if(!opts.some(o=>o[0]===t)) opts.unshift([t,t+' · treating psychiatrist']); }
  s.ui.call = {t0:V3.now()}; const v = s.vit.last[pid];
  V3.modal('Call consultant', p ? hesc(p.name)+' · '+hesc(p.room) : hesc(w), `
   <div class="v3callbox"><div><span class="tiny muted">Calling</span>${V3.sel('cl_to',opts,opts[0][0])}</div><div><span class="tiny muted">Number</span><div class="row" style="gap:8px;flex-wrap:nowrap"><b class="v3sel" id="cl_ph">${hesc(oc.ph)}</b><button class="btn sm" onclick="try{navigator.clipboard.writeText('${oc.ph}').then(()=>toast('Number copied'),()=>toast('Select the number to copy it'))}catch(e){toast('Select the number to copy it')}">Copy</button></div></div></div>
   ${pid?'':`<label class="field"><span class="lbl">Patient (required)</span>${V3.sel('cl_p',[['','Choose']].concat(V3.ptOpts(V3.rmoPts())),'')}</label>`}
   <div class="lbl" style="margin:4px 0 6px">What you say: situation, background, assessment, request</div>
   <div class="grid2"><label class="field"><span class="lbl">Situation</span><textarea class="input" id="cl_s" rows="2">${hesc(a?a.title+(a.detail?'. '+a.detail:''):'')}</textarea></label><label class="field"><span class="lbl">Background</span><textarea class="input" id="cl_b" rows="2">${hesc(p?p.dx+(p.risk?'. High risk.':'')+' Day '+(p.day||0)+', Section '+p.sec+'.':'')}</textarea></label><label class="field"><span class="lbl">Assessment</span><textarea class="input" id="cl_a" rows="2">${hesc(v?'Last vitals '+V3.vitText(v)+'.':'')}</textarea></label><label class="field"><span class="lbl">What you need</span><textarea class="input" id="cl_r" rows="2" placeholder="e.g. Advice on sedation, review in the morning, transfer"></textarea></label></div>
   <div class="lbl" style="margin:4px 0 6px">After the call</div>
   <label class="field"><span class="lbl">Advice given (required)</span><textarea class="input" id="cl_adv" rows="3" placeholder="Exactly what the consultant advised"></textarea><div id="cl_e" class="small" style="color:var(--red);display:none">Write the advice before saving</div></label>
   <div class="grid2"><label class="field"><span class="lbl">Call length</span>${V3.sel('cl_d',[[2,'2 minutes'],[5,'5 minutes'],[10,'10 minutes'],[15,'15 minutes'],[20,'20 minutes or more']],5)}</label><label class="check" style="border:0;padding:22px 0 0"><input type="checkbox" id="cl_rb" style="accent-color:var(--blue)"><span class="small"><strong>I read the advice back</strong> and the consultant confirmed</span></label></div>
   <label class="check" style="border:0;padding:4px 0"><input type="checkbox" id="cl_o" style="accent-color:var(--blue)" checked><span class="small">Enter a telephonic order next. The consultant countersigns tomorrow morning.</span></label>`,
   `<button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="V3.callSave('${pid}','${aid||''}','${w}')">Save call log</button>`, 'min(760px,100%)');
};
V3.callSave = (pid, aid, w) => {
  const s = v3(); pid = pid || V3.val('cl_p'); if(!pid){ toast('Choose the patient'); return; }
  const adv = V3.val('cl_adv').trim(); if(!adv){ $('cl_e').style.display = 'block'; return; } if(!$('cl_rb').checked){ toast('Read the advice back and tick the box'); return; }
  const c = {id:'c'+(++s.tlN), pid, to:V3.val('cl_to'), t:s.ui.call.t0, dur:+V3.val('cl_d'), by:V3.who.rmo, sbar:{s:V3.val('cl_s'),b:V3.val('cl_b'),a:V3.val('cl_a'),r:V3.val('cl_r')}, advice:adv, orders:[], readback:true, aid:aid||null};
  s.calls.unshift(c); V3.log(pid,'rmo','call',`Called ${c.to} (${c.dur} min). Advice: ${adv}. Read back and confirmed.`,{by:V3.who.rmo});
  if(aid){ const a = s.alerts.find(x=>x.id===aid); if(a){ (a.calls = a.calls||[]).push(c.id); if(!a.ack) a.ack = {by:V3.who.rmo,role:'rmo',t:V3.now()}; } }
  const order = $('cl_o').checked; closeModal();
  if(order) V3.orderModal(pid, {via:c.to, callId:c.id}); else { render(); toast('Call logged'); }
};

/* ---------- 4. Orders: STAT, SOS and telephonic, countersigned next morning ---------- */
V3.pOrders = () => {
  const s = v3(), L = s.orders.slice().sort((a,b)=>b.t-a.t), wait = L.filter(o=>!o.cs);
  const kp = V3.kpi('Awaiting countersign',wait.length,wait.length?'Oldest '+V3.ago(wait[wait.length-1].t):'All countersigned',wait.length?'warn':'ok') + V3.kpi('STAT given',L.filter(o=>o.type==='STAT'&&o.given).length,L.filter(o=>o.type==='STAT'&&!o.given).length+' waiting for the nurse','') + V3.kpi('SOS orders live',s.prn.orders.filter(o=>o.rmo).length,'Visible on the nurse list','') + V3.kpi('Phone orders',L.filter(o=>o.via).length,'After speaking to a consultant','');
  const rows = L.map(o=>`<tr><td class="small" style="white-space:nowrap">${V3.stamp(o.t)}</td><td><b>${hesc(V3.pn(o.pid))}</b></td><td>${chip(o.type,o.type==='STAT'?'c-red':o.type==='SOS'?'c-amber':'c-violet')}${o.ds?'<div class="tiny muted">2 signatures</div>':''}</td><td class="small" style="max-width:300px">${hesc(o.text)}<div class="tiny muted">${o.via?'By phone after speaking to '+hesc(o.via):'RMO order'}</div></td><td class="small">${o.given?'Given '+V3.hm(o.given.t)+'<div class="tiny muted">'+hesc(o.given.by)+'</div>':o.type==='STAT'?'<span style="color:var(--amber)">Waiting for nurse</span>':o.type==='SOS'?'<span class="muted">As needed</span>':'<span class="muted">On the grid</span>'}</td><td>${o.cs?chip('Countersigned','c-green')+'<div class="tiny muted">'+hesc(o.cs.by)+' '+V3.stamp(o.cs.t)+'</div>':chip('Not yet signed','c-amber')}</td></tr>`).join('');
  return `<div class="v3kpis">${kp}</div><div class="callout blue small" style="display:flex;gap:10px;align-items:center">${V3.i('shield',16)}<span>Orders you write show on the nurse grid at once. Nurses cannot change them. Each one needs the treating consultant's countersignature, normally the next morning.</span></div>
  <section class="card"><div class="hd"><div><h3>Orders written on duty</h3></div><div class="row" style="gap:8px"><button class="btn" onclick="V3.orderModal('',{type:'SOS'})">Write SOS order</button><button class="btn pri" onclick="V3.orderModal('',{type:'STAT'})">${V3.i('plus',14)} Write order</button></div></div><div class="scroll"><table class="t"><thead><tr><th>When</th><th>Patient</th><th>Type</th><th>Order</th><th>Status</th><th>Countersign</th></tr></thead><tbody>${rows}</tbody></table></div></section>`; };
V3.orderModal = (pid, o) => { o = o||{}; const L = V3.rmoPts(), via = o.via||'', type = o.type||'STAT';
  V3.modal('Write order', 'Shows on the nurse grid and list immediately', `
   <div class="grid2"><label class="field"><span class="lbl">Patient</span>${V3.sel('or_p',V3.ptOpts(L),pid||L[0].id)}</label><label class="field"><span class="lbl">Type</span>${V3.sel('or_t',[['STAT','STAT: give now'],['SOS','SOS or PRN: when needed'],['Monitoring','Monitoring or other instruction']],type)}</label></div>
   <div class="grid3"><label class="field"><span class="lbl">Medicine</span><input class="input" id="or_d" placeholder="e.g. Haloperidol" oninput="V3.orderSed()"></label><label class="field"><span class="lbl">Dose</span><input class="input" id="or_ds" placeholder="e.g. 5 mg"></label><label class="field"><span class="lbl">Route</span>${V3.sel('or_r',['Oral','IM','IV','SC'],'Oral')}</label></div>
   <label class="field"><span class="lbl">Reason or instruction (required)</span><textarea class="input" id="or_i" rows="2" placeholder="STAT or SOS: why. Monitoring: e.g. Neuro checks every 2 hours until the morning round"></textarea><div id="or_e" class="small" style="color:var(--red);display:none">Say why, or what to do</div></label>
   <div class="grid3"><label class="field"><span class="lbl">Most doses in 24 hours (SOS)</span>${V3.sel('or_m',[1,2,3,4],2)}</label><label class="field"><span class="lbl">Hours between (SOS)</span>${V3.sel('or_g',[1,2,4,6,8],4)}</label><label class="field"><span class="lbl">Second nurse signs</span>${V3.sel('or_x',[['auto','Automatic (sedatives, IM)'],['yes','Always'],['no','Not needed']],'auto')}</label></div>
   <label class="field"><span class="lbl">Authority</span>${V3.sel('or_v',[['','My own decision as the RMO']].concat(Object.keys(V3.ONCALL).map(w=>[V3.ONCALL[w].n,'Phone order after speaking to '+V3.ONCALL[w].n]).filter((x,i,a)=>a.findIndex(y=>y[0]===x[0])===i)).concat([[V3.ONCALL['Male ward'].b,'Phone order after speaking to '+V3.ONCALL['Male ward'].b]]),via)}</label>
   <div id="or_w" class="callout amber small" style="display:none"></div>
   <div class="callout grey small">The consultant countersigns by next morning. Until then the order is active and marked <em>not yet signed</em>.</div>`,
   `<button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="V3.orderSave(${o.callId?`'${o.callId}'`:"''"})">Send to the nurse grid</button>`, 'min(700px,100%)'); };
V3.orderSed = () => { const d = V3.val('or_d'), w = $('or_w'); if(!w) return; if(V3.SEDATIVE.test(d)){ w.style.display = 'block'; w.textContent = 'Sedating drug: two nurses sign when it is given, and breathing and sedation are checked 15 and 30 minutes after.'; } else w.style.display = 'none'; };
V3.orderSave = callId => {
  const s = v3(), pid = V3.val('or_p'), type = V3.val('or_t'), drug = V3.val('or_d').trim(), dose = V3.val('or_ds').trim(), route = V3.val('or_r'), ins = V3.val('or_i').trim(), via = V3.val('or_v');
  if(!ins){ $('or_e').style.display = 'block'; return; } if(type!=='Monitoring' && (!drug || !dose)){ toast('Enter the medicine and dose'); return; }
  const x = V3.val('or_x'), ds = x==='yes' || (x==='auto' && (V3.SEDATIVE.test(drug) || route==='IM')), p = V3.P(pid);
  const text = type==='Monitoring' ? ins : `${drug} ${dose} ${route}${type==='SOS'?' as needed, up to '+V3.val('or_m')+' in 24 hours, '+V3.val('or_g')+' hours apart':''} for ${ins.charAt(0).toLowerCase()+ins.slice(1)}`;
  const o = {id:'o'+(++s.tlN), pid, type, text, by:V3.who.rmo, via, t:V3.now(), cs:null, given:null, ds};
  s.orders.unshift(o); if(callId){ const c = s.calls.find(y=>y.id===callId); if(c) c.orders.push(o.id); }
  let msg = '';
  if(type==='STAT'){ s.grid.push({id:'g'+(++s.tlN),pid,slot:NSLOTS[NOWI],kind:'stat',label:'STAT '+drug+' '+dose,ord:o.id,ds,st:''}); medNotice(pid,'STAT order: '+text,'STAT order','c-red'); msg = 'STAT order is on the nurse grid now.'; }
  else if(type==='SOS'){ s.prn.orders.push({id:'p'+(++s.tlN),pid,drug,dose,route,ind:ins,max:+V3.val('or_m'),gap:+V3.val('or_g'),ds,rmo:true,by:V3.who.rmo,cs:'pending',src:o.id}); medNotice(pid,'SOS order: '+text,'SOS order','c-amber'); msg = 'SOS order is on the nurse list now.'; }
  else { medNotice(pid,text,'Order','c-blue'); V3.syncInstr(); const sc = Object.values(s.sched).slice(-1)[0]; msg = 'Instruction sent'+(s.grid.length?'. Check the nurse grid for new slots.':'.'); }
  V3.log(pid,'rmo','order',`${type==='STAT'?'STAT':type==='SOS'?'SOS':'Order'}${via?' (phone, '+via+')':''}: ${text}. Awaiting countersign.`,{by:V3.who.rmo});
  closeModal(); render(); toast(msg);
};
/* STAT slots on the grid */
(() => { const _go = V3.gridOpen; V3.gridOpen = id => { const g = v3().grid.find(x=>x.id===id); if(g && g.kind==='stat') return V3.statOpen(id); return _go(id); }; })();
V3.KINDS.stat = ['STAT dose','⚡','c-red'];
V3.statOpen = id => { const g = v3().grid.find(x=>x.id===id), o = v3().orders.find(x=>x.id===g.ord), p = V3.P(g.pid);
  V3.modal('STAT order · '+hesc(p.name), hesc(p.room)+(p.risk?' · High risk':''), `<div class="callout red small"><strong>${hesc(o.text)}</strong><br><span class="tiny">Written by ${hesc(o.by)} ${V3.hm(o.t)}${o.via?' after speaking to '+hesc(o.via):''}. ${o.cs?'Countersigned.':'Not yet countersigned. Safe to give.'}</span></div>
   ${g.st==='done'?`<div class="callout green small">Given by ${hesc(g.by)} at ${V3.hm(g.at)}.</div>`:`${g.ds?`<div class="v3ds"><div class="row" style="gap:8px">${V3.i('shield',16)}<strong>Second nurse signs</strong></div><div class="grid2"><label class="field"><span class="lbl">Second nurse</span>${V3.sel('st_co',[['','Choose']].concat(V3.second()),'')}</label><label class="check" style="border:0;padding:24px 0 0"><input type="checkbox" id="st_ck" style="accent-color:var(--blue)"><span class="small">Drug, dose, route and patient checked</span></label></div></div>`:''}<div class="callout grey small">After giving: breathing and sedation check at 15 minutes, effect at 30 minutes. You cannot change the order. If something looks wrong, use <em>Query this order</em>.</div>`}`,
   g.st==='done' ? `<button class="btn pri" onclick="closeModal()">Close</button>` : `<button class="btn" onclick="V3.statQuery('${id}')">Query this order</button><button class="btn pri" onclick="V3.statGive('${id}')">Record: given now</button>`); };
V3.statGive = id => { const s = v3(), g = s.grid.find(x=>x.id===id), o = s.orders.find(x=>x.id===g.ord); let co = ''; if(g.ds){ co = V3.val('st_co'); if(!co || !$('st_ck').checked){ toast('A second nurse must be named and tick the check'); return; } }
  g.st = 'done'; g.by = V3.who.nurse; g.at = V3.now(); o.given = {by:V3.who.nurse, t:V3.now()};
  s.prn.log.unshift({id:'l'+(++s.tlN),oid:o.id,pid:g.pid,drug:o.text,t:V3.now(),reason:'STAT order: '+o.text,by:V3.who.nurse,co,due:V3.now()+30,effect:null});
  V3.log(g.pid,'nurse','dose',`STAT given: ${o.text}${co?'. '+co+' signed as second nurse':''}. Effect check ${V3.hm(V3.now()+30)}.`,{by:V3.who.nurse}); closeModal(); render(); toast('Recorded. Effect check at '+V3.hm(V3.now()+30)); };
V3.statQuery = id => { const g = v3().grid.find(x=>x.id===id), o = v3().orders.find(x=>x.id===g.ord); closeModal(); V3.alert({pid:g.pid,sev:'urgent',title:'Nurse query on order: '+o.text,detail:'Nurse is waiting before giving it.',src:'Order query',by:V3.who.nurse}); render(); toast('Query sent to the RMO'); };

/* ---------- 5. Emergency protocol checklists ---------- */
V3.PROTO = {
  agitation:{name:'Agitation',ic:'alert',steps:[['Call for help: nursing and security on the ward',1],['Keep a safe distance, calm voice, reduce noise and crowd',0],['Check for a cause: pain, withdrawal, low sugar, delirium, missed medicines',0],['Check vitals and blood sugar',1],['Offer the oral SOS medicine in the order',0],['If not settling: IM medicine per a written order, two nurses signing',1],['Watch breathing, sedation and BP every 15 minutes after medicine',1],['Call the consultant and record the advice',0],['Debrief with the team, document, and tell the family',0]]},
  seizure:{name:'Seizure',ic:'pulse',steps:[['Note the time the seizure started',1],['Protect the head, clear the area, nothing in the mouth',1],['Turn onto the side when the jerking stops',0],['Oxygen and suction ready',0],['Check blood sugar',1],['Seizure longer than 5 minutes: give the benzodiazepine in the order and call the consultant',1],['Vitals and GCS every 15 minutes until awake',1],['Note duration, type, and how long to wake',0],['Decide on transfer to the general hospital',0],['Document and tell the family',0]]},
  overdose:{name:'Overdose or poisoning',ic:'pill',steps:[['Find what, how much and when. Keep the packaging',1],['Airway, breathing, circulation, and vitals now',1],['Check blood sugar, and do an ECG',1],['Do not make the patient vomit',0],['Call the consultant and the poison information centre',1],['Plan transfer to the general hospital with a nurse escort',1],['Observe every 15 minutes: GCS, breathing, BP, pulse',0],['Treat as medico-legal if self-harm or intent: start the MLC steps',1],['Tell the family and document',0]]},
  fall:{name:'Fall with head injury',ic:'bed',steps:[['Do not move the patient if there is neck pain or numbness',1],['Check GCS and pupils now',1],['Stop any bleeding with pressure',0],['Vitals and blood sugar',1],['Call the consultant',1],['Neuro checks every 15 minutes for 1 hour, then as ordered',1],['Decide on transfer for a CT scan',1],['Incident report, tell the family',0]]},
  choking:{name:'Choking',ic:'alert',steps:[['Ask: can you cough? If yes, encourage coughing',1],['Cannot cough or speak: 5 back blows then 5 abdominal thrusts, repeat',1],['Call for help and note the time',1],['Patient unresponsive: start CPR and call the ambulance',1],['After clearing: check airway, breathing and SpO₂',1],['Transfer for assessment, even if recovered',0],['Review swallowing and diet. Document and tell the family',0]]}
};
V3.pProtocols = () => { const s = v3(), a = s.proto.active;
  const start = Object.keys(V3.PROTO).map(k=>`<button class="v3pstart" onclick="V3.protoStart('${k}')"><span class="v3tile-i">${V3.i(V3.PROTO[k].ic,20)}</span><b>${V3.PROTO[k].name}</b><span class="tiny muted">${V3.PROTO[k].steps.length} steps · timed</span></button>`).join('');
  const done = s.proto.done.slice(0,5).map(d=>`<div class="li"><div class="grow"><strong>${hesc(V3.PROTO[d.type].name)}</strong> · ${hesc(V3.pn(d.pid))}<div class="tiny muted">${V3.stamp(d.start)} to ${V3.hm(d.end)} · ${V3.mins(d.end-d.start)} · ${d.steps.filter(x=>x.t).length} of ${d.steps.length} steps · ${hesc(d.outcome)}</div></div></div>`).join('');
  const note = `<div class="callout amber small">These checklists are a starting template. Replace the steps with Tulasi's approved emergency protocols before real use.</div>`;
  if(!a) return `<section class="card"><div class="hd"><div><h3>Start a checklist</h3><div class="small muted" style="margin-top:4px">Every step is timed. The record goes onto the patient's timeline when you finish.</div></div></div><div class="pad"><div class="v3pgrid">${start}</div></div></section>${note}${done?`<section class="card"><div class="hd"><h3>Earlier this shift</h3></div>${done}</section>`:''}`;
  const P = V3.PROTO[a.type], dn = a.steps.filter(x=>x.t).length, crit = P.steps.filter((x,i)=>x[1]&&!a.steps[i].t).length;
  return `<section class="card v3pactive"><div class="hd"><div><div class="row" style="gap:8px"><span class="pulse"></span><h3>${hesc(P.name)} · ${hesc(V3.pn(a.pid))}</h3></div><div class="small muted" style="margin-top:4px">Started ${V3.hm(a.start)} · <b>${V3.mins(V3.now()-a.start)}</b> elapsed · ${dn} of ${P.steps.length} steps done${crit?' · '+crit+' key steps left':''}</div></div><div class="row" style="gap:8px"><button class="btn" onclick="V3.callModal('${a.pid}','')">${V3.i('phone',14)} Call consultant</button><button class="btn pri" onclick="V3.protoEnd()">End and save record</button></div></div>
   ${V3.bar(dn/P.steps.length*100,'ok')}
   <div class="v3steps">${P.steps.map((st,i)=>{ const x = a.steps[i]; return `<button class="v3step ${x.t?'done':''} ${st[1]&&!x.t?'key':''}" onclick="V3.protoTick(${i})"><span class="v3step-c">${x.t?'✓':i+1}</span><span class="v3step-t">${hesc(st[0])}${st[1]?' <em>Key step</em>':''}</span><span class="v3step-ts">${x.t?V3.hm(x.t)+' · +'+V3.mins(x.t-a.start):'Tap when done'}</span></button>`; }).join('')}</div>
   <div class="pad" style="border-top:1px solid var(--line-2)"><label class="field"><span class="lbl">Notes during the event</span><textarea class="input" rows="2" oninput="S.v3.proto.active.note=this.value" placeholder="What you see, what you decide">${hesc(a.note||'')}</textarea></label></div></section>${note}`; };
V3.protoStart = type => { V3.modal('Start '+V3.PROTO[type].name.toLowerCase()+' checklist','The clock starts when you press start',`<label class="field"><span class="lbl">Patient</span>${V3.sel('pr_p',V3.ptOpts(V3.rmoPts()),'')}</label><div class="callout grey small">All steps get a time. Key steps are marked. You can call the consultant from inside the checklist.</div>`,`<button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="V3.protoGo('${type}')">Start now</button>`); };
V3.protoGo = type => { const s = v3(), pid = V3.val('pr_p'); if(s.proto.active){ toast('Finish the running checklist first'); return; } s.proto.active = {type,pid,start:V3.now(),steps:V3.PROTO[type].steps.map(()=>({t:null})),note:''}; V3.log(pid,'rmo','protocol',V3.PROTO[type].name+' checklist started',{by:V3.who.rmo}); closeModal(); go('#/duty/protocols'); render(); };
V3.protoTick = i => { const a = v3().proto.active, x = a.steps[i]; x.t = x.t ? null : V3.now(); if(x.t) V3.log(a.pid,'rmo','protocol',`${V3.PROTO[a.type].name}: ${V3.PROTO[a.type].steps[i][0]}`,{by:V3.who.rmo}); render(); };
V3.protoEnd = () => { const a = v3().proto.active, P = V3.PROTO[a.type], miss = P.steps.filter((x,i)=>x[1]&&!a.steps[i].t).length;
  V3.modal('End checklist','Saves the timed record to the timeline',`${miss?`<div class="callout amber small">${miss} key step${miss===1?'':'s'} not ticked. You can still end it. The record will show them as not done.</div>`:''}<label class="field"><span class="lbl">Outcome</span>${V3.sel('pe_o',['Settled on the ward','Transferred to the general hospital','Referred to the consultant for review','Serious event: record it next','Other'],'Settled on the ward')}</label>`,`<button class="btn" onclick="closeModal()">Keep going</button><button class="btn pri" onclick="V3.protoFinish()">End and save</button>`); };
V3.protoFinish = () => { const s = v3(), a = s.proto.active, out = V3.val('pe_o'); s.proto.done.unshift(Object.assign({}, a, {end:V3.now(), outcome:out})); s.proto.active = null; V3.log(a.pid,'rmo','protocol',`${V3.PROTO[a.type].name} checklist ended after ${V3.mins(V3.now()-a.start)}: ${a.steps.filter(x=>x.t).length} of ${a.steps.length} steps. ${out}.${a.note?' '+a.note:''}`,{by:V3.who.rmo}); closeModal(); render(); toast('Record saved to the timeline'); };

/* ---------- 6. Lab results ---------- */
V3.LABS = { 'Serum lithium':['mmol/L',0.6,1.2,null,1.5], 'Sodium':['mmol/L',135,145,125,160], 'Potassium':['mmol/L',3.5,5.1,2.8,6.0], 'Blood sugar (random)':['mg/dL',70,180,54,400], 'WBC':['×10⁹/L',4,11,2,null], 'Absolute neutrophil count':['×10⁹/L',1.5,7.5,1.0,null], 'Haemoglobin':['g/dL',12,17,7,null], 'ALT':['U/L',7,40,null,200], 'Creatinine':['mg/dL',0.6,1.3,null,4], 'Prolactin':['ng/mL',3,25,null,null], 'Valproate level':['µg/mL',50,100,null,150], 'TSH':['mIU/L',0.4,4.5,null,null], 'QTc (ECG)':['ms',300,450,null,500], 'CK':['U/L',30,200,null,1000] };
V3.labFlag = l => { const v = l.val; if((l.critLow!=null&&v<=l.critLow)||(l.critHigh!=null&&v>=l.critHigh)||(l.crit!=null&&v>=l.crit)) return 'crit'; return (v<l.lo||v>l.hi) ? 'abn' : 'ok'; };
V3.pLabs = () => { const s = v3(), ids = new Set(V3.rmoPts().map(p=>p.id)), L = s.labs.filter(l=>ids.has(l.pid)).sort((a,b)=>b.t-a.t), un = L.filter(l=>!l.rev&&V3.labFlag(l)!=='ok');
  const kp = V3.kpi('Abnormal, not reviewed',un.length,un.length?un.map(l=>V3.pn(l.pid).split(' ')[0]).slice(0,3).join(', '):'All reviewed',un.length?'warn':'ok') + V3.kpi('Critical',L.filter(l=>V3.labFlag(l)==='crit').length,'Needs a call','') + V3.kpi('Waiting for results',s.pending.length,'Ordered, not back yet','');
  const row = l => { const f = V3.labFlag(l); return `<tr><td class="small" style="white-space:nowrap">${V3.stamp(l.t)}</td><td><b>${hesc(V3.pn(l.pid))}</b></td><td>${hesc(l.test)}</td><td><b class="v3lab ${f}">${l.val}</b> <span class="tiny muted">${hesc(l.unit)}</span><div class="tiny muted">Normal ${l.lo} to ${l.hi}</div></td><td>${f==='crit'?chip('Critical','c-red'):f==='abn'?chip(l.val<l.lo?'Low':'High','c-amber'):chip('Normal','c-green')}</td><td class="small" style="max-width:260px">${l.rev?`${hesc(l.rev.finding)}<div class="tiny muted">${hesc(l.rev.action)} · ${hesc(l.rev.by)} ${V3.hm(l.rev.t)}</div>`:(f==='ok'?'<span class="muted">No review needed</span>':`<button class="btn sm pri" onclick="V3.labReview('${l.id}')">Review</button>`)}</td></tr>`; };
  return `<div class="v3kpis">${kp}</div><section class="card"><div class="hd"><div><h3>Lab reports and findings</h3><div class="small muted" style="margin-top:4px">Enter a result and it is flagged against the normal range. Abnormal results need a finding and an action.</div></div><button class="btn pri" onclick="V3.labAdd()">${V3.i('plus',14)} Add result</button></div><div class="scroll"><table class="t"><thead><tr><th>When</th><th>Patient</th><th>Test</th><th>Result</th><th></th><th>Finding and action</th></tr></thead><tbody>${L.map(row).join('')}</tbody></table></div></section>
  <section class="card"><div class="hd"><h3>Ordered, not back yet</h3></div>${s.pending.filter(x=>ids.has(x.pid)).map(x=>`<div class="li"><div class="grow"><strong>${hesc(V3.pn(x.pid))}</strong> · ${hesc(x.test)}<div class="tiny muted">${hesc(x.when)}</div></div>${chip(x.st,'c-grey')}</div>`).join('')||V3.empty('Nothing pending')}</section>`; };
V3.labAdd = () => V3.modal('Add lab result','Flags are set from the normal range',`<div class="grid2"><label class="field"><span class="lbl">Patient</span>${V3.sel('lb_p',V3.ptOpts(V3.rmoPts()),'')}</label><label class="field"><span class="lbl">Test</span>${V3.sel('lb_t',Object.keys(V3.LABS),'Serum lithium')}</label></div><div class="grid2"><label class="field"><span class="lbl">Result</span><input class="input" id="lb_v" type="number" step="any" inputmode="decimal"></label><label class="field"><span class="lbl">Sample taken</span>${V3.sel('lb_w',[[0,'Today'],[-1,'Yesterday']],0)}</label></div><div class="callout grey small" id="lb_n">Pick the test to see the normal range.</div>`,`<button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="V3.labSave()">Save result</button>`);
V3.labSave = () => { const t = V3.val('lb_t'), v = parseFloat(V3.val('lb_v')); if(isNaN(v)){ toast('Enter the result'); return; } const d = V3.LABS[t], pid = V3.val('lb_p'), l = {id:'b'+(++v3().tlN),pid,test:t,val:v,unit:d[0],lo:d[1],hi:d[2],critLow:d[3],critHigh:d[4],t:V3.now()+(+V3.val('lb_w'))*1440-(+V3.val('lb_w')?0:0)}; v3().labs.unshift(l); const f = V3.labFlag(l);
  V3.log(pid,'rmo','lab',`${t} ${v} ${d[0]} (normal ${d[1]} to ${d[2]})${f==='crit'?' · CRITICAL':f==='abn'?' · abnormal':''}`,{by:V3.who.rmo}); closeModal(); render();
  if(f==='crit'){ toast('Critical result. Call the consultant now.'); setTimeout(()=>V3.callModal(pid,''),250); } else toast(f==='abn'?'Saved. Abnormal: add your finding.':'Saved. In range.'); };
V3.labReview = id => { const l = v3().labs.find(x=>x.id===id); V3.modal('Review: '+hesc(l.test)+' · '+hesc(V3.pn(l.pid)),`${l.val} ${hesc(l.unit)} · normal ${l.lo} to ${l.hi}`,`${l.pid==='kabir'&&/WBC|neutrophil/i.test(l.test)?'<div class="callout amber small"><strong>On clozapine.</strong> Low white cells or neutrophils need the psychiatrist\'s decision today, before the evening dose.</div>':''}<label class="field"><span class="lbl">Your finding (required)</span><textarea class="input" id="lr_f" rows="2" placeholder="What it means for this patient"></textarea><div id="lr_e" class="small" style="color:var(--red);display:none">Write your finding</div></label><label class="field"><span class="lbl">Action</span>${V3.sel('lr_a',['No action','Repeat the test','Inform the psychiatrist','Call the consultant now','Refer to a specialist'],'Inform the psychiatrist')}</label>`,`<button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="V3.labReviewSave('${id}')">Save</button>`); };
V3.labReviewSave = id => { const l = v3().labs.find(x=>x.id===id), f = V3.val('lr_f').trim(); if(!f){ $('lr_e').style.display='block'; return; } const a = V3.val('lr_a'); l.rev = {by:V3.who.rmo,t:V3.now(),finding:f,action:a}; V3.log(l.pid,'rmo','lab',`Reviewed ${l.test} ${l.val}: ${f}. Action: ${a.toLowerCase()}.`,{by:V3.who.rmo}); closeModal(); render();
  if(a==='Call the consultant now') setTimeout(()=>V3.callModal(l.pid,''),250); else if(a==='Refer to a specialist') setTimeout(()=>V3.referModal(l.pid),250); else toast('Review saved'); };

/* ---------- 7. Transfers and referrals tracked till closed ---------- */
V3.STAGES = { 'General hospital':['Requested','Hospital accepted','Patient sent','Treated','Back or closed'], 'Visiting specialist':['Requested','Slot confirmed','Seen','Advice received','Closed'] };
V3.pRefer = () => { const s = v3(), L = s.transfers, open = L.filter(x=>!x.closed);
  const kp = V3.kpi('Open',open.length,open.filter(x=>x.kind==='General hospital').length+' to hospital, '+open.filter(x=>x.kind!=='General hospital').length+' specialists','') + V3.kpi('Urgent today',open.filter(x=>/Urgent|24/.test(x.urg)).length,'','warn') + V3.kpi('Closed this week',L.filter(x=>x.closed).length,'With an outcome','ok');
  const card = x => { const st = V3.STAGES[x.kind], p = V3.P(x.pid); return `<article class="v3ref ${x.closed?'closed':''}"><div class="row" style="justify-content:space-between;gap:8px;flex-wrap:nowrap"><div class="row" style="gap:10px;flex-wrap:nowrap">${av(p.ini,34,p.risk?'c-red':'c-blue')}<div><strong>${hesc(p.name)}</strong> ${chip(x.kind,x.kind==='General hospital'?'c-red':'c-violet')}<div class="tiny muted">${hesc(x.to)} · ${hesc(x.urg)} · asked by ${hesc(x.by)}</div></div></div>${x.closed?chip('Closed','c-green'):chip(st[x.stage],'c-blue')}</div>
    <div class="small" style="margin:8px 0">${hesc(x.why)}</div>
    <div class="v3stages">${st.map((l,i)=>`<div class="${i<x.stage||x.closed?'done':i===x.stage?'cur':''}"><i></i><span>${l}</span></div>`).join('')}</div>
    <div class="v3reflog">${x.log.slice().reverse().slice(0,3).map(e=>`<div class="tiny"><b>${V3.stamp(e[0])}</b> · ${hesc(e[1])}</div>`).join('')}${x.closed?`<div class="tiny"><b>${V3.stamp(x.closed.t)}</b> · Closed: ${hesc(x.closed.outcome)}</div>`:''}</div>
    ${x.closed?'':`<div class="row" style="gap:8px;margin-top:10px"><button class="btn sm pri" onclick="V3.referUpdate('${x.id}')">${x.stage<st.length-2?'Move to: '+st[x.stage+1]:'Close with outcome'}</button><button class="btn sm" onclick="V3.referNote('${x.id}')">Add update</button></div>`}</article>`; };
  return `<div class="v3kpis">${kp}</div><section class="card"><div class="hd"><div><h3>Transfers and referrals</h3><div class="small muted" style="margin-top:4px">Each one stays here until it is closed with an outcome.</div></div><button class="btn pri" onclick="V3.referModal('')">${V3.i('plus',14)} New referral</button></div><div class="pad v3refgrid">${open.concat(L.filter(x=>x.closed)).map(card).join('')}</div></section>`; };
V3.referModal = pid => V3.modal('New transfer or referral','Tracked until it is closed',`<div class="grid2"><label class="field"><span class="lbl">Patient</span>${V3.sel('rf_p',V3.ptOpts(V3.rmoPts()),pid||'')}</label><label class="field"><span class="lbl">Kind</span>${V3.sel('rf_k',['General hospital','Visiting specialist'],'General hospital')}</label></div><label class="field"><span class="lbl">Where or which specialist</span><input class="input" id="rf_t" placeholder="e.g. City General Hospital, medicine ward · Cardiologist"></label><label class="field"><span class="lbl">Reason (required)</span><textarea class="input" id="rf_w" rows="2"></textarea></label><div class="grid2"><label class="field"><span class="lbl">How urgent</span>${V3.sel('rf_u',['Routine','Within 24 hours','Urgent today','Emergency now'],'Within 24 hours')}</label><label class="field"><span class="lbl">Asked by</span>${V3.sel('rf_b',['Dr. Sameer Khan (RMO)','Dr. Aanya Sharma','Dr. Kunal Sethi','Dr. Rohan Mehta','Dr. Nandini Rao'],'Dr. Sameer Khan (RMO)')}</label></div><div class="callout grey small">For a hospital transfer, a nurse escort, consent from the nominated representative, and the case summary go with the patient.</div>`,`<button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="V3.referSave()">Start tracking</button>`);
V3.referSave = () => { const w = V3.val('rf_w').trim(), to = V3.val('rf_t').trim(); if(!w || !to){ toast('Say where, and why'); return; } const s = v3(), pid = V3.val('rf_p'); const x = {id:'x'+(++s.tlN),pid,kind:V3.val('rf_k'),to,why:w,by:V3.val('rf_b').replace(' (RMO)',''),urg:V3.val('rf_u'),stage:0,log:[[V3.now(),'Requested by '+V3.val('rf_b'),V3.who.rmo]],closed:null}; s.transfers.unshift(x); V3.log(pid,'rmo','transfer',`${x.kind} requested: ${to}. ${w}. ${x.urg}.`,{by:V3.who.rmo}); closeModal(); render(); toast('Tracking started'); };
V3.referUpdate = id => { const s = v3(), x = s.transfers.find(y=>y.id===id), st = V3.STAGES[x.kind], last = x.stage >= st.length-2;
  V3.modal(last?'Close referral':'Update: '+hesc(st[x.stage+1]), hesc(V3.pn(x.pid))+' · '+hesc(x.to), last ? `<label class="field"><span class="lbl">Outcome (required)</span><textarea class="input" id="ru_n" rows="3" placeholder="What happened and what changes on the ward"></textarea></label>` : `<label class="field"><span class="lbl">Note (required)</span><input class="input" id="ru_n" placeholder="e.g. Accepted by Dr. Rao, bed ready at 3 pm"></label>`, `<button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="V3.referUpdateSave('${id}')">${last?'Close':'Save'}</button>`); };
V3.referUpdateSave = id => { const s = v3(), x = s.transfers.find(y=>y.id===id), n = V3.val('ru_n').trim(), st = V3.STAGES[x.kind]; if(!n){ toast('Add a note'); return; }
  if(x.stage >= st.length-2){ x.stage = st.length-1; x.closed = {t:V3.now(), outcome:n, by:V3.who.rmo}; V3.log(x.pid,'rmo','transfer',`${x.kind} closed: ${n}`,{by:V3.who.rmo}); }
  else { x.stage++; x.log.push([V3.now(), st[x.stage]+': '+n, V3.who.rmo]); V3.log(x.pid,'rmo','transfer',`${x.kind}: ${st[x.stage].toLowerCase()}. ${n}`,{by:V3.who.rmo}); } closeModal(); render(); toast('Updated'); };
V3.referNote = id => { const x = v3().transfers.find(y=>y.id===id); V3.modal('Add an update',hesc(V3.pn(x.pid)),`<label class="field"><span class="lbl">Update</span><input class="input" id="ru_n" placeholder="e.g. Spoke to the hospital, waiting for a bed"></label>`,`<button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="(()=>{const n=V3.val('ru_n').trim();if(!n)return;S.v3.transfers.find(y=>y.id==='${id}').log.push([V3.now(),n,V3.who.rmo]);V3.log('${x.pid}','rmo','transfer',n);closeModal();render();})()">Add</button>`); };

/* ---------- 8. Serious events ---------- */
V3.SERIOUS = {
  Absconding:{docs:['Time last seen, and who saw the patient','Search done: ward, garden, gates','Security and gate log checked','Clothes worn and belongings noted','Time found, or still missing','Risk review before the patient returns to the ward'],inform:[['lead','Floor lead','at once',0],['consultant','Treating consultant','at once',0],['ms','Medical superintendent','within 1 hour',60],['family','Family or nominated representative','within 1 hour',60]],police:'Inform the police if the patient is not found within 1 hour, is under Section 89 or 90, or is high risk (hospital policy).'},
  LAMA:{docs:['Capacity assessment today','Counselled by a doctor, with family present','Risks explained and the LAMA form signed','Medicines and follow-up plan handed over','Discharge summary started'],inform:[['lead','Floor lead (approves)','before the patient leaves',0],['consultant','Treating consultant','before the patient leaves',0],['ms','Medical superintendent','same day',240]],police:'Usually not needed. If the patient is held under Section 89 or 90, do not let them leave: call the consultant and legal first.'},
  Death:{docs:['Time of death and who confirmed it','Death certificate started by the doctor','Cause known, or under review','Body kept and handed over per policy','Belongings listed and handed to the family'],inform:[['consultant','Treating consultant','at once',0],['lead','Floor lead','at once',0],['ms','Medical superintendent','at once',0],['family','Family or nominated representative','at once',0],['board','Mental Health Review Board','per statutory timeline, confirm with legal',1440]],police:'Required for any unnatural, sudden or unexplained death. It is then a medico-legal case.'},
  MLC:{docs:['Reason it is a medico-legal case','Injuries described and photographed per policy','Who brought or reported the patient','MLC register number','Evidence kept: clothing, containers','Consent recorded, or why it was not possible'],inform:[['consultant','Treating consultant','at once',0],['lead','Floor lead','at once',0],['ms','Medical superintendent','within 1 hour',60],['family','Family or nominated representative','within 2 hours',120]],police:'Required. Inform the nearest police station and record the time and the officer\'s name.'}
};
V3.evDone = e => { const D = V3.SERIOUS[e.type]; if(!D) return true; return D.inform.every(i => e.inform && e.inform[i[0]]) && (e.police && e.police.length) && (e.docsDone===undefined || D.docs.every((d,i)=>e.docsDone&&e.docsDone[i]) || e.closed); };
V3.pEvents = () => { const s = v3(), L = s.serious, open = L.filter(e=>!e.closed);
  const kp = V3.kpi('Open',open.length,open.length?open.map(e=>e.type).join(', '):'None open',open.length?'crit':'ok') + V3.kpi('Calls still to make',open.reduce((n,e)=>n+V3.SERIOUS[e.type].inform.filter(i=>!(e.inform||{})[i[0]]).length,0),'Who must be told','') + V3.kpi('This month',L.length,'Recorded','');
  const card = e => { const D = V3.SERIOUS[e.type] || {docs:[],inform:[],police:''}, p = V3.P(e.pid), inf = e.inform||{};
    return `<article class="v3ev ${e.closed?'closed':''}"><div class="row" style="justify-content:space-between;gap:8px;flex-wrap:nowrap"><div class="row" style="gap:10px;flex-wrap:nowrap">${av(p.ini,34,'c-red')}<div><strong>${hesc(p.name)}</strong> ${chip(e.type,'c-red')}<div class="tiny muted">${V3.stamp(e.t)} · ${hesc(e.where)} · by ${hesc(e.by)}</div></div></div>${e.closed?chip('Closed','c-green'):chip('Open','c-red')}</div>
    <div class="small" style="margin:8px 0">${hesc(e.narr)}</div>
    <div class="lbl" style="margin-bottom:6px">Who must be told</div>
    <div class="v3inf">${D.inform.map(i=>{ const t = inf[i[0]], due = e.t + i[3], late = !t && V3.now() > due; return `<div class="${t?'ok':late?'late':''}"><span>${hesc(i[1])}<em>${hesc(i[2])}</em></span>${t?`<b>Told ${V3.hm(t)}</b>`:`<button class="btn sm ${late?'pri':''}" onclick="V3.evInform('${e.id}','${i[0]}')">Mark told</button>`}</div>`; }).join('')}
      <div class="${e.police?'ok':''}"><span>Police<em>${hesc(D.police)}</em></span>${e.police?`<b>${hesc(e.police)}</b>`:(e.closed?'':`<button class="btn sm" onclick="V3.evPolice('${e.id}')">Record decision</button>`)}</div></div>
    ${D.docs.length&&!e.closed?`<div class="lbl" style="margin:12px 0 6px">Documentation</div><div class="v3checks">${D.docs.map((d,i)=>`<label class="check small"><input type="checkbox" style="accent-color:var(--blue)" ${(e.docsDone||{})[i]?'checked':''} onchange="(S.v3.serious.find(x=>x.id==='${e.id}').docsDone=S.v3.serious.find(x=>x.id==='${e.id}').docsDone||{})[${i}]=this.checked"><span>${hesc(d)}</span></label>`).join('')}</div>`:''}
    ${e.closed?'':`<div class="row" style="gap:8px;margin-top:12px"><button class="btn sm" onclick="V3.callModal('${e.pid}','')">${V3.i('phone',14)} Call consultant</button><button class="btn sm pri" onclick="V3.evClose('${e.id}')">Close event</button></div>`}</article>`; };
  return `<div class="v3kpis">${kp}</div><div class="callout amber small">Who must be told, and the times, are hospital policy shown as a starting point. Have compliance and legal confirm the police and Mental Health Review Board rules before real use.</div><section class="card"><div class="hd"><div><h3>Serious events</h3><div class="small muted" style="margin-top:4px">Absconding, LAMA, death and medico-legal cases</div></div><button class="btn pri" onclick="V3.evNew()">${V3.i('plus',14)} Record event</button></div><div class="pad v3refgrid">${open.concat(L.filter(e=>e.closed)).map(card).join('')||V3.empty('No events')}</div></section>`; };
V3.evNew = () => V3.modal('Record a serious event','Starts the checklist of who to tell',`<div class="grid2"><label class="field"><span class="lbl">Patient</span>${V3.sel('ev_p',V3.ptOpts(V3.rmoPts()),'')}</label><label class="field"><span class="lbl">Type</span>${V3.sel('ev_t',Object.keys(V3.SERIOUS),'Absconding')}</label></div><div class="grid2"><label class="field"><span class="lbl">Where</span><input class="input" id="ev_w" placeholder="e.g. Garden gate"></label><label class="field"><span class="lbl">When</span>${V3.sel('ev_a',[[0,'Just now'],[15,'15 minutes ago'],[30,'30 minutes ago'],[60,'1 hour ago']],0)}</label></div><label class="field"><span class="lbl">What happened (required)</span><textarea class="input" id="ev_n" rows="3"></textarea><div id="ev_e" class="small" style="color:var(--red);display:none">Describe what happened</div></label>`,`<button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="V3.evSave()">Record and start checklist</button>`);
V3.evSave = () => { const n = V3.val('ev_n').trim(); if(!n){ $('ev_e').style.display='block'; return; } const s = v3(), pid = V3.val('ev_p'), type = V3.val('ev_t'), t = V3.now()-(+V3.val('ev_a')); s.serious.unshift({id:'se'+(++s.tlN),pid,type,t,where:V3.val('ev_w')||'On the ward',by:V3.who.rmo,narr:n,inform:{},police:'',docsDone:{},closed:false}); V3.log(pid,'rmo','event',`Serious event: ${type}. ${n}`,{by:V3.who.rmo}); closeModal(); render(); toast('Recorded. Start with the calls at the top.'); };
V3.evInform = (id, k) => { const e = v3().serious.find(x=>x.id===id); (e.inform = e.inform||{})[k] = V3.now(); V3.log(e.pid,'rmo','event',`${e.type}: told ${V3.SERIOUS[e.type].inform.find(i=>i[0]===k)[1].toLowerCase()}`,{by:V3.who.rmo}); render(); toast('Time recorded'); };
V3.evPolice = id => V3.modal('Police decision',hesc(V3.SERIOUS[v3().serious.find(x=>x.id===id).type].police),`<label class="field"><span class="lbl">Decision</span>${V3.sel('pl_d',['Informed','Not needed'],'Informed')}</label><label class="field"><span class="lbl">Station and officer, or the reason not needed (required)</span><input class="input" id="pl_n" placeholder="e.g. Indiranagar station, SI Ramesh, 9:40 pm"></label>`,`<button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="V3.evPoliceSave('${id}')">Save</button>`);
V3.evPoliceSave = id => { const n = V3.val('pl_n').trim(); if(!n){ toast('Add the station or the reason'); return; } const e = v3().serious.find(x=>x.id===id); e.police = (V3.val('pl_d')==='Informed'?'Informed ':'Not needed: ')+n+' · '+V3.clockStr(); V3.log(e.pid,'rmo','event',`${e.type}: police ${V3.val('pl_d').toLowerCase()}. ${n}`,{by:V3.who.rmo}); closeModal(); render(); };
V3.evClose = id => { const e = v3().serious.find(x=>x.id===id), D = V3.SERIOUS[e.type], miss = [];
  D.inform.forEach(i=>{ if(!(e.inform||{})[i[0]]) miss.push('Tell: '+i[1]); }); if(!e.police) miss.push('Record the police decision'); D.docs.forEach((d,i)=>{ if(!(e.docsDone||{})[i]) miss.push('Document: '+d); });
  if(miss.length) return V3.modal('Cannot close yet','Finish these first',`<div class="callout amber small"><ul style="margin:0;padding-left:18px">${miss.map(m=>`<li>${hesc(m)}</li>`).join('')}</ul></div>`,`<button class="btn pri" onclick="closeModal()">Back</button>`);
  e.closed = true; V3.log(e.pid,'rmo','event',`${e.type} event closed`,{by:V3.who.rmo}); render(); toast('Event closed'); };

/* ---------- 9. Physical exam rule ---------- */
V3.examInterval = p => { const r = v3().exam.rules; if(p.risk) return {h:r.high, why:'High risk'}; if((p.day||0) <= r.newDays) return {h:r.newAdm, why:'New admission, first '+r.newDays+' days'}; return {h:r.other, why:'Everyone else'}; };
V3.examRows = () => { const s = v3(); return V3.rmoPts().map(p => { const iv = V3.examInterval(p), last = s.exam.last[p.id], due = last==null ? V3.now() - 1 : last + iv.h*60, over = V3.now() - due, st = last==null || over > 0 ? 'over' : -over <= 240 ? 'soon' : 'ok'; return {p, iv, last, due, st}; }).sort((a,b)=>({over:0,soon:1,ok:2}[a.st]-{over:0,soon:1,ok:2}[b.st])||a.due-b.due); };
V3.pExam = () => { const s = v3(), r = s.exam.rules, rows = V3.examRows(), canEdit = S.role==='lead';
  const kp = V3.kpi('Overdue',rows.filter(x=>x.st==='over').length,'Examine today',rows.some(x=>x.st==='over')?'crit':'ok') + V3.kpi('Due in 4 hours',rows.filter(x=>x.st==='soon').length,'','') + V3.kpi('Up to date',rows.filter(x=>x.st==='ok').length,'of '+rows.length+' patients','ok');
  const rule = canEdit ? `<div class="v3rule"><label><span>High-risk patients every</span>${V3.sel('ex_h',[12,24,48],r.high)}<span>hours</span></label><label><span>New admissions every</span>${V3.sel('ex_n',[12,24,48],r.newAdm)}<span>hours, for the first</span>${V3.sel('ex_d',[1,2,3,5,7],r.newDays)}<span>days</span></label><label><span>Everyone else every</span>${V3.sel('ex_o',[[72,'3 days'],[168,'7 days'],[336,'14 days']],r.other)}</label><button class="btn pri" onclick="V3.examSave()">Save rule</button></div>` : `<div class="v3rule ro"><div><b>High-risk patients:</b> every ${r.high} hours</div><div><b>New admissions:</b> every ${r.newAdm} hours for the first ${r.newDays} days</div><div><b>Everyone else:</b> every ${r.other/24} days</div><div class="tiny muted" style="flex-basis:100%">The floor lead sets this rule. The RMO does the exams.</div></div>`;
  return `<div class="v3kpis">${kp}</div><section class="card"><div class="hd"><div><h3>Physical exam rule</h3><div class="small muted" style="margin-top:4px">Applies to every patient. The due time moves forward each time an exam is saved.</div></div></div><div class="pad">${rule}</div></section>
  <section class="card"><div class="hd"><h3>Who is due</h3></div><div class="scroll"><table class="t"><thead><tr><th>Patient</th><th>Rule</th><th>Last exam</th><th>Due</th><th></th><th></th></tr></thead><tbody>${rows.map(({p,iv,last,due,st})=>`<tr><td><b>${hesc(p.name)}</b><div class="tiny muted">${hesc(p.room.replace('Room ','R-'))} · Day ${p.day||0}</div></td><td class="small">${hesc(iv.why)}<div class="tiny muted">Every ${iv.h>=48?iv.h/24+' days':iv.h+' hours'}</div></td><td class="small">${last==null?'<span class="muted">Not examined</span>':V3.stamp(last)}</td><td class="small">${last==null?'Now':V3.stamp(due)}</td><td>${st==='over'?chip('Overdue','c-red'):st==='soon'?chip('Soon','c-amber'):chip('Up to date','c-green')}</td><td style="text-align:right">${S.role==='rmo'?`<button class="btn sm ${st==='over'?'pri':''}" onclick="peModal('${p.id}')">Examine</button>`:''}</td></tr>`).join('')}</tbody></table></div></section>`; };
V3.examSave = () => { v3().exam.rules = {high:+V3.val('ex_h'), newAdm:+V3.val('ex_n'), newDays:+V3.val('ex_d'), other:+V3.val('ex_o')}; render(); toast('Rule saved. Due times are recalculated.'); };
(() => { const _ps = peSave; peSave = pid => { _ps(pid); if(S.pe[pid]){ v3().exam.last[pid] = V3.now(); V3.log(pid,'rmo','exam','Physical exam done: '+(S.pe[pid].stable||'')+(S.pe[pid].note?'. '+S.pe[pid].note:''),{by:V3.who.rmo}); } }; })();

/* ---------- duty strip on the RMO dashboard ---------- */
V3.dutyHome = () => { if(S.role!=='rmo') return ''; const s = v3(), B = V3.dutyBadges(), ids = new Set(V3.rmoPts().map(p=>p.id));
  const open = s.alerts.filter(a=>!a.closed&&ids.has(a.pid)).sort((a,b)=>({critical:0,urgent:1,routine:2}[a.sev]-{critical:0,urgent:1,routine:2}[b.sev])||a.t-b.t).slice(0,2);
  const T = [['alerts','Alerts',B.alerts,'crit','alert'],['orders','Orders to sign',B.orders,'amber','doc'],['protocols','Emergency',B.protocols,'crit','pulse'],['labs','Lab results',B.labs,'amber','flask'],['referrals','Referrals',B.referrals,'blue','truck'],['events','Serious events',B.events,'crit','shield'],['exam','Exam rule',B.exam,'amber','heart']];
  return `${V3.protoBanner()}<section class="card"><div class="hd"><div><h3>Duty desk</h3><div class="small muted" style="margin-top:4px">${V3.isNight()?'Night duty: first call for every ward.':'Everything that reaches the RMO outside the task list.'}</div></div><button class="btn sm pri" onclick="go('#/duty/night')">Open duty desk</button></div><div class="v3tiles">${T.map(t=>`<button class="v3tile" onclick="go('#/duty/${t[0]}')"><span class="v3tile-i">${V3.i(t[4],18)}</span><span class="v3tile-t"><b>${t[1]}</b></span>${t[2]?`<span class="n ${t[3]}">${t[2]}</span>`:''}</button>`).join('')}</div>${open.length?`<div class="v3al-list" style="padding-top:0">${open.map(a=>V3.alertCard(a)).join('')}</div>`:''}</section>`; };
V3.deny = r => { const k = r[0]; if(k==='duty' && r[1]==='exam' && S.role==='lead') return false; return !!V3.ROUTES[k] && !V3.ROUTES[k].includes(S.role); };

/* ======================================================================
   ACROSS ALL ROLES · Escalation chain · Patient timeline · Permissions
   ====================================================================== */

/* ---------- permissions ---------- */
V3.PERM = [
  ['record','Record doses, vitals, charts and movement',{nurse:'Y',rmo:'Y',psychiatrist:'N',lead:'N'}],
  ['alert','Raise an alert or report an event',{nurse:'Y',rmo:'Y',psychiatrist:'Y',lead:'Y'}],
  ['ack','Acknowledge and respond to alerts',{nurse:'N',rmo:'Y',psychiatrist:'Y',lead:'Y'}],
  ['order','Write routine orders or change medicines',{nurse:'N',rmo:'C',psychiatrist:'Y',lead:'Y'}],
  ['stat','Write STAT, SOS or phone orders',{nurse:'N',rmo:'C',psychiatrist:'Y',lead:'Y'}],
  ['countersign','Countersign RMO orders',{nurse:'N',rmo:'N',psychiatrist:'Y',lead:'Y'}],
  ['exam','Do a physical exam',{nurse:'N',rmo:'Y',psychiatrist:'Y',lead:'N'}],
  ['closeEvent','Close a serious event',{nurse:'N',rmo:'Y',psychiatrist:'N',lead:'Y'}],
  ['approve','Approve leave, LAMA, ECT, early discharge, transfers',{nurse:'N',rmo:'N',psychiatrist:'N',lead:'Y'}],
  ['alloc','Assign teams, cover and beds',{nurse:'N',rmo:'N',psychiatrist:'N',lead:'Y'}],
  ['rules','Change escalation times and the exam rule',{nurse:'N',rmo:'N',psychiatrist:'N',lead:'Y'}]
];
V3.ROLES4 = [['nurse','Nurse'],['rmo','RMO'],['psychiatrist','Psychiatrist'],['lead','Floor lead']];
V3.can = (k, role) => { const r = V3.PERM.find(x=>x[0]===k); return r ? (r[2][role||S.role]||'N') : 'Y'; };
V3.guard = (k, label) => { const c = V3.can(k); if(c==='Y' || c==='C') return true;
  const row = V3.PERM.find(x=>x[0]===k), who = V3.ROLES4.filter(r=>row[2][r[0]]==='Y').map(r=>r[1].toLowerCase()).join(' or ');
  (v3().denied = v3().denied||[]).unshift({t:V3.now(), role:S.role, k, label:label||row[1]}); toast((V3.roleName[S.role]||'This role')+' cannot do this. Only the '+who+'.'); return false; };
V3.installGuards = () => {
  const W = (obj, name, key, label) => { const f = obj[name]; obj[name] = function(){ return V3.guard(key,label) ? f.apply(this, arguments) : undefined; }; };
  W(V3,'apDecide','approve'); W(V3,'apDo','approve'); W(V3,'examSave','rules'); W(V3,'escSave','rules');
  W(V3,'allocDo','alloc'); W(V3,'allocQuick','alloc'); W(V3,'coverDo','alloc'); W(V3,'leaveDo','alloc'); W(V3,'assignBedDo','alloc'); W(V3,'bedReserve','alloc');
  W(V3,'countersign','countersign'); W(V3,'orderSave','stat'); W(V3,'evClose','closeEvent');
  /* routine medicine changes by the RMO also need a countersign */
  const needCs = (pid, text) => { if(S.role!=='rmo') return; const s = v3(); s.orders.unshift({id:'o'+(++s.tlN),pid,type:'Medicine change',text,by:V3.who.rmo,via:'',t:V3.now(),cs:null,given:null}); V3.log(pid,'rmo','order',text+'. Awaiting countersign.',{by:V3.who.rmo}); };
  const _stop = stopMed; stopMed = (pid,i,slot,si) => { if(!V3.guard('order','stop a medicine')) return; const m = NMEDS[pid][slot][i]; _stop(pid,i,slot,si); needCs(pid,'Stopped '+m); };
  const _res = resumeMed; resumeMed = (pid,i,slot,si) => { if(!V3.guard('order','resume a medicine')) return; const m = NMEDS[pid][slot][i]; _res(pid,i,slot,si); needCs(pid,'Resumed '+m); };
  const _add = addMedSave; addMedSave = () => { if(!V3.guard('order','add a medicine')) return; const pid = $('amP') && $('amP').value, nm = $('amN') && $('amN').value.trim(); _add(); if(pid && nm) needCs(pid,'Added '+nm); };
};
V3.permPage = () => { $('title').textContent = 'Roles and permissions'; const s = v3(), me = S.role;
  const cell = (c, role) => `<td class="pm ${role===me?'you':''}">${c==='Y'?'<span class="pm-y">Yes</span>':c==='C'?'<span class="pm-c">Needs countersign</span>':'<span class="pm-n">No</span>'}</td>`;
  const rows = V3.PERM.map(([k,l,m]) => `<tr><td>${hesc(l)}</td>${V3.ROLES4.map(r=>cell(m[r[0]],r[0])).join('')}<td style="text-align:right"><button class="btn sm" onclick="V3.tryIt('${k}')">Try as ${hesc(V3.roleName[me]||me)}</button></td></tr>`).join('');
  const den = (s.denied||[]).slice(0,6);
  return V3.head('Roles and permissions','Who can do what. Blocks are enforced in the screens, not only shown here.','') +
  `<div class="v3rules3"><div><b>Nurses record, they do not order.</b><span>No medicine, dose or schedule can be changed from the nurse screens. They can query an order, which goes to the RMO.</span></div><div><b>RMO orders need a countersign.</b><span>Stat, SOS, phone and medicine changes work at once. The treating consultant signs by next morning.</span></div><div><b>Only the floor lead approves.</b><span>Home leave, LAMA, ECT, early discharge and transfers wait for one decision-maker.</span></div></div>
  <section class="card"><div class="hd"><div><h3>What each role can do</h3><div class="small muted" style="margin-top:4px">You are viewing as <b>${hesc(V3.roleName[me]||me)}</b>. Your column is shaded.</div></div></div><div class="scroll"><table class="t pmt"><thead><tr><th>Action</th>${V3.ROLES4.map(r=>`<th class="pm ${r[0]===me?'you':''}">${r[1]}</th>`).join('')}<th></th></tr></thead><tbody>${rows}</tbody></table></div></section>
  <section class="card"><div class="hd"><div><h3>Blocked attempts</h3><div class="small muted" style="margin-top:4px">Every refused action is kept, with who tried and when.</div></div></div>${den.map(d=>`<div class="li"><div class="grow small"><b>${hesc(V3.roleName[d.role]||d.role)}</b> tried to ${hesc(d.label.toLowerCase())}</div><span class="tiny muted">${V3.stamp(d.t)}</span></div>`).join('')||V3.empty('None yet','Use the Try buttons above to see the block.')}</section>`; };
V3.tryIt = k => { const c = V3.can(k), row = V3.PERM.find(x=>x[0]===k); if(c==='Y') toast('Allowed for '+(V3.roleName[S.role]||S.role)); else if(c==='C') toast('Allowed. It will wait for a countersign.'); else V3.guard(k); if(c==='N') render(); };

/* ---------- escalation chain ---------- */
V3.CHAIN = [
  {k:'nurse',  n:'Nurse',        d:'Raises the alert with the reading or the finding. Stays with the patient.', key:null},
  {k:'rmo',    n:'RMO',          d:'Acknowledges, goes to the bedside, records what was found.',                key:'rmo'},
  {k:'psychiatrist', n:'Treating psychiatrist', d:'Takes over if the RMO has not acknowledged in time.',          key:'psy'},
  {k:'lead',   n:'Floor lead',   d:'Last step. Makes sure someone is at the bedside.',                          key:'lead'}
];
V3.escPage = () => { $('title').textContent = 'Escalation chain'; const s = v3(), u = s.ui, sev = u.escSev || 'urgent', R = s.escRules, canEdit = S.role==='lead', now = V3.now();
  const sevT = {critical:['Critical','c-red'],urgent:['Urgent','c-amber'],routine:['Routine','c-grey']};
  const chain = `<div class="v3chain">${V3.CHAIN.map((c,i)=>`<div class="v3node"><div class="v3node-h">${V3.rd(c.k)}<b>${c.n}</b></div><div class="small muted">${c.d}</div>${c.key?`<div class="v3node-t"><span class="tiny muted">${i===1?'Acknowledges within':'If no answer after another'}</span><b>${R[sev][c.key]} min</b></div>`:`<div class="v3node-t"><span class="tiny muted">Raises</span><b>At once</b></div>`}</div>${i<3?`<div class="v3arrow" aria-hidden="true">→</div>`:''}`).join('')}</div>`;
  const tbl = `<div class="scroll"><table class="t"><thead><tr><th>Severity</th><th>RMO acknowledges within</th><th>Then psychiatrist within</th><th>Then floor lead within</th><th>Reaches the bedside within</th></tr></thead><tbody>${['critical','urgent','routine'].map(k=>`<tr><td>${chip(sevT[k][0],sevT[k][1])}</td>${['rmo','psy','lead','see'].map(f=>`<td>${canEdit?`<input class="input v3mi" type="number" min="1" max="240" id="es_${k}_${f}" value="${R[k][f]}"> <span class="tiny muted">min</span>`:`<b>${R[k][f]} min</b>`}</td>`).join('')}</tr>`).join('')}</tbody></table></div>${canEdit?`<div class="pad"><button class="btn pri" onclick="V3.escSave()">Save response times</button><span class="tiny muted" style="margin-left:10px">Applies to new alerts and to alerts already open.</span></div>`:`<div class="pad tiny muted">The floor lead sets these times.</div>`}`;
  const open = s.alerts.filter(a=>!a.closed), track = a => { const r = V3.sla(a.sev), h = V3.holder(a);
    const stage = (role, label, start, win) => { const e = a.esc.find(x=>x.to===role), isNurse = role==='nurse', acked = a.ack && a.ack.role===role, reached = isNurse || role==='rmo' || !!e, over = reached && !acked && !a.closed && now > start + win;
      let st = acked ? 'done' : (isNurse ? 'done' : (reached ? (h===role?'cur':'past') : 'wait'));
      const when = isNurse ? 'Raised '+V3.hm(a.t) : acked ? 'Acknowledged '+V3.hm(a.ack.t) : (reached ? (h===role ? (now > start+win ? 'Overdue ' : 'Due ')+V3.hm(start+win) : 'No answer by '+V3.hm(start+win)) : 'Would start '+V3.hm(start));
      return `<div class="v3trk ${st} ${over?'over':''}"><i></i><b>${label}</b><span>${when}</span></div>`; };
    return `<article class="v3al ${a.closed?'closed':a.sev}"><div class="v3al-h"><div class="row" style="gap:8px">${chip(sevT[a.sev][0],sevT[a.sev][1])}<strong>${hesc(V3.pn(a.pid))}</strong><span class="tiny muted">${hesc(a.src)}</span></div>${a.seen?`<span class="v3st ok">Saw patient ${V3.hm(a.seen.t)}</span>`:`<span class="v3st ${a.ack?'':'crit'}">${a.ack?'Not at the bedside yet':'Waiting'}</span>`}</div><div class="v3al-t">${hesc(a.title)}</div><div class="v3trks">${stage('nurse','Nurse',a.t,0)}${stage('rmo','RMO',a.t,r.rmo)}${stage('psychiatrist','Psychiatrist',a.t+r.rmo,r.psy)}${stage('lead','Floor lead',a.t+r.rmo+r.psy,r.lead)}</div>${V3.canAck(a)?`<div class="row" style="margin-top:10px"><button class="btn sm pri" onclick="V3.ackAlert('${a.id}')">Acknowledge</button></div>`:''}</article>`; };
  const acked = s.alerts.filter(a=>a.ack), within = acked.filter(a=>a.ack.t - a.t <= V3.sla(a.sev).rmo).length, med = acked.length ? acked.map(a=>a.ack.t-a.t).sort((x,y)=>x-y)[Math.floor(acked.length/2)] : 0;
  const kp = V3.kpi('Open alerts',open.length,open.filter(a=>!a.ack).length+' not acknowledged',open.some(a=>!a.ack)?'warn':'ok') + V3.kpi('Answered in time',acked.length?Math.round(within/acked.length*100)+'%':'–','by the RMO, all alerts',within/(acked.length||1)<.8?'warn':'ok') + V3.kpi('Median time to acknowledge',med+' min','','') + V3.kpi('Escalated',s.alerts.filter(a=>a.esc.length).length,'went past the RMO',s.alerts.some(a=>a.esc.length&&!a.closed)?'warn':'');
  return V3.head('Escalation chain','Nurse, RMO, treating psychiatrist, floor lead. Every step has a time to respond.','') + `<div class="v3kpis">${kp}</div>
  <section class="card"><div class="hd"><div><h3>How an alert travels</h3><div class="small muted" style="margin-top:4px">If nobody acknowledges, it moves up on its own. Times are counted from when the nurse raised it.</div></div><div class="seg" style="min-width:270px">${['critical','urgent','routine'].map(k=>`<button class="${sev===k?'on':''}" onclick="S.v3.ui.escSev='${k}';render()">${sevT[k][0]}</button>`).join('')}</div></div><div class="pad">${chain}</div></section>
  <section class="card"><div class="hd"><h3>Response times</h3></div>${tbl}</section>
  <section class="card"><div class="hd"><div><h3>Where each open alert is now</h3><div class="small muted" style="margin-top:4px">Use the prototype clock in the top bar to watch an alert move up the chain.</div></div></div><div class="v3al-list">${open.map(track).join('')||V3.empty('No open alerts')}</div></section>`; };
V3.escSave = () => { const R = v3().escRules; for(const k of ['critical','urgent','routine']) for(const f of ['rmo','psy','lead','see']){ const v = parseInt(V3.val('es_'+k+'_'+f),10); if(!(v>0)){ toast('Enter minutes for every box'); return; } R[k][f] = v; } V3.tick(); render(); toast('Response times saved'); };

/* ---------- one timeline per patient ---------- */
V3.TLG = { all:['Everything',null], orders:['Orders',['order','approval','transfer']], doses:['Doses',['dose']], vitals:['Vitals and results',['vital','chart','exam','lab']], alerts:['Alerts and calls',['alert','ack','protocol','event','call']], notes:['Notes and movement',['note','handover','family','move','admit']] };
V3.tlPids = () => S.role==='nurse' ? V3.scope() : S.role==='rmo' ? V3.rmoPts() : allPts();
V3.tlPage = pid => { const list = V3.tlPids(); pid = (pid && list.some(p=>p.id===pid)) ? pid : (list.some(p=>p.id==='neel') ? 'neel' : list[0].id); $('title').textContent = 'Patient timeline'; const s = v3(), u = s.ui, p = V3.P(pid);
  u.tlG = u.tlG || 'all'; u.tlR = u.tlR || 'all'; let ev = V3.timeline(pid);
  const g = V3.TLG[u.tlG][1]; if(g) ev = ev.filter(e=>g.includes(e.kind)); if(u.tlR!=='all') ev = ev.filter(e=>e.role===u.tlR);
  const days = {}; ev.forEach(e => { const d = V3.day(e.t); (days[d] = days[d]||[]).push(e); });
  const body = Object.keys(days).map(Number).sort((a,b)=>b-a).map(d => `<div class="v3tl-d"><span>${V3.dayLabel(d)}</span></div>${days[d].map(e => { const K = V3.KIND[e.kind]||['Note','c-grey']; return `<div class="v3tl-i"><div class="v3tl-t">${V3.hm(e.t-d*1440)}</div><div class="v3tl-dot r-${e.role}"></div><div class="v3tl-b"><div class="row" style="gap:6px">${chip(K[0],K[1])}<span class="tiny muted">${hesc(V3.roleName[e.role]||'')} · ${hesc(e.by||'')}</span></div><div class="small">${hesc(e.text)}</div></div></div>`; }).join('')}`).join('') || V3.empty('Nothing matches');
  const open = s.alerts.filter(a=>a.pid===pid&&!a.closed), prn24 = s.prn.log.filter(l=>l.pid===pid&&V3.now()-l.t<1440).length, ref = Object.keys(s.refusals).filter(k=>k.startsWith(pid+'|')).reduce((n,k)=>n+s.refusals[k],0), v = s.vit.last[pid], wait = s.orders.filter(o=>o.pid===pid&&!o.cs).length, ch = V3.chartSummary(pid);
  const brief = `<section class="card"><div class="hd"><div><h3>Round brief</h3><div class="small muted" style="margin-top:4px">What the ward recorded since the last round</div></div></div><div class="v3brief">${ch?`<div><span class="tiny muted">Last night</span><b>${hesc(ch.replace('Last night: ',''))}</b></div>`:''}${v?`<div><span class="tiny muted">Latest vitals · ${V3.ago(v.t)}</span><b class="${V3.vitOut(pid,v).length?'bad':''}">${hesc(V3.vitText(v))}</b></div>`:''}<div><span class="tiny muted">Medicines</span><b>${ref?ref+' refusal'+(ref===1?'':'s')+' recorded':'No refusals'}${prn24?' · '+prn24+' SOS dose'+(prn24===1?'':'s')+' in 24 h':''}</b></div><div><span class="tiny muted">Open alerts</span><b class="${open.length?'bad':''}">${open.length?open.map(a=>hesc(a.title)).join('; '):'None'}</b></div>${wait?`<div><span class="tiny muted">Orders to countersign</span><b>${wait}</b></div>`:''}</div></section>`;
  const roles = ['all','nurse','rmo','psychiatrist','lead','psychologist','system'];
  return V3.head('Patient timeline','Every event, order, dose, note and alert from every role, newest first.','') +
   `<section class="card"><div class="pad v3tl-top"><div class="row" style="gap:12px;flex-wrap:nowrap">${av(p.ini,44,p.risk?'c-red':'c-blue')}<div><div style="font-size:17px;font-weight:700">${hesc(p.name)}</div><div class="small muted">${hesc(p.room)} · ${hesc(V3.ward(pid))} · ${hesc(p.dx)} · Section ${p.sec}</div></div></div><label class="field" style="min-width:230px;margin:0"><span class="lbl">Patient</span><select class="input" onchange="go('#/timeline/'+this.value)">${list.map(x=>`<option value="${x.id}" ${x.id===pid?'selected':''}>${hesc(x.name)} · ${hesc(x.room.replace('Room ','R-'))}</option>`).join('')}</select></label></div></section>` + brief +
   `<section class="card"><div class="hd"><div class="row" style="gap:6px;flex-wrap:wrap">${Object.keys(V3.TLG).map(k=>`<button class="tog ${u.tlG===k?'on':''}" onclick="S.v3.ui.tlG='${k}';render()">${V3.TLG[k][0]}</button>`).join('')}</div><label class="row" style="gap:6px"><span class="small muted">By</span><select class="input" style="min-width:150px;min-height:34px" onchange="S.v3.ui.tlR=this.value;render()">${roles.map(r=>`<option value="${r}" ${u.tlR===r?'selected':''}>${r==='all'?'Everyone':V3.roleName[r]}</option>`).join('')}</select></label></div><div class="v3tl">${body}</div></section>`; };
V3.rpTimeline = () => { const pid = 'neel', ev = V3.timeline(pid).slice(0,12);
  return ev.map(e => `<div class="row" style="flex-wrap:nowrap;align-items:flex-start;gap:8px"><span class="tiny muted" style="width:58px;flex:0 0 58px;padding-top:2px">${V3.stamp(e.t).replace('Yesterday','Yest.')}</span>${V3.rd(e.role)}<span class="small" style="flex:1">${hesc(e.text.length>120?e.text.slice(0,118)+'…':e.text)}</span></div>`).join('') + `<button class="btn sm" style="margin-top:10px;width:100%" onclick="go('#/timeline/${pid}')">Open the full timeline</button>`; };

/* ---------- home cards for psychiatrist and floor lead ---------- */
V3.homeCards = () => { if(S.role!=='lead') return ''; const B=V3.floorBadges();
  const T=[['flow','Beds and flow',B.flow,'amber','bed'],['allocate','Allocation',B.allocate,'amber','users'],['mhca','MHCA compliance',B.mhca,'crit','scale'],['approvals','Approvals',B.approvals,'blue','check'],['quality','Quality',B.quality,'amber','star'],['family','Family comms',B.family,'amber','phone']];
  const fc = `<section class="card"><div class="hd"><div><h3>Floor command</h3><div class="small muted" style="margin-top:4px">Beds, teams, statutory deadlines, approvals, quality and families</div></div><button class="btn sm pri" onclick="go('#/floor/flow')">Open</button></div><div class="v3tiles">${T.map(t=>`<button class="v3tile" onclick="go('#/floor/${t[0]}')"><span class="v3tile-i">${V3.i(t[4],18)}</span><span class="v3tile-t"><b>${t[1]}</b></span>${t[2]?`<span class="n ${t[3]}">${t[2]}</span>`:''}</button>`).join('')}</div></section>`;
  return fc; };
V3.homeTaskItems = () => {
  if(!['psychiatrist','lead'].includes(S.role)) return [];
  const s=v3(), isLead=S.role==='lead', me=V3.who[S.role];
  const mine=a=>isLead||V3.eff('psy',a.pid)===me;
  const alerts=s.alerts.filter(a=>!a.closed&&mine(a)&&(a.esc.some(e=>e.to==='psychiatrist'||(isLead&&e.to==='lead'))||(isLead&&a.sev==='critical'&&!a.ack)));
  const rows=alerts.map(a=>{
    const tone=a.sev==='critical'?'red':a.sev==='urgent'?'amber':'grey', bg=tone==='red'?'var(--red-bg)':tone==='amber'?'var(--amber-bg)':'var(--grey-bg)';
    const dl=V3.deadlineFor(a), late=dl!=null&&V3.now()>dl;
    const buttons=(V3.canAck(a)?`<button class="btn sm pri" onclick="V3.ackAlert('${a.id}')">Acknowledge</button>`:'')+(!a.seen?`<button class="btn sm" onclick="V3.seenAlert('${a.id}')">I have seen the patient</button>`:'')+(a.ack&&a.seen?`<button class="btn sm" onclick="V3.closeAlert('${a.id}')">Close alert</button>`:'');
    const row=`<div class="v3task-row" style="--task-tone:${tone==='red'?'var(--red)':tone==='amber'?'var(--amber)':'var(--grey)'};--task-bg:${bg}"><span class="v3task-logo">${V3.i('bell',18)}</span><div class="grow"><div style="font-weight:600">${hesc(a.title)} · ${hesc(V3.pn(a.pid))}</div><div class="small muted">${hesc(V3.ward(a.pid))} · ${hesc(a.src)} · ${V3.statusLine(a)}</div></div>${chip({critical:'Critical',urgent:'Urgent',routine:'Routine'}[a.sev],{critical:'c-red',urgent:'c-amber',routine:'c-grey'}[a.sev])}${buttons}</div>`;
    return {id:'home_alert_'+a.id,taskType:'alert',late,title:'Alert · '+a.id,meta:'',due:late?'Overdue':'Alert',homeRow:row};
  });
  V3.counters().forEach(o=>{
    const tone=o.type==='STAT'?'red':o.type==='SOS'?'amber':'violet', bg=tone==='red'?'var(--red-bg)':tone==='amber'?'var(--amber-bg)':'var(--violet-bg)';
    const row=`<div class="v3task-row" style="--task-tone:var(--${tone});--task-bg:${bg}"><span class="v3task-logo">${V3.i('doc',18)}</span><div class="grow"><div style="font-weight:600">RMO order to countersign · ${hesc(V3.pn(o.pid))}</div><div class="small">${hesc(o.text)}</div><div class="tiny muted">Written by ${hesc(o.by)} ${V3.stamp(o.t)}${o.via?' after speaking to '+hesc(o.via):''}${o.given?' · given '+V3.hm(o.given.t)+' by '+hesc(o.given.by):''}</div></div>${chip(o.type,o.type==='STAT'?'c-red':o.type==='SOS'?'c-amber':'c-violet')}<button class="btn sm pri" onclick="V3.countersign('${o.id}')">Countersign</button></div>`;
    rows.push({id:'home_order_'+o.id,taskType:'countersign',title:'RMO order · '+o.id,meta:'',due:'Countersign',chipc:'c-violet',homeRow:row});
  });
  return rows;
};

/* ---------- render hook ---------- */
V3.pre = () => { v3(); V3.syncInstr(); V3.tick(); V3.movesTick(); V3.clockUI(); };

V3.installGuards();


window.__in = true; if(!location.hash || location.hash==='#') location.hash='#/myday'; render();

