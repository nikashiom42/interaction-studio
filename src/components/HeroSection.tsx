import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Search, ChevronDown, Clock } from 'lucide-react';
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
  const [pickupTime, setPickupTime] = useState('10:00');
  const [dropoffTime, setDropoffTime] = useState('10:00');
  const [pickupOpen, setPickupOpen] = useState(false);
  const [dropoffOpen, setDropoffOpen] = useState(false);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (selectedLocation) params.set('location', selectedLocation);
    if (pickupDate) params.set('startDate', format(pickupDate, 'yyyy-MM-dd'));
    if (dropoffDate) params.set('endDate', format(dropoffDate, 'yyyy-MM-dd'));
    params.set('pickupTime', pickupTime);
    params.set('dropoffTime', dropoffTime);
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
              {/* Pick-up Location */}
              <Popover open={locationOpen} onOpenChange={setLocationOpen}>
                <PopoverTrigger asChild>
                  <button className="flex-1 flex items-center gap-3 px-4 py-3 bg-secondary rounded-lg group hover:bg-accent transition-colors text-left">
                    <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs text-muted-foreground block">Pick-up Location</span>
                      <span className={cn(
                        "font-medium truncate block text-sm",
                        selectedLocation ? "text-foreground" : "text-muted-foreground"
                      )}>
                        {selectedLocationName || "Select location"}
                      </span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-[500px] p-0 bg-card border border-border shadow-lg z-50" align="start">
                  <div className="grid grid-cols-2 gap-0">
                    {/* Map */}
                    <div className="h-[300px] border-r border-border">
                      <LocationMap
                        locations={pickupLocations}
                        selectedLocationId={selectedLocation}
                        onLocationSelect={(id) => {
                          setSelectedLocation(id);
                        }}
                      />
                    </div>
                    {/* List */}
                    <div className="py-2 overflow-y-auto max-h-[300px]">
                      {pickupLocations.map((location) => (
                        <button
                          key={location.id}
                          onClick={() => {
                            setSelectedLocation(location.id);
                            setLocationOpen(false);
                          }}
                          className={cn(
                            "w-full px-4 py-2 text-left hover:bg-secondary transition-colors flex items-center gap-3",
                            selectedLocation === location.id && "bg-primary/10"
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
                  <button className="flex-1 flex items-center gap-3 px-4 py-3 bg-secondary rounded-lg group hover:bg-accent transition-colors text-left">
                    <Calendar className="w-5 h-5 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs text-muted-foreground block">Pick-up</span>
                      <span className={cn(
                        "font-medium truncate block text-sm",
                        pickupDate ? "text-foreground" : "text-muted-foreground"
                      )}>
                        {pickupDate ? format(pickupDate, "MMM d, yyyy") : "Select date"}
                      </span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-card border border-border shadow-lg z-50" align="start">
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
                  <button className="flex-1 flex items-center gap-3 px-4 py-3 bg-secondary rounded-lg group hover:bg-accent transition-colors text-left">
                    <Calendar className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs text-muted-foreground block">Drop-off</span>
                      <span className={cn(
                        "font-medium truncate block text-sm",
                        dropoffDate ? "text-foreground" : "text-muted-foreground"
                      )}>
                        {dropoffDate ? format(dropoffDate, "MMM d, yyyy") : "Select date"}
                      </span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-card border border-border shadow-lg z-50" align="start">
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

              {/* Time Pickers - Compact */}
              <div className="flex gap-2">
                <div className="flex-1 flex items-center gap-2 px-3 py-3 bg-secondary rounded-lg">
                  <Clock className="w-4 h-4 text-primary flex-shrink-0" />
                  <input
                    type="time"
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    className="flex-1 text-sm font-medium text-foreground bg-transparent border-none outline-none"
                  />
                </div>
                <div className="flex-1 flex items-center gap-2 px-3 py-3 bg-secondary rounded-lg">
                  <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <input
                    type="time"
                    value={dropoffTime}
                    onChange={(e) => setDropoffTime(e.target.value)}
                    className="flex-1 text-sm font-medium text-foreground bg-transparent border-none outline-none"
                  />
                </div>
              </div>

              {/* Search Button */}
              <button
                onClick={handleSearch}
                className="flex items-center justify-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium btn-scale hover:bg-coral-hover transition-colors shadow-button"
              >
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
