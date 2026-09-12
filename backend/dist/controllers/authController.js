"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.logout = exports.refresh = exports.login = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_js_1 = require("../config/prisma.js");
const env_js_1 = require("../config/env.js");
const errorHandler_js_1 = require("../middleware/errorHandler.js");
const REFRESH_COOKIE_NAME = 'refreshToken';
const REFRESH_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: env_js_1.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await prisma_js_1.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            throw new errorHandler_js_1.AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!isMatch) {
            throw new errorHandler_js_1.AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
        }
        const payload = {
            userId: user.id,
            email: user.email,
            role: user.role,
        };
        const accessToken = jsonwebtoken_1.default.sign(payload, env_js_1.env.JWT_ACCESS_SECRET, {
            expiresIn: env_js_1.env.JWT_ACCESS_EXPIRES_IN,
        });
        const refreshToken = jsonwebtoken_1.default.sign(payload, env_js_1.env.JWT_REFRESH_SECRET, {
            expiresIn: env_js_1.env.JWT_REFRESH_EXPIRES_IN,
        });
        // Save refresh token to database
        await prisma_js_1.prisma.user.update({
            where: { id: user.id },
            data: { refreshToken },
        });
        // Set refresh token in HttpOnly cookie
        res.cookie(REFRESH_COOKIE_NAME, refreshToken, REFRESH_COOKIE_OPTIONS);
        res.status(200).json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                },
                accessToken,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
const refresh = async (req, res, next) => {
    try {
        const oldRefreshToken = req.cookies[REFRESH_COOKIE_NAME];
        if (!oldRefreshToken) {
            throw new errorHandler_js_1.AppError('Refresh token missing', 401, 'REFRESH_TOKEN_REQUIRED');
        }
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(oldRefreshToken, env_js_1.env.JWT_REFRESH_SECRET);
        }
        catch (err) {
            res.clearCookie(REFRESH_COOKIE_NAME);
            throw new errorHandler_js_1.AppError('Refresh token expired or invalid', 401, 'INVALID_REFRESH_TOKEN');
        }
        const user = await prisma_js_1.prisma.user.findUnique({
            where: { id: decoded.userId },
        });
        if (!user || user.refreshToken !== oldRefreshToken) {
            res.clearCookie(REFRESH_COOKIE_NAME);
            throw new errorHandler_js_1.AppError('Refresh token reused or invalidated', 401, 'TOKEN_REVOKED');
        }
        const payload = {
            userId: user.id,
            email: user.email,
            role: user.role,
        };
        // Rotate refresh token
        const newAccessToken = jsonwebtoken_1.default.sign(payload, env_js_1.env.JWT_ACCESS_SECRET, {
            expiresIn: env_js_1.env.JWT_ACCESS_EXPIRES_IN,
        });
        const newRefreshToken = jsonwebtoken_1.default.sign(payload, env_js_1.env.JWT_REFRESH_SECRET, {
            expiresIn: env_js_1.env.JWT_REFRESH_EXPIRES_IN,
        });
        await prisma_js_1.prisma.user.update({
            where: { id: user.id },
            data: { refreshToken: newRefreshToken },
        });
        res.cookie(REFRESH_COOKIE_NAME, newRefreshToken, REFRESH_COOKIE_OPTIONS);
        res.status(200).json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                },
                accessToken: newAccessToken,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.refresh = refresh;
const logout = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (userId) {
            await prisma_js_1.prisma.user.update({
                where: { id: userId },
                data: { refreshToken: null },
            });
        }
        res.clearCookie(REFRESH_COOKIE_NAME);
        res.status(200).json({
            success: true,
            data: { message: 'Logged out successfully' },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.logout = logout;
const getMe = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errorHandler_js_1.AppError('Not authenticated', 401, 'UNAUTHORIZED');
        }
        const user = await prisma_js_1.prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
            },
        });
        if (!user) {
            throw new errorHandler_js_1.AppError('User not found', 404, 'NOT_FOUND');
        }
        res.status(200).json({
            success: true,
            data: user,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getMe = getMe;
