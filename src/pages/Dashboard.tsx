import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  User, Mail, Phone, Calendar, Car, CreditCard, Clock, 
  MapPin, ChevronRight, LogOut, Settings, Loader2, 
  CheckCircle, XCircle, AlertCircle, Edit2
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { format, parseISO } from 'date-fns';
import { formatPrice } from '@/lib/currency';

const statusConfig = {
  pending: { label: 'Pending', icon: AlertCircle, className: 'bg-warning/10 text-warning' },
  confirmed: { label: 'Confirmed', icon: CheckCircle, className: 'bg-success/10 text-success' },
  in_progress: { label: 'In Progress', icon: Clock, className: 'bg-primary/10 text-primary' },
  completed: { label: 'Completed', icon: CheckCircle, className: 'bg-muted text-muted-foreground' },
  cancelled: { label: 'Cancelled', icon: XCircle, className: 'bg-destructive/10 text-destructive' },
};

const paymentStatusConfig = {
  pending: { label: 'Payment Pending', className: 'bg-warning/10 text-warning' },
  paid: { label: 'Paid', className: 'bg-success/10 text-success' },
  partial: { label: 'Partially Paid', className: 'bg-primary/10 text-primary' },
  partially_paid: { label: 'Partially Paid', className: 'bg-primary/10 text-primary' },
  refunded: { label: 'Refunded', className: 'bg-muted text-muted-foreground' },
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading, signOut } = useAuth();

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Fetch user profile
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch user bookings with car details
  const { data: bookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ['user-bookings', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          car:cars(id, brand, model, main_image, category)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const stats = {
    totalBookings: bookings?.length || 0,
    activeBookings: bookings?.filter(b => ['pending', 'confirmed', 'in_progress'].includes(b.status)).length || 0,
    completedBookings: bookings?.filter(b => b.status === 'completed').length || 0,
    totalSpent: bookings?.reduce((sum, b) => sum + Number(b.total_price), 0) || 0,
  };

  return (
    <div className="min-h-screen bg-secondary/30">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage your bookings and account settings</p>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile & Stats */}
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="bg-card rounded-xl p-6 shadow-card">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <User className="w-8 h-8 text-primary" />
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-foreground">
                    {profile?.full_name || 'User'}
                  </h2>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <button className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">{user.email}</span>
                </div>
                {profile?.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-foreground">{profile.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Member since {format(parseISO(profile?.created_at || user.created_at), 'MMM yyyy')}
                  </span>
                </div>
              </div>

              <button className="w-full mt-6 py-2.5 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-secondary transition-colors flex items-center justify-center gap-2">
                <Settings className="w-4 h-4" />
                Account Settings
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card rounded-xl p-4 shadow-card">
                <div className="text-2xl font-bold text-foreground">{stats.totalBookings}</div>
                <div className="text-sm text-muted-foreground">Total Bookings</div>
              </div>
              <div className="bg-card rounded-xl p-4 shadow-card">
                <div className="text-2xl font-bold text-primary">{stats.activeBookings}</div>
                <div className="text-sm text-muted-foreground">Active</div>
              </div>
              <div className="bg-card rounded-xl p-4 shadow-card">
                <div className="text-2xl font-bold text-success">{stats.completedBookings}</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
              <div className="bg-card rounded-xl p-4 shadow-card">
                <div className="text-2xl font-bold text-foreground">${stats.totalSpent.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Spent</div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-card rounded-xl p-6 shadow-card">
              <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Link
                  to="/cars"
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <Car className="w-5 h-5 text-primary" />
                    <span className="text-foreground">Browse Cars</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </Link>
                <Link
                  to="/"
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-primary" />
                    <span className="text-foreground">Explore Destinations</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column - Bookings */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-xl shadow-card">
              <div className="p-6 border-b border-border">
                <h2 className="text-lg font-semibold text-foreground">My Bookings</h2>
                <p className="text-sm text-muted-foreground">View and manage your car rental bookings</p>
              </div>

              {bookingsLoading ? (
                <div className="p-12 text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                </div>
              ) : bookings && bookings.length > 0 ? (
                <div className="divide-y divide-border">
                  {bookings.map((booking) => {
                    const status = statusConfig[booking.status as keyof typeof statusConfig] || statusConfig.pending;
                    const paymentStatus = paymentStatusConfig[booking.payment_status as keyof typeof paymentStatusConfig] || paymentStatusConfig.pending;
                    const StatusIcon = status.icon;

                    return (
                      <div key={booking.id} className="p-6 hover:bg-secondary/50 transition-colors">
                        <div className="flex flex-col sm:flex-row gap-4">
                          {/* Car Image */}
                          <div className="w-full sm:w-32 h-24 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                            {booking.car?.main_image ? (
                              <img 
                                src={booking.car.main_image} 
                                alt={`${booking.car.brand} ${booking.car.model}`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Car className="w-8 h-8 text-muted-foreground" />
                              </div>
                            )}
                          </div>

                          {/* Booking Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                              <div>
                                <h3 className="font-semibold text-foreground">
                                  {booking.car ? `${booking.car.brand} ${booking.car.model}` : 'Car Rental'}
                                </h3>
                                <p className="text-sm text-muted-foreground capitalize">
                                  {booking.car?.category || 'Standard'} • Self-drive
                                </p>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.className}`}>
                                  <StatusIcon className="w-3 h-3" />
                                  {status.label}
                                </span>
                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${paymentStatus.className}`}>
                                  {paymentStatus.label}
                                </span>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>
                                  {format(parseISO(booking.start_date), 'MMM d')} - {format(parseISO(booking.end_date), 'MMM d, yyyy')}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <CreditCard className="w-4 h-4" />
                                <span>{formatPrice(Number(booking.total_price))}</span>
                              </div>
                            </div>

                            {/* Payment Info */}
                            {booking.payment_option !== 'full' && (
                              <div className="text-sm text-muted-foreground">
                                {booking.payment_option === 'deposit' && (
                                  <span>
                                    Deposit: {formatPrice(Number(booking.deposit_amount || 0))} | 
                                    Remaining: {formatPrice(Number(booking.remaining_balance || 0))}
                                  </span>
                                )}
                                {booking.payment_option === 'pickup' && (
                                  <span>Payment due at pickup: {formatPrice(Number(booking.total_price))}</span>
                                )}
                              </div>
                            )}

                            <div className="flex items-center gap-4 mt-3">
                              <span className="text-xs text-muted-foreground">
                                Booking ID: {booking.id.slice(0, 8).toUpperCase()}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                Booked on {format(parseISO(booking.created_at), 'MMM d, yyyy')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-secondary rounded-full flex items-center justify-center">
                    <Car className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">No bookings yet</h3>
                  <p className="text-muted-foreground mb-6">Start exploring our car collection and book your first ride!</p>
                  <Link
                    to="/cars"
                    className="inline-flex px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-coral-hover transition-colors"
                  >
                    Browse Cars
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
