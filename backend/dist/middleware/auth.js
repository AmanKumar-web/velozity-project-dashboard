"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeProjectOwnership = exports.authorizeRoles = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const env_js_1 = require("../config/env.js");
const prisma_js_1 = require("../config/prisma.js");
const errorHandler_js_1 = require("./errorHandler.js");
const authenticateToken = async (req, _res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
        if (!token) {
            throw new errorHandler_js_1.AppError('Authentication token is required', 401, 'UNAUTHORIZED');
        }
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(token, env_js_1.env.JWT_ACCESS_SECRET);
        }
        catch (err) {
            throw new errorHandler_js_1.AppError('Token expired or invalid', 401, 'INVALID_TOKEN');
        }
        const user = await prisma_js_1.prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, email: true, name: true, role: true },
        });
        if (!user) {
            throw new errorHandler_js_1.AppError('User not found or deactivated', 401, 'USER_NOT_FOUND');
        }
        req.user = user;
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.authenticateToken = authenticateToken;
const authorizeRoles = (...roles) => {
    return (req, _res, next) => {
        if (!req.user) {
            return next(new errorHandler_js_1.AppError('Authentication required', 401, 'UNAUTHORIZED'));
        }
        if (!roles.includes(req.user.role)) {
            return next(new errorHandler_js_1.AppError(`Access denied. Role ${req.user.role} does not have required permissions.`, 403, 'FORBIDDEN'));
        }
        next();
    };
};
exports.authorizeRoles = authorizeRoles;
const authorizeProjectOwnership = async (req, _res, next) => {
    try {
        const user = req.user;
        if (!user) {
            throw new errorHandler_js_1.AppError('Authentication required', 401, 'UNAUTHORIZED');
        }
        // Admins bypass project ownership
        if (user.role === client_1.Role.ADMIN) {
            return next();
        }
        const projectId = req.params.projectId || req.params.id;
        if (!projectId) {
            throw new errorHandler_js_1.AppError('Project ID parameter missing', 400, 'BAD_REQUEST');
        }
        const project = await prisma_js_1.prisma.project.findUnique({
            where: { id: projectId },
            select: { pmId: true },
        });
        if (!project) {
            throw new errorHandler_js_1.AppError('Project not found', 404, 'NOT_FOUND');
        }
        if (user.role === client_1.Role.PROJECT_MANAGER && project.pmId !== user.id) {
            throw new errorHandler_js_1.AppError('Access denied. Project Managers can only manage projects they own.', 403, 'FORBIDDEN_PROJECT_ACCESS');
        }
        if (user.role === client_1.Role.DEVELOPER) {
            // Developers can only view projects if assigned to at least one task in that project
            const hasTask = await prisma_js_1.prisma.task.findFirst({
                where: { projectId, developerId: user.id },
            });
            if (!hasTask) {
                throw new errorHandler_js_1.AppError('Access denied. Developers can only access projects with assigned tasks.', 403, 'FORBIDDEN_PROJECT_ACCESS');
            }
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.authorizeProjectOwnership = authorizeProjectOwnership;
