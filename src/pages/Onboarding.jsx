/**
 * Onboarding Page — src/pages/Onboarding.jsx
 * Add to App.jsx:
 *   import Onboarding from './pages/Onboarding'
 *   <Route path="/onboarding" element={<ProtectedRoute role="influencer"><Onboarding /></ProtectedRoute>} />
 *
 * Also update Register.jsx — after register success for influencer role:
 *   navigate('/onboarding')
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'
import s from './Onboarding.module.css'

const STEPS = [
  { id: 1, label: 'Profile',   title: 'Set up your profile',      sub: 'Tell your followers who you are' },
  { id: 2, label: 'Sessions',  title: 'Create your sessions',     sub: 'What can followers book with you?' },
  { id: 3, label: 'Pricing',   title: 'Set your prices',          sub: 'You decide what your time is worth' },
  { id: 4, label: 'Go Live',   title: 'You\'re ready to launch!', sub: 'Share your link and start getting bookings' },
]

const SESSION_TEMPLATES = [
  { title: 'Quick Chat',        duration_minutes: 20,  price_pkr: 2500,  description: 'A short personal call — your followers can ask you anything.' },
  { title: '1-on-1 Coaching',   duration_minutes: 45,  price_pkr: 6000,  description: 'Deep dive into goals, growth, and strategy.' },
  { title: 'Brand Collab Call', duration_minutes: 60,  price_pkr: 12000, description: 'For brands and businesses wanting to collaborate.' },
]

export default function Onboarding() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Step 1 — Profile
  const [profile, setProfile] = useState({
    bio: '',
    handle: '',
    instagram_url: '',
    youtube_url: '',
  })

  // Step 2 — Sessions selected
  const [selectedSessions, setSelectedSessions] = useState([0, 1])

  // Step 3 — Prices (editable)
  const [prices, setPrices] = useState(
    SESSION_TEMPLATES.map(s => ({ ...s }))
  )

  const handleProfile = e => setProfile(p => ({ ...p, [e.target.name]: e.target.value }))

  const toggleSession = (i) => {
    setSelectedSessions(prev =>
      prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]
    )
  }

  const updatePrice = (i, field, value) => {
    setPrices(prev => prev.map((p, idx) => idx === i ? { ...p, [field]: value } : p))
  }

  const saveProfile = async () => {
    if (!profile.bio.trim()) { setError('Please write a short bio'); return }
    setLoading(true); setError('')
    try {
      await api.put('/influencers/me/profile', profile)
      setStep(2)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save profile')
    } finally { setLoading(false) }
  }

  const saveSessions = async () => {
    if (selectedSessions.length === 0) { setError('Select at least one session type'); return }
    setStep(3)
  }

  const savePrices = async () => {
    setLoading(true); setError('')
    try {
      const toCreate = selectedSessions.map(i => prices[i])
      await Promise.all(toCreate.map(session =>
        api.post('/sessions', session)
      ))
      setStep(4)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create sessions')
    } finally { setLoading(false) }
  }

  const handle = profile.handle || user?.name?.toLowerCase().replace(/\s+/g, '')

  return (
    <div className={s.page}>
      <div className={s.wrap}>

        {/* Progress bar */}
        <div className={s.progress}>
          {STEPS.map((st, i) => (
            <div key={st.id} className={s.progressItem}>
              <div className={`${s.stepDot} ${step > st.id ? s.stepDone : step === st.id ? s.stepActive : ''}`}>
                {step > st.id ? '✓' : st.id}
              </div>
              <span className={`${s.stepLabel} ${step >= st.id ? s.stepLabelActive : ''}`}>{st.label}</span>
              {i < STEPS.length - 1 && <div className={`${s.stepLine} ${step > st.id ? s.stepLineDone : ''}`}/>}
            </div>
          ))}
        </div>

        {/* Header */}
        <div className={s.header}>
          <div className={s.stepTag}>Step {step} of {STEPS.length}</div>
          <h1>{STEPS[step - 1].title}</h1>
          <p>{STEPS[step - 1].sub}</p>
        </div>

        {error && <div className={s.error}>{error}</div>}

        {/* STEP 1 — Profile */}
        {step === 1 && (
          <div className={s.card}>
            <div className={s.field}>
              <label>Your handle / username <span className={s.req}>*</span></label>
              <div className={s.handleWrap}>
                <span className={s.handlePrefix}>reachly.pk/creator/</span>
                <input name="handle" value={profile.handle}
                  onChange={handleProfile} placeholder="yourname"
                  className={s.handleInput}/>
              </div>
              <div className={s.hint}>Lowercase letters and numbers only. This is your public booking link.</div>
            </div>

            <div className={s.field}>
              <label>Your bio <span className={s.req}>*</span></label>
              <textarea name="bio" value={profile.bio}
                onChange={handleProfile} rows={4}
                placeholder="Tell your followers who you are, what you do, and why they should book a session with you..."/>
              <div className={s.charCount}>{profile.bio.length}/500</div>
            </div>

            <div className={s.fieldRow}>
              <div className={s.field}>
                <label>Instagram URL</label>
                <input name="instagram_url" value={profile.instagram_url}
                  onChange={handleProfile} placeholder="https://instagram.com/yourname"/>
              </div>
              <div className={s.field}>
                <label>YouTube URL</label>
                <input name="youtube_url" value={profile.youtube_url}
                  onChange={handleProfile} placeholder="https://youtube.com/@yourname"/>
              </div>
            </div>

            <button className={s.btn} onClick={saveProfile} disabled={loading}>
              {loading ? <span className="spinner"/> : 'Save & Continue →'}
            </button>
          </div>
        )}

        {/* STEP 2 — Session types */}
        {step === 2 && (
          <div className={s.card}>
            <div className={s.sessionGrid}>
              {SESSION_TEMPLATES.map((session, i) => (
                <div key={i}
                  className={`${s.sessionCard} ${selectedSessions.includes(i) ? s.sessionSelected : ''}`}
                  onClick={() => toggleSession(i)}>
                  <div className={s.sessionCheck}>
                    {selectedSessions.includes(i) ? '✓' : ''}
                  </div>
                  <div className={s.sessionDur}>{session.duration_minutes} MIN</div>
                  <div className={s.sessionTitle}>{session.title}</div>
                  <div className={s.sessionDesc}>{session.description}</div>
                  <div className={s.sessionPrice}>Rs {session.price_pkr.toLocaleString()}</div>
                </div>
              ))}
            </div>
            <div className={s.hint} style={{marginBottom:20}}>
              Select the session types you want to offer. You can add more later from your dashboard.
            </div>
            <div className={s.btnRow}>
              <button className={s.btnSecondary} onClick={() => setStep(1)}>← Back</button>
              <button className={s.btn} onClick={saveSessions}>
                Continue → ({selectedSessions.length} selected)
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 — Pricing */}
        {step === 3 && (
          <div className={s.card}>
            <div className={s.pricingList}>
              {selectedSessions.map(i => (
                <div key={i} className={s.pricingRow}>
                  <div className={s.pricingLeft}>
                    <div className={s.pricingTitle}>{prices[i].title}</div>
                    <div className={s.pricingDur}>{prices[i].duration_minutes} minutes</div>
                    <input
                      className={s.descInput}
                      value={prices[i].description}
                      onChange={e => updatePrice(i, 'description', e.target.value)}
                      placeholder="Short description for followers..."
                    />
                  </div>
                  <div className={s.pricingRight}>
                    <div className={s.priceLabel}>Price (PKR)</div>
                    <div className={s.priceInputWrap}>
                      <span className={s.pricePre}>Rs</span>
                      <input type="number"
                        className={s.priceInput}
                        value={prices[i].price_pkr}
                        onChange={e => updatePrice(i, 'price_pkr', Number(e.target.value))}
                        min={500} step={500}/>
                    </div>
                    <div className={s.priceHint}>
                      You keep Rs {Math.round(prices[i].price_pkr * 0.9).toLocaleString()} (90%)
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className={s.feeNote}>Reachly takes 10% per booking. You keep the rest.</div>
            <div className={s.btnRow}>
              <button className={s.btnSecondary} onClick={() => setStep(2)}>← Back</button>
              <button className={s.btn} onClick={savePrices} disabled={loading}>
                {loading ? <span className="spinner"/> : 'Go Live! 🚀'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4 — Go Live */}
        {step === 4 && (
          <div className={s.card}>
            <div className={s.successWrap}>
              <div className={s.successIcon}>🎉</div>
              <h2>You're live on Reachly!</h2>
              <p>Your booking page is now live. Share your link and start getting bookings.</p>

              <div className={s.linkBox}>
                <div className={s.linkLabel}>Your booking link</div>
                <div className={s.linkUrl}>reachly.pk/creator/{handle}</div>
                <button className={s.copyBtn} onClick={() => {
                  navigator.clipboard.writeText(`https://reachly.pk/creator/${handle}`)
                  alert('Link copied!')
                }}>Copy Link</button>
              </div>

              <div className={s.nextSteps}>
                <div className={s.nextTitle}>What to do next:</div>
                <div className={s.nextItem}>📱 Put your link in your Instagram bio</div>
                <div className={s.nextItem}>📢 Post about your Reachly page in your stories</div>
                <div className={s.nextItem}>💬 Tell your followers they can book a session with you</div>
              </div>

              <button className={s.btn} onClick={() => navigate('/dashboard')}>
                Go to Dashboard →
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
