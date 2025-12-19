# WhatsApp Floating Button

A responsive, non-intrusive WhatsApp floating button that appears on all pages of the site.

## Features

✅ **Floating button** - Fixed position at bottom-right corner
✅ **Expandable popup** - Click to show chat preview before opening WhatsApp
✅ **Fully responsive** - Optimized for mobile and desktop
✅ **Smooth animations** - Fade-in, pulse, and scale effects
✅ **Event tracking** - Built-in analytics tracking (Google Analytics compatible)
✅ **Configurable** - Easy to update number and messages
✅ **Non-intrusive** - 1-second delay before showing, dismissible popup
✅ **Visual feedback** - Pulse animation and notification badge

## Configuration

Edit the configuration file at: `src/config/whatsapp.ts`

```typescript
export const whatsappConfig = {
  // Update this with your WhatsApp number (international format, no + or spaces)
  // Example: For +995 555 12 34 56, use '995555123456'
  phoneNumber: '995555123456',

  // Default message pre-filled when user opens WhatsApp
  defaultMessage: 'Hello! I am interested in renting a car.',

  // Greeting shown in the popup
  greetingText: '👋 Hello! How can we help you today?',

  // Subtext shown in the popup
  subText: 'Ask about our cars, prices, or booking process.',

  // Show/hide notification badge
  showNotificationBadge: true,

  // Delay before showing button (milliseconds)
  showDelay: 1000,
};
```

## How It Works

### Desktop Experience:
1. Button appears in bottom-right corner after 1 second
2. Hover shows a tooltip: "Need help? Chat with us!"
3. Click to expand popup with greeting
4. Click "Start Chat on WhatsApp" to open WhatsApp Web

### Mobile Experience:
1. Button appears in bottom-right corner after 1 second
2. Tap to show popup overlay with greeting
3. Tap outside overlay to close
4. Tap "Start Chat on WhatsApp" to open WhatsApp app

## Event Tracking

All clicks are automatically tracked with the following event:

```javascript
{
  event: 'whatsapp_click',
  event_category: 'engagement',
  event_label: 'WhatsApp Button Click',
  value: 1
}
```

### Google Analytics 4

If you have GA4 installed with `gtag`, events are automatically sent.

### Custom Analytics

To add custom analytics (Mixpanel, Segment, etc.), edit `src/config/whatsapp.ts`:

```typescript
export const trackWhatsAppClick = (eventLabel: string) => {
  // Your custom analytics here
  analytics.track('WhatsApp Click', { label: eventLabel });
};
```

## Customization

### Change WhatsApp Number

1. Open `src/config/whatsapp.ts`
2. Update `phoneNumber` field (international format, no + or spaces)
3. Save - changes apply immediately with hot reload

### Change Messages

Update these fields in `src/config/whatsapp.ts`:
- `defaultMessage` - Pre-filled message when WhatsApp opens
- `greetingText` - Main text in popup
- `subText` - Secondary text in popup

### Styling

The button uses:
- **Green color**: `#25D366` (Official WhatsApp green)
- **Hover color**: `#20BA5A` (Darker green)
- **Size**: 56px (14 Tailwind units) on all devices
- **Position**: Fixed bottom-right with 24px (6 Tailwind units) spacing

To customize, edit `src/components/WhatsAppButton.tsx`

### Hide Button on Specific Pages

If you want to hide the button on certain pages (e.g., admin panel), you can:

1. Use React Router's `useLocation` hook
2. Add conditional rendering

Example:
```typescript
import { useLocation } from 'react-router-dom';

const WhatsAppButton = () => {
  const location = useLocation();

  // Hide on admin pages
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  // ... rest of component
};
```

### Remove Notification Badge

Set `showNotificationBadge: false` in `src/config/whatsapp.ts`

## Files

- **Component**: `src/components/WhatsAppButton.tsx`
- **Configuration**: `src/config/whatsapp.ts`
- **Integration**: `src/App.tsx` (line 78)

## Browser Compatibility

- ✅ Chrome/Edge (desktop & mobile)
- ✅ Safari (desktop & mobile)
- ✅ Firefox (desktop & mobile)
- ✅ All modern browsers with WhatsApp support

## Testing

1. **Desktop**: Opens WhatsApp Web (`https://web.whatsapp.com`)
2. **Mobile**: Opens WhatsApp app directly
3. **Analytics**: Check browser console for tracking logs

## Support

For issues or questions about the WhatsApp button, check:
- Component code: `src/components/WhatsAppButton.tsx`
- Configuration: `src/config/whatsapp.ts`
