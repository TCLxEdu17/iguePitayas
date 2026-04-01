import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter } as any)

async function main() {
  const fabioHash = await bcrypt.hash('fabioigue', 10)
  const adminHash = await bcrypt.hash('admin123', 10)

  const farm = await prisma.farm.upsert({
    where:  { id: 'farm-1' },
    update: {},
    create: { id: 'farm-1', name: 'IGUE Bananas' },
  })

  // Sítios
  await prisma.site.upsert({
    where:  { id: 'site-1' },
    update: {},
    create: { id: 'site-1', name: 'Sítio 1', farmId: 'farm-1' },
  })
  await prisma.site.upsert({
    where:  { id: 'site-2' },
    update: {},
    create: { id: 'site-2', name: 'Sítio 2', farmId: 'farm-1' },
  })
  await prisma.site.upsert({
    where:  { id: 'site-3' },
    update: {},
    create: { id: 'site-3', name: 'Sítio 3', farmId: 'farm-1' },
  })

  // Admin principal Fábio
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

  // Admin legado (mantido para compatibilidade)
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

  console.log('Seed completo. Farm:', farm.name)
  console.log('Sítios: Sítio 1, Sítio 2, Sítio 3')
  console.log('Admin principal: fabioigue@iguebana.com / fabioigue')
}

main().finally(() => prisma.$disconnect())
