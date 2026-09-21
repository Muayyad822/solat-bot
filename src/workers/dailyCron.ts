import { Request, Response } from 'express';
import { userRepository } from '../db/userRepository.js';
import { calculateDailyPrayers } from '../domain/prayerTimes.js';
import { schedulePrayerTask } from '../queue/cloudTasks.js';

export const runDailyCronJob = async (req: Request, res: Response) => {
  console.log('[DailyCronJob] Starting daily schedule generation for all active users...');
  try {
    const activeUsers = await userRepository.getAllActiveUsers();
    let totalScheduled = 0;

    for (const user of activeUsers) {
      const today = new Date();
      const { schedule } = calculateDailyPrayers(user.latitude, user.longitude, today, user.calculationMethod as any);

      for (const [prayerName, time] of Object.entries(schedule)) {
        const capitalizedName = prayerName.charAt(0).toUpperCase() + prayerName.slice(1);
        await schedulePrayerTask(user.id, capitalizedName, time as Date, user.leadTimeMinutes);
        totalScheduled++;
      }
    }

    console.log(`[DailyCronJob] Daily scheduling complete. Scheduled ${totalScheduled} tasks across ${activeUsers.length} active users.`);
    res.status(200).json({ status: 'success', activeUsers: activeUsers.length, tasksScheduled: totalScheduled });
  } catch (err) {
    console.error('[DailyCronJob] Error generating daily schedules:', (err as Error).message);
    res.status(500).json({ error: (err as Error).message });
  }
};
