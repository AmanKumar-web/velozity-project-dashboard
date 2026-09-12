import { getIO } from './index.js';
import { SOCKET_ROOMS, SOCKET_EVENTS } from '../constants/index.js';
import { prisma } from '../config/prisma.js';

export const emitTaskUpdate = (projectId: string, task: any): void => {
  try {
    const io = getIO();
    // 1. Broadcast to everyone viewing this project
    io.to(SOCKET_ROOMS.project(projectId)).emit(SOCKET_EVENTS.TASK_UPDATED, task);
    // 2. Broadcast to Admin global stream
    io.to(SOCKET_ROOMS.ADMIN_GLOBAL).emit(SOCKET_EVENTS.TASK_UPDATED, task);
  } catch (err) {
    console.error('Failed to emit task update:', err);
  }
};

export const emitActivity = (projectId: string, activity: any, developerId?: string | null): void => {
  try {
    const io = getIO();
    // 1. Project room (all viewers of this project)
    io.to(SOCKET_ROOMS.project(projectId)).emit(SOCKET_EVENTS.ACTIVITY_NEW, activity);
    // 2. Admin global room
    io.to(SOCKET_ROOMS.ADMIN_GLOBAL).emit(SOCKET_EVENTS.ACTIVITY_NEW, activity);
    // 3. Direct developer room if assigned
    if (developerId) {
      io.to(SOCKET_ROOMS.user(developerId)).emit(SOCKET_EVENTS.ACTIVITY_NEW, activity);
    }
  } catch (err) {
    console.error('Failed to emit activity:', err);
  }
};

export const createAndEmitNotification = async (
  userId: string,
  message: string
): Promise<any> => {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        message,
        isRead: false,
      },
    });

    const unreadCount = await prisma.notification.count({
      where: { userId, isRead: false },
    });

    const io = getIO();
    io.to(SOCKET_ROOMS.user(userId)).emit(SOCKET_EVENTS.NOTIFICATION_NEW, {
      notification,
      unreadCount,
    });

    return notification;
  } catch (err) {
    console.error('Failed to create or emit notification:', err);
    return null;
  }
};
