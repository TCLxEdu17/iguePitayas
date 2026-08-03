import type { Metadata, Viewport } from 'next'
import { Bricolage_Grotesque, Karla } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/Providers'

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
      <body className={`${bricolage.variable} ${karla.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
