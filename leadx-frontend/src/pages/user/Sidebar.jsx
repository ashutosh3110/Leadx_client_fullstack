import { Link, useLocation } from "react-router-dom"
import { useState } from "react"
import {
  FaBars,
  FaTimes,
  FaUser,
  FaGift,
  FaComments,
  FaHome,
} from "react-icons/fa"

const Sidebar = () => {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  const menus = [
    { name: "Dashboard", path: "/user/dashboard", icon: <FaHome /> },
    { name: "Chats", path: "/user/chats", icon: <FaComments /> },
    { name: "Profile", path: "/user/profile", icon: <FaUser /> },
  ]

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden p-4 bg-white shadow-md flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <img
            src="/logo-new.png"
            alt="LeadX Logo"
            className="h-6 w-6 object-contain"
          />
          <h2 className="text-xl font-bold text-[rgb(188,23,32)]">Ambassador</h2>
        </div>
        <button onClick={() => setOpen(!open)} className="text-2xl">
          {open ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed lg:sticky top-0 left-0 w-64 h-screen text-white shadow-2xl flex flex-col ${
          open ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 transition-transform duration-300 z-50`}
        style={{ backgroundColor: '#1098e8' }}
      >
        <div className="p-6">
            {/* Logo */}
            <div className="flex items-center justify-center mb-6">
                <img
                    src="/logo-new.png"
                    alt="LeadX Logo"
                    className="h-8 sm:h-10 object-contain"
                />
            </div>
            <div className="font-bold text-2xl text-center">Dashboard</div>
        </div>
        <nav className="flex flex-col space-y-2 px-4">
          {menus.map((menu, i) => (
            <Link
              key={i}
              to={menu.path}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                location.pathname === menu.path
                  ? "bg-white/30 text-white font-semibold shadow-xl scale-105 border border-white/30"
                  : "text-white/90 hover:text-white hover:bg-white/10 hover:shadow-lg hover:scale-105"
              }`}
            >
              {menu.icon}
              {menu.name}
            </Link>
          ))}
        </nav>
      </div>
    </>
  )
}

export default Sidebar
