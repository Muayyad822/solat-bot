import { userRepository } from '../db/userRepository.js';
import { calculateDailyPrayers, formatPrayerTime } from '../domain/prayerTimes.js';
import { sendTelegramNotification } from '../channels/telegram.js';
import { sendWhatsAppNotification } from '../channels/whatsapp.js';

export async function checkAndDispatchDueReminders(): Promise<number> {
  let dispatchedCount = 0;
  try {
    const activeUsers = await userRepository.getAllActiveUsers();
    const now = new Date();

    for (const user of activeUsers) {
      const todayStr = now.toISOString().split('T')[0];
      const { schedule } = calculateDailyPrayers(user.latitude, user.longitude, now, user.calculationMethod as any);

      for (const [prayerKey, timeObj] of Object.entries(schedule)) {
        const prayerName = prayerKey.charAt(0).toUpperCase() + prayerKey.slice(1);
        const prayerTime = timeObj as Date;

        // Apply lead time offset
        const targetMs = prayerTime.getTime() - (user.leadTimeMinutes * 60 * 1000);
        const diffMinutes = (now.getTime() - targetMs) / (1000 * 60);

        // Check if prayer time is due (between 0 and 5 minutes past target time)
        // AND has not been sent today yet
        const lastSentDate = user.lastNotified?.[prayerName];

        if (diffMinutes >= 0 && diffMinutes <= 5 && lastSentDate !== todayStr) {
          const formattedTime = formatPrayerTime(prayerTime, user.timezone);

          console.log(`[SelfHealingScheduler] Dispatching due reminder for ${user.id} -> ${prayerName} at ${formattedTime}`);

          if (user.platform === 'telegram') {
            await sendTelegramNotification(user.chatId, prayerName, formattedTime);
          } else if (user.platform === 'whatsapp') {
            await sendWhatsAppNotification(user.chatId, prayerName, formattedTime);
          }

          // Mark as notified today to prevent double sending
          await userRepository.markPrayerNotified(user.id, prayerName, todayStr);
          dispatchedCount++;
        }
      }
    }
  } catch (err) {
    console.error('[SelfHealingScheduler] Error checking due reminders:', (err as Error).message);
  }

  return dispatchedCount;
}
