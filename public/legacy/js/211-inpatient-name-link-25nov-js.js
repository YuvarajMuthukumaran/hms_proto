/* 25 Nov 2026 (owner): Inpatients list, every patient name looks and works like a link to the profile (before, only some looked
   clickable). Click (or Enter) opens the profile through the row's own View button. Psychiatrist and floor lead psychiatrist. */
(function(){
  const ROLE=String((window.__TULASI__||{}).role||'');
  if(!/^(psychiatrist|floor-lead-psychiatrist)$/.test(ROLE))return;
  const st=document.createElement('style');
  st.textContent='.psy-ipd-name{cursor:pointer;color:#1849a9!important;width:max-content;max-width:100%}.psy-ipd-name:hover{text-decoration:underline;text-underline-offset:3px}.psy-ipd-name:focus-visible{outline:2px solid #1e6cdb;outline-offset:2px;border-radius:4px}.psy-ipd-name .psy-ipd-name-tags{text-decoration:none}';
  document.head.appendChild(st);
  const view=tr=>[...tr.querySelectorAll('button,a')].find(b=>/^View$/i.test((b.textContent||'').trim()));
  /* fallback when the row has no go('#/patient/...') (block 201 handles those) */
  document.addEventListener('click',e=>{const n=e.target.closest&&e.target.closest('.psy-ipd-name');if(!n||e.target.closest('.psy-ipd-name-tags'))return;
    const tr=n.closest('tr');if(!tr)return;if([...tr.querySelectorAll('[onclick]')].some(x=>/#\/patient\//.test(x.getAttribute('onclick')||'')))return;
    const b=view(tr);if(b){e.stopPropagation();b.click();}});
  document.addEventListener('keydown',e=>{if(e.key!=='Enter')return;const n=e.target.closest&&e.target.closest('.psy-ipd-name');if(n){e.preventDefault();n.click();}});
  let q=0;new MutationObserver(()=>{clearTimeout(q);q=setTimeout(()=>{document.querySelectorAll('.psy-ipd-name:not([tabindex])').forEach(n=>{n.tabIndex=0;n.setAttribute('role','link');});},60);}).observe(document.documentElement,{childList:true,subtree:true});
})();
