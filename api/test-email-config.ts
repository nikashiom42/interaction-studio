import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
const fromAddress = process.env.RESEND_FROM;
const bookingNotificationEmail = process.env.BOOKING_NOTIFICATION_EMAIL;
const contactToEmail = process.env.CONTACT_TO_EMAIL;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow GET for easy browser testing
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Use GET method' });
  }

  const config = {
    RESEND_API_KEY: resendApiKey
      ? `✅ Set (${resendApiKey.substring(0, 8)}...)`
      : '❌ MISSING',
    RESEND_FROM: fromAddress || '❌ MISSING',
    BOOKING_NOTIFICATION_EMAIL: bookingNotificationEmail || '❌ MISSING',
    CONTACT_TO_EMAIL: contactToEmail || '⚠️ Not set (optional)',
  };

  // Check if we should send a test email
  const sendTest = req.query.send === 'true';
  const testEmail = req.query.to as string;

  if (sendTest && testEmail) {
    if (!resendApiKey || !fromAddress) {
      return res.status(400).json({
        config,
        testResult: '❌ Cannot send test - missing RESEND_API_KEY or RESEND_FROM',
      });
    }

    try {
      const resend = new Resend(resendApiKey);
      const result = await resend.emails.send({
        from: fromAddress,
        to: testEmail,
        subject: 'Test Email from Rentals Georgia',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #FF6B6B;">✅ Email Configuration Working!</h2>
            <p>This is a test email from your Rentals Georgia booking system.</p>
            <p>If you received this, your email configuration is correct.</p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px;">
              Sent from: ${fromAddress}<br>
              Timestamp: ${new Date().toISOString()}
            </p>
          </div>
        `,
      });

      return res.status(200).json({
        config,
        testResult: '✅ Email sent successfully!',
        emailId: result.data?.id,
      });
    } catch (error) {
      return res.status(500).json({
        config,
        testResult: '❌ Failed to send email',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return res.status(200).json({
    config,
    usage: {
      checkConfig: 'GET /api/test-email-config',
      sendTest: 'GET /api/test-email-config?send=true&to=your@email.com',
    },
    tips: [
      'RESEND_FROM domain must be verified at resend.com/domains',
      'For testing, use: RESEND_FROM=onboarding@resend.dev (only sends to your Resend account email)',
      'Check Vercel function logs for detailed error messages',
    ],
  });
}
