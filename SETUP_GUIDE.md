# Nidaa 🌙 (نِدَاء) - Master Setup & Production Deployment Guide

This guide is the complete, single source of truth for setting up **Ngrok** (local development), **Telegram Bot API**, **Meta WhatsApp Cloud API**, **Firebase/Firestore**, **Environment Credentials**, **Spark vs. Blaze Plan Breakdown**, and **100% Free Production Stack (No Credit Card, No Google Cloud)** for **Nidaa (نِدَاء)**.

---

## Table of Contents
1. [Understanding Local Webhooks & Ngrok](#1-understanding-local-webhooks--ngrok)
2. [Step-by-Step Ngrok Setup (Development Only)](#2-step-by-step-ngrok-setup)
3. [Step-by-Step Telegram Bot Setup (@nidaabot)](#3-step-by-step-telegram-bot-setup-nidaabot)
4. [Step-by-Step Meta WhatsApp Cloud API Setup](#4-step-by-step-meta-whatsapp-cloud-api-setup)
5. [Firebase & Google Cloud Setup (OPTIONAL - Skip if using Section 10)](#5-firebase--google-cloud-setup)
6. [Complete Environment Variables Checklist (.env)](#6-complete-environment-variables-checklist-env)
7. [Why Ngrok is NOT for Production](#7-why-ngrok-is-not-for-production)
8. [Firebase Spark vs. Blaze Plan Breakdown ($0/mo Math)](#8-firebase-spark-vs-blaze-plan-breakdown-0mo-math)
9. [Google Cloud Run Deployment Guide](#9-google-cloud-run-deployment-guide)
10. [100% FREE Production Stack (No Google Cloud, No Credit Card Required)](#10-100-free-production-stack-no-google-cloud-no-credit-card-required)

---

## 1. Understanding Local Webhooks & Ngrok

When a user interacts with **Nidaa** on Telegram or WhatsApp (e.g. sharing location), Telegram & Meta servers send an HTTP POST request to your application (a **Webhook**).

Because your server runs locally on your computer (`http://localhost:3000`), external servers on the internet cannot reach `localhost`. 

**Ngrok** creates a secure, public HTTPS tunnel to your computer (e.g. `https://a1b2c3.ngrok-free.app`), forwarding internet webhooks directly to your local port `3000`.

---

## 2. Step-by-Step Ngrok Setup (Development Only)

### Step 2.1: Run Ngrok
You can run `ngrok` directly without global installation using `npx`:
```bash
npx ngrok http 3000
```

### Step 2.2: Authenticate Ngrok (Free Account)
1. Sign up for a free account at [dashboard.ngrok.com](https://dashboard.ngrok.com).
2. Copy your **Your Authtoken** from the dashboard.
3. Authenticate in your terminal:
   ```bash
   npx ngrok config add-authtoken YOUR_AUTHTOKEN_HERE
   ```

### Step 2.3: Start Tunnel & Copy Public URL
Run:
```bash
npx ngrok http 3000
```
Forwarding URL example: `https://7a3b-102-89-23-4.ngrok-free.app` $\rightarrow$ set as `BASE_URL` in local `.env`.

---

## 3. Step-by-Step Telegram Bot Setup (@nidaabot)

### Step 3.1: Talk to @BotFather
1. Open Telegram $\rightarrow$ Search for `@BotFather`.
2. Click **Start** or send `/newbot`.

### Step 3.2: Name Your Bot
1. **Display Name:** `Nidaa 🌙`.
2. **Bot Username:** Must end in `bot` (e.g. `nidaa_solat_bot` or `getnidaa_bot`).

### Step 3.3: Copy Your Telegram Bot Token
Save the token from BotFather to `.env` as `TELEGRAM_BOT_TOKEN`.

### Step 3.4: Register Telegram Webhook
Open browser or run in terminal:
```text
https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook?url=https://<YOUR_DOMAIN>/api/webhooks/telegram
```

---

## 4. Step-by-Step Meta WhatsApp Cloud API Setup

### Step 4.1: Meta Developer Account Registration & App Creation
1. Go to [developers.facebook.com](https://developers.facebook.com).
2. Look at the top right corner of the page:
   - If you see **Get Started**: Click **Get Started** to quickly register your Facebook account as a Meta Developer (takes 30 seconds).
   - If you see **My Apps**: Click **My Apps** (or go directly to [developers.facebook.com/apps](https://developers.facebook.com/apps)).
3. Once on the My Apps page, click the green **Create App** button.
4. Select **Other** $\rightarrow$ Click **Next**.
5. Select **Business** as the app type $\rightarrow$ Click **Next**.
6. App Name: Enter `Nidaa`.
7. Select or link your Meta Business Account $\rightarrow$ Click **Create App**.

### Step 4.2: Add WhatsApp Product & Get Phone Number ID
1. In your App Dashboard, scroll down to **Add Products to Your App**.
2. Click **Set Up** on **WhatsApp**.
3. Under the left navigation menu, go to **WhatsApp > API Setup**.
4. Under **Step 1: Select phone numbers**, copy the **Phone Number ID** (e.g. `109238475620938`).
5. Copy this ID into `.env` as `WHATSAPP_PHONE_NUMBER_ID`.
6. Under **To**, select **Manage phone number list** and add your personal WhatsApp number to receive test messages.

### Step 4.3: Create Pre-Approved Utility Message Template (`nidaa_prayer_reminder`)
*Why templates?* Meta requires pre-approved templates to send messages outside the 24-hour window.

1. In the WhatsApp API Setup page, click **Message Templates** (or open [WhatsApp Manager > Message Templates](https://business.facebook.com/wa/manage/message-templates/)).
2. Click **Create Template**.
3. **Category:** Select `UTILITY`.
4. **Name:** Enter `nidaa_prayer_reminder`.
5. **Language:** Select `English (en)`.
6. Click **Continue**.
7. **Body:** Copy and paste the following text into the Body box:
   ```text
   It is time for {{1}} at {{2}}.
   Reflection: {{3}}

   Powered by Nidaa.
   ```
8. **Add Samples for Variables:**
   - `{{1}}`: `Asr`
   - `{{2}}`: `4:15 PM`
   - `{{3}}`: `Take a moment to pause.`
9. Click **Submit**. Meta automatically approves `UTILITY` templates within **1 to 5 minutes**.

### Step 4.4: Generate Permanent System User Access Token
The temporary token generated in API Setup expires in 24 hours. Generate a permanent token:

1. Open [Meta Business Settings](https://business.facebook.com/settings).
2. Go to **Users > System Users** $\rightarrow$ Click **Add**.
3. Name: `Nidaa Worker`, System User Role: `Admin` $\rightarrow$ Click **Create System User**.
4. Click **Add Assets** $\rightarrow$ Select **Apps** $\rightarrow$ Choose your `Nidaa` app.
5. Toggle **Full Control** (Manage App) to ON $\rightarrow$ Click **Save Changes**.
6. Click **Generate New Token** next to the system user.
7. Select your `Nidaa` App.
8. Check the following permissions:
   - `whatsapp_business_messaging`
   - `whatsapp_business_management`
9. Set Token Expiration to **Never**.
10. Copy the generated token into `.env` as `WHATSAPP_ACCESS_TOKEN`.

### Step 4.5: Register WhatsApp Webhook
1. In the Meta App Dashboard, go to **WhatsApp > Configuration** in the left menu.
2. Under **Webhook**, click **Edit**.
3. **Callback URL:** `https://<YOUR_NGROK_DOMAIN>/api/webhooks/whatsapp`
4. **Verify Token:** `nidaa_webhook_verify_secret` (matches `WHATSAPP_VERIFY_TOKEN` in `.env`).
5. Click **Verify and Save**.
6. Under **Webhook fields**, find `messages` and click **Subscribe**.

### Step 4.6: Privacy Policy URL for Meta Live Mode Approval
Meta requires a valid HTTPS Privacy Policy URL to switch your App from Development Mode to Live Mode. Nidaa serves a built-in compliant Privacy Policy directly from your server:

```text
https://nidaa-bot.onrender.com/privacy
```
Enter this URL in Meta Dashboard under **App Settings > Basic > Privacy Policy URL**.

---

## 5. Firebase & Google Cloud Setup (OPTIONAL - Skip if using Section 10)

> [!NOTE]
> **If you are using the 100% Free Stack (Section 10: Render + cron-job.org), you can COMPLETELY SKIP Section 5!**
> Nidaa includes an in-memory fallback store and timer scheduler that require zero Google Cloud or Firebase credentials.

1. Create Firebase project `nidaa-dev` on [console.firebase.google.com](https://console.firebase.google.com).
2. Enable **Cloud Firestore**.
3. Generate Private Key JSON under Project Settings $\rightarrow$ Service Accounts $\rightarrow$ Save as `firebase-service-account.json`.
4. Enable **Cloud Tasks API** in GCP Console $\rightarrow$ Create Queue `solat-reminder-queue`.

---

## 6. Complete Environment Variables Checklist (.env)

Create a `.env` file in the root directory of `solat-bot`:

```env
# 1. SERVER CONFIGURATION
PORT=3000
BASE_URL=https://7a3b-102-89-23-4.ngrok-free.app

# 2. TELEGRAM BOT CREDENTIALS (From @BotFather)
TELEGRAM_BOT_TOKEN=7123456789:AAFgH1i_9xKz...

# 3. WHATSAPP CLOUD API CREDENTIALS (From Meta Portal)
WHATSAPP_PHONE_NUMBER_ID=109238475620938
WHATSAPP_ACCESS_TOKEN=EAAG...
WHATSAPP_VERIFY_TOKEN=nidaa_webhook_verify_secret

# 4. GOOGLE CLOUD & FIREBASE CREDENTIALS (OPTIONAL - Skip if using Section 10)
GCP_PROJECT_ID=nidaa-dev
GCP_LOCATION=us-central1
GCP_TASKS_QUEUE=solat-reminder-queue
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
```

---

## 7. Why Ngrok is NOT for Production

> [!WARNING]
> **Ngrok is strictly for local development & staging tests!**
> - **Uptime Dependency:** Ngrok relies on your personal computer staying powered on 24/7. If your laptop sleeps, turns off, or loses Wi-Fi, Ngrok disconnects and users will miss prayer reminders.
> - **Dynamic URLs:** Ngrok URLs change every time you restart your terminal (unless paying for custom reserved domains).
> - **Production Hosting Requirement:** Production requires a **24/7 Cloud Host** (like Render or Railway) with a permanent HTTPS domain and automated SSL certificates.

---

## 8. Firebase Spark vs. Blaze Plan Breakdown ($0/mo Math)

### Can the Firebase Spark (No-Cost Plan) run Cloud Functions or Cloud Run?
**No.** Firebase explicitly blocks deployment of Cloud Functions and Cloud Run on the free Spark Plan. You must upgrade your Firebase project to the **Blaze (Pay-As-You-Go) Plan**.

---

## 9. Google Cloud Run Deployment Guide

```bash
gcloud run deploy nidaa \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

---

## 10. 100% FREE Production Stack (No Google Cloud, No Credit Card Required)

If you want a **100% free production deployment** without Google Cloud and without entering any credit card information, use this architecture:

### The 100% Free Stack Architecture

| Layer | Service | Cost | Why It Fits |
| :--- | :--- | :--- | :--- |
| **Cloud Hosting** | **Render.com (Free Web Service)** | **$0.00 / mo** (No Credit Card) | Gives a free permanent HTTPS domain (`https://nidaa-bot.onrender.com`) with automated SSL. |
| **Database** | **MongoDB Atlas (Free M0 Cluster)** or **Supabase** | **$0.00 / mo** (No Credit Card) | 512MB free storage forever for user profile documents. |
| **Uptime & Midnight Cron** | **cron-job.org** | **$0.00 / mo** (No Credit Card) | Free external cloud cron service to keep Render server awake and trigger daily schedule generation. |
| **Timers / Queue** | Node.js In-Memory Scheduler | **$0.00** | Uses built-in `setTimeout` dynamic delay math (included in Nidaa codebase out-of-the-box). |
