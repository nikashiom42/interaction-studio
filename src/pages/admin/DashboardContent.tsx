import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Car, Users, CalendarCheck, Map, Star, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatPrice } from '@/lib/currency';
import { startOfMonth, endOfMonth } from 'date-fns';

export default function DashboardContent() {
  const navigate = useNavigate();

  const { data: carsCount } = useQuery({
    queryKey: ['admin-stats-cars'],
    queryFn: async () => {
      const { count } = await supabase.from('cars').select('*', { count: 'exact', head: true });
      return count || 0;
    },
  });

  const { data: bookingsData } = useQuery({
    queryKey: ['admin-stats-bookings'],
    queryFn: async () => {
      const now = new Date();
      const monthStart = startOfMonth(now).toISOString();
      const monthEnd = endOfMonth(now).toISOString();
      
      const { data: activeBookings } = await supabase
        .from('bookings')
        .select('*', { count: 'exact' })
        .in('status', ['pending', 'confirmed', 'in_progress']);
      
      const { data: monthlyBookings } = await supabase
        .from('bookings')
        .select('total_price')
        .gte('created_at', monthStart)
        .lte('created_at', monthEnd);
      
      const revenue = monthlyBookings?.reduce((sum, b) => sum + (b.total_price || 0), 0) || 0;
      
      return { active: activeBookings?.length || 0, revenue };
    },
  });

  const { data: usersCount } = useQuery({
    queryKey: ['admin-stats-users'],
    queryFn: async () => {
      const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      return count || 0;
    },
  });

  const { data: toursCount } = useQuery({
    queryKey: ['admin-stats-tours'],
    queryFn: async () => {
      const { count } = await supabase.from('tours').select('*', { count: 'exact', head: true });
      return count || 0;
    },
  });

  const { data: reviewsCount } = useQuery({
    queryKey: ['admin-stats-reviews'],
    queryFn: async () => {
      const { count } = await supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('is_approved', false);
      return count || 0;
    },
  });

  const { data: messagesCount } = useQuery({
    queryKey: ['admin-stats-messages'],
    queryFn: async () => {
      const { count } = await supabase.from('contact_messages').select('*', { count: 'exact', head: true }).eq('is_read', false);
      return count || 0;
    },
  });

  const stats = [
    {
      title: 'Total Cars',
      value: carsCount?.toString() || '0',
      description: 'Vehicles in fleet',
      icon: Car,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Active Bookings',
      value: bookingsData?.active?.toString() || '0',
      description: 'Current rentals',
      icon: CalendarCheck,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      title: 'Total Users',
      value: usersCount?.toString() || '0',
      description: 'Registered customers',
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Monthly Revenue',
      value: formatPrice(bookingsData?.revenue || 0),
      description: 'This month',
      icon: CalendarCheck,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
  ];

  const alerts = [
    { count: reviewsCount || 0, label: 'Pending reviews', link: '/admin/reviews', icon: Star },
    { count: messagesCount || 0, label: 'Unread messages', link: '/admin/messages', icon: Mail },
  ].filter(a => a.count > 0);

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
        <p className="text-muted-foreground">Welcome back, manage your car rental business.</p>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-3">
          {alerts.map((alert) => (
            <Card 
              key={alert.label}
              className="border-warning/50 bg-warning/5 cursor-pointer hover:bg-warning/10 transition-colors"
              onClick={() => navigate(alert.link)}
            >
              <CardContent className="flex items-center gap-3 p-4">
                <alert.icon className="h-5 w-5 text-warning" />
                <span className="font-medium">{alert.count} {alert.label}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-border/50 hover:shadow-card-hover transition-shadow cursor-pointer" onClick={() => navigate('/admin/cars')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5 text-primary" />
              Manage Cars
            </CardTitle>
            <CardDescription>Add, edit, or remove vehicles from your fleet</CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-border/50 hover:shadow-card-hover transition-shadow cursor-pointer" onClick={() => navigate('/admin/bookings')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarCheck className="h-5 w-5 text-success" />
              Bookings
            </CardTitle>
            <CardDescription>View and manage customer reservations</CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-border/50 hover:shadow-card-hover transition-shadow cursor-pointer" onClick={() => navigate('/admin/tours')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Map className="h-5 w-5 text-blue-500" />
              Tours
            </CardTitle>
            <CardDescription>Manage tour packages and itineraries</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
