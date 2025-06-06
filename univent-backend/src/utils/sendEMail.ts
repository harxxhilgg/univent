// @ts-nocheck
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const isDev = process.env.NODE_ENV === "development";

const transporter = isDev
  ? nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || "1025"),
      secure: false,
      auth: null,
    })
  : nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_EMAIL,
        pass: process.env.GMAIL_PASSWORD,
      },
    });

const sendEmail = async (to: string, subject: string, html: string) => {
  const mailOptions = {
    from: isDev ? process.env.EMAIL_FROM : process.env.GMAIL_EMAIL,
    to,
    subject,
    html,
  };

  await transporter.sendMail(mailOptions);
};

export default { sendEmail };
