import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import s from './Navbar.module.css'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <nav className={s.nav}>
      <Link to="/" className={s.logo}>Reach<span>ly</span></Link>

      <div className={s.links}>
        <Link to="/explore" className={location.pathname==='/explore' ? s.active : ''}>Explore</Link>
        {user ? (
          <>
            {user.role === 'influencer'
              ? <Link to="/dashboard" className={location.pathname==='/dashboard' ? s.active : ''}>Dashboard</Link>
              : <Link to="/my-bookings" className={location.pathname==='/my-bookings' ? s.active : ''}>My Bookings</Link>
            }
            <div className={s.avatar} onClick={() => setMenuOpen(!menuOpen)}>
              {user.name?.charAt(0).toUpperCase()}
              {menuOpen && (
                <div className={s.dropdown}>
                  <div className={s.dropUser}>{user.name}</div>
                  <div className={s.dropRole}>{user.role}</div>
                  <hr className={s.dropDivider}/>
                  <button onClick={handleLogout}>Sign out</button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link to="/login">Log in</Link>
            <Link to="/register" className={s.btnPrimary}>Join free</Link>
          </>
        )}
      </div>
    </nav>
  )
}
