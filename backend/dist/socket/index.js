"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIO = exports.initSocket = void 0;
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const env_js_1 = require("../config/env.js");
const prisma_js_1 = require("../config/prisma.js");
const index_js_1 = require("../constants/index.js");
const presence_js_1 = require("./presence.js");
let ioInstance = null;
const initSocket = (httpServer) => {
    const io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: env_js_1.env.CLIENT_URL,
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        },
        transports: ['websocket'], // Strictly WebSocket per specification
    });
    ioInstance = io;
    // Socket Authentication Middleware via Handshake
    io.use(async (socket, next) => {
        try {
            const authHeader = socket.handshake.auth.token || socket.handshake.headers.authorization;
            const token = authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')
                ? authHeader.split(' ')[1]
                : authHeader;
            if (!token) {
                return next(new Error('Authentication token required'));
            }
            const decoded = jsonwebtoken_1.default.verify(token, env_js_1.env.JWT_ACCESS_SECRET);
            const user = await prisma_js_1.prisma.user.findUnique({
                where: { id: decoded.userId },
                select: { id: true, email: true, name: true, role: true },
            });
            if (!user) {
                return next(new Error('User not found or deactivated'));
            }
            socket.data.user = user;
            next();
        }
        catch (err) {
            next(new Error('Invalid socket authentication token'));
        }
    });
    io.on('connection', async (socket) => {
        const user = socket.data.user;
        console.log(`🔌 [Socket] Connected: ${user.name} (${user.role}) [socketId: ${socket.id}]`);
        // 1. Join user-specific notification room
        socket.join(index_js_1.SOCKET_ROOMS.user(user.id));
        // 2. Role-specific initial room subscription
        if (user.role === client_1.Role.ADMIN) {
            socket.join(index_js_1.SOCKET_ROOMS.ADMIN_GLOBAL);
            // Immediately send current presence count to newly connected Admin
            (0, presence_js_1.broadcastPresence)(io);
        }
        else if (user.role === client_1.Role.PROJECT_MANAGER) {
            // Auto-join all projects managed by this PM
            const pmProjects = await prisma_js_1.prisma.project.findMany({
                where: { pmId: user.id },
                select: { id: true },
            });
            for (const p of pmProjects) {
                socket.join(index_js_1.SOCKET_ROOMS.project(p.id));
            }
        }
        else if (user.role === client_1.Role.DEVELOPER) {
            // Auto-join projects where developer is assigned tasks
            const devTasks = await prisma_js_1.prisma.task.findMany({
                where: { developerId: user.id },
                select: { projectId: true },
                distinct: ['projectId'],
            });
            for (const t of devTasks) {
                socket.join(index_js_1.SOCKET_ROOMS.project(t.projectId));
            }
        }
        // 3. Register presence
        (0, presence_js_1.addOnlineUser)(io, user.id, socket.id);
        // Dynamic join project room event with access verification
        socket.on(index_js_1.SOCKET_EVENTS.JOIN_PROJECT, async (projectId) => {
            if (!projectId)
                return;
            if (user.role === client_1.Role.ADMIN) {
                socket.join(index_js_1.SOCKET_ROOMS.project(projectId));
                return;
            }
            if (user.role === client_1.Role.PROJECT_MANAGER) {
                const project = await prisma_js_1.prisma.project.findFirst({
                    where: { id: projectId, pmId: user.id },
                });
                if (project) {
                    socket.join(index_js_1.SOCKET_ROOMS.project(projectId));
                }
                return;
            }
            if (user.role === client_1.Role.DEVELOPER) {
                const assigned = await prisma_js_1.prisma.task.findFirst({
                    where: { projectId, developerId: user.id },
                });
                if (assigned) {
                    socket.join(index_js_1.SOCKET_ROOMS.project(projectId));
                }
            }
        });
        socket.on(index_js_1.SOCKET_EVENTS.LEAVE_PROJECT, (projectId) => {
            if (projectId) {
                socket.leave(index_js_1.SOCKET_ROOMS.project(projectId));
            }
        });
        socket.on('disconnect', () => {
            console.log(`🔌 [Socket] Disconnected: ${user.name} [socketId: ${socket.id}]`);
            (0, presence_js_1.removeOnlineUser)(io, user.id, socket.id);
        });
    });
    return io;
};
exports.initSocket = initSocket;
const getIO = () => {
    if (!ioInstance) {
        throw new Error('Socket.io has not been initialized. Call initSocket first.');
    }
    return ioInstance;
};
exports.getIO = getIO;
