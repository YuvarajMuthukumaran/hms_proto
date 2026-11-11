/* Patient Experience Lead workspace (11 Nov 2026). Replicates the team's clickable prototype "Patient Experience Lead – HMS prototype"
   (Nikita's file) inside the main prototype: Today, Stays (and the patient record with five tabs), Concerns, Floor round,
   Feedback and follow-up, Weekly report, and the Log a concern drawer. The data and wording are the prototype's own.
   Only the /patient-experience-lead login is changed; no other role's screens are touched.
   It keeps the main app's sidebar and top bar and fills the page area; the screens use the route #/myday (Today) and #/px<screen>. */
(function(){
  const boot=window.__TULASI__||{};
  if(boot.role!=='patient-experience-lead')return;
  const h=s=>hesc(String(s==null?'':s));

  /* ---------------- styles (the prototype's, scoped to .pxl) ---------------- */
  const CSS=`
  .pxl{display:flex;flex-direction:column;gap:18px;font-size:14px;line-height:1.45;color:#0f172a;box-sizing:border-box}
  .pxl .lbl{font-size:11px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:#5b6475}
  .pxl .avatar{border-radius:999px;display:flex;align-items:center;justify-content:center;font-weight:700;flex:0 0 auto}
  .pxl .av-ink{background:#0f172a;color:#fff}.pxl .av-red{background:#fdecec;color:#b42318}.pxl .av-violet{background:#f3effe;color:#5b3fb5}.pxl .av-green{background:#e3f7ea;color:#11703a}.pxl .av-amber{background:#fef3e2;color:#92500a}.pxl .av-tint{background:#e8f1fe;color:#1e5bb8}
  .pxl .crumb{font-size:13px;color:#5b6475;display:flex;gap:6px;flex-wrap:wrap;align-items:center}
  .pxl .crumb b{color:#0f172a;font-weight:600}
  .pxl .hello{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;align-items:flex-start}
  .pxl .hello h2{margin:0;font-size:20px;font-weight:700}
  .pxl h3{margin:0;font-size:15px;font-weight:700}
  .pxl .muted{color:#5b6475}.pxl .small{font-size:12.5px}.pxl .name{font-weight:600}
  .pxl .card{background:#fff;border:1px solid #e3eaf2;border-radius:18px;box-sizing:border-box;min-width:0;box-shadow:none}
  .pxl .cpad{padding:18px 20px}
  .pxl .chead{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 20px;border-bottom:1px solid #eef2f6;flex-wrap:wrap}
  .pxl .btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;height:38px;padding:0 15px;border-radius:10px;font:inherit;font-size:14px;font-weight:600;border:1px solid #d6dee8;background:#fff;color:#0f172a;cursor:pointer;white-space:nowrap;box-sizing:border-box}
  .pxl .btn:hover{border-color:#b9c6d6}
  .pxl .btn.pri{background:#1e6cdb;border-color:#1e6cdb;color:#fff}.pxl .btn.pri:hover{background:#164fa3}
  .pxl .btn.sm{height:34px;padding:0 12px;font-size:13px}
  .pxl .btn.soft{background:#f6faff;border-color:#cfe0fb}
  .pxl .btn.link{border:0;background:none;color:#1e5bb8;padding:0 6px}
  .pxl .btn.ok{background:#e3f7ea;border-color:#e3f7ea;color:#11703a;cursor:default}
  .pxl .tag{font-size:10px;font-weight:700;letter-spacing:.03em;border-radius:5px;padding:2px 6px;white-space:nowrap;text-transform:uppercase}
  .pxl .t-new{color:#1e5bb8;background:#e8f1fe}.pxl .t-vip{color:#5b3fb5;background:#efe9fe}.pxl .t-risk{color:#9a5b00;background:#fff4d6}.pxl .t-red{color:#b42318;background:#fdecec}.pxl .t-green{color:#11703a;background:#e3f7ea}.pxl .t-grey{color:#475467;background:#f1f4f8}
  .pxl .chip{display:inline-flex;align-items:center;gap:6px;padding:3px 10px;border-radius:999px;font-size:12px;font-weight:600;white-space:nowrap}
  .pxl .green{background:#e3f7ea;color:#11703a}.pxl .amber{background:#fef3e2;color:#92500a}.pxl .red{background:#fdecec;color:#b42318}.pxl .grey{background:#f1f4f8;color:#475467}.pxl .blue{background:#e8f1fe;color:#1e5bb8}.pxl .violet{background:#f3effe;color:#5b3fb5}
  .pxl .dot{width:8px;height:8px;border-radius:99px;display:inline-block;flex:0 0 8px;margin-top:6px}
  .pxl .d-red{background:#b42318}.pxl .d-amber{background:#d48806}.pxl .d-green{background:#11703a}.pxl .d-grey{background:#a8b3c2}.pxl .d-blue{background:#1e6cdb}
  .pxl .ty{font-size:14px;font-weight:700}
  .pxl .ty.red{background:none;color:#b42318}.pxl .ty.amber{background:none;color:#b54708}.pxl .ty.blue{background:none;color:#1e5bb8}.pxl .ty.green{background:none;color:#11703a}.pxl .ty.grey{background:none;color:#475467}
  .pxl .starthere{display:flex;flex-direction:column;gap:6px}
  .pxl .listrow{display:flex;align-items:center;gap:12px;padding:14px 20px;border-top:1px solid #eef2f6;flex-wrap:wrap}
  .pxl .listrow:first-child{border-top:0}
  .pxl .grow{flex:1 1 240px;min-width:0}
  .pxl .more{display:flex;align-items:center;gap:6px;padding:12px 20px;border-top:1px solid #eef2f6;font-size:13px;font-weight:600;color:#1e5bb8;background:none;border-left:0;border-right:0;border-bottom:0;width:100%;text-align:left;cursor:pointer;font-family:inherit}
  .pxl .pgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;padding:14px 20px 20px}
  .pxl .pc{display:flex;flex-direction:column;gap:4px;padding:12px 14px;border:1px solid #e3eaf2;border-left:3px solid #11703a;border-radius:10px;background:#fff;cursor:pointer;text-align:left;font:inherit;color:inherit;min-height:84px}
  .pxl .pc:hover{background:#fafcfe}
  .pxl .pc.l-red{border-left-color:#b42318}.pxl .pc.l-amber{border-left-color:#d48806}.pxl .pc.l-grey{border-left-color:#a8b3c2}
  .pxl .pc .st{font-size:12.5px}
  .pxl .st.red{background:none;color:#b42318}.pxl .st.amber{background:none;color:#92500a}.pxl .st.green{background:none;color:#11703a}
  .pxl .cols{display:flex;flex-wrap:wrap;gap:18px;align-items:flex-start}
  .pxl .cm{flex:3 1 520px;min-width:0;display:flex;flex-direction:column;gap:18px}
  .pxl .cs{flex:2 1 320px;min-width:0;display:flex;flex-direction:column;gap:18px}
  .pxl .seg{display:inline-flex;gap:2px;background:#eef4fd;border:1px solid #cfe0fb;border-radius:12px;padding:3px;flex-wrap:wrap}
  .pxl .seg button{border:0;background:none;padding:7px 12px;border-radius:9px;font:inherit;font-size:13px;font-weight:600;color:#334155;cursor:pointer;display:inline-flex;align-items:center;gap:6px;min-height:34px}
  .pxl .seg button.on{background:#1e6cdb;color:#fff}
  .pxl .seg .n{font-size:11px;font-weight:700;border-radius:999px;padding:0 6px;background:#dbe7fa;color:#1e5bb8}
  .pxl .seg button.on .n{background:rgba(255,255,255,.22);color:#fff}
  .pxl .toolbar{display:flex;gap:10px;align-items:center;justify-content:space-between;flex-wrap:wrap}
  .pxl .search{height:38px;border:1px solid #d6dee8;border-radius:10px;padding:0 12px;font:inherit;font-size:14px;width:260px;max-width:100%;box-sizing:border-box;background:#fff}
  .pxl .scrollx{overflow-x:auto}
  .pxl table.pt{width:100%;border-collapse:collapse;font-size:14px;min-width:820px}
  .pxl table.pt th{font-size:11px;text-transform:uppercase;letter-spacing:.04em;color:#475467;text-align:left;font-weight:700;padding:12px 14px;border-bottom:1px solid #e3eaf2;background:#fafcfe;white-space:nowrap}
  .pxl table.pt td{padding:13px 14px;border-bottom:1px solid #eef2f6;vertical-align:middle}
  .pxl table.pt tr.ck{cursor:pointer}
  .pxl table.pt tbody tr:hover td{background:#fafcfe}
  .pxl table.pt tr.sel td{background:#f5f9ff}
  .pxl table.pt td:first-child{box-shadow:inset 3px 0 0 var(--sr,transparent)}
  .pxl .prow{display:flex;gap:10px;align-items:center}
  .pxl .pmeta{font-size:12.5px;color:#5b6475}
  .pxl .prog{display:flex;flex-direction:column;gap:4px;min-width:150px}
  .pxl .prog .ph{display:flex;justify-content:space-between;font-size:13px;font-weight:600;gap:8px}
  .pxl .bar{height:5px;border-radius:99px;background:#e9eef4;overflow:hidden}
  .pxl .bar i{display:block;height:100%;background:#11703a;border-radius:99px}
  .pxl .bar.blue i{background:#1e6cdb}
  .pxl .due{display:flex;flex-direction:column;gap:6px}
  .pxl .due div{display:flex;gap:8px;align-items:flex-start;font-size:13px}
  .pxl .shb{padding:20px 24px}
  .pxl .shb .hdr{display:flex;gap:20px 32px;align-items:flex-start;justify-content:space-between;flex-wrap:wrap}
  .pxl .idr{display:flex;gap:14px;align-items:center}
  .pxl .nm{font-size:22px;font-weight:700;letter-spacing:-.01em}
  .pxl .kf{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:14px 24px;padding-top:16px;margin-top:16px;border-top:1px solid #eef2f6}
  .pxl .kf .v{font-weight:600;margin-top:3px}
  .pxl .team{display:flex;gap:16px;flex-wrap:wrap;align-items:center}
  .pxl .act{display:flex;flex-direction:column;gap:8px;min-width:200px}
  .pxl .act .btn{width:100%;height:40px;font-size:13px}
  .pxl .utabs{display:flex;gap:22px;border-bottom:1px solid #e3eaf2;padding:0 4px;overflow-x:auto}
  .pxl .utab{padding:12px 2px;border:0;border-bottom:2px solid transparent;background:none;font:inherit;font-size:14px;color:#475467;cursor:pointer;white-space:nowrap}
  .pxl .utab.on{border-bottom-color:#1e6cdb;color:#1e5bb8;font-weight:600}
  .pxl .tl{display:flex;gap:14px;padding:12px 20px;border-top:1px solid #eef2f6}
  .pxl .tl:first-child{border-top:0}
  .pxl .tld{flex:0 0 64px;font-size:12.5px;font-weight:600;color:#5b6475;padding-top:2px}
  .pxl .tlm{width:12px;height:12px;border-radius:50%;flex:0 0 12px;margin-top:4px;border:2px solid #fff;box-shadow:0 0 0 1px #d6dee8}
  .pxl .checkrow{display:flex;align-items:center;gap:12px;padding:12px 20px;border-top:1px solid #eef2f6;flex-wrap:wrap}
  .pxl .checkrow:first-child{border-top:0}
  .pxl .cbx{width:22px;height:22px;border-radius:6px;border:1.5px solid #b9c6d6;background:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;flex:0 0 22px;padding:0;color:#fff}
  .pxl .cbx.on{background:#11703a;border-color:#11703a}
  .pxl .okissue{display:inline-flex;border:1px solid #d6dee8;border-radius:10px;overflow:hidden}
  .pxl .okissue button{border:0;background:#fff;font:inherit;font-size:13px;font-weight:600;padding:0 14px;height:34px;cursor:pointer;color:#334155}
  .pxl .okissue button+button{border-left:1px solid #d6dee8}
  .pxl .okissue button.ok-on{background:#e3f7ea;color:#11703a}
  .pxl .okissue button.is-on{background:#fdecec;color:#b42318}
  .pxl .field{display:flex;flex-direction:column;gap:6px;min-width:0}
  .pxl .field label{font-size:12px;font-weight:600;color:#334155}
  .pxl .field input,.pxl .field select,.pxl .field textarea{font:inherit;font-size:14px;border:1px solid #d6dee8;border-radius:10px;padding:8px 12px;background:#fff;color:#0f172a;min-height:38px;box-sizing:border-box;width:100%}
  .pxl .field textarea{min-height:80px;resize:vertical}
  .pxl .fgrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
  .pxl .nps{display:flex;gap:6px;flex-wrap:wrap}
  .pxl .npsb{width:38px;height:38px;border-radius:10px;border:1px solid #d6dee8;background:#fff;font:inherit;font-weight:600;cursor:pointer;color:#0f172a}
  .pxl .npsb.on{background:#1e6cdb;border-color:#1e6cdb;color:#fff}
  .pxl .rate{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:8px 0;border-top:1px solid #eef2f6;flex-wrap:wrap}
  .pxl .starb{width:34px;height:34px;border-radius:9px;border:1px solid #d6dee8;background:#fff;font:inherit;font-weight:600;font-size:13px;cursor:pointer;color:#334155}
  .pxl .starb.on{background:#e8f1fe;border-color:#1e6cdb;color:#1e5bb8}
  .pxl .tiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:12px}
  .pxl .tile{background:#fff;border:1px solid #e3eaf2;border-radius:14px;padding:14px 16px;display:flex;flex-direction:column;gap:2px}
  .pxl .tile b{font-size:26px;letter-spacing:-.02em}
  .pxl .note{background:#fef3e2;border:1px solid #f5d9a8;color:#92500a;border-radius:12px;padding:10px 14px;font-size:13px}
  .pxl .info{background:#e8f1fe;color:#1e5bb8;border-radius:12px;padding:10px 14px;font-size:13px}
  .pxl .kvrow{display:flex;gap:12px;padding:11px 20px;border-top:1px solid #eef2f6;flex-wrap:wrap}
  .pxl .kvrow:first-child{border-top:0}
  .pxl .kvrow .k{flex:0 0 150px;color:#5b6475;font-size:13px}
  .pxl .steps{display:grid;grid-template-columns:repeat(9,minmax(108px,1fr));gap:8px;min-width:1000px;padding:16px 20px}
  .pxl .step{border-radius:12px;padding:10px 12px;border:1px solid #e3eaf2;background:#f8fafc;display:flex;flex-direction:column;gap:5px}
  .pxl .step.s-done{background:#f1fbf4;border-color:#bfe8cd}.pxl .step.s-overdue{background:#fff6f6;border-color:#f3c1bd}.pxl .step.s-due{background:#fffaf1;border-color:#f5d9a8}
  .pxl .step .pxsn{font-weight:600;font-size:13px;line-height:1.3}.pxl .step .pxsw{font-size:12px;color:#5b6475}
  .pxl-overlay{position:fixed;inset:0;background:rgba(15,23,42,.35);display:flex;justify-content:flex-end;z-index:400}
  .pxl-overlay .pxl{width:min(500px,100%);background:#fff;height:100%;box-sizing:border-box;padding:22px;overflow:auto;gap:14px}
  .pxl-overlay .pxl h3{font-size:18px}
  @media (max-width:700px){.pxl .fgrid{grid-template-columns:minmax(0,1fr)}}
  `;
  /* the main app's own sidebar items for this role */
  const css2=`
  #side .pxcnt{margin-left:auto;font-size:11px;font-weight:700;background:#fdecec;color:#b42318;border-radius:999px;padding:1px 7px}
  `;
  const st=document.createElement('style');st.id='pxl-css';st.textContent=CSS+css2;document.head.appendChild(st);

  /* ---------------- data (the prototype's) ---------------- */
  const ROUTES={
    'Doctor communication':['Treating psychiatrist','Clinical team'],'Family updates':['Treating psychologist','Clinical team'],'Food and dietary':['Kitchen supervisor','Kitchen, with dietician'],
    'Nursing care':['Nursing in-charge','Nursing'],'Room and housekeeping':['Housekeeping supervisor','Housekeeping'],'Attendants and security':['Floor supervisor','Attendants and security'],
    'Billing and insurance':['Billing desk','Billing and TPA'],'Belongings':['Front desk','Admissions'],'Medicines at discharge':['Pharmacy (Khalid)','Pharmacy'],'Other':['Prabh','Patient experience']};
  const STEPS=[
    {name:'Family meeting',when:'Day 0',owner:'You'},{name:'Info pack and team intro',when:'Day 0',owner:'You'},{name:'Psychiatrist call',when:'Within 24 hours',owner:'Psychiatrist',auto:true},
    {name:'Psychiatrist call',when:'Day 3-4',owner:'Psychiatrist',auto:true},{name:'Psychologist call',when:'Day 3-4',owner:'Psychologist',auto:true},{name:'Weekly updates explained',when:'By Day 2',owner:'You'},
    {name:'Coordinator random calls',when:'3 during stay',owner:'You'},{name:'Discharge feedback',when:'At discharge',owner:'You'},{name:'48-hour follow-up check',when:'After first OPD visit',owner:'You'}];
  const CK=[['meet','Met the family','In person or over call'],['intro','Introduced as family coordinator','Your name and number shared'],['wa','WhatsApp group made','Family, psychologist and you'],
    ['pack','Welcome pack shared','Visiting rules, phone rule, what to bring'],['team','Treating team introduced','Psychiatrist and psychologist names'],['cadence','Weekly update rhythm explained','Who calls, and when'],
    ['belong','Belongings logged with front desk','Valuables kept in the locker']];
  const P=[
    {id:'p1',name:'Arjun Mehta',ini:'AM',uhid:'2026-27RG6812',room:'Room 210',floor:'f2',day:2,admitted:'10 Nov, 6:10 pm',admType:'Supported admission',doctor:'Dr. Aanya Sharma',docIni:'AS',psych:'Priya Nair',psyIni:'PN',guardian:'Shalini Mehta (wife)',gName:'Shalini Mehta',gRel:'Wife',nr:'Shalini Mehta',phone:'+91 98188 XXX51',discharge:'Not set yet',vip:false,isNew:true,lastContact:'10 Nov',
      st:['done','done','overdue','up','up','due','up','up','up'],random:'0 of 3',ck:['meet','intro','wa','pack','team','belong'],
      log:[{d:'10 Nov',what:'Family meeting at admission',who:'Prabh',time:'6:40 pm',how:'In person',note:'Wife and brother present. WhatsApp group made.'}],
      prefs:[['Food','Vegetarian, no onion or garlic'],['Language','Hindi, English'],['Faith and routine','Morning prayer, 15 minutes'],['Updates go to','Shalini Mehta (wife)'],['Do not share with','Employer, if they call'],['Other','Prefers morning walks']],
      visits:[['Allowed visitors','Wife, brother'],['Visiting slot','Sundays, 4 to 6 pm'],['Next visit','Sun 15 Nov, wife'],['Outings','None approved yet']],
      belongings:[['Phone','Kept in locker, switched off'],['Wallet and cards','Kept in locker'],['Clothes','6 sets, on ward'],['Signed by','Shalini Mehta, 10 Nov']]},
    {id:'p2',name:'Neel Bose',ini:'NB',uhid:'2026-27RG6988',room:'Room 213 A',floor:'f2',day:6,admitted:'6 Nov, 2:30 pm',admType:'Supported admission',doctor:'Dr. Aanya Sharma',docIni:'AS',psych:'Kiran Mehra',psyIni:'KM',guardian:'Anjali Bose (mother)',gName:'Anjali Bose',gRel:'Mother',nr:'Anjali Bose',phone:'+91 98110 XXX24',discharge:'Around 20 Nov',vip:false,isNew:false,lastContact:'10 Nov',
      st:['done','done','done','done','overdue','done','due','up','up'],random:'0 of 3',ck:['meet','intro','wa','pack','team','cadence','belong'],
      log:[{d:'10 Nov',what:'Psychiatrist call (Day 3-4)',who:'Dr. Aanya Sharma',time:'1:15 pm',how:'HMS call, logged automatically',note:''},{d:'7 Nov',what:'Psychiatrist call (24 hours)',who:'Dr. Aanya Sharma',time:'11:05 am',how:'HMS call, logged automatically',note:''},{d:'6 Nov',what:'Family meeting at admission',who:'Prabh',time:'5:20 pm',how:'In person',note:'Mother anxious about the phone rule. Explained the weekly rhythm.'}],
      prefs:[['Food','Non-vegetarian, fish preferred'],['Language','Bengali, English'],['Faith and routine','None noted'],['Updates go to','Anjali Bose (mother)'],['Do not share with','None noted'],['Other','Light sleeper, asked for a quieter room']],
      visits:[['Allowed visitors','Mother, father'],['Visiting slot','Wednesdays and Sundays, 4 to 6 pm'],['Next visit','Today, 4 pm, mother'],['Outings','Not yet, review at next round']],
      belongings:[['Phone','Kept in locker, switched off'],['Laptop','Taken home by father'],['Clothes','5 sets, on ward'],['Signed by','Anjali Bose, 6 Nov']]},
    {id:'p3',name:'Meera Iyer',ini:'MI',uhid:'2026-27RG7031',room:'Room 310 A',floor:'f3',day:1,admitted:'11 Nov, 9:30 am (today)',admType:'Independent admission',doctor:'Dr. Alisha Nagar',docIni:'AN',psych:'Not assigned yet',psyIni:'?',guardian:'S. Iyer (father)',gName:'S. Iyer',gRel:'Father',nr:'S. Iyer',phone:'+91 99100 XXX88',discharge:'Not set yet',vip:true,isNew:true,lastContact:'today',
      st:['due','due','up','up','up','up','up','up','up'],random:'0 of 3',ck:[],log:[],
      prefs:[['Food','South Indian vegetarian'],['Language','Tamil, English'],['Faith and routine','Not set yet'],['Updates go to','S. Iyer (father)'],['Do not share with','Not set yet'],['Other','VIP: senior staff to meet family']],
      visits:[['Allowed visitors','Not set yet'],['Visiting slot','Not set yet'],['Next visit','Not set yet'],['Outings','Not set yet']],
      belongings:[['Status','Not logged yet. Do this at the family meeting.']]},
    {id:'p4',name:'Varun Rao',ini:'VR',uhid:'2025-26RG5521',room:'Room 211',floor:'f2',day:14,admitted:'29 Oct, 11:00 am',admType:'Supported admission',doctor:'Dr. Ichpreet Singh',docIni:'IS',psych:'Priya Nair',psyIni:'PN',guardian:'Kiran Rao (brother)',gName:'Kiran Rao',gRel:'Brother',nr:'Kiran Rao',phone:'+91 98450 XXX12',discharge:'Around 15 Nov',vip:false,isNew:false,lastContact:'9 Nov',
      st:['done','done','done','done','done','done','done','up','up'],random:'3 of 3',ck:['meet','intro','wa','pack','team','cadence','belong'],
      log:[{d:'9 Nov',what:'Random call 3',who:'Prabh',time:'4:00 pm',how:'Phone',note:'Brother happy with care. Wants a doctor call after rounds.'}],
      prefs:[['Food','No restrictions'],['Language','Kannada, English'],['Faith and routine','None noted'],['Updates go to','Kiran Rao (brother)'],['Do not share with','None noted'],['Other','None']],
      visits:[['Allowed visitors','Brother, mother'],['Visiting slot','Sundays, 4 to 6 pm'],['Next visit','Sun 15 Nov'],['Outings','2-hour outing approved for Sat 14 Nov']],
      belongings:[['Phone','Kept in locker'],['Clothes','4 sets, on ward'],['Signed by','Kiran Rao, 29 Oct']]},
    {id:'p5',name:'Kavya Menon',ini:'KM',uhid:'2026-27RG6950',room:'Room 313',floor:'f3',day:9,admitted:'3 Nov, 4:45 pm',admType:'Supported admission',doctor:'Dr. Alisha Nagar',docIni:'AN',psych:'Kiran Mehra',psyIni:'KM',guardian:'Latha Menon (mother)',gName:'Latha Menon',gRel:'Mother',nr:'Latha Menon',phone:'+91 97400 XXX65',discharge:'Not set yet',vip:false,isNew:false,lastContact:'8 Nov',
      st:['done','overdue','done','done','done','overdue','done','up','up'],random:'1 of 3',ck:['meet','intro','wa','team'],
      log:[{d:'8 Nov',what:'Random call 1',who:'Prabh',time:'3:30 pm',how:'Phone',note:'Mother upset about meals. Logged as a grievance.'}],
      prefs:[['Food','Meal plan from dietician'],['Language','Malayalam, English'],['Faith and routine','None noted'],['Updates go to','Latha Menon (mother)'],['Do not share with','Relatives other than mother'],['Other','Meals supervised by nursing']],
      visits:[['Allowed visitors','Mother only'],['Visiting slot','Sundays, 4 to 6 pm'],['Next visit','Sun 15 Nov'],['Outings','Not approved']],
      belongings:[['Phone','Kept in locker'],['Clothes','5 sets, on ward'],['Signed by','Latha Menon, 3 Nov']]},
    {id:'p6',name:'Rahul Sethi',ini:'RS',uhid:'2025-26RG6219',room:'Room 123 B',floor:'f1',day:22,admitted:'21 Oct, 1:00 pm',admType:'Supported admission',doctor:'Dr. Madhura Samudra',docIni:'MS',psych:'Barkha',psyIni:'B',guardian:'Vikas Sethi (father)',gName:'Vikas Sethi',gRel:'Father',nr:'Vikas Sethi',phone:'+91 98990 XXX40',discharge:'13 Nov',vip:false,isNew:false,lastContact:'6 Nov',discharging:true,
      st:['done','done','done','done','done','done','done','up','up'],random:'2 of 3',ck:['meet','intro','wa','pack','team','cadence','belong'],
      log:[{d:'6 Nov',what:'Random call 2',who:'Prabh',time:'12:10 pm',how:'Phone',note:'Father asked about the discharge plan and medicines.'}],
      prefs:[['Food','No restrictions'],['Language','Hindi'],['Faith and routine','None noted'],['Updates go to','Vikas Sethi (father)'],['Do not share with','None noted'],['Other','None']],
      visits:[['Allowed visitors','Father, sister'],['Visiting slot','Sundays, 4 to 6 pm'],['Next visit','Discharge day, 13 Nov'],['Outings','Home leave done 8 Nov']],
      belongings:[['Phone','Kept in locker'],['Wallet','Kept in locker'],['Clothes','6 sets, on ward'],['Signed by','Vikas Sethi, 21 Oct']]}];
  const C0=[
    {id:'C-0142',type:'request',pid:'p4',title:'Wants a call from the doctor after rounds',raisedBy:'Kiran Rao, brother',via:'Front desk',owner:'Dr. Ichpreet Singh',ownerRole:'Treating psychiatrist',category:'Doctor communication',sla:'Due by 2 pm',slaTone:'amber',logged:'today, 9:10 am',status:'Open',desc:'Called the front desk asking for a short call after rounds to hear how Varun is doing this week.'},
    {id:'C-0141',type:'concern',pid:'p2',title:'Daily updates feel the same every day',raisedBy:'Anjali Bose, mother',via:'Coordinator call',owner:'Kiran Mehra',ownerRole:'Treating psychologist',category:'Family updates',sla:'1 h 20 m left',slaTone:'amber',logged:'today, 6:30 am',status:'In progress',desc:'The WhatsApp updates say the same thing daily. She wants to know what is actually changing and what the plan is for this week.'},
    {id:'C-0140',type:'concern',pid:'p2',title:'Room too noisy at night',raisedBy:'Neel Bose, patient',via:'Ward staff',owner:'Sister Rekha',ownerRole:'Nursing in-charge, Floor 2',category:'Room and housekeeping',sla:'4 h 10 m left',slaTone:'grey',logged:'today, 8:50 am',status:'Open',desc:'Told the night nurse he cannot sleep because of noise from the corridor.'},
    {id:'C-0139',type:'grievance',pid:'p5',title:'Meals served cold twice this week',raisedBy:'Latha Menon, mother',via:'Coordinator call',owner:'S Chandra',ownerRole:'GM Operations',category:'Food and dietary',sla:'Breached 40 m ago',slaTone:'red',logged:'yesterday, 7:15 pm',status:'Escalated',desc:'Lunch was cold on Monday and Tuesday and Kavya skipped it. Mother is worried because meals are part of her plan.'},
    {id:'C-0138',type:'request',pid:'p3',title:'Asked for visiting hours and what to bring',raisedBy:'S. Iyer, father',via:'Front desk',owner:'Prabh',ownerRole:'Patient experience',category:'Other',sla:'Due by 6 pm',slaTone:'grey',logged:'today, 10:05 am',status:'Open',desc:'Father wants the visiting rules and a list of what to bring. Share the welcome pack at the family meeting.'},
    {id:'C-0137',type:'concern',pid:'p6',title:'Bill estimate not shared before discharge',raisedBy:'Vikas Sethi, father',via:'Coordinator call',owner:'Billing desk',ownerRole:'Billing and TPA',category:'Billing and insurance',sla:'5 h left',slaTone:'grey',logged:'today, 9:40 am',status:'Open',desc:'Father wants the final bill estimate and insurance paperwork a day before discharge, not on the day.'},
    {id:'C-0135',type:'concern',pid:'p6',title:'Laundry not returned',raisedBy:'Vikas Sethi, father',via:'Front desk',owner:'Housekeeping supervisor',ownerRole:'Housekeeping',category:'Room and housekeeping',sla:'Closed in 3.4 h',slaTone:'green',logged:'6 Nov, 10:15 am',status:'Resolved',desc:'Two shirts sent for laundry were not returned.',resolution:'Housekeeping found the clothes in the Floor 1 laundry bag and returned them the same day. Father told by Prabh.'}];
  const FLOOR=[['Rooms clean, beds made, bathrooms checked','Housekeeping supervisor'],['Lunch served hot and on time','Kitchen supervisor'],['Diet plans followed for patients who have one','Kitchen, with dietician'],['Attendant present on the floor','Floor supervisor'],
    ['Visitor register filled at the floor door','Security'],['Daily session logs filled (filled or not only)','Psychology team lead'],['Vitals charted on time (filled or not only)','Nursing in-charge'],['Rights and grievance contact on the notice board','Patient experience']];
  const OWNERS=[['NI','Nursing in-charge','Sister Rekha (Floor 2)','nursing care, vitals, night noise'],['FS','Floor supervisor','Day shift','attendants, patient escorts'],['KS','Kitchen supervisor','With dietician','meals, diet plans'],
    ['HK','Housekeeping supervisor','Day shift','rooms, laundry'],['SC','Security','Floor door','visitors, outings, belongings out'],['FD','Front desk','Meena Arora','admission forms, belongings in'],['BD','Billing desk','Billing and TPA','estimates, insurance, final bill'],
    ['PH','Pharmacy','Khalid','discharge medicines'],['CC','Call centre','Kanika','after-discharge calls, rebooking'],['GM','GM Operations','S Chandra','grievances, escalations']];
  const F=[
    {id:'f1',name:'Sameer Das',family:'Ankit Das, brother',discharged:'9 Nov',appt:'12 Nov',doctor:'Dr. Madhura Samudra',check:'Due 14 Nov',checkCls:'chip grey',next:'30-day call 9 Dec'},
    {id:'f2',name:'Dev Kumar',family:'Sunita Kumar, mother',discharged:'4 Nov',appt:'8 Nov',doctor:'Dr. Ichpreet Singh',check:'Due today',checkCls:'chip amber',next:'30-day call 4 Dec'},
    {id:'f3',name:'Pooja Bhatt',family:'Rohan Bhatt, husband',discharged:'1 Nov',appt:'5 Nov',doctor:'Dr. Alisha Nagar',check:'Done 7 Nov',checkCls:'chip green',next:'30-day call 1 Dec'},
    {id:'f4',name:'Aman Gill',family:'Harjeet Gill, father',discharged:'28 Oct',appt:'1 Nov',doctor:'Dr. Ichpreet Singh',check:'Done 3 Nov',checkCls:'chip green',next:'Call centre to rebook'},
    {id:'f5',name:'Tarun Roy',family:'Mita Roy, sister',discharged:'25 Oct',appt:'29 Oct',doctor:'Dr. Madhura Samudra',check:'Done 31 Oct',checkCls:'chip green',next:'30-day call 24 Nov'}];
  P.forEach((p,i)=>{p.idx=i+1;});
  const pById={};P.forEach(p=>{pById[p.id]=p;});

  /* ---------------- state ---------------- */
  const S0={screen:'today',pid:'p2',recTab:'stay',stayFilter:'admitted',filter:'open',cid:'C-0141',showMore:false,overrides:{},reminded:{},concernStatus:{},extraConcerns:[],checks:{},resNote:'',familyTold:false,needFamilyTold:false,
    floor:'f2',floorMarks:{'f2:0':'ok','f2:1':'issue','f2:2':'ok'},roundDone:false,logOpen:false,form:{type:'concern',pid:'p2',raised:'Family',category:'Family updates',severity:'Medium',desc:''},
    nps:4,ratings:[5,4,4,2,4],outcomes:{f1:'',f2:'',f3:'Came for appointment',f4:'Did not show up',f5:'Found another hospital'}};
  const X=JSON.parse(JSON.stringify(S0));
  const stepStatus=(p,i)=>X.overrides[p.id+':'+i]||p.st[i];
  const rerender=()=>{try{render();}catch(e){console.warn(e);}};

  const ICO={
    check:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M5 12l5 5 9-10"/></svg>',
    done:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/></svg>',
    plus:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
    heart:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z"/></svg>'};

  /* ---------------- computed values ---------------- */
  const TY={request:['Request','ty blue'],concern:['Concern','ty amber'],grievance:['Grievance','ty red']};
  const SR={request:'#1e6cdb',concern:'#d48806',grievance:'#b42318'};
  const STATUS={'Open':'chip grey','In progress':'chip blue','Escalated':'chip red','Resolved':'chip green'};
  function allConcerns(){
    return C0.concat(X.extraConcerns).map(c=>{const s=X.concernStatus[c.id];return s?Object.assign({},c,s):c;}).map(c=>{
      const closed=c.status==='Resolved',p=pById[c.pid];
      return Object.assign({},c,{typeLabel:TY[c.type][0],tyCls:TY[c.type][1],sr:'--sr:'+(closed?'#11703a':SR[c.type]),slaText:closed&&c.slaTone!=='green'?'Closed':c.sla,slaCls:'chip '+(closed?'green':c.slaTone),
        statusCls:STATUS[c.status]||'chip grey',patient:p?p.name:'',room:p?p.room:'',isOpen:!closed,isClosed:closed,resolution:c.resolution||''});
    });
  }
  function tasksOf(){
    const t=[];
    P.forEach(p=>STEPS.forEach((step,i)=>{
      const s=stepStatus(p,i);if(s!=='overdue'&&s!=='due')return;
      const key=p.id+':'+i,reminded=!!X.reminded[key],who=step.owner==='Psychiatrist'?p.doctor:step.owner==='Psychologist'?p.psych:'you';
      const label=step.auto?step.name+' ('+step.when+') not logged':(i===6?'Coordinator random call, '+p.random+' done':step.name);
      t.push({st:s,pid:p.id,i,patient:p.name,step:label,owner:'Owner: '+who+' · '+p.room,tag:s==='overdue'?'Overdue':'Today',tagCls:'tag '+(s==='overdue'?'t-red':'t-risk'),when:s==='overdue'?'Overdue':'Due today',
        btnLabel:step.auto?(reminded?'Reminder sent':'Remind '+step.owner.toLowerCase()):'Mark done',btnCls:reminded?'btn sm ok':'btn sm'});
    }));
    t.sort((a,b)=>(a.st==='overdue'?0:1)-(b.st==='overdue'?0:1));
    return t;
  }

  /* ---------------- screens ---------------- */
  function today(all,openC,tasks){
    const first=tasks[0]||null,rest=tasks.slice(1),then=X.showMore?rest:rest.slice(0,5);
    const pcards=P.map(p=>{
      const sts=STEPS.map((x,i)=>stepStatus(p,i)),od=[],du=[];
      sts.forEach((x,i)=>{if(x==='overdue')od.push(STEPS[i].name);if(x==='due')du.push(STEPS[i].name);});
      const pc=openC.filter(c=>c.pid===p.id).length;let stTxt,stCls,lc;
      if(od.length){stTxt=od[0]+' overdue'+(od.length+du.length>1?' · +'+(od.length+du.length-1)+' more':'');stCls='st red';lc='l-red';}
      else if(du.length){stTxt=du[0]+' due today'+(du.length>1?' · +'+(du.length-1)+' more':'');stCls='st amber';lc='l-amber';}
      else if(pc){stTxt=pc+' open concern'+(pc>1?'s':'');stCls='st amber';lc='l-amber';}
      else{stTxt=p.discharging?'Discharge on '+p.discharge:'Nothing to do';stCls='st green';lc='';}
      const tag=p.vip?'VIP':p.isNew?'New':p.discharging?'Discharge':'',tagCls='tag '+(p.vip?'t-vip':p.isNew?'t-new':'t-grey');
      return `<button class="pc ${lc}" type="button" onclick="PXL.open('${p.id}')"><div style="display:flex;justify-content:space-between;gap:8px;width:100%"><span class="name">${h(p.name)}</span>${tag?`<span class="${tagCls}">${tag}</span>`:''}</div><div class="muted small">${h(p.room)} · Day ${p.day}</div><div class="${stCls}">${h(stTxt)}</div></button>`;
    }).join('');
    const reqs=openC.filter(c=>c.type==='request'),conc=openC.filter(c=>c.type!=='request').slice(0,4);
    return `<div class="hello"><div><h2>Good morning, Prabh</h2><div class="muted">Wednesday 11 November · ${tasks.length+openC.length} things to do</div></div>
      <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn" type="button" onclick="PXL.nav('floor')">Start floor round</button><button class="btn pri" type="button" onclick="PXL.log(true)">${ICO.plus}Log a concern</button></div></div>
    ${first?`<div class="starthere"><div class="muted small">Start here · This is late</div><div><span class="name">${h(first.step)}</span> · ${h(first.patient)} · <span style="color:#b42318;font-weight:600">${h(first.when)}</span></div><div class="muted small">${rest.length+openC.length} more things waiting after this one.</div><div><button class="btn pri" type="button" onclick="PXL.task('${first.pid}',${first.i})">${h(first.btnLabel)}</button></div></div>`:''}
    <div class="cols"><div class="cm">
      <section class="card"><div class="chead"><h3>Then</h3><span class="muted small">Doctor and psychologist calls tick off from the HMS call log</span></div><div>
        ${then.map(t=>`<div class="listrow"><span class="${t.tagCls}">${t.tag}</span><div class="grow"><span class="name">${h(t.patient)}</span> · ${h(t.step)}<div class="muted small">${h(t.owner)}</div></div><button class="${t.btnCls}" type="button" onclick="PXL.task('${t.pid}',${t.i})">${ICO.done}${h(t.btnLabel)}</button><button class="btn sm link" type="button" onclick="PXL.open('${t.pid}')">Open record</button></div>`).join('')}</div>
        ${rest.length>5?`<button class="more" type="button" onclick="PXL.more()">${X.showMore?'Show fewer':'See '+(rest.length-5)+' more'}</button>`:''}</section>
      <section class="card"><div class="chead"><h3>My patients</h3><button class="btn sm link" type="button" onclick="PXL.nav('stays')">All stays</button></div><div class="pgrid">${pcards}</div></section>
    </div><div class="cs">
      <section class="card"><div class="chead"><h3>Concerns on the clock</h3><button class="btn sm link" type="button" onclick="PXL.nav('concerns','open')">See all</button></div><div>
        ${conc.map(c=>`<div class="listrow"><div class="grow"><div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"><span class="${c.tyCls}">${c.typeLabel}</span><span class="${c.slaCls}">${h(c.slaText)}</span></div><div class="name" style="margin-top:4px">${h(c.title)}</div><div class="muted small">${h(c.patient)} · ${h(c.owner)}</div></div><button class="btn sm" type="button" onclick="PXL.concern('${c.id}')">Open</button></div>`).join('')}</div></section>
      <section class="card"><div class="chead"><h3>Family call requests</h3><span class="muted small">In the doctor's call queue</span></div><div>
        ${reqs.map(c=>`<div class="listrow"><div class="grow"><div class="name">${h(c.title)}</div><div class="muted small">${h(c.raisedBy)} · for ${h(c.owner)}</div></div><span class="${c.slaCls}">${h(c.slaText)}</span></div>`).join('')}</div></section>
      <section class="card"><div class="chead"><h3>On the floor today</h3><button class="btn sm link" type="button" onclick="PXL.nav('floor')">Floor round</button></div><div>
        ${[['dot d-amber','Floor 2 round in progress','3 of 8 checked · 1 issue sent to kitchen'],['dot d-blue','2 family visits at 4 pm','Neel Bose, Floor 2 · security has the list'],['dot d-grey','1 discharge on 13 Nov','Rahul Sethi · bill estimate still pending']].map(f=>`<div class="listrow"><span class="${f[0]}"></span><div class="grow"><div class="name">${f[1]}</div><div class="muted small">${f[2]}</div></div></div>`).join('')}</div></section>
    </div></div>`;
  }
  function stayCards(openC){
    return P.map(p=>{const sts=STEPS.map((x,i)=>stepStatus(p,i)),od=[],du=[];sts.forEach((x,i)=>{if(x==='overdue')od.push(STEPS[i].name);if(x==='due')du.push(STEPS[i].name);});return {p,sts,od,du,pc:openC.filter(c=>c.pid===p.id).length};});
  }
  function stays(openC){
    const pcs=stayCards(openC),AV=['av-red','av-violet','av-green','av-amber','av-tint'];
    const fl=pcs.filter(x=>X.stayFilter==='admitted'?true:X.stayFilter==='attention'?(x.od.length||x.du.length):x.p.discharging);
    const rows=fl.map((x,i)=>{
      const p=x.p,doneN=x.sts.filter(v=>v==='done').length,ni=x.sts.findIndex(v=>v!=='done'),due=[];
      x.od.forEach(n=>due.push(['dot d-red',n,'overdue']));x.du.forEach(n=>due.push(['dot d-amber',n,'today']));if(x.pc)due.push(['dot d-blue',x.pc+' open concern'+(x.pc>1?'s':''),'on the clock']);
      const tag=p.vip?'VIP':p.isNew?'New':p.discharging?'Discharge':'',tagCls='tag '+(p.vip?'t-vip':p.isNew?'t-new':'t-grey'),sr=x.od.length?'#b42318':x.du.length?'#d48806':'transparent';
      return `<tr class="ck" data-n="${h(p.name.toLowerCase())}" style="--sr:${sr}" onclick="PXL.open('${p.id}')"><td><div class="prow"><div class="avatar ${AV[i%AV.length]}" style="width:38px;height:38px;font-size:13px">${p.ini}</div><div><div style="display:flex;gap:6px;align-items:center"><span class="name">${h(p.name)}</span>${tag?`<span class="${tagCls}">${tag}</span>`:''}</div><div class="pmeta">Day ${p.day} · ${h(p.room)} · ${h(p.doctor)}</div></div></div></td>
        <td><div class="prog"><div class="ph"><span>${doneN} of 9 done</span></div><div class="bar"><i style="width:${Math.round(doneN/9*100)}%"></i></div><div class="muted small">Next: ${ni<0?'All done':h(STEPS[ni].name)}</div></div></td>
        <td><div class="due">${due.slice(0,3).map(d=>`<div><span class="${d[0]}"></span><span><span class="name">${h(d[1])}</span><br><span class="muted small">${d[2]}</span></span></div>`).join('')}${due.length?'':'<span class="muted small">Nothing due</span>'}</div></td>
        <td><div class="name">${h(p.gName)}</div><div class="muted small">${h(p.gRel)} · last contact ${h(p.lastContact)}</div></td>
        <td><button class="btn sm" type="button" onclick="event.stopPropagation();PXL.open('${p.id}')">Open record</button></td></tr>`;
    }).join('');
    const segs=[['admitted','Admitted',pcs.length],['attention','Needs you today',pcs.filter(x=>x.od.length||x.du.length).length],['discharging','Discharging this week',pcs.filter(x=>x.p.discharging).length]]
      .map(g=>`<button class="${X.stayFilter===g[0]?'on':''}" type="button" onclick="PXL.stayF('${g[0]}')">${g[1]} <span class="n">${g[2]}</span></button>`).join('');
    return `<div class="toolbar"><div class="seg" role="tablist">${segs}</div><input class="search" type="search" placeholder="Type a name" aria-label="Search patients" oninput="PXL.search(this.value)"></div>
      <section class="card" style="overflow:hidden"><div class="scrollx"><table class="pt"><thead><tr><th>Patient</th><th>Stay steps</th><th>Due for you</th><th>Family</th><th></th></tr></thead><tbody id="pxStayBody">${rows}</tbody></table></div></section>`;
  }
  function record(all){
    const sp=pById[X.pid],SL={done:['Done','chip green','step s-done'],overdue:['Overdue','chip red','step s-overdue'],due:['Due today','chip amber','step s-due'],up:['Upcoming','chip grey','step']};
    const checks=CK.map(c=>{const key=sp.id+':'+c[0],on=X.checks[key]!==undefined?X.checks[key]:sp.ck.indexOf(c[0])>-1;return {key,label:c[1],sub:c[2],on};});
    const dis=[['Discharge summary signed','Psychiatrist','Done','done'],['Follow-up appointment booked','Front desk','Booked 16 Nov','done'],['Medicines ready from Tulasi pharmacy','Pharmacy (Khalid)','Pending','due'],['Final bill and insurance papers shared','Billing desk','Concern open','overdue'],
      ['Belongings returned and signed for','Front desk and security','On discharge day','up'],['Discharge briefing with family','Psychiatrist and psychologist','On discharge day','up'],['Discharge feedback taken','You','On discharge day','up'],['Handed to call centre for 48-hour check','You, then Kanika','After discharge','up']];
    const DM={done:['dot d-green','chip green'],due:['dot d-amber','chip amber'],overdue:['dot d-red','chip red'],up:['dot d-grey','chip grey']};
    const tabs=[['stay','Stay'],['family','Family and visits'],['prefs','Preferences and belongings'],['concerns','Concerns']];if(sp.discharging)tabs.push(['discharge','Discharge handoff']);
    const tab=(X.recTab==='discharge'&&!sp.discharging)?'stay':X.recTab;
    const tl=[{d:sp.admitted.split(',')[0],t:'Admitted',s:sp.admType+' · forms signed by '+sp.gName,c:'#1e6cdb'}];
    STEPS.forEach((s,i)=>{if(stepStatus(sp,i)==='done')tl.push({d:'',t:s.name+(s.auto?' ('+s.when+')':''),s:s.auto?'Logged automatically from the HMS call':'Done by Prabh',c:'#11703a'});});
    if(sp.discharging)tl.push({d:sp.discharge,t:'Planned discharge',s:'Set by '+sp.doctor,c:'#a8b3c2'});
    const sc=all.filter(c=>c.pid===sp.id),next=P[sp.idx%P.length],kv=a=>a.map(x=>`<div class="kvrow"><div class="k">${h(x[0])}</div><div class="grow">${h(x[1])}</div></div>`).join('');
    const ckDone=checks.filter(c=>c.on).length;let body='';
    if(tab==='stay')body=`<section class="card"><div class="chead"><h3>Stay steps</h3><span class="muted small">Green done · amber due today · red overdue · grey upcoming</span></div><div class="scrollx"><div class="steps">
        ${STEPS.map((step,i)=>{const s=stepStatus(sp,i),m=SL[s];return `<div class="${m[2]}"><div class="pxsn">${h(step.name)}</div><div class="pxsw">${h(step.when)}</div><div><span class="${m[1]}">${m[0]}</span></div><div class="pxsw">${step.auto?'Ticks from call log':(i===6?h(sp.random)+' done':'Owner: you')}</div></div>`;}).join('')}</div></div></section>
      <div class="cols"><section class="card" style="flex:1 1 360px"><div class="chead"><h3>Admission day checklist</h3><span class="chip grey">${ckDone} of ${checks.length}</span></div><div>
        ${checks.map(c=>`<div class="checkrow"><button class="cbx${c.on?' on':''}" type="button" onclick="PXL.check('${c.key}',${c.on?'false':'true'})" aria-label="Mark ${h(c.label)}">${ICO.check}</button><div class="grow"><div class="name">${h(c.label)}</div><div class="muted small">${h(c.sub)}</div></div></div>`).join('')}</div></section>
        <section class="card" style="flex:1 1 360px"><div class="chead"><h3>Stay timeline</h3></div><div>${tl.map(l=>`<div class="tl"><div class="tld">${h(l.d)}</div><span class="tlm" style="background:${l.c}"></span><div class="grow"><div class="name">${h(l.t)}</div><div class="muted small">${h(l.s)}</div></div></div>`).join('')}</div></section></div>`;
    else if(tab==='family')body=`<div class="cols"><section class="card" style="flex:3 1 460px"><div class="chead"><h3>Family contact log</h3><button class="btn sm" type="button" onclick="PXL.stub('Call note added to the contact log')">Add call note</button></div><div>
        ${sp.log.map(l=>`<div class="tl"><div class="tld">${h(l.d)}</div><span class="tlm" style="background:#1e6cdb"></span><div class="grow"><div class="name">${h(l.what)}</div><div class="muted small">${h(l.who)} · ${h(l.time)} · ${h(l.how)}</div>${l.note?`<div class="small" style="margin-top:4px">${h(l.note)}</div>`:''}</div></div>`).join('')}
        ${sp.log.length?'':'<div class="cpad muted">No contact logged yet.</div>'}</div></section>
        <section class="card" style="flex:2 1 320px"><div class="chead"><h3>Visits and outings</h3><span class="muted small">Security sees this list</span></div><div>${kv(sp.visits)}</div></section></div>`;
    else if(tab==='prefs')body=`<div class="cols"><section class="card" style="flex:1 1 380px"><div class="chead"><h3>Preferences</h3><button class="btn sm" type="button" onclick="PXL.stub('Preferences are edited in the patient record')">Edit</button></div><div class="muted small" style="padding:10px 20px 0">Shared by the care team. Nursing, kitchen and front desk can read this.</div><div style="padding-top:6px">${kv(sp.prefs)}</div></section>
        <section class="card" style="flex:1 1 380px"><div class="chead"><h3>Belongings</h3><span class="muted small">Logged at admission with front desk</span></div><div>${kv(sp.belongings)}</div></section></div>`;
    else if(tab==='concerns')body=`<section class="card"><div class="chead"><h3>Concerns for this stay</h3><button class="btn sm soft" type="button" onclick="PXL.log(true)">+ Log concern</button></div><div>
        ${sc.map(c=>`<div class="listrow"><span class="${c.tyCls}" style="flex:0 0 90px">${c.typeLabel}</span><div class="grow"><div class="name">${h(c.title)}</div><div class="muted small">${h(c.raisedBy)} · ${h(c.owner)}</div></div><span class="${c.slaCls}">${h(c.slaText)}</span><button class="btn sm" type="button" onclick="PXL.concern('${c.id}')">Open</button></div>`).join('')}
        ${sc.length?'':'<div class="cpad muted">No concerns logged for this stay.</div>'}</div></section>`;
    else body=`<section class="card"><div class="chead"><h3>Discharge handoff</h3><span class="muted small">Each team ticks its own step. You see the whole list.</span></div><div>
        ${dis.map(r=>{const m=DM[r[3]];return `<div class="checkrow"><span class="${m[0]}"></span><div class="grow"><div class="name">${h(r[0])}</div><div class="muted small">${h(r[1])}</div></div><span class="${m[1]}">${h(r[2])}</span></div>`;}).join('')}</div></section>`;
    return `<div class="toolbar"><div class="crumb"><button class="btn sm link" type="button" onclick="PXL.nav('stays')">Patient experience</button>/<span>Stays</span>/<b>${h(sp.name)}</b></div>
      <div style="display:flex;gap:10px;align-items:center"><span class="muted small">Patient ${sp.idx} of ${P.length}</span><button class="btn sm link" type="button" onclick="PXL.open('${next.id}','${tab}')">${h(next.name)} ›</button></div></div>
      <section class="card shb"><div class="hdr"><div style="display:flex;flex-direction:column;gap:14px;flex:1 1 420px;min-width:0">
        <div class="idr"><div class="avatar av-ink" style="width:54px;height:54px;font-size:15px">${sp.ini}</div><div><div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"><span class="nm">${h(sp.name)}</span>${sp.vip?'<span class="tag t-vip">VIP</span>':''}${sp.isNew?'<span class="tag t-new">New</span>':''}</div><div class="pmeta">${h(sp.room)} · UHID ${h(sp.uhid)} · Day ${sp.day}</div></div></div>
        <div class="team"><span class="lbl">Treating team</span><div class="prow"><div class="avatar av-tint" style="width:30px;height:30px;font-size:11px">${h(sp.docIni)}</div><div><div class="name small">${h(sp.doctor)}</div><div class="muted small">Psychiatrist</div></div></div>
          <div class="prow"><div class="avatar av-violet" style="width:30px;height:30px;font-size:11px">${h(sp.psyIni)}</div><div><div class="name small">${h(sp.psych)}</div><div class="muted small">Psychologist</div></div></div></div></div>
        <div class="act"><button class="btn pri" type="button" onclick="PXL.stub('Calling the family through the HMS')">Call family</button><button class="btn" type="button" onclick="PXL.stub('Message to the family opened')">Message family</button><button class="btn soft" type="button" onclick="PXL.log(true)">+ Log concern</button></div></div>
        <div class="kf"><div><div class="lbl">Admitted</div><div class="v">${h(sp.admitted)}</div><div class="muted small">${h(sp.admType)}</div></div><div><div class="lbl">Nominated representative</div><div class="v">${h(sp.nr)}</div><div class="muted small">Can receive updates</div></div>
          <div><div class="lbl">Family contact</div><div class="v">${h(sp.guardian)}</div><div class="muted small">${h(sp.phone)}</div></div><div><div class="lbl">Expected discharge</div><div class="v">${h(sp.discharge)}</div><div class="muted small">Set by psychiatrist</div></div></div>
        <div class="muted small" style="margin-top:14px">Diagnosis, notes and medicines are not shown in the patient experience view.</div></section>
      <div class="utabs" role="tablist">${tabs.map(t=>`<button class="utab${tab===t[0]?' on':''}" type="button" onclick="PXL.tab('${t[0]}')">${t[1]}</button>`).join('')}</div>${body}`;
  }
  function concerns(all){
    const FILTERS=[['open','Open'],['request','Requests'],['concern','Concerns'],['grievance','Grievances'],['all','All']];
    const match=(f,c)=>f==='all'?true:f==='open'?c.isOpen:c.type===f;
    const cur=all.filter(c=>c.id===X.cid)[0]||all[0];
    return `<div class="toolbar"><div class="seg" role="tablist">${FILTERS.map(f=>`<button class="${X.filter===f[0]?'on':''}" type="button" onclick="PXL.filt('${f[0]}')">${f[1]} <span class="n">${all.filter(c=>match(f[0],c)).length}</span></button>`).join('')}</div>
        <button class="btn pri" type="button" onclick="PXL.log(true)">${ICO.plus}Log a concern</button></div>
      <div class="cols"><section class="card" style="flex:3 1 560px;overflow:hidden"><div class="scrollx"><table class="pt"><thead><tr><th>Type</th><th>Concern</th><th>Patient</th><th>Owner</th><th>Time left</th><th>Status</th></tr></thead><tbody>
        ${all.filter(c=>match(X.filter,c)).map(c=>`<tr class="ck${c.id===X.cid?' sel':''}" style="${c.sr}" onclick="PXL.concern('${c.id}',true)"><td><span class="${c.tyCls}">${c.typeLabel}</span><div class="muted small">${c.id}</div></td><td><div class="name">${h(c.title)}</div><div class="muted small">${h(c.category)} · ${h(c.raisedBy)}</div></td><td>${h(c.patient)}<div class="muted small">${h(c.room)}</div></td><td>${h(c.owner)}<div class="muted small">${h(c.ownerRole)}</div></td><td><span class="${c.slaCls}">${h(c.slaText)}</span></td><td><span class="${c.statusCls}">${h(c.status)}</span></td></tr>`).join('')}
        </tbody></table></div></section>
      <section class="card" style="flex:2 1 340px"><div class="chead"><div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center"><span class="${cur.tyCls}">${cur.typeLabel}</span><span class="${cur.statusCls}">${h(cur.status)}</span><span class="${cur.slaCls}">${h(cur.slaText)}</span></div><span class="muted small">${cur.id}</span></div>
        <div class="cpad" style="display:flex;flex-direction:column;gap:14px"><div><h3 style="font-size:17px">${h(cur.title)}</h3><div class="muted small" style="margin-top:4px">Logged ${h(cur.logged)} · via ${h(cur.via)}</div></div>
          <div class="kf" style="margin-top:0"><div><div class="lbl">Patient</div><div class="v">${h(cur.patient)}</div></div><div><div class="lbl">Raised by</div><div class="v">${h(cur.raisedBy)}</div></div><div><div class="lbl">Category</div><div class="v">${h(cur.category)}</div></div><div><div class="lbl">Owner</div><div class="v">${h(cur.owner)}</div><div class="muted small">${h(cur.ownerRole)}</div></div></div>
          <div><div class="lbl" style="margin-bottom:4px">What they said</div><div>${h(cur.desc)}</div></div>
          ${cur.isOpen?`<div class="field"><label for="pxRes">Resolution note</label><textarea id="pxRes" placeholder="What was done, and by whom" oninput="PXL.setRes(this.value)">${h(X.resNote)}</textarea></div>
            <div class="checkrow" style="padding:0;border:0"><button class="cbx${X.familyTold?' on':''}" type="button" onclick="PXL.told()" aria-label="Family told">${ICO.check}</button><span>Family has been told how it was resolved</span></div>
            <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn pri sm" type="button" onclick="PXL.resolve('${cur.id}')">Mark resolved</button><button class="btn sm" type="button" onclick="PXL.escalate('${cur.id}')">Escalate to GM Ops</button></div>
            ${X.needFamilyTold?'<div class="note">Tell the family how it was resolved before you close it.</div>':''}`:''}
          ${cur.isClosed?`<div class="info">${h(cur.resolution)}</div>`:''}</div></section></div>`;
  }
  function floor(){
    const FL={f1:'Floor 1',f2:'Floor 2',f3:'Floor 3'},segs=['f1','f2','f3'].map(f=>`<button class="${X.floor===f?'on':''}" type="button" onclick="PXL.floor('${f}')">${FL[f]} <span class="n">${P.filter(p=>p.floor===f).length}</span></button>`).join('');
    const done=FLOOR.filter((it,i)=>X.floorMarks[X.floor+':'+i]).length,issues=FLOOR.filter((it,i)=>X.floorMarks[X.floor+':'+i]==='issue').length;
    const note=X.roundDone?'Round saved. '+issues+' issue'+(issues===1?'':'s')+' sent to the owning team as concerns.':issues+' issue'+(issues===1?'':'s')+' so far. Each one becomes a concern for its owner when you finish.';
    return `<div class="hello"><div><h2>Floor round</h2><div class="muted">Walk each floor once a day. An issue goes straight to the team that owns it, with a due time.</div></div><div class="seg" role="tablist">${segs}</div></div>
      <div class="cols"><section class="card" style="flex:3 1 540px"><div class="chead"><h3>${FL[X.floor]} checklist</h3><span class="chip grey">${done} of ${FLOOR.length} checked</span></div><div>
        ${FLOOR.map((it,i)=>{const v=X.floorMarks[X.floor+':'+i];return `<div class="checkrow"><div class="grow"><div class="name">${h(it[0])}</div><div class="muted small">Owner if not OK: ${h(it[1])}</div></div><div class="okissue"><button class="${v==='ok'?'ok-on':''}" type="button" onclick="PXL.mark(${i},'ok')">OK</button><button class="${v==='issue'?'is-on':''}" type="button" onclick="PXL.mark(${i},'issue')">Issue</button></div></div>`;}).join('')}</div>
        <div class="cpad" style="border-top:1px solid #eef2f6;display:flex;gap:10px;align-items:center;flex-wrap:wrap"><button class="btn pri" type="button" onclick="PXL.finish()">Finish round</button><span class="muted small">${h(note)}</span></div></section>
      <section class="card" style="flex:2 1 340px"><div class="chead"><h3>Who owns what on the floor</h3><span class="muted small">On shift today</span></div><div>
        ${OWNERS.map(o=>`<div class="listrow" style="padding:11px 20px"><div class="avatar av-tint" style="width:32px;height:32px;font-size:11px">${o[0]}</div><div class="grow"><div class="name">${h(o[1])}</div><div class="muted small">${h(o[2])} · ${h(o[3])}</div></div></div>`).join('')}</div></section></div>`;
  }
  function feedback(){
    const RL=['Admission and registration','Doctor communication','Nursing and attendants','Family updates','Discharge briefing'];
    return `<div class="cols"><section class="card" style="flex:2 1 400px"><div class="chead"><h3>Discharge feedback</h3><span class="chip amber">2 waiting</span></div><div class="cpad" style="display:flex;flex-direction:column;gap:14px">
        <div class="field"><label for="pxFbp">Patient</label><select id="pxFbp"><option>Rahul Sethi · discharge 13 Nov</option><option>Sameer Das · discharged 9 Nov</option></select></div>
        <div><div class="name" style="margin-bottom:8px">How likely are you to recommend Tulasi to a friend or family member?</div><div class="nps">${[0,1,2,3,4,5,6,7,8,9,10].map(n=>`<button class="npsb${X.nps===n?' on':''}" type="button" onclick="PXL.nps(${n})" aria-label="Score ${n}">${n}</button>`).join('')}</div><div class="muted small" style="margin-top:6px">0 not at all · 10 extremely likely</div></div>
        <div>${RL.map((label,ri)=>`<div class="rate"><span>${label}</span><div style="display:flex;gap:4px">${[1,2,3,4,5].map(n=>`<button class="starb${X.ratings[ri]===n?' on':''}" type="button" onclick="PXL.rate(${ri},${n})" aria-label="${label} ${n} of 5">${n}</button>`).join('')}</div></div>`).join('')}</div>
        <div class="field"><label for="pxFb1">What could be better?</label><textarea id="pxFb1" placeholder="In their words"></textarea></div>
        <div class="field"><label for="pxFb2">What helped most?</label><textarea id="pxFb2" placeholder="In their words"></textarea></div>
        ${X.nps<=6?'<div class="note">Score of 6 or below. Saving this opens a concern for you to follow up.</div>':''}
        <div><button class="btn pri" type="button" onclick="PXL.saveFb()">Save feedback</button></div></div></section>
      <section class="card" style="flex:3 1 560px;overflow:hidden"><div class="chead"><h3>After discharge</h3><span class="muted small">Shared with the call centre. Outcome is a fixed list so lost patients can be counted.</span></div><div class="scrollx"><table class="pt"><thead><tr><th>Patient</th><th>First follow-up</th><th>48-hour check</th><th>Outcome</th><th>Next</th></tr></thead><tbody>
        ${F.map(f=>{const o=X.outcomes[f.id]||'',lost=o==='Found another hospital'||o==='Found another doctor';
          return `<tr style="--sr:${lost?'#b42318':o==='Did not show up'?'#d48806':'transparent'}"><td><div class="name">${h(f.name)}</div><div class="pmeta">Discharged ${h(f.discharged)} · ${h(f.family)}</div></td><td>${h(f.appt)}<div class="muted small">${h(f.doctor)}</div></td><td><span class="${f.checkCls}">${h(f.check)}</span></td>
          <td><div class="field"><select aria-label="Outcome for ${h(f.name)}" onchange="PXL.outcome('${f.id}',this.value)"><option value="">Choose outcome</option>${['Came for appointment','Rescheduled','Did not show up','Found another hospital','Found another doctor','Readmitted'].map(x=>`<option ${o===x?'selected':''}>${x}</option>`).join('')}</select></div>${lost?'<div class="small" style="color:#b42318;margin-top:4px">Counts as lost in the weekly report</div>':''}</td><td><span class="muted small">${h(f.next)}</span></td></tr>`;}).join('')}
        </tbody></table></div></section></div>`;
  }
  function report(){
    const tiles=[['Admissions','14','Gurgaon IPD'],['Admission day checklist','11 of 14','All 7 steps done'],['24-hour calls on time','10 of 14','From HMS call log'],['Concerns closed in 6 hours','6 of 8','2 went to GM Ops'],['Floor rounds done','19 of 21','9 issues found, 7 closed'],['Discharge NPS','+67','9 responses'],['Lost after discharge','2','1 other hospital, 1 other doctor']];
    const bd=[['Dr. Aanya Sharma',5,'4 of 5','amber','3 of 5','amber','5 of 5','green',2,'+60'],['Dr. Alisha Nagar',4,'3 of 4','amber','4 of 4','green','3 of 4','amber',1,'+100'],['Dr. Madhura Samudra',5,'3 of 5','red','3 of 5','red','4 of 5','amber',3,'+50']];
    const th=[['Clinical team (updates, calls)',5,'100%'],['Kitchen',3,'60%'],['Housekeeping',3,'60%'],['Nursing',2,'40%'],['Billing',1,'20%']];
    return `<div class="hello"><div><h2>Week of 3 to 9 November</h2><div class="muted">Gurgaon IPD · replaces the weekly rollup in Excel</div></div><button class="btn" type="button" onclick="PXL.stub('The weekly report is ready for the ops review')">Download for ops review</button></div>
      <div class="tiles">${tiles.map(t=>`<div class="tile"><span class="lbl">${t[0]}</span><b>${t[1]}</b><span class="muted small">${t[2]}</span></div>`).join('')}</div>
      <div class="cols"><section class="card" style="flex:3 1 560px;overflow:hidden"><div class="chead"><h3>Family calls by treating psychiatrist</h3></div><div class="scrollx"><table class="pt"><thead><tr><th>Psychiatrist</th><th>Admissions</th><th>24-hour call</th><th>Day 3-4 call</th><th>Psychologist Day 3-4</th><th>Concerns</th><th>NPS</th></tr></thead><tbody>
        ${bd.map(d=>`<tr><td class="name">${d[0]}</td><td>${d[1]}</td><td><span class="chip ${d[3]}">${d[2]}</span></td><td><span class="chip ${d[5]}">${d[4]}</span></td><td><span class="chip ${d[7]}">${d[6]}</span></td><td>${d[8]}</td><td>${d[9]}</td></tr>`).join('')}</tbody></table></div></section>
        <section class="card" style="flex:2 1 340px"><div class="chead"><h3>Issues by team</h3><span class="muted small">Concerns and floor round issues</span></div><div>
        ${th.map(t=>`<div class="listrow" style="padding:11px 20px"><div style="flex:0 0 150px">${t[0]}</div><div class="bar blue" style="flex:1 1 100px"><i style="width:${t[2]}"></i></div><div class="name" style="flex:0 0 24px;text-align:right">${t[1]}</div></div>`).join('')}</div>
        <div class="cpad"><div class="note">Family updates is the top theme again: the same update every day, with little insight.</div></div></section></div>`;
  }
  function drawer(){
    if(!X.logOpen)return '';
    const f=X.form,TYPES=[['request','Request'],['concern','Concern'],['grievance','Grievance']];
    const HINT={request:'Something to get done today, like a call from the doctor or a diet change.',concern:'Something went wrong and needs fixing. 6-hour resolution.',grievance:'A formal complaint. Goes to GM Operations straight away.'};
    const DUE={request:'Due by end of day. You are alerted if it slips.',concern:'Due in 6 hours. You are alerted at 5 hours, and it goes to GM Operations if missed.',grievance:'Sent to S Chandra (GM Operations) now. Due in 6 hours and fully logged.'};
    const route=f.type==='grievance'?['S Chandra','GM Operations']:(ROUTES[f.category]||ROUTES.Other);
    const opt=(list,cur)=>list.map(x=>`<option ${cur===x?'selected':''}>${x}</option>`).join('');
    return `<div class="pxl-overlay" onclick="if(event.target===this)PXL.log(false)"><div class="pxl" role="dialog" aria-label="Log a concern">
      <div class="toolbar"><h3>Log a concern</h3><button class="btn sm link" type="button" onclick="PXL.log(false)">Close</button></div>
      <div class="field"><label>Type</label><div class="seg">${TYPES.map(t=>`<button class="${f.type===t[0]?'on':''}" type="button" onclick="PXL.type('${t[0]}')">${t[1]}</button>`).join('')}</div><div class="muted small">${HINT[f.type]}</div></div>
      <div class="fgrid"><div class="field"><label for="pxLp">Patient</label><select id="pxLp" onchange="PXL.fset('pid',this.value)">${P.map(p=>`<option value="${p.id}" ${f.pid===p.id?'selected':''}>${h(p.name)} · ${h(p.room)}</option>`).join('')}</select></div>
        <div class="field"><label for="pxLr">Raised by</label><select id="pxLr" onchange="PXL.fset('raised',this.value)">${opt(['Family','Patient','Ward staff','Front desk','Call centre','Floor round'],f.raised)}</select></div>
        <div class="field"><label for="pxLc">Category</label><select id="pxLc" onchange="PXL.fset('category',this.value,true)">${opt(Object.keys(ROUTES),f.category)}</select></div>
        <div class="field"><label for="pxLs">Severity</label><select id="pxLs" onchange="PXL.fset('severity',this.value)">${opt(['Low','Medium','High'],f.severity)}</select></div></div>
      <div class="field"><label for="pxLd">What did they say?</label><textarea id="pxLd" placeholder="In their words" oninput="PXL.fset('desc',this.value)">${h(f.desc)}</textarea></div>
      <div class="field"><label>Goes to</label><div class="info" style="margin:0"><span class="name">${h(route[0])}</span> · ${h(route[1])}</div><div class="muted small">Picked from the category. You can change it after saving.</div></div>
      <div class="note">${DUE[f.type]}</div>
      <div style="display:flex;gap:8px;margin-top:auto"><button class="btn pri" type="button" onclick="PXL.save()">Save and assign</button><button class="btn" type="button" onclick="PXL.log(false)">Cancel</button></div></div></div>`;
  }

  /* ---------------- shell hooks ---------------- */
  const TITLES={today:'Patient experience',stays:'Inpatient stays',record:'Inpatient stays',concerns:'Concerns',floor:'Floor round',feedback:'Feedback and follow-up',report:'Weekly report'};
  const HASH={today:'#/myday',stays:'#/pxstays',record:'#/pxrecord',concerns:'#/pxconcerns',floor:'#/pxfloor',feedback:'#/pxfeedback',report:'#/pxreport'};
  const screenOf=r=>{const k=r[0];if(k==='myday')return 'today';if(k==='inpatients')return 'stays';return /^px/.test(k)?k.slice(2):null;};
  const own=r=>{const s=screenOf(r);return !!s&&Object.prototype.hasOwnProperty.call(TITLES,s);};

  const __side=renderSide;
  renderSide=function(route){
    /* on this role's own screens the sidebar is built here (the older layers expect the inpatient menu, which this role does not have) */
    if(!own(route||[]))return __side.apply(this,arguments);
    try{
      const scr=screenOf(route||[]),openN=allConcerns().filter(c=>c.isOpen).length;
      const nav=(h2,ic,label,on,extra)=>`<button class="nav ${on?'on':''}" onclick="go('${h2}')" title="${label}" aria-label="${label}">${ic}<span class="tx">${label}</span>${extra||''}</button>`;
      const sub=(key,label,cnt)=>`<button class="sub ${scr===key||(key==='stays'&&scr==='record')?'on':''}" onclick="PXL.nav('${key}')">${label}${cnt?`<span class="pxcnt">${cnt}</span>`:''}</button>`;
      const m=me();
      $('side').innerHTML=`
        <div class="brand"><div class="mark" style="background:#fff;padding:2px"><img src="logo.png" alt="Tulasi Healthcare" style="width:100%;height:100%;object-fit:contain"></div><div class="tx" style="font-weight:700;font-size:15px">Tulasi Healthcare</div></div>
        <div class="lbl" style="padding:6px 14px">Main menu</div>
        ${nav('#/existing/Dashboard',icon.dash,'Dashboard',false)}${nav('#/existing/All Patients',icon.users,'All Patients',false)}
        ${nav('#/myday',ICO.heart,'Patient experience',true)}
        ${sub('today','Today')}${sub('stays','Stays')}${sub('concerns','Concerns',openN)}${sub('floor','Floor round')}${sub('feedback','Feedback')}${sub('report','Weekly report')}
        ${nav('#/existing/My Calendar',icon.cal,'My Calendar',false)}${nav('#/existing/Messages',icon.msg,'Messages',false)}${nav('#/existing/Setting',icon.gear,'Setting',false)}
        <div class="me" style="cursor:pointer" onclick="accountModal()" title="Account and log out"><div class="row" style="gap:10px">${av('PK',32)}<div class="who"><div style="font-weight:600;font-size:13px">Prabh</div><div class="tiny muted">Patient experience · Gurgaon</div></div></div></div>`;
      $('topAv').textContent='PK';$('topName').textContent='Patient Experience';
      const rs=$('roleSeg');if(rs)rs.innerHTML='';
    }catch(e){console.warn(e);}
  };

  const __render=render;
  render=function(){
    const r=(location.hash||'#/myday').slice(2).split('/');
    if(!own(r))return __render.apply(this,arguments);
    const scr=screenOf(r);X.screen=scr;
    try{$('app').classList.remove('compact');}catch(e){}
    renderSide(r);
    const all=allConcerns(),openC=all.filter(c=>c.isOpen),tasks=tasksOf();
    let body='';
    if(scr==='today')body=today(all,openC,tasks);else if(scr==='stays')body=stays(openC);else if(scr==='record')body=record(all);else if(scr==='concerns')body=concerns(all);
    else if(scr==='floor')body=floor();else if(scr==='feedback')body=feedback();else body=report();
    $('title').textContent=TITLES[scr];
    $('view').innerHTML=`<div class="pxl">${body}</div>`+drawer();
  };

  /* ---------------- actions ---------------- */
  const setHash=(scr)=>{const t=HASH[scr];if((location.hash||'#/myday')===t)rerender();else location.hash=t;};
  window.PXL={
    nav(scr,filter){if(filter)X.filter=filter;setHash(scr);},
    open(pid,tab){X.pid=pid;X.recTab=tab||'stay';setHash('record');},
    tab(t){X.recTab=t;rerender();},
    concern(cid,stay){X.cid=cid;X.resNote='';X.familyTold=false;X.needFamilyTold=false;if(!stay)X.filter='all';setHash('concerns');},
    filt(f){X.filter=f;rerender();},
    stayF(f){X.stayFilter=f;rerender();},
    search(v){v=String(v||'').toLowerCase().trim();document.querySelectorAll('#pxStayBody tr').forEach(tr=>{tr.style.display=!v||(tr.dataset.n||'').indexOf(v)>=0?'':'none';});},
    more(){X.showMore=!X.showMore;rerender();},
    task(pid,i){const key=pid+':'+i,step=STEPS[i];if(step.auto)X.reminded[key]=true;else X.overrides[key]='done';rerender();},
    check(key,on){X.checks[key]=on;rerender();},
    setRes(v){X.resNote=v;},
    told(){X.familyTold=!X.familyTold;X.needFamilyTold=false;rerender();},
    resolve(cid){
      if(!X.familyTold){X.needFamilyTold=true;rerender();return;}
      X.concernStatus[cid]=Object.assign({},X.concernStatus[cid]||{},{status:'Resolved',slaTone:'green',sla:'Closed today',resolution:(X.resNote||'Resolved.')+' Family told by Prabh.'});X.resNote='';X.familyTold=false;rerender();
    },
    escalate(cid){X.concernStatus[cid]=Object.assign({},X.concernStatus[cid]||{},{status:'Escalated',owner:'S Chandra',ownerRole:'GM Operations'});rerender();},
    floor(f){X.floor=f;X.roundDone=false;rerender();},
    mark(i,v){X.floorMarks[X.floor+':'+i]=v;rerender();},
    finish(){X.roundDone=true;rerender();},
    nps(n){X.nps=n;rerender();},
    rate(ri,n){X.ratings[ri]=n;rerender();},
    outcome(id,v){X.outcomes[id]=v;rerender();},
    saveFb(){toast(X.nps<=6?'Feedback saved. A concern was opened for you to follow up.':'Feedback saved');},
    stub(msg){toast(msg);},
    log(open){X.logOpen=!!open;if(open)X.form=Object.assign({},X.form,{pid:X.screen==='record'?X.pid:X.form.pid});rerender();},
    type(t){X.form.type=t;rerender();},
    fset(k,v,re){X.form[k]=v;if(re)rerender();},
    save(){
      const f=X.form,id='C-0'+(143+X.extraConcerns.length),t=f.type,rt=t==='grievance'?['S Chandra','GM Operations']:(ROUTES[f.category]||ROUTES.Other);
      X.extraConcerns.push({id,type:t,pid:f.pid,title:(f.desc||'New '+t).split('.')[0].slice(0,70),raisedBy:f.raised,via:'Logged by Prabh',owner:rt[0],ownerRole:rt[1],category:f.category,sla:t==='request'?'Due by end of day':'6 h left',slaTone:'grey',logged:'just now',status:t==='grievance'?'Escalated':'Open',desc:f.desc||'No description added.'});
      X.logOpen=false;X.filter='open';X.cid=id;X.form=Object.assign({},f,{desc:''});setHash('concerns');toast('Saved and assigned to '+rt[0]);
    }
  };
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&X.logOpen){X.logOpen=false;rerender();}});
})();
