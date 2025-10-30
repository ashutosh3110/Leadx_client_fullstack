import React, { useEffect, useState } from "react"
import api from "../utils/Api"

const AmbassadorLoginTable = () => {
  const [logins, setLogins] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchLoginData()
  }, [])

  const fetchLoginData = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('🔍 Fetching ambassador login data...')
      
      const res = await api.get("/auth/ambassador-logins")
      console.log('✅ Login data fetched:', res.data)
      
      if (res.data.success) {
        setLogins(res.data.data || [])
        console.log('📊 Total login records:', res.data.data?.length || 0)
      } else {
        setError(res.data.message || 'Failed to fetch login data')
      }
    } catch (err) {
      console.error("❌ Failed to fetch login data:", err)
      
      if (err.code === 'ERR_NETWORK' || err.message.includes('ERR_CONNECTION_REFUSED')) {
        setError('Backend server is not running. Please start the server on port 5000.')
      } else if (err.response?.status === 500) {
        setError('Server error. Please check the backend logs.')
      } else {
        setError(err.response?.data?.message || 'Failed to fetch login data')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-3">
        <h3 className="text-xs font-semibold text-slate-800 flex items-center">
          <svg
            className="w-4 h-4 text-yellow-500 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Ambassador Login History ({logins.length})
          {loading && (
            <div className="ml-2 flex items-center">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-yellow-500"></div>
              <span className="ml-1 text-xs text-gray-500">Loading...</span>
            </div>
          )}
        </h3>
        
        <div className="flex items-center gap-2">
          <button
            onClick={fetchLoginData}
            disabled={loading}
            className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 text-white text-xs font-medium rounded-lg transition-colors duration-200 flex items-center gap-1"
          >
            <svg
              className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Responsive container with horizontal scroll */}
      <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg border border-slate-200 overflow-x-auto max-w-6xl mx-auto">
        <table
          className="w-full divide-y divide-slate-200"
          style={{ minWidth: "700px" }}
        >
          <thead className="bg-gradient-to-r from-yellow-50 to-orange-50">
            <tr>
              <th className="px-2 py-2 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider whitespace-nowrap">
                Ambassador
              </th>
              <th className="px-2 py-2 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider whitespace-nowrap">
                Email
              </th>
              <th className="px-2 py-2 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider whitespace-nowrap">
                Login Time
              </th>
              <th className="px-2 py-2 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider whitespace-nowrap">
                IP Address
              </th>
              <th className="px-2 py-2 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider whitespace-nowrap">
                Location
              </th>
              <th className="px-2 py-2 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider whitespace-nowrap">
                Device
              </th>
              <th className="px-2 py-2 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider whitespace-nowrap">
                ISP
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 space-y-1">
            {loading ? (
              <tr>
                <td colSpan="7" className="px-4 py-8 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
                    <div className="text-gray-500 text-sm font-medium">Loading login data...</div>
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="7" className="px-4 py-8 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="text-red-400 text-4xl">⚠️</div>
                    <div className="text-red-500 text-sm font-medium">Error loading data</div>
                    <div className="text-gray-400 text-xs max-w-md text-center">{error}</div>
                    {error.includes('Backend server is not running') && (
                      <div className="text-yellow-600 text-xs bg-yellow-50 px-3 py-2 rounded-lg border border-yellow-200">
                        💡 <strong>Solution:</strong> Run <code className="bg-yellow-100 px-1 rounded">npm run dev</code> in the backend directory
                      </div>
                    )}
                    <button
                      onClick={fetchLoginData}
                      className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white text-xs rounded-lg transition-colors duration-200 flex items-center gap-2"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Try Again
                    </button>
                  </div>
                </td>
              </tr>
            ) : logins.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-4 py-8 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="text-gray-400 text-4xl">📊</div>
                    <div className="text-gray-500 text-sm font-medium">No Login Data Available</div>
                    <div className="text-gray-400 text-xs">
                      No ambassador login records found. Ambassadors will appear here when they log in.
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              logins.map((log) => (
              <tr
                key={log.id || log._id}
                className="hover:bg-yellow-50/50 transition-colors duration-200 mb-1"
              >
                <td className="px-2 py-2 whitespace-nowrap text-center">
                  <div className="flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full overflow-hidden border-2 border-yellow-200 flex-shrink-0">
                      <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                        {log.user?.name?.charAt(0)?.toUpperCase() || "A"}
                      </div>
                    </div>
                    <div className="ml-1 min-w-0 flex-1">
                      <div className="text-xs font-bold text-slate-900 truncate capitalize">
                        {log.user?.name || "Unknown Ambassador"}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-2 py-2 whitespace-nowrap text-center">
                  <div className="text-xs font-normal text-slate-900">
                    {log.user?.email || "N/A"}
                  </div>
                </td>
                <td className="px-2 py-2 whitespace-nowrap text-center">
                  <div className="text-xs font-normal text-slate-900">
                    {log.loginTime ? new Date(log.loginTime).toLocaleDateString() : "N/A"}
                  </div>
                  <div className="text-xs text-slate-500">
                    {log.loginTime ? new Date(log.loginTime).toLocaleTimeString() : "N/A"}
                  </div>
                </td>
                <td className="px-2 py-2 whitespace-nowrap text-xs text-slate-900">
                  <div className="flex justify-center items-center">
                    <span className="truncate max-w-24">
                      {log.ipAddress || "N/A"}
                    </span>
                  </div>
                </td>
                <td className="px-2 py-2 whitespace-nowrap text-xs text-slate-900 text-center">
                  <div className="flex flex-col items-center">
                    {log.city && log.region ? (
                      <>
                        <div className="truncate max-w-24 font-normal text-blue-600">
                          {log.city}
                        </div>
                        <div className="text-xs text-slate-500">
                          {log.region}
                        </div>
                        {log.ipAddress && log.ipAddress !== "::1" && (
                          <div className="text-xs text-gray-400">
                            {log.ipAddress}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-xs text-gray-400 italic">
                        Location not detected
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-2 py-2 whitespace-nowrap text-center">
                  <div className="text-xs font-medium text-slate-900">
                    {log.device || 'Unknown'}
                  </div>
                  <div className="text-xs text-slate-500">
                    {log.browser || 'Browser unknown'}
                  </div>
                  <div className="text-xs text-slate-400">
                    {log.os || 'OS unknown'}
                  </div>
                </td>
                <td className="px-2 py-2 whitespace-nowrap text-xs text-slate-900">
                  <div className="flex justify-center items-center">
                    {log.isp ? (
                      <span className="truncate max-w-32 font-normal text-blue-600">
                        {log.isp}
                      </span>
                    ) : (
                      <span className="text-gray-400 italic">
                        Not detected
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AmbassadorLoginTable
