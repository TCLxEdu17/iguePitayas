'use client'

import { useEffect, useRef, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import dynamic from 'next/dynamic'
import { PRODUCT_COLORS } from '@/types'
import { Button } from '@/components/ui/button'
import { getApiUrl } from '@/lib/api-url'

// Dynamically import Konva components to avoid SSR issues
const Stage = dynamic(() => import('react-konva').then(m => m.Stage), { ssr: false })
const Layer = dynamic(() => import('react-konva').then(m => m.Layer), { ssr: false })
const KonvaImage = dynamic(() => import('react-konva').then(m => m.Image), { ssr: false })
const Line = dynamic(() => import('react-konva').then(m => m.Line), { ssr: false })
const Circle = dynamic(() => import('react-konva').then(m => m.Circle), { ssr: false })
const Text = dynamic(() => import('react-konva').then(m => m.Text), { ssr: false })

interface Point { x: number; y: number }

interface PlotData {
  id: string
  code: string
  name: string
  productType: string
  polygon: Point[] | null
}

interface FarmData {
  mapImageUrl?: string | null
  plots: PlotData[]
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
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ polygon }),
  })
  return res.json()
}

export function PlotMap() {
  const queryClient = useQueryClient()
  const containerRef = useRef<HTMLDivElement>(null)
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 })
  const [selectedPlotId, setSelectedPlotId] = useState<string | null>(null)
  const [drawingPoints, setDrawingPoints] = useState<Point[]>([])
  const [isDrawing, setIsDrawing] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const { data: farm } = useQuery({ queryKey: ['farm'], queryFn: fetchFarm })
  const mapImage = useMapImage(farm?.mapImageUrl)

  const saveMutation = useMutation({
    mutationFn: savePlotPolygon,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['farm', 'plots'] }),
  })

  useEffect(() => {
    if (!containerRef.current) return
    const obs = new ResizeObserver(() => {
      if (containerRef.current) {
        setStageSize({
          width:  containerRef.current.offsetWidth,
          height: 600,
        })
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

  if (!mounted) return (
    <div className="h-[600px] rounded-lg bg-muted animate-pulse" />
  )

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap items-center">
        <span className="text-sm text-muted-foreground mr-2">Selecione um talhão para marcar no mapa:</span>
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
            Finalizar ({drawingPoints.length} pontos)
          </Button>
        )}
        {isDrawing && (
          <Button size="sm" variant="outline" onClick={() => { setIsDrawing(false); setDrawingPoints([]) }}>
            Cancelar
          </Button>
        )}
      </div>

      {isDrawing && (
        <p className="text-sm text-muted-foreground">
          Clique no mapa para adicionar vértices do talhão. Mínimo 3 pontos.
        </p>
      )}

      <div
        ref={containerRef}
        className="border rounded-lg overflow-hidden bg-gray-100"
        style={{ height: 600, cursor: isDrawing ? 'crosshair' : 'default' }}
      >
        <Stage
          width={stageSize.width}
          height={stageSize.height}
          onClick={handleStageClick}
        >
          <Layer>
            {mapImage && (
              <KonvaImage
                image={mapImage}
                width={stageSize.width}
                height={stageSize.height}
              />
            )}

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
          </Layer>
        </Stage>
      </div>

      {!farm?.mapImageUrl && (
        <p className="text-sm text-muted-foreground text-center">
          Nenhuma planta carregada ainda. Faça upload em Configurações → Mapa.
        </p>
      )}
    </div>
  )
}
