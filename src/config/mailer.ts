import nodemailer from 'nodemailer';
import { env } from './env';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  secure: false,
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS
  }
});

export async function sendVerificationEmail(to: string, token: string) {
  const base = process.env.APP_BASE_URL?.replace(/\/$/, '') || '';
  const verifyUrl = `${base}api/auth/verify-email?token=${encodeURIComponent(token)}`;

  const mail = {
    from: process.env.EMAIL_FROM,
    to,
    subject: 'Verify your email',
    html: `
      <p>Hi,</p>
      <p>Click the link below to verify your email address:</p>
      <p><a href="${verifyUrl}">${verifyUrl}</a></p>
      <p>If you didn't request this, ignore this email.</p>
    `
  };

  return transporter.sendMail(mail);
}
