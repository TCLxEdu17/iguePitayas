import type { NextConfig } from 'next'

const isMobile = process.env.NEXT_PUBLIC_BUILD_TARGET === 'mobile'

const nextConfig: NextConfig = {
  output: isMobile ? 'export' : 'standalone',
  serverExternalPackages: ['@react-pdf/renderer'],
  ...(isMobile && {
    images: { unoptimized: true },
    trailingSlash: true,
  }),
}

export default nextConfig
