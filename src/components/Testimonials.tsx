import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import TestimonialCard from './TestimonialCard';
import { Loader2 } from 'lucide-react';

const Testimonials = () => {
  const { data: reviews, isLoading } = useQuery({
    queryKey: ['featured-reviews'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('id, rating, title, content, created_at, user_id')
        .eq('is_approved', true)
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      if (!data || data.length === 0) return [];

      // Fetch user profiles
      const userIds = [...new Set(data.map(r => r.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, created_at')
        .in('id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

      return data.map(review => ({
        id: review.id,
        quote: review.content,
        name: profileMap.get(review.user_id)?.full_name || 'Anonymous',
        memberSince: new Date(profileMap.get(review.user_id)?.created_at || review.created_at).getFullYear().toString(),
        avatar: (profileMap.get(review.user_id)?.full_name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
        rating: review.rating,
      }));
    },
  });

  // Don't render section if no featured reviews exist
  if (!isLoading && (!reviews || reviews.length === 0)) {
    return null;
  }

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-foreground mb-8">What Our Customers Say</h2>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((testimonial, index) => (
              <TestimonialCard
                key={testimonial.id}
                {...testimonial}
                delay={index * 100}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Testimonials;
