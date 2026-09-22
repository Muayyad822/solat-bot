import { UserStats } from '../db/userRepository.js';

export function getAdminPageHtml(initialStats: UserStats): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Dashboard - Nidaa (نِدَاء)</title>
  <link rel="icon" href="/nidaaIcon.jpg" type="image/jpeg">
  <style>
    :root {
      --bg-primary: #0B192C;
      --bg-surface: #162E4D;
      --accent-primary: #56B4FD;
      --accent-glow: #A9DCFF;
      --text-primary: #FFFFFF;
      --text-muted: #94A9C4;
      --border-color: rgba(169, 220, 255, 0.12);
      --font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      background-color: var(--bg-primary);
      color: var(--text-primary);
      font-family: var(--font-family);
      padding: 30px 20px;
    }

    .container {
      max-width: 1100px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 20px;
      margin-bottom: 35px;
    }

    .brand-title {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .brand-title img {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      border: 2px solid var(--accent-primary);
      box-shadow: 0 0 10px rgba(86, 180, 253, 0.3);
    }

    h1 {
      font-size: 26px;
      color: var(--text-primary);
      font-weight: 700;
    }

    .nav-back {
      color: var(--accent-primary);
      text-decoration: none;
      font-size: 14px;
      margin-top: 4px;
      display: inline-block;
    }
    .nav-back:hover { text-decoration: underline; }

    .live-indicator {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 13px;
      font-weight: 600;
      color: var(--accent-glow);
      background: rgba(86, 180, 253, 0.1);
      padding: 8px 16px;
      border-radius: 30px;
      border: 1px solid var(--border-color);
    }

    .pulse-dot {
      width: 10px;
      height: 10px;
      background-color: var(--accent-primary);
      border-radius: 50%;
      display: inline-block;
      animation: pulse 1.8s infinite;
    }

    @keyframes pulse {
      0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(86, 180, 253, 0.7); }
      70% { transform: scale(1); box-shadow: 0 0 0 8px rgba(86, 180, 253, 0); }
      100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(86, 180, 253, 0); }
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }

    .stat-card {
      background: var(--bg-surface);
      border-radius: 16px;
      padding: 24px;
      border: 1px solid var(--border-color);
      text-align: center;
      box-shadow: 0 8px 20px rgba(0,0,0,0.2);
    }

    .stat-number {
      font-size: 42px;
      font-weight: 800;
      color: var(--accent-primary);
      margin-top: 6px;
    }

    .stat-label {
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: var(--text-muted);
      font-weight: 600;
    }

    .section-header {
      font-size: 20px;
      font-weight: 700;
      margin-bottom: 20px;
      color: var(--text-primary);
    }

    .table-container {
      background: var(--bg-surface);
      border-radius: 16px;
      border: 1px solid var(--border-color);
      overflow: hidden;
      box-shadow: 0 8px 20px rgba(0,0,0,0.2);
    }

    table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }

    th {
      background: rgba(11, 25, 44, 0.8);
      color: var(--accent-glow);
      padding: 16px 20px;
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 1px solid var(--border-color);
    }

    td {
      padding: 16px 20px;
      border-bottom: 1px solid var(--border-color);
      font-size: 14px;
      color: var(--text-primary);
    }

    tr:last-child td { border-bottom: none; }
    tr:hover { background: rgba(86, 180, 253, 0.04); }

    .badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.5px;
    }

    .badge.telegram {
      background: rgba(34, 158, 217, 0.2);
      color: #56B4FD;
      border: 1px solid rgba(86, 180, 253, 0.4);
    }

    .badge.whatsapp {
      background: rgba(37, 211, 102, 0.2);
      color: #25D366;
      border: 1px solid rgba(37, 211, 102, 0.4);
    }

    code {
      font-family: monospace;
      background: rgba(11, 25, 44, 0.8);
      color: var(--accent-glow);
      padding: 3px 8px;
      border-radius: 6px;
      font-size: 13px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand-title">
        <img src="/nidaaIcon.jpg" alt="Nidaa Logo">
        <div>
          <h1>Nidaa Admin Dashboard</h1>
          <a href="/" class="nav-back">← Back to Main Landing Page</a>
        </div>
      </div>
      <div style="display: flex; align-items: center; gap: 12px;">
        <div class="live-indicator">
          <span class="pulse-dot"></span>
          <span>Live Auto-Refreshing</span>
        </div>
        <a href="/admin/logout" style="color: #FF5757; text-decoration: none; font-size: 13px; font-weight: 600; background: rgba(255, 87, 87, 0.12); padding: 8px 14px; border-radius: 30px; border: 1px solid rgba(255, 87, 87, 0.3);">🔒 Logout</a>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Total Active Users</div>
        <div class="stat-number" id="totalUsers">${initialStats.totalUsers}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Telegram Users</div>
        <div class="stat-number" id="telegramUsers">${initialStats.telegramUsers}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">WhatsApp Users</div>
        <div class="stat-number" id="whatsappUsers">${initialStats.whatsappUsers}</div>
      </div>
    </div>

    <div class="section-header">Registered User Profiles & Solar Coordinates</div>
    <div class="table-container">
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
        if (!data.users || data.users.length === 0) {
          tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 24px; color: #94A9C4;">No registered users yet. Share location on Telegram or WhatsApp to register.</td></tr>';
        } else {
          tableBody.innerHTML = data.users.map(u => \`
            <tr>
              <td><strong>\${u.id}</strong></td>
              <td><span class="badge \${u.platform}">\${u.platform.toUpperCase()}</span></td>
              <td><code>\${u.chatId}</code></td>
              <td>\${u.latitude ? u.latitude.toFixed(4) : 'N/A'}, \${u.longitude ? u.longitude.toFixed(4) : 'N/A'}</td>
              <td>\${u.timezone || 'N/A'}</td>
              <td>\${u.calculationMethod || 'MWL'}</td>
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
</html>`;
}
