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

      // fallback to email (optional - don't fail if email service is not configured)
      if (receiverUser?.email) {
        try {
          const emailResult = await sendEmail(
            receiverUser.email,
            "📩 New Message on LeadX",
            `You received a new message: ${content}`
          )
          if (emailResult.success) {
            console.log("✅ Email notification sent successfully")
          } else {
            console.log("⚠️ Email notification failed, but continuing...")
          }
        } catch (emailError) {
          console.log("⚠️ Email service not configured or failed:", emailError.message)
        }
      }

      // fallback to WhatsApp (optional - don't fail if WhatsApp service is not configured)
      if (receiverUser?.phone) {
        try {
          await sendWhatsApp(
            receiverUser.phone,
            `New message from ${populatedMessage.sender.name}: ${content}`
          )
          console.log("✅ WhatsApp notification sent successfully")
        } catch (whatsappError) {
          console.log("⚠️ WhatsApp service not configured or failed:", whatsappError.message)
        }
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

    // Check if message is within 5-minute edit window
    const messageTime = new Date(msg.createdAt);
    const currentTime = new Date();
    const timeDifference = currentTime - messageTime;
    const fiveMinutesInMs = 5 * 60 * 1000; // 5 minutes in milliseconds

    if (timeDifference > fiveMinutesInMs) {
      return res.status(403).json({ 
        success: false, 
        message: "Message can only be edited within 5 minutes of sending" 
      })
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

// 🔹 Admin: Get chat statistics with time filter
export const adminGetChatStats = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") return next(errGen(403, "Forbidden"))

    const { hours = 24, type = 'all' } = req.query
    const hoursAgo = new Date(Date.now() - hours * 60 * 60 * 1000)

    // Build query based on time filter
    const timeQuery = { createdAt: { $gte: hoursAgo } }

    // Get all messages in the time period
    const allMessages = await Message.find(timeQuery)
      .populate("sender", "name email role")

    // Separate messages by type (ambassador vs student)
    let filteredMessages = allMessages

    if (type === 'ambassador') {
      // Messages where sender is ambassador or receiver is ambassador
      filteredMessages = allMessages.filter(msg => 
        msg.sender?.role === 'ambassador' || 
        (typeof msg.receiver === 'object' && msg.receiver?.role === 'ambassador')
      )
    } else if (type === 'student') {
      // Messages where sender is not ambassador (student/user)
      filteredMessages = allMessages.filter(msg => 
        msg.sender?.role !== 'ambassador' && 
        (typeof msg.receiver === 'object' ? msg.receiver?.role !== 'ambassador' : true)
      )
    }

    // Group messages by chatId to get conversations
    const conversations = {}
    filteredMessages.forEach(message => {
      const chatId = message.chatId.toString()
      if (!conversations[chatId]) {
        conversations[chatId] = {
          messages: [],
          hasReply: false,
          isFormSubmission: message.isFormSubmission || false
        }
      }
      conversations[chatId].messages.push(message)
      
      // Check if conversation has a reply (message from ambassador or admin)
      if (message.sender?.role === 'ambassador' || message.sender?.role === 'admin' || message.isAdminReply) {
        conversations[chatId].hasReply = true
      }
    })

    const totalChats = Object.keys(conversations).length
    const unrepliedChats = Object.values(conversations).filter(conv => !conv.hasReply).length
    const repliedChats = totalChats - unrepliedChats

    res.status(200).json(respo(true, "Chat statistics fetched", {
      totalChats,
      unrepliedChats,
      repliedChats,
      timeFilter: `${hours} hours`,
      type: type
    }))
  } catch (err) {
    next(err)
  }
}

// 🌐 Send Public Message (for embeddable script)
export const sendPublicMessage = async (req, res, next) => {
  try {
    console.log("🔍 Public message request body:", req.body)
    
    const { ambassadorId, message, userEmail } = req.body
    
    // Validate required fields
    if (!ambassadorId || !message || !userEmail) {
      return next(errGen(400, "Ambassador ID, message, and user email are required"))
    }
    
    // Find the ambassador
    const ambassador = await User.findById(ambassadorId)
    if (!ambassador || ambassador.role !== "ambassador" || !ambassador.isVerified) {
      return next(errGen(404, "Ambassador not found or not verified"))
    }
    
    // Find the user by email
    const user = await User.findOne({ email: userEmail, role: "user" })
    if (!user) {
      return next(errGen(404, "User not found. Please register first."))
    }
    
    // Find or create chat between user and ambassador
    let chat = await Chat.findOne({
      participants: { $all: [user._id, ambassadorId] }
    })
    
    if (!chat) {
      // Create new chat
      chat = await Chat.create({
        participants: [user._id, ambassadorId]
      })
      console.log("✅ New chat created:", chat._id)
    }
    
    // Create message
    const newMessage = await Message.create({
      chatId: chat._id,
      sender: user._id,
      receiver: ambassador._id,
      content: message
    })
    
    // Update chat's last message
    chat.lastMessage = newMessage._id
    await chat.save()
    
    console.log("✅ Public message sent successfully:", newMessage._id)
    
    // Send email notification to ambassador
    try {
      await sendEmail(
        ambassador.email,
        "New Message from Student",
        `Hello ${ambassador.name},\n\nYou have received a new message from ${user.name} (${user.email}):\n\n"${message}"\n\nPlease log in to your dashboard to respond.\n\nBest regards,\nLeadX Team`
      )
      console.log("✅ Email notification sent to ambassador")
    } catch (emailError) {
      console.error("❌ Error sending email notification:", emailError)
      // Don't fail the request if email fails
    }
    
    res.status(200).json(respo(true, "Message sent successfully", {
      messageId: newMessage._id,
      chatId: chat._id,
      ambassadorName: ambassador.name
    }))
  } catch (err) {
    console.error("❌ Public message error:", err)
    next(err)
  }
}
