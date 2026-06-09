import React, { useState, useEffect } from 'react'
import { NavLink, useNavigate, Link } from 'react-router-dom'
import { useContext } from 'react'
import { AppContext } from '../Context/AppContext'

export const Navbar = () => {
  const navigate = useNavigate()
  const { token } = useContext(AppContext)
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navLinkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors duration-200 ${
      isActive ? 'text-zinc-900' : 'text-zinc-500 hover:text-zinc-900'
    }`

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 backdrop-blur-md border-b border-zinc-200 shadow-sm'
          : 'bg-white border-b border-zinc-100'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10 h-16 flex items-center justify-between">

        {/* Brand */}
        <Link to="/" className="text-xl font-bold tracking-tight text-zinc-900 select-none">
          SkillGraph
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <NavLink to="/" end className={navLinkClass}>Home</NavLink>
          <NavLink to="/about" className={navLinkClass}>About</NavLink>
          <a
            href="#features"
            className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors duration-200"
          >
            Features
          </a>
          <NavLink to="/guide" className={navLinkClass}>Guide</NavLink>
        </nav>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-4">
          {!token ? (
            <>
              <button
                onClick={() => navigate('/login')}
                className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors duration-200"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="bg-zinc-900 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-zinc-700 transition-colors duration-200"
              >
                Get Started
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-zinc-900 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-zinc-700 transition-colors duration-200"
            >
              Dashboard
            </button>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden flex flex-col gap-1.5 p-1"
          aria-label="Toggle menu"
        >
          <span className={`block w-5 h-px bg-zinc-700 transition-all duration-200 ${mobileOpen ? 'rotate-45 translate-y-2.5' : ''}`} />
          <span className={`block w-5 h-px bg-zinc-700 transition-all duration-200 ${mobileOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-5 h-px bg-zinc-700 transition-all duration-200 ${mobileOpen ? '-rotate-45 -translate-y-2.5' : ''}`} />
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-zinc-100 bg-white px-6 pb-6 pt-4 flex flex-col gap-4">
          <NavLink to="/" end className="text-sm font-medium text-zinc-700" onClick={() => setMobileOpen(false)}>Home</NavLink>
          <NavLink to="/about" className="text-sm font-medium text-zinc-700" onClick={() => setMobileOpen(false)}>About</NavLink>
          <a href="#features" className="text-sm font-medium text-zinc-700" onClick={() => setMobileOpen(false)}>Features</a>
          <NavLink to="/guide" className="text-sm font-medium text-zinc-700" onClick={() => setMobileOpen(false)}>Guide</NavLink>
          <div className="pt-2 border-t border-zinc-100 flex flex-col gap-3">
            {!token ? (
              <>
                <button onClick={() => { navigate('/login'); setMobileOpen(false) }} className="text-sm font-medium text-zinc-700 text-left">Sign In</button>
                <button onClick={() => { navigate('/signup'); setMobileOpen(false) }} className="bg-zinc-900 text-white text-sm font-semibold px-4 py-2 rounded-lg w-full">Get Started</button>
              </>
            ) : (
              <button onClick={() => { navigate('/dashboard'); setMobileOpen(false) }} className="bg-zinc-900 text-white text-sm font-semibold px-4 py-2 rounded-lg w-full">Dashboard</button>
            )}
          </div>
        </div>
      )}
    </header>
  )
}