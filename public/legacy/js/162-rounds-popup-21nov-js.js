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
  document.head.appendChild(css);
  const tyOf=t=>TYPES.find(x=>x[0]===t)||TYPES[1];
  function paintList(){
    const el=document.getElementById('rpList');if(!el)return;
    el.innerHTML=RP.list.map((r,i)=>`<div class="rp-i"><span class="chip ${tyOf(r.ty)[2]}">${E(tyOf(r.ty)[1])}</span><b>${E(r.text)}</b><button class="rp-x" aria-label="Remove" onclick="rpDel(${i})">×</button></div>`).join('');
  }
  window.rpType=function(v){RP.ty=v;const t=document.getElementById('rpText');if(t)t.placeholder=tyOf(v)[3];};
  window.rpAdd=function(){const t=document.getElementById('rpText');const v=((t||{}).value||'').trim();if(!v){if(t)t.focus();return;}RP.list.push({ty:RP.ty,text:v});t.value='';paintList();t.focus();};
  window.rpDel=function(i){RP.list.splice(i,1);paintList();};
  const __pop=window.psyEyePop;
  window.psyEyePop=function(pid,idx,mode){
    const r=__pop.apply(this,arguments);
    try{
      if(mode!=='round')return r;
      RP.pid=pid;RP.list=[];RP.ty='Medicine';
      const ta=document.getElementById('epN');if(!ta)return r;
      const lab=ta.closest('label');
      const box=document.createElement('div');box.id='rpBox';
      box.innerHTML=`<div class="lbl" style="margin-bottom:8px"><b>What was decided on the round</b> <span class="tiny muted">(add only what applies)</span></div>
        <div class="rp-add"><select class="input" id="rpType" onchange="rpType(this.value)">${TYPES.map(t=>`<option value="${t[0]}">${E(t[1])}</option>`).join('')}</select><input class="input" id="rpText" placeholder="${E(TYPES[0][3])}" onkeydown="if(event.key==='Enter'){event.preventDefault();rpAdd()}"><button type="button" class="btn" onclick="rpAdd()">Add</button></div>
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
    const pending=(((document.getElementById('rpText')||{}).value)||'').trim();
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
