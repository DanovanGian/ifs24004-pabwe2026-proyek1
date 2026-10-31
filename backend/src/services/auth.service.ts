import { prisma } from '../data/db.ts';
import { hashPassword, verifyPassword } from '../utils/hash.ts';
import type { UserRole } from '../types/index.ts';

export class AuthService {
  static async register(name: string, email: string, password: string, role: UserRole) {
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      throw new Error('Email sudah terdaftar');
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash,
        role,
      },
    });

    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
  }

  static async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      throw new Error('Email atau password salah');
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      throw new Error('Email atau password salah');
    }

    const { passwordHash: _, ...safeUser } = user;
    const token = Buffer.from(JSON.stringify({ id: user.id, role: user.role })).toString('base64');
    return { user: safeUser, token };
  }

  static async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        role: true,
        createdAt: true,
        _count: { select: { events: true, registrations: true, tickets: true } },
      },
    });

    if (!user) throw new Error('Pengguna tidak ditemukan');
    return user;
  }

  static async updateProfile(userId: string, data: { name: string; email: string; avatarUrl?: string | null; currentPassword?: string; newPassword?: string }) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('Pengguna tidak ditemukan');

    if (data.email.toLowerCase() !== user.email.toLowerCase()) {
      const emailTaken = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
      if (emailTaken) throw new Error('Alamat email sudah digunakan oleh akun lain');
    }

    const updateData: any = {
      name: data.name.trim(),
      email: data.email.toLowerCase().trim(),
      avatarUrl: data.avatarUrl !== undefined ? data.avatarUrl : user.avatarUrl,
    };

    if (data.newPassword && data.newPassword.trim().length > 0) {
      if (!data.currentPassword) {
        throw new Error('Kata sandi saat ini harus diisi untuk mengganti kata sandi baru');
      }

      const isCurrentValid = await verifyPassword(data.currentPassword, user.passwordHash);
      if (!isCurrentValid) {
        throw new Error('Kata sandi saat ini yang Anda masukkan salah');
      }

      if (data.newPassword.length < 6) {
        throw new Error('Kata sandi baru minimal 6 karakter');
      }

      updateData.passwordHash = await hashPassword(data.newPassword);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        role: true,
        createdAt: true,
      },
    });

    return updatedUser;
  }
}
