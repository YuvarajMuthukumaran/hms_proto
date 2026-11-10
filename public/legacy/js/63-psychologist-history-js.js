/* Psychologist only (10 Nov 2026): Detailed history, full screen.
   - the section rail stays slim (numbers only); when the mouse or the keyboard focus is on it, it opens smoothly to show the section names
     (replaces the small dark tooltip) and closes again when you leave
   - more white space: wider gaps, two columns of questions, bigger inputs, calmer labels and headings
   Gated by body.psg (the psychologist's login). */
(function(){
  const css=document.createElement('style');css.id='psychologist-history-css';
  css.textContent=`
  body.psg .adm-full .hwrap{grid-template-columns:76px minmax(0,1fr)!important;column-gap:36px;align-items:start}
  /* the rail */
  body.psg .adm-full .hnav{position:sticky;top:12px;z-index:30;justify-self:start;display:flex;flex-direction:column;gap:6px;width:64px;min-width:64px;padding:10px 8px;background:#fff;border:1px solid var(--line);border-radius:20px;overflow:hidden;box-shadow:0 1px 2px rgba(16,24,40,.04);transition:width .42s cubic-bezier(.22,1,.36,1),box-shadow .35s ease,border-color .35s ease}
  body.psg .adm-full .hnav:hover,body.psg .adm-full .hnav:focus-within{width:280px;border-color:#cfdffb;box-shadow:0 20px 44px rgba(16,24,40,.16)}
  body.psg .adm-full .hnav button{width:100%;display:flex;align-items:center;justify-content:flex-start;gap:14px;padding:8px 10px;border-radius:14px;white-space:nowrap;text-align:left}
  body.psg .adm-full .hnav button:hover:after{content:none!important;display:none!important}
  body.psg .adm-full .hnav .hn{flex:none}
  body.psg .adm-full .hnav button>span:not(.hn){display:block!important;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;font-size:14.5px;font-weight:600;opacity:0;transform:translateX(-8px);transition:opacity .22s ease,transform .32s cubic-bezier(.22,1,.36,1)}
  body.psg .adm-full .hnav:hover button>span:not(.hn),body.psg .adm-full .hnav:focus-within button>span:not(.hn){opacity:1;transform:none;transition-delay:.08s}
  body.psg .adm-full .hnav:hover button:nth-child(2)>span:not(.hn){transition-delay:.11s}
  body.psg .adm-full .hnav:hover button:nth-child(3)>span:not(.hn){transition-delay:.14s}
  body.psg .adm-full .hnav:hover button:nth-child(4)>span:not(.hn){transition-delay:.17s}
  body.psg .adm-full .hnav:hover button:nth-child(5)>span:not(.hn){transition-delay:.2s}
  body.psg .adm-full .hnav:hover button:nth-child(n+6)>span:not(.hn){transition-delay:.23s}
  /* the form */
  body.psg .hwrap .hbody{padding:8px 12px 56px 0;gap:36px}
  body.psg .hwrap .hbody h3{font-size:22px;font-weight:800;margin:0 0 4px;letter-spacing:-.01em}
  body.psg .hwrap .hgrid,body.psg .hwrap .hgrid:has(.hf-sel){display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:32px 48px!important;margin-top:16px}
  body.psg .hwrap .hgrid .hf.wide,body.psg .hwrap .hgrid .hf-sel.wide{grid-column:1/-1}
  body.psg .hwrap .hgrid .hf>.lbl,body.psg .hwrap .hgrid .hf .lbl{display:block;margin-bottom:10px;font-size:14px;font-weight:600;color:#344054}
  body.psg .hwrap .hgrid .input,body.psg .hwrap .hgrid select.input{width:100%;min-height:50px;padding:12px 16px;border-radius:14px;font-size:15px}
  body.psg .hwrap .hgrid textarea.input{min-height:110px;line-height:1.55}
  body.psg .hwrap .hf-sel select.input{min-width:0;width:100%}
  body.psg .hwrap .hf-sel .hf-row{gap:12px}
  /* ---- the form panel: one calm white sheet, a progress hairline, quiet labels, a footer for Previous / Next ---- */
  body.psg .hwrap .hbody{display:flex;flex-direction:column;gap:0;padding:0;background:#fff;border:1px solid var(--line);border-radius:22px;box-shadow:0 1px 2px rgba(16,24,40,.04),0 12px 32px rgba(16,24,40,.04);overflow:hidden}
  body.psg .hwrap .hbody>.row:first-child{align-items:flex-start;padding:32px 44px 0}
  body.psg .hwrap .hbody>.row:first-child h3{font-size:26px;font-weight:700;letter-spacing:-.015em;color:#101828;margin:0}
  body.psg .hwrap .hbody>.row:first-child .chip{background:#f2f4f7;color:#475467;border:0;font-weight:600;font-size:12.5px;padding:4px 12px}
  .pg-hsub{padding:6px 44px 0;font-size:14px;color:#667085}
  .pg-hbar{height:3px;margin:22px 44px 0;background:#eaeff8;border-radius:99px;overflow:hidden}
  .pg-hbar i{display:block;height:100%;background:linear-gradient(90deg,#2f7df0,#175cd3);border-radius:99px;transition:width .6s cubic-bezier(.22,1,.36,1)}
  body.psg .hwrap .hgrid,body.psg .hwrap .hgrid:has(.hf-sel){margin:0;padding:36px 44px 40px;gap:30px 56px!important}
  body.psg .hwrap .hgrid .hf>.lbl,body.psg .hwrap .hgrid .hf .lbl{margin-bottom:8px;font-size:13.5px;font-weight:600;color:#475467;letter-spacing:0}
  body.psg .hwrap .hgrid .input,body.psg .hwrap .hgrid select.input{min-height:48px;padding:11px 16px;border:1px solid #d0d5dd;border-radius:12px;background-color:#fff;font-size:15px;color:#101828;box-shadow:0 1px 2px rgba(16,24,40,.04);transition:border-color .18s ease,box-shadow .18s ease,background-color .18s ease}
  body.psg .hwrap .hgrid select.input{appearance:none;-webkit-appearance:none;padding-right:44px;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23667085' stroke-width='2.4' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 16px center;cursor:pointer}
  body.psg .hwrap .hgrid .input:hover{border-color:#98a2b3}
  body.psg .hwrap .hgrid .input:focus{outline:none;border-color:#175cd3;box-shadow:0 0 0 4px rgba(23,92,211,.14)}
  body.psg .hwrap .hgrid .input::placeholder{color:#98a2b3}
  body.psg .hwrap .hbody>.row:last-child{margin:0!important;padding:18px 44px;border-top:1px solid var(--line);background:#fafbfd}
  body.psg .hwrap .hbody>.row:last-child .btn{height:44px;padding:0 22px;border-radius:12px;font-size:14.5px;font-weight:600}
  body.psg .hwrap .hbody>.row:last-child .btn:first-child{background:#fff;border:1px solid #d0d5dd;color:#344054}
  body.psg .hwrap .hbody>.row:last-child .btn:first-child:disabled{opacity:.45}
  body.psg .hwrap .hbody>.row:last-child .btn:last-child{background:#175cd3;border-color:#175cd3;color:#fff;box-shadow:0 1px 2px rgba(16,24,40,.12),0 6px 14px rgba(23,92,211,.22)}
  body.psg .hwrap .hbody>.row:last-child .btn:last-child:hover{background:#1a53b8}
  @media (max-width:900px){body.psg .hwrap .hbody>.row:first-child,.pg-hsub{padding-left:24px;padding-right:24px}.pg-hbar{margin:18px 24px 0}body.psg .hwrap .hgrid,body.psg .hwrap .hgrid:has(.hf-sel){padding:28px 24px 32px}body.psg .hwrap .hbody>.row:last-child{padding:16px 24px}}
  @media (max-width:900px){
    body.psg .hwrap .hgrid,body.psg .hwrap .hgrid:has(.hf-sel){grid-template-columns:1fr!important;gap:24px!important}
    body.psg .adm-full .hwrap{grid-template-columns:64px minmax(0,1fr)!important;column-gap:20px}
  }
  @media (prefers-reduced-motion:reduce){
    body.psg .adm-full .hnav,body.psg .adm-full .hnav button>span:not(.hn){transition:none}
  }
  `;
  document.head.appendChild(css);

  /* "Section 3 of 11" and a progress hairline under the title */
  const me=()=>S.role==='psychologist';
  const head=v=>{
    const hb=v.querySelector('.hwrap .hbody');if(!hb||hb.querySelector('.pg-hbar'))return;
    const first=hb.firstElementChild,btns=[...v.querySelectorAll('.hwrap .hnav button')];
    if(!first||!btns.length)return;
    const i=Math.max(0,btns.findIndex(b=>b.classList.contains('on'))),n=btns.length;
    first.insertAdjacentHTML('afterend',`<div class="pg-hsub">Section ${i+1} of ${n}</div><div class="pg-hbar" role="progressbar" aria-valuemin="1" aria-valuemax="${n}" aria-valuenow="${i+1}"><i style="width:${Math.round((i+1)/n*100)}%"></i></div>`);
  };
  const __r=render;
  render=function(){const out=__r.apply(this,arguments);if(me()){try{const v=document.getElementById('view');if(v)head(v);}catch(e){}}return out;};
})();
