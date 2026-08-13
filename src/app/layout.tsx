import type { Metadata, Viewport } from 'next'
import { Bricolage_Grotesque, Karla } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/Providers'
import { SplashScreen } from '@/components/layout/SplashScreen'
import { ThemeApplier } from '@/components/ThemeApplier'

const bricolage = Bricolage_Grotesque({ subsets: ['latin'], variable: '--font-bricolage' })
const karla     = Karla({ subsets: ['latin'], variable: '--font-karla' })

export const viewport: Viewport = {
  themeColor: '#1F2E15',
  viewportFit: 'cover',
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  title: 'IGUE Bananas',
  description: 'Gestão operacional e financeira do sítio',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'IGUE Bananas',
  },
  icons: {
    apple: '/icons/apple-touch-icon.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        {/* Apply dark class before React hydrates to avoid flash */}
        <script dangerouslySetInnerHTML={{ __html: `
          try {
            var s = localStorage.getItem('ui-storage');
            if (s && JSON.parse(s)?.state?.darkMode) {
              document.documentElement.classList.add('dark');
            }
          } catch {}
        `}} />
      </head>
      <body className={`${bricolage.variable} ${karla.variable}`}>
        <SplashScreen />
        <Providers>
          <ThemeApplier />
          {children}
        </Providers>
      </body>
    </html>
  )
}
