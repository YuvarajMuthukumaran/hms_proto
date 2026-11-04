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

async function fetchScript(url: string): Promise<string> {
  const res = await fetch(v(url));
  if (!res.ok) throw new Error(`Could not load ${url} (${res.status})`);
  return res.text();
}

/** Runs one legacy block as a classic inline script, so top-level const/function names are shared exactly as before. */
function runScript(url: string, code: string) {
  const el = document.createElement('script');
  el.dataset.legacy = url;
  el.textContent = `${code}
//# sourceURL=${url}`;
  document.body.appendChild(el); // executes synchronously
}

let booted: Promise<LegacyBridge> | null = null;

/** Loads the old portal once per page load. A role link is a real page load, so a page only ever runs one role. */
export function bootLegacy(role: RoleKey, onError: (message: string) => void): Promise<LegacyBridge> {
  if (booted) return booted;
  window.__TULASI__ = { role };
  // The first block draws the page before the later blocks exist, so opening a page such as #/admissions directly throws once
  // ("vNewAdm is not defined") and then recovers when the bridge redraws. Only a script that cannot even be parsed is shown at
  // once; anything else is shown only if the portal really fails to start.
  const early: string[] = [];
  const onWindowError = (e: ErrorEvent) => {
    const msg = `${e.message}${e.filename ? ` (${e.filename.split('/').pop()}:${e.lineno})` : ''}`;
    if (/SyntaxError/.test(e.message)) onError(msg);
    else early.push(msg);
  };
  window.addEventListener('error', onWindowError);
  booted = (async () => {
    const urls = [...LEGACY_SCRIPTS, BRIDGE_SCRIPT];
    // download everything first, then run every block in one go: the page never paints a half-started portal
    // (the first blocks draw the old dashboard before the role blocks replace it)
    const [codes] = await Promise.all([Promise.all(urls.map(fetchScript)), loadCss('/legacy/legacy.css')]);
    urls.forEach((url, i) => runScript(url, codes[i]));
    if (!window.TulasiBridge) throw new Error(`The portal scripts loaded but did not start${early[0] ? `: ${early[0]}` : ' (see the console)'}.`);
    return window.TulasiBridge;
  })().finally(() => window.removeEventListener('error', onWindowError));
  return booted;
}
