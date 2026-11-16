/* One-off (13 Nov 2026), card 144: a call logged from the PX call window is saved (px_calls_v1, mirrored to the shared store when it is on) and shows again on the patient's Family tab after a refresh. */
const fs=require('fs'),path=require('path');
const D=f=>path.join(__dirname,'..','public','px',f);
const SAVE="try{const L=JSON.parse(localStorage.getItem('px_calls_v1')||'[]');L.unshift({pid:p.id,name:p.name,n:CM.n,outcome:res.outcome,who:res.who,words:res.words||'',ans:res.ans||{},grievance:g?{id:g.id,cat:g.cat,owner:g.owner}:null,at:new Date().toISOString()});localStorage.setItem('px_calls_v1',JSON.stringify(L.slice(0,200)));}catch(e){}\n    if(window.onCallSaved) window.onCallSaved(res);";
for(const f of ['today.html','patients.html','rounds.html']){
  let s=fs.readFileSync(D(f),'utf8');const crlf=s.includes('\r\n');s=s.replace(/\r\n/g,'\n');
  const a="    if(window.onCallSaved) window.onCallSaved(res);";const n=s.split(a).length-1;if(n<1)throw new Error('no save site in '+f);
  s=s.split(a).join('    '+SAVE);
  if(f==='patients.html'){
    const m="window.onCallSaved = r => {";if(s.split(m).length!==2)throw new Error('onCallSaved');
    s=s.split(m).join(`/* calls logged earlier (this browser, or the shared store when it is on) come back after a refresh */
window.addEventListener('load',()=>{try{const L=JSON.parse(localStorage.getItem('px_calls_v1')||'[]').slice().reverse();L.forEach(c=>{const p=P.find(x=>x.name===c.name);if(!p)return;const sm=c.outcome!=='Connected'?c.outcome:[c.ans&&c.ans.q1,c.ans&&c.ans.q2].filter(Boolean).join(' · ')+(c.words?' · “'+c.words+'”':'');S.calls[p.id]=[[new Date(c.at).toLocaleDateString('en-GB',{day:'numeric',month:'short'}),'Random call '+c.n+' of 2','Kanika',sm||'Connected',''],...(S.calls[p.id]||[])];});if(L.length&&typeof render==='function')render();}catch(e){}});
`+m);
  }
  if(crlf)s=s.replace(/\n/g,'\r\n');fs.writeFileSync(D(f),s);console.log(f,n);
}
