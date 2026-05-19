import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const router = Router()

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@unimedcare.com'
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH ?? ''
const JWT_SECRET = process.env.JWT_SECRET ?? ''
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '8h'
const ADMIN_ROLE = process.env.ADMIN_ROLE ?? 'SuperAdmin'

const isAuthConfigured = () => ADMIN_PASSWORD_HASH.length > 0 && JWT_SECRET.trim().length >= 16

export const adminLogin = async (req, res) => {
  try {
    if (!isAuthConfigured()) {
      res.status(500).json({
        error: 'Admin auth is not configured. Set ADMIN_PASSWORD_HASH and a strong JWT_SECRET in your environment.',
      })
      return
    }

    const { email, password } = req.body ?? {}

    if (!email || !password) {
      res.status(400).json({ error: 'email and password are required' })
      return
    }

    if (email !== ADMIN_EMAIL) {
      res.status(401).json({ error: 'Invalid admin credentials' })
      return
    }

    const passwordIsValid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH)

    if (!passwordIsValid) {
      res.status(401).json({ error: 'Invalid admin credentials' })
      return
    }

    let token
    try {
      token = jwt.sign(
        {
          email,
          role: ADMIN_ROLE,
        },
        JWT_SECRET,
        {
          expiresIn: JWT_EXPIRES_IN,
        },
      )
    } catch (signError) {
      const message = signError instanceof Error ? signError.message : 'Failed to generate admin token'
      res.status(500).json({ error: message })
      return
    }

    res.json({
      message: 'Admin login successful',
      token,
      admin: {
        email,
        role: ADMIN_ROLE,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Admin login failed'
    res.status(500).json({ error: message })
  }
}

export const verifyAdminToken = (req, res, next) => {
  if (!isAuthConfigured()) {
    res.status(500).json({
      error: 'Admin auth is not configured. Set ADMIN_PASSWORD_HASH and a strong JWT_SECRET in your environment.',
    })
    return
  }

  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing admin token' })
    return
  }

  const token = authHeader.slice('Bearer '.length)

  try {
    const decoded = jwt.verify(token, JWT_SECRET)

    if (typeof decoded !== 'object' || decoded === null || typeof decoded.role !== 'string') {
      res.status(401).json({ error: 'Invalid admin token' })
      return
    }

    req.admin = decoded
    next()
  } catch {
    res.status(401).json({ error: 'Invalid admin token' })
  }
}

router.post('/login', adminLogin)

router.get('/me', verifyAdminToken, (req, res) => {
  res.json({ admin: req.admin })
})

export default router