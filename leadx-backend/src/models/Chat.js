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
    lastMessage: { type: String },
  },
  { timestamps: true }
)

export const Chat = mongoose.model("Chat", chatSchema)
