/* One-off: calmer, rounder "go" card on the easy screens. */
const fs=require('fs'),path=require('path');
const file=path.join(__dirname,'..','public','px-lead-prototype.html');
const src=fs.readFileSync(file,'utf8');
const tag='<script type="__bundler/template">';
const i0=src.indexOf(tag,100000)+tag.length,i1=src.indexOf('</script>',i0);
let t=JSON.parse(src.slice(i0,i1).trim());
if(t.includes('lz-go::before'))throw new Error('already applied');
const css=`
.lz-go{position:relative;border:1px solid #dbe6f5;border-radius:20px;padding:22px 28px 22px 36px;background:linear-gradient(135deg,#fff 0%,#f3f8ff 100%);box-shadow:0 1px 2px rgba(20,40,75,.04),0 10px 26px -14px rgba(30,108,219,.25);overflow:hidden}
.lz-go::before{content:"";position:absolute;left:15px;top:22px;bottom:22px;width:5px;border-radius:99px;background:#1e6cdb}
.lz-go.ok{background:linear-gradient(135deg,#fff 0%,#effaf5 100%);border-color:#cdeadd;box-shadow:0 1px 2px rgba(20,40,75,.04),0 10px 26px -14px rgba(14,124,102,.25)}
.lz-go.ok::before{background:#0e7c66}
.lz-go.warn{background:linear-gradient(135deg,#fff 0%,#fff7e8 100%);border-color:#f1dcae;box-shadow:0 1px 2px rgba(20,40,75,.04),0 10px 26px -14px rgba(212,136,6,.25)}
.lz-go.warn::before{background:#d48806}
.lz-go h2{font-size:23px}
.lz-go .btn.pri{box-shadow:0 8px 16px -8px rgba(30,108,219,.6);transition:transform .15s ease,box-shadow .15s ease,background-color .15s ease}
.lz-go .btn.pri:hover{transform:translateY(-1px);box-shadow:0 12px 20px -8px rgba(30,108,219,.6)}
.lz-go .btn:focus-visible{outline:3px solid #9cc2f5;outline-offset:2px}
@media (prefers-reduced-motion:reduce){.lz-go .btn.pri{transition:none}.lz-go .btn.pri:hover{transform:none}}
`;
const m='.btn.lz-big{height';
if(t.split(m).length!==2)throw new Error('anchor');
t=t.split(m).join(css+m);
fs.writeFileSync(file,src.slice(0,i0)+'\n'+JSON.stringify(t).split('</').join('<'+String.fromCharCode(92)+'/')+'\n  '+src.slice(i1));
console.log('ok');
