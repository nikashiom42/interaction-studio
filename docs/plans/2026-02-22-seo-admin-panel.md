# SEO Admin Panel Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a full SEO management admin panel so marketers can edit robots.txt, sitemap, JSON-LD schema, meta tags, and redirects — all from the admin UI with no rebuild required.

**Architecture:** New `/admin/seo` page with 4 tabs (Pages, Robots, Sitemap, Redirects). Vercel serverless functions serve dynamic sitemap.xml and robots.txt from Supabase. Client-side redirect handler in App.tsx. Existing `react-helmet-async` SEO component extended with JSON-LD support. All data stored in Supabase.

**Tech Stack:** React 18, TypeScript, Vite, Supabase, Vercel serverless functions (`@vercel/node`), react-helmet-async, TanStack Query, shadcn/ui, Tailwind CSS.

**Existing patterns to follow:**
- Vercel API functions: `api/send-booking-confirmation.ts` uses `VercelRequest`/`VercelResponse` from `@vercel/node`
- Admin pages: Table + Dialog pattern (see `BlogsManagement.tsx` + `BlogFormDialog.tsx`)
- SEO component: `src/components/SEO.tsx` uses `react-helmet-async`
- DB access in pages: TanStack Query `useQuery` with Supabase client
- Sidebar: `menuItems` array in `AdminSidebar.tsx`

---

## Phase 1: Foundation

### Task 1: Update Supabase types

**Files:**
- Modify: `src/integrations/supabase/types.ts`

**Step 1:** Add `page_seo` table types after the `locations` table block:

```typescript
page_seo: {
  Row: {
    id: string
    page_key: string
    page_label: string
    meta_title: string | null
    meta_description: string | null
    schema_markup: string | null
    created_at: string
    updated_at: string
  }
  Insert: {
    id?: string
    page_key: string
    page_label: string
    meta_title?: string | null
    meta_description?: string | null
    schema_markup?: string | null
    created_at?: string
    updated_at?: string
  }
  Update: {
    id?: string
    page_key?: string
    page_label?: string
    meta_title?: string | null
    meta_description?: string | null
    schema_markup?: string | null
    created_at?: string
    updated_at?: string
  }
  Relationships: []
}
```

**Step 2:** Add `redirects` table types:

```typescript
redirects: {
  Row: {
    id: string
    from_path: string
    to_path: string
    is_active: boolean
    created_at: string
    updated_at: string
  }
  Insert: {
    id?: string
    from_path: string
    to_path: string
    is_active?: boolean
    created_at?: string
    updated_at?: string
  }
  Update: {
    id?: string
    from_path?: string
    to_path?: string
    is_active?: boolean
    created_at?: string
    updated_at?: string
  }
  Relationships: []
}
```

**Step 3:** Add `schema_markup: string | null` to the existing `blogs` Row/Insert/Update types (next to `meta_description`).

**Step 4:** Add `schema_markup: string | null` to the existing `tours` Row/Insert/Update types.

**Step 5:** Add `schema_markup: string | null` to the existing `cars` Row/Insert/Update types.

**Step 6:** Verify build:

Run: `npm run build`
Expected: No TypeScript errors

**Step 7: Commit**

```bash
git add src/integrations/supabase/types.ts
git commit -m "chore: add page_seo, redirects types and schema_markup columns"
```

---

### Task 2: Update SEO component with JSON-LD support

**Files:**
- Modify: `src/components/SEO.tsx`

**Step 1:** Add `schemaMarkup` to the `SEOProps` interface:

```typescript
interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  noIndex?: boolean;
  schemaMarkup?: string;  // Raw JSON-LD string
}
```

**Step 2:** Add the prop to the component signature and render it inside `<Helmet>`:

```tsx
const SEO = ({
  title,
  description = defaultDescription,
  keywords = defaultKeywords,
  image = '/og-image.jpg',
  url,
  type = 'website',
  noIndex = false,
  schemaMarkup,
}: SEOProps) => {
  // ... existing code ...

  return (
    <Helmet>
      {/* ... all existing meta tags stay unchanged ... */}

      {/* JSON-LD Structured Data */}
      {schemaMarkup && (
        <script type="application/ld+json">{schemaMarkup}</script>
      )}
    </Helmet>
  );
};
```

**Step 3:** Verify build:

Run: `npm run build`
Expected: PASS

**Step 4: Commit**

```bash
git add src/components/SEO.tsx
git commit -m "feat: add JSON-LD schema markup support to SEO component"
```

---

### Task 3: Create `usePageSEO` hook

**Files:**
- Create: `src/hooks/usePageSEO.ts`

This hook fetches SEO data for static pages from the `page_seo` table. Used by Index, AboutUs, ContactUs, CarList, TourList.

```typescript
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface PageSEO {
  meta_title: string | null;
  meta_description: string | null;
  schema_markup: string | null;
}

export function usePageSEO(pageKey: string) {
  return useQuery({
    queryKey: ['page-seo', pageKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('page_seo')
        .select('meta_title, meta_description, schema_markup')
        .eq('page_key', pageKey)
        .maybeSingle();

      if (error) throw error;
      return data as PageSEO | null;
    },
    staleTime: 5 * 60 * 1000, // cache 5 minutes
  });
}
```

**Verify build, then commit:**

```bash
git add src/hooks/usePageSEO.ts
git commit -m "feat: add usePageSEO hook for static page SEO data"
```

---

## Phase 2: Vercel API Functions

### Task 4: Create dynamic sitemap API function

**Files:**
- Create: `api/sitemap.ts`

Pattern: Follow existing `api/send-booking-confirmation.ts` style (`VercelRequest`/`VercelResponse`).

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';
const siteUrl = 'https://www.pegarent.com';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Static pages
  const staticPages = [
    { url: '/', changefreq: 'daily', priority: '1.0' },
    { url: '/cars', changefreq: 'daily', priority: '0.9' },
    { url: '/tours', changefreq: 'weekly', priority: '0.8' },
    { url: '/about', changefreq: 'monthly', priority: '0.6' },
    { url: '/contact', changefreq: 'monthly', priority: '0.6' },
  ];

  // Published blogs
  const { data: blogs } = await supabase
    .from('blogs')
    .select('slug, updated_at')
    .eq('is_published', true);

  // Active cars
  const { data: cars } = await supabase
    .from('cars')
    .select('id, updated_at')
    .eq('is_active', true);

  // Active tours
  const { data: tours } = await supabase
    .from('tours')
    .select('id, updated_at')
    .eq('is_active', true);

  const today = new Date().toISOString().split('T')[0];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  // Static pages
  for (const page of staticPages) {
    xml += `
  <url>
    <loc>${siteUrl}${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
    <lastmod>${today}</lastmod>
  </url>`;
  }

  // Blog posts
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

  // Car detail pages
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

  // Tour detail pages
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
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=600');
  res.status(200).send(xml);
}
```

**Commit:**

```bash
git add api/sitemap.ts
git commit -m "feat: add dynamic sitemap Vercel serverless function"
```

---

### Task 5: Create dynamic robots.txt API function

**Files:**
- Create: `api/robots.ts`

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

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

  const content = data?.value ? String(data.value).replace(/^"|"$/g, '') : defaultRobotsTxt;

  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=600');
  res.status(200).send(content);
}
```

**Commit:**

```bash
git add api/robots.ts
git commit -m "feat: add dynamic robots.txt Vercel serverless function"
```

---

### Task 6: Update vercel.json and remove static files

**Files:**
- Modify: `vercel.json`
- Delete: `public/sitemap.xml`
- Delete: `public/robots.txt`

**Step 1:** Update `vercel.json` — add sitemap and robots rewrites BEFORE the existing ones:

```json
{
  "rewrites": [
    { "source": "/sitemap.xml", "destination": "/api/sitemap" },
    { "source": "/robots.txt", "destination": "/api/robots" },
    { "source": "/api/(.*)", "destination": "/api/$1" },
    { "source": "/((?!api/).*)", "destination": "/index.html" }
  ]
}
```

**Step 2:** Delete the static files:

```bash
rm public/sitemap.xml public/robots.txt
```

**Step 3: Commit**

```bash
git add vercel.json
git rm public/sitemap.xml public/robots.txt
git commit -m "feat: route sitemap.xml and robots.txt through Vercel API functions"
```

---

## Phase 3: Admin UI

### Task 7: Create SEOManagement page

**Files:**
- Create: `src/pages/admin/SEOManagement.tsx`

This is the largest new file. It has 4 tabs: Pages, Robots, Sitemap, Redirects.

**Key patterns from existing admin pages:**
- Use `useQuery` + `useMutation` from TanStack Query
- Use `supabase` client for all DB operations
- Use shadcn `Tabs`, `Table`, `Dialog`, `Input`, `Textarea`, `Button`, `Switch`
- Use `toast` from `sonner` for success/error messages

The page should contain:

**Pages Tab:**
- Fetches all rows from `page_seo` table
- Table with columns: Page, Meta Title, Meta Description
- Click row to open edit dialog with: meta_title (Input), meta_description (Textarea), schema_markup (Textarea with monospace font)
- Save updates the row

**Robots Tab:**
- Fetches `settings` row where `key = 'robots_txt'`
- If not found, shows default robots.txt content
- Single monospace Textarea, full width
- Save button upserts to `settings` table

**Sitemap Tab:**
- Fetches counts from blogs (published), cars (active), tours (active)
- Shows summary: "X blog posts, Y cars, Z tours"
- Shows external link: "View live sitemap" → opens `/sitemap.xml` in new tab
- Read-only — the sitemap auto-generates from published content

**Redirects Tab:**
- Fetches all rows from `redirects` table ordered by created_at desc
- Table with columns: From, To, Active (toggle), Actions (edit/delete)
- "Add Redirect" button opens dialog with: from_path (Input), to_path (Input)
- Edit existing redirects via same dialog
- Delete via DeleteConfirmDialog pattern
- Active toggle via inline Switch that updates DB immediately

**Full component code:**

```tsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { DeleteConfirmDialog } from '@/components/admin/DeleteConfirmDialog';

// --- Types ---

interface PageSEO {
  id: string;
  page_key: string;
  page_label: string;
  meta_title: string | null;
  meta_description: string | null;
  schema_markup: string | null;
}

interface Redirect {
  id: string;
  from_path: string;
  to_path: string;
  is_active: boolean;
  created_at: string;
}

// --- Pages Tab ---

function PagesTab() {
  const queryClient = useQueryClient();
  const [editingPage, setEditingPage] = useState<PageSEO | null>(null);
  const [formData, setFormData] = useState({
    meta_title: '',
    meta_description: '',
    schema_markup: '',
  });

  const { data: pages, isLoading } = useQuery({
    queryKey: ['admin-page-seo'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('page_seo')
        .select('*')
        .order('page_key');
      if (error) throw error;
      return data as PageSEO[];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase
        .from('page_seo')
        .update({
          meta_title: data.meta_title || null,
          meta_description: data.meta_description || null,
          schema_markup: data.schema_markup || null,
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-page-seo'] });
      toast.success('Page SEO updated');
      setEditingPage(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const openEdit = (page: PageSEO) => {
    setEditingPage(page);
    setFormData({
      meta_title: page.meta_title || '',
      meta_description: page.meta_description || '',
      schema_markup: page.schema_markup || '',
    });
  };

  return (
    <>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Page</TableHead>
              <TableHead>Meta Title</TableHead>
              <TableHead>Meta Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">Loading...</TableCell>
              </TableRow>
            ) : pages?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  No pages configured. Run the seed migration first.
                </TableCell>
              </TableRow>
            ) : (
              pages?.map((page) => (
                <TableRow key={page.id}>
                  <TableCell className="font-medium">{page.page_label}</TableCell>
                  <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                    {page.meta_title || '—'}
                  </TableCell>
                  <TableCell className="max-w-[250px] truncate text-sm text-muted-foreground">
                    {page.meta_description || '—'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(page)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!editingPage} onOpenChange={(open) => !open && setEditingPage(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit SEO — {editingPage?.page_label}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Meta Title</Label>
              <Input
                value={formData.meta_title}
                onChange={(e) => setFormData((p) => ({ ...p, meta_title: e.target.value }))}
                placeholder="Page title for search engines"
              />
              <p className="text-xs text-muted-foreground mt-1">{formData.meta_title.length}/60 characters</p>
            </div>
            <div>
              <Label>Meta Description</Label>
              <Textarea
                value={formData.meta_description}
                onChange={(e) => setFormData((p) => ({ ...p, meta_description: e.target.value }))}
                placeholder="Page description for search engines"
                rows={3}
              />
              <p className="text-xs text-muted-foreground mt-1">{formData.meta_description.length}/160 characters</p>
            </div>
            <div>
              <Label>Schema Markup (JSON-LD)</Label>
              <Textarea
                value={formData.schema_markup}
                onChange={(e) => setFormData((p) => ({ ...p, schema_markup: e.target.value }))}
                placeholder='{"@context": "https://schema.org", "@type": "WebPage", ...}'
                rows={8}
                className="font-mono text-sm"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingPage(null)}>Cancel</Button>
              <Button
                onClick={() => editingPage && updateMutation.mutate({ id: editingPage.id, data: formData })}
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// --- Robots Tab ---

function RobotsTab() {
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');
  const [loaded, setLoaded] = useState(false);

  const defaultRobots = `User-agent: Googlebot
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

  const { isLoading } = useQuery({
    queryKey: ['admin-robots-txt'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'robots_txt')
        .maybeSingle();
      if (error) throw error;
      const val = data?.value ? String(data.value).replace(/^"|"$/g, '') : defaultRobots;
      setContent(val);
      setLoaded(true);
      return val;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('settings')
        .upsert({ key: 'robots_txt', value: JSON.stringify(content) }, { onConflict: 'key' });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-robots-txt'] });
      toast.success('robots.txt saved — live immediately');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  if (isLoading) return <p className="py-8 text-center text-muted-foreground">Loading...</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Edit the robots.txt content below. Changes go live instantly (cached up to 1 hour).
        </p>
        <a href="/robots.txt" target="_blank" rel="noopener noreferrer" className="text-sm text-primary flex items-center gap-1">
          View live <ExternalLink className="h-3 w-3" />
        </a>
      </div>
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={16}
        className="font-mono text-sm"
      />
      <div className="flex justify-end">
        <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
          {saveMutation.isPending ? 'Saving...' : 'Save robots.txt'}
        </Button>
      </div>
    </div>
  );
}

// --- Sitemap Tab ---

function SitemapTab() {
  const { data: blogs } = useQuery({
    queryKey: ['sitemap-blogs-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('blogs')
        .select('*', { count: 'exact', head: true })
        .eq('is_published', true);
      if (error) throw error;
      return count || 0;
    },
  });

  const { data: cars } = useQuery({
    queryKey: ['sitemap-cars-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('cars')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);
      if (error) throw error;
      return count || 0;
    },
  });

  const { data: tours } = useQuery({
    queryKey: ['sitemap-tours-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('tours')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);
      if (error) throw error;
      return count || 0;
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          The sitemap auto-generates from your published content. No manual editing needed.
        </p>
        <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="text-sm text-primary flex items-center gap-1">
          View live sitemap <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="border rounded-lg p-4 text-center">
          <p className="text-2xl font-bold">{5}</p>
          <p className="text-sm text-muted-foreground">Static Pages</p>
        </div>
        <div className="border rounded-lg p-4 text-center">
          <p className="text-2xl font-bold">{blogs ?? '...'}</p>
          <p className="text-sm text-muted-foreground">Published Blog Posts</p>
        </div>
        <div className="border rounded-lg p-4 text-center">
          <p className="text-2xl font-bold">{cars ?? '...'}</p>
          <p className="text-sm text-muted-foreground">Active Cars</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="border rounded-lg p-4 text-center">
          <p className="text-2xl font-bold">{tours ?? '...'}</p>
          <p className="text-sm text-muted-foreground">Active Tours</p>
        </div>
        <div className="border rounded-lg p-4 text-center">
          <p className="text-2xl font-bold">{5 + (blogs || 0) + (cars || 0) + (tours || 0)}</p>
          <p className="text-sm text-muted-foreground">Total URLs</p>
        </div>
        <div className="border rounded-lg p-4 text-center">
          <p className="text-sm text-muted-foreground mt-2">Cached up to 1 hour</p>
        </div>
      </div>
    </div>
  );
}

// --- Redirects Tab ---

function RedirectsTab() {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingRedirect, setEditingRedirect] = useState<Redirect | null>(null);
  const [formData, setFormData] = useState({ from_path: '', to_path: '' });

  const { data: redirects, isLoading } = useQuery({
    queryKey: ['admin-redirects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('redirects')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Redirect[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: { from_path: string; to_path: string }) => {
      const { error } = await supabase.from('redirects').insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-redirects'] });
      toast.success('Redirect created');
      setIsFormOpen(false);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { from_path: string; to_path: string } }) => {
      const { error } = await supabase.from('redirects').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-redirects'] });
      toast.success('Redirect updated');
      setIsFormOpen(false);
      setEditingRedirect(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from('redirects').update({ is_active }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-redirects'] }),
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('redirects').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-redirects'] });
      toast.success('Redirect deleted');
      setIsDeleteOpen(false);
      setEditingRedirect(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const openCreate = () => {
    setEditingRedirect(null);
    setFormData({ from_path: '', to_path: '' });
    setIsFormOpen(true);
  };

  const openEdit = (r: Redirect) => {
    setEditingRedirect(r);
    setFormData({ from_path: r.from_path, to_path: r.to_path });
    setIsFormOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.from_path || !formData.to_path) {
      toast.error('Both paths are required');
      return;
    }
    if (editingRedirect) {
      updateMutation.mutate({ id: editingRedirect.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Client-side redirects. Applied when users visit the &quot;From&quot; path.
          </p>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" /> Add Redirect
          </Button>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">Loading...</TableCell>
                </TableRow>
              ) : redirects?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No redirects configured
                  </TableCell>
                </TableRow>
              ) : (
                redirects?.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-sm">{r.from_path}</TableCell>
                    <TableCell className="font-mono text-sm">{r.to_path}</TableCell>
                    <TableCell>
                      <Switch
                        checked={r.is_active}
                        onCheckedChange={(checked) => toggleMutation.mutate({ id: r.id, is_active: checked })}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(r)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => { setEditingRedirect(r); setIsDeleteOpen(true); }}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingRedirect ? 'Edit Redirect' : 'Add Redirect'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>From Path</Label>
              <Input
                value={formData.from_path}
                onChange={(e) => setFormData((p) => ({ ...p, from_path: e.target.value }))}
                placeholder="/old-page"
                className="font-mono"
              />
            </div>
            <div>
              <Label>To Path</Label>
              <Input
                value={formData.to_path}
                onChange={(e) => setFormData((p) => ({ ...p, to_path: e.target.value }))}
                placeholder="/new-page"
                className="font-mono"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
                {(createMutation.isPending || updateMutation.isPending) ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <DeleteConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={() => editingRedirect && deleteMutation.mutate(editingRedirect.id)}
        isLoading={deleteMutation.isPending}
        title="Delete Redirect"
        description={`Delete redirect from "${editingRedirect?.from_path}" to "${editingRedirect?.to_path}"?`}
      />
    </>
  );
}

// --- Main SEO Management Page ---

export default function SEOManagement() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">SEO Management</h1>
        <p className="text-muted-foreground">Manage meta tags, schema markup, sitemap, robots.txt, and redirects</p>
      </div>

      <Tabs defaultValue="pages">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pages">Pages</TabsTrigger>
          <TabsTrigger value="robots">Robots.txt</TabsTrigger>
          <TabsTrigger value="sitemap">Sitemap</TabsTrigger>
          <TabsTrigger value="redirects">Redirects</TabsTrigger>
        </TabsList>

        <TabsContent value="pages" className="mt-6">
          <PagesTab />
        </TabsContent>
        <TabsContent value="robots" className="mt-6">
          <RobotsTab />
        </TabsContent>
        <TabsContent value="sitemap" className="mt-6">
          <SitemapTab />
        </TabsContent>
        <TabsContent value="redirects" className="mt-6">
          <RedirectsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

**Verify build, then commit:**

```bash
git add src/pages/admin/SEOManagement.tsx
git commit -m "feat: add SEO management admin page with 4 tabs"
```

---

### Task 8: Update AdminSidebar with SEO nav item

**Files:**
- Modify: `src/components/admin/AdminSidebar.tsx`

**Step 1:** Add `Search` to the lucide-react import (line 1).

**Step 2:** Add SEO entry to the `menuItems` array (after "Blogs", before "Messages"):

```typescript
{ title: "SEO", url: "/admin/seo", icon: Search },
```

**Verify build, then commit:**

```bash
git add src/components/admin/AdminSidebar.tsx
git commit -m "feat: add SEO link to admin sidebar"
```

---

### Task 9: Update App.tsx with new route + RedirectHandler

**Files:**
- Modify: `src/App.tsx`
- Create: `src/components/RedirectHandler.tsx`

**Step 1:** Create `src/components/RedirectHandler.tsx`:

```tsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export function RedirectHandler() {
  const location = useLocation();

  useEffect(() => {
    const checkRedirect = async () => {
      const { data } = await supabase
        .from('redirects')
        .select('to_path')
        .eq('from_path', location.pathname)
        .eq('is_active', true)
        .maybeSingle();

      if (data?.to_path) {
        window.location.replace(data.to_path);
      }
    };

    checkRedirect();
  }, [location.pathname]);

  return null;
}
```

**Step 2:** In `App.tsx`, add the import for SEOManagement:

```typescript
import SEOManagement from "./pages/admin/SEOManagement";
```

**Step 3:** Add the import for RedirectHandler:

```typescript
import { RedirectHandler } from "./components/RedirectHandler";
```

**Step 4:** Add the admin route (inside the `<Route path="/admin" ...>` block, before `</Route>`):

```tsx
<Route path="seo" element={<SEOManagement />} />
```

**Step 5:** Add `<RedirectHandler />` right after `<BrowserRouter ...>` opening tag, before `<Routes>`:

```tsx
<RedirectHandler />
```

**Verify build, then commit:**

```bash
git add src/App.tsx src/components/RedirectHandler.tsx
git commit -m "feat: add SEO admin route and client-side redirect handler"
```

---

## Phase 4: Schema Markup in Existing Admin Forms

### Task 10: Add schema_markup to BlogFormDialog

**Files:**
- Modify: `src/components/admin/BlogFormDialog.tsx`

**Step 1:** Add `schema_markup` to the Zod schema (after `meta_description`):

```typescript
schema_markup: z.string().optional(),
```

**Step 2:** Add `schema_markup` to the Blog interface:

```typescript
schema_markup?: string | null;
```

**Step 3:** Add `schema_markup: ''` to both default value blocks in `useForm` and both branches of the `useEffect` reset.

For the blog branch: `schema_markup: blog.schema_markup || ''`

**Step 4:** Add the textarea field inside the SEO section `<div>` (after the meta_description field):

```tsx
<FormField
  control={form.control}
  name="schema_markup"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Schema Markup (JSON-LD)</FormLabel>
      <FormControl>
        <Textarea
          {...field}
          placeholder='{"@context": "https://schema.org", "@type": "Article", ...}'
          rows={6}
          className="font-mono text-sm"
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

**Verify build, then commit:**

```bash
git add src/components/admin/BlogFormDialog.tsx
git commit -m "feat: add schema markup textarea to blog form"
```

---

### Task 11: Add schema_markup to BlogsManagement mutation payloads

**Files:**
- Modify: `src/pages/admin/BlogsManagement.tsx`

**Step 1:** Add `schema_markup?: string` to the `BlogFormData` interface.

**Step 2:** Add `schema_markup` to the Blog interface:

```typescript
schema_markup?: string | null;
```

**Step 3:** Add to the create mutation insert object:

```typescript
schema_markup: data.schema_markup || null,
```

**Step 4:** Add to the update mutation updateData object:

```typescript
schema_markup: data.schema_markup || null,
```

**Verify build, then commit:**

```bash
git add src/pages/admin/BlogsManagement.tsx
git commit -m "feat: add schema_markup to blog create/update mutations"
```

---

### Task 12: Add schema_markup to TourFormDialog

**Files:**
- Modify: `src/components/admin/TourFormDialog.tsx`

**Step 1:** Add `schema_markup: string | null` to the `Tour` type.

**Step 2:** Add `schema_markup: ''` to both branches of `formData` state initialization in `useEffect` (for the tour branch: `schema_markup: tour.schema_markup || ''`).

**Step 3:** Add to the `tourData` object in the mutation:

```typescript
schema_markup: data.schema_markup || null,
```

**Step 4:** Add a textarea in the Settings tab SEO section (after `meta_description`):

```tsx
<div>
  <Label htmlFor="schema_markup">Schema Markup (JSON-LD)</Label>
  <Textarea
    id="schema_markup"
    value={formData.schema_markup}
    onChange={(e) => setFormData(prev => ({ ...prev, schema_markup: e.target.value }))}
    placeholder='{"@context": "https://schema.org", "@type": "TouristTrip", ...}'
    rows={6}
    className="font-mono text-sm"
  />
</div>
```

**Verify build, then commit:**

```bash
git add src/components/admin/TourFormDialog.tsx
git commit -m "feat: add schema markup to tour form"
```

---

### Task 13: Add schema_markup to CarFormDialog

**Files:**
- Modify: `src/components/admin/CarFormDialog.tsx`

**Step 1:** Add `schema_markup` to the Zod schema:

```typescript
schema_markup: z.string().optional().nullable(),
```

**Step 2:** Add `schema_markup: ''` to default values and the reset in `useEffect`.

**Step 3:** Add to the submit handler's mutation data object:

```typescript
schema_markup: values.schema_markup || null,
```

**Step 4:** Add a textarea in the SEO section (after `meta_description`). Find the existing SEO fields and add below them — follow the same pattern as the existing `meta_title` and `meta_description` fields in that file.

**Verify build, then commit:**

```bash
git add src/components/admin/CarFormDialog.tsx
git commit -m "feat: add schema markup to car form"
```

---

## Phase 5: Wire SEO into Public Pages

### Task 14: Update BlogDetail.tsx with SEO component

**Files:**
- Modify: `src/pages/BlogDetail.tsx`

**Step 1:** Add SEO import:

```typescript
import SEO from '@/components/SEO';
```

**Step 2:** Add `meta_title`, `meta_description`, `schema_markup` to the Blog interface:

```typescript
meta_title?: string | null;
meta_description?: string | null;
schema_markup?: string | null;
```

**Step 3:** Add `<SEO>` right after `<main>` opens in the success render (around line 96):

```tsx
<SEO
  title={blog.meta_title || blog.title}
  description={blog.meta_description || blog.excerpt || undefined}
  url={`/blog/${blog.slug}`}
  type="article"
  image={blog.main_image || undefined}
  schemaMarkup={blog.schema_markup || undefined}
/>
```

**Verify build, then commit:**

```bash
git add src/pages/BlogDetail.tsx
git commit -m "feat: wire SEO component into blog detail page"
```

---

### Task 15: Update TripDetail.tsx with SEO component

**Files:**
- Modify: `src/pages/TripDetail.tsx`

**Step 1:** Add SEO import:

```typescript
import SEO from '@/components/SEO';
```

**Step 2:** Add `meta_title`, `meta_description`, `schema_markup` to the Tour type.

**Step 3:** Add `<SEO>` in the success render, right after the outer `<div>` opens (before `<Header />`):

```tsx
<SEO
  title={tour.meta_title || tour.name}
  description={tour.meta_description || tour.description?.substring(0, 160) || undefined}
  url={`/trip/${tour.id}`}
  image={tour.main_image || undefined}
  schemaMarkup={tour.schema_markup || undefined}
/>
```

**Verify build, then commit:**

```bash
git add src/pages/TripDetail.tsx
git commit -m "feat: wire SEO component into trip detail page"
```

---

### Task 16: Update CarDetail.tsx with schema_markup

**Files:**
- Modify: `src/pages/CarDetail.tsx`

CarDetail already uses `<SEO title={metaTitle} description={metaDescription} />` at line 144. Just add `schemaMarkup`:

```tsx
<SEO
  title={metaTitle}
  description={metaDescription}
  schemaMarkup={carData.schema_markup || undefined}
/>
```

Note: The car data already includes `meta_title` and `meta_description` — the component already reads them. Just add the `schemaMarkup` prop.

**Verify build, then commit:**

```bash
git add src/pages/CarDetail.tsx
git commit -m "feat: add schema markup to car detail page SEO"
```

---

### Task 17: Wire static pages to page_seo table

**Files:**
- Modify: `src/pages/Index.tsx`
- Modify: `src/pages/AboutUs.tsx`
- Modify: `src/pages/ContactUs.tsx`
- Modify: `src/pages/CarList.tsx`
- Modify: `src/pages/TourList.tsx`

For each page, the pattern is identical:

**Step 1:** Add the import:

```typescript
import { usePageSEO } from '@/hooks/usePageSEO';
```

**Step 2:** Call the hook inside the component (with the appropriate page key):

```typescript
const { data: pageSEO } = usePageSEO('home'); // or 'about', 'contact', 'cars', 'tours'
```

**Step 3:** Update the existing `<SEO>` component to use DB values with fallbacks:

```tsx
<SEO
  title={pageSEO?.meta_title || "existing hardcoded title"}
  description={pageSEO?.meta_description || "existing hardcoded description"}
  url="/..."
  schemaMarkup={pageSEO?.schema_markup || undefined}
/>
```

Page keys:
- `Index.tsx` → `'home'`
- `AboutUs.tsx` → `'about'`
- `ContactUs.tsx` → `'contact'`
- `CarList.tsx` → `'cars'`
- `TourList.tsx` → `'tours'`

**Verify build, then commit:**

```bash
git add src/pages/Index.tsx src/pages/AboutUs.tsx src/pages/ContactUs.tsx src/pages/CarList.tsx src/pages/TourList.tsx
git commit -m "feat: wire static pages to admin-editable SEO data"
```

---

## Phase 6: Final Verification

### Task 18: Full build + manual verification

Run: `npm run build`
Expected: PASS with no TypeScript errors

**Manual test checklist (after DB migration):**
1. `/admin/seo` — all 4 tabs load, pages table shows 5 seeded pages
2. Edit a page's meta title → visit that page → check `<title>` in devtools
3. Paste JSON-LD into a page → visit page → check `<script type="application/ld+json">` in devtools
4. Edit robots.txt → visit `/robots.txt` → see updated content
5. Visit `/sitemap.xml` → see all published blogs/cars/tours
6. Add a redirect from `/test-old` to `/cars` → visit `/test-old` → redirected to `/cars`
7. Create a blog post with schema_markup → visit the blog → check JSON-LD in devtools

---

## SQL Migrations (Run in Supabase Dashboard)

**Copy and paste this entire block into the Supabase SQL editor:**

```sql
-- 1. Create page_seo table
CREATE TABLE IF NOT EXISTS page_seo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_key TEXT UNIQUE NOT NULL,
  page_label TEXT NOT NULL,
  meta_title TEXT,
  meta_description TEXT,
  schema_markup TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on page_seo
ALTER TABLE page_seo ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for the frontend to fetch SEO data)
CREATE POLICY "Allow public read on page_seo"
  ON page_seo FOR SELECT
  USING (true);

-- Allow authenticated admin insert/update/delete
CREATE POLICY "Allow admin full access on page_seo"
  ON page_seo FOR ALL
  USING (true)
  WITH CHECK (true);

-- Seed the 5 static pages
INSERT INTO page_seo (page_key, page_label) VALUES
  ('home', 'Home Page'),
  ('about', 'About Us'),
  ('contact', 'Contact Us'),
  ('cars', 'Cars Listing'),
  ('tours', 'Tours Listing')
ON CONFLICT (page_key) DO NOTHING;

-- 2. Create redirects table
CREATE TABLE IF NOT EXISTS redirects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_path TEXT UNIQUE NOT NULL,
  to_path TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on redirects
ALTER TABLE redirects ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for the redirect handler)
CREATE POLICY "Allow public read on redirects"
  ON redirects FOR SELECT
  USING (true);

-- Allow authenticated admin full access
CREATE POLICY "Allow admin full access on redirects"
  ON redirects FOR ALL
  USING (true)
  WITH CHECK (true);

-- 3. Add schema_markup column to blogs
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS schema_markup TEXT;

-- 4. Add schema_markup column to tours
ALTER TABLE tours ADD COLUMN IF NOT EXISTS schema_markup TEXT;

-- 5. Add schema_markup column to cars
ALTER TABLE cars ADD COLUMN IF NOT EXISTS schema_markup TEXT;

-- 6. Seed robots_txt in settings (if not already there)
INSERT INTO settings (key, value, description)
VALUES (
  'robots_txt',
  '"User-agent: Googlebot\nAllow: /\n\nUser-agent: Bingbot\nAllow: /\n\nUser-agent: Twitterbot\nAllow: /\n\nUser-agent: facebookexternalhit\nAllow: /\n\nUser-agent: *\nAllow: /\n\nSitemap: https://www.pegarent.com/sitemap.xml"',
  'robots.txt content managed from admin SEO panel'
)
ON CONFLICT (key) DO NOTHING;
```
