import pg from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../lib/generated/prisma/client'
import bcrypt from 'bcrypt'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const PILOT_IPTS = [
  { name: 'PSSCM UPM', slug: 'upm', logo_url: '/logos/psscmupm.jpg' },
  { name: 'PSSCM USM', slug: 'usm', logo_url: '/logos/psscmusm.jpg' },
  { name: 'PSSCM UTM', slug: 'utm', logo_url: null },
]

async function main() {
  console.log('Seeding database...')

  for (const iptData of PILOT_IPTS) {
    const ipt = await prisma.ipt.upsert({
      where: { slug: iptData.slug },
      update: { name: iptData.name, logo_url: iptData.logo_url },
      create: { ...iptData, is_active: true },
    })
    console.log(`  IPT: ${ipt.name} (${ipt.slug})`)

    // Create admin user for each IPT
    const adminIc = `00000000000${PILOT_IPTS.indexOf(iptData) + 1}`.slice(-12)
    const passwordHash = await bcrypt.hash('admin123', 10)

    await prisma.user.upsert({
      where: { ipt_id_ic_number: { ipt_id: ipt.id, ic_number: adminIc } },
      update: {},
      create: {
        ipt_id: ipt.id,
        ic_number: adminIc,
        nama: `Admin ${ipt.name}`,
        role: 'admin',
        password_hash: passwordHash,
      },
    })
    console.log(`  Admin: IC ${adminIc} / password: admin123`)
  }

  console.log('Seeding complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
