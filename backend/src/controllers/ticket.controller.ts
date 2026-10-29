import type { Request, Response } from 'express';
import { TicketService } from '../services/ticket.service.ts';

export class TicketController {
  static async createRegistration(req: Request, res: Response) {
    try {
      const { eventId, ticketTypeId, quantity } = req.body;
      const result = await TicketService.createRegistration(req.user!.id, eventId, ticketTypeId, quantity);
      res.status(201).json({ status: 'success', data: result });
    } catch (err: any) {
      res.status(400).json({ status: 'error', message: err.message });
    }
  }

  static async simulatePayment(req: Request, res: Response) {
    try {
      const { registrationId } = req.body;
      const result = await TicketService.simulatePayment(registrationId, req.user!.id);
      res.json({ status: 'success', data: result });
    } catch (err: any) {
      res.status(400).json({ status: 'error', message: err.message });
    }
  }

  static async getMyTickets(req: Request, res: Response) {
    try {
      const tickets = await TicketService.getMyTickets(req.user!.id);
      res.json({ status: 'success', data: tickets });
    } catch (err: any) {
      res.status(500).json({ status: 'error', message: err.message });
    }
  }

  static async checkIn(req: Request, res: Response) {
    try {
      const { qrToken } = req.body;
      const result = await TicketService.checkIn(qrToken);
      res.json({ status: 'success', data: result });
    } catch (err: any) {
      res.status(409).json({ status: 'error', message: err.message });
    }
  }

  static async getSummary(req: Request, res: Response) {
    try {
      const summary = await TicketService.getDashboardSummary();
      res.json({ status: 'success', data: summary });
    } catch (err: any) {
      res.status(500).json({ status: 'error', message: err.message });
    }
  }
}
