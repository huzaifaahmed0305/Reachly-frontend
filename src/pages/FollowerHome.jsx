/**
 * FollowerHome.jsx → src/pages/FollowerHome.jsx
 * Unique post-login UI for followers
 * Add route in App.jsx:
 *   <Route path="/home" element={<ProtectedRoute><FollowerHome /></ProtectedRoute>} />
 * Also update Login.jsx: navigate followers to /home instead of /explore
 */
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'
import s from './FollowerHome.module.css'

export default function FollowerHome() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [creators, setCreators] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      const [cRes, bRes] = await Promise.all([
        api.get('/influencers?limit=6'),
        api.get('/bookings/my'),
      ])
      setCreators(cRes.data.influencers || [])
      setBookings((bRes.data.bookings || []).slice(0, 3))
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const formatDate = (d) => new Date(d).toLocaleDateString('en-PK', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Karachi'
  })

  if (loading) return <div className={s.loading}><div className={s.spinner} /></div>

  const upcoming = bookings.filter(b =>
    b.status === 'confirmed' && new Date(b.scheduled_at) > new Date()
  )

  return (
    <div className={s.page}>

      {/* NAV */}
      <nav className={s.nav}>
        <div className={s.navLogo}>Reachly</div>
        <div className={s.navLinks}>
          <button className={s.navLink} onClick={() => navigate('/explore')}>Explore</button>
          <button className={s.navLink} onClick={() => navigate('/my-bookings')}>My Bookings</button>
        </div>
        <div className={s.navRight}>
          <div className={s.navUser}>{user?.name?.split(' ')[0]}</div>
          <button className={s.navLogout} onClick={logout}>Log out</button>
        </div>
      </nav>

      <div className={s.content}>

        {/* WELCOME HERO */}
        <div className={s.welcomeHero}>
          <div className={s.welcomeLeft}>
            <div className={s.welcomeTag}>Welcome back 👋</div>
            <div className={s.welcomeName}>{user?.name?.split(' ')[0]}.</div>
            <div className={s.welcomeSub}>
              Your favourite creators are ready to talk.<br/>
              Book a session and get real answers.
            </div>
            <button className={s.exploreBtn} onClick={() => navigate('/explore')}>
              Browse all creators →
            </button>
          </div>
          <div className={s.welcomeRight}>
            {/* Stats pill */}
            <div className={s.heroPill}>
              <div className={s.pillItem}>
                <div className={s.pillNum}>{bookings.length}</div>
                <div className={s.pillLabel}>Sessions booked</div>
              </div>
              <div className={s.pillDivider} />
              <div className={s.pillItem}>
                <div className={s.pillNum}>{upcoming.length}</div>
                <div className={s.pillLabel}>Upcoming</div>
              </div>
            </div>
          </div>
        </div>

        {/* UPCOMING SESSION — if any */}
        {upcoming.length > 0 && (
          <div className={s.section}>
            <div className={s.sectionTitle}>Your next session</div>
            <div className={s.nextSession}>
              <div className={s.nsLeft}>
                <div className={s.nsCreator}>{upcoming[0].influencers?.name}</div>
                <div className={s.nsType}>{upcoming[0].session_types?.title}</div>
                <div className={s.nsTime}>{formatDate(upcoming[0].scheduled_at)}</div>
                <div className={s.nsRef}>{upcoming[0].booking_ref}</div>
              </div>
              {upcoming[0].meet_link && (
                <a href={upcoming[0].meet_link} target="_blank" rel="noreferrer" className={s.joinBtn}>
                  🎯 Join Google Meet
                </a>
              )}
            </div>
          </div>
        )}

        {/* FEATURED CREATORS */}
        <div className={s.section}>
          <div className={s.sectionHeader}>
            <div className={s.sectionTitle}>Featured creators</div>
            <button className={s.seeAll} onClick={() => navigate('/explore')}>See all →</button>
          </div>
          <div className={s.creatorsGrid}>
            {creators.map(c => (
              <div key={c.id} className={s.creatorCard} onClick={() => navigate(`/creator/${c.handle}`)}>
                <div className={s.creatorAv}>
                  {c.avatar_url
                    ? <img src={c.avatar_url} alt={c.name} className={s.creatorAvImg} />
                    : <div className={s.creatorAvLetter}>{c.name?.[0]}</div>
                  }
                </div>
                <div className={s.creatorName}>{c.name}</div>
                <div className={s.creatorHandle}>@{c.handle}</div>
                <div className={s.creatorRating}>{c.rating || 5.0}★</div>
                <button className={s.bookBtn}>Book session</button>
              </div>
            ))}
          </div>
        </div>

        {/* RECENT BOOKINGS */}
        {bookings.length > 0 && (
          <div className={s.section}>
            <div className={s.sectionHeader}>
              <div className={s.sectionTitle}>Recent bookings</div>
              <button className={s.seeAll} onClick={() => navigate('/my-bookings')}>See all →</button>
            </div>
            <div className={s.recentList}>
              {bookings.map(b => (
                <div key={b.id} className={s.recentCard}>
                  <div className={s.recentInfo}>
                    <div className={s.recentCreator}>{b.influencers?.name}</div>
                    <div className={s.recentType}>{b.session_types?.title} · {formatDate(b.scheduled_at)}</div>
                  </div>
                  <div className={s.recentRight}>
                    <div className={s.recentAmount}>Rs {b.gross_amount_pkr?.toLocaleString()}</div>
                    {b.meet_link && b.status === 'confirmed' && (
                      <a href={b.meet_link} target="_blank" rel="noreferrer" className={s.meetSmall}>Join →</a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
