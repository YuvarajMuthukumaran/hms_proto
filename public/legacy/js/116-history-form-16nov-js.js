/* 16 Nov 2026, Dr. Anu's feedback on the Detailed history form (WhatsApp notes and videos). Psychiatrist screens only.
   1. A step only shows its tick when every question of that step is answered (not just because you moved on).
   2. Everything typed in the form is kept (text boxes too), and Read only shows what was filled in the form, nothing else (no made-up demo answers on real patients).
   3. Informant's report on three single lines (family member, relationship, duration, reliability / predisposing, precipitating, perpetuating / mode of onset, course, progress).
      Identification marks and Reliability share a line in Patient's report. Chief complaints and History of present illness get big boxes.
   4. Concomitant changes: Bladder and bowel sit beside Sleep.
   5. Treatment and past illness: past psychiatric, past medical or surgical, self-harm or suicidal ideation are Yes / No (free text only when Yes).
      Forensic history moves to Personal history. Personal history uses drop-downs.
   6. Family tree is a small table (relation, age, sex, marital status, education, occupation).
   7. The risk screen under the form is a drop-down that records the result and sets the risk of harm. */
(function(){
  const isPsy=()=>String((window.__TULASI__||{}).role||'')==='psychiatrist';
  if(!isPsy())return;
  const E=s=>hesc(String(s==null?'':s));
  const today=()=>new Date().toISOString().slice(0,10);
  const O=(...a)=>a;
  const px=()=>psyPx(S.pid);
  const hf=()=>{const x=px();return x.hf=x.hf||{};};

  /* ---------- the form's questions ---------- */
  try{
    const sec=k=>HIST.find(x=>x.k===k);
    const tx=sec('tx'),per=sec('per');
    if(tx&&!tx.__pm){
      tx.f=[
        ['Treated by (present illness)','m',O('Psychiatrist','Psychologist','GP','Neurologist')],
        ['Treatment given (dose, duration, response, side effects)','t'],
        ['Any past psychiatric diagnosis and treatment','yn'],
        ['Any past medical or surgical diagnosis and treatment','yn'],
        ['Any history of self-harm or suicidal ideation (current or past)','yn']];
      tx.__pm=1;
    }
    if(per&&!per.__pm){
      const swap=(start,type,opts)=>{const i=per.f.findIndex(f=>f[0].indexOf(start)===0);if(i>=0)per.f[i]=[per.f[i][0],type,opts];};
      swap('Education:','o',O('Illiterate','Primary','Secondary','Higher secondary','Graduate','Post graduate','Professional course'));
      swap('Occupation:','o',O('Student','Employed','Self-employed','Unemployed','Homemaker','Retired'));
      swap('Marital history:','o',O('Single','Married','Separated','Divorced','Widowed','Living together'));
      swap('Present living conditions','o',O('With family','Alone','With friends','Hostel','Institution','Homeless'));
      per.f.push(['Forensic history','yn']);
      per.__pm=1;
    }
    const fam=sec('fam');
    if(fam&&!fam.__pm){const i=fam.f.findIndex(f=>f[0].indexOf('Family tree')===0);if(i>=0)fam.f[i]=[fam.f[i][0],'tree'];fam.__pm=1;}
  }catch(e){}

  /* ---------- Yes / No and family tree fields ---------- */
  const LBL=[];const li=l=>{let i=LBL.indexOf(l);if(i<0){LBL.push(l);i=LBL.length-1;}return i;};
  const ynGet=l=>{const v=hf()[l];return v&&typeof v==='object'&&!Array.isArray(v)?v:{yn:'',txt:''};};
  const __fld=fld;
  fld=function(f,ro){
    const l=f[0],ty=f[1];
    if(ty==='yn'){
      const i=li(l),v=ynGet(l),dis=ro?'disabled':'';
      return `<div class="hf wide pm-yn" data-pm="${i}"><span class="lbl">${E(l)}</span><div class="mini-chips">${['Yes','No'].map(o=>`<button type="button" class="tog ${v.yn===o?'on':''}" ${dis} onclick="pmYn(${i},'${o}')">${o}</button>`).join('')}</div>
        <textarea class="input pm-yn-t" ${dis} placeholder="Details" ${v.yn==='Yes'?'':'hidden'} oninput="pmYnT(${i},this.value)">${E(v.txt||'')}</textarea></div>`;
    }
    if(ty==='tree'){
      const i=li(l),rows=Array.isArray(hf()[l])?hf()[l]:[],dis=ro?'disabled':'';
      const sel=(k,r,opts)=>`<select class="input" ${dis} onchange="pmTreeSet(${i},${r},'${k}',this.value)"><option value="">Select…</option>${opts.map(o=>`<option ${rows[r][k]===o?'selected':''}>${o}</option>`).join('')}</select>`;
      const inp=(k,r,ph,w)=>`<input class="input" ${dis} placeholder="${ph}" value="${E(rows[r][k]||'')}" style="${w?'max-width:'+w:''}" oninput="pmTreeSet(${i},${r},'${k}',this.value)">`;
      return `<div class="hf wide pm-tree" data-pm="${i}"><span class="lbl">Family tree: siblings, spouse and children</span>
        <div class="pm-tree-t">${rows.map((_,r)=>`<div class="pm-tree-r">${sel('rel',r,['Brother','Sister','Spouse','Son','Daughter','Other'])}${inp('age',r,'Age','80px')}${sel('sex',r,['M','F','Other'])}${sel('mar',r,['Single','Married','Separated','Divorced','Widowed'])}${inp('edu',r,'Education')}${inp('occ',r,'Occupation')}<button type="button" class="btn sm" ${dis} onclick="pmTreeDel(${i},${r})" aria-label="Remove">×</button></div>`).join('')}</div>
        <button type="button" class="btn sm" ${dis} onclick="pmTreeAdd(${i})">+ Add a family member</button></div>`;
    }
    return __fld.apply(this,arguments);
  };
  window.pmYn=function(i,v){const l=LBL[i],s=hf(),c=ynGet(l);s[l]={yn:v,txt:v==='Yes'?c.txt:''};render();};
  window.pmYnT=function(i,v){const l=LBL[i],c=ynGet(l);hf()[l]={yn:c.yn||'Yes',txt:v};};
  window.pmTreeAdd=function(i){const l=LBL[i],s=hf();s[l]=(Array.isArray(s[l])?s[l]:[]).concat([{rel:'',age:'',sex:'',mar:'',edu:'',occ:''}]);render();};
  window.pmTreeSet=function(i,r,k,v){const s=hf(),l=LBL[i];if(Array.isArray(s[l])&&s[l][r])s[l][r][k]=v;};
  window.pmTreeDel=function(i,r){const s=hf(),l=LBL[i];if(Array.isArray(s[l]))s[l].splice(r,1);render();};

  /* ---------- keep what is typed in the plain text boxes ---------- */
  const labelOf=hfEl=>{const lb=hfEl.querySelector(':scope > .lbl');if(!lb)return '';const n=lb.childNodes[0];return (n?n.textContent:lb.textContent||'').replace(/\s*\(any\)\s*$/,'').trim();};
  const plain=el=>el&&el.closest&&el.closest('.hwrap .hgrid .hf')&&!el.closest('.hf-sel')&&!el.closest('.pm-yn')&&!el.closest('.pm-tree')&&!el.classList.contains('hfree');
  document.addEventListener('input',e=>{const t=e.target;if(!(t&&(t.tagName==='TEXTAREA'||(t.tagName==='INPUT'&&t.type!=='checkbox')))||!plain(t))return;const f=t.closest('.hf');if(!f)return;const l=labelOf(f);if(l)hf()[l]=t.value;});
  function restore(){
    document.querySelectorAll('#view .hwrap .hgrid > .hf').forEach(f=>{
      if(f.classList.contains('hf-sel')||f.classList.contains('pm-yn')||f.classList.contains('pm-tree'))return;
      const el=f.querySelector('textarea,input.input');if(!el||el.classList.contains('hfree'))return;
      const l=labelOf(f),s=hf();
      if(typeof s[l]==='string'){if(el.value!==s[l])el.value=s[l];}
      else if(el.value&&S.historyDraft&&s[l]===undefined)s[l]=el.value;
    });
  }

  /* ---------- completeness: a step is ticked only when every question in it is answered ---------- */
  function done(k){
    const sec=(typeof HIST!=='undefined'?HIST:[]).find(x=>x.k===k);if(!sec)return false;const s=hf();
    return sec.f.every(f=>{
      const l=f[0],ty=f[1],v=s[l];
      if(ty==='o')return !!(v&&typeof v==='object'&&v.sel&&(v.sel!=='__other'||String(v.free||'').trim()));
      if(ty==='m'||ty==='ap')return Array.isArray(v)&&v.length>0;
      if(ty==='yn')return !!(v&&v.yn&&(v.yn==='No'||String(v.txt||'').trim()));
      if(ty==='tree')return Array.isArray(v)&&v.length>0;
      return typeof v==='string'&&v.trim()!=='';
    });
  }
  function ticks(){
    const nav=document.querySelector('#view .hrow11 .hnav, #view .hwrap .hnav');if(!nav)return;
    nav.querySelectorAll('button').forEach(b=>{const k=((b.getAttribute('onclick')||'').match(/hsec='(\w+)'/)||[])[1];if(!k)return;b.classList.toggle('seen',done(k));});
  }

  /* ---------- one-line layout ---------- */
  const SPAN={
    pt:{'Identification marks':6,'Reliability':6},
    inf:{'Name of family member':3,'Relationship with patient':3,'Duration of relationship':3,'Reliability':3,'Predisposing factors':4,'Precipitating factors':4,'Perpetuating factors':4,'Mode of onset':4,'Course':4,'Progress':4},
    chg:{'Sleep':6,'Bladder and bowel habits':6}
  };
  const BIG={pt:['Chief complaints','History of present illness'],inf:['Presenting complaints','History of present illness']};
  const ORDER={inf:['Name of family member','Relationship with patient','Duration of relationship','Reliability','Presenting complaints','Predisposing factors','Precipitating factors','Perpetuating factors','Mode of onset','Course','Progress','History of present illness'],
    chg:['Sleep','Bladder and bowel habits']};
  function layout(){
    const g=document.querySelector('#view .hwrap .hgrid');if(!g)return;
    const k=S.hsec||'id',sp=SPAN[k]||{},big=BIG[k]||[];
    const fields=[...g.children].filter(c=>c.classList.contains('hf'));
    const key=f=>{const l=labelOf(f);return Object.keys(sp).find(x=>l.indexOf(x)===0)||big.find(x=>l.indexOf(x)===0)||l;};
    if(ORDER[k]&&!g.dataset.pmOrdered){
      const ord=ORDER[k],rank=f=>{const l=labelOf(f),i=ord.findIndex(x=>l.indexOf(x)===0);return i<0?999:i;};
      /* the questions named in ORDER keep their slots, in the order given; the others stay where they were */
      const named=fields.filter(f=>rank(f)<999).sort((a,b)=>rank(a)-rank(b));
      if(k==='chg'){const sl=fields.find(f=>labelOf(f).indexOf('Sleep')===0),bl=fields.find(f=>labelOf(f).indexOf('Bladder')===0);if(sl&&bl)sl.after(bl);}
      else if(named.length){const mk=document.createComment('pm');named[0].before(mk);named.forEach(f=>mk.parentNode.insertBefore(f,mk));mk.remove();}
      g.dataset.pmOrdered='1';
    }
    [...g.children].filter(c=>c.classList.contains('hf')).forEach(f=>{
      const l=labelOf(f),n=Object.keys(sp).find(x=>l.indexOf(x)===0);
      if(n)f.setAttribute('data-span',sp[n]);
      if(big.some(x=>l.indexOf(x)===0))f.classList.add('pm-big');
    });
  }
  const css=document.createElement('style');css.id='pm-history-css';
  css.textContent=`body.psy-views:not(.psg) .hwrap .hgrid{grid-template-columns:repeat(12,minmax(0,1fr))!important;column-gap:14px!important}
  body.psy-views:not(.psg) .hwrap .hgrid>.hf{grid-column:span 6}
  body.psy-views:not(.psg) .hwrap .hgrid>.hf:has(textarea),body.psy-views:not(.psg) .hwrap .hgrid>.hf:has(.mini-chips),body.psy-views:not(.psg) .hwrap .hgrid>.hf:not(.hf-sel):has(input.input),body.psy-views:not(.psg) .hwrap .hgrid>.hf.wide{grid-column:1/-1}
  body.psy-views:not(.psg) .hwrap .hgrid>.hf[data-span="3"]{grid-column:span 3!important}
  body.psy-views:not(.psg) .hwrap .hgrid>.hf[data-span="4"]{grid-column:span 4!important}
  body.psy-views:not(.psg) .hwrap .hgrid>.hf[data-span="6"]{grid-column:span 6!important}
  body.psy-views:not(.psg) .hwrap .hgrid>.hf.pm-big textarea.input{min-height:190px!important;font-size:15px;line-height:1.5}
  /* titles and their grey line sit on one line, left to right (Anu: no wrapping into a narrow column) */
  #view .card>.hd>div:first-child,#view section.card>.hd>div:first-child{flex:1 1 auto;min-width:0}
  #view .card>.hd .small.muted,#view .card>.hd .tiny.muted{max-width:none!important}
  .psy-hist-field{grid-template-columns:260px minmax(0,1fr)!important;gap:16px!important}
  @media(max-width:700px){.psy-hist-field{grid-template-columns:1fr!important}}
  .pm-yn .mini-chips{margin:4px 0 6px}.pm-yn-t{min-height:72px}
  .pm-tree-r{display:grid;grid-template-columns:1.1fr .6fr .7fr 1fr 1.2fr 1.2fr auto;gap:8px;margin-bottom:8px}
  .pm-tree-r .input{min-height:38px;width:100%}
  .pm-risk{display:flex;gap:12px;align-items:center;flex-wrap:wrap;padding:12px 14px;border:1px solid #fedf89;background:#fffaeb;border-radius:12px}
  .pm-risk select{min-height:38px;min-width:220px;max-width:100%}
  @media(max-width:900px){body.psy-views:not(.psg) .hwrap .hgrid>.hf[data-span]{grid-column:1/-1!important}.pm-tree-r{grid-template-columns:1fr 1fr}}`;
  document.head.appendChild(css);

  /* ---------- risk screen under the form (same two choices as the OPD doctor risk screen: risk of harm, and what it is for) ---------- */
  const LEVELS=['None','Low','Moderate','High'];
  const REASONS=['Self-harming thoughts/behaviours','Harm to others','Absconding','Self-neglect','Substance use','Other'];
  function riskBox(){
    document.querySelectorAll('#view .callout.amber').forEach(c=>{
      if(c.dataset.pmRisk||!/Risk screen/.test(c.textContent))return;
      c.dataset.pmRisk='1';const x=px(),last=(x.suicide||[])[0],cur=x.riskLevel||'';
      c.className='pm-risk';
      c.innerHTML=`<b>Risk screen</b>
        <label class="small">Risk of harm <select class="input" id="pmRL"><option value="">Select…</option>${LEVELS.map(l=>`<option ${cur===l?'selected':''}>${l}</option>`).join('')}</select></label>
        <label class="small">Reason <select class="input" id="pmRR"><option value="">Select…</option>${REASONS.map(l=>`<option ${last&&last.reason===l?'selected':''}>${l}</option>`).join('')}</select></label>
        <button type="button" class="btn sm pri" onclick="pmRisk()">Save risk screen</button>
        <span class="small muted">${last?'Last: '+E(String(last.level||'').toLowerCase())+' risk'+(last.reason?', '+E(last.reason):'')+', '+E(last.at)+' by '+E(last.by||''):'Sets the risk of harm in the header.'}</span>`;
    });
  }
  window.pmRisk=function(){
    const l=(document.getElementById('pmRL')||{}).value,r=(document.getElementById('pmRR')||{}).value;
    if(!l){toast('Pick the risk of harm');return;}if(l!=='None'&&!r){toast('Pick what the risk is for');return;}
    const x=px();x.suicide=x.suicide||[];
    x.suicide.unshift({at:atNow(),date:today(),by:signer(),ans:[],level:l==='None'?'Low':l,reason:r||'',note:'Risk screen from the detailed history'});x.riskLevel=l==='None'?'Low':l;
    render();toast('Risk of harm set to '+(l==='None'?'low':l.toLowerCase()));
  };

  /* ---------- Read only: shows what was filled in the form ---------- */
  function readOnly(){
    const rd=document.querySelector('#view .psy-hist-read');if(!rd)return;
    const p=ptFind(S.pid);if(!p||!p.real||rd.dataset.pm)return;
    const s=hf(),sections=typeof HIST!=='undefined'?HIST:[];
    const val=(l,ty)=>{const v=s[l];if(v==null||v==='')return '';
      if(ty==='o')return v.sel?(v.sel==='__other'?v.free:v.sel):'';
      if(ty==='m'||ty==='ap')return Array.isArray(v)?v.join(', '):'';
      if(ty==='yn')return v.yn?(v.yn+(v.yn==='Yes'&&v.txt?': '+v.txt:'')):'';
      if(ty==='tree')return Array.isArray(v)?v.map(r=>[r.rel,r.age,r.sex,r.mar,r.edu,r.occ].filter(Boolean).join(' · ')).filter(Boolean).join('\n'):'';
      return String(v);};
    const html=sections.map(sc=>{const rows=sc.f.map(f=>[f[0],val(f[0],f[1])]).filter(r=>r[1]);
      return `<section class="psy-hist-section"><h4>${E(sc.t)}</h4>${rows.length?rows.map(r=>`<div class="psy-hist-field"><b>${E(r[0])}</b><span>${E(r[1]).split('\n').join('<br>')}</span></div>`).join(''):'<div class="psy-hist-empty">Nothing answered in this section yet.</div>'}</section>`;}).join('');
    const box=rd.closest('.nitem')||rd;
    const n=document.createElement('div');n.className='psy-hist-read';n.dataset.pm='1';n.innerHTML='<h2>Detailed history</h2>'+html;
    box.replaceWith(n);
  }

  const __r=render;
  render=function(){
    const r=__r.apply(this,arguments);
    try{layout();restore();ticks();riskBox();readOnly();}catch(e){}
    return r;
  };
})();
