import { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { whatsappConfig, getWhatsAppUrl, trackWhatsAppClick } from '@/config/whatsapp';

const WhatsAppButton = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Show button after a short delay for better UX
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, whatsappConfig.showDelay);
    return () => clearTimeout(timer);
  }, []);

  const handleWhatsAppClick = () => {
    // Track the event
    trackWhatsAppClick('WhatsApp Button Click');

    // Open WhatsApp
    const url = getWhatsAppUrl();
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Overlay for expanded state on mobile */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden animate-fade-in"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* WhatsApp Button */}
      <div
        className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        {/* Expanded Popup */}
        {isExpanded && (
          <div className="absolute bottom-20 right-0 w-72 bg-card rounded-2xl shadow-2xl border border-border overflow-hidden animate-fade-in-up mb-2">
            {/* Header */}
            <div className="bg-[#25D366] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold">Chat with us</h3>
                  <p className="text-xs text-white/90">We typically reply instantly</p>
                </div>
              </div>
              <button
                onClick={toggleExpanded}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 bg-secondary/50">
              <div className="bg-white rounded-lg p-3 mb-3 shadow-sm">
                <p className="text-sm text-foreground">
                  {whatsappConfig.greetingText}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {whatsappConfig.subText}
                </p>
              </div>

              <button
                onClick={handleWhatsAppClick}
                className="w-full bg-[#25D366] hover:bg-[#20BA5A] text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg"
              >
                <MessageCircle className="w-5 h-5" />
                Start Chat on WhatsApp
              </button>
            </div>
          </div>
        )}

        {/* Main Button */}
        <button
          onClick={isExpanded ? handleWhatsAppClick : toggleExpanded}
          className="group relative w-14 h-14 bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center hover:scale-110"
          aria-label="Chat on WhatsApp"
        >
          {/* Pulse animation */}
          <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20" />

          {/* Icon */}
          <MessageCircle className="w-7 h-7 relative z-10" />

          {/* Notification badge */}
          {whatsappConfig.showNotificationBadge && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full border-2 border-background animate-pulse" />
          )}
        </button>

        {/* Tooltip for desktop */}
        {!isExpanded && (
          <div className="hidden md:block absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <div className="bg-foreground text-background text-sm font-medium py-2 px-3 rounded-lg whitespace-nowrap shadow-lg">
              Need help? Chat with us!
              <div className="absolute top-full right-6 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-foreground" />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default WhatsAppButton;
