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
  body.psg .adm-full .hbody{padding:8px 12px 56px 0;gap:36px}
  body.psg .adm-full .hbody h3{font-size:22px;font-weight:800;margin:0 0 4px;letter-spacing:-.01em}
  body.psg .adm-full .hgrid,body.psg .adm-full .hgrid:has(.hf-sel){display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:32px 48px!important;margin-top:16px}
  body.psg .adm-full .hgrid .hf.wide,body.psg .adm-full .hgrid .hf-sel.wide{grid-column:1/-1}
  body.psg .adm-full .hgrid .hf>.lbl,body.psg .adm-full .hgrid .hf .lbl{display:block;margin-bottom:10px;font-size:14px;font-weight:600;color:#344054}
  body.psg .adm-full .hgrid .input,body.psg .adm-full .hgrid select.input{width:100%;min-height:50px;padding:12px 16px;border-radius:14px;font-size:15px}
  body.psg .adm-full .hgrid textarea.input{min-height:110px;line-height:1.55}
  body.psg .adm-full .hf-sel select.input{min-width:0;width:100%}
  body.psg .adm-full .hf-sel .hf-row{gap:12px}
  @media (max-width:900px){
    body.psg .adm-full .hgrid,body.psg .adm-full .hgrid:has(.hf-sel){grid-template-columns:1fr!important;gap:24px!important}
    body.psg .adm-full .hwrap{grid-template-columns:64px minmax(0,1fr)!important;column-gap:20px}
  }
  @media (prefers-reduced-motion:reduce){
    body.psg .adm-full .hnav,body.psg .adm-full .hnav button>span:not(.hn){transition:none}
  }
  `;
  document.head.appendChild(css);
})();
