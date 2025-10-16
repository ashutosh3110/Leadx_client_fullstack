import { FaSignOutAlt } from "react-icons/fa"
import { useNavigate } from "react-router-dom"
import { useColorContext } from "../context/ColorContext"

const Navbar = () => {
  const navigate = useNavigate()
  const role = localStorage.getItem("authUser")
  const { ambassadorDashboardColor } = useColorContext()

  // Role-based welcome text
  const roleText = {
    superadmin: "Super Admin",
    admin: "University Admin",
    ambassador: "Ambassador",
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("role")
    navigate("/login")
  }

  return (
    <div
      className="backdrop-blur-sm border-b px-6 py-3 flex items-center justify-between flex-shrink-0"
      style={{
        background: `linear-gradient(135deg, ${ambassadorDashboardColor}25, ${ambassadorDashboardColor}15)`,
        borderColor: `${ambassadorDashboardColor}40`,
      }}
    >
      <h1 className="text-lg font-semibold text-slate-800">
        Welcome, {roleText[role] || "User"}
      </h1>
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 text-white px-4 py-2 rounded-lg shadow hover:opacity-90 transition"
        style={{ backgroundColor: ambassadorDashboardColor }}
      >
        <FaSignOutAlt />
        Logout
      </button>
    </div>
  )
}

export default Navbar
