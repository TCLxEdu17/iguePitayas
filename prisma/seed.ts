import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter } as any)

async function main() {
  const hash = await bcrypt.hash('admin123', 10)

  const farm = await prisma.farm.upsert({
    where:  { id: 'farm-1' },
    update: {},
    create: { id: 'farm-1', name: 'IGUE Bananas' },
  })

  await prisma.user.upsert({
    where:  { email: 'admin@iguebananas.com' },
    update: {},
    create: {
      name:         'Administrador',
      email:        'admin@iguebananas.com',
      passwordHash: hash,
      role:         'ADMIN',
    },
  })

  console.log('Seed completo. Farm:', farm.name)
}

main().finally(() => prisma.$disconnect())
