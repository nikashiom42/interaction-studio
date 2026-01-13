import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
const fromAddress = process.env.RESEND_FROM;
const toAddress = process.env.BOOKING_NOTIFICATION_EMAIL;

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
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Debug: Log environment variables (masked)
  console.log('📧 Email API called');
  console.log('🔑 RESEND_API_KEY exists:', !!resendApiKey, resendApiKey ? `(starts with ${resendApiKey.substring(0, 6)}...)` : '(missing)');
  console.log('📤 RESEND_FROM:', fromAddress || '(missing)');
  console.log('📥 BOOKING_NOTIFICATION_EMAIL:', toAddress || '(missing)');

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
    console.log('❌ Missing email configuration - resendApiKey:', !!resendApiKey, 'fromAddress:', !!fromAddress);
    return res.status(500).json({ error: 'Missing email configuration', details: { hasApiKey: !!resendApiKey, hasFromAddress: !!fromAddress } });
  }

  const booking = req.body as BookingData;

  if (!booking.bookingId || !booking.customerName || !booking.totalPrice) {
    return res.status(400).json({ error: 'Invalid booking data' });
  }

  const vehicleName = booking.carName || booking.tourName || 'Vehicle';
  const addons = [];
  if (booking.childSeats && booking.childSeats > 0) {
    addons.push(`Child Seat ×${booking.childSeats}`);
  }
  if (booking.campingEquipment) {
    addons.push('Camping Equipment');
  }

  // Email to customer
  const customerEmailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .booking-card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .detail-row:last-child { border-bottom: none; }
        .label { color: #666; font-weight: 500; }
        .value { color: #333; font-weight: 600; }
        .total { background: #FF6B6B; color: white; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .badge { display: inline-block; background: #4ECDC4; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; margin: 2px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 28px;">🎉 Booking Confirmed!</h1>
          <p style="margin: 10px 0 0; font-size: 16px; opacity: 0.9;">Thank you for choosing Rentals Georgia</p>
        </div>

        <div class="content">
          <p style="font-size: 16px; margin-bottom: 20px;">Dear ${booking.customerName},</p>

          <p>Your booking has been confirmed! We're excited to help you explore Georgia.</p>

          <div class="booking-card">
            <h2 style="margin-top: 0; color: #FF6B6B;">Booking Details</h2>

            <div class="detail-row">
              <span class="label">Booking ID:</span>
              <span class="value">#${booking.bookingId.slice(0, 8).toUpperCase()}</span>
            </div>

            <div class="detail-row">
              <span class="label">${booking.bookingType === 'car' ? 'Vehicle:' : 'Tour:'}</span>
              <span class="value">${vehicleName}</span>
            </div>

            ${booking.bookingType === 'car' ? `
            <div class="detail-row">
              <span class="label">Rental Type:</span>
              <span class="value">${booking.withDriver ? 'With Driver' : 'Self-Drive'}</span>
            </div>
            ` : ''}

            <div class="detail-row">
              <span class="label">Pick-up:</span>
              <span class="value">${formatDate(booking.startDate)} at ${booking.pickupTime}</span>
            </div>

            <div class="detail-row">
              <span class="label">Drop-off:</span>
              <span class="value">${formatDate(booking.endDate)} at ${booking.dropoffTime}</span>
            </div>

            ${addons.length > 0 ? `
            <div class="detail-row">
              <span class="label">Add-ons:</span>
              <span class="value">
                ${addons.map(addon => `<span class="badge">${addon}</span>`).join(' ')}
              </span>
            </div>
            ` : ''}
          </div>

          <div class="total">
            <div style="font-size: 14px; margin-bottom: 5px;">Total Amount</div>
            <div style="font-size: 32px; font-weight: bold;">${formatCurrency(booking.totalPrice)}</div>
          </div>

          <div class="booking-card">
            <h3 style="margin-top: 0; color: #4ECDC4;">Payment Information</h3>

            ${booking.depositAmount > 0 ? `
            <div class="detail-row">
              <span class="label">Deposit (15%):</span>
              <span class="value">${formatCurrency(booking.depositAmount)}</span>
            </div>
            <div class="detail-row">
              <span class="label">Due at Pickup:</span>
              <span class="value">${formatCurrency(booking.remainingBalance)}</span>
            </div>
            ` : `
            <div class="detail-row">
              <span class="label">Payment Method:</span>
              <span class="value">Pay Full Amount at Pickup</span>
            </div>
            <div class="detail-row">
              <span class="label">Amount Due:</span>
              <span class="value">${formatCurrency(booking.totalPrice)}</span>
            </div>
            `}
          </div>

          <div style="background: #FFF3CD; border-left: 4px solid #FFC107; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <strong style="color: #856404;">⚠️ Important:</strong>
            <p style="margin: 5px 0 0; color: #856404;">Please bring a valid driver's license and a credit card for the security deposit at pickup.</p>
          </div>

          <p><strong>Contact Information:</strong><br>
          Name: ${booking.customerName}<br>
          Phone: ${booking.customerPhone}
          ${booking.customerEmail ? `<br>Email: ${booking.customerEmail}` : ''}</p>

          <p style="margin-top: 30px;">If you have any questions or need to modify your booking, please contact us:</p>
          <p style="text-align: center;">
            📞 +995 XXX XXX XXX<br>
            📧 info@rentalsgeorgia.com
          </p>

          <div class="footer">
            <p>We look forward to serving you!</p>
            <p style="font-size: 12px; color: #999; margin-top: 20px;">
              This is an automated confirmation email from Rentals Georgia.<br>
              Please do not reply to this email.
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const customerEmailText = `
Booking Confirmation - Rentals Georgia

Dear ${booking.customerName},

Your booking has been confirmed!

Booking Details:
- Booking ID: #${booking.bookingId.slice(0, 8).toUpperCase()}
- ${booking.bookingType === 'car' ? 'Vehicle' : 'Tour'}: ${vehicleName}
${booking.bookingType === 'car' ? `- Rental Type: ${booking.withDriver ? 'With Driver' : 'Self-Drive'}` : ''}
- Pick-up: ${formatDate(booking.startDate)} at ${booking.pickupTime}
- Drop-off: ${formatDate(booking.endDate)} at ${booking.dropoffTime}
${addons.length > 0 ? `- Add-ons: ${addons.join(', ')}` : ''}

Total Amount: ${formatCurrency(booking.totalPrice)}

Payment Information:
${booking.depositAmount > 0 ? `
- Deposit (15%): ${formatCurrency(booking.depositAmount)}
- Due at Pickup: ${formatCurrency(booking.remainingBalance)}
` : `
- Payment Method: Pay Full Amount at Pickup
- Amount Due: ${formatCurrency(booking.totalPrice)}
`}

Contact Information:
- Name: ${booking.customerName}
- Phone: ${booking.customerPhone}
${booking.customerEmail ? `- Email: ${booking.customerEmail}` : ''}

IMPORTANT: Please bring a valid driver's license and a credit card for the security deposit at pickup.

If you have any questions, please contact us:
Phone: +995 XXX XXX XXX
Email: info@rentalsgeorgia.com

We look forward to serving you!

---
This is an automated confirmation email from Rentals Georgia.
Please do not reply to this email.
  `;

  try {
    const emails = [];

    console.log('📋 Booking data received:', {
      bookingId: booking.bookingId,
      customerEmail: booking.customerEmail,
      customerName: booking.customerName,
    });

    // Send email to customer if email is provided
    console.log('🔍 Checking customer email:', booking.customerEmail, 'isValid:', isValidEmail(booking.customerEmail));
    if (booking.customerEmail && isValidEmail(booking.customerEmail)) {
      console.log('✅ Adding customer email to queue');
      emails.push(
        resend.emails.send({
          from: fromAddress,
          to: booking.customerEmail,
          subject: `Booking Confirmed - ${vehicleName} (#${booking.bookingId.slice(0, 8).toUpperCase()})`,
          text: customerEmailText,
          html: customerEmailHtml,
        })
      );
    } else {
      console.log('⚠️ Customer email skipped - invalid or missing');
    }

    // Send notification to admin if configured
    console.log('🔍 Checking admin email:', toAddress, 'isValid:', isValidEmail(toAddress));
    if (toAddress && isValidEmail(toAddress)) {
      console.log('✅ Adding admin notification email to queue');
      const adminHtml = `
        <div style="font-family: Arial, sans-serif; line-height: 1.5;">
          <h2 style="color: #FF6B6B;">🎉 New Booking Received</h2>
          <p><strong>Booking ID:</strong> #${booking.bookingId.slice(0, 8).toUpperCase()}</p>
          <p><strong>${booking.bookingType === 'car' ? 'Vehicle' : 'Tour'}:</strong> ${vehicleName}</p>
          <p><strong>Customer:</strong> ${booking.customerName}</p>
          <p><strong>Phone:</strong> ${booking.customerPhone}</p>
          ${booking.customerEmail ? `<p><strong>Email:</strong> ${booking.customerEmail}</p>` : ''}
          <p><strong>Pick-up:</strong> ${formatDate(booking.startDate)} at ${booking.pickupTime}</p>
          <p><strong>Drop-off:</strong> ${formatDate(booking.endDate)} at ${booking.dropoffTime}</p>
          ${booking.bookingType === 'car' ? `<p><strong>Rental Type:</strong> ${booking.withDriver ? 'With Driver' : 'Self-Drive'}</p>` : ''}
          ${addons.length > 0 ? `<p><strong>Add-ons:</strong> ${addons.join(', ')}</p>` : ''}
          <h3 style="color: #4ECDC4;">Payment Details</h3>
          ${booking.depositAmount > 0 ? `
            <p><strong>Deposit:</strong> ${formatCurrency(booking.depositAmount)}</p>
            <p><strong>Due at Pickup:</strong> ${formatCurrency(booking.remainingBalance)}</p>
          ` : `
            <p><strong>Payment Method:</strong> Full payment at pickup</p>
          `}
          <p style="font-size: 24px; font-weight: bold; color: #FF6B6B;"><strong>Total:</strong> ${formatCurrency(booking.totalPrice)}</p>
        </div>
      `;

      emails.push(
        resend.emails.send({
          from: fromAddress,
          to: toAddress,
          replyTo: booking.customerEmail && isValidEmail(booking.customerEmail) ? booking.customerEmail : undefined,
          subject: `[New Booking] ${vehicleName} - ${booking.customerName}`,
          html: adminHtml,
        })
      );
    } else {
      console.log('⚠️ Admin email skipped - toAddress missing or invalid');
    }

    console.log('📨 Total emails to send:', emails.length);

    if (emails.length === 0) {
      console.log('⚠️ No emails to send! Check environment variables and email addresses.');
      return res.status(200).json({ ok: true, warning: 'No emails were sent - check configuration' });
    }

    console.log('🚀 Sending emails via Resend...');
    const results = await Promise.all(emails);
    console.log('✅ Email results:', JSON.stringify(results));

    return res.status(200).json({ ok: true, emailsSent: emails.length, results });
  } catch (error) {
    console.error('❌ Failed to send booking confirmation email:', error);
    return res.status(500).json({ error: 'Failed to send confirmation email', details: String(error) });
  }
}
