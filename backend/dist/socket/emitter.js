"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAndEmitNotification = exports.emitActivity = exports.emitTaskUpdate = void 0;
const index_js_1 = require("./index.js");
const index_js_2 = require("../constants/index.js");
const prisma_js_1 = require("../config/prisma.js");
const emitTaskUpdate = (projectId, task) => {
    try {
        const io = (0, index_js_1.getIO)();
        // 1. Broadcast to everyone viewing this project
        io.to(index_js_2.SOCKET_ROOMS.project(projectId)).emit(index_js_2.SOCKET_EVENTS.TASK_UPDATED, task);
        // 2. Broadcast to Admin global stream
        io.to(index_js_2.SOCKET_ROOMS.ADMIN_GLOBAL).emit(index_js_2.SOCKET_EVENTS.TASK_UPDATED, task);
    }
    catch (err) {
        console.error('Failed to emit task update:', err);
    }
};
exports.emitTaskUpdate = emitTaskUpdate;
const emitActivity = (projectId, activity, developerId) => {
    try {
        const io = (0, index_js_1.getIO)();
        // 1. Project room (all viewers of this project)
        io.to(index_js_2.SOCKET_ROOMS.project(projectId)).emit(index_js_2.SOCKET_EVENTS.ACTIVITY_NEW, activity);
        // 2. Admin global room
        io.to(index_js_2.SOCKET_ROOMS.ADMIN_GLOBAL).emit(index_js_2.SOCKET_EVENTS.ACTIVITY_NEW, activity);
        // 3. Direct developer room if assigned
        if (developerId) {
            io.to(index_js_2.SOCKET_ROOMS.user(developerId)).emit(index_js_2.SOCKET_EVENTS.ACTIVITY_NEW, activity);
        }
    }
    catch (err) {
        console.error('Failed to emit activity:', err);
    }
};
exports.emitActivity = emitActivity;
const createAndEmitNotification = async (userId, message) => {
    try {
        const notification = await prisma_js_1.prisma.notification.create({
            data: {
                userId,
                message,
                isRead: false,
            },
        });
        const unreadCount = await prisma_js_1.prisma.notification.count({
            where: { userId, isRead: false },
        });
        const io = (0, index_js_1.getIO)();
        io.to(index_js_2.SOCKET_ROOMS.user(userId)).emit(index_js_2.SOCKET_EVENTS.NOTIFICATION_NEW, {
            notification,
            unreadCount,
        });
        return notification;
    }
    catch (err) {
        console.error('Failed to create or emit notification:', err);
        return null;
    }
};
exports.createAndEmitNotification = createAndEmitNotification;
