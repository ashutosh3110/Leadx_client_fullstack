import { Chat } from "../models/Chat.js"
import { Message } from "../models/Message.js"
import { User } from "../models/user.js"
import { Op } from "sequelize"
import { sequelize as db } from "../config/db.js"
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
    const {
      ambassadorId,
      name,
      email,
      phone,
      alternativeMobile,
      country,
      state,
      city,
    } = req.body

    // Validate required fields
    if (!ambassadorId || !name || !email) {
      return res.status(400).json({
        success: false,
        message: "ambassadorId, name, and email are required",
      })
    }

    let user = await User.findOne({ where: { email } })
    console.log(
      "🔍 Existing user found:",
      user ? user.name : "No existing user"
    )

    if (!user) {
      console.log("🔍 Creating new user...")
      const plainPassword = generatePassword()
      console.log("🔍 Generated plain password:", plainPassword)
      const hashedPassword = await bcrypt.hash(plainPassword, 10)
      console.log("🔍 Hashed password:", hashedPassword.substring(0, 20) + "...")
      
      // Test the hash immediately
      const testComparison = await bcrypt.compare(plainPassword, hashedPassword)
      console.log("🔍 Password hash test result:", testComparison)

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

      console.log("✅ New user created:", user.id, user.name)
      console.log("🔍 User password field after creation:", user.password ? "Present" : "Missing")
      console.log("🔍 User password hash:", user.password ? user.password.substring(0, 20) + "..." : "No password")

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
          console.log(
            "⚠️ Email service not configured or failed:",
            emailError.message
          )
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
          console.log(
            "⚠️ WhatsApp service not configured or failed:",
            whatsappError.message
          )
        }
      }
    }

    console.log(
      "🔍 Looking for existing chat between user:",
      user.id,
      "and ambassador:",
      ambassadorId
    )
    let chat = await Chat.findOne({
      where: {
        [Op.and]: [
          db.where(
            db.fn('JSON_CONTAINS', db.col('participants'), JSON.stringify(user.id)),
            true
          ),
          db.where(
            db.fn('JSON_CONTAINS', db.col('participants'), JSON.stringify(ambassadorId)),
            true
          )
        ]
      }
    })

    console.log("🔍 Existing chat found:", chat ? chat.id : "No existing chat")
    if (!chat) {
      console.log("🔍 Creating new chat...")
      chat = await Chat.create({ participants: [user.id, ambassadorId] })
      console.log("✅ New chat created:", chat.id)
    }

    // Get participants from the participants array
    const participantIds = chat.participants
    const participants = await User.findAll({
      where: { id: participantIds },
      attributes: ['id', 'name', 'email', 'role', 'profileImage']
    })

    const populatedChat = {
      ...chat.toJSON(),
      participants: participants
    }

    console.log("✅ Chat started successfully:", {
      chatId: populatedChat.id,
      participants: populatedChat.participants.length,
      user: populatedChat.participants.find((p) => p.role === "user")?.name,
      ambassador: populatedChat.participants.find(
        (p) => p.role === "ambassador"
      )?.name,
    })

    res.status(200).json(respo(true, "Chat started", populatedChat))
  } catch (err) {
    console.error("❌ Error in startChat:", err)
    console.error("❌ Error details:", {
      message: err.message,
      stack: err.stack,
      name: err.name,
    })
    next(err)
  }
}

// 🔹 Send a message
export const sendMessage = async (req, res) => {
  try {
    console.log("🔍 sendMessage called with:", req.body)
    const { chatId, receiver, content, isFormSubmission } = req.body
    const sender = req.user.id

    console.log("🔍 Message details:", {
      chatId,
      sender,
      receiver,
      content: content.substring(0, 50) + "...",
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
      senderId: sender,
      receiverId: receiver,
      content,
      isFormSubmission: isFormSubmission || false,
    })

    console.log("✅ New message created:", newMessage.id)

    // Manually populate sender and receiver
    const senderUser = await User.findByPk(sender, {
      attributes: ['id', 'name', 'email', 'role', 'profileImage', 'phone']
    })
    const receiverUser = await User.findByPk(receiver, {
      attributes: ['id', 'name', 'email', 'role', 'profileImage', 'phone']
    })

    const populatedMessage = {
      ...newMessage.toJSON(),
      sender: senderUser,
      receiver: receiverUser
    }

    await Chat.update({
      updatedAt: new Date(),
      lastMessageId: newMessage.id,
    }, {
      where: { id: chatId }
    })

    // emit to receiver if online
    const receiverSocket = onlineUsers.get(receiver.toString())
    if (receiverSocket) {
      receiverSocket.emit("newMessage", populatedMessage)
    } else {
      const receiverUser = await User.findByPk(receiver)

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
          console.log(
            "⚠️ Email service not configured or failed:",
            emailError.message
          )
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
          console.log(
            "⚠️ WhatsApp service not configured or failed:",
            whatsappError.message
          )
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

    const msg = await Message.findByPk(messageId)
    if (!msg)
      return res
        .status(404)
        .json({ success: false, message: "Message not found" })

    if (String(msg.sender) !== String(req.user.id)) {
      return res.status(403).json({ success: false, message: "Not allowed" })
    }

    // Check if message is within 5-minute edit window
    const messageTime = new Date(msg.createdAt)
    const currentTime = new Date()
    const timeDifference = currentTime - messageTime
    const fiveMinutesInMs = 5 * 60 * 1000 // 5 minutes in milliseconds

    if (timeDifference > fiveMinutesInMs) {
      return res.status(403).json({
        success: false,
        message: "Message can only be edited within 5 minutes of sending",
      })
    }

    msg.content = content
    await msg.save()

    const populatedMsg = await Message.findByPk(msg.id, {
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'name', 'email', 'role', 'profileImage', 'country', 'state', 'city']
        },
        {
          model: User,
          as: 'receiver',
          attributes: ['id', 'name', 'email', 'role', 'profileImage', 'country', 'state', 'city']
        }
      ]
    })

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

    const msg = await Message.findByPk(messageId)
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
      receiverSocket.emit("messageDeleted", msg.id)
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
    const messages = await Message.findAll({
      where: { chatId },
      order: [['createdAt', 'ASC']]
    })

    // Manually populate sender and receiver for each message
    const populatedMessages = await Promise.all(
      messages.map(async (message) => {
        const sender = await User.findByPk(message.senderId, {
          attributes: ['id', 'name', 'email', 'role', 'profileImage', 'country', 'state', 'city']
        })
        const receiver = await User.findByPk(message.receiverId, {
          attributes: ['id', 'name', 'email', 'role', 'profileImage', 'country', 'state', 'city']
        })
        
        return {
          ...message.toJSON(),
          sender: sender,
          receiver: receiver
        }
      })
    )

    res.status(200).json(respo(true, "Messages fetched", populatedMessages))
  } catch (err) {
    next(err)
  }
}

// 🔹 Get all chats for current user
export const getMyChats = async (req, res, next) => {
  try {
    const chats = await Chat.findAll({
      where: db.where(
        db.fn('JSON_CONTAINS', db.col('participants'), JSON.stringify(req.user.id)),
        true
      ),
      order: [['updatedAt', 'DESC']]
    })

    // Populate participants for each chat
    const populatedChats = await Promise.all(
      chats.map(async (chat) => {
        const participantIds = chat.participants
        const participants = await User.findAll({
          where: { id: participantIds },
          attributes: ['id', 'name', 'email', 'role', 'profileImage', 'country', 'state', 'city']
        })
        
        return {
          ...chat.toJSON(),
          participants: participants
        }
      })
    )

    res.status(200).json(respo(true, "Chats fetched", populatedChats))
  } catch (err) {
    next(err)
  }
}

// 🔹 Delete chat
export const deleteChat = async (req, res, next) => {
  try {
    const { chatId } = req.params

    await Chat.destroy({ where: { id: chatId } })
    await Message.destroy({ where: { chatId: chatId } })

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
    
    console.log('🔍 Admin fetching chats for ambassador:', ambassadorId)
    
    const chats = await Chat.findAll({
      where: db.where(
        db.fn('JSON_CONTAINS', db.col('participants'), JSON.stringify(parseInt(ambassadorId))),
        true
      ),
      order: [['updatedAt', 'DESC']]
    })

    // Populate participants for each chat
    const populatedChats = await Promise.all(
      chats.map(async (chat) => {
        const participantIds = chat.participants
        const participants = await User.findAll({
          where: { id: participantIds },
          attributes: ['id', 'name', 'email', 'role', 'profileImage', 'country', 'state', 'city']
        })
        
        return {
          ...chat.toJSON(),
          participants: participants
        }
      })
    )
    
    console.log('🔍 Found chats:', populatedChats.length)
    console.log('🔍 Chats data:', populatedChats)
    
    res.status(200).json(respo(true, "Chats fetched", populatedChats))
  } catch (err) {
    console.error('❌ Error fetching chats by ambassador:', err)
    next(err)
  }
}

// 🔹 Admin: Get messages of a chat (any)
export const adminGetMessages = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") return next(errGen(403, "Forbidden"))
    const { chatId } = req.params
    
    const messages = await Message.findAll({
      where: { chatId: parseInt(chatId) },
      order: [['createdAt', 'ASC']]
    })

    // Manually populate sender and receiver for each message
    const populatedMessages = await Promise.all(
      messages.map(async (message) => {
        const sender = await User.findByPk(message.senderId, {
          attributes: ['id', 'name', 'email', 'role', 'profileImage', 'country', 'state', 'city']
        })
        const receiver = await User.findByPk(message.receiverId, {
          attributes: ['id', 'name', 'email', 'role', 'profileImage', 'country', 'state', 'city']
        })
        
        return {
          ...message.toJSON(),
          sender: sender,
          receiver: receiver
        }
      })
    )

    res.status(200).json(respo(true, "Messages fetched", populatedMessages))
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
      chatId: parseInt(chatId),
      senderId: parseInt(asAmbassadorId),
      receiverId: parseInt(toUserId),
      content,
    })

    // Manually populate sender and receiver
    const sender = await User.findByPk(parseInt(asAmbassadorId), {
      attributes: ['id', 'name', 'email', 'role', 'profileImage']
    })
    const receiver = await User.findByPk(parseInt(toUserId), {
      attributes: ['id', 'name', 'email', 'role', 'profileImage']
    })

    const populatedMessage = {
      ...newMessage.toJSON(),
      sender: sender,
      receiver: receiver
    }

    await Chat.update({
      updatedAt: new Date(),
      lastMessageId: newMessage.id,
    }, {
      where: { id: parseInt(chatId) }
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
    console.log("🔍 Getting users for ambassador:", ambassadorId)

    // Get all chats where this ambassador is a participant
    const chats = await Chat.findAll({
      where: db.where(
        db.fn('JSON_CONTAINS', db.col('participants'), JSON.stringify(parseInt(ambassadorId))),
        true
      ),
      order: [['updatedAt', 'DESC']]
    })

    console.log(`📊 Found ${chats.length} chats for ambassador`)

    // Extract unique users
    const usersMap = new Map()

    for (const chat of chats) {
      // Get participants for this chat
      const participantIds = chat.participants
      const participants = await User.findAll({
        where: { id: participantIds },
        attributes: ['id', 'name', 'email', 'phone', 'country', 'state', 'profileImage', 'role', 'conversionStatus', 'convertedAt', 'convertedBy', 'enrolledAt', 'enrolledBy', 'createdAt', 'updatedAt']
      })

      // Filter participants to get only users (not the ambassador himself)
      const users = participants.filter(
        (p) => p && p.role === "user" && p.id.toString() !== ambassadorId.toString()
      )

      for (const user of users) {
        if (!usersMap.has(user.id.toString())) {
          // Get message count for this user in this chat
          const messageCount = await Message.count({
            where: {
              chatId: chat.id,
              [Op.or]: [{ senderId: user.id }, { receiverId: user.id }],
            }
          })

          // Get last message time for this chat
          const lastMessage = await Message.findOne({
            where: { chatId: chat.id },
            order: [['createdAt', 'DESC']]
          })

          usersMap.set(user.id.toString(), {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            country: user.country,
            state: user.state,
            profileImage: user.profileImage,
            conversionStatus: user.conversionStatus || "pending",
            convertedAt: user.convertedAt,
            convertedBy: user.convertedBy,
            enrolledAt: user.enrolledAt,
            enrolledBy: user.enrolledBy,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            messageCount: messageCount,
            lastActivity: lastMessage?.createdAt || chat.updatedAt,
          })
        } else {
          // Update message count if user already exists
          const existingUser = usersMap.get(user.id.toString())
          const additionalMessages = await Message.count({
            where: {
              chatId: chat.id,
              [Op.or]: [{ senderId: user.id }, { receiverId: user.id }],
            }
          })
          existingUser.messageCount += additionalMessages
        }
      }
    }

    const usersList = Array.from(usersMap.values())
    console.log(`✅ Found ${usersList.length} unique users for ambassador`)
    console.log(
      "👥 Users:",
      usersList.map((u) => ({ name: u.name, messages: u.messageCount }))
    )

    res.status(200).json(respo(true, "Users fetched successfully", usersList))
  } catch (err) {
    console.error("❌ Error getting ambassador users:", err)
    console.error("❌ Error stack:", err.stack)
    next(err)
  }
}

// 🔹 Admin: Get chat statistics with time filter
export const adminGetChatStats = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") return next(errGen(403, "Forbidden"))

    const { hours = 24, type = "all" } = req.query
    const hoursAgo = new Date(Date.now() - hours * 60 * 60 * 1000)

    // Build query based on time filter
    const timeQuery = { createdAt: { [Op.gte]: hoursAgo } }

    // Get all messages in the time period
    const allMessages = await Message.findAll({
      where: timeQuery,
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'name', 'email', 'role']
        }
      ]
    })

    // Separate messages by type (ambassador vs student)
    let filteredMessages = allMessages

    if (type === "ambassador") {
      // Messages where sender is ambassador
      filteredMessages = allMessages.filter(
        (msg) => msg.sender?.role === "ambassador"
      )
    } else if (type === "student") {
      // Messages where sender is not ambassador (student/user)
      filteredMessages = allMessages.filter(
        (msg) => msg.sender?.role !== "ambassador"
      )
    }

    // Group messages by chatId to get conversations
    const conversations = {}
    filteredMessages.forEach((message) => {
      const chatId = message.chatId.toString()
      if (!conversations[chatId]) {
        conversations[chatId] = {
          messages: [],
          hasReply: false,
          isFormSubmission: message.isFormSubmission || false,
        }
      }
      conversations[chatId].messages.push(message)

      // Check if conversation has a reply (message from ambassador or admin)
      if (
        message.sender?.role === "ambassador" ||
        message.sender?.role === "admin" ||
        message.isAdminReply
      ) {
        conversations[chatId].hasReply = true
      }
    })

    const totalChats = Object.keys(conversations).length
    const unrepliedChats = Object.values(conversations).filter(
      (conv) => !conv.hasReply
    ).length
    const repliedChats = totalChats - unrepliedChats

    res.status(200).json(
      respo(true, "Chat statistics fetched", {
        totalChats,
        unrepliedChats,
        repliedChats,
        timeFilter: `${hours} hours`,
        type: type,
      })
    )
  } catch (err) {
    next(err)
  }
}

// 📊 Get Total Conversations Count (Admin only)
export const getTotalConversations = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") return next(errGen(403, "Forbidden"))

    console.log('🔍 getTotalConversations called');

    // Get total count of all chats
    const totalChats = await Chat.count();
    
    console.log('✅ Total conversations (chats):', totalChats);

    res.status(200).json(
      respo(true, "Total conversations count fetched", {
        totalConversations: totalChats
      })
    )
  } catch (err) {
    console.error('❌ Error in getTotalConversations:', err);
    next(err)
  }
}

// 📊 Get Student Statistics (Admin only)
export const getStudentStats = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") return next(errGen(403, "Forbidden"))

    console.log('🔍 getStudentStats called');

    // 1. Total Students (users with role = 'user')
    const totalStudents = await User.count({
      where: { role: 'user' }
    });

    // 2. Total Initiated Chats (all chats)
    const totalInitiatedChats = await Chat.count();

    // 3. Get all chats with their message counts
    const chatsWithMessages = await Chat.findAll({
      include: [
        {
          model: Message,
          as: 'messages',
          attributes: ['id', 'senderId', 'receiverId'],
          required: false
        }
      ],
      attributes: ['id', 'participants']
    });

    // 4. Calculate replied and unreplied chats
    let repliedChats = 0;
    let unrepliedChats = 0;

    for (const chat of chatsWithMessages) {
      const messages = chat.messages || [];
      
      if (messages.length === 0) {
        unrepliedChats++;
        continue;
      }

      // Check if there are messages from both users and ambassadors
      const userMessages = messages.filter(msg => {
        // Find if sender is a user (not ambassador)
        const senderId = msg.senderId;
        return chat.participants.includes(senderId);
      });

      const ambassadorMessages = messages.filter(msg => {
        // Find if sender is an ambassador
        const senderId = msg.senderId;
        return chat.participants.includes(senderId);
      });

      // Check if both user and ambassador have sent messages
      const hasUserMessages = userMessages.length > 0;
      const hasAmbassadorMessages = ambassadorMessages.length > 0;

      if (hasUserMessages && hasAmbassadorMessages) {
        repliedChats++;
      } else if (hasUserMessages && !hasAmbassadorMessages) {
        unrepliedChats++;
      }
    }

    console.log('✅ Student stats calculated:', {
      totalStudents,
      totalInitiatedChats,
      repliedChats,
      unrepliedChats
    });

    res.status(200).json(
      respo(true, "Student statistics fetched", {
        totalStudents,
        totalInitiatedChats,
        repliedChats,
        unrepliedChats
      })
    )
  } catch (err) {
    console.error('❌ Error in getStudentStats:', err);
    next(err)
  }
}

// 📊 Get Ambassadors with User Messages Count (Admin only)
export const getAmbassadorsWithMessages = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") return next(errGen(403, "Forbidden"))

    console.log('🔍 getAmbassadorsWithMessages called');

    // Get all chats that have messages from users (non-ambassadors)
    const chatsWithUserMessages = await Chat.findAll({
      include: [
        {
          model: Message,
          as: 'messages',
          where: {
            // Messages from users (not ambassadors)
            senderId: {
              [Op.in]: db.literal(`(
                SELECT id FROM users WHERE role != 'ambassador'
              )`)
            }
          },
          attributes: ['id', 'senderId'],
          required: true // Only chats that have user messages
        }
      ],
      attributes: ['id', 'participants']
    });

    console.log('✅ Found chats with user messages:', chatsWithUserMessages.length);

    // Extract unique ambassador IDs from chat participants
    const ambassadorIds = new Set();
    
    for (const chat of chatsWithUserMessages) {
      const participants = chat.participants || [];
      
      // Find ambassadors in participants
      for (const participantId of participants) {
        const participant = await User.findByPk(participantId, {
          attributes: ['id', 'role']
        });
        
        if (participant && participant.role === 'ambassador') {
          ambassadorIds.add(participant.id);
        }
      }
    }

    const totalAmbassadorsWithMessages = ambassadorIds.size;
    console.log('✅ Total ambassadors with user messages:', totalAmbassadorsWithMessages);

    res.status(200).json(
      respo(true, "Ambassadors with messages count fetched", {
        totalAmbassadorsWithMessages
      })
    )
  } catch (err) {
    console.error('❌ Error in getAmbassadorsWithMessages:', err);
    next(err)
  }
}
