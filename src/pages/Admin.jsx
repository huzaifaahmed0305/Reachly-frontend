/**
 * Admin Page — src/pages/Admin.jsx
 * Add to your frontend reachly-frontend project
 * Then add to App.jsx:
 *   import Admin from './pages/Admin'
 *   <Route path="/admin" element={<Admin />} />
 */
import { useState, useEffect } from 'react'
import axios from 'axios'
import s from './Admin.module.css'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
const ADMIN_KEY = import.meta.env.VITE_ADMIN_SECRET || ''

const api = (path) => axios.get(`${API}/admin${path}`, { headers: { 'x-admin-key': ADMIN_KEY } })
const patch = (path) => axios.patch(`${API}/admin${path}`, {}, { headers: { 'x-admin-key': ADMIN_KEY } })

const STATUS_COLOR = {
  confirmed: 'success', pending: 'warning',
  completed: 'muted', cancelled: 'danger'
}

export default function Admin() {
  const [tab, setTab] = useState('overview')
  const [stats, setStats] = useState(null)
  const [influencers, setInfluencers] = useState([])
  const [bookings, setBookings] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [key, setKey] = useState(localStorage.getItem('admin_key') || '')
  const [authed, setAuthed] = useState(false)
  const [filter, setFilter] = useState('all')

  const login = () => {
    localStorage.setItem('admin_key', key)
    setAuthed(true)
    loadAll()
  }

  const loadAll = async () => {
    setLoading(true)
    try {
      const k = localStorage.getItem('admin_key')
      const headers = { 'x-admin-key': k }
      const [s, i, b, u] = await Promise.all([
        axios.get(`${API}/admin/stats`, { headers }),
        axios.get(`${API}/admin/influencers`, { headers }),
        axios.get(`${API}/admin/bookings`, { headers }),
        axios.get(`${API}/admin/users`, { headers }),
      ])
      setStats(s.data)
      setInfluencers(i.data.influencers || [])
      setBookings(b.data.bookings || [])
      setUsers(u.data.users || [])
      setAuthed(true)
    } catch {
      setAuthed(false)
    } finally { setLoading(false) }
  }

  useEffect(() => {
    if (localStorage.getItem('admin_key')) loadAll()
    else setLoading(false)
  }, [])

  const toggleInfluencer = async (id) => {
    await axios.patch(`${API}/admin/influencers/${id}/toggle`, {}, {
      headers: { 'x-admin-key': localStorage.getItem('admin_key') }
    })
    loadAll()
  }

  const cancelBooking = async (id) => {
    if (!confirm('Cancel this booking?')) return
    await axios.patch(`${API}/admin/bookings/${id}/cancel`, {}, {
      headers: { 'x-admin-key': localStorage.getItem('admin_key') }
    })
    loadAll()
  }

  // Login screen
  if (!authed && !loading) return (
    <div className={s.loginPage}>
      <div className={s.loginCard}>
        <div className={s.loginLogo}>Reach<span>ly</span></div>
        <h2>Admin Access</h2>
        <p>Enter your admin secret key</p>
        <input
          type="password"
          placeholder="Admin secret key"
          value={key}
          onChange={e => setKey(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && login()}
        />
        <button onClick={login}>Enter Admin Panel</button>
      </div>
    </div>
  )

  if (loading) return <div className={s.loading}><div className="spinner"/></div>

  const filteredBookings = filter === 'all' ? bookings : bookings.filter(b => b.status === filter)

  return (
    <div className={s.page}>
      {/* Sidebar */}
      <div className={s.sidebar}>
        <div className={s.sidebarLogo}>Reach<span>ly</span> <span className={s.adminBadge}>ADMIN</span></div>
        <nav className={s.nav}>
          {[
            { id: 'overview',    label: 'Overview' },
            { id: 'bookings',    label: 'Bookings' },
            { id: 'influencers', label: 'Creators' },
            { id: 'users',       label: 'Users' },
          ].map(t => (
            <button key={t.id}
              className={`${s.navBtn} ${tab === t.id ? s.navActive : ''}`}
              onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </nav>
        <button className={s.logoutBtn} onClick={() => { localStorage.removeItem('admin_key'); setAuthed(false) }}>
          Sign out
        </button>
      </div>

      {/* Main */}
      <div className={s.main}>

        {/* OVERVIEW */}
        {tab === 'overview' && stats && (
          <div className={s.section}>
            <h1>Platform Overview</h1>
            <div className={s.metrics}>
              {[
                { label: 'Total Revenue', value: `Rs ${(stats.total_revenue_pkr||0).toLocaleString()}`, sub: 'all confirmed bookings' },
                { label: 'Your Earnings (10%)', value: `Rs ${(stats.platform_earnings_pkr||0).toLocaleString()}`, sub: 'platform cut' },
                { label: 'Total Bookings', value: stats.total_bookings||0, sub: `${stats.confirmed_bookings||0} confirmed` },
                { label: 'Active Creators', value: stats.total_influencers||0, sub: 'on platform' },
                { label: 'Total Users', value: stats.total_users||0, sub: 'registered accounts' },
              ].map((m, i) => (
                <div key={i} className={s.metricCard}>
                  <div className={s.metricLabel}>{m.label}</div>
                  <div className={s.metricValue}>{m.value}</div>
                  <div className={s.metricSub}>{m.sub}</div>
                </div>
              ))}
            </div>

            {/* Recent bookings snapshot */}
            <h2>Recent Bookings</h2>
            <div className={s.table}>
              <div className={s.thead}>
                <span>Ref</span><span>Creator</span><span>Client</span><span>Session</span><span>Amount</span><span>Status</span>
              </div>
              {bookings.slice(0, 8).map(b => (
                <div key={b.id} className={s.trow}>
                  <span className={s.ref}>{b.booking_ref}</span>
                  <span>{b.influencers?.name}</span>
                  <span>{b.users?.name}</span>
                  <span>{b.session_types?.title}</span>
                  <span>Rs {(b.gross_amount_pkr||0).toLocaleString()}</span>
                  <span><div className={`${s.badge} ${s[STATUS_COLOR[b.status]]}`}>{b.status}</div></span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BOOKINGS */}
        {tab === 'bookings' && (
          <div className={s.section}>
            <div className={s.sectionHeader}>
              <h1>All Bookings <span className={s.count}>{bookings.length}</span></h1>
              <div className={s.filters}>
                {['all','confirmed','pending','completed','cancelled'].map(f => (
                  <button key={f}
                    className={filter === f ? s.filterActive : s.filter}
                    onClick={() => setFilter(f)}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div className={s.table}>
              <div className={s.thead}>
                <span>Ref</span><span>Creator</span><span>Client</span><span>Date</span><span>Gross</span><span>Fee</span><span>Status</span><span>Action</span>
              </div>
              {filteredBookings.map(b => (
                <div key={b.id} className={s.trow}>
                  <span className={s.ref}>{b.booking_ref}</span>
                  <span>@{b.influencers?.handle}</span>
                  <span>{b.users?.name}<br/><small style={{color:'var(--text3)'}}>{b.users?.email}</small></span>
                  <span>{new Date(b.scheduled_at).toLocaleDateString('en-PK',{month:'short',day:'numeric',year:'2-digit'})}</span>
                  <span>Rs {(b.gross_amount_pkr||0).toLocaleString()}</span>
                  <span style={{color:'var(--success)'}}>Rs {(b.platform_fee_pkr||0).toLocaleString()}</span>
                  <span><div className={`${s.badge} ${s[STATUS_COLOR[b.status]]}`}>{b.status}</div></span>
                  <span>
                    {!['cancelled','completed'].includes(b.status) && (
                      <button className={s.dangerBtn} onClick={() => cancelBooking(b.id)}>Cancel</button>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* INFLUENCERS */}
        {tab === 'influencers' && (
          <div className={s.section}>
            <div className={s.sectionHeader}>
              <h1>Creators <span className={s.count}>{influencers.length}</span></h1>
            </div>
            <div className={s.table}>
              <div className={s.thead}>
                <span>Creator</span><span>Handle</span><span>Email</span><span>Followers</span><span>Sessions</span><span>Rating</span><span>Status</span><span>Action</span>
              </div>
              {influencers.map(inf => (
                <div key={inf.id} className={s.trow}>
                  <span style={{fontWeight:500}}>{inf.name}</span>
                  <span style={{color:'var(--brand)'}}>@{inf.handle}</span>
                  <span style={{fontSize:'12px',color:'var(--text3)'}}>{inf.users?.email}</span>
                  <span>{(inf.follower_count||0).toLocaleString()}</span>
                  <span>{inf.total_sessions||0}</span>
                  <span>{inf.rating||'—'} ★</span>
                  <span>
                    <div className={`${s.badge} ${inf.is_active ? s.success : s.danger}`}>
                      {inf.is_active ? 'Active' : 'Inactive'}
                    </div>
                  </span>
                  <span>
                    <button
                      className={inf.is_active ? s.dangerBtn : s.successBtn}
                      onClick={() => toggleInfluencer(inf.id)}>
                      {inf.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* USERS */}
        {tab === 'users' && (
          <div className={s.section}>
            <div className={s.sectionHeader}>
              <h1>Users <span className={s.count}>{users.length}</span></h1>
            </div>
            <div className={s.table}>
              <div className={s.thead}>
                <span>Name</span><span>Email</span><span>Role</span><span>Joined</span>
              </div>
              {users.map(u => (
                <div key={u.id} className={s.trow}>
                  <span style={{fontWeight:500}}>{u.name}</span>
                  <span style={{fontSize:'13px',color:'var(--text3)'}}>{u.email}</span>
                  <span>
                    <div className={`${s.badge} ${u.role === 'influencer' ? s.warning : s.muted}`}>
                      {u.role}
                    </div>
                  </span>
                  <span style={{fontSize:'12px',color:'var(--text3)'}}>
                    {new Date(u.created_at).toLocaleDateString('en-PK',{month:'short',day:'numeric',year:'numeric'})}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
