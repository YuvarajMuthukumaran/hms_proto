const fs=require('fs'),F=require('path').join(__dirname,'..','public','px','today.html');let s=fs.readFileSync(F,'utf8');const crlf=s.includes('\r\n');s=s.split('\r\n').join('\n');
const rep=(a,b)=>{if(!s.includes(a))throw new Error('missing '+a.slice(0,60));s=s.split(a).join(b);};
rep(`      if(/Resolved|Closed|Escalated/i.test(s.status||'')||s.stage==='confirm'||(s.findings&&s.findings.length))return;
      const h=pts.find(p=>p.id===c.pid)||{name:c.pname||'Patient',ini:''},left=s.at?6*36e5-(now-s.at):null;`,
`      if(/Closed/i.test(s.status||'')||s.g2===4)return;
      const h=pts.find(p=>p.id===c.pid)||{name:c.pname||'Patient',ini:''},left=s.at?6*36e5-(now-s.at):null;
      /* 25 Nov (owner: "there are 9 grievances" but Today showed fewer): every open grievance is a row. Answered, escalated or
         resolved ones are grey with where they stand; only a grievance nobody has responded to yet is amber. */
      if(/Resolved|Escalated/i.test(s.status||'')||s.stage==='confirm'||(s.findings&&s.findings.length)||s.g2>0){
        const where=/Resolved/i.test(s.status||'')||s.stage==='confirm'?'resolved, confirm with the family':/Escalated/i.test(s.status||'')||s.escalated?'raised to Mr. S. Chandra':'being looked into';
        add('g:'+c.id,'Grievance',h,'grey','Grievance: '+(s.title||'Concern')+(s.category?' · '+s.category:''),c.id+' · '+where+' · with '+(s.owner||'owner')+' · clears when it is closed',s.latest?(s.latestBy?s.latestBy+': ':'')+s.latest:'');
        return;}`);
rep(`  'New grievance':[['Open in Grievances','Record the response, or escalate to the Floor Lead if clinical']],`,
`  'New grievance':[['Open in Grievances','Record the response, or escalate to the Floor Lead if clinical']],
  'Grievance':[['Open in Grievances','See where it stands, update or close it']],`);
if(crlf)s=s.split('\n').join('\r\n');fs.writeFileSync(F,s);console.log('ok');
