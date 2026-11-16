/* 14 Nov 2026 (manual audit, Trello 117 and 144): Grievances status words from the card (Safety, Ready to confirm, With owner, Past 6 h, Closed),
   "Treating psychiatrist / psychologist" owners show the patient's named doctor, and Karan Malhotra's family concern (seen by the lead psychologist) is in the list. */
const fs=require('fs');const file='public/px-lead-prototype.html';const src=fs.readFileSync(file,'utf8');
const tag='<script type="__bundler/template">';const i0=src.indexOf(tag,100000)+tag.length,i1=src.indexOf('</script>',i0);
let t=JSON.parse(src.slice(i0,i1).trim());
function R(a,b){const n=t.split(a).length-1;if(n!==1)throw new Error('match '+n+': '+a.slice(0,80));t=t.split(a).join(b);}
/* status label and named owner */
R("rawStatus: c.status,","rawStatus: c.status, stLabel: closed ? 'Closed' : c.category === 'Safety' ? 'Safety' : stg.n === 'confirm' ? 'Ready to confirm' : (c.slaTone === 'red' || /breach|past/i.test(String(c.sla || ''))) ? 'Past 6 h' : 'With owner', owner: (c.owner === 'Treating psychiatrist' && p && p.doctor) ? p.doctor : (c.owner === 'Treating psychologist' && p && p.psych) ? p.psych : c.owner,");
R('<sc-raw-td><span class="{{c.statusCls}}">{{c.status}}</span>','<sc-raw-td><span class="{{c.statusCls}}">{{c.stLabel}}</span>');
R('<span class="{{cur.statusCls}}">{{cur.status}}</span>','<span class="{{cur.statusCls}}">{{cur.stLabel}}</span>');
/* Karan Malhotra (HMS id kabir): the open family concern the lead psychologist sees */
R("{ id: 'G-0145'","{ id: 'G-0146', type: 'concern', pid: 'kabir', title: 'Nobody has told us anything this week', raisedBy: 'Rajesh Malhotra, father', via: 'Coordinator call', src: 'family', owner: 'Priya Nair', ownerRole: 'Treating psychologist', category: 'Family updates', sla: 'Breached 30 m ago', slaTone: 'red', logged: 'today, 8:40 am', status: 'Open', desc: 'Father called. No update from the team this week. Priya Nair is on leave; the psychologist lead (Surabhi Sengar) has been told.' },\n      { id: 'G-0145'");
R("4SEED = { 'G-0145': 0.6,","4SEED = { 'G-0146': 6.5, 'G-0145': 0.6,");
fs.writeFileSync(file,src.slice(0,i0)+'\n'+JSON.stringify(t).split('</').join('<'+String.fromCharCode(92)+'/')+'\n'+src.slice(i1));
console.log('ok');
