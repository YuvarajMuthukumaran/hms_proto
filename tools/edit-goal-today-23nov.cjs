/* 23 Nov 2026 (owner): Goals calendar. Today's goals that are not logged yet show as grey "due" marks on today's cell, and the
   right panel opens on today with every goal loggable in place (one tap for Yes/No, 0-10 and choices; type and Save for numbers).
   Month summary is still one click away. Saved like Log now: psyx.sn.goalLog[i] = [{at,ts,by,role,v}]. */
const rep=require('./rep.cjs');
const F='public/legacy/js/187-goal-calendar-23nov-js.js';
rep(F,[
 ["    const sel=st['s_'+pid+'_'+seg]||'';",
  "    const todayK=key(now),canLog=seg==='ind'&&D.series.length>0,selRaw=st['s_'+pid+'_'+seg];\n"+
  "    const sel=(selRaw===undefined||selRaw==='')?(canLog?todayK:''):selRaw==='sum'?'':selRaw;\n"+
  "    const due=canLog?D.series.map((t,i)=>i).filter(i=>!D.out.some(e=>e.s===i&&key(e.d)===todayK)):[];"],
 ["'</span><span class=\"gc-ms\">'+L.map(mark).join('')+'</span></button>';}",
  "'</span><span class=\"gc-ms\">'+L.map(mark).join('')+(key(dt)===todayK?due.map(i=>'<i class=\"gc-c due\" style=\"--c:'+colOf(seg,D,i)+'\" title=\"'+E(D.series[i])+': due today, not logged yet\"></i>').join(''):'')+'</span></button>';}"],
 ["    if(sel&&by[sel]){const L=by[sel],dd=L[0].d;",
  "    if(canLog&&sel===todayK)side=todayPanel(pid,seg,D,by[sel]||[],due);\n    else if(sel&&by[sel]){const L=by[sel],dd=L[0].d;"],
 ["  window.gcDay=function(seg,k){const s='s_'+S.pid+'_'+seg;st[s]=st[s]===k?'':k;redraw(seg);};",
  "  window.gcDay=function(seg,k){const s='s_'+S.pid+'_'+seg;st[s]=(k===''||st[s]===k)?'sum':k;redraw(seg);};\n"+
  "  /* today's panel: every goal with its aim, what is logged today, and the buttons to log it here */\n"+
  "  const aimT=g=>{const t=g.type||'scale';if(t==='yn')return 'Aim: Yes';if(t==='num')return 'Aim: '+(g.dir==='atmost'?'at most ':'at least ')+g.aim+(g.unit?' '+g.unit:'');if(t==='choice')return 'Aim: '+(g.aimOpt||((g.opts||[]).slice(-1)[0])||'');return 'Aim: '+(g.aim==null?8:g.aim)+' of 10';};\n"+
  "  function todayPanel(pid,seg,D,L,due){\n"+
  "    const goals=((psyPx(pid).sn||{}).goals)||[],P=E(pid);\n"+
  "    const rows=goals.map((g0,i)=>{const g=Object.assign({},g0,{type:g0.type||'scale'}),mine=L.filter(e=>e.s===i),isDue=due.indexOf(i)>=0;\n"+
  "      const got=mine.map(e=>(e.det.find(r=>r[0]==='Logged')||[])[1]).filter(v=>v!==undefined);\n"+
  "      const lastV=got.length?got[got.length-1]:'',ok=got.length?met(g,g.type==='scale'?+lastV:lastV):null;\n"+
  "      let opts=null;if(g.type==='yn')opts=[['yes','Yes'],['no','No']];else if(g.type==='choice')opts=(g.opts||[]).map(o=>[o,o]);else if(g.type==='scale'){opts=[];for(let k=0;k<=10;k++)opts.push([String(k),String(k)]);}\n"+
  "      const inp=opts?`<div class=\"gc-lo${g.type==='scale'?' sc':''}\">${opts.map(o=>`<button type=\"button\" class=\"gc-lb${String(lastV)===String(o[0])?' on':''}\" data-p=\"${P}\" data-i=\"${i}\" data-v=\"${E(o[0])}\" onclick=\"gcLog(this)\">${E(o[1])}</button>`).join('')}</div>`\n"+
  "        :`<div class=\"gc-lo\"><input type=\"number\" step=\"any\" inputmode=\"decimal\" class=\"input gc-ni\" id=\"gcN${i}\" placeholder=\"0\" aria-label=\"${E(g.t)}\" onkeydown=\"if(event.key==='Enter')gcLogNum(this.nextElementSibling)\"><button type=\"button\" class=\"btn sm pri\" data-p=\"${P}\" data-i=\"${i}\" onclick=\"gcLogNum(this)\">Save</button>${g.unit?`<span class=\"tiny muted\">${E(g.unit)}</span>`:''}</div>`;\n"+
  "      const stt=isDue?'<span class=\"gc-es due\">Due</span>':`<span class=\"gc-es ${ok?'ok':'no'}\">${E(got.length>1?got.length+' logs, last '+lastV:'Logged '+lastV)}</span>`;\n"+
  "      return `<div class=\"gc-lg${isDue?' is-due':''}\" style=\"--c:${colOf(seg,D,i)}\"><div class=\"gc-et\"><i class=\"gc-sw\" style=\"background:var(--c)\"></i><b>${E(g.t)}</b>${stt}</div><div class=\"tiny muted\">${E(aimT(g))}</div>${inp}</div>`;}).join('');\n"+
  "    const nd=due.length;\n"+
  "    return `<div class=\"gc-side gc-det\"><div class=\"gc-dh\"><b>Today · ${E(new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'}))}</b><button type=\"button\" class=\"btn sm\" data-s=\"${seg}\" onclick=\"gcDay(this.dataset.s,'')\">Month summary</button></div><div class=\"small ${nd?'':'muted'}\" style=\"${nd?'color:#475467':''}\">${nd?nd+' of '+goals.length+' goal'+(goals.length===1?'':'s')+' still to log today':'All goals logged today'}</div>${rows}</div>`;\n"+
  "  }\n"+
  "  function gcSave(pid,i,v){\n"+
  "    const x=psyPx(pid);x.sn=x.sn||{ladder:[],notes:[],goals:null,relapse:null,ybocs:'',planned:8,hwLog:{},hwWhy:{},told:{},grp:[]};\n"+
  "    const g=((x.sn.goals||[])[i])||{};x.sn.goalLog=x.sn.goalLog||{};const k=String(i);x.sn.goalLog[k]=x.sn.goalLog[k]||[];\n"+
  "    const d=new Date(),at=d.toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})+', '+d.toLocaleTimeString('en-IN',{hour:'numeric',minute:'2-digit'}),role=ROLE;\n"+
  "    x.sn.goalLog[k].push({at,ts:Date.now(),by:(typeof signer==='function'?signer():'')||role,role,v});\n"+
  "    try{if(typeof V3!=='undefined'&&V3.log)V3.log(pid,S.role,'note','Goal logged: '+(g.t||'')+' = '+v);}catch(e){}\n"+
  "    if(typeof window.tpPlanChanged==='function')window.tpPlanChanged(pid);\n"+
  "    render();toast('Logged: '+(g.t||'goal'));\n"+
  "  }\n"+
  "  window.gcLog=function(b){const pid=b.dataset.p,i=+b.dataset.i,g=(((psyPx(pid).sn||{}).goals)||[])[i]||{};let v=b.dataset.v;if((g.type||'scale')==='scale')v=+v;gcSave(pid,i,v);};\n"+
  "  window.gcLogNum=function(b){const i=+b.dataset.i,el=document.getElementById('gcN'+i),s=String((el||{}).value||'').trim();if(s===''||isNaN(+s)){if(el)el.focus();toast('Type a number first');return;}gcSave(b.dataset.p,i,+s);};"],
 ["    '.gc-sw{display:inline-block;",
  "    '.gc-c.due{background:#f2f4f7;border-color:#98a2b3;position:relative}.gc-c.due::after{content:\"\";width:6px;height:6px;border-radius:50%;background:var(--c)}.gc-es.due{background:#f2f4f7;color:#475467}'+\n"+
  "    '.gc-lg{border:1px solid #eef2f6;border-left:4px solid var(--c);border-radius:10px;padding:10px 12px;display:grid;gap:6px}.gc-lg.is-due{background:#fafbfc}'+\n"+
  "    '.gc-lo{display:flex;flex-wrap:wrap;gap:5px;align-items:center}.gc-lo.sc{display:grid;grid-template-columns:repeat(6,minmax(0,1fr))}'+\n"+
  "    '.gc-lb{all:unset;box-sizing:border-box;min-width:40px;min-height:34px;padding:0 10px;border:1.5px solid #d0d8e3;border-radius:8px;background:#fff;font-size:13px;font-weight:600;color:#1d2939;text-align:center;cursor:pointer;display:inline-flex;align-items:center;justify-content:center}'+\n"+
  "    '.gc-lb:hover{border-color:var(--c)}.gc-lb:focus-visible{outline:2px solid #1e6cdb;outline-offset:1px}.gc-lb.on{background:var(--c);border-color:var(--c);color:#fff}.gc-lo.sc .gc-lb{min-width:0;padding:0}'+\n"+
  "    '.gc-ni{width:96px;min-height:34px;font-size:15px;font-weight:700;text-align:center}'+\n"+
  "    '.gc-sw{display:inline-block;"],
]);
