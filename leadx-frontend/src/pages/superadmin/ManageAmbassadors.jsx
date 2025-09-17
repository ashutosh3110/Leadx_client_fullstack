import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import api from "../utils/Api"

const ManageAmbassadors = () => {
  const [ambassadors, setAmbassadors] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")

  const fetchAmbassadors = async () => {
    try {
      setLoading(true)
      const res = await api.get(`/user/admin/ambassadors`, {
        params: { search },
      })
      if (res.data.success) setAmbassadors(res.data.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAmbassadors()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleDelete = async (id) => {
    if (!confirm("Delete this ambassador?")) return
    try {
      await api.delete(`/user/admin/${id}`)
      setAmbassadors((prev) => prev.filter((u) => u._id !== id))
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex items-center gap-2 mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, phone"
          className="border rounded px-3 py-2 flex-1"
        />
        <button onClick={fetchAmbassadors} className="px-4 py-2 bg-red-600 text-white rounded">
          Search
        </button>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="p-2">Name</th>
                <th className="p-2">Email</th>
                <th className="p-2">Phone</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {ambassadors.map((u) => (
                <tr key={u._id} className="border-b">
                  <td className="p-2">{u.name}</td>
                  <td className="p-2">{u.email}</td>
                  <td className="p-2">{u.phone}</td>
                  <td className="p-2 flex gap-2">
                    <Link
                      to={`/admin/chat?ambassadorId=${u._id}`}
                      className="px-3 py-1 rounded bg-gray-100"
                    >
                      View Chats
                    </Link>
                    <button
                      onClick={() => handleDelete(u._id)}
                      className="px-3 py-1 rounded bg-red-50 text-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default ManageAmbassadors
