import { Chat } from "../models/Chat.js"
import { Message } from "../models/Message.js"
import { User } from "../models/user.js"
import { sendEmail } from "../utils/mailer.js"
import sendWhatsApp from "../utils/sendWhatsApp.js" // custom util
import errGen from "../utils/errGen.js"
import respo from "../utils/respo.js"

// 🔹 Start or get chat between user & ambassador
export const startChat = async (req, res, next) => {
  try {
    const { ambassadorId } = req.body
    const userId = req.user.id

    let chat = await Chat.findOne({
      participants: { $all: [userId, ambassadorId] },
    })

    if (!chat) {
      chat = await Chat.create({ participants: [userId, ambassadorId] })
    }

    res.status(200).json(respo(true, "Chat started", chat))
  } catch (err) {
    next(err)
  }
}

// 🔹 Send a message
export const sendMessage = async (req, res, next) => {
  try {
    const { chatId, content, receiverId } = req.body
    const senderId = req.user.id

    if (!content) return next(errGen(400, "Message content required"))

    const message = await Message.create({
      chatId,
      sender: senderId,
      receiver: receiverId,
      content,
    })

    await Chat.findByIdAndUpdate(chatId, { lastMessage: content })

    // 🔔 Notify ambassador (email + WhatsApp)
    const ambassador = await User.findById(receiverId)
    if (ambassador) {
      if (ambassador.email) {
        try {
          await sendEmail(
            ambassador.email,
            "New Message",
            `You have a new message: "${content}"`
          )
        } catch (emailErr) {
          console.error("Email send failed:", emailErr.message)
        }
      }

      //   if (ambassador.phone) {
      //     await sendWhatsApp(
      //       ambassador.phone,
      //       `📩 New message from a user: "${content}"`
      //     )
      //   }
    }

    // ✅ Emit via socket.io
    req.io.to(receiverId.toString()).emit("newMessage", message)

    res.status(201).json(respo(true, "Message sent", message))
  } catch (err) {
    next(err)
  }
}

// 🔹 Get all messages in a chat
export const getMessages = async (req, res, next) => {
  try {
    const { chatId } = req.params
    const messages = await Message.find({ chatId }).populate(
      "sender receiver",
      "name email role"
    )

    res.status(200).json(respo(true, "Messages fetched", messages))
  } catch (err) {
    next(err)
  }
}

// 🔹 Get all chats for current user (user or ambassador)
export const getMyChats = async (req, res, next) => {
  try {
    const chats = await Chat.find({ participants: req.user.id })
      .populate("participants", "name email role profileImage")
      .sort({ updatedAt: -1 })

    res.status(200).json(respo(true, "Chats fetched", chats))
  } catch (err) {
    next(err)
  }
}

// 🔹 Delete chat (admin only or participant)
export const deleteChat = async (req, res, next) => {
  try {
    const { chatId } = req.params

    await Chat.findByIdAndDelete(chatId)
    await Message.deleteMany({ chatId })

    res.status(200).json(respo(true, "Chat deleted"))
  } catch (err) {
    next(err)
  }
}
