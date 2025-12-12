import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  ChevronRight, Calendar, MapPin, Clock, Edit2, Trash2, Check, 
  Lock, ThumbsUp, Shield, ChevronDown, Loader2
} from 'lucide-react';
import PayPalButton from '@/components/PayPalButton';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { format, parseISO, differenceInDays } from 'date-fns';
import { countryCodes } from '@/data/countryCodes';
import { formatPrice, CURRENCY_SYMBOL } from '@/lib/currency';
import carRangeRover from '@/assets/car-range-rover.jpg';
import carTesla from '@/assets/car-tesla.jpg';
import carMercedes from '@/assets/car-mercedes.jpg';
import carCorvette from '@/assets/car-corvette.jpg';

const recentCars = [
  { id: 1, name: 'Tesla Model 3', type: 'Electric • Automatic', price: 85, image: carTesla },
  { id: 2, name: 'VW Golf', type: 'Compact • Manual', price: 45, image: carMercedes },
  { id: 3, name: 'Ford Mustang', type: 'Convertible • Automatic', price: 95, image: carCorvette },
];

type PaymentOption = 'full' | 'deposit' | 'pickup';

const Checkout = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  
  const carId = searchParams.get('carId');
  const tourId = searchParams.get('tourId');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const withDriver = searchParams.get('withDriver') === 'true';
  
  const [paymentSchedule, setPaymentSchedule] = useState<PaymentOption>('full');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paypalTransactionId, setPaypalTransactionId] = useState<string | null>(null);

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+995');

  // Fetch car details if carId is provided
  const { data: car, isLoading: carLoading } = useQuery({
    queryKey: ['checkout-car', carId],
    queryFn: async () => {
      if (!carId) return null;
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .eq('id', carId)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!carId,
  });

  // Calculate prices
  const rentalDays = startDate && endDate 
    ? differenceInDays(parseISO(endDate), parseISO(startDate)) + 1 
    : 3;
  
  const dailyRate = car 
    ? (withDriver && car.price_with_driver ? Number(car.price_with_driver) : Number(car.price_per_day))
    : 180;
  
  const rentalPrice = dailyRate * rentalDays;
  const taxesFees = Math.round(rentalPrice * 0.06);
  const serviceCharge = 15;
  const totalPrice = rentalPrice + taxesFees + serviceCharge;

  // Calculate payment amounts based on option
  const getPaymentAmounts = () => {
    switch (paymentSchedule) {
      case 'full':
        return { deposit: totalPrice, remaining: 0 };
      case 'deposit':
        return { deposit: totalPrice * 0.2, remaining: totalPrice * 0.8 };
      case 'pickup':
        return { deposit: 0, remaining: totalPrice };
      default:
        return { deposit: totalPrice, remaining: 0 };
    }
  };

  const paymentAmounts = getPaymentAmounts();
  const canComplete = !!user && !!firstName.trim() && !!lastName.trim() && !!(email.trim() || user?.email) && !!phone.trim() && acceptTerms && !isProcessing;

  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: async (transactionId?: string) => {
      // Determine payment status based on payment option and whether payment was made
      let paymentStatus = 'pending';
      if (paymentSchedule === 'pickup') {
        paymentStatus = 'pending'; // Will pay at pickup
      } else if (paymentSchedule === 'deposit') {
        paymentStatus = 'partially_paid'; // 20% paid
      } else if (paymentSchedule === 'full') {
        paymentStatus = 'paid'; // Full amount paid
      }
      
      const bookingStatus = transactionId ? 'confirmed' : 'pending';

      const bookingData = {
        car_id: carId || null,
        tour_id: tourId || null,
        booking_type: tourId ? 'tour' : 'car',
        user_id: user!.id,
        start_date: startDate || format(new Date(), 'yyyy-MM-dd'),
        end_date: endDate || format(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
        with_driver: withDriver,
        total_price: totalPrice,
        status: bookingStatus,
        customer_name: `${firstName} ${lastName}`.trim(),
        customer_email: email || user?.email,
        customer_phone: `${countryCode} ${phone}`.trim(),
        payment_option: paymentSchedule,
        payment_status: paymentStatus,
        deposit_amount: paymentAmounts.deposit,
        remaining_balance: paymentAmounts.remaining,
        payment_transaction_id: transactionId || null,
        payment_date: transactionId ? new Date().toISOString() : null,
        notes: tourId ? 'Tour booking' : (withDriver ? 'Booking - With driver' : 'Booking - Self-drive'),
      };

      const { data, error } = await supabase
        .from('bookings')
        .insert(bookingData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast({ title: 'Booking confirmed successfully!' });
      navigate(`/booking-success?bookingId=${data.id}`);
    },
    onError: (error) => {
      toast({ 
        title: 'Error creating booking', 
        description: error.message,
        variant: 'destructive' 
      });
      setIsProcessing(false);
    },
  });

  const handlePayPalSuccess = (details: unknown) => {
    setIsProcessing(true);
    const transactionId = typeof details === 'object' && details !== null && 'id' in details
      ? String((details as { id: unknown }).id)
      : undefined;
    setPaypalTransactionId(transactionId);
    createBookingMutation.mutate(transactionId);
  };

  const handlePayPalError = (error: unknown) => {
    toast({ 
      title: 'Payment failed', 
      description: 'Please try again or use a different payment method.',
      variant: 'destructive' 
    });
    setIsProcessing(false);
  };

  const handlePayAtPickup = () => {
    if (!acceptTerms) {
      toast({ 
        title: 'Please accept terms', 
        description: 'You must accept the terms and conditions to continue.',
        variant: 'destructive' 
      });
      return;
    }
    setIsProcessing(true);
    createBookingMutation.mutate(undefined);
  };

  // Validation for personal details
  const isPersonalDetailsValid = firstName.trim() !== '' && 
    lastName.trim() !== '' && 
    (email.trim() !== '' || !!user?.email) && 
    phone.trim() !== '';

  const canProceedToPayment = canComplete;

  const steps = [
    { label: 'Cart', active: true, completed: true },
    { label: 'Checkout', active: true, completed: false },
    { label: 'Confirmation', active: false, completed: false },
  ];

  const cartEmpty = !carId && !tourId && !car;

  if (cartEmpty && !carLoading) {
    return (
      <div className="min-h-screen bg-background">
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

          {/* Recent Search */}
          <section className="mt-16">
            <h3 className="text-lg font-semibold text-foreground mb-6">Based on your recent search</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {recentCars.map((recentCar, index) => (
                <Link
                  key={recentCar.id}
                  to={`/car/${recentCar.id}`}
                  className="group bg-card rounded-xl overflow-hidden shadow-card card-hover opacity-0 animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <img src={recentCar.image} alt={recentCar.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">{recentCar.name}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{recentCar.type}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-primary font-bold">{formatPrice(recentCar.price)}<span className="text-muted-foreground font-normal text-sm">/day</span></span>
                      <button className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">+</button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/30">
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
            {/* Cart Item */}
            <section className="bg-card rounded-xl p-6 shadow-card animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-foreground">Your Cart (1)</h2>
                <Link to="/cars" className="text-primary text-sm font-medium hover:underline">Edit Cart</Link>
              </div>

              <div className="flex gap-4">
                <img 
                  src={car?.main_image || carRangeRover} 
                  alt={car ? `${car.brand} ${car.model}` : "Car"} 
                  className="w-32 h-24 object-cover rounded-lg" 
                />
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs text-primary font-semibold uppercase">Car Rental</span>
                      <h3 className="font-semibold text-foreground">
                        {car ? `${car.brand} ${car.model}` : 'Toyota Land Cruiser 2023'}
                      </h3>
                      <p className="text-sm text-muted-foreground capitalize">
                        {car?.category || 'Premium'} • {withDriver ? 'With Driver' : 'Self-drive'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Link to={`/car/${carId}`} className="text-primary text-sm flex items-center gap-1 hover:underline">
                        <Edit2 className="w-3.5 h-3.5" /> Edit
                      </Link>
                      <button className="text-muted-foreground text-sm flex items-center gap-1 hover:text-destructive transition-colors">
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {startDate && endDate 
                          ? `${format(parseISO(startDate), 'MMM d')} - ${format(parseISO(endDate), 'MMM d, yyyy')}`
                          : 'Thu, Oct 12 - Sun, Oct 15'
                        }
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{rentalDays} Days</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>Tbilisi Intl. Airport (TBS)</span>
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-sm text-success">
                    <Check className="w-4 h-4" />
                    <span>Free cancellation until 48h before pickup</span>
                  </div>
                </div>
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
                <label className="block text-sm font-medium text-foreground mb-1">Email Address *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john.doe@example.com"
                  className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
                <p className="text-xs text-muted-foreground mt-1">We'll send your booking confirmation here.</p>
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
              {!user && (
                <p className="text-sm text-muted-foreground mt-4">
                  Please <Link to="/auth" className="text-primary hover:underline">sign in</Link> to complete your booking.
                </p>
              )}

              {/* PayPal or Pay at Pickup */}
              {paymentSchedule === 'pickup' ? (
                <button
                  onClick={handlePayAtPickup}
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
                    <>Confirm Booking • Pay at Pickup</>
                  )}
                </button>
              ) : (
                <div className={`${!canProceedToPayment ? 'opacity-50 pointer-events-none' : ''}`}>
                  {isProcessing ? (
                    <div className="flex items-center justify-center gap-2 py-4">
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                      <span className="text-muted-foreground">Processing payment...</span>
                    </div>
                  ) : (
                    <PayPalButton
                      amount={paymentAmounts.deposit.toFixed(2)}
                      currency="USD"
                      onSuccess={handlePayPalSuccess}
                      onError={handlePayPalError}
                      onCancel={() => toast({ title: 'Payment cancelled' })}
                    />
                  )}
                </div>
              )}

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
                    <span className="text-muted-foreground">Car Rental ({rentalDays} days × {formatPrice(dailyRate)})</span>
                    <span className="text-foreground">{formatPrice(rentalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Taxes & Fees (6%)</span>
                    <span className="text-foreground">{formatPrice(taxesFees)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Service Charge</span>
                    <span className="text-foreground">{formatPrice(serviceCharge)}</span>
                  </div>
                </div>

                <div className="flex justify-between py-4">
                  <span className="font-semibold text-foreground">Total Price</span>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-foreground">{formatPrice(totalPrice)}</span>
                    <p className="text-xs text-muted-foreground">Includes all taxes</p>
                  </div>
                </div>

                <button className="flex items-center justify-between w-full text-primary text-sm font-medium hover:underline">
                  <span>Enter promo code</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              {/* Payment Schedule */}
              <div className="bg-card rounded-xl p-6 shadow-card">
                <h3 className="font-semibold text-foreground mb-4">Payment Options</h3>
                
                <div className="space-y-3">
                  <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    paymentSchedule === 'full' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                  }`}>
                    <input
                      type="radio"
                      checked={paymentSchedule === 'full'}
                      onChange={() => setPaymentSchedule('full')}
                      className="w-5 h-5 text-primary focus:ring-primary mt-0.5"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-foreground">Pay Full Amount</span>
                        <span className="text-sm font-semibold text-primary">{formatPrice(totalPrice)}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Pay the total amount now</p>
                    </div>
                  </label>

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
                        <span className="font-medium text-foreground">Pay 20% Deposit</span>
                        <span className="text-sm font-semibold text-primary">{formatPrice(totalPrice * 0.2)}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Pay {formatPrice(totalPrice * 0.2)} now, {formatPrice(totalPrice * 0.8)} at pickup</p>
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
                        <span className="font-medium text-foreground">Pay at Pickup</span>
                        <span className="text-sm font-semibold text-muted-foreground">{CURRENCY_SYMBOL}0 now</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Pay full amount ({formatPrice(totalPrice)}) when you pickup the car</p>
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
