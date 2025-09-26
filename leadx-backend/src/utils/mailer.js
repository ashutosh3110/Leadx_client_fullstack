import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // SSL required
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS, // ✅ App password
  },
})

export const sendEmail = async (to, subject, text) => {
  try {
    // Check if email credentials are configured
    if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
      console.log("⚠️ Email credentials not configured, skipping email notification")
      return { success: false, error: "Email credentials not configured" }
    }

    const info = await transporter.sendMail({
      from: `"LeadX App" <${process.env.MAIL_USER}>`,
      to,
      subject,
      text,
    })
    console.log("✅ Email sent:", info.messageId)
    return { success: true }
  } catch (err) {
    console.error("❌ Email send failed:", err.message)
    return { success: false, error: err.message }
  }
}
