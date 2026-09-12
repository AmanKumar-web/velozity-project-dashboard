import http from 'http';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { initSocket } from './socket/index.js';
import { initOverdueScheduler } from './cron/overdueScheduler.js';
import { prisma } from './config/prisma.js';

const app = createApp();
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

// Initialize Background Overdue Task Cron Job
const overdueCron = initOverdueScheduler();

// Start Server
server.listen(env.PORT, () => {
  console.log(`🚀 [Server] Velozity Dashboard API running at http://localhost:${env.PORT}`);
  console.log(`⚡ [Socket] WebSocket gateway listening for connections`);
  console.log(`🌍 [Environment] Mode: ${env.NODE_ENV}`);
});

// Graceful Shutdown
const shutdown = async (signal: string) => {
  console.log(`\n🛑 [Server] Received ${signal}. Shutting down gracefully...`);
  overdueCron.stop();
  server.close(async () => {
    await prisma.$disconnect();
    console.log('🔌 [Database] Prisma disconnected. Exiting process.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
