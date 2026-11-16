/* 16 Nov 2026, TEMPORARY MOCK (psychologist Today on real patients): "Current psychopathology" shows only the risk line and "Ongoing interventions"
   says "No interventions recorded" for every patient. For now, on screen only, empty cells get a mock text and a mock intervention with a progress bar.
   Every mock text carries "(mock)". Nothing is saved or sent, and no patient record is touched. Set MOCK_PSY to false (or delete this block) to remove it.
   Psychologist login only (every login is its own page), real mode only. */
(function(){
  const MOCK_PSY=true;
  if(!MOCK_PSY||!window.__realMode)return;
  if(String((window.__TULASI__||{}).role||'')!=='psychologist')return;
  const PS=['Low mood, poor sleep (mock)','Anxious, restless at night (mock)','Irritable, guarded, partial insight (mock)','Withdrawn, reduced appetite (mock)','Elevated mood, pressured speech (mock)'];
  const IV=[
    [['Cognitive behavioural therapy (mock)',3,8,'Individual'],['Psychoeducation (mock)',1,4,'Family']],
    [['Supportive therapy (mock)',2,6,'Individual']],
    [['Relaxation training (mock)',1,4,'Group']],
    [['Motivational interviewing (mock)',2,5,'Individual'],['Relapse prevention (mock)',0,3,'Group']]
  ];
  const ivHtml=list=>list.map(x=>{const pc=Math.min(100,Math.round(x[1]/x[2]*100));
    return '<div class="pg-iv"><div class="pg-ivh"><span>'+x[0]+'</span><b>'+x[1]+'/'+x[2]+'</b></div><div class="pg-bar"><i style="width:'+pc+'%"></i></div><div class="pg-ivs">'+x[3]+'</div></div>';}).join('');
  function paint(){
    if(!/^#\/myday/.test(location.hash||''))return;
    const body=document.getElementById('dtBody');if(!body||body.dataset.mocked)return;
    body.dataset.mocked='1';
    [...body.querySelectorAll('tr[data-dt]')].forEach((tr,i)=>{
      const cells=[...tr.querySelectorAll('td.pg-det')];if(!cells.length)return;
      const iv=cells[cells.length-1],ps=cells.length>1?cells[0]:null;   /* the Today table has one clinical cell (interventions); the Patients table has two */
      if(ps&&!ps.querySelector('.pg-ps'))ps.insertAdjacentHTML('afterbegin','<div class="pg-ps">'+PS[i%PS.length]+'</div>');
      if(/No interventions recorded/.test(iv.textContent))iv.innerHTML=ivHtml(IV[i%IV.length]);
    });
  }
  const __r=render;
  render=function(){const x=__r.apply(this,arguments);try{paint();}catch(e){}return x;};
  setTimeout(()=>{try{paint();}catch(e){}},300);
})();
