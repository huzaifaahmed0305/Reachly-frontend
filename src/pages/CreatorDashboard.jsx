import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'
import s from './CreatorDashboard.module.css'

export default function CreatorDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({ sessions:0, earnings:0, rating:5.0, pending:0 })
  const [upcoming, setUpcoming] = useState([])
  const [loading, setLoading] = useState(true)
  const [avatar, setAvatar] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      const [bRes, iRes] = await Promise.all([
        api.get('/bookings/my'),
        api.get('/influencers/me').catch(() => ({ data: {} }))
      ])
      const bks = bRes.data.bookings || []
      const now = new Date()
      const upcomingBks = bks.filter(b => b.status === 'confirmed' && new Date(b.scheduled_at) > now)
      const completed   = bks.filter(b => b.status === 'completed')
      const earnings    = completed.reduce((sum, b) => sum + (b.creator_payout_pkr || 0), 0)
      setUpcoming(upcomingBks)
      setStats({ sessions: completed.length, earnings, rating: iRes.data?.influencer?.rating || 5.0, pending: upcomingBks.length })
      if (iRes.data?.influencer?.avatar_url) setAvatar(iRes.data.influencer.avatar_url)
    } catch(e){ console.error(e) }
    finally { setLoading(false) }
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const form = new FormData()
      form.append('avatar', file)
      const res = await api.post('/influencers/upload-avatar', form, { headers:{'Content-Type':'multipart/form-data'} })
      setAvatar(res.data.avatar_url)
    } catch(err){ alert('Upload failed. Check Supabase Storage is set up.') }
    finally { setUploading(false) }
  }

  const copyLink = () => {
    const link = `${window.location.origin}/creator/${user?.handle || user?.id}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const fmt = (d) => new Date(d).toLocaleDateString('en-PK',{
    weekday:'short', month:'short', day:'numeric',
    hour:'2-digit', minute:'2-digit', timeZone:'Asia/Karachi'
  })

  if (loading) return (
    <div className={s.loading}>
      <div className={s.spinner}/>
    </div>
  )

  return (
    <div className={s.page}>
      {/* SINGLE NAV */}
      <nav className={s.nav}>
        <div className={s.navLogo} onClick={() => navigate('/dashboard')} style={{cursor:'pointer'}}>
          Reachly
        </div>
        <div className={s.navActions}>
          <button className={s.navBtn} onClick={() => navigate('/availability')}>📅 Availability</button>
          <button className={s.navBtn} onClick={() => navigate('/onboarding')}>✏️ Edit Sessions</button>
          <button className={s.navBtnOut} onClick={logout}>Log out</button>
        </div>
      </nav>

      <div className={s.wrap}>
        {/* PROFILE HERO */}
        <div className={s.hero}>
          <div className={s.heroLeft}>
            <label className={s.avatarWrap} title="Click to change photo">
              {avatar
                ? <img src={avatar} alt="avatar" className={s.avatarImg}/>
                : <div className={s.avatarLetter}>{user?.name?.[0]?.toUpperCase()}</div>
              }
              <div className={s.avatarOverlay}>{uploading ? '⏳' : '📷'}</div>
              <input type="file" accept="image/*" onChange={handleAvatarUpload} style={{display:'none'}}/>
            </label>
            <div className={s.heroInfo}>
              <div className={s.heroBadge}>⭐ Creator</div>
              <div className={s.heroName}>{user?.name}</div>
              <div className={s.heroHandle}>reachly.pk/creator/{user?.handle || 'yourname'}</div>
              <button className={s.copyBtn} onClick={copyLink}>
                {copied ? '✓ Copied!' : '🔗 Copy booking link'}
              </button>
            </div>
          </div>
          {/* STATS */}
          <div className={s.statsRow}>
            <div className={s.statCard}>
              <div className={s.statNum}>Rs {stats.earnings.toLocaleString()}</div>
              <div className={s.statLabel}>Total Earned</div>
            </div>
            <div className={s.statCard}>
              <div className={s.statNum}>{stats.sessions}</div>
              <div className={s.statLabel}>Completed</div>
            </div>
            <div className={s.statCard}>
              <div className={s.statNum}>{stats.rating}★</div>
              <div className={s.statLabel}>Rating</div>
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
            <div className={s.actionIcon}>✏️</div>
            <div className={s.actionTitle}>Edit Sessions & Bio</div>
            <div className={s.actionDesc}>Update your sessions and prices</div>
          </div>
          <div className={s.actionCard} onClick={() => navigate('/my-bookings')}>
            <div className={s.actionIcon}>📋</div>
            <div className={s.actionTitle}>All Bookings</div>
            <div className={s.actionDesc}>View all past and upcoming sessions</div>
          </div>
          <div className={s.actionCard} onClick={copyLink}>
            <div className={s.actionIcon}>🔗</div>
            <div className={s.actionTitle}>Share Your Link</div>
            <div className={s.actionDesc}>Put this link in your Instagram bio</div>
          </div>
        </div>

        {/* UPCOMING BOOKINGS */}
        <div className={s.section}>
          <div className={s.sectionHead}>
            <div className={s.sectionTitle}>Upcoming Sessions</div>
            <button className={s.seeAll} onClick={() => navigate('/my-bookings')}>See all →</button>
          </div>

          {upcoming.length === 0 ? (
            <div className={s.empty}>
              <div className={s.emptyIcon}>📭</div>
              <div className={s.emptyTitle}>No upcoming sessions yet</div>
              <div className={s.emptyDesc}>Share your booking link in your Instagram bio to start getting booked</div>
              <button className={s.emptyBtn} onClick={copyLink}>Copy my booking link</button>
            </div>
          ) : (
            <div className={s.bookingList}>
              {upcoming.map(b => (
                <div key={b.id} className={s.bookingCard}>
                  <div className={s.bLeft}>
                    <div className={s.bRef}>{b.booking_ref}</div>
                    <div className={s.bSession}>{b.session_types?.title}</div>
                    <div className={s.bTime}>{fmt(b.scheduled_at)}</div>
                  </div>
                  <div className={s.bRight}>
                    <div className={s.bAmount}>Rs {(b.creator_payout_pkr||0).toLocaleString()}</div>
                    {b.meet_link && (
                      <a href={b.meet_link} target="_blank" rel="noreferrer" className={s.meetBtn}>
                        🎯 Join Meet
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <footer className={s.footer}>
          <div>© Reachly 2026. All rights reserved.</div>
          <div>Made with ❤️ by <a href="https://instagram.com/ihuzaifaahmed" target="_blank" rel="noreferrer" className={s.footerLink}>@huzaifaahmed0305</a></div>
        </footer>
      </div>
    </div>
  )
}
