/* 12 Nov 2026, voice note from the team (WhatsApp audio + transcript):
   the family update that goes to the family on WhatsApp used clinical therapy words the family cannot follow
   (psychoeducation, family therapy, insight generation, individual session, occupational therapy, music therapy).
   The message now says the same thing in plain words. Only the text sent to the family changes; the clinical notes keep the clinical terms.
   A note someone has edited by hand is sent exactly as they wrote it. */
(function(){
  const MAP=[
    [/\b(an|a)\s+individual\s+(therapy\s+)?session(s)?\b/gi,(m,a,t,s)=>s?'one-to-one talks':'a one-to-one talk'],
    [/\bindividual\s+(therapy\s+)?sessions?\b/gi,'one-to-one talks'],
    [/\bindividual\s+therapy\b/gi,'one-to-one talks with the therapist'],
    [/\boccupational\s+therapy\b/gi,'an activity session to practise daily skills'],
    [/\bpsycho-?education\b/gi,'a session to help understand the illness and how to stay well'],
    [/\binsight\s+generation\b/gi,'a talk to help understand the illness and why treatment helps'],
    [/\bfamily\s+therapy\b/gi,'a meeting of the family with the therapist'],
    [/\bfamily\s+sessions?\b/gi,'a meeting of the family with the therapist'],
    [/\bmusic\s+therapy\b/gi,'a music session to relax and express feelings'],
    [/\bgroup\s+therapy\b/gi,'a group talk with other patients'],
    [/\bcbt\b/gi,'talking therapy'],
    [/\bcognitive\s+behavio(u)?ral\s+therapy\b/gi,'talking therapy'],
    [/\bbehavio(u)?ral\s+activation\b/gi,'planning enjoyable daily activities'],
    [/\bexposure\s+and\s+response\s+prevention\b|\berp\b/gi,'a step-by-step therapy for fears and habits']
  ];
  /* "took part in an activity session ..., a group talk ... and ..." reads fine; only tidy a doubled article such as "an a group talk" */
  const tidy=s=>s.replace(/\b(a|an)\s+(a|an)\s+/gi,(m,x,y)=>y+' ');
  window.famPlain=function(text){
    let t=String(text==null?'':text);
    MAP.forEach(([re,to])=>{t=t.replace(re,to);});
    return tidy(t);
  };

  /* the daily update sent on WhatsApp and shown in the preview */
  if(typeof waDText==='function'){
    const __w=waDText;
    waDText=function(kind,id){
      const edited=(S.waEdit||{})[kind+':'+id];
      const out=__w.apply(this,arguments);
      return edited!=null?out:famPlain(out);
    };
  }
  /* the one-line family update used by the psychiatrist and the RMO */
  if(typeof famUpdate==='function'){
    const __f=famUpdate;
    famUpdate=function(){return famPlain(__f.apply(this,arguments));};
  }
})();
