import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono, Playfair_Display } from 'next/font/google'
import { CookieConsent } from '@/components/consent/cookie-consent'
import { ConsentGatedAnalytics } from '@/components/consent/consent-gated-analytics'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})
const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Ruta Cripto Segura | Aprende a proteger tu dinero',
  description:
    'Educación clara sobre stablecoins, P2P, wallets y anti-estafas antes de entrar en crypto. Aprende a reconocer riesgos y fraudes con criterio.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#07130f',
  // lets env(safe-area-inset-*) be non-zero on notched phones (launcher offset)
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="es"
      className={`dark ${geistSans.variable} ${geistMono.variable} ${playfair.variable} bg-background`}
    >
      <body className="font-sans antialiased">
        {children}
        {/* optional technologies only after the visitor agrees (see lib/consent.ts) */}
        <CookieConsent />
        <ConsentGatedAnalytics />
      </body>
    </html>
  )
}
