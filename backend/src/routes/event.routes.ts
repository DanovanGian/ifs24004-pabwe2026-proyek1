import { Router } from 'express';
import { EventController } from '../controllers/event.controller.ts';
import { requireAuth, requireRole } from '../middleware/auth.middleware.ts';
import { validate } from '../middleware/validate.middleware.ts';
import { createEventSchema, updateEventStatusSchema } from '../schemas/event.schema.ts';

const router = Router();

// Rute Publik (Pengunjung)
router.get('/categories', EventController.getCategories);
router.get('/', EventController.getAll);
router.get('/:id', EventController.getById);

// Rute Khusus Organizer
router.post('/', requireAuth, requireRole(['ORGANIZER', 'ADMIN']), validate(createEventSchema), EventController.create);
router.delete('/:id', requireAuth, EventController.delete);

// Rute Khusus Admin (Moderasi Acara)
router.patch('/:id/status', requireAuth, requireRole(['ADMIN']), validate(updateEventStatusSchema), EventController.updateStatus);

export default router;
