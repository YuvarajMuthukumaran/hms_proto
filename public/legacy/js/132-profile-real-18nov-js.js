/* 18 Nov 2026, Trello "red box / green box": the Emergency contact box shows the relationship (Spouse, Sister, Brother ...). The old HMS export has only the
   relative's name, so the relationship is recorded here, once, in the box itself (kept in the patient's saved working notes, so every login sees it).
   Also: the Admitted box of a real patient shows the date only (it showed an invented time such as 11:20). Real-data mode, every clinical login. */
(function(){
  if(!window.__realMode)return;
  const RELS=['Spouse','Father','Mother','Son','Daughter','Brother','Sister','Other relative','Friend'];
  const px=pid=>{try{return psyPx(pid);}catch(e){return {};}};
  window.nrRelSet=function(pid,v){
    if(!v)return;const x=px(pid);x.nrRel=v;x.nrRelBy=(typeof signer==='function'?signer():'')+' · '+(typeof atNow==='function'?atNow():'');
    render();toast('Relationship recorded: '+v);
  };
  function paint(){
    const v=document.getElementById('view');if(!v)return;
    const m=String(location.hash||'').match(/^#\/patient\/([^/?]+)/);if(!m)return;
    const pid=decodeURIComponent(m[1]);let p=null;try{p=ptFind(pid);}catch(e){}
    if(!p||!p.real)return;
    v.querySelectorAll('.dpc').forEach(c=>{
      const l=c.querySelector('.lbl'),val=c.querySelector('.dpv');if(!l||!val||c.dataset.p132)return;
      const n=l.textContent.trim();
      if(n==='Admitted'){c.dataset.p132='1';val.textContent=val.textContent.replace(/,\s*\d{1,2}[:.]\d{2}(\s*[ap]m)?\s*$/i,'')+(p.admEst?' (estimated)':'');}
      if(n==='Emergency contact'){
        c.dataset.p132='1';
        const id=ptIdentity(p),r0=(px(pid)||{}).nrRel,have=!!r0||(id.rel&&id.rel!=='Not recorded');if(r0)id.rel=r0;
        const name=String(id.nr||'Not recorded');
        if(name==='Not recorded'){val.textContent='Not recorded';return;}
        if(have){val.textContent=name+' ('+id.rel+')';return;}
        val.innerHTML='';val.appendChild(document.createTextNode(name+' '));
        const s=document.createElement('select');s.className='input';s.setAttribute('aria-label','Relationship of the emergency contact');s.style.cssText='min-height:30px;width:auto;max-width:100%;margin-top:4px;font-size:12.5px;padding:2px 8px';
        s.innerHTML='<option value="">Relationship…</option>'+RELS.map(r=>'<option>'+r+'</option>').join('');
        s.onchange=()=>nrRelSet(pid,s.value);val.appendChild(s);
      }
    });
  }
  const __r=render;
  render=function(){const out=__r.apply(this,arguments);try{paint();}catch(e){}return out;};
})();
