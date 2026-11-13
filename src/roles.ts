export const ROLES = [
  { key: 'floor-lead-psychologist', label: 'Floor Lead Psychologist', desc: 'Psychology across wards' },
  { key: 'floor-lead-psychiatrist', label: 'Floor Lead Psychiatrist', desc: 'Psychiatry across wards' },
  { key: 'floor-coordinator', label: 'Floor Coordinator', desc: 'All wards and teams' },
  { key: 'psychiatrist', label: 'Psychiatrist', desc: 'Patients, rounds and orders' },
  { key: 'patient-experience-lead', label: 'Patient Experience Lead', desc: 'Concerns and preferences' },
  { key: 'psychologist', label: 'Psychologist', desc: 'Therapy and family updates' },
  { key: 'nurse', label: 'Nurse', desc: 'Ward care and medicines' },
  { key: 'rmo', label: 'RMO on duty', desc: 'Rounds, records and orders' },
] as const;

/** Roles that can be picked. `lead` is only the old workspace behind the Floor Coordinator (and the old /lead link). */
export type PickerRole = (typeof ROLES)[number]['key'];
export type RoleKey = PickerRole | 'lead';

export const isRole = (v: string): v is PickerRole => ROLES.some((r) => r.key === v);

export const roleLabel = (k: RoleKey) => ROLES.find((r) => r.key === k)?.label ?? k;

/** Reuse the nearest established workspace while these prototype roles are being shaped. */
export const workspaceRole = (k: RoleKey): RoleKey => {
  switch (k) {
    case 'rmo': return 'psychiatrist';
    case 'floor-coordinator': return 'lead';
    case 'floor-lead-psychiatrist': return 'psychiatrist';
    case 'floor-lead-psychologist': return 'psychologist';
    case 'patient-experience-lead': return 'psychologist';
    default: return k;
  }
};

/** The key a link syncs under when SUPABASE_ROLE_KEYS is on. The floor coordinator keeps the old `lead` key; the Patient Experience Lead is a separate app. */
export const syncKey = (k: RoleKey): RoleKey => (k === 'floor-coordinator' ? 'lead' : k === 'patient-experience-lead' ? 'psychologist' : k);

/** One link per role: /lead, /psychiatrist, ... A link opens straight into its role (no password, owner's choice).
 *  `?as=<role>` stands in for the path when the app is served from a plain file host. */
export function roleFromLocation(loc: Location = window.location): PickerRole | null {
  const seg = (loc.pathname.split('/').filter(Boolean)[0] ?? '').toLowerCase();
  if (seg === 'lead') return 'floor-coordinator'; // the old link for the Floor Coordinator
  if (isRole(seg)) return seg;
  const q = (new URLSearchParams(loc.search).get('as') ?? '').toLowerCase();
  return q === 'lead' ? 'floor-coordinator' : isRole(q) ? q : null;
}

export const roleLink = (k: RoleKey) => `${window.location.origin}/${k}`;
