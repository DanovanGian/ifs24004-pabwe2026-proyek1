import type { Request, Response } from 'express';
import { AuthService } from '../services/auth.service.ts';
import { prisma } from '../data/db.ts';

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { name, email, password, role } = req.body;
      const user = await AuthService.register(name, email, password, role);
      res.status(201).json({ status: 'success', data: user });
    } catch (err: any) {
      res.status(400).json({ status: 'error', message: err.message });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);
      res.json({ status: 'success', data: result });
    } catch (err: any) {
      res.status(401).json({ status: 'error', message: err.message });
    }
  }

  static async getProfile(req: Request, res: Response) {
    try {
      const profile = await AuthService.getProfile(req.user!.id);
      res.json({ status: 'success', data: profile });
    } catch (err: any) {
      res.status(404).json({ status: 'error', message: err.message });
    }
  }

  static async updateProfile(req: Request, res: Response) {
    try {
      const { name, email, avatarUrl, currentPassword, newPassword } = req.body;
      if (!name || name.trim().length < 2) {
        return res.status(400).json({ status: 'error', message: 'Nama minimal 2 karakter' });
      }
      if (!email || !email.includes('@')) {
        return res.status(400).json({ status: 'error', message: 'Format email tidak valid' });
      }

      const updated = await AuthService.updateProfile(req.user!.id, {
        name,
        email,
        avatarUrl: avatarUrl ? avatarUrl.trim() : null,
        currentPassword,
        newPassword,
      });

      res.json({ status: 'success', data: updated, message: 'Profil berhasil diperbarui' });
    } catch (err: any) {
      res.status(400).json({ status: 'error', message: err.message });
    }
  }

  static async getAllUsers(req: Request, res: Response) {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          role: true,
          createdAt: true,
          _count: { select: { events: true, registrations: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
      res.json({ status: 'success', data: users });
    } catch (err: any) {
      res.status(500).json({ status: 'error', message: err.message });
    }
  }

  static async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (id === req.user!.id) {
        return res.status(400).json({ status: 'error', message: 'Anda tidak dapat menghapus akun Anda sendiri' });
      }

      await prisma.$transaction(async (tx) => {
        await tx.ticket.deleteMany({ where: { participantId: id } });
        await tx.registration.deleteMany({ where: { participantId: id } });
        await tx.user.delete({ where: { id } });
      });

      res.json({ status: 'success', message: 'Pengguna berhasil dihapus dari platform' });
    } catch (err: any) {
      res.status(400).json({ status: 'error', message: 'Gagal menghapus pengguna: Pengguna memiliki acara aktif' });
    }
  }
}
