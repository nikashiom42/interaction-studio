import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ChevronRight, Calendar, MapPin, Clock, Edit2, Trash2, Check, 
  Lock, ThumbsUp, Shield, CreditCard, ChevronDown, Plane
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import carRangeRover from '@/assets/car-range-rover.jpg';
import carTesla from '@/assets/car-tesla.jpg';
import carMercedes from '@/assets/car-mercedes.jpg';
import carCorvette from '@/assets/car-corvette.jpg';

const recentCars = [
  { id: 1, name: 'Tesla Model 3', type: 'Electric • Automatic', price: 85, image: carTesla },
  { id: 2, name: 'VW Golf', type: 'Compact • Manual', price: 45, image: carMercedes },
  { id: 3, name: 'Ford Mustang', type: 'Convertible • Automatic', price: 95, image: carCorvette },
];

const Checkout = () => {
  const navigate = useNavigate();
  const [paymentSchedule, setPaymentSchedule] = useState<'full' | 'deposit'>('full');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [createAccount, setCreateAccount] = useState(false);
  const [cartEmpty, setCartEmpty] = useState(false);

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [country, setCountry] = useState('United States');
  const [expiryDate, setExpiryDate] = useState('');
  const [flightNumber, setFlightNumber] = useState('');

  const rentalPrice = 540;
  const taxesFees = 35;
  const serviceCharge = 15;
  const earlyBirdDiscount = 0;
  const totalPrice = rentalPrice + taxesFees + serviceCharge - earlyBirdDiscount;

  const handleComplete = () => {
    navigate('/booking-success');
  };

  const steps = [
    { label: 'Cart', active: true, completed: true },
    { label: 'Checkout', active: true, completed: false },
    { label: 'Confirmation', active: false, completed: false },
  ];

  if (cartEmpty) {
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
              {recentCars.map((car, index) => (
                <Link
                  key={car.id}
                  to={`/car/${car.id}`}
                  className="group bg-card rounded-xl overflow-hidden shadow-card card-hover opacity-0 animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <img src={car.image} alt={car.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">{car.name}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{car.type}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-primary font-bold">${car.price}<span className="text-muted-foreground font-normal text-sm">/day</span></span>
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
                <button className="text-primary text-sm font-medium hover:underline">Edit Cart</button>
              </div>

              <div className="flex gap-4">
                <img src={carRangeRover} alt="Toyota Land Cruiser" className="w-32 h-24 object-cover rounded-lg" />
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs text-primary font-semibold uppercase">Car Rental</span>
                      <h3 className="font-semibold text-foreground">Toyota Land Cruiser 2023</h3>
                      <p className="text-sm text-muted-foreground">Premium Premium SUV</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="text-primary text-sm flex items-center gap-1 hover:underline">
                        <Edit2 className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button className="text-muted-foreground text-sm flex items-center gap-1 hover:text-destructive transition-colors">
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Thu, Oct 12 - Sun, Oct 15</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>3 Days</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>Los Angeles Intl. Airport (LAX)</span>
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
                  <select className="px-3 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                    <option>US +1</option>
                    <option>UK +44</option>
                    <option>JP +81</option>
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

              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={createAccount}
                  onChange={(e) => setCreateAccount(e.target.checked)}
                  className="w-5 h-5 rounded border-border text-primary focus:ring-primary mt-0.5"
                />
                <div>
                  <span className="font-medium text-foreground group-hover:text-primary transition-colors">Create an account for faster booking</span>
                  <p className="text-sm text-muted-foreground">Save your details for future rentals and get access to exclusive deals.</p>
                </div>
              </label>
            </section>

            {/* Driver's Information */}
            <section className="bg-card rounded-xl p-6 shadow-card animate-fade-in" style={{ animationDelay: '200ms' }}>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-6 h-6 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-medium">2</div>
                <h2 className="font-semibold text-foreground">Driver's Information</h2>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-foreground mb-1">Driver's License Number *</label>
                <input
                  type="text"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Country of Issue *</label>
                  <div className="relative">
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option>United States</option>
                      <option>United Kingdom</option>
                      <option>Japan</option>
                      <option>Germany</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Expiry Date *</label>
                  <input
                    type="text"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    placeholder="mm/dd/yyyy"
                    className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Flight Number (Optional)</label>
                <div className="relative">
                  <Plane className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={flightNumber}
                    onChange={(e) => setFlightNumber(e.target.value)}
                    placeholder="e.g. UA123"
                    className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">Helps the rental counter track delays.</p>
              </div>
            </section>

            {/* Payment Method */}
            <section className="bg-card rounded-xl p-6 shadow-card animate-fade-in" style={{ animationDelay: '300ms' }}>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-6 h-6 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-medium">3</div>
                <h2 className="font-semibold text-foreground">Payment Method</h2>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-primary" />
                <span className="font-medium text-primary">PayPal</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <Lock className="w-4 h-4 text-success" />
                <span>All transactions are secure and encrypted.</span>
                <div className="flex gap-1 ml-auto">
                  <div className="w-8 h-5 bg-muted rounded" />
                  <div className="w-8 h-5 bg-muted rounded" />
                  <div className="w-8 h-5 bg-muted rounded" />
                </div>
              </div>

              <div className="bg-[#0070BA] rounded-lg p-4 text-center mb-4">
                <span className="text-white font-bold text-xl">PayPal</span>
              </div>

              {/* Trust badges */}
              <div className="flex items-center justify-center gap-6 py-4 border-t border-b border-border my-4 text-sm text-muted-foreground">
                <span className="text-center">Book with confidence.</span>
              </div>
              <div className="flex items-center justify-center gap-8 text-xs text-muted-foreground">
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
              <label className="flex items-start gap-3 cursor-pointer group mt-6">
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

              {/* Submit */}
              <button
                onClick={handleComplete}
                disabled={!acceptTerms}
                className={`w-full mt-6 py-4 rounded-lg font-semibold text-lg transition-all btn-scale ${
                  acceptTerms
                    ? 'bg-primary text-primary-foreground hover:bg-coral-hover shadow-button'
                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                }`}
              >
                Complete Booking • Pay ${totalPrice.toFixed(2)}
              </button>

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
                    <span className="text-muted-foreground">Car Rental (3 days)</span>
                    <span className="text-foreground">${rentalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Taxes & Fees</span>
                    <span className="text-foreground">${taxesFees.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Service Charge</span>
                    <span className="text-foreground">${serviceCharge.toFixed(2)}</span>
                  </div>
                  {earlyBirdDiscount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-success">Early Bird Discount</span>
                      <span className="text-success">-${earlyBirdDiscount.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between py-4">
                  <span className="font-semibold text-foreground">Total Price</span>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-foreground">${totalPrice.toFixed(2)}</span>
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
                <h3 className="font-semibold text-foreground mb-4">Payment Schedule</h3>
                
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
                    <div>
                      <span className="font-medium text-foreground">Pay Full Amount</span>
                      <p className="text-sm text-muted-foreground">Pay ${totalPrice.toFixed(2)} now</p>
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
                    <div>
                      <span className="font-medium text-foreground">Pay Deposit Only</span>
                      <p className="text-sm text-muted-foreground">Pay ${(totalPrice * 0.2).toFixed(2)} (20%) now, rest at pickup</p>
                    </div>
                  </label>
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
