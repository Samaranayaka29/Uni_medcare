import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth } from '../../firebase'
import './adminDoctors.css'
import AdminNavigation from './adminNavigation'

type Doctor = {
  id: string
  name: string
  specialization: string
  email: string
  phone: string
  hospital: string
  experience: number
  status: 'available' | 'busy' | 'offline'
  patients: number
  rating: number
  joinDate: string
}

const AdminDoctors = () => {
  const navigate = useNavigate()
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSpec, setFilterSpec] = useState('all')

  useEffect(() => {
    const checkAdminAndLoadDoctors = async () => {
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
        const mockDoctors: Doctor[] = [
          {
            id: 'd1',
            name: 'Dr. Sarah Smith',
            specialization: 'Cardiology',
            email: 'sarah@hospital.com',
            phone: '+1-555-0201',
            hospital: 'Medical Center',
            experience: 12,
            status: 'available',
            patients: 45,
            rating: 4.8,
            joinDate: '2025-06-15',
          },
          {
            id: 'd2',
            name: 'Dr. Michael Brown',
            specialization: 'Neurology',
            email: 'michael@hospital.com',
            phone: '+1-555-0202',
            hospital: 'Medical Center',
            experience: 15,
            status: 'busy',
            patients: 38,
            rating: 4.7,
            joinDate: '2025-05-20',
          },
          {
            id: 'd3',
            name: 'Dr. Emily Davis',
            specialization: 'Pediatrics',
            email: 'emily@hospital.com',
            phone: '+1-555-0203',
            hospital: 'Children Hospital',
            experience: 8,
            status: 'available',
            patients: 52,
            rating: 4.9,
            joinDate: '2025-08-10',
          },
          {
            id: 'd4',
            name: 'Dr. James Wilson',
            specialization: 'Orthopedics',
            email: 'james@hospital.com',
            phone: '+1-555-0204',
            hospital: 'Medical Center',
            experience: 10,
            status: 'offline',
            patients: 28,
            rating: 4.6,
            joinDate: '2025-07-05',
          },
        ]

        setDoctors(mockDoctors)
      } catch (error) {
        console.error('Error loading doctors:', error)
      } finally {
        setLoading(false)
      }
    }

    checkAdminAndLoadDoctors()
  }, [navigate])

  const specializations = ['all', ...new Set(doctors.map((d) => d.specialization))]

  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch =
      doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSpec = filterSpec === 'all' || doctor.specialization === filterSpec
    return matchesSearch && matchesSpec
  })

  if (loading) {
    return (
      <div className="admin-doctors-container">
        <AdminNavigation />
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading doctors...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-doctors-container">
      <AdminNavigation />

      <div className="admin-content">
        <div className="page-header">
          <h1>Doctor Management</h1>
          <button className="btn-add-doctor" onClick={() => navigate('/admin/add-doctor')}>
            + Add Doctor
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

          <div className="spec-filter">
            <label>Specialization:</label>
            <select value={filterSpec} onChange={(e) => setFilterSpec(e.target.value)}>
              {specializations.map((spec) => (
                <option key={spec} value={spec}>
                  {spec === 'all' ? 'All Specializations' : spec}
                </option>
              ))}
            </select>
          </div>

          <div className="results-info">Showing {filteredDoctors.length} doctors</div>
        </div>

        {/* Doctors Grid */}
        <div className="doctors-grid">
          {filteredDoctors.length > 0 ? (
            filteredDoctors.map((doctor) => (
              <div key={doctor.id} className="doctor-card">
                <div className="doctor-header">
                  <div className="doctor-avatar">
                    {doctor.name.charAt(0)}
                  </div>
                  <div className="doctor-status-badge" data-status={doctor.status}>
                    {doctor.status}
                  </div>
                </div>

                <div className="doctor-body">
                  <h3>{doctor.name}</h3>
                  <p className="specialization">{doctor.specialization}</p>

                  <div className="doctor-info">
                    <div className="info-item">
                      <span className="icon">📧</span>
                      <span className="value">{doctor.email}</span>
                    </div>
                    <div className="info-item">
                      <span className="icon">📞</span>
                      <span className="value">{doctor.phone}</span>
                    </div>
                    <div className="info-item">
                      <span className="icon">🏥</span>
                      <span className="value">{doctor.hospital}</span>
                    </div>
                  </div>

                  <div className="doctor-stats">
                    <div className="stat">
                      <span className="label">Experience</span>
                      <span className="number">{doctor.experience} yrs</span>
                    </div>
                    <div className="stat">
                      <span className="label">Patients</span>
                      <span className="number">{doctor.patients}</span>
                    </div>
                    <div className="stat">
                      <span className="label">Rating</span>
                      <span className="number">⭐ {doctor.rating}</span>
                    </div>
                  </div>
                </div>

                <div className="doctor-footer">
                  <button
                    className="btn-view"
                    onClick={() => navigate(`/admin/doctor/${doctor.id}`)}
                  >
                    View
                  </button>
                  <button
                    className="btn-edit"
                    onClick={() => navigate(`/admin/edit-doctor/${doctor.id}`)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => {
                      if (confirm('Are you sure?')) {
                        setDoctors(doctors.filter((d) => d.id !== doctor.id))
                      }
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <p>No doctors found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminDoctors
