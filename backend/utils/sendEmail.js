import nodemailer from "nodemailer";

const sendEmail = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"SmartTask" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    });

    console.log("📧 Email sent successfully");
  } catch (error) {
    console.error("EMAIL ERROR:", error);
    throw error;
  }
};

export default sendEmail;
