import dotenv from "dotenv";
dotenv.config();

import SibApiV3Sdk from "sib-api-v3-sdk";

const client = SibApiV3Sdk.ApiClient.instance;
const apiKey = client.authentications["api-key"];
apiKey.apiKey = process.env.BREVO_API_KEY;

const tranEmailApi = new SibApiV3Sdk.TransactionalEmailsApi();

const sendEmail = async ({ to, subject, text }) => {
  try {
    await tranEmailApi.sendTransacEmail({
      sender: {
        email: "dappupallavi91@gmail.com",
        name: "SmartTask",
      },
      to: [{ email: to }],
      subject,
      textContent: text,
    });

    console.log("✅ OTP sent via Brevo API");
  } catch (err) {
    console.error("❌ Brevo API Error:", err.response?.body || err);
    throw new Error("Email failed");
  }
};

export default sendEmail;
