/* One-off (13 Nov 2026), card 144: PX grievances saved to the shared store and merged from it (public/px/px-grievances.js). */
const fs=require('fs'),path=require('path');
const file=path.join(__dirname,'..','public','px-lead-prototype.html');
const src=fs.readFileSync(file,'utf8');
const tag='<script type="__bundler/template">';
const i0=src.indexOf(tag,100000)+tag.length,i1=src.indexOf('</script>',i0);
let t=JSON.parse(src.slice(i0,i1).trim());
function R(a,b,n){const c=t.split(a).length-1;if(c!==(n||1))throw new Error('match '+c+': '+a.slice(0,70));t=t.split(a).join(b);}
R('<title>Tulasi · Patient Experience Lead</title>\n','<title>Tulasi · Patient Experience Lead</title>\n<script src="/px/px-grievances.js"></script>\n');
R("var self = this, s = this.state, d = this.data(), STEPS = d.STEPS, P = d.P, R = this.routes();","var self = this, s = this.state, d = this.data(), STEPS = d.STEPS, P = d.P, R = this.routes();\n    try { if (window.PXG) { window.PXG.sync(this); window.PXG.start(this); } } catch (e) {}");
R("'G-0' + (143 + self.state.extraConcerns.length)","(window.PXG ? window.PXG.nid(self) : 'G-0' + (143 + self.state.extraConcerns.length))",4);
R("'G-0' + (143 + extra.length + 20)","(window.PXG ? window.PXG.nid(self, extra.length - self.state.extraConcerns.length) : 'G-0' + (143 + extra.length + 20))",2);
fs.writeFileSync(file,src.slice(0,i0)+'\n'+JSON.stringify(t).split('</').join('<'+String.fromCharCode(92)+'/')+'\n'+src.slice(i1));
console.log('ok');
