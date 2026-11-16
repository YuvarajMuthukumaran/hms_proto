/* 14 Nov 2026: PX app: Setting page in the menu, the 3 h / 6 h clock limits from Setting, the safety grievance G-0145 (Chandraji, needs an incident report number) in the list, G-0140 raised by the patient */
const fs=require('fs');
const file='public/px-lead-prototype.html';const src=fs.readFileSync(file,'utf8');
const tag='<script type="__bundler/template">';const i0=src.indexOf(tag,100000)+tag.length,i1=src.indexOf('</script>',i0);
let t=JSON.parse(src.slice(i0,i1).trim());
function R(a,b){const n=t.split(a).length-1;if(n!==1)throw new Error('match '+n+': '+a.slice(0,80));t=t.split(a).join(b);}
R("'rounds2', 'calendar2'];","'rounds2', 'calendar2', 'setting2'];");
R("['calendar2', 'Calendar', 0], ['training2', 'Staff training', 0], ['reports2', 'Reports', 0]];","['calendar2', 'Calendar', 0], ['training2', 'Staff training', 0], ['reports2', 'Reports', 0], ['setting2', 'Setting', 0]];");
R("NZ.isCalendar2 = s.screen === 'calendar2';","NZ.isCalendar2 = s.screen === 'calendar2'; NZ.isSetting2 = s.screen === 'setting2';");
R("NZ.pageTitle = { rounds2: 'Rounds',","NZ.pageTitle = { setting2: 'Setting', rounds2: 'Rounds',");
R('<sc-if value="{{isCalendar2}}" hint-placeholder-val="{{false}}"><iframe class="px-emb" title="Calendar" src="px/calendar.html?embed=1"></iframe></sc-if>','<sc-if value="{{isCalendar2}}" hint-placeholder-val="{{false}}"><iframe class="px-emb" title="Calendar" src="px/calendar.html?embed=1"></iframe></sc-if>\n<sc-if value="{{isSetting2}}" hint-placeholder-val="{{false}}"><iframe class="px-emb" title="Setting" src="px/setting.html?embed=1"></iframe></sc-if>');
/* the safety grievance (the PX Today page already lists it) */
R("      { id: 'G-0142', type: 'request',","      { id: 'G-0145', type: 'grievance', pid: 'p2', title: 'Brother says a night attendant pushed Neel', raisedBy: 'Rohan Bose, brother', via: 'Coordinator call', src: 'family', owner: 'S Chandra', ownerRole: 'GM Operations and treating doctor', category: 'Safety', sla: 'Chandraji told 9:12 am', slaTone: 'red', logged: 'today, 9:10 am', status: 'Open', desc: 'Called Prabh at 9:10 am. Says a night attendant pushed Neel in the corridor last night. Safety concern: Chandraji and the treating doctor are told now. It cannot be closed without an incident report number.' },\n      { id: 'G-0142', type: 'request',");
R("{ id: 'G-0140', type: 'concern', pid: 'p2', title: 'Room too noisy at night', raisedBy: 'Neel Bose, patient', via: 'Ward staff',","{ id: 'G-0140', type: 'concern', pid: 'p2', title: 'Room too noisy at night', raisedBy: 'Neel Bose, patient', via: 'Patient told us', src: 'patient',");
R("var M4SEED = { 'G-0142': 3.4,","var M4SEED = { 'G-0145': 0.6, 'G-0142': 3.4,");
/* clock limits from Setting */
R("    var M4born = self.__born || (self.__born = {});","    var PXSET = (function () { try { return JSON.parse(localStorage.getItem('px_settings_v1') || '{}') || {}; } catch (e) { return {}; } })(), LIMR = +PXSET.remindH || 3, LIMC = +PXSET.chandraH || 6;\n    var M4born = self.__born || (self.__born = {});");
R("if (a >= 6) return { n: 'chandra', s: own === 'S Chandra' ? 'With Chandraji' : 'Sent to Chandraji', t: 'Open for ' + hrs + '. Sent to S Chandra (GM Operations) at 6 h.' + back,","if (a >= LIMC) return { n: 'chandra', s: own === 'S Chandra' ? 'With Chandraji' : 'Sent to Chandraji', t: 'Open for ' + hrs + '. Sent to S Chandra (GM Operations) at ' + LIMC + ' h.' + back,");
R("if (a >= 3) return { n: 'reminded', s: 'Owner reminded', t: 'Open for ' + hrs + '. Reminder sent to ' + own + ' at 3 h. Goes to Chandraji at 6 h.' + back,","if (a >= LIMR) return { n: 'reminded', s: 'Owner reminded', t: 'Open for ' + hrs + '. Reminder sent to ' + own + ' at ' + LIMR + ' h. Goes to Chandraji at ' + LIMC + ' h.' + back,");
const out=src.slice(0,i0)+'\n'+JSON.stringify(t).split('</').join('<'+String.fromCharCode(92)+'/')+'\n'+src.slice(i1);
fs.writeFileSync(file,out);console.log('ok');
