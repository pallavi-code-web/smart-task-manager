import nodemailer from "nodemailer";

const sendEmail = async ({ to, subject, text }) => {
  try {
    // ✅ BREVO SMTP TRANSPORTER
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,        // smtp-relay.brevo.com
      port: Number(process.env.SMTP_PORT), // 587
      secure: false, // MUST be false for port 587
      auth: {
        user: process.env.SMTP_USER,      // a02c5xxxx@smtp-brevo.com
        pass: process.env.SMTP_PASS,      // SMTP password
      },
    });

    // ✅ EMAIL OPTIONS
    const mailOptions = {
      from: `"SmartTask" <${process.env.FROM_EMAIL}>`,
      to,
      subject,
      text,
    };

    // ✅ SEND MAIL
    const info = await transporter.sendMail(mailOptions);

    console.log("✅ Email sent:", info.messageId);
  } catch (error) {
    console.error("❌ Email send error:", error);
    throw error;
  }
};

export default sendEmail;
