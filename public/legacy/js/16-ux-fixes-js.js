
/* Small shared fixes (3 Nov 2026, Yuvaraj).
   1. Pressing a button or switching tabs on the same page (or the same patient) keeps your place instead of jumping
      to the top; opening a different page starts at the top. Several screens scroll to the top after drawing, some of
      them a moment later, so the wanted position is applied after the redraw and again just after.
   2. Escalation chain shows only where each open alert is now ("How an alert travels" and "Response times" removed). */
let __ux_last='',__ux_y=window.scrollY;
/* last position the user scrolled to; another hash-change handler resets the page before the redraw, so read this, not scrollY */
window.addEventListener('scroll',()=>{__ux_y=window.scrollY;},{passive:true});
/* and the position at the moment of a click, before anything reacts to it */
let __ux_cy=0,__ux_ct=0;document.addEventListener('click',()=>{__ux_cy=window.scrollY;__ux_ct=Date.now();},true);
const __ux_key=h=>{const r=(h||'').slice(2).split('/');if(r[0]==='patient')return r[0]+'/'+r[1];if(r[0]==='clinical-docs')return r.slice(0,3).join('/');if(r[0]==='rounds'&&S.rounds)return 'rounds/'+S.rounds.ward+'/'+S.rounds.idx[S.rounds.ward];return r[0];};
const __ux_render=render;
render=function(){
  const k=__ux_key(location.hash),same=k===__ux_last,y=Date.now()-__ux_ct<1500?__ux_cy:__ux_y;
  const out=__ux_render.apply(this,arguments);
  __ux_last=k;
  const put=()=>{const t=same?y:0;if(window.scrollY!==t)window.scrollTo({top:t,behavior:'instant'});};
  put();requestAnimationFrame(put);setTimeout(put,120);
  return out;
};
const __ux_esc=V3.escPage;
V3.escPage=function(){
  const d=document.createElement('div');d.innerHTML=__ux_esc.apply(this,arguments);
  [...d.querySelectorAll('section.card, .card')].forEach(c=>{const t=(c.querySelector('h3')||{}).textContent||'';if(/^(How an alert travels|Response times)/.test(t.trim()))c.remove();});
  return d.innerHTML;
};
