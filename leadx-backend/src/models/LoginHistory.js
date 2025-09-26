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
    name: String,
    region: String,
    city: String,
    isp: String,
    loginTime: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

export const LoginHistory = mongoose.model("LoginHistory", loginHistorySchema)
