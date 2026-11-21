/* 21 Nov 2026, meeting: foreign nationals have a separate admission form handled by Chandraji, so the Patient Experience tab gets a
   "Foreign national" card (also in the Patient Experience app, Preferences). Psychiatrist and floor lead psychiatrist.
   The first question is "Is the patient a foreign national?"; the other fields appear only when the answer is Yes. Saved as the doctor types,
   in the patient's own record (psyx.foreign). Shown in both views: Fill form (a card in the grid) and Read only (a summary card).
   The fields are a first list, to be confirmed with Chandraji. */
(function(){
  const ROLE=String((window.__TULASI__||{}).role||'');
  if(!/^(psychiatrist|floor-lead-psychiatrist|rmo)$/.test(ROLE))return;
  if(typeof pPrefs!=='function')return;
  const E=s=>hesc(String(s==null?'':s));
  const SEEN=['Front desk','Admin (Chandraji)','Patient experience'];
  const F=[
    ['Nationality','txt'],['Passport number','txt'],['Visa type and valid until','txt'],
    ['FRRO C-form submitted?','sel',['Yes','No','Pending']],['Separate admission form (Chandraji)','sel',['Done','Pending']],
    ['Embassy or consulate contact','txt'],['Language and interpreter needed','txt'],
    ['Contact abroad (name, number with country code, time zone)','txt'],['How to update the family abroad','sel',['WhatsApp','Email','Video call','Phone call']],
    ['Diet, religious or cultural needs','txt'],['Payment (currency, insurance, who pays)','sel',['Self, in India','Family abroad','Insurance','Embassy','Other']],
    ['Where the passport is kept','sel',['With the patient','Locker','Front desk']],['Anything else for the admission','txt']];
  const rec=()=>{const x=psyPx(S.pid);return x.foreign=x.foreign||{};};
  window.fnSet=function(k,v){const r=rec();r[k]=v;if(k==='yes')render();};
  function formCard(r){
    const yes=r.yes==='Yes';
    const sel=(k,l,opts)=>`<label class="field"><span class="lbl">${E(l)}</span><select class="input" onchange="fnSet('${k}',this.value)"><option value=""></option>${opts.map(o=>`<option ${r[k]===o?'selected':''}>${E(o)}</option>`).join('')}</select></label>`;
    const inp=(k,l)=>`<label class="field"><span class="lbl">${E(l)}</span><input class="input" value="${E(r[k]||'')}" oninput="fnSet('${k}',this.value)"></label>`;
    return `<section class="card pad" id="fnCard" style="display:flex;flex-direction:column;gap:8px"><div class="row" style="justify-content:space-between"><h3>Foreign national</h3><span class="row" style="gap:4px">${SEEN.map(x=>`<span class="chip c-grey">${E(x)}</span>`).join('')}</span></div>
      ${sel('yes','Is the patient a foreign national?',['Yes','No'])}
      ${yes?F.map((f,i)=>f[1]==='sel'?sel('f'+i,f[0],f[2]):inp('f'+i,f[0])).join(''):'<div class="tiny muted">The other questions open when the answer is Yes.</div>'}</section>`;
  }
  function readCard(r){
    const yes=r.yes==='Yes',row=(l,v)=>`<div class="pxs-row"><dt>${E(l)}</dt><dd class="${v?'':'none'}">${v?E(v):'Not set'}</dd></div>`;
    return `<section class="pxs-card"><div class="pxs-hd"><h4>Foreign national</h4><span class="pxs-seen">Seen by ${E(SEEN.join(' · '))}</span></div><dl>${row('Foreign national?',r.yes)}${yes?F.map((f,i)=>row(f[0],r['f'+i])).join(''):''}</dl></section>`;
  }
  const __p=pPrefs;
  pPrefs=function(){
    const h=__p.apply(this,arguments);
    try{
      const t=document.createElement('template');t.innerHTML=h;const r=rec();
      const g=t.content.querySelector('.pxs-grid');
      if(g)g.insertAdjacentHTML('beforeend',readCard(r));
      else{const o=t.content.querySelector('.ovgrid');if(o)o.insertAdjacentHTML('beforeend',formCard(r));}
      const d=document.createElement('div');d.appendChild(t.content);return d.innerHTML;
    }catch(e){return h;}
  };
})();
