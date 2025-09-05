import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER, // your email
    pass: process.env.MAIL_PASS, // app password (not your real password)
  },
})

export const sendEmail = async (to, subject, text) => {
  await transporter.sendMail({
    from: `"LeadX App" <${process.env.MAIL_USER}>`,
    to,
    subject,
    text,
  })
}
