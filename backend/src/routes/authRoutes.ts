import { Router } from 'express';
import { login, refresh, logout, getMe } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { loginSchema } from '../validators/index.js';

const router = Router();

router.post('/login', validateBody(loginSchema), login);
router.post('/refresh', refresh);
router.post('/logout', authenticateToken, logout);
router.get('/me', authenticateToken, getMe);

export default router;
