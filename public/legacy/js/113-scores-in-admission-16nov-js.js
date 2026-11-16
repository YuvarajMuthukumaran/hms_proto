/* 16 Nov 2026, meeting with Dr. Anu (psychiatrist only): the scores and screens (NEWS2, ASQ, C-SSRS, CIWA-Ar, COWS) leave the Treatment Plan tab and sit in the Admission tab,
   under "Scores and screens". Same card and same saving as before; it is only shown in a different place. */
(function(){
  if(String((window.__TULASI__||{}).role||'')!=='psychiatrist')return;
  function place(){
    const m=(location.hash||'').match(/^#\/patient\/([^/]+)\/([^/?]+)/);if(!m)return;
    const v=document.getElementById('view');if(!v)return;
    if(m[2]==='orders'){v.querySelectorAll('section.card').forEach(s=>{const h=s.querySelector(':scope > .hd h3');if(h&&h.textContent.trim()==='Scores')s.remove();});return;}
    if(m[2]==='admission'&&!document.getElementById('pmScores')&&typeof window.psyScoresCard==='function'){
      const t=document.createElement('div');t.innerHTML=window.psyScoresCard(decodeURIComponent(m[1]));const el=t.firstElementChild;if(!el)return;
      const h=el.querySelector('h3');if(h)h.textContent='Scores and screens';
      el.id='pmScores';el.style.marginTop='12px';v.appendChild(el);
    }
  }
  const __r=render;
  render=function(){const r=__r.apply(this,arguments);try{place();}catch(e){}return r;};
})();
