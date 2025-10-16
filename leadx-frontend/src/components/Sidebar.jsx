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
      { name: "Users", path: "/ambassador/users", icon: <FaUsers /> },
      { name: "Chat", path: "/ambassador/chat", icon: <FaComments /> },
      { name: "Rewards", path: "/ambassador/rewards", icon: <FaGift /> },
      { name: "Profile", path: "/ambassador/profile", icon: <FaUser /> },
    ],
    // admin: [
    //   { name: "Overview", path: "/admin", icon: <FaHome /> },
    //   { name: "Ambassadors", path: "/admin/ambassadors", icon: <FaUsers /> },
    //   { name: "Rewards", path: "/admin/rewards", icon: <FaGift /> },
    //   { name: "Chat", path: "/admin/chat", icon: <FaComments /> },
    // ],
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
        className={`fixed top-0 left-0 bottom-0 w-64 text-white shadow-2xl transform ${
          open ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 transition-transform duration-300 ease-in-out z-50 flex flex-col overflow-hidden`}
        style={{
          backgroundColor: '#1098e8',
          boxShadow: '0 0 20px rgba(0, 0, 0, 0.1)'
        }}
      >
        {/* Logo */}
        <div className="p-4 lg:p-6 flex-shrink-0">
          <div className="flex items-center justify-center">
            <img
              src="/logo-new.png"
              alt="LeadX Logo"
              className="h-8 sm:h-10 object-contain"
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 lg:px-6 pb-6 space-y-2">
          {menus.map((menu, i) => (
            <Link
              key={i}
              to={menu.path}
              onClick={() => setOpen(false)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 text-left group ${
                location.pathname === menu.path
                  ? "bg-white/30 text-white shadow-xl scale-105 border border-white/30"
                  : "text-white/90 hover:text-white hover:bg-white/10 hover:shadow-lg hover:scale-105 active:scale-95"
              }`}
            >
              <span className="text-lg">{menu.icon}</span>
              <span className="font-medium tracking-wide">{menu.name}</span>
            </Link>
          ))}
        </nav>
      </div>
    </>
  )
}

export default Sidebar
