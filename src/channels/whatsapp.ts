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

  // 1. Try sending via Pre-Approved Utility/Marketing Template (nidaa_prayer_alert)
  const templatePayload = {
    messaging_product: 'whatsapp',
    to: phoneNumber,
    type: 'template',
    template: {
      name: 'nidaa_prayer_alert',
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

  // 2. Fallback Free-Form Text Message (Works instantly inside active 24h user window while template is in review)
  const textPayload = {
    messaging_product: 'whatsapp',
    to: phoneNumber,
    type: 'text',
    text: {
      body: `It is time for ${prayerName} at ${targetTimeFormatted}.\n\nReflection: ${reflection}\n\nPowered by Nidaa.`,
    },
  };

  try {
    const response = await axios.post(url, templatePayload, {
      headers: {
        Authorization: `Bearer ${config.whatsapp.accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    console.log(`[WhatsApp] Successfully sent Nidaa template 'nidaa_prayer_alert' to ${phoneNumber}. Message ID:`, response.data?.messages?.[0]?.id);
  } catch (err) {
    console.warn(`[WhatsApp] Template 'nidaa_prayer_alert' failed or in review. Retrying with 'nidaa_prayer_reminder'...`);
    
    // Fallback attempt to nidaa_prayer_reminder
    const legacyTemplatePayload = { ...templatePayload, template: { ...templatePayload.template, name: 'nidaa_prayer_reminder' } };
    try {
      const legacyRes = await axios.post(url, legacyTemplatePayload, {
        headers: { Authorization: `Bearer ${config.whatsapp.accessToken}`, 'Content-Type': 'application/json' },
      });
      console.log(`[WhatsApp] Successfully sent legacy template 'nidaa_prayer_reminder' to ${phoneNumber}. Message ID:`, legacyRes.data?.messages?.[0]?.id);
      return;
    } catch (legacyErr) {
      console.warn(`[WhatsApp] Legacy template also failed. Falling back to free-form text payload...`);
    }

    try {
      const fallbackResponse = await axios.post(url, textPayload, {
        headers: {
          Authorization: `Bearer ${config.whatsapp.accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      console.log(`[WhatsApp] Successfully delivered fallback text message to ${phoneNumber}. Message ID:`, fallbackResponse.data?.messages?.[0]?.id);
    } catch (fallbackErr) {
      console.error(`[WhatsApp] Error sending fallback text message via Meta Graph API:`, (fallbackErr as any).response?.data || (fallbackErr as Error).message);
    }
  }
}

export async function sendWhatsAppInteractiveCheckin(
  phoneNumber: string,
  prayerName: string,
  isOverallIsha: boolean = false
): Promise<void> {
  if (!config.whatsapp.phoneNumberId || !config.whatsapp.accessToken) {
    console.warn(`[WhatsApp] Missing credentials. Mocking interactive check-in to ${phoneNumber}`);
    console.log(`[WhatsApp Mock Checkin] Prayer: ${prayerName}, Overall: ${isOverallIsha}`);
    return;
  }

  const url = `https://graph.facebook.com/v20.0/${config.whatsapp.phoneNumberId}/messages`;

  const bodyText = isOverallIsha
    ? `Assalamu Alaikum! 🌙\n\nHow was your overall Salah today?`
    : `Assalamu Alaikum! 🕌\n\nDid you perform your ${prayerName} prayer?`;

  const buttons = isOverallIsha
    ? [
        { type: 'reply', reply: { id: 'btn_all_ontime', title: 'Prayed all on time' } },
        { type: 'reply', reply: { id: 'btn_some_late', title: 'Prayed (some late)' } },
        { type: 'reply', reply: { id: 'btn_missed_some', title: 'Missed some' } },
      ]
    : [
        { type: 'reply', reply: { id: `btn_${prayerName.toLowerCase()}_ontime`, title: 'Prayed on time' } },
        { type: 'reply', reply: { id: `btn_${prayerName.toLowerCase()}_late`, title: 'Prayed late' } },
        { type: 'reply', reply: { id: `btn_${prayerName.toLowerCase()}_missed`, title: 'Missed' } },
      ];


  const interactivePayload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: phoneNumber,
    type: 'interactive',
    interactive: {
      type: 'button',
      body: { text: bodyText },
      action: { buttons },
    },
  };

  try {
    const res = await axios.post(url, interactivePayload, {
      headers: {
        Authorization: `Bearer ${config.whatsapp.accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    console.log(`[WhatsApp] Interactive check-in sent to ${phoneNumber}. Message ID:`, res.data?.messages?.[0]?.id);
  } catch (err: any) {
    console.error(`[WhatsApp] Failed to send interactive check-in to ${phoneNumber}:`, err.response?.data || err.message);
  }
}

export async function sendWhatsAppContactCard(
  phoneNumber: string,
  customPhoneNumberId?: string
): Promise<void> {
  const pId = customPhoneNumberId || config.whatsapp.phoneNumberId;
  if (!pId || !config.whatsapp.accessToken) return;

  const url = `https://graph.facebook.com/v20.0/${pId}/messages`;
  const contactPayload = {
    messaging_product: 'whatsapp',
    to: phoneNumber,
    type: 'contacts',
    contacts: [
      {
        name: {
          formatted_name: 'Nidaa Bot',
          first_name: 'Nidaa',
          last_name: 'Bot',
        },
        phones: [
          {
            phone: '+2349017109582',
            type: 'WORK',
            wa_id: '2349017109582',
          },
        ],
        org: {
          company: 'Nidaa Solat Reminders',
          title: "The gentle call to prayer. Your silent mu'adhin.",
        },
        urls: [
          {
            url: 'https://nidaa-bot.onrender.com',
            type: 'WORK',
          },
        ],
      },
    ],
  };

  try {
    await axios.post(url, contactPayload, {
      headers: {
        Authorization: `Bearer ${config.whatsapp.accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    console.log(`[WhatsApp] Successfully sent Contact Card (vCard) to ${phoneNumber}`);
  } catch (err) {
    console.error(`[WhatsApp] Failed to send Contact Card to ${phoneNumber}:`, (err as any).response?.data || (err as Error).message);
  }
}

