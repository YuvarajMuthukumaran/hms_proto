import { LEGACY_SCRIPTS } from './scripts';
import type { LegacyBridge } from './bridge';
import type { RoleKey } from '../roles';

const BRIDGE_SCRIPT = '/legacy/react-bridge.js';
const v = (url: string) => `${url}?v=${__BUILD_ID__}`;

function loadCss(href: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = v(href);
    link.dataset.legacy = '1';
    link.onload = () => resolve();
    link.onerror = () => reject(new Error(`Could not load ${href}`));
    document.head.appendChild(link);
  });
}

/** Runs one legacy block as a classic inline script, so top-level const/function names are shared exactly as before. */
async function runScript(url: string): Promise<void> {
  const res = await fetch(v(url));
  if (!res.ok) throw new Error(`Could not load ${url} (${res.status})`);
  const code = await res.text();
  const el = document.createElement('script');
  el.dataset.legacy = url;
  el.textContent = `${code}\n//# sourceURL=${url}`;
  document.body.appendChild(el); // executes synchronously
}

let booted: Promise<LegacyBridge> | null = null;

/** Loads the old portal once per page load. A role link is a real page load, so a page only ever runs one role. */
export function bootLegacy(role: RoleKey, onError: (message: string) => void): Promise<LegacyBridge> {
  if (booted) return booted;
  window.__TULASI__ = { role };
  const onWindowError = (e: ErrorEvent) =>
    onError(`${e.message}${e.filename ? ` (${e.filename.split('/').pop()}:${e.lineno})` : ''}`);
  window.addEventListener('error', onWindowError);
  booted = (async () => {
    await loadCss('/legacy/legacy.css');
    for (const url of [...LEGACY_SCRIPTS, BRIDGE_SCRIPT]) await runScript(url);
    if (!window.TulasiBridge) throw new Error('The portal scripts loaded but did not start (see the console).');
    return window.TulasiBridge;
  })().finally(() => window.removeEventListener('error', onWindowError));
  return booted;
}
