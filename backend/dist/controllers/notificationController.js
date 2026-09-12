"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markAllAsRead = exports.markAsRead = exports.getNotifications = void 0;
const prisma_js_1 = require("../config/prisma.js");
const errorHandler_js_1 = require("../middleware/errorHandler.js");
const getNotifications = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const notifications = await prisma_js_1.prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
        const unreadCount = await prisma_js_1.prisma.notification.count({
            where: { userId, isRead: false },
        });
        res.status(200).json({
            success: true,
            data: {
                notifications,
                unreadCount,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getNotifications = getNotifications;
const markAsRead = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const notification = await prisma_js_1.prisma.notification.findUnique({
            where: { id },
        });
        if (!notification) {
            throw new errorHandler_js_1.AppError('Notification not found', 404, 'NOT_FOUND');
        }
        if (notification.userId !== userId) {
            throw new errorHandler_js_1.AppError('Access denied', 403, 'FORBIDDEN');
        }
        const updated = await prisma_js_1.prisma.notification.update({
            where: { id },
            data: { isRead: true },
        });
        const unreadCount = await prisma_js_1.prisma.notification.count({
            where: { userId, isRead: false },
        });
        res.status(200).json({
            success: true,
            data: {
                notification: updated,
                unreadCount,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.markAsRead = markAsRead;
const markAllAsRead = async (req, res, next) => {
    try {
        const userId = req.user.id;
        await prisma_js_1.prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
        });
        res.status(200).json({
            success: true,
            data: {
                message: 'All notifications marked as read',
                unreadCount: 0,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.markAllAsRead = markAllAsRead;
