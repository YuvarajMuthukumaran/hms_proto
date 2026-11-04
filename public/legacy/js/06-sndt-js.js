
/* SNDT on the Preferences tab: each section says who last changed it; any change there stamps the current user */
S.prefBy=S.prefBy||{};
/* the section heading a control belongs to = the last <h3> before it in the page */
function prefHead(el){let h=null;document.querySelectorAll('#view h3').forEach(x=>{if(x.compareDocumentPosition(el)&Node.DOCUMENT_POSITION_FOLLOWING)h=x;});return h;}
const __pPrefs0=pPrefs;pPrefs=function(){return __pPrefs0().replace(/<h3>([^<]+)<\/h3>/g,(m,t)=>{const w=S.prefBy[t.trim()]||{by:'Priya Nair',at:'18 Oct 2026, 4:40 pm'};return m+byl(w.by,w.at,'Last changed by');});};
['click','change'].forEach(ev=>document.addEventListener(ev,e=>{
  if(!/\/prefs/.test(location.hash))return;const el=e.target.closest&&e.target.closest('button,select,input[type=checkbox],input[type=radio]');if(!el||(ev==='click'&&el.tagName==='SELECT'))return;
  if(ev==='change'&&el.tagName==='BUTTON')return;const h=prefHead(el);if(h){S.prefBy[h.childNodes[0].textContent.trim()]=whoAt();setTimeout(()=>{if(/\/prefs/.test(location.hash)&&!$('scrim').classList.contains('show'))render();},0);}
},true));
document.addEventListener('change',e=>{if(/\/prefs/.test(location.hash)&&e.target.matches&&e.target.matches('input:not([type]),input[type=text],textarea')){const h=prefHead(e.target);if(h){S.prefBy[h.childNodes[0].textContent.trim()]=whoAt();render();}}},true);
/* vitals entered from the ward are saved with the nurse's name */
const __vitalsModal0=vitalsModal;vitalsModal=function(){__vitalsModal0();const b=document.querySelector('#modal .mf .btn.pri');if(b)b.setAttribute('onclick',"closeModal();toast('Vitals saved by '+signer()+' at '+clock()+'; trends updated')");
  const mb=document.querySelector('#modal .mb');if(mb)mb.insertAdjacentHTML('beforeend',`<div class="tiny muted" style="margin-top:8px">Saved as entered by ${hesc(signer())}, with today's date and time.</div>`);};
