/* 23 Nov 2026 (Nikita: "max can be 90 pt"): one Patient Experience person has at most 90 patients.
   Patients are grouped by floor (from p.floor, else the first digit of the room number); a floor with more than 90 is split
   evenly by room. Groups go to the people of the Rounds allocation (Setting) in order, each person taking whole groups up to 90.
   VVIP patients go to the person allocated "vvip" when there is one. Used by Rounds (rounds-v2.js) and Patients (patients.html).
   PXSplit.owner(list, people, vvip) -> { byId: {patientId: name}, count: {name: n}, unassigned: n, groups: [{label, n, who}] } */
(function () {
  var CAP = 90;
  function floorOf(p) {
    var f = String(p.floor || '').match(/\d+/);
    if (f) return +f[0];
    var r = String(p.room || '').replace(/^Room\s*/i, '').match(/\d+/);
    return r && r[0].length >= 3 ? +r[0].charAt(0) : 0;
  }
  function roomKey(p) { return String(p.room || '').replace(/^Room\s*/i, ''); }
  var ord = function (n) { return n + (n % 10 === 1 && n % 100 !== 11 ? 'st' : n % 10 === 2 && n % 100 !== 12 ? 'nd' : n % 10 === 3 && n % 100 !== 13 ? 'rd' : 'th'); };
  function owner(list, people, vvip) {
    vvip = vvip || {};
    var names = (people || []).map(function (a) { return a.name; }).filter(Boolean);
    var vName = ((people || []).filter(function (a) { return a.who === 'vvip'; })[0] || {}).name || '';
    var out = { byId: {}, count: {}, unassigned: 0, groups: [] };
    names.forEach(function (n) { out.count[n] = 0; });
    var rest = [];
    list.forEach(function (p) {
      if (vName && vvip[p.id]) { out.byId[p.id] = vName; out.count[vName]++; } else rest.push(p);
    });
    var floors = {};
    rest.forEach(function (p) { var f = floorOf(p); (floors[f] = floors[f] || []).push(p); });
    var groups = [];
    Object.keys(floors).map(Number).sort(function (a, b) { return a - b; }).forEach(function (f) {
      var L = floors[f].slice().sort(function (a, b) { return roomKey(a).localeCompare(roomKey(b), undefined, { numeric: true }) || String(a.name).localeCompare(String(b.name)); });
      var parts = Math.max(1, Math.ceil(L.length / CAP)), sz = Math.ceil(L.length / parts);
      for (var i = 0; i < parts; i++) {
        var g = L.slice(i * sz, (i + 1) * sz);
        if (!g.length) continue;
        var lab = (f ? ord(f) + ' floor' : 'No room yet') + (parts > 1 ? ' (rooms ' + roomKey(g[0]) + ' to ' + roomKey(g[g.length - 1]) + ')' : '');
        groups.push({ label: lab, list: g });
      }
    });
    var left = [];
    groups.forEach(function (g) {
      var who = names.filter(function (n) { return out.count[n] + g.list.length <= CAP; }).sort(function (a, b) { return out.count[a] - out.count[b]; })[0] || '';
      if (!who) { left.push(g); return; }
      g.list.forEach(function (p) { out.byId[p.id] = who; });
      out.count[who] += g.list.length;
      out.groups.push({ label: g.label, n: g.list.length, who: who });
    });
    /* a group that fits nobody whole is shared out in room order to whoever still has room; what is left is "Not allocated" */
    left.forEach(function (g) {
      var parts = {};
      g.list.forEach(function (p) {
        var who = names.filter(function (n) { return out.count[n] < CAP; }).sort(function (a, b) { return out.count[a] - out.count[b]; })[0] || '';
        if (who) { out.byId[p.id] = who; out.count[who]++; (parts[who] = parts[who] || []).push(p); } else out.unassigned++;
      });
      Object.keys(parts).forEach(function (w) { var L = parts[w]; out.groups.push({ label: g.label.replace(/ \(rooms.*\)$/, '') + ' (rooms ' + roomKey(L[0]) + ' to ' + roomKey(L[L.length - 1]) + ')', n: L.length, who: w }); });
    });
    return out;
  }
  window.PXSplit = { CAP: CAP, owner: owner, floorOf: floorOf };
})();
