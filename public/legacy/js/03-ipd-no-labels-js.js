
(function(){
  const IPD = ['myday','inpatients','rounds','patient','notes','nursing','handover','floor','ward','duty','escalation','timeline','permissions'];
  function upd(){
    const sec = (location.hash||'').slice(2).split('/')[0] || 'myday';
    document.body.classList.toggle('ipd-plain', IPD.includes(sec));
  }
  window.addEventListener('hashchange', upd);
  const v = document.getElementById('view');
  if (v) new MutationObserver(upd).observe(v, {childList:true, subtree:true});
  upd();
})();
