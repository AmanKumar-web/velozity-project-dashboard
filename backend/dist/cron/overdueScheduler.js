"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initOverdueScheduler = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const client_1 = require("@prisma/client");
const prisma_js_1 = require("../config/prisma.js");
const emitter_js_1 = require("../socket/emitter.js");
const initOverdueScheduler = () => {
    console.log('⏰ [Cron] Initializing overdue task scheduler (every 5 minutes)...');
    // Schedule every 5 minutes: '*/5 * * * *'
    const task = node_cron_1.default.schedule('*/5 * * * *', async () => {
        try {
            const now = new Date();
            // Find eligible overdue tasks
            const overdueTasks = await prisma_js_1.prisma.task.findMany({
                where: {
                    dueDate: { lt: now },
                    status: { not: client_1.TaskStatus.DONE },
                    isOverdue: false,
                },
                include: {
                    assignedDeveloper: { select: { id: true, name: true, email: true } },
                },
            });
            if (overdueTasks.length === 0) {
                return;
            }
            console.log(`⏰ [Cron] Found ${overdueTasks.length} newly overdue tasks. Updating...`);
            const overdueIds = overdueTasks.map((t) => t.id);
            await prisma_js_1.prisma.task.updateMany({
                where: { id: { in: overdueIds } },
                data: { isOverdue: true },
            });
            // Broadcast real-time updates for each updated task
            for (const t of overdueTasks) {
                (0, emitter_js_1.emitTaskUpdate)(t.projectId, { ...t, isOverdue: true });
            }
            console.log(`✅ [Cron] Successfully flagged ${overdueTasks.length} tasks as overdue.`);
        }
        catch (err) {
            console.error('❌ [Cron] Error during overdue task check:', err);
        }
    });
    return task;
};
exports.initOverdueScheduler = initOverdueScheduler;
