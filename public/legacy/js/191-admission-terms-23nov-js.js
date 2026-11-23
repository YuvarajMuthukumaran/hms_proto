/* 23 Nov 2026, second meeting (Anu, Nikita). Psychiatrist and floor lead psychiatrist.
   1. Admission terms: pages 3 to 8 of the paper application form are their own row, "Admission terms (pages 3 to 8)",
      in the patient's Admission forms card (Read terms opens the paper at page 3; Collect e-signature, Upload signed copy and
      Send to NR work as for the other forms, saved in psyx.consent['adm-terms']). The same row is on New admission
      (front desk / e-sign / upload, saved with the other forms in admBy.forms.terms), "both places, in case it was missed".
   2. Admission forms card: every button is white (no blue ones); a row that is already signed has its buttons greyed
      (still clickable) and no Send to NR; the actions stay on one line. Send to NR on WhatsApp says what it is for. */
(function(){
  if(!/^(psychiatrist|floor-lead-psychiatrist)$/.test(String((window.__TULASI__||{}).role||'')))return;
  const E=s=>hesc(String(s==null?'':s));
  const FID='adm-terms',NAME='Admission terms (pages 3 to 8)',PDF='/forms/admission-application/application-form.pdf#page=3';
  const px=pid=>psyPx(pid);
  /* add the row to the forms list (after the application form) */
  const __o=window.__ocForms;
  window.__ocForms=function(){const r=(typeof __o==='function'?__o.apply(this,arguments):[])||[];if(r.some(f=>f[1]===FID))return r;const i=r.findIndex(f=>f[1]==='app-form');const o=r.slice();o.splice(i<0?0:i+1,0,[NAME,FID]);return o;};
  window.termsOpen=function(){try{window.open(PDF,'_blank','noopener');}catch(e){}};
  const MODE={front:'Taken by front desk',esign:'E-signed at admission',upload:'Signed copy uploaded at admission'};

  function decorate(){
    const pid=S.pid;if(!pid)return;
    document.querySelectorAll('#consentCard tbody').forEach(tb=>{
      const tr=[...tb.querySelectorAll('tr')].find(t=>((t.querySelector('td')||{}).textContent||'').trim().indexOf(NAME)===0);
      if(tr&&!tr.dataset.terms){tr.dataset.terms='1';
        const app=[...tb.querySelectorAll('tr')].find(t=>/^Application form for admission/.test(((t.querySelector('td')||{}).textContent||'').trim()));
        if(app&&app.nextElementSibling!==tr)app.after(tr);
        const c=(px(pid).consent||{})[FID],at=((px(pid).admBy||{}).forms||{}).terms,st=tr.children[1];
        if(st&&!c)st.innerHTML=at?'<span class="cs">'+E(MODE[at]||'Taken at admission')+'</span>':'<span class="cs due">Not signed yet</span>';
        const a=tr.querySelector('.ct-a');
        if(a){const vb=[...a.querySelectorAll('button')].find(b=>/^View form$/i.test((b.textContent||'').trim()));const h='<button class="btn sm" onclick="termsOpen()">Read terms</button>';if(vb)vb.outerHTML=h;else a.insertAdjacentHTML('afterbegin',h);}
      }
    });
    /* white buttons, signed rows greyed */
    document.querySelectorAll('#consentCard tbody tr, #formcCard tbody tr').forEach(tr=>{
      tr.querySelectorAll('.btn.pri').forEach(b=>b.classList.remove('pri'));
      const cs=tr.querySelector('.cs');const t=((cs||{}).textContent||'').trim();
      const done=!!cs&&!cs.classList.contains('due')&&/^(Signed|E-signed|Uploaded|Taken by front desk|E-signed at|Signed copy)/.test(t);
      tr.classList.toggle('m23-done',done);
      tr.querySelectorAll('button').forEach(b=>{if(/^Send to NR on WhatsApp$/.test((b.textContent||'').trim())&&!b.title)b.title='For a remote signature: the nominated representative gets a WhatsApp message and signs on their phone';});
    });
  }
  /* New admission: the terms row with the same three choices */
  function decorateNew(){
    const first=document.querySelector('[onclick^="nadForm(\'consent\'"],[onclick^="admForm(\'consent\'"]');if(!first)return;
    const fn=/^admForm/.test(first.getAttribute('onclick'))?'admForm':'nadForm';
    const row=first.closest('.row');if(!row||!row.parentElement||row.parentElement.querySelector('#termsNewRow'))return;
    const div=document.createElement('div');div.id='termsNewRow';div.className='row';div.style.cssText='justify-content:space-between;padding:8px 0;border-bottom:1px solid #eef1f5;gap:8px;flex-wrap:wrap';
    div.innerHTML='<span><b>'+E(NAME)+'</b> <button type="button" class="btn sm" style="margin-left:6px" onclick="termsOpen()">Read terms</button></span><span style="display:flex;gap:6px">'
      +[['front','Taken by front desk'],['esign','Collect e-signature'],['upload','Upload signed copy']].map(m=>'<button class="btn sm" onclick="'+fn+'(\'terms\',\''+m[0]+'\')">'+m[1]+'</button>').join('')+'</span>';
    const app=row.parentElement.querySelector('#apfNewRow');
    row.parentElement.insertBefore(div,row);if(app&&app.nextElementSibling!==div)app.after(div);
  }
  /* the choice made on New admission is kept in R.forms (nadForm), so re-mark the chosen button after each render */
  ['nadForm','admForm'].forEach(n=>{const o=window[n];if(typeof o==='function')window[n]=function(k,m){if(k==='terms')window.__termsPick=m;return o.apply(this,arguments);};});
  function markNew(){const d=document.getElementById('termsNewRow');if(!d)return;d.querySelectorAll('[onclick^="nadForm"],[onclick^="admForm"]').forEach(b=>b.classList.toggle('pri',!!window.__termsPick&&b.getAttribute('onclick').indexOf("'"+window.__termsPick+"'")>0));}
  ['nadCancel','admCancel'].forEach(n=>{const o=window[n];if(typeof o==='function')window[n]=function(){window.__termsPick=null;return o.apply(this,arguments);};});

  const css=document.createElement('style');css.id='m23-terms-css';
  css.textContent='#consentCard .ct-a,#formcCard .ct-a{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:6px}'
    +'#consentCard .ct-a .btn,#formcCard .ct-a .btn{background:#fff;color:#344054;border:1px solid #d0d5dd;box-shadow:none;font-weight:500}'
    +'#consentCard .ct-a .btn:hover,#formcCard .ct-a .btn:hover{background:#f9fafb;border-color:#98a2b3}'
    +'#consentCard tr.m23-done .ct-a .btn,#formcCard tr.m23-done .ct-a .btn{background:#f9fafb;color:#98a2b3;border-color:#eaecf0}'
    +'#consentCard tr.m23-done .ct-a .btn:hover,#formcCard tr.m23-done .ct-a .btn:hover{color:#475467;border-color:#d0d5dd}'
    +'#consentCard tr.m23-done .ct-a [onclick^="nrOpen"],#formcCard tr.m23-done .ct-a [onclick^="nrOpen"]{display:none}'
    +'#consentCard td,#formcCard td{vertical-align:middle}';
  document.head.appendChild(css);
  const __r=render;
  render=function(){const r=__r.apply(this,arguments);try{decorate();decorateNew();markNew();}catch(e){}setTimeout(()=>{try{decorate();decorateNew();markNew();}catch(e){}},320);return r;};
})();
