import { Server } from 'socket.io';
export declare const addOnlineUser: (io: Server, userId: string, socketId: string) => void;
export declare const removeOnlineUser: (io: Server, userId: string, socketId: string) => void;
export declare const getOnlineCount: () => number;
export declare const getOnlineUserIds: () => string[];
export declare const isUserOnline: (userId: string) => boolean;
export declare const broadcastPresence: (io: Server) => void;
