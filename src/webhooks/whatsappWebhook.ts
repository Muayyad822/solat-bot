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

    const phoneNumberId = value?.metadata?.phone_number_id || config.whatsapp.phoneNumberId;

    // Check configuration
    if (!phoneNumberId || !config.whatsapp.accessToken) {
      console.error('[WhatsApp Webhook] ERROR: WHATSAPP_PHONE_NUMBER_ID or WHATSAPP_ACCESS_TOKEN is missing in environment variables!');
      return;
    }

    const replyUrl = `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`;
    const headers = { Authorization: `Bearer ${config.whatsapp.accessToken}` };

    // 1. Handle incoming Location payload
    if (message.type === 'location') {
      const { latitude, longitude } = message.location;
      // Coarsen coordinates to ~1km accuracy for user privacy (2 decimal places)
      const coarsenedLat = Math.round(latitude * 100) / 100;
      const coarsenedLng = Math.round(longitude * 100) / 100;

      console.log(`[WhatsApp Webhook] Received location from ${fromPhoneNumber}: Raw (Lat ${latitude}, Lng ${longitude}) -> Coarsened (Lat ${coarsenedLat}, Lng ${coarsenedLng})`);
      
      const { timezone, schedule } = calculateDailyPrayers(coarsenedLat, coarsenedLng);

      const userProfile: UserProfile = {
        id: userId,
        platform: 'whatsapp',
        chatId: fromPhoneNumber,
        latitude: coarsenedLat,
        longitude: coarsenedLng,
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
        try {
          await schedulePrayerTask(userId, capitalizedName, time as Date, userProfile.leadTimeMinutes);
        } catch (schedErr) {
          console.error(`[WhatsApp Webhook] Error scheduling prayer task for ${capitalizedName}:`, (schedErr as Error).message);
        }
      }

      const fajrFormatted = formatPrayerTime(schedule.fajr, timezone);
      const dhuhrFormatted = formatPrayerTime(schedule.dhuhr, timezone);
      const asrFormatted = formatPrayerTime(schedule.asr, timezone);
      const maghribFormatted = formatPrayerTime(schedule.maghrib, timezone);
      const ishaFormatted = formatPrayerTime(schedule.isha, timezone);

      // Send immediate location confirmation reply
      try {
        await axios.post(replyUrl, {
          messaging_product: 'whatsapp',
          to: fromPhoneNumber,
          type: 'text',
          text: {
            body: `✅ Location set successfully!\n\n📍 Timezone: ${timezone}\n🔒 Privacy: Coordinates anonymized (~1km resolution)\n\nToday's Schedule:\n• Fajr: ${fajrFormatted}\n• Dhuhr: ${dhuhrFormatted}\n• Asr: ${asrFormatted}\n• Maghrib: ${maghribFormatted}\n• Isha: ${ishaFormatted}\n\nNidaa will send quiet text reminders right when it's time to pray.\n\n(Tip: Text "STOP" or "DELETE" anytime to permanently delete your data).`,
          },
        }, { headers });
        console.log(`[WhatsApp Webhook] Location confirmation sent to ${fromPhoneNumber}`);
      } catch (sendErr) {
        console.error(`[WhatsApp Webhook] Error sending location confirmation:`, (sendErr as any).response?.data || (sendErr as Error).message);
      }
    } 
    // 2. Handle Text messages (e.g. "Hi", "STOP", "/delete")
    else if (message.type === 'text') {
      const textBody = message.text?.body?.trim().toUpperCase() || '';
      
      // Data Deletion Command
      if (['STOP', 'DELETE', '/DELETE', 'UNSUBSCRIBE', 'REMOVE'].includes(textBody)) {
        console.log(`[WhatsApp Webhook] Deletion request received from ${fromPhoneNumber}. Wiping profile...`);
        await userRepository.deleteUser(userId);
        try {
          await axios.post(replyUrl, {
            messaging_product: 'whatsapp',
            to: fromPhoneNumber,
            type: 'text',
            text: {
              body: `🗑️ Your location and schedule data have been permanently deleted from Nidaa.\n\nYou will no longer receive prayer reminders. If you wish to re-subscribe in the future, simply text "Hi".`,
            },
          }, { headers });
        } catch (sendErr) {
          console.error(`[WhatsApp Webhook] Error sending deletion response:`, (sendErr as any).response?.data || (sendErr as Error).message);
        }
        return;
      }

      console.log(`[WhatsApp Webhook] Received text "${message.text?.body}" from ${fromPhoneNumber}. Sending welcome message...`);
      try {
        const replyRes = await axios.post(replyUrl, {
          messaging_product: 'whatsapp',
          to: fromPhoneNumber,
          type: 'text',
          text: {
            body: `Assalamu Alaikum! Welcome to Nidaa, your silent mu'adhin.\n\n🔒 Privacy First: Your location is anonymized to ~1km and used solely to calculate prayer times. You can permanently delete your data anytime by texting "STOP" or "DELETE".\n\nPlease share your location (tap 📎 Paperclip > Location > Send Your Current Location) so we can set up your prayer schedule.`,
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
