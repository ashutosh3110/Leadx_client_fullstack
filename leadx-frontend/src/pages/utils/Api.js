// src/utils/Api.js
import axios from "axios"
import { getToken, removeAuth, getUser, setAuth } from "./auth"

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: { "Content-Type": "application/json" },
  timeout: 120000,
})

// Request interceptor - Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (err) => Promise.reject(err)
)

// Response interceptor - Handle 401 errors
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status
    if (status === 401) {
      removeAuth()
      window.location.href = "/login"
    }
    return Promise.reject(error)
  }
)

// Utility function to get current user
export function getCurrentUser() {
  const local = getUser()
  if (local) return local
  return null
}

// Ambassador API endpoints
export const ambassadorAPI = {
  // Get all ambassadors from the correct endpoint
  getAllAmbassadors: async () => {
    const response = await api.get('/auth/ambassadors');
    return response.data;
  },

  // Get ambassador by ID
  getAmbassadorById: async (id) => {
    const response = await api.get(`/auth/ambassadors/${id}`);
    return response.data;
  },

  // Get ambassador dashboard
  getDashboard: async () => {
    const response = await api.get('/ambessdor/dashboard');
    return response.data;
  },

  // Update ambassador profile (using the new API endpoint)
  updateProfile: async (data) => {
    const response = await api.patch('/auth/profile-update', data);
    return response.data;
  },

  // Get updated profile data
  getUpdatedProfile: async (id) => {
    const response = await api.get(`/auth/ambassadors/${id}`);
    return response.data;
  },

  // Complete program
  completeProgram: async (data) => {
    const response = await api.patch('/ambessdor/complete-program', data);
    return response.data;
  },

  // Update ambassador
  updateAmbassador: async (ambassadorId, data) => {
    console.log('🔍 updateAmbassador API called');
    console.log('🔍 Ambassador ID:', ambassadorId);
    console.log('🔍 Update data:', data);
    console.log('🔍 Status in update data:', data.status);
    const response = await api.put(`/auth/${ambassadorId}`, data);
    console.log('🔍 API response:', response.data);
    console.log('🔍 Updated status from API:', response.data?.status);
    return response.data;
  },

  // Delete ambassador
  deleteAmbassador: async (ambassadorId) => {
    const response = await api.delete(`/auth/${ambassadorId}`);
    return response.data;
  },
};

// Authentication API endpoints
export const authAPI = {
  // Register user
  register: async (data) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  // Login user
  login: async (data) => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },
};

// Chat API endpoints
export const chatAPI = {
  // Create conversation
  createConversation: async (data) => {
    const response = await api.post('/messages/conversations', data);
    return response.data;
  },

  // Send message
  sendMessage: async (data) => {
    const response = await api.post('/messages', data);
    return response.data;
  },

  // Get messages
  getMessages: async (conversationId) => {
    const response = await api.get(`/messages/${conversationId}`);
    return response.data;
  },

  // Get conversations
  getConversations: async (ambassadorId) => {
    const response = await api.get(`/messages/conversations/${ambassadorId}`);
    return response.data;
  },

  // Get ambassadors with user messages count (admin only)
  getAmbassadorsWithMessages: async () => {
    const response = await api.get('/chat/admin/ambassadors-with-messages');
    return response.data;
  },

  // Get total conversations count (admin only)
  getTotalConversations: async () => {
    const response = await api.get('/chat/admin/total-conversations');
    return response.data;
  },

  // Get student statistics (admin only)
  getStudentStats: async () => {
    const response = await api.get('/chat/admin/student-stats');
    return response.data;
  },
};

// Rewards API endpoints
export const rewardsAPI = {
  // Create reward (admin only)
  createReward: async (data) => {
    const response = await api.post('/rewards', data);
    return response.data;
  },

  // Get all rewards (admin only)
  getAllRewards: async (params) => {
    const response = await api.get('/rewards', { params });
    return response.data;
  },

  // Get reward statistics (admin only)
  getRewardStats: async () => {
    const response = await api.get('/rewards/stats');
    return response.data;
  },

  // Get my rewards (ambassador only)
  getMyRewards: async (params) => {
    const response = await api.get('/rewards/my', { params });
    return response.data;
  },

  // Get reward by ID (admin only)
  getRewardById: async (rewardId) => {
    const response = await api.get(`/rewards/${rewardId}`);
    return response.data;
  },

  // Get rewards by ambassador (admin only)
  getRewardsByAmbassador: async (ambassadorId, params) => {
    const response = await api.get(`/rewards/ambassador/${ambassadorId}`, { params });
    return response.data;
  },

  // Update reward status (admin only)
  updateRewardStatus: async (rewardId, data) => {
    const response = await api.patch(`/rewards/${rewardId}/status`, data);
    return response.data;
  },

  // Delete reward (admin only)
  deleteReward: async (rewardId) => {
    const response = await api.delete(`/rewards/${rewardId}`);
    return response.data;
  },
};

// Approval API endpoints
export const approvalAPI = {
  // Approve ambassador application
  approveAmbassador: async (userId) => {
    const response = await api.patch(`/auth/${userId}/approve`);
    return response.data;
  },

  // Reject ambassador application
  rejectAmbassador: async (userId) => {
    const response = await api.patch(`/auth/${userId}/reject`);
    return response.data;
  },
};

export default api
