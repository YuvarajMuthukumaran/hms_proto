/* 21 Nov 2026, Anu: "scores and scans I had asked to move with examination only". Psychiatrist only.
   Admission > step 2 Admission workup > "2 Examination and tests" now holds, inside that section:
     - Scores and screens (NEWS2, suicide screen, CIWA-Ar, COWS, ASQ) - the card from 113, moved in here
     - Results and scans: Upload lab report, Enter a result, Order monitoring, and the list of reports and results
   Treatment Plan no longer has the "Lab reports" tab, and the Stay summary Results line opens the workup instead.
   (Safety tests (automatic) stays where it is: it is the clozapine / lithium safety check, not a scan.) */
(function(){
  if(String((window.__TULASI__||{}).role||'')!=='psychiatrist')return;
  const E=s=>hesc(String(s==null?'':s));
  const route=()=>{const m=(location.hash||'').match(/^#\/patient\/([^/]+)\/([^/?]+)/);return m?{pid:decodeURIComponent(m[1]),tab:m[2]}:null;};

  function resultsCard(pid){
    let reps=[],labs=[];
    try{reps=(psyPx(pid).labReports||[]);}catch(e){}
    try{labs=v3().labs.filter(l=>l.pid===pid).sort((a,b)=>b.t-a.t);}catch(e){}
    const q=s=>String(s).replace(/'/g,"\\'");
    const repRows=reps.map(r=>'<tr><td><b>'+E(r.name)+'</b>'+(r.note?'<div class="tiny muted">'+E(r.note)+'</div>':'')+'</td><td>'+E(r.date||'')+'</td><td>'+E(r.lab||'')+'</td><td>'+E(r.by||'')+'</td><td></td></tr>').join('');
    const labRows=labs.map(l=>{
      let f='ok';try{f=V3.labFlag(l);}catch(e){}
      const chip=f==='crit'?'<span class="chip c-red">Critical</span>':f==='abn'?'<span class="chip c-amber">Out of range</span>':'';
      let when='';try{when=V3.stamp(l.t);}catch(e){}
      return '<tr><td><b>'+E(l.test)+'</b></td><td>'+E(when)+'</td><td><b>'+E(l.val)+'</b> <span class="tiny muted">'+E(l.unit||'')+'</span> '+chip+'</td><td>'+(l.rev?'<span class="chip c-green">Reviewed</span>':'<span class="chip c-blue">Result in</span>')+'</td><td style="text-align:right">'+(l.rev?'':'<button class="btn sm" onclick="V3.labReview(\''+q(l.id)+'\')">Mark reviewed</button>')+'</td></tr>';
    }).join('');
    const none=!repRows&&!labRows;
    return '<section class="card" id="pmResults" style="margin:12px 0"><div class="hd"><div><h3>Results and scans</h3><div class="small muted" style="margin-top:4px">Lab reports, scans and results for this patient. An out-of-range result becomes a "Review result" task.</div></div>'
      +'<div class="row" style="gap:8px;flex-wrap:wrap"><button class="btn sm pri" type="button" onclick="psyLabAdd(\''+q(pid)+'\')">Upload lab report</button><button class="btn sm" type="button" onclick="rsEnter(\''+q(pid)+'\')">Enter a result</button><button class="btn sm" type="button" onclick="shScaleOrder(\''+q(pid)+'\')">Order monitoring</button></div></div>'
      +(none?'<div class="empty small">No reports or results yet.<br>Upload a lab report or enter a result to see it here.</div>':'<div class="scroll"><table class="t"><thead><tr><th>Report or test</th><th>Date</th><th>Lab or result</th><th>Status or by</th><th></th></tr></thead><tbody>'+repRows+labRows+'</tbody></table></div>')
      +'</section>';
  }

  function place(){
    const v=document.getElementById('view');if(!v)return;
    const r=route();if(!r)return;
    const step2=r.tab==='admission'&&typeof S!=='undefined'&&S.admSec==='workup';

    if(step2){
      const wk=document.getElementById('workupCard');if(!wk)return;
      const grp=[...wk.querySelectorAll('.wk-grp')].find(g=>/Examination and tests/.test((g.querySelector('.wk-gh')||{}).textContent||''));
      const body=grp&&grp.querySelector('.wk-gb');if(!body)return;
      if(!document.getElementById('pmExamCss')){const c=document.createElement('style');c.id='pmExamCss';
        c.textContent='#pmExamRow{grid-column:1/-1;margin-top:6px;padding-top:14px;border-top:1px solid #e3eaf2}'
          +'#pmScores{margin:0!important;border-radius:14px}'
          +'#pmScores .hd{align-items:center;gap:12px}#pmScores .hd h3{font-size:16px}'
          +'#pmScores .pad{display:grid;grid-template-columns:200px minmax(0,1fr);gap:22px;align-items:start}'
          +'#pmScores .sc-side{border-radius:12px;background:#f5f8fc;border:1px solid #e3eaf2;padding:16px;text-align:center}'
          +'#pmScores .sc-side .sc-big{font-size:44px;line-height:1;font-weight:700;display:block;margin-bottom:8px}'
          +'#pmScores .sc-side .small,#pmScores .sc-side .tiny{display:block;margin-top:6px}'
          +'#pmScores .sc-f{display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px 14px}'
          +'#pmScores .sc-f label{font-size:12px;color:#475467}'
          +'#pmScores .sc-f label:last-child{grid-column:1/-1;display:flex;justify-content:flex-end}'
          +'#pmScores .sc-f label:last-child .btn{min-height:40px;padding:0 24px;width:auto!important;flex:none}'
          +'#pmScores details{margin-top:12px;font-size:13px;color:#475467}#pmScores summary{cursor:pointer;color:#1e6cdb;font-weight:600}'
          +'@media(max-width:760px){#pmScores .pad{grid-template-columns:1fr}#pmScores .sc-f{grid-template-columns:repeat(2,minmax(0,1fr))}}';
        document.head.appendChild(c);}
      let row=document.getElementById('pmExamRow');
      if(!row||row.parentNode!==body){if(row)row.remove();row=document.createElement('div');row.id='pmExamRow';body.appendChild(row);}
      const old=document.getElementById('pmResults');if(old)old.remove();
      const sc=document.getElementById('pmScores');
      if(sc){
        if(sc.parentNode!==row)row.appendChild(sc);
        if(!sc.dataset.tidy){
          sc.dataset.tidy='1';
          const h=sc.querySelector('.hd h3'),d=sc.querySelector('.hd .small');
          if(h)h.textContent='Early warning score (NEWS2)';
          if(d)d.textContent='A quick check of how unwell the patient is, worked out from the vitals below.';
          const hd=sc.querySelector('.hd');
          if(hd&&!hd.querySelector('[data-om]')){const b=document.createElement('button');b.type='button';b.className='btn sm';b.dataset.om='1';b.textContent='Order monitoring';b.setAttribute('onclick',"shScaleOrder('"+r.pid.replace(/'/g,"\\'")+"')");hd.appendChild(b);}
          const pad=sc.querySelector('.pad'),inner=pad&&pad.firstElementChild;
          if(inner){
            const lbl=inner.querySelector(':scope > .lbl'),score=inner.querySelector(':scope > .row'),form=inner.querySelector('.sc-f');
            const foot=[...inner.children].filter(e=>e!==lbl&&e!==score&&e!==form);
            const side=document.createElement('div');side.className='sc-side';
            if(score)side.appendChild(score);
            foot.filter(e=>/Earlier/.test(e.textContent)).forEach(e=>{e.className='tiny muted';side.appendChild(e);});
            const main=document.createElement('div');
            if(form)main.appendChild(form);
            const rules=foot.filter(e=>/Routine/.test(e.textContent))[0];
            if(rules){const dt=document.createElement('details');dt.innerHTML='<summary>How is the score used?</summary><div style="margin-top:6px"></div>';dt.lastChild.textContent=rules.textContent;main.appendChild(dt);}
            if(lbl)lbl.remove();
            pad.innerHTML='';pad.appendChild(side);pad.appendChild(main);
          }
        }
      }
      return;
    }

    /* every other screen: no Lab reports tab, and the Results line opens the workup */
    v.querySelectorAll('.psy-tx-tab').forEach(b=>{
      if(b.textContent.trim()!=='Lab reports')return;
      const id=(b.id||'').replace('psyTxTab-','');
      const p=document.getElementById('psyTxPanel-'+id);
      const wasOn=b.getAttribute('aria-selected')==='true';
      b.style.display='none';if(p){p.hidden=true;p.style.display='none';}
      if(wasOn&&typeof window.psyTxTab==='function'){try{window.psyTxTab(0);}catch(e){}}
    });
    v.querySelectorAll('section.card.pad.row').forEach(s=>{
      const b=s.querySelector('button.btn');
      if(b&&/Open results/.test(b.textContent)){
        b.textContent='Open in Admission workup';
        b.setAttribute('onclick',"S.admSec='workup';go('#/patient/"+r.pid.replace(/'/g,"\\'")+"/admission')");
      }
    });
  }
  const __r=render;
  render=function(){const o=__r.apply(this,arguments);try{place();}catch(e){}return o;};
})();
