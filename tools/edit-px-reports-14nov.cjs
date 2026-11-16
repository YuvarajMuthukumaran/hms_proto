/* 14 Nov 2026: Reports reads real data: concerns closed in 6 h from Grievances (px_state pxg rows), discharge feedback from px_fb_v1 (saved by the PX app), random calls from the call logs.
   Feedback is saved by the PX app into px_fb_v1 so it survives a refresh. */
const fs=require('fs');
let file='public/px-lead-prototype.html';const src=fs.readFileSync(file,'utf8');
const tag='<script type="__bundler/template">';const i0=src.indexOf(tag,100000)+tag.length,i1=src.indexOf('</script>',i0);
let t=JSON.parse(src.slice(i0,i1).trim());
function R(a,b){const n=t.split(a).length-1;if(n!==1)throw new Error('match '+n+': '+a.slice(0,80));t=t.split(a).join(b);}
R("checks: {}, fbSaved: [], fbMsg: '',","checks: {}, fbSaved: (function () { try { return (JSON.parse(localStorage.getItem('px_fb_v1') || '{}') || {}).saved || []; } catch (e) { return []; } })(), fbMsg: '',");
R("    NZ.isToday2 = s.screen === 'today2';","    try { var fbj = JSON.stringify({ saved: s.fbSaved, total: F.length }); if (localStorage.getItem('px_fb_v1') !== fbj) localStorage.setItem('px_fb_v1', fbj); } catch (e) {}\n    NZ.isToday2 = s.screen === 'today2';");
fs.writeFileSync(file,src.slice(0,i0)+'\n'+JSON.stringify(t).split('</').join('<'+String.fromCharCode(92)+'/')+'\n'+src.slice(i1));
file='public/px/reports.html';let s=fs.readFileSync(file,'utf8');
function S(a,b){if(s.split(a).length-1!==1)throw new Error('S '+a.slice(0,60));s=s.replace(a,()=>b);}
S("Counted from what is logged: random calls, compliments and staff training. The other figures are demo numbers until grievances and discharge feedback are saved to the shared store.","Counted from what is logged: random calls, concerns closed (Grievances), discharge feedback, compliments and staff training. The steps-on-time bars other than random calls are demo numbers until the stay steps are logged in the HMS.");
S("let S={per:'week',told:{}};",`/* discharge feedback taken (px_fb_v1, saved by the PX app): x of y, and the NPS from the 0 to 10 answers */
try{const F=JSON.parse(localStorage.getItem('px_fb_v1')||'null');if(F&&Array.isArray(F.saved)&&F.total){const n=F.saved.length,pro=F.saved.filter(x=>x.nps>=9).length,det=F.saved.filter(x=>x.nps<=6).length,nps=n?Math.round((pro-det)/n*100):0,T=PER.week.tiles.fb;PER.week.tiles.fb=[n,F.total,T[2],T[3],'NPS '+(nps>0?'+':'')+nps,T[5]];}}catch(e){}
/* steps on time: random calls 1 and 2 = share of admitted patients with two answered calls */
try{const cnt={};const M=JSON.parse(localStorage.getItem('px_calls_main_v1')||'{}')||{};Object.keys(M).forEach(k=>(M[k]||[]).forEach(l=>{if(l&&l.rc)cnt[k]=(cnt[k]||0)+1;}));(JSON.parse(localStorage.getItem('px_calls_v1')||'[]')||[]).forEach(c=>{if(c&&c.outcome==='Connected')cnt[c.name]=(cnt[c.name]||0)+1;});const two=Object.keys(cnt).filter(k=>cnt[k]>=2).length;const st=PER.week.steps.filter(x=>/Random calls/.test(x[0]))[0];if(st){st[1]=Math.round(two/34*100);}}catch(e){}
/* concerns closed in 6 h: from the Grievances list when the shared store is on */
(function(){fetch('/api/config',{cache:'no-store'}).then(r=>r.json()).then(j=>{if(!j||!j.supabase||!j.pxStore)return;const c=j.supabase;return fetch(c.url+'/rest/v1/px_state?select=key,data&key=like.pxg:*',{headers:{apikey:c.key,Authorization:'Bearer '+c.key,'x-tulasi-role':'patient-experience-lead'}}).then(r=>r.ok?r.json():[]).then(rows=>{let y=0,x=0;(rows||[]).forEach(r=>{const d=typeof r.data==='string'?JSON.parse(r.data):r.data;if(!d||!d.c)return;const st=d.st||{},status=st.status||d.c.status;if(status!=='Resolved')return;y++;const m=String(st.sla||d.c.sla||'').match(/Closed in ([\d.]+) h/);if(m&&+m[1]<=6)x++;});if(y){const T=PER.week.tiles.closed;PER.week.tiles.closed=[x,y,T[2],T[3]];render();}});}).catch(()=>{});})();
let S={per:'week',told:{}};`);
fs.writeFileSync(file,s);const r=/<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/g;let m;while((m=r.exec(s)))new Function(m[1]);
const j=JSON.parse(fs.readFileSync(file,'utf8').length?'{}':'{}');console.log('ok');
