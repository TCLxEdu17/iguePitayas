'use client'

import { useEffect, useRef, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import dynamic from 'next/dynamic'
import { PRODUCT_COLORS } from '@/types'
import { Button } from '@/components/ui/button'
import { getApiUrl } from '@/lib/api-url'

const Stage  = dynamic(() => import('react-konva').then(m => m.Stage),  { ssr: false })
const Layer  = dynamic(() => import('react-konva').then(m => m.Layer),  { ssr: false })
const KonvaImage = dynamic(() => import('react-konva').then(m => m.Image), { ssr: false })
const Line   = dynamic(() => import('react-konva').then(m => m.Line),   { ssr: false })
const Circle = dynamic(() => import('react-konva').then(m => m.Circle), { ssr: false })
const Rect   = dynamic(() => import('react-konva').then(m => m.Rect),   { ssr: false })
const Text   = dynamic(() => import('react-konva').then(m => m.Text),   { ssr: false })

interface Point    { x: number; y: number }
interface PlotData { id: string; code: string; name: string; productType: string; polygon: Point[] | null }
interface FarmData { mapImageUrl?: string | null; plots: PlotData[] }

// Auto-layout: place plots that have no polygon in a grid
function autoLayout(plots: PlotData[], stageW: number, stageH: number) {
  const noPolygon = plots.filter(p => !p.polygon || p.polygon.length < 3)
  if (!noPolygon.length) return {}

  const COLS    = Math.min(4, noPolygon.length)
  const PAD     = 48
  const GAP     = 16
  const totalW  = stageW - PAD * 2
  const cellW   = (totalW - GAP * (COLS - 1)) / COLS
  const cellH   = Math.min(120, (stageH - PAD * 2 - 60) / Math.ceil(noPolygon.length / COLS))

  const rects: Record<string, { x: number; y: number; w: number; h: number }> = {}
  noPolygon.forEach((plot, i) => {
    const col = i % COLS
    const row = Math.floor(i / COLS)
    rects[plot.id] = {
      x: PAD + col * (cellW + GAP),
      y: PAD + 50 + row * (cellH + GAP),
      w: cellW,
      h: cellH,
    }
  })
  return rects
}

function useMapImage(url: string | null | undefined) {
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  useEffect(() => {
    if (!url) return
    const img = new window.Image()
    img.src = url
    img.onload = () => setImage(img)
  }, [url])
  return image
}

async function fetchFarm(): Promise<FarmData | null> {
  const res = await fetch(getApiUrl('/api/farm'))
  if (!res.ok) return null
  return res.json()
}

async function savePlotPolygon({ plotId, polygon }: { plotId: string; polygon: Point[] }) {
  const res = await fetch(getApiUrl(`/api/plots/${plotId}`), {
    method:  'PUT',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ polygon }),
  })
  return res.json()
}

export function PlotMap({ siteId }: { siteId?: string } = {}) {
  const queryClient  = useQueryClient()
  const containerRef = useRef<HTMLDivElement>(null)
  const [stageSize, setStageSize]         = useState({ width: 800, height: 560 })
  const [selectedPlotId, setSelectedPlotId] = useState<string | null>(null)
  const [drawingPoints, setDrawingPoints]   = useState<Point[]>([])
  const [isDrawing, setIsDrawing]           = useState(false)
  const [mounted, setMounted]               = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const { data: farm } = useQuery({ queryKey: ['farm'], queryFn: fetchFarm })
  const mapImage = useMapImage(farm?.mapImageUrl)

  const saveMutation = useMutation({
    mutationFn: savePlotPolygon,
    onSuccess:  () => queryClient.invalidateQueries({ queryKey: ['farm', 'plots'] }),
  })

  useEffect(() => {
    if (!containerRef.current) return
    const obs = new ResizeObserver(() => {
      if (containerRef.current) {
        setStageSize({ width: containerRef.current.offsetWidth, height: 560 })
      }
    })
    obs.observe(containerRef.current)
    return () => obs.disconnect()
  }, [])

  function handleStageClick(e: any) {
    if (!isDrawing || !selectedPlotId) return
    const pos = e.target.getStage().getPointerPosition()
    if (pos) setDrawingPoints(prev => [...prev, { x: pos.x, y: pos.y }])
  }

  function finishDrawing() {
    if (!selectedPlotId || drawingPoints.length < 3) return
    saveMutation.mutate({ plotId: selectedPlotId, polygon: drawingPoints })
    setDrawingPoints([])
    setIsDrawing(false)
    setSelectedPlotId(null)
  }

  function startDrawing(plotId: string) {
    setSelectedPlotId(plotId)
    setDrawingPoints([])
    setIsDrawing(true)
  }

  const plots: PlotData[] = farm?.plots ?? []
  const autoRects = mounted ? autoLayout(plots, stageSize.width, stageSize.height) : {}
  const hasImage  = !!farm?.mapImageUrl && !!mapImage

  if (!mounted) return <div className="h-[560px] rounded-xl bg-muted animate-pulse" />

  return (
    <div className="space-y-3">
      {/* Plot selector toolbar */}
      <div className="flex gap-2 flex-wrap items-center">
        <span className="text-xs text-muted-foreground">Marcar no mapa:</span>
        {plots.map(plot => (
          <Button
            key={plot.id}
            size="sm"
            variant={selectedPlotId === plot.id ? 'default' : 'outline'}
            onClick={() => startDrawing(plot.id)}
            style={selectedPlotId === plot.id
              ? { backgroundColor: PRODUCT_COLORS[plot.productType], color: 'white', borderColor: PRODUCT_COLORS[plot.productType] }
              : { borderColor: PRODUCT_COLORS[plot.productType], color: PRODUCT_COLORS[plot.productType] }
            }
          >
            {plot.code}
          </Button>
        ))}
        {isDrawing && drawingPoints.length >= 3 && (
          <Button size="sm" onClick={finishDrawing} style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}>
            ✓ Salvar ({drawingPoints.length} pts)
          </Button>
        )}
        {isDrawing && (
          <Button size="sm" variant="outline" onClick={() => { setIsDrawing(false); setDrawingPoints([]) }}>
            Cancelar
          </Button>
        )}
      </div>

      {isDrawing && (
        <p className="text-xs text-muted-foreground">
          Clique no mapa para adicionar vértices. Mínimo 3 pontos.
        </p>
      )}

      {/* Canvas */}
      <div
        ref={containerRef}
        className="rounded-xl overflow-hidden border"
        style={{ height: 560, cursor: isDrawing ? 'crosshair' : 'default', borderColor: '#d1e8d0' }}
      >
        <Stage width={stageSize.width} height={stageSize.height} onClick={handleStageClick}>
          <Layer>
            {/* Background: image OR fictional field */}
            {hasImage ? (
              <KonvaImage image={mapImage!} width={stageSize.width} height={stageSize.height} />
            ) : (
              <>
                {/* Sky/ground gradient simulation using layered rects */}
                <Rect x={0} y={0} width={stageSize.width} height={stageSize.height} fill="#e8f5e0" />
                {/* Subtle field rows */}
                {Array.from({ length: 14 }).map((_, i) => (
                  <Rect
                    key={i}
                    x={0}
                    y={i * 40}
                    width={stageSize.width}
                    height={20}
                    fill={i % 2 === 0 ? 'rgba(180,220,160,0.18)' : 'rgba(140,190,120,0.12)'}
                  />
                ))}
                {/* Vertical dividers (farm paths) */}
                {Array.from({ length: 5 }).map((_, i) => (
                  <Rect
                    key={i}
                    x={(stageSize.width / 5) * i}
                    y={0}
                    width={1}
                    height={stageSize.height}
                    fill="rgba(120,160,100,0.2)"
                  />
                ))}
                {/* Label */}
                <Text
                  x={12} y={12}
                  text="Mapa fictício — faça upload da planta em Configurações → Mapa"
                  fontSize={10}
                  fill="rgba(80,120,60,0.6)"
                />
              </>
            )}
          </Layer>

          {/* Auto-layout placeholders for plots without polygons */}
          <Layer>
            {plots.map(plot => {
              if (plot.polygon && plot.polygon.length >= 3) return null
              const rect = autoRects[plot.id]
              if (!rect) return null
              const color = PRODUCT_COLORS[plot.productType] ?? '#888'
              return (
                <Layer key={plot.id}>
                  <Rect
                    x={rect.x} y={rect.y}
                    width={rect.w} height={rect.h}
                    fill={color + '33'}
                    stroke={color}
                    strokeWidth={2}
                    cornerRadius={6}
                    dash={[6, 3]}
                  />
                  <Text
                    x={rect.x + 10} y={rect.y + 10}
                    text={plot.code}
                    fontSize={14}
                    fontStyle="bold"
                    fill={color}
                  />
                  <Text
                    x={rect.x + 10} y={rect.y + 28}
                    text={plot.name}
                    fontSize={10}
                    fill={color + 'cc'}
                    width={rect.w - 20}
                    ellipsis
                  />
                </Layer>
              )
            })}
          </Layer>

          {/* Real polygons */}
          <Layer>
            {plots.map(plot => {
              if (!plot.polygon || plot.polygon.length < 3) return null
              const flatPoints = plot.polygon.flatMap(p => [p.x, p.y])
              const color = PRODUCT_COLORS[plot.productType] ?? '#888'
              return (
                <Layer key={plot.id}>
                  <Line
                    points={flatPoints}
                    closed
                    fill={color + '44'}
                    stroke={color}
                    strokeWidth={2}
                  />
                  <Text
                    x={plot.polygon[0].x + 4}
                    y={plot.polygon[0].y + 4}
                    text={plot.code}
                    fontSize={13}
                    fill={color}
                    fontStyle="bold"
                  />
                </Layer>
              )
            })}
          </Layer>

          {/* Drawing in progress */}
          {drawingPoints.length > 0 && (
            <Layer>
              <Line
                points={drawingPoints.flatMap(p => [p.x, p.y])}
                stroke="var(--color-primary)"
                strokeWidth={2}
                dash={[6, 3]}
              />
              {drawingPoints.map((pt, i) => (
                <Circle key={i} x={pt.x} y={pt.y} radius={5} fill="var(--color-primary)" />
              ))}
            </Layer>
          )}
        </Stage>
      </div>

      {/* Legend */}
      {plots.length > 0 && (
        <div className="flex gap-4 flex-wrap text-xs text-muted-foreground">
          {plots.map(plot => {
            const color    = PRODUCT_COLORS[plot.productType] ?? '#888'
            const hasPolygon = plot.polygon && plot.polygon.length >= 3
            return (
              <div key={plot.id} className="flex items-center gap-1.5">
                <span
                  className="inline-block w-3 h-3 rounded-sm border"
                  style={{ backgroundColor: color + '44', borderColor: color }}
                />
                <span style={{ color }}>{plot.code}</span>
                <span>{plot.name}</span>
                {!hasPolygon && <span className="text-muted-foreground/60">(posição auto)</span>}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
