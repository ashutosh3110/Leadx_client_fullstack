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

    // Function to fetch users with search
    const fetchUsers = async (search = '') => {
        setLoading(true);
        try {
            console.log('Fetching users from API...');
            const response = await api.get(`/auth/users${search ? `?search=${encodeURIComponent(search)}` : ''}`);
            console.log('Users API response:', response);
            
            if (response.data.success) {
                // Transform the data to match our frontend structure
                const transformedUsers = response.data.data.map(user => ({
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    country: user.country || 'Not specified',
                    state: user.state || '',
                    status: user.isVerified ? 'enrolled' : 'pending', // Map isVerified to status
                    registerDate: user.createdAt,
                    ambassadors: [], // This will be populated from chat data if needed
                    lastChatDate: user.updatedAt,
                    role: user.role,
                    profileImage: user.profileImage
                }));
                console.log('Transformed users:', transformedUsers);
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

    // Auto-refresh every 30 seconds to get latest user data
    useEffect(() => {
        const interval = setInterval(() => {
            if (!loading) {
                console.log('Auto-refreshing users data...');
                fetchUsers();
            }
        }, 30000); // 30 seconds

        return () => clearInterval(interval);
    }, [loading]);

    const handleUserClick = (user) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleStatusChange = async (userId, newStatus) => {
        try {
            // Map frontend status to backend isVerified
            const isVerified = newStatus === 'enrolled' || newStatus === 'converted';
            
            const response = await api.put(`/auth/${userId}`, { 
                isVerified: isVerified 
            });
            
            if (response.data.success) {
                // Update local state
                setUsers(prev => prev.map(user => 
                    user._id === userId ? { ...user, status: newStatus } : user
                ));
                
                // Update selected user if it's the same
                if (selectedUser && selectedUser._id === userId) {
                    setSelectedUser(prev => ({ ...prev, status: newStatus }));
                }
                
                toast.success('User status updated successfully');
            } else {
                toast.error('Failed to update user status');
            }
        } catch (error) {
            console.error('Error updating user status:', error);
            toast.error('Error updating user status. Please try again.');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'enrolled': return 'bg-blue-100 text-blue-800';
            case 'converted': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'pending': return 'Pending';
            case 'enrolled': return 'Enrolled';
            case 'converted': return 'Converted';
            default: return 'Unknown';
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
                <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-semibold text-slate-800 flex items-center">
                        <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                        User Management ({filteredUsers.length})
                    </h3>
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-green-600 font-medium">Live Data</span>
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search by name, email, country, or ambassador..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white w-full sm:w-64"
                        />
                        <svg className="w-4 h-4 text-slate-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <button
                        onClick={() => fetchUsers()}
                        disabled={loading}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
                        title="Refresh Users"
                    >
                        <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span className="hidden sm:inline">{loading ? 'Loading...' : 'Refresh'}</span>
                    </button>
                </div>
            </div>

            {/* Data Source Info */}
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm text-blue-700 font-medium">Data Source</span>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                    Users are automatically created when they interact with ambassador cards through the chat modal. 
                    Data refreshes every 30 seconds to show the latest interactions.
                </p>
            </div>

            {/* Responsive container with horizontal scroll */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200 overflow-x-auto">
                <table className="w-full divide-y divide-slate-200" style={{ minWidth: '700px' }}>
                    <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
                        <tr>
                            <th className="px-2 lg:px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">User</th>
                            <th className="px-2 lg:px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">Contact</th>
                            <th className="px-2 lg:px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">Country</th>
                            <th className="px-2 lg:px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">Ambassadors</th>
                            <th className="px-2 lg:px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                            <th className="px-2 lg:px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">Register Date</th>
                            <th className="px-2 lg:px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {filteredUsers.map((user, index) => (
                            <tr key={user._id || index} className="hover:bg-blue-50/50 transition-colors duration-200">
                                <td className="px-2 lg:px-4 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-blue-200 flex-shrink-0">
                                            {user.profileImage ? (
                                                <img
                                                    src={`${import.meta.env.VITE_API_URL}/${user.profileImage}`}
                                                    alt={user.name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        e.target.parentElement.innerHTML = `
                                                            <div class="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                                                                ${user.name?.charAt(0)?.toUpperCase() || 'U'}
                                                            </div>
                                                        `;
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                                                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                                                </div>
                                            )}
                                        </div>
                                        <div className="ml-3 min-w-0 flex-1">
                                            <div className="text-sm font-semibold text-slate-900 truncate">
                                                {user.name || 'Unknown User'}
                                            </div>
                                            <div className="text-xs text-slate-500 truncate">ID: {user._id || 'N/A'}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-2 lg:px-4 py-4 whitespace-nowrap">
                                    <div className="text-sm font-semibold text-slate-900">{user.email || 'N/A'}</div>
                                    <div className="text-xs text-slate-500">{user.phone || 'No phone'}</div>
                                </td>
                                <td className="px-2 lg:px-4 py-4 whitespace-nowrap text-sm text-slate-900">
                                    <div className="truncate max-w-24">{user.country || 'Not specified'}</div>
                                </td>
                                <td className="px-2 lg:px-4 py-4 whitespace-nowrap">
                                    <div className="flex flex-wrap gap-1">
                                        {user.ambassadors?.map((ambassador, idx) => (
                                            <span 
                                                key={idx}
                                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                            >
                                                {ambassador}
                                            </span>
                                        )) || (
                                            <span className="text-xs text-slate-500 flex items-center">
                                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                                </svg>
                                                No interactions yet
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-2 lg:px-4 py-4 whitespace-nowrap">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                                        {getStatusText(user.status)}
                                    </span>
                                </td>
                                <td className="px-2 lg:px-4 py-4 whitespace-nowrap text-sm text-slate-500">
                                    {user.registerDate ? new Date(user.registerDate).toLocaleDateString() : 'N/A'}
                                </td>
                                <td className="px-2 lg:px-4 py-4 whitespace-nowrap text-center">
                                    <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
                                        <button
                                            onClick={() => handleUserClick(user)}
                                            className="p-1.5 sm:p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200 flex items-center justify-center hover:scale-105 active:scale-95"
                                            title="Edit User"
                                        >
                                            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={async () => {
                                                if (window.confirm('Are you sure you want to delete this user?')) {
                                                    try {
                                                        const response = await api.delete(`/auth/${user._id}`);
                                                        if (response.data.success) {
                                                            setUsers(prev => prev.filter(u => u._id !== user._id));
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
                        ))}
                        {filteredUsers.length === 0 && (
                            <tr>
                                <td colSpan="7" className="px-6 py-8 text-center">
                                    <div className="flex flex-col items-center">
                                        <svg className="w-12 h-12 text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                        </svg>
                                        <h4 className="text-sm font-medium text-slate-500 mb-1">
                                            {searchTerm ? `No users found for "${searchTerm}"` : 'No Users Yet'}
                                        </h4>
                                        <p className="text-xs text-slate-400">
                                            {searchTerm ? 'Try adjusting your search terms' : 'Users will appear here when they interact through ambassador cards'}
                                        </p>
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
                                    <label className="block text-sm font-medium text-gray-700">Name</label>
                                    <p className="mt-1 text-lg font-semibold text-gray-900">{selectedUser.name}</p>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                <p className="mt-1 text-sm text-gray-900">{selectedUser.email}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Phone</label>
                                <p className="mt-1 text-sm text-gray-900">{selectedUser.phone}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Country</label>
                                <p className="mt-1 text-sm text-gray-900">{selectedUser.country}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Ambassadors</label>
                                <div className="mt-1 flex flex-wrap gap-1">
                                    {selectedUser.ambassadors?.map((ambassador, index) => (
                                        <span 
                                            key={index}
                                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                        >
                                            {ambassador}
                                        </span>
                                    )) || <span className="text-sm text-gray-500">No ambassadors</span>}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Status</label>
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedUser.status)}`}>
                                    {getStatusText(selectedUser.status)}
                                </span>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Register Date</label>
                                <p className="mt-1 text-sm text-gray-900">{new Date(selectedUser.registerDate).toLocaleDateString()}</p>
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
                                        onChange={(e) => handleStatusChange(selectedUser._id, e.target.value)}
                                        className={`block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md ${getStatusColor(selectedUser.status)}`}
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="enrolled">Enrolled</option>
                                        <option value="converted">Converted</option>
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
        </div>
    );
};

export default AdminUsers;