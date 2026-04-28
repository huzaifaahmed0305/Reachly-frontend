import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'

const DAYS = [
  { id:'monday',    label:'Monday' },
  { id:'tuesday',   label:'Tuesday' },
  { id:'wednesday', label:'Wednesday' },
  { id:'thursday',  label:'Thursday' },
  { id:'friday',    label:'Friday' },
  { id:'saturday',  label:'Saturday' },
  { id:'sunday',    label:'Sunday' },
]

const TIMES = [
  '08:00','09:00','10:00','10:30','11:00','11:30',
  '12:00','13:00','14:00','14:30','15:00','15:30',
  '16:00','17:00','18:00','19:00','20:00','21:00',
]

const fmt = (t) => {
  const [h, m] = t.split(':')
  const hr = Number(h)
  return `${hr % 12 || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`
}

const next35Days = () => {
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
  const [schedule, setSchedule] = useState({})
  const [blocked, setBlocked] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/availability/me')
      .then(r => {
        const grouped = {}
        for (const row of (r.data.schedule || [])) {
          if (!grouped[row.day_of_week]) grouped[row.day_of_week] = []
          grouped[row.day_of_week].push(row.start_time.slice(0,5))
        }
        setSchedule(grouped)
        setBlocked((r.data.blocked_dates || []).map(b => b.date))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const toggleSlot = (day, time) => {
    setSchedule(prev => {
      const cur = prev[day] || []
      return { ...prev, [day]: cur.includes(time) ? cur.filter(t => t !== time) : [...cur, time].sort() }
    })
  }

  const toggleDay = (day) => {
    setSchedule(prev => {
      if (prev[day]?.length > 0) return { ...prev, [day]: [] }
      return { ...prev, [day]: ['09:00','10:00','11:00','14:00','15:00'] }
    })
  }

  const save = async () => {
    setSaving(true); setError(''); setSaved(false)
    try {
      const arr = Object.entries(schedule)
        .filter(([,slots]) => slots.length > 0)
        .map(([day, slots]) => ({ day, slots }))
      await api.post('/availability/me/schedule', { schedule: arr })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to save')
    } finally { setSaving(false) }
  }

  const toggleBlock = async (dateStr) => {
    try {
      if (blocked.includes(dateStr)) {
        await api.delete(`/availability/me/block/${dateStr}`)
        setBlocked(p => p.filter(d => d !== dateStr))
      } else {
        await api.post('/availability/me/block', { date: dateStr, reason: 'Unavailable' })
        setBlocked(p => [...p, dateStr])
      }
    } catch (e) { setError(e.response?.data?.error || 'Failed') }
  }

  const totalSlots = Object.values(schedule).reduce((s, slots) => s + slots.length, 0)
  const activeDays = Object.values(schedule).filter(s => s.length > 0).length

  const styles = {
    page: { minHeight:'100vh', background:'#0C0C0C', fontFamily:"'DM Sans',sans-serif", color:'#F0EBE1' },
    nav: { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'18px 32px', background:'#141414', borderBottom:'0.5px solid rgba(200,169,126,0.15)', position:'sticky', top:0, zIndex:100 },
    navLogo: { fontFamily:"'DM Serif Display',serif", fontSize:22, color:'#C8A97E' },
    backBtn: { background:'none', border:'0.5px solid rgba(200,169,126,0.2)', color:'#9A9080', borderRadius:20, padding:'7px 16px', fontSize:13, cursor:'pointer', fontFamily:"'DM Sans',sans-serif" },
    wrap: { maxWidth:720, margin:'0 auto', padding:'32px 24px' },
    header: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24, flexWrap:'wrap', gap:12 },
    title: { fontFamily:"'DM Serif Display',serif", fontSize:26, color:'#F0EBE1', marginBottom:4 },
    sub: { fontSize:13, color:'#9A9080' },
    stats: { display:'flex', gap:12 },
    statBox: { background:'#161616', border:'0.5px solid rgba(200,169,126,0.15)', borderRadius:12, padding:'12px 20px', textAlign:'center' },
    statNum: { fontFamily:"'DM Serif Display',serif", fontSize:22, color:'#C8A97E', display:'block', marginBottom:2 },
    statLabel: { fontSize:11, color:'#9A9080' },
    tabs: { display:'flex', gap:8, marginBottom:20 },
    tab: (active) => ({ background: active ? 'rgba(200,169,126,0.1)' : 'none', border: `0.5px solid ${active ? '#C8A97E' : 'rgba(200,169,126,0.15)'}`, color: active ? '#C8A97E' : '#9A9080', borderRadius:20, padding:'8px 20px', fontSize:13, cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }),
    error: { background:'rgba(226,90,90,0.1)', border:'0.5px solid rgba(226,90,90,0.3)', borderRadius:10, padding:'10px 14px', fontSize:13, color:'#E25A5A', marginBottom:16 },
    success: { background:'rgba(76,175,138,0.1)', border:'0.5px solid rgba(76,175,138,0.3)', borderRadius:10, padding:'10px 14px', fontSize:13, color:'#4CAF8A', marginBottom:16 },
    info: { background:'#161616', borderRadius:10, padding:'10px 14px', fontSize:12, color:'#9A9080', marginBottom:16, lineHeight:1.6 },
    dayRow: (active) => ({ background: active ? '#161616' : '#141414', border: `0.5px solid ${active ? 'rgba(200,169,126,0.25)' : 'rgba(200,169,126,0.1)'}`, borderRadius:14, padding:16, marginBottom:10 }),
    dayHeader: { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:0 },
    dayName: { fontSize:15, fontWeight:500, color:'#F0EBE1', marginBottom:2 },
    dayCount: { fontSize:11, color:'#9A9080' },
    tog: (on) => ({ width:40, height:22, borderRadius:11, background: on ? 'rgba(200,169,126,0.3)' : '#2A2520', position:'relative', cursor:'pointer', flexShrink:0, transition:'background 0.2s' }),
    togInner: (on) => ({ position:'absolute', width:16, height:16, borderRadius:'50%', background: on ? '#C8A97E' : '#605850', top:3, left: on ? 21 : 3, transition:'all 0.2s' }),
    timeGrid: { display:'flex', flexWrap:'wrap', gap:8, marginTop:12 },
    timeBtn: (sel) => ({ background: sel ? 'rgba(200,169,126,0.12)' : '#1E1E1E', border: `0.5px solid ${sel ? '#C8A97E' : 'rgba(200,169,126,0.12)'}`, borderRadius:8, padding:'7px 12px', fontSize:12, color: sel ? '#C8A97E' : '#9A9080', cursor:'pointer', fontFamily:"'DM Sans',sans-serif", fontWeight: sel ? 500 : 400 }),
    saveBtn: { width:'100%', background:'#C8A97E', color:'#0C0C0C', border:'none', borderRadius:12, padding:13, fontSize:15, fontWeight:500, cursor:'pointer', fontFamily:"'DM Sans',sans-serif", marginTop:16, minHeight:48 },
    calGrid: { display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:8, marginBottom:20 },
    calDay: (blocked, today) => ({ background: blocked ? 'rgba(226,90,90,0.08)' : '#141414', border: `0.5px solid ${blocked ? 'rgba(226,90,90,0.3)' : today ? 'rgba(200,169,126,0.4)' : 'rgba(200,169,126,0.1)'}`, borderRadius:10, padding:'8px 4px', cursor:'pointer', fontFamily:"'DM Sans',sans-serif", display:'flex', flexDirection:'column', alignItems:'center', gap:2, position:'relative' }),
    calDayName: { fontSize:10, color:'#9A9080' },
    calDayNum: { fontSize:15, fontWeight:500, color:'#F0EBE1' },
    calMonth: { fontSize:9, color:'#605850' },
    xMark: { position:'absolute', top:2, right:4, fontSize:9, color:'#E25A5A', fontWeight:700 },
    blockedList: { background:'#141414', border:'0.5px solid rgba(200,169,126,0.12)', borderRadius:14, padding:16 },
    blockedTitle: { fontSize:11, color:'#9A9080', letterSpacing:1, marginBottom:10 },
    blockedItem: { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:'0.5px solid rgba(200,169,126,0.08)', fontSize:13 },
    unblockBtn: { background:'none', border:'0.5px solid rgba(76,175,138,0.3)', color:'#4CAF8A', borderRadius:20, padding:'3px 12px', fontSize:11, cursor:'pointer', fontFamily:"'DM Sans',sans-serif" },
  }

  if (loading) return (
    <div style={{ ...styles.page, display:'flex', alignItems:'center', justifyContent:'center', height:'100vh' }}>
      <div style={{ width:36, height:36, border:'3px solid rgba(200,169,126,0.2)', borderTopColor:'#C8A97E', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
    </div>
  )

  return (
    <div style={styles.page}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      <nav style={styles.nav}>
        <span style={styles.navLogo}>Reachly</span>
        <button style={styles.backBtn} onClick={() => navigate('/dashboard')}>← Dashboard</button>
      </nav>

      <div style={styles.wrap}>

        <div style={styles.header}>
          <div>
            <div style={styles.title}>Manage Availability</div>
            <div style={styles.sub}>Set when followers can book sessions with you</div>
          </div>
          <div style={styles.stats}>
            <div style={styles.statBox}><span style={styles.statNum}>{activeDays}</span><span style={styles.statLabel}>Active days</span></div>
            <div style={styles.statBox}><span style={styles.statNum}>{totalSlots}</span><span style={styles.statLabel}>Time slots</span></div>
          </div>
        </div>

        {error && <div style={styles.error}>{error}</div>}
        {saved && <div style={styles.success}>✓ Schedule saved!</div>}

        <div style={styles.tabs}>
          <button style={styles.tab(tab==='weekly')} onClick={() => setTab('weekly')}>Weekly Schedule</button>
          <button style={styles.tab(tab==='block')} onClick={() => setTab('block')}>Block Dates</button>
        </div>

        {tab === 'weekly' && (
          <div>
            <div style={styles.info}>Set your recurring weekly schedule. Followers can only book during these slots.</div>
            {DAYS.map(day => {
              const slots = schedule[day.id] || []
              const isOn = slots.length > 0
              return (
                <div key={day.id} style={styles.dayRow(isOn)}>
                  <div style={styles.dayHeader}>
                    <div>
                      <div style={styles.dayName}>{day.label}</div>
                      <div style={styles.dayCount}>{isOn ? `${slots.length} slots` : 'Unavailable'}</div>
                    </div>
                    <div style={styles.tog(isOn)} onClick={() => toggleDay(day.id)}>
                      <div style={styles.togInner(isOn)} />
                    </div>
                  </div>
                  {isOn && (
                    <div style={styles.timeGrid}>
                      {TIMES.map(time => (
                        <button key={time} style={styles.timeBtn(slots.includes(time))} onClick={() => toggleSlot(day.id, time)}>
                          {fmt(time)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
            <button style={styles.saveBtn} onClick={save} disabled={saving}>
              {saving ? 'Saving...' : '✓ Save Weekly Schedule'}
            </button>
          </div>
        )}

        {tab === 'block' && (
          <div>
            <div style={styles.info}>Click any date to mark it as unavailable. Followers cannot book on blocked dates.</div>
            <div style={styles.calGrid}>
              {next35Days().map(d => {
                const dateStr = d.toISOString().split('T')[0]
                const isBlocked = blocked.includes(dateStr)
                const isToday = d.toDateString() === new Date().toDateString()
                return (
                  <div key={dateStr} style={styles.calDay(isBlocked, isToday)} onClick={() => toggleBlock(dateStr)}>
                    <span style={styles.calDayName}>{d.toLocaleDateString('en',{weekday:'short'})}</span>
                    <span style={styles.calDayNum}>{d.getDate()}</span>
                    <span style={styles.calMonth}>{d.toLocaleDateString('en',{month:'short'})}</span>
                    {isBlocked && <span style={styles.xMark}>✕</span>}
                  </div>
                )
              })}
            </div>
            {blocked.length > 0 && (
              <div style={styles.blockedList}>
                <div style={styles.blockedTitle}>BLOCKED DATES ({blocked.length})</div>
                {blocked.sort().map(d => (
                  <div key={d} style={styles.blockedItem}>
                    <span>{new Date(d).toLocaleDateString('en-PK',{weekday:'long',month:'long',day:'numeric'})}</span>
                    <button style={styles.unblockBtn} onClick={() => toggleBlock(d)}>Unblock</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
