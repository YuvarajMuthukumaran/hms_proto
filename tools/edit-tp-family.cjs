/* One-off (13 Nov 2026): Therapy Plans > Family redesigned as cards (topics, required contact, call log, who may be told, family concern). */
const fs=require('fs'),path=require('path');
const p=path.join(__dirname,'..','public','legacy','js','82-therapy-plans-12nov-js.js');let s=fs.readFileSync(p,'utf8');const crlf=s.includes('\r\n');s=s.replace(/\r\n/g,'\n');
const i0=s.indexOf("    return `<div class=\"tp-fam\"><div><div class=\"tp-h\">Sensitisation topics");const i1=s.indexOf("\n  }\n  window.tpTold",i0);
if(i0<0||i1<i0)throw new Error('markers');
const NEW=`    const nDone=TOPICS.filter(t=>done[t]).length;
    const st=r=>r[1]?'<span class="tf-st ok">Done</span>':r[2]?'<span class="tf-st due">Due now</span>':'<span class="tf-st">Not due yet</span>';
    return \`<div class="tf"><section class="tf-c tf-wide"><div class="tf-h"><div><b>Sensitisation topics</b><span>Ticked when a signed family session covers them</span></div><span class="tf-n"><b>\${nDone}</b> of \${TOPICS.length} covered</span></div>
      <div class="tf-bar"><i style="width:\${Math.round(nDone/TOPICS.length*100)}%"></i></div>
      <div class="tf-topics">\${TOPICS.map(t=>'<div class="tf-t'+(done[t]?' on':'')+'"><span class="tf-ck">'+(done[t]?'✓':'')+'</span><div><div>'+t+'</div>'+(done[t]?'<small>'+esc(done[t].at)+(done[t].who?' · '+esc(done[t].who):'')+'</small>':'')+'</div></div>').join('')}</div></section>
      <section class="tf-c"><div class="tf-h"><div><b>Required contact</b><span>Set at admission, ticks itself when logged</span></div></div>\${req.map(r=>'<div class="tf-r"><span>'+r[0]+'</span>'+st(r)+'</div>').join('')}</section>
      <section class="tf-c"><div class="tf-h"><div><b>Calls and WhatsApp</b><span>Through the Tulasi number</span></div></div>\${comm.length?comm.map(c=>'<div class="tf-r"><span>'+esc(c.type)+' · '+esc(c.who)+'</span><span class="tf-d">'+esc(c.date)+'</span></div>').join(''):'<div class="tf-e">No contact logged yet.</div>'}</section>
      <section class="tf-c"><div class="tf-h"><div><b>Who may be told what</b><span>Family members and what each may hear</span></div></div>\${contacts.map(c=>'<div class="tf-r"><span><b>'+esc(c[0])+'</b> <small>'+esc(String(c[1]).split(' · ')[0])+'</small></span><select class="input" style="max-width:190px;min-height:34px" onchange="tpTold(\\''+pid+'\\',\\''+esc(c[0]).replace(/'/g,'')+'\\',this.value)">'+['Everything','Clinical updates only','Billing only','Nothing'].map(o=>'<option '+((told[c[0]]||(/Not for now/.test(c[2]||'')?'Nothing':'Everything'))===o?'selected':'')+'>'+o+'</option>').join('')+'</select></div>').join('')||'<div class="tf-e">No family contacts yet.</div>'}</section>
      <section class="tf-c"><div class="tf-h"><div><b>Family concern</b><span>Goes to the Patient Experience team</span></div></div><div style="padding:12px 16px 16px"><textarea class="input" id="tpConc" rows="3" placeholder="What the family said"></textarea><button class="btn sm pri" style="margin-top:8px" onclick="tpGriev('\${pid}')">Raise a grievance</button></div></section></div>\`;`;
s=s.slice(0,i0)+NEW+s.slice(i1);
const c0="  .tp-dots{display:inline-flex;gap:5px}";
if(s.split(c0).length!==2)throw new Error('css');
s=s.split(c0).join(`  .tf{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.tf-wide{grid-column:1/-1}.tf-c{border:1px solid #e3eaf2;border-radius:14px;background:#fff;overflow:hidden}
  .tf-h{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:12px 16px;border-bottom:1px solid #eef2f8}.tf-h b{display:block;font-size:14.5px;font-weight:650;color:#101828}.tf-h span{font-size:12.5px;color:#667085}.tf-n{white-space:nowrap}.tf-n b{display:inline!important;font-size:16px!important}
  .tf-bar{height:5px;background:#eaf0f7}.tf-bar i{display:block;height:100%;background:#1f9d57}.tf-topics{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:0 18px;padding:6px 16px 10px}
  .tf-t{display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid #f1f5f9;font-size:13.5px;color:#475467}.tf-t.on{color:#101828}.tf-t small{display:block;font-size:11.5px;color:#067647}
  .tf-ck{flex:none;width:20px;height:20px;border-radius:50%;border:1.5px solid #cfd8e4;display:flex;align-items:center;justify-content:center;font-size:12px;color:#fff}.tf-t.on .tf-ck{background:#1f9d57;border-color:#1f9d57}
  .tf-r{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:10px 16px;border-top:1px solid #f1f5f9;font-size:13.5px;min-height:44px}.tf-r:first-of-type{border-top:0}.tf-r small{color:#667085;font-weight:500}.tf-d{font-size:12.5px;color:#667085;white-space:nowrap}
  .tf-st{font-size:12px;font-weight:700;color:#667085}.tf-st.ok{color:#067647}.tf-st.due{color:#b54708}.tf-e{padding:14px 16px;font-size:13px;color:#667085}
  @media(max-width:900px){.tf{grid-template-columns:1fr}}
`+c0);
if(crlf)s=s.replace(/\n/g,'\r\n');fs.writeFileSync(p,s);new Function(s);console.log('ok');
