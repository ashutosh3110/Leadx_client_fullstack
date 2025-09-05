import twilio from "twilio"

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

const WHATSAPP_FROM = process.env.TWILIO_FROM_NUMBER // e.g. whatsapp:+14155238886

export default async function sendWhatsApp(to, message) {
  try {
    const res = await client.messages.create({
      from: `whatsapp:${WHATSAPP_FROM}`,
      to: `whatsapp:${to}`, // must include country code, e.g. whatsapp:+919876543210
      body: message,
    })

    console.log("✅ WhatsApp message sent:", res.sid)
    return res
  } catch (err) {
    console.error("❌ WhatsApp send error:", err.message)
    throw new Error("WhatsApp sending failed")
  }
}
