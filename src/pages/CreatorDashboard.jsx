/**
 * CreatorDashboard.jsx → src/pages/CreatorDashboard.jsx
 * Unique post-login UI for creators
 * Add route in App.jsx:
 *   <Route path="/dashboard" element={<ProtectedRoute role="influencer"><CreatorDashboard /></ProtectedRoute>} />
 */
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'
import s from './CreatorDashboard.module.css'

export default function CreatorDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({ sessions: 0, earnings: 0, rating: 0, pending: 0 })
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [avatar, setAvatar] = useState(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [bRes, iRes] = await Promise.all([
        api.get('/bookings/my'),
        api.get(`/influencers/${user?.influencer_id}`)
      ])
      const bks = bRes.data.bookings || []
      setBookings(bks)
      const completed = bks.filter(b => b.status === 'completed')
      const pending = bks.filter(b => b.status === 'confirmed' && new Date(b.scheduled_at) > new Date())
      const earnings = completed.reduce((sum, b) => sum + (b.creator_payout_pkr || 0), 0)
      setStats({ sessions: completed.length, earnings, rating: iRes.data?.influencer?.rating || 5.0, pending: pending.length })
      if (iRes.data?.influencer?.avatar_url) setAvatar(iRes.data.influencer.avatar_url)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const form = new FormData()
      form.append('avatar', file)
      const res = await api.post('/influencers/upload-avatar', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setAvatar(res.data.avatar_url)
    } catch (err) {
      alert('Upload failed. Please try again.')
    } finally { setUploading(false) }
  }

  const upcoming = bookings.filter(b =>
    b.status === 'confirmed' && new Date(b.scheduled_at) > new Date()
  ).slice(0, 5)

  const formatDate = (d) => new Date(d).toLocaleDateString('en-PK', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Karachi'
  })

  if (loading) return <div className={s.loading}><div className={s.spinner} /></div>

  return (
    <div className={s.page}>

      {/* TOP NAV */}
      <nav className={s.nav}>
        <div className={s.navLogo}>Reachly</div>
        <div className={s.navActions}>
          <button className={s.navBtn} onClick={() => navigate('/availability')}>📅 Availability</button>
          <button className={s.navBtn} onClick={() => navigate('/onboarding')}>⚙️ Profile</button>
          <button className={s.navBtnDanger} onClick={logout}>Log out</button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <div className={s.hero}>
        <div className={s.heroLeft}>
          {/* Avatar with upload */}
          <div className={s.avatarWrap}>
            <label className={s.avatarLabel} title="Click to upload photo">
              {avatar
                ? <img src={avatar} alt="avatar" className={s.avatarImg} />
                : <div className={s.avatarPlaceholder}>{user?.name?.[0]?.toUpperCase()}</div>
              }
              <div className={s.avatarOverlay}>
                {uploading ? '...' : '📷'}
              </div>
              <input type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} />
            </label>
          </div>
          <div className={s.heroInfo}>
            <div className={s.heroBadge}>⭐ Creator</div>
            <div className={s.heroName}>{user?.name}</div>
            <div className={s.heroHandle}>reachly.pk/creator/{user?.handle || 'yourname'}</div>
            <button className={s.copyLink} onClick={() => {
              navigator.clipboard.writeText(`https://reachly.pk/creator/${user?.handle || user?.id}`)
              alert('Booking link copied!')
            }}>
              🔗 Copy booking link
            </button>
          </div>
        </div>

        {/* QUICK STATS */}
        <div className={s.statsGrid}>
          <div className={s.statCard}>
            <div className={s.statNum}>Rs {stats.earnings.toLocaleString()}</div>
            <div className={s.statLabel}>Total Earned</div>
          </div>
          <div className={s.statCard}>
            <div className={s.statNum}>{stats.sessions}</div>
            <div className={s.statLabel}>Sessions Done</div>
          </div>
          <div className={s.statCard}>
            <div className={s.statNum}>{stats.rating}★</div>
            <div className={s.statLabel}>Your Rating</div>
          </div>
          <div className={s.statCard}>
            <div className={s.statNum}>{stats.pending}</div>
            <div className={s.statLabel}>Upcoming</div>
          </div>
        </div>
      </div>

      {/* ACTION CARDS */}
      <div className={s.actions}>
        <div className={s.actionCard} onClick={() => navigate('/availability')}>
          <div className={s.actionIcon}>📅</div>
          <div className={s.actionTitle}>Manage Availability</div>
          <div className={s.actionDesc}>Set your days, times and block dates</div>
        </div>
        <div className={s.actionCard} onClick={() => navigate('/onboarding')}>
          <div className={s.actionIcon}>⚙️</div>
          <div className={s.actionTitle}>Edit Profile & Sessions</div>
          <div className={s.actionDesc}>Update bio, sessions and prices</div>
        </div>
        <div className={s.actionCard} onClick={() => navigate('/my-bookings')}>
          <div className={s.actionIcon}>📋</div>
          <div className={s.actionTitle}>All Bookings</div>
          <div className={s.actionDesc}>View all past and upcoming sessions</div>
        </div>
        <div className={s.actionCard} onClick={() => {
          navigator.clipboard.writeText(`https://reachly.pk/creator/${user?.handle || user?.id}`)
          alert('Link copied!')
        }}>
          <div className={s.actionIcon}>🔗</div>
          <div className={s.actionTitle}>Share Your Link</div>
          <div className={s.actionDesc}>Copy and put in Instagram bio</div>
        </div>
      </div>

      {/* UPCOMING BOOKINGS */}
      <div className={s.section}>
        <div className={s.sectionHeader}>
          <div className={s.sectionTitle}>Upcoming Sessions</div>
          <button className={s.seeAll} onClick={() => navigate('/my-bookings')}>See all →</button>
        </div>

        {upcoming.length === 0 ? (
          <div className={s.empty}>
            <div className={s.emptyIcon}>📭</div>
            <div className={s.emptyTitle}>No upcoming sessions yet</div>
            <div className={s.emptyDesc}>Share your booking link in your Instagram bio to start getting booked</div>
            <button className={s.emptyBtn} onClick={() => {
              navigator.clipboard.writeText(`https://reachly.pk/creator/${user?.handle || user?.id}`)
              alert('Link copied!')
            }}>Copy my booking link</button>
          </div>
        ) : (
          <div className={s.bookingList}>
            {upcoming.map(b => (
              <div key={b.id} className={s.bookingCard}>
                <div className={s.bookingLeft}>
                  <div className={s.bookingRef}>{b.booking_ref}</div>
                  <div className={s.bookingSession}>{b.session_types?.title}</div>
                  <div className={s.bookingTime}>{formatDate(b.scheduled_at)}</div>
                </div>
                <div className={s.bookingRight}>
                  <div className={s.bookingAmount}>Rs {b.creator_payout_pkr?.toLocaleString()}</div>
                  {b.meet_link && (
                    <a href={b.meet_link} target="_blank" rel="noreferrer" className={s.meetBtn}>
                      Join Meet →
                    </a>
                  )}
                  <div className={s.bookingStatus}>{b.status}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
