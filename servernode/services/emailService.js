const nodemailer = require('nodemailer');

/**
 * Send an email using SMTP settings provided by the user.
 * 
 * @param {Object} smtpSettings - The SMTP configuration object.
 * @param {Object} emailData - Data for the email (to, subject, html).
 */
exports.sendEmail = async (smtpSettings, emailData) => {
  if (!smtpSettings || !smtpSettings.host || !smtpSettings.user || !smtpSettings.pass) {
    throw new Error('SMTP settings are not configured or incomplete.');
  }

  const transporter = nodemailer.createTransport({
    host: smtpSettings.host,
    port: smtpSettings.port,
    secure: smtpSettings.secure, // true for 465, false for other ports
    auth: {
      user: smtpSettings.user,
      pass: smtpSettings.pass,
    },
  });

  const mailOptions = {
    from: `${smtpSettings.fromName} <${smtpSettings.fromEmail || smtpSettings.user}>`,
    to: emailData.to,
    subject: emailData.subject || smtpSettings.templateTitle,
    html: emailData.html,
  };

  return await transporter.sendMail(mailOptions);
};

/**
 * Replace placeholders in the email template.
 * 
 * @param {string} template - The template string with placeholders like {{candidate_name}}.
 * @param {Object} data - The data object to replace placeholders.
 */
exports.formatTemplate = (template, data) => {
  let formatted = template;
  for (const key in data) {
    const placeholder = new RegExp(`{{${key}}}`, 'g');
    formatted = formatted.replace(placeholder, data[key]);
  }
  return formatted;
};
