/* Psychologist only (10 Nov 2026): the Rounds page redesigned.
   A ward round is a walk: five patients, one after another, read what changed, write the note, set the plan, move on.
   The page said none of that — it was six identical floating cards with a list beside them.

   Where the boldness goes: the ward list becomes the round itself. A spine runs down it, filled for the patients
   already seen, hollow for the ones ahead, with the current patient held out from the rail. It carries real
   information (where you are, who is left, who is flagged), so it earns the decoration.

   Everything else gets quieter, so the spine is the thing you notice:
   - the right-hand column stops being a stack of cards and becomes one sheet with hairline bands
   - the readings are the content, so they get the size, in tabular figures that do not wobble between patients
   - out of range is weight and a bar, not colour alone (colour is not readable to everyone, and wards are bright)
   - labels drop the all-caps
   - motion only answers what you did: the spine fills as you move on, a chip scales in when you add it.
     The staggered entrance on every redraw is gone, and nothing moves under prefers-reduced-motion.

   Colour stays inside the portal: the psychologist's violet for the round, the system blue for actions.
   Gated by S.role==='psychologist'; no other role's Rounds is touched. */
(function(){
  const me=()=>S.role==='psychologist';

  const css=document.createElement('style');css.id='pg-rounds-ui-css';
  css.textContent=`
  body.pgr .pr-grid{gap:22px;align-items:start}

  /* ---------- the round, as a route down the ward ---------- */
  /* the rail keeps the base's sticky position (it follows you down the sheet): only its skin changes here */
  body.pgr .pr-queue{background:transparent;border:0;box-shadow:none;padding:4px 0;overflow:visible}
  body.pgr .pr-queue>div:first-child{padding:0 0 10px 30px}
  body.pgr .pr-queue .lbl{font-size:11.5px;letter-spacing:.01em;text-transform:none;color:var(--muted);font-weight:600}
  body.pgr .pr-queue .ebar{display:none}
  body.pgr .pr-queue::before{content:"";position:absolute;left:10.5px;top:34px;bottom:14px;width:3px;border-radius:3px;z-index:0;
    background:linear-gradient(#7f56d9 0 0) no-repeat, #e4e7ec;background-size:100% var(--pgr-walked,0%)}
  body.pgr .pr-q{z-index:1}
  body.pgr .pr-q{position:relative;display:flex;align-items:center;gap:10px;width:100%;
    padding:11px 12px 11px 30px;margin:0;border:0;border-radius:11px;background:transparent;text-align:left;
    transition:background .14s ease,transform .14s ease}
  body.pgr .pr-q:hover{background:#f6f7f9}
  body.pgr .pr-q:focus-visible{outline:2px solid #6941c6;outline-offset:2px}
  body.pgr .pr-q .pr-dot{position:absolute;left:5px;top:50%;margin-top:-7px;width:14px;height:14px;border-radius:50%;
    background:#fff;border:2px solid #d5d9e0;box-shadow:none;transition:border-color .16s ease,background .16s ease}
  body.pgr .pr-q[data-seen] .pr-dot{background:#7f56d9;border-color:#7f56d9}
  body.pgr .pr-q[data-seen]>span:nth-child(2){color:var(--muted)}
  body.pgr .pr-q.on{background:#f7f5ff;transform:translateX(3px)}
  body.pgr .pr-q.on .pr-dot{left:2px;margin-top:-10px;width:20px;height:20px;border-color:#6941c6;border-width:3px;background:#fff}
  body.pgr .pr-q.on>span:nth-child(2){font-weight:700}
  body.pgr .pr-q .pr-tag{margin-left:auto}

  /* ---------- one sheet, not six cards ---------- */
  body.pgr .pr-grid>div:last-child{background:#fff;border:1px solid var(--line);border-radius:16px;overflow:hidden}
  body.pgr .pr-grid>div:last-child>section.card,
  body.pgr .pr-grid>div:last-child>.pr-two{border:0;border-radius:0;box-shadow:none;margin:0}
  body.pgr .pr-grid>div:last-child>.pr-two{border-top:1px solid var(--line)}
  body.pgr .pr-grid>div:last-child>section.card+section.card{border-top:1px solid var(--line)}
  body.pgr .pr-two>section.card,body.pgr .pr-two>div>section.card{border:0;border-radius:0;box-shadow:none}
  body.pgr .pr-two>section.card+section.card{border-left:1px solid var(--line)}
  body.pgr .pg-rp{border-top:1px solid var(--line)!important}
  body.pgr .pr-grid>div:last-child>section.card>h3,
  body.pgr .pr-two section.card>h3{font-size:14.5px;font-weight:700;letter-spacing:-.005em}

  /* ---------- the readings are the content ---------- */
  body.pgr .pr-vit{gap:0;border:1px solid var(--line);border-radius:12px;overflow:hidden;background:#fcfcfd}
  body.pgr .pr-vi{flex:1 1 0;min-width:0;border:0;border-left:1px solid var(--line);border-radius:0;background:transparent;
    padding:12px 14px;position:relative}
  body.pgr .pr-vi:first-child{border-left:0}
  body.pgr .pr-vi .l{font-size:11px;text-transform:none;letter-spacing:.01em;color:var(--muted);font-weight:600}
  body.pgr .pr-vi b{font-size:22px;line-height:1.1;font-weight:650;letter-spacing:-.02em;
    font-variant-numeric:tabular-nums lining-nums;font-feature-settings:"tnum" 1,"lnum" 1}
  body.pgr .pr-vi .ic{opacity:.5}
  /* out of range: weight and a bar down the side, so it does not rely on colour */
  body.pgr .pr-vi.warn,body.pgr .pr-vi.high,body.pgr .pr-vi.bad{background:#fffaf2}
  body.pgr .pr-vi.warn::before,body.pgr .pr-vi.high::before,body.pgr .pr-vi.bad::before{
    content:"";position:absolute;left:0;top:0;bottom:0;width:3px;background:#dc6803}
  body.pgr .pr-vi.warn b,body.pgr .pr-vi.high b,body.pgr .pr-vi.bad b{font-weight:800}

  /* ---------- patient header ---------- */
  body.pgr .pr-head h2{font-size:26px;line-height:1.15;letter-spacing:-.022em;font-weight:700}
  body.pgr .pr-info .l{font-size:11.5px;text-transform:none;letter-spacing:.01em;color:var(--muted);font-weight:600;margin-bottom:3px}

  /* ---------- plan bands ---------- */
  body.pgr .pg-rp .pg-rp-b{padding:18px 20px}
  body.pgr .pg-rp h4{font-size:14.5px;letter-spacing:-.005em}
  body.pgr .pg-rp-chip{animation:pgrChip .18s cubic-bezier(.2,.9,.3,1.3)}
  @keyframes pgrChip{from{opacity:0;transform:scale(.86)}to{opacity:1;transform:none}}

  /* ---------- the bar that ends the round ---------- */
  body.pgr .pr-bar{border-top:1px solid var(--line);border-radius:0}

  /* the generic per-redraw entrance stagger is gone; motion answers an action instead */
  body.pgr .pr-vit,body.pgr .pr-vi,body.pgr .enter,body.pgr .pr-grid [style*="--el"]{
    animation:none!important;opacity:1!important;transform:none!important}
  body.pgr .pr-queue::before{transition:background-size .34s cubic-bezier(.4,0,.2,1)}

  @media (prefers-reduced-motion:reduce){
    body.pgr .pr-q,body.pgr .pr-queue::before,body.pgr .pg-rp-chip{transition:none!important;animation:none!important}
    body.pgr .pr-q.on{transform:none}
  }
  @media (max-width:900px){
    body.pgr .pr-two>section.card+section.card{border-left:0;border-top:1px solid var(--line)}
    body.pgr .pr-vit{flex-wrap:wrap}
    body.pgr .pr-vi{flex:1 1 44%;border-top:1px solid var(--line)}
    body.pgr .pr-vi:first-child,body.pgr .pr-vi:nth-child(2){border-top:0}
    body.pgr .pr-vi:nth-child(odd){border-left:0}
    body.pgr .pr-head h2{font-size:22px}
  }`;
  document.head.appendChild(css);

  /* readings do not count up from zero on every redraw: a number that is still moving cannot be read,
     and nothing the clinician did caused it to move. They are simply there. */
  if(typeof window.psyVitCount==='function'){
    const __vc=window.psyVitCount;
    window.psyVitCount=function(){
      if(me()){document.querySelectorAll('.pr-vit b[data-n]').forEach(el=>{const n=el.firstChild;if(n&&n.nodeType===3)n.nodeValue=el.dataset.n;});return;}
      return __vc.apply(this,arguments);
    };
  }

  /* mark the patients already seen and fill the spine to the one you are on */
  function paint(){
    const on=document.body.classList.toggle('pgr',!!me()&&/^#\/rounds/.test(location.hash||''));
    if(!on)return;
    const q=document.querySelector('.pr-queue');if(!q)return;
    const list=[...q.querySelectorAll('.pr-q')],i=list.findIndex(b=>b.classList.contains('on'));
    list.forEach((b,ix)=>{if(i>=0&&ix<i)b.setAttribute('data-seen','1');else b.removeAttribute('data-seen');});
    const pct=list.length>1&&i>0?Math.round((i/(list.length-1))*100):0;
    q.style.setProperty('--pgr-walked',pct+'%');
  }
  const __r=render;
  render=function(){const out=__r.apply(this,arguments);try{paint();}catch(e){}return out;};
  try{paint();}catch(e){}
})();
