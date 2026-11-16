/* 16 Nov 2026: Remove "New admission" blue tag from the action panel patient rows.
   The tag (class pd-tag blue inside pd-tags, or class pd-tag blue on its own)
   is generated in 26-psy-dashboard-js.js when p.day <= 1 and in a few other render paths.
   Simplest fix: hide via CSS + strip from DOM after every render so no layout gap remains. */
(function(){
  if(!document.getElementById('no-newadm-css')){
    var s=document.createElement('style');
    s.id='no-newadm-css';
    /* Hide the wrapper div and any standalone pd-tag that says "New admission" */
    s.textContent='.pd-tags{display:none!important}';
    document.head.appendChild(s);
  }
  function strip(){
    /* Also remove any inline "New admission" spans in other views (handover, psychologist list) */
    document.querySelectorAll('.pd-tag.blue,.pd-tag[class*="blue"]').forEach(function(el){
      if((el.textContent||'').trim()==='New admission'){
        var wrap=el.closest('.pd-tags')||el.parentElement;
        if(wrap&&wrap!==document.body) wrap.remove(); else el.remove();
      }
    });
  }
  var __r123=render;
  render=function(){
    var out=__r123.apply(this,arguments);
    try{strip();}catch(e){}
    return out;
  };
})();
