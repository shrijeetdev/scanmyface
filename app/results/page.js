'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { ScrollReveal } from '@/hooks/useScrollReveal';
import { useAuth } from '@/hooks/useAuth';
import RoutineAnalyzer from '@/components/scan/RoutineAnalyzer';
import HabitEngine from '@/components/habit/HabitEngine';
import { exportReportToPDF } from '@/lib/pdfExport';

/* ═══════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════ */
const SCORE_LABEL = (s) => s >= 80 ? 'Great' : s >= 60 ? 'Good' : s >= 40 ? 'Fair' : 'Needs Attention';

function AnimatedScore({ score }) {
  const [displayed, setDisplayed] = useState(0);
  const [ringAnim, setRingAnim] = useState(0);
  const size = 200, stroke = 10;
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;

  useEffect(() => {
    let start = null;
    const duration = 1800;
    const step = (ts) => {
      if (!start) start = ts;
      const prog = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - prog, 3);
      setDisplayed(Math.round(ease * score));
      setRingAnim(ease * (score / 100));
      if (prog < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [score]);

  const offset = circ - ringAnim * circ;
  const rawColor = score >= 80 ? '#2E7D32' : score >= 60 ? '#E65100' : '#C62828';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border-color)" strokeWidth={stroke} />
          <circle
            cx={size / 2} cy={size / 2} r={r} fill="none"
            stroke={rawColor} strokeWidth={stroke}
            strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
            style={{ filter: `drop-shadow(0 0 8px ${rawColor}88)`, transition: 'stroke-dashoffset 0.3s' }}
          />
        </svg>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '3.5rem',
            fontWeight: 700, color: rawColor, lineHeight: 1,
          }}>{displayed}</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>/ 100</span>
        </div>
      </div>
      <div style={{
        background: `${rawColor}22`, border: `1px solid ${rawColor}44`,
        borderRadius: '999px', padding: '4px 16px',
        fontSize: '0.78rem', fontWeight: 600, color: rawColor,
        letterSpacing: '0.1em', textTransform: 'uppercase',
      }}>{SCORE_LABEL(score)}</div>
    </div>
  );
}

function FaceMap({ issues }) {
  const hotspots = {
    acne:       [{ cx: 45, cy: 58 }, { cx: 55, cy: 62 }, { cx: 50, cy: 72 }],
    dark_spots: [{ cx: 38, cy: 52 }, { cx: 62, cy: 50 }],
    under_eye:  [{ cx: 40, cy: 47 }, { cx: 60, cy: 47 }],
    wrinkles:   [{ cx: 50, cy: 30 }, { cx: 50, cy: 25 }],
    oiliness:   [{ cx: 50, cy: 40 }, { cx: 50, cy: 58 }, { cx: 50, cy: 72 }],
    dryness:    [{ cx: 35, cy: 55 }, { cx: 65, cy: 55 }],
    redness:    [{ cx: 38, cy: 54 }, { cx: 62, cy: 54 }],
    pores:      [{ cx: 50, cy: 60 }, { cx: 44, cy: 55 }, { cx: 56, cy: 55 }],
  };

  return (
    <div style={{ position: 'relative', width: '200px', height: '260px', margin: '0 auto' }}>
      <svg viewBox="0 0 100 130" width="200" height="260">
        <ellipse cx="50" cy="60" rx="34" ry="45" fill="none" stroke="var(--gold-border)" strokeWidth="0.8" />
        <ellipse cx="38" cy="48" rx="7" ry="3.5" fill="none" stroke="var(--border-color)" strokeWidth="0.5" />
        <ellipse cx="62" cy="48" rx="7" ry="3.5" fill="none" stroke="var(--border-color)" strokeWidth="0.5" />
        <path d="M47 55 Q50 65 53 55" fill="none" stroke="var(--border-subtle)" strokeWidth="0.5" />
        <path d="M42 75 Q50 80 58 75" fill="none" stroke="var(--border-subtle)" strokeWidth="0.5" />
        <path d="M28 35 Q50 22 72 35" fill="none" stroke="var(--gold-border)" strokeWidth="0.5" />
        <path d="M32 90 Q50 105 68 90" fill="none" stroke="var(--gold-border)" strokeWidth="0.5" />
        {issues.map(issue => {
          const pts = hotspots[issue.id] || [];
          const color = issue.color || '#C9A84C';
          return pts.map((pt, i) => (
            <g key={`${issue.id}-${i}`}>
              <circle cx={pt.cx} cy={pt.cy} r="3.5" fill={color} opacity="0.3" />
              <circle cx={pt.cx} cy={pt.cy} r="2" fill={color} opacity="0.7" />
              <circle cx={pt.cx} cy={pt.cy} r="5" fill="none" stroke={color} opacity="0.3" strokeWidth="0.5">
                <animate attributeName="r" values="5;8;5" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite" />
              </circle>
            </g>
          ));
        })}
      </svg>
    </div>
  );
}

/* Section divider */
function SectionDivider() {
  return (
    <div style={{
      height: '1px',
      background: 'linear-gradient(90deg, transparent, var(--border-color), transparent)',
      margin: '48px 0',
    }} />
  );
}

/* Section header */
function SectionHeader({ number, title, subtitle, icon }) {
  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px',
      }}>
        <span style={{
          fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em',
          color: 'var(--gold)', background: 'var(--gold-bg)',
          border: '1px solid var(--gold-border)',
          borderRadius: '999px', padding: '3px 10px',
        }}>
          {icon} SECTION {number}
        </span>
      </div>
      <h2 className="font-serif" style={{ fontSize: 'clamp(1.3rem, 3vw, 1.6rem)', marginBottom: '4px' }}>
        {title}
      </h2>
      {subtitle && (
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>{subtitle}</p>
      )}
    </div>
  );
}

/* Auth Gate Blur Overlay */
function AuthGateOverlay() {
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 50,
      background: 'linear-gradient(180deg, transparent 0%, var(--bg-primary) 30%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', padding: '40px 24px',
      backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--gold-border)',
        borderRadius: '20px', padding: '40px 32px',
        maxWidth: '420px', width: '100%', textAlign: 'center',
        boxShadow: 'var(--shadow-gold)',
      }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>🔒</div>
        <h3 className="font-serif" style={{ fontSize: '1.4rem', marginBottom: '8px' }}>
          Unlock Your Full Report
        </h3>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.6 }}>
          Sign up free to see your complete analysis — issues, root causes, routine, and personalized product picks.
        </p>
        <Link href="/signup" className="btn btn-gold" style={{ width: '100%', justifyContent: 'center', marginBottom: '10px' }}>
          Create Free Account ✦
        </Link>
        <Link href="/login" className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }}>
          Already have an account? Log in
        </Link>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN RESULTS PAGE — Continuous Scroll
   ═══════════════════════════════════════════════ */
export default function ResultsPage() {
  const router = useRouter();
  const [report, setReport] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    const r = sessionStorage.getItem('scanReport');
    const img = sessionStorage.getItem('scanImageUrl');
    if (!r) { router.push('/scan'); return; }
    setReport(JSON.parse(r));
    setImageUrl(img);
  }, []);

  if (!report) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: 'var(--gold)', fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.5rem' }}>
        Loading Report…
      </div>
    </div>
  );

  // For guest users, show only the first 2 sections and gate the rest
  const showGated = !isLoggedIn;

  const handleDownloadPDF = async () => {
    setIsExporting(true);
    await exportReportToPDF('scan-report-area', 'ScanMyFace_AI_Report.pdf');
    setIsExporting(false);
  };

  return (
    <main style={{ minHeight: '100vh', paddingTop: '70px' }}>
      <Header />

      <div id="scan-report-area" style={{ background: 'var(--bg-primary)' }}>
      {/* ═══════ SECTION 1: Face Score ═══════ */}
      <section style={{
        padding: '60px 24px 48px', textAlign: 'center',
        background: 'linear-gradient(180deg, var(--gold-bg) 0%, transparent 100%)',
        borderBottom: '1px solid var(--border-color)',
      }}>
        <div className="container-sm">
          <ScrollReveal>
            <div className="section-label" style={{ marginBottom: '8px' }}>Your Skin Report</div>
            <h1 className="font-serif" style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', marginBottom: '8px' }}>
              Analysis Complete ✦
            </h1>

            {/* Trust badges & Download Action */}
            <div style={{
              display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginBottom: '32px',
              flexWrap: 'wrap',
            }}>
              <span style={{
                fontSize: '0.72rem', color: 'var(--text-muted)', background: 'var(--glass-bg)',
                border: '1px solid var(--border-color)', borderRadius: '999px',
                padding: '4px 14px', display: 'flex', alignItems: 'center', gap: '4px',
              }}>
                🎯 AI Confidence: <strong style={{ color: 'var(--gold)' }}>{report.aiConfidence || 89}%</strong>
              </span>
              <span style={{
                fontSize: '0.72rem', color: 'var(--text-muted)', background: 'var(--glass-bg)',
                border: '1px solid var(--border-color)', borderRadius: '999px',
                padding: '4px 14px', display: 'flex', alignItems: 'center', gap: '4px',
              }}>
                📊 Based on <strong style={{ color: 'var(--gold)' }}>{report.totalDataPoints || 12}</strong> data points
              </span>

              {/* Download PDF Button */}
              {isLoggedIn && (
                <button 
                  id="export-pdf-btn"
                  onClick={handleDownloadPDF}
                  disabled={isExporting}
                  className="btn btn-ghost"
                  style={{ padding: '4px 16px', fontSize: '0.75rem', borderRadius: '999px', height: 'auto' }}
                >
                  {isExporting ? 'Generating PDF...' : '📄 Download Report'}
                </button>
              )}
            </div>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '32px', alignItems: 'center', justifyItems: 'center',
            }}>
              <AnimatedScore score={report.score} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
                {[
                  { label: 'Skin Type',    value: report.skinType },
                  { label: 'Issues Found', value: `${report.issueCount} detected` },
                  { label: 'Score',        value: `${report.score}/100 — ${report.scoreLabel}` },
                ].map(s => (
                  <div key={s.label}>
                    <div style={{ fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px' }}>{s.label}</div>
                    <div style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: '0.95rem' }}>{s.value}</div>
                  </div>
                ))}
                <div style={{
                  background: 'var(--gold-bg)', border: '1px solid var(--gold-border)',
                  borderRadius: '10px', padding: '12px 14px', marginTop: '4px',
                }}>
                  <p style={{ fontSize: '0.82rem', color: 'var(--gold)', lineHeight: 1.5, fontStyle: 'italic' }}>
                    "{report.scoreDesc}"
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {imageUrl && (
            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <img src={imageUrl} alt="Scanned face" style={{
                width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover',
                border: '2px solid var(--gold-border)',
              }} />
            </div>
          )}
        </div>
      </section>

      {/* ═══════ SECTION 2: Visual Map ═══════ */}
      <section style={{ padding: '48px 24px' }}>
        <div className="container-sm">
          <ScrollReveal>
            <SectionHeader number="2" title="Issue Map" subtitle="Detected problem zones on your face" icon="🗺" />
            <div style={{
              background: 'var(--bg-card)', border: '1px solid var(--border-color)',
              borderRadius: '20px', padding: '32px 24px', textAlign: 'center',
            }}>
              <FaceMap issues={report.detectedIssues} />
              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap', marginTop: '20px' }}>
                {report.detectedIssues.map(issue => (
                  <div key={issue.id} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: issue.color }} />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{issue.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══════ AUTH GATED SECTIONS (3–8) ═══════ */}
      <div style={{ position: 'relative' }}>
        {showGated && <AuthGateOverlay />}

        <div style={{ filter: showGated ? 'blur(6px)' : 'none', pointerEvents: showGated ? 'none' : 'auto' }}>

          {/* ═══════ SECTION 3: Detected Issues ═══════ */}
          <section style={{ padding: '0 24px 48px' }}>
            <div className="container-sm">
              <SectionDivider />
              <ScrollReveal>
                <SectionHeader number="3" title="Detected Issues" subtitle="Problems identified with severity and confidence" icon="🔍" />
              </ScrollReveal>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {report.detectedIssues.length === 0 && (
                  <p style={{ color: 'var(--score-good)' }}>No significant issues detected. Your skin looks great!</p>
                )}
                {report.detectedIssues.map((issue, idx) => (
                  <ScrollReveal key={issue.id} delay={idx * 80}>
                    <div className="glass-card" style={{ padding: '20px 24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: issue.color, flexShrink: 0, boxShadow: `0 0 8px ${issue.color}88` }} />
                          <h3 className="font-serif" style={{ fontSize: '1rem' }}>{issue.name}</h3>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <span className={`badge badge-${issue.severity}`}>{issue.severity}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{issue.confidence}% confident</span>
                        </div>
                      </div>
                      <p style={{ fontSize: '0.87rem', marginBottom: '10px' }}>{issue.description}</p>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>{issue.severityLabels?.[issue.severity]}</p>
                      <div style={{ marginTop: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Affected area</span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{issue.affectedPercent}%</span>
                        </div>
                        <div style={{ height: '3px', background: 'var(--border-color)', borderRadius: '999px', overflow: 'hidden' }}>
                          <div style={{ width: `${issue.affectedPercent}%`, height: '100%', background: issue.color, borderRadius: '999px', boxShadow: `0 0 6px ${issue.color}66` }} />
                        </div>
                      </div>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </section>

          {/* ═══════ SECTION 4: Root Causes ═══════ */}
          {report.rootCauses && report.rootCauses.length > 0 && (
            <section style={{ padding: '0 24px 48px' }}>
              <div className="container-sm">
                <SectionDivider />
                <ScrollReveal>
                  <SectionHeader number="4" title="Root Cause Analysis" subtitle="What's impacting your skin from the inside" icon="🧠" />
                </ScrollReveal>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
                  {report.rootCauses.map((cause, idx) => {
                    const barColor = cause.score >= 70 ? 'var(--score-good)' : cause.score >= 45 ? '#E65100' : 'var(--score-poor)';
                    return (
                      <ScrollReveal key={cause.id} delay={idx * 100}>
                        <div className="glass-card" style={{ padding: '20px 24px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '1.3rem' }}>{cause.icon}</span>
                              <h4 className="font-serif" style={{ fontSize: '0.95rem' }}>{cause.label}</h4>
                            </div>
                            <span style={{
                              fontSize: '0.72rem', fontWeight: 700,
                              color: barColor,
                              background: `${barColor}18`,
                              border: `1px solid ${barColor}44`,
                              borderRadius: '999px', padding: '2px 10px',
                            }}>{cause.score}/100</span>
                          </div>
                          {/* Score bar */}
                          <div style={{ height: '4px', background: 'var(--border-color)', borderRadius: '999px', overflow: 'hidden', marginBottom: '12px' }}>
                            <div style={{
                              width: `${cause.score}%`, height: '100%',
                              background: barColor, borderRadius: '999px',
                              transition: 'width 0.8s ease',
                            }} />
                          </div>
                          <p style={{ fontSize: '0.82rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                            {cause.description}
                          </p>
                          {cause.impact === 'high' && (
                            <div style={{
                              marginTop: '10px', background: 'var(--badge-high-bg)',
                              border: '1px solid var(--badge-high-border)',
                              borderRadius: '8px', padding: '8px 12px',
                              fontSize: '0.75rem', color: 'var(--badge-high-txt)', fontWeight: 500,
                            }}>
                              ⚠️ High impact on your skin health
                            </div>
                          )}
                        </div>
                      </ScrollReveal>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {/* ═══════ SECTION 5: Product Mistakes (Placeholder) ═══════ */}
          <section style={{ padding: '0 24px 48px' }}>
            <div className="container-sm">
              <SectionDivider />
              <ScrollReveal>
                <SectionHeader number="5" title="Product Check" subtitle="Upload your current products to check compatibility" icon="🧴" />
                <RoutineAnalyzer detectedIssues={report.issues || []} />
              </ScrollReveal>
            </div>
          </section>

          {/* ═══════ SECTION 6: Recommended Routine (AM/PM) ═══════ */}
          <section style={{ padding: '0 24px 48px' }}>
            <div className="container-sm">
              <SectionDivider />
              <ScrollReveal>
                <SectionHeader number="6" title="Your Daily Routine" subtitle="Personalised AM and PM routines for your skin" icon="📋" />
              </ScrollReveal>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                {/* AM */}
                <ScrollReveal delay={100}>
                  <div>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      marginBottom: '20px', paddingBottom: '12px',
                      borderBottom: '1px solid var(--gold-border)',
                    }}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '50%',
                        background: 'var(--gold-bg)', border: '1px solid var(--gold-border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem',
                      }}>☀️</div>
                      <h3 className="font-serif" style={{ fontSize: '1.1rem' }}>Morning Routine</h3>
                    </div>
                    {report.routine.am.map(step => (
                      <div key={step.step} style={{
                        display: 'flex', gap: '14px', marginBottom: '16px',
                        paddingBottom: '16px', borderBottom: '1px solid var(--border-subtle)',
                      }}>
                        <div style={{
                          width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                          background: 'var(--gold-bg)', border: '1px solid var(--gold-border)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.72rem', color: 'var(--gold)', fontWeight: 700,
                        }}>0{step.step}</div>
                        <div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--gold)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '3px' }}>{step.label}</div>
                          <div style={{ fontSize: '0.88rem', fontWeight: 500, marginBottom: '4px' }}>{step.product}</div>
                          <p style={{ fontSize: '0.78rem', fontStyle: 'italic', color: 'var(--text-secondary)' }}>{step.tip}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollReveal>

                {/* PM */}
                <ScrollReveal delay={200}>
                  <div>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      marginBottom: '20px', paddingBottom: '12px',
                      borderBottom: '1px solid rgba(100,100,200,0.3)',
                    }}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '50%',
                        background: 'rgba(100,100,200,0.1)', border: '1px solid rgba(100,100,200,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem',
                      }}>🌙</div>
                      <h3 className="font-serif" style={{ fontSize: '1.1rem' }}>Night Routine</h3>
                    </div>
                    {report.routine.pm.map(step => (
                      <div key={step.step} style={{
                        display: 'flex', gap: '14px', marginBottom: '16px',
                        paddingBottom: '16px', borderBottom: '1px solid var(--border-subtle)',
                      }}>
                        <div style={{
                          width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                          background: 'rgba(100,100,200,0.1)', border: '1px solid rgba(100,100,200,0.2)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.72rem', color: '#8888FF', fontWeight: 700,
                        }}>0{step.step}</div>
                        <div>
                          <div style={{ fontSize: '0.7rem', color: '#8888FF', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '3px' }}>{step.label}</div>
                          <div style={{ fontSize: '0.88rem', fontWeight: 500, marginBottom: '4px' }}>{step.product}</div>
                          <p style={{ fontSize: '0.78rem', fontStyle: 'italic', color: 'var(--text-secondary)' }}>{step.tip}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollReveal>
              </div>

              {/* Habit Engine Module */}
              <ScrollReveal delay={300}>
                <HabitEngine />
              </ScrollReveal>

            </div>
          </section>

          {/* ═══════ SECTION 7: Products + Ingredients ═══════ */}
          <section style={{ padding: '0 24px 48px' }}>
            <div className="container-sm">
              <SectionDivider />
              <ScrollReveal>
                <SectionHeader number="7" title="Products & Ingredients" subtitle="Science-backed actives matched to your issues" icon="🧪" />
              </ScrollReveal>

              {/* Ingredients by issue */}
              {report.detectedIssues.map(issue => {
                const ings = report.ingredients[issue.id] || [];
                if (!ings.length) return null;
                return (
                  <ScrollReveal key={issue.id}>
                    <div style={{ marginBottom: '28px' }}>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        marginBottom: '14px', paddingBottom: '10px',
                        borderBottom: '1px solid var(--border-subtle)',
                      }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: issue.color }} />
                        <h3 className="font-serif" style={{ fontSize: '1rem' }}>{issue.name}</h3>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '12px' }}>
                        {ings.map(ing => (
                          <div key={ing.name} className="glass-card" style={{ padding: '16px 18px' }}>
                            <div style={{ fontSize: '1.2rem', marginBottom: '6px' }}>{ing.icon}</div>
                            <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '2px' }}>{ing.name}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--gold)', marginBottom: '8px' }}>{ing.concentration}</div>
                            <p style={{ fontSize: '0.82rem', lineHeight: 1.6, marginBottom: '8px' }}>{ing.mechanism}</p>
                            <div style={{
                              background: 'var(--gold-bg)', borderRadius: '6px',
                              padding: '8px 10px', fontSize: '0.76rem',
                              color: 'var(--text-secondary)', fontStyle: 'italic',
                            }}>
                              💡 {ing.note}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </ScrollReveal>
                );
              })}

              {/* Product picks */}
              <ScrollReveal>
                <h3 className="font-serif" style={{ fontSize: '1.2rem', marginBottom: '16px', marginTop: '16px' }}>
                  Recommended Products
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                  {report.products.map(p => (
                    <div key={p.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--gold)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '4px' }}>{p.brand}</div>
                          <h4 className="font-serif" style={{ fontSize: '0.95rem', lineHeight: 1.3 }}>{p.name}</h4>
                        </div>
                        <span className="badge badge-gold" style={{ flexShrink: 0, marginLeft: '8px' }}>{p.tier}</span>
                      </div>
                      <p style={{ fontSize: '0.83rem', lineHeight: 1.55 }}>{p.whyRecommended}</p>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        background: 'var(--glass-bg)', borderRadius: '8px', padding: '8px 10px',
                      }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Key Active:</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--gold)', fontWeight: 500 }}>{p.keyIngredient}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                        <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.1rem', color: 'var(--gold)', fontWeight: 700 }}>
                          ₹{p.price.toLocaleString('en-IN')}
                        </span>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <a href={p.amazonUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm" style={{ padding: '6px 12px', fontSize: '0.72rem' }}>Amazon →</a>
                          <a href={p.nykaaUrl} target="_blank" rel="noopener noreferrer" className="btn btn-gold btn-sm" style={{ padding: '6px 12px', fontSize: '0.72rem' }}>Nykaa →</a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollReveal>
            </div>
          </section>

          {/* ═══════ SECTION 8: Improvement Plan ═══════ */}
          {report.improvementPlan && (
            <section style={{ padding: '0 24px 48px' }}>
              <div className="container-sm">
                <SectionDivider />
                <ScrollReveal>
                  <SectionHeader number="8" title="Your Improvement Plan" subtitle="What to expect with a consistent routine" icon="📈" />
                </ScrollReveal>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                  <ScrollReveal delay={100}>
                    <div className="glass-card" style={{ padding: '24px', borderLeft: '3px solid var(--gold)' }}>
                      <div style={{
                        fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em',
                        color: 'var(--gold)', marginBottom: '14px', textTransform: 'uppercase',
                      }}>
                        🗓 In 4 Weeks
                      </div>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {report.improvementPlan.weekFour.map((item, i) => (
                          <li key={i} style={{
                            fontSize: '0.85rem', color: 'var(--text-secondary)',
                            padding: '6px 0', borderBottom: '1px solid var(--border-subtle)',
                            display: 'flex', alignItems: 'flex-start', gap: '8px',
                          }}>
                            <span style={{ color: 'var(--score-good)', flexShrink: 0 }}>→</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </ScrollReveal>

                  <ScrollReveal delay={200}>
                    <div className="glass-card" style={{ padding: '24px', borderLeft: '3px solid var(--score-good)' }}>
                      <div style={{
                        fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em',
                        color: 'var(--score-good)', marginBottom: '14px', textTransform: 'uppercase',
                      }}>
                        🗓 In 8 Weeks
                      </div>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {report.improvementPlan.weekEight.map((item, i) => (
                          <li key={i} style={{
                            fontSize: '0.85rem', color: 'var(--text-secondary)',
                            padding: '6px 0', borderBottom: '1px solid var(--border-subtle)',
                            display: 'flex', alignItems: 'flex-start', gap: '8px',
                          }}>
                            <span style={{ color: 'var(--score-good)', flexShrink: 0 }}>✓</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </ScrollReveal>
                </div>
              </div>
            </section>
          )}

          {/* ═══════ Medical Disclaimer ═══════ */}
          <section style={{ padding: '0 24px 48px' }}>
            <div className="container-sm">
              <SectionDivider />
              <div style={{
                background: 'var(--glass-bg)', border: '1px solid var(--border-color)',
                borderRadius: '10px', padding: '16px 20px',
              }}>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic', lineHeight: 1.6 }}>
                  ⚠️ <strong style={{ color: 'var(--text-secondary)' }}>Medical Disclaimer:</strong> This report
                  is generated by AI for informational purposes only. It is not a medical diagnosis. Results are based
                  on image analysis and self-reported lifestyle data. Consult a board-certified dermatologist for
                  persistent or severe skin conditions.
                </p>
              </div>
            </div>
          </section>

        </div>
      </div>
      </div>

      {/* ═══════ Sticky CTA ═══════ */}
      <div style={{
        position: 'sticky', bottom: 0, left: 0, right: 0,
        background: 'var(--header-bg)', backdropFilter: 'blur(20px)',
        borderTop: '1px solid var(--border-color)', padding: '16px 24px',
        display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap',
        zIndex: 100,
      }}>
        {!isLoggedIn && (
          <Link href="/signup" className="btn btn-gold">✦ Save & Track Progress</Link>
        )}
        <Link href="/scan" className="btn btn-ghost">Scan Again →</Link>
      </div>

      <Footer />
    </main>
  );
}
