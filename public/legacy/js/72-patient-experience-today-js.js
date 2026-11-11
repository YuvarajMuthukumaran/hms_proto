/* Patient Experience Lead navigation (11 Nov 2026): the existing experience dashboard belongs under Today;
   the former Today content moves to Stays. Other roles keep their current screens and labels. */
(function(){
  const isPX=()=>window.__TULASI__&&window.__TULASI__.role==='patient-experience-lead';
  const previousToday=ROLE.psychologist.myday;
  ROLE.psychologist.myday=function(){
    if(!isPX())return previousToday.apply(this,arguments);
    $('title').textContent='Today';
    return `<div class="px-today-embed"><iframe title="Patient Experience dashboard" src="/px-lead-prototype.html" loading="eager"></iframe></div>`;
  };
  ROLE.psychologist.ipdPage=function(o,base){
    if(!isPX())return base(o);
    $('title').textContent='Stays';
    return previousToday.apply(this,[]).replace(/Patient Experience/g,'Stays');
  };
  const style=document.createElement('style');style.id='px-today-embed-style';style.textContent=`
    .px-today-embed{width:100%;height:calc(100vh - 176px);min-height:760px;border:1px solid var(--line,#e4e7ec);border-radius:16px;overflow:hidden;background:#f4faff}
    .px-today-embed iframe{display:block;width:100%;height:100%;border:0;background:#f4faff}
    @media(max-width:900px){.px-today-embed{height:calc(100vh - 150px);min-height:680px}}
  `;document.head.appendChild(style);
  if(isPX())render();
})();
