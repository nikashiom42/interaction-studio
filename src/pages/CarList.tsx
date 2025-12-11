import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Calendar, ChevronDown, Heart, Check, Star, Users, Settings, Briefcase, Fuel, Snowflake, Mountain, Gauge } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import carRangeRover from '@/assets/car-range-rover.jpg';
import carCorvette from '@/assets/car-corvette.jpg';
import carMercedes from '@/assets/car-mercedes.jpg';
import carTesla from '@/assets/car-tesla.jpg';

const filters = [
  { id: 'dates', label: 'Dates', icon: Calendar, hasDropdown: false, isActive: true },
  { id: 'self-drive', label: 'Self-Drive', hasDropdown: true },
  { id: 'with-driver', label: 'With Driver', hasDropdown: true },
  { id: 'suv', label: 'SUV' },
  { id: 'luxury', label: 'Luxury' },
  { id: 'economy', label: 'Economy' },
  { id: 'automatic', label: 'Automatic' },
  { id: 'electric', label: 'Electric' },
];

const cars = [
  {
    id: 1,
    image: carRangeRover,
    name: 'Porsche Macan GTS',
    rating: 4.8,
    reviews: 124,
    seats: 5,
    transmission: 'Automatic',
    bags: null,
    fuel: 'Petrol',
    mileage: 'Unlimited km',
    electric: false,
    ac: false,
    fourWD: false,
    originalPrice: 240,
    price: 204,
    discount: 15,
    badge: 'Most popular',
  },
  {
    id: 2,
    image: carTesla,
    name: 'Tesla Model 3',
    rating: 4.5,
    reviews: 89,
    seats: 5,
    transmission: 'Automatic',
    bags: null,
    fuel: null,
    mileage: null,
    electric: true,
    ac: true,
    fourWD: false,
    originalPrice: null,
    price: 152,
    discount: null,
    badge: null,
  },
  {
    id: 3,
    image: carMercedes,
    name: 'Land Rover Discovery',
    rating: 4.6,
    reviews: 45,
    seats: 7,
    transmission: 'Automatic',
    bags: null,
    fuel: 'Diesel',
    mileage: null,
    electric: false,
    ac: false,
    fourWD: true,
    originalPrice: null,
    price: 285,
    discount: null,
    badge: null,
  },
  {
    id: 4,
    image: carCorvette,
    name: 'Ford Explorer',
    rating: 4.7,
    reviews: 210,
    seats: 7,
    transmission: 'Automatic',
    bags: 3,
    fuel: 'Petrol',
    mileage: null,
    electric: false,
    ac: false,
    fourWD: false,
    originalPrice: null,
    price: 180,
    discount: null,
    badge: 'Likely to sell out',
  },
  {
    id: 5,
    image: carRangeRover,
    name: 'Audi A3',
    rating: 4.4,
    reviews: 320,
    seats: 5,
    transmission: 'Automatic',
    bags: null,
    fuel: 'Diesel',
    mileage: null,
    electric: false,
    ac: true,
    fourWD: false,
    originalPrice: null,
    price: 135,
    discount: null,
    badge: null,
  },
  {
    id: 6,
    image: carMercedes,
    name: 'BMW X5',
    rating: 4.6,
    reviews: 175,
    seats: 5,
    transmission: 'Automatic',
    bags: null,
    fuel: 'Petrol',
    mileage: '250 km/day',
    electric: false,
    ac: false,
    fourWD: false,
    originalPrice: null,
    price: 210,
    discount: null,
    badge: null,
  },
];

const tabs = ['Explore Cars', 'Places to See', 'Things to Do', 'Trip Inspiration'];

const CarList = () => {
  const [activeTab, setActiveTab] = useState('Explore Cars');
  const [activeFilters, setActiveFilters] = useState<string[]>(['dates']);
  const [wishlist, setWishlist] = useState<number[]>([]);

  const toggleFilter = (id: string) => {
    setActiveFilters(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const toggleWishlist = (id: number) => {
    setWishlist(prev => 
      prev.includes(id) ? prev.filter(w => w !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="hover:text-foreground transition-colors cursor-pointer">Cars</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-medium">SUVs</span>
        </nav>

        {/* Tabs */}
        <div className="flex gap-6 border-b border-border mb-6">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium transition-all relative ${
                activeTab === tab 
                  ? 'text-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-3 overflow-x-auto pb-6 scrollbar-hide">
          {filters.map(filter => {
            const Icon = filter.icon;
            const isActive = activeFilters.includes(filter.id);
            return (
              <button
                key={filter.id}
                onClick={() => toggleFilter(filter.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 btn-scale border ${
                  isActive
                    ? 'bg-foreground text-background border-foreground'
                    : 'bg-background text-foreground border-border hover:border-foreground'
                }`}
              >
                {Icon && <Icon className="w-4 h-4" />}
                <span>{filter.label}</span>
                {filter.hasDropdown && <ChevronDown className="w-4 h-4" />}
              </button>
            );
          })}
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-foreground">Cars in Georgia</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Sort by:</span>
            <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-medium hover:border-foreground transition-colors">
              <span>Recommended</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Cars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {cars.map((car, index) => (
            <Link
              key={car.id}
              to={`/car/${car.id}`}
              className="group bg-card rounded-xl overflow-hidden shadow-card card-hover opacity-0 animate-fade-in-up"
              style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'forwards' }}
            >
              {/* Image */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={car.image}
                  alt={car.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {/* Badge */}
                {car.badge && (
                  <div className="absolute top-3 left-3 px-3 py-1 bg-foreground/80 backdrop-blur-sm text-background text-xs font-medium rounded-md">
                    {car.badge}
                  </div>
                )}
                {/* Wishlist */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    toggleWishlist(car.id);
                  }}
                  className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 btn-scale ${
                    wishlist.includes(car.id)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background/90 backdrop-blur-sm text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${wishlist.includes(car.id) ? 'fill-current' : ''}`} />
                </button>
                {/* Free Cancellation */}
                <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2 py-1 bg-background/90 backdrop-blur-sm rounded-md">
                  <Check className="w-3.5 h-3.5 text-success" />
                  <span className="text-xs font-medium text-success">FREE CANCELLATION</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold text-foreground text-lg mb-1 group-hover:text-primary transition-colors">
                  {car.name}
                </h3>
                
                {/* Rating */}
                <div className="flex items-center gap-1 mb-3">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${i < Math.floor(car.rating) ? 'fill-star text-star' : 'text-gray-200'}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">({car.reviews} reviews)</span>
                </div>

                {/* Specs Row 1 */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{car.seats} Seats</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Settings className="w-4 h-4" />
                    <span>{car.transmission}</span>
                  </div>
                  {car.bags && (
                    <div className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4" />
                      <span>{car.bags} Bags</span>
                    </div>
                  )}
                  {car.fourWD && (
                    <div className="flex items-center gap-1">
                      <Mountain className="w-4 h-4" />
                      <span>4x4</span>
                    </div>
                  )}
                </div>

                {/* Specs Row 2 */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  {car.mileage && (
                    <div className="flex items-center gap-1">
                      <Gauge className="w-4 h-4" />
                      <span>{car.mileage}</span>
                    </div>
                  )}
                  {car.electric && (
                    <div className="flex items-center gap-1">
                      <Fuel className="w-4 h-4" />
                      <span>Electric</span>
                    </div>
                  )}
                  {car.fuel && (
                    <div className="flex items-center gap-1">
                      <Fuel className="w-4 h-4" />
                      <span>{car.fuel}</span>
                    </div>
                  )}
                  {car.ac && (
                    <div className="flex items-center gap-1">
                      <Snowflake className="w-4 h-4" />
                      <span>A/C</span>
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className="border-t border-border pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {car.originalPrice && (
                        <span className="text-muted-foreground text-sm line-through">${car.originalPrice}</span>
                      )}
                      <span className="text-muted-foreground text-sm">Price for 1 day</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {car.discount && (
                        <span className="text-success text-sm font-medium">-{car.discount}%</span>
                      )}
                      <span className="text-foreground text-2xl font-bold">${car.price}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-4">Showing 6 of 156 cars</p>
          <button className="px-8 py-3 border border-border rounded-lg font-medium text-foreground hover:border-foreground hover:bg-secondary transition-all btn-scale">
            LOAD MORE
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CarList;
