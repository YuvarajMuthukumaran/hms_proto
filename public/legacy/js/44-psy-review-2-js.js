
/* Psychiatrist (5 Nov 2026): second team review (Nikita, Anu, Yuvraj on Zoom). One block for the profile pages; the Rounds, dashboard and Daily notes
   changes are in 25, 26, 28, 29 and 39.
   - Patient overview: medicines list is tighter, prescribed by / start / duration sit in the empty space on the right (quiet, not bold),
     "Ward adherence" is written once, refused and held doses show as "Hold: 2 times"; the buttons in the summary boxes sit beside the text.
   - Team chips: "Dr. Name" for the psychiatrist, name only for the psychologist, no role words.
   - Past admissions: the first page lists every kind of document in folders (case history, capacity assessment, management plans,
     re-assessments, round notes, daily notes by psychiatrist and by psychologist, therapy and family). Open a folder to see its entries, one line each.
   - Admission tab: blue steps instead of green; no "No known drug allergies" card (allergies are in the detailed history); Admission documents only
     under step 2; Admission forms as a table (form, status, View form / Upload signed copy / Collect e-signature); empty treatment chart hidden in the
     workup; Physical injuries yes/no with free text (also shown to the RMO, who fills the workup).
   - Back from a form returns to where you came from. */
(function(){
  const psy=()=>S.role==='psychiatrist';
  const css=document.createElement('style');css.id='psy-review2-css';
  css.textContent=`
  /* medicines on the overview */
  body.psy-views .medrow{grid-template-columns:36px minmax(0,1.1fr) auto 110px minmax(190px,1fr) 110px;padding:8px 14px;gap:12px}
  /* the title row (Current medicines · 3 and its buttons) is the top row of the white list; the blue frame around the list stays */
  body.psy-views .medhead{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;padding:12px 14px 4px;margin:0!important;background:#fff}
  body.psy-views .medcap{position:relative;height:26px;font-size:11px;font-weight:600;color:var(--muted);white-space:nowrap}
  body.psy-views .medcap span{position:absolute;top:8px}
  body.psy-views .medcap+.medrow{border-top:0}
  .mmeta{display:flex;flex-direction:column;gap:2px;color:var(--muted);font-weight:400}.mmeta .tiny{font-size:11.5px;color:var(--muted)}
  /* a medicine with no mg (Multivitamin) shows no empty dose pill */
  .mdose:empty{display:none}
  .mhold{font-size:12px;font-weight:600;color:#b54708;margin-top:2px}
  .mnone{font-size:12px;color:#067647;margin-top:2px}
  @media (max-width:900px){body.psy-views .medrow{grid-template-columns:36px minmax(0,1fr)}body.psy-views .medrow .mmeta{grid-column:2}}
  /* summary boxes: the button sits beside the text, not under it */
  .sbox-act{display:grid!important;grid-template-columns:minmax(0,1fr) auto;column-gap:10px;row-gap:5px;align-items:center;align-content:start}
  .sbox-act>.lbl{grid-column:1;grid-row:1}
  .sbox-act>.sbox-btn{grid-column:2;grid-row:1;margin:0!important;padding:0!important}
  .sbox-act>.sval,.sbox-act>.tiny{grid-column:1 / -1}
  /* Admission steps are blue */
  .adm-step.prevdone::before{background:var(--blue)!important}
  .adm-step.done .adm-n,.adm-step.sel.done .adm-n{background:var(--blue)!important;border-color:var(--blue)!important;color:#fff}
  .adm-step.done .adm-s{color:var(--blue-ink)!important}
  /* past admissions: folders */
  .pf{border:1px solid var(--line);border-radius:12px;background:#fff;margin:0 16px 8px;overflow:hidden}
  .pf>summary{list-style:none;cursor:pointer;display:flex;align-items:center;gap:10px;padding:10px 14px;font-weight:600}
  .pf>summary::-webkit-details-marker{display:none}
  .pf>summary::after{content:'›';margin-left:auto;color:var(--muted);font-size:18px;transition:transform .15s}
  .pf[open]>summary::after{transform:rotate(90deg)}
  .pf.empty>summary{cursor:default;color:var(--muted);font-weight:500}.pf.empty>summary::after{content:''}
  .pf-n{font-size:11.5px;font-weight:700;color:var(--blue-ink);background:var(--blue-tint);border-radius:99px;padding:1px 9px}
  .pf-e{border-top:1px solid var(--line-2)}
  .pf-e>summary{list-style:none;cursor:pointer;display:grid;grid-template-columns:92px 150px 170px minmax(0,1fr);gap:10px;align-items:center;padding:7px 14px;font-size:13px}
  .pf-e>summary::-webkit-details-marker{display:none}.pf-e>summary:hover{background:var(--soft)}
  .pf-d{color:var(--muted)}.pf-t{font-weight:600}.pf-b{color:var(--ink-2)}.pf-s{color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .pf-body{padding:4px 14px 12px 116px;font-size:13px;line-height:1.5}.pf-body b{display:block;font-size:11.5px;color:var(--muted);margin-top:6px}
  @media (max-width:860px){.pf-e>summary{grid-template-columns:1fr}.pf-body{padding-left:14px}}
  /* consent table */
  .ct-t{width:100%;border-collapse:collapse}.ct-t th{text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:var(--muted);padding:8px 16px}
  .ct-t td{padding:10px 16px;border-top:1px solid var(--line-2);vertical-align:middle}
  /* plain-text status (the no-labels view hides chips, and the status matters) */
  .cs{display:inline-block;font-size:13px;font-weight:600;color:#067647;background:#ecfdf3;border-radius:99px;padding:3px 12px}.cs.due{color:#b54708;background:#fffaeb}
  .ct-a{display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end}
  /* less empty space on the psychiatrist's pages (team review, 5 Nov) */
  body.psy-views .content{gap:14px;padding-top:14px}
  body.psy-views .ws-mid{gap:10px}
  body.psy-views .pad{padding:16px}
  body.psy-views .card .hd{padding:12px 16px}
  body.psy-views .li{padding:10px 16px}
  body.psy-views .sbox{min-height:0;padding:12px 14px}
  body.psy-views .sumgrid{gap:10px}
  body.psy-views .dph{padding:16px 20px;gap:16px}
  body.psy-views .dpmain{gap:8px}
  body.psy-views .hbody{gap:10px}
  body.psy-views .box{padding:10px 12px}
  .ct-pad{border:1px dashed #b8c4d3;border-radius:12px;background:#fcfcfd;touch-action:none;width:100%;height:150px;display:block}`;
  document.head.appendChild(css);

  const px=()=>window.psyPx?psyPx(S.pid):{};

  /* ---------- 1. patient overview ---------- */
  const __ov=pOverview;
  pOverview=function(){
    const h=__ov.apply(this,arguments);if(!psy())return h;
    const t=document.createElement('template');t.innerHTML=h;
    t.content.querySelectorAll('.sumgrid .sbox').forEach(b=>{
      const w=[...b.children].find(c=>c.matches&&c.matches('div[style*="margin-top:auto"]'));
      /* only short button names go beside the title; a long one (Vitals and monitoring) would squeeze the title, so it stays under the text */
      if(w&&(w.textContent||'').trim().length<=16){b.classList.add('sbox-act');w.classList.add('sbox-btn');}
    });
    return t.innerHTML;
  };

  const MOCKHR=[
    ['neel','Lithium',4,'N','H'],['neel','Lithium',9,'M','H'],['neel','Olanzapine',11,'N','H'],
    ['arjun','Mirtazapine',5,'N','H'],['arjun','Escitalopram',8,'M','R'],
    ['sameer','Fluoxetine',3,'M','H'],['tarun','Risperidone',1,'M','H'],
    ['kabir','Trihexyphenidyl',4,'M','H']
  ];
  const __ms=marStat;
  marStat=function(m,day,k,di,isToday){
    const r=__ms.apply(this,arguments);
    if(isToday||!r||r.st!=='G')return r;
    const pid=S.pid||'neel';
    const hit=MOCKHR.find(x=>x[0]===pid&&di===x[2]&&k===x[3]&&String(m.name).indexOf(x[1])===0);
    return hit?Object.assign({},r,{st:hit[4]}):r;
  };

  /* the Current medicines list sits in the patient header, so it is arranged after the page is drawn */
  function placeMedCap(){
    const list=document.querySelector('#view .medlist'),cap=list&&list.querySelector('.medcap'),row=list&&list.querySelector('.medrow');
    if(!cap||!row)return;
    const l=list.getBoundingClientRect(),at=(sel)=>{const e=row.querySelector(sel);return e?Math.round(e.getBoundingClientRect().left-l.left):null;};
    const pos={slots:at('.slots'),meta:at('.mmeta'),adh:at('.adh')};
    cap.querySelectorAll('span[data-h]').forEach(sp=>{const x=pos[sp.dataset.h];if(x==null){sp.style.display='none';return;}sp.style.display='';sp.style.left=x+'px';});
  }
  window.addEventListener('resize',placeMedCap);
  function fixMedList(){
    const list=document.querySelector('#view .medlist');if(!list||list.dataset.psy2)return;list.dataset.psy2='1';
    let counts=[];
    try{counts=JSON.parse(ptRun(S.pid,()=>{
      const out=[];let days=[];try{days=marDays();}catch(e){}
      (S.meds||[]).forEach(m=>{let H=0,R=0,G=0;try{days.forEach((day,di)=>MAR_SLOTS(m.freq).forEach(k=>{const r=marStat(m,day,k,di,di===days.length-1);if(r.st==='H')H++;if(r.st==='R')R++;if(r.st==='G')G++;}));}catch(e){}out.push([H,R,G]);});
      return JSON.stringify(out);}));}catch(e){}
    [...list.querySelectorAll('.medrow')].forEach((row,i)=>{
      const mn=row.querySelector('.mname');
      if(mn){
        /* start and duration, and who prescribed it, move to the free space on the right, quiet */
        const meta=document.createElement('div');meta.className='mmeta';
        [...mn.children].slice(1).forEach(k=>meta.appendChild(k));
        row.insertBefore(meta,row.lastElementChild);
        const c=counts[i]||[0,0],bits=[c[0]?'Hold: '+c[0]+(c[0]===1?' time':' times'):'',c[1]?'Refused: '+c[1]+(c[1]===1?' time':' times'):''].filter(Boolean);
        const d=document.createElement('div');d.className=bits.length?'mhold':'mnone';d.textContent=bits.length?bits.join(' · '):'No holds or refusals';mn.appendChild(d);
        /* adherence follows the same chart, so it never says 100% beside refused doses */
        const tot=c[0]+c[1]+(c[2]||0),pct=tot?Math.round((c[2]||0)/tot*100):null,bar=row.querySelector('.adhb i'),pv=row.querySelector('.adh b');
        if(pct!=null&&bar&&pv){pv.textContent=pct+'%';bar.style.width=pct+'%';const lo=pct<90;bar.style.background=lo?'#e0a43a':'#22a05a';pv.style.color=lo?'var(--amber)':'var(--green)';}
      }
      row.querySelectorAll('.adh .tiny.muted').forEach(e=>{if(/Ward adherence/.test(e.textContent))e.remove();});
    });
    /* the caption sits right above the percentage and bar column (its left edge is measured from the first row, so it stays under the right words at any width) */
    const cap=document.createElement('div');cap.className='medcap';cap.innerHTML='<span data-h="slots" title="M morning, A afternoon, N night">Dose times</span><span data-h="meta">Prescription</span><span data-h="adh">Ward adherence</span>';list.insertBefore(cap,list.firstChild);
    /* move the title row inside the white box, above the column headings */
    const mbox=list.closest('.medbox'),mh=mbox&&mbox.firstElementChild;
    if(mbox&&mh&&mh!==list&&!mh.classList.contains('medhead')){mh.classList.add('medhead');list.insertBefore(mh,list.firstChild);}
    placeMedCap();
  }

  /* ---------- 2. team chips and back button (after every draw) ---------- */
  const __r=render;
  let __draftSeen=false;
  render=function(){
    /* the moment the AI scribe's draft first appears, open the AI-filled form (the doctor then checks it field by field) */
    if(psy()){if(S.historyDraft&&!__draftSeen)S.hview='aifill';__draftSeen=!!S.historyDraft;}
    const out=__r.apply(this,arguments);
    if(psy())fixMedList();
    if(psy()){
      document.querySelectorAll('#view .tpill').forEach(p=>{
        const b=p.querySelector('b'),r=p.querySelector('.tiny.muted');if(!b||!r)return;
        const role=r.textContent.trim();
        if(role==='Psychiatrist'){if(!/^Dr\./.test(b.textContent))b.textContent='Dr. '+b.textContent;r.remove();}
        else if(role==='Psychologist')r.remove();
      });
      const back=[...document.querySelectorAll('#view button')].find(x=>/Back to Documents/.test(x.textContent));
      if(back){back.textContent='← Back';back.setAttribute('onclick','history.back()');}
    }
    return out;
  };

  /* ---------- 3. Past admissions: folders ---------- */
  function pastItems(a){
    const yr=(String(a.dates).match(/(\d{4})/)||[])[1]||'';
    return (a.notes||[]).map(n=>{
      const [dd,mm]=String(n[0]).split(' '),parts=String(n[1]).split(' · ');
      const by0=parts.length>1?parts[parts.length-1]:'',type=parts.length>1?parts.slice(0,-1).join(' · '):parts[0];
      const by=by0||a.psy,role=/Dr\./.test(by)?'Psychiatrist':'Psychologist';
      return {d:dd,my:(mm||'')+' '+yr,type,by,role,text:n[2],sum:n[2]};
    });
  }
  const FOLDERS=[['hist','Detailed case history'],['cap','Capacity assessment'],['plan','Management plans'],['rea','Weekly re-assessments'],['round','Round notes'],
    ['dnp','Daily notes · psychiatrist'],['dns','Daily notes · psychologist'],['fam','Therapy and family sessions'],['other','Other notes']];
  const catOf=i=>{
    const t=i.type;
    if(/histor/i.test(t))return 'hist';
    if(/capacity/i.test(t))return 'cap';
    if(/plan/i.test(t))return 'plan';
    if(/re-?assess/i.test(t))return 'rea';
    if(/daily/i.test(t))return i.role==='Psychiatrist'?'dnp':'dns';
    if(/round/i.test(t))return 'round';
    if(/family|therapy|session/i.test(t))return 'fam';
    return 'other';
  };
  const FOLD='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>';
  const __pp=pPast;
  pPast=function(){
    if(!psy())return __pp.apply(this,arguments);
    return S.pastAdm.map((a,ai)=>{
      const items=pastItems(a);
      const folders=FOLDERS.map(([k,name])=>{
        const L=items.filter(i=>catOf(i)===k);
        if(k==='other'&&!L.length)return '';
        if(!L.length)return `<details class="pf empty"><summary onclick="return false">${FOLD}<span>${name}</span><span class="pf-n" style="background:#f2f4f7;color:#667085">None</span></summary></details>`;
        const key=ai+'|'+k;
        return `<details class="pf" ${(S.pfOpen||{})[key]?'open':''} ontoggle="(S.pfOpen=S.pfOpen||{})['${key}']=this.open"><summary>${FOLD}<span>${name}</span><span class="pf-n">${L.length}</span></summary>${L.map(i=>`<details class="pf-e"><summary><span class="pf-d">${hesc(i.d)} ${hesc(i.my)}</span><span class="pf-t">${hesc(i.type)}</span><span class="pf-b">${hesc(i.by)}</span><span class="pf-s">${hesc(i.sum)}</span></summary><div class="pf-body"><b>${hesc(i.type)}</b>${hesc(i.text)}<b>Written by</b>${hesc(i.by)} · ${hesc(i.role)}</div></details>`).join('')}</details>`;
      }).join('');
      return `<section class="card">
        <div class="hd"><div><h3>Admission ${a.n} · ${a.dates}</h3><div class="small muted" style="margin-top:4px">${a.days} days · ${a.sec} · ${a.psy} · ${a.psych} · read only</div></div>
          <div class="row" style="gap:8px"><button class="btn sm" onclick="pastSummary(${ai})">Discharge summary</button><button class="btn sm" onclick="pastFile(${ai})">Stay file</button><button class="btn sm" onclick="psyPastPdf(${ai})">PDF</button></div></div>
        <div class="grid3" style="padding:12px 20px">
          <div class="box"><div class="lbl">Discharge diagnosis</div><div class="small" style="font-weight:600;margin-top:4px">${a.dx}</div></div>
          <div class="box"><div class="lbl">Condition at discharge</div><div class="small" style="font-weight:600;margin-top:4px">${a.cond}</div></div>
          <div class="box"><div class="lbl">Medicines at discharge</div>${a.meds.map(m=>`<div class="small" style="font-weight:600;margin-top:4px">${m}</div>`).join('')}</div>
        </div>
        <div class="lbl" style="padding:2px 20px 8px">Documents</div>${folders}
        <div class="pad small" style="padding-top:6px"><span class="muted">Plan last time:</span> ${a.plan}</div>
      </section>`;}).join('')+`<div class="callout grey">Past stays are read only. OPD visits between admissions stay in the live Clinical Notes tab; discharge summaries also sit in Care Management.</div>`;
  };

  /* ---------- 4. Admission tab ---------- */
  const FORMS=[['Admission consent form and letter of undertaking (advance and charges)','admission-consent'],['Form E · request for admission with high support needs (rule 8)','form-e'],['High risk informed consent','high-risk-consent']];
  const when=()=>{const d=new Date();return d.getDate()+' '+d.toLocaleString('en-GB',{month:'short'});};
  const admDate=()=>{try{const p=ptFind(S.pid);return ptD(ptIdentity(p).adm);}catch(e){return '';}};
  function consentCard(){
    const x=px();x.consent=x.consent||{};
    let items=[];try{CD_DATA=cdLoad();items=cdItems(S.pid);}catch(e){}
    const rows=FORMS.map(([name,fid])=>{
      const c=x.consent[fid],it=items.find(i=>i.form&&i.form.id===fid);
      const st=c?(c.st==='esign'?'E-signed '+hesc(c.at)+(c.by?' · '+hesc(c.by):''):c.st==='uploaded'?'Uploaded '+hesc(c.at)+(c.file?' · '+hesc(c.file):''):'Signed '+hesc(c.at))
        :'Signed '+hesc(admDate()||'on admission');
      const view=it?`<button class="btn sm" onclick="psyDocPreview('${hesc(it.entryKey)}')">View form</button>`:`<button class="btn sm" disabled title="No on-screen version yet">View form</button>`;
      return `<tr><td style="font-weight:600">${name}</td><td><span class="cs ${c&&c.st==='due'?'due':''}">${st}</span></td>
        <td><div class="ct-a">${view}<label class="btn sm" style="cursor:pointer">Upload signed copy<input type="file" hidden onchange="psyConsentUpload('${fid}',this)"></label><button class="btn sm pri" onclick="psyEsignOpen('${fid}')">Collect e-signature</button></div></td></tr>`;
    }).join('');
    return `<section class="card" id="consentCard"><div class="hd"><h3>Admission forms</h3><span class="chip c-grey">Taken by front desk</span></div>
      <div class="scroll"><table class="ct-t"><thead><tr><th>Form</th><th>Status</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>
      <div class="pad small muted">E-signature is a trial: the legal team is still checking that it is valid. Other consents are on Treatment Plan.</div></section>`;
  }
  window.psyConsentUpload=function(fid,inp){
    const f=inp.files&&inp.files[0];if(!f)return;
    if(f.size>10*1048576){toast(f.name+' is over 10 MB and was not added');return;}
    const x=px();x.consent=x.consent||{};x.consent[fid]={st:'uploaded',at:when(),file:f.name,by:signer()};
    inp.value='';render();toast('Signed copy added: '+f.name);
  };
  window.psyDocPreview=function(key){S.cdfView='page';psyDocOpen(key);};
  let pad=null;
  window.psyEsignOpen=function(fid){
    const f=FORMS.find(a=>a[1]===fid);if(!f)return;
    V3.modal('Collect e-signature','Read the form with the family, then they sign in the box. Trial only: the legal team is checking this.',
      `<div class="small" style="font-weight:600;margin-bottom:8px">${hesc(f[0])}</div>
       <label class="field"><span class="lbl">Name of the person signing</span><input class="input" id="esN" placeholder="e.g. Ananya Bose (sister, nominated representative)"></label>
       <div class="lbl" style="margin:10px 0 6px">Signature</div><canvas class="ct-pad" id="esC" width="520" height="150"></canvas>
       <div class="row" style="justify-content:space-between;margin-top:6px"><button class="btn sm" onclick="psyEsignClear()">Clear</button><span id="esE" class="small" style="color:var(--red);display:none">Write the name and sign in the box</span></div>`,
      `<button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="psyEsignSave('${fid}')">Save signature</button>`);
    setTimeout(()=>{
      const c=document.getElementById('esC');if(!c)return;const g=c.getContext('2d');g.lineWidth=2.2;g.lineCap='round';g.strokeStyle='#0b1324';
      pad={c,g,drawn:false,down:false};
      const pt=e=>{const r=c.getBoundingClientRect();return [(e.clientX-r.left)*c.width/r.width,(e.clientY-r.top)*c.height/r.height];};
      c.onpointerdown=e=>{pad.down=true;pad.drawn=true;const [x,y]=pt(e);g.beginPath();g.moveTo(x,y);c.setPointerCapture(e.pointerId);};
      c.onpointermove=e=>{if(!pad.down)return;const [x,y]=pt(e);g.lineTo(x,y);g.stroke();};
      c.onpointerup=()=>{pad.down=false;};
    },0);
  };
  window.psyEsignClear=function(){if(!pad)return;pad.g.clearRect(0,0,pad.c.width,pad.c.height);pad.drawn=false;};
  window.psyEsignSave=function(fid){
    const n=(($('esN')||{}).value||'').trim();
    if(!n||!pad||!pad.drawn){const e=$('esE');if(e)e.style.display='block';return;}
    const x=px();x.consent=x.consent||{};x.consent[fid]={st:'esign',at:when()+', '+new Date().toLocaleTimeString('en-IN',{hour:'numeric',minute:'2-digit'}),by:n,sig:pad.c.toDataURL('image/png')};
    closeModal();render();toast('E-signature saved (trial, pending legal check)');
  };

  function allergyBox(){
    const al=px().allergy,has=!!(al&&al.list&&al.list.length);
    const t=!al?'Not recorded yet':(has?'Drug allergy: '+al.list.map(i=>i.drug+(i.rx?' ('+i.rx+')':'')).join(', '):'No known drug allergies');
    return `<div class="box small" style="grid-column:1/-1"><div class="row" style="justify-content:space-between;gap:10px;align-items:flex-start"><div><div class="lbl">Drug allergies</div><div style="margin-top:4px;font-weight:${has?'700':'400'};color:${has?'var(--red)':'inherit'}">${hesc(t)}</div>${al?'<div class="tiny muted">'+hesc(al.by||'')+', '+hesc(al.at||'')+'</div>':''}</div><button class="btn sm" onclick="psyAllergy(\'${S.pid}\')">${al?'Edit':'Record allergies'}</button></div></div>`;
  }
  window.psyInjury=function(v){const x=px();x.injury=x.injury||{};x.injury.yn=v;if(v==='no')x.injury.text='';render();};
  window.psyInjuryText=function(v){const x=px();x.injury=x.injury||{};x.injury.text=v;};
  function injuryBox(){
    const i=px().injury||{};
    return `<div class="box small" style="grid-column:1/-1"><div class="lbl">Physical injuries</div>
      <div class="seg" style="margin-top:6px;min-width:200px;max-width:240px"><button class="${i.yn==='no'?'on':''}" onclick="psyInjury('no')">No</button><button class="${i.yn==='yes'?'on':''}" onclick="psyInjury('yes')">Yes</button></div>
      ${i.yn==='yes'?`<textarea class="input" rows="2" style="margin-top:8px" placeholder="Where, what kind, how old" oninput="psyInjuryText(this.value)">${hesc(i.text||'')}</textarea>`:''}</div>`;
  }

  /* ---------- Admission workup: Fill form and Read only ----------
     The fields are kept in the patient's own record as you type (no Save button); the last editor and time are shown.
     Neel Bose keeps the workup that was signed on 18 Oct; other patients start empty (they used to show his text by mistake). */
  const RISKS=['Low','Moderate','High'];
  function wkData(){
    const x=px();
    if(!x.wk){
      const neel=S.pid==='neel';
      x.wk=neel?{reason:'Manic symptoms, overspending, irritability for 3 weeks',others:'Moderate',self:'Low',exam:'Unremarkable; BP 138/88',inv:['CBC','LFT','RFT','TSH','Serum lithium'],invOther:'',by:'Dr. Aanya Sharma',at:'18 Oct 2026, 12:30 pm',signed:true}
        :{reason:'',others:'',self:'',exam:'',inv:[],invOther:'',by:'',at:'',signed:false};
    }
    return x.wk;
  }
  const riskText=w=>(w.others||w.self)?'Harm to others: '+(w.others||'not recorded').toLowerCase()+' · suicide: '+(w.self||'not recorded').toLowerCase():'';
  window.psyWk=function(k,v){const w=wkData();w[k]=v;w.edited=true;w.by=signer();w.at=atNow();w.signed=false;const e=document.getElementById('wkEdited');if(e)e.textContent='Edited by '+w.by+', '+w.at;};
  window.psyWkInv=function(name,on){const w=wkData();w.inv=(w.inv||[]).filter(i=>i!==name);if(on)w.inv.push(name);psyWk('inv',w.inv);};
  const WK_ROUTINE_INV=['CBC','LFT','RFT','Lipid profile','HbA1c','Fasting sugar','TSH','ECG'];
  window.psyWkRoutine=function(){const w=wkData();w.inv=[...new Set([...(w.inv||[]),...WK_ROUTINE_INV])];psyWk('inv',w.inv);render();toast('Routine admission investigations added');};
  window.psyWkView=function(v){S.wkView=v;render();};
  function workupCard(isPsyUser){
    const w=wkData(),v=S.wkView==='form'?'form':'read',full=!!S.admFull;
    const seg=`<div class="seg" style="align-self:flex-start;min-width:240px"><button class="${v==='read'?'on':''}" onclick="psyWkView('read')">Read only</button><button class="${v==='form'?'on':''}" onclick="psyWkView('form')">Fill form</button></div>`;
    const status=w.edited?`<span id="wkEdited" class="small muted">Edited by ${hesc(w.by)}, ${hesc(w.at)}</span>`:w.signed?`<span id="wkEdited" class="small" style="color:#067647;font-weight:600">Signed ${hesc((w.at||'').split(',')[0].replace(/ 20\d\d/,''))} · ${hesc(w.by)}</span>`:`<span id="wkEdited" class="small muted">Not filled in yet</span>`;
    /* treatment chart: the table is shared with the RMO's screen */
    const tt=document.createElement('template');tt.innerHTML=(typeof wkTreatment==='function')?wkTreatment():'';
    const tb=tt.content.firstElementChild;
    if(tb){
      const sc=tb.querySelector('.scroll');
      if(sc&&/No medicines in the chart yet/.test(sc.textContent)&&isPsyUser){sc.innerHTML='<div class="small muted">No medicines added yet</div>';}
      if(v==='read'&&sc){let n=sc.nextElementSibling;while(n){const m=n.nextElementSibling;n.remove();n=m;}} /* read-only view: no Add medicine form */
    }
    const chartHtml=tb?tb.outerHTML:'';
    const al=px().allergy,hasAl=!!(al&&al.list&&al.list.length);
    const alTxt=!al?'Not recorded yet':(hasAl?'Drug allergy: '+al.list.map(i=>i.drug+(i.rx?' ('+i.rx+')':'')).join(', '):'No known drug allergies');
    const alHtml=`<div class="box small" style="grid-column:1/-1"><div class="row" style="justify-content:space-between;gap:10px;align-items:flex-start"><div><div class="lbl">Drug allergies</div><div style="margin-top:4px;font-weight:${hasAl?'700':'400'};color:${hasAl?'var(--red)':'inherit'}">${hesc(alTxt)}</div>${al?'<div class="tiny muted">'+hesc(al.by||'')+', '+hesc(al.at||'')+'</div>':''}</div>${v==='form'?`<button class="btn sm" onclick="psyAllergy('${S.pid}')">${al?'Edit':'Record allergies'}</button>`:''}</div></div>`;
    const inj=px().injury||{};
    let body;
    if(v==='read'){
      const rv=(l,t)=>`<div class="box small"><div class="lbl">${l}</div><div style="margin-top:4px">${t?hesc(t):'<span class="muted">Not filled in</span>'}</div></div>`;
      const inv=[...(w.inv||[]),...(w.invOther?[w.invOther]:[])].join(', ');
      body=`<div class="pad grid2">${rv('Reason for admission',w.reason)}${rv('Risk at admission',riskText(w))}${rv('Physical examination',w.exam)}${rv('Investigations sent',inv)}${alHtml}
        <div class="box small" style="grid-column:1/-1"><div class="lbl">Physical injuries</div><div style="margin-top:4px">${inj.yn==='yes'?'Yes · '+hesc(inj.text||'not described'):inj.yn==='no'?'No':'<span class="muted">Not filled in</span>'}</div></div>${chartHtml}</div>`;
    }else{
      const sel=(k,val)=>`<select class="input" onchange="psyWk('${k}',this.value)"><option value="">Choose…</option>${RISKS.map(r=>`<option ${val===r?'selected':''}>${r}</option>`).join('')}</select>`;
      const INV=(typeof INV_LIST!=='undefined'?INV_LIST:[]);
      body=`<div class="pad grid2">
        <label class="field" style="grid-column:1/-1"><span class="lbl">Reason for admission</span><textarea class="input" rows="2" oninput="psyWk('reason',this.value)" placeholder="Why the patient is being admitted, and for how long the symptoms have been there">${hesc(w.reason||'')}</textarea></label>
        <label class="field"><span class="lbl">Risk of harm to others</span>${sel('others',w.others)}</label>
        <label class="field"><span class="lbl">Risk of suicide</span>${sel('self',w.self)}</label>
        <label class="field" style="grid-column:1/-1"><span class="lbl">Physical examination</span><textarea class="input" rows="2" oninput="psyWk('exam',this.value)" placeholder="Findings, BP, pulse">${hesc(w.exam||'')}</textarea></label>
        <div class="field" style="grid-column:1/-1"><div class="row" style="justify-content:space-between;gap:8px;margin-bottom:6px"><span class="lbl">Investigations sent</span><button class="btn sm" type="button" onclick="psyWkRoutine()">Add routine investigations</button></div><div class="mini-chips">${INV.map(n=>`<button class="tog ${(w.inv||[]).includes(n)?'on':''}" style="height:30px;font-size:12.5px" onclick="psyWkInv('${n}',!this.classList.contains('on'));this.classList.toggle('on')">${n}</button>`).join('')}</div>
          <input class="input" style="margin-top:6px" placeholder="Any other test" value="${hesc(w.invOther||'')}" oninput="psyWk('invOther',this.value)"></div>
        ${alHtml}${injuryBox()}${chartHtml}</div>`;
    }
    return `<section class="card ${full?'adm-full':''}" id="workupCard"><div class="hd"><div><h3>Admission workup</h3><div style="margin-top:4px">${status}</div></div>
      <div class="row" style="gap:8px"><button class="btn sm" onclick="S.admFull=!S.admFull;render()">${full?'Exit full screen':'⤢ Full screen'}</button></div></div>
      <div style="padding:14px 20px 0">${seg}</div>${body}</section>`;
  }

  const __pa=pAdmission;
  pAdmission=function(){
    const h=__pa.apply(this,arguments);
    const doIt=psy(),rmo=S.role==='rmo';
    if(!doIt&&!rmo)return h;
    const sec=S.admSec||'hist';
    const t=document.createElement('template');t.innerHTML=h;
    const root=t.content;
    if(doIt){
      /* no allergy card on top of the steps: allergies are recorded in the Admission workup (step 2); a recorded allergy still shows in the header */
      root.querySelectorAll('section.card').forEach(s=>{const x=s.textContent||'';if(/^\s*Allergies/.test(x)&&s.querySelectorAll('h3').length===0)s.remove();});
      /* Admission documents once, under step 2 with the admission workup */
      if(sec!=='workup'){const d=root.querySelector('#admdocs');if(d)d.remove();}
      /* Admission forms as a table */
      if(sec==='forms'){
        const f=[...root.querySelectorAll('section.card')].find(s=>{const h3=s.querySelector('h3');return h3&&/^Admission forms$/.test(h3.textContent.trim());});
        if(f){const tt=document.createElement('template');tt.innerHTML=consentCard();f.replaceWith(tt.content.firstElementChild);}
      }
    }
    if(sec==='workup'){
      /* the whole workup card is replaced by one with Fill form / Read only (same switch as Detailed history and Capacity assessment) */
      const wk=[...root.querySelectorAll('section.card')].find(s=>{const h3=s.querySelector('h3');return h3&&/^Admission workup$/.test(h3.textContent.trim());});
      if(wk){const tt=document.createElement('template');tt.innerHTML=workupCard(doIt);wk.replaceWith(tt.content.firstElementChild);}
    }
    return t.innerHTML;
  };

  /* ---------- 5. Detailed history and Capacity assessment: views, AI help, full screen ---------- */
  const cssF=document.createElement('style');cssF.id='psy-review2-css2';
  cssF.textContent=`
  .adm-full{position:fixed!important;inset:0;z-index:90;overflow:auto;border-radius:0!important;margin:0!important;background:#fff;padding:12px 28px 28px}
  .ai-sum{display:flex;flex-direction:column;gap:8px}
  .ai-sum .r{border:1px solid var(--line);border-radius:12px;padding:10px 14px;display:flex;gap:12px;align-items:flex-start;justify-content:space-between}
  .ai-sum .r b{display:block;font-size:12px;color:var(--muted);margin-bottom:2px}`;
  document.head.appendChild(cssF);

  const copyText=t=>{
    const done=()=>toast('Copied');
    try{if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t).then(done,()=>{fb(t);done();});return;}}catch(e){}
    fb(t);done();
    function fb(x){const a=document.createElement('textarea');a.value=x;a.style.position='fixed';a.style.opacity='0';document.body.appendChild(a);a.select();try{document.execCommand('copy');}catch(e){}a.remove();}
  };
  const AIS=[]; /* text of each AI summary block, for the Copy buttons */
  window.psyCopyAi=function(i){copyText(AIS[i]||'');};
  const val=v=>Array.isArray(v)?v.join(', '):String(v==null?'':v);

  function aiSummary(){
    AIS.length=0;
    if(!S.historyDraft||typeof HDRAFT==='undefined')return `<div class="callout grey">No AI summary yet. Press <b>Draft with AI scribe</b> and record the interview; the summary appears here under headings, and you copy what is relevant into the form.</div>`;
    const keys=Object.keys(HDRAFT).filter(k=>HDRAFT[k]&&(!Array.isArray(HDRAFT[k])||HDRAFT[k].length));
    return `<div class="ai-sum"><div class="small muted">Written by the AI scribe from the interview. It is not in the form until you copy it there. Read it before you use it.</div>${keys.map(k=>{AIS.push(val(HDRAFT[k]));const i=AIS.length-1;return `<div class="r"><div style="min-width:0"><b>${hesc(k)}</b>${hesc(val(HDRAFT[k]))}</div><button class="btn sm" onclick="psyCopyAi(${i})">Copy</button></div>`;}).join('')}</div>`;
  }

  /* suggested diagnostic formulation: built only from what is already in the history; the doctor edits it, copies it and pastes it in */
  function suggestion(){
    const d=(S.historyDraft&&typeof HDRAFT!=='undefined')?HDRAFT:{};
    const g=k=>val(d[k]).trim();
    const p=ptFind(S.pid)||PTS.find(x=>x.id===S.pid)||{};
    const who=[(window.psyAgeSex?psyAgeSex(p):''),g('Marital status').toLowerCase(),g('Occupation').toLowerCase()].filter(Boolean).join(', ');
    const cc=g('Chief complaints (chronological, with duration)');
    const dx=(S.dx||p.dx||'').trim();
    if(!cc&&!dx)return '';
    return [who?'Patient: '+who+'.':'',cc?'Presenting with '+cc.charAt(0).toLowerCase()+cc.slice(1).replace(/\.$/,'')+'.':'',dx?'Working diagnosis: '+dx+'.':'',
      'Predisposing, precipitating and perpetuating factors, and protective factors: to be added by the doctor from the history.'].filter(Boolean).join(' ');
  }
  window.psyFormulationOpen=function(){
    const t=suggestion();
    V3.modal('Suggested diagnostic formulation','A suggestion from the information already in the form. Edit it, copy it, and paste it into the box yourself.',
      t?`<textarea class="input" id="frT" rows="8" readonly style="width:100%">${hesc(t)}</textarea><div class="tiny muted" style="margin-top:6px">Not saved into the form. You decide what goes in.</div>`
       :`<div class="callout grey">Not enough is filled in yet. Fill the chief complaints and diagnosis, or record with the AI scribe, and try again.</div>`,
      t?`<button class="btn" onclick="closeModal()">Close</button><button class="btn" onclick="var a=document.getElementById('frT');a.removeAttribute('readonly');a.focus()">Edit</button><button class="btn pri" onclick="psyFrCopy()">Copy</button>`:`<button class="btn" onclick="closeModal()">Close</button>`);
  };
  window.psyFrCopy=function(){const a=document.getElementById('frT');if(a)copyText(a.value);};

  /* signing a history the AI scribe helped with: the doctor confirms they read it (accountability) */
  window.psyHistSign=function(){
    V3.modal('Sign this detailed history','The AI scribe helped fill this form.',
      `<label class="row" style="gap:10px;align-items:flex-start"><input type="checkbox" id="hsOk" style="margin-top:4px"><span>I have read every field, including the ones filled by the AI scribe, and I am responsible for this form.</span></label><div id="hsE" class="small" style="color:var(--red);display:none;margin-top:8px">Tick the box to sign</div>`,
      `<button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="psyHistSignGo()">Sign</button>`);
  };
  window.psyHistSignGo=function(){
    if(!($('hsOk')||{}).checked){const e=$('hsE');if(e)e.style.display='block';return;}
    S.historyStatus='signed';S.historySignedAt=atNow();S.historySignedBy=signer();S.done.hist=true;closeModal();render();toast('Detailed history signed by '+signer()+'. Task closed in Inpatient dashboard.');
  };

  /* capacity assessment: the same Fill form / Read only layout as the detailed history */
  const CAPREAD=[['Purpose','Admission'],['Advance directive','Absent · NR: Ananya Bose, sister'],['Obvious lack of capacity','No'],['1A Oriented · 1B Informed · 1C Follows commands · 1D Acknowledges illness','Yes · Yes · Yes · No'],['2A Agrees to treatment · 2C Explains refusal','No · No'],['3A Communicates decision','Yes'],['Conclusion','4B · Needs 100% support from nominated representative'],['Assessed by','Dr. Aanya Sharma · 18 Oct, 1:30 pm · NR signed']];
  let capPad=null;
  function capReadBody(){
    const d=px().capacityDraft||{};
    if(!d.inputs&&!d.answers)return `<div class="grid2">${CAPREAD.map(f=>`<div class="box small"><div class="lbl">${f[0]}</div><div style="margin-top:4px;font-weight:600">${f[1]}</div></div>`).join('')}</div>`;
    const t=document.createElement('template');t.innerHTML=capForm(true);const controls=[...t.content.querySelectorAll('input,select,textarea')],groups=[...t.content.querySelectorAll('.radios')];
    if(d.inputs&&d.inputs.length===controls.length)controls.forEach((el,i)=>{el.value=d.inputs[i]||'';});
    if(d.answers&&d.answers.length===groups.length)groups.forEach((g,i)=>[...g.querySelectorAll('.tog')].forEach((b,j)=>b.classList.toggle('on',j===d.answers[i])));
    controls.forEach(el=>{const s=document.createElement('div');s.className='cap-read-value';s.textContent=el.value||'Not filled in';el.replaceWith(s);});
    groups.forEach(g=>{const s=document.createElement('div');s.className='cap-read-value';s.textContent=[...g.querySelectorAll('.tog.on')].map(b=>b.textContent.trim()).join(' · ')||'Not answered';g.replaceWith(s);});
    return `<div class="pad" style="padding:14px 20px">${t.innerHTML}</div>`;
  }
  window.psyCapSign=function(){
    const card=document.getElementById('capCard');if(!card)return;
    const conclusion=card.querySelector('.cap-concl .tog.on');
    const patientSigns=!conclusion||/^4A/.test(conclusion.textContent.trim());
    V3.modal('Review and sign capacity assessment','Confirm the assessment, then capture the patient or nominated representative signature.',
      `<label class="row small" style="align-items:flex-start;gap:8px"><input type="checkbox" id="capConfirm" style="margin-top:3px"><span>I reviewed the full assessment and confirm it is accurate.</span></label>
       <label class="field" style="margin-top:10px"><span class="lbl">${patientSigns?'Patient name':'Nominated representative name'}</span><input id="capSigner" class="input" value="${patientSigns?'':hesc((px().capacityDraft&&px().capacityDraft.rep)||'Ananya Bose')}" placeholder="Full name"></label>
       <div class="lbl" style="margin:10px 0 6px">${patientSigns?'Patient':'Nominated representative'} signature</div><canvas id="capSigCanvas" width="520" height="130" style="width:100%;height:130px;background:#fff;border:1px solid #cbd5e1;border-radius:10px;touch-action:none"></canvas>
       <div id="capSigError" class="tiny" style="color:#b42318;display:none;margin-top:6px">Confirm, enter the name and sign in the box.</div>`
      ,`<button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="psyCapSignSave(${patientSigns})">Save signed assessment</button>`);
    setTimeout(()=>{const c=document.getElementById('capSigCanvas');if(!c)return;const g=c.getContext('2d');g.lineWidth=2.2;g.lineCap='round';g.strokeStyle='#101828';capPad={c,g,down:false,drawn:false};const p=e=>{const r=c.getBoundingClientRect();return[(e.clientX-r.left)*c.width/r.width,(e.clientY-r.top)*c.height/r.height]};c.onpointerdown=e=>{capPad.down=true;capPad.drawn=true;const[x,y]=p(e);g.beginPath();g.moveTo(x,y);c.setPointerCapture(e.pointerId)};c.onpointermove=e=>{if(!capPad||!capPad.down)return;const[x,y]=p(e);g.lineTo(x,y);g.stroke()};c.onpointerup=()=>{if(capPad)capPad.down=false};},0);
  };
  window.psyCapSignSave=function(patientSigns){const name=(($('capSigner')||{}).value||'').trim(),ok=!!(($('capConfirm')||{}).checked);if(!ok||!name||!capPad||!capPad.drawn){const e=$('capSigError');if(e)e.style.display='block';return;}if(window.psyCapSave)window.psyCapSave();const d=px().capacityDraft||{};px().capacitySigned={...d,signedBy:signer(),signedAt:atNow(),person:name,personType:patientSigns?'Patient':'Nominated representative',signature:capPad.c.toDataURL('image/png')};closeModal();S.capView='read';render();toast('Capacity assessment signed and saved');};
  function capCard(){
    const v=S.capView==='form'?'form':'read',full=!!S.admFull;
    const seg=`<div class="seg" style="align-self:flex-start;min-width:240px"><button style="white-space:nowrap" class="${v==='form'?'on':''}" aria-pressed="${v==='form'}" onclick="S.capView='form';render()">Fill form</button><button style="white-space:nowrap" class="${v==='read'?'on':''}" aria-pressed="${v==='read'}" onclick="S.capView='read';render()">Read only</button></div>`;
    const signed=px().capacitySigned;
    const body=v==='read'?`${capReadBody()}${signed?`<div class="box small" style="margin:12px 20px"><div class="lbl">Signatures</div><div style="margin-top:6px;font-weight:600">Assessed by ${hesc(signed.signedBy)} · ${hesc(signed.signedAt)}</div><div class="small" style="margin-top:6px">${hesc(signed.personType)}: ${hesc(signed.person)}</div><img alt="Saved signature" src="${signed.signature}" style="display:block;max-width:260px;height:65px;object-fit:contain;object-position:left center;border-bottom:1px solid #98a2b3"></div>`:''}`
      :`${capForm(true)}<div class="row" style="justify-content:flex-end;gap:8px"><button class="btn" onclick="psyCapSave()">Save draft</button><button class="btn pri" onclick="psyCapSign()">Review and sign</button></div>`;
    return `<section class="card ${full?'adm-full':''}" id="capCard"><div class="hd"><div><h3>Capacity assessment</h3><div class="small muted" style="margin-top:4px">MHA 2017 capacity assessment for treatment decisions including admission</div></div>
      <div class="row" style="gap:8px">${chip(signed?'Signed '+(signed.signedAt||''):'Draft','c-green')}<button class="btn sm" onclick="S.admFull=!S.admFull;render()">${full?'Exit full screen':'⤢ Full screen'}</button></div></div>
      <div class="pad" style="display:flex;flex-direction:column;gap:14px">${seg}${body}</div></section>`;
  }

  /* Fill form is the doctor's own (blank); only the AI-filled form shows the scribe's draft in the fields */
  const __fld=fld;
  fld=function(f,ro){
    if(psy()&&S.historyDraft&&S.hview!=='aifill'){const d=S.historyDraft;S.historyDraft=false;try{return __fld.apply(this,arguments);}finally{S.historyDraft=d;}}
    return __fld.apply(this,arguments);
  };

  const __pa5=pAdmission;
  pAdmission=function(){
    const h=__pa5.apply(this,arguments);if(!psy())return h;
    const sec=S.admSec||'hist';
    if(sec!=='hist'&&sec!=='capadm')return h;
    const t=document.createElement('template');t.innerHTML=h;const root=t.content;
    if(sec==='capadm'){
      const ol=root.querySelector('ol.adm-steps');
      [...root.querySelectorAll('section.card')].filter(s=>!ol||(ol.compareDocumentPosition(s)&Node.DOCUMENT_POSITION_FOLLOWING)).forEach(s=>s.remove());
      const tt=document.createElement('template');tt.innerHTML=capCard();root.appendChild(tt.content);
      return t.innerHTML;
    }
    /* detailed history */
    const card=[...root.querySelectorAll('section.card')].find(s=>{const h3=s.querySelector('h3');return h3&&/^Detailed history/.test(h3.textContent.trim());});
    if(!card)return h;
    const hv=S.hview==='read'?'read':S.hview==='ai'?'ai':S.hview==='aifill'?'aifill':'form';
    const seg=card.querySelector('.seg');
    if(seg){
      const n=document.createElement('div');n.className='seg hist-seg';n.setAttribute('style','align-self:flex-start;width:max-content;max-width:100%;min-width:0;overflow-x:auto;position:relative;z-index:2;white-space:nowrap');
      n.innerHTML=`<button type="button" style="position:relative;z-index:2;pointer-events:auto" class="${hv==='read'?'on':''}" onclick="S.hview='read';render()">Read only</button><button type="button" style="position:relative;z-index:2;pointer-events:auto" class="${hv==='form'?'on':''}" onclick="S.hview='form';render()">Fill form</button><button type="button" style="position:relative;z-index:2;pointer-events:auto" class="${hv==='ai'?'on':''}" onclick="S.hview='ai';render()">AI summary</button><button type="button" style="position:relative;z-index:2;pointer-events:auto" class="${hv==='aifill'?'on':''}" onclick="S.hview='aifill';render()">AI-filled form</button>`;
      const scribe=card.querySelector('#scrH');if(scribe){scribe.classList.add('sm');scribe.style.whiteSpace='nowrap';n.appendChild(scribe);}
      seg.replaceWith(n);
      if(hv==='ai'){const nx=n.nextElementSibling;const tt=document.createElement('template');tt.innerHTML=aiSummary();if(nx)nx.replaceWith(tt.content);else n.after(tt.content);}
      if(hv==='aifill'){
        const nx=n.nextElementSibling,tt=document.createElement('template');
        tt.innerHTML=S.historyDraft?'<div class="callout" style="background:var(--blue-tint);border-color:#bcd4fa;color:var(--blue-ink)"><strong>Filled by the AI scribe</strong> from the interview. Read every field, change what is wrong, then sign. You are responsible for what is signed.</div>'
          :'<div class="callout grey">Nothing is filled yet. Press <b>Draft with AI scribe</b> and record the interview; the form fills itself and you check it here.</div>';
        if(!S.historyDraft&&nx)nx.remove();
        n.after(tt.content);
      }
    }
    /* full screen */
    const hd=card.querySelector('.hd');
    if(hd){const b=document.createElement('button');b.className='btn sm';b.setAttribute('onclick','S.admFull=!S.admFull;render()');b.textContent=S.admFull?'Exit full screen':'⤢ Full screen';hd.appendChild(b);}
    if(S.admFull)card.classList.add('adm-full');
    /* AI formulation suggestion above the formulation box */
    const lbl=[...card.querySelectorAll('label.hf.wide .lbl')].find(l=>l.textContent.trim()==='Diagnostic formulation');
    if(lbl){const lab=lbl.closest('label');const d=document.createElement('div');d.className='row';d.style.cssText='justify-content:flex-end;margin-bottom:4px';d.innerHTML='<button type="button" class="btn sm" onclick="psyFormulationOpen()">Suggest formulation (AI)</button>';lab.parentNode.insertBefore(d,lab);}
    /* AI-assisted: signing asks the doctor to confirm */
    if(S.historyDraft&&S.historyStatus!=='signed'){
      [...card.querySelectorAll('button')].filter(b=>/Review and sign/.test(b.textContent)).forEach(b=>b.setAttribute('onclick','psyHistSign()'));
    }
    return t.innerHTML.split('Final diagnosis (ICD)').join('Differential diagnosis (ICD)');
  };
})();
