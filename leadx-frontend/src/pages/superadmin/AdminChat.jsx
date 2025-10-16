import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../utils/Api';

const AdminChat = () => {
    const { ambassadors } = useOutletContext();
    const [selectedAmbassador, setSelectedAmbassador] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [chatMessages, setChatMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [ambassadorUsers, setAmbassadorUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetchingMessages, setFetchingMessages] = useState(false);

    // Fetch users for selected ambassador
    const fetchAmbassadorUsers = async (ambassadorId) => {
        try {
            setLoading(true);
            console.log('🔍 Fetching users for ambassador:', ambassadorId);
            const response = await api.get(`/chat/admin/ambassador/${ambassadorId}/chats`);
            console.log('🔍 Ambassador chats response:', response.data);
            
            if (response.data.success && response.data.data) {
                console.log('🔍 Raw chats data:', response.data.data);
                
                // Extract users from chats (participants excluding the ambassador)
                const users = response.data.data.map(chat => {
                    console.log('🔍 Processing chat:', chat);
                    console.log('🔍 Chat participants:', chat.participants);
                    
                    if (!chat.participants || !Array.isArray(chat.participants)) {
                        console.log('🔍 Invalid participants array:', chat.participants);
                        return null;
                    }
                    
                    const user = chat.participants.find(p => p && p._id && p._id !== ambassadorId);
                    console.log('🔍 Found user:', user);
                    
                    if (user && user._id) {
                        return {
                            id: user._id,
                            name: user.name || 'Unknown User',
                            email: user.email || 'No email',
                            profileImage: user.profileImage,
                            chatId: chat._id,
                            lastMessage: chat.lastMessage ? {
                                content: chat.lastMessage.content,
                                timestamp: chat.lastMessage.createdAt,
                                sender: chat.lastMessage.sender
                            } : null
                        };
                    }
                    return null;
                }).filter(user => user !== null);
                
                console.log('✅ Processed users:', users);
                setAmbassadorUsers(users);
            } else {
                console.log('❌ No chats found for ambassador');
                setAmbassadorUsers([]);
            }
        } catch (error) {
            console.error('❌ Error fetching ambassador users:', error);
            console.error('❌ Error response:', error.response?.data);
            setAmbassadorUsers([]);
        } finally {
            setLoading(false);
        }
    };

    // Fetch messages for a specific chat
    const fetchChatMessages = async (chatId) => {
        try {
            // Prevent multiple simultaneous calls
            if (fetchingMessages) {
                console.log('🔍 Already fetching messages, skipping');
                return;
            }
            
            setFetchingMessages(true);
            setLoading(true);
            console.log('Fetching messages for chatId:', chatId);
            
            if (!selectedUser) {
                console.log('No selected user found, but continuing with chatId:', chatId);
                // Don't return, continue with the API call
            }
            
            const response = await api.get(`/chat/admin/chat/${chatId}/messages`);
            console.log('Messages response:', response.data);
            if (response.data.success) {
                const messages = response.data.data.map(msg => {
                    console.log('🔍 Message sender data:', {
                        id: msg._id,
                        senderId: msg.sender._id,
                        senderRole: msg.sender.role,
                        senderName: msg.sender.name,
                        content: msg.content
                    });
                    
                    // Use role-based logic with fallback to ID comparison
                    let isUserMessage = false;
                    
                    // First try role-based detection
                    if (msg.sender.role === 'user') {
                        isUserMessage = true;
                    } else if (msg.sender.role === 'ambassador') {
                        isUserMessage = false;
                    } else {
                        // Fallback to ID comparison if role is not set
                        isUserMessage = selectedUser && msg.sender._id.toString() === selectedUser.id.toString();
                    }
                    
                    console.log('🔍 Message analysis:', {
                        senderId: msg.sender._id.toString(),
                        selectedUserId: selectedUser ? selectedUser.id.toString() : 'null',
                        selectedUserName: selectedUser ? selectedUser.name : 'null',
                        senderRole: msg.sender.role,
                        senderName: msg.sender.name,
                        isUserMessage: isUserMessage,
                        content: msg.content
                    });
                    
                    return {
                        id: msg._id,
                        sender: msg.sender._id,
                        senderName: isUserMessage ? 'user' : 'ambassador',
                        message: msg.content,
                        timestamp: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        isUser: isUserMessage
                    };
                });
                console.log('Processed messages:', messages);
                console.log('🔍 Messages count:', messages.length);
                console.log('🔍 Selected user:', selectedUser);
                console.log('🔍 Setting chat messages state...');
                setChatMessages(messages);
                console.log('🔍 Chat messages state updated');
            }
        } catch (error) {
            console.error('Error fetching chat messages:', error);
        } finally {
            setLoading(false);
            setFetchingMessages(false);
        }
    };

    const handleAmbassadorSelect = (ambassador) => {
        setSelectedAmbassador(ambassador);
        setSelectedUser(null);
        setChatMessages([]);
        setAmbassadorUsers([]);
        fetchAmbassadorUsers(ambassador._id);
    };

    const handleUserSelect = (user) => {
        console.log('🔍 Selecting user:', user);
        if (!user || !user.chatId) {
            console.error('Invalid user or missing chatId:', user);
            return;
        }
        
        // Prevent double-click issues by checking if already selected
        if (selectedUser && selectedUser.id === user.id) {
            console.log('🔍 User already selected, skipping');
            return;
        }
        
        setSelectedUser(user);
        setChatMessages([]);
        fetchChatMessages(user.chatId);
    };

    const handleSendMessage = async () => {
        if (newMessage.trim() && selectedUser && selectedAmbassador) {
            try {
                // Send message on behalf of the ambassador
                const response = await api.post('/chat/admin/send-as-ambassador', {
                    chatId: selectedUser.chatId,
                    content: newMessage.trim(),
                    asAmbassadorId: selectedAmbassador._id,
                    toUserId: selectedUser.id
                });

                if (response.data.success) {
                    // Add message to chat as if sent by ambassador
                    const message = {
                        id: response.data.message._id || Date.now(),
                        sender: selectedAmbassador._id,
                        senderName: 'ambassador',
                        message: newMessage.trim(),
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        isUser: false
                    };
                    setChatMessages(prev => [...prev, message]);
                    setNewMessage('');
                } else {
                    console.error('Failed to send message:', response.data.message);
                }
            } catch (error) {
                console.error('Error sending message:', error);
                // Fallback: add message locally
                const message = {
                    id: Date.now(),
                    sender: selectedAmbassador._id,
                    senderName: 'ambassador',
                    message: newMessage.trim(),
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    isUser: false
                };
                setChatMessages(prev => [...prev, message]);
                setNewMessage('');
            }
        }
    };

    return (
        <div className="h-full flex flex-col bg-white">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 px-2 sm:px-4 py-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <h1 className="text-lg sm:text-xl font-semibold text-slate-800 flex items-center min-w-0">
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <span className="truncate">Ambassador Chat Management</span>
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-600 hidden sm:block">Manage conversations between ambassadors and users</p>
                    </div>
                    {/* Mobile Navigation */}
                    <div className="flex flex-wrap gap-1 sm:gap-2 lg:hidden w-full sm:w-auto justify-end">
                        {selectedAmbassador && (
                            <button
                                onClick={() => setSelectedAmbassador(null)}
                                className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors whitespace-nowrap flex-shrink-0"
                            >
                                ← Ambassadors
                            </button>
                        )}
                        {selectedUser && (
                            <button
                                onClick={() => setSelectedUser(null)}
                                className="px-2 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600 transition-colors whitespace-nowrap flex-shrink-0"
                            >
                                ← Users
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                {/* Left Sidebar - Ambassadors */}
                <div className={`w-full lg:w-80 bg-white border-r border-slate-200 flex flex-col ${selectedAmbassador ? 'hidden lg:flex' : 'flex'}`}>
                    <div className="p-4 border-b border-slate-200 bg-white">
                        <h2 className="text-lg font-medium text-slate-800">Ambassadors</h2>
                        <p className="text-sm text-slate-600">Select an ambassador to view their users</p>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto">
                        {ambassadors && ambassadors.length > 0 ? (
                            <div className="p-2">
                                {ambassadors.map((ambassador) => (
                                    <div
                                        key={ambassador._id}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleAmbassadorSelect(ambassador);
                                        }}
                                        className={`p-3 rounded-lg cursor-pointer transition-all duration-200 mb-2 select-none ${
                                            selectedAmbassador?._id === ambassador._id
                                                ? 'bg-blue-50 border-2 border-blue-200 shadow-sm'
                                                : 'bg-white hover:bg-gray-50 border-2 border-transparent hover:shadow-sm'
                                        }`}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200 flex-shrink-0">
                                                {ambassador.profileImage ? (
                                                    <img
                                                        src={`${import.meta.env.VITE_API_URL}/${ambassador.profileImage}`}
                                                        alt={ambassador.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                                                        {ambassador.name?.charAt(0)?.toUpperCase() || 'A'}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-slate-900 truncate">
                                                    {ambassador.name || 'Unknown Ambassador'}
                                                </p>
                                                <p className="text-xs text-slate-500 truncate">
                                                    {ambassador.email || 'No email'}
                                                </p>
                                                <p className="text-xs text-blue-600 font-medium">
                                                    {selectedAmbassador?._id === ambassador._id ? ambassadorUsers.length : 'Click to load'} users
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-4 text-center text-slate-500">
                                <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                </svg>
                                <p>No ambassadors found</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Middle Sidebar - Users */}
                {selectedAmbassador && (
                    <div className={`w-full lg:w-80 bg-white border-r border-slate-200 flex flex-col ${selectedUser ? 'hidden lg:flex' : 'flex'}`}>
                        <div className="p-4 border-b border-slate-200 bg-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-medium text-slate-800">Users</h2>
                                    <p className="text-sm text-slate-600">
                                        Users for {selectedAmbassador.name}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSelectedAmbassador(null)}
                                    className="text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto">
                            {loading ? (
                                <div className="p-4 text-center text-slate-500">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                                    <p>Loading users...</p>
                                </div>
                            ) : ambassadorUsers.length > 0 ? (
                                <div className="p-2">
                                    {ambassadorUsers.map((user) => (
                                        <div
                                            key={user.id}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleUserSelect(user);
                                            }}
                                            className={`p-3 rounded-lg cursor-pointer transition-all duration-200 mb-2 select-none ${
                                                selectedUser?.id === user.id
                                                    ? 'bg-blue-50 border-2 border-blue-200 shadow-sm'
                                                    : 'bg-white hover:bg-gray-50 border-2 border-transparent hover:shadow-sm'
                                            }`}
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-gray-200 flex-shrink-0">
                                                    {user.profileImage ? (
                                                        <img
                                                            src={`${import.meta.env.VITE_API_URL}/${user.profileImage}`}
                                                            alt={user.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                                                            {user.name.charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-slate-900 truncate">
                                                        {user.name}
                                                    </p>
                                                    <p className="text-xs text-slate-500 truncate">
                                                        {user.email}
                                                    </p>
                                                    <p className="text-xs text-blue-600 font-medium">
                                                        {user.lastMessage ? `Last: ${user.lastMessage.content}` : 'No messages yet'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-4 text-center text-slate-500">
                                    <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                    </svg>
                                    <p>No users found for this ambassador</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Chat Area */}
                {selectedUser ? (
                    <div className="flex-1 flex flex-col bg-white">
                        {/* Chat Header */}
                        <div className="p-2 sm:p-4 border-b border-slate-200 bg-white">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-gray-200 flex-shrink-0">
                                        {selectedUser.profileImage ? (
                                            <img
                                                src={`${import.meta.env.VITE_API_URL}/${selectedUser.profileImage}`}
                                                alt={selectedUser.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs sm:text-sm font-bold">
                                                {selectedUser.name.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-semibold text-slate-900 text-sm sm:text-base truncate">{selectedUser.name}</h3>
                                        <p className="text-xs sm:text-sm text-slate-500 truncate">{selectedUser.email}</p>
                                        <p className="text-xs text-blue-600 font-medium truncate">
                                            💬 Chatting as {selectedAmbassador.name}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedUser(null)}
                                    className="text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0 p-1"
                                >
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-3 bg-gray-50">
                            {/* Debug Info */}
                            {process.env.NODE_ENV === 'development' && (
                                <div className="text-xs text-gray-400 p-2 bg-gray-100 rounded mb-2">
                                    Debug: Loading: {loading.toString()}, Messages: {chatMessages.length}, Selected User: {selectedUser?.name || 'None'}
                                </div>
                            )}
                            {loading ? (
                                <div className="flex justify-center items-center h-32">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                    <p className="ml-2 text-gray-500">Loading messages...</p>
                                </div>
                            ) : chatMessages.length > 0 ? (
                                <div className="space-y-3">
                                    {chatMessages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={`flex w-full ${
                                            message.isUser ? "justify-start" : "justify-end"
                                        }`}
                                    >
                                        <div className={`flex items-end gap-2 max-w-[85%] ${
                                            message.isUser ? "flex-row" : "flex-row-reverse"
                                        }`}>
                                            {/* User Avatar - Show only for user messages (left side) */}
                                            {message.isUser && (
                                                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-semibold bg-blue-500 flex-shrink-0">
                                                    {selectedUser.name.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            
                                            <div
                                                className={`px-3 py-2 rounded-lg break-words text-sm sm:text-base ${
                                                    message.isUser
                                                        ? "bg-gray-200 text-gray-800 rounded-bl-sm"
                                                        : "text-white rounded-br-sm"
                                                }`}
                                                style={{
                                                    backgroundColor: !message.isUser ? '#3b82f6' : undefined,
                                                    maxWidth: '100%'
                                                }}
                                            >
                                                {message.message}
                                            </div>
                                        </div>
                                    </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col justify-center items-center h-32 text-gray-500 px-4">
                                    <svg className="w-8 h-8 sm:w-12 sm:h-12 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                    <p className="text-center text-sm sm:text-base">No messages in this chat yet</p>
                                    <p className="text-xs text-gray-400 mt-1 text-center">Start a conversation from the ambassador dashboard</p>
                                </div>
                            )}
                        </div>

                        {/* Message Input */}
                        <div className="p-2 sm:p-4 border-t flex gap-1 sm:gap-2 bg-white">
                            <input
                                type="text"
                                placeholder="Type a message..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                className="flex-1 border rounded-lg px-2 sm:px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2"
                                style={{ 
                                    borderColor: '#3b82f640',
                                    focusRingColor: '#3b82f6'
                                }}
                                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={!newMessage.trim()}
                                className={`px-3 sm:px-4 py-2 text-white rounded-lg transition-opacity text-sm sm:text-base whitespace-nowrap ${
                                    !newMessage.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
                                }`}
                                style={{ backgroundColor: '#3b82f6' }}
                            >
                                Send
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
                        <div className="text-center">
                            <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">Select a User to Start Chatting</h3>
                            <p className="text-slate-500">Choose an ambassador and then select a user to view their conversation</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminChat;
