
/* Single button for psychologists: send this patient's update to their family WhatsApp group now.
   The group is created on the first send. Sends what is filled in and saves the note too when it is complete.
   Refuses only when nothing at all is filled in, so an empty message never goes out. */
function psyHasAny(kind,id){return PSY_SECS.some(s=>s.ks.some(k=>!psyEmpty(psyGet(kind,id,k))));}
async function psySaveSend(kind,id,btn){
  const p=allPts().find(x=>x.id===id)||{name:'this patient'};
  if(!psyHasAny(kind,id)){
    toast('Nothing filled in for '+p.name+' yet. Tap a few answers (or Usual day), then send.');
    if(kind==='eod'){const pend=PSY_EOD().filter(x=>!((S.eod||{})[x.id]||{}).saved),i=pend.findIndex(x=>x.id===id);if(i>=0){S.eodI=i;render();}}
    return;}
  if(!waCfg().token){waCfgModal();toast('Connect this browser once, then press Send again.');return;}
  const saved=kind==='dn'?S.dailySaved:((S.eod||{})[id]||{}).saved;
  if(!saved&&!psyMiss(kind,id).length){if(kind==='dn')psySave(kind,id);else S.eod[id].saved=true;}
  if(btn)waBusy(btn,true);
  toast('Sending '+p.name+"'s update on WhatsApp…");
  const r=await waDSendCore(kind,id);render();
  toast(r.ok?p.name+': '+r.msg+' on WhatsApp':'Not sent for '+p.name+': '+r.msg);
}
/* note bar: Send on WhatsApp next to Save */
const __psyBarWa=psyBar;psyBar=function(kind,id){
  const h=__psyBarWa(kind,id),sent=waD()[kind+':'+id];
  const wa=`<button type="button" class="btn wa-copy" ${sent?'disabled':''} onclick="psySaveSend('${kind}','${id}',this)">${sent?'✓ Sent on WhatsApp':'Send on WhatsApp'}</button>`;
  return h.replace(/(<button type="button" class="btn pri" onclick="psySave[\s\S]*<\/button>)$/,'<span class="row" style="gap:8px;flex-wrap:wrap;justify-content:flex-end">'+wa+'$1</span>');
};
/* patient tab card: the send button works without saving first */
const __waDBlockOne=waDBlock;waDBlock=function(kind,id,draft){
  let h=__waDBlockOne(kind,id,draft);if(!draft)return h;
  h=h.split('<button class="btn wa-copy" disabled onclick=').join('<button class="btn wa-copy" onclick=');
  h=h.replace(/Draft preview\. Save the note first, then send it to the patient's WhatsApp group \(UHID ([^)]*)\)\./,"Press Send on WhatsApp and this goes to the family group (UHID $1). The group is created the first time.");
  return h.replace(`<button class="btn pri" disabled onclick="waDSend('${kind}','${id}',this)">Send to UHID group</button>`,`<button class="btn pri" onclick="psySaveSend('${kind}','${id}',this)">Send on WhatsApp</button>`);
};
/* Daily notes page: every patient has one Send on WhatsApp button */
psyEodPage=function(){
  const h=__waEod0(),all=PSY_EOD(),err=S.waErr||{},sentL=all.filter(p=>waD()['eod:'+p.id]);
  const st=p=>{const s=waD()['eod:'+p.id],e=err['eod:'+p.id];return s?`<span class="wa-ok">✓ Sent ${hesc(s.at)} · by ${hesc(s.by)}</span>`:e?`<span class="wa-bad">Not sent: ${hesc(e)}</span>`:psyHasAny('eod',p.id)?`<span class="wa-rdy">Ready to send</span>`:`<span class="muted">Nothing filled in yet</span>`;};
  const row=p=>{const s=waD()['eod:'+p.id],any=psyHasAny('eod',p.id);
    return `<div class="wa-row"><div class="grow"><strong>${p.name}</strong> <span class="tiny muted">${p.room} · UHID ${p.uhid}</span><div class="small">${st(p)}</div></div>
    ${any?`<button class="btn sm" onclick="S.waOpen=S.waOpen==='${p.id}'?'':'${p.id}';render()">${S.waOpen===p.id?'Hide message':'See message'}</button>`:''}<button class="btn sm pri" ${s?'disabled':''} onclick="psySaveSend('eod','${p.id}',this)">${s?'✓ Sent':'Send on WhatsApp'}</button></div>${S.waOpen===p.id&&any?`<div style="padding:0 0 12px">${waDBlock('eod',p.id)}</div>`:''}`;};
  const strip=`<section class="card wa-strip" id="waStrip"><div class="hd"><div><h3>WhatsApp updates to families</h3><div class="small muted" style="margin-top:4px">${sentL.length} of ${all.length} sent today. <b>Send on WhatsApp</b> sends that patient's update to their family group; the group is created the first time.</div></div>
    <div class="row" style="gap:8px"><button class="lnk tiny" onclick="waCfgModal()">Connection settings</button></div></div>
    <div class="pad" style="padding-top:4px">${all.map(row).join('')}</div></section>`;
  return strip+h;};
