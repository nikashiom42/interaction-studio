import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { ChevronRight, Calendar, ChevronDown, Check, Star, Users, Settings, Fuel, Snowflake, Mountain, Loader2, Car } from 'lucide-react';
import { formatPrice } from '@/lib/currency';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

type CarType = Tables<'cars'>;

const filters = [
  { id: 'dates', label: 'Dates', icon: Calendar, hasDropdown: false, isActive: true },
  { id: 'self-drive', label: 'Self-Drive', hasDropdown: true },
  { id: 'with-driver', label: 'With Driver', hasDropdown: true },
  { id: 'suv', label: 'SUV' },
  { id: 'luxury', label: 'Luxury' },
  { id: 'economy', label: 'Economy' },
  { id: 'automatic', label: 'Automatic' },
  { id: 'electric', label: 'Electric' },
];

const tabs = ['Explore Cars', 'Places to See', 'Things to Do', 'Trip Inspiration'];

const CarList = () => {
  const [activeTab, setActiveTab] = useState('Explore Cars');
  const [activeFilters, setActiveFilters] = useState<string[]>(['dates']);

  // Fetch cars from database
  const { data: cars, isLoading } = useQuery({
    queryKey: ['cars'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as CarType[];
    },
  });

  const toggleFilter = (id: string) => {
    setActiveFilters(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  // Check if car has a specific feature
  const hasFeature = (car: CarType, feature: string) => {
    const features = Array.isArray(car.features) ? car.features as string[] : [];
    return features.includes(feature);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="hover:text-foreground transition-colors cursor-pointer">Cars</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-medium">All Cars</span>
        </nav>

        {/* Tabs */}
        <div className="flex gap-6 border-b border-border mb-6">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium transition-all relative ${
                activeTab === tab 
                  ? 'text-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-3 overflow-x-auto pb-6 scrollbar-hide">
          {filters.map(filter => {
            const Icon = filter.icon;
            const isActive = activeFilters.includes(filter.id);
            return (
              <button
                key={filter.id}
                onClick={() => toggleFilter(filter.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 btn-scale border ${
                  isActive
                    ? 'bg-foreground text-background border-foreground'
                    : 'bg-background text-foreground border-border hover:border-foreground'
                }`}
              >
                {Icon && <Icon className="w-4 h-4" />}
                <span>{filter.label}</span>
                {filter.hasDropdown && <ChevronDown className="w-4 h-4" />}
              </button>
            );
          })}
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-foreground">Available Cars</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Sort by:</span>
            <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-medium hover:border-foreground transition-colors">
              <span>Recommended</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && (!cars || cars.length === 0) && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Car className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium text-foreground mb-2">No cars available</h3>
            <p className="text-muted-foreground">Check back later for available vehicles.</p>
          </div>
        )}

        {/* Cars Grid */}
        {cars && cars.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {cars.map((car, index) => (
              <Link
                key={car.id}
                to={`/car/${car.id}`}
                className="group bg-card rounded-xl overflow-hidden shadow-card card-hover opacity-0 animate-fade-in-up"
                style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'forwards' }}
              >
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                  {car.main_image ? (
                    <img
                      src={car.main_image}
                      alt={`${car.brand} ${car.model}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Car className="h-16 w-16 text-muted-foreground" />
                    </div>
                  )}
                  {/* Category Badge */}
                  <div className="absolute top-3 left-3 px-3 py-1 bg-foreground/80 backdrop-blur-sm text-background text-xs font-medium rounded-md capitalize">
                    {car.category}
                  </div>
                  {/* Free Cancellation */}
                  <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2 py-1 bg-background/90 backdrop-blur-sm rounded-md">
                    <Check className="w-3.5 h-3.5 text-success" />
                    <span className="text-xs font-medium text-success">FREE CANCELLATION</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-foreground text-lg mb-1 group-hover:text-primary transition-colors">
                    {car.brand} {car.model}
                  </h3>
                  
                  {/* Rating placeholder */}
                  <div className="flex items-center gap-1 mb-3">
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${i < 4 ? 'fill-star text-star' : 'text-gray-200'}`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">New</span>
                  </div>

                  {/* Specs Row 1 */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{car.seats} Seats</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Settings className="w-4 h-4" />
                      <span className="capitalize">{car.transmission}</span>
                    </div>
                    {hasFeature(car, '4x4') && (
                      <div className="flex items-center gap-1">
                        <Mountain className="w-4 h-4" />
                        <span>4x4</span>
                      </div>
                    )}
                  </div>

                  {/* Specs Row 2 */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <Fuel className="w-4 h-4" />
                      <span className="capitalize">{car.fuel_type}</span>
                    </div>
                    {hasFeature(car, 'ac') && (
                      <div className="flex items-center gap-1">
                        <Snowflake className="w-4 h-4" />
                        <span>A/C</span>
                      </div>
                    )}
                  </div>

                  {/* Divider */}
                  <div className="border-t border-border pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-sm">Price for 1 day</span>
                      <div className="flex items-center gap-2">
                        <span className="text-foreground text-2xl font-bold">{formatPrice(car.price_per_day)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Results count */}
        {cars && cars.length > 0 && (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Showing {cars.length} cars</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default CarList;
