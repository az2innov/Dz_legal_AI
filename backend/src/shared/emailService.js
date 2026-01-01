const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Lexya Security" <${process.env.EMAIL_FROM}>`,
      to: to,
      subject: subject,
      text: text,
      html: html // Version HTML plus jolie
    });
    console.log("📧 Email envoyé : %s", info.messageId);
    return info;
  } catch (error) {
    console.error("🚨 Erreur envoi email :", error);
    throw new Error("Impossible d'envoyer l'email.");
  }
};

module.exports = { sendEmail };