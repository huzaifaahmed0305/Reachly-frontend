import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../lib/api'
import { useAuth } from '../context/AuthContext'
import s from './InfluencerProfile.module.css'

export default function InfluencerProfile() {
  const { handle } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [influencer, setInfluencer] = useState(null)
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/influencers/${handle}`)
      .then(r => { setInfluencer(r.data.influencer); setSelected(r.data.influencer.session_types?.[0]) })
      .catch(() => navigate('/explore'))
      .finally(() => setLoading(false))
  }, [handle])

  const handleBook = () => {
    if (!user) return navigate('/login')
    navigate(`/book/${handle}`, { state: { session: selected, influencer } })
  }

  if (loading) return <div className={s.loading}><div className="spinner"/></div>
  if (!influencer) return null

  return (
    <div className={s.page}>
      <div className={s.profileCard}>
        <div className={s.avatar}>{influencer.name?.charAt(0)}</div>
        <div className={s.info}>
          <h1>{influencer.name}</h1>
          <div className={s.handle}>@{influencer.handle}</div>
          <div className={s.bio}>{influencer.bio || 'No bio yet.'}</div>
          <div className={s.statsRow}>
            <div className={s.stat}><span>{(influencer.follower_count||0).toLocaleString()}</span>Followers</div>
            <div className={s.stat}><span>{influencer.total_sessions||0}</span>Sessions</div>
            <div className={s.stat}><span>{influencer.rating||5.0} ★</span>Rating</div>
          </div>
        </div>
      </div>

      <div className={s.sessionSection}>
        <h2>Book a session</h2>
        <div className={s.sessionGrid}>
          {(influencer.session_types || []).filter(s => s.is_active).map(st => (
            <div key={st.id}
              className={`${s.sessionCard} ${selected?.id === st.id ? s.active : ''}`}
              onClick={() => setSelected(st)}>
              {selected?.id === st.id && <div className={s.selectedBadge}>Selected</div>}
              <div className={s.duration}>{st.duration_minutes} MIN</div>
              <div className={s.stTitle}>{st.title}</div>
              <div className={s.stDesc}>{st.description}</div>
              <div className={s.price}>Rs {(st.price_pkr||0).toLocaleString()} <span>/ session</span></div>
            </div>
          ))}
        </div>

        {selected && (
          <div className={s.bookWrap}>
            <div className={s.bookSummary}>
              <span>{selected.title}</span>
              <span>{selected.duration_minutes} min · Rs {selected.price_pkr?.toLocaleString()}</span>
            </div>
            <button className={s.bookBtn} onClick={handleBook}>
              {user ? 'Continue to book →' : 'Sign in to book →'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
