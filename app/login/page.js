'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Logo from '@/components/ui/Logo';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleEmail = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);
    
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err) {
      setErrorMsg(err.message);
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', paddingTop: '70px' }}>
      <Header />

      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '48px 24px',
        background: 'radial-gradient(ellipse at 50% 0%, var(--gold-bg) 0%, transparent 60%)',
      }}>
        <div style={{
          width: '100%', maxWidth: '420px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '24px',
          padding: '40px 32px',
          boxShadow: 'var(--shadow-card)',
        }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
              <Logo size={56} />
            </div>
            <h1 className="font-serif" style={{ fontSize: '1.6rem', marginBottom: '6px' }}>Welcome Back</h1>
            <p style={{ fontSize: '0.88rem' }}>Sign in to access your skin profile</p>
          </div>

          {/* Google Sign-In */}
          <button
            className="btn btn-ghost"
            style={{ width: '100%', justifyContent: 'center', marginBottom: '16px', gap: '10px' }}
            onClick={() => { window.location.href = '/dashboard'; }}>
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Continue with Google
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>OR</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
          </div>

          {errorMsg && (
            <div style={{ padding: '12px', background: '#FFEBEE', color: '#C62828', borderRadius: '8px', fontSize: '0.8rem', textAlign: 'center', marginBottom: '16px', border: '1px solid #FFCDD2' }}>
              {errorMsg}
            </div>
          )}

          {/* Email form */}
          <form onSubmit={handleEmail} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="input-group">
              <label className="input-label">Email</label>
              <input type="email" required className="input" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="input-group">
              <label className="input-label">Password</label>
              <input type="password" required className="input" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <div style={{ textAlign: 'right', marginTop: '-6px' }}>
              <a href="#" style={{ fontSize: '0.78rem', color: 'var(--gold)' }}>Forgot password?</a>
            </div>
            <button type="submit" className="btn btn-gold" style={{ width: '100%', justifyContent: 'center', marginTop: '6px' }} disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In ✦'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Don't have an account?{' '}
            <Link href="/signup" style={{ color: 'var(--gold)' }}>Create one free →</Link>
          </div>

          <div style={{ textAlign: 'center', marginTop: '12px' }}>
            <Link href="/scan" style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
              Continue as guest →
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
