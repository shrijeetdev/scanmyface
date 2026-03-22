export default function PrivacyPage() {
  return (
    <main style={{ minHeight: '100vh', paddingTop: '120px', paddingBottom: '80px' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        <h1 className="font-serif" style={{ fontSize: '2.5rem', marginBottom: '16px' }}>Privacy Policy</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '40px' }}>Last updated: March 2026</p>
        <div style={{ fontSize: '0.95rem', lineHeight: 1.8, color: 'var(--text-secondary)' }}>
          <h2 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginTop: '32px', marginBottom: '16px' }}>1. Image Processing & Consent</h2>
          <p>At scanmyface.ai, your privacy is our utmost priority. All facial scans run locally or immediately expire upon processing. We do not store your face photos in our database without your explicit opt-in preference.</p>
          
          <h2 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginTop: '32px', marginBottom: '16px' }}>2. Data Collection</h2>
          <p>We collect essential onboarding data (such as Age, Diet, Skin Type) and your computed final scan scores to correctly supply your Dashboard analytics and track your progress over weeks.</p>
          
          <h2 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginTop: '32px', marginBottom: '16px' }}>3. Third Party Affiliates</h2>
          <p>We utilize trusted third-party affiliates for product recommendations. Clicking an affiliate link may deposit an attribution cookie. We never sell your personal skin profile data to marketers.</p>
        </div>
      </div>
    </main>
  );
}
