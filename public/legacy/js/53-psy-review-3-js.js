/* Psychiatrist only (9 Nov 2026, 4:20 pm review call). Changes from the third recording:
   1. Patient Experience: no Fill form / Read only switch (it is view only), a short grey note instead of the blue-on-blue paragraph,
      the cards one under the other.
   2. Detailed history form: every tap-the-chips field is a drop-down with a free-text "Other" (several-answer fields add to a list);
      sections show one field after the other; bullets in the text boxes; old prescriptions can be uploaded;
      "Suggest diagnostic formulation with AI" is blue and a big warning shows with the draft.
   3. Patient > Daily notes: filter by psychiatrist or psychologist, quick filters Today / Yesterday / Last 7 days, search on the right of the
      filter row, "Print all daily notes".
   4. Treatment plan: Lab reports show date, who uploaded, which lab and Open PDF; one upload form for a whole report (not per test);
      Requests and permissions get a log; cleaner tables on Vitals and monitoring. */
(function(){
  const psy=()=>S.role==='psychiatrist';
  const px=()=>psyPx(S.pid);
  const css=document.createElement('style');css.id='psy-review-3-css';
  css.textContent=`
  /* Patient Experience */
  #psyPrefsPage .pxs-grid,.prefs-read .pxs-grid{grid-template-columns:1fr!important}
  .prefs-read .callout.blue{display:none}
  /* history form */
  .hgrid:has(.hf-sel){grid-template-columns:1fr;gap:14px}
  .hf-sel .hf-row{display:flex;gap:10px;flex-wrap:wrap;align-items:center}
  .hf-sel select.input{width:auto;min-width:240px;max-width:100%}
  .hf-sel .hfree{flex:1 1 260px;min-width:220px}
  .hf-tags{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}
  .hf-tag{display:inline-flex;align-items:center;gap:6px;background:#eff4ff;color:#175cd3;border:1px solid #c9dcfb;border-radius:99px;padding:3px 6px 3px 11px;font-size:12.5px;font-weight:600}
  .hf-tag button{border:0;background:none;color:#175cd3;font-size:15px;line-height:1;cursor:pointer;padding:0 4px}
  .ai9{background:#1d6fe0!important;color:#fff!important;border-color:#1d6fe0!important}
  .ai-warn{display:flex;gap:12px;align-items:flex-start;background:#fff4e5;border:2px solid #f5a524;border-radius:12px;padding:14px 16px;margin-bottom:12px;color:#7a2e0e}
  .ai-warn b{display:block;font-size:15px;margin-bottom:2px}.ai-warn .ic{font-size:22px;line-height:1}
  .oldrx{margin-top:12px;padding:14px;border:1px dashed #b5c7e8;border-radius:12px;background:#f8fbff}
  .oldrx .li{padding:8px 0;border-top:1px solid var(--line-2)}
  /* patient daily notes */
  .psy-dn-filter-row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
  .psy-dn-filter-row .dn9-sep{width:1px;height:22px;background:var(--line,#e4e7ec);margin:0 4px}
  .psy-dn-filter-row #dnQ{margin-left:auto;width:260px;min-height:34px}
  /* lab reports */
  .lr9 .t{font-weight:700;font-size:14.5px}.lr9 .m{font-size:12.5px;color:var(--muted,#667085);margin-top:3px;line-height:1.5}.lr9 .m b{color:var(--ink,#101828);font-weight:600}
  .lr9 .note{font-size:12.5px;color:var(--ink-2,#344054);margin-top:3px}
  .rq9 table{width:100%;border-collapse:collapse;font-size:13px}.rq9 th{text-align:left;font-size:11px;letter-spacing:.05em;text-transform:uppercase;color:var(--muted,#667085);padding:8px 12px;border-bottom:1px solid var(--line-2)}
  .rq9 td{padding:10px 12px;border-bottom:1px solid var(--line-2);vertical-align:top}
  .lt9{width:100%;border-collapse:collapse;font-size:13px;border:1px solid #e4e7ec}.lt9 th,.lt9 td{border:1px solid #e4e7ec;padding:10px 14px;text-align:left;vertical-align:middle}.lt9 th{background:#f8fafc;font-size:11px;letter-spacing:.05em;text-transform:uppercase;color:#667085}.lt9 tbody tr:hover td{background:#f8fbff}.lt9 td:first-child{width:26%}
  /* vitals and monitoring tables */
  .psy-tx-panel table{width:100%;border-collapse:separate;border-spacing:0;font-size:13px}
  .psy-tx-panel table th{text-align:left;font-size:11px;letter-spacing:.05em;text-transform:uppercase;color:var(--muted,#667085);font-weight:700;padding:9px 12px;background:#f8fafc;border-bottom:1px solid var(--line-2)}
  .psy-tx-panel table td{padding:10px 12px;border-bottom:1px solid var(--line-2)}
  .psy-tx-panel table tbody tr:hover td{background:#f8fbff}
  `;
  document.head.appendChild(css);

  /* ============ 1. Patient Experience: view only, one card under the other ============ */
  const __vp=vPatient;
  vPatient=function(sub){
    if(psy()&&/^#\/patient\/[^/]+\/prefs/.test(location.hash||''))S.prefsView='read';
    let h=__vp.apply(this,arguments);
    if(!psy()||typeof h!=='string')return h;
    const t=document.createElement('template');t.innerHTML=h;const R=t.content;let ch=false;
    const seg=R.querySelector('.psy-prefs-seg');
    if(seg){const r=seg.closest('.row');(r||seg).remove();ch=true;}
    /* Treatment plan panels: Lab reports and Requests and permissions */
    R.querySelectorAll('.psy-tx-panel').forEach(p=>{
      const tt=((p.querySelector('h3')||{}).textContent||'').trim();
      if(tt==='Lab reports'){
        const sub=p.querySelector('.psy-tx-head .small.muted');if(sub)sub.remove();
        const btn=p.querySelector('.psy-tx-head button');if(btn){btn.className='btn pri sm';btn.textContent='+ Upload lab report';}
        const body=p.querySelector('.psy-tx-body');if(body)body.innerHTML=labList();
        ch=true;
      }else if(tt==='Requests and permissions'){p.insertAdjacentHTML('beforeend',reqLog());ch=true;}
    });
    return ch?t.innerHTML:h;
  };

  /* ============ 4a. Lab reports ============ */
  const seedLabs=()=>[];
  function labRows(pid){
    const own=(px().labReports||[]).map(r=>Object.assign({own:1},r));
    const old=v3().labs.filter(l=>l.pid===pid).sort((a,b)=>b.t-a.t).map(l=>({id:l.id,legacy:1,name:l.test,date:V3.stamp(l.t),lab:'Tulasi in-house lab',by:l.by||'Lab',at:'',files:l.pdf?[l.pdf]:[],note:''}));
    return own.concat(old);
  }
  function labList(){
    const L=labRows(S.pid);
    const row=r=>`<tr><td><b>${hesc(r.name)}</b>${r.note?`<div class="tiny muted" style="margin-top:2px">${hesc(r.note)}</div>`:''}</td><td>${hesc(r.date||'')}</td><td>${hesc(r.lab||'Not stated')}</td><td>${hesc(r.by||'')}${r.at?`<div class="tiny muted">${hesc(r.at)}</div>`:''}</td><td>${hesc(r.advisedBy||'—')}</td><td>${(r.files||[]).length||'—'}</td><td style="text-align:right"><button class="btn sm" onclick="${r.legacy?`psyLabPdf('${r.id}')`:`psyLabRepPdf('${r.id}')`}">Open PDF</button></td></tr>`;
    return L.length?`<div class="scroll"><table class="lt9"><thead><tr><th>Report</th><th>Report date</th><th>Lab</th><th>Uploaded by</th><th>Advised by</th><th>Files</th><th></th></tr></thead><tbody>${L.map(row).join('')}</tbody></table></div>`:'<div class="pad small muted">No lab reports yet.</div>';
  }
  window.psyLabAdd=function(pid){
    const today=new Date().toISOString().slice(0,10);
    V3.modal('Upload lab report · '+hesc(V3.pn(pid)),'One report can hold several tests. Attach the file and say where it came from.',
      `<div class="grid2"><label class="field"><span class="lbl">Report name</span><input class="input" id="lr9_n" placeholder="e.g. Blood tests, thyroid profile"></label><label class="field"><span class="lbl">Date of report</span><input class="input" id="lr9_d" type="date" value="${today}"></label></div>
       <div class="grid2"><label class="field"><span class="lbl">Lab or hospital</span><input class="input" id="lr9_l" placeholder="Which lab did it"></label><label class="field"><span class="lbl">Advised by</span><input class="input" id="lr9_a" placeholder="Doctor who asked for the tests"></label></div>
       <label class="field"><span class="lbl">Notes (optional)</span><textarea class="input" id="lr9_t" rows="2" placeholder="Anything the next doctor should know"></textarea></label>
       <label class="field"><span class="lbl">Report files (PDF or photos)</span><input class="input" id="lr9_f" type="file" multiple accept=".pdf,image/*"></label>
       <div id="lr9_e" class="small" style="color:var(--red);display:none">Write the report name and attach at least one file</div>`,
      `<button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="psyLabSave9('${pid}')">Save report</button>`);
  };
  window.psyLabSave9=function(pid){
    const n=(($('lr9_n')||{}).value||'').trim(),fs=[...((($('lr9_f')||{}).files)||[])];
    if(!n||!fs.length){$('lr9_e').style.display='block';return;}
    const d=($('lr9_d')||{}).value||'',nice=d?new Date(d+'T00:00:00').toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}):'';
    const x=psyPx(pid);x.labReports=x.labReports||[];
    x.labReports.unshift({id:'lr'+Date.now(),name:n,date:nice,lab:(($('lr9_l')||{}).value||'').trim(),advisedBy:(($('lr9_a')||{}).value||'').trim(),note:(($('lr9_t')||{}).value||'').trim(),files:fs.map(f=>f.name),by:signer(),at:atNow()});
    closeModal();render();toast('Lab report added by '+signer());
  };
  window.psyLabRepPdf=function(id){
    const r=(px().labReports||[]).find(x=>x.id===id);if(!r)return;const p=ptFind(S.pid)||PTS.find(x=>x.id===S.pid);
    psyPdf('Lab report · '+r.name,`<h2>${hesc(r.name)}</h2><table><tr><th>Report date</th><th>Lab</th><th>Advised by</th><th>Uploaded by</th></tr><tr><td>${hesc(r.date)}</td><td>${hesc(r.lab||'')}</td><td>${hesc(r.advisedBy||'')}</td><td>${hesc(r.by)}, ${hesc(r.at)}</td></tr></table>${r.note?'<p>'+hesc(r.note)+'</p>':''}<p>Files: ${r.files.map(hesc).join(', ')}</p>`,p);
  };

  /* ============ 4b. Requests and permissions: log ============ */
  function reqLog(){
    const x=px();x.reqLog=x.reqLog||[
      {type:'Lab tests',what:'Serum lithium, tomorrow 7:00',by:'Dr. Aanya Sharma',at:'23 Oct 2026, 10:40 am',st:'Ordered'},
      {type:'Outing or leave',what:'Day outing with the family on Sunday',by:'Ananya Bose (sister)',at:'22 Oct 2026, 4:15 pm',st:'Waiting for the psychiatrist'},
      {type:'Visiting doctor referral',what:'Medicine review, general physician',by:'Dr. Sameer Khan (RMO)',at:'21 Oct 2026, 11:05 am',st:'Seen on 22 Oct'},
      {type:'Restraint',what:'Not requested',by:'—',at:'—',st:'None'}].filter(r=>r.st!=='None');
    return `<section class="card rq9"><div class="hd"><div><h3>Request log</h3><div class="small muted" style="margin-top:4px">Who asked for what, and when.</div></div></div>
      <div class="scroll"><table><thead><tr><th>Request</th><th>Details</th><th>Requested by</th><th>When</th><th>Status</th></tr></thead><tbody>${x.reqLog.map(r=>`<tr><td><b>${hesc(r.type)}</b></td><td>${hesc(r.what)}</td><td>${hesc(r.by)}</td><td>${hesc(r.at)}</td><td>${hesc(r.st)}</td></tr>`).join('')}</tbody></table></div></section>`;
  }

  /* ============ 2. Detailed history form ============ */
  const HF=[];
  const hfIdx=l=>{let i=HF.indexOf(l);if(i<0){HF.push(l);i=HF.length-1;}return i;};
  const hfStore=()=>{const x=px();return x.hf=x.hf||{};};
  const hfGet=(l,ty)=>{
    const st=hfStore();if(st[l]!==undefined)return st[l];
    const d=S.historyDraft?HDRAFT[l]:null;
    return ty==='o'?(d?{sel:d,free:''}:{sel:'',free:''}):(Array.isArray(d)?d.slice():(d?String(d).split(/,\s*/):[]));
  };
  const __fld=fld;
  fld=function(f,ro){
    const [l,ty,op]=f;
    if(!psy()||(ty!=='o'&&ty!=='m'&&ty!=='ap'))return __fld.apply(this,arguments);
    const i=hfIdx(l),dis=ro?'disabled':'';
    if(ty==='o'){
      const v=hfGet(l,'o'),inList=op.includes(v.sel),sel=v.sel&&!inList?'__other':v.sel,free=sel==='__other'?(v.free||v.sel):'';
      return `<div class="hf hf-sel" data-hf="${i}"><span class="lbl">${hesc(l)}</span><div class="hf-row"><select class="input" ${dis} onchange="psyHfOne(${i},this)"><option value="">Select…</option>${op.map(o=>`<option ${sel===o?'selected':''}>${hesc(o)}</option>`).join('')}<option value="__other" ${sel==='__other'?'selected':''}>Other (type it)</option></select>
        <input class="input hfree" ${dis} placeholder="Type here" value="${hesc(free)}" ${sel==='__other'?'':'hidden'} oninput="psyHfFree(${i},this.value)"></div></div>`;
    }
    const arr=hfGet(l,ty);
    return `<div class="hf hf-sel" data-hf="${i}"><span class="lbl">${hesc(l)} <span class="tiny" style="text-transform:none;letter-spacing:0">(add all that apply)</span></span>
      <div class="hf-row"><select class="input" ${dis} onchange="psyHfAdd(${i},this)"><option value="">Add from the list…</option>${op.map(o=>`<option>${hesc(o)}</option>`).join('')}</select>
      <input class="input hfree" ${dis} placeholder="Other: type and press Enter" onkeydown="if(event.key==='Enter'){event.preventDefault();psyHfAdd(${i},this,true)}"></div>
      <div class="hf-tags">${arr.map((a,k)=>`<span class="hf-tag">${hesc(a)}<button type="button" ${dis} aria-label="Remove" onclick="psyHfDel(${i},${k})">×</button></span>`).join('')}</div></div>`;
  };
  const hfEl=i=>document.querySelector('.hf-sel[data-hf="'+i+'"]');
  window.psyHfOne=function(i,sel){
    const l=HF[i],st=hfStore(),box=hfEl(i),fr=box&&box.querySelector('.hfree');
    if(sel.value==='__other'){st[l]={sel:'__other',free:''};if(fr){fr.hidden=false;fr.value='';fr.focus();}}
    else{st[l]={sel:sel.value,free:''};if(fr){fr.hidden=true;fr.value='';}}
  };
  window.psyHfFree=function(i,v){const l=HF[i];hfStore()[l]={sel:'__other',free:v};};
  const hfDraw=i=>{const box=hfEl(i);if(!box)return;const l=HF[i],arr=hfGet(l,'m'),dis=box.querySelector('select').disabled?'disabled':'';box.querySelector('.hf-tags').innerHTML=arr.map((a,k)=>`<span class="hf-tag">${hesc(a)}<button type="button" ${dis} aria-label="Remove" onclick="psyHfDel(${i},${k})">×</button></span>`).join('');};
  window.psyHfAdd=function(i,el,free){
    const l=HF[i],st=hfStore(),v=String(el.value||'').trim();if(!v)return;
    const arr=Array.isArray(st[l])?st[l]:hfGet(l,'m');if(!arr.includes(v))arr.push(v);st[l]=arr;
    el.value='';hfDraw(i);
  };
  window.psyHfDel=function(i,k){const l=HF[i],st=hfStore(),arr=Array.isArray(st[l])?st[l]:hfGet(l,'m');arr.splice(k,1);st[l]=arr;hfDraw(i);};

  /* old prescriptions on the treatment and past illness section */
  window.psyOldRxAdd=function(inp){
    const x=px();x.oldRx=x.oldRx||[];let n=0;
    [...inp.files].forEach(f=>{if(f.size>10*1048576){toast(f.name+' is over 10 MB and was not added');return;}x.oldRx.unshift({name:f.name,size:f.size,by:signer(),at:atNow()});n++;});
    inp.value='';if(n){render();toast(n+' old prescription'+(n>1?'s':'')+' added');}
  };
  window.psyOldRxDel=function(i){const x=px();(x.oldRx=x.oldRx||[]).splice(i,1);render();};
  const __hf=histForm;
  histForm=function(){
    const h=__hf.apply(this,arguments);if(!psy()||typeof h!=='string'||!/<h3>\d+\. Treatment and past illness/.test(h))return h;
    const L=px().oldRx||[];
    const blk=`<div class="oldrx"><div class="row" style="justify-content:space-between;gap:10px;flex-wrap:wrap"><div><div class="lbl">Old prescriptions</div><div class="tiny muted">Upload photos or PDFs of earlier prescriptions</div></div><label class="btn sm pri" style="cursor:pointer">+ Upload old prescriptions<input type="file" multiple accept=".pdf,image/*" hidden onchange="psyOldRxAdd(this)"></label></div>
      ${L.map((f,i)=>`<div class="li"><div class="grow"><div style="font-weight:600">${hesc(f.name)}</div><div class="tiny muted">Added by ${hesc(f.by)}, ${hesc(f.at)}</div></div><button class="btn sm" onclick="psyOldRxDel(${i})">Remove</button></div>`).join('')}</div>`;
    const m='<div class="row" style="justify-content:space-between;margin-top:6px">';
    const k=h.indexOf(m);return k<0?h:h.slice(0,k)+blk+h.slice(k);
  };

  /* AI formulation button: blue, left, full words; the draft opens under a big warning */
  const __pa=pAdmission;
  pAdmission=function(){
    let h=__pa.apply(this,arguments);if(!psy()||typeof h!=='string')return h;
    h=h.replace('<button type="button" class="btn sm" onclick="psyFormulationOpen()">Suggest formulation (AI)</button>','<button type="button" class="btn sm pri ai9" onclick="psyFormulationOpen()">✦ Suggest diagnostic formulation with AI</button>')
       .replace('justify-content:flex-end;margin-bottom:4px','justify-content:flex-start;margin-bottom:8px');
    return h;
  };
  const __fo=window.psyFormulationOpen;
  window.psyFormulationOpen=function(){
    __fo.apply(this,arguments);
    const mb=document.querySelector('#modal .mb');if(!mb||!document.getElementById('frT'))return;
    mb.insertAdjacentHTML('afterbegin','<div class="ai-warn" role="alert"><span class="ic">⚠</span><div><b>AI-generated draft. It may or may not be true.</b>Read every line and edit it before you use it. Nothing is saved to the form until you copy it and paste it yourself.</div></div>');
    const note=mb.querySelector('.tiny.muted');if(note)note.remove();
  };

  /* bullets in the text boxes of the history form: "• " at the start, Enter adds the next bullet, Enter on an empty bullet ends the list */
  document.addEventListener('focusin',e=>{const t=e.target;if(psy()&&t.tagName==='TEXTAREA'&&t.closest('.hgrid')&&!t.readOnly&&!t.value.trim())t.value='• ';});
  document.addEventListener('keydown',e=>{
    const t=e.target;if(!psy()||t.tagName!=='TEXTAREA'||!t.closest('.hgrid')||t.readOnly||e.key!=='Enter'||e.shiftKey)return;
    const v=t.value,s=t.selectionStart,ls=v.lastIndexOf('\n',s-1)+1,line=v.slice(ls,s);
    if(line.indexOf('• ')!==0)return;
    e.preventDefault();
    if(line==='• '){t.value=v.slice(0,ls)+v.slice(s);t.setSelectionRange(ls,ls);}
    else{t.value=v.slice(0,s)+'\n• '+v.slice(s);t.setSelectionRange(s+3,s+3);}
    t.dispatchEvent(new Event('input',{bubbles:true}));
  });

  /* ============ 3. Patient > Daily notes ============ */
  const DEMO_TODAY=new Date(2026,9,24);
  const dayOf=n=>{const d=new Date(String(n.d)+' '+String(n.my));return isNaN(d)?null:d;};
  window.psyDnWho=function(v){S.dnWho=S.dnWho===v?'':v;S.dnLim=10;render();};
  window.psyDnWhen=function(v){S.dnWhen=S.dnWhen===v?'':v;S.dnLim=10;render();};
  const __nl=noteList;
  noteList=function(id,items){
    if(psy()&&id==='dn'&&Array.isArray(items)){
      const who=S.dnWho,when=S.dnWhen;
      if(who)items=items.filter(n=>(/psychologist/i.test(n.role||''))===(who==='psychologist'));
      if(when){const t0=new Date(DEMO_TODAY.getFullYear(),DEMO_TODAY.getMonth(),DEMO_TODAY.getDate());
        items=items.filter(n=>{const d=dayOf(n);if(!d)return false;const diff=Math.round((t0-d)/864e5);return when==='today'?diff===0:when==='yesterday'?diff===1:diff>=0&&diff<7;});}
    }
    return __nl.apply(this,[id,items]);
  };
  const __pd=pDaily;
  pDaily=function(){
    const h=__pd.apply(this,arguments);if(!psy()||typeof h!=='string')return h;
    const t=document.createElement('template');t.innerHTML=h;
    const sec=[...t.content.querySelectorAll('section.card')].find(s=>((s.querySelector('.hd h3')||{}).textContent||'').trim()==='Earlier notes');
    if(!sec)return h;
    const pdf=[...sec.querySelectorAll('.hd button')].find(b=>/^PDF$/.test(b.textContent.trim()));if(pdf)pdf.textContent='Print all daily notes';
    const row=sec.querySelector('.psy-dn-filter-row');
    if(row){
      const c=(lab,fn,arg,on)=>`<button class="tog ${on?'on':''}" onclick="${fn}('${arg}')">${lab}</button>`;
      row.insertAdjacentHTML('beforeend','<span class="dn9-sep" aria-hidden="true"></span>'+c('Psychiatrist','psyDnWho','psychiatrist',S.dnWho==='psychiatrist')+c('Psychologist','psyDnWho','psychologist',S.dnWho==='psychologist')+'<span class="dn9-sep" aria-hidden="true"></span>'+c('Today','psyDnWhen','today',S.dnWhen==='today')+c('Yesterday','psyDnWhen','yesterday',S.dnWhen==='yesterday')+c('Last 7 days','psyDnWhen','week',S.dnWhen==='week'));
      const q=sec.querySelector('.dn-bar #dnQ');if(q)row.appendChild(q);
    }
    return t.innerHTML;
  };
})();
