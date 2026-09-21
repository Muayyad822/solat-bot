import axios from 'axios';
import { config } from '../config/env.js';
import { getRandomReflection } from '../domain/prayerTimes.js';

export async function sendWhatsAppNotification(
  phoneNumber: string,
  prayerName: string,
  targetTimeFormatted: string
): Promise<void> {
  const reflection = getRandomReflection(prayerName);

  if (!config.whatsapp.phoneNumberId || !config.whatsapp.accessToken) {
    console.warn(`[WhatsApp] Missing WHATSAPP_PHONE_NUMBER_ID or WHATSAPP_ACCESS_TOKEN. Mocking message delivery to ${phoneNumber}`);
    console.log(`[WhatsApp Mock Message]\nIt is time for ${prayerName} at ${targetTimeFormatted}.\nReflection: ${reflection}\n\nPowered by Nidaa.`);
    return;
  }

  const url = `https://graph.facebook.com/v20.0/${config.whatsapp.phoneNumberId}/messages`;

  // Pre-Approved Utility Template Payload for Nidaa
  const templatePayload = {
    messaging_product: 'whatsapp',
    to: phoneNumber,
    type: 'template',
    template: {
      name: 'nidaa_prayer_reminder',
      language: { code: 'en' },
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: prayerName },
            { type: 'text', text: targetTimeFormatted },
            { type: 'text', text: reflection },
          ],
        },
      ],
    },
  };

  try {
    const response = await axios.post(url, templatePayload, {
      headers: {
        Authorization: `Bearer ${config.whatsapp.accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    console.log(`[WhatsApp] Successfully sent Nidaa template message to ${phoneNumber}. Message ID:`, response.data?.messages?.[0]?.id);
  } catch (err) {
    console.error(`[WhatsApp] Error sending Nidaa message via Meta Graph API:`, (err as any).response?.data || (err as Error).message);
  }
}
