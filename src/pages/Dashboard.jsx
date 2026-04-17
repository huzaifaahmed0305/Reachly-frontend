import { useState, useEffect } from 'react'
import api from '../lib/api'
import { useAuth } from '../context/AuthContext'
import s from './Dashboard.module.css'
import { useNavigate } from 'react-router-dom'

const STATUS_COLORS = { confirmed:'success', pending:'warning', completed:'muted', cancelled:'danger' }

export default function Dashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/dashboard')
      .then(r => setData(r.data))
      .finally(() => setLoading(false))
  }, [])

  const confirm = async (id) => {
    await api.patch(`/bookings/${id}/confirm`)
    const r = await api.get('/dashboard')
    setData(r.data)
  }

  if (loading) return <div className={s.loading}><div className="spinner"/></div>

  const m = data?.metrics || {}

  return (
    <div className={s.page}>
      <div className={s.header}>
        <div>
          <div className={s.greeting}>Good day, {user?.name?.split(' ')[0]}</div>
          <h1>Creator Dashboard</h1>
        </div>
      </div>

      <button
  onClick={() => navigate('/availability')}
  style={{
    background:'rgba(200,169,126,0.1)',
    border:'0.5px solid rgba(200,169,126,0.3)',
    color:'#C8A97E',
    borderRadius:20,
    padding:'8px 20px',
    fontSize:13,
    cursor:'pointer',
    fontFamily:"'DM Sans',sans-serif",
  }}
>
  📅 Manage Availability
</button>

      <div className={s.metrics}>
        {[
          { label:'Monthly earnings', value:`Rs ${(m.monthly_earnings_pkr||0).toLocaleString()}`, sub:`Platform kept Rs ${(m.monthly_platform_fee_pkr||0).toLocaleString()}` },
          { label:'Sessions this month', value: m.monthly_sessions||0, sub:'confirmed bookings' },
          { label:'Upcoming', value: m.upcoming_count||0, sub:'sessions booked' },
          { label:'All-time earnings', value:`Rs ${(m.total_earnings_pkr||0).toLocaleString()}`, sub:`${m.total_sessions_completed||0} sessions completed` },
        ].map((item,i) => (
          <div key={i} className={s.metric}>
            <div className={s.mLabel}>{item.label}</div>
            <div className={s.mValue}>{item.value}</div>
            <div className={s.mSub}>{item.sub}</div>
          </div>
        ))}
      </div>

      <div className={s.section}>
        <h2>Upcoming sessions</h2>
        {(data?.upcoming_sessions||[]).length === 0 ? (
          <div className={s.empty}>No upcoming sessions yet</div>
        ) : (
          <div className={s.table}>
            <div className={s.thead}>
              <span>Client</span><span>Session</span><span>Date & Time</span><span>Payout</span><span>Action</span>
            </div>
            {(data?.upcoming_sessions||[]).map(b => (
              <div key={b.id} className={s.trow}>
                <span className={s.client}>
                  <strong>{b.users?.name || 'Client'}</strong>
                </span>
                <span>{b.session_types?.title}</span>
                <span>{new Date(b.scheduled_at).toLocaleDateString('en-PK',{month:'short',day:'numeric'})} · {new Date(b.scheduled_at).toLocaleTimeString('en-PK',{hour:'2-digit',minute:'2-digit'})}</span>
                <span className={s.payout}>Rs {(b.creator_payout_pkr||0).toLocaleString()}</span>
                <span>
                  <a href={b.meet_link || '#'} className={s.meetBtn} target="_blank" rel="noreferrer">Join Meet</a>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={s.section}>
        <h2>Recent payouts</h2>
        {(data?.recent_payouts||[]).length === 0 ? (
          <div className={s.empty}>No completed sessions yet</div>
        ) : (
          <div className={s.table}>
            <div className={s.thead}>
              <span>Session</span><span>Client</span><span>Gross</span><span>Fee (10%)</span><span>Your payout</span>
            </div>
            {(data?.recent_payouts||[]).map((b,i) => (
              <div key={i} className={s.trow}>
                <span>{b.session_types?.title}</span>
                <span>{b.users?.name}</span>
                <span>Rs {(b.gross_amount_pkr||0).toLocaleString()}</span>
                <span className={s.fee}>Rs {(b.platform_fee_pkr||0).toLocaleString()}</span>
                <span className={s.payout}>Rs {(b.creator_payout_pkr||0).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
