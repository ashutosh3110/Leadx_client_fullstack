import React, { useEffect, useState, useRef } from "react"
import { io } from "socket.io-client"
import { FaEdit, FaTrash } from "react-icons/fa"
import api from "../utils/Api"
import { getToken, getUser } from "../utils/auth"

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL

const Chat = () => {
  const [chats, setChats] = useState([])
  const [selectedChat, setSelectedChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [socket, setSocket] = useState(null)
  const [editingMessage, setEditingMessage] = useState(null)
  const messageEndRef = useRef(null)

  const token = getToken()
  const user = getUser()
  const userId = user?.id

  const getImageUrl = (path) => {
    if (!path) return "/default-avatar.png"
    return `http://localhost:5000/${path.replace(/^public\//, "")}`
  }

  // Scroll to bottom on new messages
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Initialize socket
  useEffect(() => {
    if (!token) return
    const s = io(SOCKET_URL, { auth: { token } })
    setSocket(s)

    s.on("connect", () => console.log("✅ Socket connected"))

    s.on("newMessage", (msg) => {
      if (msg.chatId === selectedChat?._id) {
        setMessages((prev) => [...prev, msg])
      }
    })

    s.on("messageUpdated", (updated) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === updated._id ? updated : m))
      )
    })

    s.on("messageDeleted", (deletedId) => {
      setMessages((prev) => prev.filter((m) => m._id !== deletedId))
    })

    return () => s.disconnect()
  }, [selectedChat, token])

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

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedChat) return

    const receiver = selectedChat.participants.find((p) => p._id !== userId)
    if (!receiver?._id) return

    try {
      if (editingMessage) {
        // Update message
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
        // Send new message
        const res = await api.post(
          `/chat/send`,
          {
            sender: userId,
            chatId: selectedChat._id,
            content: newMessage,
            receiver: receiver._id,
          }
          // { headers: { Authorization: `Bearer ${token}` } }
        )
        if (res.data.success) {
          setMessages((prev) => [...prev, res.data.message])
          setNewMessage("")
        }
      }
    } catch (err) {
      console.error(err)
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
                  <img
                    src={getImageUrl(
                      chat.participants.find((p) => p._id !== userId)
                        ?.profileImage
                    )}
                    alt="profile"
                    className="w-10 h-10 rounded-full object-cover"
                  />

                  <div>
                    <p className="font-medium">{other.name}</p>
                    <p className="text-xs text-gray-500 truncate w-40">
                      {chat.lastMessage || "No messages yet"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteChat(chat._id)}
                  className="text-red-500 text-sm hover:underline ml-2"
                >
                  Delete
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            <div className="p-4 border-b flex items-center gap-3 bg-white">
              <img
                src={getImageUrl(
                  selectedChat.participants.find((p) => p._id !== userId)
                    ?.profileImage
                )}
                alt="profile"
                className="w-10 h-10 rounded-full object-cover"
              />
              <p className="font-semibold">
                {selectedChat.participants.find((p) => p._id !== userId)?.name}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">
              {messages.map((msg) => (
                <div
                  key={msg._id}
                  className={`flex ${
                    isMine(msg) ? "justify-end" : "justify-start"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`max-w-xs px-3 py-2 rounded-lg break-words ${
                        isMine(msg)
                          ? "bg-red-600 text-white"
                          : "bg-gray-200 text-gray-800"
                      }`}
                    >
                      {msg.content}
                    </div>
                    {isMine(msg) && (
                      <div className="flex gap-2 text-gray-500 ml-2">
                        <button
                          onClick={() => {
                            setEditingMessage(msg)
                            setNewMessage(msg.content)
                          }}
                          className="hover:text-blue-500"
                          title="Edit"
                        >
                          <FaEdit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteMessage(msg._id)}
                          className="hover:text-red-500"
                          title="Delete"
                        >
                          <FaTrash size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messageEndRef} />
            </div>

            <div className="p-4 border-t flex gap-2 bg-white">
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-600"
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <button
                onClick={handleSend}
                className="px-4 py-2 bg-red-600 text-white rounded-lg"
              >
                {editingMessage ? "Update" : "Send"}
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
