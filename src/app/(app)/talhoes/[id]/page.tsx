import TalhaoDetailClient from './TalhaoDetailClient'

export async function generateStaticParams() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? ''
    const res = await fetch(`${apiUrl}/api/plots`)
    if (!res.ok) return []
    const plots: { id: string }[] = await res.json()
    return plots.map((p) => ({ id: p.id }))
  } catch {
    return []
  }
}

export default function TalhaoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return <TalhaoDetailClient params={params} />
}
