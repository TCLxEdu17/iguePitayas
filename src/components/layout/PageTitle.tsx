'use client'

import { useTypewriter } from '@/hooks/useTypewriter'

interface PageTitleProps {
  title: string
  subtitle?: string
}

export function PageTitle({ title, subtitle }: PageTitleProps) {
  const { displayed, done } = useTypewriter(title, 45)

  return (
    <div>
      <h1
        className="text-2xl font-bold"
        style={{ color: 'var(--color-primary)' }}
      >
        {displayed}
        {!done && (
          <span
            className="inline-block w-0.5 h-6 ml-0.5 align-middle animate-pulse"
            style={{ backgroundColor: 'var(--color-primary)' }}
          />
        )}
      </h1>
      {subtitle && (
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      )}
    </div>
  )
}
