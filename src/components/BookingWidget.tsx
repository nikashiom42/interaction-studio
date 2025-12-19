import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Lock, ChevronDown, Clock, Info, ShoppingCart, Check } from 'lucide-react';
import { formatPrice, CURRENCY_SYMBOL } from '@/lib/currency';
import { format, differenceInDays, addDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { useCart } from '@/hooks/useCart';
import { toast } from '@/hooks/use-toast';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { pickupLocations, getDeliveryFee } from '@/lib/locations';

interface BookingWidgetProps {
  pricePerDay: number;
  carName?: string;
  carId?: string;
  category?: string;
  image?: string;
}

const BookingWidget = ({ pricePerDay, carName, carId, category, image }: BookingWidgetProps) => {
  const navigate = useNavigate();
  const { addItem, isInCart } = useCart();
  const [pickupDate, setPickupDate] = useState<Date | undefined>(addDays(new Date(), 1));
  const [dropoffDate, setDropoffDate] = useState<Date | undefined>(addDays(new Date(), 4));
  const [pickupTime, setPickupTime] = useState('10:00');
  const [dropoffTime, setDropoffTime] = useState('10:00');
  const [driveType, setDriveType] = useState<'self' | 'driver'>('self');
  const [pickupOpen, setPickupOpen] = useState(false);
  const [dropoffOpen, setDropoffOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('tbs'); // Default to Tbilisi Airport

  // Calculate number of days and pricing
  const { days, subtotal, serviceFee, driverFee, deliveryFee, total } = useMemo(() => {
    if (!pickupDate || !dropoffDate) {
      return { days: 0, subtotal: 0, serviceFee: 0, driverFee: 0, deliveryFee: 0, total: 0 };
    }

    const calculatedDays = Math.max(1, differenceInDays(dropoffDate, pickupDate));
    const calculatedSubtotal = pricePerDay * calculatedDays;
    const calculatedServiceFee = Math.round(calculatedSubtotal * 0.05); // 5% service fee
    const calculatedDriverFee = driveType === 'driver' ? 50 * calculatedDays : 0;
    const calculatedDeliveryFee = getDeliveryFee(selectedLocation);
    const calculatedTotal = calculatedSubtotal + calculatedServiceFee + calculatedDriverFee + calculatedDeliveryFee;

    return {
      days: calculatedDays,
      subtotal: calculatedSubtotal,
      serviceFee: calculatedServiceFee,
      driverFee: calculatedDriverFee,
      deliveryFee: calculatedDeliveryFee,
      total: calculatedTotal,
    };
  }, [pickupDate, dropoffDate, pricePerDay, driveType, selectedLocation]);

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

  // Handle add to cart
  const handleAddToCart = () => {
    if (!pickupDate || !dropoffDate || !carId) {
      toast({
        title: 'Missing information',
        description: 'Please select pickup and dropoff dates',
        variant: 'destructive'
      });
      return;
    }

    const startDateStr = format(pickupDate, 'yyyy-MM-dd');
    const endDateStr = format(dropoffDate, 'yyyy-MM-dd');

    // Check if already in cart
    if (isInCart(carId, undefined, startDateStr, endDateStr)) {
      toast({
        title: 'Already in cart',
        description: 'This car with these dates is already in your cart',
        variant: 'destructive'
      });
      return;
    }

    addItem({
      id: '', // Will be set by addItem
      type: 'car',
      carId,
      carName,
      startDate: startDateStr,
      endDate: endDateStr,
      pickupTime,
      dropoffTime,
      withDriver: driveType === 'driver',
      location: selectedLocation,
      pricePerDay,
      totalPrice: total,
      days,
      category,
      image,
    });

    toast({
      title: 'Added to cart!',
      description: `${carName} has been added to your cart`,
    });
  };

  const alreadyInCart = pickupDate && dropoffDate && carId ?
    isInCart(carId, undefined, format(pickupDate, 'yyyy-MM-dd'), format(dropoffDate, 'yyyy-MM-dd')) :
    false;

  return (
    <div className="bg-card rounded-xl shadow-card-hover p-6 border border-border">
      {/* Price Header */}
      <div className="flex items-baseline justify-between mb-6">
        <div>
          <span className="text-sm text-muted-foreground">Price starts from</span>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-foreground">{formatPrice(pricePerDay)}</span>
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

        {/* Time Pickers */}
        <div className="grid grid-cols-2 gap-3">
          {/* Pickup Time */}
          <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
            <Clock className="w-5 h-5 text-primary flex-shrink-0" />
            <div className="flex-1">
              <label className="text-xs text-muted-foreground block">Pickup Time</label>
              <input
                type="time"
                value={pickupTime}
                onChange={(e) => setPickupTime(e.target.value)}
                className="w-full font-medium text-foreground bg-transparent border-none outline-none focus:ring-0 p-0"
              />
            </div>
          </div>

          {/* Dropoff Time */}
          <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
            <Clock className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            <div className="flex-1">
              <label className="text-xs text-muted-foreground block">Dropoff Time</label>
              <input
                type="time"
                value={dropoffTime}
                onChange={(e) => setDropoffTime(e.target.value)}
                className="w-full font-medium text-foreground bg-transparent border-none outline-none focus:ring-0 p-0"
              />
            </div>
          </div>
        </div>

        {/* Location */}
        <Popover open={locationOpen} onOpenChange={setLocationOpen}>
          <PopoverTrigger asChild>
            <button className="w-full flex items-center gap-3 p-3 border border-border rounded-lg hover:border-primary transition-colors text-left group">
              <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-xs text-muted-foreground block">Pick-up Location</span>
                <span className="font-medium text-foreground truncate block">
                  {pickupLocations.find(loc => loc.id === selectedLocation)?.name || 'Select location'}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-0 bg-card border border-border shadow-lg z-50" align="start">
            <div className="py-2 max-h-[300px] overflow-y-auto">
              {pickupLocations.map((location) => (
                <button
                  key={location.id}
                  onClick={() => {
                    setSelectedLocation(location.id);
                    setLocationOpen(false);
                  }}
                  className={cn(
                    "w-full px-4 py-2 text-left hover:bg-secondary transition-colors flex items-center justify-between gap-3",
                    selectedLocation === location.id && "bg-primary/10"
                  )}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{location.name}</p>
                      <p className="text-xs text-muted-foreground">{location.city}</p>
                    </div>
                  </div>
                  {location.deliveryFee > 0 && (
                    <span className="text-xs text-muted-foreground whitespace-nowrap">+${location.deliveryFee}</span>
                  )}
                  {location.deliveryFee === 0 && (
                    <span className="text-xs text-success whitespace-nowrap">Free</span>
                  )}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
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


      {/* Price Breakdown */}
      <div className="space-y-3 mb-6 pb-6 border-b border-border">
        <div className="flex items-center justify-between text-muted-foreground text-sm">
          <span>{formatPrice(pricePerDay)} x {days} {days === 1 ? 'day' : 'days'}</span>
          <span className="font-medium text-foreground">{formatPrice(subtotal)}</span>
        </div>
        {driveType === 'driver' && (
          <div className="flex items-center justify-between text-muted-foreground text-sm animate-fade-in">
            <span>Driver fee ({CURRENCY_SYMBOL}50/day)</span>
            <span className="font-medium text-foreground">{formatPrice(driverFee)}</span>
          </div>
        )}
        <div className="flex items-center justify-between text-muted-foreground text-sm">
          <span>Service fee (5%)</span>
          <span className="font-medium text-foreground">{formatPrice(serviceFee)}</span>
        </div>
        {deliveryFee > 0 ? (
          <div className="flex items-center justify-between text-muted-foreground text-sm animate-fade-in">
            <span>Delivery fee</span>
            <span className="font-medium text-foreground">${deliveryFee}</span>
          </div>
        ) : (
          <div className="flex items-center justify-between text-success text-sm animate-fade-in">
            <span>Delivery fee (Tbilisi)</span>
            <span className="font-medium">Free</span>
          </div>
        )}
        <div className="flex items-center justify-between pt-3 border-t border-dashed border-border">
          <span className="font-semibold text-foreground">Total</span>
          <span className="text-2xl font-bold text-foreground">{formatPrice(total)}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        {/* Add to Cart Button */}
        {alreadyInCart ? (
          <button
            onClick={() => navigate('/cart')}
            className="w-full py-4 bg-success text-white font-semibold rounded-lg btn-scale hover:bg-success/90 transition-colors shadow-button flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" />
            In Cart • View Cart
          </button>
        ) : (
          <button
            onClick={handleAddToCart}
            className="w-full py-4 bg-secondary text-foreground font-semibold rounded-lg btn-scale hover:bg-accent transition-colors border border-border flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-5 h-5" />
            Add to Cart • {formatPrice(total)}
          </button>
        )}

        {/* Book Now Button */}
        <Link
          to={`/checkout?carId=${carId || ''}&startDate=${pickupDate ? format(pickupDate, 'yyyy-MM-dd') : ''}&endDate=${dropoffDate ? format(dropoffDate, 'yyyy-MM-dd') : ''}&pickupTime=${pickupTime}&dropoffTime=${dropoffTime}&withDriver=${driveType === 'driver'}&location=${selectedLocation}`}
          className="w-full py-4 bg-primary text-primary-foreground font-semibold rounded-lg btn-scale hover:bg-coral-hover transition-colors shadow-button flex items-center justify-center"
        >
          Book Now • {formatPrice(total)}
        </Link>
      </div>

      {/* Availability Info */}
      {category === 'sports' ? (
        <div className="flex items-start gap-2 mt-4 p-3 bg-warning/10 border border-warning/20 rounded-lg text-sm">
          <Info className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
          <span className="text-warning">
            <strong>Exclusive Booking:</strong> Sport cars can only be booked by one customer at a time. Please ensure your dates don't conflict with existing reservations.
          </span>
        </div>
      ) : (
        <div className="flex items-start gap-2 mt-4 p-3 bg-success/10 border border-success/20 rounded-lg text-sm">
          <Info className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
          <span className="text-success">
            <strong>Flexible Availability:</strong> This vehicle supports multiple bookings. You can reserve it even if others have booked for the same period.
          </span>
        </div>
      )}

      <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
        <Lock className="w-4 h-4" />
        <span>Secure booking. No hidden fees.</span>
      </div>
    </div>
  );
};

export default BookingWidget;
