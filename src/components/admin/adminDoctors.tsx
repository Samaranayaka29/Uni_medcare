import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './adminDoctors.css'
import AdminNavigation from './adminNavigation'
import { verifyAdminToken } from '../../utils/adminAuth'

const API_URL = import.meta.env.VITE_API_URL ?? '/api'
const PAGE_SIZE = 10

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const SPECIALIZATIONS = [
  'General Medicine',
  'Dental',
  'Counseling',
  'Laboratory',
  'Pediatrics',
  'Gynecology',
  'Cardiology',
  'Dermatology',
]
const DEPARTMENTS = ['General Medicine', 'Dental', 'Counseling', 'Laboratory', 'Pharmacy', 'Emergency', 'Administration']

type DoctorStatus = 'active' | 'inactive'

type ScheduleRow = {
  day: string
  time: string
  active: boolean
}

type CertificateAsset = {
  name: string
  url: string
}

type Doctor = {
  id: string
  fullName: string
  doctorId: string
  gender: string
  dateOfBirth: string
  email: string
  phone: string
  address: string
  qualification: string
  specialization: string
  department: string
  experience: number
  availableTime: string
  scheduleRows: ScheduleRow[]
  password: string
  photoUrl: string
  certificateFiles: CertificateAsset[]
  status: DoctorStatus
  appointmentCount: number
  assignedPatients: number
}

type AppointmentSummary = {
  id: string
  doctorName?: string
  status?: string
  date?: string
}

type DoctorForm = {
  fullName: string
  doctorId: string
  gender: string
  dateOfBirth: string
  email: string
  phone: string
  address: string
  qualification: string
  specialization: string
  department: string
  experience: string
  availableTime: string
  scheduleRows: ScheduleRow[]
  password: string
  photoUrl: string
  certificateFiles: CertificateAsset[]
  status: DoctorStatus
  leaveDates: string
  appointmentCount: string
  assignedPatients: string
}

type DoctorFilters = {
  search: string
  specialization: string
  department: string
  availability: 'all' | 'available-today' | 'weekly' | 'unavailable'
  status: 'all' | DoctorStatus
}

type ModalMode = 'create' | 'edit' | null

const createScheduleRows = (): ScheduleRow[] =>
  DAYS.map((day) => ({
    day,
    time: '',
    active: day === 'Monday' || day === 'Wednesday',
  }))

const createEmptyForm = (): DoctorForm => ({
  fullName: '',
  doctorId: '',
  gender: 'Male',
  dateOfBirth: '',
  email: '',
  phone: '',
  address: '',
  qualification: '',
  specialization: SPECIALIZATIONS[0],
  department: DEPARTMENTS[0],
  experience: '',
  availableTime: '08:00 AM - 02:00 PM',
  scheduleRows: createScheduleRows(),
  password: '',
  photoUrl: '',
  certificateFiles: [],
  status: 'active',
  leaveDates: '',
  appointmentCount: '0',
  assignedPatients: '0',
})

const normalizeStatus = (value: unknown): DoctorStatus => {
  const text = String(value ?? '').toLowerCase()
  return text === 'inactive' || text === 'offline' ? 'inactive' : 'active'
}

const formatScheduleRows = (record: any): ScheduleRow[] => {
  const workingSchedule = Array.isArray(record?.workingSchedule) ? record.workingSchedule : []
  const availableDays = Array.isArray(record?.availableDays) ? record.availableDays : []
  const availableTime = typeof record?.availableTime === 'string' ? record.availableTime : ''

  return DAYS.map((day) => {
    const scheduleEntry = workingSchedule.find((entry: any) => entry?.day === day)
    const shouldBeActive = Boolean(scheduleEntry?.active) || availableDays.includes(day)
    return {
      day,
      time: typeof scheduleEntry?.time === 'string' && scheduleEntry.time.length > 0 ? scheduleEntry.time : shouldBeActive ? availableTime : '',
      active: shouldBeActive,
    }
  })
}

const normalizeCertificates = (value: unknown): CertificateAsset[] => {
  if (!Array.isArray(value)) {
    return []
  }

  return value.map((entry, index) => {
    if (typeof entry === 'string') {
      return { name: `Certificate ${index + 1}`, url: entry }
    }

    if (entry && typeof entry === 'object') {
      const typedEntry = entry as Record<string, unknown>
      return {
        name: typeof typedEntry.name === 'string' ? typedEntry.name : `Certificate ${index + 1}`,
        url: typeof typedEntry.url === 'string' ? typedEntry.url : '',
      }
    }

    return { name: `Certificate ${index + 1}`, url: '' }
  })
}

const normalizeDoctor = (record: any): Doctor => ({
  id: String(record?.id ?? ''),
  fullName: String(record?.fullName ?? record?.name ?? ''),
  doctorId: String(record?.doctorId ?? record?.id ?? ''),
  gender: String(record?.gender ?? ''),
  dateOfBirth: String(record?.dateOfBirth ?? ''),
  email: String(record?.email ?? ''),
  phone: String(record?.phone ?? ''),
  address: String(record?.address ?? ''),
  qualification: String(record?.qualification ?? ''),
  specialization: String(record?.specialization ?? SPECIALIZATIONS[0]),
  department: String(record?.department ?? record?.hospital ?? DEPARTMENTS[0]),
  experience: Number(record?.experience ?? 0),
  availableTime: String(record?.availableTime ?? ''),
  scheduleRows: formatScheduleRows(record),
  password: '',
  photoUrl: String(record?.photoUrl ?? record?.profilePhoto ?? ''),
  certificateFiles: normalizeCertificates(record?.certificateFiles),
  status: normalizeStatus(record?.status),
  appointmentCount: Number(record?.appointmentCount ?? 0),
  assignedPatients: Number(record?.assignedPatients ?? 0),
})

const toFormState = (doctor: Doctor): DoctorForm => ({
  fullName: doctor.fullName,
  doctorId: doctor.doctorId,
  gender: doctor.gender || 'Male',
  dateOfBirth: doctor.dateOfBirth,
  email: doctor.email,
  phone: doctor.phone,
  address: doctor.address,
  qualification: doctor.qualification,
  specialization: doctor.specialization,
  department: doctor.department,
  experience: String(doctor.experience ?? ''),
  availableTime: doctor.availableTime,
  scheduleRows: doctor.scheduleRows.length > 0 ? doctor.scheduleRows : createScheduleRows(),
  password: '',
  photoUrl: doctor.photoUrl,
  certificateFiles: doctor.certificateFiles,
  status: doctor.status,
  leaveDates: '',
  appointmentCount: String(doctor.appointmentCount ?? 0),
  assignedPatients: String(doctor.assignedPatients ?? 0),
})

const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.onerror = () => reject(new Error(`Unable to read file: ${file.name}`))
    reader.readAsDataURL(file)
  })

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const initials = parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '').join('')
  return initials || 'DR'
}

const getTodayName = () => new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date())

const AdminDoctors = () => {
  const navigate = useNavigate()
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [appointments, setAppointments] = useState<AppointmentSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Doctor | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState<DoctorFilters>({
    search: '',
    specialization: 'all',
    department: 'all',
    availability: 'all',
    status: 'all',
  })
  const [form, setForm] = useState<DoctorForm>(createEmptyForm())

  const authHeaders = () => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      throw new Error('Missing admin token')
    }

    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  }

  const loadDoctors = async () => {
    const response = await fetch(`${API_URL}/api/doctors`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('adminToken') ?? ''}`,
      },
    })

    if (!response.ok) {
      const data = await response.json().catch(() => ({ error: 'Failed to load doctors' }))
      throw new Error(data.error ?? 'Failed to load doctors')
    }

    const data = await response.json()
    setDoctors(Array.isArray(data) ? data.map(normalizeDoctor) : [])
  }

  const loadAppointments = async () => {
    const response = await fetch(`${API_URL}/api/appointments`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('adminToken') ?? ''}`,
      },
    })

    if (!response.ok) {
      return
    }

    const data = await response.json()
    setAppointments(Array.isArray(data) ? data : [])
  }

  const refreshData = async () => {
    await Promise.all([loadDoctors(), loadAppointments()])
  }

  useEffect(() => {
    const checkAdminAndLoadDoctors = async () => {
      try {
        const admin = await verifyAdminToken()

        if (!admin) {
          navigate('/admin/login')
          return
        }

        await refreshData()
      } catch (loadError) {
        const message = loadError instanceof Error ? loadError.message : 'Error loading doctors'
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    checkAdminAndLoadDoctors()
  }, [navigate])

  useEffect(() => {
    setCurrentPage(1)
  }, [filters.search, filters.specialization, filters.department, filters.availability, filters.status])

  const specializations = useMemo(
    () => ['all', ...new Set(doctors.map((doctor) => doctor.specialization).filter(Boolean))],
    [doctors],
  )

  const departments = useMemo(
    () => ['all', ...new Set(doctors.map((doctor) => doctor.department).filter(Boolean))],
    [doctors],
  )

  const todayName = getTodayName()

  const doctorStats = useMemo(() => {
    const totalDoctors = doctors.length
    const activeDoctors = doctors.filter((doctor) => doctor.status === 'active').length
    const availableToday = doctors.filter(
      (doctor) => doctor.status === 'active' && doctor.scheduleRows.some((row) => row.active && row.day === todayName),
    ).length
    const departmentsCount = new Set(doctors.map((doctor) => doctor.department).filter(Boolean)).size
    const totalAppointments = appointments.length
    const completedAppointments = appointments.filter((item) => String(item.status).toLowerCase() === 'completed').length
    const pendingAppointments = appointments.filter((item) => String(item.status).toLowerCase() === 'pending').length

    return {
      totalDoctors,
      activeDoctors,
      availableToday,
      departmentsCount,
      totalAppointments,
      completedAppointments,
      pendingAppointments,
    }
  }, [appointments, doctors, todayName])

  const filteredDoctors = useMemo(() => {
    const search = filters.search.trim().toLowerCase()

    return doctors.filter((doctor) => {
      const matchesSearch =
        search.length === 0 ||
        [doctor.fullName, doctor.doctorId, doctor.email, doctor.phone, doctor.department, doctor.specialization]
          .join(' ')
          .toLowerCase()
          .includes(search)

      const matchesSpecialization = filters.specialization === 'all' || doctor.specialization === filters.specialization
      const matchesDepartment = filters.department === 'all' || doctor.department === filters.department
      const matchesStatus = filters.status === 'all' || doctor.status === filters.status

      const matchesAvailability = (() => {
        if (filters.availability === 'all') {
          return true
        }

        const isAvailableToday = doctor.status === 'active' && doctor.scheduleRows.some((row) => row.active && row.day === todayName)
        const hasWeeklySchedule = doctor.scheduleRows.some((row) => row.active)

        if (filters.availability === 'available-today') {
          return isAvailableToday
        }

        if (filters.availability === 'weekly') {
          return hasWeeklySchedule
        }

        return !isAvailableToday
      })()

      return matchesSearch && matchesSpecialization && matchesDepartment && matchesAvailability && matchesStatus
    })
  }, [doctors, filters.department, filters.availability, filters.search, filters.specialization, filters.status, todayName])

  const totalPages = Math.max(1, Math.ceil(filteredDoctors.length / PAGE_SIZE))
  const safePage = Math.min(currentPage, totalPages)
  const paginatedDoctors = filteredDoctors.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const openCreateModal = () => {
    setModalMode('create')
    setSelectedDoctor(null)
    setForm(createEmptyForm())
    setError('')
    setSuccess('')
  }

  const openEditModal = (doctor: Doctor) => {
    setModalMode('edit')
    setSelectedDoctor(doctor)
    setForm(toFormState(doctor))
    setError('')
    setSuccess('')
  }

  const openViewModal = (doctor: Doctor) => {
    setSelectedDoctor(doctor)
  }

  const closeFormModal = () => {
    setModalMode(null)
    setSelectedDoctor(null)
    setForm(createEmptyForm())
  }

  const closeViewModal = () => {
    setSelectedDoctor(null)
  }

  const onChangeField = <K extends keyof DoctorForm>(key: K, value: DoctorForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const onToggleDay = (day: string) => {
    setForm((current) => ({
      ...current,
      scheduleRows: current.scheduleRows.map((row) =>
        row.day === day
          ? {
              ...row,
              active: !row.active,
            }
          : row,
      ),
    }))
  }

  const onChangeDayTime = (day: string, time: string) => {
    setForm((current) => ({
      ...current,
      scheduleRows: current.scheduleRows.map((row) => (row.day === day ? { ...row, time } : row)),
    }))
  }

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    const url = await fileToDataUrl(file)
    setForm((current) => ({ ...current, photoUrl: url }))
  }

  const handleCertificatesUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    if (!files.length) {
      return
    }

    const uploaded = await Promise.all(
      files.map(async (file) => ({
        name: file.name,
        url: await fileToDataUrl(file),
      })),
    )

    setForm((current) => ({
      ...current,
      certificateFiles: [...current.certificateFiles, ...uploaded],
    }))
  }

  const removeCertificate = (certificateName: string) => {
    setForm((current) => ({
      ...current,
      certificateFiles: current.certificateFiles.filter((item) => item.name !== certificateName),
    }))
  }

  const resetForm = () => {
    setForm(createEmptyForm())
    setError('')
    setSuccess('')
    setModalMode(null)
    setSelectedDoctor(null)
  }

  const saveDoctor = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!form.fullName.trim() || !form.doctorId.trim() || !form.email.trim() || !form.specialization.trim()) {
      setError('Full name, doctor ID, email, and specialization are required.')
      return
    }

    if (modalMode === 'create' && !form.password.trim()) {
      setError('Password is required when creating a new doctor.')
      return
    }

    const activeScheduleRows = form.scheduleRows.filter((row) => row.active)

    setIsSubmitting(true)

    try {
      const payload = {
        name: form.fullName.trim(),
        fullName: form.fullName.trim(),
        doctorId: form.doctorId.trim(),
        gender: form.gender,
        dateOfBirth: form.dateOfBirth,
        specialization: form.specialization,
        department: form.department,
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        qualification: form.qualification.trim(),
        availableTime: form.availableTime.trim(),
        availableDays: activeScheduleRows.map((row) => row.day),
        workingSchedule: activeScheduleRows.map((row) => ({
          day: row.day,
          time: row.time || form.availableTime.trim(),
          active: true,
        })),
        password: form.password.trim(),
        photoUrl: form.photoUrl,
        certificateFiles: form.certificateFiles,
        hospital: form.department,
        experience: Number(form.experience) || 0,
        status: form.status,
        leaveDates: form.leaveDates
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
        appointmentCount: Number(form.appointmentCount) || 0,
        assignedPatients: Number(form.assignedPatients) || 0,
      }

      const endpoint = modalMode === 'edit' && selectedDoctor ? `${API_URL}/api/doctors/${selectedDoctor.id}` : `${API_URL}/api/doctors`
      const method = modalMode === 'edit' ? 'PUT' : 'POST'

      const response = await fetch(endpoint, {
        method,
        headers: authHeaders(),
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: 'Request failed' }))
        throw new Error(data.error ?? 'Request failed')
      }

      await refreshData()
      setSuccess(modalMode === 'edit' ? 'Doctor updated successfully.' : 'Doctor added successfully.')
      closeFormModal()
    } catch (apiError) {
      const message = apiError instanceof Error ? apiError.message : 'Failed to save doctor'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) {
      return
    }

    setError('')
    setSuccess('')

    try {
      const response = await fetch(`${API_URL}/api/doctors/${deleteTarget.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken') ?? ''}`,
        },
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: 'Failed to delete doctor' }))
        throw new Error(data.error ?? 'Failed to delete doctor')
      }

      setDoctors((current) => current.filter((doctor) => doctor.id !== deleteTarget.id))
      setSuccess('Doctor deleted successfully.')
      setDeleteTarget(null)
    } catch (apiError) {
      const message = apiError instanceof Error ? apiError.message : 'Failed to delete doctor'
      setError(message)
    }
  }

  const handleToggleStatus = async (doctor: Doctor) => {
    setError('')
    setSuccess('')

    try {
      const response = await fetch(`${API_URL}/api/doctors/${doctor.id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({
          ...doctor,
          status: doctor.status === 'active' ? 'inactive' : 'active',
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: 'Unable to update status' }))
        throw new Error(data.error ?? 'Unable to update status')
      }

      await loadDoctors()
      setSuccess(`Doctor marked as ${doctor.status === 'active' ? 'inactive' : 'active'}.`)
    } catch (apiError) {
      const message = apiError instanceof Error ? apiError.message : 'Unable to update status'
      setError(message)
    }
  }

  const exportDoctorCsv = () => {
    const headers = [
      'Doctor ID',
      'Name',
      'Specialization',
      'Department',
      'Email',
      'Phone',
      'Available Days',
      'Status',
    ]

    const rows = filteredDoctors.map((doctor) => [
      doctor.doctorId,
      doctor.fullName,
      doctor.specialization,
      doctor.department,
      doctor.email,
      doctor.phone,
      doctor.scheduleRows.filter((row) => row.active).map((row) => row.day).join(' | '),
      doctor.status,
    ])

    const csv = [headers, ...rows]
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'doctor-data.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  const exportDoctorPrint = () => {
    const popup = window.open('', '_blank', 'width=1100,height=700')
    if (!popup) {
      return
    }

    const tableRows = filteredDoctors
      .map(
        (doctor) => `
          <tr>
            <td>${doctor.doctorId}</td>
            <td>${doctor.fullName}</td>
            <td>${doctor.specialization}</td>
            <td>${doctor.department}</td>
            <td>${doctor.email}</td>
            <td>${doctor.phone}</td>
            <td>${doctor.scheduleRows.filter((row) => row.active).map((row) => row.day).join(', ')}</td>
            <td>${doctor.status}</td>
          </tr>
        `,
      )
      .join('')

    popup.document.write(`
      <html>
        <head>
          <title>Doctor Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #14253b; }
            h1 { margin-bottom: 16px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #d8e5f4; padding: 10px; text-align: left; font-size: 12px; }
            th { background: #e7f0ff; }
          </style>
        </head>
        <body>
          <h1>Doctor Management Report</h1>
          <table>
            <thead>
              <tr>
                <th>Doctor ID</th><th>Name</th><th>Specialization</th><th>Department</th><th>Email</th><th>Phone</th><th>Available Days</th><th>Status</th>
              </tr>
            </thead>
            <tbody>${tableRows}</tbody>
          </table>
        </body>
      </html>
    `)
    popup.document.close()
    popup.focus()
    popup.print()
  }

  const appointmentStats = useMemo(() => {
    const total = appointments.length
    const completed = appointments.filter((item) => String(item.status).toLowerCase() === 'completed').length
    const pending = appointments.filter((item) => String(item.status).toLowerCase() === 'pending').length

    return { total, completed, pending }
  }, [appointments])

  const profileAppointments = useMemo(() => {
    if (!selectedDoctor) {
      return { total: 0, completed: 0, pending: 0 }
    }

    const matched = appointments.filter((item) => {
      const doctorName = String(item.doctorName ?? '').toLowerCase()
      const target = selectedDoctor.fullName.toLowerCase()
      return doctorName.includes(target) || target.includes(doctorName)
    })

    return {
      total: matched.length,
      completed: matched.filter((item) => String(item.status).toLowerCase() === 'completed').length,
      pending: matched.filter((item) => String(item.status).toLowerCase() === 'pending').length,
    }
  }, [appointments, selectedDoctor])

  if (loading) {
    return (
      <div className="admin-doctors-container">
        <AdminNavigation />
        <div className="loading-state">
          <div className="spinner" />
          <p>Loading doctor management...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-doctors-container">
      <AdminNavigation />

      <div className="admin-content doctor-page-shell">
        <section className="page-hero">
          <div className="page-header">
            <div className="page-header-copy">
              <p className="eyebrow">Clinical workforce control</p>
              <h1>Doctor Management</h1>
              <p>
                Add doctors, manage schedules, filter availability, view profiles, and maintain account status in a single
                professional dashboard.
              </p>
            </div>

            <div className="page-actions">
              <button type="button" className="secondary-btn" onClick={exportDoctorCsv}>
                Export Excel
              </button>
              <button type="button" className="secondary-btn" onClick={exportDoctorPrint}>
                Export PDF
              </button>
              <button type="button" className="secondary-btn" onClick={() => window.print()}>
                Print
              </button>
              <button type="button" className="primary-btn" onClick={openCreateModal}>
                + Add New Doctor
              </button>
            </div>
          </div>

          <div className="stats-grid">
            <article className="doctor-stat-card blue">
              <span className="stat-label">Total Doctors</span>
              <strong>{doctorStats.totalDoctors.toLocaleString()}</strong>
            </article>
            <article className="doctor-stat-card green">
              <span className="stat-label">Active Doctors</span>
              <strong>{doctorStats.activeDoctors.toLocaleString()}</strong>
            </article>
            <article className="doctor-stat-card amber">
              <span className="stat-label">Available Today</span>
              <strong>{doctorStats.availableToday.toLocaleString()}</strong>
            </article>
            <article className="doctor-stat-card slate">
              <span className="stat-label">Departments Count</span>
              <strong>{doctorStats.departmentsCount.toLocaleString()}</strong>
            </article>
            <article className="doctor-stat-card violet">
              <span className="stat-label">Total Appointments</span>
              <strong>{doctorStats.totalAppointments.toLocaleString()}</strong>
            </article>
            <article className="doctor-stat-card teal">
              <span className="stat-label">Completed Appointments</span>
              <strong>{doctorStats.completedAppointments.toLocaleString()}</strong>
            </article>
            <article className="doctor-stat-card red">
              <span className="stat-label">Pending Appointments</span>
              <strong>{doctorStats.pendingAppointments.toLocaleString()}</strong>
            </article>
          </div>
        </section>

        {error ? <div className="alert-banner error">{error}</div> : null}
        {success ? <div className="alert-banner success">{success}</div> : null}

        <section className="toolbar-card">
          <div className="toolbar-grid">
            <label className="search-field">
              <span>Search Doctor</span>
              <input
                type="text"
                placeholder="Search by name, doctor ID, email, or department"
                value={filters.search}
                onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
              />
            </label>

            <label className="filter-field">
              <span>Specialization</span>
              <select
                value={filters.specialization}
                onChange={(event) => setFilters((current) => ({ ...current, specialization: event.target.value }))}
              >
                {specializations.map((specialization) => (
                  <option key={specialization} value={specialization}>
                    {specialization === 'all' ? 'All Specializations' : specialization}
                  </option>
                ))}
              </select>
            </label>

            <label className="filter-field">
              <span>Department</span>
              <select
                value={filters.department}
                onChange={(event) => setFilters((current) => ({ ...current, department: event.target.value }))}
              >
                {departments.map((department) => (
                  <option key={department} value={department}>
                    {department === 'all' ? 'All Departments' : department}
                  </option>
                ))}
              </select>
            </label>

            <label className="filter-field">
              <span>Availability</span>
              <select
                value={filters.availability}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    availability: event.target.value as DoctorFilters['availability'],
                  }))
                }
              >
                <option value="all">All Availability</option>
                <option value="available-today">Available Today</option>
                <option value="weekly">Weekly Schedule</option>
                <option value="unavailable">Unavailable Today</option>
              </select>
            </label>

            <label className="filter-field">
              <span>Status</span>
              <select
                value={filters.status}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    status: event.target.value as DoctorFilters['status'],
                  }))
                }
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>
          </div>

          <div className="toolbar-footer">
            <div>
              Showing <strong>{paginatedDoctors.length}</strong> of <strong>{filteredDoctors.length}</strong> doctors
            </div>
            <div className="toolbar-pills">
              <span>Role-based access control</span>
              <span>Schedule management</span>
              <span>Responsive table</span>
            </div>
          </div>
        </section>

        <section className="table-card">
          <div className="table-card-header">
            <div>
              <h2>Doctor List Table</h2>
              <p>Search, sort, edit, delete, and view doctor records.</p>
            </div>
            <div className="table-page-info">
              Page <strong>{safePage}</strong> of <strong>{totalPages}</strong>
            </div>
          </div>

          <div className="doctor-table-wrapper">
            <table className="doctor-table">
              <thead>
                <tr>
                  <th>Doctor ID</th>
                  <th>Doctor Name</th>
                  <th>Profile Photo</th>
                  <th>Specialization</th>
                  <th>Department</th>
                  <th>Email</th>
                  <th>Phone Number</th>
                  <th>Available Days</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedDoctors.length > 0 ? (
                  paginatedDoctors.map((doctor) => (
                    <tr key={doctor.id}>
                      <td className="mono-cell">{doctor.doctorId || doctor.id}</td>
                      <td>
                        <div className="doctor-name-cell">
                          <strong>{doctor.fullName}</strong>
                          <span>{doctor.gender || 'Not specified'}</span>
                        </div>
                      </td>
                      <td>
                        <div className="doctor-avatar">
                          {doctor.photoUrl ? (
                            <img src={doctor.photoUrl} alt={doctor.fullName} />
                          ) : (
                            <span>{getInitials(doctor.fullName)}</span>
                          )}
                        </div>
                      </td>
                      <td>{doctor.specialization}</td>
                      <td>{doctor.department}</td>
                      <td>{doctor.email}</td>
                      <td>{doctor.phone || '-'}</td>
                      <td>
                        <div className="day-badges">
                          {doctor.scheduleRows.filter((row) => row.active).length > 0 ? (
                            doctor.scheduleRows
                              .filter((row) => row.active)
                              .map((row) => <span key={`${doctor.id}-${row.day}`}>{row.day}</span>)
                          ) : (
                            <span className="muted-text">No schedule</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className={`status-badge status-${doctor.status}`}>
                          {doctor.status === 'active' ? 'Active' : 'Inactive'}
                        </div>
                      </td>
                      <td>
                        <div className="actions-cell">
                          <button type="button" className="mini-btn view" onClick={() => openViewModal(doctor)}>
                            View
                          </button>
                          <button type="button" className="mini-btn edit" onClick={() => openEditModal(doctor)}>
                            Edit
                          </button>
                          <button type="button" className="mini-btn toggle" onClick={() => handleToggleStatus(doctor)}>
                            {doctor.status === 'active' ? 'Deactivate' : 'Activate'}
                          </button>
                          <button type="button" className="mini-btn delete" onClick={() => setDeleteTarget(doctor)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={10}>
                      <div className="empty-state">
                        <strong>No doctors found.</strong>
                        <p>Try changing the filters or add a new doctor record.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="pagination-row">
            <button
              type="button"
              className="page-btn"
              disabled={safePage <= 1}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            >
              Previous
            </button>
            <span>
              Page <strong>{safePage}</strong> of <strong>{totalPages}</strong>
            </span>
            <button
              type="button"
              className="page-btn"
              disabled={safePage >= totalPages}
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
            >
              Next
            </button>
          </div>
        </section>

        <section className="doctor-stats-panel">
          <div className="panel-header">
            <div>
              <h2>Doctor Appointment Statistics</h2>
              <p>High-level operational overview for the clinical team.</p>
            </div>
          </div>

          <div className="stats-grid three-up">
            <article className="mini-metric">
              <span>Total appointments</span>
              <strong>{appointmentStats.total.toLocaleString()}</strong>
            </article>
            <article className="mini-metric success">
              <span>Completed appointments</span>
              <strong>{appointmentStats.completed.toLocaleString()}</strong>
            </article>
            <article className="mini-metric warning">
              <span>Pending appointments</span>
              <strong>{appointmentStats.pending.toLocaleString()}</strong>
            </article>
          </div>
        </section>
      </div>

      {modalMode ? (
        <div className="modal-overlay">
          <div className="modal-card large-modal">
            <div className="modal-header">
              <div>
                <p className="eyebrow">{modalMode === 'edit' ? 'Edit Doctor' : 'Add New Doctor'}</p>
                <h3>{modalMode === 'edit' ? 'Update Doctor Details' : 'Create Doctor Profile'}</h3>
              </div>
              <button type="button" className="close-btn" onClick={closeFormModal}>
                ×
              </button>
            </div>

            <form className="doctor-form" onSubmit={saveDoctor}>
              <div className="form-grid">
                <label>
                  <span>Full Name</span>
                  <input value={form.fullName} onChange={(event) => onChangeField('fullName', event.target.value)} />
                </label>
                <label>
                  <span>NIC / Doctor ID</span>
                  <input value={form.doctorId} onChange={(event) => onChangeField('doctorId', event.target.value)} />
                </label>
                <label>
                  <span>Gender</span>
                  <select value={form.gender} onChange={(event) => onChangeField('gender', event.target.value)}>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </label>
                <label>
                  <span>Date of Birth</span>
                  <input type="date" value={form.dateOfBirth} onChange={(event) => onChangeField('dateOfBirth', event.target.value)} />
                </label>
                <label>
                  <span>Email</span>
                  <input type="email" value={form.email} onChange={(event) => onChangeField('email', event.target.value)} />
                </label>
                <label>
                  <span>Phone Number</span>
                  <input value={form.phone} onChange={(event) => onChangeField('phone', event.target.value)} />
                </label>
                <label className="full-span">
                  <span>Address</span>
                  <textarea rows={2} value={form.address} onChange={(event) => onChangeField('address', event.target.value)} />
                </label>
                <label>
                  <span>Qualification</span>
                  <input value={form.qualification} onChange={(event) => onChangeField('qualification', event.target.value)} />
                </label>
                <label>
                  <span>Specialization</span>
                  <select value={form.specialization} onChange={(event) => onChangeField('specialization', event.target.value)}>
                    {SPECIALIZATIONS.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Department</span>
                  <select value={form.department} onChange={(event) => onChangeField('department', event.target.value)}>
                    {DEPARTMENTS.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Experience</span>
                  <input type="number" min="0" value={form.experience} onChange={(event) => onChangeField('experience', event.target.value)} />
                </label>
                <label>
                  <span>Available Time</span>
                  <input value={form.availableTime} onChange={(event) => onChangeField('availableTime', event.target.value)} />
                </label>
                <label>
                  <span>Status</span>
                  <select value={form.status} onChange={(event) => onChangeField('status', event.target.value as DoctorStatus)}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </label>
                <label>
                  <span>Password</span>
                  <input
                    type="password"
                    value={form.password}
                    placeholder={modalMode === 'edit' ? 'Leave blank to keep unchanged' : 'Create doctor password'}
                    onChange={(event) => onChangeField('password', event.target.value)}
                  />
                </label>
                <label>
                  <span>Appointment Count</span>
                  <input type="number" min="0" value={form.appointmentCount} onChange={(event) => onChangeField('appointmentCount', event.target.value)} />
                </label>
                <label>
                  <span>Assigned Patients</span>
                  <input type="number" min="0" value={form.assignedPatients} onChange={(event) => onChangeField('assignedPatients', event.target.value)} />
                </label>
                <label className="full-span">
                  <span>Leave Dates</span>
                  <textarea
                    rows={2}
                    placeholder="Comma separated leave dates"
                    value={form.leaveDates}
                    onChange={(event) => onChangeField('leaveDates', event.target.value)}
                  />
                </label>
              </div>

              <div className="upload-grid">
                <label className="upload-box">
                  <span>Upload Profile Image</span>
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} />
                  {form.photoUrl ? <img className="preview-image" src={form.photoUrl} alt="Profile preview" /> : <p>No image selected</p>}
                </label>

                <label className="upload-box">
                  <span>Upload Certificates</span>
                  <input type="file" accept="image/*,.pdf" multiple onChange={handleCertificatesUpload} />
                  <p>Medical license, degree certificates, or other files</p>
                  <div className="certificate-list">
                    {form.certificateFiles.length > 0 ? (
                      form.certificateFiles.map((certificate) => (
                        <div key={certificate.name} className="certificate-pill">
                          <span>{certificate.name}</span>
                          <button type="button" onClick={() => removeCertificate(certificate.name)}>
                            ×
                          </button>
                        </div>
                      ))
                    ) : (
                      <span className="muted-text">No certificates uploaded</span>
                    )}
                  </div>
                </label>
              </div>

              <div className="schedule-panel">
                <div className="schedule-header">
                  <h4>Doctor Schedule Management</h4>
                  <p>Set working days, start/end times, leave dates, and availability status.</p>
                </div>

                <div className="schedule-grid">
                  {form.scheduleRows.map((row) => (
                    <div key={row.day} className={`schedule-row ${row.active ? 'active' : ''}`}>
                      <label className="schedule-toggle">
                        <input type="checkbox" checked={row.active} onChange={() => onToggleDay(row.day)} />
                        <span>{row.day}</span>
                      </label>
                      <input
                        type="text"
                        placeholder="8AM - 2PM"
                        value={row.time}
                        onChange={(event) => onChangeDayTime(row.day, event.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="secondary-btn" onClick={resetForm}>
                  Reset
                </button>
                <button type="button" className="secondary-btn" onClick={closeFormModal}>
                  Cancel
                </button>
                <button type="submit" className="primary-btn" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : modalMode === 'edit' ? 'Update Doctor' : 'Save Doctor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {selectedDoctor ? (
        <div className="modal-overlay">
          <div className="modal-card profile-modal">
            <div className="modal-header">
              <div>
                <p className="eyebrow">Doctor Profile View</p>
                <h3>{selectedDoctor.fullName}</h3>
              </div>
              <button type="button" className="close-btn" onClick={closeViewModal}>
                ×
              </button>
            </div>

            <div className="profile-layout">
              <div className="profile-sidebar">
                <div className="profile-avatar">
                  {selectedDoctor.photoUrl ? (
                    <img src={selectedDoctor.photoUrl} alt={selectedDoctor.fullName} />
                  ) : (
                    <span>{getInitials(selectedDoctor.fullName)}</span>
                  )}
                </div>

                <div className={`status-badge status-${selectedDoctor.status} large-status`}>
                  {selectedDoctor.status === 'active' ? 'Active' : 'Inactive'}
                </div>

                <div className="profile-stat-list">
                  <div>
                    <span>Total appointments</span>
                    <strong>{profileAppointments.total}</strong>
                  </div>
                  <div>
                    <span>Completed appointments</span>
                    <strong>{profileAppointments.completed}</strong>
                  </div>
                  <div>
                    <span>Pending appointments</span>
                    <strong>{profileAppointments.pending}</strong>
                  </div>
                  <div>
                    <span>Assigned patients</span>
                    <strong>{selectedDoctor.assignedPatients}</strong>
                  </div>
                </div>

                <div className="profile-buttons">
                  <button type="button" className="secondary-btn" onClick={() => navigate('/admin/appointments')}>
                    View Appointments
                  </button>
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={() => window.open(`mailto:${selectedDoctor.email}?subject=Doctor%20Management%20Update`, '_blank')}
                  >
                    Send Email Notification
                  </button>
                  <button type="button" className="secondary-btn" onClick={() => window.alert('Chat with doctor feature can be connected later.')}>
                    Chat with Doctor
                  </button>
                </div>
              </div>

              <div className="profile-main">
                <div className="profile-section-grid">
                  <article className="profile-section">
                    <h4>Personal Information</h4>
                    <dl>
                      <div><dt>Doctor ID</dt><dd>{selectedDoctor.doctorId || '-'}</dd></div>
                      <div><dt>Gender</dt><dd>{selectedDoctor.gender || '-'}</dd></div>
                      <div><dt>Date of Birth</dt><dd>{selectedDoctor.dateOfBirth || '-'}</dd></div>
                      <div><dt>Email</dt><dd>{selectedDoctor.email}</dd></div>
                      <div><dt>Phone</dt><dd>{selectedDoctor.phone || '-'}</dd></div>
                      <div><dt>Address</dt><dd>{selectedDoctor.address || '-'}</dd></div>
                    </dl>
                  </article>

                  <article className="profile-section">
                    <h4>Professional Details</h4>
                    <dl>
                      <div><dt>Qualification</dt><dd>{selectedDoctor.qualification || '-'}</dd></div>
                      <div><dt>Specialization</dt><dd>{selectedDoctor.specialization}</dd></div>
                      <div><dt>Department</dt><dd>{selectedDoctor.department}</dd></div>
                      <div><dt>Experience</dt><dd>{selectedDoctor.experience} years</dd></div>
                      <div><dt>Available Time</dt><dd>{selectedDoctor.availableTime || '-'}</dd></div>
                      <div><dt>Profile Status</dt><dd>{selectedDoctor.status === 'active' ? 'Active' : 'Inactive'}</dd></div>
                    </dl>
                  </article>
                </div>

                <article className="profile-section">
                  <h4>Weekly Schedule</h4>
                  <div className="schedule-table-wrap">
                    <table className="profile-schedule-table">
                      <thead>
                        <tr>
                          <th>Day</th>
                          <th>Time</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedDoctor.scheduleRows.map((row) => (
                          <tr key={`${selectedDoctor.id}-${row.day}`}>
                            <td>{row.day}</td>
                            <td>{row.time || '-'}</td>
                            <td>
                              <span className={`status-badge ${row.active ? 'status-active' : 'status-inactive'}`}>
                                {row.active ? 'Working' : 'Leave / Off'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </article>

                <article className="profile-section">
                  <h4>Certificates & Files</h4>
                  <div className="certificate-grid">
                    {selectedDoctor.certificateFiles.length > 0 ? (
                      selectedDoctor.certificateFiles.map((certificate) => (
                        <div key={certificate.name} className="certificate-card">
                          <strong>{certificate.name}</strong>
                          <span>{certificate.url ? 'Uploaded' : 'No file data'}</span>
                        </div>
                      ))
                    ) : (
                      <p className="muted-text">No certificates uploaded yet.</p>
                    )}
                  </div>
                </article>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {deleteTarget ? (
        <div className="modal-overlay">
          <div className="modal-card delete-modal">
            <div className="modal-header">
              <div>
                <p className="eyebrow">Delete Doctor</p>
                <h3>Confirm removal</h3>
              </div>
            </div>

            <p className="delete-copy">
              Are you sure you want to delete this doctor? <strong>{deleteTarget.fullName}</strong>
            </p>

            <div className="modal-actions">
              <button type="button" className="secondary-btn" onClick={() => setDeleteTarget(null)}>
                Cancel
              </button>
              <button type="button" className="danger-btn" onClick={handleDelete}>
                Delete Doctor
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default AdminDoctors
