import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import admin from 'firebase-admin'

const app = express()
const port = Number(process.env.PORT ?? 5000)
const DATABASE_TIMEOUT_MS = Number(process.env.FIREBASE_DATABASE_TIMEOUT_MS ?? 10000)

app.use(cors())
app.use(express.json())

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
  console.warn('Firebase Admin service account is missing. Set FIREBASE_SERVICE_ACCOUNT_JSON in .env to enable backend data routes.')
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

const requireFirebase = (_req, res, next) => {
  if (hasServiceAccount) {
    next()
    return
  }

  res.status(503).json({
    error: 'Firebase backend is not configured. Add FIREBASE_SERVICE_ACCOUNT_JSON to .env and restart the backend.',
  })
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'unimed-backend' })
})

app.use('/api/users', requireFirebase)
app.use('/api/appointments', requireFirebase)
app.use('/api/records', requireFirebase)

app.post('/api/users', async (req, res) => {
  try {
    const { uid, name, email, age, studentId, faculty, phone } = req.body

    if (!email || !name) {
      res.status(400).json({ error: 'name and email are required' })
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

app.post('/api/appointments', async (req, res) => {
  try {
    const { patient, doctor, condition, date, slot, room, severity } = req.body

    if (!patient || !doctor || !date) {
      res.status(400).json({ error: 'patient, doctor, and date are required' })
      return
    }

    const ref = db.ref('appointments').push()
    const payload = {
      patient,
      doctor,
      condition: condition ?? '',
      date,
      slot: slot ?? '',
      room: room ?? '',
      severity: severity ?? 'pending',
      createdAt: Date.now(),
    }

    await withTimeout(ref.set(payload), 'Save appointment')
    res.status(201).json({ id: ref.key, ...payload })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to save appointment'
    res.status(500).json({ error: message })
  }
})

app.get('/api/appointments', async (_req, res) => {
  try {
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

app.post('/api/records', async (req, res) => {
  try {
    const { patientId, diagnosis, doctorNotes, date } = req.body

    if (!patientId || !diagnosis) {
      res.status(400).json({ error: 'patientId and diagnosis are required' })
      return
    }

    const ref = db.ref('records').push()
    const payload = {
      patientId,
      diagnosis,
      doctorNotes: doctorNotes ?? '',
      date: date ?? new Date().toISOString().slice(0, 10),
      createdAt: Date.now(),
    }

    await withTimeout(ref.set(payload), 'Save medical record')
    res.status(201).json({ id: ref.key, ...payload })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to save medical record'
    res.status(500).json({ error: message })
  }
})

app.get('/api/records', async (_req, res) => {
  try {
    const snapshot = await withTimeout(db.ref('records').get(), 'Load medical records')

    if (!snapshot.exists()) {
      res.json([])
      return
    }

    const values = snapshot.val()
    const records = Object.entries(values).map(([id, value]) => ({ id, ...value }))
    res.json(records)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load medical records'
    res.status(500).json({ error: message })
  }
})

app.listen(port, () => {
  console.log(`Backend API running on http://localhost:${port}`)
})
