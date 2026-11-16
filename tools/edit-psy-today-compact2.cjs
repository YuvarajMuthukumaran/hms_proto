const fs=require('fs'),path=require('path');
const p=path.join(__dirname,'..','public','legacy','js','71-psychologist-review-11nov-js.js');let s=fs.readFileSync(p,'utf8');const crlf=s.includes('\r\n');s=s.replace(/\r\n/g,'\n');
const a="<span>assigned by ${hesc(o.a.by)}, ${hesc(o.a.at)}</span><button class=\"btn sm\" style=\"margin-top:6px\" onclick=\"pgAsgDone('${pid}',${o.i})\">Mark done</button>";
if(s.split(a).length!==2)throw new Error('no match 1');
s=s.split(a).join("<span>${hesc(String(o.a.by||'').replace(/^Dr\.\s*/,'Dr. '))} · ${hesc(String(o.a.at||'').split(',')[0].replace(/\s\d{4}$/,''))}</span><button class=\"btn sm\" onclick=\"pgAsgDone('${pid}',${o.i})\">Mark done</button>");
const b=".pg-dl .pg-dd{margin-top:0}";
if(s.split(b).length!==2)throw new Error('no match 2');
s=s.split(b).join(b+".pg-dl .pg-dt{flex-wrap:nowrap}.pg-dl .pg-dt b{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}.pg-dl .pg-dt span{white-space:nowrap;flex:none}.pg-dl .pg-di{align-items:center}");
if(crlf)s=s.replace(/\n/g,'\r\n');fs.writeFileSync(p,s);new Function(s);console.log('ok');
