import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
const fromAddress = process.env.RESEND_FROM;
const toAddress = process.env.CONTACT_TO_EMAIL;

const resend = new Resend(resendApiKey);

const isValidEmail = (value: unknown): value is string =>
  typeof value === 'string' && value.includes('@');

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

  if (!resendApiKey || !fromAddress || !toAddress) {
    return res.status(500).json({ error: 'Missing email configuration' });
  }

  const { name, email, phone, subject, message } = req.body ?? {};

  if (!name || !isValidEmail(email) || !subject || !message) {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  const safePhone = typeof phone === 'string' && phone.trim() ? phone.trim() : 'N/A';

  try {
    await resend.emails.send({
      from: fromAddress,
      to: toAddress,
      replyTo: email,
      subject: `[Contact] ${subject}`,
      text: [
        `Name: ${name}`,
        `Email: ${email}`,
        `Phone: ${safePhone}`,
        '',
        message,
      ].join('\n'),
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5;">
          <h2 style="margin: 0 0 12px;">New contact message</h2>
          <p style="margin: 0 0 6px;"><strong>Name:</strong> ${name}</p>
          <p style="margin: 0 0 6px;"><strong>Email:</strong> ${email}</p>
          <p style="margin: 0 0 6px;"><strong>Phone:</strong> ${safePhone}</p>
          <p style="margin: 0 0 12px;"><strong>Subject:</strong> ${subject}</p>
          <p style="margin: 0;">${message.replace(/\n/g, '<br />')}</p>
        </div>
      `,
    });

    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to send email' });
  }
}
