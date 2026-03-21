import { ThemeProvider } from '@/hooks/useTheme';
import { AuthProvider } from '@/hooks/useAuth';
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";
import './globals.css';

export const metadata = {
  metadataBase: new URL('https://scanmyface.ai'),
  title: 'Scan My Face with AI — Free Skin Analysis | scanmyface.ai',
  description: 'Want to understand your skin? Scan my face with our advanced AI face scanner. Instantly detect acne, dark spots, and wrinkles, and get a free personalized skincare routine online. Better than an AI dermatologist.',
  keywords: [
    'scan my face', 'face scanner AI', 'AI skin analysis', 'scan face with AI', 
    'free skin test online', 'AI dermatologist', 'analyze skin health', 
    'skincare routine scanner', 'face mapping online'
  ],
  openGraph: {
    title: 'Scan My Face with AI — Free Skin Analysis',
    description: 'Upload a selfie and let our AI face scanner detect your skin issues instantly. Get a free, personalized skincare routine in seconds.',
    url: 'https://scanmyface.ai',
    siteName: 'scanmyface.ai',
    type: 'website',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Scan My Face with AI — Free Skin Analysis',
    description: 'Curious about your skin health? Scan your face with our AI dermatologist tool and get a free personalized routine.',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <AuthProvider>
            {children}
            <SpeedInsights />
            <Analytics />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
