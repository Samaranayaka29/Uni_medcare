import 'dotenv/config'
import fs from 'fs'
import admin from 'firebase-admin'

const parseServiceAccount = () => {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    if (typeof parsed.private_key === 'string') {
      parsed.private_key = parsed.private_key.replace(/\\n/g, '\n')
    }
    return parsed
  } catch (err) {
    return null
  }
}

const serviceAccount = parseServiceAccount()

if (!serviceAccount) {
  console.error('FIREBASE_SERVICE_ACCOUNT_JSON is not set or invalid in environment (.env)')
  process.exit(1)
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id,
  })
}

const db = admin.firestore()

const run = async () => {
  try {
    const snap = await db.collection('admins').get()
    if (snap.empty) {
      console.log('No admin documents found in Firestore collection "admins"')
      return
    }

    console.log(`Found ${snap.size} admin document(s):`)
    snap.forEach((doc) => {
      const data = doc.data()
      console.log('---')
      console.log('id:', doc.id)
      console.log('email:', data.email)
      console.log('role:', data.role)
      console.log('createdAt:', data.createdAt)
      console.log('updatedAt:', data.updatedAt)
    })
  } catch (err) {
    console.error('Error listing admins:', err)
    process.exit(2)
  }
}

void run()
