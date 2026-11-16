/* 16 Nov 2026: Restyle the "Edit admission date" button and "Last visit in the old HMS"
   text that admBtn() in 112-psy-meeting-16nov-js.js appends to the Admitted card.
   They were raw unstyled elements stacked with no spacing — now they look clean. */
(function(){
  var STYLE_ID = 'adm-btn-css';
  function ensureStyle(){
    if(document.getElementById(STYLE_ID)) return;
    var s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = [
      /* Wrapper for the edit button + meta lines */
      '.pm-ad-wrap{display:flex;flex-direction:column;gap:4px;margin-top:8px;padding-top:8px;border-top:1px solid #e8edf2}',
      /* "Edit admission date" link-style button */
      '.pm-ad{display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:600;color:#0056b3;background:none;border:none;cursor:pointer;padding:0;text-decoration:none}',
      '.pm-ad:hover{color:#003d80;text-decoration:underline}',
      /* "Last visit" and estimated note */
      '.pm-ad-wrap .tiny.muted{font-size:11px;color:#6b7280;margin:0;line-height:1.5}',
    ].join('\n');
    document.head.appendChild(s);
  }

  /* Re-wrap the appended elements into a tidy container */
  function tidy(){
    ensureStyle();
    document.querySelectorAll('#view .dpcards > *').forEach(function(card){
      /* Only touch cards that already have the edit button */
      var btn = card.querySelector('.pm-ad');
      if(!btn || btn.closest('.pm-ad-wrap')) return;
      /* Collect btn + all following siblings that are .tiny.muted divs */
      var wrap = document.createElement('div');
      wrap.className = 'pm-ad-wrap';
      /* Prepend a small calendar icon to the button */
      if(!btn.querySelector('svg')){
        var svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
        svg.setAttribute('width','12'); svg.setAttribute('height','12');
        svg.setAttribute('viewBox','0 0 24 24'); svg.setAttribute('fill','none');
        svg.setAttribute('stroke','currentColor'); svg.setAttribute('stroke-width','2');
        svg.setAttribute('stroke-linecap','round'); svg.setAttribute('stroke-linejoin','round');
        svg.setAttribute('aria-hidden','true');
        svg.innerHTML = '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>';
        btn.insertBefore(svg, btn.firstChild);
      }
      /* Move btn into wrap */
      btn.parentNode.insertBefore(wrap, btn);
      wrap.appendChild(btn);
      /* Move following tiny.muted sibling divs into wrap */
      while(wrap.nextSibling && wrap.nextSibling.classList &&
            wrap.nextSibling.classList.contains('tiny') &&
            wrap.nextSibling.classList.contains('muted')){
        wrap.appendChild(wrap.nextSibling);
      }
    });
  }

  var __r124 = render;
  render = function(){
    var out = __r124.apply(this, arguments);
    try{ tidy(); }catch(e){}
    return out;
  };
})();
