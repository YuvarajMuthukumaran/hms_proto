/* 20 Nov 2026 (owner, screenshot). Psychiatrist and floor lead psychiatrist; the same for psychologist and floor lead psychologist (owner, later 20 Nov:
   their own plan, psyx.mgmtPsych, opens at Step 5).
   The Management Plan is no longer its own patient tab: it is Step 5 of Admission, right after Step 4 Detailed history,
   and Form C (independent admission) becomes Step 6. Choosing Step 5 shows the management plan inside the Admission tab.
   Old links to #/patient/<id>/plans (dashboards, Discharge "Open management plan") open Admission at Step 5. */
(function(){
  const ROLE=String((window.__TULASI__||{}).role||'');
  if(!/^(psychiatrist|floor-lead-psychiatrist|psychologist|floor-lead-psychologist|rmo)$/.test(ROLE))return;
  const PSG=/psycholog/.test(ROLE);
  const E=s=>hesc(String(s==null?'':s));
  const pidNow=()=>{const m=String(location.hash||'').match(/^#\/patient\/([^/?]+)/);return m?decodeURIComponent(m[1]):'';};

  /* the tab goes */
  const dropTab=()=>{try{const i=STAY.findIndex(x=>x[0]==='plans');if(i>=0)STAY.splice(i,1);}catch(e){}};
  dropTab();

  function status(pid){
    let x={};try{x=psyPx(pid)||{};}catch(e){}
    /* the psychiatrist's plan record (block 54: psyMpSign sets mgmt.signed) */
    const mp=(PSG?x.mgmtPsych:x.mgmt)||{},signed=!!mp.signed;
    const started=signed||Object.keys(mp).some(k=>k!=='signed'&&k!=='add'&&mp[k]&&String(mp[k]).trim());
    return signed?['done','✓','Signed'+(mp.signed&&mp.signed.at?' '+String(mp.signed.at).split(',')[0]:'')]:started?['warn','5','In progress']:['','5','Not started'];
  }

  if(typeof pAdmission==='function'){
    const __pa=pAdmission;
    pAdmission=function(){
      const mine=S.admSec==='mplan';
      if(mine)S.admSec='hist';
      let h;try{h=__pa.apply(this,arguments);}finally{if(mine)S.admSec='mplan';}
      if(typeof h!=='string')return h;
      try{
        const t=document.createElement('template');t.innerHTML=h;
        const ol=t.content.querySelector('ol.adm-steps');if(!ol)return h;
        const lis=[...ol.children];
        const fc=lis.find(l=>/admSec='formc'/.test((l.querySelector('button')||{}).getAttribute?l.querySelector('button').getAttribute('onclick')||'':''));
        const hist=lis.find(l=>/admSec='hist'/.test((l.querySelector('button')||{}).getAttribute?l.querySelector('button').getAttribute('onclick')||'':''));
        if(!hist)return h;
        const [cls,num,st]=status(pidNow()||S.pid);
        const li=document.createElement('li');
        li.className=`adm-step ${cls} ${mine?'sel':''} ${hist.classList.contains('done')?'prevdone':''}`;
        li.innerHTML=`<button onclick="S.admSec='mplan';render()" aria-current="${mine?'step':'false'}" title="Management plan: written after the detailed history"><span class="adm-n">${num}</span><span class="adm-k">Step 5</span><span class="adm-t">Management plan</span><span class="adm-s">${E(st)}</span></button>`;
        hist.after(li);
        if(fc){
          const k=fc.querySelector('.adm-k');if(k)k.textContent='Step 6';
          const n=fc.querySelector('.adm-n');if(n&&n.textContent.trim()!=='✓')n.textContent='6';
          fc.classList.toggle('prevdone',cls==='done');
        }
        if(mine){
          lis.forEach(l=>{l.classList.remove('sel');const b=l.querySelector('button');if(b)b.setAttribute('aria-current','false');});
          /* the step's own content: the management plan page */
          let n=ol.nextSibling;while(n){const nx=n.nextSibling;n.remove();n=nx;}
          let ph='';try{ph=pPlans();}catch(e){ph='<section class="card pad small muted">The management plan could not be opened here.</section>';}
          const box=document.createElement('template');box.innerHTML=ph;ol.after(box.content);
        }
        return t.innerHTML;
      }catch(e){return h;}
    };
  }

  const __r=render;
  render=function(){
    dropTab();
    /* old links to the Management Plan tab open Admission, Step 5 */
    const m=String(location.hash||'').match(/^#\/patient\/([^/?]+)\/plans/);
    if(m){S.admSec='mplan';history.replaceState(null,'','#/patient/'+m[1]+'/admission');}
    const o=__r.apply(this,arguments);
    /* block 54 puts the tab back into the list on each render, so its button is removed from the drawn tab bar */
    try{document.querySelectorAll('#view .subtabs button').forEach(b=>{if(/\/plans'\)/.test(b.getAttribute('onclick')||'')||/^Management Plan$/i.test(b.textContent.trim()))b.remove();});}catch(e){}
    return o;
  };
})();
