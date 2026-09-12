import { Request, Response, NextFunction } from 'express';
import { Role, Prisma } from '@prisma/client';
import { prisma } from '../config/prisma.js';

export const getActivityFeed = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = req.user!;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
    const projectId = req.query.projectId as string | undefined;

    const where: Prisma.ActivityLogWhereInput = {};

    if (user.role === Role.ADMIN) {
      if (projectId) {
        where.projectId = projectId;
      }
    } else if (user.role === Role.PROJECT_MANAGER) {
      // PM sees activities from projects they own
      where.project = {
        pmId: user.id,
      };
      if (projectId) {
        where.projectId = projectId;
      }
    } else if (user.role === Role.DEVELOPER) {
      // Developer sees activity only on tasks assigned to them (or actions they performed)
      where.OR = [
        { task: { developerId: user.id } },
        { userId: user.id },
      ];
      if (projectId) {
        where.projectId = projectId;
      }
    }

    const activities = await prisma.activityLog.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
        task: {
          select: { id: true, title: true, status: true, priority: true },
        },
        project: {
          select: { id: true, title: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    res.status(200).json({
      success: true,
      data: activities,
    });
  } catch (error) {
    next(error);
  }
};
