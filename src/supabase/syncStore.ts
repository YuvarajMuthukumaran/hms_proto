import { useSyncExternalStore } from 'react';

export type SyncState = 'off' | 'connecting' | 'live' | 'error';

export interface SyncStatus {
  state: SyncState;
  lastSync: Date | null;
  error: string;
}

let status: SyncStatus = { state: 'off', lastSync: null, error: '' };
const listeners = new Set<() => void>();

export function setSyncStatus(patch: Partial<SyncStatus>) {
  status = { ...status, ...patch };
  listeners.forEach((fn) => fn());
}

export function useSyncStatus(): SyncStatus {
  return useSyncExternalStore(
    (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    () => status,
  );
}
