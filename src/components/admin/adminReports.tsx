import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import './adminReports.css'
import AdminNavigation from './adminNavigation'
import { getAdminToken, verifyAdminToken } from '../../utils/adminAuth'

type Analytics = {
  appointmentStatus: { name: string; count: number }[]
  patientGrowth: { month: string; patients: number }[]
  doctorStatistics: { specialization: string; count: number }[]
}

type BaseRecord = {
  id: string
  patientId: string
  notes?: string
  filePath?: string | null
  createdAt: number
}

type ReportItem = BaseRecord & {
  title: string
}

type PrescriptionItem = BaseRecord & {
  medication: string
  dosage: string
}

type LabResultItem = BaseRecord & {
  testName: string
  result: string
}

type RecordModule = 'report' | 'prescription' | 'lab'

const API_URL = import.meta.env.VITE_API_URL ?? '/api'
const pieColors = ['#1d63d6', '#12b981', '#f59e0b', '#ef4444']

const AdminReports = () => {
  const navigate = useNavigate()
  const [analytics, setAnalytics] = useState<Analytics>({
    appointmentStatus: [],
    patientGrowth: [],
    doctorStatistics: [],
  })
  const [reports, setReports] = useState<ReportItem[]>([])
  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>([])
  const [labResults, setLabResults] = useState<LabResultItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [activeModule, setActiveModule] = useState<RecordModule>('report')
  const [form, setForm] = useState({
    patientId: '',
    title: '',
    medication: '',
    dosage: '',
    testName: '',
    result: '',
    notes: '',
  })
  const [file, setFile] = useState<File | null>(null)

  const authHeaders = () => ({
    Authorization: `Bearer ${getAdminToken() ?? ''}`,
  })

  const loadAnalytics = async () => {
    const response = await fetch(`${API_URL}/api/admin/analytics`, {
      headers: authHeaders(),
    })

    if (!response.ok) {
      const data = await response.json().catch(() => ({ error: 'Failed to load analytics' }))
      throw new Error(data.error ?? 'Failed to load analytics')
    }

    const data = await response.json()
    setAnalytics(data)
  }

  const loadRecords = async () => {
    const [reportsRes, prescriptionsRes, labsRes] = await Promise.all([
      fetch(`${API_URL}/api/records/reports`, { headers: authHeaders() }),
      fetch(`${API_URL}/api/records/prescriptions`, { headers: authHeaders() }),
      fetch(`${API_URL}/api/records/lab-results`, { headers: authHeaders() }),
    ])

    const parse = async (response: Response, label: string) => {
      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: `Failed to load ${label}` }))
        throw new Error(data.error ?? `Failed to load ${label}`)
      }
      return response.json()
    }

    const [reportsData, prescriptionsData, labData] = await Promise.all([
      parse(reportsRes, 'reports'),
      parse(prescriptionsRes, 'prescriptions'),
      parse(labsRes, 'lab results'),
    ])

    setReports(reportsData)
    setPrescriptions(prescriptionsData)
    setLabResults(labData)
  }

  useEffect(() => {
    const init = async () => {
      try {
        const admin = await verifyAdminToken()
        if (!admin) {
          navigate('/admin/login')
          return
        }

        await Promise.all([loadAnalytics(), loadRecords()])
      } catch (loadError) {
        const message = loadError instanceof Error ? loadError.message : 'Error loading records'
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [navigate])

  const submitRecord = async (moduleType: RecordModule) => {
    setError('')
    if (!form.patientId) {
      setError('Patient ID is required.')
      return
    }

    setSubmitting(true)

    try {
      const endpointMap = {
        report: '/api/records/reports',
        prescription: '/api/records/prescriptions',
        lab: '/api/records/lab-results',
      }

      const body = new FormData()
      body.append('patientId', form.patientId)
      body.append('notes', form.notes)

      if (moduleType === 'report') {
        body.append('title', form.title)
      }

      if (moduleType === 'prescription') {
        body.append('medication', form.medication)
        body.append('dosage', form.dosage)
      }

      if (moduleType === 'lab') {
        body.append('testName', form.testName)
        body.append('result', form.result)
      }

      if (file) {
        if (!['application/pdf', 'image/png', 'image/jpeg'].includes(file.type)) {
          throw new Error('Upload PDF, PNG, or JPG files only.')
        }
        if (file.size > 5 * 1024 * 1024) {
          throw new Error('File size must be 5MB or less.')
        }
        body.append('file', file)
      }

      const response = await fetch(`${API_URL}${endpointMap[moduleType]}`, {
        method: 'POST',
        headers: authHeaders(),
        body,
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: 'Failed to create record' }))
        throw new Error(data.error ?? 'Failed to create record')
      }

      await loadRecords()
      setForm({ patientId: '', title: '', medication: '', dosage: '', testName: '', result: '', notes: '' })
      setFile(null)
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : 'Failed to save record'
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  const totalRecords = useMemo(
    () => reports.length + prescriptions.length + labResults.length,
    [reports.length, prescriptions.length, labResults.length],
  )

  if (loading) {
    return (
      <div className="admin-reports-container">
        <AdminNavigation />
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading reports...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-reports-container">
      <AdminNavigation />

      <div className="admin-content">
        <div className="page-header">
          <h1>Reports & Medical Records</h1>
          <p>Manage reports, prescriptions, and lab results</p>
        </div>

        {error ? <div className="error-banner">{error}</div> : null}

        <div className="templates-section">
          <h2>Record Modules</h2>
          <div className="templates-grid">
            <button
              type="button"
              className={`template-card ${activeModule === 'report' ? 'active' : ''}`}
              onClick={() => setActiveModule('report')}
            >
              <h3>Reports</h3>
              <p>Create and upload patient reports.</p>
            </button>
            <button
              type="button"
              className={`template-card ${activeModule === 'prescription' ? 'active' : ''}`}
              onClick={() => setActiveModule('prescription')}
            >
              <h3>Prescriptions</h3>
              <p>Issue medication and dosage records.</p>
            </button>
            <button
              type="button"
              className={`template-card ${activeModule === 'lab' ? 'active' : ''}`}
              onClick={() => setActiveModule('lab')}
            >
              <h3>Lab Results</h3>
              <p>Upload and review lab attachments.</p>
            </button>
          </div>
        </div>

        <div className="quick-generate-section">
          <h2>{activeModule === 'report' ? 'Add Report' : activeModule === 'prescription' ? 'Add Prescription' : 'Add Lab Result'}</h2>
          <div className="record-form-grid">
            <input placeholder="Patient ID" value={form.patientId} onChange={(e) => setForm((current) => ({ ...current, patientId: e.target.value }))} />
            {activeModule === 'report' ? (
              <input placeholder="Report title" value={form.title} onChange={(e) => setForm((current) => ({ ...current, title: e.target.value }))} />
            ) : null}
            {activeModule === 'prescription' ? (
              <>
                <input placeholder="Medication" value={form.medication} onChange={(e) => setForm((current) => ({ ...current, medication: e.target.value }))} />
                <input placeholder="Dosage" value={form.dosage} onChange={(e) => setForm((current) => ({ ...current, dosage: e.target.value }))} />
              </>
            ) : null}
            {activeModule === 'lab' ? (
              <>
                <input placeholder="Test name" value={form.testName} onChange={(e) => setForm((current) => ({ ...current, testName: e.target.value }))} />
                <input placeholder="Result summary" value={form.result} onChange={(e) => setForm((current) => ({ ...current, result: e.target.value }))} />
              </>
            ) : null}
            <input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            <textarea placeholder="Notes" value={form.notes} onChange={(e) => setForm((current) => ({ ...current, notes: e.target.value }))} />
          </div>
          <div className="form-actions">
            <button type="button" className="btn-use-template" onClick={() => submitRecord(activeModule)} disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Record'}
            </button>
          </div>
        </div>

        <div className="analytics-section">
          <h2>Charts & Analytics</h2>
          <div className="charts-grid">
            <div className="chart-card">
              <h3>Appointment Status</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={analytics.appointmentStatus} dataKey="count" nameKey="name" outerRadius={95} label>
                    {analytics.appointmentStatus.map((entry, index) => (
                      <Cell key={`cell-${entry.name}`} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <h3>Patient Growth</h3>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={analytics.patientGrowth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="patients" stroke="#1d63d6" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <h3>Doctor Statistics</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={analytics.doctorStatistics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="specialization" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#12b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="templates-section">
          <h2>Summary</h2>
          <div className="templates-grid">
            <div className="template-card">
              <h3>Total Records</h3>
              <p>{totalRecords}</p>
            </div>
            <div className="template-card">
              <h3>Reports</h3>
              <p>{reports.length}</p>
            </div>
            <div className="template-card">
              <h3>Prescriptions</h3>
              <p>{prescriptions.length}</p>
            </div>
            <div className="template-card">
              <h3>Lab Results</h3>
              <p>{labResults.length}</p>
            </div>
          </div>
        </div>

        <div className="reports-section">
          <h2>Reports</h2>
          <div className="reports-list">
            {reports.map((item) => (
              <div className="report-item" key={item.id}>
                <div className="report-icon">R</div>
                <div className="report-details">
                  <h3>{item.title}</h3>
                  <p>Patient: {item.patientId}</p>
                  <p>{item.notes}</p>
                </div>
                <div className="report-actions">
                  {item.filePath ? (
                    <a className="btn-download" href={`${API_URL}${item.filePath}`} target="_blank" rel="noreferrer">
                      Download
                    </a>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="reports-section">
          <h2>Prescriptions</h2>
          <div className="reports-list">
            {prescriptions.map((item) => (
              <div className="report-item" key={item.id}>
                <div className="report-icon">P</div>
                <div className="report-details">
                  <h3>{item.medication}</h3>
                  <p>Patient: {item.patientId}</p>
                  <p>Dosage: {item.dosage}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="reports-section">
          <h2>Lab Results</h2>
          <div className="reports-list">
            {labResults.map((item) => (
              <div className="report-item" key={item.id}>
                <div className="report-icon">L</div>
                <div className="report-details">
                  <h3>{item.testName}</h3>
                  <p>Patient: {item.patientId}</p>
                  <p>{item.result}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminReports
