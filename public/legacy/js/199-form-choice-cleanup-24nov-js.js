/* 199 · 24 Nov (owner): no word-choice ovals over printed text ("Mr/Mrs/Ms", "son/daughter/wife", "advance and/on weekly"):
   they need no filling, so those choice fields are dropped from the forms. Real pick lists stay (psychiatric history,
   MECT history picks, capacity p1f8, outing m196oc6). Blanks are 95% see-through (192) so the print under them shows. */
(function(){
  if(typeof CDF_FORMS==='undefined')return;
  const DROP={
    'adm-terms':['p4f2','p4f5','p4f8','p7f5'],
    'admission-consent':['p1f18'],
    'clozapine-consent':['p1f3','p1f9','p1f11','p1f13','p1f16'],
    'form-c':['p1f3'],
    'high-risk-consent':['p1f1','p1f2','p1f3','p1f9'],
    'mect-final':['p8f1'],
    'reassessment':['p1f5'],
    'capacity-assessment':['p2f4','p2f11','p2f14']
  };
  Object.keys(DROP).forEach(fid=>{const m=CDF_FORMS[fid];if(!m||!m.pages)return;const d=DROP[fid];
    m.pages.forEach(pg=>{if(pg.fields)pg.fields=pg.fields.filter(f=>!(f.kind==='choice'&&d.includes(f.id)));});});
  /* 24 Nov (owner): MECT page 7 signing table was printed crooked (rows did not follow the header columns), so blanks
     sat across columns. p7.png now has a clean table (Name / Address / Sign / Date x Patient, Family member, Doctor;
     original in git history) and one blank per cell. Sign is left for the paper signature. Old ids kept for names/dates. */
  (function(){const m=CDF_FORMS['mect-final'],pg=m&&m.pages&&m.pages[6];if(!pg||pg.__m199)return;pg.__m199=1;
    pg.img=String(pg.img).split('?')[0]+'?v=199';
    const old=['p7f15','p7f16','p7f17','p7f18','p7f19','p7f20','p7f21','p7f22','p7f23','p7f24','p7f25'];
    pg.fields=pg.fields.filter(x=>!old.includes(x.id));
    const L=(id,label,x,y,w)=>({kind:'line',id,label,x,y,w,h:15,size:10});
    [[391,'p7f19','Patient','m199pa','Address','p7f16'],[420,'p7f20','Family Member','m199fa','Family member address','m199fd'],[449,'p7f25','Doctor','m199da','Doctor address','p7f22']]
      .forEach(([y,n,nl,a,al,d])=>{pg.fields.push(L(n,nl,133,y,124),L(a,al,263,y,139),L(d,'Date',473,y,75));});
  })();
  /* 24 Nov (owner): MECT medical problems '( ) Hypertension ...': the '( )' is a tick box (m199t.<id>); the blank(s)
     after it show only once it is ticked (or hold a value the user typed). Auto-filled values alone do not show it. */
  const TK=[[4,'p5f13',83,229.2,11.9],[4,'p5f14',260.9,229.2,11.9],[4,'p5f15',386.9,229.2,11.9],[5,'p6f1',83,10.7,12.3],
    [6,'p7f1',83.5,10.9,11.9],[6,'p7f2',265.4,10.9,11.9],[6,'p7f3',439.9,10.4,12.3,'p7f4'],[6,'p7f5',83,46.3,11.9],
    [6,'p7f6',439.9,63.8,12.3,'p7f9'],[6,'p7f7',83,64.2,11.9],[6,'p7f8',264.4,64.2,11.9],[6,'p7f10',83,98.7,11.9],
    [6,'p7f11',80.5,117.4,11.9],[6,'p7f12',368.4,117,12.3,'p7f13']];
  const GATE={};
  (function(){const m=CDF_FORMS['mect-final'];if(!m||!m.pages||m.__m199t)return;m.__m199t=1;
    TK.forEach(([pi,id,x,y,h,id2])=>{const pg=m.pages[pi];if(!pg)return;const t='m199t_'+id;
      pg.fields.push({kind:'check',id:t,label:'Tick',x:x-23,y:y-0.5,w:27,h:h+1,size:10});GATE[id]=t;if(id2)GATE[id2]=t;});
  })();
  function gate(){const key=String((typeof S!=='undefined'&&S.cdEntryKey)||'');if(key.split('|')[1]!=='mect-final')return;
    let v={};try{v=cdfVals(key)||{};}catch(e){}const au=v.__autoIds||{};
    Object.keys(GATE).forEach(id=>{const on=!!v[GATE[id]]||(!!v[id]&&!au[id]);
      document.querySelectorAll('.cdf-page [oninput*="cdfSet(\'' +id+'\'"],.cdf-page [onchange*="cdfSet(\'' +id+'\'"]').forEach(e=>{e.style.visibility=on?'':'hidden';});});}
  try{const __c=cdfCheck;cdfCheck=function(){const r=__c.apply(this,arguments);try{gate();}catch(e){}return r;};}catch(e){}
  const st=document.createElement('style');
  st.textContent='.cdf-page .cdf-f.cdf-opt:not(.cdf-ro){box-shadow:none!important;border:1px solid rgba(46,144,250,.85)!important;background:rgba(46,144,250,.10)!important}'
    +'.cdf-page .cdf-f.cdf-opt.on{background:#2e90fa!important;color:#fff!important}';
  /* 24 Nov (owner): text inside a blank was cut off (bold font taller than the blank). Every one-line blank gets a
     font that fits its own height, centred, dark and bold, so what is typed or filled in is always readable. */
  st.textContent+='.cdf-page input.cdf-f,.cdf-page select.cdf-f{padding:0 3px!important;color:#0b1f44!important;font-weight:700!important}';
  function fit(){document.querySelectorAll('.cdf-page input.cdf-f:not([data-fit]),.cdf-page select.cdf-f:not([data-fit])').forEach(e=>{
    const h=parseFloat(e.style.height)||e.clientHeight;if(!h)return;e.setAttribute('data-fit','1');
    const fs=Math.min(parseFloat(e.style.fontSize)||parseFloat(getComputedStyle(e).fontSize)||12,Math.max(8,h*0.72));
    e.style.setProperty('font-size',fs+'px','important');e.style.setProperty('line-height',h+'px','important');});}
  let q=0;try{new MutationObserver(()=>{if(!q)q=requestAnimationFrame(()=>{q=0;try{fit();}catch(e){}try{gate();}catch(e){}});}).observe(document.body,{childList:true,subtree:true});}catch(e){}
  document.head.appendChild(st);
})();
