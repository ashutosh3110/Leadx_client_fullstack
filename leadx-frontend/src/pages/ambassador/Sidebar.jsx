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
    { name: "Overview", path: "/ambassador", icon: <FaHome /> },
    { name: "Profile", path: "/ambassador/profile", icon: <FaUser /> },
    { name: "Rewards", path: "/ambassador/rewards", icon: <FaGift /> },
    { name: "Chat", path: "/ambassador/chat", icon: <FaComments /> },
  ]

  // Helper function to check if menu is active
  const isActive = (menuPath) => {
    const currentPath = location.pathname
    console.log("Current path:", currentPath, "Menu path:", menuPath)
    if (menuPath === "/ambassador") {
      return currentPath === "/ambassador" || currentPath === "/ambassador/"
    }
    return currentPath === menuPath
  }

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden p-4 bg-white shadow-md flex justify-between items-center">
        <h2 className="text-xl font-bold text-[rgb(188,23,32)]">Ambassador</h2>
        <button onClick={() => setOpen(!open)} className="text-2xl">
          {open ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed lg:static top-0 left-0 h-full w-64 bg-[rgb(188,23,32)] text-white transform ${
          open ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 transition-transform duration-300 z-50`}
      >
        <div className="p-6 font-bold text-2xl">Dashboard</div>
        <nav className="flex flex-col space-y-2 px-4">
          {menus.map((menu, i) => (
            <Link
              key={i}
              to={menu.path}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                isActive(menu.path)
                  ? "bg-white text-[rgb(188,23,32)] font-semibold shadow-md"
                  : "hover:bg-white hover:text-[rgb(188,23,32)] hover:shadow-md"
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
