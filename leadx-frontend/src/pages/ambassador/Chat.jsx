import React, { useEffect, useState, useRef } from "react"
import { io } from "socket.io-client"
import { FaEdit, FaTrash } from "react-icons/fa"
import { toast } from "react-toastify"
import api from "../utils/Api"
import { getToken, getUser } from "../utils/auth"
import { useColorContext } from "../../context/ColorContext"

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL
const API_BASE_URL = import.meta.env.VITE_API_URL

const Chat = () => {
  const [chats, setChats] = useState([])
  const [selectedChat, setSelectedChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [socket, setSocket] = useState(null)
  const [editingMessage, setEditingMessage] = useState(null)
  const [isSending, setIsSending] = useState(false)
  const messageEndRef = useRef(null)
  const { ambassadorDashboardColor } = useColorContext()

  const token = getToken()
  const user = getUser()
  const userId = user?._id || user?.id

  const getImageUrl = (path) => {
    if (!path) return "/default-avatar.png"
    const normalized = String(path)
      .replace(/^\.\/+/, "")
      .replace(/^\/+/, "")
    return `${API_BASE_URL}/${normalized}`
  }

  // Get user avatar (first letter of name)
  const getUserAvatar = (user) => {
    if (!user?.name) return "U"
    return user.name.charAt(0).toUpperCase()
  }

  // Get avatar background color based on name
  const getAvatarColor = (name) => {
    if (!name) return "bg-gray-500"
    const colors = [
      "bg-red-500", "bg-blue-500", "bg-green-500", "bg-yellow-500", 
      "bg-purple-500", "bg-pink-500", "bg-indigo-500", "bg-teal-500"
    ]
    const index = name.charCodeAt(0) % colors.length
    return colors[index]
  }

  // Auto scroll to bottom when messages update
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Initialize socket
  useEffect(() => {
    if (!token) return
    
    console.log('🔌 Initializing socket connection...')
    const s = io(SOCKET_URL, { 
      auth: { token },
      transports: ['websocket', 'polling']
    })
    setSocket(s)

    s.on("connect", () => {
      console.log("✅ Socket connected successfully")
      console.log("🔗 Socket ID:", s.id)
    })

    s.on("connect_error", (error) => {
      console.error("❌ Socket connection error:", error)
    })

    s.on("disconnect", (reason) => {
      console.log("🔌 Socket disconnected:", reason)
    })

    s.on("newMessage", (msg) => {
      console.log("📨 New message received via socket:", msg)
      if (msg.chatId === selectedChat?._id) {
        // Check if message already exists to avoid duplicates
        setMessages((prev) => {
          const exists = prev.some(m => m._id === msg._id)
          if (exists) {
            console.log("📨 Message already exists, skipping...")
            return prev
          }
          console.log("📨 Adding new message to chat")
          return [...prev, msg]
        })
      }
      fetchChats()
    })

    s.on("messageUpdated", (updated) => {
      console.log("✏️ Message updated via socket:", updated)
      setMessages((prev) =>
        prev.map((m) => (m._id === updated._id ? updated : m))
      )
    })

    s.on("messageDeleted", (deletedId) => {
      console.log("🗑️ Message deleted via socket:", deletedId)
      setMessages((prev) => prev.filter((m) => m._id !== deletedId))
    })

    return () => {
      console.log("🔌 Disconnecting socket...")
      s.disconnect()
    }
  }, [token, selectedChat?._id])

  // Fetch chats
  const fetchChats = async () => {
    try {
      const res = await api.get(`/chat/my`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.data.success) setChats(res.data.data)
    } catch (err) {
      console.error(err)
    }
  }

  // Fetch messages
  const fetchMessages = async (chatId) => {
    try {
      const res = await api.get(`/chat/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.data.success) setMessages(res.data.data)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchChats()
  }, [])

  const handleSelectChat = (chat) => {
    setSelectedChat(chat)
    fetchMessages(chat._id)
  }
  const imageUrl= ()=>{
    const url=`http://localhost:5000/${ambassador.profileImage}`;
    return url
  }

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedChat || isSending) return

    const receiver = selectedChat.participants.find((p) => p._id !== userId)
    if (!receiver?._id) return

    // Store the message content before sending
    const messageContent = newMessage.trim()
    setIsSending(true)
    let tempMessage = null
    
    try {
      if (editingMessage) {
        const res = await api.put(
          `/chat/message/${editingMessage._id}`,
          { content: newMessage },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        if (res.data.success) {
          setMessages((prev) =>
            prev.map((m) =>
              m._id === res.data.message._id ? res.data.message : m
            )
          )
          setEditingMessage(null)
          setNewMessage("")
        }
      } else {
        // Clear the input immediately for better UX
        setNewMessage("")
        
        // Create a temporary message object for immediate display
        tempMessage = {
          _id: `temp_${Date.now()}`,
          content: messageContent,
          sender: { _id: userId, name: user?.name || 'You' },
          receiver: receiver._id,
          chatId: selectedChat._id,
          createdAt: new Date().toISOString(),
          isTemporary: true
        }
        
        // Add temporary message immediately
        setMessages((prev) => [...prev, tempMessage])
        
        const res = await api.post(`/chat/send`, {
          chatId: selectedChat._id,
          content: messageContent,
          receiver: receiver._id,
        })

        if (res.data.success) {
          // Replace temporary message with real message
          setMessages((prev) => 
            prev.map((m) => 
              m._id === tempMessage._id ? res.data.message : m
            )
          )
          fetchChats()
        } else {
          // Remove temporary message if send failed
          setMessages((prev) => prev.filter((m) => m._id !== tempMessage._id))
          setNewMessage(messageContent) // Restore the message content
        }
      }
    } catch (err) {
      console.error('Error sending message:', err)
      
      if (editingMessage) {
        // Handle edit message errors
        if (err.response?.status === 403 && err.response?.data?.message?.includes('5 minutes')) {
          toast.error('Message can only be edited within 5 minutes of sending')
        } else {
          toast.error('Failed to update message')
        }
        setEditingMessage(null)
        setNewMessage("")
      } else {
        // Handle new message errors
        if (tempMessage) {
          // Remove temporary message if send failed
          setMessages((prev) => prev.filter((m) => m._id !== tempMessage._id))
        }
        setNewMessage(messageContent) // Restore the message content
      }
    } finally {
      setIsSending(false)
    }
  }

  const handleDeleteMessage = async (id) => {
    try {
      const res = await api.delete(`/chat/message/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.data.success) {
        setMessages((prev) => prev.filter((m) => m._id !== id))
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeleteChat = async (chatId) => {
    try {
      const res = await api.delete(`/chat/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.data.success) {
        setChats((prev) => prev.filter((c) => c._id !== chatId))
        if (selectedChat?._id === chatId) setSelectedChat(null)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const isMine = (msg) =>
    String(msg.sender?._id || msg.sender) === String(userId)

  // Check if message can be edited (within 5 minutes)
  const canEditMessage = (msg) => {
    if (!isMine(msg)) return false;
    
    const messageTime = new Date(msg.createdAt || msg.timestamp);
    const currentTime = new Date();
    const timeDifference = currentTime - messageTime;
    const fiveMinutesInMs = 5 * 60 * 1000; // 5 minutes in milliseconds
    
    return timeDifference <= fiveMinutesInMs;
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-1/3 border-r bg-white hidden md:flex flex-col">
        <div className="p-4 font-bold text-lg border-b">My Chats</div>
        <div className="flex-1 overflow-y-auto">
          {chats.map((chat) => {
            const other = chat.participants.find((p) => p._id !== userId) || {}
            return (
              <div
                key={chat._id}
                className={`flex items-center justify-between p-3 cursor-pointer hover:bg-gray-100 ${
                  selectedChat?._id === chat._id ? "bg-gray-200" : ""
                }`}
              >
                <div
                  className="flex items-center gap-3 flex-1"
                  onClick={() => handleSelectChat(chat)}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold ${getAvatarColor(other.name)}`}>
                    {getUserAvatar(other)}
                  </div>
                  <div className="flex flex-col">
                    <p className="font-medium">{other.name}</p>
                    <p className="text-xs text-gray-500 truncate w-40">
                      {chat.lastMessage?.content || "No messages yet"}
                    </p>
                  </div>
                </div>
                {/* <button
                  onClick={() => handleDeleteChat(chat._id)}
                  className="hover:opacity-70 ml-2"
                  style={{ color: ambassadorDashboardColor }}
                >
                  <FaTrash size={16} />
                </button> */}
              </div>
            )
          })}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat header */}
            <div className="p-4 border-b flex items-center gap-3 bg-white">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold ${getAvatarColor(selectedChat.participants.find((p) => p._id !== userId)?.name)}`}>
                {getUserAvatar(selectedChat.participants.find((p) => p._id !== userId))}
              </div>
              <p className="font-semibold">
                {selectedChat.participants.find((p) => p._id !== userId)?.name}
              </p>
            </div>

            {/* Chat messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">
              {messages.map((msg) => (
                <div
                  key={msg._id}
                  className={`flex ${
                    isMine(msg) ? "justify-end" : "justify-start"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {/* User Avatar - Show only for incoming messages */}
                    {!isMine(msg) && (
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold ${getAvatarColor(msg.sender?.name)}`}>
                        {getUserAvatar(msg.sender)}
                      </div>
                    )}
                    
                    <div
                      className={`max-w-xs px-3 py-2 rounded-lg break-words ${
                        isMine(msg)
                          ? "text-white"
                          : "bg-gray-200 text-gray-800"
                      } ${msg.isTemporary ? 'opacity-70' : ''}`}
                      style={{
                        backgroundColor: isMine(msg) ? ambassadorDashboardColor : undefined
                      }}
                    >
                      {msg.content}
                      {msg.isTemporary && (
                        <span className="ml-2 text-xs opacity-60">Sending...</span>
                      )}
                    </div>
                    {isMine(msg) && (
                      <div className="flex gap-2 text-gray-500 ml-2">
                        {canEditMessage(msg) && (
                          <button
                            onClick={() => {
                              setEditingMessage(msg)
                              setNewMessage(msg.content)
                            }}
                            className="hover:opacity-70"
                            style={{ color: ambassadorDashboardColor }}
                            title="Edit (within 5 minutes)"
                          >
                            <FaEdit size={16} />
                          </button>
                        )}
                        {/* <button
                          onClick={() => handleDeleteMessage(msg._id)}
                          className="hover:opacity-70"
                          style={{ color: ambassadorDashboardColor }}
                          title="Delete"
                        >
                          <FaTrash size={16} />
                        </button> */}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messageEndRef} />
            </div>

            {/* Input box */}
            <div className="p-4 border-t flex gap-2 bg-white">
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2"
                style={{ 
                  borderColor: `${ambassadorDashboardColor}40`,
                  focusRingColor: ambassadorDashboardColor
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <button
                onClick={handleSend}
                disabled={isSending || !newMessage.trim()}
                className={`px-4 py-2 text-white rounded-lg transition-opacity ${
                  isSending || !newMessage.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
                }`}
                style={{ backgroundColor: ambassadorDashboardColor }}
              >
                {isSending ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sending...
                  </div>
                ) : (
                  editingMessage ? "Update" : "Send"
                )}
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center flex-1 text-gray-400">
            Select a chat to start messaging
          </div>
        )}
      </div>
    </div>
  )
}

export default Chat
