import React, { useEffect, useState } from "react"
import api from "../utils/Api"

const AmbassadorLoginTable = () => {
  const [logins, setLogins] = useState([])

  useEffect(() => {
    fetchLoginData()
  }, [])

  const fetchLoginData = async () => {
    try {
      const res = await api.get("/auth/ambassador-logins")
      setLogins(res.data.data)
    } catch (err) {
      console.error("Failed to fetch login data", err)
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
        <h3 className="text-lg font-semibold text-slate-800 flex items-center">
          <svg
            className="w-5 h-5 text-yellow-500 mr-2"
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
        </h3>
      </div>

      {/* Responsive container with horizontal scroll */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200 overflow-x-auto">
        <table
          className="w-full divide-y divide-slate-200"
          style={{ minWidth: "800px" }}
        >
          <thead className="bg-gradient-to-r from-yellow-50 to-orange-50">
            <tr>
              <th className="px-2 lg:px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">
                Ambassador
              </th>
              <th className="px-2 lg:px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">
                Email
              </th>
              <th className="px-2 lg:px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">
                Login Time
              </th>
              <th className="px-2 lg:px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">
                IP Address
              </th>
              <th className="px-2 lg:px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">
                Location
              </th>
              <th className="px-2 lg:px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">
                ISP
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {logins.map((log) => (
              <tr
                key={log._id}
                className="hover:bg-yellow-50/50 transition-colors duration-200"
              >
                <td className="px-2 lg:px-4 py-4 whitespace-nowrap text-center">
                  <div className="flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-yellow-200 flex-shrink-0">
                      <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                        {log.userId.name?.charAt(0)?.toUpperCase() || "A"}
                      </div>
                    </div>
                    <div className="ml-3 min-w-0 flex-1">
                      <div className="text-sm font-semibold text-slate-900 truncate">
                        {log.userId.name || "Unknown Ambassador"}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-2 lg:px-4 py-4 whitespace-nowrap text-center">
                  <div className="text-sm font-semibold text-slate-900">
                    {log.userId.email || "N/A"}
                  </div>
                </td>
                <td className="px-2 lg:px-4 py-4 whitespace-nowrap text-center">
                  <div className="text-sm font-semibold text-slate-900">
                    {new Date(log.loginTime).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-slate-500">
                    {new Date(log.loginTime).toLocaleTimeString()}
                  </div>
                </td>
                <td className="px-2 lg:px-4 py-4 whitespace-nowrap text-sm text-slate-900 text-center">
                  <div className="truncate max-w-24">
                    {log.ipAddress || "N/A"}
                  </div>
                </td>
                <td className="px-2 lg:px-4 py-4 whitespace-nowrap text-sm text-slate-900 text-center">
                  <div className="flex flex-col items-center">
                    <div className="truncate max-w-24">
                      {log.city || "Unknown"}
                    </div>
                    <div className="text-xs text-slate-500">
                      {log.region || "Unknown"}
                    </div>
                  </div>
                </td>
                <td className="px-2 lg:px-4 py-4 whitespace-nowrap text-sm text-slate-900 text-center">
                  <div className="truncate max-w-32">
                    {log.isp || "Unknown"}
                  </div>
                </td>
              </tr>
            ))}
            {logins.length === 0 && (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center">
                  <div className="flex flex-col items-center">
                    <svg
                      className="w-12 h-12 text-slate-300 mb-3"
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
                    <h4 className="text-sm font-medium text-slate-500 mb-1">
                      No Login History Yet
                    </h4>
                    <p className="text-xs text-slate-400">
                      Ambassador login activities will appear here
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AmbassadorLoginTable
