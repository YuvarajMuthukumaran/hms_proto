/* 19 Nov 2026 (meeting): small edits to older blocks that cannot be done from a new block (their lists are closed over).
   - 45  psychologist handover: Chief complaints and Reason for admission fill from the history / admission form; Expectation from treatment fills from the
         management plan; "Communication to family and patient" is a Done / Not done toggle.
   - 54, 70, 126, 57  management plans (psychiatrist and psychologist) get "Expectation from treatment".
   - 143 group sessions: attendance by floor (1st De-addiction, 2nd Male, 3rd Female ward), at most 90 patients. */
const rep = require('./rep.cjs');
const D = 'public/legacy/js/';

rep(D + '45-psychologist-handover-js.js', [
  ["    ['comm','Communication to family and patient (combined session of both psychologists)','area']",
   "    ['comm','Communication to the family and patient about this handover','toggle']"],
  ["  /* what the record already says, per field */\n  function auto(pid){",
   "  /* 19 Nov: chief complaints and reason for admission come from the history / admission form; expectation from the management plan */\n" +
   "  const hfv2=(pid,re)=>{try{const h=(window.psyPx?psyPx(pid):{}).hf||{};const k=Object.keys(h).find(x=>re.test(x));const v=k?h[k]:'';return typeof v==='string'?v.trim():(v&&v.sel?v.sel:'');}catch(e){return '';}};\n" +
   "  const mpExpect=pid=>{try{const x=window.psyPx?psyPx(pid):{};return String((x.mgmtPsych||{}).expect||(x.mgmt||{}).exp||'').trim();}catch(e){return '';}};\n" +
   "  /* what the record already says, per field */\n  function auto(pid){"],
  ["      cc:hr(/^Chief complaints/i),", "      cc:hr(/^Chief complaints/i)||hfv2(pid,/^Chief complaints/i),"],
  ["      reason:pid==='neel'?'Manic symptoms", "      reason:hfv2(pid,/^Reason for admission|^Presenting complaints/i)||(pid==='neel'?'Manic symptoms"],
  ["+' (Section '+(c.section||p.sec)+')':''),\n      expect:'',", "+' (Section '+(c.section||p.sec)+')':'')),\n      expect:mpExpect(pid),"],
  ["  function notePage(pid,vals,ro,o){",
   "  const toggleHtml=(pid,k,v)=>`<div class=\"seg hn-tog\" role=\"group\">${['Done','Not done'].map(o=>`<button type=\"button\" class=\"${v===o?'on':''}\" onclick=\"pgHnTog('${pid}','${k}','${o}',this)\">${o}</button>`).join('')}</div>`;\n" +
   "  window.pgHnTog=function(pid,k,v,el){pgHnSet(pid,k,v);const g=el.parentNode;g.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b===el));const f=g.closest('.hn-f'),t=f&&f.querySelector('.hn-tag');if(t)t.remove();};\n" +
   "  function notePage(pid,vals,ro,o){"],
  ["        :(ty==='line'?`<input class=\"input\" value=\"${hesc(v)}\"", "        :(ty==='toggle'?toggleHtml(pid,k,v):ty==='line'?`<input class=\"input\" value=\"${hesc(v)}\""],
]);

const MPX = "['goals','Goals of treatment'],['exp','Expectation from treatment'],";
rep(D + '54-psy-review-4-js.js', [["const MP=[['dx','Diagnosis'],['goals','Goals of treatment'],", "const MP=[['dx','Diagnosis'],"+MPX]]);
rep(D + '70-psy-review-11nov-js.js', [["const MP=[['dx','Diagnosis'],['goals','Goals of treatment'],", "const MP=[['dx','Diagnosis'],"+MPX]]);
rep(D + '126-cross-role-mgmt-plan-17nov-js.js', [
  ["const PSY_MP=[['dx','Diagnosis'],['goals','Goals of treatment'],", "const PSY_MP=[['dx','Diagnosis'],"+MPX],
  ["['goals','Goals of therapy'],['family','Family involvement']", "['goals','Goals of therapy'],['expect','Expectation from treatment'],['family','Family involvement']"],
]);
rep(D + '57-psychologist-review-3-js.js', [
  ["['goals','Goals of therapy','area'],['family','Family involvement','area']", "['goals','Goals of therapy','area'],['expect','Expectation from treatment','area','What the patient and the family hope treatment will achieve'],['family','Family involvement','area']"],
]);

rep(D + '143-group-sessions-19nov-js.js', [
  ["  const wardOf=pid=>", "  /* 19 Nov (meeting): attendance by floor, 1st De-addiction, 2nd Male ward, 3rd Female ward; at most 90 patients (only people admitted now) */\n  const FLN=[['1st floor','De-addiction ward'],['2nd floor','Male ward'],['3rd floor','Female ward']];\n  const floorIdx=w=>/female/i.test(w||'')?2:/de-?addict/i.test(w||'')?0:1;\n  const wardOf=pid=>"],
  ["const seen={};return L.filter(p=>p&&p.id&&!seen[p.id]&&(seen[p.id]=1));};", "const seen={};return L.filter(p=>p&&p.id&&!seen[p.id]&&(seen[p.id]=1)).slice(0,90);};"],
  ["    const rows=L.map(p=>{const m=G.marks[p.id]||'';return `<tr>", "    const rowHtml=p=>{const m=G.marks[p.id]||'';return `<tr>"],
  ["</tr>`;}).join('');\n    const rc=recent();",
   "</tr>`;};\n" +
   "    const rows=FLN.map((f,i)=>{const g=L.filter(p=>floorIdx(wardOf(p.id))===i);if(q&&!g.length)return '';const mk=g.filter(p=>G.marks[p.id]).length;\n" +
   "      return `<tr><td colspan=\"3\" style=\"background:#f8fafc\"><div class=\"row\" style=\"justify-content:space-between;gap:8px;flex-wrap:wrap\"><span><b>${f[0]}</b> <span class=\"small muted\">${f[1]} · ${mk} of ${g.length} marked</span></span><button class=\"btn sm\" onclick=\"gsAll(${i})\">Mark all attended</button></div></td></tr>`+(g.map(rowHtml).join('')||'<tr><td colspan=\"3\" class=\"small muted\">Nobody on this floor.</td></tr>');}).join('');\n" +
   "    const rc=recent();"],
  ["window.gsAll=function(){pts().forEach(p=>{if(!G.marks[p.id])G.marks[p.id]='Attended';});paint();};",
   "window.gsAll=function(i){pts().forEach(p=>{if((i===undefined||floorIdx(wardOf(p.id))===i)&&!G.marks[p.id])G.marks[p.id]='Attended';});paint();};"],
]);
