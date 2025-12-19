import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Search, ChevronDown, ArrowRight } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import LocationMap from '@/components/LocationMap';
import { pickupLocations } from '@/lib/locations';
import heroCar from '@/assets/hero-car.jpg';

const HeroSection = () => {
  const navigate = useNavigate();
  const [selectedLocation, setSelectedLocation] = useState('');
  const [locationOpen, setLocationOpen] = useState(false);
  const [pickupDate, setPickupDate] = useState<Date | undefined>(addDays(new Date(), 1));
  const [dropoffDate, setDropoffDate] = useState<Date | undefined>(addDays(new Date(), 4));
  const [pickupOpen, setPickupOpen] = useState(false);
  const [dropoffOpen, setDropoffOpen] = useState(false);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (selectedLocation) params.set('location', selectedLocation);
    if (pickupDate) params.set('startDate', format(pickupDate, 'yyyy-MM-dd'));
    if (dropoffDate) params.set('endDate', format(dropoffDate, 'yyyy-MM-dd'));
    navigate(`/cars?${params.toString()}`);
  };

  const handlePickupSelect = (date: Date | undefined) => {
    setPickupDate(date);
    if (date && dropoffDate && dropoffDate <= date) {
      setDropoffDate(addDays(date, 1));
    }
    setPickupOpen(false);
  };

  const handleDropoffSelect = (date: Date | undefined) => {
    setDropoffDate(date);
    setDropoffOpen(false);
  };

  const selectedLocationName = pickupLocations.find(l => l.id === selectedLocation)?.name;

  return (
    <section className="relative min-h-[600px] md:min-h-[700px] overflow-hidden">
      {/* Background Image with Gradient Overlay */}
      <div className="absolute inset-0">
        <img
          src={heroCar}
          alt="Luxury sports car"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/70 to-foreground/30" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 md:pt-32 pb-16">
        <div className="max-w-2xl animate-fade-in">
          <span className="inline-block px-4 py-1.5 mb-6 text-sm font-medium text-primary bg-primary/10 backdrop-blur-sm rounded-full border border-primary/20">
            Premium Car Rentals in Georgia
          </span>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-background mb-4 leading-tight">
            Drive Your Adventure<br />
            <span className="text-primary">Across Georgia</span>
          </h1>
          <p className="text-background/80 text-base md:text-lg mb-8 max-w-lg">
            Premium vehicles and curated tours through stunning landscapes.
          </p>
        </div>

        {/* Search Form - Floating Card */}
        <div className="max-w-4xl animate-fade-in" style={{ animationDelay: '0.15s' }}>
          <div className="bg-background/95 backdrop-blur-md rounded-2xl shadow-2xl border border-border/50 overflow-hidden">
            {/* Form Fields */}
            <div className="p-4 md:p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {/* Pick-up Location */}
                <Popover open={locationOpen} onOpenChange={setLocationOpen}>
                  <PopoverTrigger asChild>
                    <button className="flex items-center gap-2 p-3 bg-secondary/50 hover:bg-secondary rounded-xl transition-all text-left group border border-transparent hover:border-primary/20">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide block">Location</span>
                        <span className={cn(
                          "text-sm font-semibold truncate block",
                          selectedLocation ? "text-foreground" : "text-muted-foreground"
                        )}>
                          {selectedLocationName || "Pick location"}
                        </span>
                      </div>
                      <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[500px] p-0 bg-card border border-border shadow-xl z-50" align="start" sideOffset={8}>
                    <div className="grid grid-cols-2 gap-0">
                      {/* Map */}
                      <div className="h-[320px] border-r border-border">
                        <LocationMap
                          locations={pickupLocations}
                          selectedLocationId={selectedLocation}
                          onLocationSelect={(id) => {
                            setSelectedLocation(id);
                          }}
                        />
                      </div>
                      {/* List */}
                      <div className="py-2 overflow-y-auto max-h-[320px]">
                        <div className="px-4 py-2 border-b border-border">
                          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Available Locations</span>
                        </div>
                        {pickupLocations.map((location) => (
                          <button
                            key={location.id}
                            onClick={() => {
                              setSelectedLocation(location.id);
                              setLocationOpen(false);
                            }}
                            className={cn(
                              "w-full px-4 py-3 text-left hover:bg-secondary transition-colors flex items-center gap-3",
                              selectedLocation === location.id && "bg-primary/10 border-l-2 border-l-primary"
                            )}
                          >
                            <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-foreground">{location.name}</p>
                              <p className="text-xs text-muted-foreground">{location.city}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Pick-up Date */}
                <Popover open={pickupOpen} onOpenChange={setPickupOpen}>
                  <PopoverTrigger asChild>
                    <button className="flex items-center gap-2 p-3 bg-secondary/50 hover:bg-secondary rounded-xl transition-all text-left group border border-transparent hover:border-primary/20">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide block">Pick-up</span>
                        <span className={cn(
                          "text-sm font-semibold truncate block",
                          pickupDate ? "text-foreground" : "text-muted-foreground"
                        )}>
                          {pickupDate ? format(pickupDate, "MMM d, yyyy") : "Select date"}
                        </span>
                      </div>
                      <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-card border border-border shadow-xl z-50" align="start" sideOffset={8}>
                    <CalendarComponent
                      mode="single"
                      selected={pickupDate}
                      onSelect={handlePickupSelect}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>

                {/* Drop-off Date */}
                <Popover open={dropoffOpen} onOpenChange={setDropoffOpen}>
                  <PopoverTrigger asChild>
                    <button className="flex items-center gap-2 p-3 bg-secondary/50 hover:bg-secondary rounded-xl transition-all text-left group border border-transparent hover:border-primary/20">
                      <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide block">Drop-off</span>
                        <span className={cn(
                          "text-sm font-semibold truncate block",
                          dropoffDate ? "text-foreground" : "text-muted-foreground"
                        )}>
                          {dropoffDate ? format(dropoffDate, "MMM d, yyyy") : "Select date"}
                        </span>
                      </div>
                      <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-card border border-border shadow-xl z-50" align="start" sideOffset={8}>
                    <CalendarComponent
                      mode="single"
                      selected={dropoffDate}
                      onSelect={handleDropoffSelect}
                      disabled={(date) => date <= (pickupDate || new Date())}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>

                {/* Search Button */}
                <button
                  onClick={handleSearch}
                  className="flex items-center justify-center gap-2 p-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                >
                  <Search className="w-4 h-4" />
                  <span className="hidden sm:inline text-sm">Search Cars</span>
                  <ArrowRight className="w-4 h-4 sm:hidden" />
                </button>
              </div>
            </div>

            {/* Bottom Stats Bar */}
            <div className="px-4 py-3 md:px-6 md:py-4 bg-secondary/30 border-t border-border/50 flex flex-wrap items-center justify-center gap-4 md:gap-8 text-xs md:text-sm">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                <span className="text-muted-foreground">Instant Confirmation</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                <span className="text-muted-foreground">Free Cancellation</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                <span className="text-muted-foreground">24/7 Support</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
