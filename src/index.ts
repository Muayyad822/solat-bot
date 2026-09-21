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
    bot: 'Nidaa',
    tagline: 'The gentle call to prayer. Your silent mu’adhin.',
    dispatchedDueReminders: dispatched,
    timestamp: new Date().toISOString(),
  });
});

// HTML Privacy Policy Endpoint for Meta Developer App Live Mode Approval
app.get('/privacy', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Privacy Policy - Nidaa</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1 { color: #1b4332; border-bottom: 2px solid #2d6a4f; padding-bottom: 10px; }
        h2 { color: #2d6a4f; margin-top: 25px; }
        p, li { font-size: 16px; }
        .footer { margin-top: 40px; font-size: 14px; color: #666; border-top: 1px solid #eee; padding-top: 15px; }
      </style>
    </head>
    <body>
      <h1>Privacy Policy for Nidaa (نِدَاء)</h1>
      <p><em>Effective Date: September 21, 2026</em></p>
      
      <p><strong>Nidaa</strong> ("we", "our", or "us") respects your privacy. This Privacy Policy explains how we collect, use, and protect your information when you interact with the Nidaa bot on Telegram and WhatsApp.</p>

      <h2>1. Information We Collect</h2>
      <ul>
        <li><strong>Location Data:</strong> When you share your location with Nidaa, we process your latitude and longitude to determine your geographic timezone and compute accurate prayer times.</li>
        <li><strong>Account Identifiers:</strong> We store your Telegram Chat ID or WhatsApp Phone Number strictly to deliver prayer notifications to your device.</li>
      </ul>

      <h2>2. How We Use Information</h2>
      <ul>
        <li>To calculate daily prayer schedules locally using astronomical formulas.</li>
        <li>To send discrete, quiet text reminders when it is time for prayer.</li>
      </ul>

      <h2>3. Data Sharing and Protection</h2>
      <p>We <strong>never sell, share, rent, or trade</strong> your personal information or location data with third parties or advertising networks. Your data is used exclusively to provide the Nidaa prayer reminder service.</p>

      <h2>4. Data Retention and Deletion</h2>
      <p>You can request deletion of your stored location preferences at any time by stopping the bot or contacting support. Your data will be permanently purged upon request.</p>

      <h2>5. Contact Us</h2>
      <p>If you have questions about this Privacy Policy, please reach out to the Nidaa support team.</p>

      <div class="footer">
        <p>&copy; 2026 Nidaa. All rights reserved. <em>The gentle call to prayer. Your silent mu’adhin.</em></p>
      </div>
    </body>
    </html>
  `);
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
  console.log(`Nidaa (نِدَاء) - The gentle call to prayer`);
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/health`);
  console.log(`🔗 Privacy Policy: http://localhost:${PORT}/privacy`);
  console.log(`====================================================`);
});
