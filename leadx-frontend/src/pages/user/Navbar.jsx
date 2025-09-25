import { FaSignOutAlt } from "react-icons/fa"
import { useNavigate } from "react-router-dom"
import { useColorContext } from "../../context/ColorContext"
import { getUser } from "../utils/auth"

const Navbar = () => {
  const navigate = useNavigate()
  const { userDashboardColor } = useColorContext()
  const user = getUser()

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("role")
    localStorage.removeItem("user")
    navigate("/login")
  }

  return (
    <div className="bg-white shadow-md px-6 py-3 flex items-center justify-between">
      <h1 className="text-lg font-semibold text-gray-700">
        Welcome, {user?.name || "Student"}
      </h1>
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 text-white px-4 py-2 rounded-lg shadow hover:opacity-90 transition"
        style={{ backgroundColor: userDashboardColor }}
      >
        <FaSignOutAlt />
        Logout
      </button>
    </div>
  )
}

export default Navbar
