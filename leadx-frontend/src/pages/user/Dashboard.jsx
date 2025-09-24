import React from "react"
import { useColorContext } from "../../context/ColorContext"

const Dashboard = () => {
  const { userDashboardColor } = useColorContext()

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
              Welcome to Your Dashboard
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div 
          className="bg-white rounded-xl p-4 border shadow-sm hover:shadow-md transition-shadow"
          style={{ 
            borderColor: `${userDashboardColor}20`
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Available Ambassadors</p>
              <p className="text-2xl font-bold text-slate-800">24</p>
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
              <p className="text-sm font-medium text-slate-600">Active Chats</p>
              <p className="text-2xl font-bold text-slate-800">3</p>
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

      {/* Quick Actions */}
      <div 
        className="bg-white rounded-xl p-6 border shadow-sm"
        style={{ 
          borderColor: `${userDashboardColor}20`
        }}
      >
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button 
            className="p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors text-left"
            onClick={() => window.location.href = '/user-dashboard/ambassadors'}
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${userDashboardColor}20` }}
              >
                <svg className="w-5 h-5" style={{ color: userDashboardColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-slate-800">Browse Ambassadors</h4>
                <p className="text-sm text-slate-600">Find and connect with verified ambassadors</p>
              </div>
            </div>
          </button>

          <button 
            className="p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors text-left"
            onClick={() => window.location.href = '/user-dashboard/chat'}
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${userDashboardColor}20` }}
              >
                <svg className="w-5 h-5" style={{ color: userDashboardColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-slate-800">View Chats</h4>
                <p className="text-sm text-slate-600">Continue your conversations with ambassadors</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
