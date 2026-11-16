/* One-off (13 Nov 2026): floor lead psychologist QA fixes: Updates needed beside Sign off, Co-sign on more patients, Patient N of floor. */
const fs=require('fs'),path=require('path');
function ed(f,pairs){const p=path.join(__dirname,'..','public','legacy','js',f);let s=fs.readFileSync(p,'utf8');const crlf=s.includes('\r\n');s=s.replace(/\r\n/g,'\n');for(const [a,b] of pairs){if(s.split(a).length!==2)throw new Error(f+': '+a.slice(0,60));s=s.split(a).join(b);}if(crlf)s=s.replace(/\n/g,'\r\n');fs.writeFileSync(p,s);new Function(s);}
ed('82-therapy-plans-12nov-js.js',[[
  "<button class=\"btn sm pri\" onclick=\"tpSignOff("+"'${pid}')\">Sign off the plan</button>",
  "<button class=\"btn sm\" onclick=\"lpBack("+"'${pid}')\">Updates needed</button><button class=\"btn sm pri\" onclick=\"tpSignOff("+"'${pid}')\">Sign off the plan</button>"]]);
ed('87-lead-psychologist-12nov-js.js',[
["  function seedAssistant(){\n    const id=idOf('Aman Gill');if(!id)return;const x=psyPx(id);if(x.__asst)return;x.__asst=1;",
 "  function seedAssistant(nm){\n    const id=idOf(nm||'Aman Gill');if(!id)return;const x=psyPx(id);if(x.__asst)return;x.__asst=1;"],
["    if(!(psyPx(r.pid).__asst)&&r.pid===idOf('Aman Gill')){seedAssistant();render();return;}",
 "    if(!(psyPx(r.pid).__asst)&&(r.pid===idOf('Aman Gill')||r.pid===idOf('Kavya Menon'))){seedAssistant(r.pid===idOf('Kavya Menon')?'Kavya Menon':'Aman Gill');render();return;}"],
["      if(rt){recordHeader(v);planSignoff(v,rt);therapyBits(v,rt);}",
 "      if(rt){recordHeader(v);planSignoff(v,rt);therapyBits(v,rt);floorNav(v,rt);}"],
["  function therapyBits(v,r){",
 `  /* the lead sees "Patient n of the floor" and Previous / Next walk the whole floor, not only her own patients */
  function floorNav(v,r){
    const list=WARD_ORDER().map(x=>x.p);const i=list.findIndex(p=>p.id===r.pid);if(i<0)return;
    const bar=[...v.querySelectorAll('span.tiny.muted')].find(e=>/^Patient \\d+ of \\d+$/.test(e.textContent.trim()));if(!bar||bar.dataset.fl)return;
    bar.dataset.fl='1';bar.textContent='Patient '+(i+1)+' of '+list.length+' on the floor';
    const row=bar.parentElement;[...row.querySelectorAll('button')].forEach(b=>b.remove());
    const t=r.tab||'overview',mk=(p,l)=>{const b=document.createElement('button');b.className='btn sm';b.textContent=l;b.onclick=()=>go('#/patient/'+p.id+'/'+t);row.appendChild(b);};
    if(list[i-1])mk(list[i-1],'‹ '+list[i-1].name);if(list[i+1])mk(list[i+1],list[i+1].name+' ›');
  }
  function therapyBits(v,r){`]]);
console.log('ok');
