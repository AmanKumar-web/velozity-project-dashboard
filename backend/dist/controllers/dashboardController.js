"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStats = void 0;
const client_1 = require("@prisma/client");
const prisma_js_1 = require("../config/prisma.js");
const presence_js_1 = require("../socket/presence.js");
const getDashboardStats = async (req, res, next) => {
    try {
        const user = req.user;
        const now = new Date();
        const oneWeekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        if (user.role === client_1.Role.ADMIN) {
            // 1. Admin Metrics
            const totalProjects = await prisma_js_1.prisma.project.count();
            const totalTasks = await prisma_js_1.prisma.task.count();
            const overdueTasksCount = await prisma_js_1.prisma.task.count({
                where: { isOverdue: true },
            });
            const tasksByStatusRaw = await prisma_js_1.prisma.task.groupBy({
                by: ['status'],
                _count: { _all: true },
            });
            const tasksByStatus = {
                TODO: 0,
                IN_PROGRESS: 0,
                IN_REVIEW: 0,
                DONE: 0,
            };
            for (const t of tasksByStatusRaw) {
                tasksByStatus[t.status] = t._count._all;
            }
            const tasksByPriorityRaw = await prisma_js_1.prisma.task.groupBy({
                by: ['priority'],
                _count: { _all: true },
            });
            const tasksByPriority = {
                LOW: 0,
                MEDIUM: 0,
                HIGH: 0,
                CRITICAL: 0,
            };
            for (const p of tasksByPriorityRaw) {
                tasksByPriority[p.priority] = p._count._all;
            }
            const totalUsers = await prisma_js_1.prisma.user.count();
            res.status(200).json({
                success: true,
                data: {
                    role: client_1.Role.ADMIN,
                    totalProjects,
                    totalTasks,
                    overdueTasksCount,
                    tasksByStatus,
                    tasksByPriority,
                    totalUsers,
                    activeOnlineUsersCount: (0, presence_js_1.getOnlineCount)(),
                    activeOnlineUserIds: (0, presence_js_1.getOnlineUserIds)(),
                },
            });
            return;
        }
        if (user.role === client_1.Role.PROJECT_MANAGER) {
            // 2. PM Metrics: their projects summary, tasks by priority, upcoming due dates this week
            const pmProjects = await prisma_js_1.prisma.project.findMany({
                where: { pmId: user.id },
                include: {
                    client: { select: { name: true, company: true } },
                    _count: { select: { tasks: true } },
                },
            });
            const projectIds = pmProjects.map((p) => p.id);
            const tasksByPriorityRaw = await prisma_js_1.prisma.task.groupBy({
                by: ['priority'],
                where: { projectId: { in: projectIds } },
                _count: { _all: true },
            });
            const tasksByPriority = {
                LOW: 0,
                MEDIUM: 0,
                HIGH: 0,
                CRITICAL: 0,
            };
            for (const p of tasksByPriorityRaw) {
                tasksByPriority[p.priority] = p._count._all;
            }
            const tasksByStatusRaw = await prisma_js_1.prisma.task.groupBy({
                by: ['status'],
                where: { projectId: { in: projectIds } },
                _count: { _all: true },
            });
            const tasksByStatus = {
                TODO: 0,
                IN_PROGRESS: 0,
                IN_REVIEW: 0,
                DONE: 0,
            };
            for (const s of tasksByStatusRaw) {
                tasksByStatus[s.status] = s._count._all;
            }
            const upcomingDueThisWeek = await prisma_js_1.prisma.task.findMany({
                where: {
                    projectId: { in: projectIds },
                    status: { not: client_1.TaskStatus.DONE },
                    dueDate: {
                        gte: now,
                        lte: oneWeekFromNow,
                    },
                },
                include: {
                    project: { select: { title: true } },
                    assignedDeveloper: { select: { name: true, email: true } },
                },
                orderBy: { dueDate: 'asc' },
            });
            const overdueTasksCount = await prisma_js_1.prisma.task.count({
                where: {
                    projectId: { in: projectIds },
                    isOverdue: true,
                },
            });
            res.status(200).json({
                success: true,
                data: {
                    role: client_1.Role.PROJECT_MANAGER,
                    totalProjects: pmProjects.length,
                    projectsSummary: pmProjects,
                    tasksByPriority,
                    tasksByStatus,
                    upcomingDueThisWeek,
                    overdueTasksCount,
                },
            });
            return;
        }
        if (user.role === client_1.Role.DEVELOPER) {
            // 3. Developer Metrics: assigned tasks, sorted by priority then due date
            const assignedTasks = await prisma_js_1.prisma.task.findMany({
                where: { developerId: user.id },
                include: {
                    project: { select: { id: true, title: true } },
                },
                orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }],
            });
            const tasksByStatusRaw = await prisma_js_1.prisma.task.groupBy({
                by: ['status'],
                where: { developerId: user.id },
                _count: { _all: true },
            });
            const tasksByStatus = {
                TODO: 0,
                IN_PROGRESS: 0,
                IN_REVIEW: 0,
                DONE: 0,
            };
            for (const s of tasksByStatusRaw) {
                tasksByStatus[s.status] = s._count._all;
            }
            const overdueCount = assignedTasks.filter((t) => t.isOverdue).length;
            res.status(200).json({
                success: true,
                data: {
                    role: client_1.Role.DEVELOPER,
                    totalAssignedTasks: assignedTasks.length,
                    tasksByStatus,
                    overdueCount,
                    assignedTasks,
                },
            });
            return;
        }
    }
    catch (error) {
        next(error);
    }
};
exports.getDashboardStats = getDashboardStats;
