import React, { useState, useEffect } from "react"
import { useColorContext } from "../../context/ColorContext"
import { getUser } from "../utils/auth"
import api from "../utils/Api"
import { useNavigate } from "react-router-dom"

const Dashboard = () => {
  const { userDashboardColor } = useColorContext()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const currentUser = getUser()
    setUser(currentUser)
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      console.log('🔍 Fetching user dashboard data...')
      
      const response = await api.get('/auth/dashboard')
      
      if (response.data.success) {
        setDashboardData(response.data.data)
        console.log('✅ Dashboard data loaded:', response.data.data)
      } else {
        console.error('❌ API response not successful:', response.data)
        setError('Failed to load dashboard data')
      }
    } catch (err) {
      console.error('❌ Error fetching dashboard data:', err)
      console.error('❌ Error details:', err.response?.data || err.message)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleChatClick = (chatId, ambassadorId) => {
    console.log('🔍 Opening chat with ambassador:', ambassadorId)
    navigate(`/user/chats`)
  }

  const getImageUrl = (path) => {
    if (!path) return "/default-avatar.png"
    const normalized = String(path).replace(/^\.\/+/, "").replace(/^\/+/, "")
    return `http://localhost:5000/${normalized}`
  }

  const getUserAvatar = (name) => {
    if (!name) return "U"
    // Handle both string and object cases
    const nameStr = typeof name === 'string' ? name : name?.name || 'U'
    return nameStr.charAt(0).toUpperCase()
  }

  const getAvatarColor = (name) => {
    if (!name) return "bg-gray-500"
    // Handle both string and object cases
    const nameStr = typeof name === 'string' ? name : name?.name || 'U'
    const colors = [
      "bg-red-500", "bg-blue-500", "bg-green-500", "bg-yellow-500", 
      "bg-purple-500", "bg-pink-500", "bg-indigo-500", "bg-teal-500"
    ]
    const index = nameStr.charCodeAt(0) % colors.length
    return colors[index]
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: userDashboardColor }}></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 text-lg">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="mt-4 px-4 py-2 rounded-lg text-white"
            style={{ backgroundColor: userDashboardColor }}
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div 
        className="backdrop-blur-sm rounded-2xl p-6 border shadow-lg"
        style={{ 
          background: `linear-gradient(135deg, ${userDashboardColor}15, ${userDashboardColor}10)`,
          borderColor: `${userDashboardColor}30`
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">
              Welcome back, {user?.name || 'User'}!
            </h1>
            <p className="text-slate-600">
              Connect with ambassadors and get guidance for your academic journey
            </p>
          </div>
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ 
              background: `linear-gradient(135deg, ${userDashboardColor}, ${userDashboardColor}dd)`
            }}
          >
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          className="bg-white rounded-xl p-4 border shadow-sm hover:shadow-md transition-shadow"
          style={{ 
            borderColor: `${userDashboardColor}20`
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Connected Ambassadors</p>
              <p className="text-2xl font-bold text-slate-800">
                {dashboardData?.stats?.totalAmbassadors || 0}
              </p>
            </div>
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${userDashboardColor}20` }}
            >
              <svg className="w-5 h-5" style={{ color: userDashboardColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div 
          className="bg-white rounded-xl p-4 border shadow-sm hover:shadow-md transition-shadow"
          style={{ 
            borderColor: `${userDashboardColor}20`
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Chats</p>
              <p className="text-2xl font-bold text-slate-800">
                {dashboardData?.stats?.totalChats || 0}
              </p>
            </div>
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${userDashboardColor}20` }}
            >
              <svg className="w-5 h-5" style={{ color: userDashboardColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
          </div>
        </div>

        <div 
          className="bg-white rounded-xl p-4 border shadow-sm hover:shadow-md transition-shadow"
          style={{ 
            borderColor: `${userDashboardColor}20`
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Messages</p>
              <p className="text-2xl font-bold text-slate-800">
                {dashboardData?.stats?.totalMessages || 0}
              </p>
            </div>
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${userDashboardColor}20` }}
            >
              <svg className="w-5 h-5" style={{ color: userDashboardColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
          </div>
        </div>

        <div 
          className="bg-white rounded-xl p-4 border shadow-sm hover:shadow-md transition-shadow"
          style={{ 
            borderColor: `${userDashboardColor}20`
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Last Activity</p>
              <p className="text-lg font-bold text-slate-800">
                {dashboardData?.stats?.lastActivity 
                  ? new Date(dashboardData.stats.lastActivity).toLocaleDateString()
                  : 'No activity'
                }
              </p>
            </div>
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${userDashboardColor}20` }}
            >
              <svg className="w-5 h-5" style={{ color: userDashboardColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
          </div>
        </div>
      </div>



    </div>
  )
}

export default Dashboard
