import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

// Axios interceptor — attach token to every request
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('reachly_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('reachly_user')
    const token  = localStorage.getItem('reachly_token')
    if (stored && token) {
      try { setUser(JSON.parse(stored)) } catch { localStorage.clear() }
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const { data } = await axios.post(`${API_URL}/auth/login`, { email, password })
    localStorage.setItem('reachly_token', data.token)
    localStorage.setItem('reachly_user', JSON.stringify(data.user))
    setUser(data.user)
    return data.user
  }

  const register = async (payload) => {
    const { data } = await axios.post(`${API_URL}/auth/register`, payload)
    localStorage.setItem('reachly_token', data.token)
    localStorage.setItem('reachly_user', JSON.stringify(data.user))
    setUser(data.user)
    return data.user
  }

  const logout = () => {
    localStorage.removeItem('reachly_token')
    localStorage.removeItem('reachly_user')
    setUser(null)
    window.location.href = '/'
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
