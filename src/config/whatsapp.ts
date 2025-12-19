import { contactConfig, getWhatsAppLink } from './contact';

/**
 * WhatsApp Configuration
 *
 * Update contact.ts to change the WhatsApp phone number
 * Update these settings to change messages and behavior
 */

export const whatsappConfig = {
  // WhatsApp number - imported from contact config
  phoneNumber: contactConfig.whatsapp.number,

  // Default message that will be pre-filled when user opens WhatsApp
  defaultMessage: 'Hello! I am interested in renting a car.',

  // Greeting text shown in the popup
  greetingText: '👋 Hello! How can we help you today?',

  // Subtext shown in the popup
  subText: 'Ask about our cars, prices, or booking process.',

  // Show notification badge on the button
  showNotificationBadge: true,

  // Delay before showing the button (milliseconds)
  showDelay: 1000,
};

/**
 * Generate WhatsApp URL with the configured number and message
 */
export const getWhatsAppUrl = (customMessage?: string): string => {
  return getWhatsAppLink(customMessage || whatsappConfig.defaultMessage);
};

/**
 * Track WhatsApp button click event
 * Replace with your analytics implementation (Google Analytics, Mixpanel, etc.)
 */
export const trackWhatsAppClick = (eventLabel: string = 'WhatsApp Button Click') => {
  // Google Analytics 4 example
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'whatsapp_click', {
      event_category: 'engagement',
      event_label: eventLabel,
      value: 1,
    });
  }

  // Console log for debugging
  console.log('[WhatsApp Analytics]', {
    event: 'whatsapp_click',
    label: eventLabel,
    timestamp: new Date().toISOString(),
  });

  // Add your custom analytics here
  // Example: analytics.track('WhatsApp Click', { label: eventLabel });
};
