import { Router } from 'express';
import { Role } from '@prisma/client';
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
} from '../controllers/projectController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { createProjectSchema, updateProjectSchema } from '../validators/index.js';

const router = Router();

router.use(authenticateToken);

router.get('/', getProjects);
router.get('/:id', getProjectById);
router.post(
  '/',
  authorizeRoles(Role.ADMIN, Role.PROJECT_MANAGER),
  validateBody(createProjectSchema),
  createProject
);
router.put(
  '/:id',
  authorizeRoles(Role.ADMIN, Role.PROJECT_MANAGER),
  validateBody(updateProjectSchema),
  updateProject
);

export default router;
