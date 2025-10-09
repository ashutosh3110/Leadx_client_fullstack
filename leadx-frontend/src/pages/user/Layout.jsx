import Sidebar from "./Sidebar"
import Navbar from "./Navbar"
import { Outlet } from "react-router-dom"
import { useColorContext } from "../../context/ColorContext"

const Layout = () => {
  const { userDashboardColor } = useColorContext()
  
  return (
    <div 
      className="h-screen flex overflow-hidden"
      style={{ 
        background: `linear-gradient(135deg, #1098e815, #1098e810)`
      }}
    >
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <Navbar />
        <main 
          className="flex-1 overflow-y-auto p-6"
          style={{ 
            background: `linear-gradient(135deg, #1098e815, #1098e810)`
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout
