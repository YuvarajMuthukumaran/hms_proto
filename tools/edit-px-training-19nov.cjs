/* 19 Nov 2026 (meeting): Staff training shows Sessions only. People, Add staff, Paste a list and Plan/Edit a session move to the admin panel (Setting > Staff and training, training.html?admin=1). */
const rep=require('./rep.cjs');
rep('public/px/training.html',[
["const KEY='px_training_v2';","const ADMIN=/[?&]admin=1/.test(location.search);\nconst KEY='px_training_v2';"],
["S.view='people';S.team='All';","S.view=ADMIN?'people':'sessions';S.team='All';"],
["${window.PX_REAL?'<button class=\"btn\" data-addst=\"one\">Add staff</button><button class=\"btn\" data-addst=\"list\">Paste a list</button>':''}<button class=\"btn pri\" data-planmod=\"rights\" data-people=\"\">Plan a session</button></div></div>",
 "${ADMIN?((window.PX_REAL?'<button class=\"btn\" data-addst=\"one\">Add staff</button><button class=\"btn\" data-addst=\"list\">Paste a list</button>':'')+'<button class=\"btn pri\" data-planmod=\"rights\" data-people=\"\">Plan a session</button>'):''}</div></div>"],
["<div class=\"bar\"><div class=\"seg\"><button class=\"${S.view==='people'?'on':''}\" data-v=\"people\">People</button><button class=\"${S.view==='sessions'?'on':''}\" data-v=\"sessions\">Sessions</button></div>",
 "<div class=\"bar\">${ADMIN?`<div class=\"seg\"><button class=\"${S.view==='people'?'on':''}\" data-v=\"people\">People</button><button class=\"${S.view==='sessions'?'on':''}\" data-v=\"sessions\">Sessions</button></div>`:'<div></div>'}"],
["<td>${c?'<span class=\"ok small\">Done</span>':`<button class=\"btn sm pri\" data-att=\"${s.id}\">Take attendance</button>`}</td></tr>`",
 "<td>${c?'<span class=\"ok small\">Done</span>':`<button class=\"btn sm pri\" data-att=\"${s.id}\">Take attendance</button>`+(ADMIN?` <button class=\"btn sm\" data-editsess=\"${s.id}\">Edit</button>`:'')}</td></tr>`"],
["const need=PEOPLE.filter(p=>mods(p).some(x=>x.id===P.mod)&&!S.done[p.id].includes(P.mod));\n","const need=PEOPLE.filter(p=>P.ppl.includes(p.id)||(mods(p).some(x=>x.id===P.mod)&&!S.done[p.id].includes(P.mod)));\n"],
["<h3>Plan a session</h3>","<h3>${P.edit?'Edit the session':'Plan a session'}</h3>"],
["<label>People who still need it (pre-ticked)</label>","<label>Audience: people who still need it (filled in from the module, change it if you need)</label>"],
["<button class=\"btn pri\" data-planok=\"1\" style=\"width:100%;justify-content:center;text-align:center\">Plan the session</button>","<button class=\"btn pri\" data-planok=\"1\" style=\"width:100%;justify-content:center;text-align:center\">${P.edit?'Save the session':'Plan the session'}</button>"],
["[data-att2],[data-attok]');if(!t)return;const d=t.dataset;","[data-att2],[data-attok],[data-editsess]');if(!t)return;const d=t.dataset;\n  if(d.editsess){const x=S.sess.find(y=>y.id===d.editsess);if(x){S.plan={mod:x.mod,date:x.when.slice(0,10),time:x.when.slice(11,16)||'11:00',place:x.place||'Training room',ppl:x.invited.slice(),edit:x.id};}render();return;}"],
["const ns={id:'s'+(++S.n),when:($('pd').value||P.date)+'T'+($('pt').value||P.time),mod:m,place:$('pw').value||'Training room',invited:ppl,came:null};","const ns={id:P.edit||'s'+(++S.n),when:($('pd').value||P.date)+'T'+($('pt').value||P.time),mod:m,place:$('pw').value||'Training room',invited:ppl,came:null};if(P.edit){const ix=S.sess.findIndex(y=>y.id===P.edit);if(ix>=0)S.sess.splice(ix,1);}"],
["S.sess.push(ns);S.plan=null;S.view='sessions';save();toast(ppl.length+' invited. They get it in their portal and on WhatsApp.');}","S.sess.push(ns);S.plan=null;S.view='sessions';save();toast(P.edit?'Session saved.':ppl.length+' invited. They get it in their portal and on WhatsApp.');}"],
]);
rep('public/px/setting.html',[
["<button id=\"t3\" onclick=\"tab(3)\">Training modules</button></div>","<button id=\"t3\" onclick=\"tab(3)\">Training modules</button><button id=\"t4\" onclick=\"tab(4)\">Staff and training sessions</button></div>"],
["function tab(n){[1,2,3].forEach(","function tab(n){if(n===4&&!document.getElementById('adm').src)document.getElementById('adm').src='training.html?embed=1&admin=1';[1,2,3,4].forEach("],
["</section>\n</div>","</section>\n  <section class=\"card\" id=\"p4\" style=\"display:none\">\n    <h3>Staff and training sessions</h3>\n    <div class=\"pad small muted\">Admin: add or paste the staff list, plan a training session, or edit one. The audience fills in from the module (people who still need it); change it if you need to. The Staff training page shows the sessions only.</div>\n    <iframe id=\"adm\" title=\"Staff and training admin\"></iframe>\n  </section>\n</div>"],
]);
