/* 25 Nov 2026 (owner): psychiatrist Today table. Patient name on one line, Event column moved a little right, and each event line
   gets an icon for what it is about (review, note or form, family call, vitals, risk, medicine, investigation, grievance, follow-up),
   tinted with the line's own urgency colour (red / amber / blue / green dot of block 26). Psychiatrist and floor lead psychiatrist. */
(function(){
  const role=String((window.__TULASI__||{}).role||'');
  if(!/^(psychiatrist|floor-lead-psychiatrist)$/.test(role))return;
  const P={
    risk:'<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
    vit:'<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
    call:'<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/>',
    med:'<path d="m10.5 20.5 10-10a4.9 4.9 0 0 0-7-7l-10 10a4.9 4.9 0 0 0 7 7zM8.5 8.5l7 7"/>',
    lab:'<path d="M9 2v6L4 18a2 2 0 0 0 1.8 3h12.4a2 2 0 0 0 1.8-3L15 8V2M8 2h8M7 15h10"/>',
    griev:'<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M12 7v4M12 14h.01"/>',
    doc:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h5"/>',
    rev:'<path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 12 0V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 12 0v-4"/><circle cx="20" cy="10" r="2"/>',
    time:'<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    dot:'<circle cx="12" cy="12" r="4"/>'};
  const RULES=[
    ['risk',/abscond|left the building|aggress|violen|restrain|suicid|self.?harm|risk|seclu|escap|fall|injur|critical|delirium/i],
    ['vit',/warning score|news|vital|bp\b|blood pressure|pulse|temperature|fever|spo2|sugar|withdrawal|ciwa|monitor/i],
    ['griev',/grievance|complain|concern/i],
    ['call',/call|family|caregiver|whatsapp/i],
    ['med',/medic|drug|dose|tablet|injection|lithium|clozapine|prescri|drowsy|side effect|mect|ect\b|\d+ ?mg\b|\b(im|iv|oral|prn|sos)\b/i],
    ['lab',/lab|investigation|blood|test|ecg|result|work.?up|urine|scan/i],
    ['rev',/review|round|consultant|assessment|reassess/i],
    ['doc',/note|history|form|consent|application|documentation|plan|summary|mhca|discharge|section|directive/i],
    ['time',/overdue|follow.?up|due|pending|past the|days/i]];
  const kind=t=>{for(const r of RULES)if(r[1].test(t))return r[0];return 'dot';};
  const svg=k=>'<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+P[k]+'</svg>';
  function paint(){
    document.querySelectorAll('.pd-t tbody>tr>td:nth-child(3) .pd-d>i.pd-dot:not([data-ic])').forEach(i=>{
      const t=((i.nextElementSibling||{}).textContent||'');const k=kind(t);
      i.dataset.ic=k;i.classList.add('pd-ic');i.innerHTML=svg(k);});}
  const st=document.createElement('style');
  st.textContent='.pd-t .pd-nm,.pd-t .pd-nm b{white-space:nowrap}.pd-t .pd-who{min-width:0}'
    +'.pd-t colgroup col:nth-child(2){width:270px!important}'
    +'.pd-t thead th:nth-child(3),.pd-t tbody>tr>td:nth-child(3):not([colspan]){padding-left:28px!important}'
    +'.pd-t .pd-dot.pd-ic{flex:0 0 24px;width:24px;height:24px;border-radius:7px;margin-top:-2px;display:grid;place-items:center;background:#F2F4F7!important;color:#667085}'
    +'.pd-t .pd-dot.pd-ic.red{background:#FEF3F2!important;color:#D92D20}.pd-t .pd-dot.pd-ic.amber{background:#FFFAEB!important;color:#B54708}'
    +'.pd-t .pd-dot.pd-ic.blue{background:#EFF4FF!important;color:#1D5FD1}.pd-t .pd-dot.pd-ic.ok{background:#ECFDF3!important;color:#067647}'
    +'.pd-t .pd-d{gap:10px;align-items:center;padding:3px 0}';
  document.head.appendChild(st);
  let q=0;new MutationObserver(()=>{clearTimeout(q);q=setTimeout(()=>{try{paint();}catch(e){}},40);}).observe(document.documentElement,{childList:true,subtree:true});
})();
