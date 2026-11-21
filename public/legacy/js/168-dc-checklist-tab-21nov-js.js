/* 21 Nov 2026, owner ("not good at all, make one tab accessible by nav bar"; screenshot of the Discharge tab).
   The patient tab "Discharge summary" opened a page with two more tabs inside it (Discharge summary, Discharge checklist).
   Those inner tabs are gone. "Discharge checklist" is now its own patient tab in the tab bar, right after "Discharge summary",
   with the count of ticked items, and it opens from any patient tab. Its address is #/patient/<id>/discharge/checklist:
   the page underneath is still the discharge page that block 146 splits in two, and this block shows one part or the other.
   Psychiatrist, floor lead psychiatrist, psychologist, floor lead psychologist (the roles with block 146's Discharge tab). */
(function(){
  const ROLE=String((window.__TULASI__||{}).role||'');
  if(!/^(psychiatrist|floor-lead-psychiatrist|psychologist|floor-lead-psychologist)$/.test(ROLE))return;
  const CHK='checklist';
  const route=()=>{const m=String(location.hash||'').match(/^#\/patient\/([^/?]+)(?:\/([^/?]+))?(?:\/([^/?]+))?/);return m?{pid:decodeURIComponent(m[1]),sub:m[2]||'',part:m[3]||''}:{pid:'',sub:'',part:''};};
  const url=(pid,chk)=>'#/patient/'+encodeURIComponent(pid)+'/discharge'+(chk?'/'+CHK:'');
  /* anything that still asks block 146 for its inner tabs opens the matching patient tab */
  window.m20DcTab=function(t){const r=route();if(r.pid)go(url(r.pid,t==='chk'));};
  const css=document.createElement('style');
  css.textContent='#m20Dc .m20-tabs{display:none!important}.subtab .dcck-n{margin-left:6px;font-size:12px;font-weight:600;color:#667085}.subtab.on .dcck-n{color:inherit;opacity:.85}';
  document.head.appendChild(css);

  function paint(){
    const {pid,sub,part}=route();if(!pid)return;
    const v=document.getElementById('view');if(!v)return;
    const onDc=sub==='discharge',onChk=onDc&&part===CHK;
    const bar=v.querySelector('.ws-mid > .subtabs')||v.querySelector('.subtabs');
    const sumTab=bar?[...bar.querySelectorAll('button')].find(b=>!b.dataset.dcck&&/^Discharge/.test(b.textContent.trim())):null;
    if(sumTab){
      let t=bar.querySelector('[data-dcck]');
      if(!t){t=document.createElement('button');t.type='button';t.className='subtab psy-discharge-tab';t.dataset.dcck='1';t.setAttribute('role','tab');
        t.setAttribute('aria-label','Open the discharge checklist');t.addEventListener('click',()=>{const r=route();if(r.pid)go(url(r.pid,true));});sumTab.after(t);}
      const c=typeof window.m20DcCount==='function'?window.m20DcCount(pid):null;
      t.innerHTML='Discharge checklist'+(c?'<span class="dcck-n">'+c[0]+'/'+c[1]+'</span>':'');
      if(onDc){sumTab.classList.toggle('on',!onChk);sumTab.setAttribute('aria-selected',String(!onChk));}
      t.classList.toggle('on',onChk);t.setAttribute('aria-selected',String(onChk));
    }
    if(!onDc)return;
    const S1=v.querySelector('#m20SumT'),S2=v.querySelector('#m20ChkT');
    if(S1)S1.style.display=onChk?'none':'';
    if(S2)S2.style.display=onChk?'':'none';
  }
  const __r=render;
  render=function(){const o=__r.apply(this,arguments);try{paint();}catch(e){try{console.warn('dc checklist tab',e);}catch(_){}}return o;};
})();
