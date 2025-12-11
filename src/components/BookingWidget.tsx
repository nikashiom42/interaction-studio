import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Lock, Minus, Plus, ChevronDown } from 'lucide-react';
import { format, differenceInDays, addDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface BookingWidgetProps {
  pricePerDay: number;
  carName?: string;
}

const BookingWidget = ({ pricePerDay, carName }: BookingWidgetProps) => {
  const [pickupDate, setPickupDate] = useState<Date | undefined>(addDays(new Date(), 1));
  const [dropoffDate, setDropoffDate] = useState<Date | undefined>(addDays(new Date(), 4));
  const [driveType, setDriveType] = useState<'self' | 'driver'>('self');
  const [passengers, setPassengers] = useState(2);
  const [pickupOpen, setPickupOpen] = useState(false);
  const [dropoffOpen, setDropoffOpen] = useState(false);

  // Calculate number of days and pricing
  const { days, subtotal, serviceFee, driverFee, total } = useMemo(() => {
    if (!pickupDate || !dropoffDate) {
      return { days: 0, subtotal: 0, serviceFee: 0, driverFee: 0, total: 0 };
    }
    
    const calculatedDays = Math.max(1, differenceInDays(dropoffDate, pickupDate));
    const calculatedSubtotal = pricePerDay * calculatedDays;
    const calculatedServiceFee = Math.round(calculatedSubtotal * 0.05); // 5% service fee
    const calculatedDriverFee = driveType === 'driver' ? 50 * calculatedDays : 0;
    const calculatedTotal = calculatedSubtotal + calculatedServiceFee + calculatedDriverFee;

    return {
      days: calculatedDays,
      subtotal: calculatedSubtotal,
      serviceFee: calculatedServiceFee,
      driverFee: calculatedDriverFee,
      total: calculatedTotal,
    };
  }, [pickupDate, dropoffDate, pricePerDay, driveType]);

  // Handle pickup date change
  const handlePickupSelect = (date: Date | undefined) => {
    setPickupDate(date);
    // If dropoff is before or same as pickup, adjust it
    if (date && dropoffDate && dropoffDate <= date) {
      setDropoffDate(addDays(date, 1));
    }
    setPickupOpen(false);
  };

  // Handle dropoff date change
  const handleDropoffSelect = (date: Date | undefined) => {
    setDropoffDate(date);
    setDropoffOpen(false);
  };

  return (
    <div className="bg-card rounded-xl shadow-card-hover p-6 border border-border">
      {/* Price Header */}
      <div className="flex items-baseline justify-between mb-6">
        <div>
          <span className="text-sm text-muted-foreground">Price starts from</span>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-foreground">${pricePerDay}</span>
            <span className="text-muted-foreground">/day</span>
          </div>
        </div>
        <span className="text-primary text-sm font-medium cursor-pointer hover:underline">Best Price Guarantee</span>
      </div>

      {/* Date Pickers */}
      <div className="space-y-3 mb-4">
        {/* Pickup Date */}
        <Popover open={pickupOpen} onOpenChange={setPickupOpen}>
          <PopoverTrigger asChild>
            <button className="w-full flex items-center gap-3 p-3 border border-border rounded-lg hover:border-primary transition-colors text-left group">
              <Calendar className="w-5 h-5 text-primary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-xs text-muted-foreground block">Pickup Date</span>
                <span className={cn(
                  "font-medium truncate block",
                  pickupDate ? "text-foreground" : "text-muted-foreground"
                )}>
                  {pickupDate ? format(pickupDate, "EEE, MMM d, yyyy") : "Select date"}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-card border border-border shadow-lg z-50" align="start">
            <CalendarComponent
              mode="single"
              selected={pickupDate}
              onSelect={handlePickupSelect}
              disabled={(date) => date < new Date()}
              initialFocus
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>

        {/* Dropoff Date */}
        <Popover open={dropoffOpen} onOpenChange={setDropoffOpen}>
          <PopoverTrigger asChild>
            <button className="w-full flex items-center gap-3 p-3 border border-border rounded-lg hover:border-primary transition-colors text-left group">
              <Calendar className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-xs text-muted-foreground block">Dropoff Date</span>
                <span className={cn(
                  "font-medium truncate block",
                  dropoffDate ? "text-foreground" : "text-muted-foreground"
                )}>
                  {dropoffDate ? format(dropoffDate, "EEE, MMM d, yyyy") : "Select date"}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-card border border-border shadow-lg z-50" align="start">
            <CalendarComponent
              mode="single"
              selected={dropoffDate}
              onSelect={handleDropoffSelect}
              disabled={(date) => date <= (pickupDate || new Date())}
              initialFocus
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>

        {/* Location */}
        <div className="flex items-center gap-3 p-3 border border-border rounded-lg hover:border-primary transition-colors cursor-pointer">
          <MapPin className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <span className="text-xs text-muted-foreground block">Pick-up Location</span>
            <span className="font-medium text-foreground truncate block">Tokyo Haneda Airport (HND)</span>
          </div>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>

      {/* Duration Badge */}
      {days > 0 && (
        <div className="flex items-center justify-center gap-2 py-2 mb-4 bg-primary/5 rounded-lg text-sm animate-fade-in">
          <span className="text-muted-foreground">Rental Duration:</span>
          <span className="font-semibold text-primary">{days} {days === 1 ? 'day' : 'days'}</span>
        </div>
      )}

      {/* Drive Type Toggle */}
      <div className="flex bg-secondary rounded-lg p-1 mb-4">
        <button
          onClick={() => setDriveType('self')}
          className={cn(
            "flex-1 py-2 text-sm font-medium rounded-md transition-all",
            driveType === 'self'
              ? 'bg-background text-primary shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          Self-Drive
        </button>
        <button
          onClick={() => setDriveType('driver')}
          className={cn(
            "flex-1 py-2 text-sm font-medium rounded-md transition-all",
            driveType === 'driver'
              ? 'bg-background text-primary shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          With Driver
        </button>
      </div>

      {/* Passengers */}
      <div className="flex items-center justify-between p-3 border border-border rounded-lg mb-6">
        <div className="flex items-center gap-3">
          <Users className="w-5 h-5 text-muted-foreground" />
          <span className="text-foreground">Passengers</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPassengers(Math.max(1, passengers - 1))}
            className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors btn-scale"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-6 text-center font-medium text-foreground">{passengers}</span>
          <button
            onClick={() => setPassengers(Math.min(7, passengers + 1))}
            className="w-8 h-8 rounded-full border border-primary bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-colors btn-scale"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="space-y-3 mb-6 pb-6 border-b border-border">
        <div className="flex items-center justify-between text-muted-foreground text-sm">
          <span>${pricePerDay} x {days} {days === 1 ? 'day' : 'days'}</span>
          <span className="font-medium text-foreground">${subtotal}</span>
        </div>
        {driveType === 'driver' && (
          <div className="flex items-center justify-between text-muted-foreground text-sm animate-fade-in">
            <span>Driver fee ($50/day)</span>
            <span className="font-medium text-foreground">${driverFee}</span>
          </div>
        )}
        <div className="flex items-center justify-between text-muted-foreground text-sm">
          <span>Service fee (5%)</span>
          <span className="font-medium text-foreground">${serviceFee}</span>
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-dashed border-border">
          <span className="font-semibold text-foreground">Total</span>
          <span className="text-2xl font-bold text-foreground">${total}</span>
        </div>
      </div>

      {/* Book Button */}
      <Link 
        to="/checkout" 
        className="w-full py-4 bg-primary text-primary-foreground font-semibold rounded-lg btn-scale hover:bg-coral-hover transition-colors shadow-button flex items-center justify-center"
      >
        Book Now • ${total}
      </Link>

      <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
        <Lock className="w-4 h-4" />
        <span>Secure booking. No hidden fees.</span>
      </div>
    </div>
  );
};

export default BookingWidget;
