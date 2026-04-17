import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/layout/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Explore from './pages/Explore'
import InfluencerProfile from './pages/InfluencerProfile'
import BookingFlow from './pages/BookingFlow'
import Dashboard from './pages/Dashboard'
import MyBookings from './pages/MyBookings'
import Admin from './pages/Admin'
import Onboarding from './pages/Onboarding'
import ForgotPassword from './pages/forgotpassword'
import AvailabilityManager from './pages/availabilityManager'


const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'#0C0C0C' }}>
      <div className="spinner"/>
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role) return <Navigate to="/" replace />
  return children
}

const AppRoutes = () => (
  <>
    <Navbar />
    <Routes>
      <Route path="/"                element={<Home />} />
      <Route path="/login"           element={<Login />} />
      <Route path="/register"        element={<Register />} />
      <Route path="/explore"         element={<Explore />} />
      <Route path="/creator/:handle" element={<InfluencerProfile />} />
      <Route path="/book/:handle"    element={<ProtectedRoute><BookingFlow /></ProtectedRoute>} />
      <Route path="/dashboard"       element={<ProtectedRoute role="influencer"><Dashboard /></ProtectedRoute>} />
      <Route path="/my-bookings"     element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
      <Route path="/admin"           element={<Admin />} />
      <Route path="/onboarding" element={<ProtectedRoute role="influencer"><Onboarding /></ProtectedRoute>} />
      <Route path="*"                element={<Navigate to="/" replace />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/availability" element={<ProtectedRoute role="influencer"><AvailabilityManager /></ProtectedRoute>} />
    </Routes>
  </>
)

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}