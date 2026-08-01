import type { NextConfig } from 'next'
import { version } from './package.json'

const isMobile = process.env.NEXT_PUBLIC_BUILD_TARGET === 'mobile'

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_APP_VERSION: version,
  },
  output: isMobile ? 'export' : 'standalone',
  serverExternalPackages: ['@react-pdf/renderer'],
  ...(isMobile && {
    images: { unoptimized: true },
    trailingSlash: true,
  }),
}

export default nextConfig
