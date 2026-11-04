
/* Easier dashboards (5 Nov 2026): shared helper for the floor lead, nurse and RMO dashboards. It changes nothing by itself: each role's own
   block (34 lead, 35 nurse, 36 RMO) wraps its own myday hook and calls easyDash(html, options). The psychiatrist and psychologist
   dashboards do not use it (owner: leave them as they are).
   What it adds, on top of the existing dashboard (same layout, same sections):
   - a "Start here" card: the one thing to do first, with its button; "All clear" when nothing is waiting
   - a one-line hint under the title
   - plain words on the existing buttons and labels (Acknowledge -> I've seen this, Overdue tasks -> Late tasks, ...)
   - slightly bigger buttons in the patient table (body class easy-dash) */
(function(){
  const ROLES=['lead','nurse','rmo'];
  const css=document.createElement('style');css.id='easy-dash-css';
  css.textContent=`
  body.easy-dash #dtBody .btn.sm{min-height:36px;padding:0 14px;font-size:13.5px}
  body.easy-dash #dtBody tr:hover td{background:#f8fbff}
  body.easy-dash .pd-hint{margin-top:4px}`;
  document.head.appendChild(css);

  const __render=render;
  render=function(){document.body.classList.toggle('easy-dash',ROLES.includes(S.role));return __render.apply(this,arguments);};

  const plain=t=>String(t==null?'':t).replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim();
  window.easyPlain=plain;
  window.easyStartCard=(items,clear)=>startCard(items,clear); /* also used by 37-easy-simple */

  function startCard(items,clear){
    if(!items.length)return `<section class="pd-start ok"><div><div class="pd-sh">All clear</div><div class="pd-st">${hesc(clear.text)}</div></div><button class="btn pri big" onclick="${clear.go}">${hesc(clear.label)}</button></section>`;
    const f=items[0],more=items.length-1;
    return `<section class="pd-start ${f.tone==='red'?'red':''}"><div><div class="pd-sh">Start here · ${hesc(f.why)}</div><div class="pd-st">${f.who?'<b>'+hesc(f.who)+'</b> · ':''}${hesc(f.txt)}</div><div class="tiny muted">${more?more+' more thing'+(more>1?'s':'')+' waiting after this one.':'This is the only thing waiting.'}</div></div><button class="btn pri big" onclick="${f.btn[1]}">${hesc(f.btn[0])}</button></section>`;
  }

  /* o: {hint, items:[{who,txt,why,tone,btn:[label,onclick]}], clear:{text,label,go}, words:[[from,to]...] (optional extra word swaps)} */
  window.easyDash=function(html,o){
    if(typeof html!=='string'||!ROLES.includes(S.role))return html;
    /* hint under the title */
    html=html.replace(/(<h2>Inpatient dashboard<\/h2><div class="muted"[^>]*>[^<]*<\/div>)/,(m,a)=>a+'<div class="pd-hint">'+hesc(o.hint)+'</div>');
    /* Start here, above the Tasks card */
    const card=startCard(o.items||[],o.clear);
    html=html.replace('<section class="card" id="dashTasks">',()=>card+'<section class="card" id="dashTasks">');
    /* plain words */
    const swap=(a,b)=>{html=html.split(a).join(b);};
    html=html.replace(/>(\s*)Acknowledge(\s*)</g,(m,a,b)=>'>'+a+"I've seen this"+b+'<');
    swap('I have seen the patient',"I've seen the patient");
    swap('<span>My inpatients</span>','<span>All my patients</span>');
    swap('<span>New admission</span>','<span>New patients</span>');
    swap('<span>Overdue tasks</span>','<span>Late tasks</span>');
    swap('<th>Due today</th>','<th>What to do today</th>');
    swap('<th>Observation</th>','<th>Checked</th>');
    html=html.replace(/>(\s*)Nudge(\s*)</g,(m,a,b)=>'>'+a+'Send reminder'+b+'<');
    (o.words||[]).forEach(w=>swap(w[0],w[1]));
    return html;
  };
})();
