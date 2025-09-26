import mongoose from "mongoose"

const { Schema } = mongoose

const chatSchema = new Schema(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User", // User or Ambassador
        required: true,
      },
    ],
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message", // ✅ Reference to Message model
    },
  },
  { timestamps: true }
)

export const Chat = mongoose.model("Chat", chatSchema)
