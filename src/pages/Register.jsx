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

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const user = await register(form)
      navigate(user.role === 'influencer' ? '/dashboard' : '/explore')
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Registration failed')
    } finally { setLoading(false) }
  }

  return (
    <div className={s.page}>
      <div className={s.card}>
        <div className={s.logo}>Reachly</div>
        <h1>Create account</h1>
        <p className={s.sub}>Join the platform</p>

        {error && <div className={s.error}>{error}</div>}

        <div className={s.roleToggle}>
          {['follower','influencer'].map(r => (
            <button key={r} type="button"
              className={form.role === r ? s.roleActive : s.roleBtn}
              onClick={() => setForm(f => ({...f, role: r}))}>
              {r === 'follower' ? '👤 Fan / Follower' : '⭐ I\'m a Creator'}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className={s.form}>
          <div className={s.field}>
            <label>Full name</label>
            <input name="name" value={form.name} onChange={handle} placeholder="Ahmed Raza" required />
          </div>
          <div className={s.field}>
            <label>Email</label>
            <input name="email" type="email" value={form.email} onChange={handle} placeholder="you@example.com" required />
          </div>
          {form.role === 'influencer' && (
            <div className={s.field}>
              <label>Username / Handle</label>
              <input name="handle" value={form.handle} onChange={handle} placeholder="ahmedraza" />
            </div>
          )}
          <div className={s.field}>
            <label>Password</label>
            <input name="password" type="password" value={form.password} onChange={handle} placeholder="Min. 8 characters" required />
          </div>
          <button type="submit" className={s.btn} disabled={loading}>
            {loading ? <span className="spinner"/> : 'Create account'}
          </button>
        </form>

        <p className={s.footer}>Already have an account? <Link to="/login">Sign in</Link></p>
      </div>
    </div>
  )
}
