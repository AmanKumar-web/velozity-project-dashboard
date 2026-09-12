import { Router } from 'express';
import { getUsers, getClients } from '../controllers/userController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/', getUsers);
router.get('/clients', getClients);

export default router;
