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

    /* Custom Scrollbar */
    html {
      scrollbar-width: thin;
      scrollbar-color: var(--bg-surface) var(--bg-primary);
    }

    ::-webkit-scrollbar {
      width: 10px;
    }

    ::-webkit-scrollbar-track {
      background: var(--bg-primary);
    }

    ::-webkit-scrollbar-thumb {
      background: var(--bg-surface);
      border-radius: 5px;
      border: 2px solid var(--bg-primary);
    }

    ::-webkit-scrollbar-thumb:hover {
      background: var(--accent-primary);
    }

    body {
      background-color: var(--bg-primary);
      color: var(--text-primary);
      font-family: var(--font-family);
      padding: 30px 20px;
    }

    .container {
      max-width: 1140px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 20px;
      margin-bottom: 35px;
      flex-wrap: wrap;
      gap: 16px;
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
      font-size: 24px;
      color: var(--text-primary);
      font-weight: 700;
    }

    .nav-back {
      color: var(--accent-primary);
      text-decoration: none;
      font-size: 13px;
      margin-top: 4px;
      display: inline-block;
    }
    .nav-back:hover { text-decoration: underline; }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .live-indicator {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      font-weight: 600;
      color: var(--accent-glow);
      background: rgba(86, 180, 253, 0.1);
      padding: 8px 14px;
      border-radius: 30px;
      border: 1px solid var(--border-color);
    }

    .pulse-dot {
      width: 8px;
      height: 8px;
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

    .btn-logout {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: #FF5757;
      text-decoration: none;
      font-size: 13px;
      font-weight: 600;
      background: rgba(255, 87, 87, 0.12);
      padding: 8px 16px;
      border-radius: 30px;
      border: 1px solid rgba(255, 87, 87, 0.3);
      transition: all 0.2s ease;
    }

    .btn-logout:hover {
      background: rgba(255, 87, 87, 0.25);
      border-color: rgba(255, 87, 87, 0.5);
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 20px;
      margin-bottom: 35px;
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

    /* Controls Bar: Search & Filter Tabs */
    .controls-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }

    .search-box {
      position: relative;
      flex: 1;
      min-width: 260px;
    }

    .search-input {
      width: 100%;
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 12px 16px 12px 42px;
      color: var(--text-primary);
      font-size: 14px;
      outline: none;
      transition: border-color 0.2s;
    }

    .search-input:focus {
      border-color: var(--accent-primary);
    }

    .search-icon {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      width: 16px;
      height: 16px;
      stroke: var(--text-muted);
      stroke-width: 2;
      fill: none;
    }

    .filter-tabs {
      display: flex;
      gap: 8px;
    }

    .tab-btn {
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      color: var(--text-muted);
      padding: 10px 16px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .tab-btn.active {
      background: var(--accent-primary);
      color: var(--bg-primary);
      border-color: var(--accent-primary);
    }

    /* Table & Container */
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

    /* Pagination Footer */
    .pagination-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      background: rgba(11, 25, 44, 0.6);
      border-top: 1px solid var(--border-color);
      font-size: 13px;
      color: var(--text-muted);
      flex-wrap: wrap;
      gap: 12px;
    }

    .page-controls {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .btn-page {
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      color: var(--text-primary);
      padding: 6px 14px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-page:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .btn-page:not(:disabled):hover {
      border-color: var(--accent-primary);
      color: var(--accent-primary);
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div class="brand-title">
        <img src="/nidaaIcon.jpg" alt="Nidaa Logo">
        <div>
          <h1>Nidaa Admin Dashboard</h1>
          <a href="/" class="nav-back">← Back to Main Landing Page</a>
        </div>
      </div>
      <div class="header-actions">
        <div class="live-indicator">
          <span class="pulse-dot"></span>
          <span>Live Auto-Refreshing</span>
        </div>
        <a href="/admin/logout" class="btn-logout" title="Sign out of Admin Dashboard">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          <span>Logout</span>
        </a>
      </div>
    </div>

    <!-- Stats Summary Cards -->
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

    <!-- Controls Bar: Search & Platform Filter -->
    <div class="controls-bar">
      <div class="search-box">
        <svg class="search-icon" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <input type="text" id="searchInput" class="search-input" placeholder="Search by Phone, User ID, or Timezone..." oninput="onSearchChange()">
      </div>

      <div class="filter-tabs">
        <button class="tab-btn active" id="filterAll" onclick="setFilter('all')">All</button>
        <button class="tab-btn" id="filterTg" onclick="setFilter('telegram')">Telegram</button>
        <button class="tab-btn" id="filterWa" onclick="setFilter('whatsapp')">WhatsApp</button>
      </div>
    </div>

    <!-- User Table -->
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>User ID</th>
            <th>Platform</th>
            <th>Chat ID / Phone</th>
            <th>Location</th>
            <th>Coordinates (~1km)</th>
            <th>Timezone</th>
            <th>Method</th>
            <th>Registered At</th>
          </tr>
        </thead>
        <tbody id="userTableBody">
        </tbody>
      </table>

      <!-- Pagination Footer -->
      <div class="pagination-bar">
        <div id="pageSummary">Showing 0 of 0 users</div>
        <div class="page-controls">
          <button class="btn-page" id="btnPrev" onclick="changePage(-1)">← Previous</button>
          <span id="pageIndicator" style="font-weight: 600; color: var(--accent-glow);">Page 1</span>
          <button class="btn-page" id="btnNext" onclick="changePage(1)">Next →</button>
        </div>
      </div>
    </div>
  </div>

  <script>
    let allUsers = [];
    let activeFilter = 'all';
    let searchQuery = '';
    let currentPage = 1;
    const pageSize = 10;

    async function fetchStats() {
      try {
        const res = await fetch('/api/admin/stats');
        const data = await res.json();

        document.getElementById('totalUsers').innerText = data.totalUsers;
        document.getElementById('telegramUsers').innerText = data.telegramUsers;
        document.getElementById('whatsappUsers').innerText = data.whatsappUsers;

        allUsers = data.users || [];
        renderTable();
      } catch (err) {
        console.error('Auto-refresh error:', err);
      }
    }

    function setFilter(filter) {
      activeFilter = filter;
      currentPage = 1;

      document.getElementById('filterAll').classList.toggle('active', filter === 'all');
      document.getElementById('filterTg').classList.toggle('active', filter === 'telegram');
      document.getElementById('filterWa').classList.toggle('active', filter === 'whatsapp');

      renderTable();
    }

    function onSearchChange() {
      searchQuery = document.getElementById('searchInput').value.trim().toLowerCase();
      currentPage = 1;
      renderTable();
    }

    function changePage(delta) {
      currentPage += delta;
      renderTable();
    }

    function renderTable() {
      // 1. Filter Users
      let filtered = allUsers.filter(u => {
        if (activeFilter !== 'all' && u.platform !== activeFilter) return false;
        if (searchQuery) {
          const matchId = (u.id || '').toLowerCase().includes(searchQuery);
          const matchChatId = (u.chatId || '').toLowerCase().includes(searchQuery);
          const matchTz = (u.timezone || '').toLowerCase().includes(searchQuery);
          const matchLoc = (u.locationName || u.city || u.country || '').toLowerCase().includes(searchQuery);
          return matchId || matchChatId || matchTz || matchLoc;
        }
        return true;
      });

      // 2. Paginate Users
      const totalFiltered = filtered.length;
      const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));

      if (currentPage > totalPages) currentPage = totalPages;
      if (currentPage < 1) currentPage = 1;

      const startIndex = (currentPage - 1) * pageSize;
      const paginatedUsers = filtered.slice(startIndex, startIndex + pageSize);

      // 3. Update Table DOM
      const tableBody = document.getElementById('userTableBody');
      if (paginatedUsers.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding: 30px; color: #94A9C4;">No matching users found.</td></tr>';
      } else {
        tableBody.innerHTML = paginatedUsers.map(u => {
          const locName = u.locationName || (u.city && u.country ? u.city + ', ' + u.country : u.city || u.country);
          const cleanTz = u.timezone ? u.timezone.replace('_', ' ') : 'Location Set';
          const displayLoc = locName || cleanTz;
          return \`
          <tr>
            <td><strong>\${u.id}</strong></td>
            <td><span class="badge \${u.platform}">\${u.platform.toUpperCase()}</span></td>
            <td><code>\${u.chatId}</code></td>
            <td><strong>\${displayLoc}</strong></td>
            <td>\${u.latitude ? u.latitude.toFixed(2) : 'N/A'}, \${u.longitude ? u.longitude.toFixed(2) : 'N/A'}</td>
            <td>\${u.timezone || 'N/A'}</td>
            <td>\${u.calculationMethod || 'MWL'}</td>
            <td>\${new Date(u.createdAt).toLocaleString()}</td>
          </tr>
        \`;
        }).join('');
      }

      // 4. Update Pagination UI Controls
      const endItem = Math.min(startIndex + pageSize, totalFiltered);
      const startItem = totalFiltered === 0 ? 0 : startIndex + 1;
      
      document.getElementById('pageSummary').innerText = \`Showing \${startItem}-\${endItem} of \${totalFiltered} users\`;
      document.getElementById('pageIndicator').innerText = \`Page \${currentPage} of \${totalPages}\`;
      document.getElementById('btnPrev').disabled = (currentPage <= 1);
      document.getElementById('btnNext').disabled = (currentPage >= totalPages);
    }

    // Initial Fetch & 5-Second Auto-Polling
    fetchStats();
    setInterval(fetchStats, 5000);
  </script>
</body>
</html>`;
}
