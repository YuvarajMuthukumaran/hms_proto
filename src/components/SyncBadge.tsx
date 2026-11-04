import { useSyncStatus } from '../supabase/syncStore';
import './SyncBadge.css';

const time = (d: Date) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

/** Small pill that says where the data lives: shared in Supabase, or demo data in this browser only. */
export function SyncBadge() {
  const { state, lastSync, error } = useSyncStatus();
  if (state === 'off') {
    return (
      <div className="sync-badge off" title="Supabase is not configured: changes stay in this browser.">
        Demo data · this browser only
      </div>
    );
  }
  if (state === 'connecting') return <div className="sync-badge">Connecting…</div>;
  if (state === 'error') {
    return (
      <div className="sync-badge bad" title={error}>
        Not saving to Supabase · retrying
      </div>
    );
  }
  return (
    <div className="sync-badge ok" title="Records are saved to Supabase and other roles' changes arrive every 30 seconds.">
      Synced{lastSync ? ` · ${time(lastSync)}` : ''}
    </div>
  );
}
