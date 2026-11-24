/* 24 Nov 2026, IPD Alerts by Role (Anu's comment on Clinical events):
   Treating psychiatrist: vitals out of range, fever, suspected withdrawal, aggression.
   RMO: fall, injury, dressing, vitals out of range, fever.
   So a fall, injury, dressing or first-aid item leaves the psychiatrist's lists (dashboard, eye and Take Action pop-ups,
   Type column) unless it also names something the psychiatrist handles (vitals, fever, withdrawal, aggression, or a
   critical event). The RMO keeps everything it saw before. Psychiatrist and floor lead psychiatrist only. */
(function(){
  if(!/^(psychiatrist|floor-lead-psychiatrist)$/.test(String((window.__TULASI__||{}).role||'')))return;
  const RMO=/\bfalls?\b|\bfell\b|injur|dressing|first aid|wound|bruise|laceration/i;
  const PSY=/vital|\bBP\b|pulse|spo2|temp|fever|withdraw|ciwa|cows|aggress|violen|assault|critical|seizure|self-?harm|suicid|delirium|unstable|head injury|abscond/i;
  const rmoOnly=i=>{const t=String((i&&(i.txt||i.title||i.text))||'');return RMO.test(t)&&!PSY.test(t);};
  ['alerts','tasks'].forEach(k=>{const o=DT[k];if(typeof o!=='function')return;
    DT[k]=function(){const r=o.apply(this,arguments);return Array.isArray(r)?r.filter(i=>!rmoOnly(i)):r;};});
  window.__rmoOnlyEvent=rmoOnly;
})();
