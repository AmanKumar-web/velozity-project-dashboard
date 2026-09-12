"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.AppError = void 0;
const zod_1 = require("zod");
const env_js_1 = require("../config/env.js");
class AppError extends Error {
    statusCode;
    code;
    details;
    constructor(message, statusCode = 400, code = 'BAD_REQUEST', details) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
exports.AppError = AppError;
const errorHandler = (err, _req, res, _next) => {
    console.error('⚠️ [ErrorHandler]:', err);
    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            success: false,
            error: {
                message: err.message,
                code: err.code,
                details: err.details,
            },
        });
        return;
    }
    if (err instanceof zod_1.ZodError) {
        res.status(400).json({
            success: false,
            error: {
                message: 'Validation failed',
                code: 'VALIDATION_ERROR',
                details: err.errors.map((e) => ({
                    path: e.path.join('.'),
                    message: e.message,
                })),
            },
        });
        return;
    }
    // Fallback for unhandled unexpected internal errors
    const isDev = env_js_1.env.NODE_ENV === 'development';
    res.status(500).json({
        success: false,
        error: {
            message: isDev ? err.message : 'Internal server error occurred',
            code: 'INTERNAL_SERVER_ERROR',
            details: isDev ? err.stack : undefined,
        },
    });
};
exports.errorHandler = errorHandler;
