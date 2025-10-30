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
    const [ambassadorUserCounts, setAmbassadorUserCounts] = useState({});
    const [loadingUserCounts, setLoadingUserCounts] = useState(false);

    // Load user counts for all ambassadors when component mounts
    useEffect(() => {
        if (ambassadors && ambassadors.length > 0) {
            console.log('🔍 Loading user counts for all ambassadors...');
            setLoadingUserCounts(true);
            
            const loadAllCounts = async () => {
                try {
                    await Promise.all(
                        ambassadors.map(ambassador => {
                            const ambassadorId = ambassador.id || ambassador._id;
                            if (ambassadorId) {
                                return fetchAmbassadorUserCount(ambassadorId);
                            }
                            return Promise.resolve();
                        })
                    );
                } finally {
                    setLoadingUserCounts(false);
                }
            };
            
            loadAllCounts();
        }
    }, [ambassadors]);

    // Message status indicator component
    const MessageStatusIndicator = ({ status, isRead, isUser }) => {
        if (isUser) return null; // Don't show status for user messages
        
        const getStatusIcon = () => {
            switch (status) {
                case 'sent':
                    return (
                        <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                    );
                case 'delivered':
                    return (
                        <div className="flex">
                            <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            <svg className="w-2.5 h-2.5 -ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        </div>
                    );
                case 'read':
                    return (
                        <div className="flex">
                            <svg className="w-2.5 h-2.5" fill="#3b82f6" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            <svg className="w-2.5 h-2.5 -ml-0.5" fill="#3b82f6" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        </div>
                    );
                default:
                    return null;
            }
        };

        return (
            <div className="flex items-center ml-1">
                {getStatusIcon()}
            </div>
        );
    };

    // Fetch user count for a specific ambassador
    const fetchAmbassadorUserCount = async (ambassadorId) => {
        try {
            console.log('🔍 Fetching user count for ambassador:', ambassadorId);
            const response = await api.get(`/chat/admin/ambassador/${ambassadorId}/chats`);
            
            if (response.data.success && response.data.data) {
                const users = response.data.data.map(chat => {
                    if (!chat.participants || !Array.isArray(chat.participants)) {
                        return null;
                    }
                    
                    const user = chat.participants.find(p => p && p.id && p.id !== ambassadorId);
                    return user ? user.id : null;
                }).filter(userId => userId !== null);
                
                // Remove duplicates
                const uniqueUsers = [...new Set(users)];
                
                setAmbassadorUserCounts(prev => ({
                    ...prev,
                    [ambassadorId]: uniqueUsers.length
                }));
                
                console.log(`✅ Ambassador ${ambassadorId} has ${uniqueUsers.length} users`);
            } else {
                setAmbassadorUserCounts(prev => ({
                    ...prev,
                    [ambassadorId]: 0
                }));
            }
        } catch (error) {
            console.error('❌ Error fetching ambassador user count:', error);
            setAmbassadorUserCounts(prev => ({
                ...prev,
                [ambassadorId]: 0
            }));
        }
    };

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
                    
                    const user = chat.participants.find(p => p && p.id && p.id !== ambassadorId);
                    console.log('🔍 Found user:', user);
                    console.log('🔍 User country:', user?.country);
                    
                    if (user && user.id) {
                        return {
                            id: user.id,
                            name: user.name || 'Unknown User',
                            email: user.email || 'No email',
                            country: user.country || 'Not specified',
                            profileImage: user.profileImage,
                            chatId: chat.id,
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
                
                // Update user count for this ambassador
                setAmbassadorUserCounts(prev => ({
                    ...prev,
                    [ambassadorId]: users.length
                }));
            } else {
                console.log('❌ No chats found for ambassador');
                setAmbassadorUsers([]);
                setAmbassadorUserCounts(prev => ({
                    ...prev,
                    [ambassadorId]: 0
                }));
            }
        } catch (error) {
            console.error('❌ Error fetching ambassador users:', error);
            console.error('❌ Error response:', error.response?.data);
            setAmbassadorUsers([]);
            setAmbassadorUserCounts(prev => ({
                ...prev,
                [ambassadorId]: 0
            }));
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
                        id: msg.id,
                        senderId: msg.sender.id,
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
                        isUserMessage = selectedUser && msg.sender.id.toString() === selectedUser.id.toString();
                    }
                    
                    console.log('🔍 Message analysis:', {
                        senderId: msg.sender.id.toString(),
                        selectedUserId: selectedUser ? selectedUser.id.toString() : 'null',
                        selectedUserName: selectedUser ? selectedUser.name : 'null',
                        senderRole: msg.sender.role,
                        senderName: msg.sender.name,
                        isUserMessage: isUserMessage,
                        content: msg.content
                    });
                    
                    return {
                        id: msg.id,
                        sender: msg.sender.id,
                        senderName: isUserMessage ? 'user' : 'ambassador',
                        message: msg.content,
                        timestamp: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        date: new Date(msg.createdAt).toLocaleDateString([], { day: '2-digit', month: '2-digit', year: 'numeric' }),
                        fullTimestamp: msg.createdAt,
                        isUser: isUserMessage,
                        status: msg.status || 'sent', // sent, delivered, read
                        isRead: msg.isRead || false
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
        const ambassadorId = ambassador.id || ambassador._id;
        fetchAmbassadorUsers(ambassadorId);
        // Also refresh the user count for this ambassador
        fetchAmbassadorUserCount(ambassadorId);
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

    // Simulate message status updates
    const simulateMessageStatus = (messageId) => {
        // Simulate delivered status after 1 second
        setTimeout(() => {
            setChatMessages(prev => prev.map(msg => 
                msg.id === messageId 
                    ? { ...msg, status: 'delivered' }
                    : msg
            ));
        }, 1000);

        // Simulate read status after 3 seconds
        setTimeout(() => {
            setChatMessages(prev => prev.map(msg => 
                msg.id === messageId 
                    ? { ...msg, status: 'read', isRead: true }
                    : msg
            ));
        }, 3000);
    };

    const handleSendMessage = async () => {
        if (newMessage.trim() && selectedUser && selectedAmbassador) {
            try {
                // Send message on behalf of the ambassador
                const response = await api.post('/chat/admin/send-as-ambassador', {
                    chatId: selectedUser.chatId,
                    content: newMessage.trim(),
                    asAmbassadorId: selectedAmbassador.id || selectedAmbassador._id,
                    toUserId: selectedUser.id
                });

                if (response.data.success) {
                    // Add message to chat as if sent by ambassador
                    const message = {
                        id: response.data.message._id || Date.now(),
                        sender: selectedAmbassador.id || selectedAmbassador._id,
                        senderName: 'ambassador',
                        message: newMessage.trim(),
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        date: new Date().toLocaleDateString([], { day: '2-digit', month: '2-digit', year: 'numeric' }),
                        fullTimestamp: new Date().toISOString(),
                        isUser: false,
                        status: 'sent',
                        isRead: false
                    };
                    setChatMessages(prev => [...prev, message]);
                    setNewMessage('');
                    
                    // Simulate status updates
                    simulateMessageStatus(message.id);
                    
                    // Update user count for the ambassador
                    if (selectedAmbassador) {
                        const ambassadorId = selectedAmbassador.id || selectedAmbassador._id;
                        fetchAmbassadorUserCount(ambassadorId);
                    }
                } else {
                    console.error('Failed to send message:', response.data.message);
                }
            } catch (error) {
                console.error('Error sending message:', error);
                // Fallback: add message locally
                const message = {
                    id: Date.now(),
                    sender: selectedAmbassador.id || selectedAmbassador._id,
                    senderName: 'ambassador',
                    message: newMessage.trim(),
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    date: new Date().toLocaleDateString([], { day: '2-digit', month: '2-digit', year: 'numeric' }),
                    fullTimestamp: new Date().toISOString(),
                    isUser: false,
                    status: 'sent',
                    isRead: false
                };
                setChatMessages(prev => [...prev, message]);
                setNewMessage('');
                
                // Simulate status updates
                simulateMessageStatus(message.id);
                
                // Update user count for the ambassador
                if (selectedAmbassador) {
                    const ambassadorId = selectedAmbassador.id || selectedAmbassador._id;
                    fetchAmbassadorUserCount(ambassadorId);
                }
            }
        }
    };

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
                            <span className="truncate">Ambassador Chat Management</span>
                        </h1>
                        <p className="text-xs text-slate-600 hidden sm:block">Manage conversations between ambassadors and users</p>
                    </div>
                    {/* Mobile Navigation */}
                    <div className="flex flex-wrap gap-1 lg:hidden w-full sm:w-auto justify-end">
                        {selectedAmbassador && (
                            <button
                                onClick={() => setSelectedAmbassador(null)}
                                className="px-1.5 py-0.5 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors whitespace-nowrap flex-shrink-0"
                            >
                                ← Ambassadors
                            </button>
                        )}
                        {selectedUser && (
                            <button
                                onClick={() => setSelectedUser(null)}
                                className="px-1.5 py-0.5 bg-gray-500 text-white rounded text-xs hover:bg-gray-600 transition-colors whitespace-nowrap flex-shrink-0"
                            >
                                ← Users
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                {/* Left Sidebar - Ambassadors */}
                <div className={`w-full lg:w-56 bg-white border-r border-slate-200 flex flex-col ${selectedAmbassador ? 'hidden lg:flex' : 'flex'}`}>
                    <div className="p-2 border-b border-slate-200 bg-white">
                        <h2 className="text-sm font-medium text-slate-800">Ambassadors</h2>
                        <p className="text-xs text-slate-600">Select an ambassador to view their users</p>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto">
                        {ambassadors && ambassadors.length > 0 ? (
                            <div className="p-2">
                                {ambassadors.map((ambassador) => (
                                    <div
                                        key={ambassador.id || ambassador._id}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleAmbassadorSelect(ambassador);
                                        }}
                                        className={`p-1.5 rounded-lg cursor-pointer transition-all duration-200 mb-1 select-none ${
                                            selectedAmbassador?.id === ambassador.id || selectedAmbassador?._id === ambassador._id
                                                ? 'bg-blue-50 border-2 border-blue-200 shadow-sm'
                                                : 'bg-white hover:bg-gray-50 border-2 border-transparent hover:shadow-sm'
                                        }`}
                                    >
                                        <div className="flex items-center space-x-1.5">
                                            <div className="w-6 h-6 rounded-full overflow-hidden border-2 border-gray-200 flex-shrink-0">
                                                {ambassador.profileImage ? (
                                                    <img
                                                        src={`${import.meta.env.VITE_API_URL}/${ambassador.profileImage}`}
                                                        alt={ambassador.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                                                        {ambassador.name?.charAt(0)?.toUpperCase() || 'A'}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium text-slate-900 truncate">
                                                    {ambassador.name || 'Unknown Ambassador'}
                                                </p>
                                                <p className="text-xs text-slate-500 truncate">
                                                    {ambassador.email || 'No email'}
                                                </p>
                                                <p className="text-xs text-blue-600 font-medium">
                                                    {loadingUserCounts 
                                                        ? 'Loading...'
                                                        : ambassadorUserCounts[ambassador.id || ambassador._id] !== undefined 
                                                            ? `${ambassadorUserCounts[ambassador.id || ambassador._id]} users`
                                                            : '0 users'
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-3 text-center text-slate-500">
                                <svg className="w-8 h-8 text-slate-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                </svg>
                                <p className="text-xs">No ambassadors found</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Middle Sidebar - Users */}
                {selectedAmbassador && (
                    <div className={`w-full lg:w-56 bg-white border-r border-slate-200 flex flex-col ${selectedUser ? 'hidden lg:flex' : 'flex'}`}>
                        <div className="p-2 border-b border-slate-200 bg-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-sm font-medium text-slate-800">Users</h2>
                                    <p className="text-xs text-slate-600">
                                        Users for {selectedAmbassador.name}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSelectedAmbassador(null)}
                                    className="text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto">
                            {loading ? (
                                <div className="p-3 text-center text-slate-500">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
                                    <p className="text-xs">Loading users...</p>
                                </div>
                            ) : ambassadorUsers.length > 0 ? (
                                <div className="p-1.5">
                                    {ambassadorUsers.map((user) => (
                                        <div
                                            key={user.id}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleUserSelect(user);
                                            }}
                                            className={`p-1.5 rounded-lg cursor-pointer transition-all duration-200 mb-1 select-none ${
                                                selectedUser?.id === user.id
                                                    ? 'bg-blue-50 border-2 border-blue-200 shadow-sm'
                                                    : 'bg-white hover:bg-gray-50 border-2 border-transparent hover:shadow-sm'
                                            }`}
                                        >
                                            <div className="flex items-center space-x-1.5">
                                                <div className="w-5 h-5 rounded-full overflow-hidden border-2 border-gray-200 flex-shrink-0">
                                                    {user.profileImage ? (
                                                        <img
                                                            src={`${import.meta.env.VITE_API_URL}/${user.profileImage}`}
                                                            alt={user.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                                                            {user.name.charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-1.5">
                                                        <p className="text-xs font-medium text-slate-900 truncate">
                                                            {user.name}
                                                        </p>
                                                        <span className="text-[9px] text-slate-400 bg-slate-100 px-1 py-0.5 rounded-full flex-shrink-0">
                                                            {user.country}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-slate-500 truncate">
                                                        {user.email}
                                                    </p>
                                                    <p className="text-xs text-blue-600 font-medium">
                                                        {user.lastMessage ? `Last: ${user.lastMessage.content}` : 'Click to start chat'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-3 text-center text-slate-500">
                                    <svg className="w-8 h-8 text-slate-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                    </svg>
                                    <p className="text-xs">No users found for this ambassador</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Chat Area */}
                {selectedUser ? (
                    <div className="flex-1 flex flex-col bg-white">
                        {/* Chat Header */}
                        <div className="p-2 border-b border-slate-200 bg-white">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2 min-w-0 flex-1">
                                    <div className="w-6 h-6 rounded-full overflow-hidden border-2 border-gray-200 flex-shrink-0">
                                        {selectedUser.profileImage ? (
                                            <img
                                                src={`${import.meta.env.VITE_API_URL}/${selectedUser.profileImage}`}
                                                alt={selectedUser.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                                                {selectedUser.name.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-medium text-slate-900 text-xs truncate">{selectedUser.name}</h3>
                                            <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">
                                                {selectedUser.country}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 truncate">{selectedUser.email}</p>
                                        <p className="text-xs text-blue-600 font-medium truncate">
                                            💬 Chatting as {selectedAmbassador.name}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedUser(null)}
                                    className="text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0 p-1"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-2 space-y-1.5 bg-gray-50">
                            {/* Privacy Notice */}
                            <div className="text-xs text-gray-400 p-1.5 bg-gray-100 rounded mb-2">
                                Don't share your personal information like email and phone number
                            </div>
                            {loading ? (
                                <div className="flex justify-center items-center h-24">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                                    <p className="ml-2 text-gray-500 text-xs">Loading messages...</p>
                                </div>
                            ) : chatMessages.length > 0 ? (
                                <div className="space-y-2">
                                    {chatMessages.map((message, index) => {
                                        // Check if we need to show date separator
                                        const showDateSeparator = index === 0 || 
                                            new Date(message.fullTimestamp).toDateString() !== 
                                            new Date(chatMessages[index - 1].fullTimestamp).toDateString();

                                        return (
                                            <div key={message.id}>
                                                {/* Date Separator */}
                                                {showDateSeparator && (
                                                    <div className="flex justify-center my-1.5">
                                                        <div className="bg-white px-1.5 py-0.5 rounded-full shadow-sm border border-gray-200">
                                                            <span className="text-xs text-gray-500 font-medium">
                                                                {new Date(message.fullTimestamp).toLocaleDateString([], { 
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
                                                        message.isUser ? "justify-start" : "justify-end"
                                                    }`}
                                                >
                                                    <div className={`flex flex-col gap-0.5 max-w-[85%] ${
                                                        message.isUser ? "items-start" : "items-end"
                                                    }`}>
                                                        <div className={`flex items-end gap-1.5 ${
                                                            message.isUser ? "flex-row" : "flex-row-reverse"
                                                        }`}>
                                                            {/* User Avatar - Show only for user messages (left side) */}
                                                            {message.isUser && (
                                                                <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-semibold bg-blue-500 flex-shrink-0">
                                                                    {selectedUser.name.charAt(0).toUpperCase()}
                                                                </div>
                                                            )}
                                                            
                                                            {/* Ambassador Avatar - Show only for ambassador messages (right side) */}
                                                            {!message.isUser && (
                                                                <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-semibold bg-green-500 flex-shrink-0">
                                                                    {selectedAmbassador.name.charAt(0).toUpperCase()}
                                                                </div>
                                                            )}
                                                            
                                                            <div
                                                                className={`px-2 py-1.5 rounded-lg break-words text-xs relative ${
                                                                    message.isUser
                                                                        ? "bg-blue-100 text-blue-900 rounded-bl-sm border border-blue-200"
                                                                        : "text-white rounded-br-sm"
                                                                }`}
                                                                style={{
                                                                    backgroundColor: !message.isUser ? '#3b82f6' : undefined,
                                                                    maxWidth: '100%'
                                                                }}
                                                            >
                                                                {message.message}
                                                                
                                                                {/* Time and Status inside message box */}
                                                                <div className={`flex items-center justify-end mt-0.5 text-[8px] ${
                                                                    message.isUser 
                                                                        ? "text-blue-600" 
                                                                        : "text-blue-100"
                                                                }`}>
                                                                    <span className="mr-1">{message.timestamp}</span>
                                                                    <MessageStatusIndicator 
                                                                        status={message.status} 
                                                                        isRead={message.isRead} 
                                                                        isUser={message.isUser} 
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="flex flex-col justify-center items-center h-24 text-gray-500 px-3">
                                    <svg className="w-6 h-6 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                    <p className="text-center text-xs">No messages in this chat yet</p>
                                    <p className="text-xs text-gray-400 mt-1 text-center">Start a conversation from the ambassador dashboard</p>
                                </div>
                            )}
                        </div>

                        {/* Message Input */}
                        <div className="p-2 border-t flex gap-1 bg-white">
                            <input
                                type="text"
                                placeholder="Type a message..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                className="flex-1 border rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2"
                                style={{ 
                                    borderColor: '#3b82f640',
                                    focusRingColor: '#3b82f6'
                                }}
                                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={!newMessage.trim()}
                                className={`px-2 py-1 text-white rounded-lg transition-opacity text-xs whitespace-nowrap ${
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
                            <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <h3 className="text-sm font-semibold text-slate-900 mb-2">Select a User to Start Chatting</h3>
                            <p className="text-xs text-slate-500">Choose an ambassador and then select a user to view their conversation</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminChat;

