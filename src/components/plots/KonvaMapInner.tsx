'use client'

import { useEffect, useRef, useState } from 'react'
import { Stage, Layer, Image as KonvaImage, Line, Circle, Rect, Text } from 'react-konva'
import { PRODUCT_COLORS } from '@/types'
import { Button } from '@/components/ui/button'

interface Point    { x: number; y: number }
interface PlotData { id: string; code: string; name: string; productType: string; polygon: Point[] | null }

function autoLayout(plots: PlotData[], stageW: number, stageH: number) {
  const noPolygon = plots.filter(p => !p.polygon || p.polygon.length < 3)
  if (!noPolygon.length) return {}

  const COLS   = Math.min(4, noPolygon.length)
  const PAD    = 36
  const GAP    = 12
  const totalW = stageW - PAD * 2
  const cellW  = (totalW - GAP * (COLS - 1)) / COLS
  const cellH  = Math.min(110, (stageH - PAD * 2 - 50) / Math.ceil(noPolygon.length / COLS))

  const rects: Record<string, { x: number; y: number; w: number; h: number }> = {}
  noPolygon.forEach((plot, i) => {
    const col = i % COLS
    const row = Math.floor(i / COLS)
    rects[plot.id] = {
      x: PAD + col * (cellW + GAP),
      y: PAD + 40 + row * (cellH + GAP),
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
    img.crossOrigin = 'anonymous'
    img.src = url
    img.onload = () => setImage(img)
  }, [url])
  return image
}

interface Props {
  plots:        PlotData[]
  mapImageUrl?: string | null
  onSave:       (plotId: string, polygon: Point[]) => void
  saving:       boolean
}

export default function KonvaMapInner({ plots, mapImageUrl, onSave, saving }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  // Use viewport width as safe initial value so Stage is never 0-wide on mobile
  const initW = typeof window !== 'undefined' ? Math.min(window.innerWidth - 32, 800) : 400
  const initH = initW < 500 ? 360 : 480
  const [stageSize, setStageSize]           = useState({ width: initW, height: initH })
  const [selectedPlotId, setSelectedPlotId] = useState<string | null>(null)
  const [drawingPoints, setDrawingPoints]   = useState<Point[]>([])
  const [isDrawing, setIsDrawing]           = useState(false)

  const mapImage = useMapImage(mapImageUrl)

  useEffect(() => {
    function measure() {
      const el = containerRef.current
      if (!el) return
      const w = el.offsetWidth || el.getBoundingClientRect().width
      if (!w) return
      const h = w < 500 ? 360 : 480
      setStageSize({ width: w, height: h })
    }
    // Try immediately, then after a frame (layout may not be complete yet)
    measure()
    const raf = requestAnimationFrame(measure)
    const obs = new ResizeObserver(measure)
    if (containerRef.current) obs.observe(containerRef.current)
    return () => { cancelAnimationFrame(raf); obs.disconnect() }
  }, [])

  function handleStageClick(e: any) {
    if (!isDrawing || !selectedPlotId) return
    const pos = e.target.getStage().getPointerPosition()
    if (pos) setDrawingPoints(prev => [...prev, { x: pos.x, y: pos.y }])
  }

  function finishDrawing() {
    if (!selectedPlotId || drawingPoints.length < 3) return
    onSave(selectedPlotId, drawingPoints)
    setDrawingPoints([])
    setIsDrawing(false)
    setSelectedPlotId(null)
  }

  function startDrawing(plotId: string) {
    setSelectedPlotId(plotId)
    setDrawingPoints([])
    setIsDrawing(true)
  }

  const autoRects = autoLayout(plots, stageSize.width, stageSize.height)
  const hasImage  = !!mapImageUrl && !!mapImage

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      {plots.length > 0 && (
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
            <Button size="sm" onClick={finishDrawing} disabled={saving}
              style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}>
              ✓ Salvar
            </Button>
          )}
          {isDrawing && (
            <Button size="sm" variant="outline" onClick={() => { setIsDrawing(false); setDrawingPoints([]) }}>
              Cancelar
            </Button>
          )}
        </div>
      )}

      {isDrawing && (
        <p className="text-xs text-muted-foreground">
          Toque no mapa para adicionar vértices (mín. 3 pontos).
        </p>
      )}

      {/* Canvas container — explicit height so canvas is always visible */}
      <div
        ref={containerRef}
        className="w-full rounded-xl overflow-hidden border"
        style={{
          height: stageSize.height,
          borderColor: '#d1e8d0',
          cursor: isDrawing ? 'crosshair' : 'default',
          backgroundColor: '#e8f5e0', // fallback color while Konva loads
        }}
      >
        <Stage
          width={stageSize.width}
          height={stageSize.height}
          onClick={handleStageClick}
          onTap={handleStageClick}
        >
          {/* Background */}
          <Layer>
            {hasImage ? (
              <KonvaImage image={mapImage!} width={stageSize.width} height={stageSize.height} />
            ) : (
              <>
                <Rect x={0} y={0} width={stageSize.width} height={stageSize.height} fill="#e8f5e0" />
                {Array.from({ length: 14 }).map((_, i) => (
                  <Rect key={i} x={0} y={i * 40} width={stageSize.width} height={20}
                    fill={i % 2 === 0 ? 'rgba(180,220,160,0.22)' : 'rgba(140,190,120,0.14)'} />
                ))}
                {Array.from({ length: 6 }).map((_, i) => (
                  <Rect key={i} x={(stageSize.width / 6) * i} y={0} width={1} height={stageSize.height}
                    fill="rgba(120,160,100,0.18)" />
                ))}
                {plots.length === 0 && (
                  <Text
                    x={stageSize.width / 2 - 120}
                    y={stageSize.height / 2 - 20}
                    text={'Nenhum talhão cadastrado ainda.\nCadastre talhões em Talhões → Novo Talhão.'}
                    fontSize={13}
                    fill="rgba(60,100,50,0.65)"
                    align="center"
                    width={240}
                  />
                )}
                <Text x={10} y={8}
                  text="Sem imagem — faça upload em Configurações → Mapa"
                  fontSize={9} fill="rgba(80,120,60,0.45)" />
              </>
            )}
          </Layer>

          {/* Auto-layout placeholders */}
          <Layer>
            {plots.map(plot => {
              if (plot.polygon && plot.polygon.length >= 3) return null
              const rect = autoRects[plot.id]
              if (!rect) return null
              const color = PRODUCT_COLORS[plot.productType] ?? '#888'
              return (
                <Layer key={plot.id}>
                  <Rect x={rect.x} y={rect.y} width={rect.w} height={rect.h}
                    fill={color + '33'} stroke={color} strokeWidth={2}
                    cornerRadius={6} dash={[6, 3]} />
                  <Text x={rect.x + 8} y={rect.y + 8} text={plot.code}
                    fontSize={13} fontStyle="bold" fill={color} />
                  <Text x={rect.x + 8} y={rect.y + 26} text={plot.name}
                    fontSize={9} fill={color + 'cc'} width={rect.w - 16} ellipsis />
                </Layer>
              )
            })}
          </Layer>

          {/* Real polygons */}
          <Layer>
            {plots.map(plot => {
              if (!plot.polygon || plot.polygon.length < 3) return null
              const flat  = plot.polygon.flatMap(p => [p.x, p.y])
              const color = PRODUCT_COLORS[plot.productType] ?? '#888'
              return (
                <Layer key={plot.id}>
                  <Line points={flat} closed fill={color + '44'} stroke={color} strokeWidth={2} />
                  <Text x={plot.polygon[0].x + 4} y={plot.polygon[0].y + 4}
                    text={plot.code} fontSize={12} fill={color} fontStyle="bold" />
                </Layer>
              )
            })}
          </Layer>

          {/* Drawing in progress */}
          {drawingPoints.length > 0 && (
            <Layer>
              <Line points={drawingPoints.flatMap(p => [p.x, p.y])}
                stroke="var(--color-primary)" strokeWidth={2} dash={[6, 3]} />
              {drawingPoints.map((pt, i) => (
                <Circle key={i} x={pt.x} y={pt.y} radius={5} fill="var(--color-primary)" />
              ))}
            </Layer>
          )}
        </Stage>
      </div>

      {/* Legend */}
      {plots.length > 0 && (
        <div className="flex gap-3 flex-wrap text-xs text-muted-foreground">
          {plots.map(plot => {
            const color      = PRODUCT_COLORS[plot.productType] ?? '#888'
            const hasPolygon = plot.polygon && plot.polygon.length >= 3
            return (
              <div key={plot.id} className="flex items-center gap-1">
                <span className="inline-block w-3 h-3 rounded-sm border flex-shrink-0"
                  style={{ backgroundColor: color + '44', borderColor: color }} />
                <span style={{ color }}>{plot.code}</span>
                <span className="hidden sm:inline">{plot.name}</span>
                {!hasPolygon && <span className="opacity-50">(auto)</span>}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
