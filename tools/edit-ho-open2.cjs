const fs=require('fs'),path=require('path');
const p=path.join(__dirname,'..','public','legacy','js','83-automation-12nov-js.js');let s=fs.readFileSync(p,'utf8');const crlf=s.includes('\r\n');s=s.replace(/\r\n/g,'\n');
const i=s.indexOf("    const hd=b.querySelector('.hv-rc-hd');if(hd){const btn=document.createElement('button');");const j=s.indexOf("hd.appendChild(btn);}}",i)+"hd.appendChild(btn);}}".length;
if(i<0||j<i)throw new Error('no match');
s=s.slice(0,i)+"    b.classList.add('k-open'); /* the handover is open by default; its own Hide / Show button closes it */\n  }"+s.slice(j);
if(crlf)s=s.replace(/\n/g,'\r\n');fs.writeFileSync(p,s);new Function(s);console.log('ok');
