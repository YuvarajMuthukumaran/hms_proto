/* 18 Nov 2026, Trello "bring back scores" and "Rating scales and early warning" (Nikita's QA of 17 Nov), psychiatrist and floor lead psychiatrist only.
   Anu's scales: ASQ (every patient), C-SSRS (when the ASQ is positive), CIWA-Ar (alcohol), COWS (opioids); NEWS2 stays available.
   1. Rounds > Monitoring > Add monitoring: the four scales are in the list, with their own frequencies (every shift, every 4 hours, daily, at each re-assessment).
      Ordering one (and saving the round) puts it on the nurse's "Scales to record" board; stopping one works the same way.
   2. Rounds > Since last round: a Scores line for every patient, with a trend arrow against the previous score.
   3. The nurse board no longer shows made-up orders in real-data mode. */
(function(){
  const r=String((window.__TULASI__||{}).role||'');
  if(r!=='psychiatrist'&&r!=='floor-lead-psychiatrist')return;
  const px=pid=>{try{return psyPx(pid);}catch(e){return {};}};
  const SCALES=['ASQ screen','C-SSRS screen','CIWA-Ar','COWS'];
  const SC_FREQ=['Every shift','Every 4 hours','Daily','At each re-assessment'];
  const isScale=n=>SCALES.indexOf(n)>=0;
  try{SCALES.forEach(n=>{if(!MON_PARAMS.some(m=>m[0]===n))MON_PARAMS.push([n,'score','']);});}catch(e){}

  /* 1a. the frequency list beside a scale */
  if(typeof monShowFreq==='function'){
    const __sf=monShowFreq;
    monShowFreq=function(i){
      const p=(MON_PARAMS[i]||[])[0];
      if(!isScale(p))return __sf.apply(this,arguments);
      const box=$('monFreqList');if(!box)return;
      const R=S.rounds,WP=WARDS[R.ward],pat=WP[Math.min(R.idx[R.ward],WP.length-1)];
      const cur=((px(pat.id).scaleOrders||[]).find(o=>o.scale===p)||{}).freq;
      box.innerHTML='<div class="mon-freq-title">'+hesc(p)+'</div>'+SC_FREQ.map(f=>'<button type="button" class="mon-freq-option '+(cur===f?'current':'')+'" onclick="monQuickAdd(\''+encodeURIComponent((cur?'Change':'Start')+'|'+p+'|'+f)+'\')">'+hesc(f)+'</button>').join('');
      document.querySelectorAll('.mon-param-option').forEach((b,j)=>b.classList.toggle('on',j==i));
    };
  }

  /* 1b. saving the round: a scale becomes (or leaves) the patient's scale orders, which the nurse board reads */
  if(typeof monApply==='function'){
    const __ma=monApply;
    monApply=function(pid,c){
      if(!c||!isScale(c.p))return __ma.apply(this,arguments);
      const x=px(pid);x.scaleOrders=(x.scaleOrders||[]).filter(o=>o.scale!==c.p);
      if(c.act!=='Stop')x.scaleOrders.unshift({scale:c.p,freq:c.f,by:signer(),at:atNow()});
    };
  }
  const __cm=window.monAdd||monAdd;

  /* 1c. the scales already ordered, with a Stop button, inside the Monitoring card of Rounds */
  function ordered(){
    const v=document.getElementById('view');if(!v||String(location.hash||'').split('?')[0]!=='#/rounds')return;
    const card=[...v.querySelectorAll('section.card')].find(s=>{const h=s.querySelector(':scope > .hd h3');return h&&h.textContent.trim()==='Monitoring';});
    if(!card)return;
    const R=S.rounds,WP=WARDS[R.ward];if(!WP||!WP.length)return;
    const pat=WP[Math.min(R.idx[R.ward],WP.length-1)];
    const old=card.querySelector('#rdScales');if(old)old.remove();
    const so=(px(pat.id).scaleOrders||[]);
    const pendStop=new Set((R.mon||[]).filter(c=>c.act==='Stop').map(c=>c.p));
    const d=document.createElement('div');d.id='rdScales';d.style.cssText='padding:4px 20px 14px';
    d.innerHTML='<div class="lbl" style="margin-bottom:6px">Scales ordered</div>'+(so.length?so.map(o=>'<div class="box row" style="gap:8px;margin-bottom:6px"><span class="chip c-violet">Scale</span><span class="grow small">'+hesc(o.scale)+' · '+hesc(o.freq)+' <span class="tiny muted">· '+hesc(o.by||'')+', '+hesc(o.at||'')+'</span></span>'+(pendStop.has(o.scale)?'<span class="tiny muted">Stop pending</span>':'<button class="btn sm" onclick="monAdd(\'Stop\',\''+hesc(o.scale)+'\',\'-\')">Stop</button>')+'</div>').join(''):'<div class="small muted">No scale ordered. Pick ASQ, C-SSRS, CIWA-Ar or COWS in Add monitoring above.</div>');
    card.appendChild(d);
  }

  /* 2. Scores line under Since last round */
  const arrow=(a,b)=>a==null||b==null?'':(a>b?' ↑':a<b?' ↓':' →');
  const RANK={Low:1,Moderate:2,High:3};
  window.psyScoreLine=function(pid){
    const x=px(pid),out=[];
    const asq=(x.asq||[])[0];
    out.push(asq?'ASQ '+String(asq.result).split(',')[0].toLowerCase():'ASQ not done yet');
    const cs=x.suicide||[];
    if(cs[0]&&(cs[0].level)){const a=RANK[cs[0].level],b=cs[1]?RANK[cs[1].level]:null;out.push('C-SSRS '+String(cs[0].level).toLowerCase()+arrow(a,b));}
    const ord=(x.scaleOrders||[]);
    const ci=(x.ciwa||[]),co=(x.cows||[]);
    if(ci[0])out.push('CIWA-Ar '+ci[0].total+arrow(ci[0].total,(ci[1]||{}).total)+' ('+String(ci[0].band).toLowerCase().replace('rmo','RMO')+')');
    else if(ord.some(o=>o.scale==='CIWA-Ar'))out.push('CIWA-Ar no score yet');
    if(co[0])out.push('COWS '+co[0].total+arrow(co[0].total,(co[1]||{}).total)+' ('+String(co[0].band).toLowerCase()+')');
    else if(ord.some(o=>o.scale==='COWS'))out.push('COWS no score yet');
    try{const a=window.psyAutoNews&&psyAutoNews(pid);if(a)out.push('NEWS2 '+a.total+arrow(a.total,a.prev)+' ('+String(a.band).toLowerCase().replace('rmo','RMO')+')');}catch(e){}
    return out.join(' · ');
  };

  const __r=render;
  render=function(){const o=__r.apply(this,arguments);try{ordered();}catch(e){}return o;};
})();
