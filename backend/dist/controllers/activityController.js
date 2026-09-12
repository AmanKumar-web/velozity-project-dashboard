"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActivityFeed = void 0;
const client_1 = require("@prisma/client");
const prisma_js_1 = require("../config/prisma.js");
const getActivityFeed = async (req, res, next) => {
    try {
        const user = req.user;
        const limit = Math.min(parseInt(req.query.limit) || 20, 50);
        const projectId = req.query.projectId;
        const where = {};
        if (user.role === client_1.Role.ADMIN) {
            if (projectId) {
                where.projectId = projectId;
            }
        }
        else if (user.role === client_1.Role.PROJECT_MANAGER) {
            // PM sees activities from projects they own
            where.project = {
                pmId: user.id,
            };
            if (projectId) {
                where.projectId = projectId;
            }
        }
        else if (user.role === client_1.Role.DEVELOPER) {
            // Developer sees activity only on tasks assigned to them (or actions they performed)
            where.OR = [
                { task: { developerId: user.id } },
                { userId: user.id },
            ];
            if (projectId) {
                where.projectId = projectId;
            }
        }
        const activities = await prisma_js_1.prisma.activityLog.findMany({
            where,
            include: {
                user: {
                    select: { id: true, name: true, email: true, role: true },
                },
                task: {
                    select: { id: true, title: true, status: true, priority: true },
                },
                project: {
                    select: { id: true, title: true },
                },
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
        res.status(200).json({
            success: true,
            data: activities,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getActivityFeed = getActivityFeed;
