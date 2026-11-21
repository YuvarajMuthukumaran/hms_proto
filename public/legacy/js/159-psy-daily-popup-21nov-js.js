/* 21 Nov 2026, owner: the daily-note pop-up (Take Action, the eye window) in the psychiatrist login showed the psychologist's four-step note.
   It now shows the psychiatrist's own daily note (Overall behaviour, Mood and consciousness, Medication adherence, Any other event),
   the same fields as the Daily notes page (eodGroups, block 01), in a two-by-two grid that fills the window.
   Psychiatrist and floor lead psychiatrist only. Saves into S.eod[pid] exactly like "Save and next" on the Daily notes page. */
(function(){
  const ROLE=String((window.__TULASI__||{}).role||'');
  if(!/^(psychiatrist|floor-lead-psychiatrist)$/.test(ROLE))return;
  if(typeof eodGroups!=='function')return;
  const css=document.createElement('style');css.id='psy-daily-popup-css';
  css.textContent=[
  '.modal.pcd-wide2{width:min(980px,96vw)!important;max-width:none!important}',
  '#pdnBody{max-height:66vh;overflow:auto;padding:2px 2px 6px}',
  '#pdnBody .eq{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}',
  '#pdnBody .eqrow{display:contents}',
  '#pdnBody .eqc{border:1px solid #e3eaf2;border-radius:12px;background:#fbfcfe;padding:14px 16px}',
  '@media(max-width:760px){#pdnBody .eq{grid-template-columns:1fr}}'
  ].join('');
  document.head.appendChild(css);
  const nm=pid=>{const p=ptFind(pid);return p?p.name:'';};
  function body(pid){
    S.eod=S.eod||{};
    const redraw=`psyPopNoteDraw('${pid}')`;
    const mseg=(id,k,opts)=>{const cur=(S.eod[id]||{})[k]||[];return `<div class="mini-chips">${opts.map(o=>`<button class="tog ${cur.includes(o)?'on':''}" style="height:28px;font-size:12px" onclick="S.eod['${id}']=S.eod['${id}']||{};const a=S.eod['${id}']['${k}']||[];S.eod['${id}']['${k}']=a.includes('${o}')?a.filter(x=>x!=='${o}'):a.concat('${o}');${redraw}">${o}</button>`).join('')}</div>`;};
    const seg=(id,k,opts)=>{const cur=(S.eod[id]||{})[k];return `<div class="eseg" role="group" aria-label="${k}">${opts.map(([v,c])=>`<button class="${cur===v?'on '+c:''}" onclick="S.eod['${id}']=S.eod['${id}']||{};S.eod['${id}']['${k}']='${v}';${redraw}">${v}</button>`).join('')}</div>`;};
    const dnGroup=(t,fs)=>`<div class="dngrp"><div class="dng2">${t}</div><div class="dnfields">${fs.map(([l,c])=>`<div class="ef"><span class="lbl">${l}</span>${c}</div>`).join('')}</div></div>`;
    const p=ptFind(pid)||{id:pid};
    return (typeof coNote==='function'?`<div style="margin-bottom:12px">${coNote(pid)}</div>`:'')+eodGroups(p,dnGroup,seg,mseg);
  }
  window.psyPopNoteDraw=function(pid){const el=document.getElementById('pdnBody');if(!el)return;const top=el.scrollTop;el.innerHTML=body(pid);el.scrollTop=top;};
  window.psyPopNote=function(pid){
    V3.modal('Daily note · '+hesc(nm(pid)),'Today’s note for this patient only. You stay on the dashboard.',`<div id="pdnBody">${body(pid)}</div>`,
      `<button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="psyPopNoteSave('${pid}')">Save note</button>`);
    const m=document.querySelector('.modal');if(m)m.classList.add('pcd-wide2');
  };
  window.psyPopNoteSave=function(pid){
    S.eod=S.eod||{};S.eod[pid]=S.eod[pid]||{};const e=S.eod[pid];e.saved=true;
    closeModal();render();toast('Daily note saved for '+nm(pid)+((e.hs&&e.hs!=='None')?'; treating team alerted':''));
  };
})();
