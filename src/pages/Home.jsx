/**
 * Home.jsx — src/pages/Home.jsx
 * Smart home — redirects logged-in users to their dashboard
 * Logged-out users see the landing page
 */
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Home() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'influencer') navigate('/dashboard', { replace: true })
      else navigate('/home', { replace: true })
    }
  }, [user, loading, navigate])

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'#0C0C0C' }}>
      <div style={{ width:36, height:36, border:'3px solid rgba(200,169,126,0.2)', borderTopColor:'#C8A97E', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  // Only shown to logged-out users
  return (
    <div style={{ minHeight:'100vh', background:'#0C0C0C', fontFamily:"'DM Sans',sans-serif", color:'#F0EBE1' }}>
      {/* NAV */}
      <nav style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'18px 40px', borderBottom:'0.5px solid rgba(200,169,126,0.15)' }}>
        <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:24, color:'#C8A97E' }}>Reachly</div>
        <div style={{ display:'flex', gap:12 }}>
          <button onClick={() => navigate('/explore')} style={{ background:'none', border:'none', color:'#9A9080', fontSize:14, cursor:'pointer', fontFamily:"'DM Sans',sans-serif", padding:'8px 16px' }}>Explore</button>
          <button onClick={() => navigate('/login')} style={{ background:'none', border:'0.5px solid rgba(200,169,126,0.3)', color:'#C8A97E', fontSize:14, cursor:'pointer', fontFamily:"'DM Sans',sans-serif", padding:'8px 20px', borderRadius:20 }}>Log in</button>
          <button onClick={() => navigate('/register')} style={{ background:'#C8A97E', border:'none', color:'#0C0C0C', fontSize:14, cursor:'pointer', fontFamily:"'DM Sans',sans-serif", padding:'8px 20px', borderRadius:20, fontWeight:600 }}>Join free</button>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ maxWidth:900, margin:'0 auto', padding:'100px 40px', textAlign:'center' }}>
        <div style={{ display:'inline-block', background:'rgba(200,169,126,0.1)', border:'1px solid rgba(200,169,126,0.3)', borderRadius:40, padding:'8px 24px', fontSize:13, color:'#C8A97E', fontWeight:700, letterSpacing:4, marginBottom:32 }}>🇵🇰 PAKISTAN'S CREATOR PLATFORM</div>
        <h1 style={{ fontFamily:"'DM Serif Display',serif", fontSize:72, fontWeight:400, color:'#FFFFFF', lineHeight:1.0, letterSpacing:-2, marginBottom:24, padding:'0 0 8px' }}>
          Book your favourite<br/>
          <span style={{ color:'#C8A97E', fontStyle:'italic' }}>creator.</span>
        </h1>
        <p style={{ fontSize:18, color:'#9A9080', lineHeight:1.7, marginBottom:48, maxWidth:600, margin:'0 auto 48px' }}>
          Real 1-on-1 sessions with Pakistan's top creators.<br/>Pay via JazzCash. Get your Google Meet link instantly.
        </p>
        <div style={{ display:'flex', gap:16, justifyContent:'center', flexWrap:'wrap' }}>
          <button onClick={() => navigate('/register?role=follower')} style={{ background:'#C8A97E', border:'none', color:'#0C0C0C', fontSize:16, fontWeight:600, cursor:'pointer', fontFamily:"'DM Sans',sans-serif", padding:'16px 40px', borderRadius:40 }}>Book a session</button>
          <button onClick={() => navigate('/register?role=influencer')} style={{ background:'none', border:'1px solid rgba(200,169,126,0.3)', color:'#C8A97E', fontSize:16, cursor:'pointer', fontFamily:"'DM Sans',sans-serif", padding:'16px 40px', borderRadius:40 }}>Become a creator</button>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div style={{ maxWidth:1000, margin:'0 auto', padding:'60px 40px' }}>
        <div style={{ textAlign:'center', fontSize:12, fontWeight:700, color:'#C8A97E', letterSpacing:6, marginBottom:48 }}>HOW IT WORKS</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:24 }}>
          {[
            { num:'01', title:'Find your creator', desc:'Browse Pakistan\'s top creators across all niches' },
            { num:'02', title:'Book a session', desc:'Pick a time slot and pay via JazzCash or EasyPaisa' },
            { num:'03', title:'Get your Meet link', desc:'Join your Google Meet call and get real answers' },
          ].map(step => (
            <div key={step.num} style={{ background:'#141414', border:'0.5px solid rgba(200,169,126,0.12)', borderRadius:16, padding:28, textAlign:'center' }}>
              <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:48, color:'rgba(200,169,126,0.2)', marginBottom:12 }}>{step.num}</div>
              <div style={{ fontSize:16, fontWeight:500, color:'#F0EBE1', marginBottom:8 }}>{step.title}</div>
              <div style={{ fontSize:13, color:'#9A9080', lineHeight:1.6 }}>{step.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ textAlign:'center', padding:'32px 40px', borderTop:'0.5px solid rgba(200,169,126,0.1)', fontSize:12, color:'#605850' }}>
        <div style={{ marginBottom:6 }}>© Reachly 2026. All rights reserved.</div>
        <div>Made with ❤️ by <a href="https://instagram.com/huzaifaahmed0305" target="_blank" rel="noreferrer" style={{ color:'#C8A97E', textDecoration:'none' }}>@huzaifaahmed0305</a></div>
      </footer>
    </div>
  )
}
