/* 23 Nov 2026 (owner): PX Today. The eye opens a pop-up (it opened a panel under the table); the Take Action menu is placed
   on the page (position:fixed) so the table's scroll box no longer cuts it off; concern rows count down the 6-hour rule. */
const rep=require('./rep.cjs');
rep('public/px/today.html',[
 ['return `<div class="tw" style="margin:12px 0;padding:16px 18px" role="region" aria-label="Details for ${esc(e.name)}">',
  'return `<div class="eyeov" style="position:fixed;inset:0;z-index:60;background:rgba(15,23,42,.38);display:flex;align-items:center;justify-content:center;padding:16px"><div class="tw" style="background:#fff;border:1px solid #E3EAF2;width:min(620px,100%);max-height:86vh;overflow:auto;padding:20px 22px;border-radius:16px;box-shadow:0 20px 50px rgba(15,23,42,.25);font-size:15px" role="dialog" aria-modal="true" aria-label="Details for ${esc(e.name)}">'],
 ['<div style="margin-top:12px;font-size:13px;color:#344054"><b>Action taken by others:</b> ${esc(e.others)}</div></div>`})()}',
  '<div style="margin-top:14px;font-size:14px;color:#344054"><b>Action taken by others:</b> ${esc(e.others)}</div>${/^g:/.test(e.id)?\'<div style="margin-top:16px"><button class="btn" data-act="\'+e.id+\'" data-m="Open in Grievances">Open in Grievances</button></div>\':\'\'}</div></div>`})()}'],
 ['setState({eye:same?null:(t.dataset.eye||null),open:null});if(!same)setTimeout(()=>{const p=document.querySelector(\'[aria-label^="Details for"]\');if(p)p.scrollIntoView({block:"center",behavior:"smooth"});},60);return;}',
  'setState({eye:same?null:(t.dataset.eye||null),open:null});return;}'],
 ["function render(){","/* eye pop-up: backdrop click or Escape closes it; Take Action menu placed on the page under its button */\ndocument.addEventListener('click',e=>{if(e.target&&e.target.classList&&e.target.classList.contains('eyeov'))setState({eye:null});});\ndocument.addEventListener('keydown',e=>{if(e.key==='Escape'&&(state.eye||state.open))setState({eye:null,open:null});});\nwindow.addEventListener('scroll',()=>{if(state.open)setState({open:null});},true);\nfunction placeMenu(){const m=document.querySelector('.menu[role=menu]');if(!m)return;const b=m.parentElement&&m.parentElement.querySelector('.take');if(!b)return;const r=b.getBoundingClientRect(),w=m.offsetWidth||260,h=m.offsetHeight;let top=r.bottom+6;if(top+h>innerHeight-8&&r.top-h-6>8)top=r.top-h-6;m.style.position='fixed';m.style.top=top+'px';m.style.left=Math.max(8,Math.min(innerWidth-w-8,r.right-w))+'px';m.style.zIndex='70';}\nfunction render(){"],
]);
rep('public/px/today.html',[
 ["  document.querySelectorAll('.rev button').forEach(b=>b.classList.toggle('on',b.dataset.v===state.view));\n}","  document.querySelectorAll('.rev button').forEach(b=>b.classList.toggle('on',b.dataset.v===state.view));\n  try{placeMenu();}catch(e){}\n}"],
 ["const h=pts.find(p=>p.id===c.pid)||{},red=/safety|rights/i.test(s.category||'')||s.type==='grievance';",
  "const h=pts.find(p=>p.id===c.pid)||{},left=s.at?6*36e5-(Date.now()-s.at):null,over=left!==null&&left<=0,red=/safety|rights/i.test(s.category||'')||s.type==='grievance'||over;\n    const hm=ms=>{const m=Math.max(1,Math.round(Math.abs(ms)/6e4));return m>=60?Math.floor(m/60)+' h'+(m%60?' '+m%60+' min':''):m+' min';};\n    s.sla=left===null?(s.sla==='Due tomorrow'?'':s.sla):over?'late by '+hm(left):hm(left)+' left of 6 h';"],
]);
rep('public/px/px-grievances.js',[
 ["if (d.c && !have[d.c.id]) { extra.push(d.c); have[d.c.id] = 1; changed = true; }",
  "if (d.c && d.c.sla === 'Due tomorrow') d.c.sla = '6 h left'; /* 23 Nov: every concern has the 6-hour rule */\n            if (d.c && !have[d.c.id]) { extra.push(d.c); have[d.c.id] = 1; changed = true; }"],
]);
