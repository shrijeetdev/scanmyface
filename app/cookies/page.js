export default function CookiesPage() {
  return (
    <main style={{ minHeight: '100vh', paddingTop: '120px', paddingBottom: '80px' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        <h1 className="font-serif" style={{ fontSize: '2.5rem', marginBottom: '16px' }}>Cookies Policy</h1>
        <div style={{ fontSize: '0.95rem', lineHeight: 1.8, color: 'var(--text-secondary)' }}>
          <p>This application uses minimal cookies focusing strictly on user session management (Supabase Auth) and foundational analytics to help us measure server load. By using scanmyface.ai, you consent to our use of these essential cookies.</p>
        </div>
      </div>
    </main>
  );
}
