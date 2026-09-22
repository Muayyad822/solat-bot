export function getLandingPageHtml(telegramUrl: string, whatsappUrl: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nidaa (نِدَاء) - The Gentle Call to Prayer</title>
  <meta name="description" content="Nidaa is your silent mu’adhin for Telegram and WhatsApp. Delivering punctual, quiet, and serene prayer reminders directly to your chat.">
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

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    /* Custom Scrollbar & Smooth Scrolling */
    html {
      scroll-behavior: smooth;
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
      max-width: 100%;
      overflow-x: hidden;
      background-color: var(--bg-primary);
      color: var(--text-primary);
      font-family: var(--font-family);
      line-height: 1.6;
    }

    a {
      color: var(--accent-primary);
      text-decoration: none;
      transition: opacity 0.2s;
    }
    a:hover {
      opacity: 0.85;
    }

    .container {
      max-width: 1140px;
      margin: 0 auto;
      padding: 0 24px;
    }

    /* --- Navbar --- */
    header.navbar {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      z-index: 1000;
      background: rgba(11, 25, 44, 0.92);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-bottom: 1px solid var(--border-color);
      padding: 16px 0;
    }

    .nav-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      font-weight: 700;
      font-size: 20px;
      color: var(--text-primary);
    }

    .brand img {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid var(--accent-primary);
      box-shadow: 0 0 12px rgba(86, 180, 253, 0.3);
    }

    .nav-links {
      display: flex;
      align-items: center;
      gap: 28px;
      list-style: none;
    }

    .nav-links a {
      color: var(--text-muted);
      font-size: 14px;
      font-weight: 500;
    }

    .nav-links a:hover {
      color: var(--text-primary);
    }

    /* --- Hero Section --- */
    .hero {
      padding: 140px 0 70px;
      text-align: center;
      position: relative;
    }

    .hero-bg-glow {
      position: absolute;
      top: 20%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 500px;
      height: 300px;
      background: radial-gradient(circle, rgba(86, 180, 253, 0.15) 0%, rgba(11, 25, 44, 0) 70%);
      pointer-events: none;
      z-index: 0;
    }

    .hero-content {
      position: relative;
      z-index: 1;
      max-width: 780px;
      margin: 0 auto;
    }

    .badge-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      padding: 8px 18px;
      border-radius: 30px;
      font-size: 13px;
      color: var(--accent-glow);
      font-weight: 600;
      margin-bottom: 24px;
    }

    .badge-dot {
      width: 8px;
      height: 8px;
      background-color: var(--accent-primary);
      border-radius: 50%;
      box-shadow: 0 0 8px var(--accent-primary);
    }

    h1.hero-title {
      font-size: 52px;
      font-weight: 800;
      line-height: 1.15;
      letter-spacing: -0.5px;
      margin-bottom: 20px;
      background: linear-gradient(180deg, #FFFFFF 0%, #A9DCFF 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    p.hero-subtitle {
      font-size: 19px;
      color: var(--text-muted);
      line-height: 1.6;
      margin-bottom: 36px;
      max-width: 680px;
      margin-left: auto;
      margin-right: auto;
    }

    /* --- CTA Buttons --- */
    .cta-group {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 18px;
      flex-wrap: wrap;
      margin-bottom: 48px;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 14px 28px;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.25s ease;
      text-decoration: none;
    }

    .btn-whatsapp {
      background: #25D366;
      color: #FFFFFF;
      box-shadow: 0 4px 20px rgba(37, 211, 102, 0.3);
    }
    .btn-whatsapp:hover {
      background: #20bd5a;
      transform: translateY(-2px);
      box-shadow: 0 6px 25px rgba(37, 211, 102, 0.45);
      opacity: 1;
    }

    .btn-telegram {
      background: #229ED9;
      color: #FFFFFF;
      box-shadow: 0 4px 20px rgba(34, 158, 217, 0.3);
    }
    .btn-telegram:hover {
      background: #1d8bc0;
      transform: translateY(-2px);
      box-shadow: 0 6px 25px rgba(34, 158, 217, 0.45);
      opacity: 1;
    }

    .btn-icon {
      width: 20px;
      height: 20px;
      fill: currentColor;
    }

    /* --- Live Notification Mockup --- */
    .mockup-container {
      max-width: 440px;
      margin: 0 auto;
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: 18px;
      padding: 20px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4), 0 0 30px rgba(86, 180, 253, 0.1);
      text-align: left;
    }

    .mockup-header {
      display: flex;
      align-items: center;
      gap: 10px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      padding-bottom: 12px;
      margin-bottom: 14px;
    }

    .mockup-avatar {
      width: 34px;
      height: 34px;
      border-radius: 50%;
    }

    .mockup-bot-name {
      font-weight: 600;
      font-size: 15px;
      color: var(--text-primary);
    }

    .mockup-time {
      font-size: 12px;
      color: var(--text-muted);
      margin-left: auto;
    }

    .mockup-body {
      background: rgba(11, 25, 44, 0.6);
      border-radius: 12px;
      padding: 14px 16px;
      border-left: 4px solid var(--accent-primary);
      font-size: 14px;
      color: var(--text-primary);
      line-height: 1.5;
    }

    .mockup-prayer-time {
      color: var(--accent-glow);
      font-weight: 600;
    }

    /* --- Features Section --- */
    .features-section {
      padding: 80px 0;
      border-top: 1px solid var(--border-color);
      scroll-margin-top: 80px;
    }

    .section-title {
      text-align: center;
      font-size: 34px;
      font-weight: 700;
      margin-bottom: 14px;
      color: var(--text-primary);
    }

    .section-subtitle {
      text-align: center;
      font-size: 16px;
      color: var(--text-muted);
      max-width: 600px;
      margin: 0 auto 50px;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 28px;
    }

    .feature-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      padding: 30px;
      transition: transform 0.25s ease, border-color 0.25s ease;
    }

    .feature-card:hover {
      transform: translateY(-4px);
      border-color: var(--accent-primary);
    }

    .feature-icon-wrapper {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: rgba(86, 180, 253, 0.12);
      border: 1px solid rgba(86, 180, 253, 0.25);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 20px;
      color: var(--accent-primary);
    }

    .feature-icon-wrapper svg {
      width: 24px;
      height: 24px;
      fill: none;
      stroke: currentColor;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .feature-title {
      font-size: 20px;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 10px;
    }

    .feature-desc {
      font-size: 14px;
      color: var(--text-muted);
      line-height: 1.6;
    }

    /* --- Pricing Section --- */
    .pricing-section {
      padding: 80px 0;
      border-top: 1px solid var(--border-color);
      background: rgba(22, 46, 77, 0.3);
      scroll-margin-top: 80px;
    }

    .pricing-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(270px, 1fr));
      gap: 32px;
      max-width: 840px;
      margin: 0 auto;
    }

    .pricing-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: 20px;
      padding: 36px 30px;
      position: relative;
    }

    .pricing-card.featured {
      border: 2px solid var(--accent-primary);
      box-shadow: 0 0 25px rgba(86, 180, 253, 0.15);
    }

    .pricing-badge {
      position: absolute;
      top: -14px;
      right: 24px;
      background: var(--accent-primary);
      color: var(--bg-primary);
      font-size: 12px;
      font-weight: 700;
      padding: 4px 12px;
      border-radius: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .pricing-name {
      font-size: 22px;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 8px;
    }

    .pricing-price {
      font-size: 38px;
      font-weight: 800;
      color: var(--accent-glow);
      margin-bottom: 16px;
    }

    .pricing-price span {
      font-size: 14px;
      color: var(--text-muted);
      font-weight: 400;
    }

    .pricing-features {
      list-style: none;
      margin: 24px 0 32px;
    }

    .pricing-features li {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 14px;
      color: var(--text-muted);
      margin-bottom: 12px;
    }

    .check-svg {
      width: 16px;
      height: 16px;
      stroke: var(--accent-primary);
      stroke-width: 2.5;
      fill: none;
      flex-shrink: 0;
    }

    /* --- Footer --- */
    footer {
      border-top: 1px solid var(--border-color);
      padding: 40px 0;
      text-align: center;
      color: var(--text-muted);
      font-size: 14px;
    }

    .footer-brand {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 10px;
      margin-bottom: 16px;
      color: var(--text-primary);
      font-weight: 600;
    }

    .footer-links {
      display: flex;
      justify-content: center;
      gap: 24px;
      margin-bottom: 20px;
    }

    @media (max-width: 600px) {
      header.navbar { padding: 12px 0; }
      .container { padding: 0 16px; }
      .brand { font-size: 18px; gap: 8px; }
      .brand img { width: 34px; height: 34px; }
      .nav-links { gap: 14px; }
      .nav-links a { font-size: 13px; }

      .hero { padding: 115px 0 40px; }
      h1.hero-title { font-size: 32px; line-height: 1.25; margin-top: 0; word-break: break-word; overflow-wrap: break-word; }
      p.hero-subtitle { font-size: 15px; }
      .cta-group { flex-direction: column; width: 100%; }
      .btn { width: 100%; }

      .hero-bg-glow { width: 100%; max-width: 100vw; }
      .mockup-container { width: 100%; padding: 16px; }

      .features-section { padding: 50px 0; scroll-margin-top: 70px; }
      .features-grid { grid-template-columns: 1fr; gap: 20px; }
      .feature-card { padding: 24px 20px; }

      .pricing-section { padding: 50px 0; scroll-margin-top: 70px; }
      .pricing-grid { grid-template-columns: 1fr; gap: 24px; }
      .pricing-card { padding: 28px 20px; }

      .footer-links { gap: 14px; flex-wrap: wrap; }
    }

    @media (max-width: 380px) {
      .brand span { font-size: 15px; }
      .nav-links { gap: 10px; }
      .nav-links a { font-size: 12px; }
      h1.hero-title { font-size: 28px; }
    }
  </style>
</head>
<body>

  <!-- Navbar -->
  <header class="navbar">
    <div class="container nav-container">
      <div class="brand">
        <img src="/nidaaIcon.jpg" alt="Nidaa Logo">
        <span>Nidaa</span>
      </div>
      <ul class="nav-links">
        <li><a href="#features">Features</a></li>
        <li><a href="#pricing">Pricing</a></li>
        <li><a href="https://abdulmuizjimoh.vercel.app/" target="_blank" rel="noopener">Developer</a></li>
      </ul>
    </div>
  </header>

  <!-- Hero Section -->
  <section class="hero">
    <div class="hero-bg-glow"></div>
    <div class="container hero-content">

      <h1 class="hero-title">The Gentle Call to Prayer.<br>Your Silent Mu’adhin.</h1>

      <p class="hero-subtitle">
        Nidaa (نِدَاء) delivers quiet, serene prayer notifications right to your Telegram and WhatsApp chats. 
        Designed for meetings, classrooms, and offices where phone audio is set to silent.
      </p>

      <div class="cta-group">
        <a href="${whatsappUrl}" target="_blank" rel="noopener" class="btn btn-whatsapp">
          <svg class="btn-icon" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
          Connect on WhatsApp
        </a>

        <a href="${telegramUrl}" target="_blank" rel="noopener" class="btn btn-telegram">
          <svg class="btn-icon" viewBox="0 0 24 24">
            <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.536-.197 1.006.128.832.941z"/>
          </svg>
          Connect on Telegram
        </a>
      </div>

      <!-- Live Mockup Card -->
      <div class="mockup-container">
        <div class="mockup-header">
          <img src="/nidaaIcon.jpg" alt="Nidaa Avatar" class="mockup-avatar">
          <div class="mockup-bot-name">Nidaa</div>
          <div class="mockup-time">Just now</div>
        </div>
        <div class="mockup-body">
          <strong>Nidaa</strong><br>
          It is time for <span class="mockup-prayer-time">Asr (4:15 PM)</span>.<br>
          <em>Take a moment to pause and reflect.</em>
        </div>
      </div>
    </div>
  </section>

  <!-- Features Section -->
  <section class="features-section" id="features">
    <div class="container">
      <h2 class="section-title">Designed for Mindful Living</h2>
      <p class="section-subtitle">Everything you need to stay connected with your daily prayers seamlessly and quietly.</p>

      <div class="features-grid">
        <!-- Feature 1: Location Pin SVG -->
        <div class="feature-card">
          <div class="feature-icon-wrapper">
            <svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
          </div>
          <h3 class="feature-title">Automatic Location Sync</h3>
          <p class="feature-desc">Simply drop your current location once in Telegram or WhatsApp. Nidaa automatically resolves your geographic timezone and solar coordinates.</p>
        </div>

        <!-- Feature 2: Compass / Solar Calculation SVG -->
        <div class="feature-card">
          <div class="feature-icon-wrapper">
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>
          </div>
          <h3 class="feature-title">100% Offline Astronomical Engine</h3>
          <p class="feature-desc">Powered by local high-precision astronomical algorithms (Adhan). Zero reliance on 3rd-party prayer APIs means zero downtime.</p>
        </div>

        <!-- Feature 3: Precision Clock SVG -->
        <div class="feature-card">
          <div class="feature-icon-wrapper">
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          </div>
          <h3 class="feature-title">Sub-Second Precision</h3>
          <p class="feature-desc">Zero-idle queue architecture dispatches notifications exactly at the second prayer begins. Never miss a prayer time again.</p>
        </div>

        <!-- Feature 4: Silent Bell SVG -->
        <div class="feature-card">
          <div class="feature-icon-wrapper">
            <svg viewBox="0 0 24 24"><path d="M13.73 21a2 2 0 0 1-3.46 0"></path><path d="M18.63 13A17.89 17.89 0 0 1 18 8"></path><path d="M6.26 6.26A5.86 5.86 0 0 0 6 8c0 7-3 9-3 9h14"></path><path d="M18 8a6 6 0 0 0-9.33-5"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
          </div>
          <h3 class="feature-title">Quiet & Mindful</h3>
          <p class="feature-desc">Delivers silent text messages accompanied by thoughtful reflections. Perfect for office environments, study sessions, and meetings.</p>
        </div>

        <!-- Feature 5: Shield Lock SVG -->
        <div class="feature-card">
          <div class="feature-icon-wrapper">
            <svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
          </div>
          <h3 class="feature-title">Privacy & Anonymization</h3>
          <p class="feature-desc">GPS coordinates are automatically coarsened to ~1km resolution to protect your exact pinpoint location privacy. Delete all your data permanently anytime by texting "STOP" or sending /delete.</p>
        </div>

        <!-- Feature 6: Chat / Multi-platform SVG -->
        <div class="feature-card">
          <div class="feature-icon-wrapper">
            <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
          </div>
          <h3 class="feature-title">Multi-Platform Reach</h3>
          <p class="feature-desc">Available seamlessly on both Telegram and WhatsApp. Use whichever messaging app fits your daily workflow best.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Pricing & Monetization Section -->
  <section class="pricing-section" id="pricing">
    <div class="container">
      <h2 class="section-title">Simple, Transparent Plans</h2>
      <p class="section-subtitle">Nidaa is built to serve the community. Start free today, with optional premium features coming in the future.</p>

      <div class="pricing-grid">
        <!-- Free Core Tier -->
        <div class="pricing-card featured">
          <div class="pricing-badge">Current Standard</div>
          <div class="pricing-name">Community Free</div>
          <div class="pricing-price">$0 <span>/ forever</span></div>
          <p style="color: var(--text-muted); font-size: 14px;">Essential prayer reminders for everyone.</p>
          
          <ul class="pricing-features">
            <li><svg class="check-svg" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg> 5 Daily Prayer Reminders (Fajr to Isha)</li>
            <li><svg class="check-svg" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg> Telegram & WhatsApp Channel Access</li>
            <li><svg class="check-svg" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg> Automatic Timezone & Solar Calculation</li>
            <li><svg class="check-svg" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg> Serene Mindful Reflections</li>
            <li><svg class="check-svg" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg> Sub-second Notification Precision</li>
          </ul>

          <a href="${whatsappUrl}" target="_blank" rel="noopener" class="btn btn-whatsapp" style="width: 100%;">
            Start Using Free
          </a>
        </div>

        <!-- Pro Tier Preview -->
        <div class="pricing-card">
          <div class="pricing-badge" style="background: var(--bg-primary); color: var(--accent-primary); border: 1px solid var(--accent-primary);">Coming Soon</div>
          <div class="pricing-name">Nidaa Pro</div>
          <div class="pricing-price">- <span></span></div>
          <p style="color: var(--text-muted); font-size: 14px;">Enhanced features for customized worship routines.</p>
          
          <ul class="pricing-features">
            <li><svg class="check-svg" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg> Everything in Community Free</li>
            <li><svg class="check-svg" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg> Custom Pre-Adhan Reminders (15m before)</li>
            <li><svg class="check-svg" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg> Ramadan Suhoor & Iftar Countdowns</li>
            <li><svg class="check-svg" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg> Qibla Compass Direction Helper</li>
            <li><svg class="check-svg" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg> Family & Group Prayer Notifications</li>
          </ul>

          <button disabled class="btn" style="width: 100%; background: var(--border-color); color: var(--text-muted); cursor: not-allowed;">
            Stay Tuned
          </button>
        </div>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer>
    <div class="container">
      <div class="footer-brand">
        <img src="/nidaaIcon.jpg" alt="Nidaa Logo" style="width: 28px; height: 28px; border-radius: 50%;">
        <span>Nidaa (نِدَاء)</span>
      </div>
      <div class="footer-links">
        <a href="https://abdulmuizjimoh.vercel.app/" target="_blank" rel="noopener">Developer</a>
        <a href="/privacy">Privacy Policy</a>
        <a href="/terms">Terms of Service</a>
      </div>
      <p>&copy; ${new Date().getFullYear()} Nidaa. All rights reserved. <em>The gentle call to prayer. Your silent mu’adhin.</em></p>
    </div>
  </footer>

</body>
</html>`;
}
