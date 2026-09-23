import { Request, Response } from 'express';
import { config } from '../config/env.js';
import { userRepository, UserProfile } from '../db/userRepository.js';
import { calculateDailyPrayers, formatPrayerTime } from '../domain/prayerTimes.js';
import { resolveLocationDetails } from '../domain/geocoding.js';
import { schedulePrayerTask } from '../queue/cloudTasks.js';
import { sendWhatsAppContactCard } from '../channels/whatsapp.js';
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

      // Reverse geocode to resolve exact location details (city, state, country, timezone)
      const locDetails = await resolveLocationDetails(latitude, longitude);

      // Coarsen coordinates to ~1km accuracy for user privacy (2 decimal places)
      const coarsenedLat = Math.round(latitude * 100) / 100;
      const coarsenedLng = Math.round(longitude * 100) / 100;

      console.log(`[WhatsApp Webhook] Received location from ${fromPhoneNumber}: Raw (Lat ${latitude}, Lng ${longitude}) -> Resolved "${locDetails.locationName}" (${locDetails.timezone})`);
      
      const timezone = locDetails.timezone;
      const { schedule } = calculateDailyPrayers(coarsenedLat, coarsenedLng);

      const userProfile: UserProfile = {
        id: userId,
        platform: 'whatsapp',
        chatId: fromPhoneNumber,
        latitude: coarsenedLat,
        longitude: coarsenedLng,
        timezone,
        city: locDetails.city,
        state: locDetails.state,
        country: locDetails.country,
        locationName: locDetails.locationName,
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

      const displayLocation = locDetails.locationName || 'Detected Location';

      // Send immediate location confirmation reply
      try {
        await axios.post(replyUrl, {
          messaging_product: 'whatsapp',
          to: fromPhoneNumber,
          type: 'text',
          text: {
            body: `✅ Location set successfully!\n\n📍 Location: ${displayLocation}\n🕒 Timezone: ${timezone}\n🔒 Privacy: Coordinates anonymized (~1km resolution)\n\nToday's Schedule:\n• Fajr: ${fajrFormatted}\n• Dhuhr: ${dhuhrFormatted}\n• Asr: ${asrFormatted}\n• Maghrib: ${maghribFormatted}\n• Isha: ${ishaFormatted}\n\nNidaa will send quiet text reminders right when it's time to pray.\n\n(Tip: Tap the contact card below to save Nidaa Bot to your phone!)`,
          },
        }, { headers });
        console.log(`[WhatsApp Webhook] Location confirmation sent to ${fromPhoneNumber}`);
        
        // Send vCard Contact attachment so user can save contact with 1 tap
        await sendWhatsAppContactCard(fromPhoneNumber, phoneNumberId);
      } catch (sendErr) {
        console.error(`[WhatsApp Webhook] Error sending location confirmation:`, (sendErr as any).response?.data || (sendErr as Error).message);
      }
    } 
    // 2. Handle Text messages (e.g. "Hi", "Ameen", "Schedule", "STOP")
    else if (message.type === 'text') {
      const rawText = message.text?.body?.trim() || '';
      const textBody = rawText.toUpperCase();

      // Check if sender is an existing registered user
      const existingUser = await userRepository.getUserById(userId);
      
      // A. Data Deletion Command
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

      // B. Registered Active User Flow
      if (existingUser && existingUser.isActive) {
        console.log(`[WhatsApp Webhook] Received text "${rawText}" from registered user ${fromPhoneNumber}`);

        // Response B1: "Ameen" / Gratitude keywords
        const isGratitude = ['AMEEN', 'AMIN', 'JAZAKALLAH', 'JAZAKALLAHU KHAIR', 'SHUKRAN', 'THANKS', 'THANK YOU'].some(w => textBody.includes(w));
        if (isGratitude) {
          try {
            await axios.post(replyUrl, {
              messaging_product: 'whatsapp',
              to: fromPhoneNumber,
              type: 'text',
              text: {
                body: `Wa iyyakum!`,
              },
            }, { headers });
          } catch (sendErr) {
            console.error(`[WhatsApp Webhook] Error sending gratitude response:`, (sendErr as any).response?.data || (sendErr as Error).message);
          }
          return;
        }

        // Response B2: Schedule Request
        const isScheduleReq = ['SCHEDULE', 'TIMES', 'PRAYER', 'PRAYERS', 'TODAY'].includes(textBody);
        if (isScheduleReq) {
          const { schedule } = calculateDailyPrayers(existingUser.latitude, existingUser.longitude);
          const fajrFormatted = formatPrayerTime(schedule.fajr, existingUser.timezone);
          const dhuhrFormatted = formatPrayerTime(schedule.dhuhr, existingUser.timezone);
          const asrFormatted = formatPrayerTime(schedule.asr, existingUser.timezone);
          const maghribFormatted = formatPrayerTime(schedule.maghrib, existingUser.timezone);
          const ishaFormatted = formatPrayerTime(schedule.isha, existingUser.timezone);
          const displayLoc = existingUser.locationName || 'Your Location';

          try {
            await axios.post(replyUrl, {
              messaging_product: 'whatsapp',
              to: fromPhoneNumber,
              type: 'text',
              text: {
                body: `📍 Today's Prayer Schedule (${displayLoc}):\n\n• Fajr: ${fajrFormatted}\n• Dhuhr: ${dhuhrFormatted}\n• Asr: ${asrFormatted}\n• Maghrib: ${maghribFormatted}\n• Isha: ${ishaFormatted}\n\nNidaa will send quiet text reminders right when it's time to pray.`,
              },
            }, { headers });
          } catch (sendErr) {
            console.error(`[WhatsApp Webhook] Error sending schedule response:`, (sendErr as any).response?.data || (sendErr as Error).message);
          }
          return;
        }

        // Response B3: General / Random text from registered user
        try {
          const displayLoc = existingUser.locationName || 'your area';
          await axios.post(replyUrl, {
            messaging_product: 'whatsapp',
            to: fromPhoneNumber,
            type: 'text',
            text: {
              body: ` Nidaa is active for ${displayLoc}.\n\nYou will receive quiet text reminders at prayer times and interactive check-ins 30 minutes after.\n\n• Reply "Schedule" to view today's times\n• Send a new location pin to update your location\n• Reply "STOP" to delete your data`,
            },
          }, { headers });
        } catch (sendErr) {
          console.error(`[WhatsApp Webhook] Error sending active user guidance:`, (sendErr as any).response?.data || (sendErr as Error).message);
        }
        return;
      }

      // C. New User Flow (Not registered yet)
      console.log(`[WhatsApp Webhook] Received text "${rawText}" from new user ${fromPhoneNumber}. Sending onboarding welcome...`);
      try {
        const replyRes = await axios.post(replyUrl, {
          messaging_product: 'whatsapp',
          to: fromPhoneNumber,
          type: 'text',
          text: {
            body: `Assalamu Alaikum! Welcome to Nidaa, your silent mu'adhin.\n\n Please share your location (tap 📎 Paperclip > Location > Send Your Current Location) so we can set up your prayer schedule.\n\n🔒 Privacy First: Your location is anonymized to ~1km and used solely to calculate prayer times. You can permanently delete your data anytime by texting "STOP" or "DELETE".`,
          },
        }, { headers });
        console.log(`[WhatsApp Webhook] Welcome reply sent to ${fromPhoneNumber}, Message ID:`, replyRes.data?.messages?.[0]?.id);

        // Send vCard Contact attachment so user can save contact with 1 tap
        await sendWhatsAppContactCard(fromPhoneNumber, phoneNumberId);
      } catch (sendErr) {
        console.error(`[WhatsApp Webhook] Error sending welcome reply to ${fromPhoneNumber}:`, (sendErr as any).response?.data || (sendErr as Error).message);
      }
    }
    // 3. Handle Interactive Button Replies ([ Prayed on time ], [ Prayed late ], [ Missed ])
    else if (message.type === 'interactive') {
      const buttonReply = message.interactive?.button_reply;
      const replyId = buttonReply?.id || '';
      const replyTitle = buttonReply?.title || '';
      console.log(`[WhatsApp Webhook] Interactive reply from ${fromPhoneNumber}: "${replyTitle}" (ID: ${replyId})`);

      let responseText = "Alhamdulillah! May Allah accept your prayer and grant you steadfastness. 🤲";
      if (replyId.includes('late') || replyId.includes('some_late')) {
        responseText = "May Allah reward your effort and bless your time! Strive to pray on time for maximum blessings. 🌙";
      } else if (replyId.includes('missed')) {
        responseText = "Don't be discouraged! Make up (Qada) your prayer as soon as possible and make Istighfar. May Allah make it easy for you. 🤲";
      }

      try {
        await axios.post(replyUrl, {
          messaging_product: 'whatsapp',
          to: fromPhoneNumber,
          type: 'text',
          text: { body: responseText },
        }, { headers });
        console.log(`[WhatsApp Webhook] Sent feedback reply to interactive selection by ${fromPhoneNumber}`);
      } catch (sendErr) {
        console.error(`[WhatsApp Webhook] Error sending interactive feedback to ${fromPhoneNumber}:`, (sendErr as any).response?.data || (sendErr as Error).message);
      }
    }
  } catch (err) {
    console.error('[WhatsApp Webhook] Error processing incoming payload:', (err as Error).message);
  }
};
