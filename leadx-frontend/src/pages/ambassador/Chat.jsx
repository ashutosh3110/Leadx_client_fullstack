import React, { useEffect, useState, useRef } from "react"
import { io } from "socket.io-client"
import { FaEdit, FaTrash } from "react-icons/fa"
import { toast } from "react-toastify"
import api from "../utils/Api"
import { getToken, getUser } from "../utils/auth"
import { useColorContext } from "../../context/ColorContext"
import { validateMessage, filterSensitiveData, getDetailedSecurityWarning } from "../../utils/chatSecurity"

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
  const [loading, setLoading] = useState(false)
  const [fetchingMessages, setFetchingMessages] = useState(false)
  const [securityWarning, setSecurityWarning] = useState(null)
  const [messageError, setMessageError] = useState("")
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
    // Handle both string and object cases
    const nameStr = typeof name === 'string' ? name : name?.name || 'U'
    const colors = [
      "bg-red-500", "bg-blue-500", "bg-green-500", "bg-yellow-500", 
      "bg-purple-500", "bg-pink-500", "bg-indigo-500", "bg-teal-500"
    ]
    const index = nameStr.charCodeAt(0) % colors.length
    return colors[index]
  }

  // Message status indicator component
  const MessageStatusIndicator = ({ status, isRead, isUser }) => {
    if (isUser) return null; // Don't show status for user messages
    
    const getStatusIcon = () => {
      switch (status) {
        case 'sent':
          return (
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          );
        case 'delivered':
          return (
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          );
        case 'read':
          return (
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          );
        default:
          return (
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          );
      }
    };

    return (
      <div className={`flex items-center ${isRead ? 'text-blue-100' : 'text-blue-200'}`}>
        {getStatusIcon()}
      </div>
    );
  };

  // Socket connection
  useEffect(() => {
    if (!token) return
    
    console.log("🔌 Connecting to socket...")
    const s = io(SOCKET_URL, { 
      auth: { token },
    })

    s.on("connect", () => {
      console.log("✅ Socket connected successfully")
      console.log("🔗 Socket ID:", s.id)
    })

    s.on("disconnect", () => {
      console.log("❌ Socket disconnected")
    })

    s.on("message", (message) => {
      console.log("📨 New message via socket:", message)
      setMessages((prev) => [...prev, message])
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

    setSocket(s)

    return () => {
      console.log("🔌 Disconnecting socket...")
      s.disconnect()
    }
  }, [token, selectedChat?._id || selectedChat?.id])

  // Fetch chats
  const fetchChats = async () => {
    try {
      setLoading(true)
      const res = await api.get(`/chat/my`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.data.success) {
        console.log('🔍 Fetched chats:', res.data.data)
        console.log('🔍 Current userId:', userId)
        setChats(res.data.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Fetch messages
  const fetchMessages = async (chatId) => {
    try {
      setFetchingMessages(true)
      const res = await api.get(`/chat/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.data.success) setMessages(res.data.data)
    } catch (err) {
      console.error(err)
    } finally {
      setFetchingMessages(false)
    }
  }

  useEffect(() => {
    console.log('🔍 Chat component mounted, userId:', userId)
    fetchChats()
  }, [])

  const handleSelectChat = (chat) => {
    console.log('🔍 Selected chat:', chat)
    console.log('🔍 Current userId:', userId)
    console.log('🔍 Participants:', chat.participants)
    const otherUser = chat.participants.find((p) => (p._id || p.id) !== userId)
    console.log('🔍 Other user found:', otherUser)
    setSelectedChat(chat)
    fetchMessages(chat._id || chat.id)
  }

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedChat || isSending) return

    // Validate message for sensitive information
    const validation = validateMessage(newMessage.trim())
    if (!validation.isValid) {
      const warning = getDetailedSecurityWarning(validation.violations)
      setSecurityWarning(warning)
      setMessageError(warning.message)
      toast.error("Please don't share personal information for security reasons.")
      return
    }

    // Clear any previous warnings
    setSecurityWarning(null)
    setMessageError("")

    const receiver = selectedChat.participants.find((p) => (p._id || p.id) !== userId)
    if (!(receiver?._id || receiver?.id)) return

    // Store the message content before sending
    const messageContent = newMessage.trim()
    setIsSending(true)
    let tempMessage = null
    
    try {
      // Create temporary message for immediate UI update
        tempMessage = {
          _id: `temp_${Date.now()}`,
          content: messageContent,
        sender: userId,
        receiver: receiver._id || receiver.id,
        chatId: selectedChat._id || selectedChat.id,
          createdAt: new Date().toISOString(),
        isTemporary: true,
        status: 'sending'
        }
        
      // Add temporary message to UI
        setMessages((prev) => [...prev, tempMessage])
        
      // Scroll to bottom
      setTimeout(() => {
        if (messageEndRef.current) {
          messageEndRef.current.scrollIntoView({ behavior: "smooth" })
        }
      }, 100)

      // Send actual message
      const res = await api.post(
        `/chat/send`,
        {
          chatId: selectedChat._id || selectedChat.id,
          receiver: receiver._id || receiver.id,
          content: messageContent,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

        if (res.data.success) {
          // Replace temporary message with real message
          setMessages((prev) => 
            prev.map((m) => 
              m._id === tempMessage._id ? res.data.message : m
            )
          )
          fetchChats()
        } else {
        // Remove temporary message on failure
          setMessages((prev) => prev.filter((m) => m._id !== tempMessage._id))
        toast.error(res.data.message || "Failed to send message")
      }
    } catch (err) {
      console.error(err)
      // Remove temporary message on error
          setMessages((prev) => prev.filter((m) => m._id !== tempMessage._id))
      toast.error("Failed to send message")
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
        setMessages((prev) => prev.filter((m) => (m._id || m.id) !== id))
      }
    } catch (err) {
      console.error(err)
    }
  }

  const isMine = (msg) =>
    String(msg.sender?._id || msg.sender?.id || msg.sender) === String(userId)

  // Check if message can be edited (within 5 minutes)
  const canEditMessage = (msg) => {
    if (!isMine(msg)) return false;
    
    const messageTime = new Date(msg.createdAt || msg.timestamp);
    const currentTime = new Date();
    const timeDifference = currentTime - messageTime;
    const fiveMinutesInMs = 5 * 60 * 1000; // 5 minutes in milliseconds
    
    return timeDifference <= fiveMinutesInMs;
  };

  // Format time for display
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Format date for display
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString([], { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  // Check if we should show date separator
  const shouldShowDateSeparator = (currentMessage, previousMessage) => {
    if (!previousMessage) return true;
    
    const currentDate = new Date(currentMessage.createdAt || currentMessage.timestamp);
    const previousDate = new Date(previousMessage.createdAt || previousMessage.timestamp);
    
    return currentDate.toDateString() !== previousDate.toDateString();
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  return (
    <div className="h-[calc(100vh-6rem)] sm:h-[calc(100vh-8rem)] lg:h-[calc(100vh-6rem)] xl:h-[calc(100vh-8rem)] flex flex-col bg-white rounded-lg shadow-sm mt-4">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 px-2 sm:px-3 py-2">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            <h1 className="text-sm sm:text-base font-semibold text-slate-800 flex items-center min-w-0">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="truncate">My Chats</span>
            </h1>
            <p className="text-xs text-slate-600 hidden sm:block">Chat with your users</p>
          </div>
          {/* Mobile Navigation */}
          <div className="flex flex-wrap gap-1 lg:hidden w-full sm:w-auto justify-end">
            {selectedChat && (
              <button
                onClick={() => setSelectedChat(null)}
                className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors whitespace-nowrap flex-shrink-0 flex items-center gap-1"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Chats
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Sidebar - Chats */}
        <div className={`w-full lg:w-56 bg-white border-r border-slate-200 flex flex-col ${selectedChat ? 'hidden lg:flex' : 'flex'}`}>
          <div className="p-2 border-b border-slate-200 bg-white">
            <h2 className="text-sm font-medium text-slate-800">My Chats</h2>
            <p className="text-xs text-slate-600">Select a user to start chatting</p>
          </div>
          
        <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-3 text-center text-slate-500">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
                <p className="text-xs">Loading chats...</p>
              </div>
            ) : chats && chats.length > 0 ? (
              <div className="p-2">
          {chats.map((chat) => {
                  const otherUser = chat.participants.find((p) => (p._id || p.id) !== userId) || {}
            return (
              <div
                      key={chat._id || chat.id}
                      onClick={() => handleSelectChat(chat)}
                      className={`p-1.5 rounded-lg cursor-pointer transition-all duration-200 mb-1 select-none ${
                        (selectedChat?._id || selectedChat?.id) === (chat._id || chat.id)
                          ? 'bg-blue-50 border-2 border-blue-200 shadow-sm'
                          : 'bg-white hover:bg-gray-50 border-2 border-transparent hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-center space-x-1.5">
                        <div className="w-6 h-6 rounded-full overflow-hidden border-2 border-gray-200 flex-shrink-0">
                          {otherUser.profileImage ? (
                            <img
                              src={getImageUrl(otherUser.profileImage)}
                              alt={otherUser.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className={`w-full h-full ${getAvatarColor(otherUser.name)} flex items-center justify-center text-white text-xs font-bold`}>
                              {getUserAvatar(otherUser)}
                            </div>
                          )}
                  </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-slate-900 truncate">
                            {otherUser.name || 'Unknown User'}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            {otherUser.email || 'No email'}
                          </p>
                          <p className="text-xs text-slate-400 truncate">
                      {chat.lastMessage?.content || "No messages yet"}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
              </div>
            ) : (
              <div className="p-3 text-center text-slate-500">
                <svg className="w-8 h-8 text-slate-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                <p className="text-xs">No chats found</p>
                <p className="text-xs text-slate-400 mt-1">Start a conversation with a user</p>
              </div>
            )}
        </div>
      </div>

        {/* Right Side - Messages */}
        <div className={`flex-1 flex flex-col ${selectedChat ? 'flex' : 'hidden lg:flex'}`}>
        {selectedChat ? (
          <>
            {/* Chat header */}
              <div className="p-2 border-b border-slate-200 bg-white">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full overflow-hidden border-2 border-gray-200 flex-shrink-0">
                    {(() => {
                      const otherUser = selectedChat.participants.find((p) => (p._id || p.id) !== userId)
                      console.log('🔍 Chat header - otherUser:', otherUser)
                      console.log('🔍 Chat header - userId:', userId)
                      console.log('🔍 Chat header - participants:', selectedChat.participants)
                      
                      if (otherUser?.profileImage) {
                        return (
                          <img
                            src={getImageUrl(otherUser.profileImage)}
                            alt={otherUser.name}
                            className="w-full h-full object-cover"
                          />
                        )
                      } else {
                        return (
                          <div className={`w-full h-full ${getAvatarColor(otherUser?.name)} flex items-center justify-center text-white text-xs font-bold`}>
                            {getUserAvatar(otherUser)}
                          </div>
                        )
                      }
                    })()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {(() => {
                        const otherUser = selectedChat.participants.find((p) => (p._id || p.id) !== userId)
                        return otherUser?.name || 'Unknown User'
                      })()}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {(() => {
                        const otherUser = selectedChat.participants.find((p) => (p._id || p.id) !== userId)
                        return otherUser?.email || 'No email'
                      })()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-2 bg-gray-50">
                {fetchingMessages ? (
                  <div className="flex justify-center items-center h-24">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            </div>
                ) : messages && messages.length > 0 ? (
                  <div className="space-y-1">
                    {messages.map((message, index) => {
                      const showDateSeparator = shouldShowDateSeparator(message, messages[index - 1]);
                      const isUser = !isMine(message);
                      
                      return (
                        <div key={message._id || message.id}>
                          {/* Date Separator */}
                          {showDateSeparator && (
                            <div className="flex justify-center my-1.5">
                              <div className="bg-white px-1.5 py-0.5 rounded-full shadow-sm border border-gray-200">
                                <span className="text-xs text-gray-500 font-medium">
                                  {formatDate(message.createdAt || message.timestamp)}
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Message */}
                          <div
                            className={`flex w-full ${
                              isUser ? "justify-start" : "justify-end"
                            }`}
                          >
                            <div className={`flex flex-col gap-0.5 max-w-[85%] ${
                              isUser ? "items-start" : "items-end"
                            }`}>
                              <div className={`flex items-end gap-1.5 ${
                                isUser ? "flex-row" : "flex-row-reverse"
                              }`}>
                                {/* User Avatar - Show only for user messages (left side) */}
                                {isUser && (
                                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-semibold bg-blue-500 flex-shrink-0">
                                    {(() => {
                                      const otherUser = selectedChat.participants.find((p) => (p._id || p.id) !== userId)
                                      return getUserAvatar(otherUser)
                                    })()}
                      </div>
                    )}
                    
                    <div
                                  className={`px-1.5 py-1 rounded-lg break-words text-xs relative ${
                                    isUser
                                      ? "bg-gray-200 text-gray-800 rounded-bl-sm"
                                      : "text-white rounded-br-sm"
                                  }`}
                      style={{
                                    backgroundColor: !isUser ? ambassadorDashboardColor || '#3b82f6' : undefined,
                                    maxWidth: '100%'
                                  }}
                                >
                                  {filterSensitiveData(message.content)}
                                  
                                  {/* Time and Status inside message box */}
                                  <div className={`flex items-center justify-end mt-0.5 text-[8px] ${
                                    isUser 
                                      ? "text-gray-600" 
                                      : "text-blue-100"
                                  }`}>
                                    <span className="mr-1">{formatTime(message.createdAt || message.timestamp)}</span>
                                    <MessageStatusIndicator 
                                      status={message.status || 'sent'} 
                                      isRead={message.isRead} 
                                      isUser={isUser} 
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                    </div>
                      </div>
                      );
                    })}
                    <div ref={messageEndRef} />
                  </div>
                ) : (
                  <div className="flex flex-col justify-center items-center h-24 text-gray-500 px-3">
                    <svg className="w-6 h-6 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p className="text-center text-xs">No messages in this chat yet</p>
                    <p className="text-xs text-gray-400 mt-1 text-center">Start a conversation with this user</p>
                </div>
                )}
            </div>

              {/* Security Warning */}
              {securityWarning && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-2 mx-2 mb-2">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-4 w-4 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-2">
                      <p className="text-xs text-yellow-700">
                        <strong>Security Notice:</strong> {securityWarning.message}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Message Input */}
              <div className="p-2 border-t flex gap-1 sm:gap-2 bg-white">
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value)
                  // Clear warnings when user starts typing
                  if (securityWarning || messageError) {
                    setSecurityWarning(null)
                    setMessageError("")
                  }
                }}
                className={`flex-1 border rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 ${
                  messageError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                }`}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <button
                onClick={handleSend}
                  disabled={!newMessage.trim() || isSending}
                  className={`px-2 sm:px-3 py-1.5 sm:py-2 text-white rounded-lg transition-opacity text-xs sm:text-sm whitespace-nowrap ${
                    !newMessage.trim() || isSending
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                  style={{
                    backgroundColor: !newMessage.trim() || isSending ? undefined : ambassadorDashboardColor || '#3b82f6'
                  }}
                >
                  {isSending ? 'Sending...' : 'Send'}
              </button>
            </div>
          </>
        ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-sm font-medium">Select a chat to start messaging</p>
                <p className="text-xs text-gray-400 mt-1">Choose a user from the left panel to begin your conversation</p>
              </div>
          </div>
        )}
        </div>
      </div>
    </div>
  )
}

export default Chat