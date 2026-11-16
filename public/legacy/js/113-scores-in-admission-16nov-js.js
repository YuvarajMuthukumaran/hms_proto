/* 16 Nov 2026, Dr. Anu and Yuvaraj: the scores and screens card (NEWS2, suicide screen, CIWA-Ar, COWS) is shown ONLY in Admission, step 2 (Admission workup).
   It is removed from every other screen (Treatment Plan, Vitals, Rounds, other admission steps). Same card and same saving; psychiatrist screens only. */
(function(){
  if(String((window.__TULASI__||{}).role||'')!=='psychiatrist')return;
  function place(){
    const v=document.getElementById('view');if(!v)return;
    const m=(location.hash||'').match(/^#\/patient\/([^/]+)\/([^/?]+)/);
    const step2=!!m&&m[2]==='admission'&&S.admSec==='workup';
    v.querySelectorAll('section.card').forEach(s=>{
      if(s.id==='pmScores'){if(!step2)s.remove();return;}
      const h=s.querySelector(':scope > .hd h3');if(h&&/^Scores( and screens)?$/.test(h.textContent.trim()))s.remove();
    });
    if(step2&&!document.getElementById('pmScores')&&typeof window.psyScoresCard==='function'){
      const t=document.createElement('div');t.innerHTML=window.psyScoresCard(decodeURIComponent(m[1]));const el=t.firstElementChild;if(!el)return;
      const h=el.querySelector('h3');if(h)h.textContent='Scores and screens';
      el.id='pmScores';el.style.marginTop='12px';v.appendChild(el);
    }
  }
  const __r=render;
  render=function(){const r=__r.apply(this,arguments);try{place();}catch(e){}return r;};
})();
