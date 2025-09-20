import './globals.css';
import { ReactNode } from 'react';
import { Inter } from 'next/font/google';
import { Metadata } from 'next';
import Script from 'next/script';
import { Analytics } from '@vercel/analytics/react';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: 'ATC Ready - Air Traffic Control Training Platform',
    template: '%s | ATC Ready'
  },
  description: 'Master air traffic control communications with our interactive training platform. Practice realistic traffic scenarios, improve response times, and build confidence for ATC operations.',
  keywords: [
    'air traffic control',
    'ATC training',
    'aviation training',
    'pilot communication', 
    'traffic advisory',
    'flight training',
    'aviation education',
    'ATC simulator',
    'aviation safety',
    'flight operations'
  ],
  authors: [{ name: 'ATC Ready Team' }],
  creator: 'ATC Ready',
  publisher: 'ATC Ready',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://training.atcready.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'ATC Ready - Air Traffic Control Training Platform',
    description: 'Master air traffic control communications with our interactive training platform. Practice realistic traffic scenarios and improve your ATC skills.',
    url: 'https://training.atcready.com',
    siteName: 'ATC Ready',
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'ATC Ready - Air Traffic Control Training Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ATC Ready - Air Traffic Control Training Platform',
    description: 'Master air traffic control communications with our interactive training platform. Practice realistic traffic scenarios and improve your ATC skills.',
    images: ['/images/og-image.png'],
    creator: '@atcready',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: [
      { url: '/images/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        <meta name="application-name" content="ATC Ready" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="ATC Ready" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        
        {/* Favicon Links */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="apple-touch-icon" sizes="180x180" href="/images/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "ATC Ready",
              "applicationCategory": "EducationalApplication",
              "operatingSystem": "Any",
              "description": "Interactive air traffic control training platform for aviation professionals and students",
              "url": "https://training.atcready.com",
              "author": {
                "@type": "Organization",
                "name": "ATC Ready"
              },
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "ratingCount": "150"
              }
            })
          }}
        />
      </head>
      <body className={inter.variable}>
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-XKZMH7DEKT"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XKZMH7DEKT');
          `}
        </Script>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
