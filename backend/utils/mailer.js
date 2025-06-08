const nodemailer = require('nodemailer');
const transport = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: +process.env.SMTP_PORT,
  secure: false, // true si usas 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

async function sendMail({ to, subject, html, attachments }) {
  return transport.sendMail({
    from: `"Silvana" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
    attachments
  });
}

module.exports = { sendMail };
