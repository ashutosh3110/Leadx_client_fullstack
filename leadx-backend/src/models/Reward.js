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
      enum: ["INR", "USD"],
      required: true,
    },
    status: {
      type: String,
      enum: ["added", "notAdded", "paid"],
      default: "pending",
    },
    remarks: { type: String },
  },
  { timestamps: true }
)

const Reward = mongoose.model("Reward", rewardSchema)

export default Reward
