import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { loadSupabaseConfig } from '../supabase/config';
import { getSupabase, accountRole, neededRole, cameForPassword, linkError, signOutEverywhere } from '../supabase/auth';
import { roleLabel, type RoleKey } from '../roles';

type State =
  | { kind: 'loading' }
  | { kind: 'open' } // no database configured: demo data in this browser, nothing to protect
  | { kind: 'signin'; msg?: string }
  | { kind: 'setpw'; msg?: string }
  | { kind: 'wrong'; has: string }
  | { kind: 'in' };

const box: React.CSSProperties = { maxWidth: 380, margin: '12vh auto 0', padding: 28, background: '#fff', border: '1px solid #e4e7ec', borderRadius: 16, boxShadow: '0 8px 30px rgba(16,24,40,.08)', font: '14px Inter,system-ui,sans-serif', color: '#101828' };
const input: React.CSSProperties = { width: '100%', boxSizing: 'border-box', height: 42, padding: '0 12px', border: '1px solid #d0d5dd', borderRadius: 10, font: 'inherit', marginTop: 6 };
const btn: React.CSSProperties = { width: '100%', height: 42, marginTop: 18, border: 0, borderRadius: 10, background: '#175cd3', color: '#fff', font: '600 14px Inter,system-ui,sans-serif', cursor: 'pointer' };
const page: React.CSSProperties = { position: 'fixed', inset: 0, overflow: 'auto', background: '#f6fbff', padding: '0 16px' };

/** Every role link needs a signed-in account with that role before any patient data loads. */
export function AuthGate({ role, children }: { role: RoleKey; children: ReactNode }) {
  const [st, setSt] = useState<State>({ kind: 'loading' });
  const [busy, setBusy] = useState(false);
  const need = neededRole(role);

  const check = (s: Session | null) => {
    if (cameForPassword && s) return setSt({ kind: 'setpw' });
    if (!s) return setSt({ kind: 'signin', msg: linkError || undefined });
    const has = accountRole(s);
    setSt(has === need ? { kind: 'in' } : { kind: 'wrong', has });
  };

  useEffect(() => {
    let off = () => {};
    (async () => {
      const cfg = await loadSupabaseConfig();
      if (!cfg) return setSt({ kind: 'open' });
      (window as unknown as { __TULASI_REAL?: boolean }).__TULASI_REAL = !!cfg.realData;
      const sb = getSupabase(cfg);
      const { data } = await sb.auth.getSession();
      check(data.session);
      const { data: sub } = sb.auth.onAuthStateChange((ev) => {
        if (ev === 'SIGNED_OUT') setSt({ kind: 'signin' });
      });
      off = () => sub.subscription.unsubscribe();
    })();
    return () => off();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function signIn(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    const cfg = await loadSupabaseConfig();
    const sb = getSupabase(cfg!);
    const { data, error } = await sb.auth.signInWithPassword({ email: String(f.get('email') || '').trim(), password: String(f.get('password') || '') });
    setBusy(false);
    if (error) return setSt({ kind: 'signin', msg: 'Wrong email or password.' });
    check(data.session);
  }

  async function setPassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const a = String(f.get('pw1') || ''),
      b = String(f.get('pw2') || '');
    if (a !== b) return setSt({ kind: 'setpw', msg: 'The two passwords are not the same.' });
    setBusy(true);
    const cfg = await loadSupabaseConfig();
    const sb = getSupabase(cfg!);
    const { error } = await sb.auth.updateUser({ password: a });
    setBusy(false);
    if (error) return setSt({ kind: 'setpw', msg: error.message });
    history.replaceState(null, '', window.location.pathname);
    const { data } = await sb.auth.getSession();
    const has = accountRole(data.session);
    setSt(has === need ? { kind: 'in' } : { kind: 'wrong', has });
  }

  if (st.kind === 'open' || st.kind === 'in') return <>{children}</>;
  if (st.kind === 'loading') return <div style={page} />;

  const head = (
    <div style={{ marginBottom: 18 }}>
      <div style={{ font: '700 18px Inter,system-ui,sans-serif' }}>Tulasi Clinical Portal</div>
      <div style={{ color: '#667085', marginTop: 4 }}>{roleLabel(role)}</div>
    </div>
  );

  if (st.kind === 'setpw')
    return (
      <div style={page}>
        <form style={box} onSubmit={setPassword}>
          {head}
          <div style={{ fontWeight: 600 }}>Choose a password for this login</div>
          <label style={{ display: 'block', marginTop: 14 }}>New password<input style={input} name="pw1" type="password" autoComplete="new-password" required /></label>
          <label style={{ display: 'block', marginTop: 12 }}>Type it again<input style={input} name="pw2" type="password" autoComplete="new-password" required /></label>
          {st.msg && <div role="alert" style={{ color: '#b42318', marginTop: 12 }}>{st.msg}</div>}
          <button style={btn} disabled={busy}>{busy ? 'Saving...' : 'Save password'}</button>
        </form>
      </div>
    );

  if (st.kind === 'wrong')
    return (
      <div style={page}>
        <div style={box}>
          {head}
          <div>This login is for <b>{st.has ? roleLabel(st.has as RoleKey) : 'no role'}</b>, not {roleLabel(role)}.</div>
          <button style={btn} onClick={() => void signOutEverywhere().then(() => setSt({ kind: 'signin' }))}>Sign in with another login</button>
        </div>
      </div>
    );

  return (
    <div style={page}>
      <form style={box} onSubmit={signIn}>
        {head}
        <label style={{ display: 'block' }}>Email<input style={input} name="email" type="email" autoComplete="username" required /></label>
        <label style={{ display: 'block', marginTop: 12 }}>Password<input style={input} name="password" type="password" autoComplete="current-password" required /></label>
        {st.msg && <div role="alert" style={{ color: '#b42318', marginTop: 12 }}>{st.msg}</div>}
        <button style={btn} disabled={busy}>{busy ? 'Signing in...' : 'Sign in'}</button>
      </form>
    </div>
  );
}
