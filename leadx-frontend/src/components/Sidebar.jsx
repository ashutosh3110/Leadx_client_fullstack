import { Link, useLocation } from "react-router-dom"
import { useState, useRef, useEffect } from "react"
import {
  FaBars,
  FaTimes,
  FaUser,
  FaGift,
  FaComments,
  FaHome,
  FaUniversity,
  FaUsers,
  FaCog,
} from "react-icons/fa"
import { useColorContext } from "../context/ColorContext"

const Sidebar = () => {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const sidebarRef = useRef(null)
  const { ambassadorDashboardColor } = useColorContext()

  const authUser = JSON.parse(localStorage.getItem("authUser"))
  const role = authUser?.user?.role || ""

  const menusByRole = {
    ambassador: [
      { name: "Overview", path: "/ambassador", icon: <FaHome /> },
      { name: "Profile", path: "/ambassador/profile", icon: <FaUser /> },
      { name: "Rewards", path: "/ambassador/rewards", icon: <FaGift /> },
      { name: "Chat", path: "/ambassador/chat", icon: <FaComments /> },
    ],
    admin: [
      { name: "Overview", path: "/admin", icon: <FaHome /> },
      { name: "Ambassadors", path: "/admin/ambassadors", icon: <FaUsers /> },
      { name: "Rewards", path: "/admin/rewards", icon: <FaGift /> },
      { name: "Chat", path: "/admin/chat", icon: <FaComments /> },
    ],
    superadmin: [
      { name: "Overview", path: "/superadmin", icon: <FaHome /> },
      {
        name: "Universities",
        path: "/superadmin/universities",
        icon: <FaUniversity />,
      },
      { name: "Admins", path: "/superadmin/admins", icon: <FaUsers /> },
      { name: "Settings", path: "/superadmin/settings", icon: <FaCog /> },
    ],
  }

  const menus = menusByRole[role] || []

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
    } else {
      document.removeEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [open])

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white shadow-lg flex justify-between items-center p-4">
        <div className="p-2">
          <img
            src="/logo-new.png"
            alt="LeadX Logo"
            className="h-8 sm:h-10 object-contain"
          />
        </div>
        <button
          onClick={() => setOpen(true)}
          className="text-2xl text-gray-700 hover:text-red-700 transition-colors"
          aria-label="Open sidebar"
        >
          <FaBars />
        </button>
      </div>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed lg:static top-0 left-0 h-screen w-64 text-white shadow-2xl transform ${
          open ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 transition-transform duration-300 ease-in-out z-50 flex flex-col`}
        style={{
          background: `linear-gradient(135deg, ${ambassadorDashboardColor}, ${ambassadorDashboardColor}dd)`,
        }}
      >
        {/* Sidebar header with logo */}
        <div
          className="flex justify-between items-center p-4 border-b flex-shrink-0"
          style={{ borderColor: `${ambassadorDashboardColor}80` }}
        >
          <img
            src="/logo-new.png"
            alt="LeadX Logo"
            className="h-10 object-contain"
          />
          <button
            onClick={() => setOpen(false)}
            className="text-2xl lg:hidden hover:opacity-70 transition-colors"
            aria-label="Close sidebar"
          >
            <FaTimes />
          </button>
        </div>

        {/* Menu items */}
        <nav className="flex flex-col gap-2 p-4 flex-1 overflow-y-auto">
          {menus.map((menu, i) => (
            <Link
              key={i}
              to={menu.path}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                location.pathname === menu.path
                  ? "bg-white font-semibold shadow-lg"
                  : "hover:opacity-80 hover:shadow-md"
              }`}
              style={{
                color:
                  location.pathname === menu.path
                    ? ambassadorDashboardColor
                    : "white",
              }}
            >
              <span className="text-lg">{menu.icon}</span>
              <span className="tracking-wide">{menu.name}</span>
            </Link>
          ))}
        </nav>
      </div>
    </>
  )
}

export default Sidebar
