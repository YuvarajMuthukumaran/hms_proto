/* 21 Nov 2026, owner: the Vitals and monitoring tab (Orders) looked flat and the title sat in the middle. Style only, psychiatrist and
   floor lead psychiatrist (the tab is theirs): the title and the two buttons share one row, the filter is a slim bar, the table has a
   pinned date column, readings are small tinted tiles (out of range in red), slots with nothing scheduled are hatched, and
   Other monitoring and Scales ordered get their own spacing. No markup or behaviour changes (blocks 54, 98 and 142 draw it). */
(function(){
  const ROLE=String((window.__TULASI__||{}).role||'');
  if(!/^(psychiatrist|floor-lead-psychiatrist|psychologist|floor-lead-psychologist)$/.test(ROLE))return;
  const st=document.createElement('style');st.id='vitals-look-css';
  st.textContent=[
  '#psyTxPanel-1>.psy-tx-head{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:6px 4px 14px}',
  '#psyTxPanel-1>.psy-tx-head>div:first-child{margin-right:auto;min-width:240px}',
  '#psyTxPanel-1>.psy-tx-head h3{font-size:20px;margin:0}',
  '#psyTxPanel-1>.psy-tx-head .small{margin-top:4px;max-width:640px;line-height:1.45}',
  '#psyTxPanel-1>.psy-tx-head .psy-tx-actions:empty{display:none}',
  '#psyTxPanel-1>.psy-tx-head .btn{min-height:38px;padding:0 16px;border-radius:10px;font-weight:600}',
  '#psyTxPanel-1>.psy-tx-head .btn[data-sc]{background:#fff;color:#175cd3;border:1px solid #b2ddff}',
  '#psyTxPanel-1>.psy-tx-head .btn[data-sc]:hover{background:#eff8ff}',
  '#psyTxPanel-1 .vm9-bar{padding:8px 14px;border-radius:12px;background:#fff;border:1px solid #e3eaf2;margin-bottom:12px;gap:14px;align-items:center}',
  '#psyTxPanel-1 .vm9-bar label{flex-direction:row;align-items:center;gap:8px;font-size:12.5px;letter-spacing:0;text-transform:none;font-weight:600;color:#475467}',
  '#psyTxPanel-1 .vm9-bar .input{min-height:34px;width:auto;font-weight:500}',
  '#psyTxPanel-1 .vm10{border:1px solid #e3eaf2;border-radius:14px;overflow:hidden;background:#fff}',
  '#psyTxPanel-1 .vm10>.hd{padding:14px 18px;border-bottom:1px solid #eef2f6;background:#fff}',
  '#psyTxPanel-1 .vm10>.hd h3{font-size:16px}',
  '#psyTxPanel-1 .vm10 table.vs{border-collapse:separate;border-spacing:0}',
  '#psyTxPanel-1 .vm10 table.vs thead th{background:#f6f9fd;border-bottom:1px solid #dfe7f1;border-left:1px solid #edf1f7;padding:10px 12px;font-size:13px;color:#101828;text-transform:none;letter-spacing:0;font-weight:700;vertical-align:bottom}',
  '#psyTxPanel-1 .vm10 table.vs thead th:first-child{border-left:0}',
  '#psyTxPanel-1 .vm10 table.vs thead th small{display:block;font-weight:500;font-size:11.5px;color:#667085;margin-top:1px}',
  '#psyTxPanel-1 .vm10 table.vs thead th .vs-s{display:inline-block;margin-top:6px;padding:2px 8px;border-radius:99px;background:#ecfdf3;color:#067647;font-size:11px;font-weight:600;line-height:1.35}',
  '#psyTxPanel-1 .vm10 table.vs tbody td{padding:10px 12px;border-left:1px solid #f0f3f8;border-top:1px solid #eef2f6;vertical-align:top}',
  '#psyTxPanel-1 .vm10 table.vs tbody td:first-child{border-left:0}',
  '#psyTxPanel-1 .vm10 table.vs td.d{position:sticky;left:0;z-index:1;background:#fff;font-weight:700;font-size:14px;min-width:96px;box-shadow:1px 0 0 #eef2f6}',
  '#psyTxPanel-1 .vm10 table.vs td.d small{margin-top:2px;font-size:11.5px}',
  '#psyTxPanel-1 .vm10 table.vs tbody tr:hover td{background:#fafcff}#psyTxPanel-1 .vm10 table.vs tbody tr:hover td.ns{background:#f2f4f7}',
  '#psyTxPanel-1 .vm10 table.vs td.ns{background:repeating-linear-gradient(135deg,#f6f7f9 0 6px,#f0f2f5 6px 12px)}',
  '#psyTxPanel-1 .vs-r{background:#f5faff;border:1px solid #deebfb;border-radius:10px;padding:7px 9px;margin-bottom:6px;line-height:1.55}',
  '#psyTxPanel-1 .vs-r:last-child{margin-bottom:0;border-bottom:1px solid #deebfb}',
  '#psyTxPanel-1 .vs-r .tm{font-size:11px;font-weight:600;color:#175cd3;margin-bottom:2px}',
  '#psyTxPanel-1 .vs-i{margin-right:10px}#psyTxPanel-1 .vs-i small{font-weight:600}#psyTxPanel-1 .vs-i b{font-size:14px;font-weight:700}',
  '#psyTxPanel-1 .vs-r:has(b.out){background:#fff5f4;border-color:#fcd5d1}',
  '#psyTxPanel-1 .vm10 table.vs td.miss{color:#b8c1cf;font-size:18px}',
  '#psyTxPanel-1 .psy-tx-body>div:not(.vm9-bar):not(.vm10){margin-top:14px;border:1px solid #e3eaf2!important;border-radius:14px;background:#fff;overflow:hidden}',
  '#psyTxPanel-1 .psy-tx-body>div:not(.vm9-bar):not(.vm10) .hd{padding:14px 18px}',
  '#psyTxPanel-1 .psy-tx-body>div:not(.vm9-bar):not(.vm10) table th{background:#f6f9fd}',
  '#psyTxPanel-1 .psy-tx-body>div:not(.vm9-bar):not(.vm10) .btn[onclick*="Monitoring order"]{background:#fff;color:#175cd3;border:1px solid #b2ddff}',
  '@media(max-width:700px){#psyTxPanel-1>.psy-tx-head .btn{flex:1 1 auto}}'
  ].join('');
  document.head.appendChild(st);
})();
