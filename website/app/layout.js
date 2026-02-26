import './globals.css'

export const metadata = {
  metadataBase: new URL('https://fisiko.io'),
  title: 'Fisiko - Your Sports Community App',
  description: 'Connect with athletes, find sports partners, join matches & build your sports community. Track your games, share highlights, and level up your athletic journey!',
  keywords: 'sports, fitness, matches, athletes, basketball, soccer, tennis, workout, community',
  openGraph: {
    title: 'Fisiko - Your Sports Community App',
    description: 'Connect with athletes, find sports partners, join matches & build your sports community.',
    type: 'website',
    siteName: 'Fisiko',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
