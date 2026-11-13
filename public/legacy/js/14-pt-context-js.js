
/* Every patient has their own records (4 Nov 2026, all roles). The patient pages were written for one patient and read
   S.meds, S.consents, S.events… PT_CTX keeps one copy of those fields per patient. Opening #/patient/<id>/<tab> swaps that
   patient's copy into S; every other screen runs on Neel's copy as before, so dashboards and task lists are unchanged.
   Neel keeps the original demo records. Other patients get mock records built from their diagnosis (demo data only). */
const PT_KEYS=['dailySaved','familySent','scribeDaily','historyStatus','historyDraft','capacityOpen','capacityDone','section','plansSigned','psychRows','dx','meds','medsOff','consents','calls','therapyNotes','team','discharge','obs','edd','eddShared','labs','restraints','obsBy','eddBy','dischargeDrafted','draftBy','discharged','dtype','reassessDone','admNo','events','pastAdm','diet','pgriev','dn','rx','pf','pfAt','pfUp','prefBy','vit','sugar','sugarHd','adh','adhT','vc','monx','nsum','admD','contacts','billing','dnHist','dnY'];
const ptClone=o=>JSON.parse(JSON.stringify(o));
const PT_CTX={neel:ptClone(Object.fromEntries(PT_KEYS.map(k=>[k,S[k]])))};
S.pid='neel';
S.hview='read'; /* Detailed history opens on Read only first (3 Nov) */
const PT_TODAY=(()=>{const d=new Date();return new Date(d.getFullYear(),d.getMonth(),d.getDate());})(); // today (13 Nov QA): every record date is relative to today, Neel's literal 18 Oct admission gives day 26
const ptDay=n=>{const d=new Date(PT_TODAY);d.setDate(d.getDate()-n);return d};
const ptD=d=>d.getDate()+' '+d.toLocaleString('en-GB',{month:'short'});
const ptDT=(d,t)=>ptD(d)+' 2026, '+t;
const ptHash=s=>[...s].reduce((a,c)=>(a*31+c.charCodeAt(0))>>>0,7);
const ptPick=(arr,id,salt)=>arr[ptHash(id+(salt||''))%arr.length];

/* who the patient is: nominated representative, contact, UHID, sex and age where the ward list leaves them out */
const PT_FAMILY={arjun:['Shalini Mehta','Wife'],varun:['Lakshmi Rao','Mother'],kabir:['Rajesh Malhotra','Father'],sameer:['Mitali Das','Mother'],neel:['Ananya Bose','Sister'],rohit:['Meera Kapoor','Wife'],dev:['Suresh Kumar','Brother'],tarun:['Anil Roy','Father'],meera:['Gopal Iyer','Husband'],sana:['Farah Qureshi','Mother'],ritu:['Vikram Malhotra','Husband'],kavya:['Lata Menon','Mother'],pooja:['Harish Bhatt','Father'],aman:['Gurpreet Gill','Wife'],yash:['Neha Arora','Sister'],nikhil:['Sunita Jain','Wife'],rahul:['Kamal Sethi','Father']};
const PT_FILL={meera:['F',44],sana:['F',27],ritu:['F',36],kavya:['F',19],pooja:['F',32],aman:['M',39],yash:['M',28],nikhil:['M',47],rahul:['M',24]};
function ptIdentity(p){
  const i=allPts().indexOf(p),fam=PT_FAMILY[p.id]||['Family member','Relative'],fl=PT_FILL[p.id]||[];
  return {name:p.name,first:p.name.split(' ')[0],ini:p.ini||p.name.split(' ').map(x=>x[0]).join(''),sex:p.sex||fl[0]||'M',age:p.age||fl[1]||30,
    uhid:p.uhid||('2026-27RG'+(7000+i*37)),th:'TH-'+(1040+i),room:p.room,nr:fam[0],nrFirst:fam[0].split(' ')[0],rel:fam[1],
    phone:'+91 9'+String(8000+ptHash(p.id)%1999).padStart(4,'0')+'X XXX'+String(10+ptHash(p.id+'p')%89),adm:ptDay(p.day)};
}

/* clinical mock records by diagnosis */
const PT_DX=[
 [/bipolar.*depress/i,{icd:'6A60.4',dx:'Bipolar affective disorder, current episode depressed',meds:[['Lithium carbonate 300 mg','1-0-1','After food'],['Quetiapine 100 mg','0-0-1','After food']],labs:['Serum lithium','Thyroid profile'],areas:[['Low mood and hopelessness','Behavioural activation'],['Limited insight','Psychoeducation on bipolar disorder']],session:'Behavioural activation · activity scheduling',obs:'Every 30 minutes'}],
 [/bipolar/i,{icd:'6A60.0',dx:'Bipolar affective disorder, current episode manic',meds:[['Sodium valproate 500 mg','1-0-1','After food'],['Olanzapine 10 mg','0-0-1','After food']],labs:['Serum valproate','Liver function tests'],areas:[['Poor sleep and irritability','Sleep hygiene, relaxation training'],['Limited insight','Psychoeducation on mood episodes']],session:'Psychoeducation on mood episodes',obs:'Every 15 minutes'}],
 [/schizo/i,{icd:'6A20',dx:'Schizophrenia, continuous',meds:[['Olanzapine 15 mg','0-0-1','After food'],['Trihexyphenidyl 2 mg','1-0-0','After food'],['Lorazepam 1 mg','SOS','As needed']],labs:['Lipid profile','Fasting blood sugar'],areas:[['Poor insight into illness','Psychoeducation for patient and family'],['Social withdrawal','Activity scheduling, group therapy']],session:'Early warning signs of relapse',obs:'Routine'}],
 [/psychotic/i,{icd:'6A23',dx:'Acute and transient psychotic disorder',meds:[['Risperidone 2 mg','1-0-1','After food'],['Lorazepam 2 mg','SOS','As needed']],labs:['Urine drug screen','CT brain (plain)'],areas:[['Suspiciousness and fear','Supportive therapy, reality testing'],['Family stress','Family psychoeducation']],session:'Supportive session · reality testing',obs:'1:1 constant'}],
 [/depress/i,{icd:'6A71.2',dx:'Recurrent depressive disorder, current episode severe',meds:[['Escitalopram 10 mg','1-0-0','After food'],['Mirtazapine 15 mg','0-0-1','After food'],['Clonazepam 0.5 mg','0-0-1','After food']],labs:['Thyroid profile','Vitamin B12 and D3'],areas:[['Low mood and poor sleep','Behavioural activation, sleep hygiene'],['Negative thoughts','Cognitive restructuring']],session:'Cognitive restructuring · thought record',obs:'Every 30 minutes'}],
 [/obsess|ocd/i,{icd:'6B20',dx:'Obsessive-compulsive disorder',meds:[['Fluoxetine 40 mg','1-0-0','After food'],['Clonazepam 0.5 mg','0-0-1','After food']],labs:['Thyroid profile'],areas:[['Checking and washing rituals','Exposure and response prevention'],['Avoidance','Graded exposure hierarchy']],session:'Exposure and response prevention · hierarchy',obs:'Routine'}],
 [/alcohol.*delirium/i,{icd:'6C40.4',dx:'Alcohol withdrawal with risk of delirium',meds:[['Chlordiazepoxide 25 mg','1-1-1','After food'],['Thiamine 100 mg','1-1-1','Before food'],['Haloperidol 5 mg','SOS','As needed']],labs:['Liver function tests','Serum electrolytes'],areas:[['Craving and withdrawal','Motivational interviewing'],['Family strain','Family session on relapse prevention']],session:'Motivational interviewing · stages of change',obs:'Every 15 minutes'}],
 [/alcohol/i,{icd:'6C40.2',dx:'Alcohol dependence, in withdrawal',meds:[['Chlordiazepoxide 25 mg','1-1-1','After food'],['Thiamine 100 mg','1-0-1','Before food'],['Multivitamin','1-0-0','After food']],labs:['Liver function tests','Gamma GT'],areas:[['Craving','Motivational interviewing'],['Relapse triggers','Relapse prevention plan']],session:'Motivational interviewing · decisional balance',obs:'Every 30 minutes'}],
 [/opioid/i,{icd:'6C43.2',dx:'Opioid dependence',meds:[['Buprenorphine 2 mg','1-0-1','Under the tongue'],['Clonidine 0.1 mg','1-0-1','After food']],labs:['Urine drug screen','HIV, HBsAg, HCV'],areas:[['Craving and withdrawal','Motivational interviewing'],['Peer influence','Relapse prevention, refusal skills']],session:'Relapse prevention · high-risk situations',obs:'Routine'}],
 [/cannabis/i,{icd:'6C41.2',dx:'Cannabis dependence',meds:[['Quetiapine 50 mg','0-0-1','After food']],labs:['Urine drug screen'],areas:[['Craving','Motivational interviewing'],['Low motivation','Goal setting, activity scheduling']],session:'Motivational interviewing · goals',obs:'Routine'}],
 [/anorexia/i,{icd:'6B80',dx:'Anorexia nervosa',meds:[['Olanzapine 2.5 mg','0-0-1','After food'],['Multivitamin','1-0-0','After food']],labs:['Serum electrolytes','ECG'],areas:[['Restricted eating','Meal plan with dietitian, supervised meals'],['Body image','Cognitive behavioural therapy']],session:'Meal support · body image',obs:'Every 30 minutes'}],
 [/./,{icd:'—',dx:'Under assessment (admitted recently)',meds:[['Lorazepam 1 mg','SOS','As needed']],labs:['Complete blood count','Urine drug screen'],areas:[['To be assessed','Admission workup and detailed history']],session:'',obs:'Every 15 minutes'}]
];
const ptDxSet=p=>PT_DX.find(x=>x[0].test(p.dx))[1];
function ptMakeCtx(p){
  const c=ptClone(PT_CTX.neel),id=ptIdentity(p),set=ptDxSet(p),psy=PSYOF[p.id]||(typeof rmoPsy==='function'&&rmoPsy(p))||'Dr. Nandini Rao',psych=PSYCHOF[p.id]||'';
  const adm=id.adm,at=(n,t)=>ptDT(ptDay(Math.max(0,p.day-n)),t),fresh=p.day<=1;
  Object.assign(c,{
    dx:set.dx,section:String(p.sec||'89'),team:{psy,psych},obs:(EX[p.id]||[])[0]||set.obs,
    obsBy:{by:psy,at:ptDT(adm,'12:10 pm')},edd:(()=>{const d=new Date(adm);d.setDate(d.getDate()+Math.max(14,p.day+7));return d.toISOString().slice(0,10)})(),eddShared:false,eddBy:{by:psy,at:ptDT(adm,'12:15 pm')},
    historyStatus:p.day>=3?(ptHash(p.id)%3?'signed':'overdue'):'pending',historyDraft:false,
    dailySaved:false,familySent:false,scribeDaily:false,capacityOpen:false,capacityDone:p.day>=7,reassessDone:p.day>=14,
    plansSigned:{psy:p.day>=7,psych:p.day>=7&&!!psych},calls:{h24:p.day>=1?'done':'due',d34psy:p.day>4?'done':'due',d34psych:p.day>4||!psych?'done':'due'},
    admNo:p.day===0?3:2,discharged:false,dischargeDrafted:false,draftBy:'',dtype:'Planned',
    discharge:{capacity:false,risk:false,formC:false,meds:false,followups:false,family:false,summary:false,dconsent:false},
    psychRows:psych?set.areas.map((a,i)=>({area:a[0],iv:a[1],req:String(3+i),done:String(Math.min(2+i,Math.floor(p.day/4))),when:['Mon, Thu 4 pm','Wed 11 am','Tue, Fri 3 pm'][i%3],out:p.day>5?'Improving':'Started'})):[],
    meds:set.meds.map(m=>({name:m[0],freq:m[1],time:m[2],range:ptD(adm)+' to '+ptD(new Date(adm.getTime()+30*864e5)),by:psy,at:ptDT(adm,'11:40 am')})),
    medsOff:[],rx:[],dn:{},pf:{},pfAt:{},pfUp:{},prefBy:{},restraints:[],
    labs:set.labs.map((t,i)=>({t,d:i?'Tomorrow, 7:00':ptD(ptDay(Math.max(0,p.day-1)))+', 7:00',st:i?'Ordered':'Result in',by:psy,at:at(0,'10:40 am')})),
    consents:[
      {name:'Admission consent and letter of undertaking',who:'Family',st:'Signed '+ptDT(adm,'11:05 am')+' by '+id.nr+' ('+id.rel.toLowerCase()+') · taken by Meena Arora, front desk · witness Sister Rekha',c:'c-green'},
      p.sec==='89'||p.sec===89?{name:'Form E · Admission with high support needs',who:'Family',st:'Signed '+ptDT(adm,'11:10 am')+' by '+id.nr+' ('+id.rel.toLowerCase()+') · taken by Meena Arora, front desk',c:'c-green'}
        :{name:'Form C · Independent admission',who:'Patient',st:'Signed '+ptDT(adm,'11:10 am')+' by '+p.name+' · taken by Meena Arora, front desk',c:'c-green'},
      {name:'High risk informed consent',who:'Family',st:fresh?'Pending · to be taken from '+id.nr:'Signed '+ptDT(adm,'11:15 am')+' by '+id.nr+' · explained by '+psy,c:fresh?'c-amber':'c-green'}
    ],
    therapyNotes:psych&&set.session&&p.day>=2?[{d:ptD(ptDay(Math.max(0,p.day-2))),wk:1,t:'Intake session · Rapport and goals',by:psych,body:'Aim: build rapport and agree goals. '+id.first+' was guarded at first and settled during the session. Goals agreed with '+id.first+' and '+id.nr+'. Next: '+set.session.toLowerCase()+'.'}]
      .concat(p.day>=5?[{d:ptD(ptDay(Math.max(0,p.day-5))),wk:1,t:'Individual session · '+set.session,by:psych,body:'Aim: '+set.areas[0][1].toLowerCase()+'. '+id.first+' engaged and completed the exercise. Outcome: partial progress. Next: review homework.'}]:[]).reverse():[],
    events:p.risk?[{id:1,when:ptD(ptDay(Math.max(0,p.day-1)))+', 11:20 pm',type:'Behaviour on the ward',sev:'',by:'Sister Rekha · nurse',duty:'Dr. Sameer Khan · duty doctor',detail:id.first+' was restless and shouting in the corridor. Calmed with verbal de-escalation; SOS medicine given as charted.',ack:false}]:[],
    pastAdm:ptHash(p.id)%3===0&&p.day>3?[{n:1,dates:'9 Jan to 8 Feb 2025',days:30,psy,psych:psych||'Priya Nair',sec:'Section 89',dx:set.dx,cond:'Improved, partial insight',meds:set.meds.slice(0,2).map(m=>m[0]+' · '+m[1]),plan:'Continue medicines; follow-up after 7 days',notes:[['8 Feb','Discharge round · '+psy,'Improved. Continue medicines; follow-up after 7 days.'],['1 Feb','Family session','Family briefed on warning signs and medicine supervision.'],['15 Jan','Detailed history','First episode after stressors; family history noted.']]}]:[],
    diet:{type:ptPick(['Vegetarian','Non-vegetarian','Eggetarian'],p.id),avoid:ptPick(['None known','Peanuts','Lactose'],p.id,'a'),notes:ptPick(['Prefers roti to rice','Small frequent meals','No sugar in tea','Jain food on Mondays'],p.id,'n')},
    pgriev:ptHash(p.id)%4===1?[{from:'Family',t:'Wants a call from the doctor after rounds',via:'Front desk',own:psych||psy,st:'Open',sla:'4 h left',by:'Pooja Malhotra, family coordinator',at:at(0,'10:20 am')}]:[]
  });
  /* vitals, sugar, adherence, nursing summary and monitoring: the patient's own numbers */
  const H=k=>ptHash(p.id+k),n=Math.max(2,Math.min(6,p.day+1)),dl=i=>ptD(ptDay(n-1-i));
  const sys=[],dia=[],pul=[],slp=[],wt=[],sug=[],adh=[];
  for(let i=0;i<n;i++){const k=n-1-i;sys.push(118+H('s')%14+k*2+(p.risk?4:0));dia.push(76+H('d')%8+k);pul.push(76+H('p')%12+k*2);slp.push(Math.min(8,3+H('z'+i)%3+i*0.5));wt.push(+(54+H('w')%26-i*0.1).toFixed(1));sug.push(110+H('g'+i)%60);adh.push(H('a'+i)%7?100:86);}
  c.vit=Array.from({length:n},(_,i)=>[dl(i),sys[i]+'/'+dia[i],String(pul[i]),'98.'+(4+H('t'+i)%4),String(96+H('o'+i)%4),i===0||i===n-1?String(wt[i]):'—',String(slp[i])]);
  c.vc={sys,dia,pulse:pul,sugar:sug,sleep:slp,adh,wt,wlo:Math.floor(Math.min(...wt))-1,whi:Math.ceil(Math.max(...wt))+1};
  c.sugar=Array.from({length:Math.min(4,n)},(_,i)=>[ptD(ptDay(i+1)),90+H('f'+i)%25,130+H('b'+i)%45,140+H('l'+i)%60,120+H('e'+i)%35]);
  c.sugarHd='Ordered '+ptD(adm)+' (on '+set.meds[0][0].split(' ')[0].toLowerCase()+')';
  let G=0,T=0;c.adh=c.meds.map((m,i)=>{if(m.freq==='SOS'){const g=H('sos'+i)%3;return [m.name,'SOS · '+g+' given',null]}const per=m.freq.split('-').filter(x=>x!=='0').length,t=Math.max(1,per*Math.min(6,p.day||1)),g=t-(H('m'+i)%5===0?1:0);G+=g;T+=t;return [m.name,g+'/'+t+' doses',Math.round(100*g/t)]});
  const pct=T?Math.round(100*G/T):100,ref=T-G;
  c.adhT={o:pct+'%',g:G+' <span style="font-size:16px;color:var(--muted)">/ '+T+'</span>',r:String(ref),rs:ref+' refused · 0 held',t:(82+H('ot')%14)+'%'};
  c.monx=[['Weight','Weekly · '+wt[n-1]+' kg on '+dl(n-1),'On track','c-green']].concat(set.labs.map((l,i)=>[l,i?'Tomorrow 7 am, fasting':'Result in on '+dl(Math.max(0,n-2)),i?'Due':'Done',i?'c-blue':'c-green']),[['Fluid intake and output','Daily · intake about 2 L','On track','c-green'],['Sleep chart','Hourly checks at night · '+slp[n-1]+' h last night',slp[n-1]>=6?'Improving':'Watch',slp[n-1]>=6?'c-green':'c-amber']]);
  const mood=['calm','restless in the evening','withdrawn but cooperative','anxious, settled with reassurance'][H('mood')%4];
  c.nsum={note:'Slept about '+slp[n-1]+' hours'+(slp[n-1]<5?', woke twice':'')+'. Took night doses. BP '+sys[n-1]+'/'+dia[n-1]+', pulse '+pul[n-1]+'. Bedtime sugar '+c.sugar[0][4]+' mg/dL. '+id.first+' was '+mood+'; '+(S.obs||c.obs).toLowerCase()+' checks continued.',
    chips:[['BP '+sys[n-1]+'/'+dia[n-1],'c-grey'],['Pulse '+pul[n-1],'c-grey'],['SpO2 '+c.vit[n-1][4]+'%','c-grey'],['Sugar '+c.sugar[0][4]+' bedtime','c-grey'],['Doses: '+(ref?ref+' refused':'all given'),ref?'c-amber':'c-green'],['Sleep '+slp[n-1]+' h',slp[n-1]>=6?'c-green':'c-amber']],
    earlier:'Earlier shifts: Day shift (Brother Joseph): '+(ref?'refused one dose, took it after counselling.':'took all doses, no side effects noted.')+' Evening shift (Sister Anita): joined group activity, spoke to '+id.nr+' on the phone.'};
  c.admD=adm.toISOString();
  const sur=p.name.split(' ').slice(-1)[0],other=[[ptPick(['Ramesh','Vijay','Sunil','Ashok'],p.id,'o')+' '+sur,'Uncle'],[ptPick(['Kavita','Rekha','Anjali','Pooja'],p.id,'q')+' '+sur,'Cousin']][H('rel')%2];
  c.contacts=[[id.nr,id.rel+' · nominated representative','Allowed','c-green'],[other[0],other[1],'Allowed','c-green'],[ptPick(['Rohan Gupta','Ishaan Verma','Aditya Rao'],p.id,'f'),'Friend','Not for now','c-grey']];
  c.billing=id.nr+' ('+id.rel.toLowerCase()+')';
  /* past daily and round notes */
  const who=psych||psy,f2=['Settled, slept 6 h','Restless at night','Withdrawn, ate partially','Calmer, joined group'];
  c.dnHist=Array.from({length:Math.min(4,p.day)},(_,i)=>{const d=ptDay(i+1),round=i===1;return round
    ?{d:String(d.getDate()),my:'Oct 2026',type:'Round note',tc:'c-violet',by:psy,role:'Psychiatrist',sum:'Reviewed on round; '+set.meds[0][0]+' continued',secs:[['Findings',ptPick(f2,p.id,'r'+i)+'.'],['Medicine changes',set.meds[0][0]+' continued; review tomorrow.'],['Actions',set.labs[0]+'; '+(set.session?set.session.toLowerCase():'workup')+'.']]}
    :{d:String(d.getDate()),my:d.getMonth()===9?'Oct 2026':'Sep 2026',type:'Daily note',tc:'c-blue',by:who,role:psych?'Psychologist':'Psychiatrist',sum:ptPick(f2,p.id,'d'+i)}});
  const yk=ptPick([0,1,2,3],p.id,'y');
  c.ydayAns=[{sleep:'6 to 7 h',meals:'All meals',care:'Independent',bl:'Normal',bw:'Normal',mood:'Calmer',beh:'Calm',part:'Active',sessions:['Group therapy'],fam:['None today'],evy:'None today'},
    {sleep:'4 to 6 h',meals:'Partial',care:'Needs prompting',bl:'Normal',bw:'Normal',mood:'Irritable',beh:'Restless',part:'Attended, quiet',sessions:['Individual session'],fam:['None today'],evy:'None today'},
    {sleep:'4 to 6 h',meals:'Partial',care:'Needs prompting',bl:'Normal',bw:'Normal',mood:'Low',beh:'Withdrawn',part:'Attended, quiet',sessions:['Yoga'],fam:['Phone call'],evy:'None today'},
    {sleep:'6 to 7 h',meals:'All meals',care:'Independent',bl:'Normal',bw:'Normal',mood:'Calmer',beh:'Calm',part:'Active',sessions:['Group therapy','Yoga'],fam:['Visit'],evy:'None today'}][yk];
  c.dnY=p.day?'Yesterday (Day '+(p.day-1)+', '+who+'): '+f2[yk].toLowerCase()+'.':'Admitted today: no note yet.';
  c.ident=id;c.otherRel=other[0];
  return c;
}
function ptUse(pid){
  if(!pid||!ptFind(pid))pid='neel';
  if(S.pid===pid)return;
  PT_CTX[S.pid]=Object.assign(PT_CTX[S.pid]||{},Object.fromEntries(PT_KEYS.map(k=>[k,S[k]])));
  const c=PT_CTX[pid]||(PT_CTX[pid]=ptMakeCtx(ptFind(pid)));
  PT_KEYS.forEach(k=>S[k]=c[k]);
  S.pid=pid;S.evOpen=false;S.hview='read';
}
const ptRoutePid=()=>{const r=(location.hash||'').slice(2).split('/');return r[0]==='patient'&&r[1]?r[1]:''};

/* Neel's demo text in the shared patient pages → the open patient's own details */
function ptSwaps(){
  const p=ptFind(S.pid),id=ptIdentity(p),c=PT_CTX[S.pid]||{},set=ptDxSet(p);
  return [
    ['#/patient/neel/','#/patient/'+p.id+'/'],["go('#/patient/neel')","go('#/patient/"+p.id+"')"],
    ['<div class="avbig">NB</div>','<div class="avbig">'+id.ini+'</div>'],['23/M R 213 A',id.age+'/'+id.sex+' '+String(p.room||'').replace(/^Room\s*/i,'R ')],['UHID 2026-27RG6990','UHID '+id.uhid],
    ['Room 214 · Bed A','R '+String(p.room||'').replace(/^Room\s*/i,'')],['6A60.0 · ICD-11',set.icd+' · ICD-11'],['18 Oct, 11:20',ptD(id.adm)+', 11:20'],['24 Oct, 16:40',ptD(id.adm)+', 16:40'],
    ["Day 6 of stay","Day "+p.day+" of stay"],['day 6 of 30','day '+p.day+' of 30'],['+91 98XXX XXX21',id.phone],
    ['Ananya Bose (Sister)',id.nr+' ('+id.rel+')'],['Ananya Bose (sister)',id.nr+' ('+id.rel.toLowerCase()+')'],['Ananya Bose, sister',id.nr+', '+id.rel.toLowerCase()],
    ['Calmer today, sleep improved, engaging in groups. Pressured speech at times. Plan: increase olanzapine, check lithium level.',(c.dnHist&&c.dnHist[0]?c.dnHist[0].sum:'Seen on round')+'. Plan: continue '+(c.meds&&c.meds[0]?c.meds[0].name:'current medicines')+'; '+set.labs[0].toLowerCase()+'.'],
    ['Serum lithium level tomorrow morning',set.labs[0]+' tomorrow morning'],
    ['Relapse of bipolar disorder after stopping lithium',set.dx+' (relapse or new episode)'],['Bipolar affective disorder, current episode manic without psychotic symptoms (6A60.0), relapse after stopping lithium.',set.dx+' ('+set.icd+').'],
    ['Ananya Bose',id.nr],['Ananya',id.nrFirst],['Rakesh Bose',(PT_CTX[S.pid]||{}).otherRel||id.nr],['Neel Bose',p.name],['Neel',id.first],['NB · ',id.ini+' · ']
  ];
}
function ptPersonal(html){
  if(typeof html!=='string'||S.pid==='neel')return html;
  ptSwaps().forEach(([a,b])=>{html=html.split(a).join(b)});
  return html;
}

/* Stay summary for patients other than Neel: same layout, built from their own records */
const __pc_ov=pOverview;
pOverview=function(){
  if(S.pid==='neel')return __pc_ov();
  const p=ptFind(S.pid),id=ptIdentity(p),c=S,adm=id.adm,psy=S.team.psy,psych=S.team.psych;
  const item=(when,cls,title,meta,act)=>`<div class="tl"><div class="when">${when}</div><div class="rail"><div class="pip ${cls}"></div><div class="bar"></div></div><div class="what"><div style="font-weight:600">${title}</div><div class="small muted">${meta}</div>${act||''}</div></div>`;
  const box=(lbl,val,sub,act,tone)=>`<div class="sbox ${tone||''}"><div class="lbl">${lbl}</div><div class="sval">${val}</div>${sub?`<div class="tiny muted">${sub}</div>`:''}${act?`<div style="margin-top:auto;padding-top:6px">${act}</div>`:''}</div>`;
  const lnk=(t,h)=>`<button class="btn sm" onclick="${h}">${t}</button>`,day=n=>ptD(new Date(adm.getTime()+n*864e5)),go_=t=>`go('#/patient/${p.id}/${t}')`;
  const openEv=S.events.filter(e=>!e.ack),ev=S.events[0],hist=S.historyStatus==='signed';
  const tl=[item(ptD(adm),'done','Admitted, Section '+S.section+(S.section==='90'?' supported admission (over 30 days)':' supported admission'),'Admitted by '+psy+', 11:20 am · front desk (Meena Arora): admission form and consents signed by '+id.nr+' ('+id.rel.toLowerCase()+').')];
  if(p.day>=0)tl.push(item(ptD(adm),p.day>0?'done':'','Admission workup',p.day>0?'Done by '+psy+' · '+ptDT(adm,'12:30 pm')+' · vitals and physical exam by Dr. Sameer Khan (RMO)':'Assigned to '+psy+' · due today'));
  tl.push(item(day(1),p.day>=1?'done':'','24-hour family call',p.day>=1?'Called by '+psy+' · '+ptDT(new Date(adm.getTime()+864e5),'11:00 am')+' · logged automatically':'Due within 24 hours of admission'));
  tl.push(item(day(3),hist?'done':(p.day>3?'late':''),'Detailed history',hist?'Signed by '+psy+(psych?' and '+psych:''):'Assigned to '+psy+(psych?' and '+psych:'')+' · due '+day(3)+(p.day>3?' · overdue':''),hist?'':`<button class="btn sm" style="margin-top:6px" onclick="${go_('admission')}">Open</button>`));
  tl.push(item(day(7),S.plansSigned.psy?'done':'','Diagnosis and management plans',(S.plansSigned.psy?'Signed by ':'Assigned to ')+psy+(psych?' and '+psych:'')+' · due day 7'));
  tl.push(item('Planned','','Discharge','Expected date set by '+S.eddBy.by+' · '+S.eddBy.at+(S.eddShared?' · shared with the family':'')));
  const lastNurse=['Settled, slept 6 h','Restless at night, slept 4 h','Calm, ate all meals','Anxious in the evening, settled with support'][ptHash(p.id)%4];
  return `
  <section class="card pad"><h3 style="margin-bottom:14px">Stay timeline</h3><div class="timeline">${tl.join('')}</div></section>
  <div class="sumgrid">
    ${box('Events log', ev?`${ev.type}${ev.sev?' · '+ev.sev:''}`:'None this stay', ev?`${ev.when} · ${openEv.length?openEv.length+' not reviewed':'all reviewed'} · ${S.events.length} this stay`:'', S.events.length?lnk(S.evOpen?'Hide events':'View events',"S.evOpen=!S.evOpen;render()"):'', openEv.length?'warn':'')}
    ${box('Nursing · last shift',lastNurse,'Vitals within range · all doses given · by Sister Rekha, night shift',lnk('Vitals and monitoring',go_('vitals')))}
    ${box('Last round',p.day?ptD(ptDay(1))+' · '+psy:'Not yet','Medicines reviewed on round',lnk('Round notes',go_('daily')))}
    ${box('Daily note', S.dailySaved?'Saved today':'Pending today',S.dailySaved?'Saved by '+signer()+(S.dailyAt?' · '+S.dailyAt:''):(psych?'Assigned to '+psych:'Assigned to '+psy),lnk('Daily notes',go_('daily')), S.dailySaved?'':'warn')}
    ${box('Medicines', S.meds.length+' active','Prescribed by '+[...new Set(S.meds.map(m=>m.by).filter(Boolean))].join(', '),lnk('Medicines',go_('orders')))}
    ${box('Family',S.calls.h24==='done'?'24-hour call done · '+day(1):'24-hour call due','By '+psy+' · '+id.nr+', '+id.rel.toLowerCase(),lnk('Therapy and family',go_('therapy')))}
    ${box('Mental Healthcare Act','Section '+S.section+' · day '+p.day+(S.section==='90'?'':' of 30'),'Nominated representative: '+id.nr+' · rights explained by '+psy+', '+ptDT(adm,'11:00 am'))}
    <div class="sbox"><div class="lbl">Observation level</div>
      <select class="input" style="min-height:34px" ${isPsy()?'':'disabled'} onchange="S.obs=this.value;S.obsBy=whoAt();render();toast('Observation changed to '+this.value+' by '+S.obsBy.by+'. Ward notified.')">${['1:1 constant','Every 15 minutes','Every 30 minutes','Routine'].map(o=>`<option ${S.obs===o?'selected':''}>${o}</option>`).join('')}</select>
      ${byl(S.obsBy.by,S.obsBy.at,'Set by')}</div>
    <div class="sbox"><div class="lbl">Expected discharge</div>
      <input class="input" style="min-height:34px" type="date" value="${S.edd}" ${isPsy()?'':'disabled'} onchange="S.edd=this.value;S.eddBy=whoAt();render();toast('Expected discharge date updated by '+S.eddBy.by)" aria-label="Expected discharge date">
      <label class="row tiny" style="gap:6px"><input type="checkbox" ${S.eddShared?'checked':''} ${isPsy()?'':'disabled'} onchange="S.eddShared=this.checked;S.eddShareBy=whoAt();render();toast(this.checked?'Shared with ${id.nr} in the caretaker app':'No longer shown to the family')"> Show to the family</label>
      ${byl(S.eddBy.by,S.eddBy.at,'Set by')}</div>
    ${box('Restraint', S.restraints.length?S.restraints.length+' this stay':'None this stay', S.restraints.length?S.restraints[0].when+' · '+S.restraints[0].reason+' · authorised by '+S.restraints[0].by:'Psychiatrist authorises; nominated representative told within 24 hours', isPsy()?lnk('Authorise restraint','restraintModal()'):'')}
    ${box('Previous admissions', S.pastAdm.length?S.pastAdm.length+' earlier stay'+(S.pastAdm.length===1?'':'s'):'None, first admission', S.pastAdm.map(x=>'Admission '+x.n+' · '+x.dates).join(' · '), S.pastAdm.length?lnk('Open',go_('past')):'')}
  </div>
  ${S.evOpen?eventsCard():''}`;
};

/* Route: #/patient/<id>/<tab> shows that patient; other screens run on Neel's records as before */
const __pc_vp=vPatient;
/* Previous / Next patient on the patient page, in the same order as the role's own list, staying on the same tab */
function ptNavList(){return S.role==='psychologist'?PSY_EOD():S.role==='rmo'?scopePts():S.role==='lead'?allPts():PTS;}
function ptStepper(id,sub){const L=ptNavList(),i=L.findIndex(p=>p.id===id);if(i<0)return '';const pv=L[i-1],nx=L[i+1],t=sub||'overview';
  return `<div class="row" style="justify-content:flex-end;gap:8px;margin:-4px 0 10px;flex-wrap:wrap"><span class="tiny muted">Patient ${i+1} of ${L.length}</span>${pv?`<button class="btn sm" onclick="go('#/patient/${pv.id}/${t}')">‹ ${hesc(pv.name)}</button>`:''}${nx?`<button class="btn sm" onclick="go('#/patient/${nx.id}/${t}')">${hesc(nx.name)} ›</button>`:''}</div>`;}
vPatient=function(sub){const id=ptRoutePid()||'neel';ptUse(id);S.focusPid=id;const h=ptPersonal(__pc_vp(sub));
  return h.replace(/(<nav class="crumb">[\s\S]*?<\/nav>)/,m=>m+ptStepper(id,(location.hash||'').slice(2).split('/')[2]));};
const __pc_render=render;
render=function(){if(!ptRoutePid())ptUse('neel');return __pc_render.apply(this,arguments);};
const __pc_modal=openModal;openModal=function(h){return __pc_modal.call(this,ptPersonal(h));};
const __pc_toast=toast;toast=function(m){return __pc_toast.apply(this,[ptPersonal(m)].concat([].slice.call(arguments,1)));};
/* lists: View opens the clicked patient (every role) */
const __pc_ipd=ipdPage;
ipdPage=function(o){if(o&&o.go){const g=o.go;o=Object.assign({},o,{go:p=>String(g(p)).split('#/patient/neel/').join('#/patient/'+p.id+'/')});}return __pc_ipd(o);};
/* the psychiatrist's earlier stand-in profile is no longer needed: every patient has full records */
ptVPatient=function(sub,base){return base(sub);};

/* Screens that step through several patients (Rounds, Nursing chart, doctor's medicine chart, Daily notes):
   draw each patient from their own records. ptRun leaves that patient's records active, so taps and saves land on them. */
function ptCtxOf(pid){return pid===S.pid?S:(PT_CTX[pid]||(PT_CTX[pid]=ptMakeCtx(ptFind(pid))));}
function ptRun(pid,fn){ptUse(pid);return ptPersonal(fn());}
const __pc_rounds=vRounds;
vRounds=function(){const R=S.rounds,WP=WARDS[R.ward],p=WP[Math.min(R.idx[R.ward],WP.length-1)];if(p)S.focusPid=p.id;return p?ptRun(p.id,()=>__pc_rounds.apply(this,arguments)):__pc_rounds.apply(this,arguments);};
const __pc_nv=vNurseView;
vNurseView=function(){const id=(S.role==='psychiatrist'||S.role==='lead')?'':S.nFocus;return id&&ptFind(id)?ptRun(id,()=>__pc_nv.apply(this,arguments)):__pc_nv.apply(this,arguments);};
