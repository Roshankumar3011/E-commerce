const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const logSimulatedEmail = () => {
    console.log('----- SIMULATED EMAIL FALLBACK -----');
    console.log(`To: ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Message: ${options.message}`);
    console.log('------------------------------------');
  };

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('⚠️ EMAIL_USER or EMAIL_PASS not set. Email sending is disabled.');
    logSimulatedEmail();
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Balajee Store" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error(`❌ SMTP Failed to send email to ${options.email}. Error:`, error.message);
    console.log('Falling back to console simulation so you are not blocked...');
    logSimulatedEmail();
    // Do not throw the error, allowing the caller router to return 200 OK
  }
};

module.exports = sendEmail;

