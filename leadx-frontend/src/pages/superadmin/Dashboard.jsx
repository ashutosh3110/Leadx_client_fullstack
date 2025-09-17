import React from "react"
import { Link } from "react-router-dom"

const Dashboard = () => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Admin Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link to="/admin/ambassadors" className="p-4 bg-white rounded shadow">
          Manage Ambassadors
        </Link>
        <Link to="/admin/chat" className="p-4 bg-white rounded shadow">
          Admin Chat
        </Link>
      </div>
    </div>
  )
}

export default Dashboard
