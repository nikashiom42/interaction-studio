import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Loader2,
  HelpCircle
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import FAQFormDialog from '@/components/admin/FAQFormDialog';
import { DeleteConfirmDialog } from '@/components/admin/DeleteConfirmDialog';

type FAQ = {
  id: string;
  question: string;
  answer: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

const FAQsManagement = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedFAQ, setSelectedFAQ] = useState<FAQ | null>(null);

  // Fetch FAQs
  const { data: faqs, isLoading } = useQuery({
    queryKey: ['faqs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as FAQ[];
    },
  });

  // Toggle active status
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('faqs')
        .update({ is_active })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
      toast({ title: 'FAQ status updated!' });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error updating FAQ',
        description: error.message,
        variant: 'destructive'
      });
    },
  });

  // Delete FAQ
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('faqs')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
      toast({ title: 'FAQ deleted successfully!' });
      setDeleteDialogOpen(false);
      setSelectedFAQ(null);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error deleting FAQ',
        description: error.message,
        variant: 'destructive'
      });
    },
  });

  // Filter FAQs based on search
  const filteredFAQs = faqs?.filter((faq) =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (faq: FAQ) => {
    setSelectedFAQ(faq);
    setFormOpen(true);
  };

  const handleDelete = (faq: FAQ) => {
    setSelectedFAQ(faq);
    setDeleteDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedFAQ(null);
    setFormOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <HelpCircle className="w-8 h-8 text-primary" />
            Manage FAQs
          </h1>
          <p className="text-muted-foreground mt-1">
            Add, edit, and manage frequently asked questions
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Add FAQ
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <p className="text-sm font-medium">Total FAQs</p>
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{faqs?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <p className="text-sm font-medium">Active FAQs</p>
            <HelpCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {faqs?.filter(f => f.is_active).length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <p className="text-sm font-medium">Inactive FAQs</p>
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {faqs?.filter(f => !f.is_active).length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search FAQs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredFAQs && filteredFAQs.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Order</TableHead>
                  <TableHead>Question</TableHead>
                  <TableHead>Answer Preview</TableHead>
                  <TableHead className="w-24">Status</TableHead>
                  <TableHead className="w-32 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFAQs.map((faq) => (
                  <TableRow key={faq.id}>
                    <TableCell className="font-medium">
                      {faq.display_order}
                    </TableCell>
                    <TableCell className="font-medium max-w-md">
                      <p className="truncate">{faq.question}</p>
                    </TableCell>
                    <TableCell className="max-w-md">
                      <p className="text-sm text-muted-foreground truncate">
                        {faq.answer.slice(0, 100)}...
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={faq.is_active}
                          onCheckedChange={(checked) =>
                            toggleActiveMutation.mutate({ id: faq.id, is_active: checked })
                          }
                        />
                        <Badge variant={faq.is_active ? 'default' : 'secondary'}>
                          {faq.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(faq)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(faq)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <HelpCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchQuery ? 'No FAQs found matching your search.' : 'No FAQs yet. Add your first FAQ to get started!'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <FAQFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        faq={selectedFAQ}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={() => selectedFAQ && deleteMutation.mutate(selectedFAQ.id)}
        title="Delete FAQ"
        description={`Are you sure you want to delete the FAQ "${selectedFAQ?.question}"? This action cannot be undone.`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default FAQsManagement;
