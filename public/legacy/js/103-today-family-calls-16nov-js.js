/* 16 Nov 2026: psychiatrist Today on real patients. The strip said "25 family calls" but the table was empty: the table hides every item that is
   only "due today" (routine), and a patient admitted yesterday has nothing overdue yet. With real patients the 24 hour family calls that are due
   today are the main work, so they get a row each (type Family, button Call family). Overdue ones already have a row, so they are not repeated.
   Psychiatrist login only (every login is its own page), real mode only. */
(function(){
  if(!window.__realMode)return;
  if(String((window.__TULASI__||{}).role||'')!=='psychiatrist')return;
  const __x=window.psyExtraItems;
  window.psyExtraItems=function(p){
    const base=typeof __x==='function'?(__x.apply(this,arguments)||[]):[];
    let fam=[];
    try{
      fam=tasks().filter(t=>/^fa_/.test(String(t.id))&&!t.late&&String(t.title||'').indexOf(p.name)>=0)
        .map(t=>({k:'task',lab:['grey','Family'],txt:String(t.title).split(' · ')[0],due:t.due||'Due today',btn:['Call family',"go('"+(t.go||'#/patient/'+p.id+'/prefs')+"')",false]}));
    }catch(e){}
    return base.concat(fam);
  };
})();
/* 16 Nov 2026, TEMPORARY MOCK: the real rows are all "Family · 24 hour call · Nothing yet", so the page looks empty of variety. For now, on screen only,
   every row gets a mock type, a mock event line and a mock "action taken by others" in a repeating pattern. Every mock text ends with "(mock)".
   Nothing is saved or sent: the rows are drawn after the page and the mock lines have no buttons. Set MOCK_TODAY to false (or delete this block) to remove it. */
(function(){
  const MOCK_TODAY=true;
  if(!MOCK_TODAY||!window.__realMode)return;
  if(String((window.__TULASI__||{}).role||'')!=='psychiatrist')return;
  const SC=[
    null,
    {type:'Documentation',cls:'amber',edge:'amber',line:'Detailed history due · Today (mock)',who:''},
    {type:'MHCA',cls:'amber',edge:'amber',line:'Capacity assessment due · this week (mock)',who:'Psychologist: assessment booked, 2 pm (mock)'},
    {type:'Medication',cls:'blue',edge:'blue',line:'Medicine order to approve · Olanzapine 10 mg (mock)',who:'Nurse: order entered, 9:10 am (mock)'},
    {type:'Clinical event',cls:'red',edge:'red',line:'Vitals review needed (mock)',who:'RMO: informed, 9:25 am (mock)'},
    {type:'Family',cls:'grey',edge:'',line:'',who:'Psychologist: family met, 11:00 am (mock)'}
  ];
  function paint(){
    if(!/^#\/myday/.test(location.hash||''))return;
    const body=document.getElementById('dtBody');if(!body||body.dataset.mocked)return;
    body.dataset.mocked='1';
    [...body.querySelectorAll('tr')].filter(r=>r.id!=='dtNone'&&r.children.length>=5).forEach((tr,i)=>{
      const s=SC[i%SC.length];if(!s)return;
      const td=tr.children,ty=td[0].querySelector('.pd-ty');
      if(ty){ty.textContent=s.type;ty.className='pd-ty '+(s.cls==='grey'?'':s.cls);}
      if(s.edge)tr.className='r-'+s.edge;
      if(s.line){const d=document.createElement('div');d.className='pd-d';d.innerHTML='<i class="pd-dot '+s.cls+'"></i><span>'+s.line+'</span>';td[2].insertBefore(d,td[2].firstChild);}
      if(s.who)td[3].innerHTML='<div class="pd-d done"><i class="pd-dot ok"></i><span>'+s.who+'</span></div>';
    });
  }
  const __r=render;
  render=function(){const x=__r.apply(this,arguments);try{paint();}catch(e){}return x;};
  setTimeout(()=>{try{paint();}catch(e){}},300);
})();
