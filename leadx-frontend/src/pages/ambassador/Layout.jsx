import Sidebar from "../../components/Sidebar"
import Navbar from "./Navbar"
import { Outlet } from "react-router-dom"
import { useColorContext } from "../../context/ColorContext"

const Layout = () => {
  const { ambassadorDashboardColor } = useColorContext()
  
  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100"
      style={{ 
        background: `linear-gradient(135deg, ${ambassadorDashboardColor}15, ${ambassadorDashboardColor}10)`
      }}
    >
      <Sidebar />
      <div 
        className="flex flex-col min-h-screen relative z-20 lg:ml-14 xl:ml-56"
      >
        <Navbar />
        <main 
          className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 pt-16 lg:pt-6"
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
