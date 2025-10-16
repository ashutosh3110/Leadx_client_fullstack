import React, { useState, useEffect } from "react"
import { useColorContext } from "../../context/ColorContext"
import api from "../utils/Api"
import { getUser } from "../utils/auth"

const Dashboard = () => {
  const { userDashboardColor } = useColorContext()
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const user = getUser()
      
      if (!user) {
        setDashboardData({
          stats: {
            totalAmbassadors: 0,
            totalChats: 0,
            totalMessages: 0,
            thisMonthChats: 0,
            thisMonthMessages: 0,
            lastActivity: null,
          },
          recentChats: [],
        })
        return
      }

      const response = await api.get('/auth/dashboard')
      setDashboardData(response.data.data)
    } catch (err) {
      setError(`Failed to load dashboard data: ${err.response?.data?.message || err.message}`)
      // Set default data on error
      setDashboardData({
        stats: {
          totalAmbassadors: 0,
          totalChats: 0,
          totalMessages: 0,
          thisMonthChats: 0,
          thisMonthMessages: 0,
          lastActivity: null,
        },
        recentChats: [],
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])


  const getImageUrl = (path) => {
    if (!path) return null
    if (path.startsWith("http")) return path
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
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600 text-sm">
          {error} - <button 
            onClick={fetchDashboardData}
            className="ml-2 px-3 py-1 rounded text-white text-sm font-medium hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#1098e8' }}
          >
            Try again
          </button>
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Connected Ambassadors */}
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
                {loading ? '...' : dashboardData?.stats?.totalAmbassadors || 0}
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

        {/* Total Chats */}
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
                {loading ? '...' : dashboardData?.stats?.totalChats || 0}
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
      </div>
    </div>
  )
}

export default Dashboard
