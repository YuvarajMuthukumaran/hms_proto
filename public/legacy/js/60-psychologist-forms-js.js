/* Psychologist only (10 Nov 2026, team meeting: "this formatting is very bad").
   Collect e-signature pop-up (Admission forms):
   - the form preview is taller and has a Full screen button (the document matters more than the chrome around it)
   - the name and the signature box sit in one row, and the signature box is smaller
   - labels start with capital letters
   Form editor (Fill in): field labels start with capital letters.
   Gated by S.role==='psychologist'. */
(function(){
  const me=()=>S.role==='psychologist';
  const css=document.createElement('style');css.id='psychologist-forms-css';
  css.textContent=`
  body.psg .cdf-lbl::first-letter{text-transform:uppercase}
  body.psg .modal .pg-es .lbl{text-transform:capitalize}
  .pg-es .es-form{height:min(62vh,640px)!important;max-height:none!important;overflow:auto}
  .pg-es .es-form.pg-fs{position:fixed;inset:12px;z-index:9999;height:auto!important;background:#fff;border:1px solid var(--line);border-radius:14px;box-shadow:0 24px 60px rgba(16,24,40,.35);padding:10px}
  .pg-fsbtn{display:inline-flex;align-items:center;gap:6px;margin:0 0 8px;border:1px solid var(--line);background:#fff;border-radius:99px;padding:5px 12px;font:inherit;font-size:13px;font-weight:600;cursor:pointer}
  .pg-fsbtn{align-self:flex-start}
  .pg-es.pg-fson #pgFsB{position:fixed;top:22px;right:30px;z-index:10000;background:#175cd3;color:#fff;border-color:#175cd3}
  .pg-sign-row{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:16px;align-items:start;margin-top:8px}
  .pg-sign-row .ct-pad{width:100%!important;height:96px!important}
  @media (max-width:700px){.pg-sign-row{grid-template-columns:1fr}}
  `;
  document.head.appendChild(css);
  window.pgFsToggle=function(){const f=document.querySelector('.pg-es .es-form');if(f){f.classList.toggle('pg-fs');f.closest('.pg-es').classList.toggle('pg-fson',f.classList.contains('pg-fs'));}const b=document.getElementById('pgFsB');if(b&&f)b.textContent=f.classList.contains('pg-fs')?'Close full screen':'Full screen';};
  const fix=()=>{
    const c=document.getElementById('esC'),n=document.getElementById('esN');if(!c||!n)return;
    const mb=c.closest('.mb');if(!mb||mb.classList.contains('pg-es'))return;
    mb.classList.add('pg-es');
    const form=mb.querySelector('.es-form');
    if(form&&!document.getElementById('pgFsB'))form.insertAdjacentHTML('beforebegin','<button type="button" class="pg-fsbtn" id="pgFsB" onclick="pgFsToggle()">Full screen</button>');
    const nameLab=n.closest('label.field'),kids=[...mb.children],ci=kids.indexOf(c);
    const sigLbl=kids[ci-1],ctl=kids[ci+1];
    if(!nameLab||!sigLbl||!ctl)return;
    const row=document.createElement('div');row.className='pg-sign-row';
    const left=document.createElement('div'),right=document.createElement('div');
    mb.insertBefore(row,nameLab);
    left.append(nameLab);right.append(sigLbl,c,ctl);row.append(left,right);
  };
  const __eo=window.psyEsignOpen;
  window.psyEsignOpen=function(){
    const r=__eo.apply(this,arguments);
    if(me())setTimeout(fix,80);
    return r;
  };
})();
