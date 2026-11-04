
/* Psychiatrist only (5 Nov 2026): clinical documentation lives inside each patient, not in a place of its own.
   The sidebar entry "Clinical documentation" is gone (27-psy-navigation). The patient's existing "Forms to print" tab now starts with
   "Fill in online": what is overdue, due or in progress for THIS patient, every document of the stay, and what was filled and submitted.
   Fill in / Open uses the same form editor and PDF as before; its Back button returns to this tab. No new tab was added.
   (Trello: "What is the point of this clinical documentation subtab ... all this should be a part of patient profile".) */
(function(){
  const psy=()=>S.role==='psychiatrist';
  const css=document.createElement('style');css.id='psy-docs-css';
  css.textContent=`
  .dc details{border-top:1px solid var(--line-2)}.dc summary{cursor:pointer;padding:12px 20px;font-weight:600;font-size:13.5px;list-style:none}
  .dc summary::-webkit-details-marker{display:none}.dc summary:before{content:'›';display:inline-block;margin-right:8px;transition:transform .15s;color:var(--muted)}
  .dc details[open]>summary:before{transform:rotate(90deg)}`;
  document.head.appendChild(css);

  const ST={Overdue:['c-amber','Overdue'],Due:['c-blue','Due today'],Pending:['c-grey','In progress'],Available:['c-grey','Not started'],Completed:['c-green','Completed']};
  const when=s=>{try{return new Date(s).toLocaleString('en-IN',{day:'numeric',month:'short',hour:'numeric',minute:'2-digit'});}catch(e){return '';}};

  window.psyDocOpen=function(key){
    const pid=String(key).split('|')[0];
    cdCapture();CD_DATA=cdLoad();S.cdPatient=pid;S.cdTab='documents';S.cdFilter='all';S.cdQuery='';S.cdEditing=false;S.cdDirty=false;CD_WORKKEY='';CD_ROUTE_ACTIVE=true;
    cdSelect(key); /* remembers this tab as the place Back returns to */
  };

  function card(){
    let items;try{CD_DATA=cdLoad();items=cdItems(S.pid);}catch(e){return '';}
    const n=s=>items.filter(i=>i.status===s).length,done=items.filter(i=>i.status==='Completed');
    const todo=items.filter(i=>i.status==='Overdue'||i.status==='Due'||i.status==='Pending');
    const row=i=>{const st=ST[i.status]||['c-grey',i.status],sub=i.submission;
      return `<div class="li"><div class="grow"><div style="font-weight:600">${hesc(i.form.title)}</div><div class="tiny muted">${hesc(i.meta||'')}${i.due?' · due '+hesc(cdDateLabel(i.due)):''}${sub?' · submitted '+hesc(when(sub.submittedAt))+' by '+hesc(sub.author||''):''}</div></div>${chip(st[1],st[0])}<button class="btn sm ${i.status==='Completed'?'':'pri'}" onclick="psyDocOpen('${hesc(i.entryKey)}')">${i.status==='Completed'?'Open':i.status==='Pending'?'Continue':'Fill in'}</button></div>`;};
    const shown=todo.slice(0,10);
    return `<section class="card dc"><div class="hd"><div><h3>Fill in online</h3><div class="small muted" style="margin-top:4px">Fill a form in on screen and generate the PDF. Everything for this patient is here; there is no separate documents page.</div></div></div>
      <div class="ostrip" style="margin:0 20px 12px"><div class="${n('Overdue')?'warn':''}"><span class="lbl">Overdue</span><b>${n('Overdue')}</b></div><div><span class="lbl">Due today</span><b>${n('Due')}</b></div><div><span class="lbl">Completed</span><b>${done.length}</b></div><div><span class="lbl">Documents this stay</span><b>${items.length}</b></div></div>
      ${shown.length?shown.map(row).join(''):'<div class="pad small muted">Nothing overdue or due for this patient.</div>'}
      ${todo.length>shown.length?`<div class="pad small muted">${todo.length-shown.length} more in All documents below.</div>`:''}
      <details><summary>All documents (${items.length})</summary>${items.map(row).join('')}</details>
      <details><summary>Filled and submitted (${done.length})</summary>${done.length?done.map(row).join(''):'<div class="pad small muted">Nothing submitted yet.</div>'}</details></section>`;
  }

  window.psyDocsCard=card; /* also used by 32-docs-in-profile-others */
  const __pf=pForms;
  pForms=function(){const h=__pf.apply(this,arguments);return psy()?card()+h:h;};
})();
