// Admin Database Model for Firestore

export interface Admin {
  id?: string // Document ID from Firestore
  name: string
  email: string
  passwordHash: string // Never store plain passwords
  role: 'super-admin' | 'admin' | 'moderator'
  status: 'active' | 'inactive' | 'suspended'
  permissions: string[] // Array of permission strings
  createdAt: number // Timestamp
  updatedAt: number // Timestamp
  lastLogin?: number // Optional last login timestamp
  metadata?: {
    department?: string
    phone?: string
    avatar?: string
    bio?: string
  }
}

// Default admin roles and their permissions
export const ADMIN_ROLES = {
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
  'admin': [
    'manage-users',
    'manage-doctors',
    'manage-appointments',
    'manage-records',
    'manage-reports',
    'view-analytics',
  ],
  'moderator': [
    'view-users',
    'view-appointments',
    'view-records',
    'manage-appointments',
  ],
}

// Type for creating a new admin (without id and timestamps)
export type AdminInput = Omit<Admin, 'id' | 'createdAt' | 'updatedAt'>

// Type for updating an admin
export type AdminUpdate = Partial<Omit<Admin, 'id' | 'createdAt'>>
