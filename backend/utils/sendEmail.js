import dotenv from "dotenv";
dotenv.config();

import nodemailer from "nodemailer";

const sendEmail = async ({ to, subject, text }) => {
  try {
    console.log("EMAIL USER:", process.env.EMAIL_USER);
    console.log("EMAIL PASS:", process.env.EMAIL_PASS ? "Loaded ✅" : "Missing ❌");

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"SmartTask OTP" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    });

    console.log("✅ OTP sent to:", to);
  } catch (error) {
    console.error("❌ Gmail SMTP ERROR:", error);
    throw new Error("Email failed");
  }
};

export default sendEmail;
