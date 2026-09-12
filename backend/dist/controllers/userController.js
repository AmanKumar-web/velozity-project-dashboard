"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClients = exports.getUsers = void 0;
const prisma_js_1 = require("../config/prisma.js");
const getUsers = async (req, res, next) => {
    try {
        const { role } = req.query;
        const users = await prisma_js_1.prisma.user.findMany({
            where: role ? { role: role } : {},
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
            },
            orderBy: { name: 'asc' },
        });
        res.status(200).json({
            success: true,
            data: users,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getUsers = getUsers;
const getClients = async (_req, res, next) => {
    try {
        const clients = await prisma_js_1.prisma.client.findMany({
            orderBy: { name: 'asc' },
        });
        res.status(200).json({
            success: true,
            data: clients,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getClients = getClients;
