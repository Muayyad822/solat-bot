import { Request, Response } from 'express';
import { config } from '../config/env.js';
import { userRepository, UserProfile } from '../db/userRepository.js';
import { calculateDailyPrayers, formatPrayerTime } from '../domain/prayerTimes.js';
import { schedulePrayerTask } from '../queue/cloudTasks.js';

// GET verification for Meta Webhook Registration
export const verifyWhatsAppWebhook = (req: Request, res: Response) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === config.whatsapp.verifyToken) {
      console.log('[WhatsApp Webhook] Webhook verified successfully.');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  } else {
    res.sendStatus(400);
  }
};

// POST handler for incoming WhatsApp messages
export const handleWhatsAppWebhook = async (req: Request, res: Response) => {
  res.status(200).send('EVENT_RECEIVED');

  try {
    const body = req.body;
    if (body.object !== 'whatsapp_business_account') return;

    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const message = value?.messages?.[0];

    if (!message) return;

    const fromPhoneNumber = message.from; // Phone number of sender
    const userId = `wa_${fromPhoneNumber}`;

    // 1. Handle incoming Location message
    if (message.type === 'location') {
      const { latitude, longitude } = message.location;
      const { timezone, schedule } = calculateDailyPrayers(latitude, longitude);

      const userProfile: UserProfile = {
        id: userId,
        platform: 'whatsapp',
        chatId: fromPhoneNumber,
        latitude,
        longitude,
        timezone,
        calculationMethod: 'MuslimWorldLeague',
        leadTimeMinutes: 0,
        isActive: true,
        lastNotified: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await userRepository.saveUser(userProfile);

      // Schedule remaining prayer times for today
      for (const [prayerName, time] of Object.entries(schedule)) {
        const capitalizedName = prayerName.charAt(0).toUpperCase() + prayerName.slice(1);
        await schedulePrayerTask(userId, capitalizedName, time as Date, userProfile.leadTimeMinutes);
      }

      const dhuhrFormatted = formatPrayerTime(schedule.dhuhr, timezone);
      console.log(`[WhatsApp Webhook] Location saved for WhatsApp user ${fromPhoneNumber} (${timezone}). Next prayer Dhuhr: ${dhuhrFormatted}`);
    }
  } catch (err) {
    console.error('[WhatsApp Webhook] Error processing incoming payload:', (err as Error).message);
  }
};
