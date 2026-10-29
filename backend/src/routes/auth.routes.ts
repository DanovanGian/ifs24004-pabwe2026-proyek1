import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.ts';
import { validate } from '../middleware/validate.middleware.ts';
import { registerSchema, loginSchema } from '../schemas/auth.schema.ts';

const router = Router();

router.post('/register', validate(registerSchema), AuthController.register);
router.post('/login', validate(loginSchema), AuthController.login);

export default router;
