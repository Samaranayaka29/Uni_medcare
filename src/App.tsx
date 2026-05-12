import './App.css'
import { Navigate, Route, Routes } from 'react-router-dom'
import Appointments from './components/appointments'
import Dashboard from './components/dashboard'
import DoctorProfile from './components/doctorProfile'
import Facilities from './components/client portal/facilities'
import Home from './components/client portal/home'
import History from './components/client portal/history'
import Login from './components/Login'
import Logout from './components/logout'
import MedicalRecords from './components/medicalrecords'
import Profile from './components/profile'
import Register from './components/register'

// Admin Portal Components
import AdminDashboard from './components/admin/adminDashboard'
import AdminLogin from './components/admin/AdminLogin.jsx'
import AdminUsers from './components/admin/adminUsers'
import AdminDoctors from './components/admin/adminDoctors'
import AdminAppointments from './components/admin/adminAppointments'
import AdminRecords from './components/admin/adminRecords'
import AdminReports from './components/admin/adminReports'
import AdminSettings from './components/admin/adminSettings'

function App() {
  return (
    <Routes>
      {/* Client Portal Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/our-history" element={<History />} />
      <Route path="/our-facilities" element={<Facilities />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/doctor/:slug" element={<DoctorProfile />} />
      <Route path="/appointments" element={<Appointments />} />
      <Route path="/medical-records" element={<MedicalRecords />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/logout" element={<Logout />} />

      {/* Admin Portal Routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/users" element={<AdminUsers />} />
      <Route path="/admin/doctors" element={<AdminDoctors />} />
      <Route path="/admin/appointments" element={<AdminAppointments />} />
      <Route path="/admin/records" element={<AdminRecords />} />
      <Route path="/admin/reports" element={<AdminReports />} />
      <Route path="/admin/settings" element={<AdminSettings />} />
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
