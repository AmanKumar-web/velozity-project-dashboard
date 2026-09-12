import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { AppError } from '../middleware/errorHandler.js';

export const getProjects = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = req.user!;
    let whereClause = {};

    if (user.role === Role.ADMIN) {
      whereClause = {};
    } else if (user.role === Role.PROJECT_MANAGER) {
      // PM sees ONLY their own projects
      whereClause = { pmId: user.id };
    } else if (user.role === Role.DEVELOPER) {
      // Developer sees projects where they have assigned tasks
      whereClause = {
        tasks: {
          some: {
            developerId: user.id,
          },
        },
      };
    }

    const projects = await prisma.project.findMany({
      where: whereClause,
      include: {
        client: { select: { id: true, name: true, company: true } },
        projectManager: { select: { id: true, name: true, email: true } },
        _count: {
          select: { tasks: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Compute task status breakdown for each project
    const projectsWithStats = await Promise.all(
      projects.map(async (p) => {
        const taskCounts = await prisma.task.groupBy({
          by: ['status'],
          where: { projectId: p.id },
          _count: { _all: true },
        });

        const overdueCount = await prisma.task.count({
          where: { projectId: p.id, isOverdue: true },
        });

        const statusMap: Record<string, number> = {
          TODO: 0,
          IN_PROGRESS: 0,
          IN_REVIEW: 0,
          DONE: 0,
        };
        for (const tc of taskCounts) {
          statusMap[tc.status] = tc._count._all;
        }

        return {
          ...p,
          statusBreakdown: statusMap,
          overdueTasksCount: overdueCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: projectsWithStats,
    });
  } catch (error) {
    next(error);
  }
};

export const getProjectById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const user = req.user!;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        client: true,
        projectManager: { select: { id: true, name: true, email: true } },
        tasks: {
          where: user.role === Role.DEVELOPER ? { developerId: user.id } : {},
          include: {
            assignedDeveloper: { select: { id: true, name: true, email: true } },
          },
          orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }],
        },
      },
    });

    if (!project) {
      throw new AppError('Project not found', 404, 'NOT_FOUND');
    }

    // Role ownership check
    if (user.role === Role.PROJECT_MANAGER && project.pmId !== user.id) {
      throw new AppError('Access denied. You cannot view another PM\'s project.', 403, 'FORBIDDEN');
    }

    if (user.role === Role.DEVELOPER) {
      // Must have tasks in this project
      const hasTask = await prisma.task.findFirst({
        where: { projectId: id, developerId: user.id },
      });
      if (!hasTask) {
        throw new AppError('Access denied. You have no tasks in this project.', 403, 'FORBIDDEN');
      }
    }

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

export const createProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = req.user!;
    const { title, description, clientId, pmId } = req.body;

    // PM can only assign themselves as pmId
    const targetPmId = user.role === Role.PROJECT_MANAGER ? user.id : (pmId || user.id);

    const project = await prisma.project.create({
      data: {
        title,
        description,
        clientId,
        pmId: targetPmId,
      },
      include: {
        client: true,
        projectManager: { select: { id: true, name: true, email: true } },
      },
    });

    res.status(201).json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const user = req.user!;
    const { title, description, clientId, pmId } = req.body;

    const existing = await prisma.project.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new AppError('Project not found', 404, 'NOT_FOUND');
    }

    if (user.role === Role.PROJECT_MANAGER && existing.pmId !== user.id) {
      throw new AppError('Access denied. You cannot edit another PM\'s project.', 403, 'FORBIDDEN');
    }

    const updated = await prisma.project.update({
      where: { id },
      data: {
        title,
        description,
        clientId,
        pmId: user.role === Role.PROJECT_MANAGER ? existing.pmId : pmId,
      },
      include: {
        client: true,
        projectManager: { select: { id: true, name: true, email: true } },
      },
    });

    res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};
