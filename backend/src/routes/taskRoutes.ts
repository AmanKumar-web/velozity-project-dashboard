import { Router } from 'express';
import { Role } from '@prisma/client';
import { getTasks, createTask, updateTask } from '../controllers/taskController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { validateBody, validateQuery } from '../middleware/validate.js';
import { createTaskSchema, updateTaskSchema, taskFilterSchema } from '../validators/index.js';

const router = Router();

router.use(authenticateToken);

router.get('/', validateQuery(taskFilterSchema), getTasks);

router.post(
  '/',
  authorizeRoles(Role.ADMIN, Role.PROJECT_MANAGER),
  validateBody(createTaskSchema),
  createTask
);

// Both Admins, PMs, and Developers can call PATCH /:id
// Row-level authorization logic inside updateTask enforces that Developers can ONLY modify status on assigned tasks
router.patch('/:id', validateBody(updateTaskSchema), updateTask);

export default router;
