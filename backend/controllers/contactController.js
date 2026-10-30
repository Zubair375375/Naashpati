import { validationResult } from "express-validator";
import { sendEmail } from "../utils/sendEmail.js";

const ADMIN_CONTACT_EMAIL = process.env.ADMIN_CONTACT_EMAIL;

export const sendContactMessage = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error:
          errors.array()[0]?.msg || "Please provide valid contact details.",
      });
    }

    const { name, phone, email, comment, orderId } = req.body;
    const customerName = String(name || "").trim();
    const customerEmail = String(email || "").trim();
    const phoneNumber = String(phone || "").trim();
    const customerComment = String(comment || "").trim();
    const currentOrderId = String(orderId || "").trim();

    if (!customerName || !customerEmail || !customerComment) {
      return res.status(400).json({
        success: false,
        error: "Name, email, and message are required.",
      });
    }

    const emailBody = [
      "New contact form message from Naashpati website",
      "",
      `Name: ${customerName}`,
      `Email: ${customerEmail}`,
      `Phone: ${phoneNumber || "Not provided"}`,
      `Order ID: ${currentOrderId || "Not provided"}`,
      "",
      "Message:",
      customerComment,
    ].join("\n");

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
        <h2 style="margin-bottom: 12px; color: #111827;">New contact form message</h2>
        <p><strong>Name:</strong> ${customerName}</p>
        <p><strong>Email:</strong> ${customerEmail}</p>
        <p><strong>Phone:</strong> ${phoneNumber || "Not provided"}</p>
        <p><strong>Order ID:</strong> ${currentOrderId || "Not provided"}</p>
        <p><strong>Message:</strong></p>
        <p style="white-space: pre-wrap; background: #f3f4f6; padding: 12px; border-radius: 8px;">${customerComment}</p>
      </div>
    `;

    await sendEmail({
      email: ADMIN_CONTACT_EMAIL,
      replyTo: customerEmail,
      subject: `New message from ${customerName} via Naashpati contact form`,
      text: emailBody,
      html: htmlBody,
    });

    return res.status(200).json({
      success: true,
      message: "Your message has been sent successfully.",
    });
  } catch (error) {
    console.error("Contact form email error:", error);
    return res.status(500).json({
      success: false,
      error:
        error?.message ||
        "Unable to send your message right now. Please try again later.",
    });
  }
};
