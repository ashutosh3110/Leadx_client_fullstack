import axios from 'axios';
import { getToken } from './auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('API Request - Token added:', token ? 'Present' : 'Missing');
    console.log('API Request - Full token:', token);
  } else {
    console.log('API Request - No token found');
  }
  return config;
});

export const ambassadorAPI = {
  // Get all ambassadors from the correct endpoint
  getAllAmbassadors: async () => {
    const response = await api.get('/api/auth/ambassadors');
    return response.data;
  },

  // Get ambassador by ID
  getAmbassadorById: async (id) => {
    const response = await api.get(`/api/auth/ambassadors/${id}`);
    return response.data;
  },

  // Get ambassador dashboard
  getDashboard: async () => {
    const response = await api.get('/api/ambessdor/dashboard');
    return response.data;
  },

  // Update ambassador profile (using the new API endpoint)
  updateProfile: async (data) => {
    const response = await api.patch('/api/auth/profile-update', data);
    return response.data;
  },

  // Get updated profile data
  getUpdatedProfile: async (id) => {
    const response = await api.get(`/api/auth/ambassadors/${id}`);
    return response.data;
  },

  // Complete program
  completeProgram: async (data) => {
    const response = await api.patch('/api/ambessdor/complete-program', data);
    return response.data;
  },

  // Update ambassador
  updateAmbassador: async (ambassadorId, data) => {
    console.log('🔍 updateAmbassador API called');
    console.log('🔍 Ambassador ID:', ambassadorId);
    console.log('🔍 Update data:', data);
    console.log('🔍 Status in update data:', data.status);
    const response = await api.put(`/api/auth/${ambassadorId}`, data);
    console.log('🔍 API response:', response.data);
    console.log('🔍 Updated status from API:', response.data?.status);
    return response.data;
  },

  // Delete ambassador
  deleteAmbassador: async (ambassadorId) => {
    const response = await api.delete(`/api/auth/${ambassadorId}`);
    return response.data;
  },
};

export const authAPI = {
  // Register user
  register: async (data) => {
    const response = await api.post('/api/auth/register', data);
    return response.data;
  },

  // Login user
  login: async (data) => {
    const response = await api.post('/api/auth/login', data);
    return response.data;
  },
};

export const chatAPI = {
  // Create conversation
  createConversation: async (data) => {
    const response = await api.post('/api/messages/conversations', data);
    return response.data;
  },

  // Send message
  sendMessage: async (data) => {
    const response = await api.post('/api/messages', data);
    return response.data;
  },

  // Get messages
  getMessages: async (conversationId) => {
    const response = await api.get(`/api/messages/${conversationId}`);
    return response.data;
  },

  // Get conversations
  getConversations: async (ambassadorId) => {
    const response = await api.get(`/api/messages/conversations/${ambassadorId}`);
    return response.data;
  },
};

export const rewardsAPI = {
  // Create reward (admin only)
  createReward: async (data) => {
    const response = await api.post('/api/rewards', data);
    return response.data;
  },

  // Get all rewards (admin only)
  getAllRewards: async (params) => {
    const response = await api.get('/api/rewards', { params });
    return response.data;
  },

  // Get reward statistics (admin only)
  getRewardStats: async () => {
    const response = await api.get('/api/rewards/stats');
    return response.data;
  },

  // Get my rewards (ambassador only)
  getMyRewards: async (params) => {
    const response = await api.get('/api/rewards/my', { params });
    return response.data;
  },

  // Get reward by ID (admin only)
  getRewardById: async (rewardId) => {
    const response = await api.get(`/api/rewards/${rewardId}`);
    return response.data;
  },

  // Get rewards by ambassador (admin only)
  getRewardsByAmbassador: async (ambassadorId, params) => {
    const response = await api.get(`/api/rewards/ambassador/${ambassadorId}`, { params });
    return response.data;
  },

  // Update reward status (admin only)
  updateRewardStatus: async (rewardId, data) => {
    const response = await api.patch(`/api/rewards/${rewardId}/status`, data);
    return response.data;
  },

  // Delete reward (admin only)
  deleteReward: async (rewardId) => {
    const response = await api.delete(`/api/rewards/${rewardId}`);
    return response.data;
  },
};

export const approvalAPI = {
  // Approve ambassador application
  approveAmbassador: async (userId) => {
    const response = await api.patch(`/api/auth/${userId}/approve`);
    return response.data;
  },

  // Reject ambassador application
  rejectAmbassador: async (userId) => {
    const response = await api.patch(`/api/auth/${userId}/reject`);
    return response.data;
  },

  // Get pending applications
  // getPendingApplications: async () => {
  //   const response = await api.get('/api/auth/approval/pending');
  //   return response.data;
  // },

  // // Get approved ambassadors
  // getApprovedAmbassadors: async () => {
  //   const response = await api.get('/api/auth/approval/approved');
  //   return response.data;
  // },

  // // Get approval statistics
  // getApprovalStats: async () => {
  //   const response = await api.get('/api/auth/approval/stats');
  //   return response.data;
  // },
};

export default api;
