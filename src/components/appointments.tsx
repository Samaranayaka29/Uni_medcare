import { useMemo, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { NavLink } from 'react-router-dom'
import './appointments.css'

type Department = 'General' | 'Dental' | 'Counseling' | 'Cardiology' | 'Pediatrics'

type ServiceType =
  | 'General Consultation'
  | 'Dental Care'
  | 'Laboratory'
  | 'Emergency'
  | 'Specialist Clinics'

type AppointmentType = 'New Patient' | 'Follow-up' | 'Online Consultation'

type Doctor = {
  id: string
  name: string
  specialty: string
  experienceYears: number
  availableDays: string[]
  location: 'City Campus' | 'North Branch' | 'Telemedicine Hub'
  department: Department
  rating: number
  availableSlots: string[]
  availableNow: boolean
  onlineConsultation: boolean
}

type AppointmentStatus = 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed'

type Appointment = {
  id: string
  doctorId: string
  doctorName: string
  department: Department
  date: string
  time: string
  reason: string
  status: AppointmentStatus
}

type Role = 'Admin' | 'Doctor' | 'Nurse'
type NotificationType = 'success' | 'error' | 'info' | 'special'

const doctors: Doctor[] = [
  {
    id: 'd1',
    name: 'Dr. Sarah Jenkins',
    specialty: 'General Physician',
    experienceYears: 12,
    availableDays: ['Mon', 'Tue', 'Thu', 'Fri'],
    location: 'City Campus',
    department: 'General',
    rating: 4.9,
    availableSlots: ['09:00', '10:30', '14:15'],
    availableNow: true,
    onlineConsultation: true,
  },
  {
    id: 'd2',
    name: 'Dr. Aris Thorne',
    specialty: 'Dental Surgeon',
    experienceYears: 9,
    availableDays: ['Tue', 'Wed', 'Fri'],
    location: 'North Branch',
    department: 'Dental',
    rating: 4.8,
    availableSlots: ['11:00', '16:00'],
    availableNow: false,
    onlineConsultation: false,
  },
  {
    id: 'd3',
    name: 'Dr. Kevin Lee',
    specialty: 'Counseling Psychologist',
    experienceYears: 8,
    availableDays: ['Mon', 'Wed', 'Thu', 'Sat'],
    location: 'Telemedicine Hub',
    department: 'Counseling',
    rating: 4.7,
    availableSlots: ['08:45', '12:00', '15:30'],
    availableNow: true,
    onlineConsultation: true,
  },
  {
    id: 'd4',
    name: 'Dr. Mia Patel',
    specialty: 'Cardiology Consultant',
    experienceYears: 15,
    availableDays: ['Mon', 'Tue', 'Thu'],
    location: 'City Campus',
    department: 'Cardiology',
    rating: 4.9,
    availableSlots: ['09:30', '13:15', '17:00'],
    availableNow: true,
    onlineConsultation: true,
  },
  {
    id: 'd5',
    name: 'Dr. Nila Perera',
    specialty: 'Pediatrics Specialist',
    experienceYears: 11,
    availableDays: ['Mon', 'Wed', 'Fri'],
    location: 'North Branch',
    department: 'Pediatrics',
    rating: 4.8,
    availableSlots: ['10:00', '12:30', '15:45'],
    availableNow: true,
    onlineConsultation: true,
  },
]

const initialAppointments: Appointment[] = [
  {
    id: 'a1',
    doctorId: 'd4',
    doctorName: 'Dr. Mia Patel',
    department: 'Cardiology',
    date: '2026-04-02',
    time: '09:30',
    reason: 'Chest pressure follow-up',
    status: 'Confirmed',
  },
  {
    id: 'a2',
    doctorId: 'd2',
    doctorName: 'Dr. Aris Thorne',
    department: 'Dental',
    date: '2026-03-14',
    time: '11:00',
    reason: 'Quarterly cleaning',
    status: 'Completed',
  },
  {
    id: 'a3',
    doctorId: 'd3',
    doctorName: 'Dr. Kevin Lee',
    department: 'Counseling',
    date: '2026-03-28',
    time: '12:00',
    reason: 'Stress management consultation',
    status: 'Pending',
  },
]

const Icon = ({
  name,
}: {
  name: 'search' | 'doctors' | 'menu' | 'moon' | 'sun' | 'shield'
}) => {
  if (name === 'menu') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 6.5h16M4 12h16M4 17.5h16" />
      </svg>
    )
  }

  if (name === 'moon') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20 14.4A8.2 8.2 0 1 1 9.6 4 6.8 6.8 0 0 0 20 14.4Z" />
      </svg>
    )
  }

  if (name === 'sun') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2.8v2.4M12 18.8v2.4M4.8 4.8l1.7 1.7M17.5 17.5l1.7 1.7M2.8 12h2.4M18.8 12h2.4M4.8 19.2l1.7-1.7M17.5 6.5l1.7-1.7" />
      </svg>
    )
  }

  if (name === 'search') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="11" cy="11" r="6" />
        <path d="m19 19-3.3-3.3" />
      </svg>
    )
  }

  if (name === 'doctors') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="8" cy="9" r="2.2" />
        <circle cx="16" cy="8" r="2" />
        <path d="M4.5 17a3.8 3.8 0 0 1 7.6 0M12.2 17a3.2 3.2 0 0 1 6.3 0" />
      </svg>
    )
  }

  if (name === 'shield') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3.8 18.5 6v5.8c0 4.1-2.6 7.4-6.5 8.5-3.9-1.1-6.5-4.4-6.5-8.5V6L12 3.8Z" />
      </svg>
    )
  }

  return null
}

const Appointments = () => {
  const doctorCardsRef = useRef<HTMLDivElement | null>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [role, setRole] = useState<Role>('Doctor')
  const [twoFactor, setTwoFactor] = useState(true)
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments)
  const [notification, setNotification] = useState<{ type: NotificationType; message: string } | null>({
    type: 'special',
    message: 'Reminder: You have 1 appointment tomorrow at 09:30.',
  })

  const departmentFilter: 'All' | Department = 'All'
  const doctorFilter = 'All Doctors'
  const dateFilter = ''
  const timeSlotFilter = 'All Slots'
  const [activeAppointmentTab, setActiveAppointmentTab] = useState<'upcoming' | 'past'>('upcoming')
  const [quickBookDoctorId, setQuickBookDoctorId] = useState<string | null>(null)
  const [doctorSearchQuery, setDoctorSearchQuery] = useState('')
  const [bookingForm, setBookingForm] = useState({
    service: 'General Consultation' as ServiceType,
    doctorId: doctors[0]?.id ?? '',
    date: '',
    time: '',
    fullName: '',
    email: '',
    phone: '',
    age: '',
    gender: 'Prefer not to say',
    address: '',
    reason: '',
    symptoms: '',
    appointmentType: 'New Patient' as AppointmentType,
    location: 'City Campus' as Doctor['location'],
    language: 'English',
    sendSmsReminder: true,
    sendEmailReminder: true,
    followInstructions: true,
    onlinePayment: false,
    reportFileName: '',
  })
  const [bookingConfirmation, setBookingConfirmation] = useState<{
    appointmentId: string
    doctorName: string
    date: string
    time: string
  } | null>(null)

  const serviceOptions: ServiceType[] = [
    'General Consultation',
    'Dental Care',
    'Laboratory',
    'Emergency',
    'Specialist Clinics',
  ]

  const locationOptions: Doctor['location'][] = ['City Campus', 'North Branch', 'Telemedicine Hub']

  const languageOptions = ['English', 'Sinhala', 'Tamil']

  const filteredDoctors = useMemo(() => {
    return doctors.filter((doctor) => {
      const matchesDepartment = departmentFilter === 'All' || doctor.department === departmentFilter
      const matchesDoctor = doctorFilter === 'All Doctors' || doctor.name === doctorFilter
      const matchesTime =
        timeSlotFilter === 'All Slots' || doctor.availableSlots.some((slot) => slot === timeSlotFilter)

      return matchesDepartment && matchesDoctor && matchesTime
    })
  }, [departmentFilter, doctorFilter, timeSlotFilter])

  const appointmentCounts = useMemo(
    () => ({
      pending: appointments.filter((item) => item.status === 'Pending').length,
      confirmed: appointments.filter((item) => item.status === 'Confirmed').length,
      cancelled: appointments.filter((item) => item.status === 'Cancelled').length,
    }),
    [appointments],
  )

  const todayAppointmentsCount = useMemo(() => {
    const now = new Date()
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    return appointments.filter((item) => item.date === today && item.status !== 'Cancelled').length
  }, [appointments])

  const nextAppointment = useMemo(() => {
    const now = new Date()
    const upcoming = appointments
      .filter((item) => new Date(`${item.date}T${item.time}:00`) >= now && item.status !== 'Cancelled')
      .sort(
        (a, b) =>
          new Date(`${a.date}T${a.time}:00`).getTime() - new Date(`${b.date}T${b.time}:00`).getTime(),
      )

    return upcoming[0] ?? null
  }, [appointments])

  const filteredAppointments = useMemo(() => {
    const today = new Date()

    return appointments.filter((item) => {
      const appointmentDate = new Date(`${item.date}T00:00:00`)
      const inUpcoming = appointmentDate >= new Date(today.toDateString())
      const tabMatches = activeAppointmentTab === 'upcoming' ? inUpcoming : !inUpcoming

      const matchesDepartment = departmentFilter === 'All' || item.department === departmentFilter
      const matchesDoctor = doctorFilter === 'All Doctors' || item.doctorName === doctorFilter
      const matchesDate = dateFilter === '' || item.date === dateFilter
      const matchesTime = timeSlotFilter === 'All Slots' || item.time === timeSlotFilter

      return tabMatches && matchesDepartment && matchesDoctor && matchesDate && matchesTime
    })
  }, [activeAppointmentTab, appointments, dateFilter, departmentFilter, doctorFilter, timeSlotFilter])

  const clearNotification = () => setNotification(null)

  const serviceMatchesDoctor = (service: ServiceType, doctor: Doctor) => {
    if (service === 'General Consultation') {
      return doctor.department === 'General'
    }
    if (service === 'Dental Care') {
      return doctor.department === 'Dental'
    }
    if (service === 'Laboratory') {
      return doctor.department === 'General' || doctor.specialty.toLowerCase().includes('lab')
    }
    if (service === 'Emergency') {
      return doctor.availableNow
    }
    return ['Cardiology', 'Pediatrics', 'Counseling'].includes(doctor.department)
  }

  const serviceFromDepartment = (department: Department): ServiceType => {
    if (department === 'Dental') {
      return 'Dental Care'
    }
    if (department === 'Cardiology' || department === 'Pediatrics' || department === 'Counseling') {
      return 'Specialist Clinics'
    }
    return 'General Consultation'
  }


  const bookingDoctors = useMemo(() => {
    const query = doctorSearchQuery.trim().toLowerCase()
    return doctors.filter((doctor) => {
      const matchesService = serviceMatchesDoctor(bookingForm.service, doctor)
      const matchesQuery =
        query.length === 0 ||
        doctor.name.toLowerCase().includes(query) ||
        doctor.specialty.toLowerCase().includes(query)
      return matchesService && matchesQuery
    })
  }, [bookingForm.service, doctorSearchQuery])

  const selectedBookingDoctor = useMemo(() => {
    return bookingDoctors.find((doctor) => doctor.id === bookingForm.doctorId) ?? bookingDoctors[0] ?? null
  }, [bookingDoctors, bookingForm.doctorId])

  const availableBookingSlots = useMemo(() => {
    if (!selectedBookingDoctor) {
      return []
    }

    const occupiedSlots = new Set(
      appointments
        .filter(
          (item) =>
            item.doctorId === selectedBookingDoctor.id &&
            item.date === bookingForm.date &&
            item.status !== 'Cancelled',
        )
        .map((item) => item.time),
    )

    return selectedBookingDoctor.availableSlots.filter((slot) => !occupiedSlots.has(slot))
  }, [appointments, bookingForm.date, selectedBookingDoctor])

  const handleQuickBook = (doctorId: string) => {
    const doctor = doctors.find((item) => item.id === doctorId)
    if (!doctor) {
      return
    }

    // Clicking the same doctor again clears quick selection.
    if (quickBookDoctorId === doctor.id) {
      setQuickBookDoctorId(null)
      setNotification({ type: 'info', message: 'Quick booking selection cleared.' })
      return
    }

    const today = new Date()
    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

    setQuickBookDoctorId(doctor.id)
    setDoctorSearchQuery(doctor.name)
    setBookingForm((prev) => ({
      ...prev,
      service: serviceFromDepartment(doctor.department),
      doctorId: doctor.id,
      date: prev.date || todayKey,
      time: doctor.availableSlots[0] ?? '',
      location: doctor.location,
    }))
    setNotification({
      type: 'info',
      message: `${doctor.name} selected for quick booking. Complete your booking details below.`,
    })

    document.getElementById('book-appointment-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    window.setTimeout(() => {
      document.getElementById('book-full-name')?.focus()
    }, 250)
  }

  const handleReportUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    setBookingForm((prev) => ({ ...prev, reportFileName: selectedFile?.name ?? '' }))
  }

  const handleBookAppointment = () => {
    const doctor = selectedBookingDoctor
    if (!doctor) {
      setNotification({ type: 'error', message: 'No doctor available for the selected service.' })
      return
    }

    if (!bookingForm.fullName.trim() || !bookingForm.email.trim() || !bookingForm.phone.trim()) {
      setNotification({ type: 'error', message: 'Please provide Full Name, Email, and Phone Number.' })
      return
    }

    if (!bookingForm.date || !bookingForm.time) {
      setNotification({ type: 'error', message: 'Please select a date and available time slot.' })
      return
    }

    if (!availableBookingSlots.includes(bookingForm.time)) {
      setNotification({ type: 'error', message: 'Selected slot is no longer available. Please choose another slot.' })
      return
    }

    const appointmentId = `APT-${Date.now().toString().slice(-6)}`
    const newAppointment: Appointment = {
      id: `a${Date.now()}`,
      doctorId: doctor.id,
      doctorName: doctor.name,
      department: doctor.department,
      date: bookingForm.date,
      time: bookingForm.time,
      reason: bookingForm.reason.trim() || bookingForm.appointmentType,
      status: 'Pending',
    }

    setAppointments((prev) => [newAppointment, ...prev])
    setActiveAppointmentTab('upcoming')
    setBookingConfirmation({
      appointmentId,
      doctorName: doctor.name,
      date: bookingForm.date,
      time: bookingForm.time,
    })

    const reminderChannels = [
      bookingForm.sendSmsReminder ? 'SMS' : '',
      bookingForm.sendEmailReminder ? 'Email' : '',
    ]
      .filter(Boolean)
      .join(' and ')

    setNotification({
      type: 'success',
      message: `Booked successfully. Confirmation will be sent via ${reminderChannels || 'portal updates'}.`,
    })

    setBookingForm((prev) => ({
      ...prev,
      date: '',
      time: '',
      reason: '',
      symptoms: '',
      reportFileName: '',
      onlinePayment: false,
    }))
  }

  const updateAppointmentStatus = (id: string, nextStatus: AppointmentStatus) => {
    setAppointments((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: nextStatus } : item)),
    )
  }

  const handleReschedule = (id: string) => {
    setAppointments((prev) =>
      prev.map((item) => {
        if (item.id !== id) {
          return item
        }

        const date = new Date(`${item.date}T00:00:00`)
        date.setDate(date.getDate() + 3)
        const newDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
        return { ...item, date: newDate, status: 'Pending' }
      }),
    )

    setNotification({ type: 'info', message: 'Appointment rescheduled by 3 days and set to Pending.' })
  }

  const handleViewDetails = (appointment: Appointment) => {
    setNotification({
      type: 'info',
      message: `${appointment.doctorName} on ${appointment.date} at ${appointment.time} (${appointment.status})`,
    })
  }

  const formatDate = (date: string) =>
    new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })

  const scrollDoctorCards = (direction: 'left' | 'right') => {
    const container = doctorCardsRef.current
    if (!container) {
      return
    }

    const step = Math.max(260, Math.round(container.clientWidth * 0.7))
    container.scrollBy({
      left: direction === 'left' ? -step : step,
      behavior: 'smooth',
    })
  }

  const statusClass = (status: AppointmentStatus) => {
    if (status === 'Confirmed') {
      return 'status-confirmed'
    }
    if (status === 'Pending') {
      return 'status-pending'
    }
    if (status === 'Cancelled') {
      return 'status-cancelled'
    }

    return 'status-completed'
  }

  return (
    <div className={`appointments-page ${darkMode ? 'theme-dark' : 'theme-light'}`}>
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-head">
          <button
            className="icon-btn"
            type="button"
            onClick={() => setSidebarCollapsed((prev) => !prev)}
            aria-label="Toggle sidebar"
          >
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
                onChange={(event) => setTwoFactor(event.target.checked)}
              />
            </label>

            <p className="availability-live">
              Real-time availability: {doctors.filter((item) => item.availableNow).length} doctors online.
            </p>

            <button
              type="button"
              className="mode-toggle"
              onClick={() => setDarkMode((prev) => !prev)}
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Icon name="sun" /> : <Icon name="moon" />}
              {darkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>
        )}
      </aside>

      <main className="appointments-main">
        <div className="appointments-shell">
          <header className="appointments-header">
            <div>
              <p className="breadcrumb">Home &gt; Appointments</p>
              <h1>Book Smart. Heal Faster.</h1>
              <p className="subtitle">A beautiful, real-time booking workspace for faster visits and happier patients.</p>
              <p className="booking-helper">Tap quick-book from any doctor card and finish your reservation in seconds.</p>
            </div>
            <div className="header-badges">
              <span className="badge-confirmed">{appointmentCounts.confirmed} Confirmed</span>
              <span className="badge-pending">{appointmentCounts.pending} Pending</span>
              <span className="badge-cancelled">{appointmentCounts.cancelled} Cancelled</span>
            </div>
          </header>

          <section className="metrics-ribbon" aria-label="Appointment insights">
            <article className="metric-card metric-primary">
              <small>Today&apos;s Schedule</small>
              <h3>{todayAppointmentsCount} active appointments</h3>
              <p>Stay ahead with real-time updates and one-click rescheduling.</p>
            </article>
            <article className="metric-card">
              <small>Doctors Online</small>
              <h3>{doctors.filter((doctor) => doctor.availableNow).length} available now</h3>
              <p>Use quick-book to prefill your form instantly.</p>
            </article>
            <article className="metric-card">
              <small>Next Appointment</small>
              <h3>{nextAppointment ? `${formatDate(nextAppointment.date)} • ${nextAppointment.time}` : 'No upcoming slot'}</h3>
              <p>{nextAppointment ? nextAppointment.doctorName : 'Try booking your next follow-up appointment.'}</p>
            </article>
          </section>

          {notification && (
            <section className={`notification ${notification.type}`} aria-live="polite">
              <p>{notification.message}</p>
              <button type="button" onClick={clearNotification}>
                Dismiss
              </button>
            </section>
          )}

          <article className="doctor-list-card doctor-list-full-width">
            <div className="doctor-list-head">
              <h2>
                <Icon name="doctors" /> Doctor and Service List
              </h2>
              <div className="doctor-scroll-controls" aria-label="Doctor cards scroll controls">
                <button type="button" onClick={() => scrollDoctorCards('left')} aria-label="Scroll doctor list left">
                  {'<'}
                </button>
                <button type="button" onClick={() => scrollDoctorCards('right')} aria-label="Scroll doctor list right">
                  {'>'}
                </button>
              </div>
            </div>
            <div className="doctor-cards" ref={doctorCardsRef}>
              {filteredDoctors.map((doctor) => (
                <div key={doctor.id} className="doctor-card">
                  <div className="doctor-top">
                    <div>
                      <h3>{doctor.name}</h3>
                      <p>{doctor.specialty}</p>
                      <small>{doctor.department}</small>
                    </div>
                  </div>
                  <div className="doctor-meta">
                    <span>Rating {doctor.rating.toFixed(1)}</span>
                    <span className={doctor.availableNow ? 'live yes' : 'live no'}>
                      {doctor.availableNow ? 'Available now' : 'Offline now'}
                    </span>
                    <span>{doctor.onlineConsultation ? 'Video consult available' : 'On-site only'}</span>
                  </div>
                  <div className="slot-list">
                    {doctor.availableSlots.map((slot) => (
                      <span key={`${doctor.id}-${slot}`}>{slot}</span>
                    ))}
                  </div>
                  <button
                    type="button"
                    className={`outline-btn ${quickBookDoctorId === doctor.id ? 'is-selected' : ''}`}
                    onClick={() => handleQuickBook(doctor.id)}
                  >
                    {quickBookDoctorId === doctor.id ? 'Selected' : 'Book Now'}
                  </button>
                </div>
              ))}
            </div>
          </article>

          <section className="layout-grid">
            <div className="layout-column layout-left">
              <article className={`book-form-card ${quickBookDoctorId ? 'quick-book-active' : ''}`} id="book-appointment-panel">
                <h2>Complete Appointment Booking</h2>
                <p className="booking-intro">
                  Choose your service, doctor, and visit details. You can confirm in one step with reminders and instructions.
                </p>

                <div className="book-form-grid modern-booking-grid">
                  <label className="field-row">
                    <span className="field-label">Department / Service</span>
                    <select
                      value={bookingForm.service}
                      onChange={(event) =>
                        setBookingForm((prev) => ({
                          ...prev,
                          service: event.target.value as ServiceType,
                          doctorId: '',
                          time: '',
                        }))
                      }
                    >
                      {serviceOptions.map((service) => (
                        <option key={service} value={service}>
                          {service}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="field-row">
                    <span className="field-label">Search doctors</span>
                    <input
                      type="text"
                      placeholder="Search by name or specialty"
                      value={doctorSearchQuery}
                      onChange={(event) => setDoctorSearchQuery(event.target.value)}
                    />
                  </label>

                  <label className="field-row">
                    <span className="field-label">Doctor selection</span>
                    <select
                      value={selectedBookingDoctor?.id ?? ''}
                      onChange={(event) =>
                        setBookingForm((prev) => ({
                          ...prev,
                          doctorId: event.target.value,
                          time: '',
                        }))
                      }
                    >
                      {bookingDoctors.map((doctor) => (
                        <option key={doctor.id} value={doctor.id}>
                          {doctor.name} • {doctor.specialty} • {doctor.experienceYears}y exp
                        </option>
                      ))}
                    </select>
                  </label>

                  {selectedBookingDoctor && (
                    <div className="booking-doctor-preview" role="status" aria-live="polite">
                      <strong>{selectedBookingDoctor.name}</strong>
                      <span>{selectedBookingDoctor.specialty}</span>
                      <span>
                        Experience: {selectedBookingDoctor.experienceYears} years • Available: {selectedBookingDoctor.availableDays.join(', ')}
                      </span>
                    </div>
                  )}

                  <div className="dual-field-grid">
                    <label>
                      <span className="field-label">Date picker</span>
                      <input
                        type="date"
                        value={bookingForm.date}
                        onChange={(event) =>
                          setBookingForm((prev) => ({
                            ...prev,
                            date: event.target.value,
                            time: '',
                          }))
                        }
                      />
                    </label>

                    <label>
                      <span className="field-label">Time slot (real-time)</span>
                      <select
                        value={bookingForm.time}
                        onChange={(event) => setBookingForm((prev) => ({ ...prev, time: event.target.value }))}
                      >
                        <option value="">Select a slot</option>
                        {availableBookingSlots.map((slot) => (
                          <option key={slot} value={slot}>
                            {slot}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div className="patient-info-grid">
                    <label>
                      <span className="field-label">Full Name</span>
                      <input
                        id="book-full-name"
                        type="text"
                        value={bookingForm.fullName}
                        onChange={(event) => setBookingForm((prev) => ({ ...prev, fullName: event.target.value }))}
                      />
                    </label>
                    <label>
                      <span className="field-label">Email</span>
                      <input
                        type="email"
                        value={bookingForm.email}
                        onChange={(event) => setBookingForm((prev) => ({ ...prev, email: event.target.value }))}
                      />
                    </label>
                    <label>
                      <span className="field-label">Phone Number</span>
                      <input
                        type="tel"
                        value={bookingForm.phone}
                        onChange={(event) => setBookingForm((prev) => ({ ...prev, phone: event.target.value }))}
                      />
                    </label>
                    <label>
                      <span className="field-label">Age</span>
                      <input
                        type="number"
                        min="1"
                        max="120"
                        value={bookingForm.age}
                        onChange={(event) => setBookingForm((prev) => ({ ...prev, age: event.target.value }))}
                      />
                    </label>
                    <label>
                      <span className="field-label">Gender</span>
                      <select
                        value={bookingForm.gender}
                        onChange={(event) => setBookingForm((prev) => ({ ...prev, gender: event.target.value }))}
                      >
                        <option>Prefer not to say</option>
                        <option>Female</option>
                        <option>Male</option>
                        <option>Other</option>
                      </select>
                    </label>
                    <label className="address-field">
                      <span className="field-label">Address</span>
                      <input
                        type="text"
                        value={bookingForm.address}
                        onChange={(event) => setBookingForm((prev) => ({ ...prev, address: event.target.value }))}
                      />
                    </label>
                  </div>

                  <label className="reason-field">
                    Reason for visit
                    <textarea
                      placeholder="Describe your reason for booking"
                      value={bookingForm.reason}
                      onChange={(event) => setBookingForm((prev) => ({ ...prev, reason: event.target.value }))}
                    />
                  </label>

                  <label className="reason-field">
                    Symptoms (optional)
                    <textarea
                      placeholder="Add symptoms so the doctor can prepare in advance"
                      value={bookingForm.symptoms}
                      onChange={(event) => setBookingForm((prev) => ({ ...prev, symptoms: event.target.value }))}
                    />
                  </label>

                  <label className="field-row">
                    <span className="field-label">Previous reports upload</span>
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={handleReportUpload} />
                  </label>
                  {bookingForm.reportFileName && <p className="upload-note">Attached: {bookingForm.reportFileName}</p>}

                  <label className="field-row">
                    <span className="field-label">Appointment type</span>
                    <select
                      value={bookingForm.appointmentType}
                      onChange={(event) =>
                        setBookingForm((prev) => ({ ...prev, appointmentType: event.target.value as AppointmentType }))
                      }
                    >
                      <option>New Patient</option>
                      <option>Follow-up</option>
                      <option>Online Consultation</option>
                    </select>
                  </label>

                  <div className="dual-field-grid">
                    <label>
                      <span className="field-label">Multi-location selection</span>
                      <select
                        value={bookingForm.location}
                        onChange={(event) =>
                          setBookingForm((prev) => ({ ...prev, location: event.target.value as Doctor['location'] }))
                        }
                      >
                        {locationOptions.map((location) => (
                          <option key={location}>{location}</option>
                        ))}
                      </select>
                    </label>

                    <label>
                      <span className="field-label">Language selection</span>
                      <select
                        value={bookingForm.language}
                        onChange={(event) => setBookingForm((prev) => ({ ...prev, language: event.target.value }))}
                      >
                        {languageOptions.map((language) => (
                          <option key={language}>{language}</option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div className="checkbox-grid">
                    <label>
                      <input
                        type="checkbox"
                        checked={bookingForm.sendSmsReminder}
                        onChange={(event) =>
                          setBookingForm((prev) => ({ ...prev, sendSmsReminder: event.target.checked }))
                        }
                      />
                      SMS reminder
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        checked={bookingForm.sendEmailReminder}
                        onChange={(event) =>
                          setBookingForm((prev) => ({ ...prev, sendEmailReminder: event.target.checked }))
                        }
                      />
                      Email reminder
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        checked={bookingForm.followInstructions}
                        onChange={(event) =>
                          setBookingForm((prev) => ({ ...prev, followInstructions: event.target.checked }))
                        }
                      />
                      I will bring reports / follow fasting instructions if required
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        checked={bookingForm.onlinePayment}
                        onChange={(event) =>
                          setBookingForm((prev) => ({ ...prev, onlinePayment: event.target.checked }))
                        }
                      />
                      Online payment (helps reduce no-shows)
                    </label>
                  </div>

                  <div className="booking-extra-row">
                    <span>Patient login portal and appointment history are available in the My Appointments section.</span>
                  </div>

                  <button type="button" className="primary-btn" onClick={handleBookAppointment}>
                    Confirm Appointment
                  </button>
                </div>

                {bookingConfirmation && (
                  <div className="confirmation-card" role="status" aria-live="polite">
                    <h3>Booking Confirmed ✅</h3>
                    <p>
                      Appointment ID: <strong>{bookingConfirmation.appointmentId}</strong>
                    </p>
                    <p>
                      {bookingConfirmation.date} at {bookingConfirmation.time} with {bookingConfirmation.doctorName}
                    </p>
                  </div>
                )}
              </article>
            </div>

            <div className="layout-column layout-right">
              <article className="my-appointments-card">
                <div className="my-appointments-head">
                  <h2>My Appointments</h2>
                  <div className="tabs">
                    <button
                      type="button"
                      className={activeAppointmentTab === 'upcoming' ? 'active' : ''}
                      onClick={() => setActiveAppointmentTab('upcoming')}
                    >
                      Upcoming
                    </button>
                    <button
                      type="button"
                      className={activeAppointmentTab === 'past' ? 'active' : ''}
                      onClick={() => setActiveAppointmentTab('past')}
                    >
                      Past
                    </button>
                  </div>
                </div>

                <div className="appointments-list">
                  {filteredAppointments.length === 0 && (
                    <p className="empty-state">No appointments match your current filters.</p>
                  )}

                  {filteredAppointments.map((item) => (
                    <div className={`appointment-item ${statusClass(item.status)}`} key={item.id}>
                      <div>
                        <h3>{item.doctorName}</h3>
                        <p>
                          {formatDate(item.date)} at {item.time}
                        </p>
                        <small>{item.department}</small>
                        <small className="appointment-reason">{item.reason}</small>
                      </div>

                      <span className={`status-chip ${statusClass(item.status)}`}>{item.status}</span>

                      <div className="item-actions">
                        <button type="button" onClick={() => handleReschedule(item.id)}>
                          Reschedule
                        </button>
                        <button type="button" onClick={() => updateAppointmentStatus(item.id, 'Cancelled')}>
                          Cancel
                        </button>
                        <button type="button" onClick={() => handleViewDetails(item)}>
                          View details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </article>

            </div>
          </section>

          <footer className="appointments-footer">
            <p>Contact: +94 11 555 2211 | support@unimed.example</p>
            <a href="#help">Help and Support</a>
            <a href="#privacy">Privacy Policy</a>
          </footer>
        </div>
      </main>
    </div>
  )
}

export default Appointments
