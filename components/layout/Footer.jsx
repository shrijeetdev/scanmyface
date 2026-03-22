'use client';
import Link from 'next/link';
import Logo from '@/components/ui/Logo';

export default function Footer() {
  return (
    <footer style={{
      background: 'var(--bg-secondary)',
      borderTop: '1px solid var(--border-color)',
      padding: '64px 24px 32px',
    }}>
      <div className="container" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '48px',
      }}>
        {/* Brand column */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Logo size={28} showText />
          </div>
          <p style={{ fontSize: '0.85rem', lineHeight: 1.7, color: 'var(--text-secondary)', maxWidth: '280px' }}>
            AI-powered skin analysis and personalized skincare recommendations. Your personal skincare coach, powered by science.
          </p>
        </div>

        {/* Company links */}
        <div>
          <h4 style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '16px' }}>
            Company
          </h4>
          {[
            { n: 'About', path: '/about' },
            { n: 'Blog', path: '/blog' },
            { n: 'Careers', path: '/careers' },
            { n: 'Contact', path: '/contact' }
          ].map(item => (
            <Link key={item.n} href={item.path} style={{ display: 'block', fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '10px', transition: 'color 0.3s' }}
              onMouseEnter={e => e.target.style.color = 'var(--gold)'}
              onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}>
              {item.n}
            </Link>
          ))}
        </div>

        {/* Legal links */}
        <div>
          <h4 style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '16px' }}>
            Legal
          </h4>
          {[
            { n: 'Privacy Policy', path: '/privacy' },
            { n: 'Terms & Conditions', path: '/terms' },
            { n: 'Cookies Policy', path: '/cookies' }
          ].map(item => (
            <Link key={item.n} href={item.path} style={{ display: 'block', fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '10px', transition: 'color 0.3s' }}
              onMouseEnter={e => e.target.style.color = 'var(--gold)'}
              onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}>
              {item.n}
            </Link>
          ))}
        </div>

        {/* Newsletter */}
        <div>
          <h4 style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '16px' }}>
            Stay Updated
          </h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>Get skincare tips and product launches.</p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input type="email" placeholder="Your email" className="input" style={{ flex: 1, padding: '0.65rem 1rem', fontSize: '0.85rem' }} />
            <button className="btn btn-gold btn-sm">→</button>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: '16px',
        marginTop: '48px', paddingTop: '24px',
        borderTop: '1px solid var(--border-color)',
      }}>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          © 2026 scanmyface.ai — All rights reserved.
        </p>
        <div style={{ display: 'flex', gap: '24px' }}>
          {[
            { n: 'Privacy', path: '/privacy' },
            { n: 'Terms', path: '/terms' },
            { n: 'Cookies', path: '/cookies' }
          ].map(item => (
            <Link key={item.n} href={item.path} style={{ fontSize: '0.78rem', color: 'var(--text-muted)', transition: 'color 0.3s' }}
              onMouseEnter={e => e.target.style.color = 'var(--gold)'}
              onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}>
              {item.n}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
