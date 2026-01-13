import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  ChevronRight, Calendar, MapPin, Clock, Trash2, Check,
  Lock, ThumbsUp, Shield, Loader2, Baby, Tent
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useLocations } from '@/hooks/useLocations';
import { toast } from '@/hooks/use-toast';
import { format, parseISO } from 'date-fns';
import { countryCodes } from '@/data/countryCodes';
import { formatPrice, CURRENCY_SYMBOL } from '@/lib/currency';
import carRangeRover from '@/assets/car-range-rover.jpg';

type PaymentOption = 'deposit' | 'pickup';

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items: cartItems, itemCount, totalPrice: cartTotal, removeItem, clearCart } = useCart();
  const { locations } = useLocations();

  const [paymentSchedule, setPaymentSchedule] = useState<PaymentOption>('pickup');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+995');

  // Fetch related cars for empty cart suggestions
  const { data: relatedCars } = useQuery({
    queryKey: ['related-cars'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cars')
        .select('id, brand, model, category, transmission, price_per_day, main_image')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      return data;
    },
  });

  // Calculate total prices from cart
  const totalPrice = cartTotal;

  // Calculate payment amounts based on option
  const getPaymentAmounts = () => {
    switch (paymentSchedule) {
      case 'deposit':
        return { deposit: totalPrice * 0.15, remaining: totalPrice * 0.85 };
      case 'pickup':
        return { deposit: 0, remaining: totalPrice };
      default:
        return { deposit: 0, remaining: totalPrice };
    }
  };

  const paymentAmounts = getPaymentAmounts();
  const canComplete = !!firstName.trim() && !!lastName.trim() && !!phone.trim() && acceptTerms && !isProcessing;

  // Create booking mutation - creates multiple bookings for all cart items
  const createBookingMutation = useMutation({
    mutationFn: async () => {
      if (cartItems.length === 0) {
        throw new Error('Cart is empty');
      }

      const paymentStatus = 'pending';
      const bookingStatus: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' = 'confirmed';

      // Create booking data for each cart item
      const bookingsData = cartItems.map(item => ({
        car_id: item.carId || null,
        tour_id: item.tourId || null,
        booking_type: item.type,
        user_id: user?.id || null,
        start_date: item.startDate,
        end_date: item.endDate,
        pickup_time: item.pickupTime || '10:00',
        dropoff_time: item.dropoffTime || '10:00',
        with_driver: item.withDriver || false,
        total_price: item.totalPrice,
        status: bookingStatus,
        customer_name: `${firstName} ${lastName}`.trim(),
        customer_email: email,
        customer_phone: `${countryCode} ${phone}`.trim(),
        payment_option: paymentSchedule,
        payment_status: paymentStatus,
        deposit_amount: paymentAmounts.deposit * (item.totalPrice / cartTotal), // Proportional deposit
        remaining_balance: paymentAmounts.remaining * (item.totalPrice / cartTotal), // Proportional balance
        payment_transaction_id: null,
        payment_date: null,
        notes: item.type === 'tour' ? 'Tour booking' : (item.withDriver ? 'Booking - With driver' : 'Booking - Self-drive'),
        // Add-ons
        child_seats: item.childSeats || 0,
        child_seats_total: item.childSeatsTotal || 0,
        camping_equipment: item.campingEquipment || false,
        camping_equipment_total: item.campingEquipmentTotal || 0,
        addons_total: item.addonsTotal || 0,
      }));

      // Insert all bookings at once
      const { data, error } = await supabase
        .from('bookings')
        .insert(bookingsData)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: async (data) => {
      clearCart(); // Clear cart after successful booking
      toast({ title: `${data.length} booking${data.length > 1 ? 's' : ''} confirmed successfully!` });

      // Send booking confirmation email for each booking
      for (const booking of data) {
        try {
          await fetch('/api/send-booking-confirmation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              bookingId: booking.id,
              customerName: booking.customer_name,
              customerEmail: booking.customer_email || email,
              customerPhone: booking.customer_phone,
              carName: booking.booking_type === 'car' ? cartItems.find(item => item.carId === booking.car_id)?.carName : undefined,
              tourName: booking.booking_type === 'tour' ? cartItems.find(item => item.tourId === booking.tour_id)?.tourName : undefined,
              bookingType: booking.booking_type,
              startDate: booking.start_date,
              endDate: booking.end_date,
              pickupTime: booking.pickup_time,
              dropoffTime: booking.dropoff_time,
              totalPrice: booking.total_price,
              withDriver: booking.with_driver,
              paymentOption: booking.payment_option,
              depositAmount: booking.deposit_amount,
              remainingBalance: booking.remaining_balance,
              childSeats: booking.child_seats,
              campingEquipment: booking.camping_equipment,
            }),
          });
        } catch (emailError) {
          // Don't block the user flow if email fails
          console.error('Failed to send booking confirmation email:', emailError);
        }
      }

      // Navigate to success page with first booking ID
      navigate(`/booking-success?bookingId=${data[0].id}`);
    },
    onError: (error) => {
      toast({
        title: 'Error creating bookings',
        description: error.message,
        variant: 'destructive'
      });
      setIsProcessing(false);
    },
  });

  const handleConfirmBooking = () => {
    if (!acceptTerms) {
      toast({
        title: 'Please accept terms',
        description: 'You must accept the terms and conditions to continue.',
        variant: 'destructive'
      });
      return;
    }
    setIsProcessing(true);
    createBookingMutation.mutate();
  };

  // Validation for personal details
  const isPersonalDetailsValid = firstName.trim() !== '' &&
    lastName.trim() !== '' &&
    phone.trim() !== '';

  const canProceedToPayment = canComplete;

  const steps = [
    { label: 'Cart', active: true, completed: true },
    { label: 'Checkout', active: true, completed: false },
    { label: 'Confirmation', active: false, completed: false },
  ];

  if (itemCount === 0) {
    return (
      <div className="min-h-screen bg-background">
        <SEO title="Checkout" description="Complete your car rental booking" url="/checkout" noIndex />
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-16">
            <div className="w-32 h-32 mx-auto mb-6 bg-secondary rounded-full flex items-center justify-center">
              <img src={carRangeRover} alt="" className="w-20 h-20 object-cover rounded-lg opacity-50" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">Looks like you haven't added any cars yet.</p>
            <Link
              to="/cars"
              className="inline-flex px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium btn-scale hover:bg-coral-hover transition-colors"
            >
              Find Cars to Rent
            </Link>
          </div>

          {/* Related Cars */}
          {relatedCars && relatedCars.length > 0 && (
            <section className="mt-16">
              <h3 className="text-lg font-semibold text-foreground mb-6">Popular Cars You Might Like</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {relatedCars.map((relatedCar, index) => (
                  <Link
                    key={relatedCar.id}
                    to={`/car/${relatedCar.id}`}
                    className="group bg-card rounded-xl overflow-hidden shadow-card card-hover opacity-0 animate-fade-in-up"
                    style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
                  >
                    <div className="aspect-[4/3] overflow-hidden">
                      <img src={relatedCar.main_image || '/placeholder.svg'} alt={`${relatedCar.brand} ${relatedCar.model}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">{relatedCar.brand} {relatedCar.model}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{relatedCar.category.charAt(0).toUpperCase() + relatedCar.category.slice(1)} • {relatedCar.transmission.charAt(0).toUpperCase() + relatedCar.transmission.slice(1)}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-primary font-bold">{formatPrice(relatedCar.price_per_day)}<span className="text-muted-foreground font-normal text-sm">/day</span></span>
                        <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">+</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      <SEO title="Checkout" description="Complete your car rental booking" url="/checkout" noIndex />
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stepper */}
        <nav className="flex items-center gap-2 text-sm mb-8">
          {steps.map((step, index) => (
            <div key={step.label} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 ${step.active ? 'text-foreground' : 'text-muted-foreground'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                  step.completed ? 'bg-primary text-primary-foreground' : 
                  step.active ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                }`}>
                  {step.completed ? <Check className="w-3.5 h-3.5" /> : index + 1}
                </div>
                <span className={step.active ? 'font-medium' : ''}>{step.label}</span>
              </div>
              {index < steps.length - 1 && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
            </div>
          ))}
        </nav>

        <h1 className="text-3xl font-bold text-foreground mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cart Items */}
            <section className="bg-card rounded-xl p-6 shadow-card animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-foreground">Your Cart ({itemCount})</h2>
                <Link to="/cart" className="text-primary text-sm font-medium hover:underline">View Cart</Link>
              </div>

              <div className="space-y-4">
                {cartItems.map((item) => {
                  const location = locations.find(loc => loc.id === (item.location || 'tbs'));

                  return (
                    <div key={item.id} className="flex gap-4 pb-4 border-b border-border last:border-0 last:pb-0">
                      <div className="w-24 h-20 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.carName || item.tourName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-2xl">🚗</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-xs text-primary font-semibold uppercase">
                              {item.type === 'car' ? 'Car Rental' : 'Tour Package'}
                            </span>
                            <h3 className="font-semibold text-foreground text-sm">
                              {item.carName || item.tourName}
                            </h3>
                            {item.category && (
                              <p className="text-xs text-muted-foreground capitalize">
                                {item.category} • {item.withDriver ? 'With Driver' : 'Self-drive'}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>
                              {format(parseISO(item.startDate), 'MMM d')} {item.pickupTime} - {format(parseISO(item.endDate), 'MMM d')} {item.dropoffTime}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{item.days} Days</span>
                          </div>
                          {location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" />
                              <span>{location.name}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-muted-foreground">
                            {formatPrice(item.pricePerDay)} × {item.days} days
                            {(item.addonsTotal && item.addonsTotal > 0) ? ` + ${formatPrice(item.addonsTotal)} add-ons` : ''}
                          </span>
                          <span className="font-semibold text-foreground">
                            {formatPrice(item.totalPrice)}
                          </span>
                        </div>
                        {/* Show Add-ons */}
                        {((item.childSeats && item.childSeats > 0) || item.campingEquipment) && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {item.childSeats && item.childSeats > 0 && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                                <Baby className="w-3 h-3" />
                                Child Seat ×{item.childSeats}
                              </span>
                            )}
                            {item.campingEquipment && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                                <Tent className="w-3 h-3" />
                                Camping Equipment
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Personal Details */}
            <section className="bg-card rounded-xl p-6 shadow-card animate-fade-in" style={{ animationDelay: '100ms' }}>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-6 h-6 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-medium">1</div>
                <h2 className="font-semibold text-foreground">Personal Details</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">First Name *</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="e.g. John"
                    className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Last Name *</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="e.g. Doe"
                    className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-foreground mb-1">Email Address (Optional)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john.doe@example.com"
                  className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
                <p className="text-xs text-muted-foreground mt-1">Optional - We'll send your booking confirmation here if provided.</p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-foreground mb-1">Phone Number *</label>
                <div className="flex gap-2">
                  <select 
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="w-32 px-3 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  >
                    {countryCodes.map((country) => (
                      <option key={country.code} value={country.dial_code}>
                        {country.flag} {country.dial_code}
                      </option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="555-0123"
                    className="flex-1 px-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
              </div>

            </section>

            {/* Payment Method */}
            <section className="bg-card rounded-xl p-6 shadow-card animate-fade-in" style={{ animationDelay: '200ms' }}>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-6 h-6 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-medium">2</div>
                <h2 className="font-semibold text-foreground">Payment Method</h2>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <Lock className="w-4 h-4 text-success" />
                <span>All transactions are secure and encrypted.</span>
              </div>

              {/* Trust badges */}
              <div className="flex items-center justify-center gap-8 text-xs text-muted-foreground py-4 border-t border-b border-border mb-6">
                <div className="flex flex-col items-center gap-1">
                  <ThumbsUp className="w-5 h-5" />
                  <span>Best Price</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Clock className="w-5 h-5" />
                  <span>24/7 Support</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Shield className="w-5 h-5" />
                  <span>Trusted</span>
                </div>
              </div>

              {/* Terms */}
              <label className="flex items-start gap-3 cursor-pointer group mb-6">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="w-5 h-5 rounded border-border text-primary focus:ring-primary mt-0.5"
                />
                <span className="text-sm text-muted-foreground">
                  I accept the <a href="#" className="text-primary hover:underline">Terms and Conditions</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>. I acknowledge that I will pay the total amount shown.
                </span>
              </label>

              {/* Confirm Booking Button */}
              <button
                onClick={handleConfirmBooking}
                disabled={!canProceedToPayment || isProcessing}
                className={`w-full py-4 rounded-lg font-semibold text-lg transition-all btn-scale flex items-center justify-center gap-2 ${
                  canProceedToPayment && !isProcessing
                    ? 'bg-primary text-primary-foreground hover:bg-coral-hover shadow-button'
                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                }`}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>Confirm Booking • Pay on Spot</>
                )}
              </button>

              {/* Validation messages */}
              {!isPersonalDetailsValid && (
                <p className="text-sm text-destructive text-center mt-2">
                  Please fill in all personal details above
                </p>
              )}
              {isPersonalDetailsValid && !acceptTerms && (
                <p className="text-sm text-muted-foreground text-center mt-2">
                  Please accept the terms and conditions to continue
                </p>
              )}

              <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
                <Lock className="w-4 h-4" />
                <span>Secure SSL Encryption</span>
              </div>
            </section>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Order Summary */}
              <div className="bg-card rounded-xl p-6 shadow-card">
                <h2 className="font-semibold text-foreground mb-4">Order Summary</h2>

                <div className="space-y-3 pb-4 border-b border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
                    <span className="text-foreground">{formatPrice(cartTotal)}</span>
                  </div>
                </div>

                <div className="flex justify-between py-4">
                  <span className="font-semibold text-foreground">Total Price</span>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-foreground">{formatPrice(totalPrice)}</span>
                    <p className="text-xs text-muted-foreground">Final price</p>
                  </div>
                </div>

              </div>

              {/* Payment Schedule */}
              <div className="bg-card rounded-xl p-6 shadow-card">
                <h3 className="font-semibold text-foreground mb-4">Payment Options</h3>
                <p className="text-sm text-muted-foreground mb-4">All payments are made on the spot when you pick up your vehicle</p>

                <div className="space-y-3">
                  <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    paymentSchedule === 'deposit' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                  }`}>
                    <input
                      type="radio"
                      checked={paymentSchedule === 'deposit'}
                      onChange={() => setPaymentSchedule('deposit')}
                      className="w-5 h-5 text-primary focus:ring-primary mt-0.5"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-foreground">Pay 15% in Advance</span>
                        <span className="text-sm font-semibold text-primary">{formatPrice(totalPrice * 0.15)}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Pay {formatPrice(totalPrice * 0.15)} on spot to secure booking, {formatPrice(totalPrice * 0.85)} when picking up car</p>
                    </div>
                  </label>

                  <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    paymentSchedule === 'pickup' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                  }`}>
                    <input
                      type="radio"
                      checked={paymentSchedule === 'pickup'}
                      onChange={() => setPaymentSchedule('pickup')}
                      className="w-5 h-5 text-primary focus:ring-primary mt-0.5"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-foreground">Pay All at Pickup</span>
                        <span className="text-sm font-semibold text-muted-foreground">{CURRENCY_SYMBOL}0 now</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Pay full amount ({formatPrice(totalPrice)}) on spot when you pick up the car</p>
                    </div>
                  </label>
                </div>

                {/* Payment Summary */}
                <div className="mt-4 pt-4 border-t border-border space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Due now</span>
                    <span className="font-medium text-foreground">{formatPrice(paymentAmounts.deposit)}</span>
                  </div>
                  {paymentAmounts.remaining > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Due at pickup</span>
                      <span className="font-medium text-foreground">{formatPrice(paymentAmounts.remaining)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Trust Badges */}
              <div className="bg-card rounded-xl p-4 shadow-card">
                <p className="text-center text-sm text-muted-foreground mb-3">Book with confidence</p>
                <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
                  <div className="flex flex-col items-center gap-1">
                    <ThumbsUp className="w-4 h-4" />
                    <span>Best Price</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>24/7 Support</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <Shield className="w-4 h-4" />
                    <span>Trusted</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;
