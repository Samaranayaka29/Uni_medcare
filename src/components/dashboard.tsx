import { useEffect, useMemo, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import './dashboard.css'
import doctorImg from '../assets/doctor-img1.jpeg'

type Severity = 'critical' | 'pending' | 'stable'
type Role = 'Admin' | 'Doctor' | 'Nurse'
type ViewMode = 'Day' | 'Week' | 'Month'
type NotificationType = 'lab' | 'message' | 'system'
type QuickActionPanel = 'add-patient' | 'book-appointment' | 'history-preview'
type ResourceCategory = 'medicine' | 'equipment'
type ResourceStatus = 'optimal' | 'low' | 'critical'

const notificationTypeLabel: Record<NotificationType, string> = {
  lab: 'Lab Alerts',
  message: 'Messages',
  system: 'System Updates',
}

type Appointment = {
  id: string
  patient: string
  doctor: string
  condition: string
  date: string
  slot: string
  room: string
  severity: Severity
}

type NotificationItem = {
  id: string
  type: NotificationType
  title: string
  detail: string
  time: string
  priority: Severity
  read: boolean
}

type ChatMessage = {
  id: string
  sender: 'doctor' | 'patient' | 'assistant'
  text: string
  time: string
}

type ActivityLog = {
  id: string
  text: string
  time: string
}

type EmergencyAlert = {
  id: string
  patient: string
  condition: string
  timeReported: string
}

type ResourceItem = {
  id: string
  name: string
  category: ResourceCategory
  available: number
  unit: string
  status: ResourceStatus
  updatedAt: string
}

type RegisteredUser = {
  id: string
  name: string
  email: string
  age: number | null
}

type DashboardLocationState = {
  newlyRegistered?: boolean
  backendSyncError?: string
  studentProfile?: {
    firstName: string
    lastName: string
    studentId: string
    faculty: string
    email: string
  }
}

const initialAppointments: Appointment[] = [
  {
    id: 'a1',
    patient: 'Sarah Jenkins',
    doctor: 'Dr. Julian Smith',
    condition: 'Post-op recovery',
    date: '2026-03-23',
    slot: '09:00',
    room: '302',
    severity: 'stable',
  },
  {
    id: 'a2',
    patient: 'Robert Davis',
    doctor: 'Dr. Emily Stone',
    condition: 'Abnormal ECG',
    date: '2026-03-23',
    slot: '10:30',
    room: 'Cardio Lab',
    severity: 'critical',
  },
  {
    id: 'a3',
    patient: 'Maria Garcia',
    doctor: 'Dr. Julian Smith',
    condition: 'Diabetes follow-up',
    date: '2026-03-24',
    slot: '11:30',
    room: 'Telemedicine',
    severity: 'pending',
  },
  {
    id: 'a4',
    patient: 'Noah Thompson',
    doctor: 'Dr. Arya Malik',
    condition: 'Asthma review',
    date: '2026-03-25',
    slot: '14:00',
    room: '204',
    severity: 'stable',
  },
]

const initialNotifications: NotificationItem[] = [
  {
    id: 'n1',
    type: 'lab',
    title: 'Abnormal lab results',
    detail: 'Robert Davis shows elevated Troponin and LDL above threshold.',
    time: '2m ago',
    priority: 'critical',
    read: false,
  },
  {
    id: 'n2',
    type: 'message',
    title: 'New patient message',
    detail: 'Sarah Jenkins: mild dizziness after morning medication.',
    time: '10m ago',
    priority: 'pending',
    read: false,
  },
  {
    id: 'n3',
    type: 'system',
    title: 'System status operational',
    detail: 'All core services healthy. Sync latency under 200ms.',
    time: '25m ago',
    priority: 'stable',
    read: true,
  },
]

const initialMessages: ChatMessage[] = [
  { id: 'm1', sender: 'patient', text: 'Can I move my appointment to afternoon?', time: '09:12' },
  { id: 'm2', sender: 'doctor', text: 'Yes, we can shift to 14:00 today.', time: '09:13' },
]

const inventoryResources: ResourceItem[] = [
  { id: 'r1', name: 'Paracetamol 500mg', category: 'medicine', available: 480, unit: 'tablets', status: 'optimal', updatedAt: '08:45' },
  { id: 'r2', name: 'Amoxicillin 250mg', category: 'medicine', available: 120, unit: 'capsules', status: 'low', updatedAt: '09:05' },
  { id: 'r3', name: 'Insulin Pens', category: 'medicine', available: 38, unit: 'units', status: 'critical', updatedAt: '09:11' },
  { id: 'r4', name: 'ECG Monitor', category: 'equipment', available: 6, unit: 'available', status: 'optimal', updatedAt: '08:52' },
  { id: 'r5', name: 'Portable Oxygen Cylinders', category: 'equipment', available: 2, unit: 'available', status: 'low', updatedAt: '09:01' },
  { id: 'r6', name: 'Wheelchairs', category: 'equipment', available: 9, unit: 'available', status: 'optimal', updatedAt: '08:36' },
]

const Icon = ({ name }: { name: string }) => {
  switch (name) {
    case 'users':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="9" cy="8" r="2.5" />
          <circle cx="15.5" cy="9" r="2" />
          <path d="M4.5 17.8v-.9a3.8 3.8 0 0 1 3.8-3.8h1.3a3.8 3.8 0 0 1 3.8 3.8v.9M13.6 14.4a3.2 3.2 0 0 1 2.4-1h.6a3 3 0 0 1 3 3v1" />
        </svg>
      )
    case 'menu':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 6.5h16M4 12h16M4 17.5h16" />
        </svg>
      )
    case 'sun':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2.5v2.3M12 19.2v2.3M4.8 4.8l1.7 1.7M17.5 17.5l1.7 1.7M2.5 12h2.3M19.2 12h2.3M4.8 19.2l1.7-1.7M17.5 6.5l1.7-1.7" />
        </svg>
      )
    case 'moon':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M18.5 14.5a7.5 7.5 0 1 1-9-9 6.3 6.3 0 1 0 9 9z" />
        </svg>
      )
    case 'search':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="11" cy="11" r="6" />
          <path d="m19 19-3.3-3.3" />
        </svg>
      )
    case 'brain':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M9.5 4.5a3 3 0 0 0-3 3v1.2a2.5 2.5 0 0 0 0 4.6V15a3 3 0 0 0 3 3h1.2M14.5 4.5a3 3 0 0 1 3 3v1.2a2.5 2.5 0 0 1 0 4.6V15a3 3 0 0 1-3 3h-1.2M12 5v14" />
        </svg>
      )
    case 'calendar':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="3" y="4" width="18" height="17" rx="2" />
          <path d="M8 2.8v3.5M16 2.8v3.5M3 9.2h18" />
        </svg>
      )
    case 'video':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="3" y="6" width="12" height="12" rx="2" />
          <path d="M15 10.2 21 7.5v9L15 13.8" />
        </svg>
      )
    case 'chat':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 5h16v10H9l-5 4z" />
        </svg>
      )
    case 'notify':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M15.5 17H8.4c-1.4 0-2.1-1.2-1.3-2.2l.7-.8V10a4.2 4.2 0 1 1 8.4 0v4l.7.8c.8 1 .1 2.2-1.4 2.2z" />
          <path d="M10 18.5a2 2 0 0 0 4 0" />
        </svg>
      )
    case 'asterisk':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 4v16M6.5 7.2l11 9.6M17.5 7.2l-11 9.6M4 12h16" />
        </svg>
      )
    case 'record':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="5" y="4" width="14" height="16" rx="2" />
          <path d="M8.5 9.2h7M8.5 12.2h7M8.5 15.2h5" />
        </svg>
      )
    case 'shield':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 3.8 18.5 6v5.8c0 4.1-2.6 7.4-6.5 8.5-3.9-1.1-6.5-4.4-6.5-8.5V6L12 3.8Z" />
        </svg>
      )
    case 'plus':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 5v14M5 12h14" />
        </svg>
      )
    case 'history':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M3.2 12A8.8 8.8 0 1 0 6 5.4M3.2 4.5V12H10" />
        </svg>
      )
    case 'mic':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="9" y="3" width="6" height="11" rx="3" />
          <path d="M6 10.5a6 6 0 0 0 12 0M12 16.5V21M8.5 21h7" />
        </svg>
      )
    case 'bot':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="4" y="7" width="16" height="11" rx="3" />
          <path d="M12 3v4M8.5 12h.01M15.5 12h.01" />
        </svg>
      )
    default:
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="2" />
        </svg>
      )
  }
}

const severityLabel: Record<Severity, string> = {
  critical: 'Critical',
  pending: 'Pending',
  stable: 'Stable',
}

const slotsByView: Record<ViewMode, string[]> = {
  Day: ['09:00', '10:30', '11:30', '14:00', '15:30'],
  Week: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  Month: ['W1', 'W2', 'W3', 'W4'],
}

const Dashboard = () => {
  const location = useLocation()
  const locationState = location.state as DashboardLocationState | null
  const darkMode = false
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState<Role>('Doctor')
  const [twoFactor, setTwoFactor] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('Day')
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments)
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications)
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [, setActivityLogs] = useState<ActivityLog[]>([
    { id: 'l1', text: 'Dr. Julian Smith viewed Robert Davis records', time: '09:05' },
    { id: 'l2', text: 'Nurse Lee marked lab sample #B220 as delivered', time: '09:16' },
  ])
  const [search, setSearch] = useState('')
  const [chatInput, setChatInput] = useState('')
  const [assistantInput, setAssistantInput] = useState('')
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [activeQuickPanel, setActiveQuickPanel] = useState<QuickActionPanel | null>(null)
  const [newPatientName, setNewPatientName] = useState('')
  const [newPatientDoctor, setNewPatientDoctor] = useState('Dr. Julian Smith')
  const [newPatientCondition, setNewPatientCondition] = useState('')
  const [newPatientSeverity, setNewPatientSeverity] = useState<Severity>('stable')
  const [newPatientDate, setNewPatientDate] = useState('')
  const [bookPatientName, setBookPatientName] = useState('')
  const [bookDoctor, setBookDoctor] = useState('Dr. Julian Smith')
  const [bookCondition, setBookCondition] = useState('')
  const [bookDate, setBookDate] = useState('')
  const [bookSlot, setBookSlot] = useState('09:00')
  const [bookRoom, setBookRoom] = useState('201')
  const [bookSeverity, setBookSeverity] = useState<Severity>('pending')
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([])
  const [isUsersLoading, setIsUsersLoading] = useState(true)

  const studentProfile = locationState?.studentProfile
  const studentName = useMemo(() => {
    if (!studentProfile) {
      return ''
    }

    return `${studentProfile.firstName} ${studentProfile.lastName}`.trim()
  }, [studentProfile])

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 900)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    const interval = window.setInterval(() => {
      setAppointments((prev) =>
        prev.map((item, index) => {
          if (index !== 1) {
            return item
          }
          return {
            ...item,
            severity: item.severity === 'critical' ? 'pending' : 'critical',
          }
        }),
      )

      setNotifications((prev) => [
        {
          id: `n${Date.now()}`,
          type: 'system',
          title: 'Live appointment sync',
          detail: 'Schedule board received new update with no refresh.',
          time: 'Just now',
          priority: 'stable',
          read: false,
        },
        ...prev,
      ])

      setActivityLogs((prev) => [
        {
          id: `l${Date.now()}`,
          text: 'Auto-sync updated appointment priority in real time',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
        ...prev.slice(0, 7),
      ])
    }, 10000)

    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    const fetchRegisteredUsers = async () => {
      try {
        const response = await fetch('/api/users')
        if (!response.ok) {
          throw new Error('Failed to load users from backend API.')
        }

        const data: Array<{ id: string; name?: string; email?: string; age?: number }> = await response.json()
        const users = data.map((item) => {
          console.log(item)

          return {
            id: item.id,
            name: typeof item.name === 'string' ? item.name : 'Unknown user',
            email: typeof item.email === 'string' ? item.email : 'No email',
            age: typeof item.age === 'number' ? item.age : null,
          }
        })

        setRegisteredUsers(users)
      } catch (error) {
        if (error instanceof Error) {
          console.log(error.message)
        }
      } finally {
        setIsUsersLoading(false)
      }
    }

    void fetchRegisteredUsers()
  }, [])

  const filteredAppointments = useMemo(() => {
    return appointments.filter((item) => {
      const q = search.trim().toLowerCase()
      return (
        q.length === 0 ||
        item.patient.toLowerCase().includes(q) ||
        item.condition.toLowerCase().includes(q) ||
        item.doctor.toLowerCase().includes(q)
      )
    })
  }, [appointments, search])

  const doctors = useMemo(() => ['all', ...new Set(appointments.map((item) => item.doctor))], [appointments])

  const unreadCount = notifications.filter((n) => !n.read).length

  const groupedNotifications = useMemo(() => {
    return {
      lab: notifications.filter((item) => item.type === 'lab'),
      message: notifications.filter((item) => item.type === 'message'),
      system: notifications.filter((item) => item.type === 'system'),
    }
  }, [notifications])

  const todayIso = useMemo(() => new Date().toISOString().slice(0, 10), [])

  const upcomingAppointments = useMemo(() => {
    return [...appointments]
      .filter((item) => item.date >= todayIso)
      .sort((a, b) => `${a.date} ${a.slot}`.localeCompare(`${b.date} ${b.slot}`))
      .slice(0, 6)
  }, [appointments, todayIso])

  const patientMessageCount = useMemo(() => messages.filter((item) => item.sender === 'patient').length, [messages])
  const doctorReplyCount = useMemo(() => messages.filter((item) => item.sender === 'doctor').length, [messages])
  const latestMessageTime = messages[messages.length - 1]?.time ?? '--:--'

  const activePatientDirectory = useMemo(() => {
    const seen = new Set<string>()
    return filteredAppointments.filter((item) => {
      if (seen.has(item.patient)) {
        return false
      }
      seen.add(item.patient)
      return true
    })
  }, [filteredAppointments])

  const emergencyInfo = useMemo(() => {
    return filteredAppointments
      .filter((item) => item.severity === 'critical')
      .sort((a, b) => `${a.date} ${a.slot}`.localeCompare(`${b.date} ${b.slot}`))
      .slice(0, 4)
  }, [filteredAppointments])

  const emergencyAlerts = useMemo<EmergencyAlert[]>(() => {
    if (emergencyInfo.length > 0) {
      return emergencyInfo.map((item) => ({
        id: `er-${item.id}`,
        patient: item.patient,
        condition: item.condition,
        timeReported: `${item.date} ${item.slot}`,
      }))
    }

    return [
      {
        id: 'alert-1',
        patient: 'Nora Wilson',
        condition: 'Severe chest pain and shortness of breath',
        timeReported: `${todayIso} 09:18`,
      },
      {
        id: 'alert-2',
        patient: 'Ethan Lee',
        condition: 'Acute allergic reaction during medication round',
        timeReported: `${todayIso} 10:42`,
      },
    ]
  }, [emergencyInfo, todayIso])

  const overviewStats = useMemo(
    () => [
      {
        id: 'total-patients',
        icon: 'users',
        label: 'TOTAL PATIENTS',
        value: '12,482',
        note: '+ 14% this month',
        tone: 'positive',
      },
      {
        id: 'todays-appts',
        icon: 'calendar',
        label: "TODAY'S APPTS",
        value: String(filteredAppointments.length).padStart(2, '0'),
        note: `${Math.max(unreadCount, 1)} Pending confirmation`,
        tone: 'neutral',
      },
      {
        id: 'doctors-duty',
        icon: 'plus',
        label: 'DOCTORS ON-DUTY',
        value: '18',
        note: 'Full capacity',
        tone: 'positive',
      },
      {
        id: 'emergency-cases',
        icon: 'asterisk',
        label: 'EMERGENCY CASES',
        value: String(emergencyAlerts.length).padStart(2, '0'),
        note: 'Action required',
        tone: 'danger',
      },
      {
        id: 'medical-records',
        icon: 'record',
        label: 'MEDICAL RECORDS',
        value: '8.2k',
        note: 'Digitized & Encrypted',
        tone: 'neutral',
      },
    ],
    [emergencyAlerts.length, filteredAppointments.length, unreadCount],
  )

  const addLog = (text: string) => {
    setActivityLogs((prev) => [
      {
        id: `l${Date.now()}`,
        text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
      ...prev.slice(0, 7),
    ])
  }

  const exportCsv = () => {
    const header = 'Patient,Doctor,Condition,Date,Slot,Severity\n'
    const rows = filteredAppointments
      .map((item) => `${item.patient},${item.doctor},${item.condition},${item.date},${item.slot},${item.severity}`)
      .join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'medical-report.csv'
    link.click()
    URL.revokeObjectURL(link.href)
    addLog('Exported report as CSV (Excel compatible)')
  }

  const exportPdf = () => {
    const lines = filteredAppointments
      .map((item) => `${item.patient} | ${item.doctor} | ${item.condition} | ${item.date} ${item.slot}`)
      .join('\n')
    const blob = new Blob([`Clinical Precision Report\n\n${lines}`], { type: 'text/plain;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'medical-report.pdf.txt'
    link.click()
    URL.revokeObjectURL(link.href)
    addLog('Generated printable report draft (PDF export placeholder)')
  }

  const sendChatMessage = () => {
    const message = chatInput.trim()
    if (!message) {
      return
    }
    setMessages((prev) => [
      ...prev,
      {
        id: `m${Date.now()}`,
        sender: 'doctor',
        text: message,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ])
    setChatInput('')
    addLog('Sent quick chat reply to patient')
  }

  const askAssistant = () => {
    const prompt = assistantInput.trim()
    if (!prompt) {
      return
    }
    setMessages((prev) => [
      ...prev,
      {
        id: `m${Date.now()}`,
        sender: 'assistant',
        text: `AI Assistant: Based on current load, schedule follow-up blocks after 15:00 for non-critical patients.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ])
    setAssistantInput('')
    addLog('AI chatbot assistant generated scheduling suggestion')
  }

  const startVoiceInput = () => {
    const hasSpeech = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window
    if (hasSpeech) {
      setChatInput((prev) => `${prev} voice note captured`) 
      addLog('Voice input captured for doctor note')
      return
    }
    setChatInput((prev) => `${prev} voice input unavailable on this browser`) 
    addLog('Voice input requested but browser does not support speech API')
  }

  const quickAddPatient = () => {
    setActiveQuickPanel('add-patient')
    addLog('Quick action: Add Patient opened')
  }

  const quickBook = () => {
    setActiveQuickPanel('book-appointment')
    addLog('Quick action: Book Appointment opened')
  }

  const quickHistory = () => {
    setActiveQuickPanel('history-preview')
    addLog('History preview panel opened')
  }

  const submitAddPatient = () => {
    if (role === 'Nurse') {
      addLog('Permission denied: Nurse cannot add patient records')
      return
    }

    const patient = newPatientName.trim()
    const condition = newPatientCondition.trim()
    if (!patient || !condition) {
      addLog('Add Patient requires patient name and condition')
      return
    }

    const appointment: Appointment = {
      id: `a${Date.now()}`,
      patient,
      doctor: newPatientDoctor,
      condition,
      date: newPatientDate || todayIso,
      slot: '09:00',
      room: 'Intake',
      severity: newPatientSeverity,
    }

    setAppointments((prev) => [appointment, ...prev])
    setNewPatientName('')
    setNewPatientCondition('')
    setNewPatientDate('')
    setNewPatientSeverity('stable')
    setActiveQuickPanel(null)
    addLog(`New patient ${appointment.patient} added and assigned to ${appointment.doctor}`)
  }

  const submitBookAppointment = () => {
    const patient = bookPatientName.trim()
    const condition = bookCondition.trim()
    if (!patient || !condition || !bookDate) {
      addLog('Book Appointment requires patient, condition, and date')
      return
    }

    const appointment: Appointment = {
      id: `a${Date.now()}`,
      patient,
      doctor: bookDoctor,
      condition,
      date: bookDate,
      slot: bookSlot,
      room: bookRoom.trim() || '201',
      severity: bookSeverity,
    }

    setAppointments((prev) => [appointment, ...prev])
    setBookPatientName('')
    setBookCondition('')
    setBookDate('')
    setBookSlot('09:00')
    setBookRoom('201')
    setBookSeverity('pending')
    setActiveQuickPanel(null)
    addLog(`Appointment booked for ${appointment.patient} on ${appointment.date} at ${appointment.slot}`)
  }

  const moveAppointmentToSlot = (id: string, slot: string) => {
    setAppointments((prev) => prev.map((item) => (item.id === id ? { ...item, slot } : item)))
    addLog(`Rescheduled appointment ${id.toUpperCase()} to ${slot}`)
  }

  const replyFromNotification = () => {
    setChatInput('I reviewed your message. Please monitor symptoms and update me in 2 hours.')
    addLog('Quick reply inserted from alerts')
  }

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((item) => (item.id === id ? { ...item, read: true } : item)))
  }

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })))
    addLog('All notifications marked as read')
  }

  const clearReadNotifications = () => {
    setNotifications((prev) => prev.filter((item) => !item.read))
    addLog('Read notifications cleared from notification center')
  }

  const visitsData = [12, 15, 11, 20, 18, 24, 16]
  const maxVisits = Math.max(...visitsData)
  const diseaseData = [
    { name: 'Hypertension', value: 72 },
    { name: 'Diabetes', value: 54 },
    { name: 'Respiratory', value: 39 },
    { name: 'Dermatology', value: 28 },
  ]

  const medicineResources = inventoryResources.filter((item) => item.category === 'medicine')
  const equipmentResources = inventoryResources.filter((item) => item.category === 'equipment')
  const lowStockResources = inventoryResources.filter((item) => item.status === 'low' || item.status === 'critical')

  if (loading) {
    return (
      <div className={`dashboard-page ${darkMode ? 'dark' : ''}`}>
        <div className="skeleton-layout">
          <div className="skeleton sidebar-s" />
          <div className="skeleton block-lg" />
          <div className="skeleton block-md" />
          <div className="skeleton block-md" />
          <div className="skeleton block-lg" />
        </div>
      </div>
    )
  }

  return (
    <div className={`dashboard-page ${darkMode ? 'dark' : ''}`}>
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
          {[
            { label: 'Dashboard', to: '/dashboard' },
            { label: 'Appointments', to: '/appointments' },
            { label: 'Medical Records', to: '/medical-records' },
            { label: 'Logout', to: '/logout' },
          ].map((item) => (
            <NavLink className={({ isActive }) => (isActive ? 'active' : '')} to={item.to} key={item.label}>
              <span className="dot" aria-hidden="true" />
              {!sidebarCollapsed && item.label}
            </NavLink>
          ))}
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
                onChange={(event) => {
                  setTwoFactor(event.target.checked)
                  addLog(`Two-factor authentication ${event.target.checked ? 'enabled' : 'disabled'}`)
                }}
              />
            </label>
          </div>
        )}
      </aside>

      <div className="main-shell">
        <header className="topbar">
          <div className="search-wrap" role="search" aria-label="Search patients, doctors, or conditions">
            <Icon name="search" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search patient, doctor, or condition"
            />
          </div>

          <div className="top-actions">
            <button type="button" className="chip notify-chip" onClick={() => setIsNotificationOpen(true)}>
              <Icon name="notify" />
              Notifications {unreadCount > 0 ? `(${unreadCount})` : ''}
            </button>
          </div>
        </header>

        <section className="overview-strip" aria-label="Hospital overview metrics">
          {overviewStats.map((stat) => (
            <article key={stat.id} className="overview-card">
              <div className="overview-icon" aria-hidden="true">
                <Icon name={stat.icon} />
              </div>
              <p className="overview-label">{stat.label}</p>
              <strong className={`overview-value ${stat.tone}`}>{stat.value}</strong>
              <p className={`overview-note ${stat.tone}`}>{stat.note}</p>
            </article>
          ))}
        </section>

        <main className="dashboard-grid">
          <section className="hero panel">
            <div className="hero-intro">
              <p className="eyebrow">AI HEALTH INSIGHTS</p>
              {locationState?.newlyRegistered && studentProfile && (
                <div className="dashboard-welcome-card" role="status" aria-live="polite">
                  <p>Welcome aboard{studentName ? `, ${studentName}` : ''}.</p>
                  <span>
                    {studentProfile.studentId} | {studentProfile.faculty}
                  </span>
                  <span>{studentProfile.email}</span>
                  {locationState.backendSyncError && <span>{locationState.backendSyncError}</span>}
                </div>
              )}
              <h2 className="hero-title">
                <span>Real-time Clinical</span>
                <span className="hero-title-accent">Intelligence</span>
              </h2>
              <p>24/7 Support, Easy Booking, Qualified Staff, Emergency Care, Student Friendly, Quick Service</p>
              <h2>🏥 Student Health Tips</h2>
    <ul>
        <li>Take care of your body with healthy food, water, sleep, and exercise</li>
        <li>Protect your mental health by relaxing, talking, and asking for help</li>
        <li>Use medical services properly and follow doctor’s advice</li>
        <li>Prevent illness by staying clean and maintaining healthy habits</li>
        <li>Be prepared for emergencies and act quickly when needed</li>
    </ul>
            </div>
            <figure className="hero-photo-wrap" aria-label="Doctor profile image">
              <img src={doctorImg} alt="Smiling doctor in white coat holding a tablet" className="hero-photo" />
            </figure>
          </section>

          <section className="appointments panel">
            <div className="section-head compact">
              <h3>Active Patient Directory</h3>
              <span>{activePatientDirectory.length} active patients</span>
            </div>

            <div className="list">
              {activePatientDirectory.map((item) => (
                <article key={item.id} className="list-row" onClick={() => setSelectedAppointment(item)}>
                  <div>
                    <h4>{item.patient}</h4>
                    <p>
                      {item.condition} • {item.doctor}
                    </p>
                  </div>
                  <div className="right">
                    <span>{item.date}</span>
                    <span>{item.slot}</span>
                    <em className={item.severity}>{severityLabel[item.severity]}</em>
                  </div>
                </article>
              ))}
            </div>

            <div className="action-row">
              <button type="button" onClick={exportPdf}>
                Export PDF
              </button>
              <button type="button" onClick={exportCsv}>
                Export Excel
              </button>
              <button type="button" className="video-btn">
                <Icon name="video" />
                Video Consultation
              </button>
            </div>
          </section>

          <section className="appointments panel">
            <div className="section-head compact">
              <h3>Registered Users (Firestore)</h3>
              <span>{registeredUsers.length} users</span>
            </div>

            {isUsersLoading && <p>Loading users...</p>}

            {!isUsersLoading && registeredUsers.length === 0 && <p>No users found in Firestore.</p>}

            {!isUsersLoading && registeredUsers.length > 0 && (
              <div className="list">
                {registeredUsers.map((user) => (
                  <article key={user.id} className="list-row">
                    <div>
                      <h4>{user.name}</h4>
                      <p>{user.email}</p>
                    </div>
                    <div className="right">
                      <span>{user.age !== null ? `${user.age} yrs` : 'Age N/A'}</span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="schedule panel">
            <div className="section-head">
              <h3>Appointment Calendar (Upcoming Appointments)</h3>
              <div className="view-tabs">
                {(['Day', 'Week', 'Month'] as ViewMode[]).map((mode) => (
                  <button
                    type="button"
                    className={viewMode === mode ? 'active' : ''}
                    onClick={() => setViewMode(mode)}
                    key={mode}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <div className="calendar-lane">
              {slotsByView[viewMode].map((slot) => (
                <div
                  key={slot}
                  className="slot"
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => {
                    if (draggingId) {
                      moveAppointmentToSlot(draggingId, slot)
                      setDraggingId(null)
                    }
                  }}
                >
                  <h4>{slot}</h4>
                  {appointments
                    .filter((item) => item.slot === slot)
                    .map((item) => (
                      <article
                        key={item.id}
                        draggable
                        onDragStart={() => setDraggingId(item.id)}
                        className={`appt-card ${item.severity}`}
                        onClick={() => setSelectedAppointment(item)}
                      >
                        <strong>{item.patient}</strong>
                        <p>{item.condition}</p>
                        <span>
                          {item.room} • {severityLabel[item.severity]}
                        </span>
                      </article>
                    ))}
                </div>
              ))}
            </div>

            <div className="upcoming-strip" aria-label="Upcoming appointments list">
              {upcomingAppointments.map((item) => (
                <article key={`up-${item.id}`} className={`upcoming-item ${item.severity}`}>
                  <strong>{item.patient}</strong>
                  <span>
                    {item.date} at {item.slot}
                  </span>
                  <p>{item.condition}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="patient-comm panel">
            <div className="section-head compact">
              <h3>
                <Icon name="chat" /> Patient Communication
              </h3>
              <span>{todayIso}</span>
            </div>

            <p className="today-subtitle">Live conversation center for patients and clinical team updates.</p>

            <div className="comm-stats" aria-label="Patient communication summary">
              <article>
                <strong>{patientMessageCount}</strong>
                <span>Patient Messages</span>
              </article>
              <article>
                <strong>{doctorReplyCount}</strong>
                <span>Doctor Replies</span>
              </article>
              <article>
                <strong>{latestMessageTime}</strong>
                <span>Last Activity</span>
              </article>
            </div>

            <div className="chat-box patient-chat-box">
              {messages.map((msg) => (
                <div key={msg.id} className={`bubble ${msg.sender}`}>
                  <p>{msg.text}</p>
                  <span>{msg.time}</span>
                </div>
              ))}
            </div>

            <div className="chat-input-row">
              <input
                value={chatInput}
                onChange={(event) => setChatInput(event.target.value)}
                placeholder="Type message to patient"
              />
              <button type="button" onClick={startVoiceInput}>
                <Icon name="mic" />
              </button>
              <button type="button" onClick={sendChatMessage}>
                Send
              </button>
            </div>

            <div className="chat-input-row assistant-row">
              <input
                value={assistantInput}
                onChange={(event) => setAssistantInput(event.target.value)}
                placeholder="Ask AI assistant"
              />
              <button type="button" onClick={askAssistant}>
                <Icon name="bot" />
                Ask
              </button>
            </div>

            <div className="quick-template-row" aria-label="Quick message templates">
              {[
                'Please continue current medication and share updates in 2 hours.',
                'Your appointment has been moved to 14:00 today.',
                'Vitals are stable. Please maintain hydration and rest.',
              ].map((template) => (
                <button
                  key={template}
                  type="button"
                  onClick={() => {
                    setChatInput(template)
                    addLog('Quick communication template inserted')
                  }}
                >
                  {template}
                </button>
              ))}
            </div>
          </section>

          <section className="analytics panel">
            <h3>Analytics and Reports</h3>
            <div className="charts-grid">
              <article>
                <h4>Patient Visits Per Day</h4>
                <div className="bar-chart" aria-label="Patient visits chart">
                  {visitsData.map((value, index) => (
                    <div key={index} className="bar-col">
                      <strong>{value}</strong>
                      <div className="bar" style={{ height: `${Math.max(22, (value / maxVisits) * 100)}%` }} />
                      <span>D{index + 1}</span>
                    </div>
                  ))}
                </div>
              </article>

              <article>
                <h4>Common Diseases</h4>
                <div className="progress-list">
                  {diseaseData.map((item) => (
                    <div key={item.name}>
                      <p>
                        <span>{item.name}</span>
                        <strong>{item.value}%</strong>
                      </p>
                      <div className="track">
                        <div style={{ width: `${item.value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </article>

              <article>
                <h4>Doctor Performance</h4>
                <div className="ring-wrap">
                  <div className="ring" style={{ ['--value' as string]: '78%' }}>
                    <span>78%</span>
                  </div>
                  <svg viewBox="0 0 160 40" className="sparkline" aria-hidden="true">
                    <polyline points="0,30 22,18 40,24 65,12 85,14 110,8 132,11 160,6" />
                  </svg>
                </div>
              </article>
            </div>
          </section>

          <section className="inventory panel">
            <div className="section-head compact">
              <h3>Inventory / Resources</h3>
              <span>{lowStockResources.length} low-stock alerts</span>
            </div>

            <div className="inventory-grid">
              <article className="inventory-card inventory-medicine">
                <h4>Medicine Stock</h4>
                <div className="resource-list">
                  {medicineResources.map((item) => (
                    <div className="resource-item" key={item.id}>
                      <div>
                        <strong>{item.name}</strong>
                        <small>Updated at {item.updatedAt}</small>
                      </div>
                      <span className={`resource-status ${item.status}`}>
                        {item.available} {item.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </article>

              <article className="inventory-card inventory-equipment">
                <h4>Equipment Availability</h4>
                <div className="resource-list">
                  {equipmentResources.map((item) => (
                    <div className="resource-item" key={item.id}>
                      <div>
                        <strong>{item.name}</strong>
                        <small>Updated at {item.updatedAt}</small>
                      </div>
                      <span className={`resource-status ${item.status}`}>
                        {item.available} {item.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </article>

              <article className="inventory-card inventory-alerts">
                <h4>Low Stock Alerts</h4>
                <div className="resource-list">
                  {lowStockResources.map((item) => (
                    <div className="resource-item alert" key={item.id}>
                      <div>
                        <strong>{item.name}</strong>
                        <small>{item.category === 'medicine' ? 'Medicine' : 'Equipment'} • Updated at {item.updatedAt}</small>
                      </div>
                      <span className={`resource-status ${item.status}`}>
                        {item.status === 'critical' ? 'Critical' : 'Low'}
                      </span>
                    </div>
                  ))}
                </div>
              </article>
            </div>
          </section>

          <section className="emergency panel">
            <div className="section-head compact">
              <h3>Emergency Alerts Panel</h3>
              <div className="section-head-actions">
                <button type="button" onClick={replyFromNotification}>
                  Quick Reply From Alerts
                </button>
                <span>{emergencyAlerts.length} active</span>
              </div>
            </div>

            <div className="emergency-alert-list">
              {emergencyAlerts.map((alert) => (
                <article className="emergency-alert-card" key={alert.id}>
                  <div className="emergency-alert-head">
                    <h4>
                      <span className="alert-badge" aria-hidden="true">
                        ⚠️
                      </span>
                      {alert.patient}
                    </h4>
                    <small>{alert.timeReported}</small>
                  </div>
                  <p>{alert.condition}</p>
                  <span>Time reported: {alert.timeReported}</span>
                </article>
              ))}
            </div>
          </section>

        </main>
      </div>

      <div className="floating-actions" aria-label="Quick actions">
        <button type="button" onClick={quickAddPatient}>
          <Icon name="plus" /> Add Patient
        </button>
        <button type="button" onClick={quickBook}>
          <Icon name="calendar" /> Book Appointment
        </button>
        <button type="button" onClick={quickHistory}>
          <Icon name="history" /> History Preview
        </button>
      </div>

      {selectedAppointment && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-card">
            <h3>{selectedAppointment.patient}</h3>
            <p>
              <strong>Condition:</strong> {selectedAppointment.condition}
            </p>
            <p>
              <strong>Doctor:</strong> {selectedAppointment.doctor}
            </p>
            <p>
              <strong>Last notes:</strong> Responding well to treatment, continue current plan and monitor symptoms.
            </p>
            <div className="modal-actions">
              <button type="button" onClick={() => setSelectedAppointment(null)}>
                Close
              </button>
              <button type="button" onClick={() => alert('Full patient record opened (demo)')}>
                Open Full Record
              </button>
            </div>
          </div>
        </div>
      )}

      {isNotificationOpen && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-card notification-modal">
            <h3>Notification Messages</h3>
            <p>See all alerts and messages from lab, patient chat, and system updates.</p>

            <div className="notification-actions">
              <button type="button" onClick={markAllNotificationsAsRead}>
                Mark All Read
              </button>
              <button type="button" onClick={clearReadNotifications}>
                Clear Read
              </button>
            </div>

            {(['lab', 'message', 'system'] as NotificationType[]).map((type) => (
              <div className="notify-group" key={type}>
                <div className="group-head">
                  <strong>{notificationTypeLabel[type]}</strong>
                  <small>{groupedNotifications[type].length}</small>
                </div>

                <div className="group-items">
                  {groupedNotifications[type].length === 0 && <p className="empty-notify">No messages in this section.</p>}

                  {groupedNotifications[type].map((item) => (
                    <article key={item.id} className={`notify-item ${item.priority} ${item.read ? 'read' : ''}`}>
                      <div>
                        <h4>{item.title}</h4>
                        <p>{item.detail}</p>
                        <small>{item.time}</small>
                      </div>
                      {!item.read && (
                        <button type="button" onClick={() => markNotificationAsRead(item.id)}>
                          Mark Read
                        </button>
                      )}
                    </article>
                  ))}
                </div>
              </div>
            ))}

            <div className="modal-actions">
              <button type="button" onClick={() => setIsNotificationOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {activeQuickPanel && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-card quick-action-modal">
            {activeQuickPanel === 'add-patient' && (
              <>
                <h3>Add Patient Details</h3>
                <p>Register a patient and create an intake record instantly.</p>
                <div className="quick-action-form">
                  <label>
                    Patient Name
                    <input
                      type="text"
                      value={newPatientName}
                      onChange={(event) => setNewPatientName(event.target.value)}
                      placeholder="Enter patient full name"
                    />
                  </label>
                  <label>
                    Assigned Doctor
                    <select value={newPatientDoctor} onChange={(event) => setNewPatientDoctor(event.target.value)}>
                      {doctors.filter((item) => item !== 'all').map((doctor) => (
                        <option key={doctor} value={doctor}>
                          {doctor}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Primary Condition
                    <input
                      type="text"
                      value={newPatientCondition}
                      onChange={(event) => setNewPatientCondition(event.target.value)}
                      placeholder="Symptoms or diagnosis"
                    />
                  </label>
                  <div className="quick-action-row">
                    <label>
                      Intake Date
                      <input
                        type="date"
                        value={newPatientDate}
                        onChange={(event) => setNewPatientDate(event.target.value)}
                      />
                    </label>
                    <label>
                      Priority
                      <select
                        value={newPatientSeverity}
                        onChange={(event) => setNewPatientSeverity(event.target.value as Severity)}
                      >
                        <option value="stable">Stable</option>
                        <option value="pending">Pending</option>
                        <option value="critical">Critical</option>
                      </select>
                    </label>
                  </div>
                </div>
                <div className="modal-actions">
                  <button type="button" onClick={() => setActiveQuickPanel(null)}>
                    Cancel
                  </button>
                  <button type="button" onClick={submitAddPatient}>
                    Save Patient
                  </button>
                </div>
              </>
            )}

            {activeQuickPanel === 'book-appointment' && (
              <>
                <h3>Book Appointment Details</h3>
                <p>Create a new appointment with doctor, slot, and severity details.</p>
                <div className="quick-action-form">
                  <label>
                    Patient Name
                    <input
                      type="text"
                      value={bookPatientName}
                      onChange={(event) => setBookPatientName(event.target.value)}
                      placeholder="Enter patient full name"
                    />
                  </label>
                  <label>
                    Doctor
                    <select value={bookDoctor} onChange={(event) => setBookDoctor(event.target.value)}>
                      {doctors.filter((item) => item !== 'all').map((doctor) => (
                        <option key={doctor} value={doctor}>
                          {doctor}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Condition
                    <input
                      type="text"
                      value={bookCondition}
                      onChange={(event) => setBookCondition(event.target.value)}
                      placeholder="Reason for appointment"
                    />
                  </label>
                  <div className="quick-action-row">
                    <label>
                      Date
                      <input type="date" value={bookDate} onChange={(event) => setBookDate(event.target.value)} />
                    </label>
                    <label>
                      Time Slot
                      <select value={bookSlot} onChange={(event) => setBookSlot(event.target.value)}>
                        {slotsByView.Day.map((slot) => (
                          <option key={slot} value={slot}>
                            {slot}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <div className="quick-action-row">
                    <label>
                      Room
                      <input type="text" value={bookRoom} onChange={(event) => setBookRoom(event.target.value)} />
                    </label>
                    <label>
                      Severity
                      <select value={bookSeverity} onChange={(event) => setBookSeverity(event.target.value as Severity)}>
                        <option value="stable">Stable</option>
                        <option value="pending">Pending</option>
                        <option value="critical">Critical</option>
                      </select>
                    </label>
                  </div>
                </div>
                <div className="modal-actions">
                  <button type="button" onClick={() => setActiveQuickPanel(null)}>
                    Cancel
                  </button>
                  <button type="button" onClick={submitBookAppointment}>
                    Confirm Booking
                  </button>
                </div>
              </>
            )}

            {activeQuickPanel === 'history-preview' && (
              <>
                <h3>Patient History Preview</h3>
                <p>Recent appointments and conditions. Click any patient to open details.</p>
                <div className="history-preview-list">
                  {upcomingAppointments.length === 0 && <p>No history records found for current filters.</p>}
                  {upcomingAppointments.map((item) => (
                    <button
                      key={`history-${item.id}`}
                      type="button"
                      className="history-preview-item"
                      onClick={() => {
                        setSelectedAppointment(item)
                        setActiveQuickPanel(null)
                        addLog(`History preview opened for ${item.patient}`)
                      }}
                    >
                      <strong>{item.patient}</strong>
                      <span>
                        {item.date} at {item.slot} • {item.condition}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="modal-actions">
                  <button type="button" onClick={() => setActiveQuickPanel(null)}>
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
