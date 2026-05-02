import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import s from './Auth.module.css'

export default function Login() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const [form, setForm]       = useState({ email:'', password:'' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const user = await login(form.email, form.password)
      if (user.role === 'influencer') navigate('/dashboard', { replace:true })
      else navigate('/home', { replace:true })
    } catch(err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.')
    } finally { setLoading(false) }
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
            <input type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} placeholder="you@gmail.com" required/>
          </div>
          <div className={s.field}>
            <label>Password</label>
            <input type="password" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} placeholder="••••••••" required/>
          </div>
          <div style={{textAlign:'right',marginTop:-8,marginBottom:8}}>
            <Link to="/forgot-password" style={{fontSize:12,color:'#9A9080'}}>Forgot password?</Link>
          </div>
          <button type="submit" className={s.btn} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <p className={s.footer}>No account? <Link to="/register">Create one free</Link></p>
      </div>
    </div>
  )
}
