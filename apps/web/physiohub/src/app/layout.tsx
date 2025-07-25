import './global.css';

export const metadata = {
  title: 'PhysioHub - Interactive Anatomy Learning Platform',
  description: 'Your interactive anatomy learning platform. Explore muscles, joints, ligaments, and more with detailed anatomical information and clinical insights.',
  keywords: 'anatomy, physiology, physiotherapy, medical education, muscles, joints, ligaments, tendons, neural structures, exercises',
  authors: [{ name: 'PhysioHub Team' }],
  creator: 'PhysioHub',
  publisher: 'PhysioHub',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://physiohub.com'),
  openGraph: {
    title: 'PhysioHub - Interactive Anatomy Learning Platform',
    description: 'Your interactive anatomy learning platform. Explore muscles, joints, ligaments, and more with detailed anatomical information and clinical insights.',
    url: 'https://physiohub.com',
    siteName: 'PhysioHub',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PhysioHub - Interactive Anatomy Learning Platform',
    description: 'Your interactive anatomy learning platform. Explore muscles, joints, ligaments, and more with detailed anatomical information and clinical insights.',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0c4a6e' },
    { media: '(prefers-color-scheme: dark)', color: '#0c4a6e' }
  ],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'PhysioHub',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'PhysioHub',
    'msapplication-TileColor': '#0c4a6e',
    'msapplication-config': 'none',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="PhysioHub" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#0c4a6e" />
        <meta name="msapplication-TileColor" content="#0c4a6e" />
        <meta name="msapplication-config" content="none" />
      </head>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
