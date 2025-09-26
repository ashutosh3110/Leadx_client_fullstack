import React from "react"
import { useColorContext } from "../../context/ColorContext"

const Dashboard = () => {
  const { ambassadorDashboardColor } = useColorContext()

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div 
        className="backdrop-blur-sm rounded-2xl p-6 border shadow-lg"
        style={{ 
          background: `linear-gradient(135deg, ${ambassadorDashboardColor}15, ${ambassadorDashboardColor}10)`,
          borderColor: `${ambassadorDashboardColor}30`
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">
              Welcome to Your Dashboard
            </h1>
            <p className="text-slate-600">
              Manage your ambassador activities and track your progress
            </p>
          </div>
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ 
              background: `linear-gradient(135deg, ${ambassadorDashboardColor}, ${ambassadorDashboardColor}dd)`
            }}
          >
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div 
          className="bg-white rounded-xl p-4 border shadow-sm hover:shadow-md transition-shadow"
          style={{ 
            borderColor: `${ambassadorDashboardColor}20`
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Active Students</p>
              <p className="text-2xl font-bold text-slate-800">12</p>
            </div>
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${ambassadorDashboardColor}20` }}
            >
              <svg className="w-5 h-5" style={{ color: ambassadorDashboardColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div 
          className="bg-white rounded-xl p-4 border shadow-sm hover:shadow-md transition-shadow"
          style={{ 
            borderColor: `${ambassadorDashboardColor}20`
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">This Month</p>
              <p className="text-2xl font-bold text-slate-800">8</p>
            </div>
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${ambassadorDashboardColor}20` }}
            >
              <svg className="w-5 h-5" style={{ color: ambassadorDashboardColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}

export default Dashboard
