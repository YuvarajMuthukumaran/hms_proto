/* 21 Nov 2026, owner: "even when many records are done on the same day it must be easily understandable".
   Vitals and monitoring now opens as "Day by day": one card per date, and inside it one line per reading, in time order:
   what time (or which meal), the values as plain labelled boxes (Blood pressure, Pulse, Breathing, Temp, Oxygen, Sugar), red when out of range, and who took it.
   The older grid (date rows by six time slots, Anu's 19 Nov format) is one tap away: "By time slot".
   Read from the table the earlier blocks already draw, so the date filters and every source of readings still apply. Every login that shows the table. */
(function(){
  const E=s=>hesc(String(s==null?'':s));
  window.__vsMode=window.__vsMode||'day';
  if(!document.getElementById('vd-css')){const c=document.createElement('style');c.id='vd-css';
    c.textContent='#vsLog{display:flex;flex-direction:column;gap:12px;padding:4px 0}'
      +'.vd-day{border:1px solid #e3eaf2;border-radius:14px;background:#fff;overflow:hidden}'
      +'.vd-dh{display:flex;align-items:baseline;justify-content:space-between;gap:10px;flex-wrap:wrap;padding:12px 16px;background:#f5f8fc;border-bottom:1px solid #e3eaf2}'
      +'.vd-dh b{font-size:16px}.vd-dh span{font-size:13px;color:#667085}'
      +'.vd-r{display:grid;grid-template-columns:130px minmax(0,1fr) auto;gap:14px;align-items:center;padding:12px 16px;border-top:1px solid #eef2f6}'
      +'.vd-r:first-of-type{border-top:0}'
      +'.vd-tm b{display:block;font-size:14px}.vd-tm small{color:#667085;font-size:12px}'
      +'.vd-v{display:flex;flex-wrap:wrap;gap:8px}'
      +'.vd-p{display:flex;align-items:center;gap:10px;border:1px solid #d5e1ef;border-radius:12px;padding:6px 14px 6px 8px;background:#fff;min-width:96px}'
      +'.vd-ic{display:inline-flex;align-items:center;justify-content:center;flex:none;width:32px;height:32px;border-radius:50%;color:#344054}'
      +'.vd-p.bad .vd-ic{background:#fde1dd!important;color:#b42318}'
      +'.vd-by{display:flex;gap:4px;justify-content:flex-end}'
      +'.vd-p small{display:block;font-size:11px;color:#667085}.vd-p b{font-size:18px}'
      +'.vd-p.bad{background:#fff3f1;border-color:#f3b8b0}.vd-p.bad b{color:#b42318}'
      +'.vd-by{font-size:12px;color:#667085;text-align:right}.vd-by i{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:50%;background:#e8f0fb;color:#1e4fa8;font-style:normal;font-weight:700;font-size:12px}'
      +'.vd-mode{display:inline-flex;border:1px solid #d5e1ef;border-radius:10px;overflow:hidden}'
      +'.vd-mode button{border:0;background:#fff;padding:9px 14px;font-size:13px;cursor:pointer;color:#475467}'
      +'.vd-mode button.on{background:#1e6cdb;color:#fff;font-weight:600}'
      +'.vd-empty{padding:22px;border:1px dashed #cfd8d6;border-radius:12px;color:#475467;text-align:center}'
      +'.vm10.vd-on .vscroll,.vm10.vd-on .vs2-note{display:none!important}'
      +'@media(max-width:700px){.vd-r{grid-template-columns:1fr}.vd-by{text-align:left}}';
    document.head.appendChild(c);}
  const NAME={BP:'Blood pressure',P:'Pulse',RR:'Breathing',T:'Temp','SpO2':'Oxygen',Sugar:'Sugar',NEWS2:'NEWS2'};
  const UNIT={BP:'mmHg',P:'per min',RR:'per min',T:'°F','SpO2':'%',Sugar:'mg/dL',NEWS2:''};
  /* one small line icon per measurement, each on its own soft tint */
  const svg=p=>`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
  const ICON={
    BP:[svg('<path d="M3.5 17a9 9 0 1117 0"/><path d="M12 14l4-5"/><circle cx="12" cy="14" r="1"/>'),'#e3eefc'],
    P:[svg('<path d="M3 12h4l2.5-6 4 12 2.5-6H21"/>'),'#fde7ea'],
    RR:[svg('<path d="M12 4v9"/><path d="M12 8c-1.5-2.5-5-2.5-6 .5L4 16c-.5 2.5 1.5 3.5 3.5 2.5L12 15"/><path d="M12 8c1.5-2.5 5-2.5 6 .5l2 7.5c.5 2.5-1.5 3.5-3.5 2.5L12 15"/>'),'#dff4f1'],
    T:[svg('<path d="M14 14.8V5a2 2 0 10-4 0v9.8a4 4 0 104 0z"/>'),'#fff0d9'],
    SpO2:[svg('<circle cx="12" cy="12" r="9"/><text x="12" y="15.5" text-anchor="middle" font-size="8.5" font-weight="700" fill="currentColor" stroke="none">O₂</text>'),'#e0f2fe'],
    Sugar:[svg('<path d="M12 3s6 6.5 6 11a6 6 0 01-12 0c0-4.5 6-11 6-11z"/>'),'#efe6fb'],
    NEWS2:[svg('<path d="M9 4h6v3H9z"/><path d="M7 5H6a1 1 0 00-1 1v13a1 1 0 001 1h12a1 1 0 001-1V6a1 1 0 00-1-1h-1"/><path d="M9 14l2 2 4-4"/>'),'#e8eaf0']
  };
  const SLOTS=['Before breakfast','After breakfast','Before lunch','After lunch','Before dinner','After dinner'];
  function parse(tb){
    const days=[];
    tb.querySelectorAll('tbody tr').forEach(tr=>{
      const c=[...tr.children];if(c.length<2)return;
      const date=(c[0].childNodes[0]||{}).textContent||c[0].textContent;
      const daily=[...c[0].querySelectorAll('small')].map(s=>s.textContent.trim()).filter(Boolean);
      const entries=[];
      c.slice(1).forEach((td,si)=>{
        td.querySelectorAll('.vs-r').forEach(r=>{
          const tm=((r.querySelector('.tm')||{}).textContent||'').trim();
          const vals=[...r.querySelectorAll('.vs-i')].map(i=>({k:((i.querySelector('small')||{}).textContent||'').trim(),v:((i.querySelector('b')||{}).textContent||'').trim(),bad:!!i.querySelector('b.out')})).filter(x=>x.v);
          const ini=((r.querySelector('.ini')||{}).textContent||'').trim();
          const who=((r.querySelector('.ini')||{}).title||'').trim();
          if(vals.length)entries.push({slot:si,tm,vals,ini,who});
        });
      });
      if(entries.length||daily.length)days.push({date:date.trim(),daily,entries});
    });
    return days;
  }
  const START=[6,9,12,14,17,20];
  const key=e=>{const m=String(e.tm||'').match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);if(m){let h=+m[1]%12;if(/pm/i.test(m[3]))h+=12;return h+(+(m[2]||0))/60;}return START[e.slot]+0.5;};
  function build(days){
    if(!days.some(d=>d.entries.length))return '<div class="vd-empty"><b>No readings yet.</b><br>Tap <b>Record vitals</b> or <b>Record blood sugar</b> to add the first one.</div>';
    return days.filter(d=>d.entries.length).map(d=>{
      const n=d.entries.length;
      /* readings taken at the same time are one line (blood pressure, pulse and the rest together) */
      const merged=[];
      d.entries.slice().sort((a,b)=>key(a)-key(b)).forEach(e=>{
        const k=e.tm&&e.tm!=='Time not recorded'?(e.tm+'|'+e.slot):null;
        const f=k?merged.find(x=>x.k===k):null;
        if(f){e.vals.forEach(v=>{if(!f.vals.some(y=>y.k===v.k))f.vals.push(v);});if(e.ini&&!f.inis.some(i=>i[0]===e.ini))f.inis.push([e.ini,e.who]);}
        else merged.push({k,slot:e.slot,tm:e.tm,vals:e.vals.slice(),inis:e.ini?[[e.ini,e.who]]:[]});
      });
      const ORD=['BP','P','RR','T','SpO2','Sugar','NEWS2'];
      const rows=merged.map(e=>{
        const slotName=SLOTS[e.slot]||'';
        const tmShow=e.tm&&e.tm!==slotName?e.tm:slotName;
        const sub=e.tm&&e.tm!==slotName?slotName:'';
        const vals=e.vals.slice().sort((a,b)=>ORD.indexOf(a.k)-ORD.indexOf(b.k));
        return '<div class="vd-r"><div class="vd-tm"><b>'+E(tmShow)+'</b>'+(sub?'<small>'+E(sub)+'</small>':'')+'</div>'
          +'<div class="vd-v">'+vals.map(x=>'<div class="vd-p'+(x.bad?' bad':'')+'"><span class="vd-ic" style="background:'+((ICON[x.k]||ICON.NEWS2)[1])+'">'+(ICON[x.k]||ICON.NEWS2)[0]+'</span><div><small>'+E(NAME[x.k]||x.k)+(UNIT[x.k]?' · '+UNIT[x.k]:'')+'</small><b>'+E(x.v)+'</b></div></div>').join('')+'</div>'
          +'<div class="vd-by">'+e.inis.map(i=>'<i title="'+E(i[1]||i[0])+'">'+E(i[0])+'</i>').join('')+'</div></div>';
      }).join('');
      return '<section class="vd-day"><div class="vd-dh"><b>'+E(d.date)+'</b><span>'+n+' reading'+(n===1?'':'s')+(d.daily.length?' · '+E(d.daily.join(' · ')):'')+'</span></div>'+rows+'</section>';
    }).join('');
  }
  window.vdMode=function(m){window.__vsMode=m;render();};
  function apply(){
    const v=document.getElementById('view');if(!v)return;
    const sec=v.querySelector('.vm10');if(!sec)return;
    const tb=sec.querySelector('table.vs');
    const old=document.getElementById('vsLog');if(old)old.remove();
    const hd=sec.querySelector('.hd');
    if(hd&&!hd.querySelector('.vd-mode')){
      const m=document.createElement('div');m.className='vd-mode';
      m.innerHTML='<button type="button" data-m="day" onclick="vdMode(\'day\')">Day by day</button><button type="button" data-m="slot" onclick="vdMode(\'slot\')">By time slot</button>';
      hd.insertBefore(m,hd.querySelector('.vs2-note')?hd.querySelector('.vs2-note').nextSibling:hd.firstChild);
    }
    if(hd)hd.querySelectorAll('.vd-mode button').forEach(b=>b.classList.toggle('on',b.dataset.m===window.__vsMode));
    const day=window.__vsMode==='day';
    sec.classList.toggle('vd-on',day);
    if(day&&tb){
      const box=document.createElement('div');box.id='vsLog';box.innerHTML=build(parse(tb));
      const sc=sec.querySelector('.vscroll');
      if(sc)sc.parentNode.insertBefore(box,sc);else sec.appendChild(box);
    }
  }
  const __r=render;
  render=function(){const o=__r.apply(this,arguments);try{apply();}catch(e){}return o;};
})();
