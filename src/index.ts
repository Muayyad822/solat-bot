import path from 'path';
import express from 'express';
import { config } from './config/env.js';
import { handleTelegramWebhook } from './webhooks/telegramWebhook.js';
import { verifyWhatsAppWebhook, handleWhatsAppWebhook } from './webhooks/whatsappWebhook.js';
import { runDailyCronJob } from './workers/dailyCron.js';
import { handleDispatchReminder } from './workers/dispatchReminder.js';
import { checkAndDispatchDueReminders } from './workers/checkDueReminders.js';
import { userRepository } from './db/userRepository.js';
import { getLandingPageHtml } from './views/landingPage.js';
import { getAdminPageHtml } from './views/adminPage.js';
import { getPrivacyPageHtml } from './views/privacyPage.js';
import { getTermsPageHtml } from './views/termsPage.js';
import { getAdminLoginPageHtml } from './views/adminLoginPage.js';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets from 'public' directory (e.g. /nidaaIcon.jpg)
app.use(express.static(path.join(process.cwd(), 'public')));

// Log ALL incoming HTTP requests for troubleshooting
app.use((req, res, next) => {
  console.log(`[HTTP Request] ${req.method} ${req.url}`);
  next();
});

// Main Landing Page Endpoint
app.get('/', (req, res) => {
  res.send(getLandingPageHtml(config.telegramBotUrl, config.whatsappBotUrl));
});

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

function isAuthorizedAdmin(req: express.Request): boolean {
  const cookieHeader = req.headers.cookie || '';
  if (cookieHeader.includes('nidaa_admin_auth=1')) return true;
  const authHeader = req.headers.authorization || '';
  if (authHeader === `Bearer ${config.adminPasscode}`) return true;
  return false;
}

// Admin Authentication Endpoints
app.get('/admin/login', (req, res) => {
  if (isAuthorizedAdmin(req)) return res.redirect('/admin');
  res.send(getAdminLoginPageHtml());
});

app.post('/admin/login', (req, res) => {
  const { passcode } = req.body || {};
  if (passcode === config.adminPasscode) {
    res.setHeader('Set-Cookie', 'nidaa_admin_auth=1; Path=/; HttpOnly; SameSite=Lax');
    return res.redirect('/admin');
  }
  res.status(401).send(getAdminLoginPageHtml('❌ Invalid passcode. Please try again.'));
});

app.get('/admin/logout', (req, res) => {
  res.setHeader('Set-Cookie', 'nidaa_admin_auth=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT');
  res.redirect('/admin/login');
});

// Protected Admin Stats JSON Endpoint
app.get('/api/admin/stats', async (req, res) => {
  if (!isAuthorizedAdmin(req)) {
    return res.status(401).json({ error: 'Unauthorized access. Valid admin passcode required.' });
  }
  const stats = await userRepository.getUserStats();
  res.status(200).json(stats);
});

// Protected Admin Dashboard HTML Endpoint
app.get('/admin', async (req, res) => {
  if (!isAuthorizedAdmin(req)) {
    return res.send(getAdminLoginPageHtml());
  }
  const stats = await userRepository.getUserStats();
  res.send(getAdminPageHtml(stats));
});

// HTML Privacy Policy Endpoint for Meta Developer App Approval
app.get('/privacy', (req, res) => {
  res.send(getPrivacyPageHtml());
});

// HTML Terms of Service Endpoint
app.get('/terms', (req, res) => {
  res.send(getTermsPageHtml());
});

// Telegram Webhook
app.post('/api/webhooks/telegram', handleTelegramWebhook);

// WhatsApp Cloud API Webhooks
app.get('/api/webhooks/whatsapp', verifyWhatsAppWebhook);
app.post('/api/webhooks/whatsapp', handleWhatsAppWebhook);

import { handleBroadcastCheckin } from './workers/broadcastCheckin.js';

// Workers & Scheduler Endpoints
app.post('/api/workers/daily-cron', runDailyCronJob);
app.post('/api/workers/dispatch-reminder', handleDispatchReminder);
app.post('/api/workers/check-reminders', async (req, res) => {
  const count = await checkAndDispatchDueReminders();
  res.status(200).json({ status: 'success', dispatched: count });
});
app.post('/api/workers/broadcast-checkin', handleBroadcastCheckin);


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
  console.log(`🔗 Landing Page: http://localhost:${PORT}/`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/health`);
  console.log(`🔗 Privacy Policy: http://localhost:${PORT}/privacy`);
  console.log(`🔗 Admin Dashboard: http://localhost:${PORT}/admin`);
  console.log(`====================================================`);
});
