import { FaSignOutAlt } from "react-icons/fa"
import { useNavigate } from "react-router-dom"

const Navbar = () => {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("role")
    navigate("/login")
  }

  return (
    <div className="bg-white shadow-md px-6 py-3 flex items-center justify-between">
      <h1 className="text-lg font-semibold text-gray-700">
        Welcome, Ambassador
      </h1>
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 bg-[rgb(188,23,32)] text-white px-4 py-2 rounded-lg shadow hover:opacity-90 transition"
      >
        <FaSignOutAlt />
        Logout
      </button>
    </div>
  )
}

export default Navbar
