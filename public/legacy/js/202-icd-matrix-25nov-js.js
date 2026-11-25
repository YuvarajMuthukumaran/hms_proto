/* 25 Nov 2026 meeting (Anu): symptom-to-diagnosis matrix in Detailed history. Anu's "ICD 11 Matrix updated.xlsx" is turned into
   /legacy/data/icd11.json by tools/build_icd11.py (594 symptom codes, 182 ICD-11 diagnoses, each symptom coloured by its role:
   essential red, characteristic orange, supporting green, onset/course light blue, severity dark blue, rule-out violet, history grey).
   Under "Provisional diagnosis with ICD code" the doctor ticks the patient's symptoms (search, or the ones the history already names);
   the diagnoses that fit are ranked, ICD-11 prototype matching: all essential features first. "Use" writes "code · name" into the
   provisional diagnosis box, which stays editable. Ticked symptoms are saved in psyx.icdSym. Psychiatrist and floor lead psychiatrist. */
(function(){
  const role=String((window.__TULASI__||{}).role||'');
  if(!/^(psychiatrist|floor-lead-psychiatrist)$/.test(role))return;
  const E=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let M=null,loading=false;
  const load=()=>{if(M||loading)return;loading=true;fetch('/legacy/data/icd11.json?v=25nov').then(r=>r.json()).then(j=>{M=j;M.list=Object.keys(j.sym).map(k=>[k,j.sym[k][0],j.sym[k][1],j.sym[k][1].toLowerCase()]);paint(true);}).catch(()=>{loading=false;});};
  const pidNow=()=>{const m=(location.hash||'').match(/^#\/patient\/([^/]+)/);return m?decodeURIComponent(m[1]):(window.S&&S.pid)||'';};
  const rec=pid=>{try{const x=psyPx(pid);if(!Array.isArray(x.icdSym))x.icdSym=[];return x;}catch(e){return {icdSym:[]};}};
  const ROLES={e:['Essential','#C00000'],c:['Characteristic','#B54708'],s:['Supporting','#067647'],o:['Onset / course','#0086C9'],v:['Severity','#1849A9'],d:['Rule-out','#7030A0'],h:['History','#667085']};
  const Q={q:'',open:''};
  /* the history text on the page and in the record: symptoms it names are offered first */
  function histText(pid){let t='';try{const h=psyPx(pid).hf||{};for(const k in h){const v=h[k];t+=' '+(typeof v==='string'?v:JSON.stringify(v));}}catch(e){}
    document.querySelectorAll('.hgrid input.input,.hgrid textarea,.hgrid select').forEach(i=>{t+=' '+(i.value||'');});
    document.querySelectorAll('.hgrid .tog.on').forEach(b=>{t+=' '+b.textContent;});return t.toLowerCase();}
  function found(pid,sel){if(!M)return [];const t=histText(pid);return M.list.filter(s=>s[3].length>3&&!sel.includes(s[0])&&t.includes(s[3])).slice(0,24);}
  function rank(sel){if(!M||!sel.length)return [];const on=new Set(sel);
    return M.dx.filter(d=>!d.g&&d.s.length).map(d=>{const es=d.s.filter(x=>x[1]==='e'),me=es.filter(x=>on.has(x[0])).length;
      const w={e:3,c:1.2,s:.6,o:.6,v:.4,d:.4,h:.2};let sc=0,hit=0;d.s.forEach(x=>{if(on.has(x[0])){sc+=w[x[1]]||.5;hit++;}});
      if(es.length&&me===es.length)sc+=4;return {d,me,ne:es.length,hit,sc};}).filter(r=>r.hit).sort((a,b)=>b.sc-a.sc).slice(0,8);}
  function card(pid){
    const x=rec(pid),sel=x.icdSym;
    if(!M){load();return '<div class="ic-c" id="icM"><b>ICD-11 diagnosis helper</b><div class="small muted">Loading the matrix…</div></div>';}
    const q=Q.q.trim().toLowerCase();
    const res=q.length>1?M.list.filter(s=>!sel.includes(s[0])&&s[3].includes(q)).concat(M.list.filter(s=>!sel.includes(s[0])&&!s[3].includes(q)&&s[1].toLowerCase().includes(q))).slice(0,30):[];
    const fd=found(pid,sel),rk=rank(sel);
    const chip=(c,on)=>{const s=M.sym[c]||['',c];return `<button type="button" class="ic-s${on?' on':''}" onclick="icTog('${E(c)}')" title="${E(s[0])}">${E(s[1])}${on?' ✕':''}</button>`;};
    const row=r=>{const d=r.d,op=Q.open===d.c;const on=new Set(sel);
      return `<div class="ic-r${op?' op':''}"><div class="ic-rh" onclick="icOpen('${E(d.c)}')"><b>${E(d.c)}</b><span>${E(d.n)}</span>
        <span class="ic-m${r.ne&&r.me===r.ne?' ok':''}">${r.ne?`Essential ${r.me} of ${r.ne}`:'No essential list'} · ${r.hit} matched</span>
        <button type="button" class="btn sm pri" onclick="event.stopPropagation();icUse('${E(d.c)}')">Use</button></div>
        ${op?`<div class="ic-rb">${d.r?`<div class="small" style="margin-bottom:6px">${E(d.r)}</div>`:''}<div class="ic-l">${d.s.map(s=>{const sy=M.sym[s[0]]||['',s[0]],R=ROLES[s[1]]||ROLES.s;return `<span class="ic-k${on.has(s[0])?' hit':''}" style="--c:${R[1]}" title="${E(R[0])}">${E(sy[1])}</span>`;}).join('')}</div></div>`:''}</div>`;};
    return `<div class="ic-c" id="icM"><div class="row" style="justify-content:space-between;align-items:center"><b>ICD-11 diagnosis helper</b><span class="small muted">From Anu's ICD-11 matrix. A suggestion only: the doctor decides.</span></div>
      <div class="ic-key">${Object.keys(ROLES).map(k=>`<span style="--c:${ROLES[k][1]}">${ROLES[k][0]}</span>`).join('')}</div>
      <div class="lbl" style="margin-top:8px">Symptoms present (${sel.length})</div><div class="ic-l">${sel.length?sel.map(c=>chip(c,true)).join(''):'<span class="small muted">None ticked yet</span>'}</div>
      ${fd.length?`<div class="lbl" style="margin-top:8px">Named in the history · tap to add</div><div class="ic-l">${fd.map(s=>chip(s[0],false)).join('')}</div>`:''}
      <input class="input" id="icQ" placeholder="Search a symptom (e.g. low mood, hallucinations, sleep)" value="${E(Q.q)}" oninput="icQ(this.value)" style="margin-top:8px">
      ${res.length?`<div class="ic-l" style="margin-top:6px">${res.map(s=>chip(s[0],false)).join('')}</div>`:q.length>1?'<div class="small muted" style="margin-top:6px">No symptom matches.</div>':''}
      <div class="lbl" style="margin-top:10px">Diagnoses that fit</div>${rk.length?rk.map(row).join(''):'<div class="small muted">Tick symptoms to see diagnoses that fit.</div>'}</div>`;
  }
  function anchor(){const l=[...document.querySelectorAll('label.hf')].find(x=>/^Provisional diagnosis/i.test(((x.querySelector('.lbl')||{}).textContent||'').trim()));return l;}
  function paint(force){const a=anchor(),old=document.getElementById('icM');if(!a){if(old)old.remove();return;}
    if(old&&!force)return;const pid=pidNow();const t=document.createElement('div');t.innerHTML=card(pid);const n=t.firstElementChild;
    if(old){const f=document.activeElement&&document.activeElement.id==='icQ';old.replaceWith(n);if(f){const i=document.getElementById('icQ');if(i){i.focus();i.setSelectionRange(i.value.length,i.value.length);}}}else a.after(n);}
  /* render() is what schedules the save (sync listens to the bridge render event); the helper repaints after it */
  const save=()=>{try{render();}catch(e){}};
  window.icTog=function(c){const x=rec(pidNow()),i=x.icdSym.indexOf(c);if(i>=0)x.icdSym.splice(i,1);else x.icdSym.push(c);save();paint(true);};
  window.icQ=function(v){Q.q=v;paint(true);};
  window.icOpen=function(c){Q.open=Q.open===c?'':c;paint(true);};
  window.icUse=function(c){const d=M&&M.dx.find(x=>x.c===c);const a=anchor();if(!d||!a)return;const i=a.querySelector('input,textarea');if(!i)return;
    i.value=d.c+' · '+d.n;i.dispatchEvent(new Event('input',{bubbles:true}));i.dispatchEvent(new Event('change',{bubbles:true}));
    try{toast('Provisional diagnosis set to '+d.c+'. You can still edit it.');}catch(e){}};
  const cs=document.createElement('style');
  cs.textContent='.ic-c{grid-column:1/-1;border:1px solid #D6DEE8;border-radius:12px;padding:12px 14px;background:#FBFCFE;display:grid;gap:4px}'
    +'.ic-key{display:flex;flex-wrap:wrap;gap:10px;font-size:12px;color:#475467}.ic-key span::before{content:"";display:inline-block;width:9px;height:9px;border-radius:3px;background:var(--c);margin-right:5px}'
    +'.ic-l{display:flex;flex-wrap:wrap;gap:6px}.ic-s{border:1px solid #D0D5DD;background:#fff;border-radius:99px;padding:4px 11px;font-size:13px;cursor:pointer}.ic-s.on{background:#EEF4FF;border-color:#1e6cdb;color:#1849a9;font-weight:600}'
    +'.ic-r{border:1px solid #E3EAF2;border-radius:10px;background:#fff;margin-top:6px}.ic-rh{display:flex;gap:10px;align-items:center;padding:8px 10px;cursor:pointer}.ic-rh>span:nth-child(2){flex:1;font-size:14px}'
    +'.ic-m{font-size:12px;color:#667085}.ic-m.ok{color:#067647;font-weight:600}.ic-rb{padding:0 10px 10px}.ic-k{font-size:12px;border-radius:6px;padding:2px 8px;border:1px solid var(--c);color:var(--c);background:#fff}.ic-k.hit{background:var(--c);color:#fff}';
  document.head.appendChild(cs);
  let t=0;new MutationObserver(()=>{clearTimeout(t);t=setTimeout(()=>{try{paint(false);}catch(e){}},80);}).observe(document.documentElement,{childList:true,subtree:true});
})();
