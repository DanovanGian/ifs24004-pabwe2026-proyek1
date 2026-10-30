import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/hash.ts';

const prisma = new PrismaClient();

async function main() {
  const defaultPassword = await hashPassword('password123');

  // 1. Inisialisasi Pengguna Demo
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
      name: 'Tech & Music Organizer',
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

  // 2. Kategori Acara
  const catTech = await prisma.category.upsert({
    where: { slug: 'teknologi-ai' },
    update: {},
    create: { name: 'Teknologi & AI', slug: 'teknologi-ai' },
  });

  const catMusic = await prisma.category.upsert({
    where: { slug: 'musik-konser' },
    update: {},
    create: { name: 'Musik & Konser', slug: 'musik-konser' },
  });

  const catBusiness = await prisma.category.upsert({
    where: { slug: 'bisnis-karir' },
    update: {},
    create: { name: 'Bisnis & Karir', slug: 'bisnis-karir' },
  });

  // 3. Daftar Acara Dummy Realistis
  const mockEvents = [
    {
      title: 'Fullstack Modern Summit 2025',
      description: 'Konferensi teknologi modern seputar SvelteKit, Bun, SQLite, dan arsitektur web desktop berperforma tinggi.',
      categoryId: catTech.id,
      date: new Date('2025-11-20T09:00:00Z'),
      location: 'Grand Ballroom Jakarta / Hybrid',
      status: 'APPROVED',
      ticketTypes: [
        { name: 'Regular Pass', price: 150000, quota: 100, availableQuota: 95 },
        { name: 'VIP Front Row', price: 450000, quota: 25, availableQuota: 20 },
      ],
    },
    {
      title: 'Indie Vibes Fest & Sunset Live',
      description: 'Festival musik indie terbuka menghadirkan deretan musisi lokal terbaik dengan suasana senja dan panggung megah.',
      categoryId: catMusic.id,
      date: new Date('2025-12-05T16:00:00Z'),
      location: 'Amfiteater Delcom Garden',
      status: 'APPROVED',
      ticketTypes: [
        { name: 'Early Bird', price: 75000, quota: 80, availableQuota: 70 },
        { name: 'Festival Standing', price: 120000, quota: 200, availableQuota: 180 },
        { name: 'VIP Lounge Pass', price: 300000, quota: 30, availableQuota: 25 },
      ],
    },
    {
      title: 'AI & Large Language Models Deep Dive',
      description: 'Workshop intensif implementasi AI agents, embeddings, dan integrasi API open-source untuk engineer dan praktisi.',
      categoryId: catTech.id,
      date: new Date('2025-11-28T13:00:00Z'),
      location: 'Auditorium Gedung 7 Delcom',
      status: 'APPROVED',
      ticketTypes: [
        { name: 'Peserta Mahasiswa', price: 50000, quota: 50, availableQuota: 45 },
        { name: 'Peserta Umum & Pro', price: 180000, quota: 40, availableQuota: 38 },
      ],
    },
    {
      title: 'Startup Scaling & Founder Masterclass',
      description: 'Belajar langsung dari para founder startup terkemuka tentang validasi produk, manajemen modal, dan scaling pasar.',
      categoryId: catBusiness.id,
      date: new Date('2025-12-15T10:00:00Z'),
      location: 'Co-Working Space Cyber Tower Lt. 12',
      status: 'APPROVED',
      ticketTypes: [
        { name: 'General Admission', price: 200000, quota: 60, availableQuota: 55 },
        { name: 'Executive Mentoring Pass', price: 650000, quota: 15, availableQuota: 12 },
      ],
    },
    {
      title: 'Acoustic Night & Symphony Orchestra',
      description: 'Malam musikal orkestra klasik berpadu dengan aransemen lagu kontemporer dalam ruangan akustik berkualitas tinggi.',
      categoryId: catMusic.id,
      date: new Date('2026-01-10T19:30:00Z'),
      location: 'Concert Hall Jakarta',
      status: 'APPROVED',
      ticketTypes: [
        { name: 'Balcony Seat', price: 100000, quota: 90, availableQuota: 85 },
        { name: 'Orchestra Center', price: 250000, quota: 50, availableQuota: 40 },
      ],
    },
    {
      title: 'UI/UX Design Systems Workshop 2026',
      description: 'Acara pengajuan baru: Workshop desain antarmuka berbasis Figma token dan atomic design architecture.',
      categoryId: catTech.id,
      date: new Date('2026-02-01T09:00:00Z'),
      location: 'Creative Hub Delcom',
      status: 'PENDING_APPROVAL', // Untuk di-review oleh Admin
      ticketTypes: [
        { name: 'Workshop Pass', price: 90000, quota: 35, availableQuota: 35 },
      ],
    },
  ];

  // Masukkan semua acara ke SQLite
  for (const item of mockEvents) {
    const exists = await prisma.event.findFirst({ where: { title: item.title } });
    if (!exists) {
      await prisma.event.create({
        data: {
          title: item.title,
          description: item.description,
          categoryId: item.categoryId,
          organizerId: organizer.id,
          date: item.date,
          location: item.location,
          status: item.status,
          ticketTypes: {
            create: item.ticketTypes,
          },
        },
      });
    }
  }

  console.log('✅ Berhasil memasukkan 6 acara baru dengan berbagai kategori ke database SQLite!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
