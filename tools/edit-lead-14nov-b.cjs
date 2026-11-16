const fs=require('fs'),f='public/legacy/js/91-lead-psy-today-13nov-js.js';let s=fs.readFileSync(f,'utf8');
function rep(a,b){if(!s.includes(a))throw new Error('not found: '+a.slice(0,70));s=s.split(a).join(b);}
rep("const g=i.k==='fam'||i.k==='famcall'?'families':i.k==='sign'||i.k==='cosign'?'to sign':i.k==='nosess'||i.k==='noplan'?'sessions':'scores';",
    "const g=i.k==='fam'||i.k==='famcall'?'families':i.k==='sign'||i.k==='cosign'?'to sign':i.k==='nosess'||i.k==='noplan'?'sessions behind':'scores missing';");
rep("const done=mine.filter(p=>{const a=sessAge(p);return a===0;}).length,planned=leave?0:Math.max(done,PLANNED[n]||0);",
    "const t0=new Date().setHours(0,0,0,0),done=M.all.reduce((c,p)=>c+notesOf(p).filter(q=>q.status==='signed'&&q.ts>=t0&&String(q.by||'').indexOf(n)===0).length,0),planned=leave?0:Math.max(done,PLANNED[n]||0);");
rep("<div class=\"small\">${mine.length} patients · ${planned?done+' of '+planned+' sessions today':'no sessions today'}</div>",
    "<div class=\"small\">${n==='Ankit Verma'?'Assistant psychologist':mine.length+' patients'} · ${planned?done+' of '+planned+' sessions today':'no sessions today'}</div>");
rep("if(dn&&dn!==mineName&&iss.some(i=>i.k!=='nopsy'))more+=","if(dn&&dn!==mineName&&!onLeave(dn)&&iss.some(i=>i.k!=='nopsy'))more+=");
fs.writeFileSync(f,s);console.log('ok');
