import type { Request, Response } from 'express';
import { EventService } from '../services/event.service.ts';
import { prisma } from '../data/db.ts';

export class EventController {
  static async getAll(req: Request, res: Response) {
    try {
      const { search, categoryId, status, organizerId } = req.query;
      const events = await EventService.getAllEvents({
        search: search as string,
        categoryId: categoryId as string,
        status: status as string,
        organizerId: organizerId as string,
      });
      res.json({ status: 'success', data: events });
    } catch (err: any) {
      res.status(500).json({ status: 'error', message: err.message });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const event = await EventService.getEventById(req.params.id);
      res.json({ status: 'success', data: event });
    } catch (err: any) {
      res.status(404).json({ status: 'error', message: err.message });
    }
  }

  static async getCategories(req: Request, res: Response) {
    const categories = await prisma.category.findMany();
    res.json({ status: 'success', data: categories });
  }

  static async create(req: Request, res: Response) {
    try {
      const organizerId = req.user!.id;
      const newEvent = await EventService.createEvent(organizerId, req.body);
      res.status(201).json({ status: 'success', data: newEvent });
    } catch (err: any) {
      res.status(400).json({ status: 'error', message: err.message });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const updated = await EventService.updateEvent(req.params.id, req.user!.id, req.user!.role, req.body);
      res.json({ status: 'success', data: updated });
    } catch (err: any) {
      res.status(400).json({ status: 'error', message: err.message });
    }
  }

  static async updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const updated = await EventService.updateEventStatus(id, status);
      res.json({ status: 'success', data: updated });
    } catch (err: any) {
      res.status(400).json({ status: 'error', message: err.message });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      await EventService.deleteEvent(req.params.id, req.user!.id, req.user!.role);
      res.json({ status: 'success', message: 'Acara berhasil dihapus' });
    } catch (err: any) {
      res.status(403).json({ status: 'error', message: err.message });
    }
  }
}
