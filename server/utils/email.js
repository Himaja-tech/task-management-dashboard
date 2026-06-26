import nodemailer from "nodemailer";

let cachedTransporter;

const getTransporter = () => {
  if (cachedTransporter) {
    return cachedTransporter;
  }

  if (process.env.EMAIL_REMINDERS_ENABLED !== "true") {
    return null;
  }

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("Email reminders are enabled, but SMTP_HOST, SMTP_USER, or SMTP_PASS is missing.");
    return null;
  }

  cachedTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  return cachedTransporter;
};

export const sendReminderEmail = async ({ to, subject, text }) => {
  const transporter = getTransporter();

  if (!transporter || !to) {
    return false;
  }

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || "WorkPulse <no-reply@workpulse.local>",
      to,
      subject,
      text
    });

    return true;
  } catch (error) {
    console.warn(`Unable to send reminder email to ${to}: ${error.message}`);
    return false;
  }
};
