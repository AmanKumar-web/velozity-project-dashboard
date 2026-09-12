import { Server } from 'socket.io';
import { SOCKET_ROOMS, SOCKET_EVENTS } from '../constants/index.js';

// Map: userId -> Set of active socket IDs (supports multi-tab)
const onlineUsers = new Map<string, Set<string>>();

export const addOnlineUser = (io: Server, userId: string, socketId: string): void => {
  let sockets = onlineUsers.get(userId);
  if (!sockets) {
    sockets = new Set<string>();
    onlineUsers.set(userId, sockets);
  }
  sockets.add(socketId);

  // Broadcast presence count to Admins
  broadcastPresence(io);
};

export const removeOnlineUser = (io: Server, userId: string, socketId: string): void => {
  const sockets = onlineUsers.get(userId);
  if (sockets) {
    sockets.delete(socketId);
    if (sockets.size === 0) {
      onlineUsers.delete(userId);
    }
  }

  // Broadcast presence count to Admins
  broadcastPresence(io);
};

export const getOnlineCount = (): number => {
  return onlineUsers.size;
};

export const getOnlineUserIds = (): string[] => {
  return Array.from(onlineUsers.keys());
};

export const isUserOnline = (userId: string): boolean => {
  return onlineUsers.has(userId) && (onlineUsers.get(userId)?.size ?? 0) > 0;
};

export const broadcastPresence = (io: Server): void => {
  io.to(SOCKET_ROOMS.ADMIN_GLOBAL).emit(SOCKET_EVENTS.ONLINE_COUNT, {
    count: getOnlineCount(),
    onlineUserIds: getOnlineUserIds(),
    timestamp: new Date().toISOString(),
  });
};
