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
  /* 23 Nov meeting (Anu): only "One row a day" and "Trend" stay */
  if(st.lay!=='day'&&st.lay!=='trend')st.lay='day';
  const P0=[['bp','BP','mmHg'],['hr','Pulse','per min'],['rr','Resp. rate','per min'],['t','Temp','°F'],['o2','SpO2','%'],['sg','Sugar','mg/dL']];
  /* 23 Nov meeting: every monitoring option, but only for the patients who have it (a reading, or an order in Order monitoring) */
  const PEX=[['wt','Weight','kg','Weight'],['uo','Urine output','ml','Urine output']];
  let P=P0;
  function setP(R){
    let ord=[];try{ord=(typeof monList==='function'&&S.pid?monList(S.pid):[]).map(x=>x[0]);}catch(e){}
    P=P0.concat(PEX.filter(p=>ord.includes(p[3])||R.some(r=>ok(r[p[0]]))).map(p=>p.slice(0,3)));
    Object.keys(st.par).forEach(k=>{if(!P.some(p=>p[0]===k))delete st.par[k];});
  }
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
    (Array.isArray(S.vit)?S.vit:[]).forEach(v=>{R.push({ts:stamp(v[0],v[7]),day:v[0],time:v[7]||'',by:v[9]||v[8]||'',bp:v[1],hr:v[2],t:v[3],o2:v[4],rr:v[10]||'',wt:v[5],sl:v[6],uo:v[11]||''});});
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
  /* 23 Nov meeting (Anu): BP is two lines, systolic and diastolic, dates across and mmHg up the side.
     Every other vital is one dot per reading; several readings on one day stand in that day's column, each with its time. */
  const NORM={bp:[[90,140],[60,90]],hr:[50,100],rr:[12,20],t:[96,100.4],o2:[95,100],sg:[70,180]};
  const tmS=r=>String(r.time||'').replace(/\s/g,'').replace(/(am|pm)$/i,m=>m[0].toLowerCase());
  function chart(k,xs){
    const isBp=k==='bp';
    const S1=isBp?[['Systolic','#c2410c',r=>+String(r.bp).split('/')[0]],['Diastolic','#1e6cdb',r=>+String(r.bp).split('/')[1]]]:[[k,'#1e6cdb',r=>+r[k]]];
    const D=byDay(xs);if(!D.length)return '';/* xs is oldest first, so days and readings run left to right */
    const all=[];S1.forEach(s=>xs.forEach(r=>{const v=s[2](r);if(isFinite(v))all.push(v);}));if(!all.length)return '';
    const nr=NORM[k];let lo=Math.min(...all),hi=Math.max(...all);
    if(nr){const a=isBp?[nr[0][0],nr[1][0]]:[nr[0]],b=isBp?[nr[0][1],nr[1][1]]:[nr[1]];lo=Math.min(lo,...a);hi=Math.max(hi,...b);}
    const pad=(hi-lo||Math.abs(hi)||10)*.12;lo=Math.floor(lo-pad);hi=Math.ceil(hi+pad);
    /* 23 Nov redesign: the chart fills its row (viewBox 760 wide, scaled to the row); many days scroll sideways at 64 px a day */
    /* drawn at real pixel size (no scaling, so text stays small): width = the row's chart space, measured from the page */
    const vw0=((document.querySelector('#view')||{}).clientWidth||1000),VW=Math.max(360,Math.min(1100,(vw0>900?vw0-420:vw0-40))),L=40,T=16,H=isBp?170:120,fit=(VW-L-12)/D.length>=64,colW=fit?(VW-L-12)/D.length:64,W=fit?VW:L+colW*D.length+12,B=H-30;
    const y=v=>T+(hi-v)/((hi-lo)||1)*(B-T);
    const step=(()=>{const r=(hi-lo)/4,m=Math.pow(10,Math.floor(Math.log10(r||1)));return [1,2,2.5,5,10].map(f=>f*m).find(f=>f>=r)||r;})();
    let g='';
    for(let v=Math.ceil(lo/step)*step;v<=hi;v+=step){const yy=y(v).toFixed(1);g+=`<line x1="${L}" x2="${W-8}" y1="${yy}" y2="${yy}" stroke="#eef1f5"/><text x="${L-8}" y="${(+yy+4).toFixed(1)}" text-anchor="end" class="vx-ax">${+v.toFixed(1)}</text>`;}
    /* 24 Nov 2026 (Anu, meeting): no green usual-range band */
    if(isBp){[140,90].forEach(v=>{if(v>lo&&v<hi)g+=`<line x1="${L}" x2="${W-8}" y1="${y(v).toFixed(1)}" y2="${y(v).toFixed(1)}" stroke="#f04438" stroke-dasharray="4 4" opacity=".45"/>`;});}
    const pts=[];/* x of each reading: its day column, spread by time inside the column */
    D.forEach((d,i)=>{const x0=L+i*colW,n=d.length;d.forEach((r,j)=>{pts.push({r,x:x0+colW*(n===1?.5:(.2+.6*j/(n-1))),i});});
      g+=`<text x="${(x0+colW/2).toFixed(1)}" y="${H-12}" text-anchor="middle" class="vx-axd">${E(dayLbl(d[0].ts))}</text>`;
      if(i)g+=`<line x1="${x0}" x2="${x0}" y1="${T}" y2="${B}" stroke="#f2f4f7"/>`;});
    g+=`<line x1="${L}" x2="${L}" y1="${T}" y2="${B}" stroke="#d0d5dd"/><line x1="${L}" x2="${W-8}" y1="${B}" y2="${B}" stroke="#d0d5dd"/>`;
    S1.forEach(([nm,c,f])=>{const P2=pts.map(p=>({p,v:f(p.r)})).filter(o=>isFinite(o.v));
      if(isBp&&P2.length>1)g+=`<polyline class="vx-ln" pathLength="1" fill="none" stroke="${c}" stroke-width="2.25" stroke-linejoin="round" points="${P2.map(o=>o.p.x.toFixed(1)+','+y(o.v).toFixed(1)).join(' ')}"/>`;
      P2.forEach(o=>{const out=bad[k]&&bad[k](o.p.r[k]);const lbl=isBp?o.v:o.p.r[k];
        g+=`<g class="vx-pt"><circle cx="${o.p.x.toFixed(1)}" cy="${y(o.v).toFixed(1)}" r="${isBp?3.6:4.6}" fill="${out&&!isBp?'#d92d20':c}" stroke="#fff" stroke-width="1.5"/><text x="${o.p.x.toFixed(1)}" y="${(y(o.v)-9).toFixed(1)}" text-anchor="middle" class="vx-pv${out&&!isBp?' bad':''}">${E(lbl)}</text>${!isBp&&tmS(o.p.r)?`<text x="${o.p.x.toFixed(1)}" y="${(y(o.v)+16).toFixed(1)}" text-anchor="middle" class="vx-pt-t">${E(tmS(o.p.r))}</text>`:''}<title>${E(dayLbl(o.p.r.ts))} ${E(o.p.r.time||'')}: ${isBp?nm+' ':''}${E(lbl)}${o.p.r.by?' · '+E(o.p.r.by):''}</title></g>`;});});
    return `<div class="vx-cw"><svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${isBp?'Blood pressure, systolic and diastolic, by date':'Readings by date'}">${g}</svg></div>`;
  }
  /* 23 Nov redesign (owner): one monitor row per vital: latest value and whether it is in the usual range on the left,
     the chart across the row, lowest / highest / count on the right. Vitals with no readings fold into one line. */
  const fmtN=n=>String(Math.round(n*10)/10);
  function vTrend(R,ps){
    const has=[],none=[];
    ps.forEach(p=>{const xs=R.filter(r=>ok(r[p[0]])).slice().reverse();(xs.length?has:none).push([p,xs]);});
    const pid=S.pid+'|'+R.length,anim=window.__vxAnim!==pid;window.__vxAnim=pid;
    const rows=has.map(([p,xs])=>{const k=p[0],L=xs[xs.length-1],pv=xs[xs.length-2],isBp=k==='bp',out=bad[k]&&bad[k](L[k]);
      const sys=r=>+String(r.bp).split('/')[0],dia=r=>+String(r.bp).split('/')[1];
      let dl='First reading';
      if(pv){const a=isBp?sys(L):+L[k],b=isBp?sys(pv):+pv[k],d=a-b;dl=d===0?'Same as last time':(d>0?'Up ':'Down ')+fmtN(Math.abs(d))+(isBp?' systolic':'')+' since '+E(pv.time||dayLbl(pv.ts));}
      const st2=NORM[k]?`<div class="vx-st ${out?'bad':'ok'}"><i></i>${out?'Outside usual range':'In usual range'}</div>`:'';
      const sum=isBp?[['Highest',Math.max(...xs.map(sys))+'/'+Math.max(...xs.map(dia))],['Lowest',Math.min(...xs.map(sys))+'/'+Math.min(...xs.map(dia))]]
        :(()=>{const v=xs.map(r=>+r[k]).filter(isFinite);return [['Highest',fmtN(Math.max(...v))],['Lowest',fmtN(Math.min(...v))]];})();
      const key=isBp?'<div class="vx-key"><i style="background:#c2410c"></i>Systolic <i style="background:#1e6cdb"></i>Diastolic <i class="dash"></i>140 / 90 limits</div>':NORM[k]?'<div class="vx-key">Usual range '+NORM[k][0]+' to '+NORM[k][1]+'</div>':'';
      return `<section class="vx-row${out?' is-bad':''}" aria-label="${E(p[1])}">
        <div class="vx-id"><div class="vx-nm">${E(p[1])} <small>${E(p[2])}</small></div><div class="vx-big${out?' bad':''}">${E(L[k])}</div>${st2}<div class="vx-dl">${dl}</div><div class="vx-at">Latest ${E(dayLbl(L.ts))}${L.time?', '+E(L.time):''}${L.by?'<br>by '+E(L.by):''}</div></div>
        <div class="vx-plot">${key}${chart(k,xs)}</div>
        <dl class="vx-sum">${sum.map(s=>`<div><dt>${s[0]}</dt><dd>${E(s[1])}</dd></div>`).join('')}</dl></section>`;}).join('');
    const nn=none.length?`<div class="vx-none"><span>Not recorded ${R.length?'in these dates':'yet'}:</span> ${none.map(([p])=>`<b>${E(p[1])}</b>`).join('')}</div>`:'';
    return `<div class="vx-mon${anim?' vx-anim':''}">${rows}${nn}</div>`;
  }

  const LAY=[['day','One row a day'],['trend','Trend']];
  const RANGE=[['all','All dates'],['today','Today'],['7','Last 7 days'],['30','Last 30 days'],['custom','From – to']];
  function html(){
    const RA=readings();setP(RA);
    const R=filtered(),ps=pars(),all=RA.length;
    const body=!all?'<div class="vx-empty"><b>No readings yet.</b><br>Tap <b>Record vitals</b> or <b>Record blood sugar</b> to add the first one.</div>'
      :!R.length?'<div class="vx-empty">No readings for this filter.</div>'
      :({day:vDay,trend:vTrend}[st.lay]||vDay)(R,ps);
    return `<div class="vx-bar"><div class="vx-seg" role="tablist" aria-label="Layout">${LAY.map(([k,l])=>`<button type="button" class="${st.lay===k?'on':''}" onclick="vxSet('lay','${k}')">${l}</button>`).join('')}</div><span style="flex:1"></span>
        <button class="btn sm pri" onclick="vitalsModal()">+ Record vitals</button><button class="btn sm" onclick="sugarModal()">+ Record blood sugar</button></div>
      <div class="vx-flt">
        <div class="vx-g"><span class="vx-gl" id="vxDl">Dates</span><div class="vx-sg" role="group" aria-labelledby="vxDl">${RANGE.map(([k,l])=>`<button type="button" aria-pressed="${st.range===k}" onclick="vxSet('range','${k}')">${l}</button>`).join('')}</div>
          ${st.range==='custom'?`<span class="vx-cd"><input type="date" class="input vx-d" aria-label="From" value="${E(st.from)}" onchange="vxSet('from',this.value)"><span>to</span><input type="date" class="input vx-d" aria-label="To" value="${E(st.to)}" onchange="vxSet('to',this.value)"></span>`:''}</div>
        <div class="vx-g"><span class="vx-gl" id="vxPl">Show</span><div class="vx-tg" role="group" aria-labelledby="vxPl"><button type="button" class="vx-all" aria-pressed="${!P.some(p=>st.par[p[0]])}" onclick="vxSet('par','')">All</button>${P.map(p=>`<button type="button" aria-pressed="${!!st.par[p[0]]}" onclick="vxSet('par','${p[0]}')"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${VXI[p[0]]||''}</svg>${p[1]}</button>`).join('')}</div>
          <span class="vx-cnt"><span><b>${R.length}</b> of ${all} reading${all===1?'':'s'}</span><span class="vx-red">Out of range shows in red</span></span></div>
      </div>
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
  /* 23 Nov (owner): filter icons, one per vital */
  const VXI={bp:'<path d="M4 15a8 8 0 1 1 16 0"/><path d="M12 15l4-5"/><circle cx="12" cy="15" r="1.2"/>',hr:'<path d="M3 12h4l2-5 4 10 2-5h6"/>',rr:'<path d="M3 9h11a3 3 0 1 0-3-3"/><path d="M3 14h15a3 3 0 1 1-3 3"/>',t:'<path d="M14 14.8V5a2 2 0 0 0-4 0v9.8a4 4 0 1 0 4 0z"/><path d="M12 9v7"/>',o2:'<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/><path d="M10 14.5a2 2 0 1 0 0 .1M14.5 16.5h1.5l-1.5 2h1.5"/>',sg:'<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/><path d="M9.5 15a2.5 2.5 0 0 0 2.5 2.5"/>',wt:'<path d="M6 8h12l2 12H4z"/><circle cx="12" cy="5.5" r="2"/>',uo:'<path d="M8 3h8l-1 4v12a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2V7z"/><path d="M9 12h6"/>'};
  const css=document.createElement('style');css.id='m23-vx-css';
  css.textContent='#view .vm10 .vx-old,#view .vm10:has(#vxBox) .vd-mode{display:none!important}#vxBox{padding:4px 16px 16px;display:flex;flex-direction:column;gap:10px}'
    +'.vx-flt{display:flex;flex-direction:column;gap:12px;background:#f6f8fb;border:1px solid #e6ebf2;border-radius:14px;padding:12px 14px}'
    +'.vx-g{display:flex;align-items:center;gap:12px;flex-wrap:wrap}.vx-gl{font-size:12.5px;font-weight:600;color:#475467;width:44px;flex:none}'
    +'.vx-sg{display:inline-flex;flex-wrap:wrap;gap:2px;background:#e9eef5;border-radius:10px;padding:3px}'
    +'.vx-sg button{all:unset;cursor:pointer;padding:6px 13px;border-radius:8px;font-size:13px;color:#475467;transition:background .18s,color .18s,box-shadow .18s}'
    +'.vx-sg button:hover{color:#101828}.vx-sg button[aria-pressed=true]{background:#fff;color:#1849a9;font-weight:600;box-shadow:0 1px 2px rgba(16,24,40,.08),0 1px 6px -2px rgba(30,108,219,.25)}'
    +'.vx-tg{display:inline-flex;flex-wrap:wrap;gap:6px}'
    +'.vx-tg button{all:unset;cursor:pointer;display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border-radius:9px;border:1px solid #dbe2ec;background:#fff;font-size:13px;color:#344054;transition:background .18s,border-color .18s,color .18s,transform .12s}'
    +'.vx-tg button svg{color:#98a2b3;transition:color .18s}.vx-tg button:hover{border-color:#b9c6d8}.vx-tg button:active{transform:scale(.97)}'
    +'.vx-tg button[aria-pressed=true]{background:#1e6cdb;border-color:#1e6cdb;color:#fff;font-weight:600}.vx-tg button[aria-pressed=true] svg{color:#fff}'
    +'.vx-tg .vx-all[aria-pressed=true]{background:#101828;border-color:#101828}'
    +'.vx-sg button:focus-visible,.vx-tg button:focus-visible{outline:2px solid #1e6cdb;outline-offset:2px}'
    +'.vx-cd{display:inline-flex;align-items:center;gap:8px;font-size:13px;color:#667085}.vx-cd .vx-d{width:auto}'
    +'.vx-cnt{margin-left:auto;font-size:12.5px;color:#667085;display:flex;flex-direction:column;align-items:flex-end;line-height:1.35}.vx-cnt b{color:#101828}.vx-red{color:#b42318;font-size:11.5px}'
    +'@media(max-width:700px){.vx-gl{width:100%}.vx-cnt{margin-left:0;align-items:flex-start}}'
    +'@media(prefers-reduced-motion:reduce){.vx-sg button,.vx-tg button,.vx-tg button svg{transition:none}}'
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
    +'.vx-tr{grid-template-columns:repeat(auto-fill,minmax(420px,1fr))}.vx-tc.vx-wide{grid-column:1/-1}.vx-cw{overflow-x:auto;margin:4px 0 6px}.vx-cw svg{display:block;max-width:none}'
    +'.vx-ax{font-size:11px;fill:#98a2b3}.vx-axd{font-size:11.5px;fill:#475467;font-weight:600}.vx-pv{font-size:11px;fill:#344054;font-weight:700}.vx-pv.bad{fill:#b42318}.vx-pt-t{font-size:10px;fill:#98a2b3}'
    +'.vx-key{display:inline-flex;align-items:center;gap:5px;margin-left:10px;font-size:11.5px;color:#667085}.vx-key i{display:inline-block;width:14px;height:3px;border-radius:2px}.vx-key i.dash{border-top:2px dashed #f04438;height:0;opacity:.6}.vx-key i.band{height:10px;background:#12b76a;opacity:.18}'
    /* trend redesign: monitor rows */
    +'.vx-mon{border:1px solid #e3eaf2;border-radius:14px;background:#fff;overflow:hidden}'
    +'.vx-row{display:grid;grid-template-columns:180px minmax(0,1fr) 110px;gap:18px;align-items:center;padding:10px 16px 8px;border-bottom:1px solid #eef2f6;position:relative}'
    +'.vx-row::before{content:"";position:absolute;left:0;top:14px;bottom:14px;width:3px;border-radius:0 3px 3px 0;background:transparent}.vx-row.is-bad::before{background:#d92d20}'
    +'.vx-nm{font-size:13.5px;font-weight:700;color:#344054}.vx-nm small{font-weight:500;color:#98a2b3;font-size:12px}'
    +'.vx-big{font-size:26px;line-height:1.1;font-weight:700;color:#101828;letter-spacing:-.02em;font-variant-numeric:tabular-nums;margin:2px 0 4px}.vx-big.bad{color:#b42318}'
    +'.vx-st{display:inline-flex;align-items:center;gap:6px;font-size:12.5px;font-weight:600;color:#067647}.vx-st i{width:7px;height:7px;border-radius:50%;background:currentColor}.vx-st.bad{color:#b42318}'
    +'.vx-dl{font-size:12.5px;color:#475467;margin-top:4px}.vx-at{font-size:11.5px;color:#98a2b3;margin-top:6px;line-height:1.4}'
    +'.vx-plot{min-width:0}.vx-plot .vx-key{margin:0 0 2px}.vx-plot .vx-cw{margin:0}'
    +'.vx-sum{margin:0;display:grid;gap:6px;border-left:1px solid #eef2f6;padding-left:16px}.vx-sum div{display:grid;gap:1px}.vx-sum dt{font-size:11.5px;color:#98a2b3}.vx-sum dd{margin:0;font-size:14px;font-weight:700;color:#344054;font-variant-numeric:tabular-nums}'
    +'.vx-none{display:flex;flex-wrap:wrap;align-items:center;gap:6px;padding:12px 18px;background:#f9fafb;font-size:13px;color:#667085}.vx-none b{font-weight:600;color:#475467;background:#fff;border:1px solid #e3eaf2;border-radius:6px;padding:2px 8px}'
    +'.vx-anim .vx-ln{stroke-dasharray:1;stroke-dashoffset:1;animation:vxDraw .9s ease-out .1s forwards}.vx-anim .vx-pt{opacity:0;animation:vxIn .35s ease-out .6s forwards}'
    +'@keyframes vxDraw{to{stroke-dashoffset:0}}@keyframes vxIn{to{opacity:1}}'
    +'@media(prefers-reduced-motion:reduce){.vx-anim .vx-ln,.vx-anim .vx-pt{animation:none;stroke-dashoffset:0;opacity:1}}'
    +'@media(max-width:900px){.vx-row{grid-template-columns:1fr;gap:10px}.vx-sum{grid-template-columns:repeat(3,1fr);border-left:0;padding-left:0;border-top:1px solid #eef2f6;padding-top:10px}.vx-big{font-size:28px}}'
    +'.vx-empty{padding:22px;border:1px dashed #cfd8d6;border-radius:12px;color:#475467;text-align:center}';
  document.head.appendChild(css);
  /* 23 Nov meeting: urine output can be recorded with the vitals (psychiatrist's form; saved as the 12th field of the vitals row) */
  if(typeof vitalsModal==='function'&&typeof vitalsSave==='function'){
    const __vm=vitalsModal,__vs=vitalsSave;
    window.vitalsModal=vitalsModal=function(){const o=__vm.apply(this,arguments);try{const g=document.querySelector('#modal .vq-more .vq-g');if(g&&!document.getElementById('vqUo')){const d=document.createElement('div');d.className='vq-c';d.innerHTML='<b class="vq-n">Urine output</b><span class="vq-u">ml</span><div class="vq-in"><input id="vqUo" inputmode="numeric" placeholder="optional"></div>';g.appendChild(d);const sm=document.querySelector('#modal .vq-more summary');if(sm)sm.textContent='If you have them: weight, sleep and urine output';}}catch(e){}return o;};
    window.vitalsSave=vitalsSave=function(){
      const uo=((document.getElementById('vqUo')||{}).value||'').trim();
      if(uo&&(!isFinite(+uo)||+uo<0||+uo>10000)){toast('Check the urine output (0 to 10000 ml)');return;}
      const n0=Array.isArray(S.vit)?S.vit.length:0;
      const others=['vqS','vqD','vsHr','vsRr','vsT','vsO2','vsWt','vqSl'].some(id=>((document.getElementById(id)||{}).value||'').trim());
      if(uo&&!others){const who=signer(),ini=String(who).replace(/^Dr\.\s+/,'').split(/\s+/).map(w=>w[0]).join('').slice(0,2).toUpperCase(),now=new Date();
        if(!Array.isArray(S.vit))S.vit=[];
        S.vit=S.vit.concat([[now.toLocaleDateString('en-IN',{day:'numeric',month:'short'}),'—','—','—','—','—','—',now.toLocaleTimeString('en-IN',{hour:'numeric',minute:'2-digit'}),ini,who,'',uo]]);
        closeModal();render();toast('Urine output saved by '+who);return;}
      const o=__vs.apply(this,arguments);
      if(uo&&Array.isArray(S.vit)&&S.vit.length>n0){const r=S.vit[S.vit.length-1].slice();r[10]=r[10]||'';r[11]=uo;S.vit=S.vit.slice(0,-1).concat([r]);try{render();}catch(e){}}
      return o;
    };
  }
  const __r=render;
  render=function(){const o=__r.apply(this,arguments);try{paint();}catch(e){}return o;};
  /* switching to the tab does not always call render */
  document.addEventListener('click',e=>{if(e.target&&e.target.closest&&e.target.closest('.psy-tx-tab'))setTimeout(()=>{try{paint();}catch(x){}},60);},true);
})();
