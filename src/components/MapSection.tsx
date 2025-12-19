import { MapPin, ExternalLink } from 'lucide-react';
import { contactConfig, getMapLink } from '@/config/contact';

const MapSection = () => {
  return (
    <section className="bg-secondary/30 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Visit Our Office
          </h2>
          <div className="flex items-center justify-center gap-3 mb-2">
            <MapPin className="w-5 h-5 text-primary" />
            <p className="text-xl text-foreground font-semibold">
              {contactConfig.address}
            </p>
          </div>
          <p className="text-muted-foreground">
            Stop by to discuss your rental needs or pick up your vehicle
          </p>
        </div>

        {/* Map Container */}
        <div className="relative rounded-2xl overflow-hidden shadow-xl border border-border">
          {/* Aspect ratio container for responsive sizing */}
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            {/* Google Maps iframe with lazy loading */}
            <iframe
              src={contactConfig.map.embedUrl}
              className="absolute top-0 left-0 w-full h-full"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Office Location Map"
            />
          </div>

          {/* Overlay with address and link */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/95 via-background/80 to-transparent p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-lg bg-primary/10 backdrop-blur-sm">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-lg mb-1">
                    {contactConfig.address}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {contactConfig.hours.weekdays} (Weekdays) • {contactConfig.hours.weekends} (Weekends)
                  </p>
                </div>
              </div>

              {/* Get Directions Button */}
              <a
                href={getMapLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-coral-hover transition-all shadow-md hover:shadow-lg btn-scale whitespace-nowrap"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Get Directions</span>
              </a>
            </div>
          </div>
        </div>

        {/* Additional Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-background rounded-xl p-6 border border-border shadow-sm">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Easy to Find</h3>
                <p className="text-sm text-muted-foreground">
                  Located in central Tbilisi with easy access and parking available
                </p>
              </div>
            </div>
          </div>

          <div className="bg-background rounded-xl p-6 border border-border shadow-sm">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Opening Hours</h3>
                <p className="text-sm text-muted-foreground">
                  Weekdays: {contactConfig.hours.weekdays}<br />
                  Weekends: {contactConfig.hours.weekends}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-background rounded-xl p-6 border border-border shadow-sm">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Book Ahead</h3>
                <p className="text-sm text-muted-foreground">
                  Call or visit to schedule your rental in advance for best availability
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MapSection;
