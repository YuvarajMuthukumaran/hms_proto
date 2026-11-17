/* 17 Nov 2026, Trello: build a pedigree (family tree diagram) from what Family history already has --
   Father/Mother (free text), the family tree table (siblings, spouse, children: relation, age, sex), and
   which relations have a history of mental illness, suicide, alcohol/drug dependence or epilepsy. No new
   fields: a "View pedigree" button next to "+ Add a family member" draws the diagram from that data.
   Standard genogram shapes: square = male, circle = female, diamond = other/not stated, double-ring arrow
   = the patient, filled = a relation ticked in Q5 (family history of illness). Psychiatrist and
   psychologist only (same as the rest of the Detailed history form). */
(function(){
  const isPsy=()=>/^(psychiatrist|psychologist)$/.test(String((window.__TULASI__||{}).role||''));
  if(!isPsy())return;
  const hf=()=>{const x=psyPx(S.pid);return x.hf=x.hf||{};};
  const FATHER='Father: living or deceased, age, education, occupation, personality, attitude to patient, health';
  const MOTHER='Mother: living or deceased, age, education, occupation, personality, attitude to patient, health';
  const TREE='Family tree (siblings, spouse, children: age, sex, marital, education, occupation)';
  const ILLNESS='Mental illness, suicide, alcohol or drug dependence, epilepsy in family';
  const esc=s=>hesc(String(s==null?'':s));

  function place(){
    if(String(S.hsec||'')!=='fam')return;
    const box=document.querySelector('#view .hwrap .pm-tree');if(!box||box.querySelector('.ped-btn'))return;
    const addBtn=[...box.querySelectorAll('button')].find(x=>/Add a family member/.test(x.textContent));
    const b=document.createElement('button');b.type='button';b.className='btn sm ped-btn';b.style.marginLeft='8px';b.textContent='View pedigree';
    b.onclick=()=>openPedigree();
    if(addBtn)addBtn.insertAdjacentElement('afterend',b);else box.appendChild(b);
  }

  function shape(cx,cy,sex,filled,r){
    r=r||22;const fill=filled?'#475467':'#fff',stroke='#344054';
    if(/^m/i.test(sex||''))return `<rect x="${cx-r}" y="${cy-r}" width="${r*2}" height="${r*2}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`;
    if(/^f/i.test(sex||''))return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`;
    return `<polygon points="${cx},${cy-r} ${cx+r},${cy} ${cx},${cy+r} ${cx-r},${cy}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`;
  }
  function node(cx,cy,sex,filled,label,isPatient){
    const r=isPatient?26:22;
    let s=shape(cx,cy,sex,filled,r);
    if(isPatient)s+=`<circle cx="${cx}" cy="${cy}" r="${r+5}" fill="none" stroke="#1570ef" stroke-width="2"/>`;
    const lab=(label||'').length>14?label.slice(0,13)+'…':label;
    return `<g>${s}<text x="${cx}" y="${cy+r+16}" text-anchor="middle" font-size="12" fill="#344054">${esc(lab)}</text>${label&&label.length>14?`<title>${esc(label)}</title>`:''}</g>`;
  }

  function openPedigree(){
    const s=hf(),rows=Array.isArray(s[TREE])?s[TREE]:[],ill=Array.isArray(s[ILLNESS])?s[ILLNESS]:[],p=(typeof ptFind==='function'&&ptFind(S.pid))||{name:'Patient',sex:''};
    const affected=rel=>ill.includes(rel);
    const sibs=rows.filter(r=>/^(Brother|Sister)$/.test(r.rel||''));
    const spouse=rows.find(r=>r.rel==='Spouse');
    const kids=rows.filter(r=>/^(Son|Daughter)$/.test(r.rel||''));
    const others=rows.filter(r=>r.rel==='Other'||!r.rel);
    const W=Math.max(640,120*(sibs.length+2)+(spouse?140:0)),H=320;
    const topY=50,midY=160,botY=260;
    const fatherX=W/2-40,motherX=W/2+40;
    let svg=`<svg viewBox="0 0 ${W} ${H}" width="100%" height="${H}" style="max-width:100%">`;
    /* parents + marriage line down to the sibling row */
    svg+=`<line x1="${fatherX}" y1="${topY}" x2="${motherX}" y2="${topY}" stroke="#344054" stroke-width="2"/>`;
    svg+=`<line x1="${W/2}" y1="${topY}" x2="${W/2}" y2="${midY-26}" stroke="#344054" stroke-width="2"/>`;
    svg+=node(fatherX,topY,'M',affected('Father'),s[FATHER]?'Father':'Father (not filled)');
    svg+=node(motherX,topY,'F',affected('Mother'),s[MOTHER]?'Mother':'Mother (not filled)');
    /* sibling row, patient included, evenly spaced */
    const sibRow=[{__patient:true}].concat(sibs);
    const n=sibRow.length,spacing=100,rowW=(n-1)*spacing,startX=W/2-rowW/2;
    svg+=`<line x1="${startX}" y1="${midY-26}" x2="${startX+rowW}" y2="${midY-26}" stroke="#344054" stroke-width="2"/>`;
    sibRow.forEach((r,i)=>{const x=startX+i*spacing;svg+=`<line x1="${x}" y1="${midY-26}" x2="${x}" y2="${midY-22}" stroke="#344054" stroke-width="2"/>`;
      if(r.__patient)svg+=node(x,midY,p.sex,affected('Self')||false,p.name||'Patient',true);
      else svg+=node(x,midY,r.sex,affected(/Brother/.test(r.rel)?'Brother(s)':'Sister(s)'),r.rel+(r.age?' · '+r.age:''));
    });
    const patientX=startX;
    /* spouse, then children below patient+spouse */
    if(spouse){
      const spX=patientX+spacing*(n>1?0.7:1.4);
      svg+=`<line x1="${patientX}" y1="${midY}" x2="${spX}" y2="${midY}" stroke="#344054" stroke-width="2"/>`;
      svg+=node(spX,midY,spouse.sex,false,'Spouse'+(spouse.age?' · '+spouse.age:''));
      if(kids.length){
        const midX=(patientX+spX)/2;
        svg+=`<line x1="${midX}" y1="${midY}" x2="${midX}" y2="${botY-26}" stroke="#344054" stroke-width="2"/>`;
        const kw=(kids.length-1)*90,ksx=midX-kw/2;
        svg+=`<line x1="${ksx}" y1="${botY-26}" x2="${ksx+kw}" y2="${botY-26}" stroke="#344054" stroke-width="2"/>`;
        kids.forEach((r,i)=>{const x=ksx+i*90;svg+=`<line x1="${x}" y1="${botY-26}" x2="${x}" y2="${botY-22}" stroke="#344054" stroke-width="2"/>`;
          svg+=node(x,botY,r.sex,affected(r.rel==='Son'?'Son(s)':'Daughter(s)'),r.rel+(r.age?' · '+r.age:''));});
      }
    }
    svg+='</svg>';
    const extended=['Paternal grandparents','Maternal grandparents','Paternal uncles or aunts','Maternal uncles or aunts','Cousins'].filter(affected);
    const legend=`<div class="small muted" style="margin-top:10px">Square = male &nbsp;·&nbsp; Circle = female &nbsp;·&nbsp; Diamond = other/not stated &nbsp;·&nbsp; Double ring = the patient &nbsp;·&nbsp; Filled = family history of illness (Q5)</div>`
      +(others.length?`<div class="small" style="margin-top:6px"><b>Other family members (not placed on the diagram):</b> ${others.map(r=>esc((r.rel||'Other')+(r.age?' · '+r.age:''))).join(', ')}</div>`:'')
      +(extended.length?`<div class="small" style="margin-top:6px"><b>Also flagged in the extended family:</b> ${extended.map(esc).join(', ')}</div>`:'');
    V3.modal('Pedigree · '+esc(p.name||''),'Drawn from the Father, Mother, family tree table and Q5 of Family history.',
      `<div style="overflow:auto">${svg}</div>${legend}`,
      `<button class="btn" onclick="closeModal()">Close</button>`);
    setTimeout(()=>{const m=document.getElementById('modal');if(m)m.style.width='min(760px,100%)';},0);
  }
  window.openPedigree=openPedigree;

  const __r=render;
  render=function(){const r=__r.apply(this,arguments);try{place();}catch(e){}return r;};
})();
