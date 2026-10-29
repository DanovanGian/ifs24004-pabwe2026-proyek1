import { prisma } from '../data/db.ts';

export class EventService {
  static async getAllEvents(query?: { search?: string; categoryId?: string; status?: string }) {
    const where: any = {};

    if (query?.status) where.status = query.status;
    if (query?.categoryId) where.categoryId = query.categoryId;
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

  static async createEvent(organizerId: string, data: any) {
    return await prisma.event.create({
      data: {
        organizerId,
        title: data.title,
        description: data.description,
        categoryId: data.categoryId,
        date: new Date(data.date),
        location: data.location,
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

    await prisma.event.delete({ where: { id: eventId } });
    return { success: true };
  }
}
