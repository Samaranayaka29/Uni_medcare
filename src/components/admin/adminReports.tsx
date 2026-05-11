import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth } from '../../firebase'
import './adminReports.css'
import AdminNavigation from './adminNavigation'

type ReportType = 'patient-stats' | 'doctor-stats' | 'appointment-stats' | 'revenue'

type Report = {
  id: string
  name: string
  type: ReportType
  generatedDate: string
  status: 'ready' | 'generating'
}

const AdminReports = () => {
  const navigate = useNavigate()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState<string | null>(null)

  useEffect(() => {
    const checkAdminAndLoadReports = async () => {
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
        const mockReports: Report[] = [
          {
            id: 'r1',
            name: 'Patient Statistics - May 2026',
            type: 'patient-stats',
            generatedDate: '2026-05-10',
            status: 'ready',
          },
          {
            id: 'r2',
            name: 'Doctor Performance Report',
            type: 'doctor-stats',
            generatedDate: '2026-05-09',
            status: 'ready',
          },
          {
            id: 'r3',
            name: 'Appointment Analytics',
            type: 'appointment-stats',
            generatedDate: '2026-05-08',
            status: 'ready',
          },
        ]

        setReports(mockReports)
      } catch (error) {
        console.error('Error loading reports:', error)
      } finally {
        setLoading(false)
      }
    }

    checkAdminAndLoadReports()
  }, [navigate])

  const generateReport = (type: ReportType) => {
    const reportId = `r-${Date.now()}`
    setGenerating(reportId)

    // Simulate report generation
    setTimeout(() => {
      const newReport: Report = {
        id: reportId,
        name: getReportName(type),
        type,
        generatedDate: new Date().toISOString().split('T')[0],
        status: 'ready',
      }
      setReports([newReport, ...reports])
      setGenerating(null)
    }, 2000)
  }

  const getReportName = (type: ReportType): string => {
    const names = {
      'patient-stats': 'Patient Statistics Report',
      'doctor-stats': 'Doctor Performance Report',
      'appointment-stats': 'Appointment Analytics Report',
      revenue: 'Revenue Report',
    }
    return names[type]
  }

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
          <h1>Reports & Analytics</h1>
          <p>Generate and view system reports</p>
        </div>

        {/* Quick Generate Section */}
        <div className="quick-generate-section">
          <h2>Generate New Report</h2>
          <div className="generate-buttons">
            <button
              className="generate-btn"
              onClick={() => generateReport('patient-stats')}
              disabled={generating !== null}
            >
              <span className="icon">👥</span>
              <span>Patient Statistics</span>
            </button>
            <button
              className="generate-btn"
              onClick={() => generateReport('doctor-stats')}
              disabled={generating !== null}
            >
              <span className="icon">👨‍⚕️</span>
              <span>Doctor Performance</span>
            </button>
            <button
              className="generate-btn"
              onClick={() => generateReport('appointment-stats')}
              disabled={generating !== null}
            >
              <span className="icon">📅</span>
              <span>Appointments</span>
            </button>
            <button
              className="generate-btn"
              onClick={() => generateReport('revenue')}
              disabled={generating !== null}
            >
              <span className="icon">💰</span>
              <span>Revenue</span>
            </button>
          </div>
          {generating && (
            <p className="generating-message">
              ⏳ Report is generating, please wait...
            </p>
          )}
        </div>

        {/* Reports List */}
        <div className="reports-section">
          <h2>Available Reports</h2>
          <div className="reports-list">
            {reports.length > 0 ? (
              reports.map((report) => (
                <div key={report.id} className="report-item">
                  <div className="report-icon">📄</div>
                  <div className="report-details">
                    <h3>{report.name}</h3>
                    <p>Generated on {new Date(report.generatedDate).toLocaleDateString()}</p>
                  </div>
                  <div className="report-status">
                    <span className={`status-badge status-${report.status}`}>
                      {report.status}
                    </span>
                  </div>
                  <div className="report-actions">
                    <button className="btn-view" title="View">
                      👁️
                    </button>
                    <button className="btn-download" title="Download">
                      ⬇️
                    </button>
                    <button className="btn-share" title="Share">
                      📤
                    </button>
                    <button className="btn-delete" title="Delete">
                      🗑️
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>No reports generated yet. Generate your first report above.</p>
              </div>
            )}
          </div>
        </div>

        {/* Report Templates */}
        <div className="templates-section">
          <h2>Report Templates</h2>
          <div className="templates-grid">
            <div className="template-card">
              <h3>📊 System Overview</h3>
              <p>Get a complete overview of system metrics</p>
              <button className="btn-use-template">Use Template</button>
            </div>
            <div className="template-card">
              <h3>👥 User Demographics</h3>
              <p>Detailed user statistics and demographics</p>
              <button className="btn-use-template">Use Template</button>
            </div>
            <div className="template-card">
              <h3>📈 Performance Trends</h3>
              <p>Analyze performance trends over time</p>
              <button className="btn-use-template">Use Template</button>
            </div>
            <div className="template-card">
              <h3>💼 Business Intelligence</h3>
              <p>Revenue and operational metrics</p>
              <button className="btn-use-template">Use Template</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminReports
