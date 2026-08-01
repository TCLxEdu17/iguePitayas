'use client'

import { useEffect, useRef, useState } from 'react'
import { Stage, Layer, Group, Image as KonvaImage, Line, Circle, Rect, Text } from 'react-konva'
import { Button } from '@/components/ui/button'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'

const PLOT_PALETTE = [
  '#F4D03F', '#27AE60', '#E67E22', '#E74C3C', '#3498DB',
  '#9B59B6', '#1ABC9C', '#F39C12', '#2ECC71', '#E91E8C',
  '#16A085', '#D35400', '#8E44AD', '#2980B9',
]

function plotColor(index: number) {
  return PLOT_PALETTE[index % PLOT_PALETTE.length]
}

interface Point    { x: number; y: number }
interface PlotData { id: string; code: string; name: string; productType: string | null; polygon: Point[] | null; area?: number | null }

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

function centroid(polygon: Point[]): Point {
  const x = polygon.reduce((s, p) => s + p.x, 0) / polygon.length
  const y = polygon.reduce((s, p) => s + p.y, 0) / polygon.length
  return { x, y }
}

interface Props {
  plots:          PlotData[]
  mapImageUrl?:   string | null
  onSave:         (plotId: string, polygon: Point[]) => void
  saving:         boolean
  onSelectPlot?:  (plotId: string | null) => void
}

export default function KonvaMapInner({ plots, mapImageUrl, onSave, saving, onSelectPlot }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  const initW = typeof window !== 'undefined' ? Math.min(window.innerWidth - 32, 800) : 400
  const initH = initW < 500 ? 360 : 480
  const [stageSize, setStageSize]           = useState({ width: initW, height: initH })
  const [selectedPlotId, setSelectedPlotId] = useState<string | null>(null)
  const [hoveredPlotId, setHoveredPlotId]   = useState<string | null>(null)
  const [drawingPoints, setDrawingPoints]   = useState<Point[]>([])
  const [isDrawing, setIsDrawing]           = useState(false)
  const [drawingPlotId, setDrawingPlotId]   = useState<string | null>(null)

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
    measure()
    const raf = requestAnimationFrame(measure)
    const obs = new ResizeObserver(measure)
    if (containerRef.current) obs.observe(containerRef.current)
    return () => { cancelAnimationFrame(raf); obs.disconnect() }
  }, [])

  function handleStageClick(e: any) {
    if (!isDrawing || !drawingPlotId) return
    const pos = e.target.getStage().getPointerPosition()
    if (pos) setDrawingPoints(prev => [...prev, { x: pos.x, y: pos.y }])
  }

  function finishDrawing() {
    if (!drawingPlotId || drawingPoints.length < 3) return
    const normalized = drawingPoints.map(p => ({
      x: p.x / stageSize.width,
      y: p.y / stageSize.height,
    }))
    onSave(drawingPlotId, normalized)
    setDrawingPoints([])
    setIsDrawing(false)
    setDrawingPlotId(null)
  }

  function startDrawing(plotId: string) {
    setDrawingPlotId(plotId)
    setSelectedPlotId(plotId)
    setDrawingPoints([])
    setIsDrawing(true)
  }

  const autoRects = autoLayout(plots, stageSize.width, stageSize.height)
  const hasImage  = !!mapImageUrl && !!mapImage
  const colorMap  = Object.fromEntries(plots.map((p, i) => [p.id, plotColor(i)]))

  const selectedPlot = plots.find(p => p.id === selectedPlotId)

  return (
    <div className="space-y-3">
      {/* Dropdown de seleção */}
      <div className="flex gap-2 items-center flex-wrap">
        <Select
          value={selectedPlotId ?? '__none__'}
          onValueChange={(v) => {
            const id = v === '__none__' ? null : v
            setSelectedPlotId(id)
            onSelectPlot?.(id)
            setIsDrawing(false)
            setDrawingPoints([])
          }}
        >
          <SelectTrigger className="w-52">
            <SelectValue placeholder="Selecionar talhão..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">— Todos os talhões —</SelectItem>
            {plots.map(p => (
              <SelectItem key={p.id} value={p.id}>
                <span className="flex items-center gap-2">
                  <span
                    className="inline-block w-3 h-3 rounded-sm flex-shrink-0"
                    style={{ backgroundColor: colorMap[p.id] }}
                  />
                  {p.name}
                  {p.area ? ` — ${p.area.toLocaleString('pt-BR')} pés` : ''}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedPlot && (
          <span className="text-sm font-medium" style={{ color: colorMap[selectedPlot.id] }}>
            {selectedPlot.name}
            {selectedPlot.area ? ` · ${selectedPlot.area.toLocaleString('pt-BR')} pés` : ''}
          </span>
        )}

        {selectedPlotId && !isDrawing && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => startDrawing(selectedPlotId)}
            style={{ borderColor: colorMap[selectedPlotId], color: colorMap[selectedPlotId] }}
          >
            Marcar no mapa
          </Button>
        )}

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

      {isDrawing && (
        <p className="text-xs text-muted-foreground">
          Toque no mapa para adicionar vértices (mín. 3 pontos).
        </p>
      )}

      {/* Canvas */}
      <div
        ref={containerRef}
        className="w-full rounded-xl overflow-hidden border"
        style={{
          height: stageSize.height,
          borderColor: '#d1e8d0',
          cursor: isDrawing ? 'crosshair' : 'default',
          backgroundColor: '#e8f5e0',
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
                {plots.length === 0 && (
                  <Text
                    x={stageSize.width / 2 - 120}
                    y={stageSize.height / 2 - 20}
                    text={'Nenhum talhão cadastrado ainda.'}
                    fontSize={13}
                    fill="rgba(60,100,50,0.65)"
                    align="center"
                    width={240}
                  />
                )}
              </>
            )}
          </Layer>

          {/* Auto-layout placeholders */}
          <Layer>
            {plots.map(plot => {
              if (plot.polygon && plot.polygon.length >= 3) return null
              const rect = autoRects[plot.id]
              if (!rect) return null
              const color     = colorMap[plot.id]
              const isSelected = plot.id === selectedPlotId
              return (
                <Group
                  key={plot.id}
                  onClick={() => { if (!isDrawing) { setSelectedPlotId(plot.id); onSelectPlot?.(plot.id) } }}
                  onTap={() => { if (!isDrawing) { setSelectedPlotId(plot.id); onSelectPlot?.(plot.id) } }}
                  onMouseEnter={() => setHoveredPlotId(plot.id)}
                  onMouseLeave={() => setHoveredPlotId(null)}
                >
                  <Rect
                    x={rect.x} y={rect.y} width={rect.w} height={rect.h}
                    fill={isSelected ? color + '66' : color + '33'}
                    stroke={color}
                    strokeWidth={isSelected ? 3 : 2}
                    cornerRadius={6}
                    dash={[6, 3]}
                    shadowColor={isSelected ? color : undefined}
                    shadowBlur={isSelected ? 8 : 0}
                  />
                  <Text x={rect.x + 8} y={rect.y + 8} text={plot.code}
                    fontSize={13} fontStyle="bold" fill={color} />
                  <Text x={rect.x + 8} y={rect.y + 26} text={plot.name}
                    fontSize={9} fill={color + 'cc'} width={rect.w - 16} ellipsis />
                </Group>
              )
            })}
          </Layer>

          {/* Real polygons */}
          <Layer>
            {plots.map(plot => {
              if (!plot.polygon || plot.polygon.length < 3) return null
              const scaled     = plot.polygon.map(p => ({ x: p.x * stageSize.width, y: p.y * stageSize.height }))
              const flat       = scaled.flatMap(p => [p.x, p.y])
              const color      = colorMap[plot.id]
              const isSelected = plot.id === selectedPlotId
              const isHovered  = plot.id === hoveredPlotId
              const center     = centroid(scaled)
              return (
                <Group
                  key={plot.id}
                  onClick={() => { if (!isDrawing) { const id = selectedPlotId === plot.id ? null : plot.id; setSelectedPlotId(id); onSelectPlot?.(id) } }}
                  onTap={() => { if (!isDrawing) { const id = selectedPlotId === plot.id ? null : plot.id; setSelectedPlotId(id); onSelectPlot?.(id) } }}
                  onMouseEnter={() => setHoveredPlotId(plot.id)}
                  onMouseLeave={() => setHoveredPlotId(null)}
                >
                  <Line
                    points={flat}
                    closed
                    fill={isSelected ? color + '88' : isHovered ? color + '66' : color + '44'}
                    stroke={color}
                    strokeWidth={isSelected ? 3 : 2}
                    shadowColor={isSelected ? color : undefined}
                    shadowBlur={isSelected ? 10 : 0}
                  />
                  <Text
                    x={center.x - 40} y={center.y - 10}
                    text={plot.code}
                    fontSize={isSelected ? 14 : 12}
                    fontStyle="bold"
                    fill="white"
                    align="center"
                    width={80}
                    shadowColor="rgba(0,0,0,0.6)"
                    shadowBlur={3}
                    shadowOffsetX={1}
                    shadowOffsetY={1}
                  />
                </Group>
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

      {/* Legenda */}
      {plots.length > 0 && (
        <div className="flex gap-3 flex-wrap text-xs text-muted-foreground">
          {plots.map(plot => {
            const color      = colorMap[plot.id]
            const hasPolygon = plot.polygon && plot.polygon.length >= 3
            const isSelected = plot.id === selectedPlotId
            return (
              <button
                key={plot.id}
                onClick={() => { const id = selectedPlotId === plot.id ? null : plot.id; setSelectedPlotId(id); onSelectPlot?.(id) }}
                className="flex items-center gap-1 hover:opacity-80 transition-opacity"
              >
                <span
                  className="inline-block w-3 h-3 rounded-sm border flex-shrink-0"
                  style={{
                    backgroundColor: color + '44',
                    borderColor: color,
                    outline: isSelected ? `2px solid ${color}` : 'none',
                  }}
                />
                <span style={{ color, fontWeight: isSelected ? 700 : 400 }}>{plot.code}</span>
                <span className="hidden sm:inline">{plot.name}</span>
                {!hasPolygon && <span className="opacity-50">(sem mapa)</span>}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
