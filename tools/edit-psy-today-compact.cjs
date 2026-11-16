const fs=require('fs'),path=require('path');
const p=path.join(__dirname,'..','public','legacy','js','71-psychologist-review-11nov-js.js');let s=fs.readFileSync(p,'utf8');const crlf=s.includes('\r\n');s=s.replace(/\r\n/g,'\n');
const a="  .pg-dl .pg-di{padding:5px 0}.pg-dl .pg-dt b{font-weight:650}";
if(s.split(a).length!==2)throw new Error('no match');
s=s.split(a).join("  .pg-dl .pg-di{padding:2px 0;gap:10px;align-items:center}.pg-dl .pg-dt b{font-weight:650;font-size:13.5px}\n  /* compact Due today: title and detail on one line, the button on the right (13 Nov) */\n  .pg-dl{gap:0!important}.pg-dl .pg-dt{flex-direction:row;flex-wrap:wrap;align-items:baseline;gap:0 8px;flex:1}.pg-dl .pg-dt span{font-size:12px}.pg-dl .pg-dd{margin-top:0}.pg-dl .pg-dt .btn{margin:0 0 0 auto!important;height:26px;padding:0 10px;font-size:12px}");
if(crlf)s=s.replace(/\n/g,'\r\n');fs.writeFileSync(p,s);new Function(s);console.log('ok');
