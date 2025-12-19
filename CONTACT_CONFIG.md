# Contact Information Configuration

Centralized contact information management for the entire site.

## Overview

All contact details (phone, email, address) are managed through a single configuration file, making it easy to update across the entire site without editing multiple files.

## Configuration File

**Location**: `src/config/contact.ts`

This file contains all contact information and provides utility functions for formatting and generating links.

## Where Contact Info Appears

✅ **Header** - Phone number (desktop only)
✅ **Footer** - Phone, email, and address in Contact section
✅ **Contact Page** - Complete contact information with icons
✅ **WhatsApp Button** - Uses configured phone number

## Current Configuration

```typescript
Phone: +995 555 232 323  (displayed as "555 232 323" in Georgian format)
WhatsApp: +995 555 232 323
Email: info@rentals.ge
Address: Tbilisi, Georgia
```

## How to Update Contact Information

### Method 1: Environment Variables (Recommended for Production)

1. Copy `.env.example` to `.env.local`
2. Update the values:

```env
VITE_PHONE_COUNTRY_CODE=+995
VITE_PHONE_NUMBER=555232323
VITE_WHATSAPP_NUMBER=995555232323
VITE_CONTACT_EMAIL=info@rentals.ge
VITE_CONTACT_ADDRESS=Tbilisi, Georgia
```

3. Restart the dev server (`npm run dev`)

**Benefits:**
- Easy deployment configuration
- No code changes needed
- Different values for dev/staging/production
- Secure (`.env.local` is gitignored)

### Method 2: Direct Configuration File Edit

Edit `src/config/contact.ts`:

```typescript
// Change the fallback values (used when env vars are not set)
const PHONE_COUNTRY_CODE = import.meta.env.VITE_PHONE_COUNTRY_CODE || '+995';
const PHONE_NUMBER = import.meta.env.VITE_PHONE_NUMBER || '555232323';
const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '995555232323';
const EMAIL = import.meta.env.VITE_CONTACT_EMAIL || 'info@rentals.ge';
const ADDRESS = import.meta.env.VITE_CONTACT_ADDRESS || 'Tbilisi, Georgia';
```

**When to use:**
- Development defaults
- Quick testing
- When env vars are not available

## Phone Number Formats

The config provides different formats for different use cases:

### Georgian Format (Local Display)
**Used in**: Header, Footer
**Format**: `555 232 323`
**Code**: `contactConfig.phone.displayLocal`

### International Format
**Used in**: Contact page
**Format**: `+995 555 232 323`
**Code**: `contactConfig.phone.display`

### Tel Link Format
**Used in**: All phone links
**Format**: `+995555232323` (no spaces)
**Code**: `getPhoneLink()` or `contactConfig.phone.href`

### WhatsApp Format
**Used in**: WhatsApp button
**Format**: `995555232323` (no + or spaces)
**Code**: `contactConfig.whatsapp.number`

## Available Functions

### `getPhoneLink()`
Returns tel: link for phone number
```typescript
<a href={getPhoneLink()}>Call us</a>
// Result: <a href="tel:+995555232323">Call us</a>
```

### `getEmailLink(subject?, body?)`
Returns mailto: link with optional subject and body
```typescript
<a href={getEmailLink('Booking Question', 'I need help with...')}>
  Email us
</a>
```

### `getWhatsAppLink(message?)`
Returns WhatsApp URL with optional custom message
```typescript
const url = getWhatsAppLink('I want to rent a car');
window.open(url, '_blank');
```

## Contact Configuration Object

```typescript
contactConfig = {
  phone: {
    international: '+995 555232323',     // Full international
    local: '555232323',                   // Without country code
    href: '+995555232323',                // For tel: links
    display: '+995 555 232 323',          // Display with spaces
    displayLocal: '555 232 323',          // Local display format
  },
  whatsapp: {
    number: '995555232323',               // For WhatsApp API
    display: '+995 555 232 323',          // Display format
  },
  email: 'info@rentals.ge',
  address: 'Tbilisi, Georgia',
  social: {
    facebook: '',                         // Optional
    instagram: '',                        // Optional
    twitter: '',                          // Optional
  },
  hours: {
    weekdays: '09:00 - 20:00',
    weekends: '10:00 - 18:00',
  },
}
```

## Usage Examples

### In a Component

```typescript
import { contactConfig, getPhoneLink, getEmailLink } from '@/config/contact';

// Display phone number
<span>{contactConfig.phone.displayLocal}</span>

// Phone link
<a href={getPhoneLink()}>
  <Phone className="w-4 h-4" />
  {contactConfig.phone.displayLocal}
</a>

// Email link
<a href={getEmailLink()}>
  {contactConfig.email}
</a>
```

### In WhatsApp Integration

The WhatsApp button automatically uses the contact config:

```typescript
// src/config/whatsapp.ts imports from contact.ts
import { contactConfig, getWhatsAppLink } from './contact';

export const whatsappConfig = {
  phoneNumber: contactConfig.whatsapp.number,  // Auto-synced
  // ... other settings
};
```

## Phone Number Format Helper

The config includes automatic formatting for Georgian phone numbers:

**Input**: `"555232323"` (9 digits)
**Output**: `"555 232 323"` (XXX XXX XXX)

**Input**: `"995555232323"` (12 digits)
**Output**: `"995 555 232 323"` (XXX XXX XXX XXX)

## Deployment Checklist

When deploying to production:

1. ✅ Set environment variables in your hosting platform
2. ✅ Verify phone number format (Georgian: 9 digits without country code)
3. ✅ Test WhatsApp link opens correctly
4. ✅ Test phone links on mobile devices
5. ✅ Verify email links work
6. ✅ Check contact page displays all info correctly

## Files Modified

- ✅ `src/config/contact.ts` - Main configuration
- ✅ `src/config/whatsapp.ts` - Imports from contact config
- ✅ `src/components/Header.tsx` - Phone number display
- ✅ `src/components/Footer.tsx` - Contact section
- ✅ `src/components/WhatsAppButton.tsx` - Uses contact config
- ✅ `src/pages/ContactUs.tsx` - Contact information
- ✅ `.env.example` - Environment variable template

## Troubleshooting

### Phone number not updating
- Check if `.env.local` exists and has correct values
- Restart dev server after changing env vars
- Clear browser cache

### WhatsApp opens wrong number
- Verify `VITE_WHATSAPP_NUMBER` in `.env.local`
- Format should be: `995555232323` (no + or spaces)
- Check `src/config/contact.ts` fallback values

### Format looks wrong
- Georgian mobile: 9 digits (555232323)
- International: 12 digits with country code (995555232323)
- Display adds spaces automatically

## Testing

```bash
# Start dev server
npm run dev

# Test phone link (mobile)
# Tap phone number in header/footer - should open phone app

# Test email link
# Click email - should open email client

# Test WhatsApp
# Click floating button - should open WhatsApp with correct number

# Test Contact page
# Visit /contact - all info should display correctly
```

## Support

For issues with contact configuration:
1. Check environment variables in `.env.local`
2. Verify format in `src/config/contact.ts`
3. Restart dev server after changes
4. Clear browser cache if needed
