import { prisma } from '../data/db.ts';

export class EventService {
  static async getAllEvents(query?: { search?: string; categoryId?: string; status?: string; organizerId?: string }) {
    const where: any = {};

    if (query?.status) where.status = query.status;
    if (query?.categoryId) where.categoryId = query.categoryId;
    if (query?.organizerId) where.organizerId = query.organizerId;
    if (query?.search) {
      where.OR = [
        { title: { contains: query.search } },
        { description: { contains: query.search } },
      ];
    }

    return await prisma.event.findMany({
      where,
      include: { ticketTypes: true, category: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getEventById(id: string) {
    const event = await prisma.event.findUnique({
      where: { id },
      include: { ticketTypes: true, organizer: true, category: true },
    });
    if (!event) throw new Error('Acara tidak ditemukan');
    return event;
  }

  // AMBIL DATA PESERTA UNTUK EKSPOR CSV / LAPORAN
  static async getEventParticipants(eventId: string, userId: string, userRole: string) {
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new Error('Acara tidak ditemukan');

    if (userRole !== 'ADMIN' && event.organizerId !== userId) {
      throw new Error('Anda tidak memiliki izin mengakses data peserta acara ini');
    }

    // Ambil semua tiket yang diterbitkan untuk acara ini beserta data user & tiket
    const tickets = await prisma.ticket.findMany({
      where: { eventId },
      include: {
        participant: true,
        ticketType: true,
        registration: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      eventTitle: event.title,
      participants: tickets.map((t) => ({
        ticketId: t.id,
        participantName: t.participant.name,
        participantEmail: t.participant.email,
        ticketType: t.ticketType.name,
        pricePaid: t.ticketType.price,
        isUsed: t.isUsed,
        checkedInAt: t.checkedInAt ? new Date(t.checkedInAt).toLocaleString('id-ID') : 'Belum Hadir',
        registeredAt: new Date(t.createdAt).toLocaleDateString('id-ID'),
      })),
    };
  }

  static async createEvent(organizerId: string, data: any) {
    return await prisma.event.create({
      data: {
        organizerId,
        title: data.title,
        description: data.description,
        categoryId: data.categoryId,
        date: new Date(data.date),
        location: data.location,
        imageUrl: data.imageUrl || null,
        status: 'PENDING_APPROVAL',
        ticketTypes: {
          create: data.ticketTypes.map((t: any) => ({
            name: t.name,
            price: Number(t.price),
            quota: Number(t.quota),
            availableQuota: Number(t.quota),
          })),
        },
      },
      include: { ticketTypes: true },
    });
  }

  static async updateEvent(eventId: string, userId: string, userRole: string, data: any) {
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new Error('Acara tidak ditemukan');

    if (userRole !== 'ADMIN' && event.organizerId !== userId) {
      throw new Error('Anda tidak memiliki izin mengedit acara ini');
    }

    return await prisma.event.update({
      where: { id: eventId },
      data: {
        title: data.title,
        description: data.description,
        categoryId: data.categoryId,
        date: new Date(data.date),
        location: data.location,
        imageUrl: data.imageUrl || null,
      },
      include: { ticketTypes: true },
    });
  }

  static async updateEventStatus(eventId: string, status: string) {
    return await prisma.event.update({
      where: { id: eventId },
      data: { status },
    });
  }

  static async deleteEvent(eventId: string, userId: string, userRole: string) {
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new Error('Acara tidak ditemukan');

    if (userRole !== 'ADMIN' && event.organizerId !== userId) {
      throw new Error('Anda tidak berhak menghapus acara ini');
    }

    return await prisma.$transaction(async (tx) => {
      await tx.ticket.deleteMany({ where: { eventId } });
      await tx.registration.deleteMany({ where: { eventId } });
      await tx.ticketType.deleteMany({ where: { eventId } });
      await tx.event.delete({ where: { id: eventId } });
      return { success: true };
    });
  }
}
