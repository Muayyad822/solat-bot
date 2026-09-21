import { Request, Response } from 'express';
import { userRepository } from '../db/userRepository.js';
import { sendTelegramNotification } from '../channels/telegram.js';
import { sendWhatsAppNotification } from '../channels/whatsapp.js';
import { formatPrayerTime } from '../domain/prayerTimes.js';

export const handleDispatchReminder = async (req: Request, res: Response) => {
  const { userId, prayerName, targetTime } = req.body;

  if (!userId || !prayerName || !targetTime) {
    res.status(400).json({ error: 'Missing required payload parameters: userId, prayerName, targetTime' });
    return;
  }

  console.log(`[DispatchWorker] Processing reminder for user ${userId} -> ${prayerName} at ${targetTime}`);

  try {
    const user = await userRepository.getUserById(userId);
    if (!user || !user.isActive) {
      console.log(`[DispatchWorker] User ${userId} is inactive or not found. Skipping dispatch.`);
      res.status(200).json({ status: 'skipped', reason: 'user_inactive_or_not_found' });
      return;
    }

    const date = new Date(targetTime);
    const formattedTime = formatPrayerTime(date, user.timezone);

    if (user.platform === 'telegram') {
      await sendTelegramNotification(user.chatId, prayerName, formattedTime);
    } else if (user.platform === 'whatsapp') {
      await sendWhatsAppNotification(user.chatId, prayerName, formattedTime);
    }

    res.status(200).json({ status: 'success', userId, prayerName, targetTime: formattedTime });
  } catch (err) {
    console.error(`[DispatchWorker] Error executing dispatch for user ${userId}:`, (err as Error).message);
    res.status(500).json({ error: (err as Error).message });
  }
};
