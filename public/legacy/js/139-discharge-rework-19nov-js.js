/* 19 Nov 2026, Trello (Anu, discharge summary). Psychiatrist, floor lead psychiatrist and psychologist screens, Discharge tab only.
   - "Discharge medicines check" is removed (it duplicated the prescription): the Discharge prescription card now lists every medicine that continues,
     filled from the stay (name and dose, frequency, before/after food). A medicine that stops is removed with Stop; the old check is set to Continue for the rest.
   - Duration is gone: each medicine has a start date (default: discharge date) and an end date; the duration (days) is worked out.
   - Add medicine opens all its fields in one row (no second step).
   - Follow-up date defaults to the end date of the last medicine.
   - Readiness and checklist cards move to the end of the flow, just before Review, confirm and sign. */
(function(){
  const role=String((window.__TULASI__||{}).role||'');
  const doc=/^(psychiatrist|floor-lead-psychiatrist)$/.test(role);
  if(!doc)return;
  const esc=s=>hesc(String(s==null?'':s));
  const px=pid=>{try{return psyPx(pid);}catch(e){return {};}};
  const pidNow=()=>{const m=String(location.hash||'').match(/^#\/patient\/([^/?]+)\/discharge/);return m?decodeURIComponent(m[1]):'';};
  const DAY=864e5,iso=d=>new Date(d.getTime()-d.getTimezoneOffset()*6e4).toISOString().slice(0,10);
  const FREQ=['Once a day (morning)','Once a day (night)','Twice a day','Three times a day','At bedtime','Only when needed (SOS)','Once a week','Every 2 weeks','Monthly (injection)'];
  const FOOD=['Before food','After food','With food','Empty stomach','Any time'];
  const ctx=pid=>{try{return ptCtxOf(pid)||{};}catch(e){return {};}};
  const dcrx=pid=>{const x=px(pid);return x.dcrx=x.dcrx||{rows:{},extra:[],fu:'',fuOver:false,th:{mod:'',freq:'',fu:'',fuOver:false}};};
  const q=s=>String(s).replace(/\\/g,'\\\\').replace(/'/g,"\\'");
  /* discharge date: the expected discharge date, else today */
  const dcDate=pid=>{const e=String(ctx(pid).edd||'');return e&&!isNaN(new Date(e))?e:iso(new Date());};
  const days=(a,b)=>{if(!a||!b)return '';const n=Math.round((new Date(b+'T00:00:00')-new Date(a+'T00:00:00'))/DAY);return n>=0?n+(n===1?' day':' days'):'check dates';};
  const freqOf=f=>({'1-0-1':'Twice a day','1-1-1':'Three times a day','1-0-0':'Once a day (morning)','0-0-1':'Once a day (night)','0-1-0':'Once a day (morning)'}[f]||(FREQ.includes(f)?f:''));
  const foodOf=t=>FOOD.find(f=>f.toLowerCase()===String(t||'').toLowerCase())||'';

  function rows(pid){
    const c=ctx(pid),r=px(pid).recon||{dis:{}},out=[];
    (c.meds||[]).forEach(m=>{if(((r.dis||{})[m.name]||{}).d==='Stop')return;
      const s=dcrx(pid).rows[m.name]=dcrx(pid).rows[m.name]||{};
      if(s.freq==null||s.freq==='')s.freq=freqOf(m.freq);
      if(!s.food)s.food=foodOf(m.time);
      if(!s.start)s.start=dcDate(pid);
      out.push({key:m.name,name:m.name,s,extra:false});});
    dcrx(pid).extra.forEach((m,i)=>{if(!m.start)m.start=dcDate(pid);out.push({key:'x'+i,name:m.name,s:m,extra:true,i});});
    return out;
  }
  const lastEnd=pid=>rows(pid).map(r=>r.s.end||'').filter(Boolean).sort().pop()||'';
  const refreshFu=pid=>{const D=dcrx(pid);if(!D.fuOver)D.fu=lastEnd(pid);};
  const find=(pid,k)=>{const D=dcrx(pid);return /^x\d+$/.test(k)?(D.extra[+k.slice(1)]||{}):(D.rows[k]=D.rows[k]||{});};

  window.dc2Set=function(pid,k,f,v){const s=find(pid,k);s[f]=v;if(f==='start'&&s.end&&s.end<v)s.end=v;refreshFu(pid);render();};
  window.dc2Note=function(el,pid,k){find(pid,k).note=el.value;};
  window.dc2Stop=function(pid,k){
    const D=dcrx(pid);
    if(/^x\d+$/.test(k))D.extra.splice(+k.slice(1),1);
    else{const x=px(pid);x.recon=x.recon||{adm:[],admNone:false,dis:{},disExtra:[]};x.recon.dis=x.recon.dis||{};x.recon.dis[k]={d:'Stop'};}
    refreshFu(pid);render();toast('Stopped at discharge: '+k);
  };
  window.dc2Fu=function(pid,v){const D=dcrx(pid);D.fu=v;D.fuOver=true;};
  window.dc2FuReset=function(pid){const D=dcrx(pid);D.fuOver=false;D.fu=lastEnd(pid);render();};
  window.dc2Add=function(pid){
    const g=id=>{const e=document.getElementById(id);return e?e.value:'';};
    const name=g('dc2N'),start=g('dc2S')||dcDate(pid),end=g('dc2E');
    if(!name){toast('Pick the medicine first');return;}
    if(end&&end<start){toast('End date is before the start date');return;}
    dcrx(pid).extra.push({name,freq:g('dc2F'),food:g('dc2Fo'),start,end,note:g('dc2No')});
    refreshFu(pid);render();toast(name+' added to the discharge prescription');
  };

  function card(pid){
    const D=dcrx(pid),R=rows(pid);
    refreshFu(pid);
    const sel=(k,f,opts,val,ph)=>`<select class="input" style="min-height:34px" onchange="dc2Set('${q(pid)}','${q(k)}','${f}',this.value)"><option value="">${ph}</option>${opts.map(o=>`<option ${val===o?'selected':''}>${esc(o)}</option>`).join('')}</select>`;
    const date=(k,f,val)=>`<input class="input" type="date" style="min-height:34px" value="${esc(val||'')}" onchange="dc2Set('${q(pid)}','${q(k)}','${f}',this.value)">`;
    const body=R.map(r=>`<tr><td><b>${esc(r.name)}</b>${r.extra?'<div class="tiny muted">New at discharge</div>':''}</td><td>${sel(r.key,'freq',FREQ,r.s.freq,'Frequency')}</td><td>${sel(r.key,'food',FOOD,r.s.food,'With food?')}</td>
      <td>${date(r.key,'start',r.s.start)}</td><td>${date(r.key,'end',r.s.end)}</td><td class="small">${esc(days(r.s.start,r.s.end))||'<span class="muted">Set end date</span>'}</td>
      <td><input class="input" style="min-height:34px" placeholder="Note or advice" value="${esc(r.s.note||'')}" oninput="dc2Note(this,'${q(pid)}','${q(r.key)}')"></td>
      <td><button class="btn sm" onclick="dc2Stop('${q(pid)}','${q(r.key)}')">${r.extra?'Remove':'Stop'}</button></td></tr>`).join('');
    const opts=(typeof DRUGS!=='undefined'?DRUGS:[]);
    return `<section class="card" id="dcRx"><div class="hd"><div><h3>Discharge prescription</h3><div class="small muted" style="margin-top:4px">Every medicine that continues after discharge, filled from the stay. Set how long with a start and end date. Use Stop for a medicine that does not continue.</div></div></div>
      <div class="scroll"><table class="t"><thead><tr><th>Medicine and dose</th><th>Frequency</th><th>Food</th><th>Start date</th><th>End date</th><th>Duration</th><th>Note / advice</th><th></th></tr></thead><tbody>${body||'<tr><td colspan="8" class="small muted">No medicine continues after discharge. Add one below.</td></tr>'}</tbody></table></div>
      <div class="pad" style="border-top:1px solid var(--line-2)"><div class="lbl" style="margin-bottom:6px">Add medicine</div>
      <div class="row" style="gap:8px;flex-wrap:wrap;align-items:flex-end">
        <select class="input" id="dc2N" style="flex:1 1 220px;min-height:36px"><option value="">Medicine and dose…</option>${opts.map(d=>`<option>${esc(d)}</option>`).join('')}</select>
        <select class="input" id="dc2F" style="flex:0 1 170px;min-height:36px"><option value="">Frequency</option>${FREQ.map(f=>`<option>${f}</option>`).join('')}</select>
        <select class="input" id="dc2Fo" style="flex:0 1 140px;min-height:36px"><option value="">With food?</option>${FOOD.map(f=>`<option>${f}</option>`).join('')}</select>
        <label class="field" style="margin:0"><span class="tiny muted">Start</span><input class="input" type="date" id="dc2S" style="min-height:36px" value="${esc(dcDate(pid))}"></label>
        <label class="field" style="margin:0"><span class="tiny muted">End</span><input class="input" type="date" id="dc2E" style="min-height:36px"></label>
        <input class="input" id="dc2No" placeholder="Note or advice" style="flex:1 1 160px;min-height:36px">
        <button class="btn sm pri" onclick="dc2Add('${q(pid)}')">Add medicine</button></div></div>
      <div class="pad row" style="gap:10px;flex-wrap:wrap;align-items:center;border-top:1px solid var(--line-2)"><b>Follow-up with the psychiatrist</b><input class="input" type="date" style="width:auto;min-height:36px" value="${esc(D.fu||'')}" onchange="dc2Fu('${q(pid)}',this.value)" aria-label="Follow-up date"><span class="tiny muted">${D.fuOver?'Set by you':'Suggested: end date of the last medicine'}</span>${D.fuOver?`<button class="btn sm" onclick="dc2FuReset('${q(pid)}')">Use the suggestion</button>`:''}</div></section>`;
  }

  function paint(){
    const pid=pidNow();if(!pid)return;
    const v=document.getElementById('view');if(!v)return;
    const old=v.querySelector('#dcRx');
    if(old&&!old.dataset.v2){const t=document.createElement('div');t.innerHTML=card(pid);const n=t.firstElementChild;n.dataset.v2='1';old.replaceWith(n);}
    /* the duplicate medicines check goes; any medicine not stopped continues, so the sign-off check is satisfied */
    const rd=v.querySelector('#recondis');
    if(rd){
      const x=px(pid);x.recon=x.recon||{adm:[],admNone:false,dis:{},disExtra:[]};x.recon.dis=x.recon.dis||{};
      let ch=false;(ctx(pid).meds||[]).forEach(m=>{if(!(x.recon.dis[m.name]||{}).d){x.recon.dis[m.name]={d:'Continue'};ch=true;}});
      rd.remove();
      if(ch)setTimeout(()=>render(),0);
    }
    /* checklists at the end: readiness and the discharge checklist go just before Review, confirm and sign */
    const cards=[...v.querySelectorAll('section.card')];
    const last=cards.find(s=>/^3?\s*Review, confirm and sign/.test(((s.querySelector('.hd h3')||{}).textContent||'').trim()));
    if(last&&!last.dataset.moved){
      last.dataset.moved='1';
      const chk=cards.find(s=>/Discharge checklist$/.test(((s.querySelector('.hd h3')||{}).textContent||'').trim()));
      const rdy=v.querySelector('#dcAuto');
      [rdy,chk].forEach(e=>{if(e)last.parentNode.insertBefore(e,last);});
    }
  }
  const __r=render;
  render=function(){const o=__r.apply(this,arguments);try{if(pidNow()){const v=document.getElementById('view');if(v){const l=v.querySelector('section.card[data-moved]');if(l)delete l.dataset.moved;}}paint();}catch(e){}return o;};
})();
