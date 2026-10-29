import type { Request, Response } from 'express';
import { AuthService } from '../services/auth.service.ts';

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
}
