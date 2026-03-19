import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, Database } from '@/integrations/supabase/types';
import { ChevronRight, Calendar, ChevronDown, Check, Users, Settings, Fuel, Snowflake, Mountain, Loader2, Car, X, Euro } from 'lucide-react';
import { formatPrice } from '@/lib/currency';
import { formatCategories, getCarDetailUrl } from '@/lib/utils';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { usePageSEO } from '@/hooks/usePageSEO';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

type CarType = Tables<'cars'>;
type CarCategory = Database['public']['Enums']['car_category'];

const filters = [
  { id: 'dates', label: 'Dates', icon: Calendar, hasDropdown: false, isActive: true },
  { id: 'self-drive', label: 'Self-Drive', hasDropdown: true },
  { id: 'with-driver', label: 'With Driver', hasDropdown: true },
  { id: 'luxury_suv', label: 'Luxury SUV' },
  { id: 'off_road', label: 'Off-Road' },
  { id: 'suv', label: 'SUV' },
  { id: 'jeep', label: 'Jeep' },
  { id: 'economy_suv', label: 'Economy SUV' },
  { id: 'convertible', label: 'Convertible' },
  { id: 'automatic', label: 'Automatic' },
];

const CarList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const categoryParam = searchParams.get('category') || '';
  const [activeFilters, setActiveFilters] = useState<string[]>(() => {
    const initial = ['dates'];
    if (categoryParam) {
      initial.push(categoryParam);
    }
    return initial;
  });
  const { data: seo } = usePageSEO('cars');
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [priceFilterOpen, setPriceFilterOpen] = useState(false);

  // Fetch cars from database with filters
  const { data: cars, isLoading } = useQuery({
    queryKey: ['cars', activeFilters, searchQuery, minPrice, maxPrice],
    queryFn: async () => {
      let query = supabase
        .from('cars')
        .select('*')
        .eq('is_active', true);
      
      // Apply category filters
      const validCategories: CarCategory[] = ['luxury_suv', 'off_road', 'suv', 'jeep', 'economy_suv', 'convertible'];
      const categoryFilters = activeFilters.filter(f => validCategories.includes(f as CarCategory)) as CarCategory[];
      if (categoryFilters.length > 0) {
        query = query.in('category', categoryFilters);
      }

      // Apply transmission filter
      if (activeFilters.includes('automatic')) {
        query = query.eq('transmission', 'automatic');
      }

      query = query.order('created_at', { ascending: false });
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Apply search filter client-side for brand/model matching
      let filteredData = data as CarType[];
      if (searchQuery) {
        const lowerSearch = searchQuery.toLowerCase();
        filteredData = filteredData.filter(car =>
          car.brand.toLowerCase().includes(lowerSearch) ||
          car.model.toLowerCase().includes(lowerSearch) ||
          car.category.toLowerCase().includes(lowerSearch)
        );
      }

      // Apply price range filter
      if (minPrice !== '') {
        filteredData = filteredData.filter(car => car.price_per_day >= minPrice);
      }
      if (maxPrice !== '') {
        filteredData = filteredData.filter(car => car.price_per_day <= maxPrice);
      }

      return filteredData;
    },
  });

  const clearSearch = () => {
    searchParams.delete('search');
    setSearchParams(searchParams);
  };

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
      <SEO
        title={seo?.meta_title || "Rent a Car"}
        description={seo?.meta_description || "Browse our fleet of premium cars available for rent in Georgia. SUVs, luxury cars, economy vehicles and more. Best prices guaranteed."}
        url="/cars"
        keywords={seo?.keywords || "rent car Georgia, car hire Tbilisi, SUV rental, luxury car Georgia"}
        image={seo?.og_image || undefined}
        canonicalUrl={seo?.canonical_url || undefined}
        noIndex={seo?.no_index || false}
        schemaMarkup={seo?.schema_markup || undefined}
      />
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

          {/* Price Range Filter */}
          <Popover open={priceFilterOpen} onOpenChange={setPriceFilterOpen}>
            <PopoverTrigger asChild>
              <button
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 btn-scale border ${
                  minPrice !== '' || maxPrice !== ''
                    ? 'bg-foreground text-background border-foreground'
                    : 'bg-background text-foreground border-border hover:border-foreground'
                }`}
              >
                <Euro className="w-4 h-4" />
                <span>Price Range</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-4 bg-card border border-border shadow-lg z-50" align="start">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Price Range (€/day)</label>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <label className="text-xs text-muted-foreground mb-1 block">Min Price</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <span className="text-muted-foreground pt-5">-</span>
                    <div className="flex-1">
                      <label className="text-xs text-muted-foreground mb-1 block">Max Price</label>
                      <input
                        type="number"
                        placeholder="500"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setMinPrice('');
                      setMaxPrice('');
                      setPriceFilterOpen(false);
                    }}
                    className="flex-1 px-3 py-2 bg-secondary text-foreground rounded-lg text-sm font-medium hover:bg-accent transition-colors"
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => setPriceFilterOpen(false)}
                    className="flex-1 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-coral-hover transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Search Results Header */}
        {searchQuery && (
          <div className="flex items-center gap-2 mb-4 p-3 bg-secondary rounded-lg">
            <span className="text-sm text-muted-foreground">
              Search results for: <span className="font-medium text-foreground">"{searchQuery}"</span>
            </span>
            <button 
              onClick={clearSearch}
              className="ml-auto flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
              Clear
            </button>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-foreground">Car Rental in Georgia</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Sort by:</span>
            <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-medium hover:border-foreground transition-colors">
              <span>Recommended</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        <p className="text-muted-foreground mb-8 max-w-3xl">
          Find the right car for your trip in Georgia, whether you are driving in Tbilisi, picking up at the airport, or planning a longer road trip. Choose from economy cars, SUVs, 4x4 vehicles and more, all ready for reliable and comfortable travel.
        </p>

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
          <div className="relative mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cars.map((car, index) => (
                <Link
                  key={car.id}
                  to={getCarDetailUrl(car)}
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
                    <div className="absolute top-3 left-3 px-3 py-1 bg-foreground/80 backdrop-blur-sm text-background text-xs font-medium rounded-md">
                      {formatCategories(car.categories, car.category)}
                    </div>
                    {/* Free Cancellation */}
                    <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2 py-1 bg-background/90 backdrop-blur-sm rounded-md">
                      <Check className="w-3.5 h-3.5 text-success" />
                      <span className="text-xs font-medium text-success">FREE CANCELLATION</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-semibold text-foreground text-lg mb-3 group-hover:text-primary transition-colors">
                      {car.brand} {car.model}
                    </h3>

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
          </div>
        )}

        {/* Results count */}
        {cars && cars.length > 0 && (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Showing {cars.length} cars</p>
          </div>
        )}

        {/* Bottom SEO Content */}
        <div className="mt-16 border-t border-border pt-12 max-w-3xl">
          <h2 className="text-xl font-bold text-foreground mb-4">Choose the Right Car for Your Trip in Georgia</h2>
          <div className="space-y-4 text-muted-foreground text-sm leading-relaxed">
            <p>
              Choose a car for your trip in Georgia, from compact cars in Tbilisi to 4x4 vehicles for routes like Kazbegi or Gudauri. Filter by type, price, and availability to find the right option.
            </p>
            <p>
              Combine tours with car rental in Georgia to continue your trip at your own pace. Start with a tour and explore further with a rental car.
            </p>
            <p>
              Browse available cars for flexible travel across Georgia.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CarList;
