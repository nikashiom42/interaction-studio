import { ArrowRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import CarCard from './CarCard';
import { supabase } from '@/integrations/supabase/client';

const PopularCars = () => {
  const { data: cars, isLoading } = useQuery({
    queryKey: ['popular-cars'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(4);

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
            No cars available at the moment. Check back soon!
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
          <Link to="/cars" className="flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all group">
            <span>View all</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Cars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cars.map((car, index) => (
            <Link key={car.id} to={`/car/${car.id}`}>
              <CarCard
                image={car.main_image || '/placeholder.svg'}
                name={`${car.brand} ${car.model}`}
                type={`${car.category.charAt(0).toUpperCase() + car.category.slice(1)} • ${car.transmission.charAt(0).toUpperCase() + car.transmission.slice(1)}`}
                rating={4.8}
                originalPrice={Math.round(car.price_per_day * 1.2)}
                price={car.price_per_day}
                delay={index * 100}
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularCars;
