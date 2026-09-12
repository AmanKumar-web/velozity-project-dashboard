"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const env_js_1 = require("./config/env.js");
const index_js_1 = __importDefault(require("./routes/index.js"));
const errorHandler_js_1 = require("./middleware/errorHandler.js");
const createApp = () => {
    const app = (0, express_1.default)();
    // Security and utilities middleware
    app.use((0, cors_1.default)({
        origin: env_js_1.env.CLIENT_URL,
        credentials: true,
    }));
    app.use((0, cookie_parser_1.default)());
    app.use(express_1.default.json());
    // Health check endpoint
    app.get('/health', (_req, res) => {
        res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
    });
    // Main API Router
    app.use('/api', index_js_1.default);
    // 404 Handler
    app.use((req, _res, next) => {
        next(new errorHandler_js_1.AppError(`Resource not found: ${req.method} ${req.originalUrl}`, 404, 'NOT_FOUND'));
    });
    // Centralized Error Handling
    app.use(errorHandler_js_1.errorHandler);
    return app;
};
exports.createApp = createApp;
