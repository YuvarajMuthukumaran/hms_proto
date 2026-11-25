// 25 Nov (owner): PX Preferences tab redesign: icon + colour per section, section strip, team chips, filled ring, custom checks.
const fs=require('fs'),F=require('path').join(__dirname,'..','public','px','patients.html');let s=fs.readFileSync(F,'utf8');const crlf=s.includes('\r\n');s=s.split('\r\n').join('\n');
const rep=(a,b)=>{if(!s.includes(a))throw new Error('missing: '+a.slice(0,70));s=s.split(a).join(b);};
const IC=['<path d="M7 2v20M4 2v6a3 3 0 0 0 6 0V2M17 2c-2 0-3 2-3 6s1 5 3 5v9"/>',
'<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/>',
'<circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2M16 3.1a4 4 0 0 1 0 7.8M21 21v-2a4 4 0 0 0-3-3.9"/>',
'<path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v9"/>',
'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
'<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
'<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2M9 12h6M9 16h6"/>',
'<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/>'];
rep("function prefs(p){\n",
"/* 25 Nov (owner): Preferences redesign: an icon and colour per section, a section strip on top, team chips, filled count as a ring */\n"
+"const PF_IC="+JSON.stringify(IC)+";\n"
+"const PF_HUE=['#0E9384','#1570EF','#6E4FD8','#C4740C','#138A4E','#C4316F','#475467','#0B87C2'];\n"
+"const pfIco=(gi,sz)=>'<svg width=\"'+(sz||20)+'\" height=\"'+(sz||20)+'\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.9\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\">'+(PF_IC[gi]||PF_IC[6])+'</svg>';\n"
+"const pfRing=(a,b)=>{const C=2*Math.PI*9,p=b?a/b:0;return '<svg class=\"pf-ring\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"12\" r=\"9\" fill=\"none\" stroke=\"#E4E7EC\" stroke-width=\"3\"/><circle cx=\"12\" cy=\"12\" r=\"9\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-dasharray=\"'+(C*p).toFixed(1)+' '+C.toFixed(1)+'\" transform=\"rotate(-90 12 12)\"/></svg>';};\n"
+"function prefs(p){\n");
rep('<span class="pf-cnt">${n} of ${PF_GROUPS.length} sections filled</span></div>`;',
'<span class="pf-cnt">${n} of ${PF_GROUPS.length} sections filled</span></div>`\n'
+"    +'<nav class=\"pf-strip\" aria-label=\"Preference sections\">'+PF_GROUPS.map((g,gi)=>'<button type=\"button\" class=\"pf-chip'+(pfFilled(f,gi)?' ok':'')+'\" style=\"--h:'+PF_HUE[gi]+'\" data-pfjump=\"'+gi+'\" data-pid=\"'+P+'\">'+pfIco(gi,16)+'<span>'+esc(g[0])+'</span></button>').join('')+'</nav>';");
rep('return `<details class="pf-s" data-pid="${P}" data-gi="${gi}"${open?\' open\':\'\'}><summary><span class="pf-h"><b>${esc(g[0])}</b><span class="pf-st${read.length?\' ok\':\'\'}">${read.length?read.length+\' filled\':\'Empty\'}</span><span class="pf-seen">Seen by ${esc(g[1])}</span><span class="pf-chev" aria-hidden="true"></span></span>',
'return `<details class="pf-s" id="pfS${gi}" style="--h:${PF_HUE[gi]}" data-pid="${P}" data-gi="${gi}"${open?\' open\':\'\'}><summary><span class="pf-h"><span class="pf-ico">${pfIco(gi)}</span><span class="pf-tt"><b>${esc(g[0])}</b><span class="pf-seen" title="Seen by">${String(g[1]).split(\' · \').map(t=>\'<i>\'+esc(t)+\'</i>\').join(\'\')}</span></span><span class="pf-st${read.length?\' ok\':\'\'}">${pfRing(read.length,g[2].length)}${read.length?read.length+\' of \'+g[2].length:\'Empty\'}</span><span class="pf-chev" aria-hidden="true"></span></span>');
rep("document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-pfclose]');",
"document.addEventListener('click',e=>{const j=e.target.closest&&e.target.closest('[data-pfjump]');if(!j)return;const O=window.__pfO[j.dataset.pid]=window.__pfO[j.dataset.pid]||{};O[j.dataset.pfjump]=true;const y=window.scrollY;render();window.scrollTo(0,y);const d=document.getElementById('pfS'+j.dataset.pfjump);if(d)d.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});});\n"
+"document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-pfclose]');");
const css=".pf-strip{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 14px}.pf-chip{display:inline-flex;align-items:center;gap:7px;height:34px;padding:0 12px 0 10px;border-radius:99px;border:1px solid #E4E7EC;background:#fff;color:#475467;font:inherit;font-size:13px;font-weight:600;cursor:pointer;transition:border-color .15s,background .15s}"
+".pf-chip svg{color:var(--h)}.pf-chip:hover{border-color:var(--h)}.pf-chip.ok{background:color-mix(in srgb,var(--h) 10%,#fff);border-color:color-mix(in srgb,var(--h) 45%,#fff);color:#101828}.pf-chip.ok::after{content:'';width:6px;height:6px;border-radius:50%;background:var(--h)}.pf-chip:focus-visible{outline:2px solid var(--h);outline-offset:2px}"
+".pf-acc{gap:12px}.pf-s{position:relative;border:1px solid #E4E7EC;border-radius:14px;overflow:hidden;transition:box-shadow .2s,border-color .2s;scroll-margin-top:12px}.pf-s::before{content:'';position:absolute;left:0;top:0;bottom:0;width:4px;background:var(--h);opacity:.25;transition:opacity .2s}"
+".pf-s[open]{border-color:color-mix(in srgb,var(--h) 40%,#fff);box-shadow:0 1px 2px rgba(16,24,40,.05),0 8px 24px -12px color-mix(in srgb,var(--h) 40%,transparent)}.pf-s[open]::before{opacity:1}.pf-s:hover:not([open]){border-color:color-mix(in srgb,var(--h) 30%,#E4E7EC)}"
+".pf-s>summary{padding:14px 18px 14px 20px}.pf-s>summary:focus-visible{outline-color:var(--h)}.pf-h{gap:14px}.pf-ico{flex:none;width:40px;height:40px;border-radius:11px;display:grid;place-items:center;color:var(--h);background:color-mix(in srgb,var(--h) 11%,#fff);transition:background .2s,color .2s}.pf-s[open] .pf-ico{background:var(--h);color:#fff}"
+".pf-tt{display:flex;flex-direction:column;gap:5px;min-width:0}.pf-h .pf-tt b{font-size:16px;letter-spacing:-.01em}.pf-seen{margin:0;display:flex;flex-wrap:wrap;gap:5px}.pf-seen i{font-style:normal;font-size:11.5px;font-weight:500;color:#475467;background:#F2F4F7;border-radius:6px;padding:2px 7px}"
+".pf-st{margin-left:auto;display:inline-flex;align-items:center;gap:7px;font-size:13px;color:#98A2B3;white-space:nowrap}.pf-st .pf-ring{color:#D0D5DD}.pf-st.ok{color:#101828}.pf-st.ok .pf-ring{color:var(--h)}"
+".pf-read{padding-left:54px;margin-top:2px}"
+".pf-fill{padding:16px 20px 18px 74px;gap:16px 18px;border-top:1px dashed #EAECF0;background:linear-gradient(#FCFCFD,#fff 60px)}.pf-f{font-size:13px;color:#344054;gap:7px}"
+".pf-f select,.pf-f textarea{border-color:#D0D5DD;border-radius:10px;background-color:#fff;font-size:14px;color:#101828;transition:border-color .15s,box-shadow .15s}.pf-f select{height:42px}.pf-f textarea{min-height:42px}"
+".pf-f select:focus,.pf-f textarea:focus{outline:none;border-color:var(--h);box-shadow:0 0 0 4px color-mix(in srgb,var(--h) 16%,transparent)}"
+".pf-mc{position:relative;padding:6px 13px 6px 11px;border-color:#D0D5DD;font-size:13.5px;transition:background .15s,border-color .15s}.pf-mc input{position:absolute;opacity:0;pointer-events:none}.pf-mc::before{content:'';width:14px;height:14px;border-radius:4px;border:1.5px solid #98A2B3;flex:none;box-sizing:border-box}"
+".pf-mc:hover{border-color:var(--h)}.pf-mc:has(input:focus-visible){outline:2px solid var(--h);outline-offset:2px}.pf-mc.on{background:color-mix(in srgb,var(--h) 10%,#fff);border-color:var(--h);color:#101828}"
+".pf-mc.on::before{border-color:var(--h);background:var(--h) url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M3.5 8.5l3 3 6-7' fill='none' stroke='white' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\") center/11px no-repeat}"
+".pf-done .btn{background:var(--h);border-color:var(--h);color:#fff;font-weight:600;padding:0 22px}"
+"@media(max-width:640px){.pf-fill{padding:14px}.pf-read{padding-left:0}.pf-chip span{display:none}.pf-chip{padding:0 10px}.pf-seen{display:none}}@media(prefers-reduced-motion:reduce){.pf-s,.pf-s::before,.pf-chip,.pf-mc,.pf-ico{transition:none}}";
rep("+'@media(max-width:640px){.pf-read{grid-template-columns:1fr}.pf-seen{display:none}}@media(prefers-reduced-motion:reduce){.pf-chev{transition:none}}';",
"+'@media(max-width:640px){.pf-read{grid-template-columns:1fr}}@media(prefers-reduced-motion:reduce){.pf-chev{transition:none}}'\n +"+JSON.stringify(css)+";");
if(crlf)s=s.split('\n').join('\r\n');fs.writeFileSync(F,s);console.log('ok');
