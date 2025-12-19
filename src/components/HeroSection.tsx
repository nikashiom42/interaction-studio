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
          <div className="bg-background/95 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-2xl animate-fade-in border border-border/50" style={{ animationDelay: '0.2s' }}>
            <div className="space-y-4">
              {/* Location Selection */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                  Location
                </label>
                <Popover open={locationOpen} onOpenChange={setLocationOpen}>
                  <PopoverTrigger asChild>
                    <button className="w-full flex items-center gap-3 px-4 py-4 bg-secondary/50 rounded-xl group hover:bg-accent hover:shadow-md transition-all text-left border border-transparent hover:border-primary/20">
                      <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <MapPin className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs text-muted-foreground block mb-0.5">Pick-up Location</span>
                        <span className={cn(
                          "font-semibold truncate block",
                          selectedLocation ? "text-foreground" : "text-muted-foreground"
                        )}>
                          {selectedLocationName || "Select your location"}
                        </span>
                      </div>
                      <ChevronDown className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[500px] p-0 bg-card border border-border shadow-xl z-50 rounded-xl" align="start">
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
                              "w-full px-4 py-2.5 text-left hover:bg-secondary transition-colors flex items-center gap-3 group",
                              selectedLocation === location.id && "bg-primary/10"
                            )}
                          >
                            <MapPin className="w-4 h-4 text-muted-foreground group-hover:text-primary flex-shrink-0 transition-colors" />
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
              </div>

              {/* Pick-up and Drop-off Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Pick-up Date & Time */}
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                    Pick-up
                  </label>
                  <div className="space-y-2">
                    {/* Pick-up Date */}
                    <Popover open={pickupOpen} onOpenChange={setPickupOpen}>
                      <PopoverTrigger asChild>
                        <button className="w-full flex items-center gap-3 px-4 py-3.5 bg-secondary/50 rounded-xl group hover:bg-accent hover:shadow-md transition-all text-left border border-transparent hover:border-primary/20">
                          <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                            <Calendar className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-xs text-muted-foreground block mb-0.5">Date</span>
                            <span className={cn(
                              "font-semibold truncate block text-sm",
                              pickupDate ? "text-foreground" : "text-muted-foreground"
                            )}>
                              {pickupDate ? format(pickupDate, "MMM d, yyyy") : "Select date"}
                            </span>
                          </div>
                          <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-card border border-border shadow-xl z-50 rounded-xl" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={pickupDate}
                          onSelect={handlePickupSelect}
                          disabled={(date) => date < new Date()}
                          initialFocus
                          className="p-3 pointer-events-auto rounded-xl"
                        />
                      </PopoverContent>
                    </Popover>

                    {/* Pick-up Time */}
                    <div className="flex items-center gap-3 px-4 py-3.5 bg-secondary/50 rounded-xl border border-transparent hover:border-primary/20 hover:shadow-md transition-all group">
                      <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <Clock className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <span className="text-xs text-muted-foreground block mb-0.5">Time</span>
                        <input
                          type="time"
                          value={pickupTime}
                          onChange={(e) => setPickupTime(e.target.value)}
                          className="w-full text-sm font-semibold text-foreground bg-transparent border-none outline-none cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Drop-off Date & Time */}
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                    Drop-off
                  </label>
                  <div className="space-y-2">
                    {/* Drop-off Date */}
                    <Popover open={dropoffOpen} onOpenChange={setDropoffOpen}>
                      <PopoverTrigger asChild>
                        <button className="w-full flex items-center gap-3 px-4 py-3.5 bg-secondary/50 rounded-xl group hover:bg-accent hover:shadow-md transition-all text-left border border-transparent hover:border-border/50">
                          <div className="p-2 rounded-lg bg-secondary group-hover:bg-accent transition-colors">
                            <Calendar className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-xs text-muted-foreground block mb-0.5">Date</span>
                            <span className={cn(
                              "font-semibold truncate block text-sm",
                              dropoffDate ? "text-foreground" : "text-muted-foreground"
                            )}>
                              {dropoffDate ? format(dropoffDate, "MMM d, yyyy") : "Select date"}
                            </span>
                          </div>
                          <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-card border border-border shadow-xl z-50 rounded-xl" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={dropoffDate}
                          onSelect={handleDropoffSelect}
                          disabled={(date) => date <= (pickupDate || new Date())}
                          initialFocus
                          className="p-3 pointer-events-auto rounded-xl"
                        />
                      </PopoverContent>
                    </Popover>

                    {/* Drop-off Time */}
                    <div className="flex items-center gap-3 px-4 py-3.5 bg-secondary/50 rounded-xl border border-transparent hover:border-border/50 hover:shadow-md transition-all group">
                      <div className="p-2 rounded-lg bg-secondary group-hover:bg-accent transition-colors">
                        <Clock className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
                      </div>
                      <div className="flex-1">
                        <span className="text-xs text-muted-foreground block mb-0.5">Time</span>
                        <input
                          type="time"
                          value={dropoffTime}
                          onChange={(e) => setDropoffTime(e.target.value)}
                          className="w-full text-sm font-semibold text-foreground bg-transparent border-none outline-none cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Search Button */}
              <button
                onClick={handleSearch}
                className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold text-lg btn-scale hover:bg-coral-hover transition-all shadow-lg hover:shadow-xl"
              >
                <Search className="w-5 h-5" />
                <span>Search Available Cars</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
