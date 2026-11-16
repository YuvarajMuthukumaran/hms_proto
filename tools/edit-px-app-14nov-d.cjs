/* 14 Nov 2026: owners on the seeded grievances match the HMS records (Neel: Priya Nair; Varun: Dr. Kunal Sethi; Kavya: Surabhi Sengar; Rahul: Kiran Mehra) */
const fs=require('fs');const file='public/px-lead-prototype.html';const src=fs.readFileSync(file,'utf8');
const tag='<script type="__bundler/template">';const i0=src.indexOf(tag,100000)+tag.length,i1=src.indexOf('</script>',i0);
let t=JSON.parse(src.slice(i0,i1).trim());
function R(a,b){const n=t.split(a).length-1;if(n!==1)throw new Error('match '+n+': '+a.slice(0,80));t=t.split(a).join(b);}
R("raisedBy: 'Kiran Rao, brother', via: 'Front desk', owner: 'Dr. Ichpreet Singh',","raisedBy: 'Kiran Rao, brother', via: 'Front desk', owner: 'Dr. Kunal Sethi',");
R("raisedBy: 'Ananya Bose, sister', via: 'Coordinator call', owner: 'Kiran Mehra',","raisedBy: 'Ananya Bose, sister', via: 'Coordinator call', owner: 'Priya Nair',");
R("[['p2', 'Kiran Mehra', '1222222', 'Sun 9 Nov, 7:40 pm', 'same'], ['p4', 'Priya Nair', '1111111', 'Sun 9 Nov, 6:55 pm', 'ok'], ['p5', 'Kiran Mehra', '1101001',","[['p2', 'Priya Nair', '1222222', 'Sun 9 Nov, 7:40 pm', 'same'], ['p4', 'Kiran Mehra', '1111111', 'Sun 9 Nov, 6:55 pm', 'ok'], ['p5', 'Surabhi Sengar', '1101001',");
R("['p6', 'Barkha', '1111101',","['p6', 'Kiran Mehra', '1111101',");
fs.writeFileSync(file,src.slice(0,i0)+'\n'+JSON.stringify(t).split('</').join('<'+String.fromCharCode(92)+'/')+'\n'+src.slice(i1));console.log('ok');
