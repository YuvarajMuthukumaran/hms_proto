/* 16 Nov 2026: psychiatrist Today on real patients. The strip said "25 family calls" but the table was empty: the table hides every item that is
   only "due today" (routine), and a patient admitted yesterday has nothing overdue yet. With real patients the 24 hour family calls that are due
   today are the main work, so they get a row each (type Family, button Call family). Overdue ones already have a row, so they are not repeated.
   Psychiatrist login only (every login is its own page), real mode only. */
/* psychiatrist Today layout (16 Nov): the Patient column is wide enough for a full name on one line, the Event column takes the space that was left empty,
   and the buttons sit close to the text. Psychiatrist login only. */
(function(){
  if(String((window.__TULASI__||{}).role||'')!=='psychiatrist')return;
  const s=document.createElement('style');
  s.textContent='.pd-t{width:100%!important;table-layout:fixed!important}.pd-t col:nth-child(1){width:8%!important}.pd-t col:nth-child(2){width:22%!important}.pd-t col:nth-child(3){width:32%!important}.pd-t col:nth-child(4){width:auto!important}.pd-t col:nth-child(5){width:15%!important;min-width:175px}.pd-t td:last-child{padding-right:12px!important}.pd-t .pd-nm{flex-wrap:wrap}.pd-t .pd-nm>span,.pd-t .pd-nm .pd-tag{white-space:nowrap!important;flex:0 0 auto}.pd-t td:last-child{text-align:left!important}.pd-t td:last-child .pd-acts{justify-content:flex-start!important}.pd-t td{padding-top:10px!important;padding-bottom:10px!important}.pd-t .pd-nm b{white-space:normal}';
  document.head.appendChild(s);
  /* the "New admission" tag sits right after the name, not on a line below it */
  const __rt=render;
  render=function(){const x=__rt.apply(this,arguments);try{
    document.querySelectorAll('.pd-t .pd-tags').forEach(t=>{const nm=t.closest('tr')&&t.closest('tr').querySelector('.pd-nm');if(!nm)return;[...t.children].forEach(c=>nm.appendChild(c));t.remove();});
  }catch(e){}return x;};
})();
(function(){
  if(!window.__realMode)return;
  if(String((window.__TULASI__||{}).role||'')!=='psychiatrist')return;
  const __x=window.psyExtraItems;
  window.psyExtraItems=function(p){
    const base=typeof __x==='function'?(__x.apply(this,arguments)||[]):[];
    let fam=[];
    try{
      fam=tasks().filter(t=>/^fa_/.test(String(t.id))&&!t.late&&String(t.title||'').indexOf(p.name)>=0)
        .map(t=>({k:'task',lab:['grey',/^24 hour/i.test(String(t.title))?'Admission':'Family'],txt:String(t.title).split(' · ')[0],due:t.due||'Due today',btn:['Call family',(m=>m&&window.faCall?(m[2]==='wk'?"faWeek('"+m[1]+"')":"faCall('"+m[1]+"','"+m[2]+"')"):"go('"+(t.go||'#/patient/'+p.id+'/prefs')+"')")(String(t.id).match(/^fa_(.+?)(c24|c34|wk)$/)),false]}));
    }catch(e){}
    return base.concat(fam);
  };
})();
/* 16 Nov 2026, TEMPORARY MOCK: the real rows are all "Family · 24 hour call · Nothing yet", so the page looks empty of variety. For now, on screen only,
   every row gets a mock type, a mock event line and a mock "action taken by others" in a repeating pattern. Every mock text ends with "(mock)".
   Nothing is saved or sent: the rows are drawn after the page and the mock lines have no buttons. Set MOCK_TODAY to false (or delete this block) to remove it. */
(function(){
  /* 18 Nov 2026, Trello "real data mode still shows demo data": switched off. Real patients show only real items, never a "(mock)" row. */
  const MOCK_TODAY=false;
  if(!MOCK_TODAY||!window.__realMode)return;
  if(String((window.__TULASI__||{}).role||'')!=='psychiatrist')return;
  const SC=[
    null,
    {type:'Documentation',cls:'grey',edge:'',line:'Detailed history due · within 72 h (mock)',who:''},
    {type:'MHCA',cls:'grey',edge:'',line:'Capacity assessment due · weekly, Section 89 (mock)',who:'Psychologist: assessment booked, 2 pm (mock)'},
    {type:'Medication',cls:'blue',edge:'blue',line:'RMO order to countersign · Olanzapine 10 mg (mock)',who:'Nurse: order entered, 9:10 am (mock)'},
    {type:'Clinical event',cls:'amber',edge:'amber',line:'Vitals out of range, managed and handed back (mock)',who:'RMO: reviewed, 9:25 am (mock)'},
    {type:'Investigation',cls:'amber',edge:'amber',line:'Abnormal lab result not yet reviewed (mock)',who:''},
    {type:'Critical',cls:'red',edge:'red',line:'Alert escalated to you (mock)',who:'RMO: escalated, 9:40 am (mock)'},
    {type:'Admission',cls:'grey',edge:'',line:'',who:'Psychologist: added to the patient, 11:00 am (mock)'}
  ];
  function paint(){
    if(!/^#\/myday/.test(location.hash||''))return;
    const body=document.getElementById('dtBody');if(!body)return;
    [...body.querySelectorAll('tr')].filter(r=>r.id!=='dtNone'&&r.children.length>=5&&!r.dataset.mocked).forEach((tr,i)=>{
      tr.dataset.mocked='1';
      const s=SC[i%SC.length];
      const td=tr.children,ty=td[0].querySelector('.pd-ty');
      if(ty){
        if(s){ty.textContent=s.type;ty.className='pd-ty '+(s.cls==='grey'?'':s.cls);}
        else if(ty.textContent==='MHCA')ty.classList.remove('amber');   /* MHCA is grey in the alert-types table */
        ty.dataset.pg='1';   /* the Type column is final: block 59 must not re-derive it from the text */
      }
      if(!s)return;
      if(s.edge)tr.className='r-'+s.edge;else tr.classList.remove('r-amber','r-red','r-blue');
      if(s.line){const d=document.createElement('div');d.className='pd-d';d.innerHTML='<i class="pd-dot '+s.cls+'"></i><span>'+s.line+'</span>';td[2].insertBefore(d,td[2].firstChild);}
      if(s.who)td[3].innerHTML='<div class="pd-d done"><i class="pd-dot ok"></i><span>'+s.who+'</span></div>';
    });
  }
  const __r=render;
  render=function(){const x=__r.apply(this,arguments);try{paint();}catch(e){}[60,400,1200].forEach(ms=>setTimeout(()=>{try{paint();}catch(e){}},ms));return x;};
  setTimeout(()=>{try{paint();}catch(e){}},300);
})();
