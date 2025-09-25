import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import Login from "./pages/auth/Login"
import Register from "./pages/auth/Register"
import Dashboard from "./pages/ambassador/Dashboard"
import AdminDashboard from "./pages/superadmin/AdminDashboard"
import ProtectedRoute from "./components/ProtectedRoute"
import Unauthorized from "./pages/Unauthorized"
import Layout from "./pages/ambassador/Layout"
import Profile from "./pages/ambassador/Profile"
import Rewards from "./pages/ambassador/Rewards"
import Chat from "./pages/ambassador/Chat"
import ManageAmbassadors from "./pages/superadmin/ManageAmbassadors"
import AmbassadorList from "./pages/user/AmbassadorList"
import UserLayout from "./pages/user/Layout"

function App() {
  return (
    <Router>
      <ToastContainer 
        position="top-right" 
        autoClose={3000} 
        newestOnTop 
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Admin Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin" element={<AdminDashboard />}>
            {/* <Route index element={<AdminDashboard />} /> */}
            <Route path="users" element={<ManageAmbassadors />} />
            {/* <Route path="reports" element={<Reports />} /> */}
          </Route>
        </Route>

        {/* Ambassador Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={["ambassador"]} />}>
          <Route path="/ambassador" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="rewards" element={<Rewards />} />
            <Route path="chat" element={<Chat />} />
          </Route>
        </Route>
        <Route path="/ambassadors" element={<AmbassadorList/>} />
        <Route path="/user" element={<UserLayout/>} />

        

        <Route path="/unauthorized" element={<Unauthorized />} />
      </Routes>
    </Router>
  )
}

export default App
