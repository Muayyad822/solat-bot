export function getAdminLoginPageHtml(errorMessage: string = ''): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Login - Nidaa (نِدَاء)</title>
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
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .login-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: 20px;
      padding: 40px 30px;
      width: 100%;
      max-width: 420px;
      box-shadow: 0 15px 35px rgba(0,0,0,0.4), 0 0 25px rgba(86, 180, 253, 0.1);
      text-align: center;
    }

    .brand-logo {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      border: 3px solid var(--accent-primary);
      box-shadow: 0 0 15px rgba(86, 180, 253, 0.3);
      margin-bottom: 16px;
    }

    h1 {
      font-size: 24px;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 6px;
    }

    p.subtitle {
      font-size: 14px;
      color: var(--text-muted);
      margin-bottom: 28px;
    }

    .error-banner {
      background: rgba(255, 87, 87, 0.15);
      border: 1px solid rgba(255, 87, 87, 0.4);
      color: #FF5757;
      padding: 10px 14px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 20px;
    }

    .form-group {
      margin-bottom: 22px;
      text-align: left;
    }

    label {
      display: block;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--accent-glow);
      margin-bottom: 8px;
    }

    input[type="password"] {
      width: 100%;
      background: rgba(11, 25, 44, 0.8);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 14px 16px;
      color: var(--text-primary);
      font-size: 15px;
      outline: none;
      transition: border-color 0.2s;
    }

    input[type="password"]:focus {
      border-color: var(--accent-primary);
      box-shadow: 0 0 10px rgba(86, 180, 253, 0.2);
    }

    .btn-submit {
      width: 100%;
      background: var(--accent-primary);
      color: var(--bg-primary);
      font-size: 15px;
      font-weight: 700;
      padding: 14px;
      border: none;
      border-radius: 12px;
      cursor: pointer;
      transition: opacity 0.2s, transform 0.15s;
    }

    .btn-submit:hover {
      opacity: 0.9;
      transform: translateY(-1px);
    }

    .back-home {
      display: inline-block;
      margin-top: 22px;
      font-size: 13px;
      color: var(--text-muted);
      text-decoration: none;
    }

    .back-home:hover {
      color: var(--accent-primary);
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="login-card">
    <img src="/nidaaIcon.jpg" alt="Nidaa Logo" class="brand-logo">
    <h1>Nidaa Admin Portal</h1>
    <p class="subtitle">Enter the secret passcode to access live metrics.</p>

    ${errorMessage ? `<div class="error-banner">${errorMessage}</div>` : ''}

    <form action="/admin/login" method="POST">
      <div class="form-group">
        <label for="passcode">Admin Passcode</label>
        <input type="password" id="passcode" name="passcode" placeholder="••••••••••••" required autofocus>
      </div>
      <button type="submit" class="btn-submit">Authenticate</button>
    </form>

    <a href="/" class="back-home">← Return to Landing Page</a>
  </div>
</body>
</html>`;
}
