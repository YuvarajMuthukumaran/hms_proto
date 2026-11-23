/* 23 Nov 2026, second meeting: the family call pop-ups (Random call, and Log a call or concern) in the Patient Experience Lead app is bigger:
   wider window, larger text and buttons, questions in two columns on a wide screen. CSS only. */
const rep=require('./rep.cjs');
const A='.rc-qb .lz-chip{min-height:34px;padding:0 14px;font-size:13.5px}';
rep('public/px-lead-prototype.html',[[A,A
 +'.drawer.modal.log-modal{width:min(880px,96vw)!important;max-height:94vh}.drawer.modal.rc-modal{width:min(920px,96vw);max-height:94vh;padding:28px 30px;gap:18px}'
 +'.rc-modal h3{font-size:23px!important}.rc-modal .muted.small{font-size:15px!important;line-height:1.45}'
 +'.rc-modal .field>label{font-size:16px!important}.rc-modal .btn{font-size:15.5px!important;min-height:44px;padding:0 20px}'
 +'.rc-modal .lz-chip{min-height:42px;padding:0 18px;font-size:15px}'
 +'.rc-modal textarea,.rc-modal select{font-size:16px!important;min-height:96px}.rc-modal select{min-height:44px}'
 +'.rc-modal .rc-qs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}'
 +'.rc-modal .rc-q{padding:12px 16px}.rc-modal .rc-ql{font-size:15.5px}.rc-modal .rc-qb .lz-chip{min-height:40px;padding:0 18px;font-size:15px}'
 +'@media(max-width:760px){.rc-modal .rc-qs{grid-template-columns:1fr}.drawer.modal.rc-modal{padding:20px}}']]);
