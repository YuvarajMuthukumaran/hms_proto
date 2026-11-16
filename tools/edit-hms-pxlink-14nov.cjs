/* 14 Nov 2026: calls logged in PX show in the HMS patient's Patient Experience tab; diet and approved visitors are published for PX (px_state pxh rows) */
const fs=require('fs');
let f='public/legacy/js/90-px-link-13nov-js.js';let s=fs.readFileSync(f,'utf8');
function rep(a,b){if(s.split(a).length-1!==1)throw new Error('nf '+a.slice(0,60));s=s.replace(a,()=>b);}
rep("let cfg=null,G={},O={},sig='',started=false;","let cfg=null,G={},O={},sig='',started=false,CALLS={main:{},v1:[]},PH={},snap={};");
rep("const s=JSON.stringify([g,o]);G=g;O=o;",
"let ca={main:{},v1:[]},ph={};try{const r2=await rest('px_state?select=key,data&or=(key.in.(px_calls_main_v1,px_calls_v1),key.like.pxh:*)');if(r2.ok){(await r2.json()).forEach(x=>{const d=typeof x.data==='string'?JSON.parse(x.data):x.data;if(x.key==='px_calls_main_v1')ca.main=d||{};else if(x.key==='px_calls_v1')ca.v1=Array.isArray(d)?d:[];else if(x.key.indexOf('pxh:')===0)ph[x.key.slice(4)]=d;});}}catch(e){}\n      CALLS=ca;PH=ph;publishPrefs();\n      const s=JSON.stringify([g,o,ca,Object.keys(ph).length]);G=g;O=o;");
rep("  window.pxlUpd=function(id,fixed){",`  /* preferences go the other way: what the care team wrote (diet, approved visitors) is published for the Patient Experience portal. A patient is written when the row is missing, or when it was changed in this session. */
  const prefsOf=id=>{try{const c=ptCtxOf(id);return {diet:c.diet||{},contacts:(c.contacts||[]).map(x=>[x[0],x[1],x[2]]),nr:c.billing||''};}catch(e){return null;}};
  function publishPrefs(){
    if(!cfg)return;
    let list=[];try{list=allPts().map(p=>p.id);}catch(e){return;}
    list.forEach(id=>{const p=prefsOf(id);if(!p)return;const t=JSON.stringify(p);
      if(snap[id]===undefined){snap[id]=t;if(!PH[id]){const w=whoAt();PH[id]=Object.assign({},p,{by:w.by,at:w.at});put('pxh:'+id,PH[id]).catch(()=>{});}return;}
      if(snap[id]!==t){snap[id]=t;const w=whoAt();PH[id]=Object.assign({},p,{by:w.by,at:w.at});put('pxh:'+id,PH[id]).catch(()=>{});}});
  }
  const callsOf=id=>{const nm=nameOf(id),out=[];
    Object.keys(CALLS.main||{}).forEach(k=>{const n=PXN[k]||(()=>{try{return (ptFind(k)||{}).name||'';}catch(e){return '';}})();if(n!==nm)return;(CALLS.main[k]||[]).forEach(l=>out.push({d:l.d||'',what:l.what||'',by:l.who||'Patient Experience',note:l.note||'',tag:l.tag||''}));});
    (CALLS.v1||[]).forEach(c=>{if(c&&c.name===nm)out.push({d:c.d||c.date||'',what:'Random call '+(c.n||'')+' · '+(c.outcome||''),by:c.who||'Patient Experience',note:c.words||'',tag:''});});
    return out;};
  function callsSec(id){const L=callsOf(id);
    return \`<section class="card" id="pxcSec"><div class="hd"><div><h3>Calls logged by Patient Experience · \${L.length}</h3><div class="small muted" style="margin-top:4px">Read only. Logged once in the Patient Experience portal, shown here so the care team sees what the family was asked and said.</div></div></div>\${L.length?\`<div class="scroll"><table class="t"><thead><tr><th>When</th><th>What</th><th>By</th><th>Words or note</th></tr></thead><tbody>\${L.map(c=>\`<tr><td class="small" style="white-space:nowrap">\${esc(c.d)}</td><td>\${esc(c.what)}\${c.tag==='compliment'?' <span class="chip c-green">Compliment</span>':''}</td><td class="small">\${esc(c.by)}</td><td class="small">\${esc(c.note)}</td></tr>\`).join('')}</tbody></table></div>\`:'<div class="pad small muted">No calls logged yet.</div>'}</section>\`;}
  window.pxlUpd=function(id,fixed){`);
rep("const old=v.querySelector('#pxgSec');if(old)old.remove();","const old=v.querySelector('#pxgSec');if(old)old.remove();const oc=v.querySelector('#pxcSec');if(oc)oc.remove();");
rep("t.innerHTML=sec(id);gc.after(t.content);","t.innerHTML=sec(id)+callsSec(id);gc.after(t.content);");
rep("render=function(){const out=__r.apply(this,arguments);try{\n    const v=$('view'),id=pid();","render=function(){const out=__r.apply(this,arguments);try{publishPrefs();}catch(e){}try{\n    const v=$('view'),id=pid();");
fs.writeFileSync(f,s);new Function(s);console.log('hms ok');
