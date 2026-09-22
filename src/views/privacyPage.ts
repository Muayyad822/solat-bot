export function getPrivacyPageHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Privacy Policy - Nidaa (نِدَاء)</title>
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
      line-height: 1.7;
      padding: 40px 20px;
    }

    .container {
      max-width: 800px;
      margin: 0 auto;
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: 20px;
      padding: 40px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    }

    .header {
      display: flex;
      align-items: center;
      gap: 16px;
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 20px;
      margin-bottom: 24px;
    }

    .header img {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      border: 2px solid var(--accent-primary);
    }

    h1 {
      font-size: 28px;
      color: var(--text-primary);
    }

    h2 {
      color: var(--accent-primary);
      font-size: 20px;
      margin-top: 30px;
      margin-bottom: 12px;
    }

    p, li {
      font-size: 15px;
      color: var(--text-muted);
      margin-bottom: 14px;
    }

    ul {
      padding-left: 20px;
      margin-bottom: 20px;
    }

    .back-link {
      display: inline-block;
      margin-bottom: 20px;
      color: var(--accent-primary);
      text-decoration: none;
      font-size: 14px;
    }
    .back-link:hover { text-decoration: underline; }

    .footer {
      margin-top: 40px;
      font-size: 13px;
      color: var(--text-muted);
      border-top: 1px solid var(--border-color);
      padding-top: 20px;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <a href="/" class="back-link">← Return to Main Page</a>

    <div class="header">
      <img src="/nidaaIcon.jpg" alt="Nidaa Logo">
      <div>
        <h1>Privacy Policy for Nidaa (نِدَاء)</h1>
        <p style="margin: 0; font-size: 13px;"><em>Effective Date: September 21, 2026</em></p>
      </div>
    </div>
    
    <p><strong>Nidaa</strong> ("we", "our", or "us") respects your privacy. This Privacy Policy explains how we collect, use, and protect your information when you interact with the Nidaa bot on Telegram and WhatsApp.</p>

    <h2>1. Information We Collect</h2>
    <ul>
      <li><strong>Location Data:</strong> When you share your location with Nidaa, we process your latitude and longitude to determine your geographic timezone and compute accurate prayer times.</li>
      <li><strong>Account Identifiers:</strong> We store your Telegram Chat ID or WhatsApp Phone Number strictly to deliver prayer notifications to your device.</li>
    </ul>

    <h2>2. How We Use Information</h2>
    <ul>
      <li>To calculate daily prayer schedules locally using astronomical formulas (Adhan engine).</li>
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
      <p>&copy; ${new Date().getFullYear()} Nidaa. All rights reserved. <em>The gentle call to prayer. Your silent mu’adhin.</em></p>
    </div>
  </div>
</body>
</html>`;
}
