import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import s from './Explore.module.css'

export default function Explore() {
  const [influencers, setInfluencers] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(true)
      api.get(`/influencers?search=${search}`)
        .then(r => setInfluencers(r.data.influencers || []))
        .catch(() => setInfluencers([]))
        .finally(() => setLoading(false))
    }, 300)
    return () => clearTimeout(t)
  }, [search])

  return (
    <div className={s.page}>
      <div className={s.header}>
        <h1>Explore creators</h1>
        <p>Book a personal session with Pakistan's top influencers</p>
        <input
          className={s.search}
          placeholder="Search by name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className={s.loading}><div className="spinner"/></div>
      ) : influencers.length === 0 ? (
        <div className={s.empty}>No creators found{search ? ` for "${search}"` : ''}</div>
      ) : (
        <div className={s.grid}>
          {influencers.map(inf => (
            <Link to={`/creator/${inf.handle}`} key={inf.id} className={s.card}>
              <div className={s.avatar}>{inf.name?.charAt(0)}</div>
              <div className={s.name}>{inf.name}</div>
              <div className={s.handle}>@{inf.handle}</div>
              {inf.bio && <div className={s.bio}>{inf.bio.slice(0, 80)}{inf.bio.length > 80 ? '…' : ''}</div>}
              <div className={s.meta}>
                <span>{(inf.follower_count || 0).toLocaleString()} followers</span>
                <span>{inf.rating || 5.0} ★</span>
              </div>
              <div className={s.bookBtn}>View &amp; Book →</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
