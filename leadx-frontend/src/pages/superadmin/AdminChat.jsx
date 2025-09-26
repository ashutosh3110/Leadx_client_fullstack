import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';

const AdminChat = () => {
    const { ambassadors } = useOutletContext();
    const [selectedAmbassador, setSelectedAmbassador] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [chatMessages, setChatMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');

    // Mock data for users
    const mockUsers = {
        'ambassador1': [
            { id: 'user1', name: 'John Doe', email: 'john@example.com', lastMessage: '2 hours ago' },
            { id: 'user2', name: 'Jane Smith', email: 'jane@example.com', lastMessage: '1 day ago' }
        ],
        'ambassador2': [
            { id: 'user3', name: 'Mike Johnson', email: 'mike@example.com', lastMessage: '1 hour ago' }
        ]
    };

    // Mock chat messages
    const mockChatMessages = {
        'user1': [
            { id: 1, sender: 'user', message: 'Hello, I need help', timestamp: '10:30 AM', isUser: true },
            { id: 2, sender: 'ambassador', message: 'Hi! How can I help?', timestamp: '10:32 AM', isUser: false }
        ]
    };

    const handleAmbassadorSelect = (ambassador) => {
        setSelectedAmbassador(ambassador);
        setSelectedUser(null);
        setChatMessages([]);
    };

    const handleUserSelect = (user) => {
        setSelectedUser(user);
        setChatMessages(mockChatMessages[user.id] || []);
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
        <div className="h-full flex flex-col bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b px-4 py-3">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold text-gray-800">Ambassador Chat Management</h1>
                        <p className="text-sm text-gray-600">Manage conversations between ambassadors and users</p>
                    </div>
                    {/* Mobile Navigation */}
                    <div className="flex space-x-2 lg:hidden">
                        {selectedAmbassador && (
                            <button
                                onClick={() => setSelectedAmbassador(null)}
                                className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
                            >
                                ← Ambassadors
                            </button>
                        )}
                        {selectedUser && (
                            <button
                                onClick={() => setSelectedUser(null)}
                                className="px-3 py-1 bg-green-500 text-white rounded text-sm"
                            >
                                ← Users
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                {/* Left Sidebar - Ambassadors */}
                <div className={`w-full lg:w-80 bg-white border-r flex flex-col ${selectedAmbassador ? 'hidden lg:flex' : 'flex'}`}>
                    <div className="p-4 border-b">
                        <h2 className="text-lg font-medium text-gray-800">Ambassadors</h2>
                        <p className="text-sm text-gray-600">Select an ambassador to view their users</p>
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
                                                : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                                        }`}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                                                {ambassador.name?.charAt(0)?.toUpperCase() || 'A'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {ambassador.name || 'Unknown Ambassador'}
                                                </p>
                                                <p className="text-xs text-gray-500 truncate">
                                                    {ambassador.email || 'No email'}
                                                </p>
                                                <p className="text-xs text-blue-600">
                                                    {mockUsers[ambassador._id]?.length || 0} users
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-4 text-center text-gray-500">
                                <p>No ambassadors found</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Middle Sidebar - Users */}
                {selectedAmbassador && (
                    <div className={`w-full lg:w-80 bg-white border-r flex flex-col ${selectedUser ? 'hidden lg:flex' : 'flex'}`}>
                        <div className="p-4 border-b">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-medium text-gray-800">Users</h2>
                                    <p className="text-sm text-gray-600">
                                        Users for {selectedAmbassador.name}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSelectedAmbassador(null)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto">
                            {mockUsers[selectedAmbassador._id] ? (
                                <div className="p-2">
                                    {mockUsers[selectedAmbassador._id].map((user) => (
                                        <div
                                            key={user.id}
                                            onClick={() => handleUserSelect(user)}
                                            className={`p-3 rounded-lg cursor-pointer transition-colors mb-2 ${
                                                selectedUser?.id === user.id
                                                    ? 'bg-green-50 border-2 border-green-200'
                                                    : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                                            }`}
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate">
                                                        {user.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500 truncate">
                                                        {user.email}
                                                    </p>
                                                    <p className="text-xs text-gray-400">
                                                        Last: {user.lastMessage}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-4 text-center text-gray-500">
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
                        <div className="p-4 border-b bg-gray-50">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-medium">
                                        {selectedUser.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-900">{selectedUser.name}</h3>
                                        <p className="text-sm text-gray-500">{selectedUser.email}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedUser(null)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {chatMessages.map((message) => (
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
                                            {message.timestamp}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Message Input */}
                        <div className="p-4 border-t bg-gray-50">
                            <div className="flex space-x-2">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                    placeholder="Type your message..."
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    <div className="flex-1 flex items-center justify-center bg-gray-50">
                        <div className="text-center">
                            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Select a User to Start Chatting</h3>
                            <p className="text-gray-500">Choose an ambassador and then select a user to view their conversation</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminChat;
