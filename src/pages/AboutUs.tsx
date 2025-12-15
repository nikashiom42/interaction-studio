import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { Car, Users, Award, MapPin } from 'lucide-react';

const stats = [
  { label: 'Cars in Fleet', value: '150+', icon: Car },
  { label: 'Happy Customers', value: '10,000+', icon: Users },
  { label: 'Years of Experience', value: '8+', icon: Award },
  { label: 'Pickup Locations', value: '12', icon: MapPin },
];

const team = [
  {
    name: 'Giorgi Kapanadze',
    role: 'Founder & CEO',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face',
  },
  {
    name: 'Nino Beridze',
    role: 'Operations Manager',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop&crop=face',
  },
  {
    name: 'Davit Lomidze',
    role: 'Fleet Manager',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face',
  },
];

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="About Us"
        description="Learn about Rentals Georgia - your trusted car rental partner since 2017. 150+ cars, 10,000+ happy customers, 24/7 support."
        url="/about"
      />
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-br from-primary/10 to-secondary">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              About Rentals Georgia
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Your trusted partner for exploring the beauty of Georgia. We've been helping travelers discover 
              the Caucasus region since 2016 with reliable vehicles and exceptional service.
            </p>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <stat.icon className="w-8 h-8 text-primary" />
                  </div>
                  <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Our Story */}
        <section className="py-16 bg-secondary/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-6">Our Story</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    Founded in 2016 in the heart of Tbilisi, Rentals Georgia started with a simple mission: 
                    to make exploring Georgia accessible and enjoyable for everyone.
                  </p>
                  <p>
                    What began as a small fleet of 5 cars has grown into one of Georgia's most trusted 
                    car rental services, serving thousands of travelers from around the world each year.
                  </p>
                  <p>
                    We understand that every journey is unique. Whether you're navigating the winding roads 
                    of Kazbegi, exploring the Black Sea coast in Batumi, or discovering the ancient wine 
                    regions of Kakheti, we have the perfect vehicle for your adventure.
                  </p>
                </div>
              </div>
              <div className="relative h-80 md:h-96 rounded-2xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1565008447742-97f6f38c985c?w=800&h=600&fit=crop"
                  alt="Georgian landscape with mountains"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-16 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-foreground mb-10 text-center">Why Choose Us</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-secondary/50 rounded-2xl p-8">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <Car className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Quality Fleet</h3>
                <p className="text-muted-foreground">
                  Well-maintained vehicles from economy to luxury, all equipped for Georgian roads 
                  including mountain terrain.
                </p>
              </div>
              <div className="bg-secondary/50 rounded-2xl p-8">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <Award className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Best Prices</h3>
                <p className="text-muted-foreground">
                  Competitive rates with no hidden fees. What you see is what you pay, including 
                  basic insurance and unlimited mileage.
                </p>
              </div>
              <div className="bg-secondary/50 rounded-2xl p-8">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">24/7 Support</h3>
                <p className="text-muted-foreground">
                  Our team is available around the clock for roadside assistance, questions, 
                  or last-minute changes to your booking.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16 bg-secondary/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-foreground mb-10 text-center">Meet Our Team</h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {team.map((member) => (
                <div key={member.name} className="text-center">
                  <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-4 ring-4 ring-primary/20">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{member.name}</h3>
                  <p className="text-muted-foreground">{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default AboutUs;
