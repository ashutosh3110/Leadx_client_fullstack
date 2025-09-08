import { Chat } from "../models/Chat.js"
import { Message } from "../models/Message.js"
import { User } from "../models/user.js"
import { sendEmail } from "../utils/mailer.js"
import sendWhatsApp from "../utils/sendWhatsApp.js" // optional
import errGen from "../utils/errGen.js"
import respo from "../utils/respo.js"
import { onlineUsers } from "../sockets/chatSocket.js"

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

    const populatedChat = await Chat.findById(chat._id).populate(
      "participants",
      "name email role profileImage"
    )

    res.status(200).json(respo(true, "Chat started", populatedChat))
  } catch (err) {
    next(err)
  }
}

// 🔹 Send a message
export const sendMessage = async (req, res) => {
  try {
    const { chatId, sender, receiver, content } = req.body

    if (!chatId || !sender || !receiver || !content) {
      return res.status(400).json({
        success: false,
        message: "chatId, sender, receiver and content are required",
      })
    }

    const newMessage = await Message.create({
      chatId,
      sender,
      receiver,
      content,
    })

    // ✅ Populate sender/receiver before returning
    const populatedMessage = await Message.findById(newMessage._id).populate(
      "sender receiver",
      "name email role profileImage"
    )

    // ✅ Update chat last activity
    await Chat.findByIdAndUpdate(chatId, { updatedAt: new Date() })

    // ✅ Check if receiver is online
    const receiverSocket = onlineUsers.get(receiver.toString())
    if (receiverSocket) {
      receiverSocket.emit("newMessage", populatedMessage)
    } else {
      const ambassador = await User.findById(receiver)
      if (ambassador?.email) {
        await sendEmail(
          ambassador.email,
          "📩 New Message on LeadX",
          `You received a new message: ${content}`
        )
      }
    }

    return res.json({ success: true, message: populatedMessage })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

// 🔹 Edit message
export const editMessage = async (req, res) => {
  try {
    const { messageId } = req.params
    const { content } = req.body

    if (!content) {
      return res
        .status(400)
        .json({ success: false, message: "Content required" })
    }

    const msg = await Message.findById(messageId)
    if (!msg)
      return res
        .status(404)
        .json({ success: false, message: "Message not found" })

    if (String(msg.sender) !== String(req.user.id)) {
      return res.status(403).json({ success: false, message: "Not allowed" })
    }

    msg.content = content
    await msg.save()

    const populatedMsg = await Message.findById(msg._id).populate(
      "sender receiver",
      "name email role profileImage"
    )

    // socket broadcast bhi update ke liye
    const receiverSocket = onlineUsers.get(msg.receiver.toString())
    if (receiverSocket) {
      receiverSocket.emit("messageUpdated", populatedMsg)
    }

    return res.json({ success: true, message: populatedMsg })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, message: error.message })
  }
}

// 🔹 Delete message
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params

    const msg = await Message.findById(messageId)
    if (!msg)
      return res
        .status(404)
        .json({ success: false, message: "Message not found" })

    if (String(msg.sender) !== String(req.user.id)) {
      return res.status(403).json({ success: false, message: "Not allowed" })
    }

    await msg.deleteOne()

    // socket broadcast delete ke liye
    const receiverSocket = onlineUsers.get(msg.receiver.toString())
    if (receiverSocket) {
      receiverSocket.emit("messageDeleted", msg._id)
    }

    return res.json({ success: true, message: "Message deleted" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, message: error.message })
  }
}

// 🔹 Get all messages in a chat
export const getMessages = async (req, res, next) => {
  try {
    const { chatId } = req.params
    const messages = await Message.find({ chatId })
      .populate("sender receiver", "name email role profileImage")
      .sort({ createdAt: 1 })

    res.status(200).json(respo(true, "Messages fetched", messages))
  } catch (err) {
    next(err)
  }
}

// 🔹 Get all chats for current user
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

// 🔹 Delete chat
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
