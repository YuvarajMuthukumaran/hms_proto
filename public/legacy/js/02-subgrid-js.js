
(function(){
  const P = {
    home:'<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
    rounds:'<rect x="6" y="4" width="12" height="17" rx="2"/><path d="M9 4V3h6v1"/><path d="M9 10h6M9 14h6M9 18h3"/>',
    notes:'<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M14 6l4 4"/>',
    chart:'<path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 5-6"/>',
    swap:'<path d="M4 8h14l-3-3"/><path d="M20 16H6l3 3"/>',
    bed:'<path d="M3 18V7"/><path d="M3 14h18v4"/><path d="M21 14v-2a3 3 0 0 0-3-3h-7v5"/><circle cx="7" cy="11" r="2"/>',
    floor:'<rect x="4" y="3" width="16" height="18" rx="1"/><path d="M9 7h1M14 7h1M9 11h1M14 11h1M9 15h1M14 15h1"/>',
    care:'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z"/>',
    duty:'<path d="M6 3v6a4 4 0 0 0 8 0V3"/><path d="M10 13v3a5 5 0 0 0 10 0v-2"/><circle cx="20" cy="12" r="2"/>',
    bell:'<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 21h4"/>',
    adm:'<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>',
    hist:'<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l3 2"/>',
    shield:'<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>',
    docs:'<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M10 13h6M10 17h6"/>'
  };
  const MAP = {
    '#/myday':['home','blue','Today'],
    '#/rounds':['rounds','green','Rounds'],
    '#/notes':['notes','teal','Daily notes'],
    '#/nursing':['chart','green','Nursing chart'],
    '#/handover':['swap','amber','Handover'],
    '#/inpatients':['bed','violet','List'],
    '#/admissions':['adm','blue','New admission'],
    '#/floor/flow':['floor','green','Floor'],
    '#/ward/charts':['care','green','Care'],
    '#/duty/night':['duty','green','Duty'],
    '#/escalation':['bell','red','Alerts'],
    '#/timeline':['hist','teal','History'],
    '#/patient':['hist','teal','History'],
    '#/permissions':['shield','grey','Access'],
    '#/clinical-docs':['docs','teal','Clinical docs']
  };
  const svg = k => `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[k]}</svg>`;
  const GROUPS = [
    {k:'today', w:'Today', ic:'home', c:'blue', secs:['myday','ward','floor','handover']},
    {k:'patients', w:'Patients', ic:'bed', c:'violet', secs:['inpatients','admissions','rounds','notes','nursing','timeline','patient']},
    {k:'alerts', w:'Alerts', ic:'bell', c:'red', secs:['escalation','permissions']},
    {k:'clinical-docs', w:'Clinical documentation', ic:'docs', c:'teal', secs:['clinical-docs']}
  ];
  const sec = h => h.slice(2).split('/')[0];
  const groupOf = s => (GROUPS.find(g => g.secs.includes(s)) || {}).k;
  let LAST = [];
  let open = null; /* null = follow the page: open inside Inpatients, closed elsewhere */
  function dropdown(){
    const subs = [...document.querySelectorAll('#side .sub')];
    const nav = [...document.querySelectorAll('#side .nav')].find(n => /go\('#\/myday'\)/.test(n.getAttribute('onclick')||''));
    if(!nav) return;
    const L = subs.map(b => {
      const m = (b.getAttribute('onclick')||'').match(/go\('([^']+)'\)/);
      return {h: m && m[1], full: (b.childNodes[0] && b.childNodes[0].textContent || b.textContent).trim(), on: b.classList.contains('on')};
    }).filter(x => x.h);
    subs.forEach(b => b.remove());
    const inIpd = nav.classList.contains('on');
    LAST = L;
    const onPatient = /^#\/patient\//.test(location.hash);
    const cur = groupOf((location.hash||'#/myday').slice(2).split('/')[0]);
    const groups = GROUPS.map(g => ({g, m: L.filter(x => g.secs.includes(sec(x.h))).sort((a,b) => g.secs.indexOf(sec(a.h)) - g.secs.indexOf(sec(b.h)))})).filter(x => x.m.length);
    const isOpen = inIpd && (open === null ? true : open);
    nav.removeAttribute('onclick'); nav.classList.add('sgnav');
    nav.onclick = () => { if(!inIpd){ open = true; go('#/myday'); return; } open = !isOpen; renderSide((location.hash||'#/myday').slice(2).split('/')); };
    nav.setAttribute('aria-expanded', isOpen);
    nav.classList.toggle('sgopen', isOpen);
    const tx = nav.querySelector('.newtag') || nav.querySelector('.tx');
    tx.insertAdjacentHTML('afterend', '<span class="sgchev" aria-hidden="true"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg></span>');
    const dd = document.createElement('div'); dd.className = 'sgdd'; dd.hidden = !isOpen;
    dd.innerHTML = groups.map(({g, m}) => {
      const on = inIpd && cur === g.k;
      const full = m.map(x => x.full).join(', ');
      const action = g.k==='clinical-docs' ? "cdOpen('kabir')" : `go('${m[0].h}')`;
      return `<button class="sg-${g.c}${on?' on':''}" title="${full}" aria-label="${g.w}: ${full}" ${on?'aria-current="page"':''} onclick="${action}"><span class="si">${svg(g.ic)}</span><span class="sl">${g.w}</span></button>`;
    }).join('');
    nav.after(dd);
  }
  /* Tabs at the top of a page when its group holds more than one screen */
  function strip(){
    const v = document.getElementById('view'); if(!v || v.querySelector('.sgtabs')) return;
    const s = (location.hash||'#/myday').slice(2).split('/')[0], k = groupOf(s); if(!k) return;
    const g = GROUPS.find(x => x.k === k), m = LAST.filter(x => g.secs.includes(sec(x.h))).sort((a,b) => g.secs.indexOf(sec(a.h)) - g.secs.indexOf(sec(b.h)));
    if(m.length < 2) return;
    const curSec = s === 'patient' ? (window.__histNav ? 'timeline' : 'inpatients') : s;
    v.insertAdjacentHTML('afterbegin', `<nav class="sgtabs" aria-label="${g.w}">${m.map(x => { const d = MAP[x.h] || ['home','grey',x.full]; const on = sec(x.h) === curSec; return `<button class="sg-${d[1]}${on?' on':''}" title="${x.full}" ${on?'aria-current="page"':''} onclick="go('${x.h}')"><span class="si">${svg(d[0])}</span>${d[2]}</button>`; }).join('')}</nav>`);
  }
  /* Icons on the patient file tabs */
  const SUBI = {
    overview:'<rect x="6" y="4" width="12" height="17" rx="2"/><path d="M9 10h6M9 14h6"/>',
    admission:'<path d="M3 21h18"/><path d="M5 21V4h10v17"/><path d="M15 9h4v12"/><circle cx="12" cy="13" r=".6"/>',
    vitals:'<path d="M3 12h4l2-5 4 10 2-5h6"/>',
    orders:'<rect x="3" y="9" width="18" height="6" rx="3"/><path d="M12 9v6"/>',
    daily:'<path d="M4 20h4L19 9l-4-4L4 16z"/>',
    plans:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    update:'<path d="M5 4h4l2 5-3 2a11 11 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
    past:'<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
    griev:'<path d="M4 5h16v11H8l-4 4z"/><path d="M12 8v4M12 14h.01"/>',
    prefs:'<path d="M7 3v8M5 3v4a2 2 0 0 0 4 0V3M7 11v10"/><path d="M17 3c-2 0-3 2-3 6h3v12"/>',
    forms:'<path d="M6 9V3h12v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M6 14h12v7H6z"/>',
    therapy:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7"/>',
    discharge:'<path d="M14 4h5v16h-5"/><path d="M10 8l-4 4 4 4M6 12h10"/>'
  };
  function subIcons(){
    document.querySelectorAll('#view .subtab').forEach(b => {
      if(b.querySelector('.sti')) return;
      const m = (b.getAttribute('onclick')||'').match(/patient\/[^/]+\/(\w+)/); const k = m && m[1];
      if(SUBI[k]) b.insertAdjacentHTML('afterbegin', `<span class="sti"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${SUBI[k]}</svg></span>`);
    });
  }
  /* ===== Whole-site comfort pass: icons on section titles and buttons, jump menu, tidy demo bar ===== */
  const KI = {
    bell:'<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 21h4"/>',
    pill:'<rect x="3" y="9" width="18" height="6" rx="3"/><path d="M12 9v6"/>',
    pulse:'<path d="M3 12h4l2-5 4 10 2-5h6"/>',
    swap:'<path d="M4 8h14l-3-3"/><path d="M20 16H6l3 3"/>',
    check:'<circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/>',
    clip:'<rect x="6" y="4" width="12" height="17" rx="2"/><path d="M9 4V3h6v1"/><path d="M9 10h6M9 14h6M9 18h3"/>',
    flask:'<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3"/>',
    phone:'<path d="M5 4h4l2 5-3 2a11 11 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
    pen:'<path d="M4 20h4L19 9l-4-4L4 16z"/>',
    door:'<path d="M14 4h5v16h-5"/><path d="M10 8l-4 4 4 4M6 12h10"/>',
    bed:'<path d="M3 18V7"/><path d="M3 14h18v4"/><path d="M21 14v-2a3 3 0 0 0-3-3h-7v5"/><circle cx="7" cy="11" r="2"/>',
    users:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7"/>',
    chart:'<path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 5-6"/>',
    drop:'<path d="M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11z"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    shield:'<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>',
    warn:'<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18h.01"/>',
    msg:'<path d="M4 5h16v11H8l-4 4z"/>',
    food:'<path d="M7 3v8M5 3v4a2 2 0 0 0 4 0V3M7 11v10"/><path d="M17 3c-2 0-3 2-3 6h3v12"/>',
    print:'<path d="M6 9V3h12v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M6 14h12v7H6z"/>',
    walk:'<circle cx="13" cy="4" r="2"/><path d="M10 21l2-6-3-3 1-5 4 3 3 1M9 12l-2 3"/>',
    moon:'<path d="M20 14A8 8 0 1 1 10 4a6 6 0 0 0 10 10z"/>',
    scale:'<path d="M12 3v18M5 7h14M5 7l-3 7a3 3 0 0 0 6 0zM19 7l-3 7a3 3 0 0 0 6 0z"/>',
    star:'<path d="M12 3l2.8 5.8 6.2.9-4.5 4.4 1 6.2L12 17.4 6.5 20.3l1-6.2L3 9.7l6.2-.9z"/>',
    home:'<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>',
    list:'<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
    plus:'<path d="M12 5v14M5 12h14"/>',
    eye:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    send:'<path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4z"/>',
    play:'<path d="M7 4l13 8-13 8z"/>',
    up:'<path d="M12 19V5M5 12l7-7 7 7"/>'
  };
  const HC = {bell:'red',warn:'red',pill:'blue',pulse:'green',drop:'amber',swap:'amber',check:'green',clip:'blue',flask:'violet',phone:'teal',pen:'teal',door:'green',bed:'violet',users:'violet',chart:'blue',clock:'grey',shield:'grey',msg:'teal',food:'amber',print:'grey',walk:'blue',moon:'violet',scale:'grey',star:'amber',home:'blue',list:'grey'};
  const HCOL = {red:['#fdecec','#b42318'],blue:['#e8f1fe','#1e5bb8'],green:['#e3f7ea','#11703a'],amber:['#fef3e2','#92500a'],violet:['#f3effe','#5b3fb5'],teal:['#e0f4f7','#0e7490'],grey:['#f1f4f8','#475467']};
  const HK = [
    [/alert|escalat|event|incident|emergency|serious/i,'bell'],[/risk|restrain|abscond|safety|grievance|complain/i,'warn'],
    [/medicine|medication|dose|prescri|prn|sos|mar\b|tablet|clozapine/i,'pill'],[/sugar|blood|cbg|fluid/i,'drop'],
    [/vital|pulse|bp\b|monitor|observation|trend/i,'pulse'],[/handover|carried|transfer|shift/i,'swap'],
    [/task|due|checklist|to do|done|approv|complian/i,'check'],[/order|instruction|plan|round|consent|form/i,'clip'],
    [/lab|test|result|wbc|lithium/i,'flask'],[/family|call|caregiver|phone/i,'phone'],[/note|history|summary|scribe|session|therapy/i,'pen'],
    [/discharge|leave|outing|going home/i,'door'],[/admission|bed|ward|room|floor|stay/i,'bed'],[/team|patient|allocation|staff|doctor/i,'users'],
    [/chart|adherence|quality|stat/i,'chart'],[/timeline|time|clock|schedule|night|day duty/i,'clock'],[/permission|role|access|rule|mhca|section|capacity|legal/i,'shield'],
    [/message/i,'msg'],[/diet|food|meal|preference/i,'food'],[/print/i,'print'],[/movement|walk|moves/i,'walk'],[/sleep/i,'moon'],[/weight/i,'scale'],[/vip/i,'star']
  ];
  const BK = [
    [/^(save|done|mark|confirm|acknowledg|countersign|sign|approve|complete|tick)/i,'check'],[/^(record|log|add|new|\+)/i,'plus'],
    [/^(start)/i,'play'],[/^(call)/i,'phone'],[/^(message|send|share)/i,'send'],[/^(print)/i,'print'],[/^(report)/i,'warn'],
    [/^(open|view|see|show)/i,'eye'],[/^(assign|transfer)/i,'users']
  ];
  const ico = (k,s) => `<svg width="${s||18}" height="${s||18}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${KI[k]}</svg>`;
  const hk = t => { const m = HK.find(x => x[0].test(t)); return m ? m[1] : 'list'; };
  const hspan = (k,s) => { const c = HCOL[HC[k]||'grey']; return `<span class="hico" style="--hb:${c[0]};--hc:${c[1]}">${ico(k,s)}</span>`; };
  function sections(){
    return [...document.querySelectorAll('#view .card > .hd h3, #view section.card > .hd h3, #view .card > .hd > div > h3, #view section.card > .hd > div > h3')]
      .filter(h => h.offsetParent !== null);
  }
  function headIcons(){
    sections().forEach(h => {
      if(h.querySelector('.hico')) return;
      const t = (h.childNodes[0] && h.childNodes[0].textContent || h.textContent).trim();
      h.insertAdjacentHTML('afterbegin', hspan(hk(t), 17));
    });
  }
  function btnIcons(){
    document.querySelectorAll('#view .btn').forEach(b => {
      if(b.querySelector('svg') || b.dataset.ez) return; b.dataset.ez = '1';
      const t = b.textContent.trim(); const m = BK.find(x => x[0].test(t));
      if(m && t.length < 40) b.insertAdjacentHTML('afterbegin', `<span class="bico">${ico(m[1],16)}</span>`);
    });
  }
  function demoBar(){
    const p = document.querySelector('.proto'); if(!p || p.querySelector('.ezdemo')) return;
    const b = document.createElement('button'); b.className = 'ezdemo'; b.type = 'button';
    const set = o => { p.classList.toggle('open', o); b.textContent = o ? 'Hide demo tools' : 'Demo tools'; b.setAttribute('aria-expanded', o); };
    b.onclick = () => set(!p.classList.contains('open')); set(false); p.appendChild(b);
  }
  let jp, jb;
  function jumpMenu(){ return;
    if(!jb){
      jb = document.createElement('button'); jb.className = 'ezjump'; jb.type = 'button'; jb.setAttribute('aria-haspopup','true');
      jb.innerHTML = ico('list',20)+'<span>Jump to</span>';
      jp = document.createElement('div'); jp.className = 'ezjp'; jp.hidden = true; jp.setAttribute('role','menu');
      jb.onclick = () => { jp.hidden = !jp.hidden; jb.setAttribute('aria-expanded', !jp.hidden); if(!jp.hidden){ const f = jp.querySelector('button'); f && f.focus(); } };
      document.addEventListener('keydown', ev => { if(ev.key === 'Escape' && !jp.hidden){ jp.hidden = true; jb.focus(); } });
      document.addEventListener('click', ev => { if(!jp.hidden && !jp.contains(ev.target) && !jb.contains(ev.target)) jp.hidden = true; });
      document.body.append(jp, jb);
    }
    const hs = sections();
    jp.hidden = true;
    jb.style.display = hs.length >= 3 ? '' : 'none';
    jp.innerHTML = `<button role="menuitem" data-top="1">${hspan('up',17)}Top of page</button>` + hs.map((h,i) => {
      const c = h.cloneNode(true); c.querySelectorAll('.chip,.hico,.newtag,.fcount,span[class*="tag"]').forEach(x => x.remove());
      const t = (c.textContent||'').replace(/\s+/g,' ').trim().slice(0,40);
      const k = hk(t);
      return `<button role="menuitem" data-i="${i}">${hspan(k,17)}${t.replace(/[&<>"]/g,'')}</button>`;
    }).join('');
    jp.querySelectorAll('button').forEach(btn => btn.onclick = () => {
      jp.hidden = true;
      if(btn.dataset.top){ window.scrollTo({top:0, behavior:'smooth'}); return; }
      const card = hs[+btn.dataset.i].closest('.card');
      const y = card.getBoundingClientRect().top + window.scrollY - 150;
      window.scrollTo({top:y, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
      card.classList.remove('ezflash'); void card.offsetWidth; card.classList.add('ezflash');
    });
  }
  HC.up = 'grey'; KI.up = KI.up;
  /* ===== RMO: the duty desk lives on the main page. Same panels, no separate page. ===== */
  const DW = [
    ['alerts','Nurse alerts','alert','crit','Nurses need you. Tap Acknowledge, then go to the patient.'],
    ['orders','Orders to sign','doc','amber','Orders you gave by phone or at night. Check and sign them.'],
    ['labs','Lab results','flask','amber','New test results. Read the red ones first and act.'],
    ['protocols','Emergency','pulse','crit','Something serious is happening. Pick it and follow the steps one by one.'],
    ['events','Serious events','shield','crit','Falls, injuries, fights, escapes. Check each one and write what you did.'],
    ['referrals','Outside doctors','truck','blue','Patients sent to other doctors. Write what the doctor said.'],
    ['exam','Body check-ups','heart','amber','Physical exams that are due. Examine the patient and save.'],
    ['night','On call and new patients','phone','','Who to call on each floor, new admissions, and day or night duty.']
  ];
  const DWBODY = () => ({night:V3.pNight,alerts:V3.pAlerts,orders:V3.pOrders,protocols:V3.pProtocols,labs:V3.pLabs,referrals:V3.pRefer,events:V3.pEvents,exam:V3.pExam});
  window.dwTab = k => { v3().ui.dutyTab = k; render(); const el = document.getElementById('dutyWork'); if(el) window.scrollTo({top: el.getBoundingClientRect().top + scrollY - 140}); };
  V3.dutyHome = () => {
    if(S.role!=='rmo') return '';
    const B = V3.dutyBadges(), ui = v3().ui;
    let tab = ui.dutyTab;
    if(!DW.some(d=>d[0]===tab)) tab = (DW.find(d=>B[d[0]]) || DW[0])[0];
    const cur = DW.find(d=>d[0]===tab);
    const tabs = DW.map(d=>{ const n = d[0]==='night'?0:(B[d[0]]||0); return `<button type="button" class="${tab===d[0]?'on':''} ${n&&d[3]==='crit'?'hot':''}" aria-pressed="${tab===d[0]}" onclick="dwTab('${d[0]}')"><span class="di">${V3.i(d[2],20)}</span><span class="dt">${d[1]}</span>${n?`<span class="dn ${d[3]}">${n}</span>`:'<span></span>'}<span class="dh">${d[4].split('.')[0]}</span></button>`; }).join('');
    let body = ''; try{ body = DWBODY()[tab](); }catch(err){ console.error(err); }
    return `${V3.protoBanner()}<section class="card dw" id="dutyWork" aria-label="Duty work"><div class="hd"><div><h3>Your duty work</h3><div class="small muted" style="margin-top:4px">${V3.isNight()?'Night duty: you are the first call for every ward.':'Day duty: you back up the treating teams.'} Tap a box to see that work below.</div></div></div>
      <div class="dw-tabs" role="group" aria-label="Choose duty work">${tabs}</div>
      <div class="dw-what" role="note"><span class="di" style="display:none"></span><b>${cur[1]}:</b><span>${cur[4]}</span></div>
      <div class="dw-body">${body}</div></section>`;
  };
  function shiftLeft(){
    if(!/^#\/handover/.test(location.hash)) return;
    const h = [...document.querySelectorAll('#view h2')].find(x => /^\s*Handover/.test(x.textContent)); if(!h) return;
    const d = h.nextElementSibling; if(!d || d.dataset.ez) return;
    const t = d.textContent.trim(), m = t.match(/^(.*?) left on this shift · (.*)$/), m2 = t.match(/^Your shift has ended · (.*)$/);
    if(!m && !m2) return;
    const clk = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>';
    const flr = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/></svg>';
    let tm;
    if(m){ const hrs = +((m[1].match(/(\d+)\s*h/)||[])[1]||0); tm = `<span class="tm ${hrs<1?'low':''}">${clk}<b>${m[1].replace(/\b0(\d) m\b/,'$1 m')} left</b></span>`; }
    else tm = `<span class="tm end">${clk}<b>Your shift has ended</b></span>`;
    const fl = (m ? m[2] : m2[1]);
    d.dataset.ez = '1'; d.className = 'shl'; d.removeAttribute('style');
    d.innerHTML = tm + `<span>${flr}<b>${fl.replace(/[&<>]/g,'')}</b></span>`;
  }
  function hoSheet(){
    const c = document.querySelector('#view .sheet .carry'); if(!c || c.dataset.ez) return; c.dataset.ez = '1';
    const T = {'c-amber':'amber','c-violet':'violet','c-red':'red','c-blue':'blue','c-grey':'grey'};
    let tone = 'grey';
    [...c.children].forEach(el => {
      if(el.classList.contains('csec')){ const ch = el.querySelector('.chip'); tone = ch ? (Object.keys(T).find(k => ch.classList.contains(k)) ? T[Object.keys(T).find(k => ch.classList.contains(k))] : 'grey') : 'grey'; el.dataset.tone = tone; }
      else if(el.classList.contains('ci')) el.dataset.tone = tone;
    });
    const meta = document.querySelector('#view .sheet .shhd > div:first-child > div:last-child');
    if(meta){ const t = meta.textContent.replace(/^\s*items to carry\s*·\s*/,''); meta.innerHTML = `<div class="hoh">Items to hand over</div>${t.replace(/[&<>]/g,'')}`; }
  }
  const _rs = window.renderSide;
  window.renderSide = renderSide = function(){ _rs.apply(this, arguments); try{ dropdown(); }catch(e){ console.error(e); }
    try{ const m = (location.hash||'').match(/^#\/existing\/(.+)$/); if(m){ const name = decodeURIComponent(m[1]); document.querySelectorAll('#side .nav').forEach(n => { const g = (n.getAttribute('onclick')||'').match(/go\('#\/existing\/([^']+)'\)/); if(g && decodeURIComponent(g[1])===name){ n.classList.add('on'); n.setAttribute('aria-current','page'); } }); } }catch(e){} };
  const _r = window.render;
  window.render = render = function(){
    const rr = (location.hash||'').slice(2).split('/');
    if(rr[0]==='duty' && S.role==='rmo'){ v3().ui.dutyTab = rr[1]||'night'; history.replaceState(null,'','#/myday'); _r.apply(this, arguments); try{ strip(); headIcons(); btnIcons(); demoBar(); jumpMenu(); }catch(err){} const el=document.getElementById('dutyWork'); if(el) window.scrollTo({top: el.getBoundingClientRect().top + scrollY - 140}); return; }
    _r.apply(this, arguments); try{ strip(); subIcons(); shiftLeft(); hoSheet(); { const nx = document.querySelector('#view .rwrap section.nxt'), dw = document.getElementById('dutyWork'); if(nx && dw && !nx.dataset.ez){ nx.dataset.ez='1'; dw.before(nx); } } headIcons(); btnIcons(); demoBar(); jumpMenu(); const g = document.querySelector('.shb .eyb'); if(g){ const h = new Date().getHours(); g.textContent = h>=5&&h<12 ? 'Good morning' : h>=12&&h<17 ? 'Good afternoon' : h>=17&&h<21 ? 'Good evening' : 'Good night'; } }catch(e){ console.error(e); } };
  render();
})();
