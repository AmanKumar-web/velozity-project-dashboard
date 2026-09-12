"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProject = exports.createProject = exports.getProjectById = exports.getProjects = void 0;
const client_1 = require("@prisma/client");
const prisma_js_1 = require("../config/prisma.js");
const errorHandler_js_1 = require("../middleware/errorHandler.js");
const getProjects = async (req, res, next) => {
    try {
        const user = req.user;
        let whereClause = {};
        if (user.role === client_1.Role.ADMIN) {
            whereClause = {};
        }
        else if (user.role === client_1.Role.PROJECT_MANAGER) {
            // PM sees ONLY their own projects
            whereClause = { pmId: user.id };
        }
        else if (user.role === client_1.Role.DEVELOPER) {
            // Developer sees projects where they have assigned tasks
            whereClause = {
                tasks: {
                    some: {
                        developerId: user.id,
                    },
                },
            };
        }
        const projects = await prisma_js_1.prisma.project.findMany({
            where: whereClause,
            include: {
                client: { select: { id: true, name: true, company: true } },
                projectManager: { select: { id: true, name: true, email: true } },
                _count: {
                    select: { tasks: true },
                },
            },
            orderBy: { updatedAt: 'desc' },
        });
        // Compute task status breakdown for each project
        const projectsWithStats = await Promise.all(projects.map(async (p) => {
            const taskCounts = await prisma_js_1.prisma.task.groupBy({
                by: ['status'],
                where: { projectId: p.id },
                _count: { _all: true },
            });
            const overdueCount = await prisma_js_1.prisma.task.count({
                where: { projectId: p.id, isOverdue: true },
            });
            const statusMap = {
                TODO: 0,
                IN_PROGRESS: 0,
                IN_REVIEW: 0,
                DONE: 0,
            };
            for (const tc of taskCounts) {
                statusMap[tc.status] = tc._count._all;
            }
            return {
                ...p,
                statusBreakdown: statusMap,
                overdueTasksCount: overdueCount,
            };
        }));
        res.status(200).json({
            success: true,
            data: projectsWithStats,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getProjects = getProjects;
const getProjectById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = req.user;
        const project = await prisma_js_1.prisma.project.findUnique({
            where: { id },
            include: {
                client: true,
                projectManager: { select: { id: true, name: true, email: true } },
                tasks: {
                    where: user.role === client_1.Role.DEVELOPER ? { developerId: user.id } : {},
                    include: {
                        assignedDeveloper: { select: { id: true, name: true, email: true } },
                    },
                    orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }],
                },
            },
        });
        if (!project) {
            throw new errorHandler_js_1.AppError('Project not found', 404, 'NOT_FOUND');
        }
        // Role ownership check
        if (user.role === client_1.Role.PROJECT_MANAGER && project.pmId !== user.id) {
            throw new errorHandler_js_1.AppError('Access denied. You cannot view another PM\'s project.', 403, 'FORBIDDEN');
        }
        if (user.role === client_1.Role.DEVELOPER) {
            // Must have tasks in this project
            const hasTask = await prisma_js_1.prisma.task.findFirst({
                where: { projectId: id, developerId: user.id },
            });
            if (!hasTask) {
                throw new errorHandler_js_1.AppError('Access denied. You have no tasks in this project.', 403, 'FORBIDDEN');
            }
        }
        res.status(200).json({
            success: true,
            data: project,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getProjectById = getProjectById;
const createProject = async (req, res, next) => {
    try {
        const user = req.user;
        const { title, description, clientId, pmId } = req.body;
        // PM can only assign themselves as pmId
        const targetPmId = user.role === client_1.Role.PROJECT_MANAGER ? user.id : (pmId || user.id);
        const project = await prisma_js_1.prisma.project.create({
            data: {
                title,
                description,
                clientId,
                pmId: targetPmId,
            },
            include: {
                client: true,
                projectManager: { select: { id: true, name: true, email: true } },
            },
        });
        res.status(201).json({
            success: true,
            data: project,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createProject = createProject;
const updateProject = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = req.user;
        const { title, description, clientId, pmId } = req.body;
        const existing = await prisma_js_1.prisma.project.findUnique({
            where: { id },
        });
        if (!existing) {
            throw new errorHandler_js_1.AppError('Project not found', 404, 'NOT_FOUND');
        }
        if (user.role === client_1.Role.PROJECT_MANAGER && existing.pmId !== user.id) {
            throw new errorHandler_js_1.AppError('Access denied. You cannot edit another PM\'s project.', 403, 'FORBIDDEN');
        }
        const updated = await prisma_js_1.prisma.project.update({
            where: { id },
            data: {
                title,
                description,
                clientId,
                pmId: user.role === client_1.Role.PROJECT_MANAGER ? existing.pmId : pmId,
            },
            include: {
                client: true,
                projectManager: { select: { id: true, name: true, email: true } },
            },
        });
        res.status(200).json({
            success: true,
            data: updated,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateProject = updateProject;
