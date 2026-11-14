/* 12 Nov 2026 (Nikita): the HMS prototype must be screen adaptive. People will open it on an iPad, a tablet or a phone.
   Every role gets the tablet layout from block 75 (drawer menu under 1024 px, real tap sizes) and this block adds the phone layer:
   - under 1024 px: the 75% scale is off for every role, wide tables scroll sideways inside their card, never the page
   - under 700 px: one column everywhere, full width pop-ups, the safety bar and filter rows wrap, the patient header stacks, text never gets cut
   Desktop is unchanged (everything is inside media queries). */
(function(){
  const css=document.createElement('style');css.id='resp-12nov-css';
  css.textContent=`
  body.resp:not(.resp-ready) .side,body.resp:not(.resp-ready) #navScrim{transition:none!important}
  @media (max-width:1023px){
    html,body{max-width:100%;overflow-x:hidden}
    body{zoom:1!important}
    body.resp .content{max-width:100%}
    /* wide tables scroll inside their own card */
    #view .scroll,#view .scrollx,#view .pgc-top+*,#view .pd-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch}
    #view table{max-width:none}
    #view .card{max-width:100%}
    #view .card>div:has(>table),#view section:has(>table){overflow-x:auto}
    /* grids with fixed columns collapse */
    #view .split,#view .cols,#view .fgrid,#view .kf,#view .pr-grid,#view .ws,#view .rgrid,#view .rgrid2,#view .ovgrid{grid-template-columns:1fr!important}
    #view .split{display:flex!important;flex-direction:column}
    #view .cols{flex-direction:column}
    #view .cols>*{flex:1 1 auto!important;width:100%!important}
    #view .dph{grid-template-columns:1fr!important}
    #view .dpcards{grid-template-columns:repeat(2,minmax(0,1fr))!important}
    #safeBar{position:sticky}
    #view .ptable,#view .ipbar,#view .card.pad{overflow-x:auto}
  }
  @media (max-width:700px){
    body.resp .content{padding-left:10px!important;padding-right:10px!important}
    body.resp .top{padding:8px 10px!important;flex-wrap:nowrap}
    body.resp .top h1,body.resp #title{font-size:18px!important;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
    body.resp .top .row,body.resp .top .acct{gap:6px}
    #topName,.top button[aria-label=Account] svg{display:none}
    .top .row{gap:6px!important;flex-wrap:nowrap!important}
    /* pop-ups and drawers fill the screen */
    #modal,.modal,.drawer,.dr{width:100%!important;max-width:100vw!important;min-width:0!important;border-radius:14px 14px 0 0}
    #scrim.show #modal,#modal{max-height:92vh;overflow:auto}
    #modal .mh h3{font-size:17px}
    /* patient header and bars */
    #view .dpcards{grid-template-columns:1fr!important}
    #view .dph h2{font-size:20px!important}
    #view .dph .row{flex-wrap:wrap}
    #safeBar{gap:5px;padding:6px 10px}
    #safeBar .sh-n{flex-basis:100%}
    #safeBar .sh-s{display:none}
    #safeBar .sh-c{font-size:11px;padding:2px 8px}
    /* the note button sits on the chip row, so the sticky bar stays short on a phone */
    #safeBar .sh-b{flex:0 0 auto;margin-left:auto;height:30px;padding:0 12px;font-size:13px}
    /* filter rows, chips and segmented switches wrap or scroll */
    #view .seg,#view .mini-chips,#view .pg-mine,#view .pg-scope,#view .lp-fr,#view .toolbar,#view .ptfil,#view .pd-bar{flex-wrap:wrap;max-width:100%}
    #view .pd-bar .input,#view .toolbar .search{width:100%!important}
    #view .hd{flex-wrap:wrap;gap:8px}
    #view .hd .row{flex-wrap:wrap}
    #view .row{flex-wrap:wrap}
    #view .btn{max-width:100%}
    #view .kpis,#view .tiles,#view .v3kpis{grid-template-columns:repeat(2,minmax(0,1fr))!important}
    #view .au-strip{gap:6px}
    #view .lp-board,#view .pgc-board{grid-template-columns:1fr!important}
    #view .pgc-grid{overflow-x:auto}
    /* embedded team pages */
    .lp-emb,.px-emb{min-height:70vh}
    /* big tables keep a readable width and scroll */
    #view table.t{min-width:640px}
    /* the Today worklist becomes one card per patient on a phone */
    #view .pd-t,#view .pd-t tbody,#view .pd-t tr,#view .pd-t td{display:block;width:100%!important;min-width:0!important}
    #view .pd-t colgroup,#view .pd-t thead{display:none}
    #view .pd-t tr{border:1px solid var(--line,#e4e7ec);border-radius:14px;margin:0 0 10px;padding:6px 4px;background:#fff}
    #view .pd-t td{padding:6px 10px!important;border:0!important}
    #view .pd-t td:last-child{display:flex;justify-content:flex-end}
    #view table.pt{min-width:0}
    #view table.pt thead{display:none}
    #view table.pt,#view table.pt tbody,#view table.pt tr,#view table.pt td{display:block;width:100%!important}
    #view table.pt tr{border:1px solid var(--line,#e4e7ec);border-radius:14px;margin:0 0 10px;padding:6px 4px;background:#fff}
    #view table.pt td{padding:5px 10px!important;border:0!important}
  }
  @media (max-width:480px){
    #view h2{font-size:19px}
    #view .tile b,#view .kpi .v{font-size:22px}
    #view .tp-segs,#view .tp-tabs{align-self:stretch;flex-wrap:wrap}
    #view .tp-s,#view .tp-t{flex:1 1 auto}
  }`;
  document.head.appendChild(css);
  document.body.classList.add('resp'); /* from the first paint, so the menu drawer does not flash open */
  setTimeout(()=>document.body.classList.add('resp-ready'),700);
  /* every role gets the layout class, and the viewport stays device-width */
  const __r=render;
  render=function(){const r=__r.apply(this,arguments);try{document.body.classList.add('resp');
    /* the Today iframe of the lead psychologist follows the window height */
    const f=document.getElementById('lpToday');if(f){const z=parseFloat(getComputedStyle(document.body).zoom)||1;f.style.height=Math.max(560,Math.round(innerHeight/z-100))+'px';}
    /* a row of tabs that scrolls sideways on a phone opens with the current tab in view (the last tabs, such as Discharge summary, were off screen) */
    if(innerWidth<=700)setTimeout(()=>{document.querySelectorAll('#view .on, #view [aria-selected=true]').forEach(e=>{let p=e.parentElement;while(p&&p!==document.body){const cs=getComputedStyle(p);if(/auto|scroll/.test(cs.overflowX)&&p.scrollWidth>p.clientWidth+4){const er=e.getBoundingClientRect(),pr=p.getBoundingClientRect(),key=e.textContent.trim().slice(0,24);if((er.right>pr.right||er.left<pr.left)&&p.dataset.tabAt!==key){p.scrollLeft+=er.left-pr.left-(p.clientWidth-er.width)/2;}p.dataset.tabAt=key;break;}p=p.parentElement;}});},60);
  }catch(e){}return r;};
})();
