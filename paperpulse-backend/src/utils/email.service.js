const nodemailer = require("nodemailer");

/**
 * Minimal Email Service for system notifications.
 * Strictly uses Gmail SMTP with environment variables.
 */

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send email delivery channel.
 * Throws error if fails. Error handling must happen at call-site.
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} text - Plain text content
 */
const sendEmail = async (to, subject, text) => {
  if (!to) return; // Silent skip if no recipient

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
  };

  return await transporter.sendMail(mailOptions);
};

module.exports = { sendEmail };
