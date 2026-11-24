/* 23 Nov 2026, Anu and Nikita (WhatsApp): the Tulasi "Application Form for Admission" is the first admission form,
   before the admission consent, Form E and high risk consent. It opens as a pop-up in pages 1, 2, 3 like the paper form
   (personal data; spouse and children; guardian and psychiatric data). Psychiatrist, RMO, psychologist (and admin, when
   that login exists) can fill it. Saved in psyPx(pid).appForm. Pages 4 to 11 (declarations) are the paper PDF.
   Add admission, forms step: the Application form row comes first, and the buttons read like the patient's Admission
   forms card (Taken by front desk, Collect e-signature, Upload signed copy). */
(function(){
  const FID='app-form',NAME='Application form for admission',PDF='/forms/admission-application/application-form.pdf';
  const E=s=>hesc(String(s==null?'':s));
  const Q=s=>String(s==null?'':s).replace(/\\/g,'\\\\').replace(/'/g,"\\'");
  const OPTS={title:['Mr','Mrs','Ms'],sex:['Male','Female','Other'],marital:['Single','Married','Separated','Divorced','Widowed'],live:['Living together','Separate'],rel:['Father','Mother','Spouse','Son','Daughter','Guardian','Other relative']};
  /* page > sections [title, note, fields]; field [key, label, type, span of 12, same-as key] */
  const PAGES=[
    ['Personal data',[
      ['Admission','',[['adm','Date of admission','date',4]]],
      ['Name','As on the ID proof',[['title','Title','title',3],['first','First name','',3],['middle','Middle name','',3],['sur','Surname','',3]]],
      ['Birth and education','',[['dob','Date of birth','date',4],['age','Age in years','',2],['sex','Gender','sex',6],['edu','Educational qualification','',12]]],
      ['Address and contact','Phone numbers with STD code',[['paddr','Permanent address','area',8],['pph','Phone numbers','',4],['caddr','Correspondence address','area',8,'paddr'],['cph','Phone numbers','',4],['email','E-mail','email',6]]]
    ]],
    ['Spouse and children',[
      ['Work and marriage','',[['occ','Occupation','',6],['marital','Marital status','marital',12]]],
      ['Spouse','Leave empty if single',[['sp','Name of the spouse','',6],['spAge','Age, if alive','',2],['spOcc','Occupation','',4],['spLive','Living together or separate','live',12],['spAddr','Address of the spouse','area',12]]],
      ['Children','',[['kids','Number of children','',4],['#k','Children','']]],
      /* Trello 226: the guardian is asked with the spouse and children; picking Spouse, Son or Daughter fills that person in */
      ['Relative or guardian','The person applying for the patient',[['gRel','Relationship to the patient','rel',12],['gTitle','Title','title',3],['gFirst','First name','',3],['gMiddle','Middle name','',3],['gSur','Surname','',3],['gAddr','Address','area',8],['gPh','Phone numbers','',4],['gCaddr','Correspondence address','area',12,'gAddr']]]
    ]],
    ['Psychiatric data',[
      ['Psychiatric data','For office use. Filled by the treating psychiatrist',[['dur','Duration of illness','',4],['doc','Examined by (Dr)','',4],['exDate','Examined on','date',2],['exTime','Time','time',2],['sym','Current symptoms','area',6],['dx','Diagnosis','area',6],['rem','Remarks','area',12]]]
    ]]
  ];
  const CHILD=n=>[['c'+n,'Name','',6],['c'+n+'p','Phone','',6],['c'+n+'e','E-mail','email',12],['c'+n+'a','Address','area',12]];
  const fieldsOf=pg=>[].concat(...pg[1].map(s=>[].concat(...s[2].map(f=>f[0][0]==='#'?CHILD(1).concat(CHILD(2)):[f]))));
  const ALL=[].concat(...PAGES.map(fieldsOf));
  const px=pid=>{try{return psyPx(pid)||{};}catch(e){return {};}};
  const ptOf=pid=>{try{return ((typeof PTS!=='undefined'&&PTS)||window.PTS||[]).find(p=>p.id===pid)||{};}catch(e){return {};}};
  let cur={pid:null,page:0,v:{}};
  window.__appDraft=null;

  if(!document.getElementById('apfCss')){const st=document.createElement('style');st.id='apfCss';st.textContent=`
  #modal.apf-m{width:min(860px,100%)!important}
  #modal.apf-m .mb{padding:0!important}
  .apf{--apf-b:#1e6cdb;--apf-line:#e4e8ee;--apf-ink:#101828;--apf-mut:#667085}
  .apf-steps{display:grid;grid-template-columns:repeat(3,1fr);border-bottom:1px solid var(--apf-line);position:sticky;top:0;background:#fff;z-index:2}
  .apf-step{all:unset;cursor:pointer;display:flex;gap:10px;align-items:flex-start;padding:12px 18px 11px;border-bottom:3px solid transparent;color:var(--apf-mut)}
  .apf-step:focus-visible{outline:2px solid var(--apf-b);outline-offset:-2px}
  .apf-step .n{flex:none;width:22px;height:22px;border-radius:50%;border:1.5px solid #cfd5dd;display:grid;place-items:center;font-size:12px;font-weight:600}
  .apf-step b{display:block;font-size:13px;font-weight:600;color:inherit;line-height:1.3}
  .apf-step small{font-size:11.5px}
  .apf-step.on{color:var(--apf-ink);border-bottom-color:var(--apf-b)}
  .apf-step.on .n{background:var(--apf-b);border-color:var(--apf-b);color:#fff}
  .apf-step.full:not(.on) .n{border-color:#12b76a;color:#067647}
  .apf-body{padding:4px 22px 8px}
  .apf-sec{display:grid;grid-template-columns:170px 1fr;gap:18px;padding:16px 0;border-bottom:1px solid var(--apf-line)}
  .apf-sec:last-child{border-bottom:0}
  .apf-sec h4{margin:2px 0 0;font-size:13.5px;font-weight:600;color:var(--apf-ink)}
  .apf-sec p{margin:4px 0 0;font-size:12px;color:var(--apf-mut);line-height:1.4}
  .apf-sec.office{background:#f5f8fc;border:1px solid #dbe5f1;border-radius:10px;padding:16px;margin:14px 0 6px}
  .apf-grid{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:12px}
  .apf-f{display:flex;flex-direction:column;gap:5px;min-width:0}
  .apf-f>span{font-size:12px;font-weight:500;color:#475467;display:flex;justify-content:space-between;gap:8px}
  .apf-f .input{width:100%;box-sizing:border-box}
  .apf-f textarea.input{min-height:58px;resize:vertical}
  .apf-same{all:unset;cursor:pointer;font-size:11.5px;font-weight:500;color:var(--apf-b)}
  .apf-same:focus-visible{outline:2px solid var(--apf-b);border-radius:3px}
  .apf-seg{display:inline-flex;flex-wrap:wrap;border:1px solid #d0d5dd;border-radius:8px;overflow:hidden;align-self:flex-start;max-width:100%}
  .apf-seg button{all:unset;cursor:pointer;padding:7px 12px;font-size:13px;color:#344054;border-right:1px solid #d0d5dd;background:#fff}
  .apf-seg button:last-child{border-right:0}
  .apf-seg button:hover{background:#f2f4f7}
  .apf-seg button:focus-visible{outline:2px solid var(--apf-b);outline-offset:-2px}
  .apf-seg button[aria-pressed=true]{background:#eaf1fc;color:#1849a9;font-weight:600}
  .apf-kid{border:1px solid var(--apf-line);border-radius:10px;padding:12px}
  .apf-kid h5{margin:0 0 10px;font-size:12.5px;font-weight:600;color:var(--apf-ink)}
  .apf-foot{position:sticky;bottom:0;background:#fff;border-top:1px solid var(--apf-line);padding:12px 22px;display:flex;align-items:center;gap:8px;z-index:2}
  .apf-foot .sp{flex:1;font-size:12px;color:var(--apf-mut)}
  .apf-foot a{color:var(--apf-b)}
  @media (max-width:680px){.apf-sec{grid-template-columns:1fr;gap:10px}.apf-grid>*{grid-column:1/-1!important}.apf-step{padding:10px}.apf-step small{display:none}.apf-foot .sp{display:none}}
  `;document.head.appendChild(st);}

  function prefill(pid){
    const p=ptOf(pid),v={},nm=String(p.name||'').trim().split(/\s+/);
    if(nm[0]){v.first=nm[0];if(nm.length>2)v.middle=nm.slice(1,-1).join(' ');if(nm.length>1)v.sur=nm[nm.length-1];}
    if(p.age)v.age=String(p.age).replace(/\D.*$/,'');
    if(p.sex)v.sex=/^f/i.test(p.sex)?'Female':/^m/i.test(p.sex)?'Male':'';
    if(p.mobile||p.phone)v.pph=p.mobile||p.phone;
    if(p.address)v.paddr=p.address;
    if(/psychiatrist/.test(String((window.__TULASI__||{}).role||'')))try{v.doc=String(signer()).replace(/^Dr\.?\s*/,'');}catch(e){}
    /* 24 Nov 2026 (Trello 225): pick up what the portal already holds -- admission date, the detailed history
       (education, occupation, marital status, duration, complaints, diagnosis) and the first relative on record */
    try{
      const d=+p.day||0;if(d>0){const t=new Date();t.setDate(t.getDate()-(d-1));v.adm=t.toISOString().slice(0,10);}
      const hf=px(pid).hf||{},H=re=>{const k=Object.keys(hf).find(k=>re.test(k)&&String(hf[k]||'').trim());return k?String(hf[k]).trim():'';};
      const edu=H(/^Education/i);if(edu)v.edu=edu;
      const occ=H(/^Occupation/i);if(occ)v.occ=occ;
      const mar=H(/^Marital (status|history)/i);if(mar){const m=/widow/i.test(mar)?'Widowed':/remarried/i.test(mar)?'Married':OPTS.marital.find(o=>o.toLowerCase()===mar.toLowerCase());if(m)v.marital=m;}
      const dur=H(/duration of illness|^Duration/i);if(dur)v.dur=dur;
      const sym=H(/^Chief complaints/i);if(sym)v.sym=sym;
      const dx=H(/^Provisional diagnosis/i)||(p.dx&&!/under assessment/i.test(p.dx)?p.dx:'');if(dx)v.dx=dx;
      const r0=p.rel0;if(r0&&r0.name){const g=String(r0.name).trim().split(/\s+/);v.gFirst=g[0];if(g.length>2)v.gMiddle=g.slice(1,-1).join(' ');if(g.length>1)v.gSur=g[g.length-1];
        const rl=OPTS.rel.find(o=>o.toLowerCase()===String(r0.rel||'').toLowerCase());if(rl)v.gRel=rl;if(r0.phone||r0.mobile)v.gPh=r0.phone||r0.mobile;}
      if(!v.title&&v.sex)v.title=v.sex==='Male'?'Mr':'';
    }catch(e){}
    return v;
  }
  function input(f,v){
    const [k,l,t,span,same]=f,val=v[k]||'',id='apf_'+k,col='grid-column:span '+(span||12);
    if(k[0]==='#')return '<div style="grid-column:span 12;display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px">'+[1,2].map(n=>'<div class="apf-kid"><h5>Child '+n+'</h5><div class="apf-grid">'+CHILD(n).map(c=>input(c,v)).join('')+'</div></div>').join('')+'</div>';
    const opts=OPTS[t];
    if(opts)return '<div class="apf-f" style="'+col+'"><span id="'+id+'_l">'+E(l)+'</span><div class="apf-seg" role="group" aria-labelledby="'+id+'_l">'+opts.map(o=>'<button type="button" aria-pressed="'+(val===o)+'" onclick="apfPick(\''+k+'\',\''+Q(o)+'\')">'+E(o)+'</button>').join('')+'</div></div>';
    const lab='<span><label for="'+id+'">'+E(l)+'</label>'+(same?'<button type="button" class="apf-same" onclick="apfSame(\''+k+'\',\''+same+'\')">Same as above</button>':'')+'</span>';
    const el=t==='area'?'<textarea class="input" id="'+id+'" rows="2">'+E(val)+'</textarea>':'<input class="input" id="'+id+'" type="'+(t==='date'||t==='time'||t==='email'?t:'text')+'" value="'+E(val)+'">';
    return '<div class="apf-f" style="'+col+'">'+lab+el+'</div>';
  }
  function grab(){fieldsOf(PAGES[cur.page]).forEach(f=>{const el=document.getElementById('apf_'+f[0]);if(el)cur.v[f[0]]=el.value.trim();});}
  /* Trello 226: living together = same address, so the spouse's address is not asked */
  const hid=f=>f[0]==='spAddr'&&cur.v.spLive==='Living together';
  const filled=pg=>{const fs=fieldsOf(pg).filter(f=>!hid(f));return [fs.filter(f=>String(cur.v[f[0]]||'').trim()).length,fs.length];};
  function show(){V3.modal(NAME,'Fill what you know. The rest can be added later.','<div id="apfBox" class="apf"></div>','');const m=document.getElementById('modal');if(m)m.classList.add('apf-m');draw2();}
  function draw2(){
    const pg=PAGES[cur.page],last=cur.page===PAGES.length-1;
    const steps='<nav class="apf-steps" aria-label="Form pages">'+PAGES.map((p,i)=>{const c=filled(p);return '<button type="button" class="apf-step'+(i===cur.page?' on':'')+(c[0]===c[1]?' full':'')+'" '+(i===cur.page?'aria-current="step" ':'')+'onclick="apfGo('+i+')"><span class="n">'+(i+1)+'</span><span><b>'+E(p[0])+'</b><small>'+c[0]+' of '+c[1]+' filled</small></span></button>';}).join('')+'</nav>';
    const secs='<div class="apf-body">'+pg[1].map(s=>'<section class="apf-sec'+(s[0]==='Psychiatric data'?' office':'')+'"><div><h4>'+E(s[0])+'</h4>'+(s[1]?'<p>'+E(s[1])+'</p>':'')+'</div><div class="apf-grid">'+s[2].filter(f=>!hid(f)).map(f=>input(f,cur.v)).join('')+'</div></section>').join('')+'</div>';
    const foot='<div class="apf-foot"><span class="sp">Pages 4 to 11 (declaration and signatures) are on the <a href="'+PDF+'" target="_blank" rel="noopener">paper form</a>.</span>'
      +(cur.page>0?'<button class="btn" onclick="apfGo('+(cur.page-1)+')">Back</button>':'<button class="btn" onclick="closeModal()">Cancel</button>')
      +(last?'<button class="btn pri" onclick="apfSave()">Save form</button>':'<button class="btn" onclick="apfSave(1)">Save</button><button class="btn pri" onclick="apfGo('+(cur.page+1)+')">Next: '+E(PAGES[cur.page+1][0])+'</button>')+'</div>';
    const b=document.getElementById('apfBox');if(!b)return;b.innerHTML=steps+secs+foot;
    const mb=b.closest('.mb');if(mb)mb.scrollTop=0;
  }
  window.apfSame=function(k,from){grab();cur.v[k]=cur.v[from]||'';if(k==='caddr'&&!cur.v.cph)cur.v.cph=cur.v.pph||'';draw2();};
  window.apfOpen=function(pid){
    const saved=pid?(px(pid).appForm||{}).v:(window.__appDraft||{}).v;
    /* a saved blank never hides what the portal already knows (Trello 225) */
    const sv={};Object.keys(saved||{}).forEach(k=>{if(String(saved[k]||'').trim())sv[k]=saved[k];});
    cur={pid:pid||null,page:0,v:Object.assign({adm:new Date().toISOString().slice(0,10)},pid?prefill(pid):{},sv)};
    if(!pid){const b=document.querySelector('.card .pad .small.muted b');if(b&&!saved){const nm=(b.textContent||'').trim().split(/\s+/);if(nm[0]){cur.v.first=nm[0];if(nm.length>2)cur.v.middle=nm.slice(1,-1).join(' ');if(nm.length>1)cur.v.sur=nm[nm.length-1];}}}
    show();
  };
  window.apfGo=function(i){grab();cur.page=Math.max(0,Math.min(PAGES.length-1,i));draw2();};
  function gFill(o){
    const v=cur.v,put=(k,x)=>{if(String(x||'').trim())v[k]=String(x).trim();};
    let nm='',ad='',ph='',ti='';
    if(o==='Spouse'){nm=v.sp;ad=v.spLive==='Living together'?v.paddr:v.spAddr;ph=v.spLive==='Living together'?v.pph:'';ti=v.sex==='Male'?'Mrs':v.sex==='Female'?'Mr':'';}
    else if(o==='Son'||o==='Daughter'){const n=String(v.c1||'').trim()||!String(v.c2||'').trim()?1:2;nm=v['c'+n];ad=v['c'+n+'a'];ph=v['c'+n+'p'];ti=o==='Son'?'Mr':'Ms';}
    else return;
    if(!String(nm||'').trim()){toast('No '+(o==='Spouse'?'spouse':'child')+' name above yet');return;}
    const p=String(nm).trim().split(/\s+/);v.gFirst=p[0];v.gMiddle=p.length>2?p.slice(1,-1).join(' '):'';v.gSur=p.length>1?p[p.length-1]:'';
    put('gTitle',ti);put('gAddr',ad);put('gPh',ph);
  }
  window.apfPick=function(k,o){grab();cur.v[k]=cur.v[k]===o?'':o;if(k==='gRel'&&cur.v.gRel)gFill(o);draw2();};
  window.apfSave=function(stay){
    grab();
    const rec={v:Object.assign({},cur.v),by:signer(),at:atNow(),ts:Date.now(),role:String((window.__TULASI__||{}).role||'')};
    if(cur.pid){const x=px(cur.pid);x.appForm=rec;try{V3.log(cur.pid,S.role,'form',NAME+' saved');}catch(e){}}
    else window.__appDraft=rec;
    if(stay){toast('Saved');return;}
    closeModal();render();toast('Saved: '+NAME);
  };
  window.apfPrint=function(pid){
    const r=pid?px(pid).appForm:window.__appDraft;const v=(r&&r.v)||{};
    const rows=PAGES.map((p,i)=>'<h2>Page '+(i+1)+': '+E(p[0])+'</h2><table>'+p[1].map(sc=>'<tr><th colspan="2" class="sub">'+E(sc[0])+'</th></tr>'+[].concat(...sc[2].map(f=>f[0][0]==='#'?[1,2].map(n=>CHILD(n).map(c=>[c[0],'Child '+n+', '+c[1].toLowerCase()])).flat():[f])).map(f=>'<tr><td class="l">'+E(f[1])+'</td><td>'+E(v[f[0]]||'')+'</td></tr>').join('')).join('')+'</table>').join('');
    const w=window.open('','_blank');if(!w){toast('Allow pop-ups to print');return;}
    w.document.write('<!doctype html><html><head><meta charset="utf-8"><title>'+NAME+'</title><style>body{font:13px Arial,sans-serif;margin:24px;color:#111}h1{font-size:18px;text-align:center;margin:0}h2{font-size:14px;margin:18px 0 6px}.c{text-align:center;font-size:11px;color:#444}table{width:100%;border-collapse:collapse}td,th{border:1px solid #bbb;padding:6px 8px;vertical-align:top;text-align:left}td.l{width:38%;color:#333}th.sub{background:#f2f4f7}.f{margin-top:18px;font-size:11px;color:#444}</style></head><body><div class="c"><b>Tulasi Healthcare</b><br>India Culture &amp; Convention Centre, Golf Course Extension Road, Sector-64, Gurgaon-122102, Haryana</div><h1 style="margin-top:12px">APPLICATION FORM</h1>'+rows
      +'<div class="f">'+(r?'Filled by '+E(r.by)+', '+E(r.at)+'. ':'')+'Pages 4 to 11 (declaration of understanding and acceptance of conditions, signatures) are signed on the paper form.</div><script>setTimeout(function(){print()},300)<\/script></body></html>');
    w.document.close();
  };

  /* the form in the e-sign list and the patient's Admission forms card */
  if(typeof window.__ocForms==='function'){const __o=window.__ocForms;window.__ocForms=function(){const r=__o.apply(this,arguments)||[];return r.some(f=>f[1]===FID)?r:[[NAME,FID]].concat(r);};}
  else window.__ocForms=function(){return [[NAME,FID]];};

  function decorate(){
    const pid=S.pid;if(!pid)return;
    document.querySelectorAll('#consentCard tbody').forEach(tb=>{
      const tr=[...tb.querySelectorAll('tr')].find(t=>((t.querySelector('td')||{}).textContent||'').trim().indexOf(NAME)===0);
      if(!tr)return;
      if(tb.firstElementChild!==tr)tb.insertBefore(tr,tb.firstElementChild);
      if(tr.dataset.apf)return;tr.dataset.apf='1';
      const r=px(pid).appForm,c=(px(pid).consent||{})[FID];
      const st=tr.children[1];
      if(st&&!c)st.innerHTML='<span class="cs '+(r?'':'due')+'">'+(r?'Filled '+E(r.at)+' · '+E(r.by):'Not filled yet')+'</span>';
      else if(st&&r)st.insertAdjacentHTML('beforeend','<div class="tiny muted">Filled '+E(r.at)+'</div>');
      const a=tr.querySelector('.ct-a');if(!a)return;
      const vb=[...a.querySelectorAll('button')].find(b=>/^(View form|Open Form|Open form)$/i.test((b.textContent||'').trim()));
      const html='<button class="btn sm" onclick="apfOpen(\''+Q(pid)+'\')">'+(r?'Open form':'Fill form')+'</button>'+(r?'<button class="btn sm" onclick="apfPrint(\''+Q(pid)+'\')">Print</button>':'');
      if(vb)vb.outerHTML=html;else a.insertAdjacentHTML('afterbegin',html);
    });
  }

  /* Add admission, forms step */
  const LBL={'E-sign by me':'Collect e-signature','Upload signed paper':'Upload signed copy'};
  function decorateNew(){
    if(!/^#\/(new-admission|newadm|admit|admission\/new)/.test(location.hash)&&!document.querySelector('[onclick^="nadForm("],[onclick^="admForm("]'))return;
    const first=document.querySelector('[onclick^="nadForm("],[onclick^="admForm("]');if(!first)return;
    const row=first.closest('.row');if(!row||!row.parentElement)return;
    row.parentElement.querySelectorAll('[onclick^="nadForm("] , [onclick^="admForm("]').forEach(b=>{const t=(b.textContent||'').trim();if(LBL[t])b.textContent=LBL[t];});
    if(row.parentElement.querySelector('#apfNewRow'))return;
    const d=window.__appDraft;
    const div=document.createElement('div');div.id='apfNewRow';div.className='row';div.style.cssText='justify-content:space-between;padding:8px 0;border-bottom:1px solid #eef1f5;gap:8px;flex-wrap:wrap';
    div.innerHTML='<span><b>'+E(NAME)+'</b> <span class="tiny muted">'+(d?'Filled '+E(d.at)+' · '+E(d.by):'Pages 1 to 3, filled here')+'</span></span><span style="display:flex;gap:6px"><button class="btn sm '+(d?'':'pri')+'" onclick="apfOpen()">'+(d?'Open form':'Fill form')+'</button>'+(d?'<button class="btn sm" onclick="apfPrint()">Print</button>':'')+'</span>';
    row.parentElement.insertBefore(div,row);
  }
  /* the filled draft goes to the patient once the admission is saved */
  function attach(){
    const d=window.__appDraft;if(!d)return;
    const m=/^#\/patient\/([^/]+)/.exec(location.hash);if(!m)return;
    const pid=decodeURIComponent(m[1]),x=px(pid);if(!x.appForm)x.appForm=d;window.__appDraft=null;
  }
  ['nadSave','admSave'].forEach(n=>{
    const o=window[n];if(typeof o!=='function')return;
    window[n]=function(){const r=o.apply(this,arguments);Promise.resolve(r).then(()=>setTimeout(attach,50)).catch(()=>{});return r;};
  });
  ['nadCancel'].forEach(n=>{const o=window[n];if(typeof o==='function')window[n]=function(){window.__appDraft=null;return o.apply(this,arguments);};});

  const __r=render;
  render=function(){/* 23 Nov (owner): the discharge summary opens as the full form, no Draft summary step */try{if(/^#\/patient\/[^/]+\/discharge/.test(location.hash)&&!S.dischargeDrafted){S.dischargeDrafted=true;S.draftBy=S.draftBy||signer();}}catch(e){}const r=__r.apply(this,arguments);try{decorate();decorateNew();}catch(e){}setTimeout(()=>{try{decorate();decorateNew();}catch(e){}},300);return r;};
})();
