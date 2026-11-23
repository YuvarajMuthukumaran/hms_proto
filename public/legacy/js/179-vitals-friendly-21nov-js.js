/* 21 Nov 2026, TL: "think like a non-tech doctor or nurse; adding vitals must feel easy". Every login that records or reads vitals.
   1 "Record vitals" pop-up: one big card per measurement in plain words (Blood pressure, Pulse, Breathing, Temperature, Oxygen), a big number box,
     what is usual under it, and a green "Normal" / amber "Check" as you type. Blood pressure is two boxes (top and bottom number).
     Weight and sleep are optional, under "If you have them". Same saving as before (vitalsSave and its checks, same field ids).
   2 "Latest vitals" strip above the table: the last reading as five tiles, who took it and when, red when out of range.
   3 Buttons: "Record vitals" (main) and "Record blood sugar". */
(function(){
  const E=s=>hesc(String(s==null?'':s));
  const roleOk=()=>{const r=(window.__TULASI__||{}).role||S.role;return /^(nurse|rmo|psychiatrist|floor-lead-psychiatrist)$/.test(r);};
  const num=v=>v===''||v==null||isNaN(+v)?null:+v;
  const M={
    hr:{n:'Pulse',u:'beats per minute',use:'Usually 60 to 100',ph:'80',t:v=>v<50?'low':v>100?'high':'ok'},
    rr:{n:'Breathing',u:'breaths per minute',use:'Usually 12 to 20',ph:'16',t:v=>v<12?'low':v>20?'high':'ok'},
    t:{n:'Temperature',u:'°F',use:'Usually 97 to 99',ph:'98.6',t:v=>v<96?'low':v>=100.4?'high':'ok'},
    o2:{n:'Oxygen level',u:'% (SpO2)',use:'Usually 95 to 100',ph:'98',t:v=>v<95?'low':'ok'}
  };
  const IDS={hr:'vsHr',rr:'vsRr',t:'vsT',o2:'vsO2'};
  if(!document.getElementById('vq-css')){const c=document.createElement('style');c.id='vq-css';
    c.textContent='.vq-g{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}'
      +'.vq-c{border:1.5px solid #d5e1ef;border-radius:14px;padding:12px 14px;background:#fff;transition:border-color .15s,background .15s}'
      +'.vq-c:focus-within{border-color:#1e6cdb;box-shadow:0 0 0 3px rgba(30,108,219,.12)}'
      +'.vq-c.ok{border-color:#8fd3a8;background:#f4fbf6}.vq-c.low,.vq-c.high{border-color:#f0b35c;background:#fff8ec}'
      +'.vq-c b.vq-n{display:block;font-size:15px}.vq-c .vq-u{font-size:12px;color:#667085}'
      +'.vq-in{display:flex;align-items:center;gap:8px;margin:8px 0 6px}'
      +'.vq-c input{width:100%;min-height:52px;font-size:24px;font-weight:700;text-align:center;border:1px solid #d5e1ef;border-radius:10px;background:#fff;padding:0 6px}'
      +'.vq-c input:focus{outline:none;border-color:#1e6cdb}.vq-c input::placeholder{color:#c3ccd8;font-weight:500}'
      +'.vq-c .vq-s{font-size:13px;min-height:18px;color:#667085}.vq-c.ok .vq-s{color:#067647;font-weight:600}.vq-c.low .vq-s,.vq-c.high .vq-s{color:#9a5b00;font-weight:600}'
      +'.vq-wide{grid-column:1/-1}.vq-slash{font-size:26px;color:#98a2b3}'
      +'.vq-more{margin-top:14px;font-size:13px;color:#475467}.vq-more .vq-g{margin-top:8px}.vq-more input{font-size:18px;min-height:44px}'
      +'.vq-foot{margin-top:12px;font-size:13px;color:#667085}'
      +'#vsLatest{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px;margin:0 0 12px}'
      +'#vsLatest .vl-h{grid-column:1/-1;display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;font-size:14px}'
      +'#vsLatest .vl-t{border:1px solid #e3eaf2;border-radius:12px;padding:10px 12px;background:#fff}'
      +'#vsLatest .vl-t small{display:block;color:#667085;font-size:12px}#vsLatest .vl-t b{font-size:22px}#vsLatest .vl-t.bad{background:#fff3f1;border-color:#f3b8b0}#vsLatest .vl-t.bad b{color:#b42318}'
      +'#vsLatest .vl-e{grid-column:1/-1;padding:14px;border:1px dashed #cfd8d6;border-radius:12px;color:#475467;font-size:14px}'
      +'.vm10 .hd .btn{min-height:42px;font-size:14px;padding:0 16px}'
      +'@media(max-width:700px){.vq-g{grid-template-columns:1fr}#vsLatest{grid-template-columns:repeat(2,minmax(0,1fr))}}';
    document.head.appendChild(c);}
  const card=k=>{const m=M[k];return '<div class="vq-c" id="vq-'+k+'"><b class="vq-n">'+m.n+'</b><span class="vq-u">'+m.u+'</span><div class="vq-in"><input id="'+IDS[k]+'" inputmode="decimal" autocomplete="off" placeholder="'+m.ph+'" oninput="vqCheck(\''+k+'\')"></div><div class="vq-s">'+m.use+'</div></div>';};
  window.vqCheck=function(k){
    const el=document.getElementById('vq-'+k);if(!el)return;
    const v=num((document.getElementById(IDS[k])||{}).value);
    const s=el.querySelector('.vq-s'),m=M[k];
    if(v===null){el.className='vq-c';s.textContent=m.use;return;}
    const r=m.t(v);el.className='vq-c '+r;
    s.textContent=r==='ok'?'✓ Normal':r==='low'?'Low: please check again':'High: please check again';
  };
  window.vqBp=function(){
    const a=(document.getElementById('vqS')||{}).value||'',b=(document.getElementById('vqD')||{}).value||'';
    const h=document.getElementById('vsBp');if(h)h.value=a&&b?a+'/'+b:'';
    const el=document.getElementById('vq-bp');if(!el)return;const s=el.querySelector('.vq-s');
    const x=num(a),y=num(b);
    if(x===null||y===null){el.className='vq-c vq-wide';s.textContent='Usually 90 to 140 over 60 to 90';return;}
    const bad=x>=140||x<90||y>=90||y<60;el.className='vq-c vq-wide '+(bad?'high':'ok');s.textContent=bad?'Out of the usual range: please check again':'✓ Normal';
  };
  window.vitalsModal=vitalsModal=function(){
    if(!roleOk()){toast('Vitals are recorded by the nurse, the RMO or the psychiatrist');return;}
    const p=(ptFind(S.pid)||{}).name||'',who=(typeof signer==='function'?signer():''),tm=new Date().toLocaleTimeString('en-IN',{hour:'numeric',minute:'2-digit'});
    openModal('<div class="mh"><h3>Record vitals · '+E(p)+'</h3><button class="x" aria-label="Close" onclick="closeModal()">×</button></div>'
      +'<div class="mb"><div class="small muted" style="margin-bottom:12px">Fill in only what you took. Nothing is compulsory, but add at least one. A box turns green when normal and amber when it needs another look.</div>'
      +'<div class="vq-g">'
      +'<div class="vq-c vq-wide" id="vq-bp"><b class="vq-n">Blood pressure</b><span class="vq-u">mmHg: top number, then bottom number</span><input type="hidden" id="vsBp"><div class="vq-in"><input id="vqS" inputmode="numeric" placeholder="120" oninput="vqBp()" aria-label="Top number"><span class="vq-slash">/</span><input id="vqD" inputmode="numeric" placeholder="80" oninput="vqBp()" aria-label="Bottom number"></div><div class="vq-s">Usually 90 to 140 over 60 to 90</div></div>'
      +card('hr')+card('rr')+card('t')+card('o2')+'</div>'
      +'<details class="vq-more"><summary style="cursor:pointer;color:#1e6cdb;font-weight:600">If you have them: weight and sleep</summary><div class="vq-g"><div class="vq-c"><b class="vq-n">Weight</b><span class="vq-u">kg</span><div class="vq-in"><input id="vsWt" inputmode="decimal" placeholder="optional"></div></div><div class="vq-c"><b class="vq-n">Sleep last night</b><span class="vq-u">hours</span><div class="vq-in"><input id="vqSl" inputmode="decimal" placeholder="optional"></div></div></div></details>'
      +'<div class="vq-foot">Saved at '+E(tm)+(who?' by '+E(who):'')+'. Checking blood sugar instead? <a href="#" onclick="closeModal();sugarModal();return false" style="color:#1e6cdb;font-weight:600">Record blood sugar</a></div></div>'
      +'<div class="mf"><button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" style="min-height:46px;padding:0 28px;font-size:15px" onclick="vitalsSave()">Save vitals</button></div>');
    setTimeout(()=>{const i=document.getElementById('vqS');if(i)i.focus();},50);
  };
  /* 21 Nov 2026, owner: nothing is compulsory. Fill in what was taken, at least one box. Each box that is filled is still checked for a sensible number. */
  window.vitalsSave=function(){
    const g=id=>((document.getElementById(id)||{}).value||'').trim();
    const bp=g('vsBp'),hr=g('vsHr'),rr=g('vsRr'),t=g('vsT'),o2=g('vsO2'),wt=g('vsWt'),sl=g('vqSl')||g('vsSl');
    const s=g('vqS'),d=g('vqD');
    if(!bp&&!hr&&!rr&&!t&&!o2&&!wt&&!sl&&!s&&!d){toast('Fill in at least one box');return;}
    let m=null;
    if(s||d){m=bp.match(/^(\d{2,3})\s*\/\s*(\d{2,3})$/);if(!m){toast('For blood pressure, fill in both the top and the bottom number');return;}}
    const chk=(v,lo,hi,lab)=>{if(!v)return true;const n=+v;if(!isFinite(n)||n<lo||n>hi){toast('Check the '+lab+' ('+lo+' to '+hi+')');return false;}return true;};
    if(!chk(hr,20,250,'pulse')||!chk(rr,4,60,'breathing rate')||!chk(t,90,110,'temperature in °F')||!chk(o2,50,100,'oxygen level')||!chk(wt,2,300,'weight')||!chk(sl,0,24,'sleep hours'))return;
    const who=signer(),ini=String(who).replace(/^Dr\.\s+/,'').split(/\s+/).map(w=>w[0]).join('').slice(0,2).toUpperCase();
    const now=new Date(),day=now.toLocaleDateString('en-IN',{day:'numeric',month:'short'}),tm=now.toLocaleTimeString('en-IN',{hour:'numeric',minute:'2-digit'});
    if(!Array.isArray(S.vit))S.vit=[];
    S.vit=S.vit.concat([[day,bp||'—',hr||'—',t||'—',o2||'—',wt||'—',sl||'—',tm,ini,who,rr||'']]);
    try{const st=v3();st.vit=st.vit||{};st.vit.last=st.vit.last||{};st.vit.hist=st.vit.hist||{};
      const prev=st.vit.last[S.pid]||{};
      const r=Object.assign({},prev,{t:V3.now(),by:who});
      if(m){r.sbp=+m[1];r.dbp=+m[2];}if(hr)r.hr=+hr;if(rr)r.rr=+rr;if(t)r.temp=+t;if(o2)r.spo2=+o2;
      st.vit.last[S.pid]=r;(st.vit.hist[S.pid]=st.vit.hist[S.pid]||[]).push(r);}catch(e){}
    closeModal();render();toast('Vitals saved by '+who+' at '+tm);
  };
  function latest(){
    const v=document.getElementById('view');if(!v)return;
    const sec=v.querySelector('.vm10');if(!sec)return;
    let box=document.getElementById('vsLatest');
    if(!box){box=document.createElement('div');box.id='vsLatest';sec.parentNode.insertBefore(box,sec);}
    else if(box.nextElementSibling!==sec)sec.parentNode.insertBefore(box,sec);
    const r=Array.isArray(S.vit)&&S.vit.length?S.vit[S.vit.length-1]:null;
    if(!r){box.innerHTML='<div class="vl-e"><b>No vitals recorded yet.</b> Tap <b>Record vitals</b> to add the first one.</div>';return;}
    const bpBad=(x=>{const m=String(x).match(/^(\d+)\/(\d+)/);return !!m&&(+m[1]>=140||+m[1]<90||+m[2]>=90);})(r[1]);
    const tile=(l,val,bad,unit)=>'<div class="vl-t'+(bad?' bad':'')+'"><small>'+l+'</small><b>'+E(val||'—')+'</b> <small style="display:inline">'+unit+'</small></div>';
    box.innerHTML='<div class="vl-h"><b>Latest vitals</b><span class="muted">'+E(r[0])+(r[7]?', '+E(r[7]):'')+(r[9]?' · taken by '+E(r[9]):'')+'</span></div>'
      +tile('Blood pressure',r[1],bpBad,'mmHg')+tile('Pulse',r[2],M.hr.t(+r[2])!=='ok','per min')+tile('Breathing',r[10],r[10]&&M.rr.t(+r[10])!=='ok','per min')+tile('Temperature',r[3],M.t.t(+r[3])!=='ok','°F')+tile('Oxygen',r[4],M.o2.t(+r[4])!=='ok','%');
  }
  /* 23 Nov (owner, later): Day by day / By time slot on the left; Record vitals and Record blood sugar together on the right */
  try{const st=document.createElement('style');st.textContent='#view .vm10 .hd{justify-content:flex-start!important;gap:12px}#view .vm10 .hd .vl-rec{margin-left:auto!important;margin-right:0!important}#view .vl-h{padding:0 13px!important;box-sizing:border-box;align-items:baseline}#view .vl-h .muted{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}';document.head.appendChild(st);}catch(e){}
  const __r=render;
  render=function(){const o=__r.apply(this,arguments);try{latest();
    document.querySelectorAll('#view .vm10 .hd button').forEach(b=>{const t=b.textContent.trim();
      if(/Add vitals$/.test(t))b.innerHTML=b.innerHTML.replace('Add vitals','Record vitals');
      if(/Record vitals$/.test(b.textContent.trim()))b.classList.add('vl-rec');
      if(/Add blood sugar$/.test(t))b.innerHTML=b.innerHTML.replace('Add blood sugar','Record blood sugar');});}catch(e){}return o;};
})();
