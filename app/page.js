'use client';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const SKIN_ISSUES_GRID = [
  { name: 'Acne', emoji: '🔴', desc: 'Breakouts, whiteheads, pustules' },
  { name: 'Dark Spots', emoji: '🟤', desc: 'Pigmentation, sun damage' },
  { name: 'Under-Eye', emoji: '🟣', desc: 'Dark circles, puffiness' },
  { name: 'Wrinkles', emoji: '⚪', desc: 'Fine lines, aging signs' },
  { name: 'Oiliness', emoji: '💛', desc: 'Excess sebum, shine' },
  { name: 'Dryness', emoji: '🔵', desc: 'Flaky, tight, dehydrated' },
  { name: 'Redness', emoji: '🟠', desc: 'Inflammation, sensitivity' },
  { name: 'Pores', emoji: '⚫', desc: 'Enlarged, clogged pores' },
];

export default function HomePage() {
  return (
    <main>
      <Header />

      {/* ══════ HERO ══════ */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '120px 24px 80px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Ambient glow */}
        <div style={{
          position: 'absolute',
          top: '-20%', left: '50%', transform: 'translateX(-50%)',
          width: '800px', height: '600px',
          background: 'radial-gradient(ellipse, var(--gold-glow) 0%, transparent 70%)',
          pointerEvents: 'none', zIndex: 0,
        }} />

        <div className="container-sm" style={{ position: 'relative', zIndex: 1 }}>
          <div className="anim-fadeInUp">
            <div className="badge badge-gold" style={{ marginBottom: '24px', display: 'inline-flex' }}>
              ✦ AI-Powered Skincare Analysis
            </div>
          </div>

          <h1 className="anim-fadeInUp delay-1" style={{ marginBottom: '24px', lineHeight: 1.1 }}>
            Scan My Face &<br />
            <span style={{ color: 'var(--gold)' }}>Unlock AI Skincare</span>
          </h1>

          <p className="anim-fadeInUp delay-2" style={{
            fontSize: 'clamp(1rem, 2vw, 1.2rem)',
            maxWidth: '540px', margin: '0 auto 40px',
          }}>
            Upload a selfie and receive an instant skin health score, personalized ingredient guide, and curated product recommendations — all free.
          </p>

          <div className="anim-fadeInUp delay-3" style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <Link href="/scan" className="btn btn-primary btn-lg">
              Scan My Face Free ✦
            </Link>
            <Link href="#how-it-works" className="btn btn-outline btn-lg">
              How it Works ↓
            </Link>
          </div>

          <div className="anim-fadeInUp delay-4" style={{ marginTop: '32px', display: 'flex', justifyContent: 'center', gap: '32px' }}>
            {[
              { val: '50K+', label: 'Scans done' },
              { val: '4.9★', label: 'User rating' },
              { val: '<5s', label: 'Analysis time' },
            ].map(s => (
              <div key={s.label}>
                <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.4rem', fontWeight: 600, color: 'var(--gold)' }}>{s.val}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ HOW IT WORKS ══════ */}
      <section id="how-it-works" className="section" style={{ borderTop: '1px solid var(--border-color)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div className="section-label" style={{ marginBottom: '12px' }}>How it Works</div>
          <h2 style={{ marginBottom: '12px' }}>How it Works</h2>
          <p style={{ marginBottom: '48px', fontSize: '1.05rem' }}>Three steps. Seconds. A lifetime of better skin.</p>

          <div className="grid-3">
            {[
              { step: '01', icon: '📸', title: 'Upload Your Photo', desc: 'Take a selfie or upload a photo. No makeup. Good lighting. Front-facing. That\'s it.' },
              { step: '02', icon: '🔬', title: 'AI Analyzes Your Skin', desc: 'Our engine scans for 8 skin issues — acne, pigmentation, pores, wrinkles, and more.' },
              { step: '03', icon: '✨', title: 'Get Your Skin Report', desc: 'Receive your skin score, issue map, ingredient guide, product picks, and daily routine.' },
            ].map(s => (
              <div key={s.step} className="glass-card" style={{ textAlign: 'left', position: 'relative', overflow: 'hidden' }}>
                <div style={{
                  position: 'absolute', top: '-10px', right: '10px',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: '5rem', fontWeight: 700, color: 'var(--gold-bg)',
                  lineHeight: 1, opacity: 0.6,
                }}>{s.step}</div>
                <div style={{ fontSize: '2rem', marginBottom: '16px', position: 'relative', zIndex: 1 }}>{s.icon}</div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '8px', color: 'var(--gold)', position: 'relative', zIndex: 1 }}>{s.title}</h3>
                <p style={{ fontSize: '0.92rem', position: 'relative', zIndex: 1 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ FEATURES ══════ */}
      <section id="features" className="section" style={{
        background: 'linear-gradient(180deg, var(--gold-bg) 0%, transparent 60%)',
        borderTop: '1px solid var(--border-color)',
      }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div className="section-label" style={{ marginBottom: '12px' }}>Features</div>
          <h2 style={{ marginBottom: '12px' }}>Everything Your Skin Needs</h2>
          <p style={{ marginBottom: '48px', fontSize: '1.05rem' }}>A complete skin intelligence system.</p>

          <div className="grid-4">
            {[
              { icon: '📊', title: 'Skin Score 0-100', desc: 'Your overall skin health, quantified.' },
              { icon: '🗺', title: 'Face Issue Map', desc: 'Visual overlay showing problem zones.' },
              { icon: '🔬', title: '8-Point Detection', desc: 'Acne, spots, pores, wrinkles, and more.' },
              { icon: '🧪', title: 'Ingredient Guide', desc: 'Science-backed actives for your skin.' },
              { icon: '🛍', title: 'Product Picks', desc: 'Curated Indian brands with affiliate links.' },
              { icon: '📋', title: 'AM/PM Routines', desc: 'Personalized daily skincare protocol.' },
              { icon: '📈', title: 'Progress Tracker', desc: 'Weekly scans show real improvement.' },
              { icon: '🔒', title: 'Privacy First', desc: 'No image storage without your consent.' },
            ].map(f => (
              <div key={f.title} className="glass-card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '14px' }}>{f.icon}</div>
                <h4 style={{ fontSize: '0.95rem', marginBottom: '6px' }}>{f.title}</h4>
                <p style={{ fontSize: '0.85rem' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ SKIN ISSUES DETECTED ══════ */}
      <section className="section" style={{ borderTop: '1px solid var(--border-color)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div className="section-label" style={{ marginBottom: '12px' }}>Detection</div>
          <h2 style={{ marginBottom: '12px' }}>8 Skin Issues We Detect</h2>
          <p style={{ marginBottom: '48px', fontSize: '1.05rem' }}>Precision analysis across your entire face.</p>
          <div className="grid-4">
            {SKIN_ISSUES_GRID.map(issue => (
              <div key={issue.name} className="glass-card" style={{ textAlign: 'center', padding: '24px' }}>
                <div style={{ fontSize: '2.2rem', marginBottom: '10px' }}>{issue.emoji}</div>
                <h4 style={{ fontSize: '0.95rem', marginBottom: '4px' }}>{issue.name}</h4>
                <p style={{ fontSize: '0.8rem' }}>{issue.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ TESTIMONIALS ══════ */}
      <section className="section" style={{ borderTop: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div className="section-label" style={{ marginBottom: '12px' }}>Reviews</div>
          <h2 style={{ marginBottom: '48px' }}>What Users Say</h2>
          <div className="grid-3">
            {[
              { name: 'Priya M.', role: 'Mumbai', text: 'The ingredient recommendations were spot on. My acne cleared up in 2 weeks!', score: '85/100' },
              { name: 'Rahul K.', role: 'Delhi', text: 'Finally a skincare app that doesn\'t just push products. The science behind it is real.', score: '72/100' },
              { name: 'Ananya S.', role: 'Bangalore', text: 'The weekly scanning helped me track my skin\'s progress. Love the routines!', score: '91/100' },
            ].map(t => (
              <div key={t.name} className="glass-card">
                <div style={{ fontSize: '1.1rem', marginBottom: '16px', lineHeight: 1.7, fontStyle: 'italic' }}>"{t.text}"</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>{t.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{t.role}</div>
                  </div>
                  <div style={{
                    background: 'var(--gold-bg)', border: '1px solid var(--gold-border)',
                    borderRadius: '999px', padding: '4px 12px',
                    fontSize: '0.78rem', fontWeight: 600, color: 'var(--gold)',
                  }}>Score: {t.score}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ PRICING ══════ */}
      <section id="pricing" className="section" style={{ borderTop: '1px solid var(--border-color)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div className="section-label" style={{ marginBottom: '12px' }}>Pricing</div>
          <h2 style={{ marginBottom: '12px' }}>Simple, Transparent Pricing</h2>
          <p style={{ marginBottom: '48px', fontSize: '1.05rem' }}>Start free. Upgrade when you're ready.</p>
          <div className="grid-2" style={{ maxWidth: '700px', margin: '0 auto' }}>
            {/* Free */}
            <div className="glass-card" style={{ textAlign: 'left' }}>
              <div className="badge badge-free" style={{ marginBottom: '16px' }}>Free Forever</div>
              <h3 className="font-serif" style={{ fontSize: '2rem', marginBottom: '8px' }}>₹0</h3>
              <p style={{ marginBottom: '24px', fontSize: '0.92rem' }}>Perfect for getting started</p>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                {['Basic skin scan', 'Skin score & issue map', 'Top 3 ingredient picks', '1 product recommendation'].map(f => (
                  <li key={f} style={{ fontSize: '0.88rem', display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ color: 'var(--score-good)' }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link href="/scan" className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }}>Start Free</Link>
            </div>
            {/* Premium */}
            {/* Premium */}
            <div className="glass-card" style={{
              textAlign: 'left',
              background: 'linear-gradient(180deg, var(--gold-bg) 0%, var(--bg-card) 100%)',
              border: '2px solid var(--gold)',
              boxShadow: '0 12px 40px rgba(124, 92, 255, 0.15)',
              position: 'relative',
              transform: 'scale(1.05)',
              zIndex: 1,
            }}>
              <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', background: 'var(--gold)', color: '#fff', padding: '6px 24px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', boxShadow: '0 4px 16px rgba(124, 92, 255, 0.5)' }}>
                Most Popular
              </div>
              <div className="badge badge-gold" style={{ marginBottom: '16px', marginTop: '12px' }}>Premium ✦</div>
              <h3 className="font-serif" style={{ fontSize: '2.5rem', marginBottom: '8px', color: 'var(--text-primary)' }}>
                ₹99<span style={{ fontSize: '1.2rem', color: 'var(--text-muted)', fontFamily: 'Inter', fontWeight: 400 }}>/mo</span>
              </h3>
              <p style={{ marginBottom: '24px', fontSize: '0.95rem', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>Full skincare intelligence & unlimited access</p>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '32px' }}>
                {['Unlimited Face Scans', 'Detailed Downloadable PDF Reports', 'Product Compatibility Check Engine', 'Smart Progress Tracking', 'Interactive AM/PM Habit Engine'].map(f => (
                  <li key={f} style={{ fontSize: '0.95rem', display: 'flex', gap: '10px', alignItems: 'flex-start', color: 'var(--text-primary)', fontWeight: 500 }}>
                    <span style={{ color: 'var(--gold)', fontSize: '1.2rem', lineHeight: 1 }}>✦</span> {f}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="btn btn-primary" style={{ width: '100%', padding: '16px', fontSize: '1.05rem', justifyContent: 'center' }}>Upgrade to Premium</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══════ SEO ESSAY / FAQ ══════ */}
      <section className="section" style={{ borderTop: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <div className="section-label" style={{ marginBottom: '12px', textAlign: 'center' }}>AI Dermatology</div>
          <h2 style={{ marginBottom: '32px', textAlign: 'center' }}>Why Scan My Face with AI?</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', color: 'var(--gold)' }}>The Most Advanced Free Face Scanner AI</h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                If you've ever stood in front of a mirror and wondered, "How can I actually map my skin issues without a dermatologist?", you are not alone. Our platform allows you to <strong>scan my face</strong> instantly using clinical-grade AI algorithms. Instead of guessing your skin type or buying the wrong products, our <strong>face scanner AI</strong> identifies 8 key metrics — from acne severity to invisible dehydration zones.
              </p>
            </div>

            <div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', color: 'var(--gold)' }}>How Does the AI Skin Analysis Work?</h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                When you <strong>scan your face with AI</strong>, the system analyzes millions of pixels to detect micro-variations in texture, pigmentation, and pores. Unlike generic web quizzes, this is a true visual diagnostic. You get a personalized skin health score and a comprehensive breakdown. It's like having an <strong>AI dermatologist</strong> in your pocket, providing a <strong>free skin test online</strong> whenever you need it.
              </p>
            </div>

            <div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', color: 'var(--gold)' }}>Build the Perfect Skincare Routine</h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                Knowing your issues is only half the battle. After you <strong>analyze skin health</strong> through our portal, our engine cross-references your results against a vast database of proven dermatological ingredients. We build your AM and PM routines and even check if your current products are a safe match. Don't leave your face to chance — let the AI guide you to clear, glowing skin.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════ FINAL CTA ══════ */}
      <section style={{
        padding: '80px 24px',
        textAlign: 'center',
        borderTop: '1px solid var(--border-color)',
        background: 'linear-gradient(180deg, transparent, var(--gold-bg))',
      }}>
        <div className="container-sm">
          <h2 style={{ marginBottom: '16px' }}>
            Ready to Understand<br />
            <span className="text-gold">Your Skin?</span>
          </h2>
          <p style={{ marginBottom: '32px', fontSize: '1.05rem' }}>
            Join thousands of users who\'ve already discovered their skin\'s potential.
          </p>
          <Link href="/scan" className="btn btn-primary btn-lg">
            Scan My Face Free ✦
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
