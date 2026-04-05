import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import api from '../lib/api'
import s from './BookingFlow.module.css'

const DAYS = ['Su','Mo','Tu','We','Th','Fr','Sa']
const TIMES = ['09:00','10:00','11:00','11:30','13:00','14:00','15:00','16:00','17:00','18:00']

export default function BookingFlow() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const { session, influencer } = state || {}

  const [step, setStep] = useState(1)
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTime, setSelectedTime] = useState(null)
  const [form, setForm] = useState({ note: '', payment_method: 'jazzcash', phone: '' })
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!session || !influencer) { navigate('/explore'); return null }

  const platformFee = Math.round(session.price_pkr * 0.1)
  const total = session.price_pkr + platformFee

  // Build next 14 days calendar (skip Sundays for demo)
  const today = new Date()
  const dates = Array.from({length: 14}, (_, i) => {
    const d = new Date(today); d.setDate(today.getDate() + i + 1); return d
  }).filter(d => d.getDay() !== 0)

  const confirm = async () => {
    if (!selectedDate || !selectedTime) return
    setLoading(true); setError('')
    const [h, m] = selectedTime.split(':')
    const dt = new Date(selectedDate)
    dt.setHours(Number(h), Number(m), 0, 0)

    try {
      const { data } = await api.post('/bookings', {
        session_type_id: session.id,
        influencer_id: influencer.id,
        scheduled_at: dt.toISOString(),
        payment_method: form.payment_method,
        note: form.note,
      })
      setBooking(data.booking)
      setStep(4)
    } catch (err) {
      setError(err.response?.data?.error || 'Booking failed')
    } finally { setLoading(false) }
  }

  return (
    <div className={s.page}>
      <div className={s.wrap}>
        {/* Progress */}
        <div className={s.progress}>
          {[1,2,3].map(n => (
            <div key={n} className={s.progressItem}>
              <div className={`${s.dot} ${step >= n ? s.dotDone : ''} ${step === n ? s.dotActive : ''}`}>{step > n ? '✓' : n}</div>
              <span className={step >= n ? s.labelActive : s.label}>
                {['Date & Time','Your Details','Payment'][n-1]}
              </span>
              {n < 3 && <div className={`${s.line} ${step > n ? s.lineDone : ''}`}/>}
            </div>
          ))}
        </div>

        {/* Session summary bar */}
        <div className={s.sessionBar}>
          <div>
            <div className={s.sessionBarTitle}>{session.title} with {influencer.name}</div>
            <div className={s.sessionBarSub}>{session.duration_minutes} min · Rs {session.price_pkr?.toLocaleString()}</div>
          </div>
        </div>

        {error && <div className={s.error}>{error}</div>}

        {/* Step 1 — Date & Time */}
        {step === 1 && (
          <div className={s.card}>
            <h2>Pick a date</h2>
            <div className={s.dateGrid}>
              {dates.map((d, i) => (
                <div key={i}
                  className={`${s.dateCell} ${selectedDate?.toDateString() === d.toDateString() ? s.selected : ''}`}
                  onClick={() => setSelectedDate(d)}>
                  <span className={s.dayName}>{DAYS[d.getDay()]}</span>
                  <span className={s.dayNum}>{d.getDate()}</span>
                </div>
              ))}
            </div>

            <h3 className={s.timeLabel}>
              {selectedDate ? `Available times on ${selectedDate.toLocaleDateString('en-PK',{month:'short',day:'numeric'})}` : 'Select a date first'}
            </h3>
            {selectedDate && (
              <div className={s.timeGrid}>
                {TIMES.map((t, i) => (
                  <div key={t}
                    className={`${s.timeSlot} ${selectedTime === t ? s.selected : ''} ${i === 2 ? s.busy : ''}`}
                    onClick={() => i !== 2 && setSelectedTime(t)}>
                    {t}
                  </div>
                ))}
              </div>
            )}
            <button className={s.btn} disabled={!selectedDate || !selectedTime} onClick={() => setStep(2)}>
              Next →
            </button>
          </div>
        )}

        {/* Step 2 — Details */}
        {step === 2 && (
          <div className={s.card}>
            <h2>Your details</h2>
            <div className={s.field}>
              <label>What do you want to discuss?</label>
              <textarea value={form.note} onChange={e => setForm(f=>({...f,note:e.target.value}))}
                placeholder={`Tell ${influencer.name} what you'd like to talk about...`} rows={4}/>
            </div>
            <div className={s.row}>
              <button className={s.btnSecondary} onClick={() => setStep(1)}>← Back</button>
              <button className={s.btn} onClick={() => setStep(3)}>Continue →</button>
            </div>
          </div>
        )}

        {/* Step 3 — Payment */}
        {step === 3 && (
          <div className={s.card}>
            <h2>Complete payment</h2>

            <div className={s.paySum}>
              <div className={s.payRow}><span>Session</span><span>{session.title}</span></div>
              <div className={s.payRow}>
                <span>Date & time</span>
                <span>{selectedDate?.toLocaleDateString('en-PK',{month:'short',day:'numeric'})} · {selectedTime}</span>
              </div>
              <div className={s.payRow}><span>Session fee</span><span>Rs {session.price_pkr?.toLocaleString()}</span></div>
              <div className={s.payRow}><span>Platform fee (10%)</span><span>Rs {platformFee.toLocaleString()}</span></div>
              <div className={`${s.payRow} ${s.payTotal}`}><span>Total</span><span>Rs {total.toLocaleString()}</span></div>
            </div>

            <div className={s.payMethods}>
              {[['jazzcash','📱','JazzCash'],['easypaisa','🏦','EasyPaisa'],['card','💳','Card']].map(([v,icon,label]) => (
                <div key={v} className={`${s.payMethod} ${form.payment_method===v ? s.paySelected : ''}`}
                  onClick={() => setForm(f=>({...f,payment_method:v}))}>
                  <span style={{fontSize:16}}>{icon}</span>
                  <span>{label}</span>
                </div>
              ))}
            </div>

            <div className={s.field}>
              <label>{form.payment_method === 'card' ? 'Card number' : `${form.payment_method === 'jazzcash' ? 'JazzCash' : 'EasyPaisa'} number`}</label>
              <input value={form.phone} onChange={e => setForm(f=>({...f,phone:e.target.value}))}
                placeholder="03001234567" type="tel"/>
            </div>

            <div className={s.row}>
              <button className={s.btnSecondary} onClick={() => setStep(2)}>← Back</button>
              <button className={s.btn} onClick={confirm} disabled={loading}>
                {loading ? <span className="spinner"/> : `Pay Rs ${total.toLocaleString()} & Confirm`}
              </button>
            </div>
            <div className={s.feeNote}>Reachly takes 10% · Rest goes directly to {influencer.name}</div>
          </div>
        )}

        {/* Step 4 — Confirmed */}
        {step === 4 && (
          <div className={s.confirmed}>
            <div className={s.checkCircle}>✓</div>
            <h2>Booking Confirmed!</h2>
            <p>{influencer.name} will send you a WhatsApp message 24 hours before your session.</p>
            <div className={s.confDetails}>
              <div className={s.confRow}><span>Session</span><span>{session.title}</span></div>
              <div className={s.confRow}>
                <span>Date & time</span>
                <span>{selectedDate?.toLocaleDateString('en-PK',{month:'long',day:'numeric',year:'numeric'})} · {selectedTime}</span>
              </div>
              <div className={s.confRow}><span>Amount paid</span><span>Rs {total.toLocaleString()}</span></div>
              <div className={s.confRow}><span>Ref</span><span className={s.ref}>{booking?.booking_ref || 'RCH-XXXXXXXX'}</span></div>
            </div>
            <button className={s.btn} onClick={() => navigate('/my-bookings')}>View my bookings →</button>
          </div>
        )}
      </div>
    </div>
  )
}
