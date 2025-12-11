import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Search,
  Loader2,
  CalendarCheck,
  MoreHorizontal,
  Eye,
  Check,
  X,
  Mail,
  FileText,
  CalendarIcon,
  Filter,
  ChevronLeft,
  ChevronRight,
  Car,
  User,
  DollarSign,
  Clock,
  MapPin,
  Phone,
  MessageSquare,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { format, differenceInDays, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

type CarInfo = {
  id: string;
  brand: string;
  model: string;
  main_image: string | null;
  category: string;
  price_per_day: number;
};

type LocationInfo = {
  id: string;
  name: string;
  address: string;
};

type Booking = Tables<'bookings'> & {
  cars?: CarInfo | null;
  pickup_locations?: LocationInfo | null;
  admin_notes?: string | null;
};

type BookingStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

const ITEMS_PER_PAGE = 10;

const statusConfig: Record<BookingStatus, { label: string; color: string }> = {
  pending: { label: 'Payment Pending', color: 'bg-warning/10 text-warning border-warning/20' },
  confirmed: { label: 'Confirmed', color: 'bg-success/10 text-success border-success/20' },
  in_progress: { label: 'In Progress', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  completed: { label: 'Completed', color: 'bg-muted text-muted-foreground border-muted' },
  cancelled: { label: 'Cancelled', color: 'bg-destructive/10 text-destructive border-destructive/20' },
};

export default function BookingsManagement() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');

  // Fetch bookings with car and location details
  const { data: bookingsData, isLoading } = useQuery({
    queryKey: ['admin-bookings', statusFilter, dateRange, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('bookings')
        .select(`
          *,
          cars (id, brand, model, main_image, category, price_per_day),
          pickup_locations!bookings_pickup_location_id_fkey (id, name, address)
        `)
        .order('created_at', { ascending: false });

      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter as BookingStatus);
      }

      if (dateRange.from) {
        query = query.gte('start_date', format(dateRange.from, 'yyyy-MM-dd'));
      }

      if (dateRange.to) {
        query = query.lte('end_date', format(dateRange.to, 'yyyy-MM-dd'));
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as unknown as Booking[];
    },
  });

  // Stats query
  const { data: stats } = useQuery({
    queryKey: ['admin-booking-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('status, total_price');

      if (error) throw error;

      const counts = {
        total: data.length,
        pending: data.filter((b) => b.status === 'pending').length,
        confirmed: data.filter((b) => b.status === 'confirmed').length,
        in_progress: data.filter((b) => b.status === 'in_progress').length,
        completed: data.filter((b) => b.status === 'completed').length,
        cancelled: data.filter((b) => b.status === 'cancelled').length,
        revenue: data
          .filter((b) => b.status !== 'cancelled')
          .reduce((sum, b) => sum + Number(b.total_price), 0),
      };

      return counts;
    },
  });

  // Update booking status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: BookingStatus }) => {
      const updateData: Record<string, unknown> = { status };
      if (status === 'confirmed') {
        updateData.confirmation_date = new Date().toISOString();
      }
      const { error } = await supabase
        .from('bookings')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['admin-booking-stats'] });
      toast({ title: 'Booking status updated' });
    },
    onError: (error) => {
      toast({ title: 'Error updating booking', description: error.message, variant: 'destructive' });
    },
  });

  // Update admin notes
  const updateNotesMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes: string }) => {
      const { error } = await supabase
        .from('bookings')
        .update({ admin_notes: notes })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      toast({ title: 'Notes saved' });
      setIsNotesOpen(false);
    },
    onError: (error) => {
      toast({ title: 'Error saving notes', description: error.message, variant: 'destructive' });
    },
  });

  // Filter bookings by search
  const filteredBookings = bookingsData?.filter((booking) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      booking.id.toLowerCase().includes(query) ||
      booking.customer_name?.toLowerCase().includes(query) ||
      booking.customer_email?.toLowerCase().includes(query) ||
      booking.customer_phone?.toLowerCase().includes(query) ||
      booking.cars?.brand?.toLowerCase().includes(query) ||
      booking.cars?.model?.toLowerCase().includes(query)
    );
  });

  // Pagination
  const totalPages = Math.ceil((filteredBookings?.length || 0) / ITEMS_PER_PAGE);
  const paginatedBookings = filteredBookings?.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsDetailOpen(true);
  };

  const handleAddNotes = (booking: Booking) => {
    setSelectedBooking(booking);
    setAdminNotes((booking as any).admin_notes || '');
    setIsNotesOpen(true);
  };

  const handleConfirmBooking = (booking: Booking) => {
    updateStatusMutation.mutate({ id: booking.id, status: 'confirmed' });
  };

  const handleCancelBooking = (booking: Booking) => {
    updateStatusMutation.mutate({ id: booking.id, status: 'cancelled' });
  };

  const handleMarkCompleted = (booking: Booking) => {
    updateStatusMutation.mutate({ id: booking.id, status: 'completed' });
  };

  const handleStartRental = (booking: Booking) => {
    updateStatusMutation.mutate({ id: booking.id, status: 'in_progress' });
  };

  const getRentalDays = (startDate: string, endDate: string) => {
    return differenceInDays(parseISO(endDate), parseISO(startDate)) + 1;
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Bookings Management</h2>
          <p className="text-muted-foreground">View and manage customer reservations</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
        <Card className="border-border/50">
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground mb-1">Total</p>
            <p className="text-2xl font-bold text-foreground">{stats?.total || 0}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground mb-1">Pending</p>
            <p className="text-2xl font-bold text-warning">{stats?.pending || 0}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground mb-1">Confirmed</p>
            <p className="text-2xl font-bold text-success">{stats?.confirmed || 0}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground mb-1">In Progress</p>
            <p className="text-2xl font-bold text-blue-500">{stats?.in_progress || 0}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground mb-1">Completed</p>
            <p className="text-2xl font-bold text-muted-foreground">{stats?.completed || 0}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground mb-1">Revenue</p>
            <p className="text-2xl font-bold text-primary">${stats?.revenue?.toLocaleString() || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-border/50 mb-6">
        <CardContent className="pt-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by ID, customer name, email, phone, or car..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Payment Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, 'MMM d')} - {format(dateRange.to, 'MMM d')}
                      </>
                    ) : (
                      format(dateRange.from, 'MMM d, yyyy')
                    )
                  ) : (
                    'Date Range'
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="range"
                  selected={dateRange as any}
                  onSelect={(range) => {
                    setDateRange({ from: range?.from, to: range?.to });
                    setCurrentPage(1);
                  }}
                  numberOfMonths={2}
                  className="pointer-events-auto"
                />
                {dateRange.from && (
                  <div className="p-3 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDateRange({})}
                      className="w-full"
                    >
                      Clear dates
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              {filteredBookings?.length || 0} Bookings
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : paginatedBookings && paginatedBookings.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Booking</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Car</TableHead>
                      <TableHead>Dates</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedBookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>
                          <div>
                            <p className="font-mono text-xs text-muted-foreground">
                              {booking.id.slice(0, 8)}...
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(booking.created_at), 'MMM d, yyyy')}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-foreground">
                              {booking.customer_name || 'N/A'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {booking.customer_email || 'No email'}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {booking.cars ? (
                            <div className="flex items-center gap-2">
                              {booking.cars.main_image ? (
                                <img
                                  src={booking.cars.main_image}
                                  alt={`${booking.cars.brand} ${booking.cars.model}`}
                                  className="w-10 h-8 object-cover rounded"
                                />
                              ) : (
                                <div className="w-10 h-8 bg-muted rounded flex items-center justify-center">
                                  <Car className="h-4 w-4 text-muted-foreground" />
                                </div>
                              )}
                              <div>
                                <p className="font-medium text-foreground text-sm">
                                  {booking.cars.brand} {booking.cars.model}
                                </p>
                                <p className="text-xs text-muted-foreground capitalize">
                                  {booking.with_driver ? 'With driver' : 'Self-drive'}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">No car</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm text-foreground">
                              {format(parseISO(booking.start_date), 'MMM d')} -{' '}
                              {format(parseISO(booking.end_date), 'MMM d, yyyy')}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {getRentalDays(booking.start_date, booking.end_date)} days
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <p className="font-semibold text-foreground">
                            ${Number(booking.total_price).toLocaleString()}
                          </p>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={statusConfig[booking.status as BookingStatus]?.color}
                          >
                            {statusConfig[booking.status as BookingStatus]?.label || booking.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewDetails(booking)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleAddNotes(booking)}>
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Add Notes
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {booking.status === 'pending' && (
                                <DropdownMenuItem onClick={() => handleConfirmBooking(booking)}>
                                  <Check className="h-4 w-4 mr-2" />
                                  Confirm Booking
                                </DropdownMenuItem>
                              )}
                              {booking.status === 'confirmed' && (
                                <DropdownMenuItem onClick={() => handleStartRental(booking)}>
                                  <Car className="h-4 w-4 mr-2" />
                                  Start Rental
                                </DropdownMenuItem>
                              )}
                              {booking.status === 'in_progress' && (
                                <DropdownMenuItem onClick={() => handleMarkCompleted(booking)}>
                                  <Check className="h-4 w-4 mr-2" />
                                  Mark Completed
                                </DropdownMenuItem>
                              )}
                              {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => handleCancelBooking(booking)}
                                    className="text-destructive"
                                  >
                                    <X className="h-4 w-4 mr-2" />
                                    Cancel Booking
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t">
                  <p className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CalendarCheck className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-medium text-foreground mb-1">No bookings found</h3>
              <p className="text-sm text-muted-foreground">
                {searchQuery || statusFilter !== 'all' || dateRange.from
                  ? 'Try adjusting your filters'
                  : 'Bookings will appear here when customers make reservations.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Booking Details Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>
              Booking ID: {selectedBooking?.id}
            </DialogDescription>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-6">
              {/* Status */}
              <div className="flex items-center justify-between">
                <Badge
                  variant="outline"
                  className={cn(
                    'text-sm px-3 py-1',
                    statusConfig[selectedBooking.status as BookingStatus]?.color
                  )}
                >
                  {statusConfig[selectedBooking.status as BookingStatus]?.label}
                </Badge>
                <p className="text-sm text-muted-foreground">
                  Created: {format(new Date(selectedBooking.created_at), 'PPP')}
                </p>
              </div>

              {/* Customer Info */}
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Customer Information
                </h4>
                <div className="grid grid-cols-2 gap-4 pl-6">
                  <div>
                    <p className="text-xs text-muted-foreground">Name</p>
                    <p className="font-medium">{selectedBooking.customer_name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="font-medium">{selectedBooking.customer_email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="font-medium">{selectedBooking.customer_phone || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Car Info */}
              {selectedBooking.cars && (
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Car className="h-4 w-4" />
                    Vehicle
                  </h4>
                  <div className="flex items-center gap-4 pl-6">
                    {selectedBooking.cars.main_image ? (
                      <img
                        src={selectedBooking.cars.main_image}
                        alt={`${selectedBooking.cars.brand} ${selectedBooking.cars.model}`}
                        className="w-24 h-16 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-24 h-16 bg-muted rounded-lg flex items-center justify-center">
                        <Car className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium">
                        {selectedBooking.cars.brand} {selectedBooking.cars.model}
                      </p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {selectedBooking.cars.category} •{' '}
                        {selectedBooking.with_driver ? 'With driver' : 'Self-drive'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Booking Dates */}
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Rental Period
                </h4>
                <div className="grid grid-cols-2 gap-4 pl-6">
                  <div>
                    <p className="text-xs text-muted-foreground">Pick-up Date</p>
                    <p className="font-medium">
                      {format(parseISO(selectedBooking.start_date), 'PPP')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Drop-off Date</p>
                    <p className="font-medium">
                      {format(parseISO(selectedBooking.end_date), 'PPP')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Duration</p>
                    <p className="font-medium">
                      {getRentalDays(selectedBooking.start_date, selectedBooking.end_date)} days
                    </p>
                  </div>
                </div>
              </div>

              {/* Location */}
              {selectedBooking.pickup_locations && (
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Pick-up Location
                  </h4>
                  <div className="pl-6">
                    <p className="font-medium">{selectedBooking.pickup_locations.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedBooking.pickup_locations.address}
                    </p>
                  </div>
                </div>
              )}

              {/* Payment */}
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Payment Details
                </h4>
                <div className="grid grid-cols-2 gap-4 pl-6">
                  <div>
                    <p className="text-xs text-muted-foreground">Total Amount</p>
                    <p className="font-bold text-lg text-primary">
                      ${Number(selectedBooking.total_price).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedBooking.notes && (
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Customer Notes
                  </h4>
                  <p className="text-sm text-muted-foreground pl-6">
                    {selectedBooking.notes}
                  </p>
                </div>
              )}

              {/* Admin Notes */}
              {(selectedBooking as any).admin_notes && (
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Admin Notes
                  </h4>
                  <p className="text-sm bg-muted/50 p-3 rounded-lg pl-6">
                    {(selectedBooking as any).admin_notes}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t">
                {selectedBooking.status === 'pending' && (
                  <Button onClick={() => handleConfirmBooking(selectedBooking)} className="flex-1">
                    <Check className="h-4 w-4 mr-2" />
                    Confirm Booking
                  </Button>
                )}
                {selectedBooking.status === 'confirmed' && (
                  <Button onClick={() => handleStartRental(selectedBooking)} className="flex-1">
                    <Car className="h-4 w-4 mr-2" />
                    Start Rental
                  </Button>
                )}
                {selectedBooking.status === 'in_progress' && (
                  <Button onClick={() => handleMarkCompleted(selectedBooking)} className="flex-1">
                    <Check className="h-4 w-4 mr-2" />
                    Mark Completed
                  </Button>
                )}
                {selectedBooking.status !== 'cancelled' && selectedBooking.status !== 'completed' && (
                  <Button
                    variant="outline"
                    onClick={() => handleCancelBooking(selectedBooking)}
                    className="text-destructive"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Notes Dialog */}
      <Dialog open={isNotesOpen} onOpenChange={setIsNotesOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Admin Notes</DialogTitle>
            <DialogDescription>
              Add internal notes for this booking (only visible to admins)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="admin-notes">Notes</Label>
              <Textarea
                id="admin-notes"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Enter notes about this booking..."
                rows={4}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsNotesOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() =>
                  selectedBooking &&
                  updateNotesMutation.mutate({ id: selectedBooking.id, notes: adminNotes })
                }
                disabled={updateNotesMutation.isPending}
              >
                {updateNotesMutation.isPending && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Save Notes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
