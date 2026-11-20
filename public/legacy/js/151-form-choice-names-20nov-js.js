/* 20 Nov 2026 (owner, screenshot of Form E "Mr./Mrs. ... son/ daughter/ husband/ wife of"): on the fillable forms, ticking a choice
   (Mr., Mrs., son, daughter, husband, wife and every other choice) opens a small pop-up to write the name that goes with it.
   The name is saved in the form's own record (key __nm_<field>_<choice>) and written on the form just above that choice, on the
   editable form, on the signed read-only form and wherever the form pages are drawn. Unticking the choice removes its name.
   Every role that fills these forms. */
(function(){
  const nmKey=(fid,i)=>'__nm_'+fid+'_'+i;
  const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const css=document.createElement('style');css.id='m20-cnm-css';
  css.textContent=
    '.cdf-nm{position:absolute;z-index:3;pointer-events:none;background:rgba(255,255,255,.85);color:#0b3d91;font-weight:700;white-space:nowrap;padding:0 2px;border-radius:3px;line-height:1.1}'+
    '#m20NmPop{position:fixed;z-index:10060;background:#fff;border:1px solid #d0d5dd;border-radius:12px;box-shadow:0 16px 40px rgba(16,24,40,.22);padding:12px;width:280px;display:flex;flex-direction:column;gap:8px;font-size:13.5px}'+
    '#m20NmPop .row{display:flex;gap:8px;justify-content:flex-end}';
  document.head.appendChild(css);

  /* the name on the form, right after the choice */
  function label(o,name,k){
    /* written just above the ticked choice, starting at it, so the printed words after it stay readable */
    const fs=7.5*CDF_K;
    return `<span class="cdf-nm" data-k="${k||''}" style="left:${o.x*CDF_K}px;top:${o.y*CDF_K-fs*1.05}px;font-size:${fs}px">${esc(name)}</span>`;
  }
  if(typeof cdfFieldHtml==='function'){
    const __fh=cdfFieldHtml;
    cdfFieldHtml=function(f,v,auto,editable){
      let h=__fh.apply(this,arguments);
      try{
        if(f&&f.kind==='choice'&&v){
          const sel=String(v[f.id]||'').split(',');
          f.opts.forEach((o,i)=>{const n=v[nmKey(f.id,i)];if(n&&sel.includes(String(i)))h+=label(o,n,nmKey(f.id,i));});
        }
      }catch(e){}
      return h;
    };
  }

  function close(){const p=document.getElementById('m20NmPop');if(p)p.remove();}
  function findField(fid){try{for(const k in CDF_FORMS){for(const pg of CDF_FORMS[k].pages){const f=pg.fields.find(x=>x.id===fid&&x.kind==='choice');if(f&&CDF_FORMS[k].pages.some(p=>p===pg))return f;}}}catch(e){}return null;}
  function fieldFor(el,fid){
    /* field ids repeat across forms (p1f3 ...); use the form whose page image is around this button */
    try{const img=el.closest('.cdf-page').querySelector('img');const src=img?img.getAttribute('src'):'';
      for(const k in CDF_FORMS)for(const pg of CDF_FORMS[k].pages)if(pg.img===src){const f=pg.fields.find(x=>x.id===fid);if(f)return f;}}catch(e){}
    return findField(fid);
  }
  function draw(el,fid,i,name){
    const page=el&&el.closest('.cdf-page');if(!page)return;
    page.querySelectorAll(`.cdf-nm[data-k="${nmKey(fid,i)}"]`).forEach(x=>x.remove());
    if(!name)return;
    const f=fieldFor(el,fid),o=f&&f.opts[i];if(!o)return;
    const t=document.createElement('div');t.innerHTML=label(o,name,nmKey(fid,i));page.appendChild(t.firstElementChild);
  }
  window.m20NmSave=function(fid,i){
    const inp=document.getElementById('m20NmIn'),name=(inp&&inp.value||'').trim();
    const key=S.cdEntryKey;if(!key){close();return;}
    const v=cdfVals(key);if(name)v[nmKey(fid,i)]=name;else delete v[nmKey(fid,i)];
    cdfTouch(key);
    draw(window.__m20NmEl,fid,i,name);
    close();
    if(name)toast('Name added on the form');
  };
  function ask(el,fid,i){
    close();
    const key=S.cdEntryKey;const cur=key?(cdfVals(key)[nmKey(fid,i)]||''):'';
    const what=String(el.getAttribute('title')||'').split(': ').pop()||'this choice';
    const r=el.getBoundingClientRect();
    const p=document.createElement('div');p.id='m20NmPop';p.setAttribute('role','dialog');
    p.innerHTML=`<b>Name for “${esc(what)}”</b><input class="input" id="m20NmIn" placeholder="Write the name" value="${esc(cur)}"><div class="tiny muted">It is written on the form just above the choice. Leave it empty to skip.</div><div class="row"><button class="btn sm" type="button" id="m20NmSkip">Skip</button><button class="btn sm pri" type="button" onclick="m20NmSave('${fid}',${i})">Save</button></div>`;
    document.body.appendChild(p);
    const W=window.innerWidth,H=window.innerHeight,pw=280,ph=p.offsetHeight||140;
    p.style.left=Math.max(8,Math.min(W-pw-8,r.left))+'px';
    p.style.top=(r.bottom+8+ph>H?Math.max(8,r.top-ph-8):r.bottom+8)+'px';
    window.__m20NmEl=el;
    p.querySelector('#m20NmSkip').onclick=close;
    const inp=p.querySelector('#m20NmIn');inp.focus();inp.select();
    inp.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();m20NmSave(fid,i);}else if(e.key==='Escape')close();};
  }
  if(typeof cdfOpt==='function'){
    const __opt=cdfOpt;
    cdfOpt=function(fid,i,el){
      const r=__opt.apply(this,arguments);
      try{
        const on=el&&el.classList.contains('on');
        if(on)ask(el,fid,i);
        else{const key=S.cdEntryKey;if(key){const v=cdfVals(key);if(v[nmKey(fid,i)]){delete v[nmKey(fid,i)];cdfTouch(key);}}draw(el,fid,i,'');close();}
      }catch(e){}
      return r;
    };
  }
  /* a click elsewhere closes the pop-up without saving */
  document.addEventListener('mousedown',e=>{const p=document.getElementById('m20NmPop');if(p&&!p.contains(e.target)&&!(e.target.closest&&e.target.closest('.cdf-opt')))close();},true);
})();
