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

const Sidebar = () => {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const sidebarRef = useRef(null)

  const role = localStorage.getItem("role") // get user role

  // Menus role-wise
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
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white shadow-lg flex justify-between items-center p-4">
        <h2 className="text-2xl font-bold text-red-700">Dashboard</h2>
        <button
          onClick={() => setOpen(true)}
          className="text-2xl text-gray-700 hover:text-red-700 transition-colors"
          aria-label="Open sidebar"
        >
          <FaBars />
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 border-e-indigo-50 bg-opacity-60 z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setOpen(false)}
        />
      )}

      <div
        ref={sidebarRef}
        className={`fixed lg:static top-0 left-0 h-full w-72 bg-red-700 text-white shadow-2xl transform ${
          open ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 transition-transform duration-300 ease-in-out z-50`}
      >
        <div className="flex justify-between items-center p-5 lg:p-6 border-b border-red-600">
          <h2 className="text-xl lg:text-2xl font-extrabold tracking-tight">
            Dashboard
          </h2>
          <button
            onClick={() => setOpen(false)}
            className="text-2xl lg:hidden hover:text-red-200 transition-colors"
            aria-label="Close sidebar"
          >
            <FaTimes />
          </button>
        </div>

        <nav className="flex flex-col gap-2 p-4 mt-4">
          {menus.map((menu, i) => (
            <Link
              key={i}
              to={menu.path}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                location.pathname === menu.path
                  ? "bg-white text-red-700 font-semibold shadow-md"
                  : "hover:bg-red-600 hover:text-white hover:shadow-md"
              }`}
            >
              <span className="text-xl">{menu.icon}</span>
              <span className="tracking-wide">{menu.name}</span>
            </Link>
          ))}
        </nav>
      </div>
    </>
  )
}

export default Sidebar
