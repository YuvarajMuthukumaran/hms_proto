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
        ["Social relations",'m',O("Sociable","Makes friends easily","Few close friends","Prefers solitude","Shy","Withdrawn","Quarrelsome","Dependent on others")],
        ["Intellectual activities, hobbies and use of leisure time",'m',O("Reading","Sports","Music","Art or craft","Religious activities","TV or social media","Travel","Few interests")],
        ["Predominant mood",'m',O("Cheerful","Optimistic","Anxious","Worrier","Irritable","Moody","Pessimistic","Sad")],
        ["Character: attitude to self",'m',O("Self-confident","Low self-esteem","Self-critical","Overvalues self","Perfectionist","Over-sensitive")],
        ["Character: attitude to work and responsibility",'m',O("Responsible","Hard-working","Conscientious","Irresponsible","Avoids responsibility","Frequent job changes","Over-dedicated")],
        ["Character: interpersonal relationships",'m',O("Warm","Trusting","Suspicious","Dominant","Submissive","Aggressive","Manipulative","Aloof")],
        ["Character: standards in moral, religious and health matters",'m',O("Strict","Lenient","Religious","Not religious","Rigid","Casual about health","Health-conscious")],
        ["Character: energy, initiative",'m',O("Energetic","Active","Takes initiative","Lethargic","Easily tired","Passive","Impulsive")],
        ["Fantasy life",'m',O("Rich","Daydreaming","Realistic","Escapist","None")],
        ["Habits",'m',O("Alcohol","Tobacco","Cannabis","Other drugs","Regular sleep","Irregular sleep","Good diet","Poor diet","Regular exercise","Gambling","Excessive screen use")],
        ["Examiner's impression",'o',O('Balanced','Avoidant','Histrionic','Narcissistic','Paranoid','Obsessive compulsive','Schizoid','Dependent','Schizotypal','Borderline','Antisocial')]];
      pmp.__pm=1;
    }
  }catch(e){}
})();
