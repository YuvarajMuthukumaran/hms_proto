/* 23 Nov 2026 (owner: "doesn't look good"): the goal pop-up's Log now box, redrawn. One question, the aim as a tag, one row of
   equal 48 px options (the aim option marked), the chosen one turns green when it meets the aim and amber when it does not,
   last log on the left, Save log on the right (off until something is chosen). */
const rep=require('./rep.cjs');
rep('public/legacy/js/177-goal-measures-21nov-js.js',[
 [`const logBox=canEdit?'<div id="glBox" style="border:1px solid #d6e4f7;background:#f5f9ff;border-radius:12px;padding:12px 14px;margin-bottom:14px"><div style="font-weight:700;margin-bottom:6px">Log now</div><div id="glIn">'+window.goalInput(g,i,'','glPick')+'</div><div style="display:flex;gap:8px;align-items:center;margin-top:8px"><button class="btn pri sm" onclick="glSave()">Save log</button><span id="glErr" class="small" style="color:var(--red)"></span></div></div>':'';`,
  `const lastL=L[L.length-1];
    const logBox=canEdit?'<section id="glBox" class="gl" aria-label="Log this goal"><div class="gl-h"><b>How did it go today?</b><span class="gl-aim">'+E(aimText(g))+'</span></div><div id="glIn">'+glView(g,'')+'</div><div class="gl-f"><span class="gl-last">'+(lastL?'Last: <b>'+E(fmt(g,lastL.v))+'</b> · '+E(String(lastL.at||'').split(',')[0]):'Not logged before')+'</span><span id="glErr" class="gl-err" role="alert"></span><button class="btn pri" id="glGo" disabled onclick="glSave()">Save log</button></div></section>':'';`],
 [`window.glPick=function(i,v){GL.v=GL.v===v?'':v;const x=psyPx(GL.pid),g=((x.sn&&x.sn.goals)||[])[i];const el=document.getElementById('glIn');if(g&&el)el.innerHTML=window.goalInput(g,i,GL.v,'glPick');};
  window.glPickSet=function(i,v){GL.v=v===''?'':+v;};`,
  `const glGoal=()=>{const x=psyPx(GL.pid);return ((x.sn&&x.sn.goals)||[])[GL.i];};
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
  ].join('');document.head.appendChild(st);}catch(e){}`],
]);
/* the aim is the tag in the box; not repeated under it */
rep('public/legacy/js/177-goal-measures-21nov-js.js',[
 [`<b>How it is logged:</b> here with Log now, or in a signed session note<br><b>'+E(aimText(g))+'</b></div>'`,
  `<b>How it is logged:</b> here with Log now, or in a signed session note'+(/^(psychologist|floor-lead-psychologist|psychiatrist|floor-lead-psychiatrist)$/.test(String((window.__TULASI__||{}).role||''))?'':'<br><b>'+E(aimText(g))+'</b>')+'</div>'`],
]);
