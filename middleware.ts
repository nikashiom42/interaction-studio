import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  '';
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  '';

export const config = {
  matcher: '/((?!api/|assets/|images/|favicon|_vercel|robots\\.txt|sitemap\\.xml|.*\\.[a-z0-9]+$).*)',
};

export default async function middleware(request: Request): Promise<Response | undefined> {
  const url = new URL(request.url);
  const pathname = url.pathname;

  if (!supabaseUrl || !supabaseKey) return;

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data } = await supabase
      .from('redirects')
      .select('to_path')
      .eq('from_path', pathname)
      .eq('is_active', true)
      .maybeSingle();

    if (data?.to_path) {
      const target = data.to_path.startsWith('http')
        ? data.to_path
        : new URL(data.to_path, url.origin).toString();
      return Response.redirect(target, 301);
    }
  } catch {
    // swallow errors so a redirect lookup never blocks the page
  }
}
