import { Request, Response } from 'express';
import { webhookCallback } from 'grammy';
import { telegramBot } from '../channels/telegram.js';
import { config } from '../config/env.js';

export const handleTelegramWebhook = (req: Request, res: Response) => {
  if (!config.telegramBotToken) {
    res.status(500).json({ error: 'TELEGRAM_BOT_TOKEN not configured' });
    return;
  }
  return webhookCallback(telegramBot, 'express')(req, res);
};
