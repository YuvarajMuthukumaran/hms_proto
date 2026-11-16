import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabase } from './auth';
import type { LegacyBridge, DocRow } from '../legacy/bridge';
import type { RoleKey } from '../roles';
import { RECORD_KINDS, canWrite, keysOf, stamp, type RecordKind } from './kinds';
import { setSyncStatus } from './syncStore';
import type { SupabaseConfig } from './config';

interface RecordRow {
  patient_id: string;
  kind: RecordKind;
  data: unknown;
  updated_at: string;
  updated_role: string;
}

const POLL_MS = 30_000;
const SAVE_DELAY_MS = 1_200;

/**
 * Keeps the old screens and Supabase in step:
 *  - at start it loads every patient's records, then
 *  - shortly after anything changes (every change re-renders) it saves what this role may write, and
 *  - every 30 s it pulls what other roles changed.
 * Each request carries this link's role (x-tulasi-role); row level security lets a role write only its own kinds.
 */
export class RecordSync {
  private readonly client: SupabaseClient;
  private readonly saved = new Map<string, string>(); // "<patient>|<kind>" -> text form last saved or loaded
  /** database inpatients whose saved records are still loading: nothing of theirs is saved until they arrive */
  private readonly waiting = new Set<string>();
  private readonly seen = new Map<string, string>(); // same keys -> the server's text we already applied (so a re-save of the same content never redraws the page)
  private since = '';
  private sinceDocs = '';
  private sinceGs = '';
  private gsWarned = false;
  private busy = false;
  private ready = false;
  private saveTimer = 0;
  private pollTimer = 0;
  private readonly unsubs: Array<() => void> = [];

  constructor(
    cfg: SupabaseConfig,
    private readonly bridge: LegacyBridge,
    private readonly role: RoleKey,
  ) {
    // the signed-in client (src/supabase/auth.ts): the database takes the role from the login, not from a header
    this.client = getSupabase(cfg);
  }

  async start() {
    setSyncStatus({ state: 'connecting', error: '' });
    try {
      // baseline what this browser already shows, then load the shared record
      for (const pid of this.bridge.pids()) {
        for (const kind of RECORD_KINDS) {
          const data = this.read(pid, kind);
          if (data != null) this.saved.set(`${pid}|${kind}`, stamp(data));
        }
      }
      // database inpatients join the wards after the page loads; until their records are loaded nothing of theirs is saved
      this.unsubs.push(this.bridge.on('added', (pids) => { pids.forEach((p) => this.waiting.add(p)); void this.pullFor(pids); }));
      await this.pull();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.warn('Supabase not reachable, using demo data in this browser:', msg);
      setSyncStatus({ state: 'error', error: msg });
      return;
    }
    this.ready = true;
    setSyncStatus({ state: 'live', lastSync: new Date(), error: '' });
    this.unsubs.push(
      this.bridge.on('render', () => this.soon()),
      // a patient's records created in this browser count as already saved until someone changes them
      this.bridge.on('patient', (pid, ctx) => {
        if (!this.ready) return;
        for (const kind of RECORD_KINDS) {
          const keys = keysOf(kind);
          if (!keys.length) continue;
          const k = `${pid}|${kind}`;
          if (!this.saved.has(k)) this.saved.set(k, stamp(this.bridge.readCtx(ctx, keys)));
        }
      }),
      this.bridge.on('audit', (e) => {
        if (!this.ready) return;
        void this.client
          .from('audit_log')
          .insert({
            patient_id: e.pid || null,
            role: this.role,
            actor: this.bridge.signer(),
            action: String(e.action ?? ''),
            detail: (e.formId ? `${e.formId} · ` : '') + String(e.detail ?? ''),
          })
          .then(() => undefined, () => undefined);
      }),
    );
    this.pollTimer = window.setInterval(() => void this.sync(), POLL_MS);
    this.bridge.rerender(); // show what was just loaded; the render also schedules the first save
  }

  stop() {
    this.ready = false;
    window.clearTimeout(this.saveTimer);
    window.clearInterval(this.pollTimer);
    this.unsubs.splice(0).forEach((u) => u());
  }

  private read(pid: string, kind: RecordKind) {
    return this.bridge.read(pid, kind, keysOf(kind));
  }

  private soon() {
    if (!this.ready) return;
    window.clearTimeout(this.saveTimer);
    this.saveTimer = window.setTimeout(() => void this.sync(), SAVE_DELAY_MS);
  }

  private async sync() {
    if (!this.ready || this.busy) return;
    this.busy = true;
    try {
      await this.push();
      const changed = await this.pull();
      setSyncStatus({ state: 'live', lastSync: new Date(), error: '' });
      if (changed) this.bridge.rerenderIfIdle();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.warn('Supabase sync:', msg);
      setSyncStatus({ state: 'error', error: msg });
    } finally {
      this.busy = false;
    }
  }

  private async push() {
    const rows: Array<{ patient_id: string; kind: RecordKind; data: unknown; updated_role: RoleKey; updated_by: string; updated_at: string }> = [];
    const pending: Array<[string, string]> = [];
    const who = this.bridge.signer();
    for (const pid of this.bridge.pids()) {
      if (this.waiting.has(pid)) continue;
      for (const kind of RECORD_KINDS) {
        if (!canWrite(this.role, kind)) continue;
        const data = this.read(pid, kind);
        const key = `${pid}|${kind}`;
        const text = stamp(data);
        if (data == null || this.saved.get(key) === text) continue;
        rows.push({ patient_id: pid, kind, data, updated_role: this.role, updated_by: who, updated_at: new Date().toISOString() });
        pending.push([key, text]);
      }
    }
    if (rows.length) {
      const { error } = await this.client.from('patient_records').upsert(rows, { onConflict: 'patient_id,kind' });
      if (error) throw new Error(`${error.code ?? ''} ${error.message}`.trim());
      pending.forEach(([k, t]) => this.saved.set(k, t));
    }

    await this.pushGlobal();

    const docs = canWrite(this.role, 'docs') ? this.bridge.docs() : null;
    if (docs) {
      const keys = new Set([...docs.submissions.map((x) => x.entryKey), ...Object.keys(docs.fills)]);
      const docRows: unknown[] = [];
      const docPending: Array<[string, string]> = [];
      keys.forEach((k) => {
        const submission = docs.submissions.find((x) => x.entryKey === k) ?? null;
        const doc = { submission, fills: docs.fills[k] ?? null };
        const text = stamp(doc);
        if (this.saved.get(`doc|${k}`) === text) return;
        docPending.push([`doc|${k}`, text]);
        const [patientId, formId] = k.split('|');
        // a form of a patient who is not on the wards here (e.g. a demo patient left in this browser before real-data mode): never sent
        if (!this.bridge.hasPatient(patientId)) return;
        docRows.push({
          entry_key: k,
          patient_id: patientId,
          form_id: formId,
          status: submission ? 'submitted' : 'draft',
          doc,
          updated_role: this.role,
          updated_by: who,
          updated_at: new Date().toISOString(),
        });
      });
      if (docRows.length) {
        const { error } = await this.client.from('clinical_docs').upsert(docRows, { onConflict: 'entry_key' });
        if (error) throw new Error(`${error.code ?? ''} ${error.message}`.trim());
        docPending.forEach(([k, t]) => this.saved.set(k, t));
      }
    }
  }

  /** Whole-hospital state (RMO shift handover, nurse instructions, Rounds seen marks): never stops the patient sync if the table is missing. */
  private async pushGlobal() {
    const gs = this.bridge.globalState();
    if (!gs) return;
    const rows: Array<{ key: string; data: unknown; updated_role: RoleKey; updated_by: string; updated_at: string }> = [];
    const pending: Array<[string, string]> = [];
    for (const [k, v] of Object.entries(gs)) {
      const text = stamp(v);
      if (this.saved.get(`gs|${k}`) === text) continue;
      rows.push({ key: k, data: v, updated_role: this.role, updated_by: this.bridge.signer(), updated_at: new Date().toISOString() });
      pending.push([`gs|${k}`, text]);
    }
    if (!rows.length) return;
    const { error } = await this.client.from('portal_state').upsert(rows, { onConflict: 'key' });
    if (error) {
      if (!this.gsWarned) console.warn('portal_state not saved (run supabase/migrations/20261116000200_portal_state.sql):', error.message);
      this.gsWarned = true;
      return;
    }
    pending.forEach(([k, t]) => this.saved.set(k, t));
  }

  private async pullGlobal(): Promise<number> {
    let q = this.client.from('portal_state').select('key,data,updated_at').order('updated_at', { ascending: true });
    if (this.sinceGs) q = q.gt('updated_at', this.sinceGs);
    const { data: rows, error } = await q;
    if (error) {
      if (!this.gsWarned) console.warn('portal_state not read (run supabase/migrations/20261116000200_portal_state.sql):', error.message);
      this.gsWarned = true;
      return 0;
    }
    let n = 0;
    for (const r of (rows ?? []) as Array<{ key: string; data: unknown; updated_at: string }>) {
      this.sinceGs = r.updated_at;
      const k = `gs|${r.key}`;
      const text = stamp(r.data);
      if (this.saved.get(k) === text || this.seen.get(k) === text) continue;
      this.bridge.applyGlobal(r.key, r.data);
      this.seen.set(k, text);
      const now = this.bridge.globalState()?.[r.key];
      this.saved.set(k, now !== undefined ? stamp(now) : text);
      n++;
    }
    return n;
  }

  /** Loads every saved record of these patients, whatever the time cursor says (they were not on the wards at the first pull). */
  private async pullFor(pids: string[]) {
    if (!pids.length) return;
    for (let i = 0; i < 50 && this.busy; i++) await new Promise((r) => setTimeout(r, 200));
    this.busy = true;
    try {
      const { data: rows, error } = await this.client.from('patient_records').select('patient_id,kind,data,updated_at').in('patient_id', pids);
      if (error) throw new Error(`${error.code ?? ''} ${error.message}`.trim());
      let n = 0;
      for (const r of (rows ?? []) as RecordRow[]) {
        if (!this.bridge.hasPatient(r.patient_id)) continue;
        const key = `${r.patient_id}|${r.kind}`;
        const text = stamp(r.data);
        this.bridge.apply(r.patient_id, r.kind, keysOf(r.kind), r.data);
        this.seen.set(key, text);
        const now = this.read(r.patient_id, r.kind);
        this.saved.set(key, now != null ? stamp(now) : text);
        n++;
      }
      pids.forEach((p) => this.waiting.delete(p));
      this.bridge.patientsLoaded(pids);
      if (n) this.bridge.rerenderIfIdle();
    } catch (e) {
      // keep them waiting (not saved) and try again shortly, so a blank record never overwrites a saved one
      console.warn('Supabase sync (new inpatients):', e instanceof Error ? e.message : String(e));
      window.setTimeout(() => void this.pullFor(pids), 5000);
    } finally {
      this.busy = false;
    }
  }

  /** Returns how many records or documents changed on screen. */
  private async pull(): Promise<number> {
    let q = this.client.from('patient_records').select('patient_id,kind,data,updated_at,updated_role').order('updated_at', { ascending: true });
    if (this.since) q = q.gt('updated_at', this.since);
    const { data: rows, error } = await q;
    if (error) throw new Error(`${error.code ?? ''} ${error.message}`.trim());
    let n = 0;
    for (const r of (rows ?? []) as RecordRow[]) {
      this.since = r.updated_at;
      // a patient not on the wards yet (a database inpatient still loading): skipped here, loaded by pullFor when they join
      if (!this.bridge.hasPatient(r.patient_id)) continue;
      const key = `${r.patient_id}|${r.kind}`;
      const text = stamp(r.data);
      if (this.saved.get(key) === text || this.seen.get(key) === text) continue;
      this.bridge.apply(r.patient_id, r.kind, keysOf(r.kind), r.data);
      this.seen.set(key, text);
      // what this browser shows now is what it would save back; never save the same content again just because it reads differently
      const now = this.read(r.patient_id, r.kind);
      this.saved.set(key, now != null ? stamp(now) : text);
      n++;
    }

    let dq = this.client.from('clinical_docs').select('entry_key,doc,updated_at').order('updated_at', { ascending: true });
    if (this.sinceDocs) dq = dq.gt('updated_at', this.sinceDocs);
    const { data: docs, error: docErr } = await dq;
    if (docErr) throw new Error(`${docErr.code ?? ''} ${docErr.message}`.trim());
    const docRows = (docs ?? []) as Array<DocRow & { updated_at: string }>;
    if (docRows.length) {
      // Only documents whose content really differs from what this browser already has are applied (and redraw the page).
      // Another browser re-saving the same documents moves their updated_at, but that is not a change for us.
      const fresh = docRows.filter((d) => {
        const text = stamp(d.doc ?? {});
        return this.saved.get(`doc|${d.entry_key}`) !== text && this.seen.get(`doc|${d.entry_key}`) !== text;
      });
      if (fresh.length) n += this.bridge.applyDocs(fresh);
      const local = fresh.length ? this.bridge.docs() : null;
      docRows.forEach((d) => {
        const k = `doc|${d.entry_key}`,text = stamp(d.doc ?? {});
        if (fresh.includes(d)) {
          this.seen.set(k, text);
          const submission = local?.submissions.find((x) => x.entryKey === d.entry_key) ?? null;
          this.saved.set(k, stamp({ submission, fills: local?.fills[d.entry_key] ?? null }));
        } else if (!this.saved.has(k)) this.saved.set(k, text);
        this.sinceDocs = d.updated_at;
      });
    }
    n += await this.pullGlobal();
    return n;
  }
}
