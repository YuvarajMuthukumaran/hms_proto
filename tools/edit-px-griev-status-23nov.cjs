/* 23 Nov 2026 (owner): grievance statuses are Open, Pending action, Escalated, Closed (filters and the label on each ticket).
   Escalated = raised to Chandraji or past the 6-hour limit; Pending action = the owner has finished and it waits for PX to confirm;
   Open = everything else still open. */
const rep=require('./rep.cjs');
rep('public/px-lead-prototype.html',[
 ["statusCls: STATUS[SMAP[c.status] || c.status] || 'chip grey', status:",
  "statusCls: closed ? 'chip green' : (c.status === 'Escalated' || c.slaTone === 'red' || /breach|past/i.test(String(c.sla || ''))) ? 'chip red' : stg.n === 'confirm' ? 'chip amber' : 'chip blue', status:"],
 ["stLabel: closed ? 'Closed' : c.category === 'Safety' ? 'Safety' : stg.n === 'confirm' ? 'Ready to confirm' : (c.slaTone === 'red' || /breach|past/i.test(String(c.sla || ''))) ? 'Past 6 h' : 'With owner',",
  "stLabel: closed ? 'Closed' : (c.status === 'Escalated' || c.slaTone === 'red' || /breach|past/i.test(String(c.sla || ''))) ? 'Escalated' : stg.n === 'confirm' ? 'Pending action' : 'Open',"],
 ["var FILTERS = [['open', 'All open'], ['ready', 'Ready to confirm'], ['owner', 'With owner'], ['closed', 'Closed']];",
  "var FILTERS = [['open', 'Open'], ['pending', 'Pending action'], ['esc', 'Escalated'], ['closed', 'Closed']];"],
 ["return f === 'all' ? true : f === 'open' ? c.status !== 'Closed' : f === 'ready' ? c.stageN === 'confirm' : f === 'owner' ? (c.status !== 'Closed' && c.stageN !== 'confirm') : c.status === 'Closed'; };",
  "return f === 'all' ? true : c.stLabel === ({ open: 'Open', pending: 'Pending action', esc: 'Escalated', closed: 'Closed' }[f] || 'Open'); };"],
]);
/* alert buttons and the Confirm step jump to the matching new filter: ready -> pending, owner -> esc (applied by hand with split/join) */
