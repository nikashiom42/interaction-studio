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
import { Plus, Pencil, Trash2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { DeleteConfirmDialog } from '@/components/admin/DeleteConfirmDialog';

// --- Types ---

interface PageSEO {
  id: string;
  page_key: string;
  meta_title: string | null;
  meta_description: string | null;
  schema_markup: string | null;
}

const PAGE_LABELS: Record<string, string> = {
  home: 'Home',
  about: 'About Us',
  contact: 'Contact Us',
  cars: 'Cars Listing',
  tours: 'Tours Listing',
};

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
      queryClient.invalidateQueries({ queryKey: ['page-seo'] });
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
                  <TableCell className="font-medium capitalize">{PAGE_LABELS[page.page_key] || page.page_key}</TableCell>
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
            <DialogTitle>Edit SEO — {editingPage ? (PAGE_LABELS[editingPage.page_key] || editingPage.page_key) : ''}</DialogTitle>
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
      if (data?.value) {
        const raw = typeof data.value === 'string' ? data.value : JSON.stringify(data.value);
        setContent(raw.replace(/^"|"$/g, '').replace(/\\n/g, '\n'));
      } else {
        setContent(defaultRobots);
      }
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const jsonValue = JSON.stringify(content);
      const { error } = await supabase
        .from('settings')
        .upsert({ key: 'robots_txt', value: jsonValue }, { onConflict: 'key' });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-robots-txt'] });
      toast.success('robots.txt saved — live within 1 hour (cached)');
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

  const total = 5 + (blogs || 0) + (cars || 0) + (tours || 0);

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

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="border rounded-lg p-4 text-center">
          <p className="text-2xl font-bold">5</p>
          <p className="text-sm text-muted-foreground">Static Pages</p>
        </div>
        <div className="border rounded-lg p-4 text-center">
          <p className="text-2xl font-bold">{blogs ?? '...'}</p>
          <p className="text-sm text-muted-foreground">Published Blogs</p>
        </div>
        <div className="border rounded-lg p-4 text-center">
          <p className="text-2xl font-bold">{cars ?? '...'}</p>
          <p className="text-sm text-muted-foreground">Active Cars</p>
        </div>
        <div className="border rounded-lg p-4 text-center">
          <p className="text-2xl font-bold">{tours ?? '...'}</p>
          <p className="text-sm text-muted-foreground">Active Tours</p>
        </div>
        <div className="border rounded-lg p-4 text-center">
          <p className="text-2xl font-bold">{total}</p>
          <p className="text-sm text-muted-foreground">Total URLs</p>
        </div>
        <div className="border rounded-lg p-4 text-center flex items-center justify-center">
          <p className="text-sm text-muted-foreground">Cached up to 1 hour</p>
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
            Client-side redirects. Applied when users visit the "From" path.
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
