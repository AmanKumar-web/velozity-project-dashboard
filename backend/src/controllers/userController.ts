import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { prisma } from '../config/prisma.js';

export const getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { role } = req.query;

    const users = await prisma.user.findMany({
      where: role ? { role: role as Role } : {},
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { name: 'asc' },
    });

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

export const getClients = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const clients = await prisma.client.findMany({
      orderBy: { name: 'asc' },
    });

    res.status(200).json({
      success: true,
      data: clients,
    });
  } catch (error) {
    next(error);
  }
};
