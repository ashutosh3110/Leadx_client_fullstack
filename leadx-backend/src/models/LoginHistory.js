// models/loginHistory.js
import mongoose from "mongoose"

const loginHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ipAddress: String,
    region: String,
    city: String,
    isp: String,
    loginTime: Date,
    browser: String,
    os: String,
    device: String,
  },
  { timestamps: true }
)

export const LoginHistory = mongoose.model("LoginHistory", loginHistorySchema)
