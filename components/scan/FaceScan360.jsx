'use client';
import { useState, useRef, useCallback, useEffect } from 'react';

function isSkinPixel(r, g, b) {
  const rule1 = r > 95 && g > 40 && b > 20 && (Math.max(r, g, b) - Math.min(r, g, b)) > 15 && Math.abs(r - g) > 15 && r > g && r > b;
  const rule2 = r > 80 && g > 30 && b > 15 && r > b && (r - b) > 20 && g > b;
  return rule1 || rule2;
}

/**
 * FaceID-inspired 360° Guided Camera Capture
 * 
 * Premium guided capture with:
 * - Face outline overlay with progress ring
 * - Multi-angle prompts: "Look straight" → "Turn left" → "Turn right"
 * - Real-time feedback (lighting, distance, face detection)
 * - Captures 3 key frames (front, left, right)
 */

const CAPTURE_STEPS = [
  { id: 'front', label: 'Look Straight', instruction: 'Position your face in the center', icon: '👤', angle: 0 },
  { id: 'left',  label: 'Turn Left',     instruction: 'Slowly turn your head left',       icon: '←',  angle: -30 },
  { id: 'right', label: 'Turn Right',    instruction: 'Slowly turn your head right',      icon: '→',  angle: 30 },
];

export default function FaceScan360({ onComplete, onCancel }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [captures, setCaptures] = useState([]);
  const [countingDown, setCountingDown] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [processing, setProcessing] = useState(false);
  const [ringProgress, setRingProgress] = useState(0);
  const [faceDetected, setFaceDetected] = useState(false);

  // Start camera
  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  // Ring animation
  useEffect(() => {
    const target = ((currentStep) / CAPTURE_STEPS.length) * 100;
    const timer = setTimeout(() => setRingProgress(target), 200);
    return () => clearTimeout(timer);
  }, [currentStep]);

  // Skin/Face Auto-Detect Loop
  useEffect(() => {
    if (!cameraReady || countingDown || processing || captures.length >= CAPTURE_STEPS.length) return;

    const interval = setInterval(() => {
      if (!videoRef.current) return;
      const video = videoRef.current;
      if (video.videoWidth === 0 || video.videoHeight === 0) return;

      const canvas = document.createElement('canvas');
      canvas.width = 120;
      canvas.height = 120;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(video, 0, 0, 120, 120);
      const imgData = ctx.getImageData(0, 0, 120, 120);
      const pixels = imgData.data;

      // Check center 50% box
      let skinPixels = 0;
      const startBox = 30, endBox = 90;
      for (let y = startBox; y < endBox; y++) {
        for (let x = startBox; x < endBox; x++) {
          const idx = (y * 120 + x) * 4;
          if (isSkinPixel(pixels[idx], pixels[idx+1], pixels[idx+2])) skinPixels++;
        }
      }

      const totalBox = (endBox - startBox) * (endBox - startBox);
      const percent = (skinPixels / totalBox) * 100;
      
      if (percent > 20) {
        setFaceDetected(true);
        handleCapture();
      } else {
        setFaceDetected(false);
      }
    }, 600);

    return () => clearInterval(interval);
  }, [cameraReady, countingDown, processing, captures.length, handleCapture]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraReady(true);
      }
    } catch (err) {
      console.error('Camera error:', err);
      setCameraError('Camera access denied. Please allow camera access and try again.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  };

  const captureFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return null;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    // Mirror for selfie
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);
    ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset
    return canvas.toDataURL('image/jpeg', 0.92);
  }, []);

  const handleCapture = useCallback(() => {
    setCountingDown(true);
    setCountdown(3);

    let count = 3;
    const timer = setInterval(() => {
      count--;
      setCountdown(count);
      if (count <= 0) {
        clearInterval(timer);
        setCountingDown(false);

        // Capture the frame
        const frame = captureFrame();
        if (frame) {
          const newCaptures = [...captures, { step: CAPTURE_STEPS[currentStep], data: frame }];
          setCaptures(newCaptures);

          if (currentStep < CAPTURE_STEPS.length - 1) {
            // Next step
            setCurrentStep(prev => prev + 1);
          } else {
            // All done — process
            setProcessing(true);
            setRingProgress(100);

            // Convert best frame (front) to File for AI engine
            fetch(newCaptures[0].data)
              .then(r => r.blob())
              .then(blob => {
                const file = new File([blob], '360scan_front.jpg', { type: 'image/jpeg' });
                const url = URL.createObjectURL(blob);
                stopCamera();
                setTimeout(() => {
                  onComplete({ file, url, captures: newCaptures, is360: true });
                }, 1500);
              });
          }
        }
      }
    }, 800);
  }, [captures, currentStep, captureFrame, onComplete]);

  const step = CAPTURE_STEPS[currentStep];
  const progress = ringProgress;

  // Ring SVG params
  const ringSize = 280;
  const ringStroke = 4;
  const ringR = (ringSize - ringStroke * 2) / 2;
  const ringCirc = 2 * Math.PI * ringR;
  const ringOffset = ringCirc - (progress / 100) * ringCirc;

  if (cameraError) {
    return (
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border-color)',
        borderRadius: '20px', padding: '40px 24px', textAlign: 'center',
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📷</div>
        <h3 className="font-serif" style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Camera Access Required</h3>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>{cameraError}</p>
        <button className="btn btn-outline" onClick={onCancel}>← Go Back</button>
      </div>
    );
  }

  return (
    <div style={{
      background: '#0C0A14', borderRadius: '20px', overflow: 'hidden',
      position: 'relative', maxWidth: '500px', margin: '0 auto',
    }}>
      {/* Hidden canvas for frame capture */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Header */}
      <div style={{
        padding: '16px 20px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderBottom: '1px solid rgba(155,130,255,0.1)',
      }}>
        <div>
          <div style={{
            fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em',
            color: '#9B82FF', textTransform: 'uppercase',
          }}>360° Advanced Scan</div>
          <div style={{ fontSize: '0.8rem', color: '#A8A2C0', marginTop: '2px' }}>
            Step {currentStep + 1} of {CAPTURE_STEPS.length}
          </div>
        </div>
        <button onClick={() => { stopCamera(); onCancel(); }} style={{
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '999px', color: '#A8A2C0', fontSize: '0.75rem',
          padding: '6px 14px', cursor: 'pointer',
        }}>
          Cancel
        </button>
      </div>

      {/* Camera viewport + FaceID overlay */}
      <div style={{
        position: 'relative', width: '100%', aspectRatio: '3/4',
        background: '#000', overflow: 'hidden',
      }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            transform: 'scaleX(-1)', // Mirror for selfie
          }}
        />

        {/* Dark corners overlay (FaceID style) */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 50% 55% at 50% 45%, transparent 0%, rgba(12,10,20,0.8) 100%)',
          pointerEvents: 'none',
        }} />

        {/* Face outline + progress ring */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none',
        }}>
          <svg width={ringSize} height={ringSize} style={{ transform: 'rotate(-90deg)' }}>
            {/* Background ring */}
            <circle
              cx={ringSize / 2} cy={ringSize / 2} r={ringR}
              fill="none" stroke="rgba(155,130,255,0.15)" strokeWidth={ringStroke}
            />
            {/* Progress ring */}
            <circle
              cx={ringSize / 2} cy={ringSize / 2} r={ringR}
              fill="none" stroke="#9B82FF" strokeWidth={ringStroke}
              strokeLinecap="round"
              strokeDasharray={ringCirc}
              strokeDashoffset={ringOffset}
              style={{ transition: 'stroke-dashoffset 0.8s ease', filter: 'drop-shadow(0 0 8px rgba(155,130,255,0.5))' }}
            />
            {/* Face outline ellipse */}
            <ellipse
              cx={ringSize / 2} cy={ringSize / 2}
              rx={ringR * 0.55} ry={ringR * 0.75}
              fill="none" stroke="rgba(155,130,255,0.3)" strokeWidth="1.5"
              strokeDasharray="4 4"
              style={{ transform: 'rotate(90deg)', transformOrigin: 'center' }}
            />
          </svg>
        </div>

        {/* Scan mesh grid effect */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          opacity: processing ? 0.6 : 0.15,
          transition: 'opacity 0.5s',
          backgroundImage: `
            linear-gradient(rgba(155,130,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(155,130,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
        }} />

        {/* Scanning line animation */}
        {(cameraReady && !processing) && (
          <div style={{
            position: 'absolute', left: '15%', right: '15%',
            height: '2px',
            background: 'linear-gradient(90deg, transparent, #9B82FF, transparent)',
            boxShadow: '0 0 12px rgba(155,130,255,0.6)',
            animation: 'scanLineMove 2.5s ease-in-out infinite',
            pointerEvents: 'none',
          }} />
        )}

        {/* Countdown overlay */}
        {countingDown && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(12,10,20,0.5)',
          }}>
            <div style={{
              width: '100px', height: '100px', borderRadius: '50%',
              background: 'rgba(155,130,255,0.2)', border: '2px solid #9B82FF',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2.5rem', fontWeight: 700, color: '#fff',
              animation: 'pulse-accent 0.8s ease-in-out',
            }}>
              {countdown}
            </div>
          </div>
        )}

        {/* Processing overlay */}
        {processing && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column', gap: '12px',
            background: 'rgba(12,10,20,0.7)',
          }}>
            <div style={{
              width: '60px', height: '60px', borderRadius: '50%',
              border: '3px solid rgba(155,130,255,0.2)',
              borderTop: '3px solid #9B82FF',
              animation: 'rotate 1s linear infinite',
            }} />
            <div style={{ color: '#BCA8FF', fontSize: '0.9rem', fontWeight: 600 }}>
              Processing 360° scan...
            </div>
          </div>
        )}
      </div>

      {/* Instruction + Capture button */}
      <div style={{ padding: '20px', textAlign: 'center' }}>
        {/* Direction indicator */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '16px',
        }}>
          {CAPTURE_STEPS.map((s, i) => (
            <div key={s.id} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
              opacity: i <= currentStep ? 1 : 0.3,
              transition: 'all 0.3s',
            }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: i < captures.length
                  ? 'rgba(76,175,80,0.2)'
                  : i === currentStep
                  ? 'rgba(155,130,255,0.2)'
                  : 'rgba(255,255,255,0.05)',
                border: `1.5px solid ${
                  i < captures.length ? '#4CAF50' : i === currentStep ? '#9B82FF' : 'rgba(255,255,255,0.1)'
                }`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: i < captures.length ? '0.7rem' : '0.85rem',
                color: i < captures.length ? '#4CAF50' : i === currentStep ? '#BCA8FF' : '#6B6580',
              }}>
                {i < captures.length ? '✓' : s.icon}
              </div>
              <span style={{
                fontSize: '0.65rem', color: i === currentStep ? '#BCA8FF' : '#6B6580',
                fontWeight: i === currentStep ? 600 : 400,
              }}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Current instruction */}
        {!processing && (
          <>
            <h3 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '1.2rem', fontWeight: 700, color: '#F5F3FF', marginBottom: '4px',
            }}>
              {step.label}
            </h3>
            <p style={{ 
              fontSize: '0.82rem', 
              color: faceDetected || countingDown ? '#4CAF50' : '#A8A2C0', 
              marginBottom: '16px',
              transition: 'color 0.3s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
            }}>
              {(faceDetected || countingDown) ? '✓ Face Detected!' : step.instruction}
            </p>
            {(!countingDown && !faceDetected) && (
              <div style={{ fontSize: '0.72rem', color: '#9B82FF', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '16px', animation: 'pulse-accent 1.5s infinite auto-reverse' }}>
                Auto-Capture is ON — Align your face into the circle
              </div>
            )}

            {/* Capture button (Fallback) */}
            <button
              onClick={handleCapture}
              disabled={countingDown || !cameraReady}
              style={{
                width: '72px', height: '72px', borderRadius: '50%',
                background: countingDown
                  ? 'rgba(155,130,255,0.3)'
                  : 'linear-gradient(135deg, #7C5CFC, #5B3FD1)',
                border: '3px solid rgba(155,130,255,0.4)',
                cursor: countingDown ? 'default' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.5rem', color: '#fff',
                boxShadow: '0 0 30px rgba(124,92,252,0.3)',
                transition: 'all 0.3s',
                margin: '0 auto',
              }}
            >
              📸
            </button>

            <p style={{ fontSize: '0.7rem', color: '#6B6580', marginTop: '12px' }}>
              Tap to capture · {CAPTURE_STEPS.length - captures.length} remaining
            </p>
          </>
        )}

        {/* Captured thumbs */}
        {captures.length > 0 && !processing && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '12px' }}>
            {captures.map((cap, i) => (
              <div key={i} style={{
                width: '48px', height: '48px', borderRadius: '8px', overflow: 'hidden',
                border: '2px solid rgba(76,175,80,0.4)',
              }}>
                <img src={cap.data} alt={cap.step.label} style={{
                  width: '100%', height: '100%', objectFit: 'cover',
                }} />
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes scanLineMove {
          0% { top: 15%; }
          50% { top: 75%; }
          100% { top: 15%; }
        }
      `}</style>
    </div>
  );
}
