'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { createClient } from '@/utils/supabase/client';

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
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ - (score / 100) * circ} style={{ filter: `drop-shadow(0 0 4px ${color}88)` }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.9rem', fontWeight: 700, color }}>{score}</div>
    </div>
  );
}

function TrendChart({ history }) {
  const max = 100, min = 0;
  const width = 280, height = 80, pad = 20;
  const w = width - pad * 2, h = height - pad;

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
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: diff >= 0 ? 'var(--score-good)' : 'var(--score-fair)' }}>
          {diff > 0 ? '↑' : diff < 0 ? '↓' : ''} {Math.abs(diff)} pts
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
        {[...history].reverse().map((h, i) => (i === 0 || i === history.length - 1) && (
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
  const [editProfile, setEditProfile] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [history, setHistory] = useState([]);
  const [streak, setStreak] = useState(0);

  // Product Matcher
  const [productInput, setProductInput] = useState('');
  const [productResult, setProductResult] = useState('');

  // Editable Habit Engine
  const [habits, setHabits] = useState({
    am: { active: true, time: '08:00' },
    pm: { active: true, time: '21:00' },
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (data) {
          setProfile(data);
          setEditProfile(data);
        }

        const { data: scans } = await supabase.from('scans').select('id, score, score_label, issues_json, created_at').eq('user_id', user.id).order('created_at', { ascending: false });
        if (scans && scans.length > 0) {
          const dbHistory = scans.map(s => ({
            id: s.id, date: s.created_at.split('T')[0], score: s.score,
            issues: (s.issues_json || []).slice(0, 3).map(i => i.name || i),
            label: s.score_label,
          }));
          setHistory(dbHistory);
          setStreak(scans.length);
        }
      } catch (e) { console.error(e); }
    };
    fetchUserProfile();
  }, []);

  const handleSaveProfile = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const payload = { ...editProfile, id: user.id, updated_at: new Date().toISOString() };
      await supabase.from('profiles').upsert(payload);
      setProfile(payload);
      setIsEditing(false);
    } catch (e) {}
  };

  const checkProduct = () => {
    if (!productInput) return;
    const baseSkin = (profile?.skin_type || 'normal').toLowerCase();
    const inputClean = productInput.toLowerCase();
    const isBad = (baseSkin === 'oily' && inputClean.match(/oil|heavy|comedogenic/)) || (baseSkin === 'dry' && inputClean.match(/alcohol|acid|stripping/));
    setProductResult(isBad ? 'Not Recommended for your skin type.' : 'Great Match! Safe for your routine.');
  };

  const handleDownloadReport = () => {
    window.print();
  };

  const displayName = profile?.full_name || profile?.name || 'Skin Lover';
  const displaySkin = profile?.skin_type || 'Not set';
  const latestScore = history[0]?.score;

  return (
    <main style={{ minHeight: '100vh', paddingTop: '70px' }}>
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          header, footer, .hide-on-print { display: none !important; }
          body { background: #fff !important; color: #000 !important; }
          .glass-card { border: 1px solid #ddd !important; box-shadow: none !important; background: #fff !important; break-inside: avoid; }
          h1, h2, h3, p, span, div { color: #000 !important; }
          button { display: none !important; }
        }
      `}} />
      <Header />

      <div style={{ padding: '40px 24px 80px' }}>
        <div id="dashboard-content" className="container" style={{ maxWidth: '900px' }}>

          {/* Profile header & PDF Download */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', marginBottom: '40px', paddingBottom: '32px', borderBottom: '1px solid var(--border-color)' }}>
            {isEditing ? (
              <div style={{ flex: 1, background: 'var(--glass-bg)', padding: '24px', borderRadius: '16px', border: '1px solid var(--gold-border)' }}>
                <h3 className="font-serif" style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Edit Profile</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                  <div><label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Name</label><input type="text" value={editProfile.full_name || ''} onChange={e => setEditProfile({...editProfile, full_name: e.target.value})} className="input" style={{ width: '100%' }} /></div>
                  <div><label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Skin Type</label><select value={editProfile.skin_type || ''} onChange={e => setEditProfile({...editProfile, skin_type: e.target.value})} className="input" style={{ width: '100%' }}><option value="">Select...</option><option value="oily">Oily 💧</option><option value="dry">Dry 🏜</option><option value="combination">Combination ⚖️</option><option value="normal">Normal ✅</option></select></div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button className="btn btn-gold" onClick={handleSaveProfile}>Save Changes</button>
                  <button className="btn btn-ghost" onClick={() => setIsEditing(false)}>Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--gold-glow)', border: '2px solid var(--gold-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', color: 'var(--gold)', fontWeight: 700 }}>
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--gold)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Welcome back</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '4px 0' }}>
                      <h1 className="font-serif" style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)' }}>{displayName}</h1>
                      <button onClick={() => setIsEditing(true)} style={{ background: 'none', border: 'none', fontSize: '0.81rem', color: 'var(--text-muted)', cursor: 'pointer', textDecoration: 'underline' }}>Edit</button>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Skin type: <span style={{ color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{displaySkin}</span></span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--gold)' }}>🔥 {streak} wks streak</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <Link href="/scan" className="btn btn-ghost hide-on-print">✦ New Scan</Link>
                  <button onClick={handleDownloadReport} disabled={history.length === 0} className="btn hide-on-print" style={{ background: 'var(--text-primary)', color: 'var(--bg-primary)', fontWeight: 700 }}>
                    📥 Download PDF Report
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Section 5 moved to top: Product Matcher */}
          <div style={{ background: 'linear-gradient(135deg, rgba(88,86,118,0.2) 0%, rgba(155,130,255,0.15) 100%)', padding: '32px', borderRadius: '16px', border: '1px solid rgba(155,130,255,0.4)', marginBottom: '32px', boxShadow: '0 8px 32px rgba(155,130,255,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span style={{ fontSize: '1.4rem' }}>✨</span>
              <h2 className="font-serif" style={{ fontSize: '1.4rem', color: '#fff' }}>Product Compatibility Check</h2>
            </div>
            <p style={{ fontSize: '0.9rem', color: '#D4C6FF', marginBottom: '20px' }}>Enter the name or key ingredient of any product to see if it's safe for your <strong>{displaySkin}</strong> skin type.</p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <input value={productInput} onChange={e => setProductInput(e.target.value)} type="text" placeholder="e.g. Salicylic Acid Cleanser" style={{ flex: 1, minWidth: '240px', padding: '12px 16px', borderRadius: '8px', border: 'none', background: '#fff', color: '#000', fontSize: '0.95rem' }} />
              <button onClick={checkProduct} className="btn" style={{ background: '#9B82FF', color: '#fff', border: 'none', padding: '12px 24px' }}>Check Match</button>
            </div>
            {productResult && (
              <div style={{ marginTop: '20px', padding: '16px', background: productResult.includes('Great') ? 'rgba(76, 175, 80, 0.15)' : 'rgba(244, 67, 54, 0.15)', borderLeft: `4px solid ${productResult.includes('Great') ? '#4CAF50' : '#F44336'}`, borderRadius: '8px', color: '#fff', fontSize: '0.95rem', fontWeight: 500 }}>
                {productResult}
              </div>
            )}
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}><div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{c.label}</div><span style={{ fontSize: '1.2rem' }}>{c.icon}</span></div>
                <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.8rem', color: c.color, fontWeight: 700, lineHeight: 1, margin: '10px 0 4px' }}>{c.value}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.sub}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
            {/* Scan History */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 className="font-serif" style={{ fontSize: '1.1rem' }}>Scan History</h2>
                <span className="badge badge-gold">{history.length} scans</span>
              </div>
              
              {history.length === 0 ? (
                <div style={{ padding: '32px 16px', textAlign: 'center', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '12px' }}>📸</div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '16px' }}>No scans available yet. Let's start tracking your skin health!</p>
                  <Link href="/scan" className="btn btn-gold btn-sm">Take First Scan</Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {history.map((scan, i) => (
                    <div key={scan.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', background: i === 0 ? 'var(--gold-bg)' : 'var(--glass-bg)', border: `1px solid ${i === 0 ? 'var(--gold-border)' : 'var(--border-subtle)'}`, borderRadius: '10px', padding: '12px 14px' }}>
                      <MiniScoreRing score={scan.score} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                          <span style={{ fontSize: '0.82rem', fontWeight: 500 }}>{new Date(scan.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          {i === 0 && <span className="badge badge-gold" style={{ fontSize: '0.62rem' }}>Latest</span>}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{scan.issues.slice(0, 2).join(' · ')}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Trend chart */}
              <div className="glass-card" style={{ padding: '24px' }}>
                <h2 className="font-serif" style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Progress Tracker</h2>
                {history.length >= 2 ? (
                  <>
                    <TrendChart history={history} />
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '12px', fontStyle: 'italic' }}>Your skin score improved by <span style={{ color: 'var(--score-good)' }}>{history[0].score - history[history.length - 1].score} points</span> in {history.length} scans.</p>
                  </>
                ) : (
                   <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Complete at least 2 scans to see your progress chart.</p>
                )}
              </div>

              {/* Habit Engine */}
              <div className="glass-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 className="font-serif" style={{ fontSize: '1.1rem' }}>Habit Tracker</h3>
                  <span style={{ fontSize: '0.7rem', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Daily</span>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {/* AM Routine */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                       <input type="checkbox" checked={habits.am.active} onChange={e => setHabits({ ...habits, am: { ...habits.am, active: e.target.checked } })} style={{ transform: 'scale(1.2)', accentColor: '#9B82FF' }} />
                       <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>☀️ Morning Routine</span>
                    </div>
                    <input type="time" value={habits.am.time} onChange={e => setHabits({ ...habits, am: { ...habits.am, time: e.target.value } })} style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '4px 8px', fontSize: '0.8rem' }} />
                  </div>
                  
                  {/* PM Routine */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                       <input type="checkbox" checked={habits.pm.active} onChange={e => setHabits({ ...habits, pm: { ...habits.pm, active: e.target.checked } })} style={{ transform: 'scale(1.2)', accentColor: '#9B82FF' }} />
                       <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>🌙 Night Routine</span>
                    </div>
                    <input type="time" value={habits.pm.time} onChange={e => setHabits({ ...habits, pm: { ...habits.pm, time: e.target.value } })} style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '4px 8px', fontSize: '0.8rem' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
