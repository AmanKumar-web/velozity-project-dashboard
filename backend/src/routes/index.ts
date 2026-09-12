import { Router } from 'express';
import authRoutes from './authRoutes.js';
import projectRoutes from './projectRoutes.js';
import taskRoutes from './taskRoutes.js';
import activityRoutes from './activityRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';
import userRoutes from './userRoutes.js';

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/projects', projectRoutes);
apiRouter.use('/tasks', taskRoutes);
apiRouter.use('/activity', activityRoutes);
apiRouter.use('/notifications', notificationRoutes);
apiRouter.use('/dashboard', dashboardRoutes);
apiRouter.use('/users', userRoutes);

export default apiRouter;
