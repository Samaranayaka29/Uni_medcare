import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth } from '../../firebase'
import './adminDashboard.css'
import AdminNavigation from './adminNavigation'

type StatsCard = {
  id: string
  label: string
  value: number
  change: number
  icon: string
}

type DashboardData = {
  totalUsers: number
  totalDoctors: number
  totalAppointments: number
  pendingAppointments: number
  totalRevenue: number
  systemHealth: number
}

const AdminDashboard = () => {
  const navigate = useNavigate()
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalUsers: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    pendingAppointments: 0,
    totalRevenue: 0,
    systemHealth: 0,
  })
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const user = auth.currentUser
        if (!user) {
          navigate('/login')
          return
        }

        // Get custom claims to verify admin role
        const idTokenResult = await user.getIdTokenResult()
        const isAdminUser = idTokenResult.claims.admin === true || 
                           user.email === 'admin@unimedcare.com'

        if (!isAdminUser) {
          navigate('/dashboard')
          return
        }

        setIsAdmin(true)
        
        // Mock data - replace with real API calls
        setDashboardData({
          totalUsers: 1250,
          totalDoctors: 48,
          totalAppointments: 3420,
          pendingAppointments: 127,
          totalRevenue: 254000,
          systemHealth: 98,
        })
      } catch (error) {
        console.error('Error checking admin access:', error)
        navigate('/login')
      } finally {
        setLoading(false)
      }
    }

    checkAdminAccess()
  }, [navigate])

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>Loading admin dashboard...</p>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  const stats: StatsCard[] = [
    {
      id: 'users',
      label: 'Total Users',
      value: dashboardData.totalUsers,
      change: 12,
      icon: '👥',
    },
    {
      id: 'doctors',
      label: 'Total Doctors',
      value: dashboardData.totalDoctors,
      change: 3,
      icon: '👨‍⚕️',
    },
    {
      id: 'appointments',
      label: 'Total Appointments',
      value: dashboardData.totalAppointments,
      change: 8,
      icon: '📅',
    },
    {
      id: 'pending',
      label: 'Pending Appointments',
      value: dashboardData.pendingAppointments,
      change: -2,
      icon: '⏳',
    },
  ]

  return (
    <div className="admin-container">
      <AdminNavigation />
      
      <div className="admin-content">
        <div className="admin-header">
          <div className="admin-header-content">
            <h1>Admin Dashboard</h1>
            <p>Welcome back! Here's your system overview.</p>
          </div>
          <div className="admin-header-date">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          {stats.map((stat) => (
            <div key={stat.id} className="stat-card">
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-content">
                <p className="stat-label">{stat.label}</p>
                <h3 className="stat-value">{stat.value.toLocaleString()}</h3>
                <span className={`stat-change ${stat.change >= 0 ? 'positive' : 'negative'}`}>
                  {stat.change >= 0 ? '↑' : '↓'} {Math.abs(stat.change)}% from last month
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Key Metrics */}
        <div className="metrics-section">
          <div className="metric-card">
            <h3>System Health</h3>
            <div className="health-bar">
              <div className="health-fill" style={{ width: `${dashboardData.systemHealth}%` }}></div>
            </div>
            <p className="health-text">{dashboardData.systemHealth}% - All systems operational</p>
          </div>

          <div className="metric-card">
            <h3>Revenue Overview</h3>
            <div className="revenue-display">
              <span className="revenue-amount">${dashboardData.totalRevenue.toLocaleString()}</span>
              <span className="revenue-period">Total Revenue</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions-section">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <button className="action-btn" onClick={() => navigate('/admin/users')}>
              <span className="action-icon">👤</span>
              <span>Manage Users</span>
            </button>
            <button className="action-btn" onClick={() => navigate('/admin/doctors')}>
              <span className="action-icon">🏥</span>
              <span>Manage Doctors</span>
            </button>
            <button className="action-btn" onClick={() => navigate('/admin/appointments')}>
              <span className="action-icon">📋</span>
              <span>View Appointments</span>
            </button>
            <button className="action-btn" onClick={() => navigate('/admin/records')}>
              <span className="action-icon">📄</span>
              <span>Medical Records</span>
            </button>
            <button className="action-btn" onClick={() => navigate('/admin/reports')}>
              <span className="action-icon">📊</span>
              <span>Generate Reports</span>
            </button>
            <button className="action-btn" onClick={() => navigate('/admin/settings')}>
              <span className="action-icon">⚙️</span>
              <span>System Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
