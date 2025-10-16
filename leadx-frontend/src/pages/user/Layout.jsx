import Sidebar from "./Sidebar"
import Navbar from "./Navbar"
import { Outlet } from "react-router-dom"
import { useColorContext } from "../../context/ColorContext"

const Layout = () => {
  const { userDashboardColor } = useColorContext()
  
  return (
    <div 
      className="h-screen flex flex-col lg:flex-row overflow-hidden"
      style={{ 
        background: `linear-gradient(135deg, #1098e815, #1098e810)`
      }}
    >
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Navbar />
        <main 
          className="flex-1 overflow-hidden"
          style={{ 
            background: `linear-gradient(135deg, #1098e815, #1098e810)`
          }}
        >
          <div className="h-full overflow-y-auto p-3 sm:p-4 md:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout
