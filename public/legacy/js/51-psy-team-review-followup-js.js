/* Psychiatrist only: follow-up changes from the 9 Nov team review.
   The Handover list uses ten existing demo inpatients; required details are collected in sequence,
   and the final confirmation sends the saved handover. Daily-note add-ons are separate free-text
   entries. Transfer and psychologist assignment stay on the current patient page. */
(function(){
  const psy=()=>S.role==='psychiatrist';
  const REASONS=['Going on leave','Transfer of patient','Shift or duty change','Other'];
  const patients=()=>allPts().slice(0,10);
  const person=id=>ptFind(id)||patients().find(p=>p.id===id)||null;
  const handover=()=>{
    S.psyHO=S.psyHO||{list:[],ui:{}};
    S.psyHO.list=S.psyHO.list||[];
    S.psyHO.ui=S.psyHO.ui||{};
    return S.psyHO.ui;
  };
  const activePid=()=>{
    const hash=location.hash||'';
    const route=hash.match(/^#\/patient\/([^/]+)/);
    if(route&&person(route[1]))return route[1];
    if(/^#\/rounds(?:\/|$)/.test(hash)&&person(S.focusPid))return S.focusPid;
    return person(S.pid)?S.pid:'neel';
  };
  const teamFor=pid=>ptRun(pid,()=>({psy:(S.team||{}).psy||'',psych:(S.team||{}).psych||''}));

  /* Open monitoring with a blank parameter/frequency panel. The user chooses both explicitly. */
  const oldRoundMon=roundMon;
  roundMon=function(){
    const html=oldRoundMon.apply(this,arguments);
    if(!psy()||typeof html!=='string')return html;
    const t=document.createElement('template');t.innerHTML=html;
    t.content.querySelectorAll('.mon-param-option.on').forEach(b=>b.classList.remove('on'));
    const freq=t.content.querySelector('#monFreqList');
    if(freq)freq.innerHTML='<div class="small muted" style="padding:10px 12px">Choose a parameter, then choose its frequency.</div>';
    return t.innerHTML;
  };
  window.monToggleMenu=function(){
    const menu=document.getElementById('monCascadeMenu'),button=document.getElementById('monCascadeToggle');
    if(!menu||!button)return;
    const opening=menu.hidden;
    menu.hidden=!opening;
    button.setAttribute('aria-expanded',String(opening));
    if(opening){
      document.querySelectorAll('.mon-param-option.on').forEach(b=>b.classList.remove('on'));
      const freq=document.getElementById('monFreqList');
      if(freq)freq.innerHTML='<div class="small muted" style="padding:10px 12px">Choose a parameter, then choose its frequency.</div>';
    }
  };

  /* Keep the psychiatrist safety header concise while retaining the observation controls in the record. */
  const oldSafety=window.psySafety;
  if(oldSafety)window.psySafety=function(pid){
    const html=oldSafety.apply(this,arguments);
    if(!psy()||typeof html!=='string')return html;
    /* 9 Nov: only the word "Observation" is dropped; the level (1:1, every 15 min) stays, and Routine is not shown */
    return html.replace(/(<span class="c [^"]*" title="Set by [^"]*">)Observation:\s*([^<]*)(<\/span>)/,(m,o,v,c)=>/^\s*Routine\s*$/.test(v)?'':o+v+c);
  };

  /* Do not show an empty psychologist row in Rounds. Add psychologist opens a modal from that row. */
  const oldRounds=vRounds;
  vRounds=function(){
    const html=oldRounds.apply(this,arguments);
    if(!psy()||typeof html!=='string')return html;
    const t=document.createElement('template');t.innerHTML=html;
    t.content.querySelectorAll('.pr-lines > div').forEach(row=>{
      if(/Psychologist\s*None assigned/.test(row.textContent||''))row.remove();
    });
    t.content.querySelectorAll('.pr-info a').forEach(link=>{
      if((link.textContent||'').trim()!=='Add psychologist')return;
      const match=(link.getAttribute('href')||'').match(/#\/patient\/([^/]+)/);
      const pid=match&&match[1];if(!pid)return;
      const button=document.createElement('button');
      button.type='button';button.className='btn sm';button.textContent='Add psychologist';
      button.setAttribute('onclick',"window.psyReviewAddPsychOpen('"+pid+"')");
      link.replaceWith(button);
    });
    return t.innerHTML;
  };

  /* The handover page defaults to the requested demo recipient and a valid reason, while keeping both editable. */
  const oldRender=render;
  render=function(){
    const out=oldRender.apply(this,arguments);
    if(!psy()||!/^#\/handover(?:\/|$)/.test(location.hash||''))return out;
    const ui=handover(),to=document.getElementById('hoTo'),reason=document.getElementById('hoWhy');
    if(to){
      if(!Array.from(to.options).some(o=>o.value==='Dr. Webber')){
        const option=document.createElement('option');option.value='Dr. Webber';option.textContent='Dr. Webber';to.add(option);
      }
      if(!ui.to)ui.to='Dr. Webber';
      to.value=ui.to;
    }
    if(!REASONS.includes(ui.reason))ui.reason='Transfer of patient';
    if(reason)reason.value=ui.reason;
    if(window.psyHvRefresh)window.psyHvRefresh();
    return out;
  };

  const oldDetail=window.psyHvDetail;
  const oldDetailSave=window.psyHvDetSave;
  const oldDetailCancel=window.psyHvDetCancel;
  const oldSend=window.psyHvSend;
  function selectedForHandover(){
    const ui=handover();
    return patients().filter(p=>!!(ui.sel||{})[p.id]);
  }
  function missingDetails(list){
    const ui=handover(),required=['psychopath','trials','future'];
    return list.filter(p=>{
      const d=(ui.det||{})[p.id]||{};
      return required.some(k=>!String(d[k]||'').trim());
    });
  }
  function showNextMissing(){
    const ui=handover();
    if(ui.sendQueue&&ui.sendQueue.length)window.psyHvDetail(ui.sendQueue[0]);
    else showHandoverReview();
  }
  function showHandoverReview(){
    const ui=handover(),chosen=selectedForHandover(),missing=missingDetails(chosen);
    if(!ui.to||!REASONS.includes(ui.reason)||!chosen.length){
      oldSend.apply(this,arguments);return;
    }
    if(missing.length){
      ui.sendQueue=missing.map(p=>p.id);ui.sendQueueTotal=missing.length;ui.sendQueueDone=0;
      showNextMissing();return;
    }
    ui.sendQueue=null;ui.sendQueueTotal=0;ui.sendQueueDone=0;
    const rows=chosen.map(p=>'<li style="padding:4px 0">'+hesc(p.name)+'</li>').join('');
    const body='<div class="callout blue">Review the recipient and patient list before the handover is sent.</div>'+
      '<div class="small" style="margin:12px 0"><b>To:</b> '+hesc(ui.to)+'<br><b>Reason:</b> '+hesc(ui.reason)+'<br><b>Patients:</b> '+chosen.length+'</div>'+
      '<ul style="margin:0;padding-left:22px">'+rows+'</ul>';
    const footer='<button class="btn" onclick="closeModal()">Back to handover</button>'+
      '<button class="btn pri" onclick="psyReviewFinalizeHandover()">Finalize and send to '+hesc(ui.to)+'</button>';
    V3.modal('Review handover',chosen.length+' patient'+(chosen.length===1?'':'s')+' ready to send',body,footer);
  }
  window.psyHvDetail=function(pid){
    const ui=handover(),queue=ui.sendQueue;
    if(!psy()||!Array.isArray(queue)||!queue.includes(pid))return oldDetail.apply(this,arguments);
    oldDetail.apply(this,arguments);
    const modal=document.querySelector('#modal .mb'),index=queue.indexOf(pid);
    const p=person(pid),name=p?p.name:pid;
    if(modal)modal.insertAdjacentHTML('afterbegin','<div class="callout blue" style="margin-bottom:12px">Please add patient details for '+hesc(name)+'. Patient '+((ui.sendQueueDone||0)+1)+' of '+(ui.sendQueueTotal||queue.length)+'. Save to continue to the next patient.</div>');
    const save=document.querySelector('#modal .mf .btn.pri');
    if(save)save.textContent='Save and continue';
  };
  window.psyHvDetSave=function(pid){
    const ui=handover(),d=(ui.det||{})[pid]||{};
    const required=['psychopath','trials','future'],missing=required.find(k=>!String(d[k]||'').trim());
    if(missing)return oldDetailSave.apply(this,arguments);
    const queued=Array.isArray(ui.sendQueue)&&ui.sendQueue[0]===pid;
    const out=oldDetailSave.apply(this,arguments);
    if(queued){
      ui.sendQueue.shift();ui.sendQueueDone=(ui.sendQueueDone||0)+1;
      setTimeout(showNextMissing,0);
    }
    return out;
  };
  window.psyHvDetCancel=function(pid){
    const ui=handover();ui.sendQueue=null;ui.sendQueueTotal=0;ui.sendQueueDone=0;
    return oldDetailCancel.apply(this,arguments);
  };
  window.psyHvSend=function(){
    if(!psy())return oldSend.apply(this,arguments);
    const ui=handover(),chosen=selectedForHandover();
    if(!ui.to||!REASONS.includes(ui.reason)||!chosen.length)return oldSend.apply(this,arguments);
    const missing=missingDetails(chosen);
    if(missing.length){
      ui.sendQueue=missing.map(p=>p.id);ui.sendQueueTotal=missing.length;ui.sendQueueDone=0;
      showNextMissing();return;
    }
    showHandoverReview();
  };
  window.psyReviewFinalizeHandover=function(){
    const ui=handover(),chosen=selectedForHandover();
    if(!ui.to||!REASONS.includes(ui.reason)||!chosen.length){closeModal();oldSend.apply(this,arguments);return;}
    if(missingDetails(chosen).length){closeModal();window.psyHvSend();return;}
    ui.sendQueue=null;ui.sendQueueTotal=0;ui.sendQueueDone=0;
    closeModal();
    return oldSend.apply(this,arguments);
  };

  /* Save a second daily note as a separate free-text entry; do not reopen the structured form. */
  window.psyDnAnother=function(pid){
    if(!psy())return;
    const p=person(pid);if(!p)return;
    S.psyDnDraft=S.psyDnDraft||{};
    const value=(S.psyDnDraft[pid]||'');
    const body='<label class="field"><span class="lbl">Note</span><textarea class="input" id="psyDnFreeText" rows="7" placeholder="Write the additional note in your own words." oninput="S.psyDnDraft=S.psyDnDraft||{};S.psyDnDraft[\''+pid+'\']=this.value">'+hesc(value)+'</textarea></label>';
    const footer='<button class="btn" onclick="closeModal()">Cancel</button>'+
      '<button class="btn pri" onclick="psyReviewSaveFreeTextNote(\''+pid+'\')">Save note</button>';
    V3.modal('Add another note · '+hesc(p.name),'This is a separate free-text note. The earlier note stays unchanged.',body,footer);
  };
  window.psyReviewSaveFreeTextNote=function(pid){
    const box=document.getElementById('psyDnFreeText'),text=String(box?box.value:'').trim();
    if(!text){toast('Write the note first');if(box)box.focus();return;}
    const p=person(pid),now=new Date(),by=signer(),at=atNow();
    const note={id:'dn-'+Date.now().toString(36)+'-'+pid,d:String(now.getDate()),my:now.toLocaleString('en-GB',{month:'short',year:'numeric'}),type:'Daily note',tc:'c-blue',by,role:'Psychiatrist',sum:text.slice(0,120),signed:at,secs:[['Additional note',text]]};
    ptRun(pid,function(){
      if(!Array.isArray(S.dnHist))S.dnHist=(DN_HIST||[]).slice();
      S.dnHist.unshift(note);
      return '';
    });
    S.psyEodLog=S.psyEodLog||[];
    S.psyEodLog.push({id:note.id,pid,by,at,sum:note.sum,full:text});
    if(S.psyDnDraft)delete S.psyDnDraft[pid];
    closeModal();render();
    toast('Additional note saved for '+(p?p.name:'this patient')+'.');
  };

  /* Keep one clear Daily Notes heading and put the dashboard action in the note card header. */
  const oldNotesView=vNotes;
  vNotes=function(){
    const html=oldNotesView.apply(this,arguments);
    if(!psy()||typeof html!=='string')return html;
    const t=document.createElement('template');t.innerHTML=html;
    const crumb=t.content.querySelector('nav.crumb');if(crumb)crumb.remove();
    const title=t.content.querySelector('h2');
    if(title&&title.textContent.trim()==='Daily notes'){
      const row=title.closest('.row');if(row)row.remove();
    }
    const card=t.content.querySelector('section.card.eod'),head=card&&card.querySelector('.eodhd');
    if(head){
      const heading=head.querySelector('h3');if(heading)heading.textContent='Daily notes';
      head.style.display='flex';head.style.alignItems='center';head.style.justifyContent='space-between';head.style.gap='12px';head.style.flexWrap='wrap';
      const back=document.createElement('button');back.type='button';back.className='btn';back.textContent='Back to dashboard';back.setAttribute('onclick',"go('#/myday')");
      head.appendChild(back);
    }
    return t.innerHTML;
  };

  /* Transfer and Add psychologist open patient-specific modals and keep the current page in place. */
  const oldTransfer=window.transferModal;
  const oldAddPsych=window.addPsychModal;
  function teamChoices(role,from){
    return (TR_TO[role]||[]).filter(n=>n!==from);
  }
  function transferTargets(pid,role){
    const team=teamFor(pid),from=team[role]||'',list=teamChoices(role,from);
    return '<option value="">Choose clinician…</option>'+list.map(n=>'<option value="'+hesc(n)+'">'+hesc(n)+'</option>').join('');
  }
  window.psyReviewOpenTransfer=function(pid){
    const p=person(pid);if(!p)return;
    const team=teamFor(pid),role='psy',from=team[role]||'';
    const pending=ptRun(pid,function(){return typeof dueItems==='function'?dueItems().map(x=>x[0]+' · '+x[1]).join('\n'):'';});
    const body='<div class="grid2">'+
      '<label class="field"><span class="lbl">Transferring</span><select class="input" id="psyTrRole" onchange="psyReviewTransferRole(\''+pid+'\',this.value)"><option value="psy" selected>Psychiatrist</option><option value="psych">Psychologist</option></select></label>'+
      '<label class="field"><span class="lbl">From</span><input class="input" id="psyTrFrom" value="'+hesc(from)+'" disabled></label></div>'+
      '<div class="grid2"><label class="field"><span class="lbl">Transfer to</span><select class="input" id="psyTrTo">'+transferTargets(pid,role)+'</select></label>'+
      '<label class="field"><span class="lbl">From when</span><select class="input" id="psyTrWhen"><option>Today</option><option>From tomorrow’s rounds</option></select></label></div>'+
      '<label class="field"><span class="lbl">Reason</span><select class="input" id="psyTrReason"><option>Workload</option><option>Clinician leaving Tulasi</option><option>Clinician on leave</option><option>Patient or family request</option><option>Clinical fit</option><option>Change of floor</option></select></label>'+
      '<label class="field"><span class="lbl">Current status and plan (required)</span><textarea class="input" id="psyTrStatus" rows="3" placeholder="Diagnosis, where treatment stands, current plan and response"></textarea></label>'+
      '<label class="field"><span class="lbl">Pending work carried over</span><textarea class="input" id="psyTrPending" rows="3">'+hesc(pending)+'</textarea></label>'+
      '<label class="field"><span class="lbl">Risks and what to watch for</span><textarea class="input" id="psyTrRisk" rows="2" placeholder="Risk, observation level, family concerns, anything sensitive"></textarea></label>'+
      '<label class="row small" style="gap:8px"><input type="checkbox" id="psyTrFam" checked> Tell the family who their new clinician is (WhatsApp from Tulasi\'s number)</label>'+
      '<div class="callout grey small">Transfer and handover details are saved to this patient\'s history.</div>'+
      '<div id="psyTrError" class="small" style="color:var(--red);display:none">Write the current status and plan first.</div>';
    const footer='<button class="btn" onclick="psyReviewTransferPeek(\''+pid+'\')">Open handover summary</button>'+
      '<button class="btn" onclick="closeModal()">Cancel</button>'+
      '<button class="btn pri" onclick="psyReviewSaveTransfer(\''+pid+'\')">Transfer patient</button>';
    V3.modal('Transfer patient · '+hesc(p.name),'Complete the handover details here. You will stay on this inpatient page.',body,footer);
  };
  window.psyReviewTransferRole=function(pid,role){
    if(role!=='psy'&&role!=='psych')return;
    const team=teamFor(pid),from=team[role]||'',fromBox=document.getElementById('psyTrFrom'),toBox=document.getElementById('psyTrTo');
    if(fromBox)fromBox.value=from;
    if(toBox)toBox.innerHTML=transferTargets(pid,role);
  };
  window.psyReviewSaveTransfer=function(pid){
    const role=(document.getElementById('psyTrRole')||{}).value||'psy';
    const to=(document.getElementById('psyTrTo')||{}).value||'';
    const status=String((document.getElementById('psyTrStatus')||{}).value||'').trim();
    const error=document.getElementById('psyTrError');
    if(!status){if(error)error.style.display='block';const field=document.getElementById('psyTrStatus');if(field)field.focus();return;}
    if(!to){toast('Choose who takes over');const field=document.getElementById('psyTrTo');if(field)field.focus();return;}
    const oldTeam=teamFor(pid),from=oldTeam[role]||'';
    if(to===from){toast('Choose a different clinician');return;}
    const eff=(document.getElementById('psyTrWhen')||{}).value||'Today';
    const reason=(document.getElementById('psyTrReason')||{}).value||'Workload';
    const pending=String((document.getElementById('psyTrPending')||{}).value||'').trim();
    const risk=String((document.getElementById('psyTrRisk')||{}).value||'').trim();
    const fam=!!((document.getElementById('psyTrFam')||{}).checked);
    const now=new Date(),at=now.toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})+', '+now.toLocaleTimeString('en-IN',{hour:'numeric',minute:'2-digit'});
    S.trLog=S.trLog||[];
    S.trLog.unshift({pid,role,from,to,eff,reason,status,pending,risk,fam,by:signer(),at});
    ptRun(pid,function(){S.team=S.team||{};S.team[role]=to;return '';});
    closeModal();render();
    toast('Transferred to '+to+'. Transfer notes saved; floor lead informed'+(fam?'; family told on WhatsApp.':'; family not told yet.'));
  };
  window.psyReviewTransferPeek=function(pid){
    if(!window.psyHvRecord)return;
    window.psyHvRecord(pid);
    const footer=document.querySelector('#modal .mf');
    if(footer)footer.innerHTML='<button class="btn pri" onclick="closeModal();psyReviewOpenTransfer(\''+pid+'\')">Back to transfer</button>';
  };
  window.transferModal=function(){
    if(!psy())return oldTransfer.apply(this,arguments);
    window.psyReviewOpenTransfer(activePid());
  };
  window.psyReviewAddPsychOpen=function(pid){
    const p=person(pid);if(!p)return;
    const team=teamFor(pid),current=team.psych||'';
    const options=(TR_TO.psych||[]).map(n=>'<option value="'+hesc(n)+'" '+(current===n?'selected':'')+'>'+hesc(n)+'</option>').join('');
    const body='<label class="field"><span class="lbl">Psychologist</span><select class="input" id="psyReviewPsychSelect">'+
      (current?'':'<option value="">Choose psychologist…</option>')+options+'</select></label>'+
      '<div class="callout grey small">The assignment is saved to this patient’s treating team.</div>';
    const footer='<button class="btn" onclick="closeModal()">Cancel</button>'+
      '<button class="btn pri" onclick="psyReviewSavePsychologist(\''+pid+'\')">Add psychologist</button>';
    V3.modal('Add psychologist · '+hesc(p.name),'Assign a psychologist without leaving this inpatient page.',body,footer);
  };
  window.psyReviewSavePsychologist=function(pid){
    const select=document.getElementById('psyReviewPsychSelect'),name=String(select?select.value:'').trim();
    if(!name){toast('Choose a psychologist');if(select)select.focus();return;}
    ptRun(pid,function(){S.team=S.team||{};S.team.psych=name;return '';});
    const p=person(pid);closeModal();render();toast(name+' added to '+(p?p.name:'the patient')+'’s treating team.');
  };
  window.addPsychModal=function(pid){
    if(!psy()||!/^#\/patient\/|^#\/rounds(?:\/|$)/.test(location.hash||''))return oldAddPsych.apply(this,arguments);
    window.psyReviewAddPsychOpen(pid||activePid());
  };

  /* Keep transfer history attached to its own patient. Older entries without a patient id remain on Neel's record. */
  const oldTransferHistory=trHist;
  trHist=function(){
    if(!psy())return oldTransferHistory.apply(this,arguments);
    const log=S.trLog||[],pid=activePid();
    S.trLog=log.filter(entry=>entry.pid?entry.pid===pid:pid==='neel');
    try{return oldTransferHistory.apply(this,arguments);}
    finally{S.trLog=log;}
  };
})();
