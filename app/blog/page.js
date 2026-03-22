export default function BlogPage() {
  return (
    <main style={{ minHeight: '100vh', paddingTop: '120px', paddingBottom: '80px' }}>
      <div className="container" style={{ maxWidth: '800px', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>✍️</div>
        <h1 className="font-serif" style={{ fontSize: '2.5rem', marginBottom: '16px' }}>Skincare Blog</h1>
        <p style={{ color: 'var(--text-muted)' }}>Expert articles, scientific deep-dives, and community stories. Coming soon!</p>
      </div>
    </main>
  );
}
