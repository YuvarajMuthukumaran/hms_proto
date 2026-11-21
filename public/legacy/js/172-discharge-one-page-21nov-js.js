/* 21 Nov 2026, owner: second bar = "Discharge summary" and "Discharge checklist" (block 168); third bar, inside Discharge summary, = its contents.
   Block 146 builds the pieces; this block moves each into its own panel. Third bar: Summary, Discharge type, Therapy plan, Medications,
   Discharge plan, Grievances (+ Download PDF). The Discharge checklist page shows the role checklist, readiness and sign-off, with no third bar.
   Address: #/patient/<id>/discharge/<summary|type|therapy|meds|plan|griev> or .../discharge/checklist.
   Roles with block 146's Discharge tab: psychiatrist, floor lead psychiatrist, psychologist, floor lead psychologist. */
(function(){
  const ROLE=String((window.__TULASI__||{}).role||'');
  if(!/^(psychiatrist|floor-lead-psychiatrist|psychologist|floor-lead-psychologist)$/.test(ROLE))return;
  const route=()=>{const m=String(location.hash||'').match(/^#\/patient\/([^/?]+)(?:\/([^/?]+))?(?:\/([^/?]+))?/);return m?{pid:decodeURIComponent(m[1]),sub:m[2]||'',part:m[3]||''}:{pid:'',sub:'',part:''};};
  const KEYS=['summary','type','therapy','meds','plan','griev'];
  const CHK=['checklist','ready','sign'];
  const LABEL={summary:'Summary',type:'Discharge type',therapy:'Therapy plan',meds:'Medications',plan:'Discharge plan',griev:'Grievances'};
  let DT='summary';
  const css=document.createElement('style');
  css.textContent=
    '.m20n{display:flex;align-items:center;gap:4px;background:#f2f4f7;border-radius:12px;padding:4px;margin:0 0 16px;overflow-x:auto;scrollbar-width:none}.m20n::-webkit-scrollbar{display:none}'+
    '.m20n .m20n-t{background:transparent;border:0;border-radius:9px;padding:8px 16px;font:inherit;font-size:13.5px;font-weight:600;color:#667085;cursor:pointer;white-space:nowrap;min-height:36px;transition:background .15s,color .15s,box-shadow .15s}'+
    '.m20n .m20n-t:hover{color:#175cd3}.m20n .m20n-t:focus-visible{outline:2px solid #175cd3;outline-offset:1px}'+
    '.m20n .m20n-t.on{background:#fff;color:#175cd3;box-shadow:0 1px 2px rgba(16,24,40,.14),0 0 0 1px rgba(16,24,40,.04)}'+
    '.m20n .m20n-sp{flex:1}.m20n .btn{white-space:nowrap;flex:0 0 auto}'+
    '.m20p{display:flex;flex-direction:column;gap:14px}.m20p>section.card{margin:0!important;min-width:0}'+
    '@media(prefers-reduced-motion:reduce){.m20n .m20n-t{transition:none}}';
  document.head.appendChild(css);

  function show(wrap,k){
    const chk=CHK.indexOf(k)>=0;
    if(!chk&&!wrap.querySelector('.m20p[data-k="'+k+'"]')){const f=wrap.querySelector('.m20p[data-g="s"]');k=f?f.dataset.k:k;}
    if(!chk)DT=k;
    const nav=wrap.querySelector('.m20n');if(nav)nav.style.display=chk?'none':'';
    wrap.querySelectorAll('.m20n-t').forEach(b=>{const on=b.dataset.k===k;b.classList.toggle('on',on);b.setAttribute('aria-selected',String(on));});
    wrap.querySelectorAll('.m20p').forEach(p=>{p.style.display=(chk?p.dataset.g==='c':p.dataset.k===k)?'':'none';});
  }
  window.m20DcTab=function(t){
    const r=route();if(!r.pid)return;
    if(t==='chk'||t==='checklist'){go('#/patient/'+encodeURIComponent(r.pid)+'/discharge/checklist');return;}
    const k=t==='sum'?'summary':t;
    if(KEYS.indexOf(k)<0)return;
    if(r.part==='checklist'){go('#/patient/'+encodeURIComponent(r.pid)+'/discharge/'+k);return;}
    const w=document.getElementById('m20Dc');if(!w)return;
    show(w,k);
    try{history.replaceState(null,'','#/patient/'+encodeURIComponent(r.pid)+'/discharge/'+k);}catch(e){}
  };

  function paint(){
    const {pid,sub,part}=route();if(!pid||sub!=='discharge')return;
    const v=document.getElementById('view');if(!v)return;
    const wrap=v.querySelector('#m20Dc');if(!wrap)return;
    if(wrap.dataset.m20n){show(wrap,part==='checklist'?'checklist':(KEYS.indexOf(part)>=0?part:DT));return;}
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
    KEYS.concat(CHK).forEach(k=>{
      const els=(P[k]||[]).filter(Boolean);if(!els.length)return;
      const p=document.createElement('div');p.className='m20p';p.dataset.k=k;p.dataset.g=CHK.indexOf(k)>=0?'c':'s';els.forEach(e=>p.appendChild(e));pages.appendChild(p);if(CHK.indexOf(k)<0)tabs.push(k);
    });
    const nav=document.createElement('div');nav.className='m20n';nav.setAttribute('role','tablist');
    nav.innerHTML=tabs.map(k=>`<button type="button" class="m20n-t" role="tab" data-k="${k}">${LABEL[k]}</button>`).join('')+
      `<span class="m20n-sp"></span><button type="button" class="btn pri sm" onclick="m20Pdf('${String(pid).replace(/\\/g,'\\\\').replace(/'/g,"\\'")}')">Download PDF</button>`;
    nav.addEventListener('click',e=>{const b=e.target.closest('.m20n-t');if(b)window.m20DcTab(b.dataset.k);});
    if(S1)S1.style.display='none';if(S2)S2.style.display='none';
    wrap.appendChild(pages);wrap.insertBefore(nav,wrap.firstChild);
    show(wrap,part==='checklist'?'checklist':(tabs.indexOf(part)>=0?part:'summary'));
  }
  const __r=render;
  render=function(){const o=__r.apply(this,arguments);try{paint();}catch(e){try{console.warn('discharge one page',e);}catch(_){}}return o;};
})();
