'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import Logo from '@/components/ui/Logo';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { isLoggedIn, user, logout } = useAuth();
  const [headerName, setHeaderName] = useState('My Profile');

  useEffect(() => {
    if (user?.id) {
      import('@/utils/supabase/client').then(({ createClient }) => {
        const supabase = createClient();
        supabase.from('profiles').select('full_name').eq('id', user.id).single()
          .then(({ data }) => {
            if (data?.full_name) {
              setHeaderName(data.full_name);
            }
          });
      });
    }
  }, [user]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'How it Works', href: '/#how-it-works' },
    { label: 'Features',     href: '/#features' },
    { label: 'Pricing',      href: '/#pricing' },
  ];

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      padding: '0 24px', height: '70px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: scrolled ? 'var(--header-bg)' : 'transparent',
      backdropFilter: scrolled ? 'blur(24px)' : 'none',
      WebkitBackdropFilter: scrolled ? 'blur(24px)' : 'none',
      borderBottom: scrolled ? '1px solid var(--header-border)' : '1px solid transparent',
      transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)',
    }}>
      {/* Logo */}
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
        <Logo size={36} showText />
      </Link>

      {/* Desktop Nav */}
      <nav className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
        {navLinks.map(link => (
          <Link key={link.label} href={link.href} style={{
            fontSize: '0.85rem', fontWeight: 400,
            letterSpacing: '0.06em', textTransform: 'uppercase',
            color: 'var(--text-secondary)',
            transition: 'color 0.3s',
          }}
          onMouseEnter={e => e.target.style.color = 'var(--gold)'}
          onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}>
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Right side: theme toggle + Login + CTA */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="theme-toggle"
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          aria-label="Toggle theme"
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>

        {!isLoggedIn ? (
          <Link href="/login" className="hide-mobile" style={{
            fontSize: '0.85rem', color: 'var(--text-secondary)',
            fontWeight: 500, letterSpacing: '0.04em',
          }}>
            Login
          </Link>
        ) : (
          <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link href="/dashboard" style={{
              fontSize: '0.85rem', color: 'var(--text-secondary)',
              fontWeight: 500, letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              <span style={{
                width: '22px', height: '22px', borderRadius: '50%', background: 'var(--gold-glow)', border: '1px solid var(--gold)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)',
                fontWeight: 'bold', fontSize: '0.75rem'
              }}>
                {headerName.charAt(0).toUpperCase()}
              </span>
              {headerName.split(' ')[0]}
            </Link>
            <button onClick={logout} style={{
              fontSize: '0.85rem', color: 'var(--text-dim)',
              fontWeight: 500, letterSpacing: '0.04em', background: 'none', border: 'none', cursor: 'pointer', padding: 0
            }}>
              Logout
            </button>
          </div>
        )}

        <Link href="/scan" className="btn btn-gold btn-sm">
          Scan Free ✦
        </Link>

        {/* Mobile hamburger */}
        <button
          className="hide-desktop"
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{
            display: 'none', width: '36px', height: '36px',
            flexDirection: 'column', justifyContent: 'center', gap: '6px',
            alignItems: 'center',
          }}
        >
          <span style={{
            display: 'block', width: '20px', height: '1.5px',
            background: 'var(--text-primary)', transition: 'all 0.3s',
            transform: mobileOpen ? 'rotate(45deg) translate(3px, 3px)' : 'none',
          }} />
          <span style={{
            display: 'block', width: '20px', height: '1.5px',
            background: 'var(--text-primary)', transition: 'all 0.3s',
            opacity: mobileOpen ? 0 : 1,
          }} />
          <span style={{
            display: 'block', width: '20px', height: '1.5px',
            background: 'var(--text-primary)', transition: 'all 0.3s',
            transform: mobileOpen ? 'rotate(-45deg) translate(3px, -3px)' : 'none',
          }} />
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{
          position: 'absolute', top: '70px', left: 0, right: 0,
          background: 'var(--header-bg)', backdropFilter: 'blur(24px)',
          borderBottom: '1px solid var(--header-border)',
          padding: '20px 24px',
          display: 'flex', flexDirection: 'column', gap: '16px',
        }}>
          {navLinks.map(link => (
            <Link key={link.label} href={link.href} style={{
              fontSize: '0.9rem', color: 'var(--text-secondary)',
            }} onClick={() => setMobileOpen(false)}>
              {link.label}
            </Link>
          ))}
          {!isLoggedIn ? (
            <Link href="/login" style={{ fontSize: '0.9rem', color: 'var(--gold)' }} onClick={() => setMobileOpen(false)}>
              Login
            </Link>
          ) : (
            <>
              <Link href="/dashboard" style={{ fontSize: '0.9rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => setMobileOpen(false)}>
                <span style={{
                  width: '24px', height: '24px', borderRadius: '50%', background: 'var(--gold-glow)', border: '1px solid var(--gold)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)',
                  fontWeight: 'bold', fontSize: '0.8rem'
                }}>
                  {headerName.charAt(0).toUpperCase()}
                </span>
                {headerName.split(' ')[0]}
              </Link>
              <button 
                onClick={() => { setMobileOpen(false); logout(); }} 
                style={{ fontSize: '0.9rem', color: 'var(--text-dim)', background: 'none', border: 'none', textAlign: 'left', padding: 0, cursor: 'pointer' }}
              >
                Logout
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
}
