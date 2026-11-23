/* 23 Nov 2026 (Nikita): Today search kept losing the cursor after one letter (every key redrew the page);
   "Admitted now" filtered the alert rows to nothing, it now opens the Patients list. */
const rep=require('./rep.cjs');
rep('public/px/today.html',[
 ["function render(){\n  document.getElementById('root').innerHTML",
  "function render(){\n  const ae=document.activeElement,keep=ae&&ae.id==='pxSearch'?[ae.selectionStart,ae.selectionEnd]:null;\n  document.getElementById('root').innerHTML"],
 ["  try{placeMenu();}catch(e){}\n}",
  "  try{placeMenu();}catch(e){}\n  if(keep){const s=document.getElementById('pxSearch');if(s){s.focus();try{s.setSelectionRange(keep[0],keep[1]);}catch(e){}}}\n}"],
 ["  if(k==='nps'){if(!navShell('reports'))",
  "  if(k==='adm'){navShell('patients');return;}\n  if(k==='nps'){if(!navShell('reports'))"],
]);
