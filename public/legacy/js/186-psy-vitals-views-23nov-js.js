/* 23 Nov 2026, meeting with Dr. Anu and Nikita: Treatment Plan > Vitals and monitoring. Psychiatrist and floor lead psychiatrist.
   - The filters did not work ("All dates" said "No vitals recorded yet" above the readings). Now:
     dates: All, Today, Last 7 days, Last 30 days, or From / To; parameter: All, BP, Pulse, Resp. rate, Temp, SpO2, Sugar (several at once).
   - Anu asked for 3 to 4 versions of the table to choose from. A switch shows four layouts of the same readings:
       1. Table: one column per parameter, one row per reading (every BP in one column, every sugar in one column).
       2. One row a day: each parameter cell lists that day's readings with their times.
       3. Paper chart: parameters down the side, days across (like the paper vitals chart), sideways scroll.
       4. Trend: a small graph per parameter with the latest value and the range.
     The choice is remembered on this computer. Record vitals and Record blood sugar stay.
   Reads the same readings as before (S.vit and S.sugarNew); nothing is saved differently. */
(function(){
  if(!/^(psychiatrist|floor-lead-psychiatrist)$/.test(String((window.__TULASI__||{}).role||'')))return;
  const E=s=>hesc(String(s==null?'':s));
  const LS='m23_vx_layout';
  const st=window.__vx=window.__vx||{lay:(()=>{try{return localStorage.getItem(LS)||'table';}catch(e){return 'table';}})(),range:'all',from:'',to:'',par:{}};
  const P=[['bp','BP','mmHg'],['hr','Pulse','per min'],['rr','Resp. rate','per min'],['t','Temp','°F'],['o2','SpO2','%'],['sg','Sugar','mg/dL']];
  const bad={bp:v=>{const m=String(v).match(/^(\d+)\/(\d+)/);return !!m&&(+m[1]>=140||+m[1]<90||+m[2]>=90);},hr:v=>+v>100||+v<50,rr:v=>+v>20||+v<12,t:v=>+v>=100.4||+v<96,o2:v=>+v<95,sg:v=>+v>180||+v<70};
  const MON={jan:0,feb:1,mar:2,apr:3,may:4,jun:5,jul:6,aug:7,sep:8,oct:9,nov:10,dec:11};
  function stamp(day,time){
    const m=String(day||'').match(/(\d{1,2})\s+([A-Za-z]{3})[a-z]*\.?\s*(\d{4})?/);if(!m)return 0;
    const now=new Date();let y=m[3]?+m[3]:now.getFullYear();
    let d=new Date(y,MON[m[2].toLowerCase()]||0,+m[1]);
    if(!m[3]&&d.getTime()>now.getTime()+86400000)d=new Date(y-1,d.getMonth(),d.getDate());
    const t=String(time||'').match(/(\d{1,2})(?::(\d{2}))?\s*([ap])\.?m/i);
    if(t){let h=+t[1]%12;if(/p/i.test(t[3]))h+=12;d.setHours(h,+(t[2]||0));}
    return d.getTime();
  }
  const ok=v=>v!=null&&v!==''&&v!=='—';
  function readings(){
    const R=[];
    (Array.isArray(S.vit)?S.vit:[]).forEach(v=>{R.push({ts:stamp(v[0],v[7]),day:v[0],time:v[7]||'',by:v[9]||v[8]||'',bp:v[1],hr:v[2],t:v[3],o2:v[4],rr:v[10]||'',wt:v[5],sl:v[6]});});
    (Array.isArray(S.sugarNew)?S.sugarNew:[]).forEach(x=>{const a=String(x.at||'').split(',');R.push({ts:stamp(a[0],a[1]),day:a[0].trim(),time:(a[1]||'').trim(),by:x.by||'',sg:x.v,sgw:x.when||''});});
    return R.sort((a,b)=>b.ts-a.ts);
  }
  const dayKey=ts=>{const d=new Date(ts);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};
  const dayLbl=ts=>new Date(ts).toLocaleDateString('en-IN',{day:'numeric',month:'short'});
  function filtered(){
    let R=readings();const now=new Date(),t0=new Date(now.getFullYear(),now.getMonth(),now.getDate()).getTime();
    if(st.range==='today')R=R.filter(r=>r.ts>=t0);
    else if(st.range==='7')R=R.filter(r=>r.ts>=t0-6*86400000);
    else if(st.range==='30')R=R.filter(r=>r.ts>=t0-29*86400000);
    else if(st.range==='custom'){const f=st.from?new Date(st.from+'T00:00').getTime():0,to=st.to?new Date(st.to+'T23:59').getTime():Infinity;R=R.filter(r=>r.ts>=f&&r.ts<=to);}
    const ps=pars();R=R.filter(r=>ps.some(p=>ok(r[p[0]])));
    return R;
  }
  const pars=()=>{const on=P.filter(p=>st.par[p[0]]);return on.length?on:P;};
  const cell=(k,v)=>ok(v)?`<span class="vx-v${bad[k]&&bad[k](v)?' bad':''}">${E(v)}</span>`:'<span class="vx-no">—</span>';
  const tm=r=>E(r.time||'Time not recorded')+(r.sgw?`<div class="tiny muted">${E(r.sgw)}</div>`:'');

  /* 1. table */
  function vTable(R,ps){
    return `<div class="vx-scroll"><table class="vx-t"><thead><tr><th>Date</th><th>Time</th>${ps.map(p=>`<th>${p[1]}<small>${p[2]}</small></th>`).join('')}<th>Taken by</th></tr></thead><tbody>${R.map(r=>`<tr><td><b>${E(dayLbl(r.ts))}</b></td><td>${tm(r)}</td>${ps.map(p=>`<td>${cell(p[0],r[p[0]])}</td>`).join('')}<td class="small muted">${E(r.by)}</td></tr>`).join('')}</tbody></table></div>`;
  }
  /* 2. one row a day */
  function byDay(R){const m=new Map();R.forEach(r=>{const k=dayKey(r.ts);if(!m.has(k))m.set(k,[]);m.get(k).push(r);});return [...m.values()];}
  function vDay(R,ps){
    return `<div class="vx-scroll"><table class="vx-t vx-day"><thead><tr><th>Date</th>${ps.map(p=>`<th>${p[1]}<small>${p[2]}</small></th>`).join('')}</tr></thead><tbody>${byDay(R).map(d=>`<tr><td><b>${E(dayLbl(d[0].ts))}</b><div class="tiny muted">${d.length} reading${d.length>1?'s':''}</div></td>${ps.map(p=>{const xs=d.filter(r=>ok(r[p[0]])).slice().reverse();return `<td>${xs.length?xs.map(r=>`<div class="vx-li">${cell(p[0],r[p[0]])} <small>${E(r.time||'')}${r.sgw?' · '+E(r.sgw):''}</small></div>`).join(''):'<span class="vx-no">—</span>'}</td>`;}).join('')}</tr>`).join('')}</tbody></table></div>`;
  }
  /* 3. paper chart: parameters down, days across */
  function vPaper(R,ps){
    const D=byDay(R).reverse();
    return `<div class="vx-scroll"><table class="vx-t vx-paper"><thead><tr><th class="vx-pin">Parameter</th>${D.map(d=>`<th>${E(dayLbl(d[0].ts))}</th>`).join('')}</tr></thead><tbody>${ps.map(p=>`<tr><th class="vx-pin">${p[1]}<small>${p[2]}</small></th>${D.map(d=>{const xs=d.filter(r=>ok(r[p[0]])).slice().reverse();return `<td>${xs.length?xs.map(r=>`<div class="vx-li">${cell(p[0],r[p[0]])}<small>${E(r.time||'')}</small></div>`).join(''):'<span class="vx-no">—</span>'}</td>`;}).join('')}</tr>`).join('')}</tbody></table></div>`;
  }
  /* 4. trend graphs */
  const num=(k,v)=>k==='bp'?+String(v).split('/')[0]:+v;
  function spark(k,xs){
    const w=260,h=64,vals=xs.map(r=>num(k,r[k])).filter(n=>isFinite(n));if(vals.length<2)return '<div class="small muted" style="padding:20px 0">One reading only</div>';
    const mn=Math.min(...vals),mx=Math.max(...vals),sy=v=>h-6-(v-mn)/((mx-mn)||1)*(h-12),sx=i=>6+i*(w-12)/(vals.length-1);
    return `<svg viewBox="0 0 ${w} ${h}" width="100%" height="${h}" aria-label="Trend"><polyline fill="none" stroke="#1e6cdb" stroke-width="2" points="${vals.map((v,i)=>sx(i)+','+sy(v)).join(' ')}"/>${xs.map((r,i)=>`<circle cx="${sx(i)}" cy="${sy(vals[i])}" r="3" fill="${bad[k](r[k])?'#b42318':'#1e6cdb'}"><title>${E(dayLbl(r.ts))} ${E(r.time||'')}: ${E(r[k])}</title></circle>`).join('')}</svg>`;
  }
  function vTrend(R,ps){
    return `<div class="vx-tr">${ps.map(p=>{const xs=R.filter(r=>ok(r[p[0]])).slice().reverse();const L=xs[xs.length-1];
      const vals=xs.map(r=>num(p[0],r[p[0]])).filter(n=>isFinite(n));
      return `<div class="vx-tc"><div class="vx-th"><b>${p[1]}</b><small>${p[2]}</small><span style="flex:1"></span>${L?cell(p[0],L[p[0]]):''}</div>${xs.length?spark(p[0],xs)+`<div class="tiny muted">${xs.length} reading${xs.length>1?'s':''} · lowest ${Math.min(...vals)} · highest ${Math.max(...vals)}${p[0]==='bp'?' (systolic)':''} · latest ${E(dayLbl(L.ts))} ${E(L.time||'')}</div>`:'<div class="small muted" style="padding:20px 0">No readings</div>'}</div>`;}).join('')}</div>`;
  }

  const LAY=[['table','Table'],['day','One row a day'],['paper','Paper chart'],['trend','Trend']];
  const RANGE=[['all','All dates'],['today','Today'],['7','Last 7 days'],['30','Last 30 days'],['custom','From – to']];
  function html(){
    const R=filtered(),ps=pars(),all=readings().length;
    const body=!all?'<div class="vx-empty"><b>No readings yet.</b><br>Tap <b>Record vitals</b> or <b>Record blood sugar</b> to add the first one.</div>'
      :!R.length?'<div class="vx-empty">No readings for this filter.</div>'
      :({table:vTable,day:vDay,paper:vPaper,trend:vTrend}[st.lay]||vTable)(R,ps);
    return `<div class="vx-bar"><div class="vx-seg" role="tablist" aria-label="Layout">${LAY.map(([k,l],i)=>`<button type="button" class="${st.lay===k?'on':''}" onclick="vxSet('lay','${k}')">${i+1}. ${l}</button>`).join('')}</div><span style="flex:1"></span>
        <button class="btn sm pri" onclick="vitalsModal()">+ Record vitals</button><button class="btn sm" onclick="sugarModal()">+ Record blood sugar</button></div>
      <div class="vx-bar"><span class="vx-l">Dates</span>${RANGE.map(([k,l])=>`<button type="button" class="vx-c ${st.range===k?'on':''}" onclick="vxSet('range','${k}')">${l}</button>`).join('')}
        ${st.range==='custom'?`<input type="date" class="input vx-d" value="${E(st.from)}" onchange="vxSet('from',this.value)"><span class="small muted">to</span><input type="date" class="input vx-d" value="${E(st.to)}" onchange="vxSet('to',this.value)">`:''}</div>
      <div class="vx-bar"><span class="vx-l">Show</span><button type="button" class="vx-c ${!P.some(p=>st.par[p[0]])?'on':''}" onclick="vxSet('par','')">All</button>${P.map(p=>`<button type="button" class="vx-c ${st.par[p[0]]?'on':''}" onclick="vxSet('par','${p[0]}')">${p[1]}</button>`).join('')}
        <span style="flex:1"></span><span class="small muted">${R.length} of ${all} reading${all===1?'':'s'} · out of range in red</span></div>
      ${body}`;
  }
  window.vxSet=function(k,v){
    if(k==='par'){if(!v)st.par={};else st.par[v]=!st.par[v];}
    else st[k]=v;
    if(k==='lay'){try{localStorage.setItem(LS,v);}catch(e){}}
    const b=document.getElementById('vxBox');if(b)b.innerHTML=html();
  };
  function paint(){
    const card=document.querySelector('#view .vm10');if(!card)return;
    let box=card.querySelector('#vxBox');
    if(!box){
      box=document.createElement('div');box.id='vxBox';
      const hd=card.querySelector(':scope > .hd');
      [...card.children].forEach(c=>{if(c!==hd)c.classList.add('vx-old');});
      (hd?hd.after(box):card.prepend(box));
      if(hd)hd.querySelectorAll('button').forEach(b=>{if(/Record (vitals|blood sugar)|Add vitals/i.test(b.textContent))b.classList.add('vx-old');});
    }
    box.innerHTML=html();
  }
  const css=document.createElement('style');css.id='m23-vx-css';
  css.textContent='#view .vm10 .vx-old,#view .vm10:has(#vxBox) .vd-mode{display:none!important}#vxBox{padding:4px 16px 16px;display:flex;flex-direction:column;gap:10px}'
    +'.vx-bar{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.vx-l{font-size:12px;font-weight:700;color:#475467;min-width:44px}'
    +'.vx-seg{display:inline-flex;border:1px solid #d5e1ef;border-radius:10px;overflow:hidden}.vx-seg button{border:0;background:#fff;padding:8px 14px;font-size:13px;cursor:pointer;color:#475467}.vx-seg button+button{border-left:1px solid #e3eaf2}.vx-seg button.on{background:#1e6cdb;color:#fff;font-weight:600}'
    +'.vx-c{border:1px solid #d5e1ef;background:#fff;border-radius:999px;padding:5px 12px;font-size:13px;cursor:pointer;color:#344054}.vx-c.on{background:#eaf2ff;border-color:#1e6cdb;color:#1e4fa8;font-weight:600}'
    +'.vx-d{width:150px;min-height:32px;padding:4px 8px}'
    +'.vx-scroll{overflow:auto;border:1px solid #e3eaf2;border-radius:12px;max-height:70vh}'
    +'.vx-t{width:100%;border-collapse:separate;border-spacing:0;font-size:13.5px}.vx-t th,.vx-t td{padding:9px 12px;border-bottom:1px solid #eef2f6;text-align:left;vertical-align:top;white-space:nowrap}'
    +'.vx-t thead th{position:sticky;top:0;background:#f5f8fc;z-index:1;font-size:12.5px;color:#344054}.vx-t th small{display:block;font-weight:400;color:#667085;font-size:11px}'
    +'.vx-v{font-weight:700;color:#101828}.vx-v.bad{color:#b42318}.vx-no{color:#c0c7d2}.vx-li{line-height:1.5}.vx-li small{color:#667085;margin-left:4px}'
    +'.vx-paper .vx-pin{position:sticky;left:0;background:#f5f8fc;z-index:2;min-width:120px}.vx-paper thead .vx-pin{z-index:3}.vx-paper td{min-width:110px;border-left:1px solid #eef2f6}'
    +'.vx-tr{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px}.vx-tc{border:1px solid #e3eaf2;border-radius:12px;padding:12px 14px;background:#fff}'
    +'.vx-th{display:flex;align-items:baseline;gap:6px;margin-bottom:6px}.vx-th small{color:#667085;font-size:11px}.vx-th .vx-v{font-size:18px}'
    +'.vx-empty{padding:22px;border:1px dashed #cfd8d6;border-radius:12px;color:#475467;text-align:center}';
  document.head.appendChild(css);
  const __r=render;
  render=function(){const o=__r.apply(this,arguments);try{paint();}catch(e){}return o;};
  /* switching to the tab does not always call render */
  document.addEventListener('click',e=>{if(e.target&&e.target.closest&&e.target.closest('.psy-tx-tab'))setTimeout(()=>{try{paint();}catch(x){}},60);},true);
})();
