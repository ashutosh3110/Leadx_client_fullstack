import mongoose from "mongoose"

const loginHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ip: String,
    region: String,
    city: String,
    isp: String,
    browser: String,
    os: String,
    device: String,
  },
  { timestamps: true }
)

export const LoginHistory = mongoose.model("LoginHistory", loginHistorySchema)
