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
}
