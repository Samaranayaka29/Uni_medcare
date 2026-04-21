import { useMemo, useState } from 'react'
import { NavLink } from 'react-router-dom'
import './medicalrecords.css'

type Role = 'Doctor' | 'Admin' | 'Nurse'
type VisitStatus = 'Completed' | 'Pending'
type Severity = 'Low' | 'Moderate' | 'High'
type Department = 'General' | 'Dental' | 'Counseling' | 'Cardiology'

type VisitRecord = {
  id: string
  date: string
  doctor: string
  reason: string
  department: Department
  status: VisitStatus
  diagnosis: string
  symptoms: string
  doctorNotes: string
  severity: Severity
  medications: Array<{ name: string; dosage: string; duration: string; instructions: string }>
  tests: Array<{ id: string; name: string; date: string; summary: string; fileLabel: string }>
}

type FileItem = { id: string; name: string; type: 'Report' | 'Prescription' | 'Scan'; url: string }

type PatientProfile = {
  fullName: string
  id: string
  age: number
  dob: string
  gender: string
  contactNumber: string
  address: string
  emergencyContact: string
  previousIllnesses: string[]
  surgeries: string[]
  allergies: string[]
  chronicDiseases: string[]
  treatmentPlan: string
  nextAppointmentDate: string
}

const patient: PatientProfile = {
  fullName: 'Nimal Perera',
  id: 'STF-2026-0911',
  age: 26,
  dob: '2000-02-11',
  gender: 'Male',
  contactNumber: '+94 77 345 1290',
  address: 'No 17, Lake Road, Colombo 05',
  emergencyContact: 'Lakshmi Perera (+94 71 602 7722)',
  previousIllnesses: ['Seasonal bronchitis', 'Gastritis'],
  surgeries: ['Appendectomy (2019)'],
  allergies: ['Penicillin'],
  chronicDiseases: ['Mild asthma'],
  treatmentPlan: 'Continue inhaler use for 6 weeks and complete cardio stress program.',
  nextAppointmentDate: '2026-04-05',
}

const initialVisits: VisitRecord[] = [
  {
    id: 'v1',
    date: '2026-03-20',
    doctor: 'Dr. Sarah Jenkins',
    reason: 'Recurring chest discomfort',
    department: 'Cardiology',
    status: 'Pending',
    diagnosis: 'Cardiac stress follow-up',
    symptoms: 'Chest tightness, intermittent dizziness, elevated pulse',
    doctorNotes: 'Needs repeat ECG and reduced physical workload for one week.',
    severity: 'High',
    medications: [
      {
        name: 'Metoprolol',
        dosage: '25mg',
        duration: '14 days',
        instructions: 'Take after breakfast',
      },
      {
        name: 'Aspirin',
        dosage: '75mg',
        duration: '30 days',
        instructions: 'Take once at night',
      },
    ],
    tests: [
      {
        id: 't1',
        name: 'ECG',
        date: '2026-03-20',
        summary: 'Minor ST changes, further observation needed',
        fileLabel: 'ecg-report.pdf',
      },
      {
        id: 't2',
        name: 'Blood Test',
        date: '2026-03-20',
        summary: 'Cholesterol slightly elevated',
        fileLabel: 'blood-panel.png',
      },
    ],
  },
  {
    id: 'v2',
    date: '2026-02-14',
    doctor: 'Dr. Aris Thorne',
    reason: 'Dental pain and bleeding gums',
    department: 'Dental',
    status: 'Completed',
    diagnosis: 'Early gingivitis',
    symptoms: 'Gum swelling, pain while chewing',
    doctorNotes: 'Advised oral hygiene routine and 3-month cleaning review.',
    severity: 'Moderate',
    medications: [
      {
        name: 'Chlorhexidine mouthwash',
        dosage: '15ml',
        duration: '10 days',
        instructions: 'Use after meals twice daily',
      },
    ],
    tests: [
      {
        id: 't3',
        name: 'Dental X-ray',
        date: '2026-02-14',
        summary: 'No root infection found',
        fileLabel: 'dental-xray.pdf',
      },
    ],
  },
  {
    id: 'v3',
    date: '2026-01-07',
    doctor: 'Dr. Kevin Lee',
    reason: 'Stress and sleep disturbance',
    department: 'Counseling',
    status: 'Completed',
    diagnosis: 'Stress-related insomnia',
    symptoms: 'Difficulty sleeping, daytime fatigue',
    doctorNotes: 'Weekly breathing exercises and counseling follow-up.',
    severity: 'Low',
    medications: [
      {
        name: 'Melatonin',
        dosage: '3mg',
        duration: '21 days',
        instructions: 'Take 30 minutes before bed',
      },
    ],
    tests: [
      {
        id: 't4',
        name: 'Sleep Assessment',
        date: '2026-01-07',
        summary: 'Improvement expected with behavioral plan',
        fileLabel: 'sleep-assessment.pdf',
      },
    ],
  },
]

const initialDocuments: FileItem[] = [
  { id: 'f1', name: 'cardiology-summary.pdf', type: 'Report', url: '#' },
  { id: 'f2', name: 'prescription-mar-20.pdf', type: 'Prescription', url: '#' },
  { id: 'f3', name: 'xray-feb-14.png', type: 'Scan', url: '#' },
]

const Icon = ({ name }: { name: 'menu' | 'shield' }) => {
  if (name === 'menu') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 6.5h16M4 12h16M4 17.5h16" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3.8 18.5 6v5.8c0 4.1-2.6 7.4-6.5 8.5-3.9-1.1-6.5-4.4-6.5-8.5V6L12 3.8Z" />
    </svg>
  )
}

const MedicalRecords = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [role, setRole] = useState<Role>('Doctor')
  const [darkMode, setDarkMode] = useState(false)
  const [twoFactor, setTwoFactor] = useState(true)
  const [visits, setVisits] = useState<VisitRecord[]>(initialVisits)
  const [selectedVisitId, setSelectedVisitId] = useState(initialVisits[0].id)
  const [documents, setDocuments] = useState<FileItem[]>(initialDocuments)
  const [doctorNoteInput, setDoctorNoteInput] = useState('')
  const [reminderEnabled, setReminderEnabled] = useState(true)
  const [notification, setNotification] = useState('')

  const selectedVisit = useMemo(
    () => visits.find((visit) => visit.id === selectedVisitId) ?? visits[0],
    [selectedVisitId, visits],
  )

  const severityScore = (severity: Severity) => {
    if (severity === 'High') return 90
    if (severity === 'Moderate') return 62
    return 35
  }

  const canEdit = role === 'Doctor' || role === 'Admin'

  const addDoctorNote = () => {
    const note = doctorNoteInput.trim()
    if (!note) {
      return
    }

    if (!canEdit) {
      setNotification('Student role has view-only access for doctor notes.')
      return
    }

    setVisits((prev) =>
      prev.map((visit) =>
        visit.id === selectedVisit.id
          ? {
              ...visit,
              doctorNotes: `${visit.doctorNotes} ${note}`,
            }
          : visit,
      ),
    )
    setDoctorNoteInput('')
    setNotification('Doctor note added successfully.')
  }

  const uploadAttachments = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    if (files.length === 0) {
      return
    }

    const newFiles: FileItem[] = files.map((file) => ({
      id: `f-${Date.now()}-${file.name}`,
      name: file.name,
      type: file.type.includes('image') ? 'Scan' : file.name.includes('prescription') ? 'Prescription' : 'Report',
      url: URL.createObjectURL(file),
    }))

    setDocuments((prev) => [...newFiles, ...prev])
    setNotification('Document uploaded successfully.')
  }

  const markVisitCompleted = () => {
    if (!canEdit) {
      setNotification('Student role cannot modify visit status.')
      return
    }

    setVisits((prev) =>
      prev.map((visit) => (visit.id === selectedVisit.id ? { ...visit, status: 'Completed' } : visit)),
    )
    setNotification('Visit status updated to Completed.')
  }

  const printRecord = () => {
    window.print()
  }

  const downloadRecord = () => {
    const payload = {
      patient,
      visits,
      documents,
      exportedAt: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const href = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = href
    link.download = `medical-record-${patient.id}.json`
    link.click()
    URL.revokeObjectURL(href)
    setNotification('Record downloaded successfully.')
  }

  const timelineItems = [...visits].sort((a, b) => (a.date < b.date ? 1 : -1))

  return (
    <div className={`records-page ${darkMode ? 'dark' : ''}`}>
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-head">
          <button className="icon-btn" type="button" onClick={() => setSidebarCollapsed((prev) => !prev)}>
            <Icon name="menu" />
          </button>
          {!sidebarCollapsed && (
            <div>
              <h1>Clinical Precision</h1>
              <p>Modern Medical System</p>
            </div>
          )}
        </div>

        <nav className="side-nav" aria-label="Primary navigation">
          <NavLink to="/dashboard">
            <span className="dot" aria-hidden="true" />
            {!sidebarCollapsed && 'Dashboard'}
          </NavLink>
          <NavLink to="/appointments">
            <span className="dot" aria-hidden="true" />
            {!sidebarCollapsed && 'Appointments'}
          </NavLink>
          <NavLink to="/medical-records">
            <span className="dot" aria-hidden="true" />
            {!sidebarCollapsed && 'Medical Records'}
          </NavLink>
          <NavLink to="/logout">
            <span className="dot" aria-hidden="true" />
            {!sidebarCollapsed && 'Logout'}
          </NavLink>
        </nav>

        {!sidebarCollapsed && (
          <div className="security-card">
            <h3>
              <Icon name="shield" /> Security
            </h3>
            <label>
              Role Based Access
              <select value={role} onChange={(event) => setRole(event.target.value as Role)}>
                <option>Admin</option>
                <option>Doctor</option>
                <option>Nurse</option>
              </select>
            </label>

            <label className="toggle-row">
              Two-factor authentication
              <input
                type="checkbox"
                checked={twoFactor}
                onChange={(event) => setTwoFactor(event.target.checked)}
              />
            </label>

            <p>
              View/Edit: {role === 'Nurse' ? 'View only' : 'View and edit'}
            </p>

            <button type="button" onClick={() => setDarkMode((prev) => !prev)}>
              {darkMode ? 'Light mode' : 'Dark mode'}
            </button>
          </div>
        )}
      </aside>

      <main className="records-main">
        <header className="records-header">
          <div>
            <p className="crumb">Home &gt; Medical Records</p>
            <h1>Medical Records</h1>
            <p>Complete clinical record for student and staff health management.</p>
          </div>
          <div className="header-actions">
            <button type="button" onClick={printRecord}>
              Print Records
            </button>
            <button type="button" onClick={downloadRecord}>
              Download Records
            </button>
          </div>
        </header>

        {notification && <section className="notification">{notification}</section>}

        <section className="content-grid">
          <article className="card patient-info">
            <h2>1. Patient Information</h2>
            <div className="info-grid">
              <p>
                <span>Full Name</span>
                {patient.fullName}
              </p>
              <p>
                <span>Student/Staff ID</span>
                {patient.id}
              </p>
              <p>
                <span>Age / Date of Birth</span>
                {patient.age} / {patient.dob}
              </p>
              <p>
                <span>Gender</span>
                {patient.gender}
              </p>
              <p>
                <span>Contact Number</span>
                {patient.contactNumber}
              </p>
              <p>
                <span>Address</span>
                {patient.address}
              </p>
              <p>
                <span>Emergency Contact</span>
                {patient.emergencyContact}
              </p>
            </div>
          </article>

          <article className="card history-panel">
            <h2>2. Visit and Appointment History</h2>
            <div className="history-list">
              {timelineItems.map((visit) => (
                <button
                  type="button"
                  key={visit.id}
                  className={`history-item ${visit.id === selectedVisit.id ? 'active' : ''}`}
                  onClick={() => setSelectedVisitId(visit.id)}
                >
                  <div>
                    <p>{visit.date}</p>
                    <h3>{visit.reason}</h3>
                    <small>
                      {visit.doctor} | {visit.department}
                    </small>
                  </div>
                  <span className={`status ${visit.status === 'Completed' ? 'ok' : 'wait'}`}>{visit.status}</span>
                </button>
              ))}
            </div>
          </article>

          <article className="card diagnosis-panel">
            <h2>3. Diagnosis Details</h2>
            <div className="diagnosis-box">
              <p>
                <span>Diagnosis name</span>
                {selectedVisit.diagnosis}
              </p>
              <p>
                <span>Symptoms</span>
                {selectedVisit.symptoms}
              </p>
              <p>
                <span>Doctor notes</span>
                {selectedVisit.doctorNotes}
              </p>
              <p>
                <span>Severity level</span>
                <b>{selectedVisit.severity}</b>
              </p>
              <div className="severity-meter">
                <div style={{ width: `${severityScore(selectedVisit.severity)}%` }} />
              </div>
            </div>
          </article>

          <article className="card medication-panel">
            <h2>4. Prescription and Medication</h2>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Medicine</th>
                    <th>Dosage</th>
                    <th>Duration</th>
                    <th>Instructions</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedVisit.medications.map((med) => (
                    <tr key={med.name}>
                      <td>{med.name}</td>
                      <td>{med.dosage}</td>
                      <td>{med.duration}</td>
                      <td>{med.instructions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article className="card lab-panel">
            <h2>5. Lab Test Results</h2>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Test Name</th>
                    <th>Date</th>
                    <th>Result Summary</th>
                    <th>File</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedVisit.tests.map((test) => (
                    <tr key={test.id}>
                      <td>{test.name}</td>
                      <td>{test.date}</td>
                      <td>{test.summary}</td>
                      <td>{test.fileLabel}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <label className="upload-box">
              Upload test file (PDF/Image)
              <input type="file" accept=".pdf,image/*" onChange={uploadAttachments} />
            </label>
          </article>

          <article className="card med-history-panel">
            <h2>6. Medical History</h2>
            <div className="pill-list">
              <div>
                <span>Previous illnesses</span>
                <p>{patient.previousIllnesses.join(', ')}</p>
              </div>
              <div>
                <span>Surgeries</span>
                <p>{patient.surgeries.join(', ')}</p>
              </div>
              <div>
                <span>Allergies</span>
                <p>{patient.allergies.join(', ')}</p>
              </div>
              <div>
                <span>Chronic diseases</span>
                <p>{patient.chronicDiseases.join(', ')}</p>
              </div>
            </div>
          </article>

          <article className="card docs-panel">
            <h2>7. Documents and Attachments</h2>
            <ul>
              {documents.map((doc) => (
                <li key={doc.id}>
                  <span>{doc.type}</span>
                  <p>{doc.name}</p>
                </li>
              ))}
            </ul>
          </article>

          <article className="card notes-panel">
            <h2>8. Doctor Notes</h2>
            <p>{selectedVisit.doctorNotes}</p>
            <label>
              Add observation / recommendation / follow-up advice
              <textarea
                value={doctorNoteInput}
                onChange={(event) => setDoctorNoteInput(event.target.value)}
                placeholder="Write private doctor note"
              />
            </label>
            <div className="notes-actions">
              <button type="button" onClick={addDoctorNote}>
                Save Note
              </button>
              <button type="button" onClick={markVisitCompleted}>
                Mark Visit Completed
              </button>
            </div>
          </article>

          <article className="card followup-panel">
            <h2>9. Follow-up and Reminders</h2>
            <p>
              <span>Next appointment</span>
              {patient.nextAppointmentDate}
            </p>
            <p>
              <span>Treatment plan</span>
              {patient.treatmentPlan}
            </p>
            <label className="toggle-row">
              Reminder notifications
              <input
                type="checkbox"
                checked={reminderEnabled}
                onChange={(event) => {
                  setReminderEnabled(event.target.checked)
                  setNotification(
                    event.target.checked ? 'Reminder notifications enabled.' : 'Reminder notifications disabled.',
                  )
                }}
              />
            </label>
          </article>

          <article className="card timeline-panel">
            <h2>Timeline View</h2>
            <div className="timeline-track">
              {timelineItems.map((visit) => (
                <div key={`line-${visit.id}`} className="timeline-node">
                  <strong>{visit.date}</strong>
                  <p>{visit.reason}</p>
                  <small>{visit.department}</small>
                </div>
              ))}
            </div>
          </article>
        </section>
      </main>
    </div>
  )
}

export default MedicalRecords
