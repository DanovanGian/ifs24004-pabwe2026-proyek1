import type { Request, Response, NextFunction } from 'express';
import type { UserRole } from '../types/index.ts';

// Menambahkan properti user ke Request Express
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: UserRole;
      };
    }
  }
}

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ status: 'error', message: 'Akses ditolak: Token tidak ditemukan' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ status: 'error', message: 'Token tidak valid atau kedaluwarsa' });
  }
};

export const requireRole = (roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        status: 'error', 
        message: 'Akses terlarang: Anda tidak memiliki izin untuk tindakan ini' 
      });
    }
    next();
  };
};
