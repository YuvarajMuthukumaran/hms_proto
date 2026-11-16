/* One-off (13 Nov 2026): redesign of the Legal status (MHCA) card on the psychiatrist's Stay summary. Plain text, no chips (they are hidden in no-labels mode). */
const fs=require('fs'),path=require('path');
const p=path.join(__dirname,'..','public','legacy','js','79-mhca-events-12nov-js.js');let s=fs.readFileSync(p,'utf8');const crlf=s.includes('\r\n');s=s.replace(/\r\n/g,'\n');
const i0=s.indexOf("    const adTxt=M.ad?");const i1=s.indexOf("    const tabs=v.querySelector('.subtabs'),first=v.querySelector('section.card');");
if(i0<0||i1<i0)throw new Error('markers');
const NEW=`    const j=a=>a.filter(Boolean).join(', ');
    const tile=(st,lab,val,sub,act)=>'<div class="mh-t '+st+'"><div class="mh-tl"><i class="mh-dot"></i>'+lab+'</div><div class="mh-tv">'+val+'</div>'+(sub?'<div class="mh-ts">'+sub+'</div>':'')+(act?'<div class="mh-ta">'+act+'</div>':'')+'</div>';
    const tiles=[];
    tiles.push(M.ad?tile('ok','Advance directive',hesc(M.ad),hesc(j([M.adBy,M.adAt]))||'Recorded'):tile('bad','Advance directive','Not asked yet','Required by the MHCA at admission','<button class="btn sm" onclick="mhcaAd(\\''+id+'\\',\\'Absent\\')">Absent</button><button class="btn sm" onclick="mhcaAd(\\''+id+'\\',\\'Present\\')">Present</button>'));
    tiles.push(L.every?(L.overdue>0?tile('bad','Capacity review','<b>'+L.overdue+' overdue</b>','Every '+L.every+' days','<button class="btn sm pri" onclick="mhcaCap(\\''+id+'\\')">Record the capacity review</button>'):tile('ok','Capacity review','Up to date','Next review in '+(L.every-(L.day%L.every))+' days')):tile('ok','Capacity review','No fixed review','Under this section'));
    if(L.sec==='89')tiles.push(M.decision?tile('ok','Day '+R.mhca.prompt89Day+' choice',hesc({s90:'Applying for Section 90',indep:'Switching to independent',dc:'Discharge planned'}[M.decision]||M.decision),hesc(j([M.decisionBy,M.decisionAt]))):(L.day>=R.mhca.prompt89Day?tile('bad','Day '+R.mhca.prompt89Day+' choice','<b>Choice needed now</b>','Section 90, independent (Form C) or discharge'):tile('ok','Day '+R.mhca.prompt89Day+' choice','Not due yet','Asked from day '+R.mhca.prompt89Day)));
    const nrKeys=[['rights','Rights explained to the nominated representative'],['change','Change of admission type told to the NR']],nrDone=nrKeys.filter(x=>M.nr[x[0]]).length;
    tiles.push(tile(nrDone===nrKeys.length?'ok':'warn','Notices to the NR',nrDone+' of '+nrKeys.length+' done','Nominated representative'));
    const todo=[];
    nrKeys.forEach(x=>todo.push({t:x[1],meta:'Nominated representative',done:M.nr[x[0]]&&M.nr[x[0]].at,go:'mhcaNr(\\''+id+'\\',\\''+x[0]+'\\')'}));
    (M.tasks||[]).forEach(t=>todo.push({t:t.text,meta:t.meta||'',done:t.done&&t.done.at,go:'mhcaTaskDone(\\''+id+'\\',\\''+t.id+'\\')'}));
    const rows=todo.map(r=>'<div class="mh-r'+(r.done?' d':'')+'"><span class="mh-ck">'+(r.done?'✓':'')+'</span><div class="mh-rt"><div>'+hesc(r.t)+'</div>'+(r.meta?'<div class="mh-ts">'+hesc(r.meta)+'</div>':'')+'</div>'+(r.done?'<span class="mh-ts">Done '+hesc(r.done)+'</span>':'<button class="btn sm" onclick="'+r.go+'">Mark done</button>')+'</div>').join('');
    const pct=L.left!==null?Math.min(100,Math.round(L.day/30*100)):0;
    const sec=document.createElement('section');sec.className='card';sec.id='mhcaCard';
    sec.innerHTML='<div class="hd"><div><h3>Legal status (MHCA)</h3><div class="small muted" style="margin-top:4px">'+hesc(SEC_TXT[L.sec]||'Section '+L.sec)+' · day '+L.day+(L.left!==null?' of 30 · <b style="color:'+(L.left<=5?'#b42318':'#344054')+'">'+L.left+' days left</b>':'')+'</div></div></div>'
      +(L.left!==null?'<div class="mh-bar'+(L.left<=5?' w':'')+'"><i style="width:'+pct+'%"></i></div>':'')
      +'<div class="pad"><div class="mh-tiles">'+tiles.join('')+'</div>'+(rows?'<div class="mh-sub">To do</div><div class="mh-rows">'+rows+'</div>':'')+'</div>';
`;
s=s.slice(0,i0)+NEW+s.slice(i1);
const c0=".mh-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px 22px}";
if(s.split(c0).length!==2)throw new Error('css');
s=s.split(c0).join(`.mh-bar{height:6px;background:#eaf0f7;margin:0 20px 4px;border-radius:99px;overflow:hidden}.mh-bar i{display:block;height:100%;background:#1e6cdb;border-radius:99px}.mh-bar.w i{background:#d92d20}
  .mh-tiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:12px}.mh-t{border:1px solid #e3eaf2;border-radius:12px;padding:12px 14px;background:#fff;display:flex;flex-direction:column;gap:4px;border-top:3px solid #cfd8e4}.mh-t.ok{border-top-color:#1f9d57}.mh-t.warn{border-top-color:#f79009}.mh-t.bad{border-top-color:#d92d20;background:#fffbfa}
  .mh-tl{font-size:12px;font-weight:700;letter-spacing:.03em;text-transform:uppercase;color:#667085;display:flex;align-items:center;gap:6px}.mh-dot{width:8px;height:8px;border-radius:50%;background:#cfd8e4}.mh-t.ok .mh-dot{background:#1f9d57}.mh-t.warn .mh-dot{background:#f79009}.mh-t.bad .mh-dot{background:#d92d20}
  .mh-tv{font-size:16px;font-weight:650;color:#101828}.mh-t.bad .mh-tv{color:#b42318}.mh-ts{font-size:12.5px;color:#667085}.mh-ta{display:flex;gap:6px;flex-wrap:wrap;margin-top:6px}
  .mh-sub{margin:16px 0 6px;font-size:12px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:#667085}.mh-rows{display:flex;flex-direction:column;border:1px solid #e3eaf2;border-radius:12px;overflow:hidden}
  .mh-r{display:flex;align-items:center;gap:12px;padding:10px 14px;border-top:1px solid #eef2f8}.mh-r:first-child{border-top:0}.mh-r.d{background:#fafcfe;color:#667085}.mh-rt{flex:1;min-width:0}.mh-ck{width:20px;height:20px;border-radius:50%;border:1.5px solid #cfd8e4;display:flex;align-items:center;justify-content:center;font-size:12px;color:#fff;flex:none}.mh-r.d .mh-ck{background:#1f9d57;border-color:#1f9d57}
  `+c0);
if(crlf)s=s.replace(/\n/g,'\r\n');fs.writeFileSync(p,s);new Function(s);console.log('ok');
