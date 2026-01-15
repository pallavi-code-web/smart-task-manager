import nodemailer from "nodemailer";

const sendEmail = async ({ to, subject, text }) => {
  // 1. Create a fake test email account
  const testAccount = await nodemailer.createTestAccount();

  // 2. Create transporter
  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  // 3. Send mail
  const info = await transporter.sendMail({
    from: '"SmartTask" <no-reply@smarttask.com>',
    to,
    subject,
    text,
  });

  // 4. VERY IMPORTANT: show preview link in logs
  console.log("📨 Email Preview URL:", nodemailer.getTestMessageUrl(info));
};

export default sendEmail;
