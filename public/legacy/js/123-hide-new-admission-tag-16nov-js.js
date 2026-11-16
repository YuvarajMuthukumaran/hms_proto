/* 16 Nov 2026: Remove the "New admission" blue tag from the action panel patient rows.
   Only the tag itself is removed. (An earlier version removed the tag's parent, which was the patient name, so the name disappeared.) */
(function(){
  function strip(){
    document.querySelectorAll('.pd-tag').forEach(function(el){
      if((el.textContent||'').trim()==='New admission')el.remove();
    });
    /* an empty tag wrapper leaves no gap */
    document.querySelectorAll('.pd-tags').forEach(function(w){if(!w.children.length&&!(w.textContent||'').trim())w.remove();});
  }
  var __r123=render;
  render=function(){
    var out=__r123.apply(this,arguments);
    try{strip();}catch(e){}
    return out;
  };
})();
