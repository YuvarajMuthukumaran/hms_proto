/* 18 Nov 2026, Trello (Anu, from the video): Detailed history, psychiatrist and psychologist screens only.
   1. "Concomitant changes": every question is a row of tap-option bubbles (like the Mental status examination), not a drop-down.
      Same saved answers as before (one option: {sel}; several options: a list), so nothing already filled in is lost.
   2. "Any treatment for present illness" is called "Any treatment for current illness" (Yes / No, then free text when Yes).
   3. Mental status examination: "Other perceptual disturbances" is added after Hallucinations (it is on the HMS reference form). */
(function(){
  if(!/^(psychiatrist|psychologist)$/.test(String((window.__TULASI__||{}).role||'')))return;
  const E=s=>hesc(String(s==null?'':s));
  const hf=()=>{const x=psyPx(S.pid);return x.hf=x.hf||{};};
  const CHG=new Set(['Socialising with people','Interest in work','Self-confidence','Enthusiasm or optimism','Experiencing pleasure','Appetite','Libido','Sexual functions','Sleep',
    'Social relations','Intellectual activities, hobbies and use of leisure time','Predominant mood','Character: attitude to self','Character: attitude to work and responsibility','Character: interpersonal relationships','Character: standards in moral, religious and health matters','Character: energy, initiative','Fantasy life','Habits',"Examiner's impression"]);
  try{
    const mse=HIST.find(x=>x.k==='mse');
    if(mse&&!mse.__pmPerc){
      const i=mse.f.findIndex(f=>f[0]==='Hallucinations');
      const add=['Other perceptual disturbances','m',['Illusions','Depersonalisation','Derealisation','Deja vu','Jamais vu','Distortions of size or shape','None']];
      if(i>=0)mse.f.splice(i+1,0,add);else mse.f.push(add);
      mse.__pmPerc=1;
    }
  }catch(e){}

  /* Mental status examination: the multi-answer questions are bubbles too, with the same indent */
  try{const m2=HIST.find(x=>x.k==='mse');if(m2)m2.f.forEach(f=>{if((f[1]==='m'||f[1]==='o')&&Array.isArray(f[2]))CHG.add(f[0]);});}catch(e){}
  /* the bubbles sit a little to the right of the heading so the question and its options read apart */
  {const c=document.createElement('style');c.textContent='.pm-ob .mini-chips{padding-left:30px;margin-top:8px;gap:8px}.pm-ob{margin-bottom:6px}.hwrap .hf>.mini-chips{padding-left:30px;margin-top:8px;gap:8px}';document.head.appendChild(c);}
  const LBL=[];const li=l=>{let i=LBL.indexOf(l);if(i<0){LBL.push(l);i=LBL.length-1;}return i;};
  const __fld=fld;
  fld=function(f,ro){
    const l=f[0],ty=f[1];
    if(CHG.has(l)&&(ty==='o'||ty==='m')&&Array.isArray(f[2])){
      const i=li(l),dis=ro?'disabled':'',v=hf()[l];
      if(ty==='o'){
        const sel=v&&typeof v==='object'&&!Array.isArray(v)?v.sel:'';
        return `<div class="hf wide pm-ob" data-pm="${i}"><span class="lbl">${E(l)}</span><div class="mini-chips">${f[2].map((o,k)=>`<button type="button" class="tog ${sel===o?'on':''}" ${dis} onclick="pmOb(${i},${k})">${E(o)}</button>`).join('')}</div></div>`;
      }
      const arr=Array.isArray(v)?v:[];
      return `<div class="hf wide pm-ob" data-pm="${i}"><span class="lbl">${E(l)} <span class="tiny muted">(tap all that apply)</span></span><div class="mini-chips">${f[2].map((o,k)=>`<button type="button" class="tog ${arr.includes(o)?'on':''}" ${dis} onclick="pmMb(${i},${k})">${E(o)}</button>`).join('')}</div></div>`;
    }
    return __fld.apply(this,arguments);
  };
  const optsOf=l=>{const sec=HIST.find(s=>s.f.some(f=>f[0]===l));const f=sec&&sec.f.find(f=>f[0]===l);return (f&&f[2])||[];};
  window.pmOb=function(i,k){const l=LBL[i],o=optsOf(l)[k],s=hf(),cur=s[l]&&s[l].sel;s[l]={sel:cur===o?'':o};render();};
  window.pmMb=function(i,k){const l=LBL[i],o=optsOf(l)[k],s=hf(),a=Array.isArray(s[l])?s[l].slice():[],j=a.indexOf(o);if(j>=0)a.splice(j,1);else a.push(o);s[l]=a;render();};

  /* the wording of the first question of Treatment and past illness */
  function reword(){
    const v=document.getElementById('view');if(!v)return;
    v.querySelectorAll('.hwrap .lbl, .psy-hist-field b, .psy-hist-read b').forEach(e=>{
      if(e.children.length===0&&/^Any treatment for present illness$/.test(e.textContent.trim()))e.textContent='Any treatment for current illness';
    });
  }
  /* the section tabs at the top of the form stay where they were when you tap an answer (the page is redrawn on every tap and the tab row slid back) */
  const __r=render;
  render=function(){
    const n0=document.querySelector('#view .hnav'),sl=n0?n0.scrollLeft:null;
    /* every scrolled box around the form keeps its position, so tapping an answer does not make the top of the page jump or slide */
    const keep=[];if(n0){let e=document.getElementById('view');while(e){if(e.scrollTop)keep.push([e,e.scrollTop]);e=e.parentElement;}if(document.scrollingElement&&document.scrollingElement.scrollTop)keep.push([document.scrollingElement,document.scrollingElement.scrollTop]);}
    const o=__r.apply(this,arguments);
    if(keep.length){const put=()=>keep.forEach(k=>{try{k[0].style.scrollBehavior='auto';k[0].scrollTop=k[1];}catch(e){}});put();requestAnimationFrame(put);setTimeout(put,60);}
    try{reword();const n1=document.querySelector('#view .hnav');if(n1&&sl!==null&&n0&&n1!==n0){n1.style.scrollBehavior='auto';n1.scrollLeft=sl;}}catch(e){}
    return o;};
})();
