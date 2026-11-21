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
      +'.vd-p{border:1px solid #d5e1ef;border-radius:10px;padding:6px 12px;background:#fff;min-width:78px}'
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
      const rows=d.entries.slice().sort((a,b)=>key(a)-key(b)).map(e=>{
        const slotName=SLOTS[e.slot]||'';
        const tmShow=e.tm&&e.tm!==slotName?e.tm:slotName;
        const sub=e.tm&&e.tm!==slotName?slotName:'';
        return '<div class="vd-r"><div class="vd-tm"><b>'+E(tmShow)+'</b>'+(sub?'<small>'+E(sub)+'</small>':'')+'</div>'
          +'<div class="vd-v">'+e.vals.map(x=>'<div class="vd-p'+(x.bad?' bad':'')+'"><small>'+E(NAME[x.k]||x.k)+(UNIT[x.k]?' · '+UNIT[x.k]:'')+'</small><b>'+E(x.v)+'</b></div>').join('')+'</div>'
          +'<div class="vd-by">'+(e.ini?'<i title="'+E(e.who||e.ini)+'">'+E(e.ini)+'</i>':'')+'</div></div>';
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
