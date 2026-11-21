/* 21 Nov 2026, meeting: foreign nationals have a separate admission form handled by Chandraji, so the Patient Experience tab gets a
   "Foreign national" card (also in the Patient Experience app, Preferences). Psychiatrist, floor lead psychiatrist and RMO.
   The first question is "Is the patient a foreign national?"; the other fields appear only when the answer is Yes. Saved as the doctor types,
   in the patient's own record (psyx.foreign). Shown in both views: Fill form (a card in the grid) and Read only (a summary card).
   21 Nov, owner ("add relevant things"):
   - The psychiatrist's Patient Experience tab is view only (block 53), so the card could never be answered there. The read-only card now
     has Yes and No buttons, and "Edit details" opens the questions in a pop-up (saved as the doctor types, like the form).
   - The fields are grouped (Passport and visa, Registration, Family and language, Stay and going home) and new ones are added: passport
     and visa valid until, arrival in India, copies on file, embassy told about the admission, local contact or attendant in India,
     return travel. Visa type is a list (Nepal and Bhutan need no visa).
   - Lines at the top show what needs doing: visa or passport expired or ending within 30 days, visa end date not recorded, FRRO C-form
     not submitted, Chandraji's admission form pending. Until the question is answered, the card says what it will hold.
   - With Yes the card takes the full width. The first 13 fields keep their saved keys (f0 to f12); the new ones have names.
   The fields are still a first list, to be confirmed with Chandraji. */
(function(){
  const ROLE=String((window.__TULASI__||{}).role||'');
  if(!/^(psychiatrist|floor-lead-psychiatrist|rmo)$/.test(ROLE))return;
  if(typeof pPrefs!=='function')return;
  const E=s=>hesc(String(s==null?'':s));
  const SEEN=['Front desk','Admin (Chandraji)','Patient experience'];
  const NOVISA='No visa needed (Nepal, Bhutan)';
  const VISA=['Medical or e-Medical','Medical attendant','Tourist','Business','Employment','Student','OCI card holder',NOVISA,'Other'];
  /* [key, label, type, options]. f0 to f12 are the keys saved before this change. */
  const G=[
    ['Passport and visa',[['f0','Nationality','txt'],['f1','Passport number','txt'],['ppExp','Passport valid until','date'],['f2','Visa type','sel',VISA],
      ['visaExp','Visa valid until','date'],['arrived','Arrived in India on','date'],['copies','Passport and visa copies on file','sel',['Yes','No']],
      ['f11','Where the passport is kept','sel',['With the patient','Locker','Front desk']]]],
    ['Registration',[['f3','FRRO C-form submitted?','sel',['Yes','No','Pending']],['f4','Separate admission form (Chandraji)','sel',['Done','Pending']],
      ['emb','Embassy told about the admission','sel',['Yes','No','Not needed']],['f5','Embassy or consulate contact','txt']]],
    ['Family and language',[['f6','Language and interpreter needed','txt'],['f7','Contact abroad (name, number with country code, time zone)','txt'],
      ['local','Local contact or attendant in India (name, relation, number)','txt'],['f8','How to update the family abroad','sel',['WhatsApp','Email','Video call','Phone call']]]],
    ['Stay and going home',[['f9','Diet, religious or cultural needs','txt'],['f10','Payment (currency, insurance, who pays)','sel',['Self, in India','Family abroad','Insurance','Embassy','Other']],
      ['travel','Return travel (date, escort, fit-to-fly letter)','txt'],['f12','Anything else for the admission','txt']]]];
  const short=l=>l.split(' (')[0].split('?').join('');
  const rec=()=>{const x=psyPx(S.pid);return x.foreign=x.foreign||{};};
  window.fnSet=function(k,v,redraw){const r=rec();r[k]=v;if(redraw||k==='yes')render();};

  /* dates */
  const day0=()=>{const t=new Date();t.setHours(0,0,0,0);return t;};
  const toD=iso=>{const d=new Date(String(iso||'')+'T00:00:00');return isNaN(d)?null:d;};
  const fmt=iso=>{const d=toD(iso);return d?d.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}):String(iso||'');};
  /* what needs doing, worst first */
  function flags(r){
    const L=[];
    const exp=(k,what)=>{const d=toD(r[k]);if(!d)return;const n=Math.round((d-day0())/864e5);
      if(n<0)L.push(['bad',what+' expired on '+fmt(r[k])]);else if(n<=30)L.push(['warn',what+' ends in '+n+(n===1?' day':' days')+', on '+fmt(r[k])]);};
    exp('visaExp','Visa');exp('ppExp','Passport');
    if(!r.visaExp&&r.f2!==NOVISA)L.push(['warn','Visa end date not recorded']);
    if(r.f3!=='Yes')L.push(['warn','FRRO C-form not submitted yet']);
    if(r.f4!=='Done')L.push(['warn','Separate admission form (Chandraji) pending']);
    L.sort((a,b)=>(a[0]==='bad'?0:1)-(b[0]==='bad'?0:1));
    return L.length?L:[['ok','Visa, FRRO C-form and admission form are in order']];
  }
  const ICON={bad:'<path d="M18 6 6 18M6 6l12 12"/>',warn:'<path d="M12 8v5M12 16.5h.01"/><circle cx="12" cy="12" r="9"/>',ok:'<path d="m5 12.5 4.5 4.5L19 7.5"/>'};
  const flagHtml=r=>`<div class="fn-flags">${flags(r).map(([t,s])=>`<div class="fn-flag ${t}"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[t]}</svg><span>${E(s)}</span></div>`).join('')}</div>`;

  /* the questions, used by the Fill form card and by the pop-up */
  function sel(r,k,l,opts){const v=r[k]||'',o=(v&&opts.indexOf(v)<0)?[v].concat(opts):opts;
    return `<label class="field"><span class="lbl">${E(l)}</span><select class="input" onchange="fnSet('${k}',this.value,1)"><option value=""></option>${o.map(x=>`<option ${v===x?'selected':''}>${E(x)}</option>`).join('')}</select></label>`;}
  const inp=(r,k,l)=>`<label class="field"><span class="lbl">${E(l)}</span><input class="input" value="${E(r[k]||'')}" oninput="fnSet('${k}',this.value)"></label>`;
  const dat=(r,k,l)=>`<label class="field"><span class="lbl">${E(l)}</span><input class="input" type="date" value="${E(r[k]||'')}" onchange="fnSet('${k}',this.value,1)"></label>`;
  const groups=r=>G.map(([g,fs])=>`<div class="fn-g"><h5>${E(g)}</h5><div class="fn-fields">${fs.map(f=>f[2]==='sel'?sel(r,f[0],f[1],f[3]):f[2]==='date'?dat(r,f[0],f[1]):inp(r,f[0],f[1])).join('')}</div></div>`).join('');

  /* Fill form view */
  function formCard(r){
    const yes=r.yes==='Yes';
    const body=yes?flagHtml(r)+groups(r)
      :`<div class="tiny muted">${r.yes==='No'?'Nothing else to record.':'Passport, visa, FRRO C-form, embassy, family abroad and payment questions open when the answer is Yes.'}</div>`;
    return `<section class="card pad fn-card${yes?' fn-wide':''}" id="fnCard"><div class="row" style="justify-content:space-between;gap:8px;flex-wrap:wrap"><h3>Foreign national</h3><span class="row" style="gap:4px;flex-wrap:wrap">${SEEN.map(x=>`<span class="chip c-grey">${E(x)}</span>`).join('')}</span></div>
      <div class="fn-q">${sel(r,'yes','Is the patient a foreign national?',['Yes','No'])}</div>${body}</section>`;
  }

  /* pop-up with the questions (the psychiatrist's tab is view only) */
  window.fnEdit=function(){
    const r=rec();
    V3.modal('Foreign national','Saved as you type. Seen by '+E(SEEN.join(' · '))+'.',
      `<div class="fn-q">${sel(r,'yes','Is the patient a foreign national?',['Yes','No'])}</div>${groups(r)}`,
      '<button class="btn pri" onclick="closeModal();render()">Done</button>','min(780px,100%)');
  };

  /* Read only view */
  function readCard(r){
    const yes=r.yes==='Yes',no=r.yes==='No';
    const val=f=>{const v=r[f[0]];return v?(f[2]==='date'?fmt(v):v):'';};
    const row=(l,v)=>`<div class="fn-row"><dt>${E(l)}</dt><dd class="${v?'':'none'}">${v?E(v):'Not set'}</dd></div>`;
    const ans=yes?`<b>Yes</b><button type="button" class="btn sm" onclick="fnEdit()">Edit details</button>`
      :no?`<b>No</b><button type="button" class="btn sm" onclick="fnSet('yes','')">Change</button>`
      :`<button type="button" class="btn sm" onclick="fnSet('yes','Yes');fnEdit()">Yes</button><button type="button" class="btn sm" onclick="fnSet('yes','No')">No</button>`;
    const q=`<div class="fn-row fn-qrow"><dt>Is the patient a foreign national?</dt><dd><span class="fn-ans">${ans}</span></dd></div>`;
    let body='';
    if(yes)body=flagHtml(r)+`<div class="fn-cols">${G.map(([g,fs])=>`<div class="fn-g"><h5>${E(g)}</h5><dl>${fs.map(f=>row(short(f[1]),val(f))).join('')}</dl></div>`).join('')}</div>`;
    else if(no)body=`<div class="fn-note">Not a foreign national. Nothing else to record.</div>`;
    else body=`<div class="fn-pre"><div class="fn-pre-h">If Yes, this card holds</div><ul>${G.map(([g,fs])=>`<li><b>${E(g)}</b><span>${E(fs.map(f=>short(f[1])).join(' · '))}</span></li>`).join('')}</ul></div>`;
    return `<section class="pxs-card fn-card${yes?' fn-wide':''}"><div class="pxs-hd"><h4>Foreign national</h4><span class="pxs-seen">Seen by ${E(SEEN.join(' · '))}</span></div><dl class="fn-dl">${q}</dl>${body}</section>`;
  }

  const css=document.createElement('style');
  css.textContent=`
  .fn-wide{grid-column:1/-1}
  .fn-card .fn-row{display:grid;grid-template-columns:minmax(110px,42%) minmax(0,1fr);gap:10px;padding:7px 0;border-top:1px solid #eef0f3;margin:0}
  .fn-card .fn-row dt{font-size:13px;color:#475467}.fn-card .fn-row dd{margin:0;font-size:14px;font-weight:600;color:#101828;overflow-wrap:anywhere}.fn-card .fn-row dd.none{font-weight:400;color:#667085}
  .fn-card .fn-dl{margin:0}.fn-card .fn-qrow{border-top:0;align-items:center;padding-top:4px}
  .fn-ans{display:inline-flex;align-items:center;gap:8px;flex-wrap:wrap}.fn-ans b{font-weight:700;margin-right:4px}
  .fn-cols{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:4px 28px}.fn-cols dl{margin:0}
  .fn-g h5{margin:14px 0 4px;font-size:11.5px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:#667085}
  .fn-fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:4px 14px}.fn-fields>.field{display:flex;flex-direction:column;justify-content:flex-end}
  .fn-q{max-width:340px}
  .fn-flags{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0 2px}
  .fn-flag{display:inline-flex;align-items:center;gap:6px;padding:5px 10px;border-radius:8px;font-size:12.5px;font-weight:600;line-height:1.3}
  .fn-flag svg{flex:none}.fn-flag.warn{background:#fffaeb;color:#b54708;border:1px solid #fedf89}.fn-flag.bad{background:#fef3f2;color:#b42318;border:1px solid #fecdca}.fn-flag.ok{background:#ecfdf3;color:#067647;border:1px solid #abefc6}
  .fn-pre{margin-top:6px;padding:10px 12px;border-radius:10px;background:#f8fafc;border:1px solid #eef2f6}
  .fn-pre-h{font-size:12px;font-weight:600;color:#475467;margin-bottom:6px}
  .fn-pre ul{list-style:none;margin:0;padding:0;display:grid;gap:6px}.fn-pre li{font-size:12.5px;line-height:1.4;color:#667085}.fn-pre li b{display:block;font-size:12.5px;font-weight:650;color:#344054}
  .fn-note{font-size:12.5px;color:#667085;margin-top:6px}
  @media(max-width:900px){.fn-cols,.fn-fields{grid-template-columns:1fr}}`;
  document.head.appendChild(css);

  const __p=pPrefs;
  pPrefs=function(){
    const h=__p.apply(this,arguments);
    try{
      const t=document.createElement('template');t.innerHTML=h;const r=rec();
      const g=t.content.querySelector('.pxs-grid');
      if(g)g.insertAdjacentHTML('beforeend',readCard(r));
      else{const o=t.content.querySelector('.ovgrid');if(o)o.insertAdjacentHTML('beforeend',formCard(r));}
      const d=document.createElement('div');d.appendChild(t.content);return d.innerHTML;
    }catch(e){return h;}
  };
})();
