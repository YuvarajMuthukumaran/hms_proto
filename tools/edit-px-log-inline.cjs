/* 17 Nov 2026: "Log a call or concern" opens inline in the main page instead of a
   right-side drawer over a dark overlay. Root cause of the "bottom went blank" bug:
   .drawer is a flex item of .overlay with no min-height:0, so its overflow:auto never
   kicked in -- the long form just grew past the overlay's box, leaving the lower part
   of the screen undimmed. Moving it into <main> as a plain card sidesteps that whole
   fixed-height-overlay construct. */
const fs=require('fs');const file='public/px-lead-prototype.html';const src=fs.readFileSync(file,'utf8');
const tag='<script type="__bundler/template">';const i0=src.indexOf(tag,100000)+tag.length,i1=src.indexOf('</script>',i0);
let t=JSON.parse(src.slice(i0,i1).trim());

// 1. Cut the old block out of its current spot (balanced scan: it has nested <sc-if> inside).
const markerStart=t.indexOf('<!-- ============ LOG CONCERN DRAWER');
if(markerStart<0)throw new Error('marker not found');
const scIfStart=t.indexOf('<sc-if',markerStart);
let depth=0,i=scIfStart,blockEnd=-1;
const closeTag='</sc-if>';
while(i<t.length){
  const nextOpen=t.indexOf('<sc-if',i), nextClose=t.indexOf(closeTag,i);
  if(nextClose===-1)break;
  if(nextOpen!==-1&&nextOpen<nextClose){depth++;i=nextOpen+6;}
  else{depth--;i=nextClose+closeTag.length;if(depth===0){blockEnd=i;break;}}
}
if(blockEnd<0)throw new Error('unbalanced sc-if');
let block=t.slice(markerStart,blockEnd);

// sanity: this is exactly the block we expect
if(block.indexOf('aria-label="Log a grievance"')<0)throw new Error('unexpected block contents');

// 2. Restyle: drawer/overlay -> an inline card, same fields, no dark backdrop.
function R1(a,b){const n=block.split(a).length-1;if(n!==1)throw new Error('block match '+n+': '+a.slice(0,80));block=block.split(a).join(b);}
R1('<!-- ============ LOG CONCERN DRAWER ============ -->','<!-- ============ LOG A CALL OR CONCERN (opens in the main page) ============ -->');
R1('  <div class="overlay">\n    <div class="drawer" role="dialog" aria-label="Log a grievance">',
   '  <section class="card log-inline" style="padding:22px;display:flex;flex-direction:column;gap:14px;max-width:640px" role="region" aria-label="Log a grievance">');
R1('      <div style="display:flex;gap:8px;margin-top:auto"><button class="btn pri" type="button" sc-camel-on-click="{{saveConcern}}">{{saveLabel}}</button><button class="btn" type="button" sc-camel-on-click="{{closeLog}}">Cancel</button></div>\n    </div>\n  </div>\n</sc-if>',
   '      <div style="display:flex;gap:8px"><button class="btn pri" type="button" sc-camel-on-click="{{saveConcern}}">{{saveLabel}}</button><button class="btn" type="button" sc-camel-on-click="{{closeLog}}">Cancel</button></div>\n  </section>\n</sc-if>');

// 3. Remove the old (now-moved) block from its original spot, then splice the
//    restyled block in right after <main class="main"> opens.
t = t.slice(0,markerStart) + t.slice(blockEnd);
const mainTag='<main class="main">';
const mi=t.indexOf(mainTag);
if(mi<0)throw new Error('<main> not found');
t = t.slice(0,mi+mainTag.length) + '\n\n' + block + '\n' + t.slice(mi+mainTag.length);

fs.writeFileSync(file,src.slice(0,i0)+'\n'+JSON.stringify(t).split('</').join('<'+String.fromCharCode(92)+'/')+'\n'+src.slice(i1));console.log('ok');
