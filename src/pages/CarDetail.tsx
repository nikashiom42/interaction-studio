import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  ChevronRight, ChevronDown, ChevronUp, Star, MapPin, Share2, Users, Settings, 
  Check, Calendar, Fuel, Car, Briefcase, DoorOpen, Wifi, Lock, ThumbsUp, Loader2
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BookingWidget from '@/components/BookingWidget';
import { supabase } from '@/integrations/supabase/client';
import carRangeRover from '@/assets/car-range-rover.jpg';
import carCorvette from '@/assets/car-corvette.jpg';
import carMercedes from '@/assets/car-mercedes.jpg';
import carTesla from '@/assets/car-tesla.jpg';

const defaultImages = [carRangeRover, carCorvette, carMercedes, carTesla];

const staticFaq = [
  { 
    question: 'Driver Requirements', 
    answer: 'Minimum age is 25 years. Driver must hold a full, valid driving license for at least 2 years. International Driving Permit (IDP) required if your license is not in English.' 
  },
  { question: 'Security Deposit', answer: 'A security deposit of $500 is required upon pickup. This will be refunded within 7-14 business days after the return of the vehicle.' },
  { question: 'Mileage Policy', answer: 'Unlimited mileage is included with all rentals. No additional charges for distance traveled.' },
];

const reviewStats = {
  overall: 4.8,
  total: 124,
  breakdown: [
    { label: 'Cleanliness', score: 4.9 },
    { label: 'Comfort', score: 4.8 },
    { label: 'Service', score: 4.6 },
    { label: 'Value', score: 4.7 },
  ],
};

const customerReviews = [
  {
    id: 1,
    name: 'John Doe',
    location: 'United States',
    date: 'October 2023',
    rating: 5,
    title: 'Fantastic experience!',
    text: 'The car was in perfect condition and the pickup process was smooth. Highly recommend this for anyone traveling to the mountains.',
    verified: true,
  },
];

const CarDetail = () => {
  const { id } = useParams();
  const [activeImage, setActiveImage] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [showFullDesc, setShowFullDesc] = useState(false);

  // Fetch car from database
  const { data: car, isLoading } = useQuery({
    queryKey: ['car-detail', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Fetch similar cars
  const { data: similarCars } = useQuery({
    queryKey: ['similar-cars', car?.category],
    queryFn: async () => {
      if (!car) return [];
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .eq('is_active', true)
        .neq('id', car.id)
        .limit(3);

      if (error) throw error;
      return data;
    },
    enabled: !!car,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-24 text-center">
          <Car className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Car not found</h1>
          <p className="text-muted-foreground mb-6">This car might have been removed or doesn't exist.</p>
          <Link 
            to="/cars" 
            className="inline-flex px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium"
          >
            Browse Cars
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const carName = `${car.brand} ${car.model}`;
  const images = car.gallery_images?.length ? [car.main_image, ...car.gallery_images].filter(Boolean) as string[] : [car.main_image || defaultImages[0]];
  
  const features = Array.isArray(car.features) ? car.features as string[] : [];
  
  const specs = [
    { icon: Fuel, label: 'Fuel Type', value: car.fuel_type.charAt(0).toUpperCase() + car.fuel_type.slice(1) },
    { icon: Settings, label: 'Transmission', value: car.transmission.charAt(0).toUpperCase() + car.transmission.slice(1) },
    { icon: Users, label: 'Capacity', value: `${car.seats} People` },
    { icon: Wifi, label: 'AC', value: features.includes('ac') ? 'Yes' : 'No' },
    { icon: Car, label: 'Engine', value: car.engine_volume || 'N/A' },
    { icon: Briefcase, label: 'GPS', value: features.includes('gps') ? 'Yes' : 'No' },
    { icon: DoorOpen, label: '4x4', value: features.includes('4x4') ? 'Yes' : 'No' },
    { icon: Wifi, label: 'Bluetooth', value: features.includes('bluetooth') ? 'Yes' : 'No' },
  ];

  const highlights = [
    'Unlimited mileage included',
    'Full insurance coverage (Zero Excess)',
    features.includes('gps') ? 'GPS Navigation System' : 'Bluetooth connectivity',
    '24/7 Roadside Assistance',
  ];

  const tags = [
    car.category.charAt(0).toUpperCase() + car.category.slice(1),
    `${car.seats} Seats`,
    car.transmission.charAt(0).toUpperCase() + car.transmission.slice(1),
    'Free cancellation',
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <Link to="/cars" className="hover:text-foreground transition-colors">Cars</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="hover:text-foreground transition-colors cursor-pointer capitalize">{car.category}</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-medium">{carName}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2">
            {/* Header */}
            <div className="mb-6">
              <span className="text-primary text-sm font-semibold uppercase tracking-wide">Premium Selection</span>
              <h1 className="text-3xl font-bold text-foreground mt-1">{carName}</h1>
              
              <div className="flex flex-wrap items-center gap-4 mt-3">
                <div className="flex items-center gap-1">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < 4 ? 'fill-star text-star' : 'text-gray-200'}`}
                      />
                    ))}
                  </div>
                  <span className="font-medium text-foreground">4.8</span>
                  <span className="text-primary underline cursor-pointer">(124 reviews)</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>Los Angeles, CA</span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-4">
                {tags.map(tag => (
                  <span
                    key={tag}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      tag === 'Free cancellation'
                        ? 'bg-success/10 text-success'
                        : 'bg-secondary text-foreground'
                    }`}
                  >
                    {tag === 'Free cancellation' && <Check className="w-3.5 h-3.5 inline mr-1" />}
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Image Gallery */}
            <div className="mb-8">
              <div className="relative rounded-xl overflow-hidden aspect-[16/10] mb-3">
                <img
                  src={images[activeImage]}
                  alt={carName}
                  className="w-full h-full object-cover transition-opacity duration-300"
                />
                <div className="absolute top-4 right-4 flex gap-2">
                  <button className="w-10 h-10 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors btn-scale">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
                <div className="absolute bottom-4 right-4 px-3 py-1 bg-foreground/70 backdrop-blur-sm text-background text-sm rounded-md">
                  {activeImage + 1}/{images.length} Photos
                </div>
              </div>
              
              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto scrollbar-hide">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImage(index)}
                      className={`relative flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden transition-all ${
                        activeImage === index ? 'ring-2 ring-primary' : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* About */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-foreground mb-3">About this car</h2>
              <p className={`text-muted-foreground leading-relaxed ${!showFullDesc ? 'line-clamp-3' : ''}`}>
                Experience the ultimate driving experience with the {carName}. This {car.category} vehicle 
                combines style with performance, featuring a {car.engine_volume || 'powerful'} {car.fuel_type} engine 
                and {car.transmission} transmission. Perfect for {car.seats <= 4 ? 'couples or small groups' : 'families or groups'}, 
                this car offers comfort and reliability for your journey. {features.includes('4x4') ? 'With 4x4 capability, tackle any terrain with confidence.' : ''}
              </p>
              <button
                onClick={() => setShowFullDesc(!showFullDesc)}
                className="text-primary font-medium mt-2 hover:underline"
              >
                {showFullDesc ? 'Show less' : 'Read more'}
              </button>
            </section>

            {/* Highlights */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-foreground mb-4">Highlights</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {highlights.map(highlight => (
                  <div key={highlight} className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-success flex-shrink-0" />
                    <span className="text-foreground">{highlight}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Specifications */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-foreground mb-4">Features & Specifications</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 bg-secondary/50 rounded-xl">
                {specs.map((spec, index) => {
                  const Icon = spec.icon;
                  return (
                    <div 
                      key={spec.label} 
                      className="flex flex-col items-center text-center opacity-0 animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'forwards' }}
                    >
                      <Icon className="w-6 h-6 text-muted-foreground mb-2" />
                      <span className="text-xs text-muted-foreground mb-1">{spec.label}</span>
                      <span className="font-medium text-foreground">{spec.value}</span>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* FAQ */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-foreground mb-4">Important Information</h2>
              <div className="space-y-2">
                {staticFaq.map((item, index) => (
                  <div key={index} className="border border-border rounded-lg overflow-hidden">
                    <button
                      onClick={() => setOpenFaq(openFaq === index ? null : index)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-secondary/50 transition-colors"
                    >
                      <span className="font-medium text-foreground">{item.question}</span>
                      {openFaq === index ? (
                        <ChevronUp className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      )}
                    </button>
                    {openFaq === index && (
                      <div className="px-4 pb-4 text-muted-foreground animate-fade-in">
                        {item.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Reviews */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-foreground mb-6">Customer Reviews</h2>
              
              {/* Stats */}
              <div className="flex gap-8 mb-8">
                <div className="flex flex-col items-center justify-center p-6 bg-primary/10 rounded-xl">
                  <span className="text-4xl font-bold text-foreground">{reviewStats.overall}</span>
                  <div className="flex mt-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-star text-star" />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground mt-2">Based on {reviewStats.total} reviews</span>
                </div>
                <div className="flex-1 space-y-3">
                  {reviewStats.breakdown.map(stat => (
                    <div key={stat.label} className="flex items-center gap-3">
                      <span className="w-24 text-sm text-muted-foreground">{stat.label}</span>
                      <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${(stat.score / 5) * 100}%` }}
                        />
                      </div>
                      <span className="w-8 text-sm text-muted-foreground">{stat.score}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Review Cards */}
              {customerReviews.map(review => (
                <div key={review.id} className="border-t border-border pt-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                      {review.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium text-foreground">{review.name}</span>
                          <p className="text-sm text-muted-foreground">{review.location} • {review.date}</p>
                        </div>
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-star text-star' : 'text-gray-200'}`} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <h4 className="font-medium text-foreground mb-2">{review.title}</h4>
                  <p className="text-muted-foreground mb-4">{review.text}</p>
                  <div className="flex items-center gap-4 text-sm">
                    {review.verified && (
                      <span className="flex items-center gap-1 text-success">
                        <Check className="w-4 h-4" />
                        Verified Booking
                      </span>
                    )}
                    <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
                      <ThumbsUp className="w-4 h-4" />
                      Helpful
                    </button>
                  </div>
                </div>
              ))}

              <button className="w-full mt-6 py-3 border border-border rounded-lg font-medium text-foreground hover:border-foreground hover:bg-secondary transition-all btn-scale">
                Load more reviews
              </button>
            </section>

            {/* Similar Cars */}
            {similarCars && similarCars.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-foreground mb-6">Similar Cars</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {similarCars.map((similarCar, index) => (
                    <Link
                      key={similarCar.id}
                      to={`/car/${similarCar.id}`}
                      className="group bg-card rounded-xl overflow-hidden shadow-card card-hover opacity-0 animate-fade-in-up"
                      style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
                    >
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <img
                          src={similarCar.main_image || defaultImages[index % defaultImages.length]}
                          alt={`${similarCar.brand} ${similarCar.model}`}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                            {similarCar.brand} {similarCar.model}
                          </h3>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-star text-star" />
                            <span className="text-sm font-medium">4.8</span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3 capitalize">
                          {similarCar.category} • {similarCar.transmission}
                        </p>
                        <div className="flex items-center justify-between pt-3 border-t border-border">
                          <div>
                            <span className="text-xs text-muted-foreground">From</span>
                            <p className="text-lg font-bold text-foreground">${similarCar.price_per_day}/day</p>
                          </div>
                          <span className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:border-foreground hover:bg-secondary transition-colors">
                            View
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right Column - Booking Widget */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <BookingWidget 
                pricePerDay={Number(car.price_per_day)} 
                carName={carName} 
                carId={car.id}
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CarDetail;
