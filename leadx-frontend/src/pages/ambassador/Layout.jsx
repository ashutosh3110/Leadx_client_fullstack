import Sidebar from "../../components/Sidebar"
import Navbar from "../../components/Navbar"
import { Outlet } from "react-router-dom"
import { useColorContext } from "../../context/ColorContext"

const Layout = () => {
  const { ambassadorDashboardColor } = useColorContext()
  
  return (
    <div 
      className="h-screen flex overflow-hidden"
      style={{ 
        background: `linear-gradient(135deg, ${ambassadorDashboardColor}15, ${ambassadorDashboardColor}10)`
      }}
    >
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <Navbar />
        <main 
          className="flex-1 overflow-y-auto p-6"
          style={{ 
            background: `linear-gradient(135deg, ${ambassadorDashboardColor}15, ${ambassadorDashboardColor}10)`
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout
