// Firestore Admin Repository - CRUD operations

import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
  type QueryConstraint,
} from 'firebase/firestore'
import { db } from '../firebase'
import type { Admin, AdminInput, AdminUpdate } from '../models/Admin'

const COLLECTION_NAME = 'admins'

export const createAdmin = async (adminInput: AdminInput): Promise<Admin> => {
  const now = Date.now()
  const adminRef = doc(collection(db, COLLECTION_NAME))

  const admin: Admin = {
    ...adminInput,
    createdAt: now,
    updatedAt: now,
  }

  await setDoc(adminRef, admin)

  return {
    ...admin,
    id: adminRef.id,
  }
}

export const getAdminById = async (adminId: string): Promise<Admin | null> => {
  try {
    const adminRef = doc(db, COLLECTION_NAME, adminId)
    const adminSnap = await getDoc(adminRef)

    if (!adminSnap.exists()) {
      return null
    }

    return {
      id: adminSnap.id,
      ...adminSnap.data(),
    } as Admin
  } catch (error) {
    console.error('Error getting admin:', error)
    return null
  }
}

export const getAdminByEmail = async (email: string): Promise<Admin | null> => {
  try {
    const adminQuery = query(collection(db, COLLECTION_NAME), where('email', '==', email))
    const adminSnap = await getDocs(adminQuery)

    if (adminSnap.empty) {
      return null
    }

    const adminDoc = adminSnap.docs[0]
    return {
      id: adminDoc.id,
      ...adminDoc.data(),
    } as Admin
  } catch (error) {
    console.error('Error getting admin by email:', error)
    return null
  }
}

export const getAllAdmins = async (
  filters?: {
    role?: string
    status?: string
    limit?: number
  },
): Promise<Admin[]> => {
  try {
    const constraints: QueryConstraint[] = []

    if (filters?.role) {
      constraints.push(where('role', '==', filters.role))
    }

    if (filters?.status) {
      constraints.push(where('status', '==', filters.status))
    }

    constraints.push(orderBy('createdAt', 'desc'))

    if (filters?.limit) {
      constraints.push(limit(filters.limit))
    }

    const adminQuery = query(collection(db, COLLECTION_NAME), ...constraints)
    const adminsSnap = await getDocs(adminQuery)

    return adminsSnap.docs.map((adminDoc) => ({
      id: adminDoc.id,
      ...adminDoc.data(),
    })) as Admin[]
  } catch (error) {
    console.error('Error getting all admins:', error)
    return []
  }
}

export const updateAdmin = async (adminId: string, updates: AdminUpdate): Promise<Admin | null> => {
  try {
    const adminRef = doc(db, COLLECTION_NAME, adminId)

    const updateData = {
      ...updates,
      updatedAt: Date.now(),
    }

    await updateDoc(adminRef, updateData)
    return getAdminById(adminId)
  } catch (error) {
    console.error('Error updating admin:', error)
    return null
  }
}

export const deleteAdmin = async (adminId: string): Promise<boolean> => {
  try {
    const adminRef = doc(db, COLLECTION_NAME, adminId)
    await deleteDoc(adminRef)
    return true
  } catch (error) {
    console.error('Error deleting admin:', error)
    return false
  }
}

export const updateAdminLastLogin = async (adminId: string): Promise<void> => {
  try {
    const adminRef = doc(db, COLLECTION_NAME, adminId)
    await updateDoc(adminRef, {
      lastLogin: Date.now(),
      updatedAt: Date.now(),
    })
  } catch (error) {
    console.error('Error updating last login:', error)
  }
}

export const adminExists = async (email: string): Promise<boolean> => {
  const admin = await getAdminByEmail(email)
  return admin !== null
}

export const countAdminsByRole = async (role: string): Promise<number> => {
  try {
    const adminQuery = query(collection(db, COLLECTION_NAME), where('role', '==', role))
    const adminsSnap = await getDocs(adminQuery)
    return adminsSnap.size
  } catch (error) {
    console.error('Error counting admins:', error)
    return 0
  }
}
