import { useState } from 'react';
import { MapPin, Calendar, Search } from 'lucide-react';
import heroCar from '@/assets/hero-car.jpg';

const HeroSection = () => {
  const [location, setLocation] = useState('');
  const [dates, setDates] = useState('');

  return (
    <section className="relative h-[500px] md:h-[600px] overflow-hidden">
      {/* Background Image with Gradient Overlay */}
      <div className="absolute inset-0">
        <img
          src={heroCar}
          alt="Luxury sports car"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/60 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
        <div className="max-w-xl animate-fade-in">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-background italic mb-4">
            Explore Georgia Your Way.
          </h1>
          <p className="text-background/90 text-lg md:text-xl mb-8">
            Premium car rentals and curated tours across Georgia's stunning landscapes.
          </p>

          {/* Search Form */}
          <div className="bg-background rounded-xl p-2 shadow-2xl animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="flex flex-col md:flex-row gap-2">
              <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-secondary rounded-lg group hover:bg-accent transition-colors cursor-pointer">
                <MapPin className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                <input
                  type="text"
                  placeholder="Where to?"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-secondary rounded-lg group hover:bg-accent transition-colors cursor-pointer">
                <Calendar className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                <input
                  type="text"
                  placeholder="Add dates"
                  value={dates}
                  onChange={(e) => setDates(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <button className="flex items-center justify-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium btn-scale hover:bg-coral-hover transition-colors shadow-button">
                <Search className="w-5 h-5" />
                <span>Search</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
