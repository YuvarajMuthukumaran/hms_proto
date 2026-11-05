
/* All roles (5 Nov 2026, team review: "back button navigation: make more seamless").
   Opening a page from a list and pressing Back used to land you at the top of the list. Now the browser's Back and Forward buttons put you back
   where you were on that page. A normal click on a link still opens a page at its top (block 16 keeps its rules for that). The position is
   remembered per address (including the tab), in memory only. */
(function(){
  let viaGo=false,pending=null,t0=0;
  const pos={};
  /* remember where the user is on the current address; at a click too, before anything reacts to it */
  window.addEventListener('scroll',()=>{pos[location.hash]=window.scrollY;},{passive:true});
  document.addEventListener('click',()=>{pos[location.hash]=window.scrollY;},true);
  /* pages opened by the app (go) are forward moves, not Back */
  const __go=go;
  go=function(h){viaGo=true;clearTimeout(t0);t0=setTimeout(()=>{viaGo=false;},300);return __go.apply(this,arguments);};
  /* popstate comes before hashchange: decide here whether this was Back or Forward */
  window.addEventListener('popstate',()=>{
    if(viaGo){viaGo=false;pending=null;return;}
    const y=pos[location.hash];pending=(y&&y>0)?y:null;
  });
  const __render=render;
  render=function(){
    const out=__render.apply(this,arguments);
    if(pending!=null){
      const y=pending;
      /* after the redraw, the page transition and block 16's own scroll handling */
      const put=()=>{if(Math.abs(window.scrollY-y)>2)window.scrollTo({top:y,behavior:'instant'});};
      requestAnimationFrame(put);setTimeout(put,200);setTimeout(()=>{put();if(pending===y)pending=null;},420);
    }
    return out;
  };
})();
