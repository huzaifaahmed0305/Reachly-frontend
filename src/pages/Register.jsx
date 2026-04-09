/**
 * FIXED Register.jsx — src/pages/Register.jsx
 * Replaces your existing Register.jsx
 * Added: email verification notice, better errors
 */
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
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters')
      setLoading(false); return
    }

    try {
      await register(form)
      setSuccess(true)
    } catch (err) {
      const msg = err.response?.data?.error
        || err.response?.data?.errors?.[0]?.msg
        || 'Registration failed. Please try again.'
      setError(msg)
    } finally { setLoading(false) }
  }

  // Success screen — email verification sent
  if (success) {
    return (
      <div className={s.page}>
        <div className={s.card}>
          <div className={s.logo}>Reachly</div>
          <div className={s.successIcon}>✉️</div>
          <h1>Check your email</h1>
          <p className={s.sub}>
            We sent a verification link to<br/>
            <strong style={{color:'#C8A97E'}}>{form.email}</strong>
          </p>
          <p className={s.sub} style={{marginTop:12}}>
            Click the link in the email to verify your account and start using Reachly.
          </p>
          <div className={s.verifyNote}>
            Didn't receive it? Check your spam folder or{' '}
            <button className={s.resendBtn} onClick={async () => {
              try {
                const api = (await import('../lib/api')).default
                await api.post('/auth/resend-verification', { email: form.email })
                alert('Verification email resent!')
              } catch { alert('Could not resend. Try again later.') }
            }}>
              click here to resend
            </button>
          </div>
          <Link to="/login" className={s.btn} style={{display:'block', textAlign:'center', marginTop:20}}>
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={s.page}>
      <div className={s.card}>
        <div className={s.logo}>Reachly</div>
        <h1>Create account</h1>
        <p className={s.sub}>Join the platform</p>

        {error && <div className={s.error}>{error}</div>}

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
            <input name="name" value={form.name} onChange={handleChange}
              placeholder="Ahmed Raza" required minLength={2}/>
          </div>
          <div className={s.field}>
            <label>Email</label>
            <input name="email" type="email" value={form.email}
              onChange={handleChange} placeholder="you@example.com" required/>
          </div>
          {form.role === 'influencer' && (
            <div className={s.field}>
              <label>Username / Handle</label>
              <input name="handle" value={form.handle} onChange={handleChange}
                placeholder="ahmedraza"
                pattern="[a-z0-9_]+"
                title="Only lowercase letters, numbers and underscores"/>
              <div style={{fontSize:11, color:'#605850', marginTop:4}}>
                Your booking link: reachly.pk/creator/{form.handle || 'yourname'}
              </div>
            </div>
          )}
          <div className={s.field}>
            <label>Password</label>
            <input name="password" type="password" value={form.password}
              onChange={handleChange} placeholder="Min. 8 characters" required minLength={8}/>
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
