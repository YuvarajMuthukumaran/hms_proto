import type { RoleKey } from '../roles';

/** Which fields of a patient's record live in which kind of row (patient_records.kind).
 *  Must match supabase/migrations: public.role_kinds decides who may write each kind. */
export const CONTEXT_KINDS = {
  doctor: ['dx', 'section', 'meds', 'medsOff', 'rx', 'labs', 'obs', 'obsBy', 'edd', 'eddShared', 'eddBy', 'historyStatus', 'historyDraft', 'capacityOpen', 'capacityDone', 'reassessDone', 'plansSigned', 'discharge', 'dischargeDrafted', 'draftBy', 'discharged', 'dtype', 'admNo', 'pastAdm', 'team', 'calls', 'dailySaved', 'familySent', 'psyx'],
  psychology: ['psychRows', 'therapyNotes', 'dn'],
  consents: ['consents'],
  events: ['events', 'restraints', 'pgriev'],
  prefs: ['diet', 'pf', 'pfAt', 'pfUp', 'prefBy', 'contacts', 'billing', 'famCons'],
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
/**
 * A text form used only to ask "did this record change?". Object keys are sorted so the same data always gives the same text.
 * Supabase (jsonb) hands objects back with the keys in a different order; with plain JSON.stringify that looked like a change
 * every time, so each save came back as "someone else changed this", the page was redrawn, saved again, and so on:
 * every dashboard flickered by itself.
 */
const canon = (v: unknown): unknown => {
  if (Array.isArray(v)) return v.map(canon);
  if (v && typeof v === 'object') {
    const o = v as Record<string, unknown>;
    return Object.keys(o)
      .sort()
      .reduce<Record<string, unknown>>((acc, k) => {
        acc[k] = canon(o[k]);
        return acc;
      }, {});
  }
  return v;
};
export const stamp = (v: unknown) => JSON.stringify(canon(v === undefined ? null : v));
