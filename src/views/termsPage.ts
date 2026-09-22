export function getTermsPageHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Terms of Service - Nidaa (نِدَاء)</title>
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

    html, body {
      max-width: 100%;
      overflow-x: hidden;
    }

    body {
      background-color: var(--bg-primary);
      color: var(--text-primary);
      font-family: var(--font-family);
      line-height: 1.7;
      padding: 40px 20px;
    }

    @media (max-width: 600px) {
      body { padding: 20px 12px; }
      .container { padding: 24px 16px; }
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
        <h1>Terms of Service for Nidaa (نِدَاء)</h1>
        <p style="margin: 0; font-size: 13px;"><em>Effective Date: September 22, 2026</em></p>
      </div>
    </div>
    
    <p>Welcome to <strong>Nidaa</strong> ("The gentle call to prayer. Your silent mu’adhin."). By connecting to Nidaa via Telegram or WhatsApp, you agree to these Terms of Service.</p>

    <h2>1. Service Description</h2>
    <p>Nidaa is a free, non-intrusive text-based prayer reminder bot designed for office, meeting, and quiet environments. Nidaa computes prayer schedules locally using astronomical formulas (Adhan engine) and sends notifications accompanied by serene reflections.</p>

    <h2>2. Acceptable Use</h2>
    <p>You agree to use Nidaa solely for personal, non-commercial prayer notifications. You agree not to abuse, reverse-engineer, or attempt to disrupt the service or automated infrastructure.</p>

    <h2>3. Calculation Accuracy & Disclaimer</h2>
    <p>Prayer times are computed automatically based on your shared geographic location. While Nidaa uses standard astronomical algorithms (Muslim World League parameters), slight regional variances may exist. Users are encouraged to cross-reference local congregation schedules for strict fasting or congregational timings.</p>

    <h2>4. Limitation of Liability</h2>
    <p>Nidaa is provided "as is" and "as available" without warranties of any kind. We are not liable for delayed notifications resulting from third-party network outages (e.g., Telegram, Meta WhatsApp Cloud API, or mobile ISP connectivity).</p>

    <h2>5. Termination & Data Deletion</h2>
    <p>You may discontinue your use of Nidaa at any time. You can instantly delete all your stored profile data from our servers by sending <code>/delete</code> on Telegram or texting <code>STOP</code> or <code>DELETE</code> on WhatsApp.</p>

    <h2>6. Contact Us & Developer Info</h2>
    <p>If you have any questions or feedback regarding Nidaa or these Terms of Service, please feel free to reach out:</p>
    <ul>
      <li><strong>Email Support:</strong> <a href="mailto:muayyad822@gmail.com" style="color: var(--accent-primary);">muayyad822@gmail.com</a></li>
      <li><strong>Developer Portfolio:</strong> <a href="https://abdulmuizjimoh.vercel.app/" target="_blank" rel="noopener" style="color: var(--accent-primary);">abdulmuizjimoh.vercel.app</a></li>
    </ul>

    <div class="footer">
      <p style="margin-bottom: 10px;"><a href="/" style="color: var(--accent-primary);">Home</a> &bull; <a href="/privacy" style="color: var(--accent-primary);">Privacy Policy</a> &bull; <a href="https://abdulmuizjimoh.vercel.app/" target="_blank" rel="noopener" style="color: var(--accent-primary);">Developer</a></p>
      <p>&copy; ${new Date().getFullYear()} Nidaa. All rights reserved. <em>The gentle call to prayer. Your silent mu’adhin.</em></p>
    </div>
  </div>
</body>
</html>`;
}
