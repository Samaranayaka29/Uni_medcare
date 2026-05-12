import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import './adminNavigation.css'
import { clearAdminToken } from '../../utils/adminAuth'

type NavItem = {
  id: string
  label: string
  path: string
  icon: string
}

const AdminNavigation = () => {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(true)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
    { id: 'users', label: 'Users', path: '/admin/users', icon: '👥' },
    { id: 'doctors', label: 'Doctors', path: '/admin/doctors', icon: '👨‍⚕️' },
    { id: 'appointments', label: 'Appointments', path: '/admin/appointments', icon: '📅' },
    { id: 'records', label: 'Medical Records', path: '/admin/records', icon: '📄' },
    { id: 'reports', label: 'Reports', path: '/admin/reports', icon: '📈' },
    { id: 'settings', label: 'Settings', path: '/admin/settings', icon: '⚙️' },
  ]

  const handleLogout = async () => {
    try {
      clearAdminToken()
      navigate('/admin/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <>
      <nav className={`admin-nav ${isOpen ? 'open' : 'closed'}`}>
        <div className="nav-header">
          <div className="nav-brand">
            <span className="brand-icon">🏥</span>
            {isOpen && <span className="brand-text">MedAdmin</span>}
          </div>
          <button
            className="toggle-btn"
            onClick={() => setIsOpen(!isOpen)}
            title={isOpen ? 'Collapse' : 'Expand'}
          >
            {isOpen ? '◀' : '▶'}
          </button>
        </div>

        <div className="nav-menu">
          {navItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {isOpen && <span className="nav-label">{item.label}</span>}
            </NavLink>
          ))}
        </div>

        <div className="nav-footer">
          <button
            className="logout-btn"
            onClick={() => setShowLogoutConfirm(true)}
            title="Logout"
          >
            <span className="logout-icon">🚪</span>
            {isOpen && <span>Logout</span>}
          </button>
        </div>
      </nav>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="modal-overlay">
          <div className="logout-modal">
            <h3>Confirm Logout</h3>
            <p>Are you sure you want to logout?</p>
            <div className="modal-actions">
              <button
                className="btn-cancel"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </button>
              <button className="btn-confirm" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default AdminNavigation
