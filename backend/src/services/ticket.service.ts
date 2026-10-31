import QRCode from 'qrcode';
import { prisma } from '../data/db.ts';

export class TicketService {
  static async createRegistration(participantId: string, eventId: string, ticketTypeId: string, quantity: number) {
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event || event.status !== 'APPROVED') throw new Error('Acara tidak tersedia');

    const ticketType = await prisma.ticketType.findUnique({ where: { id: ticketTypeId } });
    if (!ticketType || ticketType.availableQuota < quantity) {
      throw new Error('Kuota tiket tidak mencukupi');
    }

    const registration = await prisma.registration.create({
      data: {
        participantId,
        eventId,
        ticketTypeId,
        quantity,
        totalPrice: ticketType.price * quantity,
        status: 'PENDING',
      },
    });

    return { registration, ticketType, eventTitle: event.title };
  }

  static async simulatePayment(registrationId: string, userId: string) {
    const reg = await prisma.registration.findUnique({
      where: { id: registrationId },
      include: { ticketType: true, event: true },
    });

    if (!reg) throw new Error('Registrasi tidak ditemukan');
    if (reg.participantId !== userId) throw new Error('Akses tidak sah');
    if (reg.status === 'PAID') throw new Error('Registrasi ini sudah dibayar');

    if (reg.ticketType.availableQuota < reg.quantity) {
      throw new Error('Kuota tiket sudah habis');
    }

    return await prisma.$transaction(async (tx) => {
      await tx.ticketType.update({
        where: { id: reg.ticketTypeId },
        data: { availableQuota: { decrement: reg.quantity } },
      });

      const updatedReg = await tx.registration.update({
        where: { id: reg.id },
        data: { status: 'PAID' },
      });

      const tickets: any[] = [];
      const layout = reg.event.layoutType || 'AUDITORIUM';
      const isVip = reg.ticketType.name.toLowerCase().includes('vip');

      for (let i = 0; i < reg.quantity; i++) {
        const qrToken = `tkn_${crypto.randomUUID()}`;
        
        // Penomoran Kursi Sesuai Denah Venue
        let seatNumber = '';
        const randomNum = Math.floor(Math.random() * 20) + 1;
        if (layout === 'AUDITORIUM') {
          seatNumber = isVip ? `VIP Baris A-0${randomNum}` : `Reguler Baris C-${randomNum}`;
        } else if (layout === 'BALLROOM') {
          seatNumber = isVip ? `Meja Bundar VIP ${Math.floor(Math.random() * 4) + 1}` : `Meja Bundar Reguler ${Math.floor(Math.random() * 8) + 5}`;
        } else {
          // STADIUM (Tennis Indoor Senayan)
          seatNumber = isVip ? `Courtside VIP - C${randomNum}` : `Tribun Barat - Baris ${randomNum}`;
        }

        const ticket = await tx.ticket.create({
          data: {
            registrationId: reg.id,
            participantId: reg.participantId,
            eventId: reg.eventId,
            ticketTypeId: reg.ticketTypeId,
            qrToken,
            seatNumber,
          },
        });
        const qrDataUrl = await QRCode.toDataURL(qrToken);
        tickets.push({ ...ticket, qrDataUrl });
      }

      return { registration: updatedReg, tickets };
    });
  }

  static async getMyTickets(participantId: string) {
    const tickets = await prisma.ticket.findMany({
      where: { participantId },
      include: { event: true, ticketType: true },
      orderBy: { createdAt: 'desc' },
    });

    return await Promise.all(
      tickets.map(async (t) => ({
        ...t,
        qrDataUrl: await QRCode.toDataURL(t.qrToken),
        eventTitle: t.event.title,
        eventDate: t.event.date,
        eventLocation: t.event.location,
        layoutType: t.event.layoutType,
        ticketTypeName: t.ticketType.name,
      }))
    );
  }

  static async checkIn(qrToken: string) {
    const ticket = await prisma.ticket.findUnique({
      where: { qrToken },
      include: { event: true, participant: true },
    });

    if (!ticket) throw new Error('QR Token tidak valid atau tiket tidak ditemukan');
    if (ticket.isUsed) throw new Error(`TIKET SUDAH DIGUNAKAN pada ${ticket.checkedInAt}`);

    const updated = await prisma.ticket.update({
      where: { id: ticket.id },
      data: { isUsed: true, checkedInAt: new Date() },
    });

    return {
      message: 'Check-in berhasil! Selamat datang di acara.',
      ticketId: updated.id,
      participantName: ticket.participant.name,
      eventTitle: ticket.event.title,
      seatNumber: ticket.seatNumber,
      checkedInAt: updated.checkedInAt,
    };
  }

  static async getDashboardSummary() {
    const [totalEvents, totalTicketsSold, totalUsers, paidRegs] = await Promise.all([
      prisma.event.count(),
      prisma.ticket.count(),
      prisma.user.count(),
      prisma.registration.findMany({ where: { status: 'PAID' } }),
    ]);

    const totalRevenue = paidRegs.reduce((sum, r) => sum + r.totalPrice, 0);
    return { totalEvents, totalTicketsSold, totalUsers, totalRevenue };
  }
}
