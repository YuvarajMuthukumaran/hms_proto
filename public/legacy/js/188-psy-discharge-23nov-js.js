/* 23 Nov 2026, meeting with Dr. Anu and Nikita: Discharge. Psychiatrist and floor lead psychiatrist only.
   Discharge summary tab:
   - One timeline, in this order: 1 Discharge type, 2 Summary, 3 Medication plan, 4 Therapy plan.
   - The "Discharge plan" card (from the management plan) and the grievance count are gone.
   Discharge checklist tab:
   - Psychiatrist items tick themselves: Capacity assessment (last date from the capacity history), Medication review
     (discharge medicines written), Discharge diagnosis (filled in the summary or the record).
   - "Risk reviewed for discharge" and "Discharge summary written" are gone (written is ticked with Summary reviewed).
   - "Summary reviewed" opens the summary as a document; Confirm ticks it.
   - "Discharge consent signed": Print form and Collect e-signature, like the admission forms; an e-signed consent ticks it.
   - New "Admin" group: Billing cleared, Belongings collected by the family. Ticked with who and when (the psychiatrist or
     floor lead can tick it until an admin login exists). */
(function(){
  const ROLE=String((window.__TULASI__||{}).role||'');
  if(!/^(psychiatrist|floor-lead-psychiatrist)$/.test(ROLE))return;
  const E=s=>hesc(String(s==null?'':s));
  const Q=s=>String(s==null?'':s).replace(/\\/g,'\\\\').replace(/'/g,"\\'");
  const px=pid=>{try{return psyPx(pid)||{};}catch(e){return {};}};
  const ctx=pid=>{try{return ptCtxOf(pid)||{};}catch(e){return {};}};
  const route=()=>{const m=String(location.hash||'').match(/^#\/patient\/([^/?]+)(?:\/([^/?]+))?(?:\/([^/?]+))?/);return m?{pid:decodeURIComponent(m[1]),sub:m[2]||'',part:m[3]||''}:{pid:'',sub:'',part:''};};
  const FID='discharge-consent';
  const store=pid=>{const c=ctx(pid);if(!c.dcRole||typeof c.dcRole!=='object')c.dcRole={};return c.dcRole;};

  /* ---------- automatic psychiatrist items ---------- */
  function autoInfo(pid){
    const x=px(pid),c=ctx(pid),out={};
    const cap=(Array.isArray(x.capHist)?x.capHist:[]).filter(a=>a&&!a.draft)[0]||(x.capacitySigned?{at:x.capacitySigned.signedAt,by:x.capacitySigned.signedBy,level:x.capacitySigned.level}:null);
    out.capacity=cap?{on:true,by:'Capacity assessment'+(cap.level?' ('+cap.level+')':'')+(cap.by?' by '+cap.by:''),at:'last done '+(cap.at||'')}:null;
    const D=x.dcrx||{},rows=Object.values(D.rows||{}).filter(r=>r&&(r.freq||r.start)),ex=(D.extra||[]).length;
    out.medrev=(rows.length||ex)?{on:true,by:'Discharge medicines written ('+(rows.length+ex)+')',at:''}:null;
    const s=x.dcs||{},k=Object.keys(s).find(l=>/^Discharge diagnosis/.test(l));
    const dx=String((k&&s[k])||c.dx||'').trim();
    out.finaldx=dx?{on:true,by:'Discharge diagnosis: '+dx.slice(0,80),at:''}:null;
    return out;
  }
  function applyAuto(pid){
    const s=store(pid),A=autoInfo(pid);s.psy=Object.assign({},s.psy||{});
    ['capacity','medrev','finaldx'].forEach(k=>{const cur=s.psy[k];
      if(A[k])s.psy[k]=Object.assign({auto:1},A[k]);
      else if(cur&&cur.auto)delete s.psy[k];});
    store(pid).psy=s.psy;
    /* the old sign-off flags behind "Sign and discharge" */
    const Dd=c=>c&&c.discharge;const D=Dd(ctx(pid))||(pid===S.pid?S.discharge:null);
    if(D){
      if(!D.risk){D.risk=true;}
      D.written=!!D.summary;
      if(A.capacity)D.capacity=true;
      if(consentSigned(pid))D.dconsent=true;
    }
  }
  function consentSigned(pid){
    const c=(px(pid).consent||{})[FID];if(c&&(c.st==='esign'||c.st==='uploaded'||c.signed))return c;
    try{const it=cdItems(pid).find(i=>i.form&&i.form.id===FID);const e=it&&cdfVals(it.entryKey).__esign;if(e&&e.sig)return {st:'esign',by:e.by,at:e.at};}catch(e){}
    return null;
  }
  const keyOf=pid=>{try{const it=cdItems(pid).find(i=>i.form&&i.form.id===FID);return it?it.entryKey:'';}catch(e){return '';}};

  /* ---------- Summary reviewed: the summary as a document ---------- */
  function summaryHtml(pid){
    let html='';const o=window.open;
    window.open=function(){return {document:{open(){},write(h){html+=h;},close(){}}};};
    try{window.m20Pdf(pid);}catch(e){}finally{window.open=o;}
    return html.replace(/<script>[\s\S]*?<\/script>/i,'');
  }
  window.m23SumReview=function(pid){
    const h=summaryHtml(pid);
    V3.modal('Review the discharge summary','Read it through. Confirm when it is correct.',
      '<iframe id="m23SumF" title="Discharge summary" style="width:100%;height:62vh;border:1px solid #e3eaf2;border-radius:10px;background:#fff"></iframe>',
      '<button class="btn" onclick="closeModal()">Not yet</button><button class="btn" onclick="closeModal();m20Pdf(\''+Q(pid)+'\')">Download PDF</button><button class="btn pri" onclick="m23SumOk(\''+Q(pid)+'\')">Confirm: summary reviewed</button>');
    const m=document.getElementById('modal');if(m)m.style.width='min(980px,100%)';
    const f=document.getElementById('m23SumF');if(f)f.srcdoc=h||'<p style="font:14px Arial;padding:20px">The summary is not drafted yet.</p>';
  };
  window.m23SumOk=function(pid){
    const D=(ctx(pid).discharge)||S.discharge;if(D){D.summary=true;D.written=true;}
    S.dcBy=S.dcBy||{};const w={by:signer(),at:atNow()};S.dcBy.summary=w;S.dcBy.written=w;
    try{V3.log(pid,S.role,'note','Discharge summary reviewed by '+signer());}catch(e){}
    closeModal();render();toast('Summary reviewed');
  };
  /* ---------- discharge consent ---------- */
  window.m23DcPrint=function(pid){const k=keyOf(pid);if(k&&typeof psyDocPreview==='function'){psyDocPreview(k);return;}toast('The discharge consent form is not in this patient\'s forms yet');};
  window.m23DcEsign=function(pid){if(typeof psyEsignOpen==='function')psyEsignOpen(FID);};
  /* the e-sign window looks the form up in its own list: add the discharge consent there */
  if(typeof window.__ocForms==='function'){const __o=window.__ocForms;window.__ocForms=function(all){const r=__o.apply(this,arguments)||[];return all&&!r.some(f=>f[1]===FID)?r.concat([['Discharge consent',FID]]):r;};}
  else window.__ocForms=function(all){return all?[['Discharge consent',FID]]:[];};

  /* ---------- Admin group ---------- */
  const ADMIN=[['billing','Billing cleared'],['belong','Belongings collected by the family']];
  window.m23AdminTick=function(pid,k,on){
    const s=store(pid);s.admin=Object.assign({},s.admin||{});s.admin[k]={on:!!on,by:signer(),at:atNow()};store(pid).admin=s.admin;
    try{V3.log(pid,S.role,'note','Discharge checklist: '+(ADMIN.find(a=>a[0]===k)||['',k])[1]+(on?' ticked':' unticked')+' by '+signer());}catch(e){}
    render();
  };
  function adminCard(pid){
    const s=store(pid).admin||{},dn=ADMIN.filter(a=>(s[a[0]]||{}).on).length;
    return '<div class="m20-cg m23-adm" data-r="admin" style="--p:'+Math.round(dn/ADMIN.length*100)+'%"><div class="m20-cgh"><b>Admin</b><span class="m20-cnt">'+dn+' of '+ADMIN.length+'</span><span class="tiny muted">Front desk</span></div><div class="m20-seg">'+ADMIN.map(a=>'<i'+((s[a[0]]||{}).on?' class="on"':'')+'></i>').join('')+'</div>'
      +ADMIN.map(a=>{const t=s[a[0]];return '<label class="m20-ci"><input type="checkbox" '+(t&&t.on?'checked':'')+' onchange="m23AdminTick(\''+Q(pid)+'\',\''+a[0]+'\',this.checked)"><span><span class="m20-cit">'+E(a[1])+'</span><span class="tiny muted">'+(t&&t.on?'Done · '+E(t.by)+(t.at?', '+E(t.at):''):'Not done yet')+'</span></span></label>';}).join('')+'</div>';
  }

  /* ---------- paint ---------- */
  function paintSummary(v,pid){
    /* block 172 puts each part in its own panel (.m20p) behind a third bar; here they become one timeline */
    const W=v.querySelector('#m20Dc');if(!W||!W.dataset.m20n)return;
    const isC=route().part==='checklist';
    let tl=W.querySelector('.m23-tl');
    if(!tl){
      W.querySelectorAll('.m20p[data-k="plan"],.m20p[data-k="griev"],.m20-griev,#dcPlan').forEach(e=>e.remove());
      tl=document.createElement('ol');tl.className='m23-tl';
      /* 24 Nov meeting: discharge type and summary are one step */
      [['type summary','Discharge summary'],['meds','Medication plan'],['therapy','Therapy plan']].forEach(([k,t])=>{const ps=k.split(' ').map(x=>W.querySelector('.m20p[data-k="'+x+'"]')).filter(Boolean);if(!ps.length)return;const p=ps[0];
        const li=document.createElement('li');li.className='m23-tls';li.innerHTML='<span class="m23-tld">'+(tl.children.length+1)+'</span><div class="m23-tlb"><div class="m23-tlh">'+t+'</div></div>';ps.forEach(x=>li.querySelector('.m23-tlb').appendChild(x));tl.appendChild(li);});
      const nav=W.querySelector('.m20n');if(nav)nav.after(tl);else W.appendChild(tl);
    }
    W.classList.add('m23-dcw');
    tl.style.display=isC?'none':'';
    if(!isC)tl.querySelectorAll('.m20p').forEach(p=>{p.style.display='';});
    /* 23 Nov (owner): one step at a time, with a step bar like the Admission steps, not one long page */
    const lis=[...tl.children];window.__dcStep=window.__dcStep||{};let cur=Math.min(window.__dcStep[pid]||0,lis.length-1);
    let bar=W.querySelector('.m23-sb');
    if(!bar){bar=document.createElement('nav');bar.className='m23-sb';bar.setAttribute('aria-label','Discharge summary steps');bar.innerHTML='<div class="m23-sbr"></div><div class="m23-sbt"><i></i></div>';tl.before(bar);}
    bar.style.display=isC?'none':'';
    const SBI={'Discharge summary':'<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4M10 12h5M10 16h5"/>','Discharge type':'<path d="M14 4h5v16h-5"/><path d="M4 12h11M11 8l4 4-4 4"/>','Summary':'<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4M10 12h5M10 16h5"/>','Medication plan':'<rect x="3" y="9" width="18" height="7" rx="3.5" transform="rotate(-35 12 12.5)"/><path d="M9.5 9l4.5 6.5"/>','Therapy plan':'<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9.5h8M8 12.5h5"/>'};
    const ok='<path d="M5 12.5l4.5 4.5L19 7.5"/>',svg=d=>'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+d+'</svg>';
    bar.querySelector('.m23-sbr').innerHTML=lis.map((li,i)=>{const t=(li.querySelector('.m23-tlh')||{}).textContent||'';const st=i<cur?'done':i===cur?'on':i===cur+1?'next':'';
      return '<button type="button" class="m23-sbi '+st+'" '+(i===cur?'aria-current="step" ':'')+'onclick="m23DcStep(\''+Q(pid)+'\','+i+')"><span class="qic">'+svg(i<cur?ok:(SBI[t]||''))+'</span><span class="qtx"><span class="qst">Step '+(i+1)+' of '+lis.length+'</span><span class="qtt">'+t+'</span><span class="qws">'+(i<cur?'Done':i===cur?'You are here':i===cur+1?'Up next':'Later')+'</span></span></button>';}).join('');
    const fill=bar.querySelector('.m23-sbt i');requestAnimationFrame(()=>{fill.style.width=((cur+1)/lis.length*100)+'%';});
    lis.forEach((li,i)=>{li.style.display=i===cur?'':'none';});
    tl.classList.add('m23-one');
    let nv=W.querySelector('.m23-snav');
    if(!nv){nv=document.createElement('div');nv.className='m23-snav';tl.after(nv);}
    nv.style.display=isC?'none':'';
    const q=Q(pid);
    nv.innerHTML=(cur>0?'<button class="btn" onclick="m23DcStep(\''+q+'\','+(cur-1)+')">Back</button>':'<span></span>')
      +(cur<lis.length-1?'<button class="btn pri" onclick="m23DcStep(\''+q+'\','+(cur+1)+')">Next: '+((lis[cur+1].querySelector('.m23-tlh')||{}).textContent||'')+'</button>':'<a class="btn pri" href="#/patient/'+encodeURIComponent(pid)+'/discharge/checklist">Go to Discharge checklist</a>');
  }
  window.m23DcStep=function(pid,i){window.__dcStep=window.__dcStep||{};window.__dcStep[pid]=i;try{const v=document.getElementById('view');if(v)paintSummary(v,pid);}catch(e){}const w=document.querySelector('.m23-sb');if(w)w.scrollIntoView({block:'nearest'});};
  function paintChecklist(v,pid){
    const S2=v.querySelector('#m20Dc');if(!S2)return;
    const A=autoInfo(pid);
    /* psychiatrist group: automatic, read only */
    const g=S2.querySelector('.m20-cg[data-r="psy"]');
    if(g&&!g.dataset.m23){g.dataset.m23='1';
      const map={'Capacity assessment':'capacity','Medication review':'medrev','Discharge diagnosis finalised':'finaldx'};
      g.querySelectorAll('label.m20-ci').forEach(l=>{const t=(l.querySelector('.m20-cit')||{}).textContent||'',k=map[t.trim()];if(!k)return;
        const i=l.querySelector('input');if(i){i.disabled=true;i.removeAttribute('onchange');}l.classList.add('ro');
        const sub=l.querySelector('.tiny');const a=A[k];
        if(sub)sub.innerHTML=a?'Auto · '+E(a.by)+(a.at?', '+E(a.at):''):(k==='capacity'?'Not done yet · <a href="#/patient/'+encodeURIComponent(pid)+'/capacity">Open Capacity assessment</a>':k==='medrev'?'Ticks itself when the discharge medicines are written':'Ticks itself when the discharge diagnosis is filled');
        if(k==='finaldx'&&t.trim()==='Discharge diagnosis finalised'){const c=l.querySelector('.m20-cit');if(c)c.textContent='Discharge diagnosis';}
      });
      const you=g.querySelector('.m20-you');if(you)you.textContent='Auto';
    }
    /* Admin group */
    const grid=S2.querySelector('.m20-cgrid');
    if(grid&&!grid.querySelector('.m23-adm'))grid.insertAdjacentHTML('beforeend',adminCard(pid));
    /* old sign-off items */
    S2.querySelectorAll('label.check').forEach(l=>{
      const txt=(l.textContent||'').trim();
      if(/^Risk reviewed for discharge/.test(txt)||l.hasAttribute('data-dcw')||/^Discharge summary written/.test(txt)){l.classList.add('m20-hide');return;}
      if(/^Summary reviewed/.test(txt)&&!l.dataset.m23){l.dataset.m23='1';
        const i=l.querySelector('input');if(i){i.removeAttribute('onchange');i.onclick=ev=>{if(i.checked){ev.preventDefault();m23SumReview(pid);}else{const D=(ctx(pid).discharge)||S.discharge;if(D){D.summary=false;D.written=false;}render();}};}
        const sub=l.querySelector('.grow .small,.grow .tiny,.grow span:last-child');
        const by=(S.dcBy||{}).summary;if(sub&&sub!==l.querySelector('.grow > span:first-child'))sub.textContent=by&&(((ctx(pid).discharge)||S.discharge||{}).summary)?'Reviewed by '+by.by+', '+by.at:'Tick to open the summary as a document and confirm';
      }
      if(/^Discharge consent signed/.test(txt)&&!l.dataset.m23){l.dataset.m23='1';
        const c=consentSigned(pid);
        const box=document.createElement('div');box.className='m23-dcb';
        box.innerHTML=c?'<span class="tiny" style="color:#067647">E-signed'+(c.by?' by '+E(c.by):'')+(c.at?' · '+E(c.at):'')+'</span><button type="button" class="btn sm" onclick="m23DcPrint(\''+Q(pid)+'\')">Print form</button>'
          :'<button type="button" class="btn sm" onclick="m23DcPrint(\''+Q(pid)+'\')">Print form</button><button type="button" class="btn sm pri" onclick="m23DcEsign(\''+Q(pid)+'\')">Collect e-signature</button>';
        l.after(box);
        const sub=l.querySelector('.grow');if(sub){const s2=sub.querySelectorAll('span');const last=s2[s2.length-1];if(last&&s2.length>1)last.textContent='Signed by the family (sometimes the patient). Print it, or collect the e-signature here.';}
      }
    });
    /* 24 Nov meeting: the summary review and the patient/family signature are items of the psychiatrist's own list */
    if(g){S2.querySelectorAll('label.check[data-m23]').forEach(l=>{if(g.contains(l))return;const nx=l.nextElementSibling&&l.nextElementSibling.classList.contains('m23-dcb')?l.nextElementSibling:null;
      l.classList.add('m24-in');const t=l.querySelector('.grow > span:first-child,.grow b,.grow strong');if(t&&/^Summary reviewed/.test(t.textContent.trim()))t.textContent='Review discharge summary';
      g.appendChild(l);if(nx)g.appendChild(nx);});
      /* 24 Nov (owner): Form C goes into the psychiatrist's list too; the emptied "Other items before signing" card goes, and the
         Review, confirm and sign card loses its step number */
      S2.querySelectorAll('label.check').forEach(l=>{if(g.contains(l)||!/^Form C signed by the patient/.test((l.textContent||'').trim()))return;
        const card=l.closest('section.card');l.classList.add('m24-in');g.appendChild(l);
        if(card&&![...card.querySelectorAll('label.check')].some(x=>!x.classList.contains('m20-hide')))card.classList.add('m20-hide');});
      S2.querySelectorAll('section.card .hd h3').forEach(h=>{if(/Review, confirm and sign$/.test(h.textContent.trim())){const n=h.querySelector('.pg-stepn');if(n)n.remove();}});}
    S2.querySelectorAll('.small.muted').forEach(d=>{if(/^Belongings, bill clearance and bed release/.test((d.textContent||'').trim()))d.textContent='Billing and belongings are in the Admin group above.';});
  }

  const css=document.createElement('style');css.id='m23-dc-css';
  css.textContent=
    '.m23-dcw .m20n .m20n-t{display:none!important}.m23-dcw .m20n{background:none;padding:0;justify-content:flex-end}'+
    '.m23-tl{list-style:none;margin:0 0 14px;padding:0;display:flex;flex-direction:column}'+
    '.m23-sb{display:block;margin:4px 0 18px;background:#fff;border:1px solid #e4e8ee;border-radius:14px;overflow:hidden}'+
    '.m23-sbr{display:grid;grid-template-columns:repeat(3,minmax(0,1fr))}'+
    '.m23-sbi{all:unset;box-sizing:border-box;cursor:pointer;display:flex;align-items:center;gap:12px;padding:14px 16px;min-width:0;position:relative;transition:background .2s}'+
    '.m23-sbi+.m23-sbi{border-left:1px solid #eef1f5}'+
    '.m23-sbi:hover{background:#f8fafc}.m23-sbi:focus-visible{outline:2px solid #1e6cdb;outline-offset:-2px}'+
    '.m23-sbi .qic{flex:none;width:38px;height:38px;border-radius:11px;display:grid;place-items:center;background:#f2f4f7;color:#667085;transition:background .25s,color .25s,transform .25s}'+
    '.m23-sbi .qtx{display:flex;flex-direction:column;flex:1 1 auto;min-width:0}'+
    '.m23-sbi .qst{font-size:11.5px;color:#98a2b3;font-weight:500;line-height:1.2}'+
    '.m23-sbi .qtt{font-size:14px;font-weight:600;color:#344054;line-height:1.35;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'+
    '.m23-sbi .qws{font-size:12px;color:#98a2b3;line-height:1.3}'+
    '.m23-sbi.on{background:#f0f5fe}.m23-sbi.on .qic{background:#1e6cdb;color:#fff;transform:scale(1.04);box-shadow:0 4px 12px -4px rgba(30,108,219,.55)}.m23-sbi.on .qtt{color:#1849a9}.m23-sbi.on .qws{color:#1e6cdb;font-weight:600}'+
    '.m23-sbi.done .qic{background:#ecfdf3;color:#067647}.m23-sbi.done .qws{color:#067647;font-weight:500}.m23-sbi.done .qtt{color:#101828}'+
    '.m23-sbi.next .qws{color:#475467}'+
    '.m23-sbt{height:3px;background:#eef1f5}.m23-sbt i{display:block;height:100%;width:0;background:linear-gradient(90deg,#12b76a,#1e6cdb);border-radius:0 3px 3px 0;transition:width .45s cubic-bezier(.3,.7,.2,1)}'+
    '.m23-one>.m23-tls:not([style*="none"]){animation:m23In .22s ease-out}'+
    '@keyframes m23In{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}'+
    '@media(max-width:900px){.m23-sbi{gap:8px;padding:12px 10px}.m23-sbi .qst{display:none}.m23-sbi .qic{width:32px;height:32px}}'+
    '@media(max-width:560px){.m23-sbi .qst,.m23-sbi .qtt{display:none}.m23-sbi{align-items:center}}'+
    '@media(prefers-reduced-motion:reduce){.m23-sbt i,.m23-sbi,.m23-sbi .qic{transition:none}.m23-one>.m23-tls{animation:none!important}}'+
    '.m23-one .m23-tls{grid-template-columns:minmax(0,1fr)!important;padding-bottom:0}.m23-one .m23-tld,.m23-one .m23-tlh,.m23-one .m23-tls::before{display:none!important}'+
    '.m23-snav{display:flex;justify-content:space-between;margin:14px 0 4px}'+
    '.m23-tls{position:relative;display:grid;grid-template-columns:34px minmax(0,1fr);gap:14px;padding-bottom:18px}'+
    '.m23-tls:not(:last-child)::before{content:"";position:absolute;left:16px;top:34px;bottom:0;width:2px;background:#d5dce6}'+
    '.m23-tld{width:34px;height:34px;border-radius:50%;background:#1e6cdb;color:#fff;font-weight:700;display:flex;align-items:center;justify-content:center;font-size:14px}'+
    '.m23-tlh{font-size:15px;font-weight:700;color:#101828;margin:6px 0 8px}'+
    '.m23-tlb{min-width:0}.m23-tlb>section.card{margin:0!important}.m23-tlb #m20SumCol{display:flex;flex-direction:column;gap:10px}'+
    '.m23-dcb{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:-2px 0 10px 28px}'+
    'body.psy-views .m20-cgrid{grid-template-columns:repeat(auto-fit,minmax(220px,1fr))!important}';
  document.head.appendChild(css);

  const __r=render;
  render=function(){
    const r0=route();
    if(r0.pid&&r0.sub==='discharge'){try{applyAuto(r0.pid);}catch(e){}}
    const o=__r.apply(this,arguments);
    try{
      const r=route(),v=document.getElementById('view');
      const p=()=>{const v2=document.getElementById('view');if(v2&&route().sub==='discharge'){paintSummary(v2,r.pid);paintChecklist(v2,r.pid);}};if(v&&r.pid&&r.sub==='discharge'){p();setTimeout(p,0);setTimeout(p,300);}
    }catch(e){try{console.warn('m23 discharge',e);}catch(_){}}
    return o;
  };
})();
