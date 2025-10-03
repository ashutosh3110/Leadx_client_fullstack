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
// helper to generate default password for users
const generatePassword = () => "123456"
// startChat controller update
export const startChat = async (req, res, next) => {
  try {
    console.log("🔍 startChat called with:", req.body)
    console.log("🔍 User authenticated:", !!req.user)
    const { ambassadorId, name, email, phone, alternativeMobile, country, state, city } = req.body

    // Validate required fields
    if (!ambassadorId || !name || !email) {
      return res.status(400).json({
        success: false,
        message: "ambassadorId, name, and email are required"
      })
    }

    let user = await User.findOne({ email })
    console.log("🔍 Existing user found:", user ? user.name : "No existing user")
    
    if (!user) {
      console.log("🔍 Creating new user...")
      const plainPassword = generatePassword()
      const hashedPassword = await bcrypt.hash(plainPassword, 10)

      user = await User.create({
        name,
        email,
        phone,
        alternativeMobile,
        country: country || "Not specified",
        state: state || "",
        city: city || "",
        role: "user",
        password: hashedPassword,
      })
      
      console.log("✅ New user created:", user._id, user.name)

      // send password via email (optional - don't fail if email service is not configured)
      if (email) {
        try {
          await sendEmail(
            email,
            "Welcome to LeadX - Your Login Details",
            `Hello ${name},\n\nYour account has been created successfully!\n\n🔑 LOGIN DETAILS:\nEmail: ${email}\nPassword: ${plainPassword}\n\nYou can now login to your account using these credentials.\n\nThanks,\nThe LeadX Team`
          )
          console.log("✅ Welcome email sent successfully")
        } catch (emailError) {
          console.log("⚠️ Email service not configured or failed:", emailError.message)
        }
      }

      // send password via WhatsApp (optional - don't fail if WhatsApp service is not configured)
      if (phone) {
        try {
          await sendWhatsApp(
            phone,
            `Hello ${name}, welcome to LeadX! 🎉\n\n🔑 Your login details:\nEmail: ${email}\nPassword: ${plainPassword}\n\nYou can now login to your account using these credentials.`
          )
          console.log("✅ Welcome WhatsApp sent successfully")
        } catch (whatsappError) {
          console.log("⚠️ WhatsApp service not configured or failed:", whatsappError.message)
        }
      }
    }

    console.log("🔍 Looking for existing chat between user:", user._id, "and ambassador:", ambassadorId)
    let chat = await Chat.findOne({
      participants: { $all: [user._id, ambassadorId] },
    })

    console.log("🔍 Existing chat found:", chat ? chat._id : "No existing chat")
    if (!chat) {
      console.log("🔍 Creating new chat...")
      chat = await Chat.create({ participants: [user._id, ambassadorId] })
      console.log("✅ New chat created:", chat._id)
    }

    const populatedChat = await Chat.findById(chat._id).populate(
      "participants",
      "name email role profileImage"
    )

    console.log("✅ Chat started successfully:", {
      chatId: populatedChat._id,
      participants: populatedChat.participants.length,
      user: populatedChat.participants.find(p => p.role === 'user')?.name,
      ambassador: populatedChat.participants.find(p => p.role === 'ambassador')?.name
    })

    res.status(200).json(respo(true, "Chat started", populatedChat))
  } catch (err) {
    console.error("❌ Error in startChat:", err)
    console.error("❌ Error details:", {
      message: err.message,
      stack: err.stack,
      name: err.name
    })
    next(err)
  }
}

// 🔹 Send a message
export const sendMessage = async (req, res) => {
  try {
    console.log("🔍 sendMessage called with:", req.body)
    const { chatId, receiver, content } = req.body
    const sender = req.user.id

    console.log("🔍 Message details:", {
      chatId,
      sender,
      receiver,
      content: content.substring(0, 50) + "..."
    })

    if (!chatId || !receiver || !content) {
      return res.status(400).json({
        success: false,
        message: "chatId, receiver and content are required",
      })
    }

    console.log("🔍 Creating new message...")
    const newMessage = await Message.create({
      chatId,
      sender,
      receiver,
      content,
    })
    
    console.log("✅ New message created:", newMessage._id)

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

// 🔹 Get Ambassador's Users (users who chatted with this ambassador)
export const getMyUsers = async (req, res, next) => {
  try {
    const ambassadorId = req.user.id
    console.log('🔍 Getting users for ambassador:', ambassadorId)

    // Get all chats where this ambassador is a participant
    const chats = await Chat.find({ participants: ambassadorId })
      .populate('participants', 'name email phone country state profileImage role conversionStatus')
      .populate('lastMessage', 'content createdAt')
      .sort({ updatedAt: -1 })

    console.log(`📊 Found ${chats.length} chats for ambassador`)

    // Extract unique users
    const usersMap = new Map()
    
    for (const chat of chats) {
      // Filter participants to get only users (not the ambassador himself)
      const users = chat.participants.filter(
        p => p && p.role === 'user' && p._id.toString() !== ambassadorId
      )

      for (const user of users) {
        if (!usersMap.has(user._id.toString())) {
          // Get message count for this user in this chat
          const messageCount = await Message.countDocuments({
            chatId: chat._id,
            $or: [
              { sender: user._id },
              { receiver: user._id }
            ]
          })

          // Get last message time for this chat
          const lastMessage = await Message.findOne({
            chatId: chat._id
          }).sort({ createdAt: -1 })

          usersMap.set(user._id.toString(), {
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            country: user.country,
            state: user.state,
            profileImage: user.profileImage,
            conversionStatus: user.conversionStatus || 'pending',
            messageCount: messageCount,
            lastActivity: lastMessage?.createdAt || chat.updatedAt
          })
        } else {
          // Update message count if user already exists
          const existingUser = usersMap.get(user._id.toString())
          const additionalMessages = await Message.countDocuments({
            chatId: chat._id,
            $or: [
              { sender: user._id },
              { receiver: user._id }
            ]
          })
          existingUser.messageCount += additionalMessages
        }
      }
    }

    const usersList = Array.from(usersMap.values())
    console.log(`✅ Found ${usersList.length} unique users for ambassador`)
    console.log('👥 Users:', usersList.map(u => ({ name: u.name, messages: u.messageCount })))

    res.status(200).json(respo(true, 'Users fetched successfully', usersList))
  } catch (err) {
    console.error('❌ Error getting ambassador users:', err)
    console.error('❌ Error stack:', err.stack)
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
