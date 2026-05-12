import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './adminRecords.css'
import AdminNavigation from './adminNavigation'
import { verifyAdminToken } from '../../utils/adminAuth'

type MedicalRecord = {
  id: string
  patientName: string
  recordType: 'lab' | 'imaging' | 'prescription' | 'diagnosis'
  date: string
  description: string
  doctor: string
  status: 'complete' | 'pending'
}

const AdminRecords = () => {
  const navigate = useNavigate()
  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState<'all' | 'lab' | 'imaging' | 'prescription' | 'diagnosis'>('all')

  useEffect(() => {
    const checkAdminAndLoadRecords = async () => {
      try {
        const admin = await verifyAdminToken()

        if (!admin) {
          navigate('/admin/login')
          return
        }

        // Mock data
        const mockRecords: MedicalRecord[] = [
          {
            id: 'rec1',
            patientName: 'John Doe',
            recordType: 'lab',
            date: '2026-05-10',
            description: 'Blood Test Report',
            doctor: 'Dr. Sarah Smith',
            status: 'complete',
          },
          {
            id: 'rec2',
            patientName: 'Jane Wilson',
            recordType: 'imaging',
            date: '2026-05-09',
            description: 'CT Scan - Chest',
            doctor: 'Dr. Michael Brown',
            status: 'complete',
          },
          {
            id: 'rec3',
            patientName: 'Alex Johnson',
            recordType: 'prescription',
            date: '2026-05-08',
            description: 'Antibiotic Prescription',
            doctor: 'Dr. Emily Davis',
            status: 'complete',
          },
          {
            id: 'rec4',
            patientName: 'Sarah Chen',
            recordType: 'diagnosis',
            date: '2026-05-07',
            description: 'Hypertension Diagnosis',
            doctor: 'Dr. Sarah Smith',
            status: 'pending',
          },
        ]

        setRecords(mockRecords)
      } catch (error) {
        console.error('Error loading records:', error)
      } finally {
        setLoading(false)
      }
    }

    checkAdminAndLoadRecords()
  }, [navigate])

  const filteredRecords = records.filter(
    (record) => filterType === 'all' || record.recordType === filterType
  )

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

        {/* Filter Tabs */}
        <div className="filter-tabs">
          {(['all', 'lab', 'imaging', 'prescription', 'diagnosis'] as const).map((type) => (
            <button
              key={type}
              className={`tab ${filterType === type ? 'active' : ''}`}
              onClick={() => setFilterType(type)}
            >
              {type === 'all' ? 'All Records' : type.charAt(0).toUpperCase() + type.slice(1)}
              <span className="count">
                ({records.filter((r) => type === 'all' || r.recordType === type).length})
              </span>
            </button>
          ))}
        </div>

        {/* Records List */}
        <div className="records-list">
          {filteredRecords.length > 0 ? (
            filteredRecords.map((record) => (
              <div key={record.id} className="record-item">
                <div className="record-icon">
                  {record.recordType === 'lab' && '🧪'}
                  {record.recordType === 'imaging' && '📷'}
                  {record.recordType === 'prescription' && '💊'}
                  {record.recordType === 'diagnosis' && '📋'}
                </div>

                <div className="record-content">
                  <div className="record-header">
                    <h3>{record.description}</h3>
                    <span className={`status-badge status-${record.status}`}>
                      {record.status}
                    </span>
                  </div>
                  <div className="record-meta">
                    <span>Patient: {record.patientName}</span>
                    <span>•</span>
                    <span>Doctor: {record.doctor}</span>
                    <span>•</span>
                    <span>{new Date(record.date).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="record-actions">
                  <button className="btn-view" title="View">
                    👁️
                  </button>
                  <button className="btn-edit" title="Edit">
                    ✏️
                  </button>
                  <button className="btn-download" title="Download">
                    ⬇️
                  </button>
                  <button className="btn-delete" title="Delete">
                    🗑️
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <p>No medical records found.</p>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <h4>📊 Total Records</h4>
            <p>{records.length}</p>
          </div>
          <div className="stat-card">
            <h4>✅ Complete</h4>
            <p>{records.filter((r) => r.status === 'complete').length}</p>
          </div>
          <div className="stat-card">
            <h4>⏳ Pending</h4>
            <p>{records.filter((r) => r.status === 'pending').length}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminRecords
