import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { env } from '../config/env.js';
import { prisma } from '../config/prisma.js';
import { AppError } from './errorHandler.js';
import { JwtPayload, AuthUser } from '../types/index.js';

export const authenticateToken = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
      throw new AppError('Authentication token is required', 401, 'UNAUTHORIZED');
    }

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
    } catch (err) {
      throw new AppError('Token expired or invalid', 401, 'INVALID_TOKEN');
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true, role: true },
    });

    if (!user) {
      throw new AppError('User not found or deactivated', 401, 'USER_NOT_FOUND');
    }

    req.user = user as AuthUser;
    next();
  } catch (error) {
    next(error);
  }
};

export const authorizeRoles = (...roles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401, 'UNAUTHORIZED'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `Access denied. Role ${req.user.role} does not have required permissions.`,
          403,
          'FORBIDDEN'
        )
      );
    }

    next();
  };
};

export const authorizeProjectOwnership = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
    }

    // Admins bypass project ownership
    if (user.role === Role.ADMIN) {
      return next();
    }

    const projectId = req.params.projectId || req.params.id;
    if (!projectId) {
      throw new AppError('Project ID parameter missing', 400, 'BAD_REQUEST');
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { pmId: true },
    });

    if (!project) {
      throw new AppError('Project not found', 404, 'NOT_FOUND');
    }

    if (user.role === Role.PROJECT_MANAGER && project.pmId !== user.id) {
      throw new AppError(
        'Access denied. Project Managers can only manage projects they own.',
        403,
        'FORBIDDEN_PROJECT_ACCESS'
      );
    }

    if (user.role === Role.DEVELOPER) {
      // Developers can only view projects if assigned to at least one task in that project
      const hasTask = await prisma.task.findFirst({
        where: { projectId, developerId: user.id },
      });

      if (!hasTask) {
        throw new AppError(
          'Access denied. Developers can only access projects with assigned tasks.',
          403,
          'FORBIDDEN_PROJECT_ACCESS'
        );
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};
