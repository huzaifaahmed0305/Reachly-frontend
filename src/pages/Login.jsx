import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import s from './Auth.module.css'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      if (user.role === 'influencer') {
        navigate('/dashboard')
      } else {
        navigate('/explore')
      }
    } catch (err) {
      console.error('[LOGIN ERROR]', err)
      const msg =
        err.response?.data?.error ||
        err.message ||
        'Login failed. Please try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={s.page}>
      <div className={s.card}>
        <div className={s.logo}>Reachly</div>
        <h1>Welcome back</h1>
        <p className={s.sub}>Sign in to your account</p>

        {error && <div className={s.error}>{error}</div>}

        <form onSubmit={submit} className={s.form}>
          <div className={s.field}>
            <label>Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@gmail.com"
              required
            />
          </div>
          <div className={s.field}>
            <label>Password</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>
          <button type="submit" className={s.btn} disabled={loading}>
            {loading ? <span className="spinner" /> : 'Sign in'}
          </button>
        </form>

        <p className={s.footer}>
          No account? <Link to="/register">Create one free</Link>
        </p>
      </div>
    </div>
  )
}
