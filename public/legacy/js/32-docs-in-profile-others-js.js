
/* Floor lead and psychologist (5 Nov 2026, owner: "I told to remove"): Clinical documentation is not a place of its own for them either.
   Same change as 31-psy-docs-in-profile: the sidebar entry is removed, and each patient's Forms to print tab starts with
   "Fill in online" (overdue, due, in progress, all documents, filled and submitted). Nurse and RMO never had the entry.
   The card itself is built in 31 (window.psyDocsCard); this block only switches it on for these two roles. */
(function(){
  const mine=()=>S.role==='lead'||S.role==='psychologist';

  const __rs=renderSide;
  renderSide=function(){
    const out=__rs.apply(this,arguments);
    if(mine()){const dd=document.querySelector('#side .sgdd');if(dd)dd.querySelectorAll('button[aria-label^="Clinical documentation"]').forEach(b=>b.remove());}
    return out;
  };

  const __pf=pForms;
  pForms=function(){const h=__pf.apply(this,arguments);return mine()&&window.psyDocsCard?window.psyDocsCard()+h:h;};
})();
