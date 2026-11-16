const fs=require('fs'),path=require('path');
const q=path.join(__dirname,'..','public','legacy','js','61-psychologist-segmented-js.js');let t=fs.readFileSync(q,'utf8');const c2=t.includes('\r\n');t=t.replace(/\r\n/g,'\n');
const a="  .pg-seg button.on{background:none!important;color:#fff}";
if(t.split(a).length!==2)throw new Error('no match');
t=t.split(a).join("  .pg-seg button.on{background:linear-gradient(180deg,#2f7df0,#175cd3)!important;color:#fff;box-shadow:0 1px 3px rgba(23,92,211,.35)}\n  .pg-seg .pg-ind{display:none!important}");
if(c2)t=t.replace(/\n/g,'\r\n');fs.writeFileSync(q,t);new Function(t);console.log('ok');
