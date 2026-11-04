export const ROLES = [
  { key: 'lead', label: 'Floor lead', desc: 'Whole floor, all wards and psychiatrists' },
  { key: 'psychiatrist', label: 'Psychiatrist', desc: 'Your inpatients, rounds and orders' },
  { key: 'psychologist', label: 'Psychologist', desc: 'Therapy, daily notes and family updates' },
  { key: 'nurse', label: 'Nurse', desc: 'Ward care, vitals and medicine chart' },
  { key: 'rmo', label: 'RMO on duty', desc: 'Duty desk, admissions and physical exams' },
] as const;

export type RoleKey = (typeof ROLES)[number]['key'];

export const isRole = (v: string): v is RoleKey => ROLES.some((r) => r.key === v);

export const roleLabel = (k: RoleKey) => ROLES.find((r) => r.key === k)?.label ?? k;

/** One link per role: /lead, /psychiatrist, ... A link opens straight into its role (no password, owner's choice).
 *  `?as=<role>` stands in for the path when the app is served from a plain file host. */
export function roleFromLocation(loc: Location = window.location): RoleKey | null {
  const seg = (loc.pathname.split('/').filter(Boolean)[0] ?? '').toLowerCase();
  if (isRole(seg)) return seg;
  const q = (new URLSearchParams(loc.search).get('as') ?? '').toLowerCase();
  return isRole(q) ? q : null;
}

export const roleLink = (k: RoleKey) => `${window.location.origin}/${k}`;
