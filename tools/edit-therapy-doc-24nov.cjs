// 24 Nov (Nikita, "Therapy Plans logic and scenarios.docx", her red edits). Run once.
const fs = require('fs'), path = require('path');
const J = path.join(__dirname, '..', 'public', 'legacy', 'js');
function edit(file, pairs) {
  const f = path.join(J, fs.readdirSync(J).find(n => n.startsWith(file)));
  const raw = fs.readFileSync(f, 'utf8'), crlf = raw.includes('\r\n');
  let s = raw.replace(/\r\n/g, '\n');
  for (const [a, b] of pairs) { const n = s.split(a).length - 1; if (n !== 1) throw new Error(file + ': ' + n + 'x ' + a.slice(0, 70)); s = s.split(a).join(b); }
  fs.writeFileSync(f, crlf ? s.replace(/\n/g, '\r\n') : s); console.log('edited', path.basename(f));
}

/* 147 session note: risk check No risk / Low / Moderate / High; Moderate or High alerts the psychiatrist. Intervention list gets Ventilation. */
edit('147-', [
  ["'Relaxation training'];", "'Relaxation training','Ventilation'];"],
  ["        +`<div class=\"sn-yn\"><span>Risk noticed in this session? <span class=\"tiny muted\">(optional; Yes alerts the psychiatrist)</span></span><div class=\"sn-chips\"><button type=\"button\" class=\"sn-c bad ${D.riskSeen==='yes'?'on':''}\" onclick=\"tnT('riskSeen','yes')\">Yes</button><button type=\"button\" class=\"sn-c ${D.riskSeen==='no'?'on':''}\" onclick=\"tnT('riskSeen','no')\">No</button></div></div>${D.riskSeen==='yes'?ta('riskNote','What was said or seen'):''}`)",
   "        +`<div class=\"sn-yn\"><span>Risk check <span class=\"tiny muted\">(Moderate or High alerts the psychiatrist)</span></span><div class=\"sn-chips\">${['No risk','Low','Moderate','High'].map(l=>`<button type=\"button\" class=\"sn-c${/Mod|High/.test(l)?' bad':''} ${D.riskLvl===l?'on':''}\" onclick=\"tnRisk('${l}')\">${l}</button>`).join('')}</div></div>${D.riskLvl&&D.riskLvl!=='No risk'?ta('riskNote','What was said or seen'):''}`)"],
  ["  window.tnT=(k,v)=>{D[k]=D[k]===v?'':v;autoSum();draw();};",
   "  window.tnT=(k,v)=>{D[k]=D[k]===v?'':v;autoSum();draw();};\n  /* 24 Nov (Nikita): risk level; Moderate or High also sets riskSeen 'yes' so older readers still see the risk */\n  window.tnRisk=l=>{D.riskLvl=D.riskLvl===l?'':l;D.riskSeen=/Moderate|High/.test(D.riskLvl)?'yes':D.riskLvl?'no':'';autoSum();draw();};"],
  ["const risk=KIND==='fam'?{}:{seen:D.riskSeen||'no'};", "const risk=KIND==='fam'?{}:{seen:D.riskSeen||'no',level:D.riskLvl||''};"],
  ["title:'Therapy session: risk noticed'", "title:'Therapy session: '+(D.riskLvl||'risk')+' risk'"],
]);

/* 143 group sessions: Tulasi's daily roster (Nikita): Prayer 10, CRT or Addiction 10:30-11:30, Psychoeducation 12-12:45,
   Recreation (or dance and movement / art / music) 2-3, Yoga 4-5 */
edit('143-', [
  ["const TYPES=['Anxiety and stress group','Relapse prevention group','Yoga and relaxation','Social skills group','Psychoeducation group','Occupational therapy','Art and music therapy','Family psychoeducation group','Other'];",
   "const TYPES=['Prayer','Cognitive retraining (CRT)','Addiction session','Psychoeducation','Recreation','Dance and movement','Art therapy','Music therapy','Yoga','Other'];\n  const TIME={'Prayer':'10 am','Cognitive retraining (CRT)':'10:30 to 11:30 am','Addiction session':'10:30 to 11:30 am','Psychoeducation':'12 to 12:45 pm','Recreation':'2 to 3 pm','Dance and movement':'2 to 3 pm','Art therapy':'2 to 3 pm','Music therapy':'2 to 3 pm','Yoga':'4 to 5 pm'};"],
  ["${TYPES.map(t=>`<option ${G.type===t?'selected':''}>${t}</option>`).join('')}", "${TYPES.map(t=>`<option value=\"${t}\" ${G.type===t?'selected':''}>${t}${TIME[t]?' · '+TIME[t]:''}</option>`).join('')}"],
]);

/* 146 psychiatrist therapy plan card: Ventilation in the therapy list */
edit('146-', [["const TMODS=['Individual therapy',", "const TMODS=['Ventilation','Individual therapy',"]]);

/* 194 Therapy Plans */
edit('194-', [
  // goal flag: Not met at 2 of the last 4 sessions (doc; Nikita: keep for now)
  ["slice(0,5);const no=L.filter(o=>o.v.r===0).length;return no>=3?`\"${E(g.t)}\" not met ${no} of the last ${L.length} days`:'';",
   "slice(0,4);const no=L.filter(o=>o.v.r===0).length;return no>=2?`\"${E(g.t)}\" not met at ${no} of the last ${L.length} sessions. Review the goal.`:'';"],
  // risk chip reads the level when there is one
  ["const risk=Object.values(n.risk||{}).some(v=>v==='yes');return `", "const lvl=(n.risk||{}).level||'',risk=Object.values(n.risk||{}).some(v=>v==='yes');return `"],
  ["${risk?'Risk raised':'No risk'}</span>", "${lvl?E(lvl)+(lvl==='No risk'?'':' risk'):risk?'Risk raised':'No risk'}</span>"],
  // required contact: daily WhatsApp by psychologist; weekly update counts calls only
  ["const reached=D.all.filter(o=>o.t!=='miss'),wk=reached.filter(o=>t-o.d<=7*864e5);",
   "const reached=D.all.filter(o=>o.t!=='miss'),wk=reached.filter(o=>o.t==='call'&&t-o.d<=7*864e5),waT=D.all.filter(o=>o.t==='wa'&&+new Date(o.d.getFullYear(),o.d.getMonth(),o.d.getDate())===+t);"],
  ["[fs?'done':'later','Family session',",
   "[waT.length?'done':'due','WhatsApp update every day',waT.length?'Sent today (psychologist)':'Not sent today (psychologist)',waT.length?kOf(t):''],[fs?'done':'later','Family session',"],
  ["'Weekly update',wk.length?'Last '+fmtD(wk.sort((a,b)=>b.d-a.d)[0].d):'Due this week'", "'Weekly update (a call)',wk.length?'Last call '+fmtD(wk.sort((a,b)=>b.d-a.d)[0].d):'Due this week'"],
  // psychiatrist can also start a family session (Nikita)
  ["if(PSY&&typeof window.snOpen==='function')h+=b(\"snOpen('\"+Q(pid)+\"','fam')\",'Start family session');", "if(typeof window.snOpen==='function')h+=b(\"snOpen('\"+Q(pid)+\"','fam')\",'Start family session');"],
  // days before admission greyed and not clickable
  ["const c=cell(d,k);h+=`<button type=\"button\" style=\"--i:${i}\" class=\"tp4-day",
   "const pre=admOf(pid)&&d<admOf(pid);if(pre){h+=`<div class=\"tp4-day pre\" style=\"--i:${i}\" title=\"Before admission\"><span class=\"n\">${i}</span></div>`;continue;}\n      const c=cell(d,k);h+=`<button type=\"button\" style=\"--i:${i}\" class=\"tp4-day"],
  ["  const kOf=d=>", "  /* admission day from the ward list (p.day = day of stay) */\n  const admOf=pid=>{const p=(typeof ptFind==='function'&&ptFind(pid))||null,n=p&&+p.day;if(!p||isNaN(n)||p.day===''||p.day==null)return null;const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()-n);return d;};\n  const kOf=d=>"],
  ["'.tp4-day.we:not(.has):not(.sel){background:#fafbfc}',", "'.tp4-day.we:not(.has):not(.sel){background:#fafbfc}','.tp4-day.pre{background:#f1f3f6;border-color:#eef0f3;cursor:default}.tp4-day.pre .n{color:#c0c6d0}.tp4-day.pre:hover{transform:none;box-shadow:none}',"],
  // groups card: schedule order and times
  ["      <div class=\"tp4-col\">${card('Groups','',D.names.map((n,i)=>",
   "      <div class=\"tp4-col\">${card('Groups','<span class=\"tp4-sub\">Daily roster</span>',D.names.slice().sort((a,b)=>gOrd(a)-gOrd(b)).map(n=>[n,D.names.indexOf(n)]).map(([n,i])=>"],
  ["<b>${E(n)}</b></span><b>${(D.tot[n]", "<b>${E(n)}</b>${gTime(n)?`<span class=\"tp4-sub\">${gTime(n)}</span>`:''}</span><b>${(D.tot[n]"],
  ["  function vGrp(pid){", "  /* Tulasi's daily group roster (Nikita, 24 Nov) */\n  const GRS=[[/prayer/i,'10 am'],[/crt|cognitive|addiction/i,'10:30 to 11:30 am'],[/psychoeducation/i,'12 to 12:45 pm'],[/recreation|dance|art|music/i,'2 to 3 pm'],[/yoga/i,'4 to 5 pm']];\n  const gOrd=n=>{const i=GRS.findIndex(g=>g[0].test(n));return i<0?99:i;},gTime=n=>{const g=GRS.find(g=>g[0].test(n));return g?g[1]:'';};\n  function vGrp(pid){"],
]);
