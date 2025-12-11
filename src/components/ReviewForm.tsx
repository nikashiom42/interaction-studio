import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Star, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface ReviewFormProps {
  carId?: string;
  tourId?: string;
  onSuccess?: () => void;
}

const ReviewForm = ({ carId, tourId, onSuccess }: ReviewFormProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('You must be logged in to submit a review');
      if (rating === 0) throw new Error('Please select a rating');
      if (!content.trim()) throw new Error('Please write a review');

      const { error } = await supabase.from('reviews').insert({
        user_id: user.id,
        car_id: carId || null,
        tour_id: tourId || null,
        rating,
        title: title.trim() || null,
        content: content.trim(),
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Review submitted successfully!');
      setRating(0);
      setTitle('');
      setContent('');
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  if (!user) {
    return (
      <div className="bg-secondary/50 rounded-xl p-6 text-center">
        <p className="text-muted-foreground mb-4">Please log in to leave a review</p>
        <Button variant="outline" asChild>
          <a href="/auth">Sign In</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="font-semibold text-foreground mb-4">Write a Review</h3>
      
      {/* Rating Stars */}
      <div className="mb-4">
        <label className="block text-sm text-muted-foreground mb-2">Your Rating</label>
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setRating(i + 1)}
              onMouseEnter={() => setHoveredRating(i + 1)}
              onMouseLeave={() => setHoveredRating(0)}
              className="p-1 transition-transform hover:scale-110"
            >
              <Star
                className={`w-7 h-7 transition-colors ${
                  i < (hoveredRating || rating)
                    ? 'fill-star text-star'
                    : 'text-muted-foreground/30'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div className="mb-4">
        <label className="block text-sm text-muted-foreground mb-2">Title (optional)</label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Summarize your experience"
          maxLength={100}
        />
      </div>

      {/* Content */}
      <div className="mb-4">
        <label className="block text-sm text-muted-foreground mb-2">Your Review</label>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share your experience..."
          rows={4}
          maxLength={1000}
        />
        <p className="text-xs text-muted-foreground mt-1">{content.length}/1000 characters</p>
      </div>

      <Button
        onClick={() => submitMutation.mutate()}
        disabled={submitMutation.isPending || rating === 0 || !content.trim()}
        className="w-full"
      >
        {submitMutation.isPending ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Submitting...
          </>
        ) : (
          'Submit Review'
        )}
      </Button>
    </div>
  );
};

export default ReviewForm;
