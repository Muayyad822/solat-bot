import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
  whatsapp: {
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN || '',
    verifyToken: process.env.WHATSAPP_VERIFY_TOKEN || 'nidaa_webhook_verify_secret',
  },
  gcp: {
    projectId: process.env.GCP_PROJECT_ID || 'nidaa-dev',
    location: process.env.GCP_LOCATION || 'us-central1',
    queueName: process.env.GCP_TASKS_QUEUE || 'solat-reminder-queue',
  },
  telegramBotUrl: process.env.TELEGRAM_BOT_URL || 'https://t.me/nidaa_solat_bot',
  whatsappBotUrl: process.env.WHATSAPP_BOT_URL || 'https://wa.me/2349017109582?text=Assalamu%20alaikum%20Nidaa%2C%20I%20would%20like%20to%20get%20prayer%20reminders',
  mongodbUri: process.env.MONGODB_URI || 'mongodb+srv://nidaa_admin:muayyad%40822@cluster0.fmsks83.mongodb.net/?appName=Cluster0',
  firebaseServiceAccountPath: process.env.FIREBASE_SERVICE_ACCOUNT_PATH || '',
};
