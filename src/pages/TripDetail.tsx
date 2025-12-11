import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, MapPin, Calendar, Users, Car, Star, Check, ChevronRight } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import tripPacific from '@/assets/trip-pacific.jpg';
import tripRocky from '@/assets/trip-rocky.jpg';
import tripDesert from '@/assets/trip-desert.jpg';

const tripsData = [
  {
    id: '1',
    image: tripPacific,
    title: 'Pacific Coast Highway',
    days: 5,
    miles: 655,
    description: 'Experience the breathtaking views of the California coastline in a convertible.',
    fullDescription: 'Embark on the ultimate road trip along California\'s iconic Pacific Coast Highway. This 5-day journey takes you through stunning coastal cliffs, charming beach towns, and world-renowned landmarks. Drive a premium convertible as you wind along one of the most scenic routes in the world.',
    price: 499,
    badge: 'Bestseller',
    rating: 4.9,
    reviews: 128,
    startLocation: 'San Francisco, CA',
    endLocation: 'Los Angeles, CA',
    highlights: [
      'Big Sur coastal views',
      'Bixby Creek Bridge photo stop',
      'Carmel-by-the-Sea exploration',
      'Santa Barbara wine country',
      '17-Mile Drive through Pebble Beach'
    ],
    included: [
      'Premium convertible rental',
      'Curated route with GPS',
      'Hotel recommendations',
      '24/7 roadside assistance',
      'Fuel card ($200 value)'
    ],
    itinerary: [
      { day: 1, title: 'San Francisco to Monterey', description: 'Pick up your convertible and head south along the coast to Monterey.' },
      { day: 2, title: 'Monterey to Big Sur', description: 'Drive the iconic stretch of Highway 1 through Big Sur.' },
      { day: 3, title: 'Big Sur to San Simeon', description: 'Visit Hearst Castle and enjoy elephant seal viewing.' },
      { day: 4, title: 'San Simeon to Santa Barbara', description: 'Continue south through wine country.' },
      { day: 5, title: 'Santa Barbara to Los Angeles', description: 'Final leg through Malibu to LA.' }
    ]
  },
  {
    id: '2',
    image: tripRocky,
    title: 'Rocky Mountain Escape',
    days: 3,
    miles: 420,
    description: 'Drive through the majestic peaks and serene lakes of the Rockies.',
    fullDescription: 'Discover the majesty of the Rocky Mountains on this 3-day adventure. Navigate winding mountain roads, pristine alpine lakes, and breathtaking summit views. This trip offers the perfect blend of adventure and tranquility in one of America\'s most iconic landscapes.',
    price: 350,
    rating: 4.8,
    reviews: 89,
    startLocation: 'Denver, CO',
    endLocation: 'Denver, CO',
    highlights: [
      'Trail Ridge Road',
      'Rocky Mountain National Park',
      'Estes Park town visit',
      'Bear Lake scenic area',
      'Continental Divide crossing'
    ],
    included: [
      'SUV or Jeep rental',
      'National Park pass',
      'Curated mountain route',
      '24/7 roadside assistance',
      'Picnic essentials kit'
    ],
    itinerary: [
      { day: 1, title: 'Denver to Estes Park', description: 'Pick up your vehicle and head into the mountains.' },
      { day: 2, title: 'Rocky Mountain National Park', description: 'Full day exploring Trail Ridge Road and alpine lakes.' },
      { day: 3, title: 'Return to Denver', description: 'Scenic return route through Boulder.' }
    ]
  },
  {
    id: '3',
    image: tripDesert,
    title: 'Desert Safari Route',
    days: 2,
    miles: 280,
    description: 'An off-road adventure through canyons and dunes in a 4x4.',
    fullDescription: 'Experience the raw beauty of the American Southwest on this 2-day desert adventure. Navigate red rock canyons, vast dune fields, and ancient landscapes in a rugged 4x4. This trip is perfect for those seeking adventure off the beaten path.',
    price: 280,
    rating: 4.7,
    reviews: 56,
    startLocation: 'Phoenix, AZ',
    endLocation: 'Phoenix, AZ',
    highlights: [
      'Sonoran Desert exploration',
      'Red rock canyon drives',
      'Desert sunset photography',
      'Stargazing experience',
      'Off-road trail navigation'
    ],
    included: [
      '4x4 Jeep Wrangler rental',
      'Off-road trail maps',
      'Camping gear (optional)',
      '24/7 roadside assistance',
      'Cooler with refreshments'
    ],
    itinerary: [
      { day: 1, title: 'Phoenix to Desert Camp', description: 'Pick up your 4x4 and head into the Sonoran Desert.' },
      { day: 2, title: 'Canyon Exploration & Return', description: 'Morning canyon drive before returning to Phoenix.' }
    ]
  }
];

const TripDetail = () => {
  const { id } = useParams();
  const trip = tripsData.find(t => t.id === id);

  if (!trip) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Trip not found</h1>
          <Link to="/" className="text-primary hover:underline">Return to home</Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to trips</span>
        </Link>

        {/* Hero Image */}
        <div className="relative rounded-2xl overflow-hidden mb-8 aspect-[21/9]">
          <img 
            src={trip.image} 
            alt={trip.title}
            className="w-full h-full object-cover"
          />
          {trip.badge && (
            <div className="absolute top-4 left-4 px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg uppercase tracking-wide">
              {trip.badge}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title & Quick Info */}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{trip.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <Clock className="w-5 h-5" />
                  <span>{trip.days} Days</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-5 h-5" />
                  <span>{trip.miles} miles</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <span className="text-foreground font-medium">{trip.rating}</span>
                  <span>({trip.reviews} reviews)</span>
                </div>
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed">{trip.fullDescription}</p>
            </div>

            {/* Route Info */}
            <div className="bg-secondary/50 rounded-xl p-6">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Car className="w-5 h-5 text-primary" />
                Route Details
              </h3>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Start</p>
                  <p className="font-medium text-foreground">{trip.startLocation}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">End</p>
                  <p className="font-medium text-foreground">{trip.endLocation}</p>
                </div>
              </div>
            </div>

            {/* Highlights */}
            <div>
              <h3 className="font-semibold text-foreground mb-4">Trip Highlights</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {trip.highlights.map((highlight, index) => (
                  <div key={index} className="flex items-center gap-3 bg-card p-3 rounded-lg">
                    <Check className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-foreground">{highlight}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Itinerary */}
            <div>
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Day-by-Day Itinerary
              </h3>
              <div className="space-y-4">
                {trip.itinerary.map((day, index) => (
                  <div 
                    key={index}
                    className="relative pl-8 pb-4 border-l-2 border-primary/30 last:border-transparent last:pb-0"
                  >
                    <div className="absolute left-0 top-0 w-4 h-4 -translate-x-1/2 rounded-full bg-primary" />
                    <div className="bg-card rounded-lg p-4 shadow-sm">
                      <p className="text-sm text-primary font-medium mb-1">Day {day.day}</p>
                      <h4 className="font-semibold text-foreground mb-2">{day.title}</h4>
                      <p className="text-muted-foreground text-sm">{day.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-card rounded-xl p-6 shadow-card border border-border">
              <div className="mb-6">
                <p className="text-muted-foreground text-sm">Starting from</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-primary">${trip.price}</span>
                  <span className="text-muted-foreground">/person</span>
                </div>
              </div>

              {/* What's Included */}
              <div className="mb-6">
                <h4 className="font-semibold text-foreground mb-3">What's Included</h4>
                <ul className="space-y-2">
                  {trip.included.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Group Size */}
              <div className="flex items-center gap-3 mb-6 p-3 bg-secondary/50 rounded-lg">
                <Users className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">Group Size</p>
                  <p className="text-xs text-muted-foreground">1-4 travelers per vehicle</p>
                </div>
              </div>

              <Link to={`/checkout?trip=${trip.id}&total=${trip.price}`}>
                <Button className="w-full h-14 text-lg font-semibold">
                  Book This Trip
                </Button>
              </Link>

              <p className="text-center text-xs text-muted-foreground mt-4">
                Free cancellation up to 48 hours before
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TripDetail;
