/* 16 Nov 2026: Vitals/metabolic monitoring tasks (Weight overdue, Sugar overdue, Lipids overdue) are
   logged and acted on by nursing staff, not by doctors.  They were appearing in the psychiatrist's
   action panel (the eye-modal in the inpatient dashboard) because 81-results-safety-12nov-js.js
   injects them into tasks() for doc() === true (psychiatrist) and lead roles.
   This patch strips those rs_* tasks from the tasks() result for all non-nurse, non-RMO roles so
   they never reach the psychiatrist / psychologist / floor-lead action panels. */
(function(){
  const NURSING_TESTS=/^(Weight|Sugar|Lipids?)\s+overdue/i;
  const isNursingRole=()=>{const r=String((window.__TULASI__||{}).role||S.role||'');return r==='nurse'||r==='floor-coordinator';};
  if(typeof tasks!=='function')return;
  const __t121=tasks;
  tasks=function(){
    const r=__t121.apply(this,arguments);
    if(!Array.isArray(r)||isNursingRole())return r;
    /* keep everything except the metabolic monitoring overdue tasks (id prefix rs_ + nursing test name) */
    return r.filter(t=>{
      if(typeof t.id==='string'&&t.id.indexOf('rs_')===0){
        const title=String(t.title||'');
        if(NURSING_TESTS.test(title))return false;
      }
      return true;
    });
  };
})();
