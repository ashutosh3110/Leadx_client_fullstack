import mongoose from "mongoose"
const { Schema } = mongoose

const rewardSchema = new Schema(
  {
    ambassador: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      enum: [
        "INR", "USD", "GBP", "CAD", "AUD", "EUR", "JPY", "CNY", "KRW", 
        "BRL", "MXN", "RUB", "ZAR", "SGD", "HKD", "AED", "SAR", "TRY", 
        "THB", "MYR", "IDR", "PHP", "VND", "BDT", "PKR", "LKR", "NPR", 
        "BTN", "MMK", "KHR", "LAK"
      ],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "paid"],
      default: "pending",
    },
    remarks: { type: String },
  },
  { timestamps: true }
)

const Reward = mongoose.model("Reward", rewardSchema)

export default Reward
