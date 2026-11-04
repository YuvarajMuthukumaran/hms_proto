/** Shown while the portal scripts download and start (usually well under a second). */
export function Splash() {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, background: '#f6fbff', color: '#5b6475', font: '500 14px Inter,system-ui,sans-serif' }}
    >
      <img src="/logo.png" alt="" width={64} height={64} />
      <span>Opening your workspace…</span>
    </div>
  );
}
