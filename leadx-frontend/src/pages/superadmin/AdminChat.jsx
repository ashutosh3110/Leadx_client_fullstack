// import React, { useEffect, useMemo, useRef, useState } from "react"
// import { useSearchParams } from "react-router-dom"
// import api from "../utils/Api"

// const AdminChat = () => {
//   const [searchParams, setSearchParams] = useSearchParams()
//   const [ambassador, setAmbassador] = useState(null)
//   const [ambassadors, setAmbassadors] = useState([])
//   const [chats, setChats] = useState([])
//   const [messages, setMessages] = useState([])
//   const [selectedChat, setSelectedChat] = useState(null)
//   const [newMessage, setNewMessage] = useState("")
//   const [loading, setLoading] = useState(false)
//   const endRef = useRef(null)

//   const ambassadorId = searchParams.get("ambassadorId") || ""

//   const getImageUrl = (path) => {
//     if (!path) return "/default-avatar.png"
//     const base = import.meta.env.VITE_API_URL
//     const normalized = String(path).replace(/^\.\/+/, "").replace(/^\/+/, "")
//     return `${base}/${normalized}`
//   }

//   const fetchAmbassadors = async () => {
//     try {
//       const res = await api.get(`/user/admin/ambassadors`)
//       if (res.data.success) setAmbassadors(res.data.data)
//     } catch (e) {
//       console.error(e)
//     }
//   }

//   const fetchChats = async () => {
//     if (!ambassadorId) return
//     try {
//       setLoading(true)
//       const res = await api.get(`/chat/admin/ambassador/${ambassadorId}/chats`)
//       if (res.data.success) setChats(res.data.data)
//     } catch (e) {
//       console.error(e)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const fetchMessages = async (chatId) => {
//     try {
//       const res = await api.get(`/chat/admin/chat/${chatId}/messages`)
//       if (res.data.success) setMessages(res.data.data)
//     } catch (e) {
//       console.error(e)
//     }
//   }

//   useEffect(() => {
//     fetchAmbassadors()
//   }, [])

//   useEffect(() => {
//     if (ambassadorId) {
//       const selected = ambassadors.find((a) => a._id === ambassadorId)
//       setAmbassador(selected || null)
//       fetchChats()
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [ambassadorId])

//   useEffect(() => {
//     endRef.current?.scrollIntoView({ behavior: "smooth" })
//   }, [messages])

//   const handleSelectAmbassador = (id) => {
//     setSearchParams({ ambassadorId: id })
//     setSelectedChat(null)
//     setMessages([])
//   }

//   const handleSelectChat = (chat) => {
//     setSelectedChat(chat)
//     fetchMessages(chat._id)
//   }

//   const handleSend = async () => {
//     if (!selectedChat || !ambassadorId || !newMessage.trim()) return
//     const other = selectedChat.participants.find((p) => p._id !== ambassadorId)
//     if (!other?._id) return
//     try {
//       const res = await api.post(`/chat/admin/send-as-ambassador`, {
//         chatId: selectedChat._id,
//         asAmbassadorId: ambassadorId,
//         toUserId: other._id,
//         content: newMessage,
//       })
//       if (res.data.success) {
//         setMessages((prev) => [...prev, res.data.data || res.data.message])
//         setNewMessage("")
//         fetchChats()
//       }
//     } catch (e) {
//       console.error(e)
//     }
//   }

//   return (
//     <div className="flex h-[80vh] bg-white rounded shadow overflow-hidden">
//       <div className="w-64 border-r">
//         <div className="p-3 font-semibold border-b">Ambassadors</div>
//         <div className="overflow-y-auto h-full">
//           {ambassadors.map((a) => (
//             <div
//               key={a._id}
//               className={`p-3 cursor-pointer hover:bg-gray-50 ${
//                 ambassadorId === a._id ? "bg-gray-100" : ""
//               }`}
//               onClick={() => handleSelectAmbassador(a._id)}
//             >
//               <div className="text-sm font-medium">{a.name}</div>
//               <div className="text-xs text-gray-500">{a.email}</div>
//             </div>
//           ))}
//         </div>
//       </div>

//       <div className="w-80 border-r">
//         <div className="p-3 font-semibold border-b">Chats</div>
//         {loading ? (
//           <div className="p-3 text-sm">Loading...</div>
//         ) : (
//           <div className="overflow-y-auto h-full">
//             {chats.map((chat) => {
//               const other = chat.participants.find((p) => p._id !== ambassadorId) || {}
//               return (
//                 <div
//                   key={chat._id}
//                   className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 ${
//                     selectedChat?._id === chat._id ? "bg-gray-100" : ""
//                   }`}
//                   onClick={() => handleSelectChat(chat)}
//                 >
//                   <img
//                     src={getImageUrl(other.profileImage)}
//                     alt="profile"
//                     className="w-8 h-8 rounded-full object-cover"
//                   />
//                   <div className="flex-1">
//                     <div className="text-sm font-medium">{other.name || "User"}</div>
//                     <div className="text-xs text-gray-500 truncate">
//                       {chat.lastMessage?.content || "No messages yet"}
//                     </div>
//                   </div>
//                 </div>
//               )
//             })}
//           </div>
//         )}
//       </div>

//       <div className="flex-1 flex flex-col">
//         {selectedChat ? (
//           <>
//             <div className="p-3 border-b flex items-center gap-2">
//               <img
//                 src={getImageUrl(
//                   selectedChat.participants.find((p) => p._id !== ambassadorId)?.profileImage
//                 )}
//                 className="w-8 h-8 rounded-full object-cover"
//               />
//               <div className="font-medium">
//                 {selectedChat.participants.find((p) => p._id !== ambassadorId)?.name}
//               </div>
//             </div>
//             <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50">
//               {messages.map((m) => (
//                 <div key={m._id} className={`flex ${m.sender?._id === ambassadorId ? "justify-end" : "justify-start"}`}>
//                   <div className={`max-w-xs px-3 py-2 rounded ${m.sender?._id === ambassadorId ? "bg-red-600 text-white" : "bg-gray-200"}`}>
//                     {m.content}
//                   </div>
//                 </div>
//               ))}
//               <div ref={endRef} />
//             </div>
//             <div className="p-3 border-t flex gap-2">
//               <input
//                 value={newMessage}
//                 onChange={(e) => setNewMessage(e.target.value)}
//                 placeholder="Type a message..."
//                 className="flex-1 border rounded px-3 py-2"
//                 onKeyDown={(e) => e.key === "Enter" && handleSend()}
//               />
//               <button onClick={handleSend} className="px-4 py-2 rounded bg-red-600 text-white">
//                 Send as Ambassador
//               </button>
//             </div>
//           </>
//         ) : (
//           <div className="flex-1 flex items-center justify-center text-gray-400">
//             Select an ambassador and a chat
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }

// export default AdminChat

