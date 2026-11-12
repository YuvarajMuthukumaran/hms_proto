/* 12 Nov 2026, Trello card 99: Tablet layout for Today and Rounds (psychiatrist and psychologist workspaces).
   Under 1024 px:
   - the left menu becomes a drawer opened from a hamburger in the top bar (it used to fill the first screen)
   - the 75% scale is switched off, so the sizes below are real pixels; every button, chip and tab is at least 44 px tall
   - Rounds: the ward list is one row of chips above the patient, and a swipe left or right moves to the next or previous patient
   Desktop is unchanged (everything is inside the media query). */
(function(){
  const doc=()=>S.role==='psychiatrist'||S.role==='psychologist';
  const css=document.createElement('style');css.id='tablet-12nov-css';
  css.textContent=`
  .burger{display:none}
  #navScrim{display:none}
  @media (max-width:1023px){
    body.psy-views{zoom:1!important}
    body.psy-views .app,body.psy-views .app.compact{display:block!important;min-height:100vh!important}
    body.psy-views .side,body.psy-views .app.compact .side{position:fixed!important;left:0;top:0;bottom:0;width:290px!important;flex:none!important;height:100vh!important;z-index:140;transform:translateX(-105%);transition:transform .22s ease;padding:18px 14px!important;overflow-y:auto;background:#fff;box-shadow:none;align-items:stretch!important}
    body.psy-views.nav-open .side{transform:none;box-shadow:8px 0 30px rgba(16,24,40,.25)}
    body.psy-views #navScrim{position:fixed;inset:0;z-index:130;background:rgba(16,24,40,.38);opacity:0;pointer-events:none;transition:opacity .2s;display:block}
    body.psy-views.nav-open #navScrim{opacity:1;pointer-events:auto}
    body.psy-views .main{width:100%!important;margin:0!important}
    body.psy-views .top{display:flex;align-items:center;gap:10px}
    body.psy-views .burger{display:inline-flex;align-items:center;justify-content:center;flex:0 0 46px;width:46px;height:46px;border:1px solid var(--line,#e4e7ec);border-radius:12px;background:#fff;color:#14284b;cursor:pointer}
    /* real-size tap targets */
    body.psy-views #view button,body.psy-views #view .btn,body.psy-views #view .tog,body.psy-views #view .seg button,body.psy-views #view .espill,body.psy-views #view .mini-chips button,body.psy-views #view select,body.psy-views #view .input,body.psy-views #view .lz-chip{min-height:44px}
    body.psy-views #view .btn.sm,body.psy-views #view .tog,body.psy-views #view .mini-chips button{padding-left:14px;padding-right:14px}
    body.psy-views #view .mini-chips,body.psy-views #view .radios{gap:8px}
    /* Today: no page padding wasted */
    body.psy-views .content{padding-left:14px!important;padding-right:14px!important}
    /* Rounds: ward list as one row of chips, the patient fills the screen */
    body.psy-views .pr-grid{grid-template-columns:1fr!important;gap:10px!important}
    body.psy-views .pr-queue{position:static!important;max-height:none!important;overflow-x:auto!important;overflow-y:hidden!important;display:flex!important;flex-wrap:nowrap;align-items:center;gap:8px;padding:8px 10px!important;scroll-snap-type:x proximity;scrollbar-width:none}
    body.psy-views .pr-queue::-webkit-scrollbar{display:none}
    body.psy-views .pr-queue>div:first-child{display:none}
    body.psy-views .pr-q{flex:0 0 auto;width:auto!important;white-space:nowrap;min-height:46px;border:1px solid var(--line,#e4e7ec)!important;border-radius:99px!important;padding:6px 14px!important;scroll-snap-align:center}
    body.psy-views .pr-q.on{border-color:#1e6cdb!important}
    body.psy-views .pr-q .tiny,body.psy-views .pr-q small{display:none}
    body.psy-views .pr-top{flex-wrap:wrap;gap:8px}
    /* the handover card is a short strip, so the worklist shows without scrolling */
    body.psy-views .hv-rc-wrap,body.psy-views .hv-rc-list{max-height:150px!important}
  }
  `;
  document.head.appendChild(css);

  /* hamburger and scrim */
  function ensure(){
    if(!doc())return;
    const top=document.querySelector('.top');
    if(top&&!document.getElementById('navBurger')){
      const b=document.createElement('button');b.id='navBurger';b.type='button';b.className='burger';b.setAttribute('aria-label','Open menu');b.setAttribute('aria-controls','side');
      b.innerHTML='<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';
      b.addEventListener('click',()=>{document.body.classList.toggle('nav-open');b.setAttribute('aria-expanded',document.body.classList.contains('nav-open')?'true':'false');});
      top.insertBefore(b,top.firstChild);
    }
    if(!document.getElementById('navScrim')){
      const s=document.createElement('div');s.id='navScrim';s.addEventListener('click',()=>document.body.classList.remove('nav-open'));document.body.appendChild(s);
    }
    /* below 1024 px the icon-only rail is not used */
    if(window.innerWidth<1024){const a=document.getElementById('app');if(a)a.classList.remove('compact');}
  }
  /* picking something in the menu closes it */
  document.addEventListener('click',e=>{if(e.target.closest&&e.target.closest('#side [onclick]'))setTimeout(()=>document.body.classList.remove('nav-open'),50);});
  window.addEventListener('resize',()=>{if(window.innerWidth>=1024)document.body.classList.remove('nav-open');});
  window.addEventListener('hashchange',()=>document.body.classList.remove('nav-open'));

  /* Rounds: swipe left or right for the next or previous patient */
  let sx=0,sy=0,st=0;
  document.addEventListener('touchstart',e=>{const t=e.touches[0];sx=t.clientX;sy=t.clientY;st=Date.now();},{passive:true});
  document.addEventListener('touchend',e=>{
    if(!doc()||window.innerWidth>=1024||!/^#\/rounds/.test(location.hash||''))return;
    const t=e.changedTouches[0],dx=t.clientX-sx,dy=t.clientY-sy;
    if(Math.abs(dx)<80||Math.abs(dy)>50||Date.now()-st>700)return;
    /* not while swiping inside a scrolling strip, a table or a text box */
    if(e.target.closest&&e.target.closest('.pr-queue,table,textarea,input,.scrollx,.scroll,.medgrid'))return;
    try{
      const R=S.rounds,wp=WARDS[R.ward],i=R.idx[R.ward]+(dx<0?1:-1);
      if(i<0||i>=wp.length)return;
      R.idx[R.ward]=i;S.focusPid=wp[i].id;render();window.scrollTo(0,0);
    }catch(x){}
  },{passive:true});

  const __r75=render;
  render=function(){const r=__r75.apply(this,arguments);try{ensure();}catch(e){}
    /* keep the current ward chip in view */
    try{const q=document.querySelector('.pr-queue .pr-q.on');if(q&&window.innerWidth<1024){const c=q.parentElement;c.scrollLeft=Math.max(0,q.offsetLeft-(c.clientWidth-q.offsetWidth)/2);}}catch(e){}
    return r;};
})();
