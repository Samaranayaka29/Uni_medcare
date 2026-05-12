import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './adminDoctors.css'
import AdminNavigation from './adminNavigation'
import { verifyAdminToken } from '../../utils/adminAuth'

type Doctor = {
  id: string
  name: string
  specialization: string
  email: string
  phone: string
  hospital: string
  experience: number
  status: 'available' | 'busy' | 'offline'
}

type DoctorForm = {
  name: string
  specialization: string
  email: string
  phone: string
  hospital: string
  experience: number
  status: 'available' | 'busy' | 'offline'
}

const AdminDoctors = () => {
  const navigate = useNavigate()
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSpec, setFilterSpec] = useState('all')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingDoctorId, setEditingDoctorId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [form, setForm] = useState<DoctorForm>({
    name: '',
    specialization: '',
    email: '',
    phone: '',
    hospital: '',
    experience: 0,
    status: 'available',
  })

  const loadDoctors = async () => {
    const response = await fetch('/api/doctors')

    if (!response.ok) {
      const data = await response.json().catch(() => ({ error: 'Failed to load doctors' }))
      throw new Error(data.error ?? 'Failed to load doctors')
    }

    const data = await response.json()
    setDoctors(data)
  }

  const resetForm = () => {
    setForm({
      name: '',
      specialization: '',
      email: '',
      phone: '',
      hospital: '',
      experience: 0,
      status: 'available',
    })
    setEditingDoctorId(null)
  }

  useEffect(() => {
    const checkAdminAndLoadDoctors = async () => {
      try {
        const admin = await verifyAdminToken()

        if (!admin) {
          navigate('/admin/login')
          return
        }

        await loadDoctors()
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Error loading doctors'
        setError(message)
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

  const onChangeField = <K extends keyof DoctorForm>(key: K, value: DoctorForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const handleCreateOrUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    if (!form.name || !form.specialization || !form.email) {
      setError('Name, specialization, and email are required.')
      return
    }

    setIsSubmitting(true)

    try {
      const endpoint = editingDoctorId ? `/api/doctors/${editingDoctorId}` : '/api/doctors'
      const method = editingDoctorId ? 'PUT' : 'POST'

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: 'Request failed' }))
        throw new Error(data.error ?? 'Request failed')
      }

      await loadDoctors()
      resetForm()
    } catch (apiError) {
      const message = apiError instanceof Error ? apiError.message : 'Failed to save doctor'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (doctor: Doctor) => {
    setEditingDoctorId(doctor.id)
    setForm({
      name: doctor.name,
      specialization: doctor.specialization,
      email: doctor.email,
      phone: doctor.phone,
      hospital: doctor.hospital,
      experience: doctor.experience,
      status: doctor.status,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this doctor?')

    if (!confirmed) {
      return
    }

    setError('')

    try {
      const response = await fetch(`/api/doctors/${id}`, { method: 'DELETE' })

      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: 'Failed to delete doctor' }))
        throw new Error(data.error ?? 'Failed to delete doctor')
      }

      setDoctors((current) => current.filter((doctor) => doctor.id !== id))
      if (editingDoctorId === id) {
        resetForm()
      }
    } catch (apiError) {
      const message = apiError instanceof Error ? apiError.message : 'Failed to delete doctor'
      setError(message)
    }
  }

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
          <button className="btn-add-doctor" onClick={resetForm}>
            + New Doctor
          </button>
        </div>

        {error ? <div className="error-banner">{error}</div> : null}

        <form className="doctor-form" onSubmit={handleCreateOrUpdate}>
          <h2>{editingDoctorId ? 'Edit Doctor' : 'Add Doctor'}</h2>
          <div className="form-grid">
            <input
              type="text"
              placeholder="Doctor name"
              value={form.name}
              onChange={(e) => onChangeField('name', e.target.value)}
            />
            <input
              type="text"
              placeholder="Specialization"
              value={form.specialization}
              onChange={(e) => onChangeField('specialization', e.target.value)}
            />
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => onChangeField('email', e.target.value)}
            />
            <input
              type="text"
              placeholder="Phone"
              value={form.phone}
              onChange={(e) => onChangeField('phone', e.target.value)}
            />
            <input
              type="text"
              placeholder="Hospital"
              value={form.hospital}
              onChange={(e) => onChangeField('hospital', e.target.value)}
            />
            <input
              type="number"
              min={0}
              placeholder="Experience (years)"
              value={form.experience}
              onChange={(e) => onChangeField('experience', Number(e.target.value))}
            />
            <select
              value={form.status}
              onChange={(e) => onChangeField('status', e.target.value as Doctor['status'])}
            >
              <option value="available">Available</option>
              <option value="busy">Busy</option>
              <option value="offline">Offline</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-save" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : editingDoctorId ? 'Update Doctor' : 'Add Doctor'}
            </button>
            {editingDoctorId ? (
              <button type="button" className="btn-cancel" onClick={resetForm}>
                Cancel Edit
              </button>
            ) : null}
          </div>
        </form>

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

        {/* Doctor Table */}
        <div className="doctor-table-wrapper">
          {filteredDoctors.length > 0 ? (
            <table className="doctor-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Specialization</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Hospital</th>
                  <th>Experience</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDoctors.map((doctor) => (
                  <tr key={doctor.id}>
                    <td>{doctor.name}</td>
                    <td>{doctor.specialization}</td>
                    <td>{doctor.email}</td>
                    <td>{doctor.phone || '-'}</td>
                    <td>{doctor.hospital || '-'}</td>
                    <td>{doctor.experience} yrs</td>
                    <td>
                      <span className="doctor-status-badge" data-status={doctor.status}>
                        {doctor.status}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <button className="btn-edit" onClick={() => handleEdit(doctor)}>
                        Edit
                      </button>
                      <button className="btn-delete" onClick={() => handleDelete(doctor.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
