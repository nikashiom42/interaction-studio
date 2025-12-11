import { useQuery } from '@tanstack/react-query';
import { Star, ThumbsUp, Check, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface ReviewsListProps {
  carId?: string;
  tourId?: string;
}

type Review = {
  id: string;
  rating: number;
  title: string | null;
  content: string;
  created_at: string;
  user_id: string;
  profiles?: {
    full_name: string | null;
  };
};

const ReviewsList = ({ carId, tourId }: ReviewsListProps) => {
  const { data: reviews, isLoading } = useQuery({
    queryKey: ['reviews', carId, tourId],
    queryFn: async () => {
      let query = supabase
        .from('reviews')
        .select(`
          id,
          rating,
          title,
          content,
          created_at,
          user_id
        `)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (carId) {
        query = query.eq('car_id', carId);
      } else if (tourId) {
        query = query.eq('tour_id', tourId);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Fetch profiles separately to avoid RLS issues
      const userIds = [...new Set(data.map(r => r.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

      return data.map(review => ({
        ...review,
        profiles: profileMap.get(review.user_id) || { full_name: null }
      })) as Review[];
    },
    enabled: !!(carId || tourId),
  });

  // Calculate stats
  const stats = reviews?.length ? {
    overall: (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1),
    total: reviews.length,
    breakdown: [5, 4, 3, 2, 1].map(rating => ({
      rating,
      count: reviews.filter(r => r.rating === rating).length,
      percentage: (reviews.filter(r => r.rating === rating).length / reviews.length) * 100
    }))
  } : null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-8 bg-secondary/30 rounded-xl">
        <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
      </div>
    );
  }

  return (
    <div>
      {/* Stats */}
      {stats && (
        <div className="flex flex-col sm:flex-row gap-6 mb-8">
          <div className="flex flex-col items-center justify-center p-6 bg-primary/10 rounded-xl min-w-[140px]">
            <span className="text-4xl font-bold text-foreground">{stats.overall}</span>
            <div className="flex mt-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < Math.round(Number(stats.overall)) ? 'fill-star text-star' : 'text-muted-foreground/30'}`} />
              ))}
            </div>
            <span className="text-sm text-muted-foreground mt-2">{stats.total} reviews</span>
          </div>
          <div className="flex-1 space-y-2">
            {stats.breakdown.map(({ rating, count, percentage }) => (
              <div key={rating} className="flex items-center gap-3">
                <span className="w-12 text-sm text-muted-foreground flex items-center gap-1">
                  {rating} <Star className="w-3 h-3 fill-star text-star" />
                </span>
                <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-8 text-sm text-muted-foreground text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Review Cards */}
      <div className="space-y-6">
        {reviews.map(review => (
          <div key={review.id} className="border-t border-border pt-6">
            <div className="flex items-start gap-4 mb-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                {review.profiles?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U'}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <span className="font-medium text-foreground">
                      {review.profiles?.full_name || 'Anonymous'}
                    </span>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(review.created_at), 'MMMM yyyy')}
                    </p>
                  </div>
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 ${i < review.rating ? 'fill-star text-star' : 'text-muted-foreground/30'}`} 
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            {review.title && (
              <h4 className="font-medium text-foreground mb-2">{review.title}</h4>
            )}
            <p className="text-muted-foreground">{review.content}</p>
            <div className="flex items-center gap-4 mt-3 text-sm">
              <span className="flex items-center gap-1 text-success">
                <Check className="w-4 h-4" />
                Verified
              </span>
              <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
                <ThumbsUp className="w-4 h-4" />
                Helpful
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewsList;
