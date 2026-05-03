// Module: utils/systemEmail.js - Quản lý logic hệ thống
const nodemailer = require('nodemailer');

/**
 * Send a system email (e.g., Forgot Password) using .env SMTP settings.
 */
exports.sendSystemEmail = async (emailData) => {
  const host = process.env.EMAIL_HOST;
  const port = process.env.EMAIL_PORT || 587;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  const from = process.env.EMAIL_FROM || user;

  if (!host || !user || !pass) {
    console.warn('System SMTP settings are not configured in .env. Email will not be sent.');
    return null;
  }

  const transporter = nodemailer.createTransport({
    host,
    port: parseInt(port),
    secure: port == 465,
    auth: { user, pass },
  });

  const mailOptions = {
    from: `"CV Job Board System" <${from}>`,
    to: emailData.to,
    subject: emailData.subject,
    html: emailData.html,
  };

  return await transporter.sendMail(mailOptions);
};

// Git update: Triggering change for push
