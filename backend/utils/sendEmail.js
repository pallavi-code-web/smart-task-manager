import dotenv from "dotenv";
dotenv.config();

import nodemailer from "nodemailer";

const sendEmail = async ({ to, subject, text }) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.BREVO_SMTP_USER,
        pass: process.env.BREVO_SMTP_KEY,
      },
    });

    await transporter.sendMail({
      from: `"${process.env.BREVO_SENDER_NAME}" <${process.env.BREVO_SENDER_EMAIL}>`,
      to,
      subject,
      text,
    });

    console.log("✅ OTP sent to:", to);
  } catch (error) {
    console.error("❌ Brevo SMTP ERROR:", error);
    throw new Error("Email failed");
  }
};

export default sendEmail;
