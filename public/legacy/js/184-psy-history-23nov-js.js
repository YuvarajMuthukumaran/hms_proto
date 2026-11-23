/* 23 Nov 2026, meeting with Dr. Anu and Nikita: Detailed history (Admission step 4). Psychiatrist only.
   - Every question label is bold black (it was grey and hard to tell from the answers); more room between questions and between bubbles.
   - 4. Concomitant changes: two questions side by side, like sections 1 and 2.
   - 5. Treatment and past illness: question 2 "Treatment given (dose, duration, response, side effects)" is gone
     (question 1 "Any treatment for present illness" has its own details box when Yes).
   - 6. Family tree: Father, Mother, Grandfather, Grandmother added to the relation list; no Sex column (the relation says it,
     "Brother / F" could be picked before). The pedigree still draws squares and circles: the sex is worked out from the relation.
   - 7. Personal history: spaced out.
   - 8. Premorbid personality: the character questions read Q4a, Q4b, ... one under the other.
   - 11. Diagnostic formulation: a big box from the start, the AI button sits next to the section heading. */
(function(){
  if(String((window.__TULASI__||{}).role||'')!=='psychiatrist')return;

  /* 5. drop question 2 */
  try{
    const tx=HIST.find(x=>x.k==='tx');
    if(tx)tx.f=tx.f.filter(f=>!/^Treatment given \(dose/.test(f[0]));
  }catch(e){}

  /* 6. relation list and sex from the relation */
  const RELS=['Father','Mother','Grandfather','Grandmother','Brother','Sister','Spouse','Son','Daughter','Other'];
  const SEX={Father:'M',Grandfather:'M',Brother:'M',Son:'M',Mother:'F',Grandmother:'F',Sister:'F',Daughter:'F'};
  const sexOf=rel=>{if(SEX[rel])return SEX[rel];if(rel==='Spouse'){let p={};try{p=ptFind(S.pid)||{};}catch(e){}return /^m/i.test(p.sex||'')?'F':/^f/i.test(p.sex||'')?'M':'';}return '';};
  if(typeof window.pmTreeSet==='function'){
    const __s=window.pmTreeSet;
    window.pmTreeSet=function(i,r,k,v){
      const o=__s.apply(this,arguments);
      if(k==='rel'){try{__s(i,r,'sex',sexOf(v));}catch(e){}}
      return o;
    };
  }
  function tree(){
    document.querySelectorAll('#view .pm-tree-r').forEach(row=>{
      const sels=[...row.querySelectorAll('select')];
      const rel=sels.find(s=>/'rel'/.test(s.getAttribute('onchange')||'')),sex=sels.find(s=>/'sex'/.test(s.getAttribute('onchange')||''));
      if(sex)sex.style.display='none';
      if(rel&&!rel.dataset.m23){
        rel.dataset.m23='1';const cur=rel.value,dis=rel.disabled;
        rel.innerHTML='<option value="">Relation…</option>'+RELS.map(o=>`<option ${o===cur?'selected':''}>${o}</option>`).join('');
        rel.disabled=dis;
      }
    });
    const lb=document.querySelector('#view .pm-tree > .lbl');if(lb&&!/parents/.test(lb.textContent))lb.firstChild.textContent='Family tree: parents, grandparents, siblings, spouse and children';
  }

  /* 11. formulation: big box, AI button beside the heading */
  function dx(){
    if(S.hsec!=='dx')return;
    const w=document.querySelector('#view .hwrap');if(!w)return;
    const ai=w.querySelector('.hgrid > .row > button.ai9'),h=w.querySelector('h3');
    if(ai&&h&&!h.dataset.m23){
      const holder=ai.parentElement;h.dataset.m23='1';
      const bar=document.createElement('div');bar.className='m23-dxh';
      h.parentNode.insertBefore(bar,h);bar.appendChild(h);bar.appendChild(ai);holder.remove();
    }
    w.querySelectorAll('.hgrid > .hf').forEach(f=>{const l=(f.querySelector('.lbl')||{}).textContent||'';const t=f.querySelector('textarea');if(t&&/^Diagnostic formulation/.test(l)){t.style.minHeight='240px';t.rows=10;}});
  }

  const css=document.createElement('style');css.id='m23-hist-css';
  css.textContent=
    'body.psy-views:not(.psg) .hwrap .hgrid>.hf>.lbl{color:#101828!important;font-weight:700!important;font-size:14px!important}'+
    'body.psy-views:not(.psg) .hwrap .hgrid>.hf>.lbl .tiny{font-weight:400!important}'+
    'body.psy-views:not(.psg) .hwrap .hgrid{row-gap:20px!important}'+
    'body.psy-views:not(.psg) .hwrap .hgrid .mini-chips{gap:8px 8px!important;margin-top:8px!important}'+
    'body.psy-views:not(.psg) .hwrap .hgrid .mini-chips .tog{padding:6px 12px!important}'+
    /* 4. two per row */
    'body.m23-hs-chg .hwrap .hgrid>.hf.pm-ob,body.m23-hs-chg .hwrap .hgrid>.hf{grid-column:span 6!important}'+
    /* 7. personal history: each question on its own band */
    'body.m23-hs-per .hwrap .hgrid>.hf{padding-bottom:14px;border-bottom:1px solid #eef1f5}'+
    /* 8. Q4a, Q4b, ... */
    'body.psy-views:not(.psg) .hwrap .hgrid>.hf.pmp-sub>.lbl:first-child::before{content:"Q" counter(hq) counter(hsub,lower-alpha)!important}'+
    'body.m23-hs-pmp .hwrap .hgrid>.hf{grid-column:1/-1!important}'+
    /* 11 */
    '.m23-dxh{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}.m23-dxh h3{margin:0}';
  document.head.appendChild(css);

  const __r=render;
  render=function(){
    const o=__r.apply(this,arguments);
    try{
      const on=/^#\/patient\/[^/]+\/admission/.test(location.hash||'')&&S.admSec==='hist';
      ['chg','per','pmp'].forEach(k=>document.body.classList.toggle('m23-hs-'+k,on&&S.hsec===k));
      if(on){tree();dx();}
    }catch(e){}
    return o;
  };
})();
