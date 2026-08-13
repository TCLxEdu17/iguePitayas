'use client'

import { useEffect, useState } from 'react'
import { signIn, getSession, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { WifiOff } from 'lucide-react'
import Image from 'next/image'

export default function LoginPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Se já tem sessão ativa, pula o login
  useEffect(() => {
    if (status === 'authenticated') {
      const role = (session?.user as any)?.role
      router.replace(role === 'ADMIN' ? '/dashboard' : '/mapa')
    }
  }, [session, status, router])

  if (status === 'loading' || status === 'authenticated') return null

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const form = new FormData(e.currentTarget)

    const result = await signIn('credentials', {
      email:    form.get('email'),
      password: form.get('password'),
      redirect: false,
    })

    if (result?.error) {
      setError('Email ou senha incorretos.')
      setLoading(false)
      return
    }

    const session = await getSession()
    const role = (session?.user as any)?.role
    router.push(role === 'ADMIN' ? '/dashboard' : '/mapa')
  }

  return (
    <div
      style={{
        minHeight: '100svh',
        background: 'var(--color-paper)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 26px',
      }}
    >
      <div style={{ width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 26 }}>
        {/* Logo + heading */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
          <div style={{ marginBottom: 18 }}>
            <Image
              src="/logo.png"
              alt="IGUE Bananas"
              width={62}
              height={62}
              style={{
                borderRadius: '50%',
                boxShadow: '0 8px 18px -8px rgba(31,46,21,.5)',
                objectFit: 'cover',
              }}
            />
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-bricolage)',
              fontSize: 30,
              fontWeight: 700,
              color: 'var(--color-ink)',
              margin: 0,
              lineHeight: 1.1,
            }}
          >
            Bom dia.
          </h1>
          <p
            style={{
              fontSize: 15,
              color: 'var(--color-ink-soft)',
              margin: '6px 0 0',
              textAlign: 'center',
            }}
          >
            Entre para lançar o dia no campo.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label
              htmlFor="email"
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: 'var(--color-ink-soft)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              E-MAIL
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoFocus
              autoComplete="email"
              style={{
                height: 52,
                borderRadius: 14,
                border: '1.5px solid #DCCFB0',
                background: 'var(--color-surface)',
                padding: '0 16px',
                fontSize: 16,
                color: 'var(--color-ink)',
                outline: 'none',
                width: '100%',
                boxSizing: 'border-box',
                transition: 'border-color 150ms ease',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = '#3D5A2E')}
              onBlur={e => (e.currentTarget.style.borderColor = '#DCCFB0')}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label
              htmlFor="password"
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: 'var(--color-ink-soft)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              SENHA
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              style={{
                height: 52,
                borderRadius: 14,
                border: '1.5px solid #DCCFB0',
                background: 'var(--color-surface)',
                padding: '0 16px',
                fontSize: 16,
                color: 'var(--color-ink)',
                outline: 'none',
                width: '100%',
                boxSizing: 'border-box',
                transition: 'border-color 150ms ease',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = '#3D5A2E')}
              onBlur={e => (e.currentTarget.style.borderColor = '#DCCFB0')}
            />
          </div>

          {error && (
            <p style={{ fontSize: 12, color: '#C0392B', margin: 0 }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              height: 56,
              borderRadius: 16,
              background: loading ? '#6E8F4E' : '#3D5A2E',
              border: 'none',
              color: '#FBF6EA',
              fontFamily: 'var(--font-bricolage)',
              fontSize: 17,
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 10px 20px -8px rgba(31,46,21,.6)',
              transition: 'background 150ms ease',
              width: '100%',
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#2E4522' }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#3D5A2E' }}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        {/* Offline notice */}
        <div
          style={{
            borderRadius: 14,
            background: 'rgba(193,122,74,.12)',
            border: '1px solid rgba(193,122,74,.25)',
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
          }}
        >
          <WifiOff size={17} color="#A8632F" style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 12.5, color: '#7A4A22', margin: 0, lineHeight: 1.4 }}>
            Sem sinal? Você entra com o último acesso e tudo fica salvo no aparelho.
          </p>
        </div>
      </div>
    </div>
  )
}
