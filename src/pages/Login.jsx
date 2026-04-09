/**
 * FIXED Login.jsx — src/pages/Login.jsx
 * Added: email not verified message, forgot password link, better errors
 */
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import s from './Auth.module.css'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [notVerified, setNotVerified] = useState(false)
  const [loading, setLoading] = useState(false)
  const [resent, setResent] = useState(false)

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setError(''); setNotVerified(false); setLoading(true)
    try {
      const user = await login(form.email, form.password)
      navigate(user.role === 'influencer' ? '/onboarding' : '/explore')
    } catch (err) {
      const data = err.response?.data
      if (data?.email_not_verified) {
        setNotVerified(true)
      } else {
        setError(data?.error || 'Login failed. Please try again.')
      }
    } finally { setLoading(false) }
  }

  const resendVerification = async () => {
    try {
      const api = (await import('../lib/api')).default
      await api.post('/auth/resend-verification', { email: form.email })
      setResent(true)
    } catch { setError('Could not resend verification email. Try again.') }
  }

  return (
    <div className={s.page}>
      <div className={s.card}>
        <div className={s.logo}>Reachly</div>
        <h1>Welcome back</h1>
        <p className={s.sub}>Sign in to your account</p>

        {error && <div className={s.error}>{error}</div>}

        {notVerified && (
          <div className={s.warningBox}>
            <div style={{fontWeight:500, marginBottom:6}}>Email not verified</div>
            Please verify your email before logging in.{' '}
            {resent ? (
              <span style={{color:'#4CAF8A'}}>Verification email sent!</span>
            ) : (
              <button className={s.resendBtn} onClick={resendVerification}>
                Resend verification email
              </button>
            )}
          </div>
        )}

        <form onSubmit={submit} className={s.form}>
          <div className={s.field}>
            <label>Email</label>
            <input name="email" type="email" value={form.email}
              onChange={handleChange} placeholder="you@example.com" required/>
          </div>
          <div className={s.field}>
            <label>Password</label>
            <input name="password" type="password" value={form.password}
              onChange={handleChange} placeholder="••••••••" required/>
          </div>
          <div style={{textAlign:'right', marginTop:-8, marginBottom:8}}>
            <Link to="/forgot-password" style={{fontSize:12, color:'#9A9080'}}>
              Forgot password?
            </Link>
          </div>
          <button type="submit" className={s.btn} disabled={loading}>
            {loading ? <span className="spinner"/> : 'Sign in'}
          </button>
        </form>

        <p className={s.footer}>No account? <Link to="/register">Create one free</Link></p>
      </div>
    </div>
  )
}
