'use client';

/**
 * scanmyface.ai Logo — Modern female sketch with scanning line
 * 
 * Premium line-art: a stylized sketch of a modern girl with bangs
 * and straight hair, inspired by the user's reference photo.
 * Features a minimalist front-facing/slightly angled portrait with
 * a horizontal glowing scan line.
 */
export default function Logo({ size = 40, showText = false, animated = false }) {
  const stroke = 'var(--gold)';
  const glow = 'rgba(124,92,252,0.35)';

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: showText ? '10px' : 0 }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
        aria-label="scanmyface.ai logo"
      >
        <g transform="translate(0, 0) scale(1)">
          {/* ─── Stylish Minimalist Line Art (Modern Girl) ─── */}
          
          {/* Sleek Face Profile */}
          <path 
            d="M 33 52 C 33 72, 42 84, 50 84 C 58 84, 67 72, 67 52" 
            stroke={stroke} strokeWidth="2" strokeLinecap="round" 
            style={{ filter: `drop-shadow(0 0 3px ${glow})` }}
            fill="none"
          />

          {/* Neck (Delicate) */}
          <path d="M 40 82 C 38 90, 36 96, 32 100" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <path d="M 60 82 C 62 90, 64 96, 68 100" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" fill="none" />
          
          {/* Hair Top & Volume (Straight and sleek) */}
          <path 
            d="M 24 55 C 18 20, 35 12, 50 12 C 65 12, 82 20, 76 55" 
            stroke={stroke} strokeWidth="2" strokeLinecap="round" fill="none" 
          />

          {/* Bangs (Signature sweeping textured bangs) */}
          <path d="M 28 42 C 40 35, 60 35, 72 42" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <path d="M 34 38 L 36 48" stroke={stroke} strokeWidth="1.2" strokeLinecap="round" fill="none" />
          <path d="M 44 36 L 45 49" stroke={stroke} strokeWidth="1.2" strokeLinecap="round" fill="none" />
          <path d="M 54 36 L 53 49" stroke={stroke} strokeWidth="1.2" strokeLinecap="round" fill="none" />
          <path d="M 64 38 L 62 48" stroke={stroke} strokeWidth="1.2" strokeLinecap="round" fill="none" />

          {/* Long Flowing Straight Hair */}
          <path d="M 28 42 C 22 65, 18 85, 12 100" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <path d="M 24 55 C 18 70, 12 85, 6 100" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" fill="none" />
          
          <path d="M 72 42 C 78 65, 82 85, 88 100" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <path d="M 76 55 C 82 70, 88 85, 94 100" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" fill="none" />

          {/* Eyeliner & Closed Eyes (Elegant winged liner look) */}
          <path d="M 36 56 C 39 54, 43 54, 45 56" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <path d="M 36 56 L 34 54" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <circle cx="40" cy="58" r="1.5" fill={stroke} />

          <path d="M 64 56 C 61 54, 57 54, 55 56" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <path d="M 64 56 L 66 54" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <circle cx="60" cy="58" r="1.5" fill={stroke} />

          {/* Minimalist Nose Tip */}
          <path d="M 48 65 C 49 67, 51 67, 52 65" stroke={stroke} strokeWidth="1.2" strokeLinecap="round" fill="none" />

          {/* Modern Plump Lips */}
          <path d="M 44 75 C 48 73, 52 73, 56 75 C 52 78, 48 78, 44 75 Z" stroke={stroke} strokeWidth="1.5" strokeLinejoin="round" fill="none" />

          {/* Beauty Mark under eye */}
          <circle cx="43" cy="62" r="0.8" fill={stroke} />
        </g>

        {/* ─── Scanning line (Horizontal overlay across the face) ─── */}
        <line
          x1="5" y1="58"
          x2="95" y2="58"
          stroke="var(--gold-light, #C9A84C)"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.8"
          style={{ filter: `drop-shadow(0 0 6px ${glow})` }}
        >
          {animated && (
            <>
              <animate attributeName="y1" values="30;85;30" dur="2.5s" repeatCount="indefinite" />
              <animate attributeName="y2" values="30;85;30" dur="2.5s" repeatCount="indefinite" />
            </>
          )}
        </line>
        
        {/* Glow duplication */}
        <line
          x1="5" y1="58"
          x2="95" y2="58"
          stroke="var(--gold-light, #C9A84C)"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.2"
        >
          {animated && (
            <>
              <animate attributeName="y1" values="30;85;30" dur="2.5s" repeatCount="indefinite" />
              <animate attributeName="y2" values="30;85;30" dur="2.5s" repeatCount="indefinite" />
            </>
          )}
        </line>
      </svg>

      {showText && (
        <span style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: `${Math.max(size * 0.38, 14)}px`,
          fontWeight: 600,
          color: 'var(--text-primary)',
          letterSpacing: '-0.01em',
          lineHeight: 1,
        }}>
          scanmyface<span style={{ color: 'var(--gold)' }}>.ai</span>
        </span>
      )}
    </div>
  );
}
