import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/hash.ts';

const prisma = new PrismaClient();

async function main() {
  const defaultPassword = await hashPassword('password123');

  // 1. Buat User Demo
  const admin = await prisma.user.upsert({
    where: { email: 'admin@eventify.com' },
    update: {},
    create: {
      name: 'System Administrator',
      email: 'admin@eventify.com',
      passwordHash: defaultPassword,
      role: 'ADMIN',
    },
  });

  const organizer = await prisma.user.upsert({
    where: { email: 'organizer@eventify.com' },
    update: {},
    create: {
      name: 'Tech Events Organizer',
      email: 'organizer@eventify.com',
      passwordHash: defaultPassword,
      role: 'ORGANIZER',
    },
  });

  await prisma.user.upsert({
    where: { email: 'budi@gmail.com' },
    update: {},
    create: {
      name: 'Budi Participant',
      email: 'budi@gmail.com',
      passwordHash: defaultPassword,
      role: 'PARTICIPANT',
    },
  });

  // 2. Buat Kategori
  const cat1 = await prisma.category.upsert({
    where: { slug: 'teknologi-ai' },
    update: {},
    create: { name: 'Teknologi & AI', slug: 'teknologi-ai' },
  });

  await prisma.category.upsert({
    where: { slug: 'musik-konser' },
    update: {},
    create: { name: 'Musik & Konser', slug: 'musik-konser' },
  });

  await prisma.category.upsert({
    where: { slug: 'bisnis-karir' },
    update: {},
    create: { name: 'Bisnis & Karir', slug: 'bisnis-karir' },
  });

  // 3. Buat Acara Awal
  const existingEvent = await prisma.event.findFirst();
  if (!existingEvent) {
    await prisma.event.create({
      data: {
        title: 'Fullstack Modern Summit 2025',
        description: 'Konferensi teknologi modern seputar SvelteKit, Bun, SQLite, dan arsitektur web terkini.',
        categoryId: cat1.id,
        organizerId: organizer.id,
        date: new Date('2025-11-20T09:00:00Z'),
        location: 'Grand Ballroom Jakarta / Hybrid',
        status: 'APPROVED',
        ticketTypes: {
          create: [
            { name: 'Regular Pass', price: 150000, quota: 100, availableQuota: 98 },
            { name: 'VIP Front Row', price: 450000, quota: 20, availableQuota: 19 },
          ],
        },
      },
    });
  }

  console.log('✅ Database SQLite berhasil diisi dengan data awal!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
