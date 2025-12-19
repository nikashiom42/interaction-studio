/**
 * Contact Information Configuration
 *
 * Centralized contact details for the site.
 * These can be overridden by environment variables for easy deployment changes.
 */

// Environment variable support with fallbacks
const PHONE_COUNTRY_CODE = import.meta.env.VITE_PHONE_COUNTRY_CODE || '+995';
const PHONE_NUMBER = import.meta.env.VITE_PHONE_NUMBER || '555232323';
const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '995555232323';
const EMAIL = import.meta.env.VITE_CONTACT_EMAIL || 'info@rentals.ge';
const ADDRESS = import.meta.env.VITE_CONTACT_ADDRESS || 'Tbilisi, Gia Abesadze 10';
const MAP_EMBED_URL = import.meta.env.VITE_MAP_EMBED_URL || 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2977.171394710362!2d44.7832!3d41.7151!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDHCsDQyJzU0LjQiTiA0NMKwNDYnNTkuNSJF!5e0!3m2!1sen!2sge!4v1234567890';

export const contactConfig = {
  phone: {
    // Full international format: +995 555 232323
    international: `${PHONE_COUNTRY_CODE} ${PHONE_NUMBER}`,

    // Georgian format (without country code): 555 232323
    local: PHONE_NUMBER,

    // For tel: links (no spaces or special chars): +995555232323
    href: `${PHONE_COUNTRY_CODE}${PHONE_NUMBER}`,

    // Display format with country code: +995 555 232323
    display: `${PHONE_COUNTRY_CODE} ${formatPhoneDisplay(PHONE_NUMBER)}`,

    // Display format without country code: 555 232 323
    displayLocal: formatPhoneDisplay(PHONE_NUMBER),
  },

  whatsapp: {
    // WhatsApp number (international format, no + or spaces): 995555232323
    number: WHATSAPP_NUMBER,

    // Display format: +995 555 232 323
    display: `+${formatPhoneDisplay(WHATSAPP_NUMBER)}`,
  },

  email: EMAIL,

  address: ADDRESS,

  // Social media (optional)
  social: {
    facebook: import.meta.env.VITE_FACEBOOK_URL || '',
    instagram: import.meta.env.VITE_INSTAGRAM_URL || '',
    twitter: import.meta.env.VITE_TWITTER_URL || '',
  },

  // Business hours
  hours: {
    weekdays: '09:00 - 20:00',
    weekends: '10:00 - 18:00',
  },

  // Map configuration
  map: {
    embedUrl: MAP_EMBED_URL,
    searchQuery: 'Tbilisi, Gia Abesadze 10',
  },
};

/**
 * Format phone number for display
 * Adds spaces for better readability
 * Example: "555232323" -> "555 232 323"
 */
function formatPhoneDisplay(number: string): string {
  // Remove any existing spaces or special characters
  const cleaned = number.replace(/\D/g, '');

  // Georgian mobile format: XXX XXX XXX
  if (cleaned.length === 9) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }

  // International format with country code: XXX XXX XXX XXX
  if (cleaned.length === 12) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`;
  }

  // Default: add space every 3 digits
  return cleaned.replace(/(\d{3})(?=\d)/g, '$1 ');
}

/**
 * Get mailto link with optional subject and body
 */
export const getEmailLink = (subject?: string, body?: string): string => {
  const params = new URLSearchParams();
  if (subject) params.set('subject', subject);
  if (body) params.set('body', body);

  const queryString = params.toString();
  return `mailto:${contactConfig.email}${queryString ? `?${queryString}` : ''}`;
};

/**
 * Get tel link for phone number
 */
export const getPhoneLink = (): string => {
  return `tel:${contactConfig.phone.href}`;
};

/**
 * Get WhatsApp URL with optional custom message
 */
export const getWhatsAppLink = (message?: string): string => {
  const defaultMessage = 'Hello! I am interested in renting a car.';
  const text = message || defaultMessage;
  return `https://wa.me/${contactConfig.whatsapp.number}?text=${encodeURIComponent(text)}`;
};

/**
 * Get Google Maps link for the address
 */
export const getMapLink = (): string => {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contactConfig.map.searchQuery)}`;
};
