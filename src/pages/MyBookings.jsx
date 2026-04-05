import { useState, useEffect } from 'react'
import api from '../lib/api'
import s from './MyBookings.module.css'

const STATUS_LABEL = { pending:'Pending', confirmed:'Confirmed', completed:'Completed', cancelled:'Cancelled' }
const STATUS_CLASS = { pending:'warning', confirmed:'success', completed:'muted', cancelled:'danger' }

export default function MyBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    api.get('/bookings')
      .then(r => setBookings(r.data.bookings || []))
      .finally(() => setLoading(false))
  }, [])

  const cancel = async (id) => {
    if (!confirm('Cancel this booking?')) return
    await api.patch(`/bookings/${id}/cancel`)
    setBookings(b => b.map(bk => bk.id === id ? {...bk, status:'cancelled'} : bk))
  }

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter)

  return (
    <div className={s.page}>
      <h1>My Bookings</h1>

      <div className={s.filters}>
        {['all','confirmed','pending','completed','cancelled'].map(f => (
          <button key={f} className={filter === f ? s.filterActive : s.filter} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className={s.loading}><div className="spinner"/></div>
      ) : filtered.length === 0 ? (
        <div className={s.empty}>No {filter === 'all' ? '' : filter} bookings found</div>
      ) : (
        <div className={s.list}>
          {filtered.map(b => (
            <div key={b.id} className={s.card}>
              <div className={s.cardTop}>
                <div>
                  <div className={s.sessionTitle}>{b.session_types?.title}</div>
                  <div className={s.influencer}>with {b.influencers?.name || 'Creator'} · @{b.influencers?.handle}</div>
                </div>
                <div className={`${s.badge} ${s[STATUS_CLASS[b.status]]}`}>
                  {STATUS_LABEL[b.status]}
                </div>
              </div>
              <div className={s.cardMeta}>
                <div className={s.metaItem}>
                  <span className={s.metaLabel}>Date & time</span>
                  <span>{new Date(b.scheduled_at).toLocaleDateString('en-PK',{month:'long',day:'numeric',year:'numeric'})} · {new Date(b.scheduled_at).toLocaleTimeString('en-PK',{hour:'2-digit',minute:'2-digit'})}</span>
                </div>
                <div className={s.metaItem}>
                  <span className={s.metaLabel}>Amount paid</span>
                  <span>Rs {((b.gross_amount_pkr||0) + (b.platform_fee_pkr||0)).toLocaleString()}</span>
                </div>
                <div className={s.metaItem}>
                  <span className={s.metaLabel}>Booking ref</span>
                  <span className={s.ref}>{b.booking_ref}</span>
                </div>
              </div>
              {b.status === 'confirmed' && (
                <div className={s.cardActions}>
                  <a href={b.meet_link || '#'} className={s.joinBtn} target="_blank" rel="noreferrer">Join Google Meet →</a>
                  <button className={s.cancelBtn} onClick={() => cancel(b.id)}>Cancel</button>
                </div>
              )}
              {b.status === 'pending' && (
                <div className={s.cardActions}>
                  <button className={s.cancelBtn} onClick={() => cancel(b.id)}>Cancel booking</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
