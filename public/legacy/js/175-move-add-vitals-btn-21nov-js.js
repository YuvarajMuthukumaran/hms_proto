/* 21 Nov 2026 — Move "+ Add vitals" button into the vitals table header (next to "+ Add reading"),
   remove it from the "Other monitoring" section. Also keep it out of the "Order monitoring" button area. */
(function(){
  function fix(){
    const v=document.getElementById('view');if(!v)return;

    /* Find the "+ Add vitals" button — it lives in the "Other monitoring" section footer */
    const addVitBtn=[...v.querySelectorAll('button')].find(b=>/^(\+\s*)?Add vitals$/.test(b.textContent.trim()));
    if(!addVitBtn)return;

    /* Find the "+ Add reading" button in the vitals table header */
    const addReadBtn=[...v.querySelectorAll('button')].find(b=>/^\+?\s*Add reading$/.test(b.textContent.trim()));
    if(!addReadBtn)return;

    /* Only move once — skip if already beside Add reading */
    if(addVitBtn.dataset.moved==='1')return;
    addVitBtn.dataset.moved='1';

    /* Style the Add vitals button to match Add reading */
    addVitBtn.className='btn sm';
    addVitBtn.style.marginLeft='8px';

    /* Insert Add vitals right before Add reading in the header row */
    addReadBtn.parentNode.insertBefore(addVitBtn,addReadBtn);
  }

  const __r=render;
  render=function(){const r=__r.apply(this,arguments);try{fix();}catch(e){}return r;};
})();
