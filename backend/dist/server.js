"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const app_js_1 = require("./app.js");
const env_js_1 = require("./config/env.js");
const index_js_1 = require("./socket/index.js");
const overdueScheduler_js_1 = require("./cron/overdueScheduler.js");
const prisma_js_1 = require("./config/prisma.js");
const app = (0, app_js_1.createApp)();
const server = http_1.default.createServer(app);
// Initialize Socket.io
(0, index_js_1.initSocket)(server);
// Initialize Background Overdue Task Cron Job
const overdueCron = (0, overdueScheduler_js_1.initOverdueScheduler)();
// Start Server
server.listen(env_js_1.env.PORT, () => {
    console.log(`🚀 [Server] Velozity Dashboard API running at http://localhost:${env_js_1.env.PORT}`);
    console.log(`⚡ [Socket] WebSocket gateway listening for connections`);
    console.log(`🌍 [Environment] Mode: ${env_js_1.env.NODE_ENV}`);
});
// Graceful Shutdown
const shutdown = async (signal) => {
    console.log(`\n🛑 [Server] Received ${signal}. Shutting down gracefully...`);
    overdueCron.stop();
    server.close(async () => {
        await prisma_js_1.prisma.$disconnect();
        console.log('🔌 [Database] Prisma disconnected. Exiting process.');
        process.exit(0);
    });
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
