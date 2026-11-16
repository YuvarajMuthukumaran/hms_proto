const fs=require('fs'),path=require('path');
const p=path.join(__dirname,'..','src','roles.ts');let s=fs.readFileSync(p,'utf8');const crlf=s.includes('\r\n');s=s.replace(/\r\n/g,'\n');
function R(a,b){if(s.split(a).length!==2)throw new Error('match: '+a.slice(0,60));s=s.split(a).join(b);}
R("  { key: 'floor-coordinator', label: 'Floor Coordinator', desc: 'All wards and teams' },\n","  /* Floor Coordinator is hidden for now (13 Nov): { key: 'floor-coordinator', label: 'Floor Coordinator', desc: 'All wards and teams' }, */\n");
R("export type PickerRole = (typeof ROLES)[number]['key'];","export type PickerRole = (typeof ROLES)[number]['key'] | 'floor-coordinator';");
R("  if (seg === 'lead') return 'floor-coordinator'; // the old link for the Floor Coordinator\n","  if (seg === 'lead') return null; // Floor Coordinator is hidden for now\n");
R("  return q === 'lead' ? 'floor-coordinator' : isRole(q) ? q : null;","  return q === 'lead' ? null : isRole(q) ? q : null;");
if(crlf)s=s.replace(/\n/g,'\r\n');fs.writeFileSync(p,s);console.log('ok');
