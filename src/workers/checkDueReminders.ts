import { userRepository } from '../db/userRepository.js';
import { calculateDailyPrayers, formatPrayerTime, getLocalDateString } from '../domain/prayerTimes.js';
import { sendTelegramNotification } from '../channels/telegram.js';
import { sendWhatsAppNotification, sendWhatsAppInteractiveCheckin } from '../channels/whatsapp.js';

export async function checkAndDispatchDueReminders(): Promise<number> {
  let dispatchedCount = 0;
  try {
    const activeUsers = await userRepository.getAllActiveUsers();
    const now = new Date();

    for (const user of activeUsers) {
      const todayStr = getLocalDateString(now, user.timezone);
      const { schedule } = calculateDailyPrayers(user.latitude, user.longitude, now, user.calculationMethod as any);

      for (const [prayerKey, timeObj] of Object.entries(schedule)) {
        const prayerName = prayerKey.charAt(0).toUpperCase() + prayerKey.slice(1);
        const prayerTime = timeObj as Date;

        // 1. Primary Prayer Time Reminder (Exact time with leadTime offset)
        const targetMs = prayerTime.getTime() - (user.leadTimeMinutes * 60 * 1000);
        const diffMinutes = (now.getTime() - targetMs) / (1000 * 60);
        const lastSentDate = user.lastNotified?.[prayerName];

        if (diffMinutes >= 0 && diffMinutes <= 15 && lastSentDate !== todayStr) {
          const formattedTime = formatPrayerTime(prayerTime, user.timezone);
          console.log(`[SelfHealingScheduler] Dispatching due reminder for ${user.id} -> ${prayerName} at ${formattedTime}`);

          if (user.platform === 'telegram') {
            await sendTelegramNotification(user.chatId, prayerName, formattedTime);
          } else if (user.platform === 'whatsapp') {
            await sendWhatsAppNotification(user.chatId, prayerName, formattedTime);
          }

          await userRepository.markPrayerNotified(user.id, prayerName, todayStr);
          dispatchedCount++;
        }

        // 2. Interactive Check-in (30 minutes after prayer time)
        const checkinTargetMs = prayerTime.getTime() + (30 * 60 * 1000);
        const checkinDiffMinutes = (now.getTime() - checkinTargetMs) / (1000 * 60);
        const checkinKey = `Checkin_${prayerName}`;
        const lastCheckinDate = user.lastNotified?.[checkinKey];

        if (checkinDiffMinutes >= 0 && checkinDiffMinutes <= 15 && lastCheckinDate !== todayStr) {
          console.log(`[SelfHealingScheduler] Dispatching 30-min interactive check-in for ${user.id} -> ${prayerName}`);

          if (user.platform === 'whatsapp') {
            const isOverallIsha = prayerName === 'Isha';
            await sendWhatsAppInteractiveCheckin(user.chatId, prayerName, isOverallIsha);
          }

          await userRepository.markPrayerNotified(user.id, checkinKey, todayStr);
          dispatchedCount++;
        }
      }
    }
  } catch (err) {
    console.error('[SelfHealingScheduler] Error checking due reminders:', (err as Error).message);
  }

  return dispatchedCount;
}

