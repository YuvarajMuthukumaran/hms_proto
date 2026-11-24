/* 196 · 24 Nov meeting: consent forms reformatted one by one.
   MECT form (mect-final): the information sheet (pages 1 to 4) is folded behind "Show information sheet";
   the MECT checklist is no longer split over pages 4 and 5 of the scanned form (192 cuts it out of the images),
   it is one on-screen table with Yes / No buttons and the MMSE score. Saved in the same form record
   (`m196<part><row>` = 'y' or 'n', MMSE in `p5f1`); answers from the old on-image boxes are still read. */
(function(){
  const MECT='mect-final';
  const ROWS={
    pre:['Capacity assessment form','Admission consent form signed by patient / NR for IPD patient',
      'MECT education material with consent form signed by patient / NR and two psychiatrists',
      'Anaesthesia consent form signed by patient / NR and one family member (legal guardian)',
      'PAC and pre MECT work-up (routine and special tests, ECG, fundus examination) checked by RMO','MMSE score'],
    peri:['Session 1','Session 2','Session 3','Session 4','Session 5'],
    post:['Vitals','Response monitoring, clinically (behaviour and psychopathology) and objective rating scale','Cognitive deficits, clinical and MMSE']};
  const HEAD={pre:'Pre-ECT assessment',peri:'Peri-MECT assessment',post:'Post-MECT assessment'};
  const OLD={peri:'Peri-MECT',post:'Post-MECT'};
  const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const isMect=()=>String((typeof S!=='undefined'&&S.cdEntryKey)||'').split('|')[1]===MECT;
  const vals=()=>{try{return isMect()?cdfVals(S.cdEntryKey):{};}catch(e){return {};}};
  const get=(v,p,i)=>{const k='m196'+p+(i+1);if(v[k])return v[k];const o=OLD[p];if(o){if(v['m24'+o+i+'y'])return 'y';if(v['m24'+o+i+'n'])return 'n';}return '';};
  function html(ed){
    const v=vals();let done=0,all=0;
    const body=Object.keys(ROWS).map(p=>`<tr class="m196-h"><th colspan="2">${HEAD[p]}${p==='peri'?'<small>Seizure threshold checked by the administering person; any events filled in a separate form</small>':''}</th><th>Yes</th><th>No</th></tr>`
      +ROWS[p].map((t,i)=>{const a=get(v,p,i);all++;if(a)done++;
        const b=(x,l)=>`<button type="button" class="m196-b${a===x?' on '+x:''}"${ed?` onclick="m196Set('${p}',${i},'${x}')"`:' disabled'} aria-pressed="${a===x}">${l}</button>`;
        const mm=p==='pre'&&i===5?` <input class="m196-mm" type="text" inputmode="numeric" placeholder="Score /30" value="${esc(v.p5f1||'')}"${ed?` oninput="cdfSet('p5f1',this.value,null)"`:' disabled'}>`:'';
        return `<tr><td class="n">${i+1}</td><td>${esc(t)}${mm}</td><td>${b('y','Yes')}</td><td>${b('n','No')}</td></tr>`;}).join('')).join('');
    return `<div class="m196-top"><b>MECT checklist</b><span>Filled by the doctor · ${done} of ${all} answered</span></div><table class="m196-t">${body}</table>`;
  }
  window.m196Set=function(p,i,x){if(!isMect())return;const v=vals(),k='m196'+p+(i+1);cdfSet(k,get(v,p,i)===x?'':x,null);
    document.querySelectorAll('.m196-ck').forEach(el=>{el.innerHTML=html(el.dataset.ed==='1');});};

  const css=document.createElement('style');
  css.textContent='.m196-ck{background:#fff;border:1px solid #d0d5dd;border-radius:10px;padding:14px 16px;margin:0 auto 12px;box-sizing:border-box}'
    +'.m196-top{display:flex;justify-content:space-between;align-items:baseline;gap:12px;margin-bottom:8px}.m196-top b{font-size:15px}.m196-top span{font-size:12.5px;color:#667085}'
    +'.m196-t{width:100%;border-collapse:collapse;font-size:13.5px}.m196-t td,.m196-t th{border-bottom:1px solid #eaecf0;padding:7px 8px;text-align:left;vertical-align:middle}'
    +'.m196-t td.n{width:22px;color:#667085}.m196-t td:nth-child(3),.m196-t td:nth-child(4),.m196-h th:nth-child(2),.m196-h th:nth-child(3){width:62px;text-align:center}'
    +'.m196-h th{background:#f2f4f7;font-weight:700;color:#101828}.m196-h th small{display:block;font-weight:400;color:#475467;font-size:12px;margin-top:2px}'
    +'.m196-b{border:1px solid #d0d5dd;background:#fff;border-radius:6px;padding:4px 10px;font:inherit;font-size:12.5px;cursor:pointer;min-width:46px}'
    +'.m196-b.on.y{background:#dcfae6;border-color:#47cd89;color:#067647;font-weight:700}.m196-b.on.n{background:#fee4e2;border-color:#f97066;color:#b42318;font-weight:700}.m196-b:disabled{cursor:default}'
    +'.m196-mm{margin-left:10px;width:96px;padding:4px 8px;border:1px solid #d0d5dd;border-radius:6px;font:inherit;font-size:13px}'
    +'.m196-fb{display:flex;justify-content:space-between;align-items:center;gap:12px;background:#f8f9fc;border:1px solid #d0d5dd;border-radius:10px;padding:10px 14px;margin:0 auto 12px;box-sizing:border-box;font-size:13.5px}'
    +'.m196-fb button{border:1px solid #d0d5dd;background:#fff;border-radius:6px;padding:5px 12px;font:inherit;cursor:pointer}'
    +'.m196-fold.m196-shut{display:none!important}'
    +'@media print{.m196-fold.m196-shut{display:block!important}.m24-mh.m196-fold.m196-shut{display:flex!important}.m196-fb{display:none}.m196-b:not(.on){opacity:.5}}';
  document.head.appendChild(css);

  const pageOf=img=>+((img.getAttribute('src')||'').match(/p(\d+)\.png/)||[])[1];
  function fix(){
    const imgs=[...document.querySelectorAll('.cdf-page>img[src*="forms/mect-final/p"]')];if(!imgs.length)return;
    const boxes=new Set(imgs.map(i=>i.parentElement.parentNode));
    boxes.forEach(box=>{
      const pages=[...box.children].filter(c=>c.classList.contains('cdf-page')&&c.querySelector('img[src*="forms/mect-final/p"]'));
      const p1=pages.find(pg=>pageOf(pg.querySelector('img'))===1),p5=pages.find(pg=>pageOf(pg.querySelector('img'))===5);
      const w=(p1||pages[0]).style.width||'';
      const ed=!!box.querySelector('.cdf-f:not(.cdf-ro)')&&isMect();
      /* fold pages 1 to 4 */
      const open=box.dataset.m196open==='1';
      pages.forEach(pg=>{const n=pageOf(pg.querySelector('img'));if(n>=1&&n<=4){const els=[pg];const h=pg.previousElementSibling;if(h&&h.classList.contains('m24-mh'))els.push(h);
        els.forEach(e=>{e.classList.add('m196-fold');e.classList.toggle('m196-shut',!open);});}});
      if(p1&&!box.querySelector(':scope>.m196-fb')){const fb=document.createElement('div');fb.className='m196-fb';fb.style.width=w;
        const h=p1.previousElementSibling&&p1.previousElementSibling.classList.contains('m24-mh')?p1.previousElementSibling:p1;
        fb.innerHTML='<span><b>Information sheet</b> · pages 1 to 4, read only, for the patient and family</span><button type="button">'+(open?'Hide':'Show')+' information sheet</button>';
        fb.querySelector('button').onclick=()=>{box.dataset.m196open=box.dataset.m196open==='1'?'0':'1';fix();fb.querySelector('button').textContent=(box.dataset.m196open==='1'?'Hide':'Show')+' information sheet';};
        box.insertBefore(fb,h);}
      /* the checklist, before the anaesthesia consent */
      if(p5&&!box.querySelector(':scope>.m196-ck')){const ck=document.createElement('div');ck.className='m196-ck';ck.style.width=w;ck.dataset.ed=ed?'1':'0';ck.innerHTML=html(ed);
        const h=p5.previousElementSibling&&p5.previousElementSibling.classList.contains('m24-mh')?p5.previousElementSibling:p5;box.insertBefore(ck,h);}
    });
  }
  let q=0;const later=()=>{if(!q)q=requestAnimationFrame(()=>{q=0;try{fix();}catch(e){}});};
  try{new MutationObserver(later).observe(document.body,{childList:true,subtree:true});}catch(e){}
  later();
})();
