import { Request, Response } from 'express';
import { config } from '../config/env.js';
import { userRepository, UserProfile } from '../db/userRepository.js';
import { calculateDailyPrayers, formatPrayerTime } from '../domain/prayerTimes.js';
import { schedulePrayerTask } from '../queue/cloudTasks.js';
import axios from 'axios';

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
    console.log('[WhatsApp Webhook] Received payload:', JSON.stringify(body));

    if (body.object !== 'whatsapp_business_account') return;

    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const message = value?.messages?.[0];

    if (!message) {
      console.log('[WhatsApp Webhook] No message in payload (might be status update notification).');
      return;
    }

    const fromPhoneNumber = message.from; // Sender phone number
    const userId = `wa_${fromPhoneNumber}`;
    console.log(`[WhatsApp Webhook] Processing message from ${fromPhoneNumber}, type: ${message.type}`);

    // Check configuration
    if (!config.whatsapp.phoneNumberId || !config.whatsapp.accessToken) {
      console.error('[WhatsApp Webhook] ERROR: WHATSAPP_PHONE_NUMBER_ID or WHATSAPP_ACCESS_TOKEN is missing in environment variables!');
      return;
    }

    const replyUrl = `https://graph.facebook.com/v20.0/${config.whatsapp.phoneNumberId}/messages`;
    const headers = { Authorization: `Bearer ${config.whatsapp.accessToken}` };

    // 1. Handle incoming Location payload
    if (message.type === 'location') {
      const { latitude, longitude } = message.location;
      console.log(`[WhatsApp Webhook] Received location from ${fromPhoneNumber}: Lat ${latitude}, Lng ${longitude}`);
      
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

      const fajrFormatted = formatPrayerTime(schedule.fajr, timezone);
      const dhuhrFormatted = formatPrayerTime(schedule.dhuhr, timezone);
      const asrFormatted = formatPrayerTime(schedule.asr, timezone);

      // Send immediate location confirmation reply
      try {
        await axios.post(replyUrl, {
          messaging_product: 'whatsapp',
          to: fromPhoneNumber,
          type: 'text',
          text: {
            body: `✅ Location set successfully!\n\n📍 Timezone: ${timezone}\n\nToday's Schedule:\n• Fajr: ${fajrFormatted}\n• Dhuhr: ${dhuhrFormatted}\n• Asr: ${asrFormatted}\n\nNidaa will send quiet text reminders right when it's time to pray.`,
          },
        }, { headers });
        console.log(`[WhatsApp Webhook] Location confirmation sent to ${fromPhoneNumber}`);
      } catch (sendErr) {
        console.error(`[WhatsApp Webhook] Error sending location confirmation:`, (sendErr as any).response?.data || (sendErr as Error).message);
      }
    } 
    // 2. Handle Text messages (e.g. "Hi", "Start")
    else if (message.type === 'text') {
      console.log(`[WhatsApp Webhook] Received text "${message.text?.body}" from ${fromPhoneNumber}. Sending welcome message...`);
      try {
        const replyRes = await axios.post(replyUrl, {
          messaging_product: 'whatsapp',
          to: fromPhoneNumber,
          type: 'text',
          text: {
            body: `Assalamu Alaikum! Welcome to Nidaa, your silent mu'adhin.\n\nPlease share your location (tap 📎 Paperclip > Location > Send Your Current Location) so we can calculate accurate prayer times for your area.`,
          },
        }, { headers });
        console.log(`[WhatsApp Webhook] Welcome reply sent to ${fromPhoneNumber}, Message ID:`, replyRes.data?.messages?.[0]?.id);
      } catch (sendErr) {
        console.error(`[WhatsApp Webhook] Error sending welcome reply to ${fromPhoneNumber}:`, (sendErr as any).response?.data || (sendErr as Error).message);
      }
    }
  } catch (err) {
    console.error('[WhatsApp Webhook] Error processing incoming payload:', (err as Error).message);
  }
};
