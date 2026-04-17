/**
 * Availability Manager — src/pages/AvailabilityManager.jsx
 * Add to App.jsx:
 *   import AvailabilityManager from './pages/AvailabilityManager'
 *   <Route path="/availability" element={<ProtectedRoute role="influencer"><AvailabilityManager /></ProtectedRoute>} />
 * Add link in Dashboard navbar or as a button
 */
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import s from './AvailabilityManager.module.css'

const DAYS = [
  { id: 'monday',    label: 'Monday',    short: 'Mon' },
  { id: 'tuesday',   label: 'Tuesday',   short: 'Tue' },
  { id: 'wednesday', label: 'Wednesday', short: 'Wed' },
  { id: 'thursday',  label: 'Thursday',  short: 'Thu' },
  { id: 'friday',    label: 'Friday',    short: 'Fri' },
  { id: 'saturday',  label: 'Saturday',  short: 'Sat' },
  { id: 'sunday',    label: 'Sunday',    short: 'Sun' },
]

const TIME_SLOTS = [
  '08:00','09:00','10:00','10:30','11:00','11:30',
  '12:00','13:00','14:00','14:30','15:00','15:30',
  '16:00','17:00','17:30','18:00','19:00','20:00',
  '21:00',
]

const formatTime = (t) => {
  const [h, m] = t.split(':')
  const hour = Number(h)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const h12 = hour % 12 || 12
  return `${h12}:${m} ${ampm}`
}

// Get next 30 days
const getNext30Days = () => {
  const days = []
  const today = new Date()
  for (let i = 0; i < 35; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    days.push(d)
  }
  return days
}

export default function AvailabilityManager() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('weekly')
  const [schedule, setSchedule] = useState({}) // { monday: ['09:00','10:00'], ... }
  const [blockedDates, setBlockedDates] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [blockReason, setBlockReason] = useState('')

  useEffect(() => {
    api.get('/availability/me')
      .then(r => {
        // Convert flat list to grouped by day
        const grouped = {}
        for (const row of (r.data.schedule || [])) {
          if (!grouped[row.day_of_week]) grouped[row.day_of_week] = []
          grouped[row.day_of_week].push(row.start_time.slice(0, 5))
        }
        setSchedule(grouped)
        setBlockedDates((r.data.blocked_dates || []).map(b => b.date))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const toggleSlot = (day, time) => {
    setSchedule(prev => {
      const current = prev[day] || []
      const exists = current.includes(time)
      return {
        ...prev,
        [day]: exists ? current.filter(t => t !== time) : [...current, time].sort()
      }
    })
  }

  const toggleDay = (day) => {
    setSchedule(prev => {
      if (prev[day] && prev[day].length > 0) {
        return { ...prev, [day]: [] }
      }
      return { ...prev, [day]: ['09:00','10:00','11:00','14:00','15:00'] }
    })
  }

  const saveSchedule = async () => {
    setSaving(true); setError(''); setSaved(false)
    try {
      const scheduleArr = Object.entries(schedule)
        .filter(([, slots]) => slots.length > 0)
        .map(([day, slots]) => ({ day, slots }))

      await api.post('/availability/me/schedule', { schedule: scheduleArr })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save')
    } finally { setSaving(false) }
  }

  const toggleBlockDate = async (dateStr) => {
    try {
      if (blockedDates.includes(dateStr)) {
        await api.delete(`/availability/me/block/${dateStr}`)
        setBlockedDates(prev => prev.filter(d => d !== dateStr))
      } else {
        await api.post('/availability/me/block', { date: dateStr, reason: blockReason || 'Unavailable' })
        setBlockedDates(prev => [...prev, dateStr])
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update')
    }
  }

  const totalSlots = Object.values(schedule).reduce((sum, slots) => sum + slots.length, 0)
  const activeDays = Object.values(schedule).filter(s => s.length > 0).length

  if (loading) return <div className={s.loading}><div className="spinner"/></div>

  return (
    <div className={s.page}>
      <div className={s.header}>
        <button className={s.backBtn} onClick={() => navigate('/dashboard')}>← Dashboard</button>
        <div>
          <h1>Manage Availability</h1>
          <p>Set when followers can book sessions with you</p>
        </div>
        <div className={s.statsRow}>
          <div className={s.stat}><span>{activeDays}</span>Active days</div>
          <div className={s.stat}><span>{totalSlots}</span>Time slots</div>
        </div>
      </div>

      {error && <div className={s.error}>{error}</div>}
      {saved && <div className={s.success}>✓ Schedule saved successfully!</div>}

      {/* Tabs */}
      <div className={s.tabs}>
        <button className={`${s.tab} ${tab === 'weekly' ? s.tabActive : ''}`} onClick={() => setTab('weekly')}>
          Weekly Schedule
        </button>
        <button className={`${s.tab} ${tab === 'block' ? s.tabActive : ''}`} onClick={() => setTab('block')}>
          Block Dates
        </button>
      </div>

      {/* WEEKLY SCHEDULE TAB */}
      {tab === 'weekly' && (
        <div className={s.weekly}>
          <div className={s.weeklyInfo}>
            Set your recurring weekly schedule. Followers can only book sessions during these time slots.
          </div>

          {DAYS.map(day => {
            const slots = schedule[day.id] || []
            const isActive = slots.length > 0
            return (
              <div key={day.id} className={`${s.dayRow} ${isActive ? s.dayActive : ''}`}>
                <div className={s.dayHeader}>
                  <div className={s.dayInfo}>
                    <div className={s.dayName}>{day.label}</div>
                    <div className={s.dayCount}>{slots.length > 0 ? `${slots.length} slots` : 'Unavailable'}</div>
                  </div>
                  <label className={s.toggle}>
                    <input type="checkbox" checked={isActive} onChange={() => toggleDay(day.id)}/>
                    <span className={s.toggleSlider}/>
                  </label>
                </div>

                {isActive && (
                  <div className={s.timeGrid}>
                    {TIME_SLOTS.map(time => {
                      const selected = slots.includes(time)
                      return (
                        <button
                          key={time}
                          className={`${s.timeBtn} ${selected ? s.timeBtnActive : ''}`}
                          onClick={() => toggleSlot(day.id, time)}
                        >
                          {formatTime(time)}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}

          <button className={s.saveBtn} onClick={saveSchedule} disabled={saving}>
            {saving ? <span className="spinner"/> : '✓ Save Weekly Schedule'}
          </button>
        </div>
      )}

      {/* BLOCK DATES TAB */}
      {tab === 'block' && (
        <div className={s.blockTab}>
          <div className={s.weeklyInfo}>
            Block specific dates when you're unavailable — holidays, travel, or any day off.
          </div>

          <div className={s.reasonRow}>
            <label>Reason (optional)</label>
            <input
              value={blockReason}
              onChange={e => setBlockReason(e.target.value)}
              placeholder="e.g. Holiday, Travel, Personal"
            />
          </div>

          <div className={s.calGrid}>
            {getNext30Days().map(d => {
              const dateStr = d.toISOString().split('T')[0]
              const isBlocked = blockedDates.includes(dateStr)
              const isToday = d.toDateString() === new Date().toDateString()
              const dayName = d.toLocaleDateString('en-PK', { weekday: 'short' })
              const dayNum = d.getDate()
              const monthName = d.toLocaleDateString('en-PK', { month: 'short' })
              return (
                <button
                  key={dateStr}
                  className={`${s.calDay} ${isBlocked ? s.calBlocked : ''} ${isToday ? s.calToday : ''}`}
                  onClick={() => toggleBlockDate(dateStr)}
                >
                  <span className={s.calDayName}>{dayName}</span>
                  <span className={s.calDayNum}>{dayNum}</span>
                  <span className={s.calMonth}>{monthName}</span>
                  {isBlocked && <span className={s.blockedX}>✕</span>}
                </button>
              )
            })}
          </div>

          {blockedDates.length > 0 && (
            <div className={s.blockedList}>
              <div className={s.blockedTitle}>Blocked dates ({blockedDates.length})</div>
              {blockedDates.sort().map(d => (
                <div key={d} className={s.blockedItem}>
                  <span>{new Date(d).toLocaleDateString('en-PK', { weekday:'long', month:'long', day:'numeric' })}</span>
                  <button onClick={() => toggleBlockDate(d)} className={s.unblockBtn}>Unblock</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
