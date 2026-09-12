"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTask = exports.createTask = exports.getTasks = void 0;
const client_1 = require("@prisma/client");
const prisma_js_1 = require("../config/prisma.js");
const errorHandler_js_1 = require("../middleware/errorHandler.js");
const emitter_js_1 = require("../socket/emitter.js");
const statusDisplayNames = {
    TODO: 'To Do',
    IN_PROGRESS: 'In Progress',
    IN_REVIEW: 'In Review',
    DONE: 'Done',
};
const getTasks = async (req, res, next) => {
    try {
        const user = req.user;
        const { status, priority, startDate, endDate, search, projectId } = req.query;
        const where = {};
        // 1. Role-based scoping
        if (user.role === client_1.Role.ADMIN) {
            if (projectId) {
                where.projectId = projectId;
            }
        }
        else if (user.role === client_1.Role.PROJECT_MANAGER) {
            // PM can only view tasks from their own projects
            where.project = {
                pmId: user.id,
            };
            if (projectId) {
                where.projectId = projectId;
            }
        }
        else if (user.role === client_1.Role.DEVELOPER) {
            // Developer can ONLY view tasks assigned to them
            where.developerId = user.id;
            if (projectId) {
                where.projectId = projectId;
            }
        }
        // 2. Query filter parameters
        if (status) {
            where.status = status;
        }
        if (priority) {
            where.priority = priority;
        }
        if (search && search.trim().length > 0) {
            where.OR = [
                { title: { contains: search.trim(), mode: 'insensitive' } },
                { description: { contains: search.trim(), mode: 'insensitive' } },
            ];
        }
        if (startDate || endDate) {
            where.dueDate = {};
            if (startDate) {
                where.dueDate.gte = new Date(startDate);
            }
            if (endDate) {
                where.dueDate.lte = new Date(endDate);
            }
        }
        const tasks = await prisma_js_1.prisma.task.findMany({
            where,
            include: {
                project: {
                    select: {
                        id: true,
                        title: true,
                        pmId: true,
                        projectManager: { select: { id: true, name: true, email: true } },
                    },
                },
                assignedDeveloper: {
                    select: { id: true, name: true, email: true },
                },
            },
            orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }],
        });
        res.status(200).json({
            success: true,
            data: tasks,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getTasks = getTasks;
const createTask = async (req, res, next) => {
    try {
        const user = req.user;
        const { title, description, projectId, developerId, priority, dueDate } = req.body;
        // Check project existence and PM ownership
        const project = await prisma_js_1.prisma.project.findUnique({
            where: { id: projectId },
            include: { projectManager: true },
        });
        if (!project) {
            throw new errorHandler_js_1.AppError('Project not found', 404, 'NOT_FOUND');
        }
        if (user.role === client_1.Role.PROJECT_MANAGER && project.pmId !== user.id) {
            throw new errorHandler_js_1.AppError('Access denied. You cannot create tasks in another PM\'s project.', 403, 'FORBIDDEN');
        }
        // Check if task is already past due date
        const parsedDueDate = new Date(dueDate);
        const isOverdue = parsedDueDate < new Date();
        const task = await prisma_js_1.prisma.task.create({
            data: {
                title,
                description,
                projectId,
                developerId: developerId || null,
                priority: priority || client_1.TaskPriority.MEDIUM,
                dueDate: parsedDueDate,
                isOverdue,
            },
            include: {
                project: {
                    select: { id: true, title: true, pmId: true },
                },
                assignedDeveloper: {
                    select: { id: true, name: true, email: true },
                },
            },
        });
        // Activity log entry
        const actionText = `${user.name} created Task "${task.title}"`;
        const activity = await prisma_js_1.prisma.activityLog.create({
            data: {
                projectId,
                taskId: task.id,
                userId: user.id,
                actionText,
                newState: {
                    title: task.title,
                    status: task.status,
                    priority: task.priority,
                    developerId: task.developerId,
                },
            },
            include: {
                user: { select: { id: true, name: true, role: true } },
            },
        });
        // Real-time broadcasts
        (0, emitter_js_1.emitTaskUpdate)(projectId, task);
        (0, emitter_js_1.emitActivity)(projectId, activity, task.developerId);
        // If assigned to a developer on creation, dispatch notification
        if (task.developerId) {
            await (0, emitter_js_1.createAndEmitNotification)(task.developerId, `You have been assigned to task: "${task.title}" in project "${project.title}"`);
        }
        res.status(201).json({
            success: true,
            data: task,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createTask = createTask;
const updateTask = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = req.user;
        const { title, description, developerId, status, priority, dueDate } = req.body;
        const existing = await prisma_js_1.prisma.task.findUnique({
            where: { id },
            include: {
                project: { select: { id: true, title: true, pmId: true } },
                assignedDeveloper: { select: { id: true, name: true, email: true } },
            },
        });
        if (!existing) {
            throw new errorHandler_js_1.AppError('Task not found', 404, 'NOT_FOUND');
        }
        // Role-based authorization rules
        if (user.role === client_1.Role.DEVELOPER) {
            // Developer can ONLY update tasks assigned to them
            if (existing.developerId !== user.id) {
                throw new errorHandler_js_1.AppError('Access denied. You can only update tasks assigned to you.', 403, 'FORBIDDEN');
            }
            // Developers are strictly forbidden from modifying title, description, developerId, priority, dueDate
            if (title !== undefined || description !== undefined || developerId !== undefined || priority !== undefined || dueDate !== undefined) {
                throw new errorHandler_js_1.AppError('Developers are only permitted to update task status.', 403, 'FORBIDDEN_FIELD_MODIFICATION');
            }
        }
        else if (user.role === client_1.Role.PROJECT_MANAGER) {
            // PM can only update tasks from projects they own
            if (existing.project.pmId !== user.id) {
                throw new errorHandler_js_1.AppError('Access denied. You cannot edit tasks in another PM\'s project.', 403, 'FORBIDDEN');
            }
        }
        const previousStatus = existing.status;
        const newStatus = status;
        const previousDeveloperId = existing.developerId;
        const newDeveloperId = developerId !== undefined ? developerId : existing.developerId;
        // Build update payload
        const updateData = {};
        if (status !== undefined) {
            updateData.status = status;
            if (status === client_1.TaskStatus.DONE) {
                updateData.isOverdue = false;
            }
        }
        if (user.role !== client_1.Role.DEVELOPER) {
            if (title !== undefined)
                updateData.title = title;
            if (description !== undefined)
                updateData.description = description;
            if (priority !== undefined)
                updateData.priority = priority;
            if (dueDate !== undefined) {
                const parsedDate = new Date(dueDate);
                updateData.dueDate = parsedDate;
                if (existing.status !== client_1.TaskStatus.DONE) {
                    updateData.isOverdue = parsedDate < new Date();
                }
            }
            if (developerId !== undefined) {
                if (developerId === null) {
                    updateData.assignedDeveloper = { disconnect: true };
                }
                else {
                    updateData.assignedDeveloper = { connect: { id: developerId } };
                }
            }
        }
        const updatedTask = await prisma_js_1.prisma.task.update({
            where: { id },
            data: updateData,
            include: {
                project: {
                    select: { id: true, title: true, pmId: true },
                },
                assignedDeveloper: {
                    select: { id: true, name: true, email: true },
                },
            },
        });
        // 1. Status transition logging & notification
        if (newStatus && newStatus !== previousStatus) {
            const prevName = statusDisplayNames[previousStatus];
            const nextName = statusDisplayNames[newStatus];
            const actionText = `${user.name} moved Task "${updatedTask.title}" from ${prevName} → ${nextName}`;
            const activity = await prisma_js_1.prisma.activityLog.create({
                data: {
                    projectId: updatedTask.projectId,
                    taskId: updatedTask.id,
                    userId: user.id,
                    actionText,
                    previousState: { status: previousStatus },
                    newState: { status: newStatus },
                },
                include: {
                    user: { select: { id: true, name: true, role: true } },
                },
            });
            (0, emitter_js_1.emitActivity)(updatedTask.projectId, activity, updatedTask.developerId);
            // Requirement: When a task is moved to In Review, the PM receives a notification
            if (newStatus === client_1.TaskStatus.IN_REVIEW) {
                await (0, emitter_js_1.createAndEmitNotification)(updatedTask.project.pmId, `Task "${updatedTask.title}" was moved to In Review by ${user.name}`);
            }
        }
        // 2. Reassignment logging & notification
        if (developerId !== undefined && newDeveloperId !== previousDeveloperId) {
            const devName = updatedTask.assignedDeveloper ? updatedTask.assignedDeveloper.name : 'Unassigned';
            const actionText = `${user.name} assigned Task "${updatedTask.title}" to ${devName}`;
            const activity = await prisma_js_1.prisma.activityLog.create({
                data: {
                    projectId: updatedTask.projectId,
                    taskId: updatedTask.id,
                    userId: user.id,
                    actionText,
                    previousState: { developerId: previousDeveloperId },
                    newState: { developerId: newDeveloperId },
                },
                include: {
                    user: { select: { id: true, name: true, role: true } },
                },
            });
            (0, emitter_js_1.emitActivity)(updatedTask.projectId, activity, newDeveloperId);
            // Requirement: When a task is assigned to a developer, they receive an in-app notification
            if (newDeveloperId) {
                await (0, emitter_js_1.createAndEmitNotification)(newDeveloperId, `You have been assigned to task: "${updatedTask.title}" in project "${updatedTask.project.title}"`);
            }
        }
        // Broadcast updated task state to project room and Admin
        (0, emitter_js_1.emitTaskUpdate)(updatedTask.projectId, updatedTask);
        res.status(200).json({
            success: true,
            data: updatedTask,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateTask = updateTask;
