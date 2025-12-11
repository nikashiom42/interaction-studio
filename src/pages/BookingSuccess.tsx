import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Copy, Calendar, MapPin, Download, Mail, Smartphone, Key, ArrowRight } from 'lucide-react';
import Header from '@/components/Header';
import carTesla from '@/assets/car-tesla.jpg';

const BookingSuccess = () => {
  const [copied, setCopied] = useState(false);

  const referenceNumber = 'GYG-88429';

  const handleCopy = () => {
    navigator.clipboard.writeText(referenceNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const nextSteps = [
    {
      icon: Mail,
      title: 'Check your email',
      description: "We've sent your voucher and receipt. Keep them handy.",
      color: 'bg-primary/10 text-primary',
    },
    {
      icon: Smartphone,
      title: 'Download the app',
      description: 'Manage your booking on the go and access offline maps.',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      icon: Key,
      title: 'Pick up your car',
      description: "Head to the counter at your designated time. Don't forget your driver's license.",
      color: 'bg-gray-100 text-gray-600',
    },
  ];

  return (
    <div className="min-h-screen bg-secondary/30">
      <Header />
      
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Icon */}
        <div className="text-center mb-8 animate-scale-in">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-success/10 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-success flex items-center justify-center animate-pulse-subtle">
              <Check className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Booking Confirmed!</h1>
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <span>Reference:</span>
            <span className="font-mono font-semibold text-foreground">#{referenceNumber}</span>
            <button
              onClick={handleCopy}
              className="p-1 hover:bg-secondary rounded transition-colors"
              title="Copy reference number"
            >
              {copied ? (
                <Check className="w-4 h-4 text-success" />
              ) : (
                <Copy className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          </div>
        </div>

        {/* Booking Details Card */}
        <div className="bg-card rounded-xl shadow-card overflow-hidden mb-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          {/* Premium Badge */}
          <div className="bg-primary/10 px-6 py-3 flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center">
              <span className="text-primary text-xs">★</span>
            </div>
            <span className="text-primary font-semibold text-sm uppercase tracking-wide">Premium Rental</span>
          </div>

          {/* Car Details */}
          <div className="p-6">
            <div className="flex gap-6">
              <div className="w-40 h-28 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                <img src={carTesla} alt="Tesla Model 3" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-foreground mb-1">Tesla Model 3</h2>
                <p className="text-sm text-muted-foreground mb-4">Or similar • Electric • Automatic</p>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">Oct 24, 10:00 AM</p>
                      <p className="text-muted-foreground">Pickup</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">Oct 27, 10:00 AM</p>
                      <p className="text-muted-foreground">Dropoff</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2 mt-4 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Los Angeles Intl Airport (LAX)</p>
                    <p className="text-muted-foreground">Terminal 4, Hertz Counter</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Total */}
            <div className="flex items-center justify-between pt-6 mt-6 border-t border-border">
              <span className="text-muted-foreground">Total Paid</span>
              <span className="text-2xl font-bold text-foreground">$245.00</span>
            </div>
          </div>
        </div>

        {/* Confirmation Email */}
        <p className="text-center text-muted-foreground mb-6 animate-fade-in" style={{ animationDelay: '200ms' }}>
          Confirmation sent to <span className="font-medium text-foreground">alex.user@example.com</span>
        </p>

        {/* Download Button */}
        <div className="text-center mb-10 animate-fade-in" style={{ animationDelay: '250ms' }}>
          <button className="inline-flex items-center gap-2 px-6 py-3 border border-primary text-primary rounded-lg font-medium hover:bg-primary/5 transition-colors btn-scale">
            <Download className="w-5 h-5" />
            Download Confirmation PDF
          </button>
        </div>

        {/* What's Next */}
        <div className="bg-card rounded-xl p-6 shadow-card mb-10 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <h3 className="text-lg font-bold text-foreground mb-6">What's next?</h3>
          
          <div className="space-y-0">
            {nextSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-lg ${step.color} flex items-center justify-center`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    {index < nextSteps.length - 1 && (
                      <div className="w-0.5 h-12 bg-border my-2" />
                    )}
                  </div>
                  <div className="pb-6">
                    <h4 className="font-medium text-foreground">{step.title}</h4>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 animate-fade-in" style={{ animationDelay: '400ms' }}>
          <Link
            to="/bookings"
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-primary text-primary-foreground rounded-lg font-semibold btn-scale hover:bg-coral-hover transition-colors shadow-button"
          >
            View My Bookings
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            to="/cars"
            className="flex-1 flex items-center justify-center px-6 py-4 border border-border rounded-lg font-semibold text-foreground hover:border-foreground hover:bg-secondary transition-colors btn-scale"
          >
            Book Another Car
          </Link>
        </div>

        {/* Help Link */}
        <p className="text-center text-sm text-muted-foreground mt-8 animate-fade-in" style={{ animationDelay: '500ms' }}>
          Need help? <a href="#" className="text-primary hover:underline">Contact Support</a>
        </p>
      </main>
    </div>
  );
};

export default BookingSuccess;
