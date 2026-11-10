import type { RoleKey } from '../roles';

/** What the React shell hands to the legacy portal before its scripts run. */
export interface TulasiBoot {
  role: RoleKey;
  viewRole: RoleKey;
}

export interface AuditEntry {
  pid?: string | null;
  formId?: string;
  action?: string;
  detail?: string;
}

export interface DocRow {
  entry_key: string;
  doc: { submission?: unknown; fills?: unknown } | null;
}

export interface DocsSnapshot {
  submissions: Array<{ entryKey: string }>;
  fills: Record<string, unknown>;
}

/** Defined by public/legacy/react-bridge.js, the last legacy script. It is the only door between React and the old screens. */
export interface LegacyBridge {
  role(): RoleKey;
  signer(): string;
  logout(): void;
  pids(): string[];
  hasPatient(pid: string): boolean;
  read(pid: string, kind: string, keys: readonly string[]): unknown;
  apply(pid: string, kind: string, keys: readonly string[], data: unknown): void;
  docs(): DocsSnapshot | null;
  applyDocs(rows: DocRow[]): number;
  rerender(): void;
  rerenderIfIdle(): void;
  on(event: 'render', fn: () => void): () => void;
  on(event: 'patient', fn: (pid: string, ctx: Record<string, unknown>) => void): () => void;
  on(event: 'audit', fn: (e: AuditEntry) => void): () => void;
}

declare global {
  interface Window {
    __TULASI__?: TulasiBoot;
    TulasiBridge?: LegacyBridge;
  }
}
