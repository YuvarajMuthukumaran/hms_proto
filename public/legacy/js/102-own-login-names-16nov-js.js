/* 16 Nov 2026: the psychiatrist login is Anu Yadav's and the psychologist login is Kiran Kumari's. On the real site each shows that
   person's name (top bar, side card, signatures) instead of the role name. Only that login changes: every login is its own page, so no
   other role is touched. The list of their patients is filtered in 96 (loadAdmitted). */
(function(){
  if(!window.__realMode)return;
  const role=String((window.__TULASI__||{}).role||'');
  const ME={psychiatrist:{name:'Anu Yadav',ini:'AY',title:'Psychiatrist'},psychologist:{name:'Kiran Kumari',ini:'KK',title:'Psychologist'}}[role];
  if(!ME)return;
  try{Object.assign(ROLES[role],{name:ME.name,short:ME.name,ini:ME.ini,title:ME.title});}catch(e){}
  try{window.__realSigner=ME.name;}catch(e){}
  try{render();}catch(e){}
})();
