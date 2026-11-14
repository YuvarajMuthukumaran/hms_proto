/* 14 Nov 2026, Trello card "Rating scales and early warning" (audit):
   1. The early warning score uses the reading the nurse recorded (real respiratory rate) when there is one; it only falls back to the older table readings when there is none.
   2. The scales the doctor ordered (Order a scale) show on the nurse's Today as "Scales to record", with the last score and a button that opens the right form.
   3. Demo orders: CIWA-Ar every 4 hours for the three patients in alcohol withdrawal, written once by the treating psychiatrist's team (Dr. Kunal Sethi).
   Nothing is made up when a reading is missing. */
(function(){
  const esc=s=>hesc(String(s==null?'':s));
  const px=pid=>{try{return psyPx(pid);}catch(e){return {};}};
  const floor=()=>{try{return allPts();}catch(e){return PTS;}};
  function seed(){
    if(window.__scSeed14)return;window.__scSeed14=1;
    floor().forEach(p=>{try{
      if(!/alcohol/i.test(String(p.dx||''))||!/withdraw/i.test(String(p.dx||'')))return;
      const x=px(p.id);x.scaleOrders=x.scaleOrders||[];
      if(!x.scaleOrders.some(o=>o.scale==='CIWA-Ar'))x.scaleOrders.push({scale:'CIWA-Ar',freq:'Every 4 hours',by:'Dr. Kunal Sethi',at:'ordered at admission'});
    }catch(e){}});
  }
  /* 1. NEWS2 from the nurse's reading */
  const __auto=window.psyAutoNews;
  window.psyAutoNews=function(pid){
    try{
      const h=(v3().vit.hist||{})[pid]||(v3().vit.last[pid]?[v3().vit.last[pid]]:[]);
      const ok=h.filter(v=>v&&isFinite(v.rr)&&isFinite(v.hr));
      if(ok.length){
        const n=v=>psyNewsCalc({rr:v.rr,spo2:v.spo2,o2:false,sbp:v.sbp,pulse:v.hr,cons:'Alert',temp:Math.round((v.temp-32)*5/9*10)/10});
        const cur=ok[ok.length-1],pr=ok.length>1?ok[ok.length-2]:null,c=n(cur);
        return {total:c.total,band:c.band,prev:pr?n(pr).total:null,date:'recorded by '+(cur.by||'the nurse')+', '+V3.stamp(cur.t)};
      }
    }catch(e){}
    return typeof __auto==='function'?__auto.apply(this,arguments):null;
  };
  /* 2. the nurse's board */
  const FORM={'CIWA-Ar':pid=>psyCiwaOpen(pid),'NEWS2':pid=>V3.vitModal(pid),'C-SSRS screen':pid=>{if(typeof psySuiOpen==='function')psySuiOpen(pid);else toast('Open the suicide screen from the patient record');},'COWS':pid=>toast('No COWS form yet: the scale is waiting for Dr. Anu to confirm')};
  window.scBoardOpen=function(pid,scale){const f=FORM[scale];if(f)f(pid);};
  function last(pid,scale){
    const x=px(pid);
    if(scale==='CIWA-Ar'){const c=(x.ciwa||[])[0];return c?'Last '+c.total+' ('+String(c.band).toLowerCase().replace('rmo','RMO')+'), '+c.at:'No score yet';}
    if(scale==='NEWS2'){const a=window.psyAutoNews&&psyAutoNews(pid);return a?'Last '+a.total+' ('+String(a.band).toLowerCase().replace('rmo','RMO')+'), '+a.date:'No score yet';}
    if(scale==='C-SSRS screen'){const s=(x.suicide||[])[0];return s?'Last: '+s.level.toLowerCase()+', '+s.at:'Not screened';}
    return 'No form yet';
  }
  function board(v){
    if(S.role!=='nurse'||!/^#\/(myday|ward)/.test(location.hash||'')||v.querySelector('#scBoard'))return;
    seed();
    const rows=[];floor().forEach(p=>(px(p.id).scaleOrders||[]).forEach(o=>rows.push({p,o})));
    if(!rows.length)return;
    const d=document.createElement('section');d.id='scBoard';d.className='card';
    d.innerHTML=`<div class="hd"><div><h3>Scales to record</h3><div class="small muted" style="margin-top:4px">Ordered by the doctor. The HMS adds up the score; only the score and its band are shown.</div></div></div><div class="scroll"><table class="t"><thead><tr><th>Patient</th><th>Scale</th><th>How often</th><th>Last</th><th></th></tr></thead><tbody>${rows.map(r=>`<tr><td><b>${esc(r.p.name)}</b><div class="tiny muted">${esc(String(r.p.room||'').replace(/^Room\s*/,'R '))}</div></td><td>${esc(r.o.scale)}</td><td class="small">${esc(r.o.freq)}<div class="tiny muted">${esc(r.o.by||'')}</div></td><td class="small">${esc(last(r.p.id,r.o.scale))}</td><td style="text-align:right"><button class="btn sm pri" onclick="scBoardOpen('${r.p.id}','${r.o.scale}')">Record</button></td></tr>`).join('')}</tbody></table></div>`;
    v.insertBefore(d,v.firstChild);
  }
  const __r=render;
  render=function(){const r=__r.apply(this,arguments);try{const v=$('view');if(v){if(S.role==='nurse')board(v);else seed();}}catch(e){}return r;};
})();
