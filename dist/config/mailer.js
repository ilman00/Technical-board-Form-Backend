"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendVerificationEmail = sendVerificationEmail;
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_1 = require("./env");
const transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    secure: false,
    auth: {
        user: env_1.env.EMAIL_USER,
        pass: env_1.env.EMAIL_PASS
    }
});
async function sendVerificationEmail(to, token) {
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
