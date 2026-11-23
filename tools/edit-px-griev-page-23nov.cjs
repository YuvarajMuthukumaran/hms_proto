/* 23 Nov 2026 (Nikita's "HMS Grievances redesign"): the lead app's Grievances screen shows px/grievances.html (same concerns, new layout).
   The old screen stays in the bundle, switched off (isConcernsOld is never set). */
const rep=require('./rep.cjs');
rep('public/px-lead-prototype.html',[
 ['<sc-if value=\\"{{isConcerns}}\\" hint-placeholder-val=\\"{{false}}\\">',
  '<sc-if value=\\"{{isConcerns}}\\" hint-placeholder-val=\\"{{false}}\\"><iframe class=\\"px-emb\\" title=\\"Grievances\\" src=\\"px/grievances.html?embed=1\\"><\\/iframe><\\/sc-if>\\n<sc-if value=\\"{{isConcernsOld}}\\" hint-placeholder-val=\\"{{false}}\\">'],
]);
