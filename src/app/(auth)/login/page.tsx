'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTypewriter } from '@/hooks/useTypewriter'

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { displayed: tagline, done: taglineDone } = useTypewriter('Gestão do sítio', 60, 400)

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
      className="flex min-h-screen items-center justify-center p-4"
      style={{ backgroundColor: 'var(--color-surface)' }}
    >
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="text-4xl mb-2">🍌</div>
          <CardTitle style={{ color: 'var(--color-primary)' }} className="text-2xl">IGUE Bananas</CardTitle>
          <p className="text-sm text-muted-foreground min-h-[1.25rem]">
            {tagline}
            {!taglineDone && (
              <span className="inline-block w-0.5 h-3.5 ml-0.5 align-middle animate-pulse bg-current" />
            )}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required autoFocus />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button
              type="submit"
              className="w-full text-white"
              style={{ backgroundColor: 'var(--color-primary)' }}
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
