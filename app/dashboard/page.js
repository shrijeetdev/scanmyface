'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { createClient } from '@/utils/supabase/client';

const DEMO_HISTORY = [
  { id: '1', date: '2026-03-21', score: 72, issues: ['Acne & Breakouts', 'Excess Oil', 'Enlarged Pores'], label: 'Fair' },
  { id: '2', date: '2026-03-14', score: 65, issues: ['Acne & Breakouts', 'Dark Spots', 'Excess Oil'], label: 'Fair' },
  { id: '3', date: '2026-03-07', score: 58, issues: ['Acne & Breakouts', 'Dark Spots', 'Redness'], label: 'Needs Attention' },
];

const SCORE_COLOR_RAW = (s) => s >= 80 ? '#2E7D32' : s >= 60 ? '#E65100' : '#C62828';
const SCORE_LABEL = (s) => s >= 80 ? 'Great' : s >= 60 ? 'Good' : s >= 40 ? 'Fair' : 'Needs Attention';

function MiniScoreRing({ score, size = 56 }) {
  const stroke = 5;
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const color = SCORE_COLOR_RAW(score);
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border-color)" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ - (score / 100) * circ}
          style={{ filter: `drop-shadow(0 0 4px ${color}88)` }} />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.9rem',
        fontWeight: 700, color,
      }}>{score}</div>
    </div>
  );
}

function TrendChart({ history }) {
  const max = 100, min = 0;
  const width = 280, height = 80;
  const pad = 20;
  const w = width - pad * 2;
  const h = height - pad;

  if (history.length < 2) return null;

  const pts = [...history].reverse().map((s, i) => {
    const x = pad + (i / (history.length - 1)) * w;
    const y = pad + h - ((s.score - min) / (max - min)) * h;
    return { x, y, score: s.score, date: s.date };
  });

  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const fillPath = `${path} L ${pts[pts.length - 1].x} ${height} L ${pts[0].x} ${height} Z`;
  const diff = pts[pts.length - 1].score - pts[0].score;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Score Trend</span>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: diff > 0 ? 'var(--score-good)' : 'var(--score-fair)' }}>
          {diff > 0 ? '↑' : '↓'} {Math.abs(diff)} pts
        </span>
      </div>
      <svg width={width} height={height} style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#B08D3E" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#B08D3E" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={fillPath} fill="url(#chartGrad)" />
        <path d={path} fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={4} fill="var(--gold)" stroke="var(--bg-primary)" strokeWidth="2" />
        ))}
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
        {[...history].reverse().map(h => (
          <span key={h.id} style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>
            {new Date(h.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [profile, setProfile] = useState(null);
  const [lastReport, setLastReport] = useState(null);
  const [history, setHistory] = useState(DEMO_HISTORY);
  const [streak, setStreak] = useState(3);

  useEffect(() => {
    const prof = sessionStorage.getItem('userProfile');
    const rep = sessionStorage.getItem('scanReport');
    if (prof) setProfile(JSON.parse(prof));
    if (rep) {
      const r = JSON.parse(rep);
      setLastReport(r);
      setHistory(prev => {
        // Prevent duplicate insertion in React Strict Mode
        if (prev.some(h => h.isLatest)) return prev;
        
        return [{
          id: 'latest-' + Date.now(), 
          isLatest: true,
          date: new Date().toISOString().split('T')[0],
          score: r.score, 
          issues: r.detectedIssues.slice(0, 3).map(i => i.name), 
          label: r.scoreLabel,
        }, ...prev.slice(0, 2)];
      });
    }
    
    // Fetch real scan history from Supabase (if user is logged in)
    const fetchHistory = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        const { data, error } = await supabase
          .from('scans')
          .select('id, score, score_label, issues_json, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);
        
        if (error || !data?.length) return;
        
        // Format into the shape the dashboard expects
        const dbHistory = data.map(s => ({
          id: s.id,
          date: s.created_at.split('T')[0],
          score: s.score,
          issues: (s.issues_json || []).slice(0, 3).map(i => i.name || i),
          label: s.score_label,
        }));
        
        setHistory(dbHistory);
        setStreak(Math.min(data.length, 10));
      } catch {
        // No database available yet, keep demo history
      }
    };
    fetchHistory();
  }, []);

  const displayName = profile?.name || 'Skin Lover';
  const displaySkin = profile?.skinType || 'Not set';
  const latestScore = history[0]?.score;

  return (
    <main style={{ minHeight: '100vh', paddingTop: '70px' }}>
      <Header />

      <div style={{ padding: '40px 24px 80px' }}>
        <div className="container" style={{ maxWidth: '900px' }}>

          {/* Profile header */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
            flexWrap: 'wrap', gap: '20px', marginBottom: '40px',
            paddingBottom: '32px', borderBottom: '1px solid var(--border-color)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '64px', height: '64px', borderRadius: '50%',
                background: 'var(--gold-glow)', border: '2px solid var(--gold-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.8rem', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, color: 'var(--gold)',
              }}>
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--gold)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '4px' }}>Welcome back</div>
                <h1 className="font-serif" style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', marginBottom: '4px' }}>{displayName}</h1>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Skin type: <span style={{ color: 'var(--text-secondary)', fontWeight: 500, textTransform: 'capitalize' }}>{displaySkin}</span>
                  </span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--gold)' }}>🔥 {streak} week streak</span>
                </div>
              </div>
            </div>
            <Link href="/scan" className="btn btn-gold">✦ New Scan</Link>
          </div>

          {/* Stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
            {[
              { label: 'Skin Score', value: latestScore ? `${latestScore}/100` : '—', sub: latestScore ? SCORE_LABEL(latestScore) : 'No scan yet', icon: '📊', color: latestScore ? SCORE_COLOR_RAW(latestScore) : 'var(--text-muted)' },
              { label: 'Total Scans', value: history.length, sub: 'All time', icon: '📸', color: 'var(--gold)' },
              { label: 'Improvement', value: history.length >= 2 ? `+${history[0].score - history[history.length - 1].score} pts` : '—', sub: 'vs first scan', icon: '📈', color: 'var(--score-good)' },
              { label: 'Streak', value: `${streak} wks`, sub: 'Consistent scans', icon: '🔥', color: '#FF7043' },
            ].map(c => (
              <div key={c.label} className="glass-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{c.label}</div>
                  <span style={{ fontSize: '1.2rem' }}>{c.icon}</span>
                </div>
                <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.8rem', color: c.color, fontWeight: 700, lineHeight: 1, margin: '10px 0 4px' }}>{c.value}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.sub}</div>
              </div>
            ))}
          </div>

          {/* Main content grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
            {/* Scan History */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 className="font-serif" style={{ fontSize: '1.1rem' }}>Scan History</h2>
                <span className="badge badge-gold">{history.length} scans</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {history.map((scan, i) => (
                  <div key={scan.id} style={{
                    display: 'flex', alignItems: 'center', gap: '14px',
                    background: i === 0 ? 'var(--gold-bg)' : 'var(--glass-bg)',
                    border: `1px solid ${i === 0 ? 'var(--gold-border)' : 'var(--border-subtle)'}`,
                    borderRadius: '10px', padding: '12px 14px',
                  }}>
                    <MiniScoreRing score={scan.score} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: 500 }}>
                          {new Date(scan.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        {i === 0 && <span className="badge badge-gold" style={{ fontSize: '0.62rem' }}>Latest</span>}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {scan.issues.slice(0, 2).join(' · ')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/scan" className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', marginTop: '16px' }}>+ New Scan</Link>
            </div>

            {/* Right column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Trend chart */}
              <div className="glass-card" style={{ padding: '24px' }}>
                <h2 className="font-serif" style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Progress Tracker</h2>
                <TrendChart history={history} />
                {history.length >= 2 && (
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '12px', fontStyle: 'italic' }}>
                    Your skin score improved by <span style={{ color: 'var(--score-good)' }}>{history[0].score - history[history.length - 1].score} points</span> in {history.length} scans.
                  </p>
                )}
              </div>

              {/* Weekly reminder */}
              <div style={{
                background: 'linear-gradient(135deg, var(--gold-bg), var(--glass-bg))',
                border: '1px solid var(--gold-border)', borderRadius: '16px', padding: '24px',
              }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '10px' }}>🔔</div>
                <h3 className="font-serif" style={{ fontSize: '1rem', marginBottom: '8px' }}>Weekly Scan Reminder</h3>
                <p style={{ fontSize: '0.85rem', marginBottom: '16px' }}>Scan every 7 days to track real improvement.</p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => (
                    <div key={d} style={{
                      flex: 1, textAlign: 'center', padding: '6px 0',
                      background: i === 5 ? 'var(--gold-glow)' : 'var(--glass-bg)',
                      border: `1px solid ${i === 5 ? 'var(--gold-border)' : 'var(--border-subtle)'}`,
                      borderRadius: '6px', fontSize: '0.6rem',
                      color: i === 5 ? 'var(--gold)' : 'var(--text-dim)',
                      fontWeight: i === 5 ? 700 : 400,
                    }}>{d}</div>
                  ))}
                </div>
              </div>

              {/* Quick tips */}
              <div className="glass-card" style={{ padding: '24px' }}>
                <h3 className="font-serif" style={{ fontSize: '1rem', marginBottom: '14px' }}>Today's Reminders</h3>
                {[
                  { icon: '☀️', text: 'Apply SPF before going out', done: true },
                  { icon: '💧', text: 'Drink 8 glasses of water', done: false },
                  { icon: '🌙', text: 'Night routine: Retinoid tonight', done: false },
                  { icon: '📸', text: 'Weekly scan due in 2 days', done: false },
                ].map((tip, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '8px 0',
                    borderBottom: i < 3 ? '1px solid var(--border-subtle)' : 'none',
                  }}>
                    <span style={{ fontSize: '1rem' }}>{tip.icon}</span>
                    <span style={{
                      fontSize: '0.83rem', flex: 1,
                      color: tip.done ? 'var(--text-muted)' : 'var(--text-primary)',
                      textDecoration: tip.done ? 'line-through' : 'none',
                    }}>{tip.text}</span>
                    {tip.done && <span style={{ color: 'var(--score-good)', fontSize: '0.8rem' }}>✓</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div style={{ marginTop: '40px', padding: '16px 20px', background: 'var(--glass-bg)', border: '1px solid var(--border-color)', borderRadius: '10px', textAlign: 'center' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>
              ⚠️ scanmyface.ai is a cosmetic analysis tool and does not constitute medical advice. Consult a qualified dermatologist for medical concerns.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
