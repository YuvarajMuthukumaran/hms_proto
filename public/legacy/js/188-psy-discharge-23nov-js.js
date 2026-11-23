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
      [['type','Discharge type'],['summary','Summary'],['meds','Medication plan'],['therapy','Therapy plan']].forEach(([k,t])=>{const p=W.querySelector('.m20p[data-k="'+k+'"]');if(!p)return;
        const li=document.createElement('li');li.className='m23-tls';li.innerHTML='<span class="m23-tld">'+(tl.children.length+1)+'</span><div class="m23-tlb"><div class="m23-tlh">'+t+'</div></div>';li.querySelector('.m23-tlb').appendChild(p);tl.appendChild(li);});
      const nav=W.querySelector('.m20n');if(nav)nav.after(tl);else W.appendChild(tl);
    }
    W.classList.add('m23-dcw');
    tl.style.display=isC?'none':'';
    if(!isC)tl.querySelectorAll('.m20p').forEach(p=>{p.style.display='';});
  }
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
    S2.querySelectorAll('.small.muted').forEach(d=>{if(/^Belongings, bill clearance and bed release/.test((d.textContent||'').trim()))d.textContent='Billing and belongings are in the Admin group above.';});
  }

  const css=document.createElement('style');css.id='m23-dc-css';
  css.textContent=
    '.m23-dcw .m20n .m20n-t{display:none!important}.m23-dcw .m20n{background:none;padding:0;justify-content:flex-end}'+
    '.m23-tl{list-style:none;margin:0 0 14px;padding:0;display:flex;flex-direction:column}'+
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
