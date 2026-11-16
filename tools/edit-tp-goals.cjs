/* One-off (13 Nov 2026): Therapy Plans > Progress. Goals shown as a measure (start, now, aim on a ruler) with one plain sentence, instead of a bare progress bar. */
const fs=require('fs'),path=require('path');
const p=path.join(__dirname,'..','public','legacy','js','82-therapy-plans-12nov-js.js');let s=fs.readFileSync(p,'utf8');const crlf=s.includes('\r\n');s=s.replace(/\r\n/g,'\n');
function R(a,b){if(s.split(a).length!==2)throw new Error('match: '+a.slice(0,70));s=s.split(a).join(b);}
R("${g.map((x,i)=>{const n=nowOf(pid,i),pct=Math.max(0,Math.min(100,Math.round((n-x.start)/Math.max(1,x.aim-x.start)*100)));return `<button class=\"tp-goal\" onclick=\"tpGoal('${pid}',${i})\"><span class=\"tp-gt\">${esc(x.t)}</span><span class=\"tp-bar\"><i style=\"width:${pct}%\"></i></span><span class=\"tp-gn\">${x.start} → <b>${n}</b> → ${x.aim}</span></button>`;}).join('')}",
"${g.map((x,i)=>{const n=nowOf(pid,i),lo=Math.min(x.start,n,x.aim),hi=Math.max(x.start,n,x.aim),pos=v=>Math.round((v-lo)/Math.max(1,hi-lo)*100),sp=pos(x.start),np=pos(n),d=n-x.start,say=d===0?'Not moved from '+x.start+' yet':(d>0?'Up ':'Down ')+Math.abs(d)+' from the start of '+x.start;return `<button class=\"tp-goal\" onclick=\"tpGoal('${pid}',${i})\"><span class=\"tp-gt\"><b>${esc(x.t)}</b><em>${say}, aim ${x.aim}</em></span><span class=\"tp-rl\" aria-hidden=\"true\"><i class=\"tp-rf\" style=\"left:${Math.min(sp,np)}%;width:${Math.abs(np-sp)}%\"></i><i class=\"tp-rs\" style=\"left:${sp}%\"></i><i class=\"tp-ra\" style=\"left:${pos(x.aim)}%\"></i><i class=\"tp-rn\" style=\"left:${np}%\"></i></span><span class=\"tp-gn\"><b>${n}</b><small>of ${x.aim}</small></span></button>`;}).join('')}");
R("'<div class=\"small muted\">Nothing to change. Goals and homework are on track.</div>'","'<div class=\"tp-ok\"><span>✓</span>On track. No change needed to goals or homework.</div>'");
const c0="  .tp-bar{height:8px;";
R(c0,`  .tp-goal{grid-template-columns:minmax(0,1.5fr) minmax(160px,1fr) 64px;gap:22px;padding:14px 18px;border-radius:14px}
  .tp-gt{display:flex;flex-direction:column;gap:3px}.tp-gt b{font-size:14.5px;font-weight:650;color:#101828}.tp-gt em{font-style:normal;font-size:12.5px;color:#667085}
  .tp-rl{position:relative;height:18px;display:block}.tp-rl::before{content:'';position:absolute;left:0;right:0;top:7px;height:4px;border-radius:99px;background:#e3eaf3}
  .tp-rf{position:absolute;top:7px;height:4px;background:#1e6cdb;border-radius:99px}.tp-rs,.tp-ra,.tp-rn{position:absolute;top:50%;border-radius:50%;transform:translate(-50%,-50%)}
  .tp-rs{width:9px;height:9px;background:#fff;border:2px solid #9bb2d3}.tp-ra{width:12px;height:12px;background:#fff;border:2px solid #1f9d57}.tp-rn{width:16px;height:16px;background:#1e6cdb;border:3px solid #fff;box-shadow:0 0 0 1.5px #1e6cdb,0 2px 6px rgba(30,108,219,.35)}
  .tp-gn{display:flex;flex-direction:column;align-items:flex-end;line-height:1}.tp-gn b{font-size:22px;font-weight:700;color:#101828}.tp-gn small{font-size:11.5px;color:#667085;margin-top:3px}
  .tp-ok{display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:12px;background:#f1faf5;border:1px solid #cdebd9;color:#067647;font-size:13.5px;font-weight:600}.tp-ok span{display:inline-flex;width:20px;height:20px;border-radius:50%;background:#1f9d57;color:#fff;align-items:center;justify-content:center;font-size:12px}
  @media(max-width:700px){.tp-goal{grid-template-columns:1fr auto;gap:10px 14px}.tp-rl{grid-column:1/-1;order:3}}
`+c0);
if(crlf)s=s.replace(/\n/g,'\r\n');fs.writeFileSync(p,s);new Function(s);console.log('ok');
