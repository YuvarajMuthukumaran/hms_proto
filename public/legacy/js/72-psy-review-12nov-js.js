/* 12 Nov 2026, team review with Anu and Nikita (recording and Granola notes). Psychiatrist only; every change is gated by S.role.
   1. Past admissions: with two or more past stays, each one is a dropdown (Past admission 1, Past admission 2 ...).
   2. Admission step 2 (Admission workup): grouped into four numbered panels so the form reads in order.
   3. Admission step 4 (Detailed history): a heading names the way the form is being filled; hover animation on the switch and the steps.
   4. Patient Preferences and Grievances (was Patient Experience): Treatment Plan layout (a tab row), Grievances first, four ways a grievance comes in
      (family call, voice note with a category tag, from the patient, internal and automatic). */
(function(){
  /* the psychologist draws some pages through the psychiatrist's code with S.role switched for a moment (asDoctor), so the page's own role is checked too */
  const realRole=()=>{const b=window.__TULASI__||{};return String(b.role||b.viewRole||'');};
  const psy=()=>S.role==='psychiatrist'&&!/psycholog|patient-experience/.test(realRole());
  /* the Admission tab (steps, section strip, capacity look, mental status chips) looks the same for the psychologist (13 Nov, Nikita: copy the psychiatrist's design) */
  const admLook=()=>psy()||(S.role==='psychologist'&&/psycholog/.test(realRole()));

  const css=document.createElement('style');css.id='psy-review-12nov-css';
  css.textContent=`
  /* hover animation on the switches and the numbered steps */
  body.psy-views .hist-seg button,body.psy-views .seg button{transition:transform .16s ease,box-shadow .16s ease,background .16s ease,color .16s ease}
  body.psy-views .hist-seg button:hover,body.psy-views .seg button:hover{transform:translateY(-2px);box-shadow:0 4px 10px rgba(23,92,211,.18)}
  body.psy-views .hist-seg button:active,body.psy-views .seg button:active{transform:translateY(0)}
  body.psy-views .adm-n{transition:transform .18s ease,box-shadow .18s ease,border-color .18s ease}
  body.psy-views .adm-step button:hover .adm-n{transform:scale(1.12);box-shadow:0 0 0 5px var(--blue-tint,#e8f0ff)}
  body.psy-views .adm-step button:hover .adm-t{color:var(--blue-ink,#1e5bb8)}
  .hist-h{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap;margin:0 0 2px}
  .hist-h b{font-size:16px;font-weight:800;letter-spacing:-.01em;color:var(--ink,#101828)}
  .hist-h span{font-size:12.5px;color:var(--muted,#667085)}
  /* Detailed history section strip (psychiatrist): number and name, a little bigger, on its own neat row */
  body.psy-views:not(.psg) .hrow11 .hnav{flex:1 1 100%!important;order:3;margin-left:0!important;gap:8px!important;padding:10px 12px!important;border-radius:16px!important;justify-content:flex-start}
  body.psy-views:not(.psg) .hrow11 .hnav button{gap:8px!important;padding:5px 12px 5px 6px!important;border:1px solid var(--line,#e4e7ec)!important;background:#fff!important;border-radius:99px!important;transition:transform .15s ease,box-shadow .15s ease,border-color .15s ease,background .15s ease}
  body.psy-views:not(.psg) .hrow11 .hnav button:hover{transform:translateY(-2px);border-color:#9ec0f7!important;box-shadow:0 4px 10px rgba(23,92,211,.15)}
  body.psy-views:not(.psg) .hrow11 .hnav button>span:not(.hn){display:inline!important;flex:none!important;font-size:13.5px;font-weight:600;color:#344054;max-width:none;overflow:visible;opacity:1}
  body.psy-views:not(.psg) .hrow11 .hnav button .hn{width:28px!important;height:28px!important;min-width:28px;font-size:13px!important;font-weight:800}
  body.psy-views:not(.psg) .hrow11 .hnav button.on{background:#eaf2fd!important;border-color:#1e6cdb!important}
  body.psy-views:not(.psg) .hrow11 .hnav button.on>span:not(.hn){color:#175cd3;font-weight:800}
  body.psy-views:not(.psg) .hrow11 .hnav button:hover:after,body.psy-views:not(.psg) .hrow11 .hnav button:focus-visible:after{content:none!important;display:none!important}

  /* capacity assessment, Fill form (psychiatrist): numbered parts, answers as a switch, quiet notes, large conclusion choices */
  body.psy-views:not(.psg) #view #capCard .cap-prog{display:flex;align-items:center;gap:14px;padding:12px 16px;border:1px solid #dbe6f5;border-radius:14px;background:#f5f9ff}
  body.psy-views:not(.psg) #view #capCard .cap-prog b{font-size:13.5px;font-weight:800;color:#14284b;white-space:nowrap}
  body.psy-views:not(.psg) #view #capCard .cap-prog .bar{flex:1;height:8px;border-radius:99px;background:#dde8f7;overflow:hidden}
  body.psy-views:not(.psg) #view #capCard .cap-prog .bar i{display:block;height:100%;width:0;background:#1e6cdb;border-radius:99px;transition:width .25s ease}
  body.psy-views:not(.psg) #view #capCard .cap-g{border:1px solid #e1e9f4;border-radius:18px;background:#fff;padding:0;gap:0;overflow:hidden;box-shadow:0 1px 2px rgba(16,24,40,.04)}
  body.psy-views:not(.psg) #view #capCard .cap-g>.cg-h{display:flex;align-items:center;gap:14px;margin:0;padding:15px 20px;background:#f8fafd;border-bottom:1px solid #e8eef7}
  body.psy-views:not(.psg) #view #capCard .cg-n{flex:0 0 32px;width:32px;height:32px;border-radius:50%;background:#1e6cdb;color:#fff;font-style:normal;font-weight:800;font-size:14px;display:flex;align-items:center;justify-content:center}
  body.psy-views:not(.psg) #view #capCard .cg-n.warn{background:#fff3d6;color:#9a5b00;box-shadow:inset 0 0 0 1.5px #f1cf85}
  body.psy-views:not(.psg) #view #capCard .cg-n.plain{background:#e8f0fc;color:#175cd3}
  body.psy-views:not(.psg) #view #capCard .cg-t b{display:block;font-size:16px;font-weight:800;letter-spacing:-.01em;color:#14284b;line-height:1.3}
  body.psy-views:not(.psg) #view #capCard .cg-t small{display:block;margin-top:2px;font-size:12.5px;color:#667085;line-height:1.4}
  body.psy-views:not(.psg) #view #capCard .cap-g>.grid2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px 22px;padding:18px 20px 6px}
  body.psy-views:not(.psg) #view #capCard .cap-g .field .lbl{display:block;margin-bottom:6px;font-size:12.5px;font-weight:700;color:#475467}
  body.psy-views:not(.psg) #view #capCard .cap-g>.grid2 .input{height:44px;border-radius:11px;border:1px solid #d5dfec;background:#fff;padding:0 14px;font-size:14.5px;font-weight:600;color:#14284b}
  body.psy-views:not(.psg) #view #capCard .cap-g .input:focus{outline:0;border-color:#1e6cdb;box-shadow:0 0 0 3px #d6e5fb}
  body.psy-views:not(.psg) #view #capCard .cap-g>.tiny{padding:6px 20px 18px;font-size:12.5px;line-height:1.5;color:#667085}
  body.psy-views:not(.psg) #view #capCard .cap-g .q{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px 24px;align-items:center;padding:16px 20px;border-top:1px solid #eef2f8}
  body.psy-views:not(.psg) #view #capCard .cap-g .cg-h+.q{border-top:0}
  body.psy-views:not(.psg) #view #capCard .cap-g .q>.small{display:flex;gap:12px;align-items:flex-start;font-size:14.5px;line-height:1.5;font-weight:600;color:#1d2939}
  body.psy-views:not(.psg) #view #capCard .cq-l{flex:0 0 24px;width:24px;height:24px;margin-top:1px;border-radius:7px;background:#eef2f8;color:#475467;font-size:12px;font-weight:800;display:flex;align-items:center;justify-content:center}
  body.psy-views:not(.psg) #view #capCard .cap-g .q>.radios{display:inline-flex;flex-wrap:nowrap;gap:3px;padding:3px;border-radius:12px;background:#eef2f8;justify-self:end}
  body.psy-views:not(.psg) #view #capCard .cap-g .q>.radios .tog{height:34px;padding:0 16px;border:0;border-radius:9px;background:transparent;font-size:13.5px;font-weight:650;color:#475467;white-space:nowrap;transition:background .15s,color .15s,box-shadow .15s}
  body.psy-views:not(.psg) #view #capCard .cap-g .q>.radios .tog:hover{background:#dfe8f5;color:#14284b}
  body.psy-views:not(.psg) #view #capCard .cap-g .q>.radios .tog.on{background:#1e6cdb;color:#fff;box-shadow:0 2px 6px rgba(30,108,219,.35)}
  body.psy-views:not(.psg) #view #capCard .cap-g .q>input.input{grid-column:1/-1;height:38px;min-height:38px!important;margin-left:36px;border:0;border-radius:10px;background:#f5f7fb;padding:0 14px;font-size:13.5px}
  body.psy-views:not(.psg) #view #capCard .cap-g .q>input.input::placeholder{color:#98a2b3}
  body.psy-views:not(.psg) #view #capCard .cap-g .radios.cap-concl{display:flex;flex-direction:column;gap:10px;padding:16px 20px 6px;background:none;border-radius:0}
  body.psy-views:not(.psg) #view #capCard .cap-g .radios.cap-concl .tog{position:relative;display:flex;align-items:flex-start;gap:12px;width:100%;height:auto;min-height:56px;padding:14px 16px 14px 48px;border:1.5px solid #d5dfec;border-radius:14px;background:#fff;font-size:14.5px;font-weight:600;line-height:1.45;color:#1d2939;text-align:left;white-space:normal;box-shadow:none}
  body.psy-views:not(.psg) #view #capCard .cap-concl .tog::before{content:'';position:absolute;left:16px;top:17px;width:20px;height:20px;border-radius:50%;border:2px solid #b8c4d6;background:#fff;box-sizing:border-box}
  body.psy-views:not(.psg) #view #capCard .cap-concl .tog:hover{border-color:#9ec0f7;background:#f7faff}
  body.psy-views:not(.psg) #view #capCard .cap-concl .tog.on{border-color:#1e6cdb;background:#eef4ff;color:#14284b;box-shadow:0 0 0 3px #d6e5fb}
  body.psy-views:not(.psg) #view #capCard .cap-concl .tog.on::before{border:6px solid #1e6cdb}
  body.psy-views:not(.psg) #view #capCard .cap-concl .tog b{color:#175cd3;margin-right:2px}
  body.psy-views:not(.psg) #view #capCard .cap-g>.callout{margin:10px 20px 18px}
  body.psy-views:not(.psg) #view #capCard .pad>.row[style*="flex-end"]{position:sticky;bottom:0;z-index:5;margin:0 -4px;padding:12px 4px;background:linear-gradient(180deg,rgba(255,255,255,0),#fff 28%);gap:10px}
  @media(max-width:760px){body.psy-views:not(.psg) #view #capCard .cap-g .q{grid-template-columns:1fr}body.psy-views:not(.psg) #view #capCard .cap-g .q>.radios{justify-self:start}body.psy-views:not(.psg) #view #capCard .cap-g>.grid2{grid-template-columns:1fr}body.psy-views:not(.psg) #view #capCard .cap-g .q>input.input{margin-left:0}}

  /* section strip: one line that scrolls, ticks for steps you have moved on from, a progress line along the bottom */
  body.psy-views:not(.psg) .hrow11 .hnav{flex-wrap:nowrap!important;overflow-x:auto!important;overflow-y:hidden!important;scrollbar-width:none;scroll-snap-type:x proximity;position:relative!important;padding:10px 14px 12px!important;-webkit-mask-image:linear-gradient(90deg,transparent 0,#000 18px,#000 calc(100% - 18px),transparent 100%);mask-image:linear-gradient(90deg,transparent 0,#000 18px,#000 calc(100% - 18px),transparent 100%)}
  body.psy-views:not(.psg) .hrow11 .hnav::-webkit-scrollbar{display:none}
  body.psy-views:not(.psg) .hrow11 .hnav button{flex:0 0 auto!important;scroll-snap-align:center}
  body.psy-views:not(.psg) .hrow11 .hnav button .hn{position:relative;transition:background .25s ease,color .25s ease,transform .25s ease}
  body.psy-views:not(.psg) .hrow11 .hnav button.on .hn{background:#1e6cdb!important;color:#fff!important;transform:scale(1.06)}
  body.psy-views:not(.psg) .hrow11 .hnav button.seen{border-color:#bfe7d0!important;background:#f4fcf7!important}
  body.psy-views:not(.psg) .hrow11 .hnav button.seen .hn{background:#1f9d57!important;color:#1f9d57!important;font-size:0!important}
  body.psy-views:not(.psg) .hrow11 .hnav button.seen .hn::after{content:'';position:absolute;left:50%;top:48%;width:6px;height:11px;border:solid #fff;border-width:0 2.5px 2.5px 0;transform:translate(-50%,-55%) rotate(45deg)}
  body.psy-views:not(.psg) .hrow11 .hnav button.seen>span:not(.hn){color:#0e6b3d}
  body.psy-views:not(.psg) .hrow11 .hnav button.pop .hn{animation:hnPop .45s cubic-bezier(.3,1.6,.5,1)}
  @keyframes hnPop{0%{transform:scale(.5)}60%{transform:scale(1.25)}100%{transform:scale(1)}}
  body.psy-views:not(.psg) .hrow11 .hnav button:focus-visible{outline:2px solid #1e6cdb;outline-offset:2px}
  @media (prefers-reduced-motion:reduce){body.psy-views:not(.psg) .hrow11 .hnav button.pop .hn{animation:none}body.psy-views:not(.psg) .hrow11 .hnav button .hn{transition:none}}
  /* past admissions dropdown */
  .pdd-wrap{margin:0 0 14px}
  .pdd-l{display:flex;align-items:baseline;gap:10px;margin:0 2px 7px;font-size:13px;font-weight:700;color:#344054}
  .pdd-l span{font-weight:500;color:#667085;font-size:12.5px}
  .pdd{position:relative;max-width:560px}
  .pdd-b{width:100%;display:flex;align-items:center;justify-content:space-between;gap:14px;text-align:left;font:inherit;padding:12px 16px;border:1.5px solid #cfdcee;border-radius:14px;background:#fff;color:#14284b;cursor:pointer;box-shadow:0 1px 2px rgba(16,24,40,.05);transition:border-color .15s,box-shadow .15s,transform .15s}
  .pdd-b:hover{border-color:#9ec0f7;transform:translateY(-1px)}
  .pdd-b:focus-visible,.pdd-o:focus-visible{outline:2px solid #1e6cdb;outline-offset:2px}
  .pdd.open .pdd-b{border-color:#1e6cdb;box-shadow:0 0 0 3px #d6e5fb}
  .pdd-bt b,.pdd-ot b{display:block;font-size:15px;font-weight:800;letter-spacing:-.01em}
  .pdd-bt small,.pdd-ot small{display:block;margin-top:2px;font-size:12.5px;color:#667085;font-weight:500}
  .pdd-c{flex:0 0 18px;color:#667085;transition:transform .22s ease}
  .pdd.open .pdd-c{transform:rotate(180deg)}
  .pdd-m{position:absolute;left:0;right:0;top:calc(100% + 8px);z-index:40;padding:6px;border:1px solid #dbe6f5;border-radius:14px;background:#fff;box-shadow:0 18px 40px -12px rgba(16,40,90,.3);opacity:0;visibility:hidden;transform:translateY(-6px) scale(.98);transform-origin:top center;transition:opacity .16s ease,transform .18s ease,visibility 0s linear .18s}
  .pdd.open .pdd-m{opacity:1;visibility:visible;transform:none;transition-delay:0s}
  .pdd-o{width:100%;display:flex;align-items:center;justify-content:space-between;gap:12px;text-align:left;font:inherit;padding:10px 12px;border:0;border-radius:10px;background:transparent;color:#14284b;cursor:pointer;transition:background .12s}
  .pdd-o:hover,.pdd-o:focus{background:#eef4ff}
  .pdd-o.on{background:#eaf2fd}
  .pdd-tk{flex:0 0 16px;color:#1e6cdb;opacity:0;transform:scale(.5);transition:opacity .15s,transform .2s cubic-bezier(.3,1.6,.5,1)}
  .pdd-o.on .pdd-tk{opacity:1;transform:none}
  @media (prefers-reduced-motion:reduce){.pdd-m,.pdd-c,.pdd-b,.pdd-tk{transition:none}}
  /* admission workup, four numbered panels */
  .wk-grp{border:1px solid var(--line,#e4e7ec);border-radius:14px;background:#fff;margin:0 0 14px;overflow:hidden}
  .wk-gh{display:flex;align-items:center;gap:12px;padding:12px 16px;background:#f8fafc;border-bottom:1px solid var(--line,#e4e7ec)}
  .wk-gh i{font-style:normal;width:26px;height:26px;border-radius:50%;background:var(--blue,#1e6cdb);color:#fff;font-weight:800;font-size:13px;display:flex;align-items:center;justify-content:center;flex:0 0 26px}
  .wk-gh b{font-size:14.5px;font-weight:800}
  .wk-gh small{display:block;font-size:12px;color:var(--muted,#667085);font-weight:500}
  .wk-gb{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px 18px;padding:14px 16px}
  .wk-gb>*{min-width:0;margin:0!important}
  .wk-gb>.box,.wk-gb>.field,.wk-gb>div.field{border:0!important;background:transparent!important;padding:0!important;box-shadow:none!important}
  .wk-gb>[style*="grid-column"],.wk-gb>.wk-wide{grid-column:1/-1!important}
  @media(max-width:760px){.wk-gb{grid-template-columns:1fr}}
  #workupCard>.pad.grid2.wk-done{display:block!important;padding:14px 20px 18px!important}
  /* patient preferences and grievances */
  .pxp-head h3{margin:0;font-size:20px;font-weight:800;letter-spacing:-.01em}
  .pxp-head p{margin:4px 0 14px;font-size:13px;color:var(--muted,#667085)}
  .pxp .psy-tx-tabs{margin-bottom:14px}
  .pxp-n{display:inline-flex;align-items:center;justify-content:center;min-width:20px;height:20px;padding:0 6px;margin-left:8px;border-radius:99px;background:#fef3f2;color:#b42318;font-size:11.5px;font-weight:800}
  .psy-tx-tab[aria-selected="true"] .pxp-n{background:rgba(255,255,255,.25);color:#fff}
  .gsrc{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;padding:14px 20px 4px}
  @media(max-width:1100px){.gsrc{grid-template-columns:repeat(2,minmax(0,1fr))}}
  @media(max-width:600px){.gsrc{grid-template-columns:1fr}}
  .gsrc>*{text-align:left;font:inherit;display:flex;flex-direction:column;gap:6px;padding:14px;border:1px solid var(--line,#e4e7ec);border-radius:14px;background:#fff;color:inherit}
  .gsrc button{cursor:pointer;transition:transform .16s ease,box-shadow .16s ease,border-color .16s ease}
  .gsrc button:hover{transform:translateY(-3px);border-color:#9ec0f7;box-shadow:0 8px 18px rgba(23,92,211,.14)}
  .gsrc .gs-i{width:34px;height:34px;border-radius:10px;display:flex;align-items:center;justify-content:center;background:#eff8ff;color:#175cd3}
  .gsrc .gs-t{font-weight:800;font-size:14.5px}
  .gsrc .gs-s{font-size:12.5px;color:var(--muted,#667085);line-height:1.4}
  .gsrc .gs-go{font-size:12.5px;font-weight:700;color:#175cd3;margin-top:auto;padding-top:4px}
  .gsrc .gs-auto{border-style:dashed;background:#f8fafc;cursor:default}
  .gsrc .gs-auto .gs-i{background:#f2f4f7;color:#475467}
  .gtag{display:inline-flex;align-items:center;font-size:11.5px;font-weight:700;border-radius:99px;padding:2px 10px;border:1px solid transparent;white-space:nowrap}
  .gtag.s-family{background:#eff8ff;color:#175cd3;border-color:#b2ddff}
  .gtag.s-voice{background:#f4f3ff;color:#5925dc;border-color:#d9d6fe}
  .gtag.s-patient{background:#ecfdf3;color:#067647;border-color:#abefc6}
  .gtag.s-internal{background:#f2f4f7;color:#475467;border-color:#d0d5dd}
  .gtag.cat{background:#fff;color:#344054;border-color:#d0d5dd}
  .gl-row{display:flex;gap:12px;align-items:flex-start;justify-content:space-between;padding:12px 20px;border-top:1px solid var(--line,#eef0f3)}
  .gl-row .gl-tags{display:flex;gap:6px;flex-wrap:wrap;margin-top:6px}
  .gcat{display:flex;gap:8px;flex-wrap:wrap}
  .gcat button{border:1px solid #d0d5dd;background:#fff;border-radius:99px;padding:7px 14px;font:inherit;font-size:13px;font-weight:650;cursor:pointer;transition:all .15s}
  .gcat button:hover{border-color:#9ec0f7;background:#eef4fd}
  .gcat button.on{background:var(--blue,#1e6cdb);border-color:var(--blue,#1e6cdb);color:#fff}
  .gmic{display:flex;align-items:center;gap:12px;flex-wrap:wrap}
  .gmic .rec{background:#e5484d!important;border-color:#e5484d!important;color:#fff!important}
  `;
  document.head.appendChild(css);

  /* ---------- 1. Past admissions: a dropdown to choose one stay; only the chosen stay is shown ---------- */
  function ensureDemoPast(){
    /* the demo patient gets a second, older stay so the dropdown can be seen */
    if(S.pid!=='neel'||!Array.isArray(S.pastAdm)||S.pastAdm.length!==1)return;
    const b=JSON.parse(JSON.stringify(S.pastAdm[0]));
    b.n=2;b.dates='10 Jun to 2 Jul 2024';b.days=22;b.dx='Bipolar affective disorder, current episode hypomanic';b.cond='Settled, good insight';b.meds=['Lithium carbonate 300 mg · 1-0-1'];b.plan='Lithium maintenance; sleep routine; review in 4 weeks';
    S.pastAdm.push(b);
  }
  window.padmPick=function(i){S.padmSel=i;render();};
  window.padmToggle=function(ev){
    const dd=ev&&ev.currentTarget&&ev.currentTarget.closest('.pdd');if(!dd)return;
    const open=!dd.classList.contains('open');dd.classList.toggle('open',open);
    dd.querySelector('.pdd-b').setAttribute('aria-expanded',open?'true':'false');
    if(open){const sel=dd.querySelector('.pdd-o.on')||dd.querySelector('.pdd-o');if(sel)setTimeout(()=>sel.focus({preventScroll:true}),30);}
  };
  window.padmKey=function(ev){
    const dd=ev.currentTarget.closest('.pdd');if(!dd)return;
    const opts=[...dd.querySelectorAll('.pdd-o')],i=opts.indexOf(document.activeElement);
    if(ev.key==='Escape'){dd.classList.remove('open');dd.querySelector('.pdd-b').setAttribute('aria-expanded','false');dd.querySelector('.pdd-b').focus();}
    else if(ev.key==='ArrowDown'){ev.preventDefault();if(!dd.classList.contains('open')){padmToggle({currentTarget:dd.querySelector('.pdd-b')});}else(opts[Math.min(opts.length-1,i+1)]||opts[0]).focus();}
    else if(ev.key==='ArrowUp'){ev.preventDefault();(opts[Math.max(0,i-1)]||opts[0]).focus();}
  };
  document.addEventListener('click',e=>{document.querySelectorAll('.pdd.open').forEach(d=>{if(!d.contains(e.target)){d.classList.remove('open');const b=d.querySelector('.pdd-b');if(b)b.setAttribute('aria-expanded','false');}});});
  const __pa=pPast;
  pPast=function(){
    if(psy())ensureDemoPast();
    const h=__pa.apply(this,arguments);
    if(!psy()||typeof h!=='string'||!S.pastAdm||S.pastAdm.length<2)return h;
    const t=document.createElement('template');t.innerHTML=h;
    const cards=[...t.content.children].filter(e=>e.matches&&e.matches('section.card'));
    if(cards.length<2)return h;
    const sel=Math.min(Math.max(+S.padmSel||0,0),cards.length-1);
    const tick='<svg class="pdd-tk" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5 9-10"/></svg>';
    const info=a=>hesc(String(a.dates||''))+(a.days?' · '+a.days+' days':'');
    const a0=S.pastAdm[sel]||{};
    const opts=cards.map((c,i)=>{const a=S.pastAdm[i]||{};return '<button type="button" role="option" aria-selected="'+(i===sel)+'" class="pdd-o'+(i===sel?' on':'')+'" onclick="padmPick('+i+')"><span class="pdd-ot"><b>Past admission '+(i+1)+'</b><small>'+info(a)+(a.psy?' · '+hesc(a.psy):'')+'</small></span>'+tick+'</button>';}).join('');
    const dd=document.createElement('div');dd.className='pdd-wrap';
    dd.innerHTML='<div class="pdd-l">Choose a past admission <span>'+cards.length+' on record</span></div><div class="pdd" onkeydown="padmKey(event)"><button type="button" class="pdd-b" aria-haspopup="listbox" aria-expanded="false" onclick="padmToggle(event)"><span class="pdd-bt"><b>Past admission '+(sel+1)+'</b><small>'+info(a0)+(a0.psy?' · '+hesc(a0.psy):'')+'</small></span><svg class="pdd-c" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></button><div class="pdd-m" role="listbox" aria-label="Past admissions">'+opts+'</div></div>';
    cards.forEach((c,i)=>{if(i!==sel)c.remove();});
    cards[sel].parentNode.insertBefore(dd,cards[sel]);
    return t.innerHTML;
  };

  /* ---------- 2 and 3. Admission steps ---------- */
  const WKG=[
    ['Why the patient is here','Reason and risk',/^(Reason for admission|Risk of harm|Risk of suicide|Risk at admission)/],
    ['Examination and tests','Examination, injuries and investigations',/^(Physical examination|Physical injuries|Investigations sent)/],
    ['Allergies','Recorded once, shown in the header',/^Drug allergies/]
  ];
  const HV={form:'Fill form',aifill:'AI-filled form',ai:'AI summary'};
  const HHINT={form:'Type the history yourself, section by section.',aifill:'The scribe has filled the form. Check each line before you save.',ai:'A short summary of the history written from what is saved.',read:'What is saved so far. Switch above to change it.'};
  const __adm=pAdmission;
  pAdmission=function(){
    const h=__adm.apply(this,arguments);
    if(!admLook()||typeof h!=='string')return h;
    const sec=S.admSec||'hist';
    if(sec!=='workup'&&sec!=='hist')return h;
    const t=document.createElement('template');t.innerHTML=h;
    if(sec==='workup'){
      const pad=t.content.querySelector('#workupCard > .pad.grid2');
      if(pad&&!pad.classList.contains('wk-done')){
        const kids=[...pad.children],groups=WKG.map(()=>[]),chart=[];
        kids.forEach(k=>{
          const lbl=((k.querySelector('.lbl')||{}).textContent||'').trim();
          const gi=WKG.findIndex(g=>g[2].test(lbl));
          if(gi>=0)groups[gi].push(k);else chart.push(k);
        });
        pad.innerHTML='';pad.classList.add('wk-done');
        const grp=(n,title,sub,els,cls)=>{
          if(!els.length)return;
          const g=document.createElement('div');g.className='wk-grp';
          g.innerHTML='<div class="wk-gh"><i>'+n+'</i><div><b>'+hesc(title)+'</b><small>'+hesc(sub)+'</small></div></div><div class="wk-gb"></div>';
          const b=g.querySelector('.wk-gb');els.forEach(e=>{if(cls&&e.classList)e.classList.add(cls);b.appendChild(e);});
          pad.appendChild(g);
        };
        let n=1;
        WKG.forEach((g,i)=>{if(groups[i].length)grp(n++,g[0],g[1],groups[i]);});
        if(chart.length){
          const g=document.createElement('div');g.className='wk-grp';
          g.innerHTML='<div class="wk-gh"><i>'+(n++)+'</i><div><b>Treatment chart</b><small>Medicines added here go straight into the nursing medicine chart</small></div></div><div class="wk-gb"></div>';
          const b=g.querySelector('.wk-gb');chart.forEach(e=>{e.classList.add('wk-wide');b.appendChild(e);});
          pad.appendChild(g);
        }
      }
    }
    if(sec==='hist'){
      const seg=t.content.querySelector('.hist-seg');
      if(seg&&!t.content.querySelector('.hist-h')){
        const v=S.hview&&HV[S.hview]?S.hview:'read';
        const lab=document.createElement('div');lab.className='hist-h';
        lab.innerHTML='<b>'+(v==='read'?'Read only':HV[v])+'</b><span>'+hesc(HHINT[v])+'</span>';
        seg.parentNode.insertBefore(lab,seg);
      }
    }
    return t.innerHTML;
  };

  /* ---------- 3b. Detailed history, section 10 (Mental status examination): tap options, no dropdown ----------
     Anu: "remove the dropdown". The saved answers use the same store as the other sections, so the summary and PDF read them as before. */
  const MSEL=[];
  const mseStore=()=>{const x=psyPx(S.pid);return x.hf=x.hf||{};};
  const mseIdx=l=>{let i=MSEL.indexOf(l);if(i<0){MSEL.push(l);i=MSEL.length-1;}return i;};
  const mseDraft=l=>(S.historyDraft&&typeof HDRAFT!=='undefined')?HDRAFT[l]:null;
  const __fldM=fld;
  fld=function(f,ro){
    const [l,ty,op]=f;
    if(!admLook()||S.hsec!=='mse'||(ty!=='o'&&ty!=='m'&&ty!=='ap'))return __fldM.apply(this,arguments);
    const i=mseIdx(l),st=mseStore(),dis=ro?'disabled':'';
    let cur;
    if(ty==='o'){const v=st[l]!==undefined?st[l]:{sel:mseDraft(l)||''};cur=[v&&v.sel!=='__other'?v.sel:(v&&v.free)||''];}
    else{const v=st[l]!==undefined?st[l]:mseDraft(l);cur=Array.isArray(v)?v:(v?String(v).split(/,\s*/):[]);}
    return `<div class="hf" data-mse="${i}"><span class="lbl">${hesc(l)}${ty!=='o'?' <span class="tiny" style="text-transform:none;letter-spacing:0">(add all that apply)</span>':''}</span><div class="mini-chips">${op.map((o,k)=>`<button type="button" class="tog ${cur.includes(o)?'on':''}" ${dis} onclick="psyMse(${i},${k},'${ty==='o'?'o':'m'}',this)">${hesc(o)}</button>`).join('')}</div></div>`;
  };
  window.psyMse=function(i,k,ty,btn){
    const l=MSEL[i],st=mseStore(),box=btn.closest('.hf');if(!l||!box)return;
    const opts=[...box.querySelectorAll('.tog')];
    if(ty==='o'){
      const was=btn.classList.contains('on');opts.forEach(b=>b.classList.remove('on'));
      if(!was)btn.classList.add('on');
      st[l]={sel:was?'':btn.textContent.trim(),free:''};
    }else{
      btn.classList.toggle('on');
      st[l]=opts.filter(b=>b.classList.contains('on')).map(b=>b.textContent.trim());
    }
  };

  /* ---------- 4. Patient Preferences and Grievances ---------- */
  const SRC={
    family:['Family call','s-family'],
    voice:['Voice note','s-voice'],
    patient:['From the patient','s-patient'],
    internal:['Internal · automatic','s-internal']
  };
  const CATS=['Psychiatrist','Psychologist','General admin'];
  const srcOf=g=>g.src||(g.auto?'internal':g.from==='Patient'?'patient':'family');
  const catOf=g=>g.cat||(/psychiatrist/i.test(g.own||'')?'Psychiatrist':/psycholog/i.test(g.own||'')?'Psychologist':'General admin');
  function ensureAuto(){
    /* the demo patient has one internal grievance made by the system from a floor round */
    if(S.pid!=='neel'||!Array.isArray(S.pgriev)||S.pgriev.some(g=>srcOf(g)==='internal'))return;
    S.pgriev.push({from:'Floor round',t:'Auto: bathroom tap in Room 213 was leaking at the 11 Nov floor round',via:'Room and facilities',own:'Housekeeping supervisor',st:'Open',sla:'3 h left',by:'System (floor round)',at:'11 Nov, 9:10 am',src:'internal',auto:true,cat:'General admin'});
  }
  const ICO={
    phone:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg>',
    mic:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>',
    user:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>',
    auto:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/><circle cx="12" cy="12" r="3"/></svg>'
  };
  window.pxTab=function(v){S.pxTab=v==='prefs'?'prefs':'griev';render();};
  function grievHtml(){
    ensureAuto();
    const L=Array.isArray(S.pgriev)?S.pgriev:[];
    const nInt=L.filter(g=>srcOf(g)==='internal').length;
    const rows=L.map(g=>{
      const s=srcOf(g),sm=SRC[s]||SRC.family,open=g.st==='Open';
      return `<div class="gl-row"><div class="grow"><div style="font-weight:600">${hesc(g.from)}: ${hesc(g.t)}</div><div class="tiny muted">${hesc(g.via||'')} · assigned to ${hesc(g.own||'')}</div>${byl(g.by,g.at,s==='internal'?'Made by':'Logged by')}${g.doneBy?byl(g.doneBy,g.doneAt,'Resolved by'):''}<div class="gl-tags"><span class="gtag ${sm[1]}">${sm[0]}</span><span class="gtag cat">${hesc(catOf(g))}</span></div></div>${open?chip(g.sla||'Open','c-amber'):chip(g.st,'c-green')}</div>`;
    }).join('');
    return `<section class="card"><div class="hd"><div><h3>Grievances · ${hesc((ptFind(S.pid)||{}).name||'Neel Bose')}</h3><div class="small muted" style="margin-top:4px">Complaints from the patient or family, or about services. They go to the patient experience team with a 6-hour clock, and the treating psychiatrist and psychologist get an alert and a task on their Inpatient dashboard.</div></div></div>
      <div class="lbl" style="padding:2px 20px 0">How did it come in?</div>
      <div class="gsrc">
        <button type="button" onclick="pgModal2('family')"><span class="gs-i">${ICO.phone}</span><span class="gs-t">Family call</span><span class="gs-s">The family told you on a call. Log it while you talk.</span><span class="gs-go">Log from a call ›</span></button>
        <button type="button" onclick="pgModal2('voice')"><span class="gs-i">${ICO.mic}</span><span class="gs-t">Quick voice note</span><span class="gs-s">Speak it and it is typed for you. Tag who it is for.</span><span class="gs-go">Speak it ›</span></button>
        <button type="button" onclick="pgModal2('patient')"><span class="gs-i">${ICO.user}</span><span class="gs-t">From the patient</span><span class="gs-s">The patient's own grievance, in their words.</span><span class="gs-go">Log it ›</span></button>
        <div class="gs-auto"><span class="gs-i">${ICO.auto}</span><span class="gs-t">Internal · automatic</span><span class="gs-s">Made by the system from floor rounds and missed updates. Nobody logs these by hand.</span><span class="gs-go" style="color:#475467">${nInt} so far</span></div>
      </div>
      <div class="lbl" style="padding:12px 20px 6px">All grievances · ${L.length}</div>
      ${rows||'<div class="pad small muted">No grievance logged for this patient.</div>'}</section>`;
  }
  const __prefs=pPrefs;
  pPrefs=function(){
    const h=__prefs.apply(this,arguments);
    if(!psy()||typeof h!=='string')return h;
    ensureAuto();
    const tab=S.pxTab==='griev'?'griev':'prefs';
    const t=document.createElement('template');t.innerHTML=h;
    const root=t.content;
    /* the old page carried the grievances under the preferences: take them out, they have their own tab now */
    [...root.querySelectorAll('.lbl')].forEach(x=>{if(x.textContent.trim()==='Grievances')x.remove();});
    [...root.querySelectorAll('section.card')].forEach(s=>{if(/^Grievances/.test(((s.querySelector('h3')||{}).textContent||'').trim()))s.remove();});
    [...root.querySelectorAll('button')].forEach(b=>{if(b.textContent.trim()==='Log grievance')b.remove();});
    const open=(S.pgriev||[]).filter(g=>g.st==='Open').length;
    const tabs=`<div class="psy-tx-tabs" role="tablist" aria-label="Patient preferences and grievances"><button type="button" class="psy-tx-tab" role="tab" aria-selected="${tab==='prefs'}" onclick="pxTab('prefs')">Patient preferences</button><button type="button" class="psy-tx-tab" role="tab" aria-selected="${tab==='griev'}" onclick="pxTab('griev')">Grievances${open?`<span class="pxp-n">${open}</span>`:''}</button></div>`;
    const body=tab==='griev'?grievHtml():[...root.children].map(e=>e.outerHTML).join('');
    return `<div class="pxp"><div class="pxp-head"><h3>Patient Preferences and Grievances</h3><p>Preferences are what the clinical team tells admin, nursing, the kitchen and the front desk. Grievances are complaints from the patient or family.</p></div>${tabs}${body}</div>`;
  };

  /* ---------- the log window: one form for the three ways a person logs a grievance ---------- */
  const ABOUT=['Food and diet','Room and facilities','Communication and updates','Staff behaviour','Billing','Family conduct on visits','Treatment or medicines'];
  let gCat='General admin',gRec=null;
  window.pgCat=function(c){gCat=c;document.querySelectorAll('#gcatRow button').forEach(b=>b.classList.toggle('on',b.textContent.trim()===c));};
  window.pgVoice=function(){
    const Rec=window.SpeechRecognition||window.webkitSpeechRecognition,btn=$('gMic'),msg=$('gMicMsg'),ta=$('gt');
    if(gRec){try{gRec.stop();}catch(e){}return;}
    if(!Rec){if(msg)msg.textContent='Voice typing is not available in this browser. Type it instead, or use Chrome.';return;}
    const r=new Rec();gRec=r;r.lang='en-IN';r.interimResults=true;r.continuous=true;
    const base=ta.value?ta.value.trim()+' ':'';
    r.onresult=e=>{let s='';for(let i=0;i<e.results.length;i++)s+=e.results[i][0].transcript;ta.value=(base+s).trim();};
    r.onerror=e=>{if(msg)msg.textContent=e.error==='not-allowed'?'Allow the microphone to use voice typing.':'Voice typing stopped ('+e.error+'). You can type the rest.';};
    r.onend=()=>{gRec=null;if(btn){btn.classList.remove('rec');btn.lastChild.textContent=' Speak';}};
    try{r.start();if(btn){btn.classList.add('rec');btn.lastChild.textContent=' Stop';}if(msg)msg.textContent='Listening… speak now.';}catch(e){gRec=null;}
  };
  window.pgModal2=function(src){
    gCat='General admin';gRec=null;
    const T={family:['Log a family call grievance','Raised by','Logged while you were on a call with the family.'],voice:['Quick voice note','Raised by','Speak it, check the words, tag who it is for.'],patient:['Patient’s own grievance','Raised by','What the patient said, in their words.']}[src];
    const raised=src==='patient'?'<input class="input" id="gf" value="Patient" readonly>':`<select class="input" id="gf">${(S.contacts||[['Ananya Bose','Sister'],['Rakesh Bose','Father']]).map(c=>`<option>${hesc(c[0])} (${hesc(String(c[1]).split(' · ')[0])})</option>`).join('')}<option>Family member (other)</option></select>`;
    openModal(`<div class="mh"><h3>${T[0]}</h3><button class="x" aria-label="Close" onclick="closeModal()">×</button></div>
     <div class="mb"><div class="small muted" style="margin-bottom:10px">${T[2]}</div>
      <div class="grid2"><label class="field"><span class="lbl">${T[1]}</span>${raised}</label>
      <label class="field"><span class="lbl">About</span><select class="input" id="ga">${ABOUT.map(a=>`<option>${a}</option>`).join('')}</select></label></div>
      ${src==='voice'?`<div class="gmic" style="margin:6px 0 8px"><button type="button" class="btn pri" id="gMic" onclick="pgVoice()">${ICO.mic.replace('width="18" height="18"','width="16" height="16"')}<span> Speak</span></button><span class="small muted" id="gMicMsg">Press Speak and talk. Press again to stop.</span></div>`:''}
      <label class="field"><span class="lbl">${src==='voice'?'What was said':'What happened'}</span><textarea class="input" id="gt" rows="4" placeholder="${src==='voice'?'The words appear here. You can fix them before saving.':'In their words'}"></textarea></label>
      <div class="field" style="margin-top:10px"><span class="lbl">Category tag · who should see it first</span><div class="gcat" id="gcatRow">${CATS.map(c=>`<button type="button" class="${c===gCat?'on':''}" onclick="pgCat('${c}')">${c}</button>`).join('')}</div></div>
      <div id="gErr" class="small" style="color:var(--red);display:none;margin-top:8px">Say what happened first</div></div>
     <div class="mf"><button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="pgSave2('${src}')">Log</button></div>`);
  };
  window.pgSave2=function(src){
    const ta=$('gt');if(gRec){try{gRec.stop();}catch(e){}}
    if(!ta||!ta.value.trim()){$('gErr').style.display='block';return;}
    const own=gCat==='Psychiatrist'?'Treating psychiatrist and patient experience team':gCat==='Psychologist'?'Treating psychologist and patient experience team':'Patient experience team';
    S.pgriev.unshift({from:src==='patient'?'Patient':String($('gf').value).replace(/\s*\(.*\)$/,''),t:ta.value.trim().slice(0,90),via:$('ga').value,own,st:'Open',sla:'6 h left',src,cat:gCat,...whoAt()});
    S.pxTab='griev';closeModal();render();toast('Logged as '+SRC[src][0].toLowerCase()+' · tagged '+gCat+'; patient experience team alerted');
  };

  /* ---------- 5. Capacity assessment: structure for the new look (same questions, same answers, same saved data) ---------- */
  const __capF=capForm;
  capForm=function(){
    const h=__capF.apply(this,arguments);
    if(!admLook()||typeof h!=='string')return h;
    const t=document.createElement('template');t.innerHTML=h;
    const groups=[...t.content.querySelectorAll('.cap-g')];
    if(!groups.length)return h;
    groups.forEach((g,gi)=>{
      const cs=g.querySelector(':scope > .capsec');
      if(cs){
        let num='',title='',cls='';
        const st=(cs.querySelector('strong')||{}).textContent||'';const m=st.match(/^(\d)\s*·\s*(.+)$/);
        if(m){num=m[1];title=m[2];}else{title=st;num='!';cls='warn';}
        const hint=((cs.querySelector('.tiny')||{}).textContent||'').trim();
        const hd=document.createElement('div');hd.className='cg-h';
        hd.innerHTML='<i class="cg-n '+cls+'">'+num+'</i><div class="cg-t"><b>'+hesc(title)+'</b>'+(hint?'<small>'+hesc(hint)+'</small>':'')+'</div>';
        cs.replaceWith(hd);
      }else if(gi===0){
        const hd=document.createElement('div');hd.className='cg-h';
        hd.innerHTML='<i class="cg-n plain">i</i><div class="cg-t"><b>Assessment details</b><small>Who is assessed, where, and who speaks for them</small></div>';
        g.prepend(hd);
      }
      g.querySelectorAll('.q').forEach(q=>{
        const sm=q.querySelector(':scope > .small');
        if(sm){const txt=sm.textContent.trim(),m=txt.match(/^([A-D])\.\s+([\s\S]+)$/);sm.removeAttribute('style');sm.innerHTML=m?'<span class="cq-l">'+m[1]+'</span><span>'+hesc(m[2])+'</span>':'<span>'+hesc(txt)+'</span>';}
        const inp=q.querySelector(':scope > input.input');if(inp&&inp.getAttribute('placeholder')==='Explanation')inp.setAttribute('placeholder','Add a note (optional)');
      });
      g.querySelectorAll('.cap-concl .tog').forEach(b=>{const m=b.textContent.trim().match(/^(4[AB])\s*·\s*([\s\S]+)$/);if(m)b.innerHTML='<span><b>'+m[1]+'</b> '+hesc(m[2])+'</span>';});
    });
    const out=t.content.firstElementChild;
    if(S.capView==='form'&&out&&!out.querySelector('.cap-prog')){
      const pr=document.createElement('div');pr.className='cap-prog';pr.innerHTML='<b class="cap-prog-t">0 of 0 answered</b><div class="bar"><i></i></div>';
      out.prepend(pr);
    }
    return t.innerHTML;
  };
  const capProg=()=>{
    const card=document.getElementById('capCard');if(!card)return;
    const qs=[...card.querySelectorAll('.cap-g .q')],cn=card.querySelector('.cap-concl');
    const total=qs.length+(cn?1:0),done=qs.filter(q=>q.querySelector('.tog.on')).length+(cn&&cn.querySelector('.tog.on')?1:0);
    const t=card.querySelector('.cap-prog-t'),b=card.querySelector('.cap-prog .bar i');
    if(t)t.textContent=done+' of '+total+' answered';
    if(b)b.style.width=(total?Math.round(done/total*100):0)+'%';
  };
  document.addEventListener('click',e=>{if(admLook()&&e.target.closest&&e.target.closest('#capCard .tog'))setTimeout(capProg,0);});
  const __rCap=render;
  render=function(){const r=__rCap.apply(this,arguments);if(admLook())capProg();return r;};

  /* ---------- 6. Section strip: one line, a tick once you have moved on from a step, current step scrolled into view ---------- */
  const seenStore=()=>{const x=psyPx(S.pid);return x.hseen=x.hseen||{};};
  let lastSec=null,lastPid=null;
  function stripPaint(){
    const nav=document.querySelector('#view .hrow11 .hnav');if(!nav)return;
    const cur=S.hsec||'id',btns=[...nav.querySelectorAll('button')];
    const keys=btns.map(b=>((b.getAttribute('onclick')||'').match(/hsec='(\w+)'/)||[])[1]);
    const ci=keys.indexOf(cur);
    if(lastPid!==S.pid){lastPid=S.pid;lastSec=null;}
    const seen=seenStore();
    const left=(lastSec&&lastSec!==cur)?lastSec:null;
    if(left)seen[left]=true;
    lastSec=cur;
    btns.forEach((b,i)=>{
      const k=keys[i],done=!!seen[k]&&k!==cur;
      b.classList.toggle('seen',done);
      if(done&&k===left)b.classList.add('pop');
      if(!b.dataset.hnLabel){const sp=b.querySelector('.hn');if(sp)b.dataset.hnLabel=sp.textContent.trim();}
      b.setAttribute('aria-label',(b.dataset.hnLabel||'')+' '+((b.querySelectorAll('span')[1]||{}).textContent||'')+(done?', done':k===cur?', current step':''));
      if(k===cur)b.setAttribute('aria-current','step');
    });
    const on=btns[ci];
    if(on){const target=on.offsetLeft-(nav.clientWidth-on.offsetWidth)/2;try{nav.scrollTo({left:Math.max(0,target),behavior:'smooth'});}catch(e){nav.scrollLeft=Math.max(0,target);}}
  }
  const __rStrip=render;
  render=function(){const r=__rStrip.apply(this,arguments);if(admLook()){try{stripPaint();}catch(e){}}return r;};

  /* ---------- 7. Family call card: pressing "Call via HMS" no longer removes the card. It goes away only when the outcome is saved. ---------- */
  window.psyCallDone=function(pid,key){
    toast('Calling through CallerDesk… connected. Call logged: 4 min, recording saved.');
    setTimeout(()=>openModal(`<div class="mh"><h3>How did the call go?</h3><button class="x" aria-label="Close" onclick="closeModal()">×</button></div>
      <div class="mb"><div class="callout grey">Logged automatically: today, 4 min 12 s, recording saved. Pick the outcome; that's all.</div>
      <label class="field"><span class="lbl">Outcome</span><select class="input" id="callOutcome"><option>Spoke to family, update given</option><option>No answer, retry later</option><option>Family has a concern, raise grievance</option></select></label>
      <label class="field"><span class="lbl">Note (optional)</span><input class="input" placeholder="Anything the team should know"></label>
      <div class="tiny muted">The call stays on the page until you save the outcome. If nobody answered, choose "No answer, retry later" and it stays.</div></div>
      <div class="mf"><button class="btn" onclick="closeModal()">Not now</button><button class="btn pri" onclick="psyCallSave('${pid}','${key}')">Save</button></div>`),900);
  };
  window.psyCallSave=function(pid,key){
    const o=(($('callOutcome')||{}).value||'');
    if(!/^No answer/.test(o))ptRun(pid,()=>{S.calls=S.calls||{};S.calls[key]='done';return '';});
    closeModal();render();toast(/^No answer/.test(o)?'Saved. The call stays on the page for a retry':'Call marked done');
  };

  /* ---------- 8. Actions open the patient they belong to (by patient id, never by list position) ---------- */
  /* Daily notes: open the all-patients page on THIS patient. The page walks the patients still to write, so the index is taken from that list. */
  window.openNotesFor=function(pid){
    try{
      S.eod=S.eod||{};
      /* a patient who is not one of the five on the page yet (Rohit, Dev, Tarun ...) is added to it, so the page opens on them */
      const psychologist=typeof isPsych==='function'&&isPsych();
      if(psychologist&&typeof PSY_EOD==='function'&&!PSY_EOD().some(p=>p.id===pid)&&PTS.some(p=>p.id===pid)){S.eodExtra=(S.eodExtra||[]).concat([pid]);}
      if(!S.eod[pid]&&PTS.some(p=>p.id===pid))S.eod[pid]={};
      /* the page lists the same patients in the same order: all patients for the psychiatrist, the first five (plus any added) for the psychologist */
      const L=psychologist?PSY_EOD():PTS;
      let pend=L.filter(p=>!(S.eod[p.id]||{}).saved),i=pend.findIndex(p=>p.id===pid);
      if(i<0&&L.some(p=>p.id===pid)){
        /* this patient's note was already saved: open it again for editing */
        if(typeof psyEodEdit==='function'){S.eod[pid]=S.eod[pid]||{};psyEodEdit(pid);go('#/notes');return;}
        S.eod[pid]=S.eod[pid]||{};S.eod[pid].saved=false;pend=L.filter(p=>!(S.eod[p.id]||{}).saved);i=pend.findIndex(p=>p.id===pid);
      }
      S.eodI=Math.max(0,i);
    }catch(e){}
    go('#/notes');
  };
  /* Task rows were written with Neel's page in the link even when the task is about another patient (Sameer Das, Dev Kumar ...).
     The link now uses the patient named in the task. Psychiatrist, psychologist and floor lead only. */
  const __tasksFix=tasks;
  tasks=function(){
    const r=__tasksFix.apply(this,arguments);
    if(!['psychiatrist','psychologist','lead'].includes(S.role)||!Array.isArray(r))return r;
    r.forEach(t=>{
      if(!t||typeof t.go!=='string'||t.go.indexOf('#/patient/neel/')!==0)return;
      const title=String(t.title||'').replace(/<[^>]+>/g,'');
      const p=(typeof PTS!=='undefined'?PTS:[]).find(x=>x.id!=='neel'&&title.indexOf(x.name)>=0);
      if(p){t.go=t.go.replace('#/patient/neel/','#/patient/'+p.id+'/');if(/\/forms$/.test(t.go))t.go=t.go.replace(/\/forms$/,'/admission');}
    });
    return r;
  };
  /* A patient id in the address that does not exist shows "not found" (it used to open some other patient) */
  const __vpNF=vPatient;
  vPatient=function(sub){
    const r=(location.hash||'').slice(2).split('/'),raw=r[0]==='patient'&&r[1]?r[1]:'';
    let id='';try{id=decodeURIComponent(raw);}catch(e){id=raw;}
    if(id&&!(typeof ptFind==='function'&&ptFind(id))){
      return `<section class="card pad" style="max-width:560px;display:flex;flex-direction:column;gap:12px"><h3>Patient not found</h3><div class="muted">There is no patient with the id <b>${hesc(id)}</b>. The link may be old or mistyped.</div><div class="row" style="gap:8px"><button class="btn pri" onclick="go('#/inpatients')">Back to patients</button><button class="btn" onclick="go('#/myday')">Today</button></div></section>`;
    }
    return __vpNF.apply(this,arguments);
  };

  /* From inside a patient's record, the page links Daily notes, Nursing chart and Rounds open on THAT patient (they opened the first patient) */
  const __goP=go;
  let inNav=false;
  go=function(h){
    if(!inNav&&typeof h==='string'&&['psychiatrist','psychologist'].includes(S.role)){
      const m=(location.hash||'').match(/^#\/patient\/([^\/?]+)/);
      let id='';if(m){try{id=decodeURIComponent(m[1]);}catch(e){id=m[1];}}
      if(id&&typeof ptFind==='function'&&ptFind(id)){
        inNav=true;
        try{
          if(h==='#/notes'){openNotesFor(id);return;}
          if(h==='#/nursing'&&S.role==='psychiatrist'){S.ncP=id;return __goP.call(this,'#/nursing/'+id);}
          if(h==='#/rounds'&&S.rounds&&typeof WARDS!=='undefined'){
            for(const wd of Object.keys(WARDS)){const k=WARDS[wd].findIndex(p=>p.id===id);if(k>=0){S.rounds.ward=wd;S.rounds.idx[wd]=k;S.focusPid=id;break;}}
          }
        }finally{inNav=false;}
      }
    }
    return __goP.apply(this,arguments);
  };
})();
