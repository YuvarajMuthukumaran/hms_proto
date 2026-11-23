/* 23 Nov 2026, meeting with Dr. Anu and Nikita. Psychiatrist only.
   Admission > step 2 Admission workup > Early warning score (NEWS2):
     - Read only: a small line (score, band, when) instead of the big score and the vitals boxes.
     - Fill form: no "Calculate and save" button; the score is worked out and saved as soon as a vital is changed
       (changes made within 10 minutes replace that one score, so a row of edits is not saved as many scores). */
(function(){
  if(String((window.__TULASI__||{}).role||'')!=='psychiatrist')return;
  const css=document.createElement('style');css.id='m23-forms-css';
  css.textContent=
    '#pmScores .sc-f label:last-child{display:none!important}'+
    'body.wk-ro #pmScores .pad{display:block!important;padding:10px 20px 14px!important}'+
    'body.wk-ro #pmScores .pad > div:last-child,body.wk-ro #pmScores .hd .small,body.wk-ro #pmScores [data-om]{display:none!important}'+
    'body.wk-ro #pmScores .sc-side{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap;background:none;border:0;padding:0;text-align:left}'+
    'body.wk-ro #pmScores .sc-side .row{margin:0!important}'+
    'body.wk-ro #pmScores .sc-side .sc-big{font-size:20px!important;display:inline!important;margin:0!important}'+
    'body.wk-ro #pmScores .sc-side .small,body.wk-ro #pmScores .sc-side .tiny{display:inline!important;margin:0!important}'+
    'body.wk-ro #pmScores .hd h3{font-size:14px!important}'+
    '.m23-ews{font-size:12px;color:#067647;margin-top:6px}';
  document.head.appendChild(css);

  const pidNow=()=>decodeURIComponent((String(location.hash).match(/^#\/patient\/([^/?]+)/)||[])[1]||'');
  function auto(){
    const pid=pidNow();if(!pid||typeof window.psyNewsSave!=='function')return;
    const ids=['nw_rr','nw_o','nw_s','nw_p','nw_t'];
    if(ids.some(id=>{const e=document.getElementById(id);return !e||!(+e.value>0);}))return;
    let x;try{x=psyPx(pid);}catch(e){return;}
    const n0=(x.news||[])[0];
    if(n0&&n0.__auto&&Date.now()-n0.__ts<600000)x.news.shift();
    const t=window.toast;window.toast=function(){};
    try{window.psyNewsSave(pid);}finally{window.toast=t;}
    const n=(x.news||[])[0];if(n){n.__auto=1;n.__ts=Date.now();}
    try{toast('Early warning score '+n.total+' · '+n.band+' (saved)');}catch(e){}
  }
  document.addEventListener('change',e=>{const t=e.target;if(t&&t.closest&&t.closest('#pmScores .sc-f'))auto();},true);

  const __r=render;
  render=function(){
    const o=__r.apply(this,arguments);
    try{
      const ro=/^#\/patient\/[^/]+\/admission/.test(location.hash||'')&&S.admSec==='workup'&&S.wkView!=='form';
      document.body.classList.toggle('wk-ro',ro);
      /* the boxes show the vitals of the score that was saved, not the ward's last reading again */
      const pid=pidNow(),n0=pid&&document.getElementById('nw_p')?((psyPx(pid).news||[])[0]):null;
      if(n0&&n0.v){const v=n0.v,set=(id,val)=>{const e=document.getElementById(id);if(e&&val!=null&&val!=='')e.value=val;};
        set('nw_rr',v.rr);set('nw_o',v.spo2);set('nw_s',v.sbp);set('nw_p',v.pulse);set('nw_t',v.temp);set('nw_a',v.o2?'Oxygen':'Air');set('nw_c',v.cons);}
    }catch(e){}
    return o;
  };
})();
