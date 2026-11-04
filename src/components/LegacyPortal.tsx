import { useEffect, useState } from 'react';
import markup from '../legacy/markup.html?raw';
import { bootLegacy } from '../legacy/loadLegacy';
import { loadSupabaseConfig } from '../supabase/config';
import { RecordSync } from '../supabase/sync';
import { setSyncStatus } from '../supabase/syncStore';
import { SyncBadge } from './SyncBadge';
import type { RoleKey } from '../roles';

/** The inpatient workspace for one role. The screens are still the original ones (mounted from the old markup and scripts);
 *  login, role links and Supabase sync are React/TypeScript. Screens move into React components one at a time. */
export function LegacyPortal({ role }: { role: RoleKey }) {
  const [error, setError] = useState('');

  useEffect(() => {
    let sync: RecordSync | null = null;
    let cancelled = false;
    (async () => {
      try {
        const bridge = await bootLegacy(role, (m) => setError((prev) => prev || m));
        const cfg = await loadSupabaseConfig();
        if (cancelled || !cfg) return;
        sync = new RecordSync(cfg, bridge, role);
        await sync.start();
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
        setSyncStatus({ state: 'error', error: String(e) });
      }
    })();
    return () => {
      cancelled = true;
      sync?.stop();
    };
  }, [role]);

  return (
    <>
      {/* the old markup is static; its inline handlers call the old scripts */}
      <div style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: markup }} />
      <SyncBadge />
      {error && (
        <div role="alert" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 10000, background: '#b42318', color: '#fff', padding: '8px 14px', font: '600 13px Inter,system-ui,sans-serif' }}>
          The portal hit an error: {error}
        </div>
      )}
    </>
  );
}
