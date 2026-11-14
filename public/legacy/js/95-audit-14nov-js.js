/* 14 Nov 2026, Manual Audit pass (Trello 135, 147, lead psychologist family concern clock).
   1. Psychiatrist Today (psychiatrist and floor lead psychiatrist only): the Type column uses the clinical categories on card 135;
      "Overdue review" (an unsigned or overdue note or review) reads "Documentation".
   2. Every patient but Neel: the Admission steps said "Signed 18 Oct" / "Done 18 Oct" (Neel's admission date). They now show the patient's own admission date.
   3. Floor lead psychologist: a family concern past its 6 h clock says "past the 6 h clock" instead of "0 h 0 m left"; Karan Malhotra's concern names his father (Rajesh Malhotra), as in the HMS record. */
(function(){
  const role=()=>{try{return (window.__TULASI__||{}).role||S.role;}catch(e){return '';}};

  /* 2. admission date swaps, added to the per-patient text swaps */
  if(typeof ptSwaps==='function'){
    const __sw=ptSwaps;
    ptSwaps=function(){
      const out=__sw.apply(this,arguments);
      try{const id=ptIdentity(ptFind(S.pid)),d=ptD(id.adm);out.unshift(['Signed 18 Oct','Signed '+d],['Done 18 Oct','Done '+d]);}catch(e){}
      return out;
    };
  }

  function walk(v,re,fn){
    const w=document.createTreeWalker(v,NodeFilter.SHOW_TEXT);const hit=[];
    while(w.nextNode()){if(re.test(w.currentNode.nodeValue))hit.push(w.currentNode);}
    hit.forEach(fn);
  }

  const __r=render;
  render=function(){
    const out=__r.apply(this,arguments);
    try{
      const v=$('view');if(!v)return out;const r=role();
      /* 1 */
      if((r==='psychiatrist'||r==='floor-lead-psychiatrist')&&/^#\/myday/.test(location.hash||'#/myday')){
        v.querySelectorAll('.pd-ty').forEach(t=>{if(t.textContent.trim()==='Overdue review'){t.textContent='Documentation';t.classList.remove('red','amber','blue');}});
      }
      /* 3 */
      if(r==='floor-lead-psychologist'){
        walk(v,/\b0 h 0 m left/,n=>{n.nodeValue=n.nodeValue.replace(/0 h 0 m left on the 6 h clock/,'past the 6 h clock').replace(/0 h 0 m left/,'past 6 h');});
        /* concerns saved before the fix still name Karan's mother; the HMS record has his father as the family contact */
        walk(v,/Sunita Malhotra/,n=>{n.nodeValue=n.nodeValue.split('Mother (Sunita Malhotra)').join('Father (Rajesh Malhotra)');});
      }
    }catch(e){}
    return out;
  };
})();
