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
                    
                    const user = chat.participants.find(p => p._id !== ambassadorId);
                    console.log('🔍 Found user:', user);
                    
                    if (user) {
                        return {
                            id: user._id,
                            name: user.name,
                            email: user.email,
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
            setLoading(true);
            console.log('Fetching messages for chatId:', chatId);
            const response = await api.get(`/chat/admin/chat/${chatId}/messages`);
            console.log('Messages response:', response.data);
            if (response.data.success) {
                const messages = response.data.data.map(msg => ({
                    id: msg._id,
                    sender: msg.sender._id,
                    senderName: msg.sender.name,
                    message: msg.content,
                    timestamp: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    isUser: msg.sender.role === 'user'
                }));
                console.log('Processed messages:', messages);
                setChatMessages(messages);
            }
        } catch (error) {
            console.error('Error fetching chat messages:', error);
        } finally {
            setLoading(false);
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
        setSelectedUser(user);
        setChatMessages([]);
        fetchChatMessages(user.chatId);
    };

    const handleSendMessage = () => {
        if (newMessage.trim() && selectedUser) {
            const message = {
                id: Date.now(),
                sender: 'admin',
                message: newMessage.trim(),
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isUser: false
            };
            setChatMessages(prev => [...prev, message]);
            setNewMessage('');
        }
    };

    return (
        <div className="h-full flex flex-col bg-white">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 px-4 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <h1 className="text-xl font-semibold text-slate-800 flex items-center">
                            <svg className="w-5 h-5 text-yellow-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            Ambassador Chat Management
                        </h1>
                        <p className="text-sm text-slate-600">Manage conversations between ambassadors and users</p>
                    </div>
                    {/* Mobile Navigation */}
                    <div className="flex space-x-2 lg:hidden">
                        {selectedAmbassador && (
                            <button
                                onClick={() => setSelectedAmbassador(null)}
                                className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
                            >
                                ← Ambassadors
                            </button>
                        )}
                        {selectedUser && (
                            <button
                                onClick={() => setSelectedUser(null)}
                                className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 transition-colors"
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
                                        onClick={() => handleAmbassadorSelect(ambassador)}
                                        className={`p-3 rounded-lg cursor-pointer transition-colors mb-2 ${
                                            selectedAmbassador?._id === ambassador._id
                                                ? 'bg-blue-50 border-2 border-blue-200'
                                                : 'bg-white hover:bg-gray-50 border-2 border-transparent'
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
                                            onClick={() => handleUserSelect(user)}
                                            className={`p-3 rounded-lg cursor-pointer transition-colors mb-2 ${
                                                selectedUser?.id === user.id
                                                    ? 'bg-blue-50 border-2 border-blue-200'
                                                    : 'bg-white hover:bg-gray-50 border-2 border-transparent'
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
                        <div className="p-4 border-b border-slate-200 bg-white">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200 flex-shrink-0">
                                        {selectedUser.profileImage ? (
                                            <img
                                                src={`${import.meta.env.VITE_API_URL}/${selectedUser.profileImage}`}
                                                alt={selectedUser.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                                                {selectedUser.name.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-900">{selectedUser.name}</h3>
                                        <p className="text-sm text-slate-500">{selectedUser.email}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedUser(null)}
                                    className="text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {loading ? (
                                <div className="flex justify-center items-center h-32">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                    <p className="ml-2 text-gray-500">Loading messages...</p>
                                </div>
                            ) : chatMessages.length > 0 ? (
                                chatMessages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-xs sm:max-w-md lg:max-w-lg px-4 py-2 rounded-lg ${
                                                message.isUser
                                                    ? 'bg-blue-500 text-white'
                                                    : 'bg-gray-200 text-gray-800'
                                            }`}
                                        >
                                            <p className="text-sm">{message.message}</p>
                                            <p className={`text-xs mt-1 ${
                                                message.isUser ? 'text-blue-100' : 'text-gray-500'
                                            }`}>
                                                {message.timestamp} • {message.senderName}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col justify-center items-center h-32 text-gray-500">
                                    <svg className="w-12 h-12 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                    <p className="text-center">No messages in this chat yet</p>
                                    <p className="text-xs text-gray-400 mt-1">Start a conversation from the ambassador dashboard</p>
                                </div>
                            )}
                        </div>

                        {/* Message Input */}
                        <div className="p-4 border-t border-slate-200 bg-white">
                            <div className="flex space-x-2">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                    placeholder="Type your message..."
                                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm"
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!newMessage.trim()}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                </button>
                            </div>
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
