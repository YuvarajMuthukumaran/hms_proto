/* 25 Nov 2026 meeting: "copy the content and make a new form with the Tulasi logo... looks more digital, not a copy of the PDF".
   Every consent form page (.cdf-page with a forms/<id>/pN.png image) is redrawn in place as an on-screen page: Tulasi header with
   the logo, the form's own words as headings, paragraphs and rows (from /legacy/data/forms-text.json, made by
   tools/build_forms_text.py from the source PDFs, with the same crops and label edits the portal made to the images), and the
   form's existing blanks, choice buttons, ticks and signatures moved into those rows. The blanks are the same elements, so typing,
   autofill (197), gating (199), e-sign (141) and saving work as before; nothing new is saved. "Show paper layout" puts the scanned
   page back (remembered in localStorage m204_paper). Generate PDF still prints the paper pages. All roles. */
(function(){
  const FIDS=['admission-consent','adm-terms','high-risk-consent','form-c','form-e','clozapine-consent','outing-consent','lama-consent','discharge-consent','referral-consultation','reassessment','mect-final'];
  const E=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let T=null,loading=false;
  const paper=()=>{try{return localStorage.getItem('m204_paper')==='1';}catch(e){return false;}};
  const load=()=>{if(T||loading)return;loading=true;fetch('/legacy/data/forms-text.json?v=204').then(r=>r.json()).then(j=>{T=j;scan();}).catch(()=>{loading=false;});};
  const K=()=>(typeof CDF_K!=='undefined'?CDF_K:1.45);
  const title=fid=>{try{const f=(CD_FORMS||[]).find(x=>x.id===fid);if(f&&f.title)return f.title;}catch(e){}return fid.replace(/-/g,' ');};
  const LEAD=/^[._…\-–—=:]{2,}$/;
  const clean=t=>t.replace(/[._…]{3,}/g,' ').replace(/[-–—]{3,}/g,' ').replace(/_{2,}/g,' ').trim();
  function pageOf(pg){const im=pg.querySelector(':scope>img');const m=im&&(im.getAttribute('src')||'').match(/forms\/([a-z-]+)\/p(\d+)\.png/);if(!m||!FIDS.includes(m[1]))return null;return {fid:m[1],n:m[2],img:im};}
  /* one page: words and the page's own elements in rows, top to bottom */
  function convert(pg,info){
    const W=(T[info.fid]||{})[info.n];if(!W)return false;const k=K();
    const els=[...pg.children].filter(el=>el!==info.img&&el.style&&el.style.left&&el.style.top);
    const box=el=>{const x=parseFloat(el.style.left)/k,y=parseFloat(el.style.top)/k,w=(parseFloat(el.style.width)||el.offsetWidth||20)/k,h=(parseFloat(el.style.height)||el.offsetHeight||14)/k;return {x,y,w,h};};
    const items=els.map(el=>Object.assign(box(el),{el}));
    const words=[];
    W.forEach(w=>{let t=w[4];if(LEAD.test(t))return;t=clean(t);if(!t)return;
      const cx=(w[0]+w[2])/2,cy=(w[1]+w[3])/2;
      const hit=items.find(it=>cx>=it.x-1&&cx<=it.x+it.w+1&&cy>=it.y-2&&cy<=it.y+it.h+2);
      if(hit&&hit.el.matches(".cdf-opt,.cdf-chk")){hit.lab=(hit.lab?hit.lab+" ":"")+t;return;}
      words.push({x:w[0],y:w[1],w:w[2]-w[0],h:w[3]-w[1],t,b:w[5],s:w[6]});});
    items.forEach(it=>{if(it.lab&&it.el.matches('.cdf-opt')&&!it.el.textContent.trim())it.el.dataset.m204l=it.lab;});
    const all=words.concat(items).sort((a,b)=>a.y-b.y||a.x-b.x);
    if(!all.length)return false;
    /* rows: things that overlap in height; a tall box is a row by itself */
    const rows=[];
    all.forEach(o=>{const tall=o.el&&o.h>22&&!o.el.matches('img');const r=rows[rows.length-1];
      if(r&&!tall&&!r.tall&&o.y<r.y1-Math.min(4,(r.y1-r.y0)*.35)){r.a.push(o);r.y1=Math.max(r.y1,o.y+Math.min(o.h,16));}
      else rows.push({a:[o],y0:o.y,y1:o.y+Math.min(o.h,16),tall});});
    const L=Math.min(...all.map(o=>o.x)),R=Math.max(...all.map(o=>o.x+o.w)),mid=(L+R)/2;
    const out=rows.map(r=>{r.a.sort((a,b)=>a.x-b.x);const parts=[];let last=null;
      r.a.forEach(o=>{if(!o.el&&last&&!last.el&&o.x-(last.x+last.w)<12){last.t+=' '+o.t;last.w=o.x+o.w-last.x;last.b=last.b&&o.b;last.s=Math.max(last.s,o.s);return;}
        const c=Object.assign({},o);parts.push(c);last=c;});
      const txt=parts.every(p=>!p.el),x0=parts[0].x,x1=parts[parts.length-1].x+parts[parts.length-1].w;
      const head=txt&&parts.every(p=>p.b)&&parts.map(p=>p.t).join(' ').length<90;
      const big=txt&&parts.some(p=>p.s>=11.5);
      const centre=txt&&Math.abs((x0+x1)/2-mid)<18&&(x1-x0)<(R-L)*.7&&(x0-L)>30;
      return {parts,txt,x0,x1,y0:r.y0,y1:r.y1,head:head||big,big,centre,s:Math.max(...parts.map(p=>p.s||10))};});
    /* text rows that continue a paragraph are joined */
    const rs=[];out.forEach(r=>{const p=rs[rs.length-1];
      if(p&&p.txt&&r.txt&&!p.head&&!r.head&&!p.centre&&!r.centre&&r.parts.length===1&&p.parts.length===1&&p.x1>R-70&&r.x0>=p.x0-3&&r.x0<=p.x0+28&&r.y0-p.y1<p.s*1.4){
        p.parts[0].t+=' '+r.parts[0].t;p.x1=r.x1;p.y1=r.y1;return;}
      rs.push(r);});
    const flow=document.createElement('div');flow.className='m204-flow';
    rs.forEach(r=>{const d=document.createElement('div');d.className='m204-r'+(r.head?' h':'')+(r.big?' big':'')+(r.centre?' c':'')+(r.txt&&!r.head?' p':'');
      d.dataset.y=r.y0;if(!r.centre)d.style.paddingLeft=Math.min(150,Math.max(0,(r.x0-L)*.9))+'px';
      let prev=null;r.parts.forEach(p=>{if(prev){const g=p.x-(prev.x+prev.w);if(g>28){const s=document.createElement('span');s.className='m204-gap';s.style.flexBasis=Math.min(48,g*.4)+'px';d.appendChild(s);}}
        if(p.el){p.el.classList.add('m204-e');p.el.setAttribute('data-fit','1');p.el.style.removeProperty('font-size');p.el.style.removeProperty('line-height');d.appendChild(p.el);if(p.el.matches('textarea'))d.classList.add('tb');}
        else{const s=document.createElement('span');s.className='m204-t'+(p.b&&!r.head?' b':'');s.textContent=p.t;d.appendChild(s);}prev=p;});
      flow.appendChild(d);});
    pg.classList.add('m204');pg.dataset.m204='1';
    /* the Tulasi header on the first page of the form */
    const pv=pg.previousElementSibling;const first=!(pv&&pv.classList.contains('cdf-page')&&pageOf(pv)&&pageOf(pv).fid===info.fid);
    if(first){const h=document.createElement('div');h.className='m204-hd';
      h.innerHTML=`<img src="/logo.png" alt="Tulasi Healthcare"><div><b>Tulasi Healthcare</b><span>Sector-64, Opp: M3M Urbana, Gurgaon - 122102 · 2/6 Sarvpriya Vihar, New Delhi - 110016 · Appointments 8800000255</span></div><em>${E(title(info.fid))}</em>`;
      flow.prepend(h);}
    pg.appendChild(flow);
    /* elements other blocks add to the page later (e-signatures, ticks) go into the nearest row */
    new MutationObserver(ms=>ms.forEach(m=>m.addedNodes.forEach(n=>{if(n.nodeType!==1||n.parentNode!==pg||n===flow||!n.style||!n.style.top)return;
      const y=parseFloat(n.style.top)/K();let best=null,bd=1e9;flow.querySelectorAll('.m204-r').forEach(r=>{const dd=Math.abs(+r.dataset.y-y);if(dd<bd){bd=dd;best=r;}});
      n.classList.add('m204-e');(best||flow).appendChild(n);}))).observe(pg,{childList:true});
    return true;
  }
  function restore(pg){const f=pg.querySelector(':scope>.m204-flow');if(f){f.querySelectorAll('.m204-e').forEach(el=>{el.classList.remove('m204-e');el.removeAttribute('data-fit');pg.appendChild(el);});f.remove();}
    pg.classList.remove('m204');pg.dataset.m204='paper';}
  function bar(pg,on){const p=pg.parentNode;if(!p||p.querySelector(':scope>.m204-bar'))return;const b=document.createElement('div');b.className='m204-bar';
    b.innerHTML=on?'<span>On-screen form · same blanks and signatures as the paper form</span><button type="button" onclick="m204Paper(1)">Show paper layout</button>':'<span>Paper layout</span><button type="button" onclick="m204Paper(0)">Show on-screen form</button>';
    const firstPg=p.querySelector(':scope>.cdf-page');p.insertBefore(b,firstPg&&firstPg.parentNode===p?firstPg:p.firstChild);}
  function scan(){
    const pgs=[...document.querySelectorAll('.cdf-page:not([data-m204])')].map(pg=>[pg,pageOf(pg)]).filter(x=>x[1]);
    if(!pgs.length)return;if(!T){load();return;}const pp=paper();
    pgs.forEach(([pg,info])=>{if(pp){pg.dataset.m204='paper';bar(pg,false);return;}
      try{if(convert(pg,info))bar(pg,true);else pg.dataset.m204='none';}catch(e){pg.dataset.m204='none';}});
  }
  window.m204Paper=function(v){try{localStorage.setItem('m204_paper',v?'1':'0');}catch(e){}
    document.querySelectorAll('.m204-bar').forEach(b=>b.remove());
    document.querySelectorAll('.cdf-page[data-m204]').forEach(pg=>{if(v){if(pg.dataset.m204==='1')restore(pg);else pg.dataset.m204='paper';}else pg.removeAttribute('data-m204');});
    if(v)document.querySelectorAll('.cdf-page[data-m204="paper"]').forEach(pg=>{if(pageOf(pg))bar(pg,false);});else scan();};
  const cs=document.createElement('style');
  cs.textContent='.cdf-page.m204{width:100%!important;max-width:880px;height:auto!important;background:#fff;border:1px solid #dfe5ee;border-radius:12px;box-shadow:0 1px 3px rgba(16,24,40,.06);padding:22px 28px 26px;box-sizing:border-box;margin-bottom:14px}'
    +'[style*="max-content"]:has(>.cdf-page.m204){width:auto!important}'
    +'.cdf-page.m204>img{display:none!important}.cdf-page.m204>span{display:none}'
    +'.m204-flow{display:flex;flex-direction:column;gap:7px;font-size:14.5px;line-height:1.55;color:#1d2939}'
    +'.m204-hd{display:grid;grid-template-columns:auto 1fr;gap:4px 14px;align-items:center;border-bottom:2px solid #1e6cdb;padding-bottom:12px;margin-bottom:10px}.m204-hd img{height:46px}.m204-hd>div{display:flex;flex-direction:column;gap:2px}.m204-hd b{font-size:17px;color:#0b4a8f}.m204-hd span{font-size:12px;color:#667085}.m204-hd em{grid-column:1/-1;font-style:normal;font-size:12.5px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#1e6cdb;margin-top:6px}'
    +'.m204-r{display:flex;flex-wrap:wrap;align-items:center;gap:6px 8px;min-height:22px}.m204-r.p{display:block}.m204-r.c{justify-content:center;text-align:center}'
    +'.m204-r.h{font-weight:700;color:#0b4a8f;font-size:15px;margin-top:8px}.m204-r.h.big{font-size:17px}.m204-r.tb{display:block}.m204-t.b{font-weight:700}.m204-gap{flex:0 0 24px}'
    +'.m204 .m204-e{position:static!important;left:auto!important;top:auto!important;transform:none!important}'
    +'.m204 input.m204-e,.m204 select.m204-e,.m204 div.cdf-line.m204-e{flex:1 1 150px;min-width:140px;max-width:100%;width:auto!important;height:32px!important;font-size:14px!important;padding:4px 9px;border:1px solid #b9d3f5!important;border-radius:7px;background:#f5f9ff!important;box-sizing:border-box;line-height:22px}'
    +'.m204 textarea.m204-e,.m204 div.cdf-box.m204-e{display:block;width:100%!important;min-height:72px;height:auto!important;font-size:14px!important;padding:7px 10px;border:1px solid #b9d3f5!important;border-radius:8px;background:#f5f9ff!important;box-sizing:border-box;margin-top:4px}'
    +'.m204 .cdf-opt.m204-e{width:auto!important;height:auto!important;min-width:44px;padding:4px 12px;border:1px solid #d0d5dd!important;border-radius:99px;background:#fff!important;font-size:13.5px!important;color:#344054;cursor:pointer}.m204 .cdf-opt.m204-e[data-m204l]::after{content:attr(data-m204l)}.m204 .cdf-opt.m204-e.on{background:#eef4ff!important;border-color:#1e6cdb!important;color:#1849a9;font-weight:700}'
    +'.m204 .cdf-chk.m204-e{width:22px!important;height:22px!important;flex:0 0 22px;border:1.5px solid #98a2b3!important;border-radius:5px;background:#fff!important;font-size:14px!important;line-height:18px;padding:0}.m204 .cdf-chk.m204-e.on{background:#1e6cdb!important;border-color:#1e6cdb!important;color:#fff}'
    +'.m204 .m204-e[style*="visibility: hidden"]{display:none!important}'
    +'.m204 img.m204-e{max-height:64px;width:auto!important;height:auto!important;max-width:240px}'
    +'.m204-bar{display:flex;justify-content:space-between;align-items:center;gap:12px;max-width:880px;background:#f8f9fc;border:1px solid #d0d5dd;border-radius:10px;padding:8px 14px;margin:0 0 12px;box-sizing:border-box;font-size:13px;color:#475467}.m204-bar button{border:1px solid #d0d5dd;background:#fff;border-radius:6px;padding:5px 12px;font:inherit;cursor:pointer;white-space:nowrap}'
    +'@media print{.m204-bar{display:none}.cdf-page.m204{box-shadow:none;border:0;max-width:none}}';
  document.head.appendChild(cs);
  let t=0;new MutationObserver(()=>{clearTimeout(t);t=setTimeout(()=>{try{scan();}catch(e){}},60);}).observe(document.documentElement,{childList:true,subtree:true});
  setTimeout(scan,300);
})();
