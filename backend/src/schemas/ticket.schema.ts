import { z } from 'zod';

export const registrationSchema = z.object({
  eventId: z.string().min(1, 'ID acara wajib diisi'),
  ticketTypeId: z.string().min(1, 'ID tipe tiket wajib diisi'),
  quantity: z.number().int().min(1, 'Jumlah tiket minimal 1'),
});

export const paymentSimulateSchema = z.object({
  registrationId: z.string().min(1, 'ID registrasi wajib disertakan'),
});

export const checkInSchema = z.object({
  qrToken: z.string().min(1, 'Token QR wajib disertakan'),
});
