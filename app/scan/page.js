'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { analyzeImage } from '@/lib/aiEngine';
import { validateFaceImage } from '@/lib/faceValidator';
import Logo from '@/components/ui/Logo';
import FaceScan360 from '@/components/scan/FaceScan360';
import { createClient } from '@/utils/supabase/client';

/* ═══════════════════════════════════════════════
   QUESTION DATA — MCQ chips, zero typing
   ═══════════════════════════════════════════════ */
const CORE_QUESTIONS = [
  {
    id: 'ageGroup', label: 'What\'s your age group?', icon: '🎂',
    options: [
      { value: '13-18', label: '13–18' },
      { value: '18-25', label: '18–25' },
      { value: '25-35', label: '25–35' },
      { value: '35+',   label: '35+' },
    ],
  },
  {
    id: 'gender', label: 'Gender', icon: '👤',
    options: [
      { value: 'female', label: 'Female' },
      { value: 'male',   label: 'Male' },
      { value: 'other',  label: 'Prefer not to say' },
    ],
  },
  {
    id: 'skinType', label: 'What\'s your skin type?', icon: '✨',
    options: [
      { value: 'oily',        label: 'Oily 💧' },
      { value: 'dry',         label: 'Dry 🏜' },
      { value: 'combination', label: 'Combination ⚖️' },
      { value: 'normal',      label: 'Normal ✅' },
    ],
  },
  {
    id: 'sleep', label: 'How much do you sleep?', icon: '😴',
    options: [
      { value: '<5h',  label: '<5h' },
      { value: '5-6h', label: '5–6h' },
      { value: '6-8h', label: '6–8h' },
      { value: '8h+',  label: '8h+' },
    ],
  },
  {
    id: 'water', label: 'Daily water intake?', icon: '💧',
    options: [
      { value: '<1L',  label: '<1L' },
      { value: '1-2L', label: '1–2L' },
      { value: '2-3L', label: '2–3L' },
      { value: '3L+',  label: '3L+' },
    ],
  },
  {
    id: 'diet', label: 'Describe your diet', icon: '🍽',
    options: [
      { value: 'high_sugar',    label: 'High Sugar 🍩' },
      { value: 'balanced',      label: 'Balanced 🥗' },
      { value: 'high_protein',  label: 'High Protein 🍗' },
      { value: 'junk_heavy',    label: 'Junk Heavy 🍔' },
    ],
  },
];

const OPTIONAL_QUESTIONS = [
  {
    id: 'stress', label: 'Stress level?', icon: '🧠',
    options: [
      { value: 'low',    label: 'Low 😌' },
      { value: 'medium', label: 'Medium 😐' },
      { value: 'high',   label: 'High 😰' },
    ],
  },
  {
    id: 'sunExposure', label: 'Sun exposure?', icon: '☀️',
    options: [
      { value: 'low',    label: 'Low' },
      { value: 'medium', label: 'Medium' },
      { value: 'high',   label: 'High' },
    ],
  },
  {
    id: 'smoking', label: 'Smoking / Alcohol?', icon: '🚬',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no',  label: 'No' },
    ],
  },
  {
    id: 'workout', label: 'Workout frequency?', icon: '🏋️',
    options: [
      { value: 'never',     label: 'Never' },
      { value: '1-2x',      label: '1–2x/week' },
      { value: '3-5x',      label: '3–5x/week' },
      { value: 'daily',     label: 'Daily' },
    ],
  },
];

const SCAN_STAGES = [
  { label: 'Detecting face structure…',     icon: '👁', pct: 12 },
  { label: 'Mapping skin zones…',           icon: '🗺', pct: 28 },
  { label: 'Analyzing lifestyle impact…',  icon: '🧠', pct: 45 },
  { label: 'Analyzing issues & severity…', icon: '🔬', pct: 62 },
  { label: 'Generating recommendations…',  icon: '🧪', pct: 80 },
  { label: 'Building your skin report…',   icon: '✨', pct: 96 },
];

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════ */
export default function ScanPage() {
  const router = useRouter();
  const fileInputRef = useRef(null);

  // Steps: 1 = core questions, 2 = optional questions, 3 = photo upload, 4 = scanning
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({});
  const [showOptional, setShowOptional] = useState(false);

  // Image state
  const [image, setImage] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState('');

  // Scan mode: 'basic' or '360'
  const [scanMode, setScanMode] = useState(null);
  const [show360Camera, setShow360Camera] = useState(false);

  // Scan state
  const [scanning, setScanning] = useState(false);
  const [stageIndex, setStageIndex] = useState(0);

  // Auto-skip onboarding if profile exists
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (!error && profile && profile.skin_type) {
          const loadedAnswers = {
            ageGroup: profile.age_group,
            gender: profile.gender,
            skinType: profile.skin_type,
            sleep: profile.sleep,
            water: profile.water_intake,
            diet: profile.diet,
          };
          // Remove empty values
          Object.keys(loadedAnswers).forEach(k => !loadedAnswers[k] && delete loadedAnswers[k]);
          setAnswers(loadedAnswers);
          
          // Skip entirely if main questions exist
          if (profile.skin_type && profile.age_group) {
            setStep(3); // Jump to Choose Scan Mode
          }
        }
      } catch (err) {
        console.error('Failed to fetch profile', err);
      }
    };
    fetchProfile();
  }, []);

  /* ─── Question helpers ─── */
  const selectAnswer = (qId, value) => {
    setAnswers(prev => ({ ...prev, [qId]: value }));
  };

  const coreComplete = CORE_QUESTIONS.every(q => answers[q.id]);

  const handleCoreNext = () => {
    if (!coreComplete) return;
    setStep(2); // go to optional / skip screen
  };

  const handleOptionalNext = () => {
    setStep(3); // go to photo upload
  };

  const handleSkipOptional = () => {
    setStep(3);
  };

  /* ─── Image helpers ─── */
  const handleFile = useCallback(async (file) => {
    if (!file || !file.type.startsWith('image/')) {
      setError('Please upload a valid image file (JPG, PNG, WEBP).');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setError('Image must be under 20MB.');
      return;
    }
    setError('');
    setValidating(true);
    const validation = await validateFaceImage(file);
    setValidating(false);
    if (!validation.isValid) {
      setError(validation.message);
      setImage(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    setImage({ file, url: URL.createObjectURL(file) });
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  /* ─── Image Compression Utility ─── */
  const compressImage = async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          // Scale down if larger than 800px width
          if (width > 800) {
            height = Math.round((height * 800) / width);
            width = 800;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => {
            resolve(new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", { type: 'image/jpeg' }));
          }, 'image/jpeg', 0.8);
        };
      };
    });
  };

  /* ─── Analyze ─── */
  const saveScanToDb = async (report, imageFile) => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return; // guest — skip saving
      
      let uploadedUrl = null;

      if (imageFile) {
        try {
          const compressedFile = await compressImage(imageFile);
          const fileName = `${user.id}/${Date.now()}.jpg`;
          
          const { data, error } = await supabase.storage
            .from('scan-images')
            .upload(fileName, compressedFile, { upsert: true });
            
          if (!error && data) {
            const { data: publicUrlData } = supabase.storage
              .from('scan-images')
              .getPublicUrl(fileName);
            uploadedUrl = publicUrlData.publicUrl;
          }
        } catch (uploadObjErr) {
          console.error("Storage upload error", uploadObjErr);
        }
      }

      // Save the scan
      await supabase.from('scans').insert({
        user_id: user.id,
        score: report.score,
        score_label: report.scoreLabel,
        issues_json: report.detectedIssues,
        image_url: uploadedUrl,
      });

      // Save/upsert the user profile properties implicitly
      await supabase.from('profiles').upsert({
        id: user.id,
        updated_at: new Date().toISOString(),
        skin_type: answers.skinType,
        age_group: answers.ageGroup,
        gender: answers.gender,
        sleep: answers.sleep,
        water_intake: answers.water,
        diet: answers.diet
      });
    } catch (e) {
      console.error("Error saving scan/profile to DB:", e);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setStep(4);
    setScanning(true);
    setStageIndex(0);

    const stageInterval = setInterval(() => {
      setStageIndex(prev => {
        if (prev >= SCAN_STAGES.length - 1) { clearInterval(stageInterval); return prev; }
        return prev + 1;
      });
    }, 500);

    try {
      const report = await analyzeImage(image.file, answers);
      sessionStorage.setItem('scanReport', JSON.stringify(report));
      sessionStorage.setItem('scanImageUrl', image.url);
      sessionStorage.setItem('lifestyleData', JSON.stringify(answers));
      await saveScanToDb(report, image.file);
      clearInterval(stageInterval);
      setStageIndex(SCAN_STAGES.length - 1);
      setTimeout(() => router.push('/results'), 800);
    } catch (err) {
      clearInterval(stageInterval);
      setScanning(false);
      setStep(3);
      setError('Analysis failed. Please try again.');
      console.error(err);
    }
  };

  /* ─── 360° scan complete handler ─── */
  const handle360Complete = async ({ file, url, captures, is360 }) => {
    setShow360Camera(false);
    setImage({ file, url });
    // Auto-proceed to analysis
    setStep(4);
    setScanning(true);
    setStageIndex(0);

    const stageInterval = setInterval(() => {
      setStageIndex(prev => {
        if (prev >= SCAN_STAGES.length - 1) { clearInterval(stageInterval); return prev; }
        return prev + 1;
      });
    }, 500);

    try {
      const report = await analyzeImage(file, { ...answers, scanMode: '360', anglesCaptured: captures?.length || 3 });
      sessionStorage.setItem('scanReport', JSON.stringify(report));
      sessionStorage.setItem('scanImageUrl', url);
      sessionStorage.setItem('lifestyleData', JSON.stringify(answers));
      await saveScanToDb(report, file);
      clearInterval(stageInterval);
      setStageIndex(SCAN_STAGES.length - 1);
      setTimeout(() => router.push('/results'), 800);
    } catch (err) {
      clearInterval(stageInterval);
      setScanning(false);
      setStep(3);
      setError('Analysis failed. Please try again.');
      console.error(err);
    }
  };

  /* ─── Progress calculation ─── */
  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  /* ═══════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════ */
  return (
    <main style={{ minHeight: '100vh', paddingTop: '70px' }}>
      <Header />

      <section style={{
        minHeight: 'calc(100vh - 70px)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        padding: '32px 24px 80px',
      }}>
        <div style={{ width: '100%', maxWidth: '600px' }}>

          {/* ─── Progress bar ─── */}
          {step <= 3 && (
            <div style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                {['Lifestyle', 'Accuracy', 'Photo'].map((l, i) => (
                  <div key={l} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{
                      width: '24px', height: '24px', borderRadius: '50%',
                      background: i + 1 <= step ? 'linear-gradient(135deg, var(--gold), var(--gold-dark))' : 'var(--glass-bg)',
                      border: `1.5px solid ${i + 1 <= step ? 'var(--gold)' : 'var(--border-color)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.65rem', fontWeight: 700,
                      color: i + 1 <= step ? '#fff' : 'var(--text-muted)',
                      transition: 'all 0.4s',
                    }}>{i + 1}</div>
                    <span style={{
                      fontSize: '0.75rem',
                      color: i + 1 <= step ? 'var(--gold)' : 'var(--text-dim)',
                      fontWeight: i + 1 === step ? 600 : 400,
                    }}>{l}</span>
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
          )}

          {/* ══════════════════════════════════════
             STEP 1: Core Lifestyle Questions
             ══════════════════════════════════════ */}
          {step === 1 && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                  <Logo size={48} />
                </div>
                <h1 className="font-serif" style={{ fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', marginBottom: '8px' }}>
                  Tell Us About You
                </h1>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  Quick taps only — this helps personalize your analysis.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {CORE_QUESTIONS.map(q => (
                  <div key={q.id}>
                    <div style={{
                      fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.08em',
                      textTransform: 'uppercase', color: 'var(--text-secondary)',
                      marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px',
                    }}>
                      <span>{q.icon}</span> {q.label}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {q.options.map(opt => {
                        const selected = answers[q.id] === opt.value;
                        return (
                          <button
                            key={opt.value}
                            onClick={() => selectAnswer(q.id, opt.value)}
                            style={{
                              padding: '10px 18px',
                              borderRadius: '999px',
                              border: `1.5px solid ${selected ? 'var(--gold)' : 'var(--border-color)'}`,
                              background: selected ? 'var(--gold-bg)' : 'var(--glass-bg)',
                              color: selected ? 'var(--gold)' : 'var(--text-primary)',
                              fontSize: '0.85rem',
                              fontWeight: selected ? 600 : 400,
                              cursor: 'pointer',
                              transition: 'all 0.25s ease',
                              boxShadow: selected ? 'var(--shadow-glow)' : 'none',
                            }}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <button
                className="btn btn-gold btn-lg"
                style={{
                  width: '100%', marginTop: '32px',
                  opacity: coreComplete ? 1 : 0.4,
                  cursor: coreComplete ? 'pointer' : 'not-allowed',
                }}
                disabled={!coreComplete}
                onClick={handleCoreNext}
              >
                Continue →
              </button>

              <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '12px' }}>
                6 quick questions · No typing required
              </p>
            </div>
          )}

          {/* ══════════════════════════════════════
             STEP 2: Optional Accuracy Questions
             ══════════════════════════════════════ */}
          {step === 2 && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                <h2 className="font-serif" style={{ fontSize: '1.5rem', marginBottom: '8px' }}>
                  Improve Accuracy
                </h2>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  Optional — answer these for a more precise report.
                </p>
              </div>

              {!showOptional ? (
                <div style={{
                  background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                  borderRadius: '20px', padding: '32px 24px', textAlign: 'center',
                }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>🎯</div>
                  <h3 className="font-serif" style={{ fontSize: '1.1rem', marginBottom: '8px' }}>
                    Want a more accurate scan?
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.6 }}>
                    4 extra questions about stress, sun exposure, and habits.
                    Takes about 15 seconds.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button className="btn btn-gold" style={{ width: '100%', justifyContent: 'center' }}
                      onClick={() => setShowOptional(true)}
                    >
                      ✦ Yes, Improve My Accuracy
                    </button>
                    <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }}
                      onClick={handleSkipOptional}
                    >
                      Skip → Upload Photo
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {OPTIONAL_QUESTIONS.map(q => (
                      <div key={q.id}>
                        <div style={{
                          fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.08em',
                          textTransform: 'uppercase', color: 'var(--text-secondary)',
                          marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px',
                        }}>
                          <span>{q.icon}</span> {q.label}
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {q.options.map(opt => {
                            const selected = answers[q.id] === opt.value;
                            return (
                              <button
                                key={opt.value}
                                onClick={() => selectAnswer(q.id, opt.value)}
                                style={{
                                  padding: '10px 18px',
                                  borderRadius: '999px',
                                  border: `1.5px solid ${selected ? 'var(--gold)' : 'var(--border-color)'}`,
                                  background: selected ? 'var(--gold-bg)' : 'var(--glass-bg)',
                                  color: selected ? 'var(--gold)' : 'var(--text-primary)',
                                  fontSize: '0.85rem',
                                  fontWeight: selected ? 600 : 400,
                                  cursor: 'pointer',
                                  transition: 'all 0.25s ease',
                                  boxShadow: selected ? 'var(--shadow-glow)' : 'none',
                                }}
                              >
                                {opt.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: '12px', marginTop: '28px' }}>
                    <button className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }}
                      onClick={() => setStep(1)}
                    >
                      ← Back
                    </button>
                    <button className="btn btn-gold" style={{ flex: 2, justifyContent: 'center' }}
                      onClick={handleOptionalNext}
                    >
                      Continue → Upload Photo
                    </button>
                  </div>
                </div>
              )}

              {!showOptional && (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => setStep(1)}>
                    ← Back to Questions
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════
             STEP 3: Scan Mode Selection + Photo Upload / 360° Camera
             ══════════════════════════════════════ */}
          {step === 3 && !scanning && (
            <div>
              {/* Mode selector — show if no mode chosen yet */}
              {!scanMode && (
                <div>
                  <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                    <h1 className="font-serif" style={{ fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', marginBottom: '8px' }}>
                      Choose Scan Mode
                    </h1>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      Higher accuracy with our AI-powered 360° scan
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {/* 360° Advanced */}
                    <button
                      onClick={() => { setScanMode('360'); setShow360Camera(true); }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '16px',
                        background: 'var(--bg-card)', border: '2px solid var(--gold-border)',
                        borderRadius: '16px', padding: '20px',
                        cursor: 'pointer', textAlign: 'left',
                        transition: 'all 0.3s', position: 'relative', overflow: 'hidden',
                      }}
                    >
                      <div style={{
                        position: 'absolute', inset: 0,
                        background: 'linear-gradient(135deg, var(--gold-bg), transparent)',
                        pointerEvents: 'none',
                      }} />
                      <div style={{
                        width: '56px', height: '56px', borderRadius: '50%',
                        background: 'var(--gold-bg)', border: '1px solid var(--gold-border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.5rem', flexShrink: 0, position: 'relative',
                      }}>📸</div>
                      <div style={{ position: 'relative' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1rem', fontWeight: 700 }}>
                            360° Advanced Scan
                          </h3>
                          <span style={{
                            fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em',
                            background: 'var(--gold-bg)', border: '1px solid var(--gold-border)',
                            color: 'var(--gold)', borderRadius: '999px', padding: '2px 8px',
                            textTransform: 'uppercase',
                          }}>Recommended</span>
                        </div>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                          FaceID-style guided capture · Front + Left + Right · Highest accuracy
                        </p>
                      </div>
                    </button>

                    {/* Basic Upload */}
                    <button
                      onClick={() => setScanMode('basic')}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '16px',
                        background: 'var(--glass-bg)', border: '1px solid var(--border-color)',
                        borderRadius: '16px', padding: '20px',
                        cursor: 'pointer', textAlign: 'left', transition: 'all 0.3s',
                      }}
                    >
                      <div style={{
                        width: '56px', height: '56px', borderRadius: '50%',
                        background: 'var(--glass-bg)', border: '1px solid var(--border-color)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.5rem', flexShrink: 0,
                      }}>🖼</div>
                      <div>
                        <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1rem', fontWeight: 700, marginBottom: '4px' }}>
                          Basic Upload
                        </h3>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                          Upload 1 photo · Fast · Standard accuracy
                        </p>
                      </div>
                    </button>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => setStep(2)}>
                      ← Back
                    </button>
                  </div>
                </div>
              )}

              {/* 360° Camera Mode */}
              {scanMode === '360' && show360Camera && (
                <FaceScan360
                  onComplete={handle360Complete}
                  onCancel={() => { setScanMode(null); setShow360Camera(false); }}
                />
              )}

              {/* Basic Upload Mode */}
              {scanMode === 'basic' && (
              <div>
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <h1 className="font-serif" style={{ fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', marginBottom: '8px' }}>
                  Upload Your Face Photo
                </h1>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  No makeup. Neutral expression. Good lighting.
                </p>
              </div>

              {/* Upload zone */}
              <div
                onDrop={onDrop}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onClick={() => !image && !validating && fileInputRef.current?.click()}
                style={{
                  border: `2px dashed ${isDragging ? 'var(--gold)' : image ? 'var(--gold-border)' : 'var(--border-color)'}`,
                  borderRadius: '20px',
                  background: isDragging ? 'var(--gold-bg)' : 'var(--bg-card)',
                  minHeight: '300px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
                  cursor: image || validating ? 'default' : 'pointer',
                  transition: 'all 0.3s ease',
                  position: 'relative', overflow: 'hidden',
                }}
              >
                {validating ? (
                  <div style={{ textAlign: 'center', padding: '24px' }}>
                    <div style={{
                      width: '80px', height: '80px', borderRadius: '50%',
                      border: '3px solid var(--border-color)',
                      borderTop: '3px solid var(--gold)',
                      animation: 'rotate 1s linear infinite',
                      margin: '0 auto 20px',
                    }} />
                    <h3 className="font-serif" style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Verifying face…</h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Checking if the image contains a human face</p>
                  </div>
                ) : image ? (
                  <div style={{ position: 'relative', width: '100%', textAlign: 'center', padding: '20px' }}>
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <img src={image.url} alt="Your photo" style={{
                        maxHeight: '260px', maxWidth: '100%', borderRadius: '12px', objectFit: 'cover',
                      }} />
                      <div style={{
                        position: 'absolute', inset: 0,
                        border: '2px solid var(--gold-border)', borderRadius: '50%',
                        margin: '8px 20%', boxShadow: 'var(--shadow-glow)', pointerEvents: 'none',
                      }} />
                    </div>
                    <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--score-good)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        ✓ Face detected
                      </span>
                    </div>
                    <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'center', gap: '12px' }}>
                      <button className="btn btn-ghost btn-sm"
                        onClick={() => { setImage(null); setError(''); if (fileInputRef.current) fileInputRef.current.value = ''; }}>
                        ↩ Use Different Photo
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '24px' }}>
                    <div style={{
                      width: '80px', height: '80px', borderRadius: '50%',
                      background: 'var(--gold-bg)', border: '1px solid var(--gold-border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '2rem', margin: '0 auto 20px',
                    }}>📸</div>
                    <h3 className="font-serif" style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Drop your photo here</h3>
                    <p style={{ fontSize: '0.9rem', marginBottom: '20px' }}>or click to browse files</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>JPG, PNG, WEBP · Max 20MB</p>
                  </div>
                )}

                <input
                  ref={fileInputRef} type="file" accept="image/*" capture="user"
                  style={{ display: 'none' }}
                  onChange={(e) => handleFile(e.target.files[0])}
                />
              </div>

              {/* Camera button */}
              <div style={{ textAlign: 'center', margin: '16px 0' }}>
                <button className="btn btn-ghost" onClick={() => fileInputRef.current?.click()}
                  style={{ width: '100%' }} disabled={validating}>
                  📷 Open Camera
                </button>
              </div>

              {/* Error */}
              {error && (
                <div style={{
                  background: 'var(--badge-high-bg)', border: '1px solid var(--badge-high-border)',
                  borderRadius: '12px', padding: '16px 20px', marginBottom: '16px',
                  display: 'flex', alignItems: 'flex-start', gap: '12px',
                }}>
                  <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>⚠️</span>
                  <div>
                    <div style={{ color: 'var(--badge-high-txt)', fontSize: '0.88rem', fontWeight: 500, marginBottom: '4px' }}>
                      Face Not Detected
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.83rem', lineHeight: 1.5 }}>
                      {error}
                    </div>
                  </div>
                </div>
              )}

              {/* Tips */}
              <div style={{
                background: 'var(--gold-bg)', border: '1px solid var(--gold-border)',
                borderRadius: '12px', padding: '16px 20px', marginBottom: '24px',
              }}>
                <div style={{
                  fontSize: '0.78rem', letterSpacing: '0.1em', textTransform: 'uppercase',
                  color: 'var(--gold)', marginBottom: '10px', fontWeight: 600,
                }}>📋 Tips for Best Results</div>
                {[
                  '✓ Upload a clear photo of your face only',
                  '✓ Remove all makeup before scanning',
                  '✓ Use natural or bright lighting — avoid flash',
                  '✓ Face the camera directly, no glasses',
                ].map(t => (
                  <div key={t} style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>{t}</div>
                ))}
              </div>

              {/* Lifestyle summary */}
              <div style={{
                background: 'var(--glass-bg)', border: '1px solid var(--border-color)',
                borderRadius: '12px', padding: '14px 18px', marginBottom: '20px',
              }}>
                <div style={{ fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600 }}>
                  Your Profile
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {Object.entries(answers).map(([key, val]) => (
                    <span key={key} style={{
                      background: 'var(--gold-bg)', border: '1px solid var(--gold-border)',
                      borderRadius: '999px', padding: '4px 12px', fontSize: '0.75rem',
                      color: 'var(--gold)', fontWeight: 500,
                    }}>
                      {val}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => setStep(showOptional ? 2 : 2)}>
                  ← Back
                </button>
                <button
                  className="btn btn-gold btn-lg"
                  style={{
                    flex: 2, justifyContent: 'center',
                    opacity: image ? 1 : 0.4,
                    cursor: image ? 'pointer' : 'not-allowed',
                  }}
                  disabled={!image}
                  onClick={handleAnalyze}
                >
                  ✦ Analyze My Skin
                </button>
              </div>

              <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '14px' }}>
                Based on {Object.keys(answers).length} data points + face analysis
              </p>
            </div>
            )}
            </div>
          )}

          {/* ══════════════════════════════════════
             STEP 4: Scanning Animation
             ══════════════════════════════════════ */}
          {step === 4 && scanning && (
            <div style={{
              textAlign: 'center',
              background: 'var(--bg-card)', border: '1px solid var(--gold-border)',
              borderRadius: '20px', padding: '48px 32px',
            }}>
              {/* Spinning ring */}
              <div style={{
                width: '120px', height: '120px', borderRadius: '50%',
                border: '3px solid var(--border-color)',
                borderTop: '3px solid var(--gold)',
                animation: 'rotate 1s linear infinite',
                margin: '0 auto 16px', position: 'relative',
              }}>
                <div style={{
                  position: 'absolute', inset: '12px',
                  border: '2px solid var(--border-subtle)',
                  borderBottom: '2px solid var(--gold-light)',
                  borderRadius: '50%',
                  animation: 'rotate 1.5s linear infinite reverse',
                }} />
                <div style={{
                  position: 'absolute', inset: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: '2rem', lineHeight: 1,
                }}>{SCAN_STAGES[stageIndex]?.icon}</div>
              </div>

              <div style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: '1.5rem', color: 'var(--gold)', marginBottom: '8px',
              }}>Scanning…</div>

              <p style={{ fontSize: '0.95rem', marginBottom: '32px', minHeight: '28px' }}>
                {SCAN_STAGES[stageIndex]?.label}
              </p>

              {/* Progress bar */}
              <div style={{
                height: '4px', background: 'var(--border-color)',
                borderRadius: '999px', overflow: 'hidden', marginBottom: '24px',
              }}>
                <div style={{
                  height: '100%', width: `${SCAN_STAGES[stageIndex]?.pct || 0}%`,
                  background: 'linear-gradient(90deg, var(--gold), var(--gold-light))',
                  borderRadius: '999px', transition: 'width 0.5s ease',
                }} />
              </div>

              {/* Stage dots */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                {SCAN_STAGES.map((_, i) => (
                  <div key={i} style={{
                    width: i <= stageIndex ? '24px' : '8px', height: '8px',
                    borderRadius: '999px',
                    background: i <= stageIndex ? 'var(--gold)' : 'var(--border-color)',
                    transition: 'all 0.4s ease',
                  }} />
                ))}
              </div>

              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '24px', fontStyle: 'italic' }}>
                Analyzing {Object.keys(answers).length} lifestyle data points + face scan · Your privacy is protected
              </p>
            </div>
          )}

        </div>
      </section>

      <style>{`
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      <Footer />
    </main>
  );
}
