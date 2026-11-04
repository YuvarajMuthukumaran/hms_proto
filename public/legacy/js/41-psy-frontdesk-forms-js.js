
/* Psychiatrist only (5 Nov 2026). Trello (Anu) "Front desk forms: please make an editable version of these forms".
   The Admission tab > Front desk forms card was a read-only list (Signed chips). Each form that has an on-screen version
   (the same editable form and PDF used under Forms to print > Fill in online) now has an "Open and edit" button:
   Admission consent and letter of undertaking, Form E, High risk informed consent. The COVID form has no on-screen version yet. */
(function(){
  const psy=()=>S.role==='psychiatrist';
  const ROWS=[
    ['Admission consent form and letter of undertaking (advance and charges)','admission-consent','Signed 18 Oct'],
    ['Form E · request for admission with high support needs (rule 8)','form-e','Signed by the nominated representative'],
    ['High risk informed consent','high-risk-consent','Signed 18 Oct'],
    ['COVID form',null,'Signed 18 Oct']
  ];
  const __pa=pAdmission;
  pAdmission=function(){
    const h=__pa.apply(this,arguments);if(!psy())return h;
    const open='<section class="card"><div class="hd"><h3>Front desk forms</h3>',a=h.indexOf(open);if(a<0)return h;
    const b=h.indexOf('</section>',a);if(b<0)return h;
    let items=[];try{CD_DATA=cdLoad();items=cdItems(S.pid);}catch(e){}
    const rows=ROWS.map(([name,fid,sub])=>{
      const it=fid&&items.find(i=>i.form&&i.form.id===fid);
      const btn=it?`<button class="btn sm pri" onclick="psyDocOpen('${hesc(it.entryKey)}')">Open and edit</button>`:'<span class="tiny muted">No on-screen version yet</span>';
      return `<div class="li"><div class="grow"><div style="font-weight:600">${name}</div><div class="tiny muted">${sub}</div></div>${chip('Signed','c-green')}${btn}</div>`;
    }).join('');
    const card=`<section class="card"><div class="hd"><div><h3>Front desk forms</h3><div class="small muted" style="margin-top:4px">Open a form to edit it on screen, then generate the PDF.</div></div>${chip('Taken by front desk','c-grey')}</div>${rows}<div class="pad small muted">Taken in the admin portal on the tablet. Other consents are on Orders and consents.</div>`;
    return h.slice(0,a)+card+h.slice(b);
  };
})();
