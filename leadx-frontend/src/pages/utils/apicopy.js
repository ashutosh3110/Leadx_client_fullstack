import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
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

  // Get ambassador rewards
  getAmbassadorRewards: async (ambassadorId) => {
    const response = await api.get(`/api/rewards/${ambassadorId}`);
    return response.data;
  },

  // Get reward summary
  getRewardSummary: async (ambassadorId) => {
    const response = await api.get(`/api/rewards/summary/${ambassadorId}`);
    return response.data;
  },

  // Update reward status (admin only)
  updateRewardStatus: async (rewardId, status) => {
    const response = await api.patch(`/api/rewards/${rewardId}`, { status });
    return response.data;
  },

  // Get all rewards (admin only)
  getAllRewards: async (params) => {
    const response = await api.get('/api/rewards', { params });
    return response.data;
  },
};

export const approvalAPI = {
  // Approve ambassador application
  approveAmbassador: async (userId) => {
    const response = await api.patch(`/api/auth/approve/${userId}`);
    return response.data;
  },

  // Reject ambassador application
  rejectAmbassador: async (userId) => {
    const response = await api.patch(`/api/auth/reject/${userId}`);
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
