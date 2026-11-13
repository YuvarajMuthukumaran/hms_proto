import { useEffect, useState } from 'react';
import markup from '../legacy/markup.html?raw';
import { bootLegacy } from '../legacy/loadLegacy';
import { loadSupabaseConfig } from '../supabase/config';
import { RecordSync } from '../supabase/sync';
import { setSyncStatus } from '../supabase/syncStore';
import { SyncBadge } from './SyncBadge';
import { Splash } from './Splash';
import { workspaceRole, syncKey, type RoleKey } from '../roles';

/** The inpatient workspace for one role. The screens are still the original ones (mounted from the old markup and scripts);
 *  login, role links and Supabase sync are React/TypeScript. Screens move into React components one at a time. */
export function LegacyPortal({ role }: { role: RoleKey }) {
  const screenRole = workspaceRole(role);
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let sync: RecordSync | null = null;
    let cancelled = false;
    (async () => {
      try {
        const bridge = await bootLegacy(role, screenRole, (m) => setError((prev) => prev || m));
        if (!cancelled) setReady(true);
        const cfg = await loadSupabaseConfig();
        if (cancelled || !cfg) return;
        sync = new RecordSync(cfg, bridge, cfg.roleKeys ? syncKey(role) : screenRole);
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
  }, [role, screenRole]);

  return (
    <>
      {/* the old markup is static; its inline handlers call the old scripts */}
      {/* hidden until the role's own screens have drawn, so no half-started page (or old dashboard) is ever seen */}
      <div style={{ display: 'contents', visibility: ready ? 'visible' : 'hidden' }} dangerouslySetInnerHTML={{ __html: markup }} />
      {!ready && !error && <Splash />}
      <SyncBadge />
      {error && (
        <div role="alert" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 10000, background: '#b42318', color: '#fff', padding: '8px 14px', font: '600 13px Inter,system-ui,sans-serif' }}>
          The portal hit an error: {error}
        </div>
      )}
    </>
  );
}
