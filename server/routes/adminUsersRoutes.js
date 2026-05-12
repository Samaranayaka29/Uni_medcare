import { Router } from 'express'
import admin from 'firebase-admin'
import bcrypt from 'bcryptjs'

const ADMIN_ROLES = {
  'super-admin': [
    'manage-admins',
    'manage-users',
    'manage-doctors',
    'manage-appointments',
    'manage-records',
    'manage-reports',
    'manage-settings',
    'manage-system',
    'view-analytics',
    'manage-permissions',
  ],
  admin: [
    'manage-users',
    'manage-doctors',
    'manage-appointments',
    'manage-records',
    'manage-reports',
    'view-analytics',
  ],
  moderator: ['view-users', 'view-appointments', 'view-records', 'manage-appointments'],
}

const router = Router()
const getDb = () => admin.firestore()

// Get all admins
router.get('/users', async (req, res) => {
  try {
    const db = getDb()
    const snapshot = await db.collection('admins').orderBy('createdAt', 'desc').get()

    if (snapshot.empty) {
      res.json([])
      return
    }

    const admins = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    res.json(admins)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch admins'
    res.status(500).json({ error: message })
  }
})

// Get admin by ID
router.get('/users/:id', async (req, res) => {
  try {
    const db = getDb()
    const { id } = req.params
    const doc = await db.collection('admins').doc(id).get()

    if (!doc.exists) {
      res.status(404).json({ error: 'Admin not found' })
      return
    }

    res.json({
      id: doc.id,
      ...doc.data(),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch admin'
    res.status(500).json({ error: message })
  }
})

// Create admin user
router.post('/users', async (req, res) => {
  try {
    const db = getDb()
    const { name, email, password, role, status, permissions, metadata } = req.body

    if (!email || !password || !name) {
      res.status(400).json({ error: 'name, email, and password are required' })
      return
    }

    if (!Object.keys(ADMIN_ROLES).includes(role || 'admin')) {
      res.status(400).json({ error: 'Invalid role' })
      return
    }

    // Check if admin already exists
    const existingAdmin = await db.collection('admins').where('email', '==', email).limit(1).get()

    if (!existingAdmin.empty) {
      res.status(409).json({ error: 'Admin with this email already exists' })
      return
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    const adminData = {
      name,
      email,
      passwordHash,
      role: role || 'admin',
      status: status || 'active',
      permissions: permissions || ADMIN_ROLES[role || 'admin'] || [],
      metadata: metadata || {},
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }

    const docRef = await db.collection('admins').add(adminData)

    res.status(201).json({
      id: docRef.id,
      ...adminData,
      passwordHash: undefined, // Don't send password hash to client
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create admin'
    res.status(500).json({ error: message })
  }
})

// Update admin
router.put('/users/:id', async (req, res) => {
  try {
    const db = getDb()
    const { id } = req.params
    const { name, role, status, permissions, metadata } = req.body

    // Check if admin exists
    const adminDoc = await db.collection('admins').doc(id).get()

    if (!adminDoc.exists) {
      res.status(404).json({ error: 'Admin not found' })
      return
    }

    const updateData = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }

    if (name !== undefined) updateData.name = name
    if (role !== undefined) {
      if (!Object.keys(ADMIN_ROLES).includes(role)) {
        res.status(400).json({ error: 'Invalid role' })
        return
      }
      updateData.role = role
    }
    if (status !== undefined) updateData.status = status
    if (permissions !== undefined) updateData.permissions = permissions
    if (metadata !== undefined) updateData.metadata = metadata

    await db.collection('admins').doc(id).update(updateData)

    const updatedDoc = await db.collection('admins').doc(id).get()

    res.json({
      id: updatedDoc.id,
      ...updatedDoc.data(),
      passwordHash: undefined,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update admin'
    res.status(500).json({ error: message })
  }
})

// Delete admin
router.delete('/users/:id', async (req, res) => {
  try {
    const db = getDb()
    const { id } = req.params

    // Check if admin exists
    const adminDoc = await db.collection('admins').doc(id).get()

    if (!adminDoc.exists) {
      res.status(404).json({ error: 'Admin not found' })
      return
    }

    await db.collection('admins').doc(id).delete()

    res.json({ message: 'Admin deleted successfully' })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete admin'
    res.status(500).json({ error: message })
  }
})

// Change admin password
router.post('/users/:id/change-password', async (req, res) => {
  try {
    const db = getDb()
    const { id } = req.params
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: 'currentPassword and newPassword are required' })
      return
    }

    const adminDoc = await db.collection('admins').doc(id).get()

    if (!adminDoc.exists) {
      res.status(404).json({ error: 'Admin not found' })
      return
    }

    const adminData = adminDoc.data()

    // Verify current password
    const passwordMatch = await bcrypt.compare(currentPassword, adminData?.passwordHash || '')

    if (!passwordMatch) {
      res.status(401).json({ error: 'Current password is incorrect' })
      return
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 12)

    await db.collection('admins').doc(id).update({
      passwordHash: newPasswordHash,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    })

    res.json({ message: 'Password changed successfully' })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to change password'
    res.status(500).json({ error: message })
  }
})

// Update last login
router.post('/users/:id/last-login', async (req, res) => {
  try {
    const db = getDb()
    const { id } = req.params

    await db.collection('admins').doc(id).update({
      lastLogin: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    })

    res.json({ message: 'Last login updated' })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update last login'
    res.status(500).json({ error: message })
  }
})

export default router
