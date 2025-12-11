import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { 
  ChevronRight, ChevronDown, ChevronUp, Star, MapPin, Heart, Share2, Users, Settings, 
  Check, Calendar, Fuel, Car, Briefcase, DoorOpen, Wifi, Lock, ThumbsUp,
  Minus, Plus
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import carRangeRover from '@/assets/car-range-rover.jpg';
import carCorvette from '@/assets/car-corvette.jpg';
import carMercedes from '@/assets/car-mercedes.jpg';
import carTesla from '@/assets/car-tesla.jpg';

const carData = {
  id: 1,
  name: 'Toyota Land Cruiser 2023',
  category: 'SUV',
  rating: 4.8,
  reviews: 124,
  location: 'Tokyo, Japan',
  tags: ['SUV', '7 Seats', 'Automatic', 'Free cancellation'],
  images: [carRangeRover, carCorvette, carMercedes, carTesla, carRangeRover],
  pricePerDay: 85,
  description: `Experience the ultimate off-road adventure with the 2023 Toyota Land Cruiser. Combining luxury with rugged capability, this SUV is perfect for family trips or exploring the countryside. Features a powerful V8 engine, advanced safety systems, and a spacious interior with premium leather seats. Whether you're navigating city streets or rough terrains, the Land Cruiser delivers a smooth and commanding ride.`,
  highlights: [
    'Unlimited mileage included',
    'Full insurance coverage (Zero Excess)',
    'GPS Navigation System & Bluetooth',
    '24/7 Roadside Assistance',
  ],
  specs: [
    { icon: Fuel, label: 'Fuel Type', value: 'Diesel' },
    { icon: Settings, label: 'Transmission', value: 'Automatic' },
    { icon: Users, label: 'Capacity', value: '7 People' },
    { icon: Wifi, label: 'Air Con', value: 'Dual Zone' },
    { icon: Car, label: 'Engine', value: '3.5L V6' },
    { icon: Briefcase, label: 'Luggage', value: '4 Bags' },
    { icon: DoorOpen, label: 'Doors', value: '4 Doors' },
    { icon: Wifi, label: 'Multimedia', value: 'CarPlay / Android' },
  ],
  faq: [
    { 
      question: 'Driver Requirements', 
      answer: 'Minimum age is 25 years. Driver must hold a full, valid driving license for at least 2 years. International Driving Permit (IDP) required if your license is not in English.' 
    },
    { question: 'Security Deposit', answer: 'A security deposit of $500 is required upon pickup. This will be refunded within 7-14 business days after the return of the vehicle.' },
    { question: 'Mileage Policy', answer: 'Unlimited mileage is included with all rentals. No additional charges for distance traveled.' },
  ],
  reviewStats: {
    overall: 4.8,
    total: 124,
    breakdown: [
      { label: 'Cleanliness', score: 4.9 },
      { label: 'Comfort', score: 4.8 },
      { label: 'Service', score: 4.6 },
      { label: 'Value', score: 4.7 },
    ],
  },
  customerReviews: [
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
  ],
  similarCars: [
    { id: 2, name: 'Jeep Wrangler', type: 'SUV • Automatic', rating: 4.7, price: 240, image: carCorvette },
    { id: 3, name: 'Ford Explorer', type: 'SUV • Automatic', rating: 4.6, price: 225, image: carMercedes },
    { id: 4, name: 'Range Rover Sport', type: 'Luxury • Automatic', rating: 4.9, price: 450, image: carRangeRover },
  ],
};

const CarDetail = () => {
  const { id } = useParams();
  const [activeImage, setActiveImage] = useState(0);
  const [driveType, setDriveType] = useState<'self' | 'driver'>('self');
  const [passengers, setPassengers] = useState(2);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showFullDesc, setShowFullDesc] = useState(false);

  const days = 3;
  const serviceFee = 15;
  const total = carData.pricePerDay * days + serviceFee;

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
          <span className="hover:text-foreground transition-colors cursor-pointer">{carData.category}</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-medium">{carData.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2">
            {/* Header */}
            <div className="mb-6">
              <span className="text-primary text-sm font-semibold uppercase tracking-wide">Premium Selection</span>
              <h1 className="text-3xl font-bold text-foreground mt-1">{carData.name}</h1>
              
              <div className="flex flex-wrap items-center gap-4 mt-3">
                <div className="flex items-center gap-1">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < Math.floor(carData.rating) ? 'fill-star text-star' : 'text-gray-200'}`}
                      />
                    ))}
                  </div>
                  <span className="font-medium text-foreground">{carData.rating}</span>
                  <span className="text-primary underline cursor-pointer">({carData.reviews} reviews)</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{carData.location}</span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-4">
                {carData.tags.map(tag => (
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
                  src={carData.images[activeImage]}
                  alt={carData.name}
                  className="w-full h-full object-cover transition-opacity duration-300"
                />
                <div className="absolute top-4 right-4 flex gap-2">
                  <button className="w-10 h-10 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors btn-scale">
                    <Share2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all btn-scale ${
                      isWishlisted
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-background/90 backdrop-blur-sm text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                  </button>
                </div>
                <div className="absolute bottom-4 right-4 px-3 py-1 bg-foreground/70 backdrop-blur-sm text-background text-sm rounded-md">
                  {activeImage + 1}/{carData.images.length} Photos
                </div>
              </div>
              
              {/* Thumbnails */}
              <div className="flex gap-3 overflow-x-auto scrollbar-hide">
                {carData.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImage(index)}
                    className={`relative flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden transition-all ${
                      activeImage === index ? 'ring-2 ring-primary' : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    {index === carData.images.length - 1 && carData.images.length > 5 && (
                      <div className="absolute inset-0 bg-foreground/60 flex items-center justify-center text-background text-sm font-medium">
                        +{carData.images.length - 4} more
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* About */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-foreground mb-3">About this car</h2>
              <p className={`text-muted-foreground leading-relaxed ${!showFullDesc ? 'line-clamp-3' : ''}`}>
                {carData.description}
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
                {carData.highlights.map(highlight => (
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
                {carData.specs.map((spec, index) => {
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
                {carData.faq.map((item, index) => (
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
                  <span className="text-4xl font-bold text-foreground">{carData.reviewStats.overall}</span>
                  <div className="flex mt-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-star text-star" />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground mt-2">Based on {carData.reviewStats.total} reviews</span>
                </div>
                <div className="flex-1 space-y-3">
                  {carData.reviewStats.breakdown.map(stat => (
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
              {carData.customerReviews.map(review => (
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
            <section>
              <h2 className="text-xl font-bold text-foreground mb-6">Similar Cars</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {carData.similarCars.map((car, index) => (
                  <Link
                    key={car.id}
                    to={`/car/${car.id}`}
                    className="group bg-card rounded-xl overflow-hidden shadow-card card-hover opacity-0 animate-fade-in-up"
                    style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={car.image}
                        alt={car.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <button className="absolute top-3 right-3 w-9 h-9 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors btn-scale">
                        <Heart className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {car.name}
                        </h3>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-star text-star" />
                          <span className="text-sm font-medium">{car.rating}</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{car.type}</p>
                      <div className="flex items-center justify-between pt-3 border-t border-border">
                        <div>
                          <span className="text-xs text-muted-foreground">Total 3 days</span>
                          <p className="text-lg font-bold text-foreground">${car.price}</p>
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
          </div>

          {/* Right Column - Booking Widget */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-card rounded-xl shadow-card-hover p-6 border border-border">
              {/* Price */}
              <div className="flex items-baseline justify-between mb-4">
                <div>
                  <span className="text-sm text-muted-foreground">Price starts from</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-foreground">${carData.pricePerDay}</span>
                    <span className="text-muted-foreground">/day</span>
                  </div>
                </div>
                <span className="text-primary text-sm font-medium cursor-pointer hover:underline">Best Price Guarantee</span>
              </div>

              {/* Date Picker */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-3 p-3 border border-border rounded-lg hover:border-primary transition-colors cursor-pointer">
                  <Calendar className="w-5 h-5 text-primary" />
                  <div>
                    <span className="text-xs text-muted-foreground">Pick-up & Drop-off Dates</span>
                    <p className="font-medium text-foreground">Nov 12 - Nov 15</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 border border-border rounded-lg hover:border-primary transition-colors cursor-pointer">
                  <MapPin className="w-5 h-5 text-muted-foreground" />
                  <div className="flex-1">
                    <span className="text-xs text-muted-foreground">Pick-up Location</span>
                    <p className="font-medium text-foreground">Tokyo Haneda Airport (HND)</p>
                  </div>
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                </div>
              </div>

              {/* Drive Type Toggle */}
              <div className="flex bg-secondary rounded-lg p-1 mb-4">
                <button
                  onClick={() => setDriveType('self')}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                    driveType === 'self'
                      ? 'bg-background text-primary shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Self-Drive
                </button>
                <button
                  onClick={() => setDriveType('driver')}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                    driveType === 'driver'
                      ? 'bg-background text-primary shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
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
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>${carData.pricePerDay} x {days} days</span>
                  <span>${carData.pricePerDay * days}</span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Service fee</span>
                  <span>${serviceFee}</span>
                </div>
                <div className="flex items-center justify-between font-bold text-foreground">
                  <span>Total</span>
                  <span>${total}</span>
                </div>
              </div>

              {/* Book Button */}
              <button className="w-full py-4 bg-primary text-primary-foreground font-semibold rounded-lg btn-scale hover:bg-coral-hover transition-colors shadow-button mb-4">
                Book Now
              </button>

              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Lock className="w-4 h-4" />
                <span>Secure booking. No hidden fees.</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CarDetail;
