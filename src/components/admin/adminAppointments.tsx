import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './adminAppointments.css'
import AdminNavigation from './adminNavigation'
import { getAdminToken, verifyAdminToken } from '../../utils/adminAuth'

type Appointment = {
  id: string
  patientName: string
  doctorName: string
  date: string
  time: string
  status: 'Pending' | 'Approved' | 'Completed' | 'Cancelled'
  reason: string
  room: string
}

const API_URL = import.meta.env.VITE_API_URL ?? '/api'

const AdminAppointments = () => {
  const navigate = useNavigate()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<'all' | Appointment['status']>('all')
  const [error, setError] = useState('')

  const authHeaders = () => ({
    Authorization: `Bearer ${getAdminToken() ?? ''}`,
    'Content-Type': 'application/json',
  })

  const loadAppointments = async () => {
    const response = await fetch(`${API_URL}/api/appointments`, {
      headers: authHeaders(),
    })

    if (!response.ok) {
      const data = await response.json().catch(() => ({ error: 'Failed to load appointments' }))
      throw new Error(data.error ?? 'Failed to load appointments')
    }

    const data = await response.json()
    setAppointments(data)
  }

  useEffect(() => {
    const checkAdminAndLoadAppointments = async () => {
      try {
        const admin = await verifyAdminToken()

        if (!admin) {
          navigate('/admin/login')
          return
        }

        await loadAppointments()
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Error loading appointments'
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    checkAdminAndLoadAppointments()
  }, [navigate])

  const updateAppointmentStatus = async (id: string, status: Appointment['status']) => {
    setError('')
    try {
      const response = await fetch(`${API_URL}/api/appointments/${id}/status`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: 'Failed to update status' }))
        throw new Error(data.error ?? 'Failed to update status')
      }

      const updated = await response.json()
      setAppointments((current) => current.map((item) => (item.id === id ? updated : item)))
    } catch (updateError) {
      const message = updateError instanceof Error ? updateError.message : 'Failed to update appointment'
      setError(message)
    }
  }

  const filteredAppointments = appointments.filter(
    (appointment) => filterStatus === 'all' || appointment.status === filterStatus,
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
          <p>Approve, cancel, or complete appointments</p>
        </div>

        {error ? <div className="error-banner">{error}</div> : null}

        <div className="filter-tabs">
          {(['all', 'Pending', 'Approved', 'Completed', 'Cancelled'] as const).map((status) => (
            <button
              key={status}
              className={`tab ${filterStatus === status ? 'active' : ''}`}
              onClick={() => setFilterStatus(status)}
            >
              {status === 'all' ? 'All' : status}
              <span className="count">
                ({appointments.filter((a) => status === 'all' || a.status === status).length})
              </span>
            </button>
          ))}
        </div>

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
                {filteredAppointments.map((appointment) => (
                  <tr key={appointment.id}>
                    <td>{appointment.patientName}</td>
                    <td>{appointment.doctorName}</td>
                    <td>
                      {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                    </td>
                    <td>{appointment.reason}</td>
                    <td className="room-cell">{appointment.room}</td>
                    <td>
                      <span className={`status-badge status-${appointment.status.toLowerCase()}`}>
                        {appointment.status}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <button className="btn-action edit" onClick={() => updateAppointmentStatus(appointment.id, 'Approved')}>
                        Approve
                      </button>
                      <button className="btn-action edit" onClick={() => updateAppointmentStatus(appointment.id, 'Completed')}>
                        Complete
                      </button>
                      <button className="btn-action delete" onClick={() => updateAppointmentStatus(appointment.id, 'Cancelled')}>
                        Cancel
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

        <div className="summary-section">
          <div className="summary-card">
            <h3>Pending</h3>
            <p className="summary-number">{appointments.filter((a) => a.status === 'Pending').length}</p>
          </div>
          <div className="summary-card">
            <h3>Approved</h3>
            <p className="summary-number">{appointments.filter((a) => a.status === 'Approved').length}</p>
          </div>
          <div className="summary-card">
            <h3>Completed</h3>
            <p className="summary-number">{appointments.filter((a) => a.status === 'Completed').length}</p>
          </div>
          <div className="summary-card">
            <h3>Cancelled</h3>
            <p className="summary-number">{appointments.filter((a) => a.status === 'Cancelled').length}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminAppointments
