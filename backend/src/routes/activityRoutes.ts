import { Router } from 'express';
import { getActivityFeed } from '../controllers/activityController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/feed', getActivityFeed);

export default router;
