import { Router } from 'express';
import { TicketController } from '../controllers/ticket.controller.ts';
import { requireAuth, requireRole } from '../middleware/auth.middleware.ts';
import { validate } from '../middleware/validate.middleware.ts';
import { registrationSchema, paymentSimulateSchema, checkInSchema } from '../schemas/ticket.schema.ts';

const router = Router();

// Pendaftaran & Pembayaran (Peserta)
router.post('/registrations', requireAuth, validate(registrationSchema), TicketController.createRegistration);
router.post('/payments/simulate', requireAuth, validate(paymentSimulateSchema), TicketController.simulatePayment);
router.get('/my-tickets', requireAuth, TicketController.getMyTickets);

// Check-in QR (Organizer & Admin)
router.post('/check-in', requireAuth, requireRole(['ORGANIZER', 'ADMIN']), validate(checkInSchema), TicketController.checkIn);

// Dashboard Metrik Platform
router.get('/dashboard/summary', requireAuth, TicketController.getSummary);

export default router;
