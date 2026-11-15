/* 15 Nov 2026: the ward clock is the real time (all roles).
   The prototype clock started at 2:10 pm every load, so doses, vitals and notes were stamped with a made-up time
   (a dose given at 3:10 pm read "2:10 pm"). Now V3.now() is the real minutes since midnight of the day the page opened
   (past midnight it goes on to 1440 and up, so stamps show the next date), plus whatever the "+5 min / +15 min" demo
   buttons added. The 3:55 pm stop on the demo buttons is lifted. */
(function(){
  if(typeof V3!=='object'||!V3)return;
  const mid=new Date();mid.setHours(0,0,0,0);
  const real=()=>Math.floor((Date.now()-mid.getTime())/60000);
  const sim0=(()=>{try{return v3().sim||0;}catch(e){return 0;}})();
  V3.T0=real();
  V3.CAP=V3.T0+24*60;
  V3.now=()=>real()+(((()=>{try{return v3().sim||0;}catch(e){return 0;}})())-sim0);
})();
