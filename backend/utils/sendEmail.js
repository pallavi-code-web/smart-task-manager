import nodemailer from "nodemailer";

const sendEmail = async ({ to, subject, text }) => {
  // 🔍 ENV CHECK (VERY IMPORTANT)
  console.log("EMAIL_USER:", process.env.EMAIL_USER ? "OK" : "MISSING");
  console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "OK" : "MISSING");

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // Gmail App Password
    },
  });

  // 🔍 TRANSPORTER VERIFY
  transporter.verify((error, success) => {
    if (error) {
      console.log("❌ Email transporter error:", error);
    } else {
      console.log("✅ Email transporter ready");
    }
  });

  try {
    await transporter.sendMail({
      from: `"SmartTask" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    });

    console.log("✅ Email sent successfully to:", to);
  } catch (error) {
    console.log("❌ Failed to send email:", error);
    throw new Error("Email sending failed");
  }
};

export default sendEmail;
