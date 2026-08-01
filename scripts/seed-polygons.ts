import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const polygons: Array<{ id: string; polygon: Array<{ x: number; y: number }> }> = [
  // SEDE
  {
    id: 'plot-sede-morrao',
    polygon: [
      { x: 0.03, y: 0.22 }, { x: 0.20, y: 0.18 }, { x: 0.25, y: 0.25 },
      { x: 0.28, y: 0.38 }, { x: 0.25, y: 0.55 }, { x: 0.20, y: 0.72 },
      { x: 0.12, y: 0.75 }, { x: 0.05, y: 0.65 }, { x: 0.02, y: 0.48 },
    ],
  },
  {
    id: 'plot-sede-baixada',
    polygon: [
      { x: 0.23, y: 0.18 }, { x: 0.37, y: 0.15 }, { x: 0.40, y: 0.22 },
      { x: 0.38, y: 0.35 }, { x: 0.28, y: 0.38 }, { x: 0.23, y: 0.30 },
    ],
  },
  {
    id: 'plot-sede-lichia',
    polygon: [
      { x: 0.18, y: 0.50 }, { x: 0.28, y: 0.42 }, { x: 0.38, y: 0.42 },
      { x: 0.46, y: 0.50 }, { x: 0.46, y: 0.65 }, { x: 0.38, y: 0.75 },
      { x: 0.26, y: 0.78 }, { x: 0.16, y: 0.70 },
    ],
  },
  {
    id: 'plot-sede-represa',
    polygon: [
      { x: 0.30, y: 0.38 }, { x: 0.46, y: 0.35 }, { x: 0.54, y: 0.42 },
      { x: 0.54, y: 0.60 }, { x: 0.46, y: 0.68 }, { x: 0.36, y: 0.68 },
      { x: 0.28, y: 0.58 },
    ],
  },
  {
    id: 'plot-sede-lixeira',
    polygon: [
      { x: 0.37, y: 0.15 }, { x: 0.62, y: 0.14 }, { x: 0.68, y: 0.20 },
      { x: 0.65, y: 0.32 }, { x: 0.48, y: 0.35 }, { x: 0.38, y: 0.30 },
      { x: 0.36, y: 0.22 },
    ],
  },
  {
    id: 'plot-sede-2700',
    polygon: [
      { x: 0.54, y: 0.33 }, { x: 0.65, y: 0.30 }, { x: 0.73, y: 0.35 },
      { x: 0.73, y: 0.52 }, { x: 0.65, y: 0.55 }, { x: 0.54, y: 0.52 },
    ],
  },
  {
    id: 'plot-sede-vino',
    polygon: [
      { x: 0.65, y: 0.30 }, { x: 0.80, y: 0.28 }, { x: 0.88, y: 0.33 },
      { x: 0.88, y: 0.53 }, { x: 0.80, y: 0.58 }, { x: 0.68, y: 0.55 },
      { x: 0.65, y: 0.48 },
    ],
  },
  {
    id: 'plot-sede-ourinho',
    polygon: [
      { x: 0.68, y: 0.15 }, { x: 0.82, y: 0.13 }, { x: 0.88, y: 0.20 },
      { x: 0.88, y: 0.32 }, { x: 0.80, y: 0.32 }, { x: 0.68, y: 0.28 },
    ],
  },
  {
    id: 'plot-sede-boi',
    polygon: [
      { x: 0.83, y: 0.13 }, { x: 0.96, y: 0.15 }, { x: 0.97, y: 0.42 },
      { x: 0.90, y: 0.50 }, { x: 0.82, y: 0.45 }, { x: 0.80, y: 0.32 },
      { x: 0.82, y: 0.20 },
    ],
  },
  {
    id: 'plot-sede-grotao',
    polygon: [
      { x: 0.82, y: 0.52 }, { x: 0.90, y: 0.48 }, { x: 0.97, y: 0.52 },
      { x: 0.97, y: 0.90 }, { x: 0.88, y: 0.95 }, { x: 0.80, y: 0.88 },
      { x: 0.78, y: 0.70 },
    ],
  },

  // GUANHANHÃ
  {
    id: 'plot-gua-ouro',
    polygon: [
      { x: 0.04, y: 0.55 }, { x: 0.14, y: 0.50 }, { x: 0.20, y: 0.55 },
      { x: 0.18, y: 0.70 }, { x: 0.12, y: 0.75 }, { x: 0.04, y: 0.68 },
    ],
  },
  {
    id: 'plot-gua-feijao',
    polygon: [
      { x: 0.28, y: 0.22 }, { x: 0.42, y: 0.18 }, { x: 0.48, y: 0.35 },
      { x: 0.48, y: 0.65 }, { x: 0.40, y: 0.72 }, { x: 0.30, y: 0.68 },
      { x: 0.22, y: 0.55 }, { x: 0.22, y: 0.40 },
    ],
  },
  {
    id: 'plot-gua-porto',
    polygon: [
      { x: 0.38, y: 0.14 }, { x: 0.56, y: 0.12 }, { x: 0.62, y: 0.18 },
      { x: 0.65, y: 0.32 }, { x: 0.62, y: 0.55 }, { x: 0.55, y: 0.62 },
      { x: 0.48, y: 0.55 }, { x: 0.46, y: 0.38 }, { x: 0.38, y: 0.30 },
    ],
  },
  {
    id: 'plot-gua-cacau',
    polygon: [
      { x: 0.35, y: 0.58 }, { x: 0.48, y: 0.55 }, { x: 0.56, y: 0.60 },
      { x: 0.56, y: 0.82 }, { x: 0.48, y: 0.90 }, { x: 0.38, y: 0.88 },
      { x: 0.30, y: 0.80 }, { x: 0.30, y: 0.65 },
    ],
  },
  {
    id: 'plot-gua-mandiocal',
    polygon: [
      { x: 0.58, y: 0.38 }, { x: 0.78, y: 0.35 }, { x: 0.88, y: 0.42 },
      { x: 0.88, y: 0.68 }, { x: 0.80, y: 0.75 }, { x: 0.65, y: 0.70 },
      { x: 0.58, y: 0.60 },
    ],
  },

  // GUANHANHÃ II
  {
    id: 'plot-gua2-cachorro-do-mato',
    polygon: [
      { x: 0.38, y: 0.05 }, { x: 0.62, y: 0.05 }, { x: 0.68, y: 0.15 },
      { x: 0.62, y: 0.30 }, { x: 0.48, y: 0.32 }, { x: 0.38, y: 0.22 },
    ],
  },
  {
    id: 'plot-gua2-jangadinha',
    polygon: [
      { x: 0.15, y: 0.10 }, { x: 0.38, y: 0.08 }, { x: 0.42, y: 0.15 },
      { x: 0.40, y: 0.30 }, { x: 0.30, y: 0.35 }, { x: 0.18, y: 0.30 },
      { x: 0.12, y: 0.22 },
    ],
  },
  {
    id: 'plot-gua2-pomar',
    polygon: [
      { x: 0.38, y: 0.22 }, { x: 0.55, y: 0.20 }, { x: 0.65, y: 0.28 },
      { x: 0.65, y: 0.52 }, { x: 0.55, y: 0.55 }, { x: 0.40, y: 0.52 },
      { x: 0.35, y: 0.40 },
    ],
  },
  {
    id: 'plot-gua2-areia-branca',
    polygon: [
      { x: 0.08, y: 0.25 }, { x: 0.28, y: 0.22 }, { x: 0.35, y: 0.35 },
      { x: 0.35, y: 0.52 }, { x: 0.25, y: 0.58 }, { x: 0.12, y: 0.55 },
      { x: 0.06, y: 0.42 },
    ],
  },
  {
    id: 'plot-gua2-2000',
    polygon: [
      { x: 0.30, y: 0.30 }, { x: 0.42, y: 0.28 }, { x: 0.48, y: 0.38 },
      { x: 0.45, y: 0.55 }, { x: 0.35, y: 0.58 }, { x: 0.28, y: 0.52 },
      { x: 0.28, y: 0.40 },
    ],
  },
  {
    id: 'plot-gua2-abelha',
    polygon: [
      { x: 0.08, y: 0.48 }, { x: 0.22, y: 0.45 }, { x: 0.30, y: 0.55 },
      { x: 0.28, y: 0.68 }, { x: 0.20, y: 0.75 }, { x: 0.10, y: 0.72 },
      { x: 0.04, y: 0.62 },
    ],
  },
  {
    id: 'plot-gua2-4000',
    polygon: [
      { x: 0.38, y: 0.45 }, { x: 0.55, y: 0.42 }, { x: 0.62, y: 0.52 },
      { x: 0.60, y: 0.68 }, { x: 0.48, y: 0.72 }, { x: 0.38, y: 0.68 },
      { x: 0.34, y: 0.58 },
    ],
  },
  {
    id: 'plot-gua2-barracao',
    polygon: [
      { x: 0.62, y: 0.30 }, { x: 0.78, y: 0.28 }, { x: 0.85, y: 0.38 },
      { x: 0.85, y: 0.60 }, { x: 0.75, y: 0.65 }, { x: 0.62, y: 0.58 },
      { x: 0.60, y: 0.45 },
    ],
  },
  {
    id: 'plot-gua2-ouro',
    polygon: [
      { x: 0.68, y: 0.10 }, { x: 0.88, y: 0.10 }, { x: 0.92, y: 0.25 },
      { x: 0.88, y: 0.40 }, { x: 0.75, y: 0.42 }, { x: 0.65, y: 0.35 },
      { x: 0.65, y: 0.20 },
    ],
  },
  {
    id: 'plot-gua2-nanica',
    polygon: [
      { x: 0.52, y: 0.58 }, { x: 0.68, y: 0.55 }, { x: 0.75, y: 0.65 },
      { x: 0.72, y: 0.78 }, { x: 0.60, y: 0.82 }, { x: 0.50, y: 0.78 },
      { x: 0.48, y: 0.65 },
    ],
  },
  {
    id: 'plot-gua2-rodolfo',
    polygon: [
      { x: 0.20, y: 0.62 }, { x: 0.35, y: 0.60 }, { x: 0.42, y: 0.72 },
      { x: 0.38, y: 0.85 }, { x: 0.28, y: 0.90 }, { x: 0.18, y: 0.85 },
      { x: 0.14, y: 0.72 },
    ],
  },
  {
    id: 'plot-gua2-900',
    polygon: [
      { x: 0.38, y: 0.82 }, { x: 0.50, y: 0.80 }, { x: 0.55, y: 0.88 },
      { x: 0.50, y: 0.95 }, { x: 0.40, y: 0.97 }, { x: 0.35, y: 0.90 },
    ],
  },
]

async function main() {
  console.log(`Seeding ${polygons.length} plot polygons...`)
  let updated = 0
  let notFound = 0

  for (const { id, polygon } of polygons) {
    const existing = await prisma.plot.findUnique({ where: { id } })
    if (!existing) {
      console.warn(`  NOT FOUND: ${id}`)
      notFound++
      continue
    }
    await prisma.plot.update({
      where: { id },
      data: { polygon: polygon as any },
    })
    console.log(`  Updated: ${id} (${polygon.length} points)`)
    updated++
  }

  console.log(`\nDone. Updated: ${updated}, Not found: ${notFound}`)
}

main()
  .catch(err => { console.error(err); process.exit(1) })
  .finally(() => prisma.$disconnect())
