/* 20 Nov 2026 (owner, screenshots after the meeting changes went live).
   1. Today list and the eye pop-up (psychiatrist, psychologist and their floor leads): a line about the patient no longer ends with
      " · <patient name>" (the row already says who), and the same line is shown once. Repeated alerts with the same title for the
      same patient (e.g. "No consultant review for 5 days", raised again each day) are kept as one open alert.
   2. "Records from the old HMS" is removed from every screen (the Past admission card and View records still open the old files).
   3. Patient tabs (Stay summary ... Discharge summary) look like the Patient Experience tabs did before 19 Nov: plain text tabs with a
      blue underline on the open tab, no pills, no icons (psychiatrist, psychologist and their floor leads).
   4. Psychologist detailed history looks like the psychiatrist's: the section bar shows every section's name, the questions sit in
      two columns, and the boxes are the same size and colour. */
(function(){
  const ROLE=String((window.__TULASI__||{}).role||'');
  const CLIN=/^(psychiatrist|floor-lead-psychiatrist|psychologist|floor-lead-psychologist)$/.test(ROLE);
  const PSG=/^(psychologist|floor-lead-psychologist)$/.test(ROLE);
  const nameOf=pid=>{try{return String((ptFind(pid)||{}).name||'').trim();}catch(e){return '';}};
  const strip=(t,nm)=>{t=String(t||'');if(!nm)return t;const s=' · '+nm;return t.endsWith(s)?t.slice(0,-s.length):t;};
  const sig=t=>String(t||'').toLowerCase().replace(/\d+/g,'#').replace(/\s+/g,' ').trim();

  /* ---------- styles: 2 (everyone), 3 and 4 ---------- */
  const css=document.createElement('style');css.id='m20-owner-css';
  css.textContent=
    '.card:has(> #ohms-box){display:none!important}'+
    (CLIN?
      'body #view .subtabs{gap:4px!important;border-bottom:1px solid #E3EAF2;padding:0!important;background:transparent!important;border-radius:0!important;box-shadow:none!important}'+
      'body #view .subtabs .subtab,body #view .subtabs>button{border:0!important;background:transparent!important;padding:10px 14px!important;font-size:14px!important;font-weight:600!important;white-space:nowrap;color:#475467!important;border-bottom:2px solid transparent!important;border-radius:0!important;box-shadow:none!important;min-height:0!important}'+
      'body #view .subtabs .subtab.on,body #view .subtabs>button.on,body #view .subtabs>button[aria-selected="true"]{color:#1E5BB8!important;border-bottom-color:#1E6CDB!important;background:transparent!important}'+
      'body #view .subtabs .subtab .sti,body #view .subtabs>button .sti,body #view .subtabs>button>svg{display:none!important}'+
      'body #view .subtabs .subtab:hover{color:#1E5BB8!important}':'')+
    (PSG?
      /* section bar: names shown, pills like the psychiatrist's */
      'body.psg #view .hrow11.hrow11 .hnav,body.psg #view .adm-full .hnav{flex:1 1 100%;display:flex!important;flex-direction:row!important;flex-wrap:nowrap;gap:8px!important;width:auto!important;min-width:0!important;max-width:100%;padding:10px 14px 12px!important;background:#fff;border:1px solid #E3EAF2;border-radius:16px;overflow-x:auto;position:relative;top:auto;box-shadow:none}'+
      'body.psg #view .hrow11.hrow11 .hnav button,body.psg #view .adm-full .hnav button{width:auto!important;display:flex!important;align-items:center;gap:8px!important;padding:5px 12px 5px 6px!important;border-radius:99px;border:1px solid #E3EAF2;background:#fff;color:#334155;font-size:13px;font-weight:600;white-space:nowrap;flex:0 0 auto}'+
      'body.psg #view .hrow11.hrow11 .hnav button.on,body.psg #view .adm-full .hnav button.on{border-color:#1E6CDB;background:#EAF2FD;color:#1E5BB8}'+
      'body.psg #view .hrow11.hrow11 .hnav button>span:not(.hn),body.psg #view .adm-full .hnav button>span:not(.hn){display:inline!important;opacity:1!important;transform:none!important;flex:0 0 auto}'+
      'body.psg #view .hrow11.hrow11 .hnav button:hover:after,body.psg #view .hrow11.hrow11 .hnav button:focus-visible:after{content:none!important;display:none!important}'+
      'body.psg #view .hnav .hn{width:28px;height:28px;border-radius:99px;background:#F1F4F8;color:#334155;font-size:13px;display:flex;align-items:center;justify-content:center;flex:none}'+
      'body.psg #view .hnav button.on .hn{background:#1E6CDB;color:#fff}'+
      'body.psg #view .hrow11.hrow11{flex-wrap:wrap}'+
      /* questions: two columns, compact boxes, blue Q tags */
      'body.psg #view .hwrap .hgrid,body.psg #view .hwrap .hgrid:has(.hf-sel){grid-template-columns:repeat(12,minmax(0,1fr))!important;gap:12px 14px!important;padding:16px 0 0!important}'+
      'body.psg #view .hwrap .hgrid>.hf{grid-column:span 6}'+
      'body.psg #view .hwrap .hgrid>.hf:has(textarea),body.psg #view .hwrap .hgrid>.hf:has(.mini-chips),body.psg #view .hwrap .hgrid>.hf:has(.pm-tree),body.psg #view .hwrap .hgrid>.hf.wide{grid-column:1/-1}'+
      'body.psg #view .hwrap .hgrid select.input,body.psg #view .hwrap .hgrid input.input{min-height:38px!important;padding:9px 12px!important;border-radius:12px!important;font-size:15px}'+
      'body.psg #view .hwrap .hgrid textarea.input{min-height:72px!important}'+
      'body.psg #view .hwrap .hgrid>.hf>.lbl:first-child{margin:0 0 4px!important;font-size:13.5px}'+
      'body.psg #view .hwrap .hgrid>.hf>.lbl:first-child::before{color:#175cd3!important;background:#eef4ff!important;border-color:#cfe0fb!important}'+
      '@media(max-width:900px){body.psg #view .hwrap .hgrid>.hf{grid-column:1/-1}}':'');
  document.head.appendChild(css);

  if(!CLIN)return;

  /* ---------- 1. alerts: no name at the end, no repeats ---------- */
  function cleanAlerts(){
    let s;try{s=v3();}catch(e){return;}if(!s||!Array.isArray(s.alerts))return;
    const seen={},keep=[];let changed=false;
    s.alerts.forEach(a=>{
      if(!a)return;
      const t=strip(a.title,nameOf(a.pid));if(t!==a.title){a.title=t;changed=true;}
      const open=!a.closed;
      const k=a.pid+'|'+sig(a.title);
      if(open&&!a.ack&&seen[k]){changed=true;return;}   /* a later copy of an open alert that is already listed */
      if(open)seen[k]=1;
      keep.push(a);
    });
    if(changed)s.alerts.splice(0,s.alerts.length,...keep);
  }
  try{
    const __al=V3.alert;
    V3.alert=function(o){
      try{
        o=Object.assign({},o);o.title=strip(o.title,nameOf(o.pid));
        const s=v3();if(s&&Array.isArray(s.alerts)&&s.alerts.some(a=>a&&!a.closed&&a.pid===o.pid&&sig(a.title)===sig(o.title)))return;
      }catch(e){}
      return __al.call(this,o);
    };
  }catch(e){}

  /* the lines on the Today table and in the eye pop-up */
  function tidyLines(root){
    if(!root)return;
    root.querySelectorAll('table.pd-t tbody tr').forEach(tr=>{
      const nm=String((tr.querySelector('.pd-nm b')||{}).textContent||'').trim();
      tr.querySelectorAll('td').forEach(td=>{
        const ds=[...td.querySelectorAll(':scope > .pd-d')];if(!ds.length)return;
        const seen={};let removed=0;
        ds.forEach(d=>{
          const sp=d.querySelector('span');if(sp&&nm){const f=sp.firstChild;if(f&&f.nodeType===3)f.nodeValue=strip(f.nodeValue,nm);}
          const k=sig(d.textContent);if(seen[k]){d.remove();removed++;}else seen[k]=1;
        });
        if(removed){const more=[...td.querySelectorAll(':scope > .tiny')].find(x=>/more, press the eye/.test(x.textContent));if(more){const m=more.textContent.match(/\+(\d+)/);if(m)more.textContent='+'+m[1]+' more, press the eye';}}
      });
    });
  }
  function tidyModal(){
    const m=document.getElementById('modal');if(!m||m.dataset.m20t===String(m.innerHTML.length))return;
    const title=String((m.querySelector('h3')||{}).textContent||'').trim();
    let nm='';try{const p=Object.values(WARDS).flat().find(x=>x&&x.name&&title.indexOf(x.name)>=0);nm=p?p.name:'';}catch(e){}
    if(!nm)return;
    /* text blocks that hold several lines (one per <br> or per child) */
    m.querySelectorAll('div,span,li').forEach(el=>{
      if(el.children.length&&![...el.children].every(c=>c.tagName==='BR'))return;
      const parts=el.innerHTML.split(/<br\s*\/?>/i);
      const seen={},out=[];
      parts.forEach(h=>{const tx=document.createElement('div');tx.innerHTML=h;const t=strip(tx.textContent.trim(),nm);if(!t){out.push(h);return;}const k=sig(t);if(seen[k])return;seen[k]=1;out.push(tx.textContent.trim()===t?h:hesc(t));});
      const n=out.join('<br>');if(n!==el.innerHTML)el.innerHTML=n;
    });
    m.dataset.m20t=String(m.innerHTML.length);
  }
  const mo=new MutationObserver(()=>{try{tidyModal();}catch(e){}});
  const watch=()=>{const m=document.getElementById('modal');if(m&&!m.dataset.m20w){m.dataset.m20w='1';mo.observe(m,{childList:true,subtree:true});}};

  /* old-HMS sentence that pointed to the removed section */
  function oldHmsText(){document.querySelectorAll('#view #ohms-rx div').forEach(d=>{if(/see Records from the old HMS/i.test(d.textContent))d.remove();});}

  const __r=render;
  render=function(){
    try{cleanAlerts();}catch(e){}
    const o=__r.apply(this,arguments);
    try{tidyLines(document.getElementById('view'));watch();tidyModal();oldHmsText();}catch(e){}
    return o;
  };
  try{cleanAlerts();watch();}catch(e){}
})();
