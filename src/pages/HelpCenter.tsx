import { Link } from 'react-router-dom';
import { ChevronRight, Phone, Mail, CalendarCheck, Truck, Shield, Car, Headphones } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';

const topics = [
  {
    icon: CalendarCheck,
    title: 'Booking and Reservations',
    items: [
      'How to book a car online',
      'How to modify or cancel your reservation',
      'Payment and confirmation details',
    ],
  },
  {
    icon: Truck,
    title: 'Pickup and Delivery',
    items: [
      'Car pickup in Tbilisi and airport locations',
      'Delivery options across Georgia',
      'What to expect at pickup',
    ],
  },
  {
    icon: Shield,
    title: 'Insurance and Coverage',
    items: [
      'What is included in your rental insurance',
      'What is not covered',
      'What to do in case of damage',
    ],
  },
  {
    icon: Car,
    title: 'Driving in Georgia',
    items: [
      'Driving rules and requirements',
      'Road conditions and tips',
      'Recommended routes and destinations',
    ],
  },
  {
    icon: Headphones,
    title: 'During Your Rental',
    items: [
      'What to do if you need help during your trip',
      'Extending your rental period',
      'Emergency assistance',
    ],
  },
];

const HelpCenter = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Help Center – Car Rental Support in Georgia | Pegarent"
        description="Need help with your car rental in Georgia? Find answers about booking, pickup, insurance, driving tips and more. Contact our support team anytime."
        url="/help-center"
      />
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-medium">Help Center</span>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Help Center – Car Rental Support in Georgia
        </h1>
        <p className="text-lg text-muted-foreground mb-12">
          Need help with your <Link to="/" className="text-primary hover:underline">car rental in Georgia</Link>? You're in the right place. Whether you're booking a car in Tbilisi, picking up at the airport, or already on your trip, our team is here to assist you.
        </p>

        {/* Quick Help Topics */}
        <h2 className="text-2xl font-bold text-foreground mb-6">Quick Help Topics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {topics.map((topic) => {
            const Icon = topic.icon;
            return (
              <div key={topic.title} className="bg-card rounded-xl p-6 border border-border">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground text-lg">{topic.title}</h3>
                </div>
                <ul className="space-y-2">
                  {topic.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-muted-foreground">
                      <ChevronRight className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Contact Support */}
        <div className="bg-primary/5 rounded-2xl p-8 mb-12 border border-primary/10">
          <h2 className="text-2xl font-bold text-foreground mb-4">Contact Support</h2>
          <p className="text-muted-foreground mb-6">
            Still need help? Our team is available to assist you with any questions about your car rental in Georgia.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="tel:+995558211584"
              className="flex items-center gap-3 px-6 py-3 bg-card rounded-lg border border-border hover:border-primary/30 transition-colors"
            >
              <Phone className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Phone / WhatsApp</p>
                <p className="font-medium text-foreground">+995 558 211 584</p>
              </div>
            </a>
            <Link
              to="/contact"
              className="flex items-center gap-3 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              <Mail className="w-5 h-5" />
              Contact us anytime
            </Link>
          </div>
        </div>

        {/* Fast Support */}
        <div className="text-center">
          <h2 className="text-xl font-bold text-foreground mb-2">Fast and Friendly Support</h2>
          <p className="text-muted-foreground">
            We aim to provide quick, clear, and helpful responses so you can focus on enjoying your trip across Georgia.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default HelpCenter;
