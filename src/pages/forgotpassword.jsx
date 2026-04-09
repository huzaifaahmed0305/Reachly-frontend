/**
 * NEW — ForgotPassword.jsx — src/pages/ForgotPassword.jsx
 * Add to App.jsx:
 *   import ForgotPassword from './pages/ForgotPassword'
 *   <Route path="/forgot-password" element={<ForgotPassword />} />
 */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import s from './Auth.module.css'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      await api.post('/auth/forgot-password', { email })
      setSent(true)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send reset email')
    } finally { setLoading(false) }
  }

  if (sent) return (
    <div className={s.page}>
      <div className={s.card}>
        <div className={s.logo}>Reachly</div>
        <div className={s.successIcon}>✉️</div>
        <h1>Check your email</h1>
        <p className={s.sub}>We sent a password reset link to <strong style={{color:'#C8A97E'}}>{email}</strong></p>
        <Link to="/login" className={s.btn} style={{display:'block', textAlign:'center', marginTop:24}}>
          Back to Login
        </Link>
      </div>
    </div>
  )

  return (
    <div className={s.page}>
      <div className={s.card}>
        <div className={s.logo}>Reachly</div>
        <h1>Reset password</h1>
        <p className={s.sub}>Enter your email and we'll send a reset link</p>
        {error && <div className={s.error}>{error}</div>}
        <form onSubmit={submit} className={s.form}>
          <div className={s.field}>
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com" required/>
          </div>
          <button type="submit" className={s.btn} disabled={loading}>
            {loading ? <span className="spinner"/> : 'Send reset link'}
          </button>
        </form>
        <p className={s.footer}><Link to="/login">← Back to login</Link></p>
      </div>
    </div>
  )
}
