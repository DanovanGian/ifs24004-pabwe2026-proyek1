import { z } from 'zod';

export const createEventSchema = z.object({
  title: z.string().min(5, 'Judul acara minimal 5 karakter'),
  description: z.string().min(10, 'Deskripsi minimal 10 karakter'),
  categoryId: z.string().min(1, 'Kategori harus dipilih'),
  date: z.string().min(1, 'Tanggal acara harus ditentukan'),
  location: z.string().min(3, 'Lokasi acara harus diisi'),
  ticketTypes: z.array(
    z.object({
      name: z.string().min(2, 'Nama tiket minimal 2 karakter'),
      price: z.number().min(0, 'Harga tiket tidak boleh negatif'),
      quota: z.number().int().min(1, 'Kuota minimal 1'),
    })
  ).min(1, 'Minimal harus ada 1 jenis tiket'),
});

export const updateEventStatusSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
});
