import { Link } from 'react-router-dom'
import s from './Home.module.css'

export default function Home() {
  return (
    <div className={s.page}>
      <section className={s.hero}>
        <div className={s.badge}>🇵🇰 Made for Pakistani Creators</div>
        <h1 className={s.headline}>
          Book 1-on-1 time<br/>
          with <em>your favourite</em><br/>
          creators
        </h1>
        <p className={s.sub}>
          Reachly lets influencers monetize personal sessions — coaching,<br/>
          brand calls, or just a chat. Pay in PKR, book in seconds.
        </p>
        <div className={s.actions}>
          <Link to="/explore" className={s.btnPrimary}>Browse Creators →</Link>
          <Link to="/register?role=influencer" className={s.btnGhost}>I'm a Creator</Link>
        </div>
        <div className={s.stats}>
          <div className={s.stat}><span>340+</span>Sessions booked</div>
          <div className={s.statDiv}/>
          <div className={s.stat}><span>50+</span>Active creators</div>
          <div className={s.statDiv}/>
          <div className={s.stat}><span>4.9★</span>Average rating</div>
        </div>
      </section>

      <section className={s.howSection}>
        <h2>How it works</h2>
        <div className={s.steps}>
          {[
            { n:'01', t:'Find a creator', d:'Browse verified Pakistani influencers across lifestyle, tech, fashion, and more.' },
            { n:'02', t:'Pick a session', d:'Choose from 1-on-1 coaching, quick chats, or brand collaboration calls.' },
            { n:'03', t:'Pay & confirm', d:'Pay securely via JazzCash or EasyPaisa. Get an instant Google Meet link.' },
          ].map(step => (
            <div key={step.n} className={s.step}>
              <div className={s.stepNum}>{step.n}</div>
              <div className={s.stepTitle}>{step.t}</div>
              <div className={s.stepDesc}>{step.d}</div>
            </div>
          ))}
        </div>
      </section>

      <section className={s.ctaSection}>
        <h2>Are you a creator?</h2>
        <p>Join Reachly and start earning from your audience. Set your own price, manage your calendar, get paid directly.</p>
        <Link to="/register?role=influencer" className={s.btnPrimary}>Start for free →</Link>
      </section>
    </div>
  )
}
