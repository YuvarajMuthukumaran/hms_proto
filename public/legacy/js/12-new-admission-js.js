
/* New admission tab: everyone admitted in the last 24 hours. History tab: stays on the patient being seen in Rounds. */
function vNewAdm(){
  $('title').textContent='New admission';
  const pool=(S.role==='lead'||S.role==='rmo')?allPts():PTS;
  const list=pool.filter(p=>p.day<=1).sort((a,b)=>a.day-b.day);
  return ipdPage({scr:'ipdNew',lead:false,list:list,total:list.length,srt:'att',att:p=>p.risk,onSort:'S.ipdSort=this.value;render()',
    title:'New admission',where:'Admitted in the last 24 hours',
    cur:'h24',set:k=>'',count:k=>list.length,keys:['h24'],filters:'',
    doc:p=>PSYOF[p.id]||'Unassigned',psy:p=>PSYCHOF[p.id]||'',dc:p=>(EX[p.id]||[])[2]||'Not set',go:()=>'#/patient/neel/admission',
    id:p=>`${p.sex||'M'}/${p.age||''} · ${p.uhid||''}`,c6l:'Admitted',c6:p=>p.day===0?'Today':'Yesterday'});
}
const __na_rounds=vRounds;
vRounds=function(){
  const R=S.rounds,WP=WARDS[R.ward],p=WP&&WP[Math.min(R.idx[R.ward],WP.length-1)];
  if(p)S.focusPid=p.id;
  return __na_rounds();
};
const __na_render=render;
render=function(){
  const r=(location.hash||'#/myday').slice(2).split('/');
  if(r[0]==='patient'&&r[1])S.focusPid=r[1];
  if(r[0]==='timeline'&&!r[1]&&S.focusPid&&S.focusPid!=='neel'){location.replace('#/timeline/'+S.focusPid);return;}
  return __na_render();
};
