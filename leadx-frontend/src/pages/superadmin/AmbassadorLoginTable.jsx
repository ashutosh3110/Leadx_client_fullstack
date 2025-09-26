// AmbassadorLoginTable.jsx
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
    <div className="overflow-x-auto w-full p-4">
      <h2 className="text-2xl font-bold mb-4">Ambassador Login History</h2>
      <div className="shadow-md rounded border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-sm md:text-base">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Login Time</th>
              <th className="px-4 py-3 text-left">IP</th>
              <th className="px-4 py-3 text-left">City</th>
              <th className="px-4 py-3 text-left">Region</th>
              <th className="px-4 py-3 text-left">ISP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {logins.map((log) => (
              <tr key={log._id}>
                <td className="px-4 py-2">{log.userId.name}</td>
                <td className="px-4 py-2">{log.userId.email}</td>
                <td className="px-4 py-2">
                  {new Date(log.loginTime).toLocaleString()}
                </td>
                <td className="px-4 py-2">{log.ipAddress}</td>
                <td className="px-4 py-2">{log.city || "-"}</td>
                <td className="px-4 py-2">{log.region || "-"}</td>
                <td className="px-4 py-2">{log.isp || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {logins.length === 0 && (
          <div className="p-4 text-center text-gray-500">No data found</div>
        )}
      </div>
    </div>
  )
}

export default AmbassadorLoginTable
