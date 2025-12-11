import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import RoadtripCard from './RoadtripCard';
import { Loader2 } from 'lucide-react';

type Tour = {
  id: string;
  name: string;
  description: string;
  duration_days: number;
  duration_label: string | null;
  main_image: string | null;
  base_price: number;
  is_featured: boolean | null;
  destinations: string[] | null;
  rating: number | null;
};

const CuratedRoadtrips = () => {
  const { data: tours, isLoading } = useQuery({
    queryKey: ['featured-tours'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tours')
        .select('id, name, description, duration_days, duration_label, main_image, base_price, is_featured, destinations, rating')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .limit(6);

      if (error) throw error;
      return data as Tour[];
    },
  });

  if (isLoading) {
    return (
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground mb-8">Curated Roadtrips</h2>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </section>
    );
  }

  if (!tours || tours.length === 0) {
    return null;
  }

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-foreground mb-8">Curated Roadtrips</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tours.map((tour, index) => (
            <RoadtripCard
              key={tour.id}
              id={tour.id}
              image={tour.main_image || '/placeholder.svg'}
              title={tour.name}
              days={tour.duration_days}
              miles={tour.destinations?.length ? tour.destinations.length * 100 : 0}
              description={tour.description}
              price={tour.base_price}
              badge={tour.is_featured ? 'Featured' : undefined}
              delay={index * 100}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CuratedRoadtrips;
