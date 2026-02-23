import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';
const siteUrl = 'https://www.pegarent.com';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const supabase = createClient(supabaseUrl, supabaseKey);

  const staticPages = [
    { url: '/', changefreq: 'daily', priority: '1.0' },
    { url: '/cars', changefreq: 'daily', priority: '0.9' },
    { url: '/tours', changefreq: 'weekly', priority: '0.8' },
    { url: '/about', changefreq: 'monthly', priority: '0.6' },
    { url: '/contact', changefreq: 'monthly', priority: '0.6' },
  ];

  const { data: blogs } = await supabase
    .from('blogs')
    .select('slug, updated_at')
    .eq('is_published', true);

  const { data: cars } = await supabase
    .from('cars')
    .select('id, updated_at')
    .eq('is_active', true);

  const { data: tours } = await supabase
    .from('tours')
    .select('id, updated_at')
    .eq('is_active', true);

  const today = new Date().toISOString().split('T')[0];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  for (const page of staticPages) {
    xml += `
  <url>
    <loc>${siteUrl}${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
    <lastmod>${today}</lastmod>
  </url>`;
  }

  if (blogs) {
    for (const blog of blogs) {
      xml += `
  <url>
    <loc>${siteUrl}/blog/${blog.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
    <lastmod>${blog.updated_at?.split('T')[0] || today}</lastmod>
  </url>`;
    }
  }

  if (cars) {
    for (const car of cars) {
      xml += `
  <url>
    <loc>${siteUrl}/car/${car.id}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
    <lastmod>${car.updated_at?.split('T')[0] || today}</lastmod>
  </url>`;
    }
  }

  if (tours) {
    for (const tour of tours) {
      xml += `
  <url>
    <loc>${siteUrl}/trip/${tour.id}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
    <lastmod>${tour.updated_at?.split('T')[0] || today}</lastmod>
  </url>`;
    }
  }

  xml += `
</urlset>`;

  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
  res.status(200).send(xml);
}
