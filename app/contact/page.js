'use client';

export default function ContactPage() {
  return (
    <main style={{ minHeight: '100vh', paddingTop: '120px', paddingBottom: '80px' }}>
      <div className="container" style={{ maxWidth: '600px' }}>
        <h1 className="font-serif" style={{ fontSize: '2.5rem', marginBottom: '16px', textAlign: 'center' }}>Contact Us</h1>
        <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '40px', textAlign: 'center' }}>
          We'd love to hear from you. Reach out to us at <a href="mailto:scanmyface.ai@gmail.com" style={{ color: 'var(--gold)' }}>scanmyface.ai@gmail.com</a>
        </p>
        
        <div className="glass-card" style={{ padding: '32px' }}>
          <form style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem' }}>Name</label>
              <input type="text" className="input" style={{ width: '100%' }} placeholder="Your name" required />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem' }}>Email</label>
              <input type="email" className="input" style={{ width: '100%' }} placeholder="your@email.com" required />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem' }}>Message</label>
              <textarea className="input" style={{ width: '100%', minHeight: '150px' }} placeholder="How can we help you?" required></textarea>
            </div>
            <button type="button" onClick={() => alert('Thanks for reaching out! We will get back to you shortly.')} className="btn btn-primary" style={{ justifyContent: 'center', marginTop: '10px' }}>Send Message</button>
          </form>
        </div>
      </div>
    </main>
  );
}
