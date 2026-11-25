// 25 Nov (owner): PX Grievances: Issues card redesigned (numbered tiles, category colour, quote of what was said, owner chip,
// one gentle entrance per grievance), stage bar labels wrap instead of overlapping ("Resolved" / "Family communicated").
const fs=require('fs'),F=require('path').join(__dirname,'..','public','px','grievances.html');let s=fs.readFileSync(F,'utf8');const crlf=s.includes('\r\n');s=s.split('\r\n').join('\n');
const rep=(a,b)=>{if(!s.includes(a))throw new Error('missing: '+a.slice(0,70));s=s.split(a).join(b);};
// stage labels
rep(`.stp{position:relative;display:flex;flex-direction:column;align-items:center;gap:8px;padding:0 4px;border:0;background:none;text-align:center;font-size:13px;line-height:1.3;color:var(--mute);cursor:pointer;white-space:nowrap;min-width:0}`,
`.stp{position:relative;display:flex;flex-direction:column;align-items:center;gap:8px;padding:0 6px;border:0;background:none;text-align:center;font-size:13px;line-height:1.25;color:var(--mute);cursor:pointer;white-space:normal;min-width:0}.stp>span:last-child{display:block;max-width:100%;overflow-wrap:anywhere}.stp .opt{display:block;margin-top:1px}`);
// issue tiles
rep(`.iss{border-top:1px solid #F2F4F7;padding:14px 0}.iss:first-of-type{border-top:0;padding-top:2px}`,
`.iss{border-top:1px solid #F2F4F7;padding:14px 0}.iss:first-of-type{border-top:0;padding-top:2px}
.iss.it{--h:#1E6CDB;position:relative;border:1px solid var(--line);border-radius:14px;padding:14px 16px 14px 18px;margin:0 0 10px;background:linear-gradient(90deg,color-mix(in srgb,var(--h) 5%,#fff),#fff 38%);overflow:hidden;transition:border-color .2s,box-shadow .2s}
.iss.it:first-of-type{padding-top:14px;border-top:1px solid var(--line)}.iss.it:last-of-type{margin-bottom:0}
.iss.it::before{content:"";position:absolute;left:0;top:0;bottom:0;width:4px;background:var(--h)}
.iss.it:hover{border-color:color-mix(in srgb,var(--h) 45%,#E4E7EC);box-shadow:0 4px 14px -8px color-mix(in srgb,var(--h) 60%,transparent)}
.it-top{display:flex;gap:12px;align-items:flex-start}
.it-n{flex:none;width:30px;height:30px;border-radius:9px;display:grid;place-items:center;font-weight:800;font-size:14px;color:var(--h);background:color-mix(in srgb,var(--h) 12%,#fff);border:1px solid color-mix(in srgb,var(--h) 25%,#fff)}
.it-b{flex:1;min-width:0}.it-b h4{margin:2px 0 6px;font-size:16px;letter-spacing:-.1px}
.it-m{display:flex;flex-wrap:wrap;gap:6px 10px;align-items:center;font-size:13px;color:var(--mute)}
.it-cat{font-weight:700;color:var(--h);background:color-mix(in srgb,var(--h) 10%,#fff);border-radius:99px;padding:2px 10px}
.it-when{display:inline-flex;align-items:center;gap:4px}.it-when svg{width:13px;height:13px}
.it-q{margin:10px 0 0;padding:9px 12px;border-radius:10px;background:#F9FAFB;border:1px solid #F2F4F7;font-size:14.5px;color:#344054;line-height:1.5;position:relative}
.it-q::before{content:"\\201C";position:absolute;left:8px;top:-6px;font:700 26px/1 Georgia,serif;color:color-mix(in srgb,var(--h) 55%,#fff)}
.it-q p{margin:0 0 0 10px}.it-q p+p{margin-top:6px;padding-top:6px;border-top:1px dashed #E4E7EC}.it-q small{display:block;font-size:11.5px;font-weight:700;color:#98A2B3;margin:0 0 1px 10px}
.it-own{display:inline-flex;align-items:center;gap:8px;margin-top:10px;padding:4px 6px 4px 4px;border:1px solid var(--line);border-radius:99px;background:#fff;font-size:13.5px;color:#475467}
.it-own .av{width:24px;height:24px;font-size:11.5px}.it-own b{color:var(--ink)}
.it-own .lnk{display:inline-flex;align-items:center;gap:3px;padding:2px 8px;border-radius:99px;background:#EFF4FF;font-size:12.5px}.it-own .lnk svg{width:12px;height:12px}
.iss.it .asks{margin:10px 0 0 42px}
.iss.it.in{animation:itIn .45s cubic-bezier(.2,.7,.2,1) both;animation-delay:calc(var(--i) * 70ms)}
@keyframes itIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){.iss.it.in{animation:none}.iss.it{transition:none}}`);
const oldIssue=`  return '<div class="iss"><div class="ih"><div style="display:flex;gap:10px"><div><h4>'+esc(i.t)+'</h4><div class="sub">'+esc([i.cat,i.when].filter(Boolean).join(' · '))+'</div><div class="iown"><span class="av">'+esc(ini(ownerName(c,i.owner)))+'</span>Owner: <b>'+esc(ownerName(c,i.owner)||'Not set')+'</b> <button class="lnk" data-ied="'+k+'">Edit</button></div></div></div>'
    +'</div>'
    +((i.what||i.fam)?'<ul>'+(i.what?'<li>'+esc(i.what)+'</li>':'')+(i.fam?'<li>'+esc(i.fam)+'</li>':'')+'</ul>':'<div style="height:6px"></div>')`;
rep(oldIssue,`  const ITH=['#1E6CDB','#0E9384','#7A5AF8','#C4740C','#D92D20','#C4316F','#0B87C2','#138A4E'],hk=String(i.cat||i.t||'');let hh=0;for(const ch of hk)hh=(hh*31+ch.charCodeAt(0))>>>0;
  const seen=window.__itSeen||(window.__itSeen={}),sk=(c.id||'')+':'+k,first=!seen[sk];seen[sk]=1;
  const clk='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>';
  const pen='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>';
  return '<div class="iss it'+(first?' in':'')+'" style="--h:'+ITH[hh%ITH.length]+';--i:'+k+'"><div class="it-top"><span class="it-n">'+(k+1)+'</span><div class="it-b"><h4>'+esc(i.t)+'</h4>'
    +'<div class="it-m">'+(i.cat?'<span class="it-cat">'+esc(i.cat)+'</span>':'')+(i.when?'<span class="it-when">'+clk+esc(i.when)+'</span>':'')+'</div>'
    +((i.what||i.fam)?'<div class="it-q">'+(i.what?'<small>What was said</small><p>'+esc(i.what)+'</p>':'')+(i.fam?'<small>Family</small><p>'+esc(i.fam)+'</p>':'')+'</div>':'')
    +'<div class="it-own"><span class="av">'+esc(ini(ownerName(c,i.owner)))+'</span>Owner <b>'+esc(ownerName(c,i.owner)||'Not set')+'</b><button class="lnk" data-ied="'+k+'" aria-label="Change owner">'+pen+'Edit</button></div>'
    +'</div></div>'`);
if(crlf)s=s.split('\n').join('\r\n');fs.writeFileSync(F,s);console.log('ok');
