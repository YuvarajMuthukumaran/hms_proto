/* 23 Nov 2026, second meeting (Nikita): Grievances like a ticket tool (TeleCRM): a narrow ticket list on the left
   (patient, status, what they said, owner and time left) and the selected ticket's detail on the right, taking most of the
   screen and scrolling on its own. The lead bundle is a JSON string, so new markup is escaped with J() before it goes in. */
const fs=require('fs');
const file='public/px-lead-prototype.html';
let t=fs.readFileSync(file,'utf8');
const J=s=>JSON.stringify(s).slice(1,-1).split('</').join('<\\/');
const once=(a,b)=>{const n=t.split(a).length-1;if(n!==1)throw new Error('match '+n+': '+a.slice(0,90));t=t.split(a).join(b);};
/* 1. the list */
const A=J('<section class="card gv-list" style="flex:3 1 560px;overflow:hidden">');
const B=J('<section class="card" style="flex:2 1 340px">');
const i=t.indexOf(A),j=t.indexOf(B,i);
if(i<0||j<0||t.indexOf(A,i+1)>=0)throw new Error('list section not found once');
const nl=t.slice(i,j).includes('\\r\\n')?'\r\n':'\n';
const LIST=[
'<section class="card gv-list gv-tl" style="flex:0 0 380px;overflow:hidden">',
'      <div class="gv-tl-s">',
'        <sc-for list="{{concernRows}}" as="c" hint-placeholder-count="6">',
'          <div class="gv-tk"><div class="{{c.rowCls}}" style="{{c.sr}}" sc-camel-on-click="{{c.open}}">',
'            <div class="gv-tk1"><span class="name">{{c.patient}}</span><span class="{{c.statusCls}}">{{c.stLabel}}</span></div>',
'            <div class="muted small">{{c.room}} · {{c.raisedBy}}</div>',
'            <div class="gv-tk2">“{{c.title}}”</div>',
'            <div class="muted small"><span class="{{c.srcCls}}">{{c.srcLabel}}</span> {{c.category}} · {{c.id}}</div>',
'            <div class="small gv-tk3"><span>{{c.owner}}</span><span class="{{c.slaCls}}">{{c.slaText}}</span></div>',
'          </div></div>',
'        </sc-for>',
'      </div>',
'    </section>',
'    '].join(nl);
t=t.slice(0,i)+J(LIST)+J('<section class="card gv-det" style="flex:1 1 520px">')+t.slice(j+B.length);
/* 2. the detail takes the rest of the width */
/* 3. styles */
const CSS='.gv-take{white-space:nowrap}'
 +'.gv-cols{flex-wrap:nowrap;align-items:flex-start!important}'
 +'.gv-cols>section.gv-tl,.gv-cols>section.gv-det{align-self:flex-start}'
 +'.gv-tl-s{max-height:calc(100vh - 210px);overflow:auto}'
 +'.gv-det{max-height:calc(100vh - 150px);overflow:auto;position:sticky;top:8px;min-width:0}'
 +'.gv-tk>.ck{padding:12px 14px 12px 12px;border-bottom:1px solid #eef1f5;border-left:4px solid var(--sr,transparent);cursor:pointer;display:flex;flex-direction:column;gap:3px;transition:background .12s}'
 +'.gv-tk>.ck:hover{background:#f8fafc}.gv-tk>.ck.sel{background:#eef4fd;box-shadow:inset 0 0 0 1px #9ec0f7}'
 +'.gv-tk1{display:flex;justify-content:space-between;gap:8px;align-items:center}.gv-tk1 .name{font-weight:700}'
 +'.gv-tk2{font-size:13.5px;color:#101828;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}'
 +'.gv-tk3{display:flex;justify-content:space-between;gap:8px;color:#475467}'
 +'@media(max-width:900px){.gv-cols{flex-wrap:wrap}.gv-tl{flex:1 1 100%!important}.gv-tl-s{max-height:none}.gv-det{position:static;max-height:none}}';
once('.gv-take{white-space:nowrap}',CSS);
fs.writeFileSync(file,t);console.log('ok');
