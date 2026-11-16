/* One-off (13 Nov 2026): Therapy Plans > Group redesigned as one card per group (attendance pips, count, latest line). */
const fs=require('fs'),path=require('path');
const p=path.join(__dirname,'..','public','legacy','js','82-therapy-plans-12nov-js.js');let s=fs.readFileSync(p,'utf8');const crlf=s.includes('\r\n');s=s.replace(/\r\n/g,'\n');
const i0=s.indexOf("    return `<div class=\"scroll\"><table><thead><tr><th>Group</th>");const i1=s.indexOf("\n  }\n  window.tpAttend",i0);
if(i0<0||i1<i0)throw new Error('markers');
const NEW=`    const all=GROUPS.map(g=>({g,st:strip(g[0])})),att=all.reduce((n,x)=>n+x.st.filter(c=>c==='a').length,0),tot=all.length*5;
    const lab={a:'Attended',p:'Part of it',x:'Refused'};
    return \`<div class="tg-top"><div class="tg-sum"><b>\${att} of \${tot}</b> recent sessions attended across \${all.length} groups</div><div class="tg-key"><span><i class="a"></i>Attended</span><span><i class="p"></i>Part of it</span><span><i class="x"></i>Refused</span></div></div>
      <div class="tg-grid">\${all.map(x=>{const n=x.st.filter(c=>c==='a').length;return \`<article class="tg-c"><div class="tg-h"><div><b>\${x.g[0]}</b><span>Led by \${x.g[2]}</span></div><span class="tg-when">\${x.g[1]}</span></div>
        <div class="tg-att"><div class="tg-pips" role="img" aria-label="Last 5 sessions: \${x.st.map(c=>lab[c]).join(', ')}">\${x.st.map((c,i)=>'<i class="'+c+'" title="Session '+(i+1)+' of the last 5: '+lab[c]+'"></i>').join('')}</div><span class="tg-n"><b>\${n}</b> of 5</span></div>
        <blockquote class="tg-q">\${esc(line(x.g[0]))}</blockquote></article>\`;}).join('')}</div>
      <div class="tiny muted" style="margin-top:10px">Groups are run from the group roster: one note for the room, one line for each patient.</div>\`;`;
s=s.slice(0,i0)+NEW+s.slice(i1);
const c0="  .tp-dots{display:inline-flex;gap:5px}";
if(s.split(c0).length!==2)throw new Error('css');
s=s.split(c0).join(`  .tg-top{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin:4px 0 12px}.tg-sum{font-size:13.5px;color:#475467}.tg-sum b{color:#101828;font-size:15px}
  .tg-key{display:flex;gap:14px;font-size:12px;color:#667085}.tg-key span{display:inline-flex;align-items:center;gap:6px}.tg-key i,.tg-pips i{display:inline-block;width:12px;height:12px;border-radius:4px}.tg-key i.a,.tg-pips i.a{background:#1f9d57}.tg-key i.p,.tg-pips i.p{background:#f5a524}.tg-key i.x,.tg-pips i.x{background:#e5484d}
  .tg-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(270px,1fr));gap:12px}.tg-c{border:1px solid #e3eaf2;border-radius:14px;padding:14px 16px;background:#fff;display:flex;flex-direction:column;gap:12px}
  .tg-h{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}.tg-h b{display:block;font-size:15px;font-weight:650;color:#101828;line-height:1.3}.tg-h span{font-size:12.5px;color:#667085}.tg-when{white-space:nowrap;font-weight:650;color:#1e5bb8!important;background:#eef4ff;border-radius:8px;padding:3px 9px;font-size:12px!important}
  .tg-att{display:flex;align-items:center;justify-content:space-between;gap:10px}.tg-pips{display:flex;gap:5px}.tg-pips i{width:22px;height:22px;border-radius:6px}.tg-n{font-size:12.5px;color:#667085}.tg-n b{font-size:16px;color:#101828}
  .tg-q{margin:0;padding:2px 0 2px 12px;border-left:3px solid #d5e1ef;font-size:13.5px;color:#344054;line-height:1.45}
`+c0);
if(crlf)s=s.replace(/\n/g,'\r\n');fs.writeFileSync(p,s);new Function(s);console.log('ok');
