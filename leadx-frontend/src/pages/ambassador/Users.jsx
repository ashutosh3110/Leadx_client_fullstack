import React, { useState, useEffect } from 'react';
import { useColorContext } from '../../context/ColorContext';
import api from '../utils/Api';
import { toast } from 'react-toastify';

const Users = () => {
  const { ambassadorDashboardColor } = useColorContext();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const API_BASE_URL = import.meta.env.VITE_API_URL;

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${API_BASE_URL}/${path.replace(/^\/+/, '')}`;
  };

  useEffect(() => {
    fetchMyUsers();
  }, []);

  const fetchMyUsers = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching my users...');
      const response = await api.get('/chat/my-users');
      console.log('✅ My users response:', response);

      if (response.data.success) {
        console.log('🔍 Raw API response data:', response.data.data);
        
        // Transform data to ensure proper id mapping and include timestamp fields
        const transformedUsers = (response.data.data || []).map(user => {
          console.log(`🔍 Processing user: ${user.name}`)
          console.log(`🔍 Raw user object:`, user)
          console.log(`🔍 User ID field:`, user.id)
          
          return {
            id: user.id, // Use 'id' from Sequelize
            _id: user.id, // Keep _id for backward compatibility
            name: user.name,
            email: user.email,
            phone: user.phone,
            country: user.country || 'Not specified',
            state: user.state || '',
            city: user.city || '',
            conversionStatus: user.conversionStatus || 'pending',
            registerDate: user.createdAt,
            role: user.role,
            profileImage: user.profileImage,
            // Conversion timestamps
            convertedAt: user.convertedAt,
            convertedBy: user.convertedBy,
            enrolledAt: user.enrolledAt,
            enrolledBy: user.enrolledBy,
            // Keep original fields for compatibility
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
          };
        });
        
        console.log('🔄 Transformed users:', transformedUsers);
        setUsers(transformedUsers);
        console.log('👥 Users loaded:', transformedUsers.length);
      }
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      console.error('❌ Error response:', error.response);
      console.error('❌ Error data:', error.response?.data);
      console.error('❌ Error message:', error.response?.data?.message);
      toast.error(`Failed to fetch users: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleConversionStatusChange = async (userId, newStatus) => {
    try {
      console.log('🔄 Ambassador updating user status:', userId, newStatus);
      console.log('🔍 User ID being used:', userId);
      console.log('🔍 User ID type:', typeof userId);

      // Validate userId exists
      if (!userId) {
        console.error('❌ User ID is undefined or null');
        toast.error('Error: User ID not found. Please refresh the page.');
        return;
      }
      
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
              conversionStatus: newStatus,
              convertedAt: updatedUserData?.convertedAt || (newStatus === 'converted' ? currentTime : user.convertedAt),
              convertedBy: updatedUserData?.convertedBy || user.convertedBy,
              enrolledAt: updatedUserData?.enrolledAt || (newStatus === 'enrolled' ? currentTime : user.enrolledAt),
              enrolledBy: updatedUserData?.enrolledBy || user.enrolledBy
            };
            console.log('🔄 Updated user data:', updatedUser);
            return updatedUser;
          }
          return user;
        }));
        
        toast.success(`✅ User marked as ${newStatus}`);
      } else {
        toast.error('Failed to update user status');
      }
    } catch (error) {
      console.error('❌ Error updating status:', error);
      console.error('❌ Error response:', error.response?.data);
      toast.error(`Failed to update status: ${error.response?.data?.message || error.message}`);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'converted':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'enrolled':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Filter users based on search
  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.country?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-lg text-slate-600">Loading users...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-4">
      {/* Header */}
      <div 
        className="backdrop-blur-sm rounded-xl p-4 border shadow-sm"
        style={{ 
          background: `linear-gradient(135deg, ${ambassadorDashboardColor}15, ${ambassadorDashboardColor}10)`,
          borderColor: `${ambassadorDashboardColor}30`
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-slate-800 mb-1 flex items-center">
              <svg className="w-5 h-5 mr-2" style={{ color: ambassadorDashboardColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              My Users
            </h1>
            <p className="text-sm text-slate-600">
              Students who have connected with you ({filteredUsers.length})
            </p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-slate-200 shadow-sm">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by name, email or country..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
          />
          <svg className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Users Table */}
      {filteredUsers.length > 0 ? (
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
          <table className="w-full divide-y divide-slate-200">
            <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  User Name
                </th>
                <th className="px-4 py-2 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Conversion Status & Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredUsers.map((user, index) => (
                <tr key={user.id || user._id || index} className="hover:bg-blue-50/50 transition-colors duration-200">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900">
                      {user.name.charAt(0).toUpperCase() + user.name.slice(1)}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <select
                        value={user.conversionStatus || 'pending'}
                        onChange={(e) => {
                          const userId = user.id || user._id; // Use id first, then _id as fallback
                          console.log('🔍 Ambassador dropdown onChange - User object:', user);
                          console.log('🔍 Ambassador dropdown onChange - Using userId:', userId);
                          handleConversionStatusChange(userId, e.target.value);
                        }}
                        disabled={user.conversionStatus === 'enrolled'}
                        className={`px-2 py-1 text-xs font-medium rounded-full border focus:outline-none focus:ring-2 ${getStatusColor(user.conversionStatus || 'pending')} ${
                          user.conversionStatus === 'enrolled' ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'
                        }`}
                        style={{
                          focusRingColor: ambassadorDashboardColor,
                          backgroundColor: 'white'
                        }}
                      >
                        <option value="pending" style={{ backgroundColor: 'white' }}>Pending</option>
                        <option value="converted" style={{ backgroundColor: 'white' }}>Converted</option>
                        <option value="enrolled" disabled={user.conversionStatus !== 'enrolled'} style={{ backgroundColor: 'white' }}>
                          Enrolled
                        </option>
                      </select>
                      
                      {/* Show conversion date and time */}
                      {user.conversionStatus === 'converted' && user.convertedAt && (
                        <div className="text-xs text-blue-600 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Converted</span>
                          </div>
                          <div className="font-medium">
                            {new Date(user.convertedAt).toLocaleDateString('en-IN')}
                          </div>
                          <div className="text-[10px] text-gray-500">
                            {new Date(user.convertedAt).toLocaleTimeString('en-IN', { 
                              hour: '2-digit', 
                              minute: '2-digit',
                              hour12: true 
                            })}
                          </div>
                        </div>
                      )}
                      
                      {user.conversionStatus === 'enrolled' && (
                        <div className="text-xs text-green-600 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>By Admin</span>
                          </div>
                          {user.enrolledAt && (
                            <>
                              <div className="font-medium">
                                {new Date(user.enrolledAt).toLocaleDateString('en-IN')}
                              </div>
                              <div className="text-[10px] text-gray-500">
                                {new Date(user.enrolledAt).toLocaleTimeString('en-IN', { 
                                  hour: '2-digit', 
                                  minute: '2-digit',
                                  hour12: true 
                                })}
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 text-center border border-slate-200">
          <svg
            className="w-12 h-12 text-slate-300 mx-auto mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
            />
          </svg>
          <h4 className="text-base font-semibold text-slate-800 mb-1">
            {searchTerm ? `No users found for "${searchTerm}"` : 'No Users Yet'}
          </h4>
          <p className="text-sm text-slate-600">
            {searchTerm
              ? 'Try adjusting your search terms'
              : 'Users will appear here when they start chatting with you'}
          </p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="mt-2 text-sm underline hover:opacity-80 transition-opacity"
              style={{ color: ambassadorDashboardColor }}
            >
              Clear search
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Users;
