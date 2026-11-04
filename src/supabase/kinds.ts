import type { RoleKey } from '../roles';

/** Which fields of a patient's record live in which kind of row (patient_records.kind).
 *  Must match supabase/migrations: public.role_kinds decides who may write each kind. */
export const CONTEXT_KINDS = {
  doctor: ['dx', 'section', 'meds', 'medsOff', 'rx', 'labs', 'obs', 'obsBy', 'edd', 'eddShared', 'eddBy', 'historyStatus', 'historyDraft', 'capacityOpen', 'capacityDone', 'reassessDone', 'plansSigned', 'discharge', 'dischargeDrafted', 'draftBy', 'discharged', 'dtype', 'admNo', 'pastAdm', 'team', 'calls', 'dailySaved', 'familySent', 'psyx'],
  psychology: ['psychRows', 'therapyNotes', 'dn'],
  consents: ['consents'],
  events: ['events', 'restraints', 'pgriev'],
  prefs: ['diet', 'pf', 'pfAt', 'pfUp', 'prefBy', 'contacts', 'billing'],
  vitals: ['vit', 'sugar', 'sugarHd', 'adh', 'adhT', 'vc', 'monx', 'nsum'],
} as const satisfies Record<string, readonly string[]>;

export type ContextKind = keyof typeof CONTEXT_KINDS;
/** `notes` are end-of-day notes, `mar` the dose ticks of the medicine chart. */
export type RecordKind = ContextKind | 'notes' | 'mar';
export type WriteScope = RecordKind | 'docs';

export const RECORD_KINDS: RecordKind[] = [...(Object.keys(CONTEXT_KINDS) as ContextKind[]), 'notes', 'mar'];

const WRITERS: Record<WriteScope, readonly RoleKey[]> = {
  doctor: ['psychiatrist', 'lead', 'rmo'],
  psychology: ['psychologist', 'psychiatrist', 'lead'],
  consents: ['psychiatrist', 'lead', 'rmo'],
  events: ['lead', 'psychiatrist', 'psychologist', 'nurse', 'rmo'],
  prefs: ['lead', 'psychiatrist', 'psychologist', 'nurse', 'rmo'],
  vitals: ['nurse', 'rmo'],
  notes: ['psychologist', 'psychiatrist', 'lead'],
  mar: ['nurse', 'rmo'],
  docs: ['lead', 'psychiatrist', 'psychologist'],
};

export const canWrite = (role: RoleKey, scope: WriteScope) => WRITERS[scope].includes(role);

export const keysOf = (kind: RecordKind): readonly string[] =>
  kind in CONTEXT_KINDS ? CONTEXT_KINDS[kind as ContextKind] : [];

/** Stable text form of a value, used to tell whether it changed since it was last saved or loaded. */
export const stamp = (v: unknown) => JSON.stringify(v === undefined ? null : v);
