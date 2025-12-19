import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Star, Check, X, Trash2, Award } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { format } from 'date-fns';

interface Review {
  id: string;
  rating: number;
  title: string | null;
  content: string;
  is_approved: boolean;
  is_featured: boolean;
  created_at: string;
  user_id: string;
  car_id: string | null;
  tour_id: string | null;
  cars?: { brand: string; model: string } | null;
  tours?: { name: string } | null;
}

export default function ReviewsManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: reviews, isLoading } = useQuery({
    queryKey: ['admin-reviews'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          cars:car_id (brand, model),
          tours:tour_id (name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Review[];
    },
  });

  const approveMutation = useMutation({
    mutationFn: async ({ id, approved }: { id: string; approved: boolean }) => {
      const { error } = await supabase
        .from('reviews')
        .update({ is_approved: approved })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      toast({ title: 'Review updated' });
    },
    onError: () => {
      toast({ title: 'Failed to update review', variant: 'destructive' });
    },
  });

  const featureMutation = useMutation({
    mutationFn: async ({ id, featured }: { id: string; featured: boolean }) => {
      const { error } = await supabase
        .from('reviews')
        .update({ is_featured: featured })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      toast({ title: 'Review updated' });
    },
    onError: () => {
      toast({ title: 'Failed to update review', variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('reviews').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      toast({ title: 'Review deleted' });
      setDeleteId(null);
    },
    onError: () => {
      toast({ title: 'Failed to delete review', variant: 'destructive' });
    },
  });

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= rating ? 'fill-warning text-warning' : 'text-muted'}`}
          />
        ))}
      </div>
    );
  };

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading reviews...</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground">Reviews Management</h2>
        <p className="text-muted-foreground">Approve, feature, or delete customer reviews.</p>
      </div>

      {/* Reviews Disabled Notice */}
      <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <X className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
          </div>
          <div>
            <h3 className="font-semibold text-yellow-800 dark:text-yellow-500 mb-1">
              Reviews Feature Disabled
            </h3>
            <p className="text-sm text-yellow-700 dark:text-yellow-600">
              The reviews and ratings feature has been disabled on the public-facing site.
              Customers can no longer submit new reviews or see existing ratings.
              This page shows existing reviews for reference only (read-only mode).
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Reviews ({reviews?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {reviews && reviews.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Content</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviews.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell>
                      <p className="font-medium text-sm truncate max-w-[120px]">
                        {review.user_id.slice(0, 8)}...
                      </p>
                    </TableCell>
                    <TableCell>
                      {review.cars ? (
                        <Badge variant="outline">{review.cars.brand} {review.cars.model}</Badge>
                      ) : review.tours ? (
                        <Badge variant="secondary">{review.tours.name}</Badge>
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>{renderStars(review.rating)}</TableCell>
                    <TableCell className="max-w-[200px]">
                      {review.title && <p className="font-medium text-sm">{review.title}</p>}
                      <p className="text-sm text-muted-foreground truncate">{review.content}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge variant={review.is_approved ? 'default' : 'secondary'}>
                          {review.is_approved ? 'Approved' : 'Pending'}
                        </Badge>
                        {review.is_featured && (
                          <Badge variant="outline" className="text-warning border-warning">
                            <Award className="h-3 w-3 mr-1" /> Featured
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {format(new Date(review.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {!review.is_approved ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => approveMutation.mutate({ id: review.id, approved: true })}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => approveMutation.mutate({ id: review.id, approved: false })}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant={review.is_featured ? 'default' : 'outline'}
                          onClick={() => featureMutation.mutate({ id: review.id, featured: !review.is_featured })}
                        >
                          <Award className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setDeleteId(review.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No reviews yet.
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Review</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this review? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && deleteMutation.mutate(deleteId)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
