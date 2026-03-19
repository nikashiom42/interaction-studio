import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Tags
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { DeleteConfirmDialog } from '@/components/admin/DeleteConfirmDialog';
import { generateSlug } from '@/lib/utils';

type TourCategory = Tables<'tour_categories'>;

interface CategoryFormData {
  name: string;
  slug: string;
  display_order: number;
}

const TourCategoriesManagement = () => {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<TourCategory | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({ name: '', slug: '', display_order: 0 });

  const { data: categories, isLoading } = useQuery({
    queryKey: ['admin-tour-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tour_categories')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data as TourCategory[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: CategoryFormData) => {
      const payload = {
        name: data.name,
        slug: data.slug || generateSlug(data.name),
        display_order: data.display_order,
      };

      if (editingCategory) {
        const { error } = await supabase
          .from('tour_categories')
          .update(payload)
          .eq('id', editingCategory.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('tour_categories')
          .insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tour-categories'] });
      queryClient.invalidateQueries({ queryKey: ['tour-categories'] });
      toast({ title: editingCategory ? 'Category updated' : 'Category created' });
      closeForm();
    },
    onError: (error: Error) => {
      toast({ title: 'Error saving category', description: error.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tour_categories')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tour-categories'] });
      queryClient.invalidateQueries({ queryKey: ['tour-categories'] });
      toast({ title: 'Category deleted' });
      setDeleteId(null);
    },
    onError: (error: Error) => {
      toast({ title: 'Error deleting category', description: error.message, variant: 'destructive' });
    },
  });

  const openNew = () => {
    setEditingCategory(null);
    setFormData({ name: '', slug: '', display_order: (categories?.length || 0) + 1 });
    setFormOpen(true);
  };

  const openEdit = (cat: TourCategory) => {
    setEditingCategory(cat);
    setFormData({ name: cat.name, slug: cat.slug, display_order: cat.display_order || 0 });
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingCategory(null);
    setFormData({ name: '', slug: '', display_order: 0 });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    saveMutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tour Categories</h1>
          <p className="text-muted-foreground">Manage categories for tours and road trips</p>
        </div>
        <Button onClick={openNew} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </div>

      <Card>
        <CardHeader />
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !categories || categories.length === 0 ? (
            <div className="text-center py-12">
              <Tags className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No categories yet</h3>
              <p className="text-muted-foreground mb-4">Create your first tour category to get started.</p>
              <Button onClick={openNew} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Category
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((cat) => (
                  <TableRow key={cat.id}>
                    <TableCell className="font-mono text-muted-foreground">{cat.display_order}</TableCell>
                    <TableCell className="font-medium">{cat.name}</TableCell>
                    <TableCell className="text-muted-foreground font-mono text-sm">{cat.slug}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(cat)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(cat.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Edit Category' : 'Add Category'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Name</label>
              <Input
                placeholder="e.g., Wine Tours"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Slug</label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., wine-tours"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFormData({ ...formData, slug: generateSlug(formData.name) })}
                >
                  Generate
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">URL-friendly identifier</p>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Display Order</label>
              <Input
                type="number"
                min={0}
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: Number(e.target.value) })}
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={closeForm}>Cancel</Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingCategory ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <DeleteConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        title="Delete Category"
        description="Are you sure you want to delete this category? Tours using it will keep their existing category assignments."
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default TourCategoriesManagement;
