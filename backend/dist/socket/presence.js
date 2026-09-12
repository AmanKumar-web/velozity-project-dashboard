"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.broadcastPresence = exports.isUserOnline = exports.getOnlineUserIds = exports.getOnlineCount = exports.removeOnlineUser = exports.addOnlineUser = void 0;
const index_js_1 = require("../constants/index.js");
// Map: userId -> Set of active socket IDs (supports multi-tab)
const onlineUsers = new Map();
const addOnlineUser = (io, userId, socketId) => {
    let sockets = onlineUsers.get(userId);
    if (!sockets) {
        sockets = new Set();
        onlineUsers.set(userId, sockets);
    }
    sockets.add(socketId);
    // Broadcast presence count to Admins
    (0, exports.broadcastPresence)(io);
};
exports.addOnlineUser = addOnlineUser;
const removeOnlineUser = (io, userId, socketId) => {
    const sockets = onlineUsers.get(userId);
    if (sockets) {
        sockets.delete(socketId);
        if (sockets.size === 0) {
            onlineUsers.delete(userId);
        }
    }
    // Broadcast presence count to Admins
    (0, exports.broadcastPresence)(io);
};
exports.removeOnlineUser = removeOnlineUser;
const getOnlineCount = () => {
    return onlineUsers.size;
};
exports.getOnlineCount = getOnlineCount;
const getOnlineUserIds = () => {
    return Array.from(onlineUsers.keys());
};
exports.getOnlineUserIds = getOnlineUserIds;
const isUserOnline = (userId) => {
    return onlineUsers.has(userId) && (onlineUsers.get(userId)?.size ?? 0) > 0;
};
exports.isUserOnline = isUserOnline;
const broadcastPresence = (io) => {
    io.to(index_js_1.SOCKET_ROOMS.ADMIN_GLOBAL).emit(index_js_1.SOCKET_EVENTS.ONLINE_COUNT, {
        count: (0, exports.getOnlineCount)(),
        onlineUserIds: (0, exports.getOnlineUserIds)(),
        timestamp: new Date().toISOString(),
    });
};
exports.broadcastPresence = broadcastPresence;
