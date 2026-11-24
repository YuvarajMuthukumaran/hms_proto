const fs=require('fs');const f='public/legacy/js/194-therapy-plans-redesign-24nov-js.js';
let s=fs.readFileSync(f,'utf8').replace(/\r\n/g,'\n');
const R=(a,b)=>{const p=s.split(a);if(p.length!==2)throw new Error('match '+p.length+': '+a.slice(0,60));s=p.join(b);};
R("const gClick=(pid,i)=>PSY&&typeof window.tpGoal==='function'?` tp4-click\" role=\"button\" tabindex=\"0\" title=\"Edit or log this goal\" onclick=\"tpGoal('${Q(pid)}',${+i})\"`:'\"';",
"const gClick=(pid,i)=>PSY&&typeof window.tpGoal==='function'?` tp4-click\" role=\"button\" tabindex=\"0\" title=\"Edit or log this goal\" onclick=\"tpGoal('${Q(pid)}',${+i})\"`:` tp4-click\" role=\"button\" tabindex=\"0\" title=\"See this goal's history\" onclick=\"tp4Goal('${Q(pid)}',${+i})\"`;");
R("Signed and locked. Read only.</div>","Signed and locked. Read only.${n.id?` <button type=\"button\" class=\"tp4-lk\" onclick=\"tp4PrintNote('${Q(n.id)}')\">Print note</button>`:''}</div>");
R("(PSY?D.goals.map((g,i)=>","(D.goals.map((g,i)=>");
R("<span class=\"tp4-sub\">Edit</span></div>`).join(''):li('Goals',D.goals.length)))}","<span class=\"tp4-sub\">${PSY?'Edit':'History'}</span></div>`).join('')))}");
R("return `<div class=\"tp4-card tp4-empty\">${IC.ses}<h4>No therapy plan yet</h4>","return due(pid)+`<div class=\"tp4-card tp4-empty\">${IC.ses}<h4>No therapy plan yet</h4>");
R("${o.r.leader||o.r.by?' · '+E(o.r.leader||o.r.by):''}</span></div>`","${o.r.leader||o.r.by?' · '+E(o.r.leader||o.r.by):''}</span></div>${o.r.note?`<div class=\"tp4-txt\">${E(o.r.note)}</div>`:''}`");
R("D.names.map((n,i)=>`<div class=\"tp4-li\"><span style=\"display:flex;gap:7px;align-items:center\">${mk(GC[i%GC.length],1)}<b>${E(n)}</b></span>","D.names.map((n,i)=>`<div class=\"tp4-li tp4-click\" role=\"button\" tabindex=\"0\" title=\"See attendance for this group\" onclick=\"tp4Grp('${E(Q(pid))}','${E(Q(n))}')\"><span style=\"display:flex;gap:7px;align-items:center\">${mk(GC[i%GC.length],1)}<b>${E(n)}</b></span>");
R("const req=[[c24?'done':'due','24-hour family call',c24?'Done '+fmtD(c24.d):'Not logged yet'],[wk.length?'done':'due','Weekly update',wk.length?'Last '+fmtD(wk.sort((a,b)=>b.d-a.d)[0].d):'Due this week'],[fs?'done':'later','Family session',fs?'Done '+fmtD(fs.d):'Not held yet']];",
"const pxn=D.all.filter(o=>/\\bPX\\b|experience/i.test(o.s||'')).length;\n    const req=[[c24?'done':'due','24-hour family call',c24?'Done '+fmtD(c24.d):'Not logged yet',c24?kOf(c24.d):''],[wk.length?'done':'due','Weekly update',wk.length?'Last '+fmtD(wk.sort((a,b)=>b.d-a.d)[0].d):'Due this week',wk.length?kOf(wk[0].d):''],[fs?'done':'later','Family session',fs?'Done '+fmtD(fs.d):'Not held yet',fs?kOf(fs.d):''],['later','PX calls',pxn+' logged this stay','']];");
R("<div class=\"tp4-req ${r[0]}\"><span class=\"tp4-tick","<div class=\"tp4-req ${r[0]}${r[3]?' tp4-click':''}\"${r[3]?` role=\"button\" tabindex=\"0\" onclick=\"tp4Pick('${E(Q(pid))}','${r[3]}')\"`:''}><span class=\"tp4-tick");
R("${segs?segs.outerHTML:''}${act}</div>","${segs?segs.outerHTML:''}<span style=\"display:flex;gap:8px;flex-wrap:wrap;align-items:center\">${act}${tp4Bar(pid,seg)}</span></div>");
R("'.tp4-empty{text-align:center","'.tp4-lk{margin-left:auto;border:0;background:none;color:#2563eb;font-weight:600;cursor:pointer;font-size:12px}','.tp4-due{margin-bottom:12px}',\n    '.tp4-empty{text-align:center");
const add=`  /* 24 Nov, "Therapy Plans redesignn.html": what the combined prototype adds: print buttons, goal and group history pop-ups,
     family required-contact rows open their day, PX calls row, Start family session, a "Due" card before the plan exists */
  const ptP=pid=>(typeof ptFind==='function'&&ptFind(pid))||null;
  const rt=v=>v===1?'Met':v===.5?'Part way':'Not met';
  const pdf=(t,h,pid)=>{if(typeof psyPdf==='function')psyPdf(t,h,ptP(pid));else window.print();};
  const tbl=(h,r)=>'<table style="width:100%"><tr>'+h.map(c=>'<th>'+E(c)+'</th>').join('')+'</tr>'+r.map(a=>'<tr>'+a.map(c=>'<td>'+E(c)+'</td>').join('')+'</tr>').join('')+'</table>';
  const noteHtml=n=>'<div class="n"><div class="h"><span>'+E(n.mod||'Session')+'</span><span>'+E(n.at||'')+'</span></div><div class="m">'+E([n.by,n.mins?n.mins+' min':'',n.status==='signed'?'Signed '+(n.signedAt||''):'Draft'].filter(Boolean).join(' · '))+'</div><div class="s">'+E(n.summaryLine||n.summary||n.outcome||'')+'</div>'+((n.addenda||[]).map(a=>'<div class="s"><b>Addendum, '+E(a.by)+', '+E(a.at)+'</b>'+E(a.text)+'</div>').join(''))+'</div>';
  const famRows=pid=>fam(pid).all.slice().sort((a,b)=>a.d-b.d).map(o=>[fmtD(o.d),{call:'Call',miss:'Not reached',wa:'WhatsApp',ses:'Family session'}[o.t],o.h,o.s]);
  const lastOf=(D,i)=>Object.keys(D.by).filter(k=>D.by[k].g[i]).map(k=>{const p=k.split('-').map(Number);return {d:new Date(p[0],p[1],p[2]),v:D.by[k].g[i]};}).sort((a,b)=>b.d-a.d);
  function due(pid){
    return \`<div class="tp4-card tp4-due"><div class="tp4-ch"><h3>\${IC.due} Due</h3></div><div class="tp4-cb"><div class="tp4-req due"><span class="tp4-tick due"></span><span><b>Detailed history</b><span class="tp4-sub">Within 72 hours of admission</span></span></div><div class="tp4-req"><span class="tp4-tick later"></span><span><b>Therapy plan and goals</b><span class="tp4-sub">Within 1 week of admission</span></span></div></div></div>\`;
  }
  function tp4Bar(pid,seg){
    const b=(a,t)=>'<button type="button" class="btn sm" onclick="'+a+'">'+t+'</button>';
    let h='';
    if(seg==='fam'){h+=b("tp4Print('"+Q(pid)+"','fam')",'Print contact log');if(PSY&&typeof window.snOpen==='function')h+=b("snOpen('"+Q(pid)+"','fam')",'Start family session');}
    return h+b("tp4Print('"+Q(pid)+"','stay')",'Print stay record');
  }
  window.tp4Pick=function(pid,k){ST['s'+pid]=k;render();};
  window.tp4PrintNote=function(id){
    const x=((((psyPx(S.pid)||{}).sn||{}).notes)||[]).find(q=>q.id===id);
    if(!x||x.status!=='signed'){toast('Sign the note first. Drafts cannot be printed.');return;}
    pdf('Session note',noteHtml(x),S.pid);
  };
  window.tp4Print=function(pid,kind){
    if(kind==='fam'){const r=famRows(pid);pdf('Family contact log','<h2>Family contact</h2>'+(r.length?tbl(['Date','Type','What','Who / notes'],r):'<p>No family contact logged yet.</p>'),pid);return;}
    const I=ind(pid),G=grp(pid),x=psyPx(pid)||{},th=x.th||{},signed=I.notes.filter(n=>n.status==='signed').slice().reverse();
    const gr=I.goals.map((g,i)=>{const L=lastOf(I,i);return [g.t,L.length+' logged',L[0]?rt(L[0].v.r)+' ('+fmtD(L[0].d)+')':'Not logged yet'];});
    const att=G.names.map(n=>[n,(G.tot[n]||[0,0])[0]+' of '+(G.tot[n]||[0,0])[1]]);
    const fr=famRows(pid);
    pdf('Therapy record for the stay',
      '<h2>Therapy plan</h2>'+tbl(['Therapy','How often','Sessions'],[[th.mod||(I.notes[0]||{}).mod||'Not set',th.freq||'Not set',signed.length+' signed'+(I.notes.length>signed.length?', '+(I.notes.length-signed.length)+' draft':'')]])
      +'<h2>Goals</h2>'+(gr.length?tbl(['Goal','Logged','Latest'],gr):'<p>No goals set yet.</p>')
      +'<h2>Group attendance</h2>'+(att.length?tbl(['Group','Attended'],att):'<p>No group attendance logged yet.</p>')
      +'<h2>Family contact</h2>'+(fr.length?tbl(['Date','Type','What','Who / notes'],fr):'<p>No family contact logged yet.</p>')
      +'<h2>Session notes</h2>'+(signed.length?signed.map(noteHtml).join(''):'<p>No signed session notes yet.</p>'),pid);
  };
  window.tp4Goal=function(pid,i){
    const D=ind(pid),g=D.goals[i];if(!g)return;const L=lastOf(D,i);
    V3.modal(E(g.t),'Goal history · read only',
      '<div class="pin-sum"><div class="pin-r"><span>Logged</span><b>'+L.length+' times</b></div><div class="pin-r"><span>Met</span><b>'+L.filter(o=>o.v.r===1).length+'</b></div><div class="pin-r"><span>Latest</span><b>'+(L[0]?rt(L[0].v.r):'Not logged yet')+'</b></div></div>'
      +(L.length?'<div class="scroll" style="margin-top:10px">'+tbl(['Date','Rating','Value','By'],L.map(o=>[fmtD(o.d),rt(o.v.r),o.v.raw,o.v.by||'']))+'</div>':'<div class="tp4-sub" style="margin-top:10px">Not logged yet.</div>'),
      '<button class="btn" onclick="closeModal()">Close</button>');
  };
  window.tp4Grp=function(pid,name){
    const x=psyPx(pid)||{},R=(((x.sn||{}).grp)||[]).concat(((x.th||{}).grp)||[]).filter(r=>(r.group||'Group')===name);
    V3.modal(E(name),'Attendance and notes',R.length?'<div class="scroll">'+tbl(['Date','Took part','Marked by','Note'],R.map(r=>[r.date||'',r.took||'',r.leader||r.by||'',r.note||'']))+'</div>':'<div class="tp4-sub">Nothing logged yet.</div>','<button class="btn" onclick="closeModal()">Close</button>');
  };
  window.tp4Day=function(pid,k){`;
R("  window.tp4Day=function(pid,k){",add);
fs.writeFileSync(f,s.replace(/\n/g,'\r\n'));
console.log('ok');
