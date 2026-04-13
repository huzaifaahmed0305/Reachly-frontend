import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import s from './Auth.module.css'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    role: params.get('role') || 'follower',
    handle: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setError('')

    // Frontend validation
    if (!form.name.trim()) { setError('Please enter your name'); return }
    if (!form.email.trim()) { setError('Please enter your email'); return }
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return }

    setLoading(true)
    try {
      const user = await register(form)
      if (user.role === 'influencer') {
        navigate('/onboarding')
      } else {
        navigate('/explore')
      }
    } catch (err) {
      console.error('[REGISTER ERROR]', err)
      // Show the real error from backend
      const msg =
        err.response?.data?.error ||
        err.response?.data?.errors?.[0]?.msg ||
        err.message ||
        'Registration failed. Please try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={s.page}>
      <div className={s.card}>
        <div className={s.logo}>Reachly</div>
        <h1>Create account</h1>
        <p className={s.sub}>Join Pakistan's creator platform</p>

        {error && (
          <div className={s.error}>
            {error}
          </div>
        )}

        <div className={s.roleToggle}>
          {['follower', 'influencer'].map(r => (
            <button key={r} type="button"
              className={form.role === r ? s.roleActive : s.roleBtn}
              onClick={() => setForm(f => ({ ...f, role: r }))}>
              {r === 'follower' ? '👤 Fan / Follower' : '⭐ I\'m a Creator'}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className={s.form}>
          <div className={s.field}>
            <label>Full name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Ahmed Raza"
              required
            />
          </div>

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

          {form.role === 'influencer' && (
            <div className={s.field}>
              <label>Username (for your booking link)</label>
              <input
                name="handle"
                value={form.handle}
                onChange={handleChange}
                placeholder="ahmedraza"
              />
              <div style={{ fontSize: 11, color: '#605850', marginTop: 4 }}>
                reachly.pk/creator/{form.handle || 'yourname'}
              </div>
            </div>
          )}

          <div className={s.field}>
            <label>Password (min 8 characters)</label>
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
            {loading ? <span className="spinner" /> : 'Create account'}
          </button>
        </form>

        <p className={s.footer}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
