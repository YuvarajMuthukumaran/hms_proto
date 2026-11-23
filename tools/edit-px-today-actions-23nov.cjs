/* 23 Nov 2026 (owner): PX Today Take Action menu. "Call the family" (and "Call the family back / yourself") opens the same call pop-up
   as the Call buttons; "Took Pt Preferences" opens the patient on the Preferences tab (localStorage pxopentab, read by patients.html). */
const rep=require('./rep.cjs');
rep('public/px/today.html',[[
"    if(t.dataset.m==='Took Pt Preferences'){ setState({open:null}); if(!navShell('patients',t.dataset.actp))",
"    if(/^Call the family/.test(t.dataset.m)){ setState({open:null}); const pp=TP.find(x=>x.name===t.dataset.actp)||{id:t.dataset.act,name:t.dataset.actp,rep:'',rel:'',ph:'',day:'',room:''}; pp.row=t.dataset.act; openCall(pp, pp.callN||1); return; }\n"+
"    if(t.dataset.m==='Took Pt Preferences'){ setState({open:null}); try{localStorage.setItem('pxopentab','prefs');}catch(e){} if(!navShell('patients',t.dataset.actp))"]]);
rep('public/px/patients.html',[[
"function pxOpenByName(n){const p=P.find(x=>x.name===n);if(p)set({view:'rec',pid:p.id,rtab:'summary',",
"function pxOpenByName(n){const p=P.find(x=>x.name===n);let tb='summary';try{tb=localStorage.getItem('pxopentab')||'summary';localStorage.removeItem('pxopentab');}catch(e){}if(p)set({view:'rec',pid:p.id,rtab:tb,"]]);
