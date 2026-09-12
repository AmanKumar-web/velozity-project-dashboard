import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { env } from '../config/env.js';
import { prisma } from '../config/prisma.js';
import { SOCKET_ROOMS, SOCKET_EVENTS } from '../constants/index.js';
import { JwtPayload, AuthUser } from '../types/index.js';
import { addOnlineUser, removeOnlineUser, broadcastPresence } from './presence.js';

let ioInstance: Server | null = null;

export const initSocket = (httpServer: HttpServer): Server => {
  const io = new Server(httpServer, {
    cors: {
      origin: env.CLIENT_URL,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    },
    transports: ['websocket'], // Strictly WebSocket per specification
  });

  ioInstance = io;

  // Socket Authentication Middleware via Handshake
  io.use(async (socket: Socket, next) => {
    try {
      const authHeader = socket.handshake.auth.token || socket.handshake.headers.authorization;
      const token =
        authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')
          ? authHeader.split(' ')[1]
          : authHeader;

      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, email: true, name: true, role: true },
      });

      if (!user) {
        return next(new Error('User not found or deactivated'));
      }

      socket.data.user = user as AuthUser;
      next();
    } catch (err) {
      next(new Error('Invalid socket authentication token'));
    }
  });

  io.on('connection', async (socket: Socket) => {
    const user = socket.data.user as AuthUser;
    console.log(`🔌 [Socket] Connected: ${user.name} (${user.role}) [socketId: ${socket.id}]`);

    // 1. Join user-specific notification room
    socket.join(SOCKET_ROOMS.user(user.id));

    // 2. Role-specific initial room subscription
    if (user.role === Role.ADMIN) {
      socket.join(SOCKET_ROOMS.ADMIN_GLOBAL);
      // Immediately send current presence count to newly connected Admin
      broadcastPresence(io);
    } else if (user.role === Role.PROJECT_MANAGER) {
      // Auto-join all projects managed by this PM
      const pmProjects = await prisma.project.findMany({
        where: { pmId: user.id },
        select: { id: true },
      });
      for (const p of pmProjects) {
        socket.join(SOCKET_ROOMS.project(p.id));
      }
    } else if (user.role === Role.DEVELOPER) {
      // Auto-join projects where developer is assigned tasks
      const devTasks = await prisma.task.findMany({
        where: { developerId: user.id },
        select: { projectId: true },
        distinct: ['projectId'],
      });
      for (const t of devTasks) {
        socket.join(SOCKET_ROOMS.project(t.projectId));
      }
    }

    // 3. Register presence
    addOnlineUser(io, user.id, socket.id);

    // Dynamic join project room event with access verification
    socket.on(SOCKET_EVENTS.JOIN_PROJECT, async (projectId: string) => {
      if (!projectId) return;

      if (user.role === Role.ADMIN) {
        socket.join(SOCKET_ROOMS.project(projectId));
        return;
      }

      if (user.role === Role.PROJECT_MANAGER) {
        const project = await prisma.project.findFirst({
          where: { id: projectId, pmId: user.id },
        });
        if (project) {
          socket.join(SOCKET_ROOMS.project(projectId));
        }
        return;
      }

      if (user.role === Role.DEVELOPER) {
        const assigned = await prisma.task.findFirst({
          where: { projectId, developerId: user.id },
        });
        if (assigned) {
          socket.join(SOCKET_ROOMS.project(projectId));
        }
      }
    });

    socket.on(SOCKET_EVENTS.LEAVE_PROJECT, (projectId: string) => {
      if (projectId) {
        socket.leave(SOCKET_ROOMS.project(projectId));
      }
    });

    socket.on('disconnect', () => {
      console.log(`🔌 [Socket] Disconnected: ${user.name} [socketId: ${socket.id}]`);
      removeOnlineUser(io, user.id, socket.id);
    });
  });

  return io;
};

export const getIO = (): Server => {
  if (!ioInstance) {
    throw new Error('Socket.io has not been initialized. Call initSocket first.');
  }
  return ioInstance;
};
