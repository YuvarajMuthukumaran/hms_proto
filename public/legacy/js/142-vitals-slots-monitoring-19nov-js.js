/* 19 Nov 2026, Trello (Anu, meeting 19 Nov). Vitals and monitoring.
   1. The doctor's vitals table is one row per date with six time-slot columns (the most is blood sugar, before and after each meal).
      Each slot shows the readings taken in it (vitals, NEWS2, sugar, with the initials of who took them). A slot with no monitoring
      scheduled is left empty and grey; a scheduled slot with no reading shows a dash. Weight and sleep sit under the date.
   2. Order monitoring lists every monitoring type the round can order (vitals, sugar, weight, urine output and the scales),
      with how often; the order is saved the same way as a round's monitoring. Every login that sees these screens. */
(function(){
  const E=s=>hesc(String(s==null?'':s));
  const SL=[['Before breakfast','6 to 9 am'],['After breakfast','9 am to 12 pm'],['Before lunch','12 to 2 pm'],['After lunch','2 to 5 pm'],['Before dinner','5 to 8 pm'],['After dinner','8 pm to 6 am']];
  const slotOfH=h=>h>=6&&h<9?0:h>=9&&h<12?1:h>=12&&h<14?2:h>=14&&h<17?3:h>=17&&h<20?4:5;
  const hourOf=t=>{const m=String(t||'').match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);if(!m)return null;let h=+m[1]%12;if(/pm/i.test(m[3]))h+=12;return h;};
  const SUG={'Fasting':0,'Before breakfast':0,'After breakfast':1,'Before lunch':2,'After lunch':3,'Before dinner':4,'After dinner':5,'Bedtime':5};
  const dkey=s=>String(s||'').trim().split(/[\s,]+/).slice(0,2).join(' ');
  const bad={bp:v=>{const m=String(v).match(/^(\d+)\/(\d+)/);return !!m&&(+m[1]>=140||+m[1]<90||+m[2]>=90);},hr:v=>+v>100||+v<50,t:v=>+v>=100.4||+v<96,o2:v=>+v<95,rr:v=>+v>20||+v<12,sg:v=>+v<80||+v>180};
  const txt=td=>{if(!td)return '';const v=td.querySelector('.v');return (v?v.textContent:td.textContent).trim();};
  const val=(l,v,isBad)=>!v||v==='—'?'':`<span class="vs-i"><small>${l}</small> <b class="${isBad?'out':''}">${E(v)}</b></span>`;

  if(!document.getElementById('vs-css')){const c=document.createElement('style');c.id='vs-css';
    c.textContent=`.vm10 table.vs{min-width:900px}.vm10 table.vs th{white-space:normal;vertical-align:bottom;min-width:120px}.vm10 table.vs th .vs-s{display:block;text-transform:none;letter-spacing:0;font-weight:600;color:#067647;font-size:10.5px;margin-top:2px}
    .vm10 table.vs td{vertical-align:top;min-width:120px}.vm10 table.vs td.ns{background:#f2f4f7}.vm10 table.vs td.miss{color:#98a2b3}
    .vs-r{padding:4px 0;border-bottom:1px dashed #eaecf0;line-height:1.5}.vs-r:last-child{border-bottom:0}.vs-r .tm{display:block;font-size:11px;color:#667085}
    .vs-i{display:inline-block;margin-right:6px;white-space:nowrap}.vs-i small{color:#667085;font-size:11px}.vs-i b.out{color:#b42318}.vs-d small{display:block;font-weight:400;color:#667085;font-size:12px}`;
    document.head.appendChild(c);}

  function scheduled(pid){
    const out={vit:new Set(),sug:new Set(),names:SL.map(()=>[])};
    try{(typeof monList==='function'?monList(pid):[]).forEach(([par,f])=>{
      const times=((typeof MON_FREQ!=='undefined'?MON_FREQ:[]).find(x=>x[0]===f)||[0,[]])[1];
      times.forEach(t=>{const h=hourOf(t);if(h==null)return;const s=slotOfH(h);
        if(par==='Sugar (CBG)')out.sug.add(s);else if(par!=='Weight')out.vit.add(s);
        if(!out.names[s].includes(par))out.names[s].push(par);});});}catch(e){}
    return out;
  }
  function slotted(){
    const card=document.querySelector('#view .vm10');if(!card)return;
    const tb=card.querySelector('table');if(!tb||tb.classList.contains('vs'))return;
    const pid=S.pid||((String(location.hash).match(/^#\/patient\/([^/?]+)/)||[])[1]||'');
    const rows=[...tb.querySelectorAll('tbody tr')];
    const days={},order=[];const day=d=>{const k=dkey(d);if(!days[k]){days[k]={k,slots:SL.map(()=>[]),daily:[]};order.push(k);}return days[k];};
    rows.forEach(tr=>{const c=[...tr.children];if(c.length<11)return;
      const D=day(c[0].textContent),tm=c[1].textContent.trim(),h=hourOf(tm);
      const ini=((c[2].querySelector('.ini')||{}).textContent||'').trim();
      const bp=txt(c[2]),hr=txt(c[3]),rr=txt(c[4]),t=txt(c[5]),o2=txt(c[6]),nw=txt(c[7]),wt=txt(c[8]),sl=txt(c[9]);
      if([bp,hr,rr,t,o2].some(x=>x&&x!=='—')){
        const items=val('BP',bp,bad.bp(bp))+val('P',hr,bad.hr(hr))+val('RR',rr,rr&&bad.rr(rr))+val('T',t,bad.t(t))+val('SpO2',o2,bad.o2(o2))+(nw&&nw!=='—'?val('NEWS2',nw.split(' · ')[0],/Urgent|Inform/.test(nw)):'');
        D.slots[h==null?-1:slotOfH(h)]?D.slots[slotOfH(h)].push({tm,html:items,ini}):(D.untimed=D.untimed||[]).push({tm:'Time not recorded',html:items,ini});
      }
      if(wt&&wt!=='—')D.daily.push('Weight '+wt+' kg');if(sl&&sl!=='—')D.daily.push('Sleep '+sl+' h');
    });
    (S.sugarNew||[]).forEach(x=>{const at=String(x.at||''),D=day(at),h=hourOf(at.split(',')[1]||'');
      let s=SUG[x.when];if(s==null)s=h==null?0:slotOfH(h);
      D.slots[s].push({tm:(x.when||'')+(x.when==='Random'&&at.split(',')[1]?' ·'+at.split(',')[1]:''),html:val('Sugar',x.v,bad.sg(x.v))+'<small class="tiny muted">mg/dL</small>',ini:String(x.by||'').replace(/^Dr\.\s+/,'').split(/\s+/).map(w=>w[0]).join('').slice(0,2).toUpperCase()});});
    const sc=scheduled(pid);
    order.forEach(k=>{const D=days[k];if(D.untimed){const first=[...sc.vit].sort()[0];D.slots[first==null?0:first].push(...D.untimed);}});
    const isSched=s=>sc.vit.has(s)||sc.sug.has(s);
    const head=`<tr><th>Date</th>${SL.map((s,i)=>`<th>${s[0]}<small>${s[1]}</small>${sc.names[i].length?`<span class="vs-s">Scheduled: ${E(sc.names[i].join(', '))}</span>`:''}</th>`).join('')}</tr>`;
    const toD=k=>{
      const s=String(k).trim();
      const now=new Date();
      if(/^today/i.test(s))return new Date(now.getFullYear(),now.getMonth(),now.getDate()).getTime();
      if(/^yesterday/i.test(s))return new Date(now.getFullYear(),now.getMonth(),now.getDate()-1).getTime();
      const m=s.match(/^(\d{1,2})\s+([A-Za-z]{3})(?:\s+(\d{4}))?$/);
      if(m){
        const mo={Jan:1,Feb:2,Mar:3,Apr:4,May:5,Jun:6,Jul:7,Aug:8,Sep:9,Oct:10,Nov:11,Dec:12}[m[2]];
        if(mo){
          const yr=m[3]||now.getFullYear();
          const d=new Date(`${yr}-${String(mo).padStart(2,'0')}-${String(m[1]).padStart(2,'0')}T00:00:00`);
          if(!isNaN(d))return d.getTime();
        }
      }
      const d=new Date(s);
      return isNaN(d)?0:d.getTime();
    };
    const inRange=k=>{
      const vm=(window.S&&S.vm)||{};
      if(!vm.from&&!vm.to)return true;
      const t=toD(k);
      if(!t)return true;
      const d=new Date(t);
      if(vm.from&&d<new Date(vm.from+'T00:00:00'))return false;
      if(vm.to&&d>new Date(vm.to+'T23:59:59'))return false;
      return true;
    };
    const visibleDates=order.filter(inRange);
    const body=visibleDates.sort((a,b)=>(S.vm&&S.vm.sort==='old'?1:-1)*(toD(a)-toD(b))).map(k=>{const D=days[k];
      return `<tr><td class="d vs-d">${E(k)}${D.daily.map(x=>`<small>${E(x)}</small>`).join('')}</td>${D.slots.map((L,i)=>L.length?`<td>${L.map(r=>`<div class="vs-r"><span class="tm">${E(r.tm||'')}</span>${r.html}${r.ini?` <span class="ini" title="Recorded by">${E(r.ini)}</span>`:''}</div>`).join('')}</td>`:isSched(i)?'<td class="miss">—</td>':'<td class="ns" aria-label="Not scheduled"></td>').join('')}</tr>`;}).join('');
    tb.classList.add('vs');
    tb.innerHTML='<thead>'+head+'</thead><tbody>'+(body||'<tr><td colspan="7" class="muted small">No readings in this date range.</td></tr>')+'</tbody>';
    const note=card.querySelector('.hd .tiny');if(note)note.textContent='One row per date, six time slots. Grey: nothing scheduled in that slot. A dash: scheduled, no reading yet. Out of range in red.';
  }

  /* ---------- Order monitoring: every type the round can order ---------- */
  const SCALE_F=['Every shift','Every 4 hours','Daily','At each re-assessment'];
  const isScale=p=>/ASQ|C-SSRS|CIWA|COWS|NEWS2/.test(p);
  window.shScaleOrder=function(pid){
    const P=(typeof MON_PARAMS!=='undefined'?MON_PARAMS:[]).map(x=>x[0]);
    const cur=p=>{if(isScale(p)){const o=((psyPx(pid)||{}).scaleOrders||[]).find(x=>x.scale===p);return o?o.freq:'';}const m=(typeof monList==='function'?monList(pid):[]).find(x=>x[0]===p);return m?m[1]:'';};
    const lab=f=>typeof monLabel==='function'?monLabel(f):f;
    const opts=p=>(isScale(p)?SCALE_F.map(f=>[f,f]):(typeof MON_FREQ!=='undefined'?MON_FREQ:[]).map(f=>[f[0],lab(f[0])]));
    const rows=P.map((p,i)=>{const c=cur(p);return `<tr><td><b>${E(p)}</b>${c?`<div class="tiny muted">Now: ${E(isScale(p)?c:lab(c))}</div>`:''}</td><td><select class="input" data-om="${i}" data-cur="${E(c)}" style="min-height:38px"><option value="">${c?'Keep as it is':'Not ordered'}</option>${opts(p).map(o=>`<option value="${E(o[0])}" ${o[0]===c?'disabled':''}>${E(o[1])}</option>`).join('')}${c?'<option value="__stop">Stop</option>':''}</select></td></tr>`;}).join('');
    V3.modal('Order monitoring · '+E((ptFind(pid)||{}).name||''),'Everything the round can order. The nurses see it on their board at each time.',
      `<div class="scroll" style="max-height:60vh"><table class="t"><thead><tr><th>Monitoring</th><th>How often</th></tr></thead><tbody>${rows}</tbody></table></div>`,
      `<button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="omSave('${String(pid).replace(/'/g,"\\'")}')">Order</button>`);
    window.__omP=P;
  };
  window.omSave=function(pid){
    const P=window.__omP||[],done=[];
    document.querySelectorAll('#modal select[data-om]').forEach(s=>{const v=s.value;if(!v)return;const p=P[+s.dataset.om],c=s.dataset.cur;
      const act=v==='__stop'?'Stop':(c?'Change':'Start');
      try{monApply(pid,{act,p,f:v==='__stop'?c:v});done.push(act==='Stop'?'Stop '+p:p+': '+(isScale(p)?v:(typeof monLabel==='function'?monLabel(v):v)));}catch(e){}});
    if(!done.length){toast('Pick how often for at least one');return;}
    try{V3.log(pid,S.role,'order','Monitoring ordered: '+done.join('; '));}catch(e){}
    closeModal();render();toast('Monitoring ordered: '+done.join('; '));
  };

  const __r=render;
  render=function(){const o=__r.apply(this,arguments);try{slotted();}catch(e){}return o;};
})();
