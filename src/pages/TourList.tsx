import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, Database } from '@/integrations/supabase/types';
import { ChevronRight, ChevronDown, Clock, MapPin, ArrowRight, Loader2, Compass, Star, Users } from 'lucide-react';
import { formatPrice } from '@/lib/currency';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { usePageSEO } from '@/hooks/usePageSEO';

type TourType = Tables<'tours'>;
type TourCategory = Database['public']['Enums']['tour_category'];

const filters: { id: TourCategory; label: string }[] = [
  { id: 'beach', label: 'Beach' },
  { id: 'mountains', label: 'Mountains' },
  { id: 'city_tours', label: 'City Tours' },
  { id: 'day_tours', label: 'Day Tours' },
  { id: 'adventure', label: 'Adventure' },
  { id: 'cultural', label: 'Cultural' },
  { id: 'wildlife', label: 'Wildlife' },
  { id: 'desert', label: 'Desert' },
];

const tabs = ['All Tours', 'Featured', 'Multi-Day', 'Day Trips'];

const TourList = () => {
  const [activeTab, setActiveTab] = useState('All Tours');
  const [activeFilters, setActiveFilters] = useState<TourCategory[]>([]);
  const { data: seo } = usePageSEO('tours');

  // Fetch tours from database
  const { data: tours, isLoading } = useQuery({
    queryKey: ['tours', activeTab, activeFilters],
    queryFn: async () => {
      let query = supabase
        .from('tours')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      
      // Apply tab filters
      if (activeTab === 'Featured') {
        query = query.eq('is_featured', true);
      } else if (activeTab === 'Multi-Day') {
        query = query.gt('duration_days', 1);
      } else if (activeTab === 'Day Trips') {
        query = query.eq('duration_days', 1);
      }

      // Apply category filters
      if (activeFilters.length > 0) {
        query = query.in('category', activeFilters);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as TourType[];
    },
  });

  const toggleFilter = (id: TourCategory) => {
    setActiveFilters(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={seo?.meta_title || "Tours & Road Trips"}
        description={seo?.meta_description || "Discover amazing road trips and guided tours across Georgia. Beach getaways, mountain adventures, cultural tours and more."}
        url="/tours"
        keywords="Georgia tours, road trips Georgia, guided tours Tbilisi, adventure travel Georgia"
        schemaMarkup={seo?.schema_markup || undefined}
      />
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="hover:text-foreground transition-colors cursor-pointer">Tours</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-medium">All Tours</span>
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
                <span>{filter.label}</span>
              </button>
            );
          })}
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-foreground">Available Tours</h1>
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
        {!isLoading && (!tours || tours.length === 0) && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Compass className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium text-foreground mb-2">No tours available</h3>
            <p className="text-muted-foreground">Check back later for available tours.</p>
          </div>
        )}

        {/* Tours Grid */}
        {tours && tours.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {tours.map((tour, index) => (
              <Link
                key={tour.id}
                to={`/trip/${tour.id}`}
                className="group bg-card rounded-xl overflow-hidden shadow-card card-hover opacity-0 animate-fade-in-up"
                style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'forwards' }}
              >
                {/* Image */}
                <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                  {tour.main_image ? (
                    <img
                      src={tour.main_image}
                      alt={tour.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Compass className="h-16 w-16 text-muted-foreground" />
                    </div>
                  )}
                  {/* Featured Badge */}
                  {tour.is_featured && (
                    <div className="absolute top-3 left-3 px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-md uppercase tracking-wide">
                      Featured
                    </div>
                  )}
                  {/* Category Badge */}
                  <div className="absolute top-3 right-3 px-3 py-1 bg-foreground/80 backdrop-blur-sm text-background text-xs font-medium rounded-md capitalize">
                    {tour.category.replace('_', ' ')}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="font-semibold text-foreground text-lg mb-2 group-hover:text-primary transition-colors">
                    {tour.name}
                  </h3>

                  <div className="flex items-center gap-4 text-muted-foreground text-sm mb-3">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{tour.duration_label || `${tour.duration_days} Day${tour.duration_days > 1 ? 's' : ''}`}</span>
                    </div>
                    {tour.destinations && tour.destinations.length > 0 && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{tour.destinations.length} stops</span>
                      </div>
                    )}
                    {tour.max_participants && (
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>Up to {tour.max_participants}</span>
                      </div>
                    )}
                  </div>

                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {tour.description}
                  </p>

                  <div className="flex items-center justify-between border-t border-border pt-4">
                    <div>
                      <span className="text-muted-foreground text-sm">From </span>
                      <span className="text-primary text-xl font-bold">{formatPrice(tour.base_price)}</span>
                      <span className="text-muted-foreground text-sm">/trip</span>
                    </div>
                    <div className="flex items-center gap-1 text-primary font-medium">
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Results count */}
        {tours && tours.length > 0 && (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Showing {tours.length} tours</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default TourList;