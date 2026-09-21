import express from 'express';
import { config } from './config/env.js';
import { handleTelegramWebhook } from './webhooks/telegramWebhook.js';
import { verifyWhatsAppWebhook, handleWhatsAppWebhook } from './webhooks/whatsappWebhook.js';
import { runDailyCronJob } from './workers/dailyCron.js';
import { handleDispatchReminder } from './workers/dispatchReminder.js';
import { checkAndDispatchDueReminders } from './workers/checkDueReminders.js';
import { userRepository } from './db/userRepository.js';

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

// Admin Stats JSON Endpoint
app.get('/api/admin/stats', async (req, res) => {
  const stats = await userRepository.getUserStats();
  res.status(200).json(stats);
});

// Visual Admin Dashboard HTML Endpoint with Real-Time Auto-Refresh
app.get('/admin', async (req, res) => {
  const stats = await userRepository.getUserStats();
  
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Admin Dashboard - Nidaa</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #f8f9fa; color: #333; margin: 0; padding: 30px; }
        .container { max-width: 1100px; margin: 0 auto; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #2d6a4f; padding-bottom: 15px; margin-bottom: 30px; }
        h1 { color: #1b4332; margin: 0; }
        .live-indicator { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600; color: #2d6a4f; background: #e8f5e9; padding: 6px 14px; border-radius: 20px; }
        .pulse-dot { width: 10px; height: 10px; background-color: #2e7d32; border-radius: 50%; display: inline-block; animation: pulse 1.8s infinite; }
        @keyframes pulse { 0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(46, 125, 50, 0.7); } 70% { transform: scale(1); box-shadow: 0 0 0 8px rgba(46, 125, 50, 0); } 100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(46, 125, 50, 0); } }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-bottom: 35px; }
        .stat-card { background: white; border-radius: 12px; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); text-align: center; }
        .stat-number { font-size: 38px; font-weight: bold; color: #2d6a4f; margin-top: 5px; }
        .stat-label { font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #666; }
        table { width: 100%; border-collapse: collapse; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        th { background: #2d6a4f; color: white; text-align: left; padding: 14px 16px; font-size: 14px; }
        td { padding: 14px 16px; border-bottom: 1px solid #eee; font-size: 14px; }
        tr:hover { background: #f1f8f5; }
        .badge { display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: bold; }
        .badge.telegram { background: #e3f2fd; color: #0288d1; }
        .badge.whatsapp { background: #e8f5e9; color: #2e7d32; }
        code { font-family: monospace; background: #f4f4f4; padding: 2px 6px; border-radius: 4px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Nidaa 🌙 Admin Dashboard</h1>
          <div class="live-indicator">
            <span class="pulse-dot"></span>
            <span>Live Auto-Refreshing</span>
          </div>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-label">Total Active Users</div>
            <div class="stat-number" id="totalUsers">${stats.totalUsers}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Telegram Users</div>
            <div class="stat-number" id="telegramUsers">${stats.telegramUsers}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">WhatsApp Users</div>
            <div class="stat-number" id="whatsappUsers">${stats.whatsappUsers}</div>
          </div>
        </div>

        <h2>User Profiles & Location Data</h2>
        <table>
          <thead>
            <tr>
              <th>User ID</th>
              <th>Platform</th>
              <th>Chat ID / Phone</th>
              <th>Coordinates</th>
              <th>Timezone</th>
              <th>Method</th>
              <th>Registered At</th>
            </tr>
          </thead>
          <tbody id="userTableBody">
          </tbody>
        </table>
      </div>

      <script>
        async function updateDashboard() {
          try {
            const res = await fetch('/api/admin/stats');
            const data = await res.json();
            
            document.getElementById('totalUsers').innerText = data.totalUsers;
            document.getElementById('telegramUsers').innerText = data.telegramUsers;
            document.getElementById('whatsappUsers').innerText = data.whatsappUsers;

            const tableBody = document.getElementById('userTableBody');
            if (data.users.length === 0) {
              tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 20px;">No registered users yet. Share location on Telegram or WhatsApp to register.</td></tr>';
            } else {
              tableBody.innerHTML = data.users.map(u => \`
                <tr>
                  <td><strong>\${u.id}</strong></td>
                  <td><span class="badge \${u.platform}">\${u.platform.toUpperCase()}</span></td>
                  <td><code>\${u.chatId}</code></td>
                  <td>\${u.latitude.toFixed(4)}, \${u.longitude.toFixed(4)}</td>
                  <td>\${u.timezone}</td>
                  <td>\${u.calculationMethod}</td>
                  <td>\${new Date(u.createdAt).toLocaleString()}</td>
                </tr>
              \`).join('');
            }
          } catch (err) {
            console.error('Auto-refresh error:', err);
          }
        }

        // Initial render & 5-second live polling loop
        updateDashboard();
        setInterval(updateDashboard, 5000);
      </script>
    </body>
    </html>
  `);
});

// HTML Privacy Policy Endpoint for Meta Developer App Approval
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
  console.log(`🔗 Admin Dashboard: http://localhost:${PORT}/admin`);
  console.log(`====================================================`);
});
