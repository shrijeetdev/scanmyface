'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Logo from '@/components/ui/Logo';
import { useAuth } from '@/hooks/useAuth';

const SKIN_TYPES = [
  { id: 'oily',        label: 'Oily',        emoji: '💛', desc: 'Shiny skin, enlarged pores, prone to breakouts' },
  { id: 'dry',         label: 'Dry',          emoji: '🔵', desc: 'Tight, flaky, sometimes rough or dull' },
  { id: 'combination', label: 'Combination',  emoji: '⚖️', desc: 'Oily T-zone (nose, forehead), dry cheeks' },
  { id: 'normal',      label: 'Normal',       emoji: '✅', desc: 'Balanced, minimal issues, radiant complexion' },
  { id: 'sensitive',   label: 'Sensitive',    emoji: '🌸', desc: 'Reacts easily to products, redness, prone to irritation' },
];

const CONCERNS = [
  { id: 'acne', label: 'Acne / Breakouts', emoji: '🔴' },
  { id: 'dark_spots', label: 'Dark Spots', emoji: '🟤' },
  { id: 'dullness', label: 'Dullness', emoji: '⚫' },
  { id: 'wrinkles', label: 'Anti-Aging', emoji: '⚪' },
  { id: 'redness', label: 'Redness', emoji: '🟠' },
  { id: 'under_eye', label: 'Dark Circles', emoji: '🟣' },
];

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const [form, setForm] = useState({
    name: '', email: '', password: '',
    age: '', gender: '',
    skinType: '', concerns: [],
  });

  const update = (k, v) => setForm(prev => ({ ...prev, [k]: v }));
  const toggleConcern = (id) => {
    setForm(prev => ({
      ...prev,
      concerns: prev.concerns.includes(id) ? prev.concerns.filter(c => c !== id) : [...prev.concerns, id],
    }));
  };

  const handleNext = () => { if (step < 3) setStep(step + 1); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);
    
    try {
      await signup(form.email, form.password, {
        data: {
          name: form.name,
          age: parseInt(form.age, 10),
          gender: form.gender,
          skinType: form.skinType,
          concerns: form.concerns,
        }
      });
      router.push('/scan');
    } catch (err) {
      setErrorMsg(err.message);
      setLoading(false);
    }
  };

  const progress = (step / 3) * 100;

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', paddingTop: '70px' }}>
      <Header />

      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '48px 24px',
        background: 'radial-gradient(ellipse at 50% 0%, var(--gold-bg) 0%, transparent 60%)',
      }}>
        <div style={{ width: '100%', maxWidth: '520px' }}>
          {/* Progress bar */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              {['Account', 'Skin Profile', 'Concerns'].map((l, i) => (
                <div key={l} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{
                    width: '22px', height: '22px', borderRadius: '50%',
                    background: i + 1 <= step ? 'linear-gradient(135deg, var(--gold), var(--gold-dark))' : 'var(--glass-bg)',
                    border: `1px solid ${i + 1 <= step ? 'var(--gold)' : 'var(--border-color)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.65rem', fontWeight: 700,
                    color: i + 1 <= step ? '#fff' : 'var(--text-muted)',
                    transition: 'all 0.4s',
                  }}>{i + 1}</div>
                  <span style={{ fontSize: '0.75rem', color: i + 1 <= step ? 'var(--gold)' : 'var(--text-dim)' }}>{l}</span>
                </div>
              ))}
            </div>
            <div style={{ height: '3px', background: 'var(--border-color)', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${progress}%`,
                background: 'linear-gradient(90deg, var(--gold), var(--gold-light))',
                borderRadius: '999px', transition: 'width 0.5s ease',
              }} />
            </div>
          </div>

          {/* Card */}
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border-color)',
            borderRadius: '24px', padding: '40px 32px', boxShadow: 'var(--shadow-card)',
          }}>
            {/* STEP 1 */}
            {step === 1 && (
              <div>
                <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                    <Logo size={56} />
                  </div>
                  <h1 className="font-serif" style={{ fontSize: '1.6rem', marginBottom: '6px' }}>Create Your Account</h1>
                  <p style={{ fontSize: '0.88rem' }}>Free forever. No card required.</p>
                </div>

                <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', marginBottom: '20px', gap: '10px' }}
                  onClick={() => { sessionStorage.setItem('userProfile', JSON.stringify(form)); router.push('/scan'); }}>
                  <svg width="18" height="18" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  </svg>
                  Sign up with Google
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '16px 0' }}>
                  <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>OR</span>
                  <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div className="input-group">
                    <label className="input-label">Full Name</label>
                    <input type="text" className="input" placeholder="Your name" value={form.name} onChange={e => update('name', e.target.value)} />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Email</label>
                    <input type="email" className="input" placeholder="you@example.com" value={form.email} onChange={e => update('email', e.target.value)} />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Password</label>
                    <input type="password" className="input" placeholder="Min 8 characters" value={form.password} onChange={e => update('password', e.target.value)} />
                  </div>
                </div>

                <button className="btn btn-gold" style={{ width: '100%', justifyContent: 'center', marginTop: '24px' }} onClick={handleNext}>Continue →</button>
                <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Already have an account? <Link href="/login" style={{ color: 'var(--gold)' }}>Sign in</Link>
                </p>
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div>
                <div style={{ marginBottom: '24px' }}>
                  <h2 className="font-serif" style={{ fontSize: '1.4rem', marginBottom: '6px' }}>Your Skin Profile</h2>
                  <p style={{ fontSize: '0.88rem' }}>This helps us personalize your analysis.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                  <div className="input-group">
                    <label className="input-label">Age</label>
                    <input type="number" min="13" max="80" className="input" placeholder="e.g. 26" value={form.age} onChange={e => update('age', e.target.value)} />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Gender</label>
                    <select className="input" value={form.gender} onChange={e => update('gender', e.target.value)}>
                      <option value="">Select</option>
                      <option value="female">Female</option>
                      <option value="male">Male</option>
                      <option value="non-binary">Non-binary</option>
                      <option value="prefer-not">Prefer not to say</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <div className="input-label" style={{ marginBottom: '12px' }}>Skin Type</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {SKIN_TYPES.map(s => (
                      <button key={s.id} onClick={() => update('skinType', s.id)} style={{
                        background: form.skinType === s.id ? 'var(--gold-bg)' : 'var(--glass-bg)',
                        border: `1px solid ${form.skinType === s.id ? 'var(--gold-border)' : 'var(--border-color)'}`,
                        borderRadius: '10px', padding: '12px 16px',
                        display: 'flex', alignItems: 'center', gap: '12px',
                        cursor: 'pointer', textAlign: 'left', transition: 'all 0.25s',
                      }}>
                        <span style={{ fontSize: '1.1rem' }}>{s.emoji}</span>
                        <div>
                          <div style={{ color: form.skinType === s.id ? 'var(--gold)' : 'var(--text-primary)', fontWeight: 500, fontSize: '0.88rem' }}>{s.label}</div>
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{s.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setStep(1)}>← Back</button>
                  <button className="btn btn-gold" style={{ flex: 2, justifyContent: 'center' }} onClick={handleNext}>Continue →</button>
                </div>
              </div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '24px' }}>
                  <h2 className="font-serif" style={{ fontSize: '1.4rem', marginBottom: '6px' }}>Top Skin Concerns</h2>
                  <p style={{ fontSize: '0.88rem' }}>Select all that apply. (You can skip)</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '24px' }}>
                  {CONCERNS.map(c => {
                    const active = form.concerns.includes(c.id);
                    return (
                      <button key={c.id} type="button" onClick={() => toggleConcern(c.id)} style={{
                        background: active ? 'var(--gold-bg)' : 'var(--glass-bg)',
                        border: `1px solid ${active ? 'var(--gold-border)' : 'var(--border-color)'}`,
                        borderRadius: '10px', padding: '12px',
                        display: 'flex', alignItems: 'center', gap: '8px',
                        cursor: 'pointer', transition: 'all 0.25s',
                      }}>
                        <span style={{ fontSize: '1.1rem' }}>{c.emoji}</span>
                        <span style={{ color: active ? 'var(--gold)' : 'var(--text-primary)', fontSize: '0.82rem', fontWeight: 500 }}>{c.label}</span>
                      </button>
                    );
                  })}
                </div>

                <div style={{
                  background: 'var(--gold-bg)', border: '1px solid var(--gold-border)',
                  borderRadius: '10px', padding: '14px 16px', marginBottom: '24px',
                }}>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    🔒 Your data is private and encrypted. No image storage without your consent.
                  </p>
                </div>

                {errorMsg && (
                  <div style={{ padding: '12px', background: '#FFEBEE', color: '#C62828', borderRadius: '8px', fontSize: '0.8rem', textAlign: 'center', marginBottom: '16px', border: '1px solid #FFCDD2' }}>
                    {errorMsg}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="button" className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setStep(2)}>← Back</button>
                  <button type="submit" className="btn btn-gold" style={{ flex: 2, justifyContent: 'center' }} disabled={loading}>
                    {loading ? 'Creating account…' : '✦ Start My First Scan'}
                  </button>
                </div>
              </form>
            )}
          </div>

          <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '20px' }}>
            By signing up you agree to our <Link href="/terms" style={{ color: 'var(--text-muted)' }}>Terms</Link> &amp; <Link href="/privacy" style={{ color: 'var(--text-muted)' }}>Privacy Policy</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
