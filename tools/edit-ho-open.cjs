const fs=require('fs'),path=require('path');
const p=path.join(__dirname,'..','public','legacy','js','83-automation-12nov-js.js');let s=fs.readFileSync(p,'utf8');const crlf=s.includes('\r\n');s=s.replace(/\r\n/g,'\n');
const a="btn.className='btn sm';btn.textContent='View';btn.onclick=()=>b.classList.toggle('k-open');hd.appendChild(btn);}}";
if(s.split(a).length!==2)throw new Error('no match');
s=s.split(a).join("btn.className='btn sm';if(!S.hvClosed)b.classList.add('k-open');btn.textContent=S.hvClosed?'View':'Hide';btn.onclick=()=>{const o=b.classList.toggle('k-open');S.hvClosed=!o;btn.textContent=o?'Hide':'View';};hd.appendChild(btn);}}");
if(crlf)s=s.replace(/\n/g,'\r\n');fs.writeFileSync(p,s);new Function(s);
/* Mine / Whole ward: the count badge is clipped by the sliding pill */
const q=path.join(__dirname,'..','public','legacy','js','61-psychologist-segmented-js.js');let t=fs.readFileSync(q,'utf8');const c2=t.includes('\r\n');t=t.replace(/\r\n/g,'\n');
const b2="  .pg-scope.pg-seg button.on .pg-n,.pg-mine.pg-seg button.on .pg-n{background:rgba(255,255,255,.28);color:#fff}";
if(t.split(b2).length!==2)throw new Error('no seg');
t=t.split(b2).join(b2+"\n  .pg-scope.pg-seg button,.pg-mine.pg-seg button{padding:5px 14px 5px 14px}.pg-scope.pg-seg .pg-n,.pg-mine.pg-seg .pg-n{margin-right:2px}");
if(c2)t=t.replace(/\n/g,'\r\n');fs.writeFileSync(q,t);new Function(t);console.log('ok');
