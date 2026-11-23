/* 23 Nov 2026 (Nikita, via owner): "Increase size of popup". The lead app runs at html zoom .75, so the 880 px Log a call or concern
   pop-up showed at 660 px with small text. The call pop-ups now undo that zoom (zoom 1.333 = full size) and are up to 940 px wide. */
const rep=require('./rep.cjs');
const A='.log-modal{width:min(880px,96vw)!important;max-height:94vh}';
rep('public/px-lead-prototype.html',[[A,A+'.drawer.modal.log-modal,.drawer.modal.rc-modal{zoom:1.3333;width:min(940px,70vw)!important;max-height:70vh!important;overflow:auto}']]);
