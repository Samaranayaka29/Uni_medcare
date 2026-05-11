import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth } from '../../firebase'
import './adminAppointments.css'
import AdminNavigation from './adminNavigation'

type Appointment = {
  id: string
  patientName: string
  doctorName: string
  date: string
  time: string
  status: 'scheduled' | 'completed' | 'cancelled'
  reason: string
  room: string
}

const AdminAppointments = () => {
  const navigate = useNavigate()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<'all' | 'scheduled' | 'completed' | 'cancelled'>('all')

  useEffect(() => {
    const checkAdminAndLoadAppointments = async () => {
      try {
        const user = auth.currentUser
        if (!user) {
          navigate('/login')
          return
        }

        const idTokenResult = await user.getIdTokenResult()
        const isAdminUser =
          idTokenResult.claims.admin === true || user.email === 'admin@unimedcare.com'

        if (!isAdminUser) {
          navigate('/dashboard')
          return
        }

        // Mock data
        const mockAppointments: Appointment[] = [
          {
            id: 'apt1',
            patientName: 'John Doe',
            doctorName: 'Dr. Sarah Smith',
            date: '2026-05-15',
            time: '09:00',
            status: 'scheduled',
            reason: 'Regular Checkup',
            room: '101',
          },
          {
            id: 'apt2',
            patientName: 'Jane Wilson',
            doctorName: 'Dr. Michael Brown',
            date: '2026-05-14',
            time: '14:30',
            status: 'completed',
            reason: 'Follow-up',
            room: '205',
          },
          {
            id: 'apt3',
            patientName: 'Alex Johnson',
            doctorName: 'Dr. Emily Davis',
            date: '2026-05-16',
            time: '10:15',
            status: 'scheduled',
            reason: 'Vaccination',
            room: '110',
          },
          {
            id: 'apt4',
            patientName: 'Sarah Chen',
            doctorName: 'Dr. Sarah Smith',
            date: '2026-05-12',
            time: '11:00',
            status: 'cancelled',
            reason: 'Emergency',
            room: '102',
          },
        ]

        setAppointments(mockAppointments)
      } catch (error) {
        console.error('Error loading appointments:', error)
      } finally {
        setLoading(false)
      }
    }

    checkAdminAndLoadAppointments()
  }, [navigate])

  const filteredAppointments = appointments.filter(
    (apt) => filterStatus === 'all' || apt.status === filterStatus
  )

  if (loading) {
    return (
      <div className="admin-appointments-container">
        <AdminNavigation />
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading appointments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-appointments-container">
      <AdminNavigation />

      <div className="admin-content">
        <div className="page-header">
          <h1>Appointment Management</h1>
        </div>

        {/* Filter Tabs */}
        <div className="filter-tabs">
          {(['all', 'scheduled', 'completed', 'cancelled'] as const).map((status) => (
            <button
              key={status}
              className={`tab ${filterStatus === status ? 'active' : ''}`}
              onClick={() => setFilterStatus(status)}
            >
              {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
              <span className="count">
                ({appointments.filter((a) => status === 'all' || a.status === status).length})
              </span>
            </button>
          ))}
        </div>

        {/* Appointments Table */}
        <div className="appointments-table-wrapper">
          {filteredAppointments.length > 0 ? (
            <table className="appointments-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Date & Time</th>
                  <th>Reason</th>
                  <th>Room</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map((apt) => (
                  <tr key={apt.id}>
                    <td>{apt.patientName}</td>
                    <td>{apt.doctorName}</td>
                    <td>
                      {new Date(apt.date).toLocaleDateString()} at {apt.time}
                    </td>
                    <td>{apt.reason}</td>
                    <td className="room-cell">{apt.room}</td>
                    <td>
                      <span className={`status-badge status-${apt.status}`}>
                        {apt.status}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <button className="btn-action edit" title="Edit">
                        ✏️
                      </button>
                      <button className="btn-action delete" title="Delete">
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <p>No appointments found.</p>
            </div>
          )}
        </div>

        {/* Summary Cards */}
        <div className="summary-section">
          <div className="summary-card">
            <h3>Today's Appointments</h3>
            <p className="summary-number">
              {appointments.filter((a) => a.date === new Date().toISOString().split('T')[0]).length}
            </p>
          </div>
          <div className="summary-card">
            <h3>Pending</h3>
            <p className="summary-number">{appointments.filter((a) => a.status === 'scheduled').length}</p>
          </div>
          <div className="summary-card">
            <h3>Completed</h3>
            <p className="summary-number">{appointments.filter((a) => a.status === 'completed').length}</p>
          </div>
          <div className="summary-card">
            <h3>Cancelled</h3>
            <p className="summary-number">{appointments.filter((a) => a.status === 'cancelled').length}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminAppointments
