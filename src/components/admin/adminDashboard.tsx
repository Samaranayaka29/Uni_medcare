import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '../../firebase'
import './adminDashboard.css'
import AdminNavigation from './adminNavigation'
import { verifyAdminToken } from '../../utils/adminAuth'

type StatsCard = {
  id: string
  labelLines: string[]
  value: number
  change: number
  icon: string
  tone: 'blue' | 'green' | 'amber' | 'red' | 'slate'
}

type DashboardData = {
  totalUsers: number
  totalDoctors: number
  totalAppointments: number
  todaysAppointments: number
  pendingReports: number
  totalStaff: number
  emergencyCases: number
  totalRevenue: number
  systemHealth: number
}

type ModuleItem = {
  title: string
  description: string
  icon: string
  route?: string
  accent: 'blue' | 'green' | 'amber' | 'red' | 'teal' | 'violet'
}

type ActivityItem = {
  title: string
  detail: string
  time: string
  tone: 'blue' | 'green' | 'amber' | 'red'
}

const AdminDashboard = () => {
  const navigate = useNavigate()
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalUsers: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    todaysAppointments: 0,
    pendingReports: 0,
    totalStaff: 0,
    emergencyCases: 0,
    totalRevenue: 0,
    systemHealth: 98,
  })
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  // Fetch total users
  const fetchTotalUsers = async () => {
    try {
      const usersRef = collection(db, 'users')
      const snapshot = await getDocs(usersRef)
      return snapshot.size
    } catch (error) {
      console.error('Error fetching users:', error)
      return 0
    }
  }

  // Fetch total doctors
  const fetchTotalDoctors = async () => {
    try {
      const doctorsRef = collection(db, 'doctors')
      const snapshot = await getDocs(doctorsRef)
      return snapshot.size
    } catch (error) {
      console.error('Error fetching doctors:', error)
      return 0
    }
  }

  // Fetch total appointments
  const fetchTotalAppointments = async () => {
    try {
      const appointmentsRef = collection(db, 'appointments')
      const snapshot = await getDocs(appointmentsRef)
      return snapshot.size
    } catch (error) {
      console.error('Error fetching appointments:', error)
      return 0
    }
  }

  const fetchTodayAppointments = async () => {
    try {
      const appointmentsRef = collection(db, 'appointments')
      const snapshot = await getDocs(appointmentsRef)
      const today = new Date()
      const todayKey = today.toISOString().split('T')[0]

      let count = 0
      snapshot.forEach((doc) => {
        const data = doc.data()
        const rawDate = typeof data.date === 'string' ? data.date : ''
        const normalized = rawDate.includes('T') ? rawDate.split('T')[0] : rawDate
        if (normalized === todayKey) {
          count += 1
        }
      })

      return count
    } catch (error) {
      console.error('Error fetching today appointments:', error)
      return 0
    }
  }

  // Fetch pending reports
  const fetchPendingReports = async () => {
    try {
      const recordsRef = collection(db, 'medicalrecords')
      const q = query(recordsRef, where('status', '==', 'pending'))
      const snapshot = await getDocs(q)
      return snapshot.size
    } catch (error) {
      console.error('Error fetching pending reports:', error)
      return 0
    }
  }

  const fetchTotalStaff = async () => {
    try {
      const staffRef = collection(db, 'staff')
      const snapshot = await getDocs(staffRef)
      return snapshot.size
    } catch (error) {
      console.error('Error fetching staff:', error)
      return 0
    }
  }

  const fetchEmergencyCases = async () => {
    try {
      const appointmentsRef = collection(db, 'appointments')
      const q = query(appointmentsRef, where('priority', '==', 'Emergency'))
      const snapshot = await getDocs(q)
      return snapshot.size
    } catch (error) {
      console.error('Error fetching emergency cases:', error)
      return 0
    }
  }

  // Fetch total revenue (sum of all appointments cost)
  const fetchTotalRevenue = async () => {
    try {
      const appointmentsRef = collection(db, 'appointments')
      const snapshot = await getDocs(appointmentsRef)
      let total = 0
      snapshot.forEach((doc) => {
        const data = doc.data()
        if (data.cost) total += data.cost
      })
      return total
    } catch (error) {
      console.error('Error fetching revenue:', error)
      return 0
    }
  }

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const admin = await verifyAdminToken()

        if (!admin) {
          navigate('/admin/login')
          return
        }

        setIsAdmin(true)

        // Fetch real data from Firestore
        const [
          totalUsers,
          totalDoctors,
          totalAppointments,
          todaysAppointments,
          pendingReports,
          totalStaff,
          emergencyCases,
          totalRevenue,
        ] = await Promise.all([
          fetchTotalUsers(),
          fetchTotalDoctors(),
          fetchTotalAppointments(),
          fetchTodayAppointments(),
          fetchPendingReports(),
          fetchTotalStaff(),
          fetchEmergencyCases(),
          fetchTotalRevenue(),
        ])

        setDashboardData({
          totalUsers,
          totalDoctors,
          totalAppointments,
          todaysAppointments,
          pendingReports,
          totalStaff,
          emergencyCases,
          totalRevenue,
          systemHealth: 98,
        })
      } catch (error) {
        console.error('Error checking admin access:', error)
        navigate('/admin/login')
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
      labelLines: ['Total', 'Patients'],
      value: dashboardData.totalUsers,
      change: 12,
      icon: '👥',
      tone: 'blue',
    },
    {
      id: 'doctors',
      labelLines: ['Total', 'Doctors'],
      value: dashboardData.totalDoctors,
      change: 3,
      icon: '👨‍⚕️',
      tone: 'green',
    },
    {
      id: 'appointments',
      labelLines: ['Total', 'Appointments'],
      value: dashboardData.totalAppointments,
      change: 8,
      icon: '📅',
      tone: 'amber',
    },
    {
      id: 'today',
      labelLines: ['Today’s', 'Appointments'],
      value: dashboardData.todaysAppointments,
      change: 5,
      icon: '🟢',
      tone: 'green',
    },
    {
      id: 'reports',
      labelLines: ['Pending', 'Reports'],
      value: dashboardData.pendingReports,
      change: -2,
      icon: '📋',
      tone: 'red',
    },
    {
      id: 'staff',
      labelLines: ['Total', 'Staff'],
      value: dashboardData.totalStaff,
      change: 4,
      icon: '🧑‍💼',
      tone: 'slate',
    },
    {
      id: 'emergency',
      labelLines: ['Emergency', 'Cases'],
      value: dashboardData.emergencyCases,
      change: 1,
      icon: '🚨',
      tone: 'red',
    },
  ]

  const modules: ModuleItem[] = [
    { title: 'Patient Management', description: 'Add, edit, search, and review patient medical history.', icon: '🧾', accent: 'blue', route: '/admin/users' },
    { title: 'Doctor Management', description: 'Manage doctors, availability, schedules, and departments.', icon: '🩺', accent: 'green', route: '/admin/doctors' },
    { title: 'Appointment Management', description: 'Approve, reject, reschedule, and track appointment status.', icon: '📆', accent: 'amber', route: '/admin/appointments' },
    { title: 'Department Management', description: 'Organize medicine, counseling, dental, and lab departments.', icon: '🏛️', accent: 'blue' },
    /* Staff and Pharmacy modules removed */
    { title: 'Notifications & Alerts', description: 'Send updates, announcements, and emergency alerts.', icon: '🔔', accent: 'amber' },
    /* Medical Reports and Analytics modules removed */
    { title: 'Security & Access', description: 'Control roles, sessions, logs, and password protection.', icon: '🔐', accent: 'red', route: '/admin/settings' },
    { title: 'Settings & Backup', description: 'Configure system settings, clinic timings, and backups.', icon: '⚙️', accent: 'violet', route: '/admin/settings' },
    { title: 'Emergency Request', description: 'Quick access for urgent patient request handling.', icon: '🚑', accent: 'red' },
  ]

  const recentActivity: ActivityItem[] = [
    { title: 'New appointment request', detail: 'Cardiology review for Faculty of Medicine', time: '5 min ago', tone: 'blue' },
    { title: 'Pending report uploaded', detail: 'Lab report awaiting admin approval', time: '18 min ago', tone: 'amber' },
    { title: 'Emergency case escalated', detail: 'Room allocation sent to staff dashboard', time: '34 min ago', tone: 'red' },
    { title: 'Doctor schedule updated', detail: 'Dental department shift changed for today', time: '1 hr ago', tone: 'green' },
  ]

  const analyticsHighlights = [
    { label: 'Monthly appointments', value: 'Bar charts', tone: 'blue' },
    { label: 'Patient growth', value: 'Line charts', tone: 'green' },
    { label: 'Most visited department', value: 'Pie charts', tone: 'amber' },
    { label: 'Doctor performance', value: 'Ranked cards', tone: 'red' },
    { label: 'Medicine usage', value: 'Stock trends', tone: 'slate' },
  ]

  const sidebarItems = [
    { label: 'Dashboard', icon: '🏠', route: '/admin/dashboard' },
    { label: 'Patients', icon: '👥', route: '/admin/users' },
    { label: 'Doctors', icon: '👨‍⚕️', route: '/admin/doctors' },
    { label: 'Appointments', icon: '📅', route: '/admin/appointments' },
    /* Reports and Analytics removed from sidebar */
    { label: 'Settings', icon: '⚙️', route: '/admin/settings' },
  ]

  const formatValue = (value: number) => value.toLocaleString()

  return (
    <div className="admin-container">
      <AdminNavigation />
      
      <div className="admin-content">
        <section className="hero-panel">
          <div className="admin-header">
            <div className="admin-header-content">
              <p className="eyebrow">Medical Center Control Room</p>
              <h1>Admin Dashboard</h1>
              <p>Manage patients, doctors, appointments, reports, departments, and security from one place.</p>
            </div>
            <div className="admin-header-date">
              <span>Today</span>
              <strong>
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </strong>
            </div>
          </div>

          <div className="hero-badges">
            <span>Role-based access control</span>
            <span>Password encrypted login</span>
            <span>Activity logs</span>
            <span>Session management</span>
          </div>
        </section>

        {/* Stats Grid */}
        <div className="stats-grid">
          {stats.map((stat) => (
            <div key={stat.id} className={`stat-card tone-${stat.tone}`}>
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-content">
                <p className="stat-label">
                  {stat.labelLines.map((line) => (
                    <span key={line}>{line}</span>
                  ))}
                </p>
                <h3 className="stat-value">{formatValue(stat.value)}</h3>
                <span className={`stat-change ${stat.change >= 0 ? 'positive' : 'negative'}`}>
                  {stat.change >= 0 ? '↑' : '↓'} {Math.abs(stat.change)}% from last month
                </span>
              </div>
            </div>
          ))}
        </div>

        <section className="dashboard-grid-two">
          <div className="metric-card large-card">
            <div className="section-heading">
              <h3>Operations Overview</h3>
              <p>Core medical center modules and live controls.</p>
            </div>
            <div className="module-grid">
              {modules.map((module) => (
                <button
                  key={module.title}
                  className={`module-card module-${module.accent}`}
                  onClick={() => module.route && navigate(module.route)}
                  type="button"
                >
                  <span className="module-icon">{module.icon}</span>
                  <span className="module-copy">
                    <strong>{module.title}</strong>
                    <span>{module.description}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="sidebar-stack">
            <div className="metric-card spotlight-card">
              <div className="section-heading">
                <h3>System Health</h3>
                <p>Protected access and backend status.</p>
              </div>
              <div className="health-bar">
                <div className="health-fill" style={{ width: `${dashboardData.systemHealth}%` }}></div>
              </div>
              <p className="health-text">{dashboardData.systemHealth}% - All systems operational</p>

              <div className="security-pills">
                <span>Super Admin</span>
                <span>Doctor</span>
                <span>Receptionist</span>
                <span>Pharmacist</span>
              </div>
            </div>

            <div className="metric-card spotlight-card">
              <div className="section-heading">
                <h3>Analytics & Reports</h3>
                <p>Recommended visual breakdowns for management.</p>
              </div>
              <div className="analytics-list">
                {analyticsHighlights.map((item) => (
                  <div key={item.label} className={`analytics-item analytics-${item.tone}`}>
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="dashboard-grid-two lower-grid">
          <div className="metric-card large-card">
            <div className="section-heading">
              <h3>Recent Activity</h3>
              <p>Operational events and current workload.</p>
            </div>
            <div className="activity-list">
              {recentActivity.map((item) => (
                <div key={item.title} className={`activity-row activity-${item.tone}`}>
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.detail}</p>
                  </div>
                  <span>{item.time}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="metric-card large-card">
            <div className="section-heading">
              <h3>Quick Management</h3>
              <p>Fast access to the most important actions.</p>
            </div>
            <div className="quick-links-grid">
              <button className="quick-link" type="button" onClick={() => navigate('/admin/users')}>
                <span>Patient Management</span>
                <small>Add, edit, search</small>
              </button>
              <button className="quick-link" type="button" onClick={() => navigate('/admin/doctors')}>
                <span>Doctor Management</span>
                <small>Availability and schedules</small>
              </button>
              <button className="quick-link" type="button" onClick={() => navigate('/admin/appointments')}>
                <span>Appointments</span>
                <small>Approve, reject, reschedule</small>
              </button>
              <button className="quick-link" type="button" onClick={() => navigate('/admin/reports')}>
                <span>Reports & Analytics</span>
                <small>Charts, trends, exports</small>
              </button>
            </div>

            <div className="module-note">
              <strong>Need a module menu?</strong>
              <p>Use the sidebar items for Dashboard, Patients, Doctors, Appointments, Reports, Departments, Pharmacy, Staff, Notifications, Analytics, Settings, and Logout.</p>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <div className="quick-actions-section">
          <div className="section-heading">
            <h2>Quick Actions</h2>
            <p>High-priority tasks for daily operations.</p>
          </div>
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

        <div className="mini-footer-grid">
          {sidebarItems.map((item) => (
            <button key={item.label} className="mini-nav-pill" type="button" onClick={() => navigate(item.route)}>
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
