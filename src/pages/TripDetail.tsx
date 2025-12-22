import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Clock, MapPin, Calendar, Users, Car, Star, Check, ChevronRight, Loader2, DollarSign, Info } from 'lucide-react';
import { formatPrice } from '@/lib/currency';
import { format, addDays } from 'date-fns';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { toast } from '@/hooks/use-toast';

type Tour = {
  id: string;
  name: string;
  description: string;
  category: string;
  duration_type: string;
  duration_days: number;
  duration_label: string | null;
  main_image: string | null;
  gallery_images: string[] | null;
  is_active: boolean | null;
  is_featured: boolean | null;
  destinations: string[] | null;
  route_type: string;
  route_details: string | null;
  start_location: string | null;
  end_location: string | null;
  base_price: number;
  price_per_person: boolean | null;
  pricing_tiers: any;
  additional_fees: any;
  included_services: any;
  max_participants: number | null;
  advance_booking_days: number | null;
  display_order: number | null;
  rating: number | null;
  reviews_count: number | null;
};

const TripDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem, isInCart } = useCart();

  const { data: tour, isLoading, error } = useQuery({
    queryKey: ['tour', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tours')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Tour;
    },
    enabled: !!id,
  });

  // Fetch itinerary
  const { data: itinerary } = useQuery({
    queryKey: ['tour-itinerary', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tour_itinerary')
        .select('*')
        .eq('tour_id', id)
        .order('day_number', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Fetch highlights
  const { data: highlights } = useQuery({
    queryKey: ['tour-highlights', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tour_highlights')
        .select('*')
        .eq('tour_id', id)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Handle book tour - add to cart and navigate to cart page
  const handleBookTour = () => {
    if (!tour || !id) {
      toast({
        title: 'Error',
        description: 'Tour information is not available',
        variant: 'destructive'
      });
      return;
    }

    // Use default dates (tomorrow to 4 days from now) for tours
    const startDate = format(addDays(new Date(), 1), 'yyyy-MM-dd');
    const endDate = format(addDays(new Date(), 1 + tour.duration_days), 'yyyy-MM-dd');

    // Check if already in cart
    if (!isInCart(undefined, id, startDate, endDate)) {
      // Add to cart if not already there
      addItem({
        id: '', // Will be set by addItem
        type: 'tour',
        tourId: id,
        tourName: tour.name,
        startDate,
        endDate,
        pricePerDay: tour.base_price / tour.duration_days,
        totalPrice: tour.base_price,
        days: tour.duration_days,
        image: tour.main_image || undefined,
      });
    }

    // Navigate to cart page
    navigate('/cart');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !tour) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Trip not found</h1>
          <Link to="/" className="text-primary hover:underline">Return to home</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const includedServices = Array.isArray(tour.included_services) ? tour.included_services : [];
  const tourHighlights = highlights?.map(h => h.highlight) || tour.destinations || [];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to trips</span>
        </Link>

        {/* Hero Image */}
        <div className="relative rounded-2xl overflow-hidden mb-8 aspect-[21/9]">
          {tour.main_image ? (
            <img 
              src={tour.main_image} 
              alt={tour.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <MapPin className="w-16 h-16 text-muted-foreground" />
            </div>
          )}
          {tour.is_featured && (
            <div className="absolute top-4 left-4 px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg uppercase tracking-wide">
              Featured
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Order 2 on mobile, 1 on desktop */}
          <div className="lg:col-span-2 space-y-8 order-2 lg:order-1">
            {/* Title & Quick Info */}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{tour.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <Clock className="w-5 h-5" />
                  <span>{tour.duration_label || `${tour.duration_days} Days`}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-5 h-5" />
                  <span>{tour.destinations?.length || 0} destinations</span>
                </div>
                {tour.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <span className="text-foreground font-medium">{tour.rating}</span>
                    <span>({tour.reviews_count} reviews)</span>
                  </div>
                )}
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed">{tour.description}</p>
            </div>

            {/* Route Info */}
            {(tour.start_location || tour.end_location) && (
              <div className="bg-secondary/50 rounded-xl p-6">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Car className="w-5 h-5 text-primary" />
                  Route Details
                </h3>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Start</p>
                    <p className="font-medium text-foreground">{tour.start_location}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">End</p>
                    <p className="font-medium text-foreground">{tour.end_location}</p>
                  </div>
                </div>
                {tour.route_details && (
                  <p className="text-sm text-muted-foreground mt-4">{tour.route_details}</p>
                )}
              </div>
            )}

            {/* Highlights */}
            {tourHighlights.length > 0 && (
              <div>
                <h3 className="font-semibold text-foreground mb-4">Trip Highlights</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {tourHighlights.map((highlight, index) => (
                    <div key={index} className="flex items-center gap-3 bg-card p-3 rounded-lg">
                      <Check className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-foreground">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Itinerary */}
            {itinerary && itinerary.length > 0 && (
              <div>
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Day-by-Day Itinerary
                </h3>
                <div className="space-y-4">
                  {itinerary.map((day, index) => (
                    <div 
                      key={day.id}
                      className="relative pl-8 pb-4 border-l-2 border-primary/30 last:border-transparent last:pb-0"
                    >
                      <div className="absolute left-0 top-0 w-4 h-4 -translate-x-1/2 rounded-full bg-primary" />
                      <div className="bg-card rounded-lg p-4 shadow-sm">
                        <p className="text-sm text-primary font-medium mb-1">Day {day.day_number}</p>
                        <h4 className="font-semibold text-foreground mb-2">{day.title}</h4>
                        {day.description && (
                          <p className="text-muted-foreground text-sm">{day.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Booking Sidebar - Order 1 on mobile, 2 on desktop */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            <div className="lg:sticky lg:top-24 bg-card rounded-xl p-6 shadow-card border border-border">
              <div className="mb-6">
                <p className="text-muted-foreground text-sm">Starting from</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-primary">{formatPrice(tour.base_price)}</span>
                  <span className="text-muted-foreground">
                    {tour.price_per_person ? '/person' : '/trip'}
                  </span>
                </div>
              </div>

              {/* What's Included */}
              {includedServices.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-foreground mb-3">What's Included</h4>
                  <ul className="space-y-2">
                    {includedServices.map((item: string, index: number) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Pricing Tiers */}
              {tour.pricing_tiers && Array.isArray(tour.pricing_tiers) && tour.pricing_tiers.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-primary" />
                    Pricing Tiers
                  </h4>
                  <div className="space-y-2">
                    {tour.pricing_tiers.map((tier: { min_days: number; max_days: number; price: number }, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg text-sm">
                        <span className="text-foreground">
                          {tier.min_days} - {tier.max_days} days
                        </span>
                        <span className="font-semibold text-primary">{formatPrice(tier.price)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Fees */}
              {tour.additional_fees && typeof tour.additional_fees === 'object' && Object.keys(tour.additional_fees).length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Info className="w-4 h-4 text-primary" />
                    Additional Fees
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(tour.additional_fees).map(([key, value]: [string, number], index: number) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-secondary/30 rounded-md text-sm">
                        <span className="text-muted-foreground">{key}</span>
                        <span className="font-medium text-foreground">{formatPrice(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Group Size */}
              {tour.max_participants && (
                <div className="flex items-center gap-3 mb-6 p-3 bg-secondary/50 rounded-lg">
                  <Users className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Group Size</p>
                    <p className="text-xs text-muted-foreground">Up to {tour.max_participants} travelers</p>
                  </div>
                </div>
              )}

              <Button
                onClick={handleBookTour}
                className="w-full h-14 text-lg font-semibold"
              >
                Book This Trip
              </Button>

              <div className="space-y-2 mt-4 text-center text-xs text-muted-foreground">
                <p>Free cancellation up to 48 hours before</p>
                {tour.advance_booking_days && tour.advance_booking_days > 0 && (
                  <p>Book at least {tour.advance_booking_days} days in advance</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TripDetail;
