// Public settings the portal needs in the browser: the Supabase project URL and its anon (public) key.
// Values live in Vercel environment variables (SUPABASE_URL, SUPABASE_ANON_KEY), not in the page source.
// When they are not set the portal keeps working on in-browser demo data.
module.exports = (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const url = process.env.SUPABASE_URL || '';
  const key = process.env.SUPABASE_ANON_KEY || '';
  res.status(200).json({ supabase: url && key ? { url, key } : null });
};
