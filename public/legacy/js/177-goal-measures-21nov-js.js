/* 21 Nov 2026, Anu (WhatsApp): "not everything can be scored 0 to 10. Bathing is yes or no, hygiene 0 to 10, interaction 0 to 10.
   Let the psychologist choose how they want to score it." Setting a goal now has four parts:
   1 the goal, 2 how to measure it (Yes/No, 0 to 10 scale, own options, or a number such as hours), 3 how it is logged (in each signed session note),
   4 how it is shown (a bar per session, green when the aim is met; a "met x of last n" line).
   Goal shape: {t, type:'yn'|'scale'|'choice'|'num', start, aim, opts:[low..best], aimOpt, unit, dir:'atleast'|'atmost'}.
   Rating stored in the note's goalR[i]: 'yes'/'no' | 0-10 | option text | number. */
(function(){
  const E=s=>hesc(String(s==null?'':s));
  const TYPES={yn:'Yes / No',scale:'0 to 10 scale',choice:'Own options',num:'A number'};
  const optsOf=g=>Array.isArray(g.opts)?g.opts:[];
  const aimIdx=g=>{const o=optsOf(g),i=o.indexOf(g.aimOpt);return i<0?o.length-1:i;};
  const isNum=v=>v!==''&&v!==null&&v!==undefined&&!isNaN(+v);
  function met(g,v){
    if(g.type==='yn')return v==='yes';
    if(g.type==='scale'){const a=+g.aim,s=+g.start;return isNum(v)&&(a>=s?+v>=a:+v<=a);}
    if(g.type==='choice')return optsOf(g).indexOf(v)>=aimIdx(g)&&optsOf(g).indexOf(v)>=0;
    if(g.type==='num')return isNum(v)&&(g.dir==='atmost'?+v<=+g.aim:+v>=+g.aim);
    return false;
  }
  function fmt(g,v){
    if(g.type==='yn')return v==='yes'?'✓ Yes':'✗ No';
    if(g.type==='scale')return v+' / 10';
    if(g.type==='num')return v+(g.unit?' '+g.unit:'');
    return String(v);
  }
  function aimText(g){
    if(g.type==='yn')return 'Aim: Yes';
    if(g.type==='scale')return 'Aim: '+g.aim+' of 10';
    if(g.type==='choice')return 'Aim: '+(optsOf(g)[aimIdx(g)]||'');
    return 'Aim: '+(g.dir==='atmost'?'at most ':'at least ')+g.aim+(g.unit?' '+g.unit:'');
  }
  function howText(g){
    if(g.type==='yn')return 'Yes or No';
    if(g.type==='scale')return '0 to 10 scale';
    if(g.type==='choice')return 'One of: '+optsOf(g).join(', ');
    return 'A number'+(g.unit?' in '+g.unit:'');
  }
  /* 0 to 1 for a bar and for the small progress line */
  function frac(g,v,max){
    if(g.type==='yn')return v==='yes'?1:.15;
    if(g.type==='scale')return isNum(v)?Math.max(0,Math.min(10,+v))/10:0;
    if(g.type==='choice'){const o=optsOf(g),i=o.indexOf(v);return i<0?0:(i+1)/o.length;}
    return isNum(v)&&max>0?Math.max(0,Math.min(1,+v/max)):0;
  }
  /* old goals saved before 21 Nov have no measure type and no ratings yet: pick the obvious one from the words */
  window.goalGuess=function(g){
    const t=String(g.t||'');
    if(/sleep/i.test(t)&&/hours?/i.test(t)){const m=t.match(/(\d+(?:\.\d+)?)\s*hours?/i);return {type:'num',unit:'hours',dir:/(at most|no more|less than)/i.test(t)?'atmost':'atleast',aim:m?+m[1]:6};}
    if(/(group activit|bath|shower|take part|attend|brush|take (his|her|their|the) medic|eat )/i.test(t))return {type:'yn'};
    return null;
  };
  window.goalPct=function(g,v){
    if(!g)return 0;
    if(g.type==='scale'||!g.type)return Math.max(0,Math.min(100,Math.round((v-g.start)/Math.max(1,g.aim-g.start)*100)));
    if(v===undefined||v===''||v==='—')return 0;
    return met(g,v)?100:Math.round(frac(g,v,g.type==='num'?+g.aim:1)*100);
  };
  function strip(g,logs,big){
    const L=logs.slice(-10),h=big?70:34,w=big?34:20;
    if(!L.length)return '<span class="tiny muted" style="align-self:center">Nothing logged yet</span>';
    const max=g.type==='num'?Math.max(+g.aim||0,...L.map(r=>+r.v||0))||1:1;
    const bars=L.map(r=>{
      const m=met(g,r.v),f=frac(g,r.v,max);
      const col=m?'#12a150':(g.type==='yn'?'#d92d20':'#d97706');
      return '<span title="'+E(r.at+': '+fmt(g,r.v))+'" style="flex:1;max-width:'+w+'px;height:'+Math.max(5,Math.round(f*h))+'px;border-radius:4px 4px 0 0;background:'+col+'"></span>';
    }).join('');
    const aimLine=g.type==='num'?'<i style="position:absolute;left:0;right:0;bottom:'+Math.round((+g.aim/max)*h)+'px;border-top:2px dashed #15803d"></i>':'';
    return '<span aria-hidden="true" style="position:relative;display:flex;align-items:flex-end;gap:4px;height:'+h+'px;border-bottom:1px solid #cfd8d6;min-width:90px">'+aimLine+bars+'</span>';
  }
  /* one goal row on Therapy Plans, for every type except the 0 to 10 scale (that keeps its own line chart) */
  window.goalRow=function(pid,i,g,logs){
    const L=logs||[],last=L[L.length-1],last7=L.slice(-7),ok=last7.filter(r=>met(g,r.v)).length;
    const badge=last?'<b style="font-size:15px;color:'+(met(g,last.v)?'#067647':'#b45309')+'">'+E(fmt(g,last.v))+'</b>':'<span class="tiny muted">Not logged</span>';
    return '<button class="tp-goal" style="grid-template-columns:minmax(150px,1.2fr) minmax(120px,1.3fr) minmax(90px,auto);gap:20px" onclick="tpGoal(\''+pid+'\','+i+')">'
      +'<span class="tp-gt"><b>'+E(g.t)+'</b><em>'+E(TYPES[g.type]||'')+' · '+E(aimText(g))+'</em></span>'
      +strip(g,L,false)
      +'<span class="tp-gn" style="text-align:right">'+badge+'<small>'+(L.length?'met '+ok+' of last '+last7.length:'')+'</small></span></button>';
  };
  /* what a session note shows for rating one goal (0 to 10 keeps its own buttons) */
  window.goalInput=function(g,i,cv,h){
    h=h||'snGoal';
    const cap='<span class="lbl">'+E(g.t)+'<span class="tiny muted" style="margin-left:6px">'+E(howText(g))+' · '+E(aimText(g))+'</span></span>';
    if(g.type==='choice'){
      return '<div class="field">'+cap+'<div class="sn-chips">'+optsOf(g).map(o=>'<button type="button" class="sn-c '+(cv===o?'on':'')+'" data-v="'+E(o)+'" onclick="'+h+'('+i+',this.dataset.v)">'+E(o)+'</button>').join('')+'</div></div>';
    }
    if(g.type==='num'){
      return '<div class="field">'+cap+'<div style="display:flex;gap:8px;align-items:center"><input class="input" type="number" step="any" value="'+E(cv==null?'':cv)+'" style="width:110px" oninput="'+h+'Set('+i+',this.value)"><span class="small muted">'+E(g.unit||'')+'</span></div></div>';
    }
    if(g.type==='scale'){let b='';for(let k=0;k<=10;k++)b+='<button type="button" class="sn-c '+(cv===k?'on':'')+'" onclick="'+h+'('+i+','+k+')">'+k+'</button>';return '<div class="field">'+cap+'<div class="sn-chips">'+b+'</div></div>';}
    return '<div class="field">'+cap+'<div class="sn-chips"><button type="button" class="sn-c '+(cv==='yes'?'on':'')+'" onclick="'+h+'('+i+',\'yes\')">Yes</button><button type="button" class="sn-c '+(cv==='no'?'on':'')+'" onclick="'+h+'('+i+',\'no\')">No</button></div></div>';
  };
  /* the Goals part of a session note: every goal, rated the way it was set up */
  window.goalNoteInputs=function(goals,goalR,h){
    if(!goals||!goals.length)return '<div class="small muted">No goals are set yet. Set one in Therapy Plans, under Goals.</div>';
    return goals.map((g,i)=>{if(!g.type)g.type=g.start!==undefined?'scale':'yn';return window.goalInput(g,i,(goalR||{})[i],h);}).join('');
  };
  /* history pop-up for one goal: how it is measured, a bigger chart, every log */
  window.tpGoal=function(pid,i){
    const x=psyPx(pid),goals=(x.sn&&x.sn.goals)||[],g=goals[i];if(!g)return;
    const notes=((x.sn&&x.sn.notes)||[]).filter(n=>n&&n.status==='signed').slice().reverse().filter(n=>(n.goalR||{})[i]!==undefined&&n.goalR[i]!==''&&n.goalR[i]!==null);
    const L=notes.map(n=>({at:n.at,ts:n.ts||Date.parse(String(n.at||'').replace(/,/g,''))||0,v:n.goalR[i],src:'session note'})).concat((((x.sn&&x.sn.goalLog)||{})[i]||[]).map(r=>({at:r.at,ts:r.ts||0,v:r.v,src:r.by}))).sort((a,b)=>(a.ts||0)-(b.ts||0));
    const rows=L.slice().reverse().map(r=>'<div class="pin-r"><span>'+E(r.at)+(r.src?' · '+E(r.src):'')+'</span><b style="color:'+(met(g,r.v)?'#067647':'#b45309')+'">'+E(fmt(g,r.v))+(met(g,r.v)?' · aim met':'')+'</b></div>').join('');
    const body='<div class="small" style="margin-bottom:8px"><b>How it is measured:</b> '+E(howText(g))+'<br><b>How it is logged:</b> here with Log now, or in a signed session note'+(/^(psychologist|floor-lead-psychologist|psychiatrist|floor-lead-psychiatrist)$/.test(String((window.__TULASI__||{}).role||''))?'':'<br><b>'+E(aimText(g))+'</b>')+'</div>'
      +(L.length?'<div style="margin:10px 0 14px">'+strip(g,L,true)+'</div><div class="pin-sum">'+rows+'</div>':'<div class="small muted">Nothing logged yet. Log it above, or rate it in a session note.</div>');
    const old=(g.old||[]).map(o=>'<div class="small muted" style="margin-top:10px"><b>Earlier, measured as '+E(o.how)+':</b> '+(o.rows.length?o.rows.map(r=>E(r.at+' '+r.txt)).join(', '):'nothing logged')+'</div>').join('');
    const canEdit=/^(psychologist|floor-lead-psychologist|psychiatrist|floor-lead-psychiatrist)$/.test(String((window.__TULASI__||{}).role||''));
    const chg=canEdit?'<button class="btn" onclick="tpGoalNew(\''+String(pid).replace(/'/g,"\\'")+'\','+i+')">Change how it is measured</button>':'';
    GL.pid=pid;GL.i=i;GL.v='';
    const lastL=L[L.length-1];
    const logBox=canEdit?'<section id="glBox" class="gl" aria-label="Log this goal"><div class="gl-h"><b>How did it go today?</b><span class="gl-aim">'+E(aimText(g))+'</span></div><div id="glIn">'+glView(g,'')+'</div><div class="gl-f"><span class="gl-last">'+(lastL?'Last: <b>'+E(fmt(g,lastL.v))+'</b> · '+E(String(lastL.at||'').split(',')[0]):'Not logged before')+'</span><span id="glErr" class="gl-err" role="alert"></span><button class="btn pri" id="glGo" disabled onclick="glSave()">Save log</button></div></section>':'';
    V3.modal(E(g.t),E(TYPES[g.type]||'Goal'),logBox+body+old,chg+'<button class="btn pri" onclick="closeModal()">Close</button>');
  };
  /* Log now (goal pop-up) */
  const GL={pid:'',i:0,v:''};
  const glGoal=()=>{const x=psyPx(GL.pid);return ((x.sn&&x.sn.goals)||[])[GL.i];};
  function glView(g,cv){
    const has=cv!==''&&cv!==null&&cv!==undefined,tone=has?(met(g,cv)?'ok':'no'):'';
    if(g.type==='num'){
      return '<div class="gl-num '+tone+'"><input id="glNum" class="input" type="number" step="any" inputmode="decimal" placeholder="0" value="'+E(has?cv:'')+'" oninput="glPickSet(this.value)" aria-label="'+E(g.t)+'"><span>'+E(g.unit||'')+'</span></div>';
    }
    let opts;
    if(g.type==='scale'){opts=[];for(let k=0;k<=10;k++)opts.push([k,String(k),k===+g.aim]);}
    else if(g.type==='choice'){const o=optsOf(g),ai=aimIdx(g);opts=o.map((v,k)=>[v,v,k===ai]);}
    else opts=[['yes','Yes',true],['no','No',false]];
    return '<div class="gl-opts'+(g.type==='scale'?' sc':'')+'" role="radiogroup" style="grid-template-columns:repeat('+opts.length+',minmax(0,1fr))">'
      +opts.map(o=>{const on=has&&String(cv)===String(o[0]);return '<button type="button" role="radio" aria-checked="'+on+'" class="gl-o'+(on?' on '+tone:'')+'" data-v="'+E(o[0])+'" onclick="glPick(this.dataset.v)">'+E(o[1])+(o[2]?'<i>aim</i>':'')+'</button>';}).join('')+'</div>';
  }
  window.glPick=function(v){const g=glGoal();if(!g)return;if(g.type==='scale')v=+v;GL.v=String(GL.v)===String(v)?'':v;const el=document.getElementById('glIn');if(el)el.innerHTML=glView(g,GL.v);glReady();};
  window.glPickSet=function(v){GL.v=v===''?'':+v;const g=glGoal(),w=document.querySelector('#glIn .gl-num');if(g&&w){w.classList.remove('ok','no');if(GL.v!=='')w.classList.add(met(g,GL.v)?'ok':'no');}glReady();};
  function glReady(){const b=document.getElementById('glGo'),e=document.getElementById('glErr');if(b)b.disabled=(GL.v===''||(typeof GL.v==='number'&&isNaN(GL.v)));if(e)e.textContent='';}
  try{const st=document.createElement('style');st.textContent=[
    '.gl{border:1px solid #dbe5f1;border-radius:14px;background:#fff;padding:16px 16px 14px;margin:0 0 16px}',
    '.gl-h{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px}.gl-h b{font-size:16px;color:#101828}',
    '.gl-aim{font-size:13px;font-weight:600;color:#067647;background:#ecfdf3;border-radius:999px;padding:4px 10px;white-space:nowrap}',
    '.gl-opts{display:grid;gap:8px}',
    '.gl-o{position:relative;min-height:48px;border:1.5px solid #d0d8e3;border-radius:10px;background:#fff;font:inherit;font-size:15px;font-weight:600;color:#1d2939;cursor:pointer;padding:6px 8px;line-height:1.2}',
    '.gl-o:hover{border-color:#1e6cdb}.gl-o:focus-visible{outline:2px solid #1e6cdb;outline-offset:2px}',
    '.gl-o i{position:absolute;top:-8px;right:6px;font-style:normal;font-size:10.5px;font-weight:700;color:#067647;background:#fff;border:1px solid #abefc6;border-radius:999px;padding:0 6px;line-height:15px}',
    '.gl-opts.sc{gap:4px}.gl-opts.sc .gl-o{padding:6px 0;font-size:14px}',
    '.gl-o.on.ok{background:#067647;border-color:#067647;color:#fff}.gl-o.on.no{background:#b54708;border-color:#b54708;color:#fff}',
    '.gl-o.on i{background:#fff}',
    '.gl-num{display:flex;align-items:center;gap:10px}.gl-num input{width:140px;min-height:48px;font-size:20px;font-weight:700;text-align:center;border-width:1.5px}.gl-num span{font-size:15px;color:#475467}',
    '.gl-num.ok input{border-color:#067647;color:#067647}.gl-num.no input{border-color:#b54708;color:#b54708}',
    '.gl-f{display:flex;align-items:center;gap:12px;margin-top:14px;padding-top:12px;border-top:1px solid #eef2f6}',
    '.gl-last{font-size:13px;color:#667085;margin-right:auto}.gl-last b{color:#344054}.gl-err{font-size:13px;color:#b42318}',
    '#glGo[disabled]{opacity:.45;cursor:not-allowed}',
    '@media(max-width:560px){.gl-opts.sc{grid-template-columns:repeat(6,minmax(0,1fr))!important}}'
  ].join('');document.head.appendChild(st);}catch(e){}
  window.glSave=function(){
    const err=document.getElementById('glErr');
    if(GL.v===''||GL.v===null||GL.v===undefined||(typeof GL.v==='number'&&isNaN(GL.v))){if(err)err.textContent='Choose or type a value first';return;}
    const x=psyPx(GL.pid);x.sn=x.sn||{ladder:[],notes:[],goals:null,relapse:null,ybocs:'',planned:8,hwLog:{},hwWhy:{},told:{},grp:[]};
    x.sn.goalLog=x.sn.goalLog||{};const k=String(GL.i);x.sn.goalLog[k]=x.sn.goalLog[k]||[];
    const d=new Date(),at=d.toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})+', '+d.toLocaleTimeString('en-IN',{hour:'numeric',minute:'2-digit'});
    const role=String((window.__TULASI__||{}).role||'');
    x.sn.goalLog[k].push({at,ts:Date.now(),by:(typeof signer==='function'?signer():'')||role,role,v:GL.v});
    try{if(typeof V3!=='undefined'&&V3.log)V3.log(GL.pid,S.role,'note','Goal logged: '+(((x.sn.goals||[])[GL.i]||{}).t||'')+' = '+GL.v);}catch(e){}
    if(typeof window.tpPlanChanged==='function')window.tpPlanChanged(GL.pid);
    const pid=GL.pid,i=GL.i;closeModal();render();toast('Goal logged');
  };
  /* session note: free number */
  /* ---------- set a goal: goal, how to measure, how it is logged, how it is shown ---------- */
  const val=id=>((document.getElementById(id)||{}).value||'');
  window.tpGoalNew=function(pid,idx){
    const editing=idx!==undefined&&idx!==null&&idx!=='';
    const body='<div class="field"><span class="lbl">1 · The goal, in the patient\'s words</span><input class="input" id="gm_t" placeholder="e.g. Take a bath every day"></div>'
      +'<div class="field"><span class="lbl">2 · How will you measure it?</span><select class="input" id="gm_type" onchange="gmType()">'
      +'<option value="yn">Yes / No (done or not done)</option><option value="scale">0 to 10 scale (how much)</option><option value="choice">My own options (levels I choose)</option><option value="num">A number (hours, times, minutes)</option></select></div>'
      +'<div id="gm_f"></div>'
      +'<div class="callout grey small" id="gm_prev" style="margin-top:8px"></div>';
    V3.modal((editing?'Change how it is measured · ':'Set a goal · ')+E(V3.pn(pid)),editing?'Earlier ratings that do not fit the new measure are kept as history on the goal.':'Choose how it will be scored, so every session rates it the same way.',body,
      '<button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="tpGoalSave(\''+pid+'\''+(editing?','+idx:'')+')">'+(editing?'Save':'Add goal')+'</button>');
    if(editing){const g0=((psyPx(pid).sn||{}).goals||[])[idx]||{};const set=(id,v)=>{const e=document.getElementById(id);if(e&&v!==undefined)e.value=v;};
      set('gm_t',g0.t);set('gm_type',g0.type||(g0.start!==undefined?'scale':'yn'));window.gmType();
      if(g0.type==='scale'||!g0.type){set('gm_s',g0.start);set('gm_a',g0.aim);}
      if(g0.type==='choice'){set('gm_o',(g0.opts||[]).join(', '));window.gmOpts();set('gm_ao',g0.aimOpt);}
      if(g0.type==='num'){set('gm_u',g0.unit);set('gm_d',g0.dir);set('gm_a',g0.aim);}
      window.gmPrev();return;}
    window.gmType();
  };
  window.gmType=function(){
    const t=val('gm_type')||'yn',f=document.getElementById('gm_f');if(!f)return;
    if(t==='scale')f.innerHTML='<div style="display:flex;gap:12px"><label class="field"><span class="lbl">Starts at</span><input class="input" id="gm_s" type="number" min="0" max="10" value="2" oninput="gmPrev()"></label><label class="field"><span class="lbl">Aim</span><input class="input" id="gm_a" type="number" min="0" max="10" value="8" oninput="gmPrev()"></label></div>';
    else if(t==='choice')f.innerHTML='<label class="field"><span class="lbl">Options, from lowest to best, separated by commas</span><input class="input" id="gm_o" value="Not at all, Sometimes, Mostly, Fully" oninput="gmOpts()"></label><label class="field"><span class="lbl">Which option means the goal is met?</span><select class="input" id="gm_ao" onchange="gmPrev()"></select></label>';
    else if(t==='num')f.innerHTML='<div style="display:flex;gap:12px;flex-wrap:wrap"><label class="field"><span class="lbl">Unit</span><input class="input" id="gm_u" placeholder="hours" value="hours" style="width:120px" oninput="gmPrev()"></label><label class="field"><span class="lbl">Met when it is</span><select class="input" id="gm_d" onchange="gmPrev()"><option value="atleast">At least</option><option value="atmost">At most</option></select></label><label class="field"><span class="lbl">Number</span><input class="input" id="gm_a" type="number" step="any" value="6" style="width:100px" oninput="gmPrev()"></label></div>';
    else f.innerHTML='<div class="small muted">The psychologist answers Yes or No in each session note.</div>';
    if(t==='choice')window.gmOpts();else window.gmPrev();
  };
  window.gmOpts=function(){
    const sel=document.getElementById('gm_ao');if(!sel)return;
    const o=val('gm_o').split(',').map(s=>s.trim()).filter(Boolean),keep=sel.value;
    sel.innerHTML=o.map(x=>'<option'+(x===keep||(!keep&&x===o[o.length-1])?' selected':'')+'>'+E(x)+'</option>').join('');
    window.gmPrev();
  };
  function draft(){
    const t=val('gm_type')||'yn',g={t:val('gm_t').trim(),type:t};
    if(t==='scale'){g.start=+val('gm_s');g.aim=+val('gm_a');}
    if(t==='choice'){g.opts=val('gm_o').split(',').map(s=>s.trim()).filter(Boolean);g.aimOpt=val('gm_ao');}
    if(t==='num'){g.unit=val('gm_u').trim();g.dir=val('gm_d')||'atleast';g.aim=+val('gm_a');}
    return g;
  }
  window.gmPrev=function(){
    const p=document.getElementById('gm_prev');if(!p)return;const g=draft();
    p.innerHTML='<b>3 · How it is logged:</b> '+E(howText(g))+', in every signed session note.<br><b>4 · How it is shown:</b> one bar per session, green when the aim is met ('+E(aimText(g))+').';
  };
  window.tpGoalSave=function(pid,idx){
    const editing=idx!==undefined&&idx!==null&&idx!=='';
    const g=draft();
    if(!g.t){toast('Write the goal first');return;}
    if(g.type==='scale'&&!(g.start>=0&&g.start<=10&&g.aim>=0&&g.aim<=10)){toast('Start and aim are numbers from 0 to 10');return;}
    if(g.type==='choice'&&g.opts.length<2){toast('Write at least two options, separated by commas');return;}
    if(g.type==='num'&&!isNum(g.aim)){toast('Write the number that counts as met');return;}
    const x=psyPx(pid);x.sn=x.sn||{ladder:[],notes:[],goals:null,relapse:null,ybocs:'',planned:8,hwLog:{},hwWhy:{},told:{},grp:[]};
    x.sn.goals=x.sn.goals||[];
    if(editing){
      const o=x.sn.goals[idx];if(!o)return;
      const oldType=o.type||(o.start!==undefined?'scale':'yn');
      if(oldType!==g.type){
        const rows=[];((x.sn.notes||[]).filter(n=>n&&n.status==='signed').slice().reverse()).forEach(n=>{const v=(n.goalR||{})[idx];if(v!==undefined&&v!==''&&v!==null){rows.push({at:n.at,txt:fmt(o,v)});}});
        (x.sn.notes||[]).forEach(n=>{if(n&&n.goalR&&n.goalR[idx]!==undefined)delete n.goalR[idx];});
        if(x.sn.goalLog&&x.sn.goalLog[idx]){x.sn.goalLog[idx].forEach(r=>rows.push({at:r.at,txt:fmt(o,r.v)}));delete x.sn.goalLog[idx];}
        g.old=(o.old||[]).concat([{how:howText(Object.assign({},o,{type:oldType})),rows}]);
      }else if(o.old)g.old=o.old;
      x.sn.goals[idx]=g;
    }else x.sn.goals.push(g);
    if(typeof window.tpPlanChanged==='function')window.tpPlanChanged(pid);
    closeModal();render();toast(editing?'Goal updated':'Goal added');
  };
  /* the old one-line form from 134 becomes one button */
  function swapForm(){
    if(!/^(psychologist|floor-lead-psychologist)$/.test(String((window.__TULASI__||{}).role||'')))return;
    const v=document.getElementById('view');if(!v)return;
    const m=String(location.hash||'').match(/^#\/patient\/([^/?]+)\/therapy/);if(!m)return;
    const pid=decodeURIComponent(m[1]);
    v.querySelectorAll('.tp-sec').forEach(sec=>{
      const h=sec.querySelector('.tp-h');if(!h||!/^Goals/.test(h.textContent.trim()))return;
      let f=sec.querySelector('#tgForm');
      if(!f){f=document.createElement('div');f.id='tgForm';f.style.cssText='margin-top:8px';sec.appendChild(f);}
      f.innerHTML='<button class="btn sm pri" type="button" onclick="tpGoalNew(\''+pid.replace(/'/g,"\\'")+'\')">+ Set a goal</button>';
    });
  }
  const __r=render;
  render=function(){const o=__r.apply(this,arguments);try{swapForm();}catch(e){}return o;};
})();
