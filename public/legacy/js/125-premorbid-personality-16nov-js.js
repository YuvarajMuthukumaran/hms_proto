/* 16 Nov 2026, Dr. Anu's feedback (WhatsApp video): Premorbid personality needs the standard case-history
   breakdown, not one free-text box: Social relations / Intellectual activities, hobbies and leisure /
   Predominant mood / Character (attitude to self; attitude to work and responsibility; interpersonal
   relationships; standards in moral, religious and health matters; energy and initiative) / Fantasy life /
   Habits. Psychiatrist and psychologist screens only. */
(function(){
  const isPsy=()=>/^(psychiatrist|psychologist)$/.test(String((window.__TULASI__||{}).role||''));
  if(!isPsy())return;
  const O=(...a)=>a;
  try{
    const pmp=(typeof HIST!=='undefined'?HIST:[]).find(x=>x.k==='pmp');
    if(pmp&&!pmp.__pm){
      pmp.f=[
        ['Social relations','i'],
        ['Intellectual activities, hobbies and use of leisure time','i'],
        ['Predominant mood','i'],
        ['Character: attitude to self','i'],
        ['Character: attitude to work and responsibility','i'],
        ['Character: interpersonal relationships','i'],
        ['Character: standards in moral, religious and health matters','i'],
        ['Character: energy, initiative','i'],
        ['Fantasy life','i'],
        ['Habits','i'],
        ["Examiner's impression",'o',O('Balanced','Avoidant','Histrionic','Narcissistic','Paranoid','Obsessive compulsive','Schizoid','Dependent','Schizotypal','Borderline','Antisocial')]];
      pmp.__pm=1;
    }
  }catch(e){}
})();
