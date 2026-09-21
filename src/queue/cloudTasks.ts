import { CloudTasksClient } from '@google-cloud/tasks';
import { config } from '../config/env.js';
import axios from 'axios';

let tasksClient: CloudTasksClient | null = null;

function getTasksClient(): CloudTasksClient | null {
  if (tasksClient) return tasksClient;
  try {
    tasksClient = new CloudTasksClient();
    return tasksClient;
  } catch (err) {
    console.warn('[CloudTasks] CloudTasksClient initialization skipped or unavailable:', (err as Error).message);
    return null;
  }
}

export interface ReminderJobPayload {
  userId: string;
  prayerName: string;
  targetTime: string; // ISO String
}

export async function schedulePrayerTask(
  userId: string,
  prayerName: string,
  targetTime: Date,
  leadTimeMinutes: number = 0
): Promise<void> {
  const scheduledTimeMs = targetTime.getTime() - (leadTimeMinutes * 60 * 1000);
  const delayMs = scheduledTimeMs - Date.now();

  // If time has already passed for today, do not schedule
  if (delayMs < 0) {
    console.log(`[CloudTasks] Time for ${prayerName} (${targetTime.toISOString()}) has already passed today for user ${userId}. Skipping.`);
    return;
  }

  const client = getTasksClient();
  const parent = client ? client.queuePath(config.gcp.projectId, config.gcp.location, config.gcp.queueName) : '';
  const url = `${config.baseUrl}/api/workers/dispatch-reminder`;
  const payload: ReminderJobPayload = {
    userId,
    prayerName,
    targetTime: targetTime.toISOString(),
  };

  if (client && config.gcp.projectId !== 'callerbot-dev') {
    try {
      const scheduledEpochSeconds = Math.floor(scheduledTimeMs / 1000);
      const task = {
        httpRequest: {
          httpMethod: 'POST' as const,
          url,
          headers: { 'Content-Type': 'application/json' },
          body: Buffer.from(JSON.stringify(payload)).toString('base64'),
        },
        scheduleTime: {
          seconds: scheduledEpochSeconds,
        },
      };

      await client.createTask({ parent, task });
      console.log(`[CloudTasks] Scheduled Cloud Task for ${prayerName} at ${new Date(scheduledTimeMs).toLocaleString()} for ${userId}`);
      return;
    } catch (err) {
      console.warn(`[CloudTasks] Failed to schedule Cloud Task via GCP API: ${(err as Error).message}. Falling back to memory timer.`);
    }
  }

  // Local Memory Fallback Scheduler
  console.log(`[LocalScheduler] Scheduled in-memory timer for ${prayerName} in ${Math.round(delayMs / 1000)}s for user ${userId}`);
  setTimeout(async () => {
    try {
      await axios.post(url, payload);
    } catch (err) {
      console.error(`[LocalScheduler] Error triggering local dispatch endpoint:`, (err as Error).message);
    }
  }, delayMs);
}
