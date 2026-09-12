import cron from 'node-cron';
import { TaskStatus } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { emitTaskUpdate } from '../socket/emitter.js';

export const initOverdueScheduler = (): cron.ScheduledTask => {
  console.log('⏰ [Cron] Initializing overdue task scheduler (every 5 minutes)...');

  // Schedule every 5 minutes: '*/5 * * * *'
  const task = cron.schedule('*/5 * * * *', async () => {
    try {
      const now = new Date();
      // Find eligible overdue tasks
      const overdueTasks = await prisma.task.findMany({
        where: {
          dueDate: { lt: now },
          status: { not: TaskStatus.DONE },
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

      await prisma.task.updateMany({
        where: { id: { in: overdueIds } },
        data: { isOverdue: true },
      });

      // Broadcast real-time updates for each updated task
      for (const t of overdueTasks) {
        emitTaskUpdate(t.projectId, { ...t, isOverdue: true });
      }

      console.log(`✅ [Cron] Successfully flagged ${overdueTasks.length} tasks as overdue.`);
    } catch (err) {
      console.error('❌ [Cron] Error during overdue task check:', err);
    }
  });

  return task;
};
