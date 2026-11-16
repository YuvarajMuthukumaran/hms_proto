/* 16 Nov 2026, Dr. Anu: "font size is not great". A measured 62% of the text on the inpatient screens was 13.5 px or smaller (down to 10 px).
   One readable scale for every role and every screen (nothing here changes colours, spacing rules or which screens show what):
     body text 15 px, secondary text ("small") 15 px, grey helper text ("tiny") 14 px, field labels 13.5 px, buttons and chips 14 px,
     tags and pills never below 12.5 px, table headings 13.5 px, table cells 15 px, side menu 15.5 px.
   Headings keep their sizes. On phones the scale stays the same (text is never smaller than 14 px except tags at 12.5 px). */
(function(){
  if(document.getElementById('font-scale-css'))return;
  const c=document.createElement('style');c.id='font-scale-css';
  c.textContent=`
  body{font-size:15px}
  #view .small,#modal .small,.top .small{font-size:15px!important}
  #view .tiny,#modal .tiny,.top .tiny,#view .muted.tiny{font-size:14px!important}
  #view .lbl,#modal .lbl,#view .hf>.lbl{font-size:13.5px!important}
  #view .btn.sm,#modal .btn.sm,#view .lnk,#modal .lnk{font-size:14px!important}
  #view .tog,#modal .tog,#view .chip,#modal .chip,#view .subtab,#view .seg button{font-size:14px!important}
  #view .pd-tag,#view .tagnew,#view .hv-tag,#view .pr-tag,#view .pg-tag,#view .espill,#view .pd-ty,#view .fc9-k,#view .adm-s{font-size:12.5px!important}
  #view .byl,#view .sh-s,#view .sh-s2,#view .sh-c,#view .mh-ts,#view .mh-tl,#view .fc9-s,#view .pd-sub,#safeBar .sh-s,#safeBar .sh-s2,#safeBar .sh-c{font-size:14px!important}
  #view th,#modal th{font-size:13.5px!important}
  #view td,#modal td{font-size:15px}
  #view .psy-hist-empty,#view .dpv,#view .dng2,#view .viewbtn,#view .tpadd,#view .mnone{font-size:14px!important}
  #view input.input,#view select.input,#view textarea.input,#modal input.input,#modal select.input,#modal textarea.input{font-size:15px}
  #side .nav,#side .sgdd button,#side .sub{font-size:15.5px!important}
  .top .small,.top .tiny{font-size:14px!important}
  #toast,.toast{font-size:15px}
  @media(max-width:700px){#view .small{font-size:15px!important}#view .tiny{font-size:14px!important}}`;
  document.head.appendChild(c);
})();
