export default function TermsPage() {
  return (
    <main style={{ minHeight: '100vh', paddingTop: '120px', paddingBottom: '80px' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        <h1 className="font-serif" style={{ fontSize: '2.5rem', marginBottom: '16px' }}>Terms & Conditions</h1>
        <div style={{ fontSize: '0.95rem', lineHeight: 1.8, color: 'var(--text-secondary)' }}>
          <h2 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginTop: '32px', marginBottom: '16px' }}>1. No Medical Advice</h2>
          <p>scanmyface.ai is an educational and cosmetic analytics tool. Our software is not intended to diagnose, treat, cure, or prevent any medical conditions. Always consult a board-certified dermatologist for clinical concerns.</p>
          <h2 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginTop: '32px', marginBottom: '16px' }}>2. Subscription Terms</h2>
          <p>Premium plans billed at ₹99/month are non-refundable for active billing cycles. You may cancel at any time within your profile dashboard.</p>
        </div>
      </div>
    </main>
  );
}
