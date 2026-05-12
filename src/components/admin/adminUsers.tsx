import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './adminUsers.css'
import AdminNavigation from './adminNavigation'
import { verifyAdminToken } from '../../utils/adminAuth'

type User = {
  id: string
  name: string
  email: string
  role: 'patient' | 'doctor' | 'admin'
  joinDate: string
  status: 'active' | 'inactive'
  phone: string
}

const AdminUsers = () => {
  const navigate = useNavigate()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState<'all' | 'patient' | 'doctor' | 'admin'>('all')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    const checkAdminAndLoadUsers = async () => {
      try {
        const admin = await verifyAdminToken()

        if (!admin) {
          navigate('/admin/login')
          return
        }

        // Mock data - replace with real API calls
        const mockUsers: User[] = [
          {
            id: '1',
            name: 'John Doe',
            email: 'john@example.com',
            role: 'patient',
            joinDate: '2026-01-15',
            status: 'active',
            phone: '+1-555-0101',
          },
          {
            id: '2',
            name: 'Dr. Sarah Smith',
            email: 'sarah@example.com',
            role: 'doctor',
            joinDate: '2025-06-20',
            status: 'active',
            phone: '+1-555-0102',
          },
          {
            id: '3',
            name: 'Jane Wilson',
            email: 'jane@example.com',
            role: 'patient',
            joinDate: '2026-02-10',
            status: 'active',
            phone: '+1-555-0103',
          },
          {
            id: '4',
            name: 'Dr. Michael Brown',
            email: 'michael@example.com',
            role: 'doctor',
            joinDate: '2025-08-05',
            status: 'inactive',
            phone: '+1-555-0104',
          },
          {
            id: '5',
            name: 'Alex Johnson',
            email: 'alex@example.com',
            role: 'patient',
            joinDate: '2026-03-01',
            status: 'active',
            phone: '+1-555-0105',
          },
        ]

        setUsers(mockUsers)
      } catch (error) {
        console.error('Error loading users:', error)
      } finally {
        setLoading(false)
      }
    }

    checkAdminAndLoadUsers()
  }, [navigate])

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === 'all' || user.role === filterRole
    return matchesSearch && matchesRole
  })

  const handleViewUser = (user: User) => {
    setSelectedUser(user)
    setShowModal(true)
  }

  const handleStatusChange = (userId: string, newStatus: 'active' | 'inactive') => {
    setUsers(
      users.map((u) => (u.id === userId ? { ...u, status: newStatus } : u))
    )
  }

  if (loading) {
    return (
      <div className="admin-users-container">
        <AdminNavigation />
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading users...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-users-container">
      <AdminNavigation />

      <div className="admin-content">
        <div className="page-header">
          <h1>User Management</h1>
          <button className="btn-add-user" onClick={() => navigate('/admin/add-user')}>
            + Add New User
          </button>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="search-icon">🔍</span>
          </div>

          <div className="role-filter">
            <label>Filter by Role:</label>
            <select value={filterRole} onChange={(e) => setFilterRole(e.target.value as any)}>
              <option value="all">All Roles</option>
              <option value="patient">Patients</option>
              <option value="doctor">Doctors</option>
              <option value="admin">Admins</option>
            </select>
          </div>

          <div className="results-info">
            Showing {filteredUsers.length} of {users.length} users
          </div>
        </div>

        {/* Users Table */}
        <div className="users-table-wrapper">
          {filteredUsers.length > 0 ? (
            <table className="users-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Join Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="user-name">{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`role-badge role-${user.role}`}>{user.role}</span>
                    </td>
                    <td>{new Date(user.joinDate).toLocaleDateString()}</td>
                    <td>
                      <span className={`status-badge status-${user.status}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <button
                        className="btn-action view"
                        title="View Details"
                        onClick={() => handleViewUser(user)}
                      >
                        👁️
                      </button>
                      <button
                        className="btn-action edit"
                        title="Edit"
                        onClick={() => navigate(`/admin/edit-user/${user.id}`)}
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-action delete"
                        title="Delete"
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this user?')) {
                            setUsers(users.filter((u) => u.id !== user.id))
                          }
                        }}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <p>No users found matching your criteria.</p>
            </div>
          )}
        </div>

        {/* User Details Modal */}
        {showModal && selectedUser && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="user-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>User Details</h2>
                <button className="close-btn" onClick={() => setShowModal(false)}>
                  ✕
                </button>
              </div>

              <div className="modal-content">
                <div className="detail-group">
                  <label>Name</label>
                  <p>{selectedUser.name}</p>
                </div>

                <div className="detail-group">
                  <label>Email</label>
                  <p>{selectedUser.email}</p>
                </div>

                <div className="detail-group">
                  <label>Phone</label>
                  <p>{selectedUser.phone}</p>
                </div>

                <div className="detail-group">
                  <label>Role</label>
                  <p>
                    <span className={`role-badge role-${selectedUser.role}`}>
                      {selectedUser.role}
                    </span>
                  </p>
                </div>

                <div className="detail-group">
                  <label>Status</label>
                  <div className="status-controls">
                    <select
                      value={selectedUser.status}
                      onChange={(e) => {
                        handleStatusChange(selectedUser.id, e.target.value as any)
                        setSelectedUser({
                          ...selectedUser,
                          status: e.target.value as any,
                        })
                      }}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="detail-group">
                  <label>Join Date</label>
                  <p>{new Date(selectedUser.joinDate).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="modal-actions">
                <button className="btn-cancel" onClick={() => setShowModal(false)}>
                  Close
                </button>
                <button className="btn-save">Save Changes</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminUsers
