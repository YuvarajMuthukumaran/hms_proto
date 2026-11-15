import { createClient, type Session, type SupabaseClient } from '@supabase/supabase-js';
import type { SupabaseConfig } from './config';
import type { RoleKey } from '../roles';

/** One Supabase client for the whole page: the sign-in, the record sync and (through public/auth-shim.js) every direct REST call
 *  use the same signed-in session. The session lives in localStorage, so the embedded Patient Experience pages (same origin) see it. */
let client: SupabaseClient | null = null;

export function getSupabase(cfg: SupabaseConfig): SupabaseClient {
  if (!client) {
    client = createClient(cfg.url, cfg.key, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    });
  }
  return client;
}

/** The role stored on the account (app_metadata.role, set by tools/make_accounts.py; the user cannot change it). */
export const accountRole = (s: Session | null): string => String((s?.user?.app_metadata as { role?: string } | undefined)?.role ?? '');

/** Each role has one login, named after the role (tools/rename_logins.py); the sign-in page asks only for the password. */
export const roleEmail = (role: string) => `${role}@tulasi-portal.example`;

/** The account role a link needs: the floor coordinator signs in as `lead`; every other link signs in as itself. */
export const neededRole = (link: RoleKey): string => (link === 'floor-coordinator' ? 'lead' : link);

/** An invite or password-reset link was opened: the page must ask for a new password before anything else. */
export const cameForPassword = (() => {
  const h = window.location.hash || '';
  return /type=(invite|recovery)/.test(h);
})();

/** A set-password link that was already used or is older than an hour comes back with an error in the address. */
export const linkError = (() => {
  const h = window.location.hash || '';
  if (!/error_code=|error=/.test(h)) return '';
  return /expired/.test(h) ? 'This set-password link has expired (they last one hour). Ask for a new one.' : 'This set-password link did not work. Ask for a new one.';
})();

export async function signOutEverywhere() {
  try {
    await client?.auth.signOut();
  } catch {
    /* offline: the local copy is cleared below */
  }
  Object.keys(localStorage)
    .filter((k) => /^sb-.*-auth-token$/.test(k))
    .forEach((k) => localStorage.removeItem(k));
}
