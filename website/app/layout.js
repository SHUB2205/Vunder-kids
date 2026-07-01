import './globals.css'
import { Analytics } from '@vercel/analytics/next'

export const metadata = {
  metadataBase: new URL('https://fisiko.io'),
  title: 'Fisiko - Book Facilities, Create Matches, Connect with Athletes',
  description: 'The all-in-one sports app. Book tennis courts, basketball courts, cricket grounds & more. Create matches, track scores, find players near you, and get AI-powered sports advice. Free on iOS & Android.',
  keywords: 'sports app, book sports facilities, tennis court booking, basketball court, cricket ground, create matches, find players, sports community, live scores, AI sports assistant, fitness app',
  authors: [{ name: 'Fisiko' }],
  creator: 'Fisiko',
  publisher: 'Fisiko',
  openGraph: {
    title: 'Fisiko - Book Facilities, Create Matches, Connect with Athletes',
    description: 'The all-in-one sports app. Book facilities, create matches, track scores, and connect with athletes worldwide. Free on iOS & Android.',
    type: 'website',
    siteName: 'Fisiko',
    locale: 'en_US',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Fisiko - Your Sports Community App',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fisiko - Book Facilities, Create Matches, Connect with Athletes',
    description: 'The all-in-one sports app. Book facilities, create matches, track scores, and connect with athletes worldwide.',
    creator: '@fisikoapp',
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
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#FF6B35" />
      </head>
      <body className="antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
