'use client';
import { useState } from 'react';

export default function RoutineAnalyzer({ detectedIssues = [] }) {
  const [productInput, setProductInput] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzedProducts, setAnalyzedProducts] = useState([
    // Example pre-populated or empty start
  ]);

  // Extract issue IDs/names
  const issueKeywords = detectedIssues.map(i => i.id || i.name.toLowerCase());
  const hasAcne = issueKeywords.some(i => i.includes('acne') || i.includes('breakout'));
  const hasDryness = issueKeywords.some(i => i.includes('dry') || i.includes('flake'));
  const hasPigmentation = issueKeywords.some(i => i.includes('pigment') || i.includes('dark'));

  const handleAnalyze = (e) => {
    e.preventDefault();
    if (!productInput.trim()) return;

    setAnalyzing(true);
    const productToProcess = productInput.trim();
    setProductInput('');

    // Simulate API call for product ingredient analysis
    setTimeout(() => {
      setAnalyzing(false);
      const inputLower = productToProcess.toLowerCase();
      let matchType = 'neutral';
      let reason = 'Safe to use, but may not address your specific skin concerns directly.';
      let score = 50;

      // Simulated Product Knowledge Base & Conflict Logic
      if (inputLower.includes('retinol') || inputLower.includes('tretinoin')) {
        if (hasAcne || hasPigmentation) {
          matchType = 'good';
          score = 95;
          reason = 'Excellent for cell turnover. Directly targets your breakouts and uneven tone.';
        } else if (hasDryness) {
          matchType = 'bad';
          score = 20;
          reason = 'Warning: Retinoids can severely worsen your detected dryness. Use with extreme caution and heavy moisturizers.';
        } else {
          matchType = 'good';
          score = 80;
          reason = 'Great for anti-aging and overall skin texture.';
        }
      } else if (inputLower.includes('salicylic') || inputLower.includes('bha')) {
        if (hasAcne) {
          matchType = 'good';
          score = 90;
          reason = 'Perfect match. Unclogs pores and directly treats your detected acne.';
        } else if (hasDryness) {
          matchType = 'bad';
          score = 30;
          reason = 'BHA will actively strip oils and worsen your dry skin.';
        }
      } else if (inputLower.includes('hyaluronic') || inputLower.includes('ceramide') || inputLower.includes('moisturizer')) {
        if (hasDryness) {
          matchType = 'good';
          score = 98;
          reason = 'Essential for your skin barrier. Will deeply hydrate and treat your dryness.';
        } else {
          matchType = 'good';
          score = 85;
          reason = 'Good for maintaining hydration and barrier health.';
        }
      } else if (inputLower.includes('vitamin c') || inputLower.includes('ascorbic')) {
        if (hasPigmentation) {
          matchType = 'good';
          score = 92;
          reason = 'Highly effective for brightening the dark spots we detected.';
        } else if (hasAcne) {
          matchType = 'neutral';
          score = 60;
          reason = 'Brightens skin, but pure Vitamin C might slightly irritate active acne.';
        }
      } else if (inputLower.includes('scrub') || inputLower.includes('walnut') || inputLower.includes('physical')) {
        matchType = 'bad';
        score = 10;
        reason = 'Physical scrubs cause micro-tears and inflammation. Switch to chemical exfoliants (AHA/BHA).';
      } else if (inputLower.includes('coconut oil') || inputLower.includes('shea butter')) {
        if (hasAcne) {
          matchType = 'bad';
          score = 15;
          reason = 'Highly comedogenic (pore-clogging). Will likely trigger more breakouts for your skin profile.';
        } else if (hasDryness) {
          matchType = 'good';
          score = 85;
          reason = 'Rich occlusive that will lock in moisture for your dry skin.';
        }
      }

      const newProduct = {
        id: Date.now(),
        name: productToProcess,
        matchType, // 'good', 'neutral', 'bad'
        reason,
        score
      };

      setAnalyzedProducts(prev => [newProduct, ...prev]);
    }, 1200);
  };

  const removeProduct = (id) => {
    setAnalyzedProducts(prev => prev.filter(p => p.id !== id));
  };

  const badgeStyles = {
    good: { bg: 'rgba(76,175,80,0.15)', text: '#81C784', border: 'rgba(76,175,80,0.3)', icon: '✅', label: 'Great Match' },
    neutral: { bg: 'rgba(255,152,0,0.15)', text: '#FFB74D', border: 'rgba(255,152,0,0.3)', icon: '⚠️', label: 'Neutral' },
    bad: { bg: 'rgba(244,67,54,0.15)', text: '#EF9A9A', border: 'rgba(244,67,54,0.3)', icon: '❌', label: 'Not Recommended' }
  };

  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border-color)',
      borderRadius: '20px', padding: '32px 24px', position: 'relative', overflow: 'hidden'
    }}>
      {/* Background flare */}
      <div style={{
        position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px',
        background: 'var(--gold-glow)', borderRadius: '50%', filter: 'blur(40px)', pointerEvents: 'none'
      }} />

      <h3 className="font-serif" style={{ fontSize: '1.4rem', marginBottom: '8px' }}>
        Current Routine Analyzer
      </h3>
      <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.6 }}>
        Type a product or ingredient you currently use. We'll cross-check it against your AI scan results to see if it's helping or harming your skin.
      </p>

      {/* Input Form */}
      <form onSubmit={handleAnalyze} style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        <input 
          type="text" 
          value={productInput}
          onChange={(e) => setProductInput(e.target.value)}
          placeholder="e.g., CeraVe Foaming Cleanser, The Ordinary Retinol"
          className="input"
          style={{ flex: 1 }}
          disabled={analyzing}
        />
        <button 
          type="submit" 
          className="btn btn-gold" 
          style={{ padding: '0 24px', flexShrink: 0, opacity: analyzing ? 0.7 : 1 }}
          disabled={analyzing || !productInput.trim()}
        >
          {analyzing ? 'Checking...' : 'Check'}
        </button>
      </form>

      {/* Loader */}
      {analyzing && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: 'var(--glass-bg)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid var(--border-color)', borderTopColor: 'var(--gold)', animation: 'rotate 1s linear infinite' }} />
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600 }}>Analyzing ingredients against your skin profile...</span>
        </div>
      )}

      {/* Results List */}
      {analyzedProducts.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '24px' }}>
          <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
            Analyzed Products
          </h4>
          
          {analyzedProducts.map(product => {
            const style = badgeStyles[product.matchType];
            return (
              <div key={product.id} className="anim-fadeInUp" style={{
                background: 'var(--glass-bg)', border: `1px solid ${style.border}`,
                borderRadius: '16px', padding: '20px', position: 'relative',
                transition: 'transform 0.2s ease', 
              }}>
                <button 
                  onClick={() => removeProduct(product.id)}
                  style={{ position: 'absolute', top: '12px', right: '12px', color: 'var(--text-muted)', fontSize: '1.2rem', padding: '4px', cursor: 'pointer' }}
                >×</button>
                
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                  <div style={{ fontSize: '1.8rem', marginTop: '2px' }}>{style.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                      <h4 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.1rem', color: 'var(--text-primary)', margin: 0 }}>
                        {product.name}
                      </h4>
                      <span style={{
                        background: style.bg, color: style.text, border: `1px solid ${style.border}`,
                        padding: '2px 10px', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 700,
                        textTransform: 'uppercase', letterSpacing: '0.05em'
                      }}>
                        {style.label}
                      </span>
                    </div>
                    
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                      {product.reason}
                    </p>
                    
                    {/* Compatibility Score Bar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '14px' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, width: '45px' }}>Match:</span>
                      <div style={{ height: '6px', flex: 1, background: 'var(--bg-secondary)', borderRadius: '999px', overflow: 'hidden' }}>
                        <div style={{ 
                          height: '100%', width: `${product.score}%`, 
                          background: style.text, borderRadius: '999px',
                          boxShadow: `0 0 8px ${style.bg}`
                        }} />
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: style.text }}>{product.score}%</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
