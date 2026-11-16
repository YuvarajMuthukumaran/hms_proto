/* One-off (13 Nov 2026), Trello cards 142, 137, 145, 141: PX demo-send guard, grievance table, top bar buttons, PX team in calendar. */
const fs=require('fs'),path=require('path');
const file=path.join(__dirname,'..','public','px-lead-prototype.html');
const src=fs.readFileSync(file,'utf8');
const tag='<script type="__bundler/template">';
const i0=src.indexOf(tag,100000)+tag.length,i1=src.indexOf('</script>',i0);
let t=JSON.parse(src.slice(i0,i1).trim());
function R(a,b){const n=t.split(a).length-1;if(n!==1)throw new Error('match '+n+': '+a.slice(0,70));t=t.split(a).join(b);}
/* 142: when the server is in demo mode it answers simulated:true, nothing was sent */
R("fuMsg: 'Sent to the call-centre WhatsApp group at ' + nowTime() + '.'","fuMsg: (j.simulated ? 'Demo mode: this would go to the call-centre WhatsApp group. Nothing was sent.' : 'Sent to the call-centre WhatsApp group at ' + nowTime() + '.')");
R("fuRowMsg: 'Sent ' + f.name + ' to the call centre at ' + nowTime() + '.'","fuRowMsg: (j.simulated ? 'Demo mode: would send ' + f.name + ' to the call-centre group. Nothing was sent.' : 'Sent ' + f.name + ' to the call centre at ' + nowTime() + '.')");
/* 137: top bar button label */
R('stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"></path></svg>Log</button>','stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"></path></svg><span class="tbl-l">Log a call or concern</span><span class="tbl-s">Log</span></button>');
R('.tb-log{height:38px;padding:0 16px;gap:6px;margin-right:6px}','.tb-log{height:38px;padding:0 16px;gap:6px;margin-right:6px}.tbl-s{display:none}@media (max-width:700px){.tbl-l{display:none}.tbl-s{display:inline}}.tb-search{height:38px;min-width:220px;margin-right:4px}.tb-pop{position:absolute;right:0;top:44px;width:min(340px,92vw);background:#fff;border:1px solid #e3eaf2;border-radius:12px;box-shadow:0 10px 30px rgba(15,23,42,.14);padding:8px;z-index:30;text-align:left}.tb-pop .np{display:block;width:100%;text-align:left;background:none;border:0;border-radius:8px;padding:8px 10px;cursor:pointer;font:inherit}.tb-pop .np:hover{background:#f2f6fb}.tb-pop .np small{display:block;color:#667085}.tbr{position:relative}.gv-take{white-space:nowrap}');
/* 137: remove the "Came in as" chip row, the demo clock, and owner-side actions */
const a0=t.indexOf('  <div class="gv-srcs" role="tablist"');if(a0<0)throw new Error('no gv-srcs');
const a1=t.indexOf('</sc-for></div>',a0)+'</sc-for></div>'.length;t=t.slice(0,a0)+t.slice(a1+1);
const b0=t.indexOf('            <div class="m4-clock muted small">Demo clock');if(b0<0)throw new Error('no clock');
const b1=t.indexOf('</div>',b0)+6;t=t.slice(0,b0)+t.slice(b1+1);
const c0=t.indexOf('          <div class="field"><label for="ownupd">');if(c0<0)throw new Error('no ownupd');
const c1=t.indexOf('          <sc-if value="{{cur.isSafety}}"');
const d1=t.indexOf('          <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn pri sm" type="button" sc-camel-on-click="{{markFixed}}">');
const d2=t.indexOf('</sc-if>\n        <sc-if value="{{cur.isConfirm}}"');
if(c1<0||d1<0||d2<0||!(c0<c1&&c1<d1&&d1<d2))throw new Error('fix block positions '+[c0,c1,d1,d2]);
t=t.slice(0,c0)+'          <div class="info"><b>With the owner.</b> {{cur.owner}} updates this from their own portal. It shows here and in the list when they do.</div>\n          <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn sm" type="button" sc-camel-on-click="{{escalateCur}}">Escalate to GM Ops (email S Chandra)</button></div>\n        '+t.slice(d2);
/* 137: table columns */
R('<sc-raw-th>Grievance</sc-raw-th><sc-raw-th>Patient</sc-raw-th><sc-raw-th>Owner</sc-raw-th><sc-raw-th>Time left</sc-raw-th><sc-raw-th>Status</sc-raw-th>','<sc-raw-th>Patient</sc-raw-th><sc-raw-th>What they said</sc-raw-th><sc-raw-th>Owner and latest update</sc-raw-th><sc-raw-th>Status</sc-raw-th><sc-raw-th>Take action</sc-raw-th>');
const r0=t.indexOf('                <sc-raw-td><div class="name">{{c.title}}</div>'),r1=t.indexOf('              </sc-raw-tr>',r0);if(r0<0||r1<0)throw new Error('no row');
t=t.slice(0,r0)+`                <sc-raw-td><div class="name">{{c.patient}}</div><div class="muted small">{{c.room}} · {{c.raisedBy}}</div></sc-raw-td>
                <sc-raw-td><div>“{{c.title}}”</div><div class="muted small"><span class="{{c.srcCls}}">{{c.srcLabel}}</span> {{c.category}} · {{c.id}}</div></sc-raw-td>
                <sc-raw-td>{{c.owner}}<div class="muted small">{{c.ownerRole}}</div><div class="small" style="color:#1e5bb8">{{c.latest}}</div></sc-raw-td>
                <sc-raw-td><span class="{{c.statusCls}}">{{c.status}}</span><div class="muted small"><span class="{{c.slaCls}}">{{c.slaText}}</span></div></sc-raw-td>
                <sc-raw-td><button class="btn sm gv-take" type="button" sc-camel-on-click="{{c.open}}">{{c.takeLabel}}</button></sc-raw-td>
`+t.slice(r1);
R("isOpen: !closed, isClosed: closed, resolution: c.resolution || '', open: openConcern(c.id),","isOpen: !closed, isClosed: closed, resolution: c.resolution || '', takeLabel: stg.n === 'confirm' ? 'Confirm with family' : 'Open', open: openConcern(c.id),");
/* 145: top bar search and notifications work on every page */
R('<button class="icb" type="button" aria-label="Search">','<sc-if value="{{searchOpen}}" hint-placeholder-val="{{false}}"><input class="search tb-search" type="search" placeholder="Search patient or grievance" aria-label="Search" value="{{topQ}}" sc-camel-on-change="{{setTopQ}}"></sc-if><button class="icb" type="button" aria-label="Search" sc-camel-on-click="{{toggleSearch}}">');
R('<button class="icb" type="button" aria-label="Notifications">','<button class="icb" type="button" aria-label="Notifications" sc-camel-on-click="{{toggleNotif}}">');
R('<span class="reddot"></span></button>','<span class="reddot"></span></button><sc-if value="{{notifOpen}}" hint-placeholder-val="{{false}}"><div class="tb-pop"><div class="small muted" style="padding:4px 10px">Needs you</div><sc-for list="{{notifItems}}" as="n" hint-placeholder-count="3"><button class="np" type="button" sc-camel-on-click="{{n.go}}"><b>{{n.title}}</b><small>{{n.sub}}</small></button></sc-for><sc-if value="{{notifNone}}" hint-placeholder-val="{{false}}"><div class="small muted" style="padding:6px 10px">Nothing is waiting.</div></sc-if></div></sc-if>');
R("NZ.gvQ = s.gvQ || '';","NZ.searchOpen = !!s.searchOpen; NZ.topQ = s.topQ || ''; NZ.toggleSearch = function () { self.setState({ searchOpen: !self.state.searchOpen, notifOpen: false }); }; NZ.setTopQ = function (e) { var q = e.target.value; self.setState({ topQ: q, gvQ: q, screen: 'concerns', filter: 'all', searchOpen: true }); }; NZ.notifOpen = !!s.notifOpen; NZ.toggleNotif = function () { self.setState({ notifOpen: !self.state.notifOpen, searchOpen: false }); }; NZ.notifItems = openC.slice(0, 6).map(function (c) { return { title: (c.id || '') + ' · ' + (c.title || ''), sub: (c.owner || '') + ' · ' + (c.slaText || ''), go: function () { self.setState({ notifOpen: false }); c.open(); } }; }); NZ.notifNone = openC.length === 0; NZ.gvQ = s.gvQ || '';");
fs.writeFileSync(file,src.slice(0,i0)+'\n'+JSON.stringify(t).split('</').join('<'+String.fromCharCode(92)+'/')+'\n'+src.slice(i1));
/* 141: PX team is Prabh, Kanika and the PX lead only */
/* cal part applied by hand, see cal-core.js */ process.exit(0);
function C(a,b){if(!c.includes(a))throw new Error('cal '+a.slice(0,50));c=c.split(a).join(b);}
C("{id:'kh',name:'Khalid',role:'Call centre',floor:'Call centre'},\r\n    {id:'po',name:'Pooja',role:'Call centre',floor:'Call centre'}","{id:'px',name:'PX Lead',role:'Patient Experience Lead',floor:'Whole hospital'}");
C("kh:'OMMMMME',po:'OEEEEEM'","px:'OMMMMMO'");
C("{id:'l2',who:'kh',from:mon,to:mon,type:'Comp off',cover:'po'}","{id:'l2',who:'px',from:mon,to:mon,type:'Comp off',cover:'pr'}");
C("const KEY='px_cal_v1';","const KEY='px_cal_v2';");
fs.writeFileSync(cf,c);console.log('ok');
