/* 24 Nov 2026, meeting with Anu Yadav (screen recording). Psychiatrist and floor lead psychiatrist only.
   - Monitoring frequencies read OD, BD, TDS, QID.
   - Review treatment pop-up: wider; the vitals table hides Weight and Sleep when nothing is recorded or ordered; the monitoring
     that runs now sits in a side panel with "Add or change monitoring" and "Add medicine" (the list under Active orders is gone).
   - Order monitoring: what runs now first, the rest folded under "Add more monitoring".
   - Patient tabs bar: bigger text, solid background so it no longer overlaps the page when it sticks on scroll.
   - Capacity review buttons (dashboard, eye and Take Action, MHCA tile, discharge checklist) open the capacity assessment form;
     saving it also counts as the MHCA capacity review. The pop-up uses the admission (Step 3) layout.
   - Headings black: admission workup, discharge summary. Discharge summary: Treatment advice and Suggestions hidden.
   - Vitals trend: no green "In usual range" marks.
   - Forms: the blanks to fill are tinted so they stand apart from the printed text.
   - Discharge consent: title, no Place of outing, UHID (image edited in public/forms/discharge-consent/p1.png).
   - MECT form: blanks that sat on the information text removed, empty margins cut (images cropped), Yes/No boxes on the
     checklist, UHID for Registration Number, and a strip above each page saying who fills it and who last edited it.
   - Goals calendar: stronger colours. */
(function(){
  const ROLE=String((window.__TULASI__||{}).role||'');
  if(!/^(psychiatrist|floor-lead-psychiatrist)$/.test(ROLE))return;
  const E=s=>hesc(String(s==null?'':s));
  const Q=s=>String(s==null?'':s).replace(/\\/g,'\\\\').replace(/'/g,"\\'");
  const atNow=()=>{const d=new Date();return d.getDate()+' '+d.toLocaleString('en-GB',{month:'short'})+', '+d.toLocaleTimeString('en-IN',{hour:'numeric',minute:'2-digit'});};

  /* ---------- 1. OD / BD / TDS / QID ---------- */
  try{Object.assign(MON_WORDS,{'1-0-0':'OD','1-0-1':'BD','1-1-1':'TDS','1-1-1-1':'QID'});}catch(e){}

  /* ---------- styles ---------- */
  const css=document.createElement('style');css.id='m24-css';
  css.textContent=[
    /* patient tabs bar */
    'body #view .ws-mid>.subtabs{background:var(--bg,#f6f8fb)!important;z-index:6!important;padding-top:6px!important}',
    'body #view .ws-mid>.subtabs .subtab,body #view .ws-mid>.subtabs>button{font-size:15px!important}',
    /* review treatment pop-up */
    '.m24-rv{display:grid;grid-template-columns:minmax(0,1fr) 300px;gap:16px;align-items:start;margin:2px 0 12px}',
    '.m24-rv>#rvTreat{margin:0!important;min-width:0}',
    '.m24-side{border:1px solid #dbe6f5;border-radius:14px;background:#f8fbff;padding:14px;display:grid;gap:10px;position:sticky;top:0}',
    '.m24-sh{display:flex;align-items:center;justify-content:space-between;gap:8px}.m24-sh b{font-size:14px;color:#101828}',
    '.m24-sh span{font-size:12px;font-weight:700;color:#1e6cdb;background:#eaf1fc;border-radius:99px;padding:2px 9px}',
    '.m24-mon{display:flex;align-items:center;justify-content:space-between;gap:8px;background:#fff;border:1px solid #e3eaf2;border-radius:10px;padding:8px 10px}',
    '.m24-mon b{font-size:13.5px;color:#101828}.m24-mon em{font-style:normal;font-size:13px;font-weight:700;color:#067647;background:#ecfdf3;border-radius:6px;padding:2px 8px;white-space:nowrap}',
    '.m24-mon small{display:block;font-size:11.5px;color:#667085}',
    '.m24-side .btn{width:100%;justify-content:center}',
    '@media(max-width:900px){.m24-rv{grid-template-columns:1fr}.m24-side{position:static}}',
    /* order monitoring */
    '.m24-more{margin-top:10px;border-top:1px solid #eef2f6;padding-top:8px}.m24-more summary{cursor:pointer;font-weight:600;color:#1e6cdb;font-size:13.5px;padding:6px 0}',
    /* headings black */
    '#workupCard .wk-gb .lbl{color:#101828!important;font-weight:700!important}',
    '#m20SumCol label.field>.lbl,#m20SumCol .field .lbl,.m20p label.field>.lbl,.m20p .m20-fu>b{color:#101828!important;font-weight:700!important;font-size:13.5px!important}',
    /* vitals trend: no green marks */
    '.vx-st.ok{display:none!important}',
    /* forms: blanks stand apart */
    '.cdf-page .cdf-f:not(.cdf-ro){background:rgba(254,240,138,.22)!important;box-shadow:inset 0 -1px 0 rgba(217,119,6,.55)!important;color:#101828!important}',
    '.cdf-page .cdf-f:not(.cdf-ro):focus{background:#fff!important;box-shadow:0 0 0 2px #1e6cdb!important}',
    '.cdf-page .cdf-chk.on{background:#dcfae6!important;color:#067647}',
    '.m24-mh{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin:12px auto 6px;padding:8px 12px;border-radius:10px;background:#eef4ff;border:1px solid #c7d7fe;font-size:13px;color:#1d2939;box-sizing:border-box}',
    '.m24-mh b{color:#1849a9}.m24-mh small{color:#475467;font-size:12px}.m24-mh.info{background:#f2f4f7;border-color:#e4e7ec}.m24-mh.info b{color:#344054}',
    /* goals calendar */
    '.gc{border:0!important;background:linear-gradient(180deg,#f3f7ff 0,#fff 150px)!important;box-shadow:0 0 0 1px #dbe6f5,0 2px 6px rgba(16,24,40,.06)!important;border-radius:16px!important}',
    '.gc-hd h3{font-size:17px!important;font-weight:800!important}',
    '.gc-w span{background:#eaf1fc!important;color:#1849a9!important;font-weight:700!important}',
    '.gc-d{min-height:76px!important;border-color:#e3eaf2!important;border-radius:12px!important}',
    '.gc-d:hover{border-color:#84adff!important;box-shadow:0 2px 8px rgba(30,108,219,.12)}',
    '.gc-d.t-ok{background:#d1fadf!important;border-color:#6ce9a6!important}',
    '.gc-d.t-half{background:#fef0c7!important;border-color:#fdb022!important}',
    '.gc-d.t-no{background:#fee4e2!important;border-color:#f97066!important}',
    '.gc-d.today{background:#eff4ff!important;box-shadow:inset 0 0 0 2px #1e6cdb!important}',
    '.gc-n{font-size:12.5px!important;font-weight:700;color:#344054!important}',
    '.gc-c{min-width:24px!important;height:24px!important;border-radius:8px!important;font-size:12px!important}',
    '.gc-kb{border-width:1.5px!important;font-weight:600!important}',
    '.gc-side{background:#f8fafc;border:1px solid #e3eaf2!important;border-radius:14px;padding:16px!important}',
    '.gc-big{font-size:34px!important;color:#1e6cdb!important}'
  ].join('');
  document.head.appendChild(css);

  /* capacity pop-up: the admission Step 3 layout (block 72's rules, scoped to the pop-up) */
  try{
    const PRE='body.psy-views:not(.psg) #view #capCard',out=[];
    const walk=rules=>[...rules].forEach(r=>{
      if(r.cssRules&&r.media){const inner=[];[...r.cssRules].forEach(x=>{if(x.selectorText&&x.selectorText.indexOf(PRE)>=0)inner.push(x.cssText.split(PRE).join('#acrCapF'));});if(inner.length)out.push('@media '+r.media.mediaText+'{'+inner.join('')+'}');return;}
      if(r.selectorText&&r.selectorText.indexOf(PRE)>=0)out.push(r.cssText.split(PRE).join('#acrCapF'));
    });
    [...document.styleSheets].forEach(sh=>{try{walk(sh.cssRules);}catch(e){}});
    if(out.length){const st=document.createElement('style');st.id='m24-cap-css';st.textContent=out.join('\n');document.head.appendChild(st);}
  }catch(e){}

  /* ---------- 2. vitals table: Weight, Sleep only when recorded or ordered ---------- */
  const CORE=/^(Date|BP|Pulse|Temp|SpO2)/i;
  function monNames(pid){try{return (typeof monList==='function'?monList(pid):[]).map(x=>String(x[0]));}catch(e){return [];}}
  function trimVitals(root,pid){
    (root||document).querySelectorAll('.pv-vit table').forEach(t=>{
      const hr=t.tHead&&t.tHead.rows[0];if(!hr)return;
      const rows=[...t.tBodies].flatMap(b=>[...b.rows]),n=hr.cells.length;
      if(rows.some(r=>r.cells.length!==n))return;
      const mon=monNames(pid||S.pid);
      [...hr.cells].forEach((th,i)=>{
        const name=(th.querySelector('span')||th).textContent.trim();if(CORE.test(name))return;
        const key=name.split(' ')[0].toLowerCase(),ordered=mon.some(m=>m.toLowerCase().indexOf(key)===0);
        const empty=rows.every(r=>{const c=r.cells[i];const x=(c&&c.firstChild&&c.firstChild.textContent||c&&c.textContent||'').trim();return !x||x.charAt(0)==='—';});
        const hide=empty&&!ordered;th.style.display=hide?'none':'';rows.forEach(r=>{r.cells[i].style.display=hide?'none':'';});
      });
    });
  }

  /* ---------- 3. review treatment pop-up ---------- */
  function scaleOrders(pid){try{return ((psyPx(pid)||{}).scaleOrders||[]).filter(o=>o&&o.scale);}catch(e){return [];}}
  function enhanceReview(){
    const box=document.getElementById('rvTreat');if(!box||box.dataset.m24)return;
    const card=box.querySelector('.mchart');const pid=card&&card.getAttribute('data-pid');if(!pid)return;
    box.dataset.m24='1';
    const m=document.getElementById('modal');if(m)m.style.width='min(1400px,96vw)';
    trimVitals(box,pid);
    let mons=[];try{mons=monList(pid)||[];}catch(e){}
    const lab=f=>MON_WORDS[f]||f;
    const rows=mons.map(x=>`<div class="m24-mon"><div><b>${E(x[0])}</b><small>${E((x[2]||{}).by||'')}</small></div><em>${E(lab(x[1]))}</em></div>`)
      .concat(scaleOrders(pid).map(o=>`<div class="m24-mon"><div><b>${E(o.scale)}</b><small>${E(o.by||'Scale')}</small></div><em>${E(o.freq||'')}</em></div>`));
    const side=document.createElement('aside');side.className='m24-side';
    side.innerHTML=`<div class="m24-sh"><b>Monitoring running now</b><span>${rows.length}</span></div>`
      +(rows.join('')||'<div class="small muted">No monitoring ordered.</div>')
      +`<button class="btn sm pri" onclick="ptUse('${Q(pid)}');shScaleOrder('${Q(pid)}')">Add or change monitoring</button>`
      +`<button class="btn sm" onclick="ptUse('${Q(pid)}');psyRxOpen({ctx:'orders'})">Add medicine</button>`;
    const wrap=document.createElement('div');wrap.className='m24-rv';
    box.parentNode.insertBefore(wrap,box);wrap.appendChild(box);wrap.appendChild(side);
    /* the monitoring rows leave Active orders (they are in the side panel now) */
    const ob=document.getElementById('rvOrd');
    if(ob){const rs=[...ob.children].filter(d=>{const c=d.querySelector('.chip');return c&&/^\s*✓?\s*Monitoring\s*$/.test(c.textContent);});
      rs.forEach(d=>d.remove());
      const left=[...ob.children].filter(d=>d.querySelector('.chip')).length;
      const t=ob.querySelector('.lbl .tiny');if(t)t.textContent=left+' running now';
      if(!left&&!ob.querySelector('.m24-none'))ob.insertAdjacentHTML('beforeend','<div class="small muted m24-none">No other active order.</div>');}
  }

  /* ---------- 4. order monitoring: running first ---------- */
  if(typeof window.shScaleOrder==='function'){
    const __so=window.shScaleOrder;
    window.shScaleOrder=function(pid){
      const r=__so.apply(this,arguments);
      try{
        const tb=document.querySelector('#modal table tbody');if(!tb||tb.dataset.m24)return r;tb.dataset.m24='1';
        const rows=[...tb.rows],on=rows.filter(x=>{const s=x.querySelector('select[data-om]');return s&&s.dataset.cur;}),off=rows.filter(x=>on.indexOf(x)<0);
        if(!off.length)return r;
        if(!on.length)tb.insertAdjacentHTML('afterbegin','<tr class="m24-none"><td colspan="2" class="small muted">No monitoring running now.</td></tr>');
        const d=document.createElement('details');d.className='m24-more';
        d.innerHTML='<summary>Add more monitoring ('+off.length+')</summary><table class="t"><tbody></tbody></table>';
        const tb2=d.querySelector('tbody');off.forEach(x=>tb2.appendChild(x));
        tb.closest('table').after(d);
        const th=tb.closest('table').querySelector('thead th');if(th)th.textContent='Running now';
      }catch(e){}
      return r;
    };
  }

  /* ---------- 5. capacity review opens the capacity assessment ---------- */
  const capFix=()=>{
    try{Object.keys(window.__psyMap||{}).forEach(pid=>{((window.__psyMap[pid]||{}).items||[]).forEach(i=>{
      if(i&&i.btn&&/capacity review/i.test(String(i.btn[0]||''))&&/go\(/.test(String(i.btn[1]||'')))i.btn[1]=`acrCapNew('${Q(pid)}')`;});});}catch(e){}
    document.querySelectorAll('#view button,#view a').forEach(b=>{
      const t=(b.textContent||'').trim(),oc=b.getAttribute('onclick')||'',hr=b.getAttribute('href')||'';
      let m;
      if(/capacity review/i.test(t)&&(m=oc.match(/go\('#\/patient\/([^/']+)\//)))b.setAttribute('onclick',`acrCapNew('${Q(decodeURIComponent(m[1]))}')`);
      else if(/Open Capacity assessment/i.test(t)&&(m=hr.match(/^#\/patient\/([^/]+)\/capacity/))){b.removeAttribute('href');b.setAttribute('role','button');b.style.cursor='pointer';b.setAttribute('onclick',`acrCapNew('${Q(decodeURIComponent(m[1]))}');return false`);}
    });
  };
  ['psyEyePop','psyMenu'].forEach(n=>{const o=window[n];if(typeof o!=='function')return;window[n]=function(){capFix();const r=o.apply(this,arguments);setTimeout(()=>{capFix();enhanceReview();},0);return r;};});
  const __mc=window.mhcaCap;
  if(typeof window.acrCapNew==='function'){
    window.mhcaCap=function(pid){acrCapNew(pid);};
    const __cs=window.acrCapNewSave;
    if(typeof __cs==='function')window.acrCapNewSave=function(pid){
      const n0=((psyPx(pid)||{}).capHist||[]).length;const r=__cs.apply(this,arguments);
      /* a saved assessment is also the MHCA capacity review (block 79), recorded without a second PIN */
      if(((psyPx(pid)||{}).capHist||[]).length>n0&&typeof __mc==='function'){const ps=window.pinSign;try{window.pinSign=function(t,rows,cb){cb();};__mc(pid);}catch(e){}finally{window.pinSign=ps;}}
      return r;};
  }

  /* ---------- 6. discharge summary: no Treatment advice, no Suggestions ---------- */
  const dropDc=()=>{
    if(!/^#\/patient\/[^/]+\/discharge/.test(location.hash))return;
    document.querySelectorAll('#view label.field').forEach(l=>{const t=((l.querySelector('.lbl')||{}).textContent||'').trim();if(/^(Treatment advice on discharge|Suggestions)$/i.test(t))l.style.display='none';});
  };

  /* ---------- 7. discharge consent ---------- */
  try{const F=CDF_FORMS['discharge-consent'],pg=F&&F.pages[0];
    if(pg&&!pg.m24){pg.m24=1;
      pg.fields=pg.fields.filter(f=>f.id!=='p1f7'&&f.id!=='p1f8');
      pg.fields.forEach(f=>{if(f.id==='p1f4')f.label='UHID';if(/^p1f(9|10|11)$/.test(f.id))f.y=+(f.y-18.5).toFixed(1);
        /* Contact details was a box under the table: it goes into its own cell, next to Email ID */
        if(f.id==='p1f12')Object.assign(f,{kind:'line',x:145,y:166.6,w:170,h:12.3,size:9.5});});}
    /* 24 Nov: the e-signature was never drawn on this form (no field with "signature" in its label, which blocks 141/145 look for): two signature lines, patient and guardian */
    if(pg&&!pg.fields.some(f=>f.id==='dcSigP')){
      pg.fields.push({kind:'line',id:'dcSigP',x:150,y:520.5,w:250,h:12.3,size:9.5,label:'Signature of Patient'});
      pg.fields.push({kind:'line',id:'dcSigG',x:156,y:575.5,w:250,h:12.3,size:9.5,label:'Guardian Signature (relative)'});}
    if(CD_TEMPLATES['discharge-consent']&&CD_TEMPLATES['discharge-consent'].html)CD_TEMPLATES['discharge-consent'].html=CD_TEMPLATES['discharge-consent'].html.split('OUTING CONSENT').join('DISCHARGE CONSENT');
  }catch(e){}

  /* ---------- 8. MECT form ---------- */
  const MECT='mect-final';
  const CROP={1:[41.5,760.7],2:[18,747.7],3:[18,783.7],4:[55.5,766.2],5:[14,806.2],6:[18,38.5],7:[18,780.2],8:[18,814.2],9:[18,794.2],10:[18,426.9]};
  const SEC={1:['info','Information sheet','Read only, for the patient and family'],2:['info','Information sheet','Read only'],3:['info','Information sheet','Read only'],
    4:['doc','Information sheet, then the MECT checklist','Checklist filled by the doctor'],5:['doc','MECT checklist (doctor), then the anaesthesia consent','Anaesthesia part filled by the anaesthetist'],
7:['an','Anaesthesia consent, then the MECT informed consent','Consent filled by the doctor with the patient or NR'],
    8:['doc','MECT informed consent','Doctor with the patient or NR'],9:['doc',"Doctor's statement, then the Pre-MECT check-up",'Check-up filled by the RMO'],10:['rmo','Pre-MECT check-up','Filled by the RMO or nurse']};
  try{const F=CDF_FORMS[MECT];
    if(F&&!F.m24){F.m24=1;
      const DROP=/^(p1f\d+|p2f\d+|p3f\d+|p4f\d+|p5f[2-8]|p7f(14|26|27)|p8f([2-9]|1[0-4]|2[23])|p9f([1-6]|12))$/;
      F.pages.forEach((pg,i)=>{const n=i+1,c=CROP[n];if(!c)return;
        pg.fields=pg.fields.filter(f=>!DROP.test(f.id)&&!(n===10&&/^(Investigations|Pre MECT direction)$/i.test(String(f.label||'').trim())));
        pg.fields.forEach(f=>{f.y=+(f.y-c[0]).toFixed(1);(f.opts||[]).forEach(o=>{o.y=+(o.y-c[0]).toFixed(1);});if(f.id==='p9f13')f.label='UHID';});
        pg.h=c[1];});
      /* Yes / No boxes of the checklist (rows measured on the page images, in points before the crop) */
      const yn=(n,rows,pre)=>{const pg=F.pages[n-1],t=CROP[n][0];rows.forEach((r,j)=>{const y=+(r[0]+2-t).toFixed(1),h=+(r[1]-r[0]-4).toFixed(1);
        pg.fields.push({kind:'check',id:'m24'+pre+j+'y',x:514,y,w:19,h,label:pre+' row '+(j+1)+': Yes'},{kind:'check',id:'m24'+pre+j+'n',x:536,y,w:15,h,label:pre+' row '+(j+1)+': No'});});};
      yn(4,[[783,806]],'Pre-ECT');
      yn(5,[[61,84],[84,107],[107,129],[129,152]],'Pre-ECT');
      yn(5,[[215,254],[254,293],[293,332],[332,370],[370,409]],'Peri-MECT');
      yn(5,[[475,498],[498,521],[521,544]],'Post-MECT');
    }}catch(e){}
  /* who last filled each page of the MECT form */
  const pageOf=fid=>{try{const F=CDF_FORMS[MECT];for(let i=0;i<F.pages.length;i++)if(F.pages[i].fields.some(f=>f.id===fid))return i+1;}catch(e){}return 0;};
  const isMect=()=>String(S.cdEntryKey||'').split('|')[1]===MECT;
  const stamp=fid=>{if(!isMect())return;const n=pageOf(fid);if(!n)return;try{const v=cdfVals(S.cdEntryKey);v.__pg=v.__pg||{};v.__pg[n]={by:signer(),role:ROLE,at:atNow()};const h=document.querySelector('.m24-mh[data-p="'+n+'"] small.who');if(h)h.textContent='Last filled by '+v.__pg[n].by+' · '+v.__pg[n].at;}catch(e){}};
  try{const __s=cdfSet;cdfSet=function(fid){const r=__s.apply(this,arguments);stamp(fid);return r;};}catch(e){}
  try{const __c=cdfCheck;cdfCheck=function(fid){const r=__c.apply(this,arguments);stamp(fid);return r;};}catch(e){}
  try{const __o=cdfOpt;cdfOpt=function(fid){const r=__o.apply(this,arguments);stamp(fid);return r;};}catch(e){}
  function mectHeads(){
    document.querySelectorAll('.cdf-page>img[src*="forms/mect-final/p"]').forEach(img=>{
      const pg=img.parentElement,prev=pg.previousElementSibling;if(prev&&prev.classList.contains('m24-mh'))return;
      const n=+((img.getAttribute('src')||'').match(/p(\d+)\.png/)||[])[1];const s=SEC[n];if(!s)return;
      let w='';try{if(isMect()){const x=(cdfVals(S.cdEntryKey).__pg||{})[n];if(x)w='Last filled by '+x.by+' · '+x.at;}}catch(e){}
      const d=document.createElement('div');d.className='m24-mh'+(s[0]==='info'?' info':'');d.dataset.p=n;d.style.width=pg.style.width||'';
      d.innerHTML='<span>Page '+n+' · <b>'+E(s[1])+'</b> · '+E(s[2])+'</span><small class="who">'+E(w)+'</small>';
      pg.parentNode.insertBefore(d,pg);
    });
  }

  /* ---------- run after each render and when pop-ups open ---------- */
  let q=0;
  const tick=()=>{q=0;try{capFix();}catch(e){}try{enhanceReview();}catch(e){}try{trimVitals(document.getElementById('view'));}catch(e){}try{mectHeads();}catch(e){}try{dropDc();}catch(e){}};
  const later=()=>{if(!q)q=requestAnimationFrame(tick);};
  const __r=render;render=function(){const r=__r.apply(this,arguments);later();return r;};
  try{new MutationObserver(later).observe(document.body,{childList:true,subtree:true});}catch(e){}
  later();
})();
