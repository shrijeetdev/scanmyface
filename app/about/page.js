export default function AboutPage() {
  return (
    <main style={{ minHeight: '100vh', paddingTop: '120px', paddingBottom: '80px' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        <h1 className="font-serif" style={{ fontSize: '3rem', marginBottom: '24px', color: 'var(--gold)' }}>About scanmyface.ai</h1>
        <div className="glass-card" style={{ padding: '40px', fontSize: '1.05rem', lineHeight: 1.8, color: 'var(--text-secondary)' }}>
          <p style={{ marginBottom: '24px' }}>
            Traditional skincare advice is often generic, biased by marketing, or prohibitively expensive to obtain from clinical professionals. At scanmyface.ai, we believe everyone deserves access to personalized, science-backed skin intelligence.
          </p>
          <p style={{ marginBottom: '24px' }}>
            Our engine leverages state-of-the-art computer vision to analyze your unique facial structure, pore density, pigmentation layout, and dozens of other micro-factors to output clinical-grade skincare routines. 
          </p>
          <p>
            Built by a passionate team of developers and dermatology enthusiasts in India, we are on a mission to bring AI-powered esthetics to every smartphone.
          </p>
        </div>
      </div>
    </main>
  );
}
