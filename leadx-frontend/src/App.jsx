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
import ProtectedRoute from "./components/ProtectedRoute"
import Unauthorized from "./pages/Unauthorized"
import Layout from "./pages/ambassador/Layout"
import Profile from "./pages/ambassador/Profile"
import Rewards from "./pages/ambassador/Rewards"
import Chat from "./pages/ambassador/Chat"
import Users from "./pages/ambassador/Users"
import AmbassadorList from "./pages/user/AmbassadorList"
import UserLayout from "./pages/user/Layout"
import UserDashboard from "./pages/user/Dashboard"
import UserChat from "./pages/user/UserChat"
import UserProfile from "./pages/user/Profile"
import AmbassadorLoginTable from "./pages/auth/LoginHistory"
import EmbedView from "./pages/embed/EmbedView"
// import CustomEmbedView from "./pages/embed/CustomEmbedView"

// Admin imports
import AdminLayout from "./pages/superadmin/AdminLayout"
import AdminOverview from "./pages/superadmin/AdminOverview"
import AdminAmbassadors from "./pages/superadmin/AdminAmbassadors"
import AdminRewards from "./pages/superadmin/AdminRewards"

import AdminSettings from "./pages/superadmin/AdminSettings"
import AdminCustomize from "./pages/superadmin/AdminCustomize"
import AdminAmbassadorLive from "./pages/superadmin/AmbassadorLoginTable"
import AdminChat from "./pages/superadmin/AdminChat"
import AdminUsers from "./pages/superadmin/AdminUsers"

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
        <Route path="/test" element={<AmbassadorLoginTable />} />

        {/* Admin Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminOverview />} />
            <Route path="overview" element={<AdminOverview />} />
            <Route path="ambassadors" element={<AdminAmbassadors />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="ambassador-login" element={<AdminAmbassadorLive />} />
            <Route path="rewards" element={<AdminRewards />} />
            <Route path="chat" element={<AdminChat />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="customize" element={<AdminCustomize />} />
          </Route>
        </Route>

        {/* Ambassador Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={["ambassador"]} />}>
          <Route path="/ambassador" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="profile" element={<Profile />} />
            <Route path="rewards" element={<Rewards />} />
            <Route path="chat" element={<Chat />} />
          </Route>
        </Route>
        <Route path="/ambassadors" element={<AmbassadorList />} />
        <Route path="/embed/view/:configKey" element={<EmbedView />} />
        {/* <Route path="/embed/:configId" element={<CustomEmbedView />} /> */}
        
        {/* User Routes */}
        <Route path="/user" element={<UserLayout />}>
          <Route index element={<UserDashboard />} />
          <Route path="dashboard" element={<UserDashboard />} />
          <Route path="chats" element={<UserChat />} />
          <Route path="profile" element={<UserProfile />} />
          <Route path="ambassadors" element={<AmbassadorList />} />
        </Route>

        <Route path="/unauthorized" element={<Unauthorized />} />
      </Routes>
    </Router>
  )
}

export default App
