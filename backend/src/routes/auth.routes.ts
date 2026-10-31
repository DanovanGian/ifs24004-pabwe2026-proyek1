import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.ts';
import { requireAuth, requireRole } from '../middleware/auth.middleware.ts';
import { validate } from '../middleware/validate.middleware.ts';
import { registerSchema, loginSchema } from '../schemas/auth.schema.ts';

const router = Router();

router.post('/register', validate(registerSchema), AuthController.register);
router.post('/login', validate(loginSchema), AuthController.login);

// Khusus Admin
router.get('/users', requireAuth, requireRole(['ADMIN']), AuthController.getAllUsers);
router.delete('/users/:id', requireAuth, requireRole(['ADMIN']), AuthController.deleteUser);

export default router;
