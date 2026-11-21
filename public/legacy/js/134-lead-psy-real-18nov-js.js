/* 18 Nov 2026, Trello (Nikita's QA of 17 Nov on real data): Floor Lead Psychologist and the clinical psychologist.
   Real-data mode only. The lead's screens (Today, team strip, ask buttons, supervision, Assign / Change psychologist) read the demo team
   (Priya Nair, Kiran Mehra, Surabhi Sengar, Ankit Verma). Here the team is the psychologists who really have patients, plus the psychologists on the staff list,
   and the lead's own name is the one picked on My caseload. A real patient starts with no therapy goals and no "awaiting sign-off" status (82 / 77 edits).
   Also: "Add a goal" in Therapy Plans (goals used to be the three demo ones), and the lead's Assign / Change pop-up saves the new psychologist on the patient. */
(function(){
  if(!window.__realMode)return;
  const role=String((window.__TULASI__||{}).role||'');
  if(!/psycholog/.test(role))return;
  const px=pid=>{try{return psyPx(pid);}catch(e){return {};}};
  /* the shared psychologist login is Kiran Kumari's (see 96); the psychiatrist login is Anu Yadav's */
  window.__whoAmI=()=>({psychiatrist:'Anu Yadav',psychologist:'Kiran Kumari'}[role]||'');
  const leadName=()=>{try{return localStorage.getItem('tulasi.lead.name')||'';}catch(e){return '';}};

  /* ---------- the real team inside 87's pick lists (lpTEAM / lpFULL are shared objects, changed in place) ---------- */
  function buildTeam(){
    const TEAM=window.lpTEAM,FULL=window.lpFULL;if(!Array.isArray(TEAM)||!FULL)return;
    const names=new Set();
    try{allPts().forEach(p=>{const d=(typeof PSYCHOF!=='undefined'&&PSYCHOF[p.id])||'';if(d)names.add(d);});}catch(e){}
    (window.__realStaff||[]).filter(s=>s.role==='psychologist').forEach(s=>names.add(s.name));
    const me=leadName();
    TEAM.length=0;Object.keys(FULL).forEach(k=>delete FULL[k]);
    [...names].sort().forEach(n=>{if(n===me)return;const k=n.replace(/\W+/g,'');FULL[k]=n;TEAM.push({k,n,load:0,today:'',leave:''});});
    if(me){FULL.Surabhi=me;TEAM.push({k:'Surabhi',n:me,load:0,today:'',leave:'',you:true});}
  }
  if(role==='floor-lead-psychologist'){
    buildTeam();
    const __r=render;
    render=function(){try{buildTeam();}catch(e){}return __r.apply(this,arguments);};
    /* the new psychologist is saved on the patient (the treating team is written back to the patient list) */
    if(typeof window.lpAssignSave==='function'){
      const __as=window.lpAssignSave;
      window.lpAssignSave=function(pid){
        const r=document.querySelector('input[name=lpD]:checked'),name=r&&window.lpFULL?window.lpFULL[r.value]:'';
        const out=__as.apply(this,arguments);
        try{if(name&&typeof ptRun==='function')ptRun(pid,()=>{S.team=S.team||{};S.team.psych=name;return '';});}catch(e){}
        return out;
      };
    }
  }

  /* ---------- Therapy Plans: add a goal (real patients start with none) ---------- */
  window.tpGoalAdd=function(pid){
    const g=id=>(document.getElementById(id)||{}).value||'';
    const t=g('tgT').trim(),tp=g('tgType')||'scale';
    if(!t){toast('Write the goal first');return;}
    const x=px(pid);x.sn=x.sn||{ladder:[],notes:[],goals:null,relapse:null,ybocs:'',planned:8,hwLog:{},hwWhy:{},told:{},grp:[]};
    x.sn.goals=x.sn.goals||[];
    if(tp==='yn'){
      x.sn.goals.push({t,type:'yn'});
    } else {
      const s=+g('tgS'),a=+g('tgA');
      if(!(s>=0&&s<=10)||!(a>=0&&a<=10)){toast('Start and aim are numbers from 0 to 10');return;}
      x.sn.goals.push({t,start:s,aim:a,type:'scale'});
    }
    if(typeof window.tpPlanChanged==='function')window.tpPlanChanged(pid);
    render();toast('Goal added');
  };
  function goalForm(){
    const v=document.getElementById('view');if(!v)return;
    const m=String(location.hash||'').match(/^#\/patient\/([^/?]+)\/therapy/);if(!m)return;
    const pid=decodeURIComponent(m[1]);
    v.querySelectorAll('.tp-sec').forEach(sec=>{
      const h=sec.querySelector('.tp-h');if(!h||!/^Goals/.test(h.textContent.trim())||sec.querySelector('#tgForm'))return;
      const d=document.createElement('div');d.id='tgForm';d.style.cssText='display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-top:8px';
      const scaleF='<span id="tgScaleF" style="display:flex;gap:6px;align-items:center"><label class="tiny muted">Start <input class="input" id="tgS" type="number" min="0" max="10" value="2" style="width:64px;min-height:34px"></label><label class="tiny muted">Aim <input class="input" id="tgA" type="number" min="0" max="10" value="8" style="width:64px;min-height:34px"></label></span>';
      d.innerHTML='<input class="input" id="tgT" placeholder="Add a goal, in the patient\'s words" style="flex:1;min-width:220px"><select class="input" id="tgType" style="min-height:34px;width:auto" onchange="document.getElementById(\'tgScaleF\').style.display=this.value===\'yn\'?\'none\':\'flex\'"><option value="scale">0–10 scale</option><option value="yn">Yes / No</option></select>'+scaleF+'<button class="btn sm pri" type="button" onclick="tpGoalAdd(\''+pid+'\')">Add goal</button>';
      sec.appendChild(d);
    });
  }
  const __rg=render;
  render=function(){const o=__rg.apply(this,arguments);try{goalForm();}catch(e){}return o;};
})();
