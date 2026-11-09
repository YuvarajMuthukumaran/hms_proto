/* Psychiatrist only (9 Nov 2026). Changes from the team review call (Anu Yadav, Nikita Gupta, team lead).
   The Handover page, Today (Done today table, lab wording), Rounds (Events/Pending, Monitoring vs Investigations, risk drop-down) and the
   safety header were changed in their own blocks (30, 26, 29, 25, 49). This block holds the rest:
   1. Daily notes page: "Written earlier today" lists only the notes the psychiatrist wrote; each has View full note and Add another note
      (a saved note is never edited; a second note on the same day is a new entry).
   2. Patient page: "Full Rx chart" wording; the family-call alert sits above the stay timeline and is quieter.
   3. Past admissions: blue, clearer buttons (View discharge summary, View full file, Print full file); no empty folders; detailed history and
      capacity assessment show who and when with View and Print (no preview); long note folders scroll inside a bigger box.
   4. Admission forms: Collect e-signature shows the full form first, then the box to sign at the end. */
(function(){
  const psy=()=>S.role==='psychiatrist';
  const css=document.createElement('style');css.id='psy-review-9nov-css';
  css.textContent=`
  #famCallDue{border-left-color:#f5a524!important;background:#fffaf0;box-shadow:none}
  #famCallDue .hd{padding:10px 16px 0}#famCallDue h3{font-size:13.5px}
  .pf-row{display:grid;grid-template-columns:96px 170px minmax(0,1fr) auto auto;gap:10px;align-items:center;padding:8px 14px;border-top:1px solid var(--line-2);font-size:13px}
  .pf-row .pf-b{color:var(--ink-2);min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .pf-scroll{max-height:460px;overflow:auto;border-top:1px solid var(--line-2)}
  .pf-scroll .pf-e:first-child{border-top:0}
  .dn9-row{display:flex;align-items:flex-start;gap:12px;padding:12px 20px;border-top:1px solid var(--line-2);flex-wrap:wrap}
  .dn9-row .grow{flex:1;min-width:220px}
  .dn9-txt{white-space:pre-wrap;line-height:1.55;font-size:13.5px}
  .es-form{overflow:auto;max-height:46vh;border:1px solid var(--line);border-radius:10px;background:#f1f3f6;padding:10px;margin-bottom:12px}
  @media (max-width:860px){.pf-row{grid-template-columns:1fr}}`;
  document.head.appendChild(css);

  /* ---------- 1. Daily notes: only my own notes, view full, add another ---------- */
  const lst=v=>Array.isArray(v)?v.join(', '):(v||'');
  const noteText=e=>[['Behaviour',e.overallBeh],['Mood',e.mood],['Consciousness',e.cons],['Medication adherence',e.med],
    ['Side effects',e.seYN==='Yes'?'Yes. '+(e.seText||''):e.seYN],['Event today',e.inc],['Event details',e.line]]
    .map(([l,v])=>{const t=lst(v).trim();return t?l+': '+t:'';}).filter(Boolean).join('\n');
  const noteSum=e=>[lst(e.mood),lst(e.overallBeh),lst(e.med)].filter(Boolean).join('; ')||'Note saved';
  const hm=()=>{const d=new Date();return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');};
  const ptName=id=>{const p=(typeof ptFind==='function'?ptFind(id):null)||PTS.find(x=>x.id===id);return p?p.name:id;};
  function log(){S.psyEodLog=S.psyEodLog||[];return S.psyEodLog;}
  const __save=window.psyEodSave;
  window.psyEodSave=function(id){
    const was=!!((S.eod||{})[id]||{}).saved,r=__save.apply(this,arguments),e=(S.eod||{})[id]||{};
    if(!was&&e.saved)log().push({pid:id,by:signer(),at:e.savedAt||hm(),sum:noteSum(e),full:noteText(e)});
    return r;
  };
  /* notes saved before this block existed (or seeded) are shown too */
  function myNotes(){
    const L=log().slice(),have=new Set(L.map(x=>x.pid));
    PTS.forEach(p=>{const e=(S.eod||{})[p.id];if(e&&e.saved&&!have.has(p.id))L.push({pid:p.id,by:signer(),at:e.savedAt||'earlier today',sum:noteSum(e),full:noteText(e)});});
    return L.reverse();
  }
  window.psyDnView=function(i){
    const n=myNotes()[i];if(!n)return;
    /* Trello (9 Nov): a signed note is locked; an addendum shows who and when under it, the note itself never changes */
    S.psyDnAdd=S.psyDnAdd||{};const ad=(S.psyDnAdd[n.pid]=S.psyDnAdd[n.pid]||[]).map(a=>`<div class="small" style="margin-top:8px;padding:8px 10px;background:#f3f7ff;border-radius:8px"><b>Addendum by ${hesc(a.by)}, ${hesc(a.at)}:</b> ${hesc(a.text)}</div>`).join('');
    V3.modal(hesc(ptName(n.pid))+' · daily note','Signed by '+hesc(n.by)+' · '+hesc(n.at)+' · locked, add an addendum to correct it',
      `<div class="dn9-txt">${hesc(n.full||n.sum)}</div>${ad}<label class="field" style="margin-top:12px"><span class="lbl">Add addendum</span><textarea class="input" id="dnAd" rows="2" placeholder="What changed or was missed. The note above stays as it is."></textarea></label>`,
      `<button class="btn" onclick="closeModal()">Close</button><button class="btn" onclick="closeModal();psyDnAnother('${n.pid}')">Add another note</button><button class="btn pri" onclick="psyDnAddendum(${i})">Save addendum</button>`);
  };
  window.psyDnAddendum=function(i){
    const n=myNotes()[i],t=((($('dnAd')||{}).value)||'').trim();if(!n)return;
    if(!t){toast('Write the addendum first');return;}
    S.psyDnAdd[n.pid].push({by:signer(),at:atNow(),text:t});closeModal();toast('Addendum added. The original note is unchanged.');psyDnView(i);
  };
  /* Trello "make patient experience view only": the psychiatrist reads it; the RMO and the patient experience team fill it in */
  const __rv=render;
  render=function(){
    const out=__rv.apply(this,arguments);
    if(psy()&&/^#\/patient\/[^/]+\/prefs/.test(location.hash||'')){setTimeout(()=>{
      const v=document.getElementById('view');if(!v||v.querySelector('.vo-note'))return;
      v.querySelectorAll('textarea,input:not([type=search])').forEach(e=>{e.disabled=true;});
      v.querySelectorAll('select').forEach(e=>{e.disabled=true;});
      v.querySelectorAll('button.btn').forEach(b=>{if(/^(save|add|submit|raise|log|record|send|resolve|close)/i.test(b.textContent.trim()))b.style.display='none';});
      const note=document.createElement('div');note.className='callout grey small vo-note';note.style.margin='0 0 12px';note.textContent='View only. The RMO and the patient experience team fill this in.';
      const t=v.querySelector('.sgtabs');(t&&t.nextElementSibling?t.nextElementSibling:v.firstElementChild)?.prepend(note);
    },60);}
    return out;
  };
  window.psyDnAnother=function(pid){
    const e=(S.eod||{})[pid];
    if(e&&e.saved&&!log().some(x=>x.pid===pid&&x.full===noteText(e)))log().push({pid,by:signer(),at:e.savedAt||'earlier today',sum:noteSum(e),full:noteText(e)});
    S.eod[pid]={};S.eodI=Math.max(0,PTS.findIndex(p=>p.id===pid));render();window.scrollTo(0,0);toast('New note for '+ptName(pid)+'. The earlier note stays in the file.');
  };
  const __vn=vNotes;
  vNotes=function(){
    const h=__vn.apply(this,arguments);if(!psy()||typeof h!=='string')return h;
    const t=document.createElement('template');t.innerHTML=h;
    const sec=[...t.content.querySelectorAll('section.card')].find(s=>{const x=s.querySelector('h3');return x&&/^Written earlier today/.test(x.textContent.trim());});
    if(!sec)return h;
    const L=myNotes();
    if(!L.length){sec.remove();return t.innerHTML;}
    sec.innerHTML=`<div class="hd"><h3>Written earlier today</h3><span class="small muted">Your notes only</span></div>`+L.map((n,i)=>
      `<div class="dn9-row"><div class="grow"><div style="font-weight:600">${hesc(ptName(n.pid))}</div><div class="tiny muted">Daily note · ${hesc(n.at)} · ${hesc(n.sum)}</div></div><button class="btn sm" onclick="psyDnView(${i})">View full note</button><button class="btn sm" onclick="psyDnAnother('${n.pid}')">Add another note</button></div>`).join('');
    return t.innerHTML;
  };

  /* ---------- 2. Patient page ---------- */
  const prevVP=ROLE.psychiatrist.vPatient;
  ROLE.psychiatrist.vPatient=function(sub,base){
    let h=prevVP?prevVP.call(this,sub,base):base(sub);
    if(!psy()||typeof h!=='string')return h;
    h=h.split('View full medication chart').join('Full Rx chart');
    if(h.indexOf('id="famCallDue"')<0)return h;
    const t=document.createElement('template');t.innerHTML=h;
    const fc=t.content.querySelector('#famCallDue');if(!fc)return h;
    const lab=[...t.content.querySelectorAll('h3,h4,.lbl,b,div')].find(e=>e.children.length===0&&/^Stay timeline$/.test(e.textContent.trim()));
    const host=lab&&(lab.closest('section')||lab.parentElement);
    if(!host||host.contains(fc))return h;
    host.parentNode.insertBefore(fc,host);
    return t.innerHTML;
  };

  /* ---------- 3. Past admissions ---------- */
  window.__pfD=window.__pfD||[];
  window.psyPfView=function(n){const d=window.__pfD[n];if(!d)return;V3.modal(hesc(d.title),'Read only · past admission',`<div style="max-height:62vh;overflow:auto">${d.html}</div>`,`<button class="btn" onclick="psyPfPrint(${n})">Print</button><button class="btn pri" onclick="closeModal()">Close</button>`,'min(860px,100%)');};
  window.psyPfPrint=function(n){const d=window.__pfD[n];if(!d)return;if(typeof psyPdf==='function')psyPdf(d.title,d.html,null);else window.print();};
  const __pp=pPast;
  pPast=function(){
    const h=__pp.apply(this,arguments);if(!psy()||typeof h!=='string')return h;
    const t=document.createElement('template');t.innerHTML=h;const R=t.content;
    R.querySelectorAll('details.pf.empty').forEach(e=>e.remove());
    const RENAME={'Discharge summary':'View discharge summary','Stay file':'View full file','PDF':'Print full file'};
    R.querySelectorAll('.hd button.btn.sm').forEach(b=>{const m=RENAME[b.textContent.trim()];if(m){b.textContent=m;b.classList.add('pri');}});
    R.querySelectorAll('details.pf').forEach(f=>{
      const name=((f.querySelector('summary>span')||{}).textContent||'').trim();
      const ents=[...f.querySelectorAll(':scope>details.pf-e')];if(!ents.length)return;
      if(/^(Detailed case history|Capacity assessment)$/.test(name)){
        ents.forEach(e=>{
          const g=c=>((e.querySelector('summary .'+c)||{}).textContent||'').trim(),body=(e.querySelector('.pf-body')||{}).innerHTML||'';
          const n=window.__pfD.push({title:name+' · '+g('pf-d'),html:body||'<div class="muted">No document</div>'})-1;
          const row=document.createElement('div');row.className='pf-e pf-row';
          row.innerHTML=`<span class="pf-d">${hesc(g('pf-d'))}</span><span class="pf-t">${hesc(g('pf-t')||name)}</span><span class="pf-b">${hesc(g('pf-b'))}</span><button class="btn sm pri" onclick="psyPfView(${n})">View</button><button class="btn sm" onclick="psyPfPrint(${n})">Print</button>`;
          e.replaceWith(row);
        });
      }else{
        const box=document.createElement('div');box.className='pf-scroll';
        ents[0].before(box);ents.forEach(e=>box.appendChild(e));
      }
    });
    return t.innerHTML;
  };

  /* ---------- 4. Collect e-signature: the full form first, the signature box at the end ---------- */
  function formPages(fid){
    try{
      const meta=CDF_FORMS&&CDF_FORMS[fid];if(!meta)return '';
      CD_DATA=cdLoad();const it=cdItems(S.pid).find(i=>i.form&&i.form.id===fid),p=ptFind(S.pid);if(!it||!p)return '';
      const ep=(CD_DATA.episodes||{})[p.id]||{};try{cdfPrefill(it,p,ep,meta);}catch(e){}
      const vals=cdfVals(it.entryKey),auto=vals.__autoIds||{};
      return meta.pages.map((pg,i)=>`<div class="cdf-page" style="width:${pg.w*CDF_K}px;height:${pg.h*CDF_K}px;margin:0 auto 10px"><img src="${pg.img}" alt="Form page ${i+1}" draggable="false">${pg.fields.map(f=>cdfFieldHtml(f,vals,!!auto[f.id],false)).join('')}</div>`).join('');
    }catch(e){return '';}
  }
  const __eo=window.psyEsignOpen;
  window.psyEsignOpen=function(fid){
    __eo.apply(this,arguments);
    const mb=document.querySelector('#modal .mb');if(!mb)return;
    const pages=formPages(fid);if(!pages)return;
    $('modal').style.width='min(940px,100%)';
    mb.insertAdjacentHTML('afterbegin',`<div class="es-form" tabindex="0" aria-label="The form to read before signing"><div style="width:max-content;margin:0 auto">${pages}</div></div><div class="lbl" style="margin:2px 0 8px">Sign below, after reading the whole form</div>`);
  };
})();
