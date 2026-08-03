'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

const KEY = 'igue.splashSeen'

export function SplashScreen({ duration = 2400 }: { duration?: number }) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem(KEY)) return
    setShow(true)
    const t = setTimeout(() => {
      sessionStorage.setItem(KEY, '1')
      setShow(false)
    }, duration)
    return () => clearTimeout(t)
  }, [duration])

  if (!show) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-8 overflow-hidden"
      style={{ background: 'radial-gradient(100% 70% at 50% 78%, #3D5A2E 0%, #1F2E15 55%, #141B0F 100%)' }}
    >
      <div
        className="absolute h-[300px] w-[300px] rounded-full animate-glow"
        style={{ background: 'radial-gradient(circle, rgba(212,168,67,.45) 0%, transparent 66%)' }}
      />
      <Image
        src="/logo.png"
        alt="Igue Bananas"
        width={216}
        height={216}
        priority
        className="relative rounded-full animate-logo-in"
        style={{ boxShadow: '0 22px 50px -18px rgba(0,0,0,.6)' }}
      />
      <p
        className="font-display text-sm font-semibold uppercase animate-rise-in"
        style={{ letterSpacing: '.4em', color: 'rgba(245,236,215,.7)', animationDelay: '.9s' }}
      >
        Prata e Nanica
      </p>
      <p
        className="absolute bottom-12 text-xs uppercase animate-rise-in"
        style={{ letterSpacing: '.16em', color: 'rgba(245,236,215,.35)', animationDelay: '1.3s' }}
      >
        Sede · Guanhanhã · Guanhanhã II
      </p>
    </div>
  )
}
