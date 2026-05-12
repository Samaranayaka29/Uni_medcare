import jwt from 'jsonwebtoken'

/**
 * Middleware to verify admin JWT token from Authorization header
 * Expected format: Bearer <token>
 */
export const verifyAdmin = (req, res, next) => {
  const token = req.headers.authorization

  if (!token) {
    return res.status(401).json({
      message: 'Unauthorized - Missing token',
      error: 'Authorization header is required',
    })
  }

  // Extract token from "Bearer <token>" format
  const tokenValue = token.startsWith('Bearer ') ? token.slice('Bearer '.length) : token

  jwt.verify(tokenValue, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({
        message: 'Invalid token',
        error: err.message,
      })
    }

    req.admin = decoded
    next()
  })
}

/**
 * Middleware to check if admin has specific role
 * @param {string} requiredRole - Role required to access the route (e.g., 'super-admin')
 */
export const requireRole = (requiredRole) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        message: 'Unauthorized - No admin info',
      })
    }

    const actualRole = String(req.admin.role ?? '').toLowerCase()
    const neededRole = String(requiredRole).toLowerCase()

    if (actualRole !== neededRole) {
      return res.status(403).json({
        message: 'Forbidden - Insufficient permissions',
        required: requiredRole,
        actual: req.admin.role,
      })
    }

    next()
  }
}

/**
 * Middleware to check if admin has one of multiple roles
 * @param {string[]} allowedRoles - Array of roles allowed (e.g., ['super-admin', 'admin'])
 */
export const requireRoles = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        message: 'Unauthorized - No admin info',
      })
    }

    const actualRole = String(req.admin.role ?? '').toLowerCase()
    const normalizedAllowed = allowedRoles.map((role) => String(role).toLowerCase())

    if (!normalizedAllowed.includes(actualRole)) {
      return res.status(403).json({
        message: 'Forbidden - Insufficient permissions',
        allowed: allowedRoles,
        actual: req.admin.role,
      })
    }

    next()
  }
}

/**
 * Middleware to check if admin has specific permission
 * @param {string} permission - Permission required (e.g., 'manage-users')
 */
export const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        message: 'Unauthorized - No admin info',
      })
    }

    if (!req.admin.permissions || !req.admin.permissions.includes(permission)) {
      return res.status(403).json({
        message: 'Forbidden - Missing required permission',
        required: permission,
      })
    }

    next()
  }
}

export default verifyAdmin
