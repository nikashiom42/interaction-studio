import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
const fromAddress = process.env.RESEND_FROM;
// Support multiple emails separated by comma
const notificationEmails = process.env.BOOKING_NOTIFICATION_EMAIL?.split(',').map(e => e.trim()).filter(Boolean) || [];

const resend = new Resend(resendApiKey);

interface BookingData {
  bookingId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  carName?: string;
  tourName?: string;
  bookingType: 'car' | 'tour';
  startDate: string;
  endDate: string;
  pickupTime: string;
  dropoffTime: string;
  totalPrice: number;
  withDriver: boolean;
  paymentOption: string;
  depositAmount: number;
  remainingBalance: number;
  childSeats?: number;
  campingEquipment?: boolean;
  passengers?: number;
  pickupLocation?: string;
}

const isValidEmail = (value: unknown): value is string =>
  typeof value === 'string' && value.includes('@');

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

// Professional email template
const generateCustomerEmail = (booking: BookingData, vehicleName: string, addons: string[]) => {
  const isTour = booking.bookingType === 'tour';
  const primaryColor = isTour ? '#10B981' : '#F97316'; // Green for tours, Orange for cars
  const accentColor = isTour ? '#059669' : '#EA580C';
  const iconEmoji = isTour ? '🏔️' : '🚗';
  const typeLabel = isTour ? 'Tour' : 'Rental';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6; line-height: 1.6;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f3f4f6;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%); padding: 40px 40px 30px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 16px;">${iconEmoji}</div>
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Booking Confirmed!</h1>
              <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">Thank you for choosing Pega Rent</p>
            </td>
          </tr>

          <!-- Booking Reference -->
          <tr>
            <td style="padding: 30px 40px 20px; text-align: center; border-bottom: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Booking Reference</p>
              <p style="margin: 0; font-size: 32px; font-weight: 700; color: #111827; font-family: 'Courier New', monospace; letter-spacing: 2px;">#${booking.bookingId.slice(0, 8).toUpperCase()}</p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 30px 40px;">
              <p style="margin: 0 0 24px; color: #374151; font-size: 16px;">Dear <strong>${booking.customerName}</strong>,</p>
              <p style="margin: 0 0 30px; color: #374151; font-size: 16px;">Your ${isTour ? 'tour' : 'vehicle rental'} has been successfully booked. Here are your booking details:</p>

              <!-- Vehicle/Tour Card -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f9fafb; border-radius: 12px; overflow: hidden; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 24px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td>
                          <span style="display: inline-block; background-color: ${primaryColor}; color: #ffffff; font-size: 11px; font-weight: 600; padding: 4px 12px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px;">${isTour ? (booking.passengers ? `${booking.passengers} Guest${booking.passengers > 1 ? 's' : ''}` : 'Tour') : (booking.withDriver ? 'With Driver' : 'Self-Drive')}</span>
                          <h2 style="margin: 12px 0 4px; color: #111827; font-size: 22px; font-weight: 700;">${vehicleName}</h2>
                          <p style="margin: 0; color: #6b7280; font-size: 14px;">${typeLabel} • ${formatDate(booking.startDate)} - ${formatDate(booking.endDate)}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Details Grid -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 24px;">
                <tr>
                  <td width="50%" style="padding: 16px; background-color: #f9fafb; border-radius: 12px 0 0 0;">
                    <p style="margin: 0 0 4px; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">📅 ${isTour ? 'Start Date' : 'Pick-up'}</p>
                    <p style="margin: 0; color: #111827; font-size: 15px; font-weight: 600;">${formatDate(booking.startDate)}</p>
                    <p style="margin: 4px 0 0; color: #6b7280; font-size: 14px;">${booking.pickupTime}</p>
                  </td>
                  <td width="50%" style="padding: 16px; background-color: #f9fafb; border-radius: 0 12px 0 0;">
                    <p style="margin: 0 0 4px; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">📅 ${isTour ? 'End Date' : 'Drop-off'}</p>
                    <p style="margin: 0; color: #111827; font-size: 15px; font-weight: 600;">${formatDate(booking.endDate)}</p>
                    <p style="margin: 4px 0 0; color: #6b7280; font-size: 14px;">${booking.dropoffTime}</p>
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="padding: 16px; background-color: #f9fafb; border-radius: 0 0 12px 12px; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0 0 4px; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">📍 ${isTour ? 'Pickup Location' : 'Location'}</p>
                    <p style="margin: 0; color: #111827; font-size: 15px; font-weight: 600;">${isTour ? (booking.pickupLocation || 'Tbilisi (will be confirmed)') : 'Tbilisi International Airport (TBS)'}</p>
                  </td>
                </tr>
              </table>

              ${addons.length > 0 ? `
              <!-- Add-ons -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 24px;">
                <tr>
                  <td style="padding: 16px; background-color: #fef3c7; border-radius: 12px; border-left: 4px solid #f59e0b;">
                    <p style="margin: 0 0 8px; color: #92400e; font-size: 12px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">Add-ons Included</p>
                    <p style="margin: 0; color: #78350f; font-size: 15px;">${addons.join(' • ')}</p>
                  </td>
                </tr>
              </table>
              ` : ''}

              <!-- Payment Summary -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #111827; border-radius: 12px; overflow: hidden; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 24px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td>
                          <p style="margin: 0 0 16px; color: #9ca3af; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Payment Summary</p>
                        </td>
                      </tr>
                      ${booking.depositAmount > 0 ? `
                      <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #374151;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td style="color: #d1d5db; font-size: 14px;">Deposit (15%)</td>
                              <td style="color: #ffffff; font-size: 14px; text-align: right; font-weight: 600;">${formatCurrency(booking.depositAmount)}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #374151;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td style="color: #d1d5db; font-size: 14px;">Due at ${isTour ? 'meeting' : 'pickup'}</td>
                              <td style="color: #ffffff; font-size: 14px; text-align: right; font-weight: 600;">${formatCurrency(booking.remainingBalance)}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      ` : `
                      <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #374151;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td style="color: #d1d5db; font-size: 14px;">Payment Method</td>
                              <td style="color: #ffffff; font-size: 14px; text-align: right;">Pay at ${isTour ? 'meeting' : 'pickup'}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      `}
                      <tr>
                        <td style="padding: 16px 0 0;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td style="color: #ffffff; font-size: 16px; font-weight: 600;">Total</td>
                              <td style="color: ${primaryColor}; font-size: 28px; text-align: right; font-weight: 700;">${formatCurrency(booking.totalPrice)}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Contact Info -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="text-align: center; padding: 20px 0;">
                    <p style="margin: 0 0 16px; color: #374151; font-size: 15px;">Questions? We're here to help!</p>
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                      <tr>
                        <td style="padding: 0 16px;">
                          <a href="tel:+995558211584" style="color: ${primaryColor}; text-decoration: none; font-size: 15px; font-weight: 600;">📞 +995 558 211 584</a>
                        </td>
                        <td style="padding: 0 16px;">
                          <a href="mailto:info@pegarent.com" style="color: ${primaryColor}; text-decoration: none; font-size: 15px; font-weight: 600;">✉️ info@pegarent.com</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px; color: #111827; font-size: 18px; font-weight: 700;">Pega Rent</p>
              <p style="margin: 0 0 16px; color: #6b7280; font-size: 14px;">Premium Car Rentals & Tours in Georgia</p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">Tbilisi, Georgia • www.pegarent.com</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

// Admin notification email
const generateAdminEmail = (booking: BookingData, vehicleName: string, addons: string[]) => {
  const isTour = booking.bookingType === 'tour';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
</head>
<body style="margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background-color: #f3f4f6;">
  <table cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <tr>
      <td style="background: ${isTour ? '#10B981' : '#F97316'}; padding: 20px; text-align: center;">
        <h1 style="margin: 0; color: #ffffff; font-size: 20px;">🎉 New ${isTour ? 'Tour' : 'Car'} Booking!</h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 24px;">
        <table cellspacing="0" cellpadding="0" border="0" width="100%">
          <tr>
            <td style="padding: 12px; background: #f9fafb; border-radius: 8px; margin-bottom: 16px;">
              <h2 style="margin: 0 0 8px; font-size: 18px; color: #111827;">${vehicleName}</h2>
              <p style="margin: 0; color: #6b7280; font-size: 14px;">Ref: #${booking.bookingId.slice(0, 8).toUpperCase()}</p>
            </td>
          </tr>
        </table>

        <h3 style="margin: 24px 0 12px; font-size: 14px; color: #6b7280; text-transform: uppercase;">Customer Details</h3>
        <table cellspacing="0" cellpadding="8" border="0" width="100%" style="font-size: 14px;">
          <tr><td style="color: #6b7280;">Name:</td><td style="color: #111827; font-weight: 600;">${booking.customerName}</td></tr>
          <tr><td style="color: #6b7280;">Phone:</td><td style="color: #111827; font-weight: 600;">${booking.customerPhone}</td></tr>
          <tr><td style="color: #6b7280;">Email:</td><td style="color: #111827; font-weight: 600;">${booking.customerEmail || 'Not provided'}</td></tr>
        </table>

        <h3 style="margin: 24px 0 12px; font-size: 14px; color: #6b7280; text-transform: uppercase;">Booking Details</h3>
        <table cellspacing="0" cellpadding="8" border="0" width="100%" style="font-size: 14px;">
          <tr><td style="color: #6b7280;">Dates:</td><td style="color: #111827; font-weight: 600;">${formatDate(booking.startDate)} → ${formatDate(booking.endDate)}</td></tr>
          <tr><td style="color: #6b7280;">Time:</td><td style="color: #111827;">${booking.pickupTime} - ${booking.dropoffTime}</td></tr>
          ${!isTour ? `<tr><td style="color: #6b7280;">Type:</td><td style="color: #111827;">${booking.withDriver ? 'With Driver' : 'Self-Drive'}</td></tr>` : ''}
          ${isTour && booking.pickupLocation ? `<tr><td style="color: #6b7280;">Pickup:</td><td style="color: #111827; font-weight: 600;">${booking.pickupLocation}</td></tr>` : ''}
          ${isTour && booking.passengers ? `<tr><td style="color: #6b7280;">Guests:</td><td style="color: #111827;">${booking.passengers}</td></tr>` : ''}
          ${addons.length > 0 ? `<tr><td style="color: #6b7280;">Add-ons:</td><td style="color: #111827;">${addons.join(', ')}</td></tr>` : ''}
        </table>

        <h3 style="margin: 24px 0 12px; font-size: 14px; color: #6b7280; text-transform: uppercase;">Payment</h3>
        <table cellspacing="0" cellpadding="8" border="0" width="100%" style="font-size: 14px;">
          ${booking.depositAmount > 0 ? `
          <tr><td style="color: #6b7280;">Deposit:</td><td style="color: #111827;">${formatCurrency(booking.depositAmount)}</td></tr>
          <tr><td style="color: #6b7280;">Remaining:</td><td style="color: #111827;">${formatCurrency(booking.remainingBalance)}</td></tr>
          ` : `
          <tr><td style="color: #6b7280;">Method:</td><td style="color: #111827;">Pay at pickup</td></tr>
          `}
          <tr><td style="color: #6b7280; font-weight: 600;">TOTAL:</td><td style="color: ${isTour ? '#10B981' : '#F97316'}; font-weight: 700; font-size: 18px;">${formatCurrency(booking.totalPrice)}</td></tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!resendApiKey || !fromAddress) {
    console.error('Missing email configuration');
    return res.status(500).json({ error: 'Missing email configuration' });
  }

  const booking = req.body as BookingData;

  if (!booking.bookingId || !booking.customerName || !booking.totalPrice) {
    return res.status(400).json({ error: 'Invalid booking data' });
  }

  const vehicleName = booking.carName || booking.tourName || 'Vehicle';
  const addons: string[] = [];
  if (booking.childSeats && booking.childSeats > 0) {
    addons.push(`Child Seat ×${booking.childSeats}`);
  }
  if (booking.campingEquipment) {
    addons.push('Camping Equipment');
  }

  try {
    const emails = [];

    // Send email to customer
    if (booking.customerEmail && isValidEmail(booking.customerEmail)) {
      emails.push(
        resend.emails.send({
          from: fromAddress,
          to: booking.customerEmail,
          subject: `✅ Booking Confirmed - ${vehicleName} (#${booking.bookingId.slice(0, 8).toUpperCase()})`,
          html: generateCustomerEmail(booking, vehicleName, addons),
        })
      );
    }

    // Send notification to admin(s)
    const validAdminEmails = notificationEmails.filter(isValidEmail);
    if (validAdminEmails.length > 0) {
      emails.push(
        resend.emails.send({
          from: fromAddress,
          to: validAdminEmails,
          replyTo: booking.customerEmail && isValidEmail(booking.customerEmail) ? booking.customerEmail : undefined,
          subject: `[New Booking] ${vehicleName} - ${booking.customerName} - ${formatCurrency(booking.totalPrice)}`,
          html: generateAdminEmail(booking, vehicleName, addons),
        })
      );
    }

    if (emails.length === 0) {
      return res.status(200).json({ ok: true, warning: 'No emails sent - check configuration' });
    }

    const results = await Promise.all(emails);
    return res.status(200).json({ ok: true, emailsSent: emails.length });
  } catch (error) {
    console.error('Failed to send booking confirmation email:', error);
    return res.status(500).json({ error: 'Failed to send confirmation email' });
  }
}
