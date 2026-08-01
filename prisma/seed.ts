import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter } as any)

async function main() {
  const fabioHash = await bcrypt.hash('fabioigue', 10)
  const adminHash = await bcrypt.hash('admin123', 10)

  await prisma.farm.upsert({
    where:  { id: 'farm-1' },
    update: {},
    create: { id: 'farm-1', name: 'IGUE Bananas' },
  })

  // ── Sítios ──────────────────────────────────────────────────────────────
  await prisma.site.upsert({
    where:  { id: 'site-sede' },
    update: { name: 'SEDE', mapImageUrl: '/maps/sede.png' },
    create: { id: 'site-sede', name: 'SEDE', mapImageUrl: '/maps/sede.png', farmId: 'farm-1' },
  })
  await prisma.site.upsert({
    where:  { id: 'site-guanhanha' },
    update: { name: 'GUANHANHÃ', mapImageUrl: '/maps/guanhanha.png' },
    create: { id: 'site-guanhanha', name: 'GUANHANHÃ', mapImageUrl: '/maps/guanhanha.png', farmId: 'farm-1' },
  })
  await prisma.site.upsert({
    where:  { id: 'site-guanhanha2' },
    update: { name: 'GUANHANHÃ II', mapImageUrl: '/maps/guanhanha2.png' },
    create: { id: 'site-guanhanha2', name: 'GUANHANHÃ II', mapImageUrl: '/maps/guanhanha2.png', farmId: 'farm-1' },
  })

  // ── Talhões SEDE ────────────────────────────────────────────────────────
  const sedePlots = [
    { id: 'plot-sede-morrao',   code: 'MORRÃO',   name: 'Morrão',   area: 4618 },
    { id: 'plot-sede-lichia',   code: 'LICHIA',   name: 'Lichia',   area: 4487 },
    { id: 'plot-sede-baixada',  code: 'BAIXADA',  name: 'Baixada',  area: 1101 },
    { id: 'plot-sede-represa',  code: 'REPRESA',  name: 'Represa',  area: 3836 },
    { id: 'plot-sede-lixeira',  code: 'LIXEIRA',  name: 'Lixeira',  area: 2217 },
    { id: 'plot-sede-2700',     code: '2.700',    name: '2.700',    area: 2706 },
    { id: 'plot-sede-vino',     code: 'VINO',     name: 'Vino',     area: 2817 },
    { id: 'plot-sede-ourinho',  code: 'OURINHO',  name: 'Ourinho',  area: 1601 },
    { id: 'plot-sede-boi',      code: 'BOI',      name: 'Boi',      area: 2203 },
    { id: 'plot-sede-grotao',   code: 'GROTÃO',   name: 'Grotão',   area: 5165 },
  ]

  for (const p of sedePlots) {
    await prisma.plot.upsert({
      where:  { id: p.id },
      update: { name: p.name, code: p.code, area: p.area },
      create: { ...p, farmId: 'farm-1', siteId: 'site-sede', status: 'ACTIVE' },
    })
  }

  // ── Talhões GUANHANHÃ ───────────────────────────────────────────────────
  const guanhanhaPlots = [
    { id: 'plot-gua-ouro',      code: 'OURO',      name: 'Ouro',      area: 1492 },
    { id: 'plot-gua-feijao',    code: 'FEIJÃO',    name: 'Feijão',    area: 3022 },
    { id: 'plot-gua-porto',     code: 'PORTO',     name: 'Porto',     area: 6310 },
    { id: 'plot-gua-cacau',     code: 'CACAU',     name: 'Cacau',     area: 4242 },
    { id: 'plot-gua-mandiocal', code: 'MANDIOCAL', name: 'Mandiocal', area: 5786 },
  ]

  for (const p of guanhanhaPlots) {
    await prisma.plot.upsert({
      where:  { id: p.id },
      update: { name: p.name, code: p.code, area: p.area },
      create: { ...p, farmId: 'farm-1', siteId: 'site-guanhanha', status: 'ACTIVE' },
    })
  }

  // ── Talhões GUANHANHÃ II ────────────────────────────────────────────────
  const guanhanha2Plots = [
    { id: 'plot-gua2-jangadinha',      code: 'JANGADINHA',      name: 'Jangadinha',      area: 2481 },
    { id: 'plot-gua2-areia-branca',    code: 'AREIA BRANCA',    name: 'Areia Branca',    area: 3814 },
    { id: 'plot-gua2-abelha',          code: 'ABELHA',          name: 'Abelha',          area: 2577 },
    { id: 'plot-gua2-2000',            code: '2.000',           name: '2.000',           area: 1938 },
    { id: 'plot-gua2-pomar',           code: 'POMAR',           name: 'Pomar',           area: 4468 },
    { id: 'plot-gua2-cachorro-do-mato',code: 'CACHORRO DO MATO',name: 'Cachorro do Mato',area: 2819 },
    { id: 'plot-gua2-barracao',        code: 'BARRACÃO',        name: 'Barracão',        area: 3442 },
    { id: 'plot-gua2-ouro',            code: 'OURO',            name: 'Ouro',            area: 3641 },
    { id: 'plot-gua2-rodolfo',         code: 'RODOLFO',         name: 'Rodolfo',         area: 2725 },
    { id: 'plot-gua2-4000',            code: '4.000',           name: '4.000',           area: 3871 },
    { id: 'plot-gua2-nanica',          code: 'NANICA',          name: 'Nanica',          area: 2638 },
    { id: 'plot-gua2-900',             code: '900',             name: '900',             area: 1582 },
  ]

  for (const p of guanhanha2Plots) {
    await prisma.plot.upsert({
      where:  { id: p.id },
      update: { name: p.name, code: p.code, area: p.area },
      create: { ...p, farmId: 'farm-1', siteId: 'site-guanhanha2', status: 'ACTIVE' },
    })
  }

  // ── Usuários ─────────────────────────────────────────────────────────────
  await prisma.user.upsert({
    where:  { email: 'fabioigue@iguebana.com' },
    update: { isPrimaryAdmin: true },
    create: {
      name:           'Fábio',
      email:          'fabioigue@iguebana.com',
      passwordHash:   fabioHash,
      role:           'ADMIN',
      isPrimaryAdmin: true,
    },
  })

  await prisma.user.upsert({
    where:  { email: 'admin@iguebananas.com' },
    update: {},
    create: {
      name:         'Administrador',
      email:        'admin@iguebananas.com',
      passwordHash: adminHash,
      role:         'ADMIN',
    },
  })

  console.log('✓ Seed completo')
  console.log('  Farm: IGUE Bananas')
  console.log('  Sítios: SEDE (10 talhões), GUANHANHÃ (5 talhões), GUANHANHÃ II (12 talhões)')
  console.log('  Admin: fabioigue@iguebana.com / fabioigue')
}

main().finally(() => prisma.$disconnect())
