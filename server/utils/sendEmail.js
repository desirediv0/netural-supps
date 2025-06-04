import nodemailer from "nodemailer";
import { ApiError } from "./ApiError.js";

const sendEmail = async (options) => {
  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Set email options
    const mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME || "GenuineNutrition"} <${
        process.env.FROM_EMAIL
      }>`,
      to: options.email,
      subject: options.subject,
      html: options.html,
      attachments: options.attachments || [],
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    return info;
  } catch (error) {
    console.error("Email sending error:", error);
    throw new ApiError(500, "Failed to send email");
  }
};

export default sendEmail;
