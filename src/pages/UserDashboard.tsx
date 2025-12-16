import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CalendarDays, Car, MapPin, Clock, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { formatPrice } from '@/lib/currency';
import SEO from '@/components/SEO';

interface Booking {
  id: string;
  start_date: string;
  end_date: string;
  total_price: number;
  status: string;
  booking_type: string;
  payment_status: string;
  created_at: string;
  cars: { brand: string; model: string; main_image: string | null } | null;
  tours: { name: string; main_image: string | null } | null;
}

export default function UserDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth?redirect=/dashboard');
    }
  }, [user, authLoading, navigate]);

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['user-bookings', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          cars:car_id (brand, model, main_image),
          tours:tour_id (name, main_image)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Booking[];
    },
    enabled: !!user,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-success/10 text-success border-success/20';
      case 'pending': return 'bg-warning/10 text-warning border-warning/20';
      case 'completed': return 'bg-primary/10 text-primary border-primary/20';
      case 'cancelled': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'in_progress': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <Skeleton className="h-10 w-48 mb-8" />
          <div className="grid gap-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) return null;

  const upcomingBookings = bookings?.filter(b => 
    ['pending', 'confirmed'].includes(b.status) && new Date(b.start_date) >= new Date()
  ) || [];

  const pastBookings = bookings?.filter(b => 
    !['pending', 'confirmed'].includes(b.status) || new Date(b.start_date) < new Date()
  ) || [];

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="My Bookings | TameAI Car Rental"
        description="View and manage your car rental and tour bookings."
      />
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">My Bookings</h1>
            <p className="text-muted-foreground mt-2">View and manage your reservations</p>
          </div>

          {isLoading ? (
            <div className="grid gap-4">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : bookings && bookings.length > 0 ? (
            <div className="space-y-8">
              {/* Upcoming Bookings */}
              {upcomingBookings.length > 0 && (
                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Upcoming Bookings
                  </h2>
                  <div className="grid gap-4">
                    {upcomingBookings.map((booking) => (
                      <BookingCard key={booking.id} booking={booking} getStatusColor={getStatusColor} />
                    ))}
                  </div>
                </section>
              )}

              {/* Past Bookings */}
              {pastBookings.length > 0 && (
                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-4">Past Bookings</h2>
                  <div className="grid gap-4">
                    {pastBookings.map((booking) => (
                      <BookingCard key={booking.id} booking={booking} getStatusColor={getStatusColor} />
                    ))}
                  </div>
                </section>
              )}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No bookings yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start exploring our cars and tours to make your first reservation.
                </p>
                <div className="flex gap-4 justify-center">
                  <Button asChild>
                    <Link to="/cars">Browse Cars</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/tours">Explore Tours</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

function BookingCard({ booking, getStatusColor }: { booking: Booking; getStatusColor: (status: string) => string }) {
  const itemName = booking.cars 
    ? `${booking.cars.brand} ${booking.cars.model}`
    : booking.tours?.name || 'Unknown';
  
  const itemImage = booking.cars?.main_image || booking.tours?.main_image;
  const itemLink = booking.cars 
    ? `/car/${booking.id}`
    : `/trip/${booking.id}`;

  return (
    <Card className="overflow-hidden hover:shadow-card-hover transition-shadow">
      <div className="flex flex-col sm:flex-row">
        {itemImage && (
          <div className="sm:w-48 h-32 sm:h-auto flex-shrink-0">
            <img 
              src={itemImage} 
              alt={itemName}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <CardContent className="flex-1 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className={getStatusColor(booking.status)}>
                  {booking.status.replace('_', ' ')}
                </Badge>
                <Badge variant="secondary" className="capitalize">
                  {booking.booking_type}
                </Badge>
              </div>
              
              <h3 className="font-semibold text-lg text-foreground">{itemName}</h3>
              
              <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4" />
                  <span>
                    {format(new Date(booking.start_date), 'MMM d')} - {format(new Date(booking.end_date), 'MMM d, yyyy')}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <p className="text-2xl font-bold text-foreground">
                {formatPrice(booking.total_price)}
              </p>
              <p className="text-xs text-muted-foreground capitalize">
                {booking.payment_status}
              </p>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
