import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useColorContext } from '../../context/ColorContext'
import { getUser } from '../utils/auth'
import api from '../utils/Api'
import { validateMessage, filterSensitiveData, getDetailedSecurityWarning } from '../../utils/chatSecurity'

const UserChat = () => {
  const navigate = useNavigate()
  const { userDashboardColor } = useColorContext()
  const [user, setUser] = useState(null)
  const [chats, setChats] = useState([])
  const [selectedChat, setSelectedChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)
  const [securityWarning, setSecurityWarning] = useState(null)
  const [messageError, setMessageError] = useState("")
  const messagesEndRef = useRef(null)

  useEffect(() => {
    const currentUser = getUser()
    console.log('🔍 Current user loaded:', currentUser)
    console.log('🔍 User ID from getUser:', currentUser?.id || currentUser?._id)
    console.log('🔍 User object keys:', currentUser ? Object.keys(currentUser) : 'No user')
    
    // Ensure user object has correct structure
    if (currentUser && !currentUser.id && currentUser._id) {
      currentUser.id = currentUser._id
      console.log('🔍 Fixed user ID:', currentUser.id)
    }
    
    // Also ensure we have the correct ID for comparison
    const userId = currentUser?.id || currentUser?._id
    if (userId) {
      currentUser.id = userId
      console.log('🔍 Final user ID:', currentUser.id)
    }
    
    setUser(currentUser)
    fetchChats()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchChats = async () => {
    try {
      setLoading(true)
      console.log('🔍 Fetching user chats...')
      
      // Check if user is logged in
      const currentUser = getUser()
      if (!currentUser) {
        console.log('⚠️ User not logged in')
        setChats([])
        setError('Please chat with an ambassador first to see your conversations here.')
        setLoading(false)
        return
      }
      
      const response = await api.get('/auth/dashboard')
      
      if (response.data.success) {
        const allChats = response.data.data.recentChats || []
        setChats(allChats)
        console.log('✅ User chats loaded:', allChats)
      } else {
        console.error('❌ API response not successful:', response.data)
        setError('Failed to load chats')
      }
    } catch (err) {
      console.error('❌ Error fetching chats:', err)
      console.error('❌ Error details:', err.response?.data || err.message)
      setChats([])
      setError('Please chat with an ambassador first to see your conversations here.')
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (chatId) => {
    try {
      console.log('🔍 Fetching messages for chat:', chatId)
      
      const response = await api.get(`/chat/${chatId}`)
      
      console.log('🔍 Raw API response:', response.data)
      
      if (response.data.success) {
        const messages = response.data.data
        console.log('✅ Messages received:', messages)
        
        // Transform messages to match UI expectations
        const currentUserId = user?.id || user?._id
        console.log('🔍 Current user ID for comparison:', currentUserId)
        
        const transformedMessages = messages.map(msg => {
          const senderId = msg.sender?._id?.toString() || msg.sender?.id?.toString()
          const isFromCurrentUser = senderId === currentUserId?.toString()
          
          console.log('🔍 Message sender ID:', senderId, 'Current user ID:', currentUserId, 'Match:', isFromCurrentUser)
          
          return {
            _id: msg._id,
            content: msg.content,
            sender: msg.sender,
            createdAt: msg.createdAt,
            isFromUser: isFromCurrentUser
          }
        })
        
        console.log('🔍 Transformed messages:', transformedMessages)
        setMessages(transformedMessages)
      } else {
        console.error('❌ API response not successful:', response.data)
        setMessages([])
      }
    } catch (err) {
      console.error('❌ Error fetching messages:', err)
      console.error('❌ Error details:', err.response?.data || err.message)
      setMessages([])
    }
  }

  const handleSelectChat = (chat) => {
    console.log('🔍 Selecting chat:', chat)
    console.log('🔍 Chat ID:', chat.chatId || chat._id || chat.id)
    console.log('🔍 Chat ambassador:', chat.ambassador)
    setSelectedChat(chat)
    setMessages([]) // Clear previous messages
    fetchMessages(chat.chatId || chat._id || chat.id)
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || sending || !selectedChat) return

    // Validate message for sensitive information
    const validation = validateMessage(newMessage.trim())
    if (!validation.isValid) {
      const warning = getDetailedSecurityWarning(validation.violations)
      setSecurityWarning(warning)
      setMessageError(warning.message)
      return
    }

    // Clear any previous warnings
    setSecurityWarning(null)
    setMessageError("")

    try {
      setSending(true)
      console.log('🔍 Sending message:', newMessage)
      console.log('🔍 Current user in sendMessage:', user)
      console.log('🔍 User ID:', user?.id || user?._id)
      console.log('🔍 Selected chat:', selectedChat)
      
      const response = await api.post('/chat/send', {
        chatId: selectedChat.chatId || selectedChat._id || selectedChat.id,
        content: newMessage,
        receiver: selectedChat.ambassador?._id || selectedChat.ambassador?.id
      })
      
      if (response.data.success) {
        console.log('✅ Message sent successfully:', response.data)
        
        // Store message content before clearing input
        const messageContent = newMessage
        setNewMessage('')
        
        // Add the sent message immediately to UI for better UX
        const sentMessage = {
          id: response.data.message?._id || `temp_${Date.now()}`,
          content: messageContent,
          sender: {
            id: user?.id || user?._id,
            name: user?.name,
            role: 'user'
          },
          timestamp: new Date().toISOString(),
          isFromUser: true
        }
        
        console.log('🔍 Sent message sender ID:', sentMessage.sender.id)
        
        console.log('🔍 Sent message object:', sentMessage)
        
        // Add message to current messages array
        setMessages(prev => [...prev, sentMessage])
        
        // Refresh chats to update last message
        await fetchChats()
        console.log('✅ Message added to UI and chats refreshed')
      } else {
        console.error('❌ Failed to send message:', response.data)
        setError('Failed to send message')
      }
    } catch (err) {
      console.error('❌ Error sending message:', err)
      setError('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const getImageUrl = (path) => {
    if (!path) return null
    if (path.startsWith("http")) return path
    const normalized = String(path).replace(/^\.\/+/, "").replace(/^\/+/, "")
    return `http://localhost:5000/${normalized}`
  }

  const getUserAvatar = (name) => {
    if (!name) return "U"
    // Handle both string and object cases
    const nameStr = typeof name === 'string' ? name : name?.name || 'U'
    return nameStr.charAt(0).toUpperCase()
  }

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

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: userDashboardColor }}></div>
          <p className="mt-4 text-gray-600">Loading chat...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 text-lg">{error}</p>
          <button
            onClick={fetchChats}
            className="mt-4 px-4 py-2 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#1098e8' }}
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-white">
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
            <p className="text-xs text-slate-600 hidden sm:block">Chat with your ambassadors</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Sidebar - Chats */}
        <div className={`w-full lg:w-56 bg-white border-r border-slate-200 flex flex-col ${selectedChat ? 'hidden lg:flex' : 'flex'}`}>
          <div className="p-2 border-b border-slate-200 bg-white">
            <h2 className="text-sm font-medium text-slate-800">My Chats</h2>
            <p className="text-xs text-slate-600">Select an ambassador to start chatting</p>
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
                  console.log('🔍 Rendering chat in sidebar:', chat)
                  console.log('🔍 Chat lastMessage:', chat.lastMessage)
                  console.log('🔍 Chat lastMessage type:', typeof chat.lastMessage)
                  console.log('🔍 Chat lastMessage content:', chat.lastMessage?.content)
                  return (
                    <div
                      key={chat.chatId || chat.id}
                      onClick={() => handleSelectChat(chat)}
                      className={`p-1.5 rounded-lg cursor-pointer transition-all duration-200 mb-1 select-none ${
                        (selectedChat?.chatId || selectedChat?.id) === (chat.chatId || chat.id)
                          ? 'bg-blue-50 border-2 border-blue-200 shadow-sm'
                          : 'bg-white hover:bg-gray-50 border-2 border-transparent hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-center space-x-1.5">
                        <div className="w-6 h-6 rounded-full overflow-hidden border-2 border-gray-200 flex-shrink-0">
                          {chat.ambassador.profileImage ? (
                            <img
                              src={getImageUrl(chat.ambassador.profileImage)}
                              alt={chat.ambassador.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className={`w-full h-full ${getAvatarColor(chat.ambassador.name)} flex items-center justify-center text-white text-xs font-bold`}>
                              {getUserAvatar(chat.ambassador.name)}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-slate-900 truncate">
                            {chat.ambassador.name || 'Unknown Ambassador'}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            {chat.ambassador.email || 'No email'}
                          </p>
                          <p className="text-xs text-slate-400 truncate">
                            {(() => {
                              // Try different ways to get the last message content
                              if (chat.lastMessage?.content) {
                                return chat.lastMessage.content
                              }
                              if (chat.lastMessage && typeof chat.lastMessage === 'object' && chat.lastMessage.content) {
                                return chat.lastMessage.content
                              }
                              if (chat.lastMessage && typeof chat.lastMessage === 'string') {
                                return chat.lastMessage
                              }
                              return "No messages yet"
                            })()}
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
                <p className="text-xs text-slate-400 mt-1">Start a conversation with an ambassador</p>
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
                    {selectedChat.ambassador.profileImage ? (
                      <img
                        src={getImageUrl(selectedChat.ambassador.profileImage)}
                        alt={selectedChat.ambassador.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className={`w-full h-full ${getAvatarColor(selectedChat.ambassador.name)} flex items-center justify-center text-white text-xs font-bold`}>
                        {getUserAvatar(selectedChat.ambassador.name)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {selectedChat.ambassador.name || 'Unknown Ambassador'}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {selectedChat.ambassador.email || 'No email'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-2 bg-gray-50">
                {messages.length > 0 ? (
                  <div className="space-y-1">
                    {messages.map((message, index) => {
                      const showDateSeparator = index === 0 || 
                        new Date(message.createdAt || message.timestamp).toDateString() !== 
                        new Date(messages[index - 1].createdAt || messages[index - 1].timestamp).toDateString();

                      // Determine if message is from current user
                      let isFromUser = false
                      
                      // First check if backend already set isFromUser
                      if (message.isFromUser === true) {
                        isFromUser = true
                      } else if (message.sender) {
                        // Check by sender ID
                        const userId = user?.id || user?._id
                        const senderId = message.sender.id || message.sender._id
                        
                        if (userId && senderId && userId.toString() === senderId.toString()) {
                          isFromUser = true
                        } else if (message.sender.role === 'user') {
                          isFromUser = true
                        }
                      }
                      
                      return (
                        <div key={message.id || message._id}>
                          {/* Date Separator */}
                          {showDateSeparator && (
                            <div className="flex justify-center my-1.5">
                              <div className="bg-white px-1.5 py-0.5 rounded-full shadow-sm border border-gray-200">
                                <span className="text-xs text-gray-500 font-medium">
                                  {new Date(message.createdAt || message.timestamp).toLocaleDateString([], { 
                                    weekday: 'long', 
                                    day: 'numeric', 
                                    month: 'long', 
                                    year: 'numeric' 
                                  })}
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Message */}
                          <div
                            className={`flex w-full ${
                              isFromUser ? "justify-end" : "justify-start"
                            }`}
                          >
                            <div className={`flex flex-col gap-0.5 max-w-[85%] ${
                              isFromUser ? "items-end" : "items-start"
                            }`}>
                              <div className={`flex items-end gap-1.5 ${
                                isFromUser ? "flex-row-reverse" : "flex-row"
                              }`}>
                                {/* User Avatar - Show only for user messages (right side) */}
                                {isFromUser && (
                                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-semibold bg-blue-500 flex-shrink-0">
                                    {getUserAvatar(user?.name)}
                                  </div>
                                )}
                                
                                {/* Ambassador Avatar - Show only for ambassador messages (left side) */}
                                {!isFromUser && (
                                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-semibold bg-green-500 flex-shrink-0">
                                    {getUserAvatar(selectedChat.ambassador.name)}
                                  </div>
                                )}
                                
                                <div
                                  className={`px-2 py-1.5 rounded-lg break-words text-xs relative ${
                                    isFromUser
                                      ? "bg-blue-100 text-blue-900 rounded-br-sm border border-blue-200"
                                      : "text-white rounded-bl-sm"
                                  }`}
                                  style={{
                                    backgroundColor: !isFromUser ? '#3b82f6' : undefined,
                                    maxWidth: '100%'
                                  }}
                                >
                                  {filterSensitiveData(message.content)}
                                  
                                  {/* Time and Status inside message box */}
                                  <div className={`flex items-center justify-end mt-0.5 text-[8px] ${
                                    isFromUser 
                                      ? "text-blue-600" 
                                      : "text-blue-100"
                                  }`}>
                                    <span className="mr-1">{formatTime(message.createdAt || message.timestamp)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                ) : (
                  <div className="flex flex-col justify-center items-center h-24 text-gray-500 px-3">
                    <svg className="w-6 h-6 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p className="text-center text-xs">No messages in this chat yet</p>
                    <p className="text-xs text-gray-400 mt-1 text-center">Start a conversation with {selectedChat?.ambassador?.name}</p>
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
                  onKeyDown={(e) => e.key === "Enter" && sendMessage(e)}
                />
                <button
                  onClick={sendMessage}
                  disabled={sending || !newMessage.trim()}
                  className={`px-2 sm:px-3 py-1.5 sm:py-2 text-white rounded-lg transition-opacity text-xs sm:text-sm whitespace-nowrap ${
                    !newMessage.trim() || sending
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                  style={{
                    backgroundColor: !newMessage.trim() || sending ? undefined : '#3b82f6'
                  }}
                >
                  {sending ? 'Sending...' : 'Send'}
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
                <p className="text-xs text-gray-400 mt-1">Choose an ambassador from the left panel to begin your conversation</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default UserChat
