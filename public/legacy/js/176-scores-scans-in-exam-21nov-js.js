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
      +(none?'<div class="pad small muted">No reports or results yet.</div>':'<div class="scroll"><table class="t"><thead><tr><th>Report or test</th><th>Date</th><th>Lab or result</th><th>Status or by</th><th></th></tr></thead><tbody>'+repRows+labRows+'</tbody></table></div>')
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
      const sc=document.getElementById('pmScores');
      if(sc&&sc.parentNode!==body){sc.style.margin='12px 0';body.appendChild(sc);}
      let rc=document.getElementById('pmResults');
      if(!rc||rc.parentNode!==body){if(rc)rc.remove();const t=document.createElement('div');t.innerHTML=resultsCard(r.pid);body.appendChild(t.firstElementChild);}
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
