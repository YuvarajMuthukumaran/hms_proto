/* 21 Nov 2026, owner: "make discharge summary one page 'Discharge Summary'; inside it a nav bar; every component one tab reachable from the nav bar".
   The patient tab "Discharge summary" is now the only discharge tab (block 168's separate "Discharge checklist" patient tab is hidden).
   Inside it, a tab bar: Summary, Discharge type, Therapy plan, Medications, Discharge plan, Grievances, Checklist, Readiness, Sign-off.
   Block 146 still builds the pieces; this block moves each piece into its own panel and shows one at a time.
   Address: #/patient/<id>/discharge/<tab> (summary, type, therapy, meds, plan, griev, checklist, ready, sign); /checklist keeps working.
   Roles with block 146's Discharge tab: psychiatrist, floor lead psychiatrist, psychologist, floor lead psychologist. */
(function(){
  const ROLE=String((window.__TULASI__||{}).role||'');
  if(!/^(psychiatrist|floor-lead-psychiatrist|psychologist|floor-lead-psychologist)$/.test(ROLE))return;
  const route=()=>{const m=String(location.hash||'').match(/^#\/patient\/([^/?]+)(?:\/([^/?]+))?(?:\/([^/?]+))?/);return m?{pid:decodeURIComponent(m[1]),sub:m[2]||'',part:m[3]||''}:{pid:'',sub:'',part:''};};
  const KEYS=['summary','type','therapy','meds','plan','griev','checklist','ready','sign'];
  const LABEL={summary:'Summary',type:'Discharge type',therapy:'Therapy plan',meds:'Medications',plan:'Discharge plan',griev:'Grievances',checklist:'Checklist',ready:'Readiness',sign:'Sign-off'};
  let DT='summary';
  const css=document.createElement('style');
  css.textContent='[data-dcck]{display:none!important}'+
    '.m20n{display:flex;align-items:flex-end;gap:2px;border-bottom:1px solid #e4e7ec;margin:0 0 14px;overflow-x:auto}'+
    '.m20n .m20n-t{background:none;border:0;border-bottom:2px solid transparent;margin-bottom:-1px;padding:10px 14px;font:inherit;font-size:14px;font-weight:600;color:#475467;cursor:pointer;white-space:nowrap;min-height:42px}'+
    '.m20n .m20n-t.on{color:#175cd3;border-bottom-color:#175cd3}.m20n .m20n-c{margin-left:6px;font-size:12px;font-weight:600;color:#667085}'+
    '.m20n .m20n-sp{flex:1}.m20n .btn{margin:0 0 6px 8px;white-space:nowrap}'+
    '.m20p{display:flex;flex-direction:column;gap:14px}.m20p>section.card{margin:0!important;min-width:0}';
  document.head.appendChild(css);

  function show(wrap,k){
    if(!wrap.querySelector('.m20p[data-k="'+k+'"]')){const f=wrap.querySelector('.m20p');k=f?f.dataset.k:k;}
    DT=k;
    wrap.querySelectorAll('.m20n-t').forEach(b=>{const on=b.dataset.k===k;b.classList.toggle('on',on);b.setAttribute('aria-selected',String(on));});
    wrap.querySelectorAll('.m20p').forEach(p=>{p.style.display=p.dataset.k===k?'':'none';});
  }
  window.m20DcTab=function(t){
    const w=document.getElementById('m20Dc');if(!w)return;
    const k=t==='chk'?'checklist':(t==='sum'?'summary':t);
    if(KEYS.indexOf(k)<0)return;
    show(w,k);const r=route();
    try{history.replaceState(null,'','#/patient/'+encodeURIComponent(r.pid)+'/discharge/'+k);}catch(e){}
  };

  function paint(){
    const {pid,sub,part}=route();if(!pid||sub!=='discharge')return;
    const v=document.getElementById('view');if(!v)return;
    const wrap=v.querySelector('#m20Dc');if(!wrap)return;
    const bar=v.querySelector('.ws-mid > .subtabs')||v.querySelector('.subtabs');
    if(bar){[...bar.querySelectorAll('button')].forEach(b=>{if(b.dataset.dcck)return;if(/^Discharge/.test(b.textContent.trim())){b.classList.add('on');b.setAttribute('aria-selected','true');}});}
    if(wrap.dataset.m20n){show(wrap,KEYS.indexOf(part)>=0?part:DT);return;}
    wrap.dataset.m20n='1';
    const S1=wrap.querySelector('#m20SumT'),S2=wrap.querySelector('#m20ChkT');
    const col=wrap.querySelector('#m20SumCol');
    const sumCard=col?col.querySelector(':scope > section.card'):null;
    const griev=col?col.querySelector(':scope > .m20-griev'):null;
    const roleC=wrap.querySelector('#m20Role'),rdy=wrap.querySelector('#dcAuto');
    const sign=S2?[...S2.children].filter(e=>e!==roleC&&e!==rdy):[];
    const P={
      summary:[sumCard],
      type:[wrap.querySelector('#m20Type')],
      therapy:[wrap.querySelector('#dcTh')||wrap.querySelector('#m20Th')],
      meds:[wrap.querySelector('#m20Meds')],
      plan:[wrap.querySelector('#dcPlan')],
      griev:[griev],
      checklist:[roleC],
      ready:[rdy],
      sign:sign
    };
    const pages=document.createElement('div');
    const tabs=[];
    KEYS.forEach(k=>{
      const els=(P[k]||[]).filter(Boolean);if(!els.length)return;
      const p=document.createElement('div');p.className='m20p';p.dataset.k=k;els.forEach(e=>p.appendChild(e));pages.appendChild(p);tabs.push(k);
    });
    const c=typeof window.m20DcCount==='function'?window.m20DcCount(pid):null;
    const nav=document.createElement('div');nav.className='m20n';nav.setAttribute('role','tablist');
    nav.innerHTML=tabs.map(k=>`<button type="button" class="m20n-t" role="tab" data-k="${k}">${LABEL[k]}${k==='checklist'&&c?`<span class="m20n-c">${c[0]}/${c[1]}</span>`:''}</button>`).join('')+
      `<span class="m20n-sp"></span><button type="button" class="btn pri sm" onclick="m20Pdf('${String(pid).replace(/\\/g,'\\\\').replace(/'/g,"\\'")}')">Download PDF</button>`;
    nav.addEventListener('click',e=>{const b=e.target.closest('.m20n-t');if(b)window.m20DcTab(b.dataset.k);});
    if(S1)S1.style.display='none';if(S2)S2.style.display='none';
    wrap.appendChild(nav);wrap.appendChild(pages);
    wrap.insertBefore(nav,wrap.firstChild);
    show(wrap,tabs.indexOf(part)>=0?part:(tabs.indexOf(DT)>=0&&part?DT:'summary'));
  }
  const __r=render;
  render=function(){const o=__r.apply(this,arguments);try{paint();}catch(e){try{console.warn('discharge one page',e);}catch(_){}}return o;};
})();
