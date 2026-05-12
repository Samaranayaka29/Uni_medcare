import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import admin from 'firebase-admin'
import fs from 'fs'
import path from 'path'
import https from 'https'
import multer from 'multer'
import { fileURLToPath } from 'url'
import adminRoutes from './routes/adminRoutes.js'
import adminUsersRoutes from './routes/adminUsersRoutes.js'
import { verifyAdmin, requireRoles } from './middleware/adminAuth.js'

const app = express()
const port = Number(process.env.PORT ?? 5000)
const DATABASE_TIMEOUT_MS = Number(process.env.FIREBASE_DATABASE_TIMEOUT_MS ?? 10000)
const ENABLE_HTTPS = String(process.env.ENABLE_HTTPS ?? 'false').toLowerCase() === 'true'
const HTTPS_KEY_PATH = process.env.HTTPS_KEY_PATH ?? ''
const HTTPS_CERT_PATH = process.env.HTTPS_CERT_PATH ?? ''

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const uploadRoot = path.join(__dirname, 'uploads', 'medical')

if (!fs.existsSync(uploadRoot)) {
  fs.mkdirSync(uploadRoot, { recursive: true })
}

app.use(cors())
app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

const parseServiceAccount = () => {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw)
    if (typeof parsed.private_key === 'string') {
      parsed.private_key = parsed.private_key.replace(/\\n/g, '\n')
    }
    return parsed
  } catch {
    return null
  }
}

const serviceAccount = parseServiceAccount()
const hasServiceAccount = Boolean(serviceAccount)

if (!hasServiceAccount) {
  console.warn('Firebase Admin service account is missing. Using in-memory fallback for doctors, appointments, and records modules.')
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: serviceAccount ? admin.credential.cert(serviceAccount) : admin.credential.applicationDefault(),
    databaseURL: process.env.FIREBASE_DATABASE_URL ?? 'https://uni-med-care-default-rtdb.firebaseio.com',
  })
}

const db = admin.database()

const withTimeout = (promise, label) =>
  Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`${label} timed out after ${DATABASE_TIMEOUT_MS}ms`)), DATABASE_TIMEOUT_MS)
    }),
  ])

const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0
const parsePositiveNumber = (value, defaultValue = 0) => {
  const parsed = Number(value)
  if (Number.isFinite(parsed) && parsed >= 0) {
    return parsed
  }
  return defaultValue
}

const appointmentStatuses = new Set(['Pending', 'Approved', 'Completed', 'Cancelled'])
const allowedRecordMimes = new Set(['application/pdf', 'image/png', 'image/jpeg'])
const maxUploadBytes = 5 * 1024 * 1024

const doctorsStore = new Map()
const appointmentsStore = new Map()
const reportsStore = new Map()
const prescriptionsStore = new Map()
const labResultsStore = new Map()

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadRoot),
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')
    cb(null, `${Date.now()}_${safeName}`)
  },
})

const uploadMedicalFile = multer({
  storage,
  limits: { fileSize: maxUploadBytes },
  fileFilter: (_req, file, cb) => {
    if (!allowedRecordMimes.has(file.mimetype)) {
      cb(new Error('Invalid file type. Allowed: PDF, PNG, JPG'))
      return
    }
    cb(null, true)
  },
})

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'unimed-backend', https: ENABLE_HTTPS })
})

app.use('/api/admin', adminRoutes)
app.use('/api/admin/users', verifyAdmin, requireRoles(['SuperAdmin']), adminUsersRoutes)

app.use('/api/doctors', verifyAdmin)
app.use('/api/appointments', verifyAdmin)
app.use('/api/records', verifyAdmin)
app.use('/api/admin/analytics', verifyAdmin)

app.post('/api/users', async (req, res) => {
  try {
    const { uid, name, email, age, studentId, faculty, phone } = req.body

    if (!isNonEmptyString(email) || !isNonEmptyString(name)) {
      res.status(400).json({ error: 'name and email are required' })
      return
    }

    if (!hasServiceAccount) {
      res.status(503).json({ error: 'Firebase backend is not configured for users.' })
      return
    }

    const ref = db.ref('users').push()
    const payload = {
      uid: uid ?? null,
      name,
      email,
      age: typeof age === 'number' ? age : null,
      studentId: studentId ?? null,
      faculty: faculty ?? null,
      phone: phone ?? null,
      createdAt: Date.now(),
    }

    await withTimeout(ref.set(payload), 'Save user')
    res.status(201).json({ id: ref.key, ...payload })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to save user'
    res.status(500).json({ error: message })
  }
})

app.get('/api/users', async (_req, res) => {
  try {
    if (!hasServiceAccount) {
      res.json([])
      return
    }

    const snapshot = await withTimeout(db.ref('users').get(), 'Load users')

    if (!snapshot.exists()) {
      res.json([])
      return
    }

    const values = snapshot.val()
    const users = Object.entries(values).map(([id, value]) => ({ id, ...value }))
    res.json(users)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load users'
    res.status(500).json({ error: message })
  }
})

app.post('/api/doctors', requireRoles(['SuperAdmin', 'Receptionist']), async (req, res) => {
  try {
    const { name, specialization, email, phone, hospital, experience, status } = req.body

    if (!isNonEmptyString(name) || !isNonEmptyString(specialization) || !isNonEmptyString(email)) {
      res.status(400).json({ error: 'name, specialization, and email are required' })
      return
    }

    const payload = {
      name: name.trim(),
      specialization: specialization.trim(),
      email: email.trim().toLowerCase(),
      phone: isNonEmptyString(phone) ? phone.trim() : '',
      hospital: isNonEmptyString(hospital) ? hospital.trim() : '',
      experience: parsePositiveNumber(experience),
      status: isNonEmptyString(status) ? status : 'available',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    if (!hasServiceAccount) {
      const id = `doc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
      doctorsStore.set(id, payload)
      res.status(201).json({ id, ...payload })
      return
    }

    const ref = db.ref('doctors').push()
    await withTimeout(ref.set(payload), 'Save doctor')
    res.status(201).json({ id: ref.key, ...payload })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to save doctor'
    res.status(500).json({ error: message })
  }
})

app.get('/api/doctors', requireRoles(['SuperAdmin', 'Receptionist', 'Doctor']), async (_req, res) => {
  try {
    if (!hasServiceAccount) {
      const doctors = Array.from(doctorsStore.entries()).map(([id, value]) => ({ id, ...value }))
      res.json(doctors)
      return
    }

    const snapshot = await withTimeout(db.ref('doctors').get(), 'Load doctors')
    if (!snapshot.exists()) {
      res.json([])
      return
    }

    const values = snapshot.val()
    const doctors = Object.entries(values).map(([id, value]) => ({ id, ...value }))
    res.json(doctors)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load doctors'
    res.status(500).json({ error: message })
  }
})

app.put('/api/doctors/:id', requireRoles(['SuperAdmin', 'Receptionist']), async (req, res) => {
  try {
    const { id } = req.params
    const { name, specialization, email, phone, hospital, experience, status } = req.body

    if (!isNonEmptyString(name) || !isNonEmptyString(specialization) || !isNonEmptyString(email)) {
      res.status(400).json({ error: 'name, specialization, and email are required' })
      return
    }

    if (!hasServiceAccount) {
      const existing = doctorsStore.get(id)
      if (!existing) {
        res.status(404).json({ error: 'Doctor not found' })
        return
      }

      const payload = {
        name: name.trim(),
        specialization: specialization.trim(),
        email: email.trim().toLowerCase(),
        phone: isNonEmptyString(phone) ? phone.trim() : '',
        hospital: isNonEmptyString(hospital) ? hospital.trim() : '',
        experience: parsePositiveNumber(experience),
        status: isNonEmptyString(status) ? status : 'available',
        updatedAt: Date.now(),
      }

      doctorsStore.set(id, { ...existing, ...payload })
      res.json({ id, ...existing, ...payload })
      return
    }

    const ref = db.ref(`doctors/${id}`)
    const snapshot = await withTimeout(ref.get(), 'Load doctor')
    if (!snapshot.exists()) {
      res.status(404).json({ error: 'Doctor not found' })
      return
    }

    const payload = {
      name: name.trim(),
      specialization: specialization.trim(),
      email: email.trim().toLowerCase(),
      phone: isNonEmptyString(phone) ? phone.trim() : '',
      hospital: isNonEmptyString(hospital) ? hospital.trim() : '',
      experience: parsePositiveNumber(experience),
      status: isNonEmptyString(status) ? status : 'available',
      updatedAt: Date.now(),
    }

    await withTimeout(ref.update(payload), 'Update doctor')
    res.json({ id, ...snapshot.val(), ...payload })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update doctor'
    res.status(500).json({ error: message })
  }
})

app.delete('/api/doctors/:id', requireRoles(['SuperAdmin']), async (req, res) => {
  try {
    const { id } = req.params

    if (!hasServiceAccount) {
      const existed = doctorsStore.delete(id)
      if (!existed) {
        res.status(404).json({ error: 'Doctor not found' })
        return
      }

      res.json({ message: 'Doctor deleted successfully' })
      return
    }

    const ref = db.ref(`doctors/${id}`)
    const snapshot = await withTimeout(ref.get(), 'Load doctor')
    if (!snapshot.exists()) {
      res.status(404).json({ error: 'Doctor not found' })
      return
    }

    await withTimeout(ref.remove(), 'Delete doctor')
    res.json({ message: 'Doctor deleted successfully' })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete doctor'
    res.status(500).json({ error: message })
  }
})

app.post('/api/appointments', requireRoles(['SuperAdmin', 'Receptionist']), async (req, res) => {
  try {
    const { patientName, doctorName, date, time, reason, room, status } = req.body

    if (!isNonEmptyString(patientName) || !isNonEmptyString(doctorName) || !isNonEmptyString(date)) {
      res.status(400).json({ error: 'patientName, doctorName, and date are required' })
      return
    }

    const normalizedStatus = isNonEmptyString(status) ? status : 'Pending'
    if (!appointmentStatuses.has(normalizedStatus)) {
      res.status(400).json({ error: 'Invalid status value' })
      return
    }

    const payload = {
      patientName: patientName.trim(),
      doctorName: doctorName.trim(),
      date,
      time: isNonEmptyString(time) ? time : '',
      reason: isNonEmptyString(reason) ? reason : '',
      room: isNonEmptyString(room) ? room : '',
      status: normalizedStatus,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    if (!hasServiceAccount) {
      const id = `apt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
      appointmentsStore.set(id, payload)
      res.status(201).json({ id, ...payload })
      return
    }

    const ref = db.ref('appointments').push()
    await withTimeout(ref.set(payload), 'Save appointment')
    res.status(201).json({ id: ref.key, ...payload })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to save appointment'
    res.status(500).json({ error: message })
  }
})

app.get('/api/appointments', requireRoles(['SuperAdmin', 'Receptionist', 'Doctor']), async (_req, res) => {
  try {
    if (!hasServiceAccount) {
      const appointments = Array.from(appointmentsStore.entries()).map(([id, value]) => ({ id, ...value }))
      res.json(appointments)
      return
    }

    const snapshot = await withTimeout(db.ref('appointments').get(), 'Load appointments')
    if (!snapshot.exists()) {
      res.json([])
      return
    }

    const values = snapshot.val()
    const appointments = Object.entries(values).map(([id, value]) => ({ id, ...value }))
    res.json(appointments)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load appointments'
    res.status(500).json({ error: message })
  }
})

app.patch('/api/appointments/:id/status', requireRoles(['SuperAdmin', 'Receptionist', 'Doctor']), async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!isNonEmptyString(status) || !appointmentStatuses.has(status)) {
      res.status(400).json({ error: 'status must be Pending, Approved, Completed, or Cancelled' })
      return
    }

    if (!hasServiceAccount) {
      const existing = appointmentsStore.get(id)
      if (!existing) {
        res.status(404).json({ error: 'Appointment not found' })
        return
      }

      const updated = { ...existing, status, updatedAt: Date.now() }
      appointmentsStore.set(id, updated)
      res.json({ id, ...updated })
      return
    }

    const ref = db.ref(`appointments/${id}`)
    const snapshot = await withTimeout(ref.get(), 'Load appointment')
    if (!snapshot.exists()) {
      res.status(404).json({ error: 'Appointment not found' })
      return
    }

    const update = { status, updatedAt: Date.now() }
    await withTimeout(ref.update(update), 'Update appointment status')
    res.json({ id, ...snapshot.val(), ...update })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update appointment status'
    res.status(500).json({ error: message })
  }
})

app.post('/api/records/reports', requireRoles(['SuperAdmin', 'Doctor']), uploadMedicalFile.single('file'), (req, res) => {
  try {
    const { patientId, title, notes } = req.body
    if (!isNonEmptyString(patientId) || !isNonEmptyString(title)) {
      res.status(400).json({ error: 'patientId and title are required' })
      return
    }

    const id = `rep_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    const payload = {
      patientId: patientId.trim(),
      title: title.trim(),
      notes: isNonEmptyString(notes) ? notes.trim() : '',
      filePath: req.file ? `/uploads/medical/${req.file.filename}` : null,
      createdAt: Date.now(),
    }

    reportsStore.set(id, payload)
    res.status(201).json({ id, ...payload })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create report'
    res.status(500).json({ error: message })
  }
})

app.get('/api/records/reports', requireRoles(['SuperAdmin', 'Doctor', 'Receptionist']), (_req, res) => {
  const items = Array.from(reportsStore.entries()).map(([id, value]) => ({ id, ...value }))
  res.json(items)
})

app.post('/api/records/prescriptions', requireRoles(['SuperAdmin', 'Doctor']), uploadMedicalFile.single('file'), (req, res) => {
  try {
    const { patientId, medication, dosage, notes } = req.body
    if (!isNonEmptyString(patientId) || !isNonEmptyString(medication)) {
      res.status(400).json({ error: 'patientId and medication are required' })
      return
    }

    const id = `pre_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    const payload = {
      patientId: patientId.trim(),
      medication: medication.trim(),
      dosage: isNonEmptyString(dosage) ? dosage.trim() : '',
      notes: isNonEmptyString(notes) ? notes.trim() : '',
      filePath: req.file ? `/uploads/medical/${req.file.filename}` : null,
      createdAt: Date.now(),
    }

    prescriptionsStore.set(id, payload)
    res.status(201).json({ id, ...payload })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create prescription'
    res.status(500).json({ error: message })
  }
})

app.get('/api/records/prescriptions', requireRoles(['SuperAdmin', 'Doctor', 'Receptionist']), (_req, res) => {
  const items = Array.from(prescriptionsStore.entries()).map(([id, value]) => ({ id, ...value }))
  res.json(items)
})

app.post('/api/records/lab-results', requireRoles(['SuperAdmin', 'Doctor']), uploadMedicalFile.single('file'), (req, res) => {
  try {
    const { patientId, testName, result, notes } = req.body
    if (!isNonEmptyString(patientId) || !isNonEmptyString(testName)) {
      res.status(400).json({ error: 'patientId and testName are required' })
      return
    }

    const id = `lab_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    const payload = {
      patientId: patientId.trim(),
      testName: testName.trim(),
      result: isNonEmptyString(result) ? result.trim() : '',
      notes: isNonEmptyString(notes) ? notes.trim() : '',
      filePath: req.file ? `/uploads/medical/${req.file.filename}` : null,
      createdAt: Date.now(),
    }

    labResultsStore.set(id, payload)
    res.status(201).json({ id, ...payload })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create lab result'
    res.status(500).json({ error: message })
  }
})

app.get('/api/records/lab-results', requireRoles(['SuperAdmin', 'Doctor', 'Receptionist']), (_req, res) => {
  const items = Array.from(labResultsStore.entries()).map(([id, value]) => ({ id, ...value }))
  res.json(items)
})

app.get('/api/admin/analytics', requireRoles(['SuperAdmin', 'Doctor', 'Receptionist']), async (_req, res) => {
  try {
    const doctors = hasServiceAccount
      ? await withTimeout(db.ref('doctors').get(), 'Load doctors for analytics')
      : null
    const users = hasServiceAccount
      ? await withTimeout(db.ref('users').get(), 'Load users for analytics')
      : null
    const appointments = hasServiceAccount
      ? await withTimeout(db.ref('appointments').get(), 'Load appointments for analytics')
      : null

    const doctorList = hasServiceAccount && doctors?.exists()
      ? Object.values(doctors.val())
      : Array.from(doctorsStore.values())

    const userList = hasServiceAccount && users?.exists()
      ? Object.values(users.val())
      : []

    const appointmentList = hasServiceAccount && appointments?.exists()
      ? Object.values(appointments.val())
      : Array.from(appointmentsStore.values())

    const statusCount = { Pending: 0, Approved: 0, Completed: 0, Cancelled: 0 }
    appointmentList.forEach((item) => {
      const status = appointmentStatuses.has(item.status) ? item.status : 'Pending'
      statusCount[status] += 1
    })

    const appointmentStatus = Object.entries(statusCount).map(([name, count]) => ({ name, count }))

    const monthMap = new Map()
    userList.forEach((user) => {
      const ts = Number(user.createdAt)
      if (!Number.isFinite(ts)) return
      const d = new Date(ts)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      monthMap.set(key, (monthMap.get(key) ?? 0) + 1)
    })
    const patientGrowth = Array.from(monthMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, patients]) => ({ month, patients }))

    const specMap = new Map()
    doctorList.forEach((doc) => {
      const spec = isNonEmptyString(doc.specialization) ? doc.specialization : 'General'
      specMap.set(spec, (specMap.get(spec) ?? 0) + 1)
    })
    const doctorStatistics = Array.from(specMap.entries()).map(([specialization, count]) => ({
      specialization,
      count,
    }))

    res.json({ appointmentStatus, patientGrowth, doctorStatistics })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to generate analytics'
    res.status(500).json({ error: message })
  }
})

app.use((error, _req, res, _next) => {
  if (error instanceof multer.MulterError) {
    res.status(400).json({ error: error.message })
    return
  }

  if (error instanceof Error && error.message.includes('Invalid file type')) {
    res.status(400).json({ error: error.message })
    return
  }

  res.status(500).json({ error: 'Unexpected server error' })
})

const startServer = () => {
  if (ENABLE_HTTPS && HTTPS_KEY_PATH && HTTPS_CERT_PATH && fs.existsSync(HTTPS_KEY_PATH) && fs.existsSync(HTTPS_CERT_PATH)) {
    const credentials = {
      key: fs.readFileSync(HTTPS_KEY_PATH),
      cert: fs.readFileSync(HTTPS_CERT_PATH),
    }

    https.createServer(credentials, app).listen(port, () => {
      console.log(`Backend API running with HTTPS on https://localhost:${port}`)
    })
    return
  }

  app.listen(port, () => {
    console.log(`Backend API running on http://localhost:${port}`)
  })
}

startServer()
