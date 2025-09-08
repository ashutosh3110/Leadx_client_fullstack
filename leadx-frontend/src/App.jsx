import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom"
import Login from "./pages/auth/Login"
import Register from "./pages/auth/Register"
import Dashboard from "./pages/ambassador/Dashboard"
import AdminDashboard from "./pages/superadmin/Dashboard"
import ProtectedRoute from "./components/ProtectedRoute"
import Unauthorized from "./pages/Unauthorized"
import Layout from "./pages/ambassador/Layout"
import Profile from "./pages/ambassador/Profile"
import Rewards from "./pages/ambassador/Rewards"
import Chat from "./pages/ambassador/Chat"
import ManageAmbassadors from "./pages/superadmin/ManageAmbassadors"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
function App() {
  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} newestOnTop />

      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Ambassador Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={["ambassador"]} />}>
          <Route path="/ambassador" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="rewards" element={<Rewards />} />
            <Route path="chat" element={<Chat />} />
          </Route>
        </Route>

        {/* Admin Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin" element={<Layout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<ManageAmbassadors />} />
            {/* <Route path="reports" element={<Reports />} /> */}
          </Route>
        </Route>

        <Route path="/unauthorized" element={<Unauthorized />} />
      </Routes>
    </Router>
  )
}

export default App
