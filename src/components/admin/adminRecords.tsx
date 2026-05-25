import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import './adminRecords.css'
import AdminNavigation from './adminNavigation'
import { verifyAdminToken } from '../../utils/adminAuth'

const API_URL = import.meta.env.VITE_API_URL ?? ''

type Visit = {
  date: string
  doctor: string
  symptoms?: string
  diagnosis?: string
  medicines?: string[]
  notes?: string
  followUpDate?: string
}

type Prescription = {
  id: string
  doctorName: string
  medicines: string[]
  dosage?: string
  duration?: string
  notes?: string
}

type LabResult = {
  id: string
  testName: string
  filePath?: string | null
  createdAt: number
}

type Certificate = {
  id: string
  issuedBy?: string
  issuedFor: string
  filePath?: string | null
  createdAt: number
}

type PatientRecord = {
  id: string
  patientId: string
  patientName: string
  age?: number | null
  gender?: string
  contactNumber?: string
  faculty?: string
  bloodGroup?: string
  allergies?: string[]
  medicalHistory?: string
  currentMedications?: string[]
  previousTreatments?: string
  vaccinationRecords?: string[]
  visits?: Visit[]
  prescriptions?: Prescription[]
  labResults?: LabResult[]
  certificates?: Certificate[]
  status?: 'Active' | 'Under Review' | 'Completed' | 'Archived'
  createdAt?: number
  updatedAt?: number
}

const AdminRecords = () => {
  const navigate = useNavigate()
  const [records, setRecords] = useState<PatientRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [patientIdSearch, setPatientIdSearch] = useState('')
  const [doctorFilter, setDoctorFilter] = useState('')
  const typeFilterState = useState('')
  const typeFilter = typeFilterState[0]
  const [statusFilter, setStatusFilter] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(12)
  const [selectedRecord, setSelectedRecord] = useState<PatientRecord | null>(null)

  useEffect(() => {
    const init = async () => {
      try {
        const admin = await verifyAdminToken()
        if (!admin) {
          navigate('/admin/login')
          return
        }
        await loadRecords()
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [navigate])

  const buildQuery = () => {
    const params = new URLSearchParams()
    if (patientIdSearch) params.set('patientId', patientIdSearch)
    if (search) params.set('patientName', search)
    if (doctorFilter) params.set('doctor', doctorFilter)
    if (statusFilter) params.set('status', statusFilter)
    if (fromDate) params.set('fromDate', fromDate)
    if (toDate) params.set('toDate', toDate)
    return params.toString()
  }

  const loadRecords = async () => {
    try {
      setLoading(true)
      const q = buildQuery()
      const url = q ? `${API_URL}/api/records?${q}` : `${API_URL}/api/records`
      const res = await fetch(url, { credentials: 'include' })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      setRecords(data)
    } catch (err) {
      console.error('Failed to load records', err)
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(() => {
    let items = records.slice()
    if (typeFilter) {
      items = items.filter((r) => (r.labResults || []).some((l) => l.testName?.toLowerCase().includes(typeFilter.toLowerCase())))
    }
    return items
  }, [records, typeFilter])

  const paged = useMemo(() => {
    const start = (page - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, page, pageSize])

  const onSearch = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setPage(1)
    await loadRecords()
  }

  const exportCSV = () => {
    const headers = ['Record ID', 'Patient ID', 'Patient Name', 'Doctor(s)', 'Date', 'Status']
    const rows = filtered.map((r) => [
      r.id,
      r.patientId,
      r.patientName,
      (r.visits || []).map((v) => v.doctor).join('; '),
      r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '',
      r.status ?? '',
    ])

    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c ?? '')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `medical-records-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleView = async (id: string) => {
    try {
      setLoading(true)
      const res = await fetch(`${API_URL}/api/records/${id}`, { credentials: 'include' })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      setSelectedRecord(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this medical record?')) return
    try {
      const res = await fetch(`${API_URL}/api/records/${id}`, { method: 'DELETE', credentials: 'include' })
      if (!res.ok) throw new Error(await res.text())
      await loadRecords()
    } catch (err) {
      console.error(err)
    }
  }

  

  if (loading) {
    return (
      <div className="admin-records-container">
        <AdminNavigation />
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading medical records...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-records-container">
      <AdminNavigation />

      <div className="admin-content">
        <div className="page-header">
          <h1>Medical Records Management</h1>
        </div>

        <form className="filter-tabs" onSubmit={onSearch}>
          <input
            placeholder="Search patient name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="tab"
          />
          <input
            placeholder="Search by Patient ID"
            value={patientIdSearch}
            onChange={(e) => setPatientIdSearch(e.target.value)}
            className="tab"
          />
          <input
            placeholder="Doctor name"
            value={doctorFilter}
            onChange={(e) => setDoctorFilter(e.target.value)}
            className="tab"
          />
          <select className="tab" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Under Review">Under Review</option>
            <option value="Completed">Completed</option>
            <option value="Archived">Archived</option>
          </select>
          <input type="date" className="tab" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          <input type="date" className="tab" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          <button className="tab" type="submit">Apply</button>
          <button type="button" className="tab" onClick={() => { setSearch(''); setPatientIdSearch(''); setDoctorFilter(''); setStatusFilter(''); setFromDate(''); setToDate(''); loadRecords() }}>Reset</button>
        </form>

        {/* Table */}
        <div style={{ marginBottom: 16 }}>
          <button className="tab" onClick={exportCSV}>Export CSV</button>
          <button className="tab" onClick={() => window.print()}>Print</button>
        </div>

        <div className="records-list">
          {paged.length > 0 ? (
            paged.map((r) => (
              <div key={r.id} className="record-item">
                <div className="record-icon">🩺</div>
                <div className="record-content">
                  <div className="record-header">
                    <h3>{r.patientName} — {r.patientId}</h3>
                    <span className={`status-badge status-${(r.status || 'Active').toLowerCase().replace(/ /g, '-')}`}>
                      {r.status}
                    </span>
                  </div>
                  <div className="record-meta">
                    <span>Faculty: {r.faculty || '-'}</span>
                    <span>•</span>
                    <span>Blood Group: {r.bloodGroup || '-'}</span>
                    <span>•</span>
                    <span>Last Visit: {r.visits && r.visits.length ? new Date(r.visits[r.visits.length - 1].date).toLocaleDateString() : '-'}</span>
                  </div>
                </div>
                <div className="record-actions">
                  <button className="btn-view" title="View" onClick={() => handleView(r.id)}>👁️</button>
                  <button className="btn-edit" title="Edit" onClick={() => { setSelectedRecord(r) }}>✏️</button>
                  <a className="btn-download" href={`${API_URL}${(r.labResults && r.labResults[0] && r.labResults[0].filePath) || ''}`} target="_blank" rel="noreferrer">⬇️</a>
                  <button className="btn-delete" title="Delete" onClick={() => handleDelete(r.id)}>🗑️</button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state"><p>No records found.</p></div>
          )}
        </div>

        {/* Pagination */}
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button className="tab" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</button>
          <div className="tab">Page {page}</div>
          <button className="tab" disabled={(page * pageSize) >= filtered.length} onClick={() => setPage((p) => p + 1)}>Next</button>
        </div>

        {/* Stats */}
        <div className="stats-grid" style={{ marginTop: 20 }}>
          <div className="stat-card"><h4>Total Medical Records</h4><p>{records.length}</p></div>
          <div className="stat-card"><h4>Pending Reports</h4><p>{records.filter((r) => r.status === 'Under Review').length}</p></div>
          <div className="stat-card"><h4>Completed Reports</h4><p>{records.filter((r) => r.status === 'Completed').length}</p></div>
          <div className="stat-card"><h4>Total Patients</h4><p>{new Set(records.map((r) => r.patientId)).size}</p></div>
          <div className="stat-card"><h4>Total Lab Tests</h4><p>{records.reduce((acc, r) => acc + (r.labResults ? r.labResults.length : 0), 0)}</p></div>
        </div>

        {/* Detail / Edit Modal (simple inline) */}
        {selectedRecord && (
          <div className="record-item" style={{ marginTop: 20, background: 'var(--admin-surface)', border: '1px solid var(--admin-border)' }}>
            <div style={{ flex: 1 }}>
              <h3>Edit: {selectedRecord.patientName} — {selectedRecord.patientId}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <label>
                  Full Name
                  <input defaultValue={selectedRecord.patientName} />
                </label>
                <label>
                  Contact
                  <input defaultValue={selectedRecord.contactNumber} />
                </label>
                <label>
                  Status
                  <select defaultValue={selectedRecord.status}>
                    <option>Active</option>
                    <option>Under Review</option>
                    <option>Completed</option>
                    <option>Archived</option>
                  </select>
                </label>
              </div>
              <div style={{ marginTop: 12 }}>
                <button className="tab" onClick={() => setSelectedRecord(null)}>Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminRecords
