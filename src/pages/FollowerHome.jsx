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
      setBookings(bRes.data.bookings || [])
    } catch(e){ console.error(e) }
    finally { setLoading(false) }
  }

  const fmt = (d) => new Date(d).toLocaleDateString('en-PK',{
    weekday:'short', month:'short', day:'numeric',
    hour:'2-digit', minute:'2-digit', timeZone:'Asia/Karachi'
  })

  const upcoming = bookings.filter(b => b.status==='confirmed' && new Date(b.scheduled_at) > new Date())

  if (loading) return (
    <div className={s.loading}><div className={s.spinner}/></div>
  )

  return (
    <div className={s.page}>
      {/* SINGLE NAV */}
      <nav className={s.nav}>
        <div className={s.navLogo} onClick={() => navigate('/home')} style={{cursor:'pointer'}}>Reachly</div>
        <div className={s.navLinks}>
          <button className={s.navLink} onClick={() => navigate('/explore')}>Explore</button>
          <button className={s.navLink} onClick={() => navigate('/my-bookings')}>My Bookings</button>
        </div>
        <div className={s.navRight}>
          <span className={s.navUser}>{user?.name?.split(' ')[0]}</span>
          <button className={s.navLogout} onClick={logout}>Log out</button>
        </div>
      </nav>

      <div className={s.wrap}>
        {/* WELCOME */}
        <div className={s.hero}>
          <div className={s.heroLeft}>
            <div className={s.heroTag}>Welcome back 👋</div>
            <div className={s.heroName}>{user?.name?.split(' ')[0]}.</div>
            <div className={s.heroSub}>Your favourite creators are ready to talk.<br/>Book a session and get real answers.</div>
            <button className={s.exploreBtn} onClick={() => navigate('/explore')}>Browse all creators →</button>
          </div>
          <div className={s.heroPill}>
            <div className={s.pillItem}>
              <div className={s.pillNum}>{bookings.length}</div>
              <div className={s.pillLabel}>Sessions booked</div>
            </div>
            <div className={s.pillDiv}/>
            <div className={s.pillItem}>
              <div className={s.pillNum}>{upcoming.length}</div>
              <div className={s.pillLabel}>Upcoming</div>
            </div>
          </div>
        </div>

        {/* NEXT SESSION */}
        {upcoming.length > 0 && (
          <div className={s.section}>
            <div className={s.sectionTitle}>Your next session</div>
            <div className={s.nextCard}>
              <div className={s.ncLeft}>
                <div className={s.ncCreator}>{upcoming[0].influencers?.name}</div>
                <div className={s.ncType}>{upcoming[0].session_types?.title}</div>
                <div className={s.ncTime}>{fmt(upcoming[0].scheduled_at)}</div>
                <div className={s.ncRef}>{upcoming[0].booking_ref}</div>
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
          <div className={s.sectionHead}>
            <div className={s.sectionTitle}>Featured creators</div>
            <button className={s.seeAll} onClick={() => navigate('/explore')}>See all →</button>
          </div>
          <div className={s.grid}>
            {creators.length === 0 && (
              <div className={s.noCreators}>No creators yet. Check back soon!</div>
            )}
            {creators.map(c => (
              <div key={c.id} className={s.creatorCard} onClick={() => navigate(`/creator/${c.handle}`)}>
                <div className={s.cAvWrap}>
                  {c.avatar_url
                    ? <img src={c.avatar_url} alt={c.name} className={s.cAvImg}/>
                    : <div className={s.cAvLetter}>{c.name?.[0]}</div>
                  }
                </div>
                <div className={s.cName}>{c.name}</div>
                <div className={s.cHandle}>@{c.handle}</div>
                <div className={s.cRating}>{c.rating||5.0}★</div>
                <button className={s.bookBtn}>Book session</button>
              </div>
            ))}
          </div>
        </div>

        {/* RECENT BOOKINGS */}
        {bookings.length > 0 && (
          <div className={s.section}>
            <div className={s.sectionHead}>
              <div className={s.sectionTitle}>Recent bookings</div>
              <button className={s.seeAll} onClick={() => navigate('/my-bookings')}>See all →</button>
            </div>
            <div className={s.recentList}>
              {bookings.slice(0,3).map(b => (
                <div key={b.id} className={s.recentCard}>
                  <div className={s.rInfo}>
                    <div className={s.rCreator}>{b.influencers?.name}</div>
                    <div className={s.rType}>{b.session_types?.title} · {fmt(b.scheduled_at)}</div>
                  </div>
                  <div className={s.rRight}>
                    <div className={s.rAmount}>Rs {(b.gross_amount_pkr||0).toLocaleString()}</div>
                    {b.meet_link && b.status==='confirmed' && (
                      <a href={b.meet_link} target="_blank" rel="noreferrer" className={s.meetSmall}>Join →</a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FOOTER */}
        <footer className={s.footer}>
          <div>© Reachly 2026. All rights reserved.</div>
          <div>Made with ❤️ by <a href="https://instagram.com/huzaifaahmed0305" target="_blank" rel="noreferrer" className={s.footerLink}>@huzaifaahmed0305</a></div>
        </footer>
      </div>
    </div>
  )
}
