"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskFilterSchema = exports.updateTaskSchema = exports.updateTaskStatusSchema = exports.createTaskSchema = exports.updateProjectSchema = exports.createProjectSchema = exports.loginSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
});
exports.createProjectSchema = zod_1.z.object({
    title: zod_1.z.string().min(2, 'Project title must be at least 2 characters').max(100),
    description: zod_1.z.string().min(5, 'Description must be at least 5 characters'),
    clientId: zod_1.z.string().uuid('Valid client ID is required'),
    pmId: zod_1.z.string().uuid().optional(),
});
exports.updateProjectSchema = zod_1.z.object({
    title: zod_1.z.string().min(2).max(100).optional(),
    description: zod_1.z.string().min(5).optional(),
    clientId: zod_1.z.string().uuid().optional(),
    pmId: zod_1.z.string().uuid().optional(),
});
exports.createTaskSchema = zod_1.z.object({
    title: zod_1.z.string().min(2, 'Title must be at least 2 characters').max(150),
    description: zod_1.z.string().min(5, 'Description must be at least 5 characters'),
    projectId: zod_1.z.string().uuid('Valid project ID is required'),
    developerId: zod_1.z.string().uuid().nullable().optional(),
    priority: zod_1.z.nativeEnum(client_1.TaskPriority).default(client_1.TaskPriority.MEDIUM),
    dueDate: zod_1.z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: 'Valid ISO due date is required',
    }),
});
exports.updateTaskStatusSchema = zod_1.z.object({
    status: zod_1.z.nativeEnum(client_1.TaskStatus),
});
exports.updateTaskSchema = zod_1.z.object({
    title: zod_1.z.string().min(2).max(150).optional(),
    description: zod_1.z.string().min(5).optional(),
    developerId: zod_1.z.string().uuid().nullable().optional(),
    status: zod_1.z.nativeEnum(client_1.TaskStatus).optional(),
    priority: zod_1.z.nativeEnum(client_1.TaskPriority).optional(),
    dueDate: zod_1.z
        .string()
        .refine((val) => !isNaN(Date.parse(val)), {
        message: 'Valid ISO due date is required',
    })
        .optional(),
});
exports.taskFilterSchema = zod_1.z.object({
    status: zod_1.z.nativeEnum(client_1.TaskStatus).optional(),
    priority: zod_1.z.nativeEnum(client_1.TaskPriority).optional(),
    startDate: zod_1.z.string().optional(),
    endDate: zod_1.z.string().optional(),
    search: zod_1.z.string().optional(),
    projectId: zod_1.z.string().uuid().optional(),
});
