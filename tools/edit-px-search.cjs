/* One-off (13 Nov 2026), card 145: PX top-bar search lists matching patients (name, room, UHID) and opens the record; panels close on an outside click. */
const fs=require('fs'),path=require('path');
const file=path.join(__dirname,'..','public','px-lead-prototype.html');
const src=fs.readFileSync(file,'utf8');
const tag='<script type="__bundler/template">';
const i0=src.indexOf(tag,100000)+tag.length,i1=src.indexOf('</script>',i0);
let t=JSON.parse(src.slice(i0,i1).trim());
function R(a,b){const n=t.split(a).length-1;if(n!==1)throw new Error('match '+n+': '+a.slice(0,80));t=t.split(a).join(b);}
/* markup: results under the search box */
R('<sc-if value="{{searchOpen}}" hint-placeholder-val="{{false}}"><input class="search tb-search" type="search" placeholder="Search patient or grievance" aria-label="Search" value="{{topQ}}" sc-camel-on-change="{{setTopQ}}"></sc-if>',
  '<sc-if value="{{searchOpen}}" hint-placeholder-val="{{false}}"><input class="search tb-search" type="search" placeholder="Type a name, room or UHID" aria-label="Search patients" value="{{topQ}}" sc-camel-on-input="{{setTopQ}}" sc-camel-on-keydown="{{topKey}}"><div class="tb-pop" style="right:140px;top:44px"><sc-for list="{{searchItems}}" as="n" hint-placeholder-count="3"><button class="np" type="button" sc-camel-on-click="{{n.go}}"><b>{{n.title}}</b><small>{{n.sub}}</small></button></sc-for><sc-if value="{{searchNone}}" hint-placeholder-val="{{false}}"><div class="small muted" style="padding:6px 10px">No patient matches.</div></sc-if></div></sc-if>');
/* state: typing only filters, Enter opens the first match */
R("NZ.setTopQ = function (e) { var q = e.target.value; self.setState({ topQ: q, gvQ: q, screen: 'concerns', filter: 'all', searchOpen: true }); };",
  "NZ.setTopQ = function (e) { self.setState({ topQ: e.target.value, searchOpen: true }); }; var __q = String(s.topQ || '').trim().toLowerCase(); var __hits = __q ? P.filter(function (p) { return (p.name + ' ' + p.room + ' ' + p.uhid).toLowerCase().indexOf(__q) >= 0; }) : []; NZ.searchItems = __hits.slice(0, 6).map(function (p) { return { title: p.name, sub: p.room + ' · ' + p.uhid, go: function (e) { if (e && e.stopPropagation) e.stopPropagation(); self.setState({ searchOpen: false, topQ: '', screen: 'record', pid: p.id, recTab: 'stay' }); } }; }); NZ.searchNone = !!__q && __hits.length === 0; NZ.topKey = function (e) { if (e && e.key === 'Enter' && NZ.searchItems.length) NZ.searchItems[0].go(e); };");
/* outside click closes the panels */
R("    try { if (window.PXG) { window.PXG.sync(this, d.C); window.PXG.start(this); } } catch (e) {}",
  "    try { if (window.PXG) { window.PXG.sync(this, d.C); window.PXG.start(this); } } catch (e) {}\n    if (!self.__oc) { self.__oc = 1; document.addEventListener('click', function (ev) { var t0 = ev.target; if (t0 && t0.closest && t0.closest('.tbr')) return; if (self.state.notifOpen || self.state.searchOpen) self.setState({ notifOpen: false, searchOpen: false }); }); }");
fs.writeFileSync(file,src.slice(0,i0)+'\n'+JSON.stringify(t).split('</').join('<'+String.fromCharCode(92)+'/')+'\n'+src.slice(i1));
console.log('ok');
