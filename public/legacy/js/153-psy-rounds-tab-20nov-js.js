/* 20 Nov 2026, owner: the psychologist gets the same Rounds tab as the psychiatrist (copy of block 141, part 5 and its tab).
   Psychologist and floor lead psychologist only. The tab lists every round this psychologist saved for the patient: note, changes, who and when.
   Stored in psyx.roundLogPsy (a shared slice, so a psychologist login may save it; the psychiatrist's psyx.roundLog is untouched). */
(function(){
  const ROLE=String((window.__TULASI__||{}).role||'');
  if(!/^(psychologist|floor-lead-psychologist)$/.test(ROLE))return;
  const E=s=>hesc(String(s==null?'':s));
  const Q=s=>String(s==null?'':s).replace(/\\/g,'\\\\').replace(/'/g,"\\'");
  const route=()=>{const m=String(location.hash||'').match(/^#\/patient\/([^/?]+)(?:\/([^/?]+))?/);return m?{pid:decodeURIComponent(m[1]),sub:m[2]||''}:{pid:'',sub:''};};
  const px=pid=>{try{return psyPx(pid)||{};}catch(e){return {};}};

  const css=document.createElement('style');css.id='prt-css';
  css.textContent='.acr-ch{margin:0 0 4px}.acr-t td{vertical-align:top}';
  document.head.appendChild(css);

  const desc=x=>{if(x==null)return '';if(typeof x==='string')return x;if(Array.isArray(x))return x.filter(Boolean).join(' · ');
    const f=x.f?(typeof monLabel==='function'?monLabel(x.f):x.f):'';
    return [x.act&&x.act!=='Start'?x.act:'',x.text||x.p||x.name||x.to||'',f,x.ty&&x.text?'('+x.ty+(x.to?', '+x.to:'')+')':'',x.why?'· why: '+x.why:''].filter(Boolean).join(' ');};
  function snapRound(){
    const R=S.rounds||{},w=R.ward,WP=(typeof WARDS!=='undefined'&&WARDS[w])||[],p=WP[Math.min(R.idx&&R.idx[w]||0,Math.max(0,WP.length-1))];
    return {w,idx:R.idx?R.idx[w]:0,pid:p&&p.id,note:String(R.tnote||R.scribeNote||'').trim(),why:((document.getElementById('pmWhy')||{}).value||'').trim(),
      ch:[['Medicine',R.mc],['Monitoring',R.mon],['Investigation',R.inv],['Instruction',R.adv],['Referral',R.ref]].flatMap(([t,a])=>(a||[]).map(x=>({t,d:desc(x)}))).filter(c=>c.d)};
  }
  function keepRound(b){
    const R=S.rounds||{};if(!b||!b.pid||!R.idx||R.idx[b.w]===b.idx)return; /* not saved (e.g. the note was missing) */
    if(!b.note&&!b.ch.length)return;
    const x=px(b.pid);x.roundLogPsy=x.roundLogPsy||[];
    x.roundLogPsy.unshift({at:atNow(),ts:Date.now(),by:signer(),note:b.note,why:b.why,changes:b.ch});
  }
  function roundWrap(){
    if(typeof confirmRound==='function'&&!confirmRound.__prt){const o=confirmRound;confirmRound=function(){const b=snapRound();const r=o.apply(this,arguments);try{keepRound(b);}catch(e){}return r;};confirmRound.__prt=1;}
    const w=window.pmWhySave;if(typeof w==='function'&&!w.__prt){window.pmWhySave=function(){const b=snapRound();const r=w.apply(this,arguments);try{keepRound(b);}catch(e){}return r;};window.pmWhySave.__prt=1;}
  }
  roundWrap();
  function roundsTab(pid){
    const log=(px(pid).roundLogPsy||[]).slice();
    const rows=log.map(l=>`<tr><td><b>${E(l.at)}</b><div class="tiny muted">${E(l.by||'')}</div></td><td>${l.note?E(l.note).replace(/\n/g,'<br>'):'<span class="muted">No note (changes only)</span>'}</td>
      <td>${(l.changes||[]).length?l.changes.map(c=>`<div class="acr-ch"><b>${E(c.t)}:</b> ${E(c.d)}</div>`).join(''):'<span class="muted small">None</span>'}${l.why&&!/Rationale/.test(l.note||'')?`<div class="tiny muted">Why: ${E(l.why)}</div>`:''}</td></tr>`).join('');
    return `<section class="card"><div class="hd"><div><h3>Rounds</h3><div class="small muted" style="margin-top:4px">Every saved round for this patient: the round note and the changes made, with who and when.</div></div><button class="btn sm pri" onclick="window.psyOpenRounds?psyOpenRounds('${Q(pid)}'):go('#/rounds')">Open Rounds</button></div>
      <div class="scroll"><table class="t acr-t"><thead><tr><th>When</th><th>Round note</th><th>Changes made</th></tr></thead><tbody>${rows||'<tr><td colspan="3" class="small muted">No round saved yet for this patient.</td></tr>'}</tbody></table></div></section>`;
  }
  const ICON='<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1"/><path d="M8.5 11l1.5 1.5 3-3"/><path d="M8.5 16.5l1.5 1.5 3-3"/></svg>';
  function tabs(v,pid,sub){
    const bar=v.querySelector('.ws-mid > .subtabs')||v.querySelector('.subtabs');if(!bar)return;
    if(!bar.querySelector('[data-acr="rounds"]')){
      const b=document.createElement('button');b.className='subtab';b.setAttribute('role','tab');b.dataset.acr='rounds';b.innerHTML=`<span class="sti">${ICON}</span>Rounds`;b.setAttribute('onclick',`go('#/patient/${Q(pid)}/rounds')`);
      const dc=[...bar.querySelectorAll('button')].find(x=>/^Discharge/.test(x.textContent.trim()));(dc?dc.before(b):bar.appendChild(b));
    }
    if(sub==='rounds'){
      bar.querySelectorAll('button').forEach(b=>{const on=b.dataset.acr==='rounds';b.classList.toggle('on',on);b.setAttribute('aria-selected',String(on));});
      const host=bar.parentElement;if(!host||host.querySelector('#acrBody'))return;
      [...host.children].slice([...host.children].indexOf(bar)+1).forEach(e=>{e.style.display='none';});
      const d=document.createElement('div');d.id='acrBody';d.innerHTML=roundsTab(pid);host.appendChild(d);
      const t=document.getElementById('title');if(t)t.textContent='Rounds';
    }
  }
  const __r=render;
  render=function(){
    const o=__r.apply(this,arguments);
    try{roundWrap();}catch(e){}
    try{const {pid,sub}=route();const v=document.getElementById('view');if(pid&&v)tabs(v,pid,sub);}catch(e){}
    return o;
  };
})();
