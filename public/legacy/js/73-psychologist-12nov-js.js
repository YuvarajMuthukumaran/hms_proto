/* 12 Nov 2026, psychologist (message from the team):
   1. Calendar and caseload: the session calendar and the caseload board are one page, merged with the outpatient (OPD) calendar.
      It opens from "My Calendar" in the left rail. Demo data only.
   2. Note templates per therapy type, including ERP for OCD, in the session details window and in the Individual Therapy Add form.
   Psychologist only (S.role==='psychologist'); no other role's screen changes. */
(function(){
  const pgy=()=>S.role==='psychologist';

  /* ======================= 2. Note templates ======================= */
  const TPL={
    'CBT':[['Agenda for the session',''],['Mood check (PHQ-9 / GAD-7 score, how the week went)',''],['Situation and thoughts worked on',''],['Technique used (thought record, reframing, graded exposure)',''],['Behavioural experiment or activity',''],['Homework reviewed',''],['New homework','']],
    'ERP for OCD':[['Phase (psychoeducation, hierarchy building, exposure, relapse prevention)',''],['Obsessions and triggers targeted today',''],['Exposure done in the session (what the task was)',''],['Distress (SUDS 0 to 100): before, peak, end',''],['Response prevention: compulsions or rituals resisted (yes, partly, no)',''],['Y-BOCS or other score this week',''],['What the patient learned (feared outcome did or did not happen)',''],['Family accommodation noticed, and guidance given',''],['Homework: exposure tasks and ritual delay for the week','']],
    'DBT skills':[['Module (mindfulness, distress tolerance, emotion regulation, interpersonal)',''],['Diary card reviewed (urges, behaviours, skills used)',''],['Target behaviour or chain analysed',''],['Skill taught or practised today',''],['Commitment made for the week',''],['Risk check','']],
    'Behavioural activation':[['Activity log reviewed',''],['Mood before and after activities (0 to 10)',''],['Activities scheduled for the week',''],['Barriers and how to meet them',''],['Rewarding or routine activity added','']],
    'Motivational interviewing':[['Change target discussed',''],['Readiness ruler (0 to 10) and why not lower',''],['Change talk heard',''],['Ambivalence explored',''],['Next step the patient chose','']],
    'Supportive therapy':[['What the patient brought today',''],['Emotions and how they are coping',''],['Strengths and supports noticed',''],['Risk check',''],['Plan for the next session','']],
    'Relaxation training':[['Technique (breathing, progressive muscle relaxation, imagery)',''],['Duration',''],['Distress before and after (0 to 10)',''],['Practice at the ward or at home','']],
    'Psychoeducation':[['Topic covered',''],['Material given',''],['Understanding checked (patient said back)',''],['Questions raised',''],['Family involved or to be involved','']],
    'Family session':[['Who was present',''],['Topics discussed',''],['Communication patterns noticed',''],['Agreements made',''],['Follow-up for the family','']]
  };
  const MODS=['CBT','ERP for OCD','DBT skills','Behavioural activation','Motivational interviewing','Supportive therapy','Relaxation training','Psychoeducation','Family session','Other'];
  const tplText=m=>(TPL[m]||[]).map(r=>r[0]+':\n').join('\n');
  function hook(selId,textId,anchor){
    const sel=$(selId),ta=$(textId);if(!sel||!ta||sel.dataset.pgTpl)return;
    sel.dataset.pgTpl='1';
    const cur=sel.value;
    sel.innerHTML=MODS.map(m=>'<option'+(m===cur?' selected':'')+'>'+hesc(m)+'</option>').join('');
    if(!MODS.includes(cur)&&cur){sel.insertAdjacentHTML('afterbegin','<option selected>'+hesc(cur)+'</option>');}
    let last='';
    const bar=document.createElement('div');bar.className='pgt-bar';
    bar.innerHTML='<span class="pgt-l">Note template</span><span class="pgt-n"></span><button type="button" class="btn sm">Use template</button>';
    const name=bar.querySelector('.pgt-n'),btn=bar.querySelector('button');
    const refresh=()=>{const has=!!TPL[sel.value];name.textContent=has?sel.value+' · '+TPL[sel.value].length+' headings':'No template for this type';btn.disabled=!has;};
    const apply=force=>{
      const t=tplText(sel.value);if(!t)return;
      if(!force&&ta.value.trim()&&ta.value!==last)return;
      ta.value=t;last=t;ta.rows=Math.max(ta.rows||4,10);
    };
    sel.addEventListener('change',()=>{refresh();apply(false);});
    btn.addEventListener('click',()=>{if(ta.value.trim()&&ta.value!==last&&!confirm('Replace what is written with the template?'))return;apply(true);});
    const host=(anchor&&anchor(ta))||ta.closest('label')||ta;
    host.parentNode.insertBefore(bar,host);
    refresh();apply(false);
  }
  const wrapModal=(fnName,selId,textId)=>{
    const f=window[fnName];if(typeof f!=='function')return;
    window[fnName]=function(){const r=f.apply(this,arguments);if(pgy())setTimeout(()=>hook(selId,textId),30);return r;};
  };
  wrapModal('pgSessionDetails','pgSdMod','pgSdSum');
  const __thAdd=window.psyThAdd;
  if(typeof __thAdd==='function')window.psyThAdd=function(k){
    const r=__thAdd.apply(this,arguments);
    if(pgy()&&k==='ind')setTimeout(()=>hook('th9_modality','th9_note'),30);
    return r;
  };

  /* ======================= 1. Calendar and caseload ======================= */
  const DAYS=['Mon','Tue','Wed','Thu','Fri','Sat'];
  const HOURS=[9,10,11,12,14,15,16,17];
  const KIND={ind:['Individual','blue'],grp:['Group','teal'],fam:['Family','amber'],opd:['OPD','violet']};
  const st=()=>{S.pgc=S.pgc||{tab:'cal',flt:'all',wk:0,extra:[],cols:{}};return S.pgc;};
  const iso=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  const mondayOf=off=>{const d=new Date();d.setHours(0,0,0,0);const dow=(d.getDay()+6)%7;d.setDate(d.getDate()-dow+off*7);return d;};
  const MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const fmt=d=>d.getDate()+' '+MON[d.getMonth()];
  const people=()=>{try{return (typeof allPts==='function'?allPts():PTS)||[];}catch(e){return PTS;}};
  const nameOf=id=>{const p=people().find(x=>x.id===id);return p?p.name:id;};
  const OPD=[['Ms. A. Verma','Follow-up'],['Mr. R. Khanna','First visit'],['Mr. S. Bhatia','Follow-up'],['Ms. N. Iyer','Review'],['Mr. K. Dutta','Follow-up'],['Ms. P. Sinha','First visit'],['Mr. T. Ahuja','Follow-up']];
  /* demo week: the same pattern every week, so any week you open has sessions */
  function seedWeek(mon){
    const ev=[],P=people();
    P.slice(0,8).forEach((p,i)=>{
      const day=i%5,h=HOURS[(i*2)%HOURS.length];
      const d=new Date(mon);d.setDate(d.getDate()+day);
      ev.push({id:'s'+i,date:iso(d),h,m:0,kind:'ind',pid:p.id,label:p.name});
    });
    [[1,11,30,'Anxiety and stress group'],[3,11,30,'Relapse prevention group'],[4,15,0,'Yoga and relaxation']].forEach((g,i)=>{const d=new Date(mon);d.setDate(d.getDate()+g[0]);ev.push({id:'g'+i,date:iso(d),h:g[1],m:g[2],kind:'grp',label:g[3]});});
    P.slice(0,3).forEach((p,i)=>{const d=new Date(mon);d.setDate(d.getDate()+(4+(i%2))%6);ev.push({id:'f'+i,date:iso(d),h:i===0?14:16,m:30,kind:'fam',pid:p.id,label:'Family · '+p.name});});
    OPD.forEach((o,i)=>{const d=new Date(mon);d.setDate(d.getDate()+(i%6));ev.push({id:'o'+i,date:iso(d),h:[9,10,12,14,15,16,17][(i*3)%7],m:i%2?30:0,kind:'opd',label:o[0],sub:o[1]});});
    return ev;
  }
  const eventsOf=mon=>{
    const s=st(),ev=seedWeek(mon),from=iso(mon),toD=new Date(mon);toD.setDate(toD.getDate()+6);const to=iso(toD);
    return ev.concat((s.extra||[]).filter(e=>e.date>=from&&e.date<=to));
  };
  const timeTxt=(h,m)=>{const hh=((h+11)%12)+1;return hh+':'+String(m||0).padStart(2,'0')+(h<12?' am':' pm');};
  const ico=(p)=>'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+p+'</svg>';

  function calHtml(){
    const s=st(),mon=mondayOf(s.wk),all=eventsOf(mon);
    const ev=all.filter(e=>s.flt==='all'||(s.flt==='opd'?e.kind==='opd':e.kind!=='opd'));
    const todayIso=iso(new Date());
    const heads=DAYS.map((n,i)=>{const d=new Date(mon);d.setDate(d.getDate()+i);const t=iso(d)===todayIso;return '<div class="pgc-dh'+(t?' today':'')+'"><b>'+n+'</b><span>'+fmt(d)+'</span></div>';}).join('');
    const cells=HOURS.map(h=>{
      let row='<div class="pgc-t">'+timeTxt(h,0)+'</div>';
      DAYS.forEach((n,i)=>{
        const d=new Date(mon);d.setDate(d.getDate()+i);const di=iso(d);
        const list=ev.filter(e=>e.date===di&&e.h===h).sort((a,b)=>a.m-b.m);
        row+='<div class="pgc-c'+(di===todayIso?' today':'')+'">'+list.map(e=>{
          const k=KIND[e.kind];
          const on=e.pid?`go('#/patient/${e.pid}/therapy')`:`pgcOpen('${e.id}')`;
          return `<button class="pgc-e ${k[1]}" onclick="${on}" title="${hesc(k[0])} · ${hesc(e.label)}"><i>${timeTxt(e.h,e.m)}</i><b>${hesc(e.label)}</b><span>${hesc(e.sub||k[0])}</span></button>`;
        }).join('')+'</div>';
      });
      return row;
    }).join('');
    const counts={ind:0,grp:0,fam:0,opd:0};all.forEach(e=>counts[e.kind]++);
    return `<div class="pgc-sum"><span><b>${counts.ind}</b> individual</span><span><b>${counts.grp}</b> group</span><span><b>${counts.fam}</b> family</span><span><b>${counts.opd}</b> outpatient</span></div>
      <div class="pgc-grid"><div class="pgc-h0"></div>${heads}${cells}</div>
      <div class="pgc-key"><i class="blue"></i>Individual<i class="teal"></i>Group<i class="amber"></i>Family<i class="violet"></i>Outpatient (OPD)</div>`;
  }

  const DXMOD=[[/ocd|obsess/i,'ERP for OCD'],[/depress/i,'CBT and behavioural activation'],[/bipolar|mania|manic/i,'Psychoeducation and relapse prevention'],[/alcohol|opioid|substance|addict/i,'Motivational interviewing'],[/schizo|psychos/i,'Supportive therapy and family psychoeducation'],[/anxiety|panic/i,'CBT and relaxation'],[/personality|borderline/i,'DBT skills']];
  const modFor=p=>{const t=String(p.dx||'');const h=DXMOD.find(x=>x[0].test(t));return h?h[1]:'Supportive therapy';};
  function caseHtml(){
    const s=st(),P=people().slice(0,8),rows=P.map((p,i)=>{
      let done=0;try{done=(((psyPx(p.id).th||{}).ind)||[]).length;}catch(e){}
      const planned=6+(i%3)*2;if(!done)done=[0,3,5,2,7,1,4,6][i%8]%planned;
      const col=s.cols[p.id]||(done===0?'new':done>=planned-1?'near':(i%4===2)?'review':'active');
      const next=['Today, 4 pm','Fri, 11 am','Mon, 10 am','Tue, 2 pm'][i%4];
      return {p,done,planned,col,next,mod:modFor(p)};
    });
    const COLS=[['new','Start therapy','No session yet'],['active','In therapy','Sessions running'],['review','Review due','Plan to be reviewed'],['near','Near completion','Almost through the plan']];
    const card=r=>`<div class="pgc-cd"><div class="pgc-cdh"><button class="pgc-nm" onclick="go('#/patient/${r.p.id}/therapy')">${hesc(r.p.name)}</button><span class="pgc-rm">${hesc(String(r.p.room||'').replace(/^Room\s*/i,'Room '))}</span></div>
      <div class="pgc-md">${hesc(r.mod)}</div>
      <div class="pgc-pr"><i style="width:${Math.min(100,Math.round(r.done/r.planned*100))}%"></i></div>
      <div class="pgc-ln"><span>${r.done} of ${r.planned} sessions</span><span>Next · ${r.next}</span></div>
      <div class="pgc-ac"><button class="btn sm" onclick="pgcSchedule('${r.p.id}')">Schedule</button><select class="input pgc-mv" onchange="pgcMove('${r.p.id}',this.value)" aria-label="Move ${hesc(r.p.name)}">${COLS.map(c=>`<option value="${c[0]}" ${c[0]===r.col?'selected':''}>${c[1]}</option>`).join('')}</select></div></div>`;
    return `<div class="pgc-board">${COLS.map(c=>{const L=rows.filter(r=>r.col===c[0]);return `<section class="pgc-col"><div class="pgc-ch"><b>${c[1]}</b><span>${L.length}</span></div><div class="pgc-cs">${c[2]}</div>${L.map(card).join('')||'<div class="pgc-em">Nobody here</div>'}</section>`;}).join('')}</div>`;
  }

  function pgCalPage(){
    const s=st();
    const tabs=[['cal','Session calendar'],['board','Caseload board']].map(t=>`<button class="pgc-tab${s.tab===t[0]?' on':''}" onclick="pgcTab('${t[0]}')">${t[1]}</button>`).join('');
    const flt=[['all','All'],['ipd','Inpatient sessions'],['opd','Outpatient (OPD)']].map(f=>`<button class="pgc-f${s.flt===f[0]?' on':''}" onclick="pgcFlt('${f[0]}')">${f[1]}</button>`).join('');
    const mon=mondayOf(s.wk),end=new Date(mon);end.setDate(end.getDate()+5);
    const nav=s.tab==='cal'?`<div class="pgc-nav"><button class="btn sm" onclick="pgcWk(-1)" aria-label="Previous week">‹</button><b>${fmt(mon)} to ${fmt(end)}</b><button class="btn sm" onclick="pgcWk(1)" aria-label="Next week">›</button><button class="btn sm" onclick="pgcWk(0,true)">This week</button></div>`:'';
    return `<div class="pgc"><div class="pgc-top"><div><h2>Calendar and caseload</h2><div class="muted">Your therapy sessions and the outpatient calendar in one place. Demo data.</div></div><button class="btn pri" onclick="pgcSchedule('')">Schedule a session</button></div>
      <div class="pgc-bar"><div class="pgc-tabs">${tabs}</div>${s.tab==='cal'?`<div class="pgc-fl">${flt}</div>`:''}${nav}</div>
      ${s.tab==='cal'?calHtml():caseHtml()}</div>`;
  }
  window.pgcTab=t=>{st().tab=t;render();};
  window.pgcFlt=f=>{st().flt=f;render();};
  window.pgcWk=(d,reset)=>{const s=st();s.wk=reset?0:s.wk+d;render();};
  window.pgcMove=(id,c)=>{st().cols[id]=c;render();};
  window.pgcOpen=id=>{
    const e=eventsOf(mondayOf(st().wk)).find(x=>x.id===id);if(!e)return;
    V3.modal((KIND[e.kind][0])+' · '+hesc(e.label),hesc(e.date+' · '+timeTxt(e.h,e.m)),`<div class="small">${e.kind==='opd'?'Outpatient appointment from the outpatient calendar. Open the live record from the outpatient system.':'Group session on the ward timetable.'}</div>`,`<button class="btn pri" onclick="closeModal()">Close</button>`);
  };
  window.pgcSchedule=pid=>{
    const P=people(),d=new Date();
    V3.modal('Schedule a session','It appears on the calendar straight away.',
      `<div class="grid2"><label class="field"><span class="lbl">Patient</span><select class="input" id="pgcP">${P.map(p=>`<option value="${p.id}" ${p.id===pid?'selected':''}>${hesc(p.name)}</option>`).join('')}</select></label>
       <label class="field"><span class="lbl">Type</span><select class="input" id="pgcK"><option value="ind">Individual</option><option value="fam">Family</option><option value="grp">Group</option></select></label>
       <label class="field"><span class="lbl">Date</span><input class="input" type="date" id="pgcD" value="${iso(d)}"></label>
       <label class="field"><span class="lbl">Time</span><input class="input" type="time" id="pgcT" value="10:00"></label></div>`,
      `<button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="pgcSave()">Add to calendar</button>`);
  };
  window.pgcSave=()=>{
    const pid=($('pgcP')||{}).value,k=($('pgcK')||{}).value||'ind',dt=($('pgcD')||{}).value,tm=($('pgcT')||{}).value||'10:00';
    if(!pid||!dt)return;
    const [h,m]=tm.split(':').map(Number);
    const s=st();s.extra=s.extra||[];
    s.extra.push({id:'x'+Date.now(),date:dt,h:Math.min(17,Math.max(9,h)),m:m||0,kind:k,pid,label:(k==='fam'?'Family · ':'')+nameOf(pid)});
    /* show the week the session was put in */
    const d=new Date(dt+'T00:00:00'),base=mondayOf(0);s.wk=Math.round((d-base)/604800000-((d.getDay()+6)%7)/7);
    s.tab='cal';closeModal();render();toast('Session added for '+nameOf(pid));
  };

  const __ve=vExisting;
  vExisting=function(name){
    if(pgy()&&decodeURIComponent(name)==='My Calendar'){$('title').textContent='Calendar and caseload';return pgCalPage();}
    return __ve.apply(this,arguments);
  };
  /* the rail entry reads "Calendar and caseload" for the psychologist */
  const __r73=render;
  render=function(){
    const r=__r73.apply(this,arguments);
    if(pgy()){document.querySelectorAll('#app [onclick*="My Calendar"]').forEach(b=>{b.setAttribute('title','Calendar and caseload');b.setAttribute('aria-label','Calendar and caseload');b.querySelectorAll('span,.nl').forEach(sp=>{if(/^My Calendar$/.test(sp.textContent.trim()))sp.textContent='Calendar and caseload';});if(/^My Calendar$/.test(b.textContent.trim())&&!b.children.length)b.textContent='Calendar and caseload';});}
    return r;
  };

  const css=document.createElement('style');css.id='pg-12nov-css';
  css.textContent=`
  .pgt-bar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:6px 0 6px;padding:8px 12px;border:1px solid #cfe0fb;border-radius:12px;background:#f3f8ff}
  .pgt-l{font-size:12.5px;font-weight:800;color:#175cd3}
  .pgt-n{flex:1;font-size:12.5px;color:#475467}
  .pgc{display:flex;flex-direction:column;gap:14px}
  .pgc-top{display:flex;justify-content:space-between;align-items:flex-end;gap:12px;flex-wrap:wrap}
  .pgc-top h2{margin:0;font-size:24px}
  .pgc-bar{display:flex;align-items:center;gap:14px;flex-wrap:wrap}
  .pgc-tabs,.pgc-fl{display:inline-flex;gap:3px;padding:4px;border:1px solid #d5e1ef;border-radius:12px;background:#f1f5fa}
  .pgc-tab,.pgc-f{border:1px solid transparent;border-radius:9px;background:transparent;padding:8px 14px;font:inherit;font-size:13.5px;font-weight:650;color:#344054;cursor:pointer;transition:background .15s,color .15s}
  .pgc-tab:hover,.pgc-f:hover{background:#e3edfb;color:#1e5bb8}
  .pgc-tab.on,.pgc-f.on{background:#1e6cdb;color:#fff;box-shadow:0 2px 5px rgba(30,108,219,.28)}
  .pgc-nav{margin-left:auto;display:flex;align-items:center;gap:8px}
  .pgc-sum{display:flex;gap:18px;flex-wrap:wrap;font-size:13.5px;color:#475467}.pgc-sum b{color:#14284b;font-size:16px}
  .pgc-grid{display:grid;grid-template-columns:72px repeat(6,minmax(130px,1fr));border:1px solid #dfe7f2;border-radius:16px;background:#fff;overflow:auto}
  .pgc-dh{padding:10px 12px;background:#f8fafd;border-bottom:1px solid #e8eef7;display:flex;flex-direction:column;gap:1px;position:sticky;top:0}
  .pgc-dh b{font-size:13.5px}.pgc-dh span{font-size:12px;color:#667085}
  .pgc-dh.today{background:#eaf2fd}.pgc-dh.today b{color:#175cd3}
  .pgc-h0{background:#f8fafd;border-bottom:1px solid #e8eef7}
  .pgc-t{padding:8px 8px;font-size:11.5px;color:#667085;text-align:right;border-top:1px solid #eef2f8}
  .pgc-c{min-height:64px;padding:4px;border-top:1px solid #eef2f8;border-left:1px solid #eef2f8;display:flex;flex-direction:column;gap:4px}
  .pgc-c.today{background:#fbfdff}
  .pgc-e{display:flex;flex-direction:column;gap:1px;text-align:left;font:inherit;padding:6px 8px;border:0;border-left:3px solid;border-radius:8px;cursor:pointer;transition:transform .12s,box-shadow .12s}
  .pgc-e:hover{transform:translateY(-1px);box-shadow:0 4px 10px rgba(16,24,40,.12)}
  .pgc-e i{font-style:normal;font-size:10.5px;opacity:.8}.pgc-e b{font-size:12.5px;line-height:1.25}.pgc-e span{font-size:11px;opacity:.85}
  .pgc-e.blue{background:#eaf2fd;border-color:#1e6cdb;color:#14346b}.pgc-e.teal{background:#e6f7f4;border-color:#0e9384;color:#0b5a50}
  .pgc-e.amber{background:#fff3d6;border-color:#d48806;color:#7a4b00}.pgc-e.violet{background:#f1edff;border-color:#6d4ad9;color:#3f2a8c}
  .pgc-key{display:flex;gap:14px;flex-wrap:wrap;align-items:center;font-size:12.5px;color:#475467}
  .pgc-key i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:-6px}
  .pgc-key i.blue{background:#1e6cdb}.pgc-key i.teal{background:#0e9384}.pgc-key i.amber{background:#d48806}.pgc-key i.violet{background:#6d4ad9}
  .pgc-board{display:grid;grid-template-columns:repeat(4,minmax(220px,1fr));gap:14px;overflow:auto;align-items:start}
  .pgc-col{background:#f6f9fd;border:1px solid #e1e9f4;border-radius:16px;padding:12px;display:flex;flex-direction:column;gap:10px;min-height:200px}
  .pgc-ch{display:flex;justify-content:space-between;align-items:center}.pgc-ch b{font-size:15px}.pgc-ch span{background:#fff;border:1px solid #dbe6f5;border-radius:99px;padding:1px 9px;font-size:12px;font-weight:700}
  .pgc-cs{font-size:12px;color:#667085;margin-top:-6px}
  .pgc-em{font-size:13px;color:#98a2b3;padding:14px 4px}
  .pgc-cd{background:#fff;border:1px solid #e1e9f4;border-radius:14px;padding:12px;display:flex;flex-direction:column;gap:8px;transition:transform .15s,box-shadow .15s}
  .pgc-cd:hover{transform:translateY(-2px);box-shadow:0 8px 18px -8px rgba(30,60,120,.25)}
  .pgc-cdh{display:flex;justify-content:space-between;gap:8px;align-items:baseline}
  .pgc-nm{border:0;background:none;font:inherit;font-weight:800;font-size:14.5px;color:#14284b;padding:0;cursor:pointer;text-align:left}.pgc-nm:hover{color:#1e5bb8;text-decoration:underline}
  .pgc-rm{font-size:12px;color:#667085;white-space:nowrap}
  .pgc-md{font-size:12.5px;font-weight:600;color:#175cd3}
  .pgc-pr{height:6px;border-radius:99px;background:#e8eef7;overflow:hidden}.pgc-pr i{display:block;height:100%;background:#1e6cdb;border-radius:99px}
  .pgc-ln{display:flex;justify-content:space-between;gap:8px;font-size:12px;color:#667085;flex-wrap:wrap}
  .pgc-ac{display:flex;gap:8px;align-items:center}.pgc-mv{height:32px!important;min-height:32px!important;font-size:12.5px;flex:1}
  @media(max-width:900px){.pgc-board{grid-template-columns:repeat(2,minmax(220px,1fr))}}
  @media(max-width:560px){.pgc-board{grid-template-columns:1fr}}
  `;
  document.head.appendChild(css);
})();
