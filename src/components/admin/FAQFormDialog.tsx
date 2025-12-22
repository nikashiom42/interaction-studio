import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

type FAQ = {
  id: string;
  question: string;
  answer: string;
  display_order: number;
  is_active: boolean;
};

interface FAQFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  faq: FAQ | null;
}

const FAQFormDialog = ({ open, onOpenChange, faq }: FAQFormDialogProps) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    display_order: 0,
    is_active: true,
  });

  useEffect(() => {
    if (faq) {
      setFormData({
        question: faq.question,
        answer: faq.answer,
        display_order: faq.display_order,
        is_active: faq.is_active,
      });
    } else {
      setFormData({
        question: '',
        answer: '',
        display_order: 0,
        is_active: true,
      });
    }
  }, [faq, open]);

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from('faqs')
        .insert([data]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
      toast({ title: 'FAQ created successfully!' });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error creating FAQ',
        description: error.message,
        variant: 'destructive'
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from('faqs')
        .update(data)
        .eq('id', faq?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
      toast({ title: 'FAQ updated successfully!' });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error updating FAQ',
        description: error.message,
        variant: 'destructive'
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (faq) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{faq ? 'Edit FAQ' : 'Add New FAQ'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Question */}
          <div className="space-y-2">
            <Label htmlFor="question">Question *</Label>
            <Input
              id="question"
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              placeholder="What documents do I need to rent a car?"
              required
            />
          </div>

          {/* Answer */}
          <div className="space-y-2">
            <Label htmlFor="answer">Answer *</Label>
            <Textarea
              id="answer"
              value={formData.answer}
              onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
              placeholder="Provide a detailed answer to the question..."
              rows={6}
              required
            />
          </div>

          {/* Display Order */}
          <div className="space-y-2">
            <Label htmlFor="display_order">Display Order</Label>
            <Input
              id="display_order"
              type="number"
              value={formData.display_order}
              onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
              placeholder="0"
            />
            <p className="text-xs text-muted-foreground">
              Lower numbers appear first
            </p>
          </div>

          {/* Is Active */}
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="is_active">Active (visible to users)</Label>
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {faq ? 'Update FAQ' : 'Create FAQ'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FAQFormDialog;
