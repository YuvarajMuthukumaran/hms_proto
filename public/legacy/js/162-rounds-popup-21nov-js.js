/* 21 Nov 2026, owner: "Open rounds" in the eye window and Take Action showed only a note box. It now opens the Rounds pop-up:
   the items for this patient, the round note (required) and what was decided on the round: medicine changes, advice to the
   nurses, investigations, monitoring and referrals, each added as a line. Psychiatrist and floor lead psychiatrist only.
   Save keeps the round in the Rounds tab (psyx.roundLog, with "Changes made"), sends each line to the nurses' instruction list
   (S.nInstr, same shape as block 01 confirmRound) and marks the items on this card as action taken (block 152 does that). */
(function(){
  const ROLE=String((window.__TULASI__||{}).role||'');
  if(!/^(psychiatrist|floor-lead-psychiatrist)$/.test(ROLE))return;
  if(typeof window.psyEyePop!=='function'||typeof window.psyEyePopSave!=='function')return;
  const E=s=>hesc(String(s==null?'':s));
  const TYPES=[['Medicine','Medicine change','c-blue','e.g. Olanzapine 10 mg to 15 mg at night, after food'],['Advice','Advice to the nurses','c-amber','e.g. Keep the patient in the common area, check every 15 minutes'],['Lab','Investigation','c-violet','e.g. Repeat potassium tomorrow morning'],['Monitoring','Monitoring','c-green','e.g. BP and pulse every 4 hours'],['Referral','Referral','c-grey','e.g. Physician review for chest pain']];
  const RP={pid:'',list:[],ty:'Medicine'};
  const css=document.createElement('style');css.id='rounds-popup-css';
  css.textContent='#rpBox{border:1px solid #e3eaf2;border-radius:12px;padding:12px 14px;margin:2px 0 12px;background:#fbfcfe}#rpBox .rp-add{display:grid;grid-template-columns:170px minmax(0,1fr) auto;gap:8px;align-items:center}#rpBox .rp-l{display:flex;flex-direction:column;gap:6px;margin-top:10px}#rpBox .rp-i{display:flex;align-items:center;gap:8px;font-size:13.5px;padding:7px 10px;border:1px solid #e3eaf2;border-radius:10px;background:#fff}#rpBox .rp-i b{margin-right:auto;font-weight:600}#rpBox .rp-x{border:0;background:none;color:#667085;font-size:18px;cursor:pointer;line-height:1}@media(max-width:620px){#rpBox .rp-add{grid-template-columns:1fr}}';
  css.textContent+='#rpBox .rp-med{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px 10px;margin-top:10px;padding:10px;border:1px dashed #d0dbe8;border-radius:10px;background:#fff}#rpBox .rp-med .field{margin:0}#rpBox .rp-med .rp-wide{grid-column:span 3}#rpBox .rp-med .lbl{font-size:12px}@media(max-width:620px){#rpBox .rp-med{grid-template-columns:1fr 1fr}#rpBox .rp-med .rp-wide{grid-column:1/-1}}';
  document.head.appendChild(css);
  const tyOf=t=>TYPES.find(x=>x[0]===t)||TYPES[1];
  function paintList(){
    const el=document.getElementById('rpList');if(!el)return;
    el.innerHTML=RP.list.map((r,i)=>`<div class="rp-i"><span class="chip ${tyOf(r.ty)[2]}">${E(tyOf(r.ty)[1])}</span><b>${E(r.text)}</b><button class="rp-x" aria-label="Remove" onclick="rpDel(${i})">×</button></div>`).join('');
  }
  /* 24 Nov 2026 (Trello 220): a medicine change has the prescribing columns (what changes, medicine and strength, route,
     frequency, food, from, advice for nursing); the line is written from them */
  const RX_R=['Oral','Oral liquid','Orodispersible tablet','Sublingual','IM','IM depot','IV','Topical'],RX_F=['1-0-1','0-0-1','1-0-0','1-1-1','0-1-0','Weekly','SOS','STAT'],RX_A=['Start','Change dose','Stop'];
  const rv=id=>((document.getElementById(id)||{}).value||'').trim();
  function medHtml(pid){
    let cur=[];try{cur=JSON.parse(ptRun(pid,()=>JSON.stringify((S.meds||[]).filter(m=>!/waiting|stopped/i.test(m.name||'')).map(m=>String(m.name||'').split(' · ')[0]))))||[];}catch(e){}
    const sel=(id,a,on)=>'<select class="input" id="'+id+'"'+(on?' onchange="'+on+'"':'')+'>'+a.map(x=>'<option>'+E(x)+'</option>').join('')+'</select>';
    const d=new Date().toISOString().slice(0,10);
    return '<div class="rp-med" id="rpMed">'
      +'<label class="field"><span class="lbl">Change</span>'+sel('rpMa',RX_A,'rpMedAct()')+'</label>'
      +'<label class="field rp-wide"><span class="lbl">Medicine and strength</span><input class="input" id="rpMn" list="rpMl" placeholder="e.g. Quetiapine 50 mg" autocomplete="off"><datalist id="rpMl">'+cur.map(n=>'<option value="'+E(n)+'">').join('')+'</datalist></label>'
      +'<label class="field rp-dose"><span class="lbl">Route</span>'+sel('rpMr',RX_R)+'</label>'
      +'<label class="field rp-dose"><span class="lbl">Frequency</span>'+sel('rpMf',RX_F)+'</label>'
      +'<label class="field rp-dose"><span class="lbl">Food</span>'+sel('rpMfo',['After food','Before food','At bedtime','With food'])+'</label>'
      +'<label class="field rp-dose"><span class="lbl">From</span><input class="input" type="date" id="rpMd" value="'+d+'"></label>'
      +'<label class="field rp-wide"><span class="lbl" id="rpMvL">Advice for nursing (optional)</span><input class="input" id="rpMv" placeholder="e.g. watch for drowsiness, hold if BP is low"></label>'
      +'</div>';
  }
  window.rpMedAct=function(){const stop=rv('rpMa')==='Stop';document.querySelectorAll('#rpMed .rp-dose').forEach(el=>{el.style.display=stop?'none':'';});const l=document.getElementById('rpMvL');if(l)l.textContent=stop?'Reason for stopping (required)':'Advice for nursing (optional)';};
  function medLine(){
    const a=rv('rpMa'),n=rv('rpMn');if(!n)return '';
    if(a==='Stop'){const why=rv('rpMv');return why?'Stop '+n+' · reason: '+why:null;}
    const dt=rv('rpMd'),df=dt?new Date(dt+'T12:00:00').toLocaleDateString('en-GB',{day:'numeric',month:'short'}):'';
    return (a==='Start'?'Start ':'Change dose: ')+[n,rv('rpMr'),rv('rpMf'),rv('rpMfo'),df?'from '+df:''].filter(Boolean).join(' · ')+(rv('rpMv')?' · advice: '+rv('rpMv'):'');
  }
  function medClear(){['rpMn','rpMv'].forEach(id=>{const e=document.getElementById(id);if(e)e.value='';});}
  window.rpType=function(v){RP.ty=v;const t=document.getElementById('rpText');if(t)t.placeholder=tyOf(v)[3];
    const med=v==='Medicine',m=document.getElementById('rpMed');if(m)m.style.display=med?'':'none';if(t)t.style.display=med?'none':'';};
  window.rpAdd=function(){
    if(RP.ty==='Medicine'&&document.getElementById('rpMed')){const ln=medLine();
      if(ln===null){toast('Write why the medicine is stopped');const e=document.getElementById('rpMv');if(e)e.focus();return;}
      if(!ln){toast('Write the medicine and strength');const e=document.getElementById('rpMn');if(e)e.focus();return;}
      RP.list.push({ty:'Medicine',text:ln});medClear();paintList();return;}
    const t=document.getElementById('rpText');const v=((t||{}).value||'').trim();if(!v){if(t)t.focus();return;}RP.list.push({ty:RP.ty,text:v});t.value='';paintList();t.focus();};
  window.rpDel=function(i){RP.list.splice(i,1);paintList();};
  /* 21 Nov 2026 (owner): Review treatment shows the treatment that is running now, so the doctor reviews what is actually given */
  function treatment(pid){
    const ta=document.getElementById('epN');if(!ta)return;
    let meds=[];try{meds=JSON.parse(ptRun(pid,()=>JSON.stringify((S.meds||[]).filter(m=>!/waiting|stopped/i.test(m.name||'')))))||[];}catch(e){}
    const box=document.createElement('div');box.id='rvTreat';
    box.innerHTML='<div class="lbl" style="margin-bottom:8px"><b>Current treatment</b> <span class="tiny muted">'+meds.length+' medicine'+(meds.length===1?'':'s')+' running now</span></div>'
      +(meds.length?'<div class="scroll"><table class="t"><thead><tr><th>Medicine</th><th>Doses</th><th>When</th><th>Prescribed by</th></tr></thead><tbody>'+meds.map(m=>'<tr><td><b>'+E(String(m.name||'').split(' · ')[0])+'</b></td><td>'+E(m.freq||'')+'</td><td>'+E(m.time||'')+'</td><td>'+E(m.by||'')+'<div class="tiny muted">'+E(String(m.at||'').split(',').slice(0,2).join(','))+'</div></td></tr>').join('')+'</tbody></table></div>'
        :'<div class="small muted">No medicine recorded for this patient yet.</div>');
    box.style.cssText='border:1px solid #e3eaf2;border-radius:12px;padding:12px 14px;margin:2px 0 12px;background:#fbfcfe';
    /* 24 Nov 2026 (Trello 221): Review treatment shows the full medication chart (medicines and the Vitals view), so medicines
       are added or stopped and vital monitoring is ordered right here. Its buttons first switch to this patient (ptUse). */
    try{if(typeof marCard==='function'){
      const qp=String(pid).replace(/\\/g,'\\\\').replace(/'/g,"\\'");
      let ch=ptRun(pid,()=>marCard());
      ch=ch.replace(/onclick="(psyRxOpen|medStopModal|shScaleOrder|marJump)\(/g,'onclick="ptUse(\''+qp+'\');$1(');
      ch=ch.replace('<section class="card mchart"','<section class="card mchart" data-pid="'+E(pid)+'"');
      box.style.cssText='margin:2px 0 12px';box.innerHTML=ch;}}catch(e){}
    const lab=ta.closest('label');lab.parentNode.insertBefore(box,lab);
    /* latest vitals and the orders that are active now */
    let vit=null,ords=[];
    try{vit=JSON.parse(ptRun(pid,()=>JSON.stringify(Array.isArray(S.vit)&&S.vit.length?S.vit[S.vit.length-1]:null)));}catch(e){}
    try{ords=JSON.parse(ptRun(pid,()=>{const o=[];
      (typeof monList==='function'?monList(pid):[]).forEach(x=>o.push(['Monitoring',x[0]+': '+(typeof monLabel==='function'?monLabel(x[1]):x[1]),(x[2]||{}).by||'']));
      (S.labs||[]).filter(l=>!/done|resulted|cancel/i.test(l.st||'')).forEach(l=>o.push(['Investigation',(l.t||'')+(l.d?' · '+l.d:''),l.by||'']));
      (S.stand||[]).filter(i=>i.pid===pid).forEach(i=>o.push(['Advice',i.text||'',i.by||'']));
      return JSON.stringify(o);}))||[];}catch(e){}
    try{((psyPx(pid)||{}).tmp||[]).filter(t=>t.steps&&t.steps.some(z=>!z.done)).forEach(t=>ords.push(['Order',(t.key||'').toUpperCase()+' · '+t.steps.filter(z=>z.done).length+' of '+t.steps.length+' tasks done',t.by||'']));}catch(e){}
    const bad=(k,v)=>{v=String(v||'');if(k==='bp'){const m=v.match(/^(\d+)\/(\d+)/);return !!m&&(+m[1]>=140||+m[1]<90||+m[2]>=90);}if(k==='hr')return +v>100||+v<50;if(k==='t')return +v>=100.4||+v<96;if(k==='o2')return +v<95;if(k==='rr')return +v>20||+v<12;return false;};
    const cell=(l,v,k,u)=>'<div style="min-width:90px"><div class="tiny muted">'+l+'</div><div style="font-size:15px;font-weight:700;'+(bad(k,v)?'color:#b42318':'')+'">'+(v?E(v):'—')+(v&&u?' <span class="tiny muted" style="font-weight:500">'+u+'</span>':'')+'</div></div>';
    const vb=document.createElement('div');vb.id='rvVit';vb.style.cssText=box.style.cssText;
    vb.innerHTML='<div class="lbl" style="margin-bottom:8px"><b>Latest vitals</b>'+(vit?' <span class="tiny muted">'+E(vit[0]||'')+(vit[7]?' · '+E(vit[7]):'')+(vit[8]?' · taken by '+E(vit[8]):'')+'</span>':'')+'</div>'
      +(vit?'<div style="display:flex;flex-wrap:wrap;gap:8px 26px">'+cell('Blood pressure',vit[1],'bp','mmHg')+cell('Pulse',vit[2],'hr','bpm')+cell('Resp. rate',vit[10],'rr','per min')+cell('Temperature',vit[3],'t','°F')+cell('SpO2',vit[4],'o2','%')+'</div>':'<div class="small muted">No reading recorded yet. Vitals are entered by the nurse or the RMO.</div>');
    const ob=document.createElement('div');ob.id='rvOrd';ob.style.cssText=box.style.cssText;
    const col={Monitoring:'c-green',Investigation:'c-violet',Advice:'c-amber',Order:'c-blue'};
    ob.innerHTML='<div class="lbl" style="margin-bottom:8px"><b>Active orders</b> <span class="tiny muted">'+ords.length+' running now</span></div>'
      +(ords.length?ords.map(o=>'<div style="display:flex;align-items:center;gap:10px;padding:7px 0;border-top:1px solid #eef2f6;font-size:13.5px"><span class="chip '+(col[o[0]]||'c-grey')+'" style="min-width:92px;justify-content:center">'+E(o[0])+'</span><b style="font-weight:600;margin-right:auto">'+E(o[1])+'</b><span class="tiny muted">'+E(o[2])+'</span></div>').join(''):'<div class="small muted">No active order for this patient.</div>');
    box.after(vb);vb.after(ob);
    const m=document.querySelector('.modal');if(m)m.style.width=box.querySelector('.mchart')?'min(1200px,100%)':'min(760px,100%)';
  }
  /* 21 Nov 2026 (meeting): every pop-up also offers the redirect, "Open full record" */
  function redirectBtn(pid){
    const mf=document.querySelector('.modal .mf');if(!mf||mf.querySelector('.rp-full'))return;
    const b=document.createElement('button');b.type='button';b.className='btn rp-full';b.style.marginRight='auto';b.textContent='Open full record';
    b.setAttribute('onclick',"closeModal();go('#/patient/"+String(pid).replace(/'/g,'')+"/overview')");
    mf.insertBefore(b,mf.firstChild);
  }
  const __pop=window.psyEyePop;
  window.psyEyePop=function(pid,idx,mode){
    const r=__pop.apply(this,arguments);
    try{redirectBtn(pid);}catch(e){}
    try{
      if(mode==='review'){treatment(pid);return r;}
      if(mode!=='round')return r;
      RP.pid=pid;RP.list=[];RP.ty='Medicine';
      const ta=document.getElementById('epN');if(!ta)return r;
      const lab=ta.closest('label');
      const box=document.createElement('div');box.id='rpBox';
      box.innerHTML=`<div class="lbl" style="margin-bottom:8px"><b>What was decided on the round</b> <span class="tiny muted">(add only what applies)</span></div>
        <div class="rp-add"><select class="input" id="rpType" onchange="rpType(this.value)">${TYPES.map(t=>`<option value="${t[0]}">${E(t[1])}</option>`).join('')}</select><input class="input" id="rpText" style="display:none" placeholder="${E(TYPES[0][3])}" onkeydown="if(event.key==='Enter'){event.preventDefault();rpAdd()}"><button type="button" class="btn" onclick="rpAdd()">Add</button></div>${medHtml(pid)}
        <div class="rp-l" id="rpList"></div>`;
      lab.parentNode.insertBefore(box,lab);
      const m=document.querySelector('.modal');if(m){m.style.width='min(760px,100%)';const h=m.querySelector('h3');if(h)h.textContent=h.textContent.replace(/^Round note/,'Rounds');}
    }catch(e){}
    return r;
  };
  const __save=window.psyEyePopSave;
  window.psyEyePopSave=function(){
    const box=document.getElementById('rpBox');
    if(!box)return __save.apply(this,arguments);
    const pid=RP.pid,x=psyPx(pid),before=(x.roundLog||[]).length,list=RP.list.slice();
    const pending=RP.ty==='Medicine'&&document.getElementById('rpMed')?(medLine()||''):(((document.getElementById('rpText')||{}).value)||'').trim();
    if(pending)list.push({ty:RP.ty,text:pending});
    const r=__save.apply(this,arguments);
    try{
      const x2=psyPx(pid);
      if((x2.roundLog||[]).length>before){
        const e=x2.roundLog[0];e.changes=list.map(c=>tyOf(c.ty)[1]+': '+c.text);
        const p=(typeof ptFind==='function'&&ptFind(pid))||{},pn=p.name||'Patient',by=signer()+' · round just now';
        S.nInstr=S.nInstr||[];
        list.forEach(c=>{S.nN=(S.nN||0)+1;const t=tyOf(c.ty);S.nInstr.unshift([pn,by,c.text,t[0]==='Referral'?'Referral':t[0],t[2],'','n'+S.nN]);});
        if(list.length)render();
      }
    }catch(e){}
    return r;
  };
})();
