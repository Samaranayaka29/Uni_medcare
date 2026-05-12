const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000'

export const getAdminToken = () => {
  return localStorage.getItem('adminToken')
}

export const setAdminToken = (token: string) => {
  localStorage.setItem('adminToken', token)
}

export const clearAdminToken = () => {
  localStorage.removeItem('adminToken')
}

export const verifyAdminToken = async () => {
  const token = getAdminToken()

  if (!token) {
    return null
  }

  try {
    const response = await fetch(`${API_URL}/api/admin/me`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (response.ok) {
      const data = await response.json()
      return data.admin
    }

    clearAdminToken()
    return null
  } catch (error) {
    console.error('Error verifying admin token:', error)
    clearAdminToken()
    return null
  }
}
