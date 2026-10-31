import { Router } from 'express';
import { EventController } from '../controllers/event.controller.ts';
import { requireAuth, requireRole } from '../middleware/auth.middleware.ts';
import { validate } from '../middleware/validate.middleware.ts';
import { createEventSchema, updateEventSchema, updateEventStatusSchema } from '../schemas/event.schema.ts';

const router = Router();

// Rute Kategori
router.get('/categories', EventController.getCategories);
router.post('/categories', requireAuth, requireRole(['ADMIN']), EventController.createCategory);
router.delete('/categories/:id', requireAuth, requireRole(['ADMIN']), EventController.deleteCategory);

// Rute Acara Publik
router.get('/', EventController.getAll);
router.get('/:id', EventController.getById);

// Rute Organizer & Admin
router.get('/:id/participants', requireAuth, requireRole(['ORGANIZER', 'ADMIN']), EventController.getParticipants);
router.post('/', requireAuth, requireRole(['ORGANIZER', 'ADMIN']), validate(createEventSchema), EventController.create);
router.put('/:id', requireAuth, requireRole(['ORGANIZER', 'ADMIN']), validate(updateEventSchema), EventController.update);
router.delete('/:id', requireAuth, EventController.delete);

// Rute Admin
router.patch('/:id/status', requireAuth, requireRole(['ADMIN']), validate(updateEventStatusSchema), EventController.updateStatus);

export default router;
