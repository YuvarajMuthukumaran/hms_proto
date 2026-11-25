/* 25 Nov (Anu): MECT order gets the Pre-ECT work-up label and an ECT sessions section (block 198). Run once from public/legacy/js. */
const fs=require('fs');let f='198-orders-consents-24nov-js.js',s=fs.readFileSync(f,'utf8');const crlf=s.includes('\r\n');s=s.split('\r\n').join('\n');
function R(a,b){if(!s.includes(a))throw new Error('miss '+a.slice(0,80));s=s.split(a).join(b);}
R("      <div class=\"o2-wu\"><div class=\"o2-tl\">${TT.map(","      <div class=\"o2-wu\"><div class=\"o2-tl\">${o.tpl==='mect'?'<div class=\"o2-wul\">Pre-ECT work-up</div>':''}${TT.map(");
const END="${t.waits?E(t.label):'Save'}</button></div>`}</div></div>`;\n  }";
R(END,"${t.waits?E(t.label):'Save'}</button></div>`}</div></div>${o.tpl==='mect'?ectHtml(pid,o):''}`;\n  }\n"+fs.readFileSync(__dirname+'/ect-part-25nov.js','utf8'));
fs.writeFileSync(f,crlf?s.split('\n').join('\r\n'):s);
