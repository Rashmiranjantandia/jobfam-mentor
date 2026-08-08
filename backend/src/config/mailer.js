const nodemailer = require('nodemailer');

let transporter;

/**
 * initMailer — called once at server startup.
 * Creates a free Ethereal test account automatically (no signup needed).
 * Every email sent will print a preview URL in the console — open it to
 * see the rendered email exactly as a real inbox would show it.
 */
const initMailer = async () => {
  try {
    const testAccount = await nodemailer.createTestAccount();

    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    console.log('─────────────────────────────────────────────');
    console.log('📧  Ethereal SMTP ready');
    console.log(`    User : ${testAccount.user}`);
    console.log(`    Pass : ${testAccount.pass}`);
    console.log('    Preview links will appear here on each send.');
    console.log('─────────────────────────────────────────────');
  } catch (err) {
    // Non-fatal — log and continue; email simply won't send if Ethereal is down
    console.error('Mailer init failed (non-fatal):', err.message);
  }
};

/**
 * sendMail — thin helper used by the booking controller.
 * Logs the Ethereal preview URL so you can inspect the email without a real inbox.
 */
const sendMail = async (to, subject, html) => {
  if (!transporter) {
    console.warn('Mailer not ready — skipping email to', to);
    return;
  }

  try {
    const info = await transporter.sendMail({
      from: '"Jobfam Mentor Booking" <no-reply@jobfam.example>',
      to,
      subject,
      html,
    });

    // nodemailer.getTestMessageUrl returns the Ethereal preview link
    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log(`📬  Email sent to ${to} — Preview: ${previewUrl}`);
  } catch (err) {
    console.error(`Email to ${to} failed:`, err.message);
  }
};

module.exports = { initMailer, sendMail };
