"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SOCKET_EVENTS = exports.SOCKET_ROOMS = exports.TASK_PRIORITY = exports.TASK_STATUS = exports.ROLES = void 0;
exports.ROLES = {
    ADMIN: 'ADMIN',
    PROJECT_MANAGER: 'PROJECT_MANAGER',
    DEVELOPER: 'DEVELOPER',
};
exports.TASK_STATUS = {
    TODO: 'TODO',
    IN_PROGRESS: 'IN_PROGRESS',
    IN_REVIEW: 'IN_REVIEW',
    DONE: 'DONE',
};
exports.TASK_PRIORITY = {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
    CRITICAL: 'CRITICAL',
};
exports.SOCKET_ROOMS = {
    ADMIN_GLOBAL: 'admin_global',
    project: (projectId) => `project_${projectId}`,
    user: (userId) => `user_${userId}`,
};
exports.SOCKET_EVENTS = {
    // Client -> Server
    JOIN_PROJECT: 'join_project',
    LEAVE_PROJECT: 'leave_project',
    // Server -> Client
    ONLINE_COUNT: 'online_count',
    TASK_UPDATED: 'task_updated',
    TASK_CREATED: 'task_created',
    ACTIVITY_NEW: 'activity_new',
    NOTIFICATION_NEW: 'notification_new',
};
