import { Bot, Keyboard } from 'grammy';
import { config } from '../config/env.js';
import { userRepository, UserProfile } from '../db/userRepository.js';
import { calculateDailyPrayers, getRandomReflection, formatPrayerTime } from '../domain/prayerTimes.js';
import { schedulePrayerTask } from '../queue/cloudTasks.js';

export const telegramBot = new Bot(config.telegramBotToken || 'DUMMY_TOKEN_FOR_DEV');

// /start Command Handler
telegramBot.command('start', async (ctx) => {
  const locationKeyboard = new Keyboard()
    .requestLocation('📍 Share My Location')
    .oneTime()
    .resized();

  await ctx.reply(
    `*Nidaa*\n` +
    `_The gentle call to prayer. Your silent mu’adhin._\n\n` +
    `Assalamu Alaikum! Welcome to *Nidaa*, quiet, peaceful text reminders right when it's time to pray.\n\n` +
    `Nidaa provides discreet reminders ideal for office, meeting, or silent environments—helping you stay connected without loud alarms.\n\n` +
    `Please tap the button below to share your location so we can calculate accurate prayer times for your area.`,
    {
      parse_mode: 'Markdown',
      reply_markup: locationKeyboard,
    }
  );
});

// Location Message Handler
telegramBot.on('message:location', async (ctx) => {
  const { latitude, longitude } = ctx.message.location;
  const userId = `tg_${ctx.from.id}`;
  const chatId = ctx.from.id.toString();

  const { timezone, schedule } = calculateDailyPrayers(latitude, longitude);

  const userProfile: UserProfile = {
    id: userId,
    platform: 'telegram',
    chatId,
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

  // Immediately schedule today's remaining prayer tasks
  for (const [prayerName, time] of Object.entries(schedule)) {
    const capitalizedName = prayerName.charAt(0).toUpperCase() + prayerName.slice(1);
    try {
      await schedulePrayerTask(userId, capitalizedName, time as Date, userProfile.leadTimeMinutes);
    } catch (schedErr) {
      console.error(`[Telegram] Error scheduling prayer task for ${capitalizedName}:`, (schedErr as Error).message);
    }
  }

  const fajrFormatted = formatPrayerTime(schedule.fajr, timezone);
  const dhuhrFormatted = formatPrayerTime(schedule.dhuhr, timezone);
  const asrFormatted = formatPrayerTime(schedule.asr, timezone);
  const maghribFormatted = formatPrayerTime(schedule.maghrib, timezone);
  const ishaFormatted = formatPrayerTime(schedule.isha, timezone);

  await ctx.reply(
    `✅ *Location set successfully!*\n\n` +
    `📍 Timezone: *${timezone}*\n\n` +
    `*Today's Schedule:*\n` +
    `• Fajr: ${fajrFormatted}\n` +
    `• Dhuhr: ${dhuhrFormatted}\n` +
    `• Asr: ${asrFormatted}\n` +
    `• Maghrib: ${maghribFormatted}\n` +
    `• Isha: ${ishaFormatted}\n\n` +
    `Nidaa will send gentle text reminders right when it's time to pray.`,
    { parse_mode: 'Markdown' }
  );
});

// Send Notification via Telegram
export async function sendTelegramNotification(
  chatId: string,
  prayerName: string,
  targetTimeFormatted: string
): Promise<void> {
  const reflection = getRandomReflection(prayerName);
  const message =
    `*Nidaa*\n` +
    `It is time for *${prayerName}* (${targetTimeFormatted}).\n` +
    `_${reflection}_`;

  try {
    await telegramBot.api.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    console.log(`[Telegram] Successfully delivered Nidaa ${prayerName} notification to ${chatId}`);
  } catch (err) {
    console.error(`[Telegram] Failed to send message to ${chatId}:`, (err as Error).message);
  }
}
