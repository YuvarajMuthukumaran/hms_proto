/* 196 · 24 Nov meeting: consent forms reformatted one by one (all roles that open these forms).
   Each form: read-only pages folded behind a "Show" bar, checklists cut out of the scanned pages and shown as one
   on-screen table, saved in the same form record (so the e-sign, print and saved data stay as they were).
   - MECT (mect-final): information sheet pages 1 to 4 folded; MECT checklist (192 cuts it out of pages 4 and 5)
     with Yes / No per row (`m196<part><row>` = 'y' / 'n', MMSE score in `p5f1`); old on-image boxes still read.
   - Admission terms (adm-terms): terms 9 to 25 (pages 5 and 6, no blanks) folded; documents checklist cut out of
     page 8, ticked on screen (`m196doc1..3` = '✓'). */
(function(){
  const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const cur=()=>String((typeof S!=='undefined'&&S.cdEntryKey)||'').split('|')[1]||'';
  const vals=fid=>{try{return cur()===fid?cdfVals(S.cdEntryKey):{};}catch(e){return {};}};

  /* ---- MECT checklist ---- */
  const MR={pre:['Capacity assessment form','Admission consent form signed by patient / NR for IPD patient',
      'MECT education material with consent form signed by patient / NR and two psychiatrists',
      'Anaesthesia consent form signed by patient / NR and one family member (legal guardian)',
      'PAC and pre MECT work-up (routine and special tests, ECG, fundus examination) checked by RMO','MMSE score'],
    peri:['Session 1','Session 2','Session 3','Session 4','Session 5'],
    post:['Vitals','Response monitoring, clinically (behaviour and psychopathology) and objective rating scale','Cognitive deficits, clinical and MMSE']};
  const MH={pre:'Pre-ECT assessment',peri:'Peri-MECT assessment',post:'Post-MECT assessment'},OLD={peri:'Peri-MECT',post:'Post-MECT'};
  const mget=(v,p,i)=>{const k='m196'+p+(i+1);if(v[k])return v[k];const o=OLD[p];if(o){if(v['m24'+o+i+'y'])return 'y';if(v['m24'+o+i+'n'])return 'n';}return '';};
  function mectHtml(ed){
    const v=vals('mect-final');let done=0,all=0;
    const body=Object.keys(MR).map(p=>`<tr class="m196-h"><th colspan="2">${MH[p]}${p==='peri'?'<small>Seizure threshold checked by the administering person; any events filled in a separate form</small>':''}</th><th>Yes</th><th>No</th></tr>`
      +MR[p].map((t,i)=>{const a=mget(v,p,i);all++;if(a)done++;
        const b=(x,l)=>`<button type="button" class="m196-b${a===x?' on '+x:''}"${ed?` onclick="m196Set('${p}',${i},'${x}')"`:' disabled'} aria-pressed="${a===x}">${l}</button>`;
        const mm=p==='pre'&&i===5?` <input class="m196-mm" type="text" inputmode="numeric" placeholder="Score /30" value="${esc(v.p5f1||'')}"${ed?` oninput="cdfSet('p5f1',this.value,null)"`:' disabled'}>`:'';
        return `<tr><td class="n">${i+1}</td><td>${esc(t)}${mm}</td><td>${b('y','Yes')}</td><td>${b('n','No')}</td></tr>`;}).join('')).join('');
    return `<div class="m196-top"><b>MECT checklist</b><span>Filled by the doctor · ${done} of ${all} answered</span></div><table class="m196-t">${body}</table>`;
  }
  window.m196Set=function(p,i,x){if(cur()!=='mect-final')return;const v=vals('mect-final');cdfSet('m196'+p+(i+1),mget(v,p,i)===x?'':x,null);redraw();};

  /* ---- Admission terms: documents checklist ---- */
  const DOCS=['Two passport size recent photographs','Proof of permanent address (PAN card, driving licence, election card, passport, Aadhaar card, bank passbook)','Proof of correspondence address'];
  function docHtml(ed){
    const v=vals('adm-terms');const n=DOCS.filter((t,i)=>v['m196doc'+(i+1)]).length;
    return `<div class="m196-top"><b>Documents required at the time of admission</b><span>${n} of ${DOCS.length} received</span></div><table class="m196-t">`
      +DOCS.map((t,i)=>{const on=!!v['m196doc'+(i+1)];return `<tr><td class="n">${i+1}</td><td>${esc(t)}</td><td style="width:110px;text-align:right"><button type="button" class="m196-b${on?' on y':''}"${ed?` onclick="m196Doc(${i})"`:' disabled'} aria-pressed="${on}">${on?'✓ Received':'Received'}</button></td></tr>`;}).join('')+'</table>';
  }
  window.m196Doc=function(i){if(cur()!=='adm-terms')return;const k='m196doc'+(i+1);cdfSet(k,vals('adm-terms')[k]?'':'✓',null);redraw();};

  const FORMS={
    'mect-final':{fold:[1,2,3,4],bar:'<b>Information sheet</b> · pages 1 to 4, read only, for the patient and family',what:'information sheet',ck:mectHtml,before:5},
    'adm-terms':{fold:[5,6],bar:'<b>Terms 9 to 25</b> · pages 5 and 6, read only (fees, belongings, safety, tests, rules)',what:'terms 9 to 25',ck:docHtml,after:8}};

  function redraw(){document.querySelectorAll('.m196-ck').forEach(el=>{const F=FORMS[el.dataset.fid];if(F)el.innerHTML=F.ck(el.dataset.ed==='1');});}

  const css=document.createElement('style');
  css.textContent='.m196-ck{background:#fff;border:1px solid #d0d5dd;border-radius:10px;padding:14px 16px;margin:0 auto 12px;box-sizing:border-box}'
    +'.m196-top{display:flex;justify-content:space-between;align-items:baseline;gap:12px;margin-bottom:8px}.m196-top b{font-size:15px}.m196-top span{font-size:12.5px;color:#667085}'
    +'.m196-t{width:100%;border-collapse:collapse;font-size:13.5px}.m196-t td,.m196-t th{border-bottom:1px solid #eaecf0;padding:7px 8px;text-align:left;vertical-align:middle}'
    +'.m196-t td.n{width:22px;color:#667085}.m196-h~tr td:nth-child(3),.m196-h~tr td:nth-child(4),.m196-h th:nth-child(2),.m196-h th:nth-child(3){width:62px;text-align:center}'
    +'.m196-h th{background:#f2f4f7;font-weight:700;color:#101828}.m196-h th small{display:block;font-weight:400;color:#475467;font-size:12px;margin-top:2px}'
    +'.m196-b{border:1px solid #d0d5dd;background:#fff;border-radius:6px;padding:4px 10px;font:inherit;font-size:12.5px;cursor:pointer;min-width:46px}'
    +'.m196-b.on.y{background:#dcfae6;border-color:#47cd89;color:#067647;font-weight:700}.m196-b.on.n{background:#fee4e2;border-color:#f97066;color:#b42318;font-weight:700}.m196-b:disabled{cursor:default}'
    +'.m196-mm{margin-left:10px;width:96px;padding:4px 8px;border:1px solid #d0d5dd;border-radius:6px;font:inherit;font-size:13px}'
    +'.m196-fb{display:flex;justify-content:space-between;align-items:center;gap:12px;background:#f8f9fc;border:1px solid #d0d5dd;border-radius:10px;padding:10px 14px;margin:0 auto 12px;box-sizing:border-box;font-size:13.5px}'
    +'.m196-fb button{border:1px solid #d0d5dd;background:#fff;border-radius:6px;padding:5px 12px;font:inherit;cursor:pointer;white-space:nowrap}'
    +'.m196-fold.m196-shut{display:none!important}'
    +'@media print{.m196-fold.m196-shut{display:block!important}.m24-mh.m196-fold.m196-shut{display:flex!important}.m196-fb{display:none}.m196-b:not(.on){opacity:.5}}';
  document.head.appendChild(css);

  /* page 8 of the admission terms ends before the checklist (image cut at the checklist heading) */
  try{const T=CDF_FORMS['adm-terms'];if(T&&T.pages&&!T.m196){T.m196=1;T.pages.forEach(pg=>{if(/adm-terms\/p8\.png/.test(pg.img)){pg.img='forms/adm-terms/p8.png?v=196';pg.h=649.9;pg.fields=pg.fields.filter(f=>!/^p8f[56]$/.test(f.id));}});}}catch(e){}

  const pno=img=>+((img.getAttribute('src')||'').match(/\/p(\d+)\.png/)||[])[1];
  const head=pg=>{const h=pg.previousElementSibling;return h&&h.classList.contains('m24-mh')?h:pg;};
  function fix(){
    Object.keys(FORMS).forEach(fid=>{const F=FORMS[fid];
      const imgs=[...document.querySelectorAll('.cdf-page>img[src*="forms/'+fid+'/p"]')];if(!imgs.length)return;
      new Set(imgs.map(i=>i.parentElement.parentNode)).forEach(box=>{
        const pages=[...box.children].filter(c=>c.classList.contains('cdf-page')&&c.querySelector('img[src*="forms/'+fid+'/p"]'));
        const at=n=>pages.find(pg=>pno(pg.querySelector('img'))===n);
        const w=pages[0].style.width||'',ed=cur()===fid&&!!box.querySelector('.cdf-f:not(.cdf-ro)');
        const open=box.dataset.m196open==='1';
        F.fold.forEach(n=>{const pg=at(n);if(!pg)return;[pg,head(pg)].forEach(e=>{e.classList.add('m196-fold');e.classList.toggle('m196-shut',!open);});});
        const f1=at(F.fold[0]);
        if(f1&&!box.querySelector(':scope>.m196-fb')){const fb=document.createElement('div');fb.className='m196-fb';fb.style.width=w;
          const lab=()=>(box.dataset.m196open==='1'?'Hide ':'Show ')+F.what;
          fb.innerHTML='<span>'+F.bar+'</span><button type="button"></button>';const b=fb.querySelector('button');b.textContent=lab();
          b.onclick=()=>{box.dataset.m196open=box.dataset.m196open==='1'?'0':'1';b.textContent=lab();fix();};
          box.insertBefore(fb,head(f1));}
        if(!box.querySelector(':scope>.m196-ck')){const ref=F.before?at(F.before):at(F.after);if(!ref)return;
          const ck=document.createElement('div');ck.className='m196-ck';ck.style.width=w;ck.dataset.fid=fid;ck.dataset.ed=ed?'1':'0';ck.innerHTML=F.ck(ed);
          if(F.before)box.insertBefore(ck,head(ref));else box.insertBefore(ck,ref.nextSibling);}
      });
    });
  }
  let q=0;const later=()=>{if(!q)q=requestAnimationFrame(()=>{q=0;try{fix();}catch(e){}});};
  try{new MutationObserver(later).observe(document.body,{childList:true,subtree:true});}catch(e){}
  later();
})();
