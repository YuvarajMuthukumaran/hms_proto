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
  const T=['Mr','Mrs','Ms'];
  const PAGES=[
    ['Personal data',[['adm','Date of admission','date'],['title','Mr / Mrs / Ms','title'],['first','First name'],['middle','Middle name'],['sur','Surname'],['paddr','Permanent address','area'],['pph','Contact numbers (permanent address)'],['caddr','Correspondence address','area'],['cph','Contact numbers (correspondence)'],['email','E-mail id'],['dob','Date of birth','date'],['age','Age (years)'],['sex','Gender','sex'],['edu','Educational qualification']]],
    ['Spouse and children',[['occ','Occupation'],['marital','Marital status','marital'],['sp','Name of the spouse'],['spAge','If alive, age of spouse'],['spOcc','Occupation of spouse'],['spAddr','Address of spouse','area'],['spLive','Living together or separate','live'],['kids','Number of children'],['c1','Child 1 · name'],['c1a','Child 1 · address','area'],['c1p','Child 1 · contact number'],['c1e','Child 1 · e-mail'],['c2','Child 2 · name'],['c2a','Child 2 · address','area'],['c2p','Child 2 · contact number'],['c2e','Child 2 · e-mail']]],
    ['Guardian and psychiatric data',[['gRel','Relationship (father, mother, son, daughter, spouse, guardian)'],['gTitle','Mr / Mrs / Ms','title'],['gFirst','First name'],['gMiddle','Middle name'],['gSur','Surname'],['gAddr','Address','area'],['gPh','Contact numbers'],['gCaddr','Correspondence address','area'],['@','Psychiatric data (by treating psychiatrist, for office use)'],['dur','Duration of illness'],['sym','Current symptoms','area'],['dx','Diagnosis','area'],['doc','Declaring psychiatrist (Dr)'],['exDate','Examined on','date'],['exTime','At (time)'],['rem','Remarks','area']]]
  ];
  const ALL=[].concat(...PAGES.map(p=>p[1])).filter(f=>f[0]!=='@');
  const px=pid=>{try{return psyPx(pid)||{};}catch(e){return {};}};
  const ptOf=pid=>{try{return (window.PTS||[]).find(p=>p.id===pid)||{};}catch(e){return {};}};
  let cur={pid:null,page:0,v:{}};
  window.__appDraft=null;

  function prefill(pid){
    const p=ptOf(pid),v={},nm=String(p.name||'').trim().split(/\s+/);
    if(nm[0]){v.first=nm[0];if(nm.length>2)v.middle=nm.slice(1,-1).join(' ');if(nm.length>1)v.sur=nm[nm.length-1];}
    if(p.age)v.age=String(p.age).replace(/\D.*$/,'');
    if(p.sex)v.sex=/^f/i.test(p.sex)?'Female':/^m/i.test(p.sex)?'Male':'';
    if(p.mobile||p.phone)v.pph=p.mobile||p.phone;
    if(p.address)v.paddr=p.address;
    return v;
  }
  function input(f,v){
    const [k,l,t]=f,val=v[k]||'',id='apf_'+k;
    if(k==='@')return '<div class="lbl" style="grid-column:1/-1;margin-top:8px;font-weight:700">'+E(l)+'</div>';
    const opts=t==='title'?T:t==='sex'?['Male','Female','Other']:t==='marital'?['Single','Married','Separated','Divorced','Widowed']:t==='live'?['Living together','Separate']:null;
    let el;
    if(opts)el='<div class="row" style="gap:6px;flex-wrap:wrap">'+opts.map(o=>'<button type="button" class="btn sm '+(val===o?'pri':'')+'" onclick="apfPick(\''+k+'\',\''+Q(o)+'\')">'+E(o)+'</button>').join('')+'</div>';
    else if(t==='area')el='<textarea class="input" id="'+id+'" rows="2">'+E(val)+'</textarea>';
    else el='<input class="input" id="'+id+'" '+(t==='date'?'type="date" ':'')+'value="'+E(val)+'">';
    return '<label class="field"'+(t==='area'?' style="grid-column:1/-1"':'')+'><span class="lbl">'+E(l)+'</span>'+el+'</label>';
  }
  function grab(){PAGES[cur.page][1].forEach(f=>{const el=document.getElementById('apf_'+f[0]);if(el)cur.v[f[0]]=el.value.trim();});}
  function show(){V3.modal(NAME,'Page '+(cur.page+1)+' of 3 · fill what you know, the rest can be added later','<div id="apfBox"></div>','');draw2();}
  function draw2(){
    const pg=PAGES[cur.page];
    const tabs='<div class="row" style="gap:6px;margin-bottom:12px;flex-wrap:wrap">'+PAGES.map((p,i)=>'<button type="button" class="btn sm '+(i===cur.page?'pri':'')+'" onclick="apfGo('+i+')">'+(i+1)+' · '+E(p[0])+'</button>').join('')+'</div>';
    const body=tabs+'<div class="fgrid" style="display:grid;grid-template-columns:1fr 1fr;gap:10px">'+pg[1].map(f=>input(f,cur.v)).join('')+'</div>'
      +'<div class="small muted" style="margin-top:12px">Pages 4 to 11 (declaration, conditions and signatures) are on the paper form: <a href="'+PDF+'" target="_blank" rel="noopener">open the full form</a>.</div>'
      +'<div class="row" style="justify-content:flex-end;gap:8px;margin-top:14px"><button class="btn" onclick="closeModal()">Cancel</button>'+(cur.page>0?'<button class="btn" onclick="apfGo('+(cur.page-1)+')">Back</button>':'')
      +(cur.page<PAGES.length-1?'<button class="btn" onclick="apfSave(1)">Save</button><button class="btn pri" onclick="apfGo('+(cur.page+1)+')">Next page</button>':'<button class="btn pri" onclick="apfSave()">Save form</button>')+'</div>';
    const b=document.getElementById('apfBox');if(b)b.innerHTML=body;
    const m=document.getElementById('modal');if(m){const s=[...m.querySelectorAll('*')].find(n=>n.children.length===0&&/^Page \d of 3/.test(n.textContent||''));if(s)s.textContent='Page '+(cur.page+1)+' of 3 · fill what you know, the rest can be added later';}
  }
  window.apfOpen=function(pid){
    const saved=pid?(px(pid).appForm||{}).v:(window.__appDraft||{}).v;
    cur={pid:pid||null,page:0,v:Object.assign({adm:new Date().toISOString().slice(0,10)},pid?prefill(pid):{},saved||{})};
    if(!pid){const b=document.querySelector('.card .pad .small.muted b');if(b&&!saved){const nm=(b.textContent||'').trim().split(/\s+/);if(nm[0]){cur.v.first=nm[0];if(nm.length>2)cur.v.middle=nm.slice(1,-1).join(' ');if(nm.length>1)cur.v.sur=nm[nm.length-1];}}}
    show();
  };
  window.apfGo=function(i){grab();cur.page=Math.max(0,Math.min(PAGES.length-1,i));draw2();};
  window.apfPick=function(k,o){grab();cur.v[k]=cur.v[k]===o?'':o;draw2();};
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
    const rows=PAGES.map((p,i)=>'<h2>Page '+(i+1)+' · '+E(p[0])+'</h2><table>'+p[1].map(f=>f[0]==='@'?'<tr><th colspan="2" class="sub">'+E(f[1])+'</th></tr>':'<tr><td class="l">'+E(f[1])+'</td><td>'+E(v[f[0]]||'')+'</td></tr>').join('')+'</table>').join('');
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
  render=function(){const r=__r.apply(this,arguments);try{decorate();decorateNew();}catch(e){}setTimeout(()=>{try{decorate();decorateNew();}catch(e){}},300);return r;};
})();
