const fs=require('fs'),path=require('path');
const p=path.join(__dirname,'..','public','legacy','js','07-wa-port-js.js');let s=fs.readFileSync(p,'utf8');const crlf=s.includes('\r\n');s=s.replace(/\r\n/g,'\n');
const a="async function waPost(p,body){const c=waCfg();";if(s.split(a).length!==2)throw new Error('m');
s=s.split(a).join("async function waPost(p,body){\n  /* card 142 (13 Nov): no network call at all in the demo. Real sending needs window.TULASI_LIVE_SEND === true, which is not set anywhere. */\n  if(window.TULASI_LIVE_SEND!==true){toast('Demo mode: would send to the WhatsApp group. Nothing was sent.');return {ok:true,simulated:true};}\n  const c=waCfg();");
if(crlf)s=s.replace(/\n/g,'\r\n');fs.writeFileSync(p,s);new Function(s);console.log('ok');
