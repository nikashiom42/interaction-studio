import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

const defaultRobotsTxt = `User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Twitterbot
Allow: /

User-agent: facebookexternalhit
Allow: /

User-agent: *
Allow: /

Sitemap: https://www.pegarent.com/sitemap.xml`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'robots_txt')
    .maybeSingle();

  let content = defaultRobotsTxt;
  if (data?.value) {
    // value is stored as a JSON string — unwrap it
    const raw = typeof data.value === 'string' ? data.value : JSON.stringify(data.value);
    content = raw.replace(/^"|"$/g, '').replace(/\\n/g, '\n');
  }

  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
  res.status(200).send(content);
}
