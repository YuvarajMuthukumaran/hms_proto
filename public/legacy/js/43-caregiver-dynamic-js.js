
/* Trello "Sos flow: shows static caregiver names, it should be dynamic" (Anu, 5 Nov). The Call caregiver and Message caregiver windows had Neel Bose's
   sister (Ananya Bose) and Neel's name written into them for every patient. They now use the open patient's own nominated representative and name
   (the same person the Emergency contact box in the patient header shows). All roles, because the buttons are on every role's patient header. */
(function(){
  let ID=null,T=null,PT=null;
  const sub=s=>{
    if(!ID)return s;
    let out=String(s);
    out=out.split('Ananya Bose').join(ID.nr).split('Ananya ji').join(ID.nrFirst+' ji');
    if(PT)out=out.split('Neel Bose').join(PT.name).split('on Neel:').join('on '+PT.name.split(' ')[0]+':');
    return out;
  };
  const __toast=toast;toast=function(m){return __toast.call(this,sub(m));};
  const __open=openModal;openModal=function(h){return __open.call(this,sub(h));};
  const wrap=fn=>function(){
    ID=null;PT=null;
    try{const p=ptFind(S.pid);if(p&&S.pid!=='neel'){ID=ptIdentity(p);PT=p;}}catch(e){}
    clearTimeout(T);T=setTimeout(()=>{ID=null;PT=null;},6000); /* the call window opens a moment after the click */
    return fn.apply(this,arguments);
  };
  callCaregiver=wrap(callCaregiver);
  msgModal=wrap(msgModal);
})();
