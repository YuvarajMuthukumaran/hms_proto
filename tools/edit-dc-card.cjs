/* One-off (13 Nov 2026): redesign of the Discharge readiness card (psychiatrist and psychologist Discharge tab). TL: "formatting is very bad". */
const fs=require('fs'),path=require('path');
const p=path.join(__dirname,'..','public','legacy','js','83-automation-12nov-js.js');let s=fs.readFileSync(p,'utf8');const crlf=s.includes('\r\n');s=s.replace(/\r\n/g,'\n');
const i0=s.indexOf("  function dcCard(pid){");const i1=s.indexOf("  function gateButton(pid){");
if(i0<0||i1<i0)throw new Error('markers');
const NEW=`  function dcCard(pid){const k=kind();if(!k)return '';const it=items(pid),n=it.filter(i=>i.ok).length,pct=Math.round(n/it.length*100),miss=required(pid),d=dcs(pid),meds=dcMeds(pid),fu=fuDates();
    const decided=meds.filter(x=>x.v).length,mp=meds.length?Math.round(decided/meds.length*100):100;
    const act=i=>i.ok?'<span class="dcr-done">Done</span>':i.man?'<button class="btn sm" onclick="dcMan(\\''+pid+'\\',\\''+i.k+'\\')">Mark as reached</button>':i.k==='fu'?'<button class="btn sm" onclick="dcFu(\\''+pid+'\\')">Book now</button>':i.k==='risk'?'<button class="btn sm" onclick="go(\\'#/myday\\')">Review alerts</button>':'<span class="dcr-miss">Missing</span>';
    const sc=it.map(i=>'<div class="dcr-r"><span class="dcr-ck'+(i.ok?' on':'')+'">'+(i.ok?'✓':'')+'</span><span class="dcr-t'+(i.ok?' d':'')+'">'+hesc(i.t)+'</span>'+act(i)+'</div>').join('');
    const fr=fu.map(f=>'<div class="dcr-r"><span class="dcr-t">'+hesc(f[0])+'</span><span class="dcr-date">'+hesc(f[1])+'</span></div>').join('');
    const rel=d.rel?'<b>Triggers:</b> '+hesc(d.rel.trig)+' &nbsp;·&nbsp; <b>Early signs:</b> '+hesc(d.rel.warn):'Built from therapy: triggers, early warning signs, coping steps, who to call.';
    return '<section class="card" id="dcAuto"><div class="hd"><div><h3>Discharge readiness <span class="dcr-pct '+(pct>=100?'ok':pct>=60?'warn':'bad')+'">'+pct+'%</span></h3><div class="small muted" style="margin-top:4px">Updates on its own as items are completed. '+(miss.length?'<b>Still needed to sign: '+miss.length+'</b>':'Everything required is done.')+'</div></div><button class="btn sm" onclick="dcSummary(\\''+pid+'\\')">Fill summary from the stay</button></div>'
      +'<div class="au-bar"><i style="width:'+pct+'%"></i></div>'
      +'<div class="dcr-grid"><div class="dcr-box"><div class="dcr-bh">Readiness</div>'+sc+'</div>'
      +'<div class="dcr-col"><div class="dcr-box"><div class="dcr-bh">Discharge medicines</div><div class="dcr-r" style="flex-direction:column;align-items:stretch;gap:6px;padding:10px 14px"><div class="dcr-mt"><b>'+decided+' of '+meds.length+'</b> medicines decided</div><div class="dcr-mb"><i style="width:'+mp+'%"></i></div><div class="tiny muted">Decide Continue, Stop or Changed in the Discharge medicines check below.</div></div></div>'
      +'<div class="dcr-box"><div class="dcr-bh">Follow-ups (booked on sign)</div>'+fr+'</div></div>'
      +'<div class="dcr-box dcr-wide"><div class="dcr-bh">Relapse prevention plan</div><div class="dcr-r"><span class="dcr-t small">'+rel+'</span><button class="btn sm pri" onclick="dcRel(\\''+pid+'\\')">'+(d.rel?'Edit plan':'Review and save the plan')+'</button></div></div></div>'
      +(miss.length?'<div class="dcr-lock"><b>Sign and discharge is locked.</b> Still needed: '+miss.map(m=>hesc(m)).join(' · ')+'</div>':'')+'</section>';}
`;
s=s.slice(0,i0)+NEW+s.slice(i1);
const c0="  .au-bar{height:6px;";
if(s.split(c0).length!==2)throw new Error('css');
s=s.split(c0).join(`  .dcr-pct{font-size:13px;font-weight:800;border-radius:99px;padding:2px 10px;margin-left:6px;vertical-align:middle}.dcr-pct.ok{background:#ecfdf3;color:#067647}.dcr-pct.warn{background:#fffaeb;color:#b54708}.dcr-pct.bad{background:#fef3f2;color:#b42318}
  .dcr-grid{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(0,1fr);gap:14px;padding:14px 20px 16px;align-items:start}.dcr-col{display:flex;flex-direction:column;gap:14px}.dcr-wide{grid-column:1/-1}
  .dcr-box{border:1px solid #e3eaf2;border-radius:12px;overflow:hidden;background:#fff}.dcr-bh{padding:9px 14px;background:#f8fafc;font-size:11px;letter-spacing:.04em;text-transform:uppercase;font-weight:700;color:#667085}
  .dcr-r{display:flex;align-items:center;gap:10px;min-height:46px;padding:6px 14px;border-top:1px solid #eef2f8}.dcr-t{flex:1;min-width:0;font-size:13.5px}.dcr-t.d{color:#667085}
  .dcr-ck{flex:none;width:20px;height:20px;border-radius:50%;border:1.5px solid #cfd8e4;display:flex;align-items:center;justify-content:center;font-size:12px;color:#fff}.dcr-ck.on{background:#1f9d57;border-color:#1f9d57}
  .dcr-done{font-size:12px;font-weight:700;color:#067647}.dcr-miss{font-size:12px;font-weight:700;color:#b54708}.dcr-date{font-size:13px;color:#667085;white-space:nowrap}
  .dcr-mb{height:6px;background:#eaf0f7;border-radius:99px;overflow:hidden}.dcr-mb i{display:block;height:100%;background:#1f9d57}.dcr-mt{font-size:13.5px}
  .dcr-lock{margin:0 20px 16px;padding:10px 14px;border-radius:10px;background:#fffaeb;border:1px solid #fedf89;color:#93370d;font-size:13px}
  @media(max-width:900px){.dcr-grid{grid-template-columns:1fr}}
`+c0);
if(crlf)s=s.replace(/\n/g,'\r\n');fs.writeFileSync(p,s);new Function(s);console.log('ok');
