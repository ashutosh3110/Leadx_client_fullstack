import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useColorContext } from '../../context/ColorContext'
import { getUser } from '../utils/auth'
import api from '../utils/Api'

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
    console.log('🔍 Chat ID:', chat._id)
    console.log('🔍 Chat ambassador:', chat.ambassador)
    setSelectedChat(chat)
    setMessages([]) // Clear previous messages
    fetchMessages(chat._id)
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || sending || !selectedChat) return

    try {
      setSending(true)
      console.log('🔍 Sending message:', newMessage)
      console.log('🔍 Current user in sendMessage:', user)
      console.log('🔍 User ID:', user?.id || user?._id)
      console.log('🔍 Selected chat:', selectedChat)
      
      const response = await api.post('/chat/send', {
        chatId: selectedChat._id,
        content: newMessage,
        receiver: selectedChat.ambassador?._id
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
    <div className="flex flex-col lg:flex-row h-full max-h-full overflow-hidden bg-white">
      {/* Sidebar */}
      <div className="w-full lg:w-1/3 border-r bg-white flex flex-col max-h-full">
        <div className="p-4 font-bold text-lg border-b">My Chats</div>
        <div className="flex-1 overflow-y-auto bg-white">
          {chats.length > 0 ? (
            chats.map((chat) => {
              console.log('🔍 Rendering chat in sidebar:', chat)
              console.log('🔍 Chat lastMessage:', chat.lastMessage)
              console.log('🔍 Chat lastMessage type:', typeof chat.lastMessage)
              console.log('🔍 Chat lastMessage content:', chat.lastMessage?.content)
              return (
                <div
                  key={chat.chatId}
                  className={`flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 bg-white ${
                    selectedChat?.chatId === chat.chatId ? "bg-gray-100" : ""
                  }`}
                  onClick={() => handleSelectChat(chat)}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="relative">
                      {chat.ambassador.profileImage ? (
                        <img
                          src={getImageUrl(chat.ambassador.profileImage)}
                          alt={chat.ambassador.name}
                          className="w-10 h-10 rounded-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none'
                            e.target.nextSibling.style.display = 'flex'
                          }}
                        />
                      ) : null}
                      <div 
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold ${getAvatarColor(chat.ambassador.name)}`}
                        style={{ display: chat.ambassador.profileImage ? 'none' : 'flex' }}
                      >
                        {getUserAvatar(chat.ambassador.name)}
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <p className="font-medium">{chat.ambassador.name}</p>
                      <p className="text-xs text-gray-500 truncate w-40">
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
            })
          ) : (
            <div className="text-center py-8">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: `${userDashboardColor}20` }}
              >
                <svg className="w-8 h-8" style={{ color: userDashboardColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h4 className="text-lg font-medium text-slate-800 mb-2">No chats yet</h4>
              <p className="text-slate-600">Start connecting with ambassadors to begin conversations</p>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className={`flex-1 flex flex-col max-h-full ${selectedChat ? '' : 'hidden lg:flex'}`}>
        {selectedChat ? (
          <>
            {/* Chat header */}
            <div className="p-3 sm:p-4 border-b flex items-center gap-3 bg-white">
              <div className="relative">
                {selectedChat.ambassador.profileImage ? (
                  <img
                    src={getImageUrl(selectedChat.ambassador.profileImage)}
                    alt={selectedChat.ambassador.name}
                    className="w-10 h-10 rounded-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.nextSibling.style.display = 'flex'
                    }}
                  />
                ) : null}
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold ${getAvatarColor(selectedChat.ambassador.name)}`}
                  style={{ display: selectedChat.ambassador.profileImage ? 'none' : 'flex' }}
                >
                  {getUserAvatar(selectedChat.ambassador.name)}
                </div>
              </div>
              <div>
                <p className="font-semibold">{selectedChat.ambassador.name}</p>
                <p className="text-sm text-gray-500">{selectedChat.ambassador.email}</p>
              </div>
            </div>

            {/* Chat messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">
              {messages.length > 0 ? (
                messages.map((msg) => {
                  console.log('🔍 Rendering message:', msg)
                  console.log('🔍 Current user:', user)
                  console.log('🔍 Message sender:', msg.sender)
                  
                  // Determine if message is from current user
                  let isFromUser = false
                  
                  // First check if backend already set isFromUser
                  if (msg.isFromUser === true) {
                    isFromUser = true
                    console.log('🔍 Backend says isFromUser is true')
                  } else if (msg.sender) {
                    // Check by sender ID
                    const userId = user?.id || user?._id
                    const senderId = msg.sender.id || msg.sender._id
                    
                    if (userId && senderId && userId.toString() === senderId.toString()) {
                      isFromUser = true
                      console.log('🔍 User ID match:', userId, '===', senderId)
                    } else if (msg.sender.role === 'user') {
                      isFromUser = true
                      console.log('🔍 Sender role is user')
                    }
                  }
                  
                  console.log('🔍 Message isFromUser from backend:', msg.isFromUser)
                  console.log('🔍 Message sender role:', msg.sender?.role)
                  console.log('🔍 Message sender ID:', msg.sender?.id)
                  console.log('🔍 Current user ID:', user?.id || user?._id)
                  
                  console.log('🔍 Is from user:', isFromUser)
                  
                  return (
                    <div
                      key={msg.id || msg._id}
                      className={`flex ${
                        isFromUser ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {/* User Avatar - Show only for incoming messages */}
                        {!isFromUser && (
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold ${getAvatarColor(msg.sender?.name)}`}>
                            {getUserAvatar(msg.sender?.name)}
                          </div>
                        )}
                        
                        <div
                          className={`max-w-xs px-4 py-3 rounded-2xl break-words shadow-sm ${
                            isFromUser
                              ? "text-white font-medium"
                              : "bg-gray-100 text-gray-800"
                          }`}
                          style={{
                            backgroundColor: isFromUser ? (userDashboardColor || '#1098e8') : undefined
                          }}
                        >
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-8">
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ backgroundColor: `${userDashboardColor}20` }}
                  >
                    <svg className="w-8 h-8" style={{ color: userDashboardColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-medium text-slate-800 mb-2">No messages yet</h4>
                  <p className="text-slate-600">Start a conversation with {selectedChat?.ambassador?.name}</p>
                </div>
              )}
              <div ref={messagesEndRef} />
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
                  borderColor: `${userDashboardColor}40`,
                  focusRingColor: userDashboardColor
                }}
                onKeyDown={(e) => e.key === "Enter" && sendMessage(e)}
              />
              <button
                onClick={sendMessage}
                disabled={sending || !newMessage.trim()}
                className={`px-4 py-2 text-white rounded-lg font-medium transition-all ${
                  sending || !newMessage.trim() 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:opacity-90 hover:shadow-lg'
                }`}
                style={{ backgroundColor: '#1098e8' }}
              >
                {sending ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Sending...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>Send</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </div>
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

export default UserChat
