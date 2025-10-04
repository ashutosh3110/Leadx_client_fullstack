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
        setUsers(response.data.data || []);
        console.log('👥 Users loaded:', response.data.data?.length);
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
      console.log('🔄 Updating user status:', userId, newStatus);
      
      const response = await api.patch(`/auth/user/${userId}/conversion-status`, {
        conversionStatus: newStatus
      });

      if (response.data.success) {
        // Update local state
        setUsers(prev => prev.map(user =>
          user._id === userId ? { ...user, conversionStatus: newStatus } : user
        ));
        toast.success(`✅ User marked as ${newStatus}`);
      }
    } catch (error) {
      console.error('❌ Error updating status:', error);
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
    <div className="space-y-6">
      {/* Header */}
      <div 
        className="backdrop-blur-sm rounded-2xl p-6 border shadow-lg"
        style={{ 
          background: `linear-gradient(135deg, ${ambassadorDashboardColor}15, ${ambassadorDashboardColor}10)`,
          borderColor: `${ambassadorDashboardColor}30`
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2 flex items-center">
              <svg className="w-6 h-6 mr-2" style={{ color: ambassadorDashboardColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              My Users
            </h1>
            <p className="text-slate-600">
              Students who have connected with you ({filteredUsers.length})
            </p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-slate-200 shadow-sm">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by name, email or country..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
          />
          <svg className="w-4 h-4 text-slate-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Users Table */}
      {filteredUsers.length > 0 ? (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200 overflow-x-auto">
          <table className="w-full divide-y divide-slate-200">
            <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  User Name
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Conversion Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-blue-50/50 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-slate-900">
                      {user.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-2">
                      <select
                        value={user.conversionStatus || 'pending'}
                        onChange={(e) => handleConversionStatusChange(user._id, e.target.value)}
                        disabled={user.conversionStatus === 'enrolled'}
                        className={`px-3 py-1.5 text-xs font-medium rounded-full border focus:outline-none focus:ring-2 focus:ring-blue-500 ${getStatusColor(user.conversionStatus || 'pending')} ${
                          user.conversionStatus === 'enrolled' ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="converted">Converted</option>
                        <option value="enrolled" disabled={user.conversionStatus !== 'enrolled'}>
                          Enrolled
                        </option>
                      </select>
                      {user.conversionStatus === 'enrolled' && (
                        <span className="text-xs text-green-600 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          By Admin
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 text-center border border-slate-200">
          <svg
            className="w-16 h-16 text-slate-300 mx-auto mb-4"
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
          <h4 className="text-lg font-semibold text-slate-800 mb-2">
            {searchTerm ? `No users found for "${searchTerm}"` : 'No Users Yet'}
          </h4>
          <p className="text-slate-600">
            {searchTerm
              ? 'Try adjusting your search terms'
              : 'Users will appear here when they start chatting with you'}
          </p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="mt-3 text-blue-600 hover:text-blue-800 text-sm underline"
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
