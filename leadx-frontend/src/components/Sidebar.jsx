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
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white shadow-lg flex justify-between items-center p-2 sm:p-3">
        <div className="p-1 sm:p-2">
          <img
            src="/logo-new.png"
            alt="LeadX Logo"
            className="h-6 sm:h-8 object-contain"
          />
        </div>
        <button
          onClick={() => setOpen(true)}
          className="text-xl sm:text-2xl text-gray-700 hover:text-blue-600 transition-colors p-2"
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
        className={`fixed top-0 left-0 bottom-0 w-64 sm:w-56 lg:w-14 xl:w-56 text-white shadow-2xl transform ${
          open ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 transition-all duration-300 ease-in-out z-50 flex flex-col overflow-hidden`}
        style={{
          backgroundColor: '#1098e8',
          boxShadow: '0 0 20px rgba(0, 0, 0, 0.1)'
        }}
      >
        {/* Logo */}
        <div className="p-2 sm:p-3 lg:p-2 xl:p-4 flex-shrink-0 group relative">
          <div className="flex items-center justify-center">
            <img
              src="/logo-new.png"
              alt="LeadX Logo"
              className="h-6 sm:h-8 lg:h-8 xl:h-10 object-contain"
            />
          </div>
          
          {/* Tooltip for laptop view */}
          <div className="absolute left-full ml-1 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 lg:group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
            LeadX CRM
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 sm:px-3 lg:px-1 xl:px-4 pb-4 sm:pb-6 space-y-1 sm:space-y-2">
          {menus.map((menu, i) => (
            <Link
              key={i}
              to={menu.path}
              onClick={() => setOpen(false)}
              className={`w-full flex items-center space-x-2 sm:space-x-3 lg:justify-center xl:justify-start px-2 sm:px-3 lg:px-1 xl:px-3 py-2 sm:py-3 lg:py-2 xl:py-3 rounded-xl transition-all duration-300 text-left group relative ${
                location.pathname === menu.path
                  ? "bg-white/30 text-white shadow-xl scale-105 border border-white/30"
                  : "text-white/90 hover:text-white hover:bg-white/10 hover:shadow-lg hover:scale-105 active:scale-95"
              }`}
              title={menu.name}
            >
              <span className="text-base sm:text-lg lg:text-xl xl:text-lg">{menu.icon}</span>
              <span className="font-medium tracking-wide text-sm sm:text-base lg:hidden xl:block">{menu.name}</span>
              
              {/* Tooltip for laptop view */}
              <div className="absolute left-full ml-1 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 lg:group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                {menu.name}
              </div>
            </Link>
          ))}
        </nav>
      </div>
    </>
  )
}

export default Sidebar
