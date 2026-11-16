/* 14 Nov 2026, card 116 (buttons that do nothing): PX search opens the patient's record on the Patients page (it opened a screen that no longer exists) */
const fs=require('fs');let file='public/px-lead-prototype.html';const src=fs.readFileSync(file,'utf8');
const tag='<script type="__bundler/template">';const i0=src.indexOf(tag,100000)+tag.length,i1=src.indexOf('</script>',i0);
let t=JSON.parse(src.slice(i0,i1).trim());
function R(a,b){const n=t.split(a).length-1;if(n!==1)throw new Error('match '+n+': '+a.slice(0,80));t=t.split(a).join(b);}
R("self.setState({ searchOpen: false, topQ: '', screen: 'record', pid: p.id, recTab: 'stay' }); } }; });",
  "try { localStorage.setItem('pxopen', p.name); } catch (x) {} var fr = document.querySelector('iframe[title=Patients]'); if (fr && fr.contentWindow) { try { fr.contentWindow.postMessage({ pxOpen: p.name }, '*'); } catch (x) {} } self.setState({ searchOpen: false, topQ: '', screen: 'patients2' }); } }; });");
fs.writeFileSync(file,src.slice(0,i0)+'\n'+JSON.stringify(t).split('</').join('<'+String.fromCharCode(92)+'/')+'\n'+src.slice(i1));
file='public/px/patients.html';let s=fs.readFileSync(file,'utf8');
const a="window.CM_PATIENTS = P;\n";if(s.split(a).length-1!==1)throw new Error('CM');
s=s.replace(a,()=>a+"/* search in the top bar: open this patient's record (message from the app, or the name saved just before this page loaded) */\nfunction pxOpenByName(n){const p=P.find(x=>x.name===n);if(p)set({view:'rec',pid:p.id,rtab:'summary',nps:null,ratings:{},consent:null});}\nwindow.addEventListener('message',e=>{if(e.data&&e.data.pxOpen)pxOpenByName(e.data.pxOpen);});\ntry{const pn=localStorage.getItem('pxopen');if(pn){localStorage.removeItem('pxopen');pxOpenByName(pn);}}catch(e){}\n");
fs.writeFileSync(file,s);
let ok=0;const r=/<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/g;let m;while((m=r.exec(s))){new Function(m[1]);ok++;}console.log('ok',ok);
