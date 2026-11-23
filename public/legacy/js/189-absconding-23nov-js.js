/* 23 Nov 2026, Anu (WhatsApp): three kinds of absconding, chosen in Log event.
   1. Absconded (left the building), patient still missing: Inform family, Document event (the psychiatrist's report).
   2. Absconded but found: Inform family, Review treatment.
   3. Tried absconding: Inform family, Review treatment.
   The event list gets "Absconded but found" and "Tried absconding" (the old "Absconding attempt" reads as "Tried absconding").
   The eye pop-up and Take Action show the two buttons for each kind. Psychiatrist and floor lead psychiatrist (eye pop-up);
   the event list is for every role that logs events. */
(function(){
  const ROLE=String((window.__TULASI__||{}).role||'');
  const E=s=>hesc(String(s==null?'':s));
  const Q=s=>String(s==null?'':s).replace(/\\/g,'\\\\').replace(/'/g,"\\'");
  /* event list */
  try{
    const L=EVGROUPS[0][1];
    const i=L.indexOf('Absconding attempt');if(i>=0)L.splice(i,1,'Tried absconding');
    const j=L.indexOf('Absconded (left the building)');if(j>=0&&L.indexOf('Absconded but found')<0)L.splice(j+1,0,'Absconded but found');
  }catch(e){}
  try{
    const R=(window.TULASI_RULES||{}).events;
    if(R){
      const base=R['Absconding attempt']||{tags:['Absconding risk'],tasks:[]};
      R['Tried absconding']=R['Tried absconding']||{tags:['Absconding risk'],alert:['Psychiatrist','Floor lead'],tasks:[['Inform the family','Treating team',60],['Review treatment','Psychiatrist',120]]};
      R['Absconded but found']=R['Absconded but found']||{tags:['Absconding risk'],alert:['Psychiatrist','Floor lead','Security'],tasks:[['Inform the family','Treating team',60],['Review treatment','Psychiatrist',120],['MHCA intimation','Floor lead',120]]};
      const a=R['Absconded (left the building)'];if(a&&a.tasks&&!a.tasks.some(t=>/incident report|psychiatrist's report/i.test(t[0])))a.tasks.push(["Psychiatrist's report of the event",'Treating consultant',120]);
      void base;
    }
  }catch(e){}

  if(!/^(psychiatrist|floor-lead-psychiatrist)$/.test(ROLE))return;
  const px=pid=>{try{return psyPx(pid)||{};}catch(e){return {};}};
  const kindOf=t=>/absconded \(left the building\)/i.test(t)?'gone':/absconded but found/i.test(t)?'found':/tried abscond|absconding attempt/i.test(t)?'tried':'';
  const LBL={gone:'Absconded (left the building)',found:'Absconded but found',tried:'Tried absconding'};

  /* Inform family: what the family was told, saved in the family call log */
  window.absFam=function(pid,k){
    V3.modal('Inform the family',E(LBL[k]||'Absconding'),
      '<label class="field"><span class="lbl">Who was told</span><input class="input" id="absWho" placeholder="Name and relation"></label>'
      +'<label class="field"><span class="lbl">What they were told</span><textarea class="input" id="absWhat" rows="4" placeholder="In a few words"></textarea></label><div id="absErr" class="small" style="color:#b42318;display:none">Write who was told and what was said</div>',
      '<button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="absFamSave(\''+Q(pid)+'\',\''+k+'\')">Save</button>');
  };
  window.absFamSave=function(pid,k){
    const who=((document.getElementById('absWho')||{}).value||'').trim(),what=((document.getElementById('absWhat')||{}).value||'').trim();
    if(!who||!what){const e=document.getElementById('absErr');if(e)e.style.display='';return;}
    let f=null;try{f=window.__faApi&&__faApi.famState(pid);}catch(e){}
    const x=px(pid);if(!f){x.fam=x.fam||{log:[]};f=x.fam;}f.log=f.log||[];
    f.log.unshift({what:'Family informed: '+(LBL[k]||'absconding'),by:signer(),at:atNow(),note:who+' · '+what});
    x.absDone=x.absDone||{};x.absDone[k+'_fam']={by:signer(),at:atNow()};
    try{V3.log(pid,S.role,'family','Family informed ('+(LBL[k]||'absconding')+'): '+who);}catch(e){}
    closeModal();render();toast('Saved: family informed');
  };
  /* Document event: the psychiatrist's report while the patient is missing */
  const REP=[['seen','Time last seen, and who saw the patient'],['search','Search done (ward, garden, gates) and security told'],['police','Police intimation (time, station)'],['state','Mental state and risk at the time'],['plan','Plan']];
  window.absDoc=function(pid){
    V3.modal("Psychiatrist's report · absconded",'The patient left the building and is not found yet.',
      REP.map(r=>'<label class="field"><span class="lbl">'+E(r[1])+'</span><textarea class="input" id="absR_'+r[0]+'" rows="2"></textarea></label>').join('')+'<div id="absErr" class="small" style="color:#b42318;display:none">Fill the time last seen and the plan</div>',
      '<button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="absDocSave(\''+Q(pid)+'\')">Sign report</button>');
  };
  window.absDocSave=function(pid){
    const v={};REP.forEach(r=>v[r[0]]=((document.getElementById('absR_'+r[0])||{}).value||'').trim());
    if(!v.seen||!v.plan){const e=document.getElementById('absErr');if(e)e.style.display='';return;}
    const x=px(pid);x.absReports=Array.isArray(x.absReports)?x.absReports:[];x.absReports.unshift(Object.assign({at:atNow(),ts:Date.now(),by:signer()},v));
    x.absDone=x.absDone||{};x.absDone.gone_doc={by:signer(),at:atNow()};
    try{V3.log(pid,S.role,'event',"Psychiatrist's report signed (absconded): "+v.plan.slice(0,80));}catch(e){}
    closeModal();render();toast('Report signed');
  };

  function btns(pid,k,keepReview){
    const d=px(pid).absDone||{},q=Q(pid);
    const fam=d[k+'_fam']?'<span class="tiny" style="color:#067647">Family informed · '+E(d[k+'_fam'].by)+'</span>':'<button class="btn sm pri" onclick="closeModal();absFam(\''+q+'\',\''+k+'\')">Inform family</button>';
    const second=k==='gone'?(d.gone_doc?'<span class="tiny" style="color:#067647">Report signed · '+E(d.gone_doc.by)+'</span>':'<button class="btn sm pri" onclick="closeModal();absDoc(\''+q+'\')">Document event</button>'):(keepReview||'<button class="btn sm pri" onclick="closeModal();psyEyePop(\''+q+'\',-1,\'review\')">Review treatment</button>');
    return fam+second;
  }
  if(typeof window.psyEye==='function'){
    const __e=window.psyEye;
    window.psyEye=function(pid){
      const r=__e.apply(this,arguments);
      try{
        const m=document.getElementById('modal');
        m&&m.querySelectorAll('.pd-det > .pd-di:not(.done)').forEach(card=>{
          const k=kindOf(card.textContent||'');if(!k)return;
          const da=card.querySelector('.pd-da');if(!da||da.dataset.abs)return;da.dataset.abs='1';
          const rv=[...da.querySelectorAll('button')].find(b=>/^Review treatment$/i.test((b.textContent||'').trim()));
          da.innerHTML=btns(pid,k,rv?rv.outerHTML.replace('class="','class="pri '):'');da.style.display='flex';da.style.gap='8px';da.style.flexWrap='wrap';da.style.alignItems='center';
          da.querySelectorAll('button').forEach(b=>{b.style.flex='1 1 160px';});
        });
      }catch(e){}
      return r;
    };
  }
})();
