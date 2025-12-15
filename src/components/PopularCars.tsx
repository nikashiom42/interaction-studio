import { ArrowRight, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import CarCard from './CarCard';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

type CarCategory = Database['public']['Enums']['car_category'];

interface PopularCarsProps {
  category?: 'all' | CarCategory;
}

const PopularCars = ({ category = 'all' }: PopularCarsProps) => {
  const { data: cars, isLoading } = useQuery({
    queryKey: ['popular-cars', category],
    queryFn: async () => {
      let query = supabase
        .from('cars')
        .select('*')
        .eq('is_active', true);
      
      if (category !== 'all') {
        query = query.eq('category', category);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(8);

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </div>
      </section>
    );
  }

  if (!cars || cars.length === 0) {
    return (
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-foreground">Popular Cars Near You</h2>
          </div>
          <div className="text-center py-12 text-muted-foreground">
            No cars available in this category. Try selecting a different filter.
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-foreground">Popular Cars Near You</h2>
          <Link to={`/cars${category !== 'all' ? `?category=${category}` : ''}`} className="flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all group">
            <span>View all</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Cars Carousel */}
        <Carousel
          opts={{
            align: 'start',
            loop: true,
            dragFree: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {cars.map((car, index) => (
              <CarouselItem key={car.id} className="pl-4 basis-full sm:basis-1/2 lg:basis-1/4">
                <Link to={`/car/${car.id}`} className="block h-full">
                  <CarCard
                    image={car.main_image || '/placeholder.svg'}
                    name={`${car.brand} ${car.model}`}
                    type={`${car.category.charAt(0).toUpperCase() + car.category.slice(1)} • ${car.transmission.charAt(0).toUpperCase() + car.transmission.slice(1)}`}
                    rating={Number((car as any).rating) || 0}
                    originalPrice={Math.round(car.price_per_day * 1.2)}
                    price={car.price_per_day}
                    delay={index * 100}
                  />
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex -left-4 bg-background border-border hover:bg-accent" />
          <CarouselNext className="hidden sm:flex -right-4 bg-background border-border hover:bg-accent" />
        </Carousel>
      </div>
    </section>
  );
};

export default PopularCars;
