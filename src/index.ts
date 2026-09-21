import express from 'express';
import { config } from './config/env.js';
import { handleTelegramWebhook } from './webhooks/telegramWebhook.js';
import { verifyWhatsAppWebhook, handleWhatsAppWebhook } from './webhooks/whatsappWebhook.js';
import { runDailyCronJob } from './workers/dailyCron.js';
import { handleDispatchReminder } from './workers/dispatchReminder.js';
import { checkAndDispatchDueReminders } from './workers/checkDueReminders.js';

const app = express();
app.use(express.json());

// Health Check Endpoint (Triggered by cron-job.org every 10 mins & auto-dispatches due reminders)
app.get('/health', async (req, res) => {
  const dispatched = await checkAndDispatchDueReminders();
  res.status(200).json({
    status: 'ok',
    bot: 'Nidaa 🌙',
    tagline: 'The gentle call to prayer. Your silent mu’adhin.',
    dispatchedDueReminders: dispatched,
    timestamp: new Date().toISOString(),
  });
});

// Telegram Webhook
app.post('/api/webhooks/telegram', handleTelegramWebhook);

// WhatsApp Cloud API Webhooks
app.get('/api/webhooks/whatsapp', verifyWhatsAppWebhook);
app.post('/api/webhooks/whatsapp', handleWhatsAppWebhook);

// Workers & Scheduler Endpoints
app.post('/api/workers/daily-cron', runDailyCronJob);
app.post('/api/workers/dispatch-reminder', handleDispatchReminder);
app.post('/api/workers/check-reminders', async (req, res) => {
  const count = await checkAndDispatchDueReminders();
  res.status(200).json({ status: 'success', dispatched: count });
});

// Internal 1-minute self-healing background ticker
setInterval(() => {
  checkAndDispatchDueReminders().catch((err) =>
    console.error('[InternalTicker] Error checking due reminders:', err.message)
  );
}, 60 * 1000);

const PORT = config.port;
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🌙 Nidaa (نِدَاء) - The gentle call to prayer`);
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/health`);
  console.log(`====================================================`);
});
