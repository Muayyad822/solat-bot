# Nidaa 🌙 (نِدَاء)
> *"The gentle call to prayer."*  
> *"Your silent mu’adhin."*  
> *Punctual. Private. Peaceful.*

**Nidaa** (نِدَاء) is an elegant, serene multi-channel prayer reminder bot built for Telegram and WhatsApp. Designed for individuals in offices, meetings, or quiet environments who keep their phones on silent or vibrate mode, Nidaa delivers quiet, mindful text notifications right when it's time for prayer.

---

## Brand & Persona

- **Primary Name:** Nidaa (نِدَاء)
- **Technical Handles:** `@nidaabot` / `@getnidaa`
- **Voice & Tone:** Calming, respectful, mindful, and unobtrusive.

### Sample Notification
```text
Nidaa 🌙
It is time for Asr (4:15 PM).
Take a moment to pause.
```

---

## Features

- 📍 **Automatic Location & Timezone Resolution:** Native Telegram location button & WhatsApp location payload parsing via `geo-tz`.
- 🕋 **100% Local Astronomical Calculations:** Zero third-party API polling. Calculates exact prayer times offline using `adhan` (Batoul Apps).
- ⏰ **Zero-Idle Queue Architecture:** Uses Google Cloud Tasks / dynamic timers to dispatch reminders at the exact second.
- 💬 **Multi-Channel Dispatch:** Direct adapters for Telegram Bot API (`grammY`) and WhatsApp Cloud API (`nidaa_prayer_reminder` utility template).
- 🕊️ **Mindful Reflections:** Gentle reflections and pauses accompanying each reminder.

---

## Quick Start (Local Development)

### 1. Installation
```bash
npm install
```

### 2. Run Unit Tests & Build
```bash
npm test
```

### 3. Run Development Server
```bash
npm run dev
```

---

## Meta WhatsApp Cloud API Template

For WhatsApp production messaging outside the 24-hour window, register the utility message template `nidaa_prayer_reminder`:
```text
Nidaa 🌙
It is time for {{1}} ({{2}}).
{{3}}
```
- `{{1}}`: Prayer Name (e.g. `Asr`)
- `{{2}}`: Time (e.g. `4:15 PM`)
- `{{3}}`: Reflection (e.g. `Take a moment to pause.`)
