export interface SupabaseConfig {
  url: string;
  key: string;
}

/** The project URL and anon (public) key. Build-time VITE_ values win for local work; on Vercel they come from /api/config,
 *  which reads SUPABASE_URL and SUPABASE_ANON_KEY. With neither, the portal keeps working on in-browser demo data. */
export async function loadSupabaseConfig(): Promise<SupabaseConfig | null> {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
  if (url && key) return { url, key };
  try {
    const res = await fetch('/api/config', { cache: 'no-store' });
    if (!res.ok) return null;
    const json = (await res.json()) as { supabase?: SupabaseConfig | null };
    return json?.supabase?.url && json.supabase.key ? json.supabase : null;
  } catch {
    return null; // not on Vercel (the dev server answers with the page), or offline
  }
}
