import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../utils/Api';
import { toast } from 'react-toastify';

const AdminUsers = () => {
    const { ambassadors } = useOutletContext();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchLoading, setSearchLoading] = useState(false);
    const [isAmbassadorModalOpen, setIsAmbassadorModalOpen] = useState(false);

    // Filter users based on search term (client-side filtering for better UX)
    const filteredUsers = useMemo(() => {
        if (!searchTerm.trim()) {
            return users;
        }

        return users.filter(user =>
            user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.country?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.ambassadors?.some(amb => amb.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [users, searchTerm]);

    // Function to fetch users with search and chat history
    const fetchUsers = async (search = '') => {
        setLoading(true);
        try {
            console.log('Fetching users with chat history from API...');
            const response = await api.get(`/auth/users/chat-history${search ? `?search=${encodeURIComponent(search)}` : ''}`);
            console.log('Users with chat history API response:', response);

            if (response.data.success) {
                // Transform the data to match our frontend structure
                console.log('🔍 Raw API response data:', response.data.data);
                const transformedUsers = response.data.data.map(user => {
                    console.log(`🔍 Processing user: ${user.name}`)
                    console.log(`🔍 Raw user object:`, user)
                    console.log(`🔍 User ID field:`, user.id)
                    console.log(`🌍 Geo Location data:`, user.geoLocation)
                    console.log(`📊 Raw chat history:`, user.chatHistory)
                    console.log(`📊 Ambassadors from backend:`, user.chatHistory?.ambassadors)

                    const ambassadorNames = user.chatHistory?.ambassadors?.map(amb => amb.name) || []
                    console.log(`📊 Extracted ambassador names:`, ambassadorNames)

                    console.log(`📊 User ${user.name} country:`, user.country)
                    console.log(`📊 User ${user.name} last activity:`, user.chatHistory?.lastActivity)
                    console.log(`📊 User ${user.name} conversionStatus:`, user.conversionStatus)

                    return {
                        id: user.id, // Use 'id' from Sequelize, not '_id'
                        _id: user.id, // Keep _id for backward compatibility
                        name: user.name,
                        email: user.email,
                        phone: user.phone,
                        country: user.country || 'Not specified',
                        state: user.state || '',
                        city: user.city || '',
                        status: user.conversionStatus || 'pending', // Use conversionStatus
                        conversionStatus: user.conversionStatus || 'pending', // Also keep conversionStatus field
                        registerDate: user.createdAt,
                        ambassadors: ambassadorNames, // Extract ambassador names
                        lastChatDate: user.chatHistory?.lastActivity || user.updatedAt,
                        role: user.role,
                        profileImage: user.profileImage,
                        // Conversion timestamps
                        convertedAt: user.convertedAt,
                        convertedBy: user.convertedBy,
                        enrolledAt: user.enrolledAt,
                        enrolledBy: user.enrolledBy,
                        // Geo location data
                        geoLocation: user.geoLocation || {
                            location: 'Not available',
                            device: 'Not available',
                            lastLogin: null
                        },
                        // Additional chat history data
                        chatHistory: {
                            totalChats: user.chatHistory?.totalChats || 0,
                            totalMessages: user.chatHistory?.totalMessages || 0,
                            lastActivity: user.chatHistory?.lastActivity,
                            ambassadors: user.chatHistory?.ambassadors || [],
                            recentChats: user.chatHistory?.recentChats || []
                        }
                    }
                });
                console.log('Transformed users with chat history:', transformedUsers);
                setUsers(transformedUsers);
            } else {
                console.error('API response not successful:', response.data);
                toast.error('Failed to fetch users');
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Error fetching users. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);


    const handleUserClick = (user) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleViewAllAmbassadors = (user) => {
        setSelectedUser(user);
        setIsAmbassadorModalOpen(true);
    };

    const handleCloseAmbassadorModal = () => {
        setIsAmbassadorModalOpen(false);
        setSelectedUser(null);
    };

    const handleStatusChange = async (userId, newStatus) => {
        try {
            console.log('🔄 Admin updating user status to:', newStatus);
            console.log('🔍 User ID being used:', userId);
            console.log('🔍 User ID type:', typeof userId);

            // Validate userId exists
            if (!userId) {
                console.error('❌ User ID is undefined or null');
                toast.error('Error: User ID not found. Please refresh the page.');
                return;
            }

            // Use conversionStatus API
            const response = await api.patch(`/auth/user/${userId}/conversion-status`, {
                conversionStatus: newStatus
            });

            if (response.data.success) {
                // Update local state with timestamp data from response
                const updatedUserData = response.data.data;
                const currentTime = new Date().toISOString();
                
                setUsers(prev => prev.map(user => {
                    const userIdToCheck = user.id || user._id; // Use id first, then _id as fallback
                    if (userIdToCheck === userId) {
                        const updatedUser = { 
                            ...user, 
                            status: newStatus, 
                            conversionStatus: newStatus,
                            convertedAt: updatedUserData?.convertedAt || (newStatus === 'converted' ? currentTime : user.convertedAt),
                            convertedBy: updatedUserData?.convertedBy || user.convertedBy,
                            enrolledAt: updatedUserData?.enrolledAt || (newStatus === 'enrolled' ? currentTime : user.enrolledAt),
                            enrolledBy: updatedUserData?.enrolledBy || user.enrolledBy
                        };
                        return updatedUser;
                    }
                    return user;
                }));

                // Update selected user if it's the same
                if (selectedUser) {
                    const selectedUserId = selectedUser.id || selectedUser._id; // Use id first, then _id as fallback
                    if (selectedUserId === userId) {
                        setSelectedUser(prev => ({ 
                            ...prev, 
                            status: newStatus, 
                            conversionStatus: newStatus,
                            convertedAt: updatedUserData?.convertedAt || (newStatus === 'converted' ? currentTime : prev.convertedAt),
                            convertedBy: updatedUserData?.convertedBy || prev.convertedBy,
                            enrolledAt: updatedUserData?.enrolledAt || (newStatus === 'enrolled' ? currentTime : prev.enrolledAt),
                            enrolledBy: updatedUserData?.enrolledBy || prev.enrolledBy
                        }));
                    }
                }

                toast.success('✅ User status updated successfully');
            } else {
                toast.error('Failed to update user status');
            }
        } catch (error) {
            console.error('Error updating user status:', error);
            console.error('Error response:', error.response?.data);
            toast.error('Error updating user status. Please try again.');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'converted': return 'bg-blue-100 text-blue-800';
            case 'enrolled': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'pending': return 'Pending';
            case 'converted': return 'Converted';
            case 'enrolled': return 'Enrolled';
            default: return 'Pending';
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-3">
                <h3 className="text-xs font-semibold text-slate-800 flex items-center">
                    <svg className="w-4 h-4 text-yellow-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                    User Management ({filteredUsers.length})
                </h3>
                
                {/* Search Bar */}
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search by name, email, country, or ambassador..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs bg-white w-full sm:w-64"
                    />
                    <svg className="w-3 h-3 text-slate-400 absolute left-2 top-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>


            {/* Responsive container with horizontal scroll */}
            <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg border border-slate-200 overflow-x-auto max-w-6xl mx-auto">
                <table className="w-full divide-y divide-slate-200" style={{ minWidth: '700px' }}>
                    <thead className="bg-gradient-to-r from-yellow-50 to-orange-50">
                        <tr>
                            <th className="px-2 py-2 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider whitespace-nowrap">Prospect</th>
                            <th className="px-2 py-2 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider whitespace-nowrap">Contact</th>
                            <th className="px-2 py-2 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider whitespace-nowrap">Geo Location</th>
                            <th className="px-2 py-2 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider whitespace-nowrap">Country</th>
                            <th className="px-2 py-2 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider whitespace-nowrap">Ambassadors</th>
                            <th className="px-2 py-2 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider whitespace-nowrap">Status & Date</th>
                            <th className="px-2 py-2 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider whitespace-nowrap">Registered</th>
                            <th className="px-2 py-2 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider whitespace-nowrap">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 space-y-1">
                        {filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="px-4 py-8 text-center">
                                    <div className="flex flex-col items-center justify-center space-y-2">
                                        <div className="text-gray-400 text-4xl">📊</div>
                                        <div className="text-gray-500 text-lg font-medium">No Data Available</div>
                                        <div className="text-gray-400 text-sm">
                                            {searchTerm ? 'No users found matching your search criteria.' : 'No users found in the database.'}
                                        </div>
                                        {searchTerm && (
                                            <button
                                                onClick={() => setSearchTerm('')}
                                                className="mt-2 text-blue-600 hover:text-blue-800 text-sm underline"
                                            >
                                                Clear search
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredUsers.map((user, index) => (
                            <tr key={user.id || user._id || index} className="hover:bg-yellow-50/50 transition-colors duration-200 mb-1">
                                <td className="px-2 py-2 whitespace-nowrap text-center">
                                    <div className="text-xs font-bold text-slate-900">
                                        {user.name ? user.name.charAt(0).toUpperCase() + user.name.slice(1) : 'Unknown User'}
                                    </div>
                                </td>
                                <td className="px-2 py-2 whitespace-nowrap text-center">
                                    <div className="text-xs font-normal text-slate-900">{user.email || 'N/A'}</div>
                                    <div className="text-xs text-slate-500">{user.phone || 'No phone'}</div>
                                </td>
                                <td className="px-2 py-2 whitespace-nowrap text-center">
                                    <div className="text-xs font-medium text-slate-900">
                                        {user.geoLocation?.location || 'Not available'}
                                    </div>
                                    <div className="text-xs text-slate-500">
                                        {user.geoLocation?.device || 'Device unknown'}
                                    </div>
                                </td>
                                <td className="px-2 py-2 whitespace-nowrap text-xs text-slate-900">
                                    <div className="flex justify-center items-center">
                                        <span className="truncate max-w-24">{user.country || 'Not specified'}</span>
                                    </div>
                                </td>
                                <td className="px-2 py-2 whitespace-nowrap text-center">
                                    <div className="flex flex-wrap gap-1 justify-center">
                                        {user.ambassadors && user.ambassadors.length > 0 ? (
                                            <>
                                                {/* Show first 3 ambassadors */}
                                                {user.ambassadors.slice(0, 3).map((ambassador, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                                        title={`Chatted with ${ambassador}`}
                                                    >
                                                        {ambassador}
                                                    </span>
                                                ))}

                                                {/* Show "Click More" button if more than 3 ambassadors */}
                                                {user.ambassadors.length > 3 && (
                                                    <button
                                                        onClick={() => handleViewAllAmbassadors(user)}
                                                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer"
                                                        title={`View all ${user.ambassadors.length} ambassadors`}
                                                    >
                                                        +{user.ambassadors.length - 3} more
                                                    </button>
                                                )}
                                            </>
                                        ) : (
                                            <span className="text-xs text-slate-500 flex items-center">
                                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                                </svg>
                                                No interactions yet
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-2 py-2 whitespace-nowrap text-center">
                                    <div className="flex flex-col items-center gap-1">
                                        <select
                                            value={user.status || user.conversionStatus}
                                            onChange={(e) => {
                                                const userId = user.id || user._id; // Use id first, then _id as fallback
                                                console.log('🔍 Dropdown onChange - User object:', user);
                                                console.log('🔍 Dropdown onChange - Using userId:', userId);
                                                handleStatusChange(userId, e.target.value);
                                            }}
                                            className={`text-xs font-semibold rounded-full px-2 py-1 border-0 focus:ring-2 focus:ring-blue-500 ${getStatusColor(user.status || user.conversionStatus)}`}
                                            style={{ backgroundColor: 'white' }}
                                            title="Change user status"
                                        >
                                            <option value="pending" style={{ backgroundColor: 'white' }}>Pending</option>
                                            <option value="converted" style={{ backgroundColor: 'white' }}>Converted</option>
                                            <option value="enrolled" style={{ backgroundColor: 'white' }}>Enrolled</option>
                                        </select>
                                        
                                        {/* Show conversion date and time */}
                                        {(user.status === 'converted' || user.conversionStatus === 'converted') && user.convertedAt && (
                                            <div className="text-[10px] text-blue-600 text-center">
                                                <div className="font-medium">
                                                    {new Date(user.convertedAt).toLocaleDateString('en-IN')}
                                                </div>
                                                <div className="text-[9px] text-gray-500">
                                                    {new Date(user.convertedAt).toLocaleTimeString('en-IN', { 
                                                        hour: '2-digit', 
                                                        minute: '2-digit',
                                                        hour12: true 
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                        
                                        {(user.status === 'enrolled' || user.conversionStatus === 'enrolled') && user.enrolledAt && (
                                            <div className="text-[10px] text-green-600 text-center">
                                                <div className="font-medium">
                                                    {new Date(user.enrolledAt).toLocaleDateString('en-IN')}
                                                </div>
                                                <div className="text-[9px] text-gray-500">
                                                    {new Date(user.enrolledAt).toLocaleTimeString('en-IN', { 
                                                        hour: '2-digit', 
                                                        minute: '2-digit',
                                                        hour12: true 
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-2 py-2 whitespace-nowrap text-xs text-slate-500 text-center">
                                    {user.registerDate ? new Date(user.registerDate).toLocaleDateString() : 'N/A'}
                                </td>
                                <td className="px-2 py-2 whitespace-nowrap text-center">
                                    <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
                                        {/* <button
                                            onClick={() => handleUserClick(user)}
                                            className="p-1.5 sm:p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200 flex items-center justify-center hover:scale-105 active:scale-95"
                                            title="Edit User"
                                        >
                                            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button> */}
                                        <button
                                            onClick={async () => {
                                                if (window.confirm('Are you sure you want to delete this user?')) {
                                                    try {
                                                        const userId = user.id || user._id;
                                                        console.log('🔍 Delete - Using userId:', userId);
                                                        const response = await api.delete(`/auth/${userId}`);
                                                        if (response.data.success) {
                                                            setUsers(prev => prev.filter(u => (u.id || u._id) !== userId));
                                                            toast.success('User deleted successfully');
                                                        } else {
                                                            toast.error('Failed to delete user');
                                                        }
                                                    } catch (error) {
                                                        console.error('Error deleting user:', error);
                                                        toast.error('Error deleting user. Please try again.');
                                                    }
                                                }
                                            }}
                                            className="p-1.5 sm:p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all duration-200 flex items-center justify-center hover:scale-105 active:scale-95"
                                            title="Delete User"
                                        >
                                            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* User Details Modal */}
            {isModalOpen && selectedUser && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
                        <div className="flex justify-between items-center pb-3 border-b">
                            <h3 className="text-2xl font-semibold text-gray-900">User Details</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="mt-4 space-y-4">
                            <div className="flex items-center space-x-4">
                                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-blue-200 flex-shrink-0">
                                    {selectedUser.profileImage ? (
                                        <img
                                            src={`${import.meta.env.VITE_API_URL}/${selectedUser.profileImage}`}
                                            alt={selectedUser.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.parentElement.innerHTML = `
                                                    <div class="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-lg font-bold">
                                                        ${selectedUser.name?.charAt(0)?.toUpperCase() || 'U'}
                                                    </div>
                                                `;
                                            }}
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-lg font-bold">
                                            {selectedUser.name?.charAt(0)?.toUpperCase() || 'U'}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700">Name</label>
                                    <p className="mt-1 text-lg font-semibold text-gray-900">{selectedUser.name}</p>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700">Email</label>
                                <p className="mt-1 text-xs text-gray-900">{selectedUser.email}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700">Phone</label>
                                <p className="mt-1 text-xs text-gray-900">{selectedUser.phone}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700">Country</label>
                                <p className="mt-1 text-xs text-gray-900">{selectedUser.country}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700">Ambassadors</label>
                                <div className="mt-1 flex flex-wrap gap-1">
                                    {selectedUser.ambassadors && selectedUser.ambassadors.length > 0 ? (
                                        selectedUser.ambassadors.map((ambassador, index) => (
                                            <span
                                                key={index}
                                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                            >
                                                {ambassador}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-xs text-gray-500">No ambassadors</span>
                                    )}
                                </div>
                                {/* Show detailed chat history if available */}
                                {selectedUser.chatHistory && selectedUser.chatHistory.totalChats > 0 && (
                                    <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                                        <h4 className="text-xs font-medium text-gray-700 mb-2">Chat Statistics</h4>
                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                            <div>
                                                <span className="text-gray-500">Total Chats:</span>
                                                <span className="ml-1 font-medium">{selectedUser.chatHistory.totalChats}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Total Messages:</span>
                                                <span className="ml-1 font-medium">{selectedUser.chatHistory.totalMessages}</span>
                                            </div>
                                            {selectedUser.chatHistory.lastActivity && (
                                                <div className="col-span-2">
                                                    <span className="text-gray-500">Last Activity:</span>
                                                    <span className="ml-1 font-medium">
                                                        {new Date(selectedUser.chatHistory.lastActivity).toLocaleString()}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700">Status</label>
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedUser.status)}`}>
                                    {getStatusText(selectedUser.status)}
                                </span>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700">Register Date</label>
                                <p className="mt-1 text-xs text-gray-900">{new Date(selectedUser.registerDate).toLocaleDateString()}</p>
                            </div>
                            <div className="mt-4 flex justify-end space-x-2">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                                >
                                    Close
                                </button>
                                {/* Status Update Dropdown in Modal */}
                                <div className="relative">
                                    <select
                                        value={selectedUser.status}
                                        onChange={(e) => {
                                            const userId = selectedUser.id || selectedUser._id;
                                            console.log('🔍 Modal onChange - Using userId:', userId);
                                            handleStatusChange(userId, e.target.value);
                                        }}
                                        className={`block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-xs rounded-md ${getStatusColor(selectedUser.status)}`}
                                        style={{ backgroundColor: 'white' }}
                                    >
                                        <option value="pending" style={{ backgroundColor: 'white' }}>Pending</option>
                                        <option value="enrolled" style={{ backgroundColor: 'white' }}>Enrolled</option>
                                        <option value="converted" style={{ backgroundColor: 'white' }}>Converted</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                        <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Ambassador Modal */}
            {isAmbassadorModalOpen && selectedUser && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
                        <div className="flex justify-between items-center pb-3 border-b">
                            <h3 className="text-2xl font-semibold text-gray-900">
                                All Ambassadors for {selectedUser.name}
                            </h3>
                            <button
                                onClick={handleCloseAmbassadorModal}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="mt-4">
                            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="flex items-center space-x-2">
                                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="text-xs text-blue-700 font-medium">Chat Statistics</span>
                                </div>
                                <div className="mt-2 grid grid-cols-2 gap-4 text-xs">
                                    <div>
                                        <span className="text-gray-600">Total Ambassadors:</span>
                                        <span className="ml-2 font-semibold text-blue-600">{selectedUser.ambassadors?.length || 0}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Total Chats:</span>
                                        <span className="ml-2 font-semibold text-blue-600">{selectedUser.chatHistory?.totalChats || 0}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Total Messages:</span>
                                        <span className="ml-2 font-semibold text-blue-600">{selectedUser.chatHistory?.totalMessages || 0}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Last Activity:</span>
                                        <span className="ml-2 font-semibold text-blue-600">
                                            {selectedUser.chatHistory?.lastActivity
                                                ? new Date(selectedUser.chatHistory.lastActivity).toLocaleDateString()
                                                : 'No activity'
                                            }
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-lg font-semibold text-gray-800 mb-3">All Ambassadors</h4>
                                {selectedUser.ambassadors && selectedUser.ambassadors.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {selectedUser.ambassadors.map((ambassador, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                                            >
                                                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                                    {ambassador.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-medium text-gray-900 truncate">
                                                        {ambassador}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        Ambassador #{index + 1}
                                                    </p>
                                                </div>
                                                <div className="flex-shrink-0">
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        Active
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                        </svg>
                                        <p className="text-gray-500">No ambassadors found</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={handleCloseAmbassadorModal}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;