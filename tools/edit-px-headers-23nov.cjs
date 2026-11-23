/* 23 Nov 2026 (Nikita): Staff training and Reports: the page title is in the top bar, so it is not repeated in the page;
   one left edge, actions on the same row as the description. Staff training: Plan a session / Add staff are shown again
   (they only showed with ?admin=1, which the PX app never passes); filters sit on the left. */
const rep=require('./rep.cjs');
rep('public/px/training.html',[
 ["const ADMIN=/[?&]admin=1/.test(location.search);","const ADMIN=!/[?&]admin=0/.test(location.search);"],
 ['<div class="hello"><div><h2>Staff training</h2><div class="muted">','<div class="hello"><div><div class="muted">'],
 [".hello{display:flex;justify-content:space-between;align-items:flex-end;gap:12px;flex-wrap:wrap}",".hello{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}"],
 [".bar{display:flex;gap:10px;flex-wrap:wrap;align-items:center;justify-content:space-between}",".bar{display:flex;gap:10px;flex-wrap:wrap;align-items:center;justify-content:flex-start}"],
]);
rep('public/px/reports.html',[
 ['<div class="hello"><div><h2>Reports</h2><div class="muted">','<div class="hello"><div><div class="muted">'],
 [".hello{display:flex;justify-content:space-between;align-items:flex-end;gap:12px;flex-wrap:wrap}",".hello{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}"],
]);
