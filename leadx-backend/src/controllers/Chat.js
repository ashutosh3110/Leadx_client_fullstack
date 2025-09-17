import { Chat } from "../models/Chat.js"
import { Message } from "../models/Message.js"
import { User } from "../models/user.js"
import { sendEmail } from "../utils/mailer.js"
import sendWhatsApp from "../utils/sendWhatsApp.js"
import errGen from "../utils/errGen.js"
import respo from "../utils/respo.js"
import { onlineUsers } from "../sockets/chatSocket.js"
import bcrypt from "bcryptjs"
import crypto from "crypto"
// helper to generate random password
const generatePassword = () => crypto.randomBytes(4).toString("hex")
// startChat controller update
export const startChat = async (req, res, next) => {
  try {
    const { ambassadorId, name, email, phone } = req.body

    let user = await User.findOne({ email })
    if (!user) {
      const plainPassword = generatePassword()
      const hashedPassword = await bcrypt.hash(plainPassword, 10)

      user = await User.create({
        name,
        email,
        phone,
        role: "user",
        password: hashedPassword,
      })

      // send password via email (placeholder)
      if (email) {
        await sendEmail(
          email,
          "Welcome to LeadX",
          `Hello ${name},\n\nYour account has been created.\nLogin with:\nEmail: ${email}\nPassword: ${plainPassword}`
        )
      }

      // send password via WhatsApp (placeholder)
      if (phone) {
        await sendWhatsApp(
          phone,
          `Hello ${name}, welcome to LeadX!\n\nYour login details:\nEmail: ${email}\nPassword: ${plainPassword}`
        )
      }
    }

    let chat = await Chat.findOne({
      participants: { $all: [user._id, ambassadorId] },
    })

    if (!chat) {
      chat = await Chat.create({ participants: [user._id, ambassadorId] })
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
    const { chatId, receiver, content } = req.body
    const sender = req.user.id

    if (!chatId || !receiver || !content) {
      return res.status(400).json({
        success: false,
        message: "chatId, receiver and content are required",
      })
    }

    const newMessage = await Message.create({
      chatId,
      sender,
      receiver,
      content,
    })

    const populatedMessage = await Message.findById(newMessage._id).populate(
      "sender receiver",
      "name email role profileImage phone"
    )

    await Chat.findByIdAndUpdate(chatId, {
      updatedAt: new Date(),
      lastMessage: newMessage._id,
    })

    // emit to receiver if online
    const receiverSocket = onlineUsers.get(receiver.toString())
    if (receiverSocket) {
      receiverSocket.emit("newMessage", populatedMessage)
    } else {
      const receiverUser = await User.findById(receiver)

      // fallback to email
      if (receiverUser?.email) {
        await sendEmail(
          receiverUser.email,
          "📩 New Message on LeadX",
          `You received a new message: ${content}`
        )
      }

      // fallback to WhatsApp
      if (receiverUser?.phone) {
        await sendWhatsApp(
          receiverUser.phone,
          `New message from ${populatedMessage.sender.name}: ${content}`
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
      .populate({
        path: "lastMessage",
        select: "content sender createdAt",
        populate: {
          path: "sender",
          select: "name email profileImage",
        },
      })
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

// ==========================
// ADMIN HELPERS
// ==========================

// 🔹 Admin: Get chats of any ambassador
export const adminGetChatsByAmbassador = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") return next(errGen(403, "Forbidden"))
    const { ambassadorId } = req.params
    const chats = await Chat.find({ participants: ambassadorId })
      .populate("participants", "name email role profileImage")
      .populate({
        path: "lastMessage",
        select: "content sender createdAt",
        populate: { path: "sender", select: "name email profileImage" },
      })
      .sort({ updatedAt: -1 })
    res.status(200).json(respo(true, "Chats fetched", chats))
  } catch (err) {
    next(err)
  }
}

// 🔹 Admin: Get messages of a chat (any)
export const adminGetMessages = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") return next(errGen(403, "Forbidden"))
    const { chatId } = req.params
    const messages = await Message.find({ chatId })
      .populate("sender receiver", "name email role profileImage")
      .sort({ createdAt: 1 })
    res.status(200).json(respo(true, "Messages fetched", messages))
  } catch (err) {
    next(err)
  }
}

// 🔹 Admin: Send message as ambassador (impersonate)
export const adminSendAsAmbassador = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") return next(errGen(403, "Forbidden"))
    const { chatId, asAmbassadorId, toUserId, content } = req.body
    if (!chatId || !asAmbassadorId || !toUserId || !content) {
      return res
        .status(400)
        .json(
          respo(false, "chatId, asAmbassadorId, toUserId, content required")
        )
    }

    const newMessage = await Message.create({
      chatId,
      sender: asAmbassadorId,
      receiver: toUserId,
      content,
    })

    const populatedMessage = await Message.findById(newMessage._id).populate(
      "sender receiver",
      "name email role profileImage"
    )

    await Chat.findByIdAndUpdate(chatId, {
      updatedAt: new Date(),
      lastMessage: newMessage._id,
    })

    const receiverSocket = onlineUsers.get(toUserId.toString())
    if (receiverSocket) {
      receiverSocket.emit("newMessage", populatedMessage)
    }

    res.status(200).json(respo(true, "Message sent", populatedMessage))
  } catch (err) {
    next(err)
  }
}
