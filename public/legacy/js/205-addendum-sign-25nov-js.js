/* 25 Nov 2026 meeting: "Addendum section: signature missing, overall layout not clean".
   The addendum to a signed and locked record (admission workup, capacity assessment, detailed history, daily notes; blocks 86/89,
   lkAdd/lkSave, psyx.addenda[key]) now needs a signature: drawn in a box or a photo uploaded. Saved as {t,by,at,sig} (sig = image).
   Every addendum is shown as a card: who and when, the text, and the signature (older ones say they were added without one). All roles. */
(function(){
  const E=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const P={c:null,g:null,drawn:false,mode:'draw',file:''};
  function pad(){const c=document.getElementById('adSgC');if(!c)return;P.c=c;P.g=c.getContext('2d');P.drawn=false;P.mode='draw';P.file='';
    P.g.lineWidth=2.2;P.g.lineCap='round';P.g.strokeStyle='#101828';let on=false;
    const at=e=>{const r=c.getBoundingClientRect();return [(e.clientX-r.left)*c.width/r.width,(e.clientY-r.top)*c.height/r.height];};
    c.addEventListener('pointerdown',e=>{on=true;c.setPointerCapture(e.pointerId);const [x,y]=at(e);P.g.beginPath();P.g.moveTo(x,y);});
    c.addEventListener('pointermove',e=>{if(!on)return;const [x,y]=at(e);P.g.lineTo(x,y);P.g.stroke();P.drawn=true;});
    ['pointerup','pointercancel'].forEach(t=>c.addEventListener(t,()=>{on=false;}));}
  window.adSgMode=function(m){P.mode=m;const d=document.getElementById('adSgD'),u=document.getElementById('adSgU');if(d)d.style.display=m==='draw'?'':'none';if(u)u.style.display=m==='up'?'':'none';
    document.querySelectorAll('.ad-sgm button').forEach(b=>b.classList.toggle('on',b.dataset.m===m));};
  window.adSgClear=function(){if(P.g){P.g.clearRect(0,0,P.c.width,P.c.height);P.drawn=false;}};
  window.adSgFile=function(inp){const f=inp.files&&inp.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{P.file=r.result;const i=document.getElementById('adSgI');if(i){i.src=r.result;i.style.display='block';}};r.readAsDataURL(f);};
  const sigVal=()=>P.mode==='up'?P.file:(P.drawn&&P.c?P.c.toDataURL('image/png'):'');
  window.lkAdd=function(pid,key){
    const who=(typeof signer==='function'?signer():'');
    V3.modal('Add an addendum','The signed record stays as it was. Your addendum is added under it with your name, the date, the time and your signature.',
      `<label class="field"><span class="lbl">Addendum</span><textarea class="input" id="lkT" rows="4" placeholder="What was missed or changed"></textarea></label>
       <div class="lbl" style="margin-top:12px">Signature · <b>${E(who)}</b></div>
       <div class="ad-sgm row" style="gap:6px;margin:6px 0"><button type="button" class="btn sm on" data-m="draw" onclick="adSgMode('draw')">Sign in the box</button><button type="button" class="btn sm" data-m="up" onclick="adSgMode('up')">Upload a photo of the signature</button></div>
       <div id="adSgD"><canvas id="adSgC" width="560" height="140" style="width:100%;height:140px;background:#fff;border:1px solid #cbd5e1;border-radius:10px;touch-action:none"></canvas><button type="button" class="btn sm" style="margin-top:6px" onclick="adSgClear()">Clear</button></div>
       <div id="adSgU" style="display:none"><input type="file" accept="image/*" class="input" onchange="adSgFile(this)"><img id="adSgI" alt="" style="display:none;max-height:110px;margin-top:8px;border:1px solid #e4e7ec;border-radius:8px;background:#fff"></div>`,
      `<button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="lkSave('${E(pid)}','${E(key)}')">Sign and add</button>`);
    setTimeout(pad,30);};
  window.lkSave=function(pid,key){const t=((document.getElementById('lkT')||{}).value||'').trim();if(!t){toast('Write the addendum first');return;}
    const sig=sigVal();if(!sig){toast('Sign in the box, or upload a photo of the signature');return;}
    const x=psyPx(pid);x.addenda=x.addenda||{};(x.addenda[key]=x.addenda[key]||[]).push({t,by:signer(),at:atNow(),sig});
    closeModal();render();toast('Addendum signed and added by '+signer());};
  /* the cards: blocks 86 and 89 draw .lk-a as "Addendum by <who>, <when>" + text; the signature comes from the saved entry */
  const pidNow=()=>{const m=(location.hash||'').match(/^#\/patient\/([^/]+)/);return m?decodeURIComponent(m[1]):((window.S&&S.pid)||'');};
  function paint(){const els=document.querySelectorAll('.lk-a:not([data-ad])');if(!els.length)return;
    let all=[];try{const a=psyPx(pidNow()).addenda||{};Object.keys(a).forEach(k=>all=all.concat(a[k]||[]));}catch(e){}
    els.forEach(el=>{el.dataset.ad='1';const t=((el.querySelector('div')||{}).textContent||'').trim(),head=el.textContent;
      const a=all.find(x=>x.t===t&&head.includes(x.at||''))||{};
      el.innerHTML=`<div class="ad-h"><b>Addendum</b><span>${E(a.by||'')}${a.at?' · '+E(a.at):''}</span></div><div class="ad-t">${E(a.t||t)}</div>`
        +(a.sig?`<div class="ad-s"><img src="${E(a.sig)}" alt="Signature of ${E(a.by||'')}"><span>Signed by ${E(a.by||'')}</span></div>`:(a.t?'<div class="ad-n">Added before signatures were asked for</div>':''));
      if(!a.t){/* not found (another patient's view): keep the old wording */el.innerHTML=`<div class="ad-h"><b>Addendum</b><span>${E(head.replace(/^Addendum\s*by\s*/,'').replace(t,'').trim())}</span></div><div class="ad-t">${E(t)}</div>`;}});}
  const cs=document.createElement('style');
  cs.textContent='.lk-a[data-ad]{flex-basis:100%;background:#fff!important;border:1px solid #D0D5DD!important;border-left:3px solid #1e6cdb!important;border-radius:10px!important;padding:10px 12px!important;color:#1d2939!important;font-size:13.5px;margin:2px 0}'
    +'.ad-h{display:flex;gap:10px;align-items:baseline;flex-wrap:wrap;margin-bottom:4px}.ad-h b{color:#1849a9!important}.ad-h span{font-size:12.5px;color:#667085}.ad-t{white-space:pre-wrap;line-height:1.5}'
    +'.ad-s{display:flex;align-items:flex-end;gap:12px;margin-top:8px;padding-top:8px;border-top:1px dashed #E4E7EC}.ad-s img{max-height:48px;max-width:200px}.ad-s span{font-size:12px;color:#475467}.ad-n{margin-top:6px;font-size:12px;color:#98A2B3}'
    +'.ad-sgm .btn.on{background:#EEF4FF;border-color:#1e6cdb;color:#1849a9}';
  document.head.appendChild(cs);
  let q=0;new MutationObserver(()=>{clearTimeout(q);q=setTimeout(()=>{try{paint();}catch(e){}},50);}).observe(document.documentElement,{childList:true,subtree:true});
})();
