/* 11 Nov 2026, team review with Anu (recording and Granola notes). Psychiatrist screens (the psychologist's read-only copies that are drawn
   through the psychiatrist's code pick the same changes up on their own):
   1. Dashboard: a colour key for the dots; the Completed table shows the real alert type, never "Done".
   2. "Change medicines" (overview) and "Add medicine" (Treatment Plan) open the Add medicine window in place; they no longer go to another page.
   3. Past admission file: a view-only window with Print. No download button (people must not keep copies on their own computers).
   Every change is gated by S.role, so no other role's screen is touched. */
(function(){
  const psy=()=>S.role==='psychiatrist';
  const psyOrPg=()=>S.role==='psychiatrist'||S.role==='psychologist';

  const css=document.createElement('style');css.id='psy-review-11nov-css';
  css.textContent=`
  .pdk{display:flex;flex-wrap:wrap;align-items:center;gap:6px 18px;margin:0 0 12px;padding:9px 14px;background:#f8fafc;border:1px solid var(--line,#e4e7ec);border-radius:12px;font-size:12.5px;color:#344054}
  .pdk b{font-size:11px;letter-spacing:.05em;text-transform:uppercase;color:#667085;margin-right:2px}
  .pdk span{display:inline-flex;align-items:center;gap:7px}
  .pdk i{display:inline-block;width:9px;height:9px;border-radius:50%;flex:0 0 9px}
  .pdk i.red{background:#e5484d}.pdk i.blue{background:#3b82f6}.pdk i.amber{background:#f5a524}.pdk i.ok{background:#12b76a}
  .pdk em{font-style:normal;color:#667085}
  /* Admission step 4 (detailed history): two columns, tighter gaps, every question numbered Q1, Q2 ... (psychiatrist only) */
  body.psy-views:not(.psg) .hwrap .hgrid{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:12px 28px!important;counter-reset:hq}
  body.psy-views:not(.psg) .hwrap .hgrid>.hf{counter-increment:hq;min-width:0}
  body.psy-views:not(.psg) .hwrap .hgrid>.hf:has(textarea),body.psy-views:not(.psg) .hwrap .hgrid>.hf:has(.mini-chips),body.psy-views:not(.psg) .hwrap .hgrid>.hf:not(.hf-sel):has(input.input),body.psy-views:not(.psg) .hwrap .hgrid>.hf.wide{grid-column:1/-1}
  body.psy-views:not(.psg) .hwrap .hgrid>.hf>.lbl:first-child{display:flex;align-items:baseline;gap:8px;margin:0 0 4px}
  body.psy-views:not(.psg) .hwrap .hgrid>.hf>.lbl:first-child::before{content:"Q" counter(hq);flex:0 0 auto;font-size:11px;font-weight:800;color:#175cd3;background:#eef4ff;border:1px solid #cfe0fb;border-radius:6px;padding:0 6px;line-height:18px}
  body.psy-views:not(.psg) .hwrap .hgrid select.input,body.psy-views:not(.psg) .hwrap .hgrid input.input{width:100%;min-height:38px}
  body.psy-views:not(.psg) .hwrap .hgrid textarea.input{min-height:72px}
  body.psy-views:not(.psg) .hwrap .hbody{gap:14px!important}
  @media(max-width:900px){body.psy-views:not(.psg) .hwrap .hgrid{grid-template-columns:1fr!important}}
  /* detailed history: the section numbers sit in a strip at the top right, on the row of the Draft / Fill form toolbar; the form takes the full width */
  body.psy-views:not(.psg) .hrow11{display:flex;align-items:center;justify-content:space-between;gap:12px 24px;flex-wrap:wrap;width:100%}
  body.psy-views:not(.psg) .hrow11 .hist-seg{align-self:center!important;flex:0 1 auto}
  body.psy-views:not(.psg) .hwrap{grid-template-columns:minmax(0,1fr)!important;column-gap:0!important}
  body.psy-views:not(.psg) .hrow11 .hnav{position:relative;top:auto!important;display:flex!important;flex-direction:row!important;align-items:center;gap:4px;width:auto!important;min-width:0!important;max-width:100%;padding:5px 8px!important;background:#fff;border:1px solid var(--line,#e4e7ec);border-radius:99px;overflow:visible!important;box-shadow:0 1px 2px rgba(16,24,40,.04);margin-left:auto}
  body.psy-views:not(.psg) .hrow11 .hnav button{width:auto!important;display:inline-flex!important;align-items:center;justify-content:center!important;gap:5px;padding:4px 7px!important;border-radius:99px;position:relative;white-space:nowrap}
  body.psy-views:not(.psg) .hrow11 .hnav button>span:not(.hn){display:none!important}
  body.psy-views:not(.psg) .hrow11 .hnav button:hover:after,body.psy-views:not(.psg) .hrow11 .hnav button:focus-visible:after{content:attr(data-t)!important;display:block!important;position:absolute;left:auto;right:0;top:calc(100% + 10px);transform:none;background:#101828;color:#fff;font-size:12.5px;font-weight:600;padding:6px 11px;border-radius:9px;white-space:nowrap;z-index:60;pointer-events:none;box-shadow:0 8px 20px rgba(16,24,40,.22)}
  /* Admission step 5 (Form C) looks like step 1 */
  .fcT .ct-a{display:flex;gap:8px;flex-wrap:wrap}
  /* Vitals and monitoring: one table */
  .vm10{background:#fff;border:1px solid var(--line,#e4e7ec);border-radius:14px;margin-bottom:14px;overflow:hidden}
  .vm10>.hd{padding:12px 16px;border-bottom:1px solid var(--line-2,#eaecf0);display:flex;align-items:center;gap:10px;flex-wrap:wrap}
  .vm10>.hd h3{margin:0;font-size:15px}.vm10>.hd .tiny{flex:1}
  .vm10 .vscroll{overflow-x:auto}
  .vm10 table{width:100%;min-width:760px;border-collapse:collapse;font-size:13px}
  .vm10 th,.vm10 td{border:1px solid #e4e7ec;padding:7px 10px;text-align:left;vertical-align:middle}
  .vm10 th{background:#f8fafc;font-size:11px;letter-spacing:.04em;text-transform:uppercase;color:#667085;white-space:nowrap;position:sticky;top:0}
  .vm10 th small{display:block;text-transform:none;letter-spacing:0;font-weight:500;color:#98a2b3;font-size:10.5px}
  .vm10 td.d{font-weight:700;white-space:nowrap;background:#fcfcfd}
  .vm10 td.t{color:#667085;white-space:nowrap;font-size:12px}
  .vm10 tr.first td{border-top:2px solid #cfd8e3}
  .vm10 td .v{font-weight:600}.vm10 td .v.out{color:#b42318}.vm10 td.outc{background:#fef3f2}
  .vm10 td .ini{display:inline-block;margin-left:6px;font-size:10.5px;font-weight:700;color:#175cd3;background:#eff4ff;border:1px solid #c9dcfb;border-radius:99px;padding:0 6px}
  .vm10 .ml{display:flex;justify-content:space-between;gap:10px;font-size:12px}.vm10 .ml span{color:#667085}
  .vm10 .none{color:#98a2b3}
  .vm10 .ini{cursor:help;transition:background-color .12s,border-color .12s}
  .vm10 .ini:hover,.vm10 .ini:focus-visible{background:#dbe8ff;border-color:#8db5f5;outline:none}
  .vm10 .ini:focus-visible{box-shadow:0 0 0 3px rgba(23,92,211,.25)}
  /* who recorded it: hover card */
  #iniCard{position:fixed;z-index:2000;display:none;width:248px;padding:14px 16px 12px;background:#fff;border:1px solid #dfe5ee;border-radius:14px;box-shadow:0 14px 34px rgba(16,24,40,.16),0 2px 6px rgba(16,24,40,.06);pointer-events:none;opacity:0;transform:translateY(4px) scale(.98);transform-origin:var(--ax,50%) 0;transition:opacity .13s ease,transform .16s cubic-bezier(.2,.8,.3,1);font-size:13px;color:#101828}
  #iniCard[data-pos=above]{transform:translateY(-4px) scale(.98);transform-origin:var(--ax,50%) 100%}
  #iniCard.show{opacity:1;transform:none}
  #iniCard .ic-ar{position:absolute;left:calc(var(--ax,50%) - 6px);width:12px;height:12px;background:#fff;border:1px solid #dfe5ee;transform:rotate(45deg)}
  #iniCard[data-pos=below] .ic-ar{top:-7px;border-right:0;border-bottom:0}
  #iniCard[data-pos=above] .ic-ar{bottom:-7px;border-left:0;border-top:0}
  #iniCard .ic-top{display:flex;align-items:center;gap:11px}
  #iniCard .ic-av{display:grid;place-items:center;width:38px;height:38px;border-radius:50%;font-weight:700;font-size:13px;flex:0 0 38px}
  #iniCard .ic-n{font-weight:700;font-size:14.5px;line-height:1.25}
  #iniCard .ic-r{color:#667085;font-size:12.5px;margin-top:1px}
  #iniCard .ic-rec{margin-top:12px;padding:10px 12px;background:#f8fafc;border-radius:10px}
  #iniCard .ic-p{color:#667085;font-size:12px}
  #iniCard .ic-v{font-weight:700;font-size:20px;line-height:1.2;font-variant-numeric:tabular-nums;margin-top:2px}
  #iniCard .ic-v span{font-size:12px;font-weight:500;color:#667085;margin-left:4px}
  #iniCard .ic-v.out{color:#b42318}
  #iniCard .ic-w{font-size:12.5px;color:#344054;margin-top:2px}
  #iniCard .ic-flag{margin-top:8px;font-size:12px;font-weight:600;color:#b42318}
  #iniCard .ic-ft{margin-top:10px;font-size:12px;color:#667085}
  @media (prefers-reduced-motion:reduce){#iniCard{transition:none}}
  /* Treatment Management Plan: order log, done and not done */
  .tl10{border:1px solid var(--line,#e4e7ec);border-radius:12px;padding:12px 14px;margin-top:10px;background:#fff}
  .tl10.done{border-color:#abefc6;background:#f6fef9}.tl10.none{background:#fcfcfd}
  .tl10-h{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;flex-wrap:wrap}.tl10-h b{font-size:14.5px}
  .tl10-r{display:flex;align-items:center;gap:8px}
  .tl10-chip{display:inline-block;font-size:11.5px;font-weight:700;border-radius:99px;padding:2px 10px;border:1px solid transparent;white-space:nowrap}
  .tl10-chip.done{background:#ecfdf3;color:#067647;border-color:#abefc6}.tl10-chip.prog{background:#eff4ff;color:#175cd3;border-color:#c9dcfb}.tl10-chip.none{background:#f2f4f7;color:#475467;border-color:#e4e7ec}
  .tl10-sum{display:flex;gap:6px;flex-wrap:wrap}
  .tl10-bar{height:6px;background:#eef2f7;border-radius:99px;overflow:hidden;margin:10px 0 8px}.tl10-bar i{display:block;height:100%;background:#12b76a;border-radius:99px}
  .tl10-s{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:4px 18px}
  .tl10-s li{display:flex;align-items:baseline;gap:8px;font-size:13px;padding:3px 0}
  .tl10-s .b{flex:0 0 18px;font-weight:800}.tl10-s li.y .b{color:#067647}.tl10-s li.n .b{color:#98a2b3}
  .tl10-s .t{font-weight:600}.tl10-s li.n .t{color:#475467;font-weight:500}.tl10-s .who{margin-left:auto;font-size:11.5px;color:#667085;text-align:right}
  /* Therapy Plans: Record and Add sit together */
  .th10-act{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
  .th10-rec{display:inline-flex;align-items:center;gap:8px;padding-left:6px!important;border-color:#d0d5dd;transition:border-color .16s,background-color .16s,transform .1s}
  .th10-rec .rc-ic{position:relative;display:grid;place-items:center;width:24px;height:24px;border-radius:50%;background:#f2f4f7;color:#475467;transition:background-color .18s,color .18s}
  .th10-rec .rc-ic svg{grid-area:1/1;transition:opacity .15s,transform .2s}
  .th10-rec .rc-bars{grid-area:1/1;display:flex;align-items:center;gap:2px;height:12px;opacity:0;transition:opacity .15s}
  .th10-rec .rc-bars i{display:block;width:2px;height:12px;border-radius:2px;background:currentColor;transform:scaleY(.35)}
  .th10-rec:hover,.th10-rec:focus-visible{border-color:#fda29b;background:#fffbfa}
  .th10-rec:hover .rc-ic,.th10-rec:focus-visible .rc-ic{background:#fee4e2;color:#d92d20}
  .th10-rec:hover .rc-ic svg,.th10-rec:focus-visible .rc-ic svg{opacity:0;transform:scale(.7)}
  .th10-rec:hover .rc-bars,.th10-rec:focus-visible .rc-bars{opacity:1}
  .th10-rec:hover .rc-bars i,.th10-rec:focus-visible .rc-bars i{animation:rcw 1s ease-in-out infinite}
  .th10-rec .rc-bars i:nth-child(2){animation-delay:.15s!important}.th10-rec .rc-bars i:nth-child(3){animation-delay:.3s!important}.th10-rec .rc-bars i:nth-child(4){animation-delay:.45s!important}
  .th10-rec:focus-visible{outline:none;box-shadow:0 0 0 3px rgba(217,45,32,.22)}
  .th10-rec:active{transform:scale(.98)}
  @keyframes rcw{0%,100%{transform:scaleY(.3)}50%{transform:scaleY(1)}}
  @media (prefers-reduced-motion:reduce){.th10-rec .rc-bars i{animation:none!important;transform:scaleY(.7)!important}.th10-rec,.th10-rec .rc-ic,.th10-rec .rc-ic svg,.th10-rec .rc-bars{transition:none}}
  /* Patient Experience: icons */
  .pxs-hd{display:flex;align-items:center;gap:10px}.pxs-hd h4{margin:0;flex:1}
  .px10-ic{display:grid;place-items:center;width:34px;height:34px;border-radius:10px;flex:0 0 34px}
  .pxs-row dt{display:flex;align-items:center;gap:10px}
  .px10-ri{display:grid;place-items:center;width:26px;height:26px;border-radius:8px;background:#f2f4f7;color:#475467;flex:0 0 26px}.px10-ri svg{width:15px;height:15px}
  `;
  document.head.appendChild(css);

  /* ---------- 0. Type size of the live doctor portal (about 75% of the prototype's), psychiatrist and psychologist logins only ----------
     Everything on the page scales together (text, spacing, icons). Rules that are tied to the window height are divided by the scale so the
     sidebar and the pages still fill the window. Floor lead, RMO and nurse are not touched (this checks the login, not the shared workspace). */
  {
    const roleNow=(window.__TULASI__||{}).role;
    if(roleNow==='psychiatrist'||roleNow==='psychologist'){
      document.body.classList.add('px75');
      const z=document.createElement('style');z.id='px75-css';
      z.textContent=`
      body.px75{zoom:.75}
      body.px75 .app{min-height:calc(100vh/.75)}
      body.px75 .side{height:calc(100vh/.75)}
      body.px75 .modal{max-height:calc(90vh/.75)}
      body.px75 .ws-left,body.px75 .ws-right{max-height:calc(100vh/.75 - 136px)}
      body.px75 .rqueue{max-height:calc(100vh/.75 - 112px)}
      body.px75 .pr-queue{max-height:calc(100vh/.75 - 104px)}`;
      document.head.appendChild(z);
    }
  }

  /* ---------- 1. colour key and the type of a completed row ---------- */
  const KEY=`<div class="pdk" role="note" aria-label="What the coloured dots mean"><b>Key</b>
    <span><i class="red"></i>Alert <em>· needs you now</em></span>
    <span><i class="blue"></i>Medicine order <em>· to approve (countersign)</em></span>
    <span><i class="amber"></i>Due or late <em>· overdue notes, reviews, results to check</em></span>
    <span><i class="ok"></i>Action taken</span></div>`;
  function dashFix(v){
    const pd=v.querySelector('.pd');
    if(pd&&!pd.querySelector('.pdk')){
      const bar=pd.querySelector('.pd-bar');
      if(bar)bar.insertAdjacentHTML('afterend',KEY);
    }
    /* Completed actions: show the alert type the row had, not the word Done */
    v.querySelectorAll('.pd-completed .pd-t tbody tr').forEach(tr=>{
      const ty=tr.querySelector('.pd-ty');if(!ty||!/^Done$/i.test(ty.textContent.trim()))return;
      const texts=[...tr.querySelectorAll('td:nth-child(3) .pd-d span')].map(s=>s.textContent).join(' ');
      const hit=(window.pgCatOf&&pgCatOf(texts))||['Documentation','grey'];
      ty.textContent=hit[0];ty.classList.remove('red','amber','blue');if(hit[1]!=='grey')ty.classList.add(hit[1]);
    });
  }

  /* ---------- 2. Add medicine is a window, everywhere ---------- */
  function medButtons(v){
    v.querySelectorAll('button[onclick*="psyToChart("]').forEach(b=>{
      if(/^\s*(Change medicines|Add medicine)\s*$/.test(b.textContent.replace(/\s+/g,' '))||/Change medicines|Add medicine/.test(b.textContent)){
        b.setAttribute('onclick',"psyRxOpen({ctx:'orders'})");
      }
    });
  }

  /* ---------- 4. Admission step 5: Form C in the same table as step 1 ---------- */
  function formCTable(v){
    const card=[...v.querySelectorAll('section.card')].find(c=>{const h=c.querySelector('h3');return h&&/^Form C · Independent admission/.test(h.textContent.trim());});
    if(!card||card.querySelector('.ct-t'))return;
    const c=(psyPx(S.pid).consent||{})['form-c'];
    const st=c?(c.st==='esign'?'E-signed '+(c.at||'')+(c.by?' · '+c.by:''):c.st==='uploaded'?'Uploaded '+(c.at||'')+(c.file?' · '+c.file:''):'Signed '+(c.at||'')):'Not signed';
    let key='';try{CD_DATA=cdLoad();const it=cdItems(S.pid).find(i=>i.form&&i.form.id==='form-c');key=it?it.entryKey:'';}catch(e){}
    const view=key?`<button class="btn sm" onclick="psyDocPreview('${hesc(key)}')">View form</button>`:'';
    card.className='card';card.removeAttribute('style');card.id='formcCard';
    card.innerHTML=`<div class="hd"><h3>Form C · Independent admission</h3><span class="chip c-grey">Taken by front desk</span></div>
      <div class="scroll fcT"><table class="ct-t"><thead><tr><th>Form</th><th>Status</th><th></th></tr></thead><tbody><tr><td style="font-weight:600">Form C · independent admission (Mental Healthcare Act)<div class="tiny muted" style="font-weight:400;margin-top:2px">Optional at admission, based on the psychiatrist or psychologist's clinical judgement. Required again before discharge.</div></td><td><span class="cs ${c?'':'due'}">${hesc(st)}</span></td>
        <td><div class="ct-a">${view}<label class="btn sm" style="cursor:pointer">Upload signed copy<input type="file" hidden onchange="psyConsentUpload('form-c',this)"></label><button class="btn sm pri" onclick="pgFormCEsign()">Collect e-signature</button></div></td></tr></tbody></table></div>`;
  }

  window.psyFormCTable=formCTable; /* the psychologist's Admission step 5 uses the same table (called from the psychologist block) */

  /* ---------- 5. Vitals and monitoring: one table ---------- */
  const SLOT_SET=['9 am','1 pm','5 pm','9 pm'];
  const num=s=>{const m=String(s).match(/-?\d+(\.\d+)?/);return m?parseFloat(m[0]):NaN;};
  function outOfRange(title,v){
    const s=String(v||'');if(!s||s==='—')return false;
    if(/^Blood pressure/i.test(title)){const m=s.match(/(\d+)\/(\d+)/);return !!m&&(+m[1]>=140||+m[2]>=90||+m[1]<90);}
    const n=num(s);if(isNaN(n))return false;
    if(/^Pulse/i.test(title))return n>100||n<60;
    if(/^Temp/i.test(title))return n>=99.5;
    if(/^SpO2/i.test(title))return n<94;
    if(/sugar/i.test(title))return n<80||n>180;
    return false;
  }
  function readSection(sec){
    const t=sec.querySelector('table');if(!t)return null;
    const title=((sec.querySelector('.hd h3,h3')||{}).textContent||'').trim().replace(/\s*monitoring$/i,'');
    const unit=(((sec.querySelector('.hd .tiny')||{}).textContent)||'').split(' · ')[0].trim();
    let heads=[...t.querySelectorAll('thead th')].map(x=>x.textContent.trim()).slice(1);
    const byIx=heads.findIndex(h=>/^Entered by$/i.test(h));
    if(byIx>=0)heads=heads.filter((h,i)=>i!==byIx);
    const rows=[...t.querySelectorAll('tbody tr')].filter(tr=>tr.children.length>1).map(tr=>{
      const c=[...tr.children];
      let cells=c.slice(1).map(td=>{const v=td.querySelector('.v');return {v:(v?v.textContent:td.textContent).trim(),i:((td.querySelector('.ini')||{}).textContent||'').trim()};});
      if(byIx>=0)cells=cells.filter((x,i)=>i!==byIx);
      return {d:c[0].textContent.trim(),cells};
    });
    const kind=heads.length&&heads.every(h=>SLOT_SET.includes(h))?(heads.length===1?'daily':'slot'):'meal';
    return {title,unit,heads,rows,kind};
  }
  function oneTable(body){
    if(!body||body.querySelector('.vm10'))return;
    const secs=[...body.querySelectorAll('.vm9')].filter(s=>s.querySelector('table'));
    if(!secs.length)return;
    const P=secs.map(readSection).filter(Boolean);
    const slotP=P.filter(p=>p.kind==='slot'),dailyP=P.filter(p=>p.kind==='daily'),mealP=P.filter(p=>p.kind==='meal');
    let dates=[];P.forEach(p=>p.rows.forEach(r=>{if(!dates.includes(r.d))dates.push(r.d);}));
    const slots=SLOT_SET.filter(s=>slotP.some(p=>p.heads.includes(s)));
    if(!slots.length)slots.push('9 am');
    const cell=(p,d,slot)=>{const r=p.rows.find(x=>x.d===d);if(!r)return null;const ix=p.heads.indexOf(slot);return ix>=0?r.cells[ix]:null;};
    const val=(p,x,d,s)=>{if(!x||!x.v||x.v==='—')return '<span class="none">—</span>';const o=outOfRange(p.title,x.v);return `<span class="v${o?' out':''}">${hesc(x.v)}</span>${x.i?`<span class="ini" tabindex="0" data-who="${hesc(x.i)}" data-p="${hesc(p.title)}" data-u="${hesc(p.unit||'')}" data-v="${hesc(x.v)}" data-d="${hesc(d||'')}" data-s="${hesc(s||'')}" data-o="${o?1:0}" aria-label="Recorded by ${hesc(x.i)}. Press to see who.">${hesc(x.i)}</span>`:''}`;};
    const th=p=>`<th>${hesc(p.title)}${p.unit?`<small>${hesc(p.unit)}</small>`:''}</th>`;
    const head=`<tr><th>Date</th><th>Time</th>${slotP.map(th).join('')}${dailyP.map(th).join('')}${mealP.map(th).join('')}</tr>`;
    const bodyRows=dates.map(d=>slots.map((s,si)=>{
      let tr=`<tr class="${si===0?'first':''}">`;
      if(si===0)tr+=`<td class="d" rowspan="${slots.length}">${hesc(d)}</td>`;
      tr+=`<td class="t">${hesc(s)}</td>`;
      slotP.forEach(p=>{const x=cell(p,d,s);const o=x&&outOfRange(p.title,x.v);tr+=`<td${o?' class="outc"':''}>${val(p,x,d,s)}</td>`;});
      if(si===0){
        dailyP.forEach(p=>{const x=cell(p,d,'9 am');const o=x&&outOfRange(p.title,x.v);tr+=`<td rowspan="${slots.length}"${o?' class="outc"':''}>${val(p,x,d,'9 am')}</td>`;});
        mealP.forEach(p=>{const r=p.rows.find(x=>x.d===d);tr+=`<td rowspan="${slots.length}">${r?p.heads.map((h,i)=>{const x=r.cells[i]||{v:''};const o=outOfRange(p.title,x.v);return `<div class="ml"><span>${hesc(h)}</span><b class="v${o?' out':''}">${hesc(x.v||'—')}</b></div>`;}).join(''):'<span class="none">—</span>'}</td>`;});
      }
      return tr+'</tr>';
    }).join('')).join('');
    const addBtn=(secs.map(s=>[...s.querySelectorAll('button')].find(b=>/^Add reading$/i.test(b.textContent.trim()))).find(Boolean)||{}).outerHTML||'';
    const sugarNote=mealP.length?'Blood sugar target 80 to 180 mg/dL. ':'';
    const card=document.createElement('section');card.className='vm10';
    card.innerHTML=`<div class="hd"><h3>Vitals and monitoring</h3><span class="tiny muted">${sugarNote}Out of range in red. The letters are the nurse who recorded it.</span>${addBtn?addBtn.replace('class="btn sm"','class="btn sm"'):''}</div>
      <div class="vscroll"><table><thead>${head}</thead><tbody>${bodyRows||`<tr><td colspan="${2+P.length}" class="muted small">No readings in this date range.</td></tr>`}</tbody></table></div>`;
    secs[0].parentNode.insertBefore(card,secs[0]);
    secs.forEach(s=>s.remove());
  }
  const __vmr=window.psyVmRebuild;
  window.psyVmRebuild=function(p){
    const r=__vmr?__vmr.apply(this,arguments):undefined;
    try{oneTable(p&&p.querySelector&&p.querySelector('.psy-tx-body'));}catch(e){}
    return r;
  };
  const __vp70=vPatient;
  vPatient=function(sub){
    const h=__vp70.apply(this,arguments);
    if(!psy()||typeof h!=='string'||h.indexOf('vm9')<0)return h;
    try{
      const t=document.createElement('template');t.innerHTML=h;
      t.content.querySelectorAll('.psy-tx-panel').forEach(p=>{if(/^Vitals and monitoring/.test(((p.querySelector('h3')||{}).textContent||'').trim()))oneTable(p.querySelector('.psy-tx-body'));});
      return t.innerHTML;
    }catch(e){return h;}
  };

  /* ---------- 5b. Who recorded it: a card on the nurse initials (hover, keyboard focus, or tap) ---------- */
  const STAFF={SR:['Sister Rekha','Staff nurse','Night duty'],PN:['Sister Prema Nair','Staff nurse','Day duty'],AK:['Sister Anita K.','Staff nurse','Day duty'],MJ:['Brother Joseph M.','Staff nurse','Day duty']}; /* demo names */
  const TINT=[['#eaf1ff','#175cd3'],['#f4f0ff','#6941c6'],['#e8f7fb','#0e7090'],['#fef6e7','#b54708']];
  let card=null,cur=null;
  const ensureCard=()=>{if(card)return card;card=document.createElement('div');card.id='iniCard';card.setAttribute('role','tooltip');document.body.appendChild(card);return card;};
  function showIni(el){
    if(!el||!el.dataset||!el.dataset.who)return;
    const k=el.dataset.who,s=STAFF[k]||['Nurse '+k,'Ward nurse',''],ti=(k.charCodeAt(0)+k.charCodeAt(1))%TINT.length;
    const tbl=el.closest('table'),n=tbl?tbl.querySelectorAll('.ini[data-who="'+k+'"]').length:0;
    const unit=el.dataset.u?' '+el.dataset.u:'';
    const c=ensureCard();cur=el;
    c.innerHTML=`<div class="ic-top"><span class="ic-av" style="background:${TINT[ti][0]};color:${TINT[ti][1]}">${hesc(k)}</span><div class="ic-id"><div class="ic-n">${hesc(s[0])}</div><div class="ic-r">${hesc(s[1])}${s[2]?', '+hesc(s[2]):''}</div></div></div>
      <div class="ic-rec"><div class="ic-p">Recorded ${hesc(el.dataset.p)}</div><div class="ic-v${el.dataset.o==='1'?' out':''}">${hesc(el.dataset.v)}<span>${hesc(unit)}</span></div><div class="ic-w">${hesc(el.dataset.d)}${el.dataset.s?' at '+hesc(el.dataset.s):''}</div>${el.dataset.o==='1'?'<div class="ic-flag">Outside the usual range</div>':''}</div>
      <div class="ic-ft">${n} reading${n===1?'':'s'} by ${hesc(s[0].split(' ').slice(0,2).join(' '))} in this table</div><i class="ic-ar"></i>`;
    c.classList.remove('show');c.style.left='0px';c.style.top='0px';c.style.visibility='hidden';c.style.display='block';
    const r=el.getBoundingClientRect(),w=c.offsetWidth,h=c.offsetHeight,vw=document.documentElement.clientWidth,vh=window.innerHeight;
    let left=Math.max(10,Math.min(r.left+r.width/2-w/2,vw-w-10)),below=r.bottom+12+h<=vh||r.top-12-h<0,top=below?r.bottom+10:r.top-10-h;
    c.dataset.pos=below?'below':'above';c.style.setProperty('--ax',Math.max(14,Math.min(w-14,r.left+r.width/2-left))+'px');
    c.style.left=left+'px';c.style.top=top+'px';c.style.visibility='';
    requestAnimationFrame(()=>c.classList.add('show'));
  }
  function hideIni(){if(card){card.classList.remove('show');card.style.display='none';}cur=null;}
  document.addEventListener('mouseover',e=>{const t=e.target.closest&&e.target.closest('.vm10 .ini');if(t)showIni(t);});
  document.addEventListener('mouseout',e=>{const t=e.target.closest&&e.target.closest('.vm10 .ini');if(t&&!(e.relatedTarget&&t.contains(e.relatedTarget)))hideIni();});
  document.addEventListener('focusin',e=>{const t=e.target.closest&&e.target.closest('.vm10 .ini');if(t)showIni(t);});
  document.addEventListener('focusout',e=>{if(e.target.closest&&e.target.closest('.vm10 .ini'))hideIni();});
  document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('.vm10 .ini');if(t){if(cur===t)hideIni();else showIni(t);}else if(card&&!card.contains(e.target))hideIni();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')hideIni();});
  window.addEventListener('scroll',hideIni,true);

  /* ---------- 6. Management Plan: filled once at admission, so it opens read only ---------- */
  const MP=[['dx','Diagnosis'],['goals','Goals of treatment'],['meds','Medicines and why'],['therapy','Therapies planned'],['risk','Risk management'],['mon','Monitoring'],['stay','Expected length of stay'],['dc','Plan for discharge'],['rev','Review date']];
  window.psyMpView=function(v){S.mpView=v;render();};
  const __pl=pPlans;
  pPlans=function(){
    if(!psy())return __pl.apply(this,arguments);
    const m=psyPx(S.pid).mgmt||{},filled=!!(m.dx||m.goals||m.meds);
    const mode=S.mpView||(filled?'read':'form');
    const seg=`<div class="seg" style="align-self:flex-start;min-width:240px;margin-bottom:12px"><button class="${mode==='read'?'on':''}" onclick="psyMpView('read')">Read only</button><button class="${mode==='form'?'on':''}" onclick="psyMpView('form')">Fill form</button></div>`;
    if(mode==='form')return seg+__pl.apply(this,arguments);
    const rv=(l,t)=>`<div class="box small"><div class="lbl">${l}</div><div style="margin-top:4px;white-space:pre-wrap">${t?hesc(t):'<span class="muted">Not filled in</span>'}</div></div>`;
    const st=m.signed?`<span class="small" style="color:#067647;font-weight:600">Signed ${hesc(m.signed.at)} · ${hesc(m.signed.by)}</span>`:`<span class="small muted">${filled?'Not signed yet':'Not filled in yet'}</span>`;
    return seg+`<section class="card"><div class="hd"><div><h3>Management Plan</h3><div style="margin-top:4px">${st}</div></div>${m.signed?`<button class="btn sm" onclick="psyMpAdd()">Add addendum</button>`:''}</div>
      <div class="pad grid2">${MP.map(([k,l])=>rv(l,m[k])).join('')}</div>
      ${(m.add||[]).map(a=>`<div class="small" style="margin:0 20px 12px;padding:8px 10px;background:#f3f7ff;border-radius:8px"><b>Addendum by ${hesc(a.by)}, ${hesc(a.at)}:</b> ${hesc(a.t)}</div>`).join('')}
      <div class="pad small muted">Filled once when the patient is admitted. Switch to Fill form to change it.</div></section>`;
  };

  /* ---------- 7. Treatment Management Plan: no consents list (they are in Admission forms), and a log that shows done and not done ---------- */
  function tmpLog(p){
    const body=p.querySelector('.psy-tx-body');if(!body)return;
    const old=body.querySelector('.tm9-log');if(!old||old.dataset.l10)return;
    /* everything after the order log (the Consents label and table) goes */
    let n=old.nextElementSibling;while(n){const m=n.nextElementSibling;n.remove();n=m;}
    let D;try{D=window.psyTmpOrders();}catch(e){return;}
    const O=D.list||[];
    const st=o=>{const d=D.done(o),t=o.steps.length;return d===t?['done','Done']:d?['prog','In progress']:['none','Not started'];};
    const tot={done:0,prog:0,none:0};O.forEach(o=>tot[st(o)[0]]++);
    const row=o=>{
      const [c,l]=st(o),d=D.done(o),t=o.steps.length,def=D.defs[o.key]||{t:o.key};
      const next=o.steps.findIndex(s=>!s.done);
      return `<div class="tl10 ${c}"><div class="tl10-h"><div><b>${hesc(def.t)}</b><div class="tiny muted">Ordered by ${hesc(o.by)} · ${hesc(o.at)}</div></div>
        <div class="tl10-r"><span class="tl10-chip ${c}">${l} · ${d} of ${t}</span><button class="btn sm" onclick="psyTmOpen('${o.id}',${Math.max(0,next)})">${c==='done'?'View':'Open'}</button></div></div>
        <div class="tl10-bar" aria-hidden="true"><i style="width:${Math.round(d/t*100)}%"></i></div>
        <ul class="tl10-s">${o.steps.map(s=>`<li class="${s.done?'y':'n'}"><span class="b">${s.done?'✓':'○'}</span><span class="t">${hesc(s.n)}</span><span class="who">${hesc(s.role)}${s.done?' · done '+hesc(s.by||'')+(s.at?', '+hesc(s.at):''):' · not done'}</span></li>`).join('')}</ul></div>`;
    };
    const sec=document.createElement('section');sec.className='card tm9-log';sec.dataset.l10='1';
    sec.innerHTML=`<div class="hd"><div><h3>Order log</h3><div class="small muted" style="margin-top:4px">What was ordered, and which tasks are done and which are not yet.</div></div>${O.length?`<div class="tl10-sum"><span class="tl10-chip done">${tot.done} done</span><span class="tl10-chip prog">${tot.prog} in progress</span><span class="tl10-chip none">${tot.none} not started</span></div>`:''}</div>
      <div style="padding:4px 16px 16px">${O.length?O.map(row).join(''):'<div class="muted small" style="padding:8px 4px">Nothing ordered yet.</div>'}</div>`;
    old.replaceWith(sec);
  }

  /* ---------- 8. Rounds: assign assessments to the psychologist ---------- */
  const MODS=(window.pgMpLists&&pgMpLists.MODS)||['PHQ-9 (depression)','GAD-7 (anxiety)','BDI-II','BAI','Y-BOCS (OCD)','HAM-D','HAM-A','PANSS','MoCA','MMSE','Rosenberg self-esteem','WHO-5 well-being'];
  const asgPid=()=>{try{return scribePt().id;}catch(e){return S.pid;}};
  /* the patient's own psychologist is the default; the doctor can pick another one */
  const treating=pid=>{try{return (PSYCHOF&&PSYCHOF[pid])||'';}catch(e){return '';}};
  const PSYCHS=()=>{const s=new Set(['Priya Nair','Kiran Mehra']);try{Object.keys(PSYCHOF).forEach(k=>{if(PSYCHOF[k])s.add(PSYCHOF[k]);});}catch(e){}return [...s];};
  const asgTo=pid=>((S.asgTo||{})[pid])||treating(pid);
  window.psyAsgWho=function(v){S.asgTo=S.asgTo||{};S.asgTo[asgPid()]=v;render();};
  window.psyAsgAdd=function(v){
    if(!v)return;const pid=asgPid(),to=asgTo(pid);
    if(!to){toast('Choose the psychologist first');render();return;}
    const x=psyPx(pid);x.assignedAssess=x.assignedAssess||[];
    if(x.assignedAssess.some(a=>a.name===v))return;
    x.assignedAssess.unshift({name:v,to,by:signer(),at:atNow(),status:'Assigned'});
    /* the psychologist sees it under Planned assessments in the psychologist's management plan */
    const m=x.mgmtPsych=x.mgmtPsych||{};m.assess=m.assess||[];if(!m.assess.includes(v))m.assess.push(v);
    render();toast(v.replace(/ \(.*\)/,'')+' assigned to '+to);
  };
  window.psyAsgDel=function(i){const x=psyPx(asgPid());(x.assignedAssess||[]).splice(i,1);render();};
  const assessCard=()=>{
    const pid=asgPid(),L=(psyPx(pid).assignedAssess||[]),own=treating(pid),to=asgTo(pid);
    const who=`<label class="field" style="margin:0"><span class="lbl" style="margin-bottom:6px">Psychologist</span><select class="input" aria-label="Psychologist to assign to" onchange="psyAsgWho(this.value)">${to?'':'<option value="">Choose a psychologist…</option>'}${PSYCHS().map(n=>`<option value="${hesc(n)}" ${n===to?'selected':''}>${hesc(n)}${n===own?' (treating psychologist)':''}</option>`).join('')}</select></label>`;
    const what=`<label class="field" style="margin:0"><span class="lbl" style="margin-bottom:6px">Assessment</span><select class="input" aria-label="Assign an assessment" onchange="psyAsgAdd(this.value)"><option value="">Choose an assessment…</option>${MODS.filter(m=>!L.some(a=>a.name===m)).map(m=>`<option>${hesc(m)}</option>`).join('')}</select></label>`;
    return `<section class="card" id="asgCard"><div class="hd"><h3>Assessments</h3>${L.length?chip(L.length+' assigned','c-blue'):''}</div>
      <div style="padding:12px 20px 16px;border-top:1px solid var(--line-2)">
        <div class="small muted" style="margin-bottom:10px">${own?`Goes to the treating psychologist, ${hesc(own)}, unless you pick someone else.`:'This patient has no treating psychologist yet. Choose who should do the assessment.'}</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px">${who}${what}</div>
        ${L.map((a,i)=>`<div class="pr-lo9" style="margin-top:10px"><div class="pr-lo9-h"><span><b>${hesc(a.name)}</b><span class="tiny muted" style="display:block">For ${hesc(a.to||own||'the psychologist')} · assigned by ${hesc(a.by)} · ${hesc(a.at)}${a.status==='Done'?` · <b style="color:#067647">done by ${hesc(a.doneBy||'')}, ${hesc(a.doneAt||'')}</b>`:''}</span></span><button class="x" aria-label="Remove ${hesc(a.name)}" onclick="psyAsgDel(${i})">×</button></div></div>`).join('')}
      </div></section>`;
  };
  const __rm70=roundMon;
  roundMon=function(){
    const h=__rm70.apply(this,arguments);
    /* the psychologist's Rounds is drawn through this code too; the psychologist does not assign assessments */
    if(!psy()||document.body.classList.contains('psg')||typeof h!=='string')return h;
    try{return h+assessCard();}catch(e){return h;}
  };

  /* ---------- 9. Therapy Plans: one plus sign on Add, and an AI scribe Record button beside it ---------- */
  const MIC='<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>';
  window.psyThRecord=function(k){
    if(typeof psyThAdd!=='function'||typeof scribeForm!=='function')return;
    psyThAdd(k);
    const m=$('modal'),title=((m.querySelector('h3')||{}).textContent||'Therapy plans').replace(/^Add\s*·\s*/,'');
    const fields=[...m.querySelectorAll('[id^="th9_"]')].filter(e=>e.id!=='th9_date').map(e=>({key:e.id.replace('th9_',''),label:((e.closest('label')||document).querySelector('.lbl')||{}).textContent||e.id,type:e.tagName==='SELECT'?'one':'text',options:e.tagName==='SELECT'?[...e.options].map(o=>o.text):undefined}));
    const pt=(window.ptFind&&ptFind(S.pid))||{name:''};
    closeModal();
    scribeForm({title:title+' · '+pt.name,form:'Therapy plan entry: '+title,context:pt.name+', '+title,fields,
      apply:v=>{psyThAdd(k);Object.keys(v).forEach(id=>{const el=$('th9_'+id);if(el)el.value=Array.isArray(v[id])?v[id].join(', '):v[id];});},cancel:()=>{}});
  };
  function therapyBtns(v){
    v.querySelectorAll('button[onclick^="psyThAdd("]').forEach(b=>{
      const t=b.textContent.replace(/\s+/g,' ').trim();
      if(b.querySelector('svg')&&/^\+\s*/.test(t)){const tn=[...b.childNodes].reverse().find(n=>n.nodeType===3&&/\S/.test(n.nodeValue));if(tn)tn.nodeValue=' '+tn.nodeValue.replace(/^\s*\+\s*/,'');}
      const m=(b.getAttribute('onclick')||'').match(/psyThAdd\('(\w+)'\)/);
      if(m&&!b.parentElement.querySelector('.th10-rec')){
        const w=document.createElement('div');w.className='th10-act';b.parentNode.insertBefore(w,b);
        w.insertAdjacentHTML('beforeend',`<button type="button" class="btn sm th10-rec" onclick="psyThRecord('${m[1]}')" aria-label="Record with the AI scribe"><span class="rc-ic" aria-hidden="true">${MIC}<span class="rc-bars"><i></i><i></i><i></i><i></i></span></span><span>Record with AI scribe</span></button>`);
        w.appendChild(b);
      }
    });
  }

  /* ---------- 10. Patient Experience: icons ---------- */
  const IC=p=>`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
  const PX_ICONS={
    diet:IC('<path d="M7 3v8a2 2 0 0 0 2 2v8M5 3v5M9 3v5M17 3c-2 1-3 3.5-3 6s1 3 3 3v9"/>'),
    calls:IC('<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>'),
    visitors:IC('<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6M16 4.5a3.5 3.5 0 0 1 0 7M18 14c2.2.6 3.5 2.4 3.5 5"/>'),
    room:IC('<path d="M3 18V7M3 14h18v4M21 14v-2a3 3 0 0 0-3-3h-7v5"/><circle cx="7" cy="11" r="2"/>'),
    act:IC('<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>'),
    comm:IC('<path d="M21 12a8 8 0 0 1-11.6 7.1L3 21l1.9-6.3A8 8 0 1 1 21 12z"/>'),
    other:IC('<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h3"/>'),
    grv:IC('<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>')
  };
  const rowIcon=l=>{
    l=l.toLowerCase();
    if(/diet type/.test(l))return IC('<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10z"/><path d="M2 21c0-3 1.9-5.6 5-6.5"/>');
    if(/allerg|avoid/.test(l))return IC('<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0zM12 9v4M12 17h.01"/>');
    if(/like|dislike|fasting/.test(l))return IC('<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z"/>');
    if(/phone|call/.test(l))return PX_ICONS.calls;
    if(/visit/.test(l))return PX_ICONS.visitors;
    if(/room$|^room/.test(l)&&!/mate/.test(l))return PX_ICONS.room;
    if(/roommate/.test(l))return PX_ICONS.visitors;
    if(/belong/.test(l))return IC('<rect x="3" y="11" width="18" height="10" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>');
    if(/gym|walk/.test(l))return IC('<path d="M6.5 6.5v11M17.5 6.5v11M3 9v6M21 9v6M6.5 12h11"/>');
    if(/activit/.test(l))return PX_ICONS.act;
    if(/outing/.test(l))return IC('<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>');
    if(/language/.test(l))return IC('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>');
    if(/clinical updates/.test(l))return IC('<path d="m22 2-7 20-4-9-9-4 20-7z"/><path d="M22 2 11 13"/>');
    if(/billing|payment/.test(l))return IC('<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>');
    if(/not share|do not/.test(l))return IC('<circle cx="12" cy="12" r="9"/><path d="m5.6 5.6 12.8 12.8"/>');
    if(/relig|cultur/.test(l))return IC('<path d="M12 3l1.9 5.6L19.5 10l-4.6 3.4 1.8 5.6L12 15.8 7.3 19l1.8-5.6L4.5 10l5.6-1.4z"/>');
    if(/routine/.test(l))return IC('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>');
    return IC('<circle cx="12" cy="12" r="1.5"/><circle cx="5" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>');
  };
  const secIcon=t=>{t=t.toLowerCase();return /diet/.test(t)?['#fef6e7','#b54708',PX_ICONS.diet]:/calls/.test(t)?['#eef4ff','#175cd3',PX_ICONS.calls]:/visitor/.test(t)?['#f4f0ff','#6941c6',PX_ICONS.visitors]:/room/.test(t)?['#ecfdf3','#067647',PX_ICONS.room]:/activit/.test(t)?['#fff1f3','#c01048',PX_ICONS.act]:/communication/.test(t)?['#e8f7fb','#0e7090',PX_ICONS.comm]:/other/.test(t)?['#f2f4f7','#475467',PX_ICONS.other]:['#fef3f2','#b42318',PX_ICONS.grv];};
  function pxIcons(v){
    v.querySelectorAll('.pxs-card').forEach(c=>{
      if(c.dataset.ic)return;c.dataset.ic='1';
      const h=c.querySelector('.pxs-hd h4');
      if(h){const [bg,fg,svg]=secIcon(h.textContent);h.insertAdjacentHTML('beforebegin',`<span class="px10-ic" style="background:${bg};color:${fg}">${svg}</span>`);}
      c.querySelectorAll('.pxs-row dt').forEach(dt=>{dt.insertAdjacentHTML('afterbegin',`<span class="px10-ri">${rowIcon(dt.textContent)}</span>`);});
    });
  }

  /* ---------- 12. Daily notes filters like the psychologist's: no Today or Yesterday; Last 7 days and Last 1 month ---------- */
  const __pd70=pDaily;
  pDaily=function(){
    if(!psy())return __pd70.apply(this,arguments);
    let h;window.__pgIn=true; /* switches on the "Last 1 month" filter of the shared note list */
    try{h=__pd70.apply(this,arguments);}finally{window.__pgIn=false;}
    if(typeof h!=='string')return h;
    const t=document.createElement('template');t.innerHTML=h;const R=t.content;
    R.querySelectorAll('button.tog').forEach(b=>{if(/^(Today|Yesterday)$/.test(b.textContent.trim()))b.remove();});
    const wk=[...R.querySelectorAll('button.tog')].find(b=>/^Last 7 days$/.test(b.textContent.trim()));
    if(wk&&!R.querySelector('[data-pg-month]'))wk.insertAdjacentHTML('afterend',`<button class="tog ${S.dnWhen==='month'?'on':''}" data-pg-month="1" onclick="psyDnWhen('month')">Last 1 month</button>`);
    return t.innerHTML;
  };

  /* ---------- 11. "Family call due now" looks the same on every patient tab (the tinted card with the phone icon) ---------- */
  function famCallCard(v){
    const c=v.querySelector('#famCallDue');if(!c||/\bfc9\b/.test(c.className))return;
    const g=c.querySelector('.li .grow');if(!g)return;
    const ti=g.children[0]?g.children[0].textContent:'',su=g.children[1]?g.children[1].textContent:'';
    const btns=[...c.querySelectorAll('.li button')].map(b=>b.outerHTML).join('');
    const ph='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/></svg>';
    const n=document.createElement('section');n.id='famCallDue';n.className='fc9';
    n.innerHTML=`<div class="fc9-ic">${ph}</div><div class="fc9-b"><div class="fc9-k"><i style="animation-delay:-${Date.now()%1600}ms"></i>Family call due now</div><div class="fc9-t">${hesc(ti)}</div><div class="fc9-s">${hesc(su)}</div></div><div class="fc9-a">${btns}</div>`;
    c.replaceWith(n);
  }

  /* detailed history: put the section numbers in the toolbar row */
  function histNav(v){
    const seg=v.querySelector('.hist-seg'),nav=v.querySelector('.hwrap .hnav');
    if(!seg||!nav||seg.parentElement.classList.contains('hrow11'))return;
    const row=document.createElement('div');row.className='hrow11';
    seg.parentNode.insertBefore(row,seg);row.appendChild(seg);row.appendChild(nav);
  }

  const __r=render;
  render=function(){
    const out=__r.apply(this,arguments);
    try{
      if(psy()){
        const v=$('view');
        if(v){
          famCallCard(v);histNav(v);
          /* Daily notes filters: the same animated segmented controls as the psychologist's */
          if(window.pgUpgradeFilters)v.querySelectorAll('.psy-dn-filter-row').forEach(window.pgUpgradeFilters);
          dashFix(v);medButtons(v);if(S.admSec==='formc')formCTable(v);
          therapyBtns(v);pxIcons(v);
          v.querySelectorAll('.psy-tx-panel').forEach(p=>{if(/^Treatment Management Plan/.test(((p.querySelector('h3')||{}).textContent||'').trim()))tmpLog(p);});
        }
      }
    }catch(e){}
    return out;
  };

  /* ---------- 3. file viewer: view and print only ---------- */
  const __ps=pastSummary,__pf=pastFile;
  function patchModal(i){
    const m=$('modal');if(!m)return;
    m.querySelectorAll('button').forEach(b=>{
      const t=b.textContent.trim();
      if(/^Download/i.test(t)){
        b.textContent='Print';b.setAttribute('onclick','psyPastPdf('+i+')');
      }
    });
    const c=m.querySelector('.callout');
    if(c&&!/View only/.test(c.textContent))c.insertAdjacentHTML('afterend','<div class="tiny muted" style="margin-top:8px">View only. You can print this file, but it is not saved on your computer.</div>');
  }
  pastSummary=function(i){
    const r=__ps.apply(this,arguments);
    if(psyOrPg())patchModal(i||0);
    return r;
  };
  pastFile=function(i){
    const r=__pf.apply(this,arguments);
    if(psyOrPg())patchModal(i||0);
    return r;
  };

  /* ---------- 14. Add treatment modality: the team's list of eleven (Anu, 11 Nov) ----------
     Long acting injections opens three choices (Risperidone, Paliperidone, Olanzapine). Each one opens the same "Plan for" window as before
     (tick the consent, the tests and the team tasks to create). The consent and task wording is a starter the team will confirm. */
  const LAI=['Risperidone','Paliperidone','Olanzapine'];
  const MODS14=[
    ['Clozapine','Consent, CBC and monitoring'],
    ['Long acting injections','Risperidone, Paliperidone or Olanzapine'],
    ['Injection consent','For emergencies and when oral medicines are refused'],
    ['ECT','Consent, fitness and monitoring'],
    ['Ketamine therapy','Consent and monitoring'],
    ['Ketamine assisted psychotherapy','Consent, monitoring and therapy sessions'],
    ['dTMS','Consent, screening and sessions'],
    ['Biofeedback','Referral and sessions'],
    ['Cognitive retraining','Baseline assessment and sessions'],
    ['Diazepam consent','Consent and monitoring'],
    ['Naltrexone consent','Consent, liver tests and opioid-free check']];
  const laiPlan=d=>({consent:'Long acting injection consent · '+d,tests:d==='Paliperidone'?[['RFT','This week'],['Lipid profile','This week']]:[['LFT','This week'],['Lipid profile','This week']],
    tasks:['Check the oral '+d.toLowerCase()+' was tolerated before the first injection','Set the date of the next injection'].concat(d==='Olanzapine'?['Watch the patient for 3 hours after each injection (post-injection sedation or delirium)']:[])});
  const PLANS14={
    'Clozapine':{consent:'Clozapine consent (patient and relative)',tests:[['CBC','Today']],tasks:['Weekly blood count (ANC) for the first 18 weeks','Baseline ECG and weight']},
    'Injection consent':{consent:'Injection consent: in case of emergency and when oral medicines are refused (patient and relative)',tests:[],tasks:['Record every injection given because oral medicines were refused or in an emergency, with the reason']},
    'ECT':{consent:'ECT consent (patient and relative)',tests:[['ECG','Today'],['CBC','Today'],['RFT','Today']],tasks:['Pre-ECT work-up: anaesthetist review','Nil by mouth from midnight before the session']},
    'Ketamine therapy':{consent:'Ketamine treatment consent',tests:[['ECG','Today']],tasks:['Blood pressure and pulse before and after each session','Nothing to eat or drink before each session, as the anaesthetist advises']},
    'Ketamine assisted psychotherapy':{consent:'Ketamine assisted psychotherapy consent',tests:[['ECG','Today']],tasks:['Book the psychologist for the preparation, dosing and integration sessions','Blood pressure and pulse before and after each session']},
    'dTMS':{consent:'dTMS consent',tests:[],tasks:['Screen for contraindications (metal implants, seizure history)','Schedule the sessions']},
    'Biofeedback':{consent:'',tests:[],tasks:['Refer to the psychologist for biofeedback','Schedule the sessions']},
    'Cognitive retraining':{consent:'',tests:[],tasks:['Baseline cognitive assessment by the psychologist','Schedule the retraining sessions']},
    'Diazepam consent':{consent:'Diazepam consent (patient and relative)',tests:[],tasks:['Record the reason, dose and how long diazepam will be given','Watch for sedation and slow breathing after each dose']},
    'Naltrexone consent':{consent:'Naltrexone consent (patient and relative)',tests:[['LFT','Today'],['Urine drug screen','Today']],tasks:['Confirm the patient is opioid-free before the first dose']}};
  LAI.forEach(d=>{PLANS14['Long acting injection · '+d]=laiPlan(d);});
  let PLAN14='';
  const __pm14=window.prModalityOpen;
  window.prModalityOpen=function(){
    if(!psy())return __pm14?__pm14.apply(this,arguments):undefined;
    openModal('<div class="mh"><h3>Add treatment modality</h3><button class="x" aria-label="Close" onclick="closeModal()">×</button></div><div class="mb"><div class="small muted" style="margin-bottom:10px">Pick one. You then choose which linked tasks to create.</div><div class="pr-mod">'
      +MODS14.map(m=>'<button onclick="'+(m[0]==='Long acting injections'?'prModalityLai()':"closeModal();psyPlanOpen('"+m[0]+"')")+'"><span>'+hesc(m[0])+'</span><span class="tiny muted" style="font-weight:400">'+hesc(m[1])+'</span></button>').join('')+'</div></div>');
  };
  window.prModalityLai=function(){
    openModal('<div class="mh"><h3>Long acting injections</h3><button class="x" aria-label="Close" onclick="closeModal()">×</button></div><div class="mb"><div class="small muted" style="margin-bottom:10px">Which injection?</div><div class="pr-mod">'
      +LAI.map(d=>'<button onclick="closeModal();psyPlanOpen(\'Long acting injection · '+d+'\')"><span>'+d+'</span><span class="tiny muted" style="font-weight:400">Consent and schedule</span></button>').join('')
      +'</div></div><div class="mf"><button class="btn" onclick="prModalityOpen()">‹ Back</button></div>');
  };
  const __po14=window.psyPlanOpen,__pc14=window.psyPlanCreate;
  window.psyPlanOpen=function(kind){
    const P=PLANS14[kind];if(!psy()||!P)return __po14?__po14.apply(this,arguments):undefined;
    PLAN14=kind;
    openModal(`<div class="mh"><h3>Plan for ${hesc(kind)}</h3><button class="x" aria-label="Close" onclick="closeModal()">×</button></div>
      <div class="mb"><div class="small muted">Tick what to create. These are starter tasks; the team will define the full algorithm for each plan later.</div>
        ${P.consent?`<label class="rx-m" style="display:flex;gap:8px;align-items:flex-start"><input type="checkbox" id="pl_c" checked><span><b>Take consent</b> · ${hesc(P.consent)}<div class="tiny muted">A request goes to the front desk to take the family's signature.</div></span></label>`:''}
        ${P.tests.length?`<div class="lbl" style="margin-top:8px">Blood tests and investigations</div>${P.tests.map((t,i)=>`<label class="row small" style="gap:8px;margin:4px 0"><input type="checkbox" id="pl_t${i}" checked>${hesc(t[0])} <span class="muted">· ${hesc(t[1])}</span></label>`).join('')}`:''}
        <div class="lbl" style="margin-top:8px">Tasks for the team</div>
        ${P.tasks.map((t,i)=>`<label class="row small" style="gap:8px;margin:4px 0"><input type="checkbox" id="pl_k${i}" checked>${hesc(t)}</label>`).join('')}</div>
      <div class="mf"><button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri big" onclick="psyPlanCreate()">Create tasks</button></div>`);
  };
  window.psyPlanCreate=function(){
    const P=PLANS14[PLAN14];if(!psy()||!P)return __pc14?__pc14.apply(this,arguments):undefined;
    const R=S.rounds,w=whoAt();let n=0;R.inv=R.inv||[];R.adv=R.adv||[];
    const c=$('pl_c');if(P.consent&&c&&c.checked){S.consents.push({name:P.consent,who:'Family',st:'Requested from front desk by '+w.by+' · '+w.at+' · plan for '+PLAN14,c:'c-amber'});n++;}
    P.tests.forEach((t,i)=>{const b=$('pl_t'+i);if(b&&b.checked&&!R.inv.some(y=>y[0]===t[0])){R.inv.push([t[0],t[1]]);n++;}});
    P.tasks.forEach((t,i)=>{const b=$('pl_k'+i);if(b&&b.checked){R.adv.push({to:'Nursing staff',ty:'Other',text:PLAN14+': '+t,until:'Until the plan is done',inform:'No one extra',by:signer()});n++;}});
    const x=psyPx(S.pid);x.plans=x.plans||[];x.plans.unshift({kind:PLAN14,by:signer(),at:atNow()});
    closeModal();render();toast('Plan for '+PLAN14+': '+n+' task'+(n===1?'':'s')+' created. Tests and team tasks go out when you save the round.');
  };

  /* ---------- 13. Handover details pop-up: Differential diagnosis and Medical or surgical comorbidity come from the record ----------
     Order: what the handover page already holds, then the detailed history, then what the record says (the diagnosis; medicines, abnormal results and allergies). */
  const DDX_BY_DX=[[/bipolar/i,'Schizoaffective disorder; substance-induced mood disorder; borderline personality disorder'],[/schizo/i,'Schizoaffective disorder; substance-induced psychosis; delusional disorder'],
    [/psychotic/i,'Substance-induced psychosis; mood disorder with psychotic features; organic cause'],[/depress/i,'Bipolar affective disorder, depressive episode; adjustment disorder; thyroid or vitamin deficiency'],
    [/obsess|ocd/i,'Obsessive-compulsive personality disorder; psychotic disorder with obsessions; autism spectrum condition'],[/alcohol/i,'Withdrawal from another substance; delirium of another cause; hepatic encephalopathy'],
    [/opioid/i,'Polysubstance use; opioid-induced mood disorder'],[/cannabis/i,'Cannabis-induced psychosis; primary psychotic disorder'],[/anorexia/i,'Bulimia nervosa; avoidant restrictive food intake disorder; depressive disorder with weight loss']];
  const MED_COM=[[/metformin|glimepiride|insulin/i,'Diabetes'],[/thyroxine/i,'Hypothyroidism'],[/amlodipine|telmisartan|atenolol|losartan/i,'Hypertension'],[/atorvastatin|rosuvastatin/i,'Raised cholesterol'],[/pantoprazole|omeprazole/i,'Acid reflux']];
  const hxRow=re=>{try{if(typeof HREAD!=='undefined'){const r=HREAD.find(a=>re.test(String(a[0])));if(r)return Array.isArray(r[1])?r[1].join('; '):String(r[1]||'');}}catch(e){}return '';};
  const hoNote=pid=>{try{return ((S.psyHO&&S.psyHO.ui&&S.psyHO.ui.notes)||{})[pid]||{};}catch(e){return {};}};
  function recordDdx(pid){
    const dx=(()=>{try{const c=ptCtxOf(pid),p=ptFind(pid);return (c&&c.dx)||(p&&p.dx)||'';}catch(e){return '';}})();
    const n=hoNote(pid).ddx,same=String(n||'').trim().toLowerCase()===String(dx).trim().toLowerCase(); /* the handover page copies the diagnosis here; that is not a differential */
    if(String(n||'').trim()&&!same)return {text:String(n),src:'record'};
    if(pid==='neel'){const v=hxRow(/differential diagnos|diagnostic formulation/i);if(v)return {text:v,src:'record'};}
    const hit=DDX_BY_DX.find(x=>x[0].test(dx));
    return hit?{text:hit[1],src:'suggested'}:{text:'',src:''};
  }
  function recordComorb(pid){
    const n=hoNote(pid).comorb;if(String(n||'').trim())return {text:String(n),src:'record'};
    if(pid==='neel'){const v=hxRow(/^Past history|past medical or surgical/i);if(v)return {text:v,src:'record'};}
    const out=[];
    try{
      const c=ptCtxOf(pid)||{};
      (c.meds||[]).forEach(m=>{const hit=MED_COM.find(x=>x[0].test(String(m.name)));if(hit&&!out.some(o=>o.startsWith(hit[1])))out.push(hit[1]+' (on '+String(m.name).replace(/\s*·.*$/,'')+')');});
    }catch(e){}
    try{
      const s=typeof v3==='function'?v3():null;
      ((s&&s.labs)||[]).filter(l=>l.pid===pid&&V3.labFlag(l)!=='ok').forEach(l=>out.push(l.test+' '+(l.val>l.hi?'high':'low')+' ('+l.val+')'));
    }catch(e){}
    try{const al=psyPx(pid).allergy;if(al&&al.list&&al.list.length)out.push('Drug allergy: '+al.list.map(i=>i.drug).join(', '));}catch(e){}
    return {text:out.length?out.join('\n'):'No medical or surgical comorbidity recorded',src:'record'};
  }
  const __hd=window.psyHvDetail;
  if(typeof __hd==='function')window.psyHvDetail=function(pid){
    const r=__hd.apply(this,arguments);
    try{
      const u=S.psyHO&&S.psyHO.ui;if(!u||!u.det||!u.det[pid])return r;
      const d=u.det[pid];
      [['ddx',recordDdx(pid)],['comorb',recordComorb(pid)]].forEach(([k,rec])=>{
        const ta=$('hvD-'+k);if(!ta||!rec.text)return;
        if(!String(d[k]||'').trim()){d[k]=rec.text;ta.value=rec.text;}
        const lbl=ta.parentElement&&ta.parentElement.querySelector('.lbl');
        if(lbl&&!lbl.querySelector('.hn-tag')&&String(d[k]||'')===rec.text)lbl.insertAdjacentHTML('beforeend',' <span class="hn-tag rec">'+(rec.src==='suggested'?'Suggested from the diagnosis. Check it.':'From the record')+'</span>');
      });
    }catch(e){}
    return r;
  };
})();
