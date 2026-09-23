import { Request, Response } from 'express';
import { userRepository } from '../db/userRepository.js';
import { sendWhatsAppInteractiveCheckin } from '../channels/whatsapp.js';

export const handleBroadcastCheckin = async (req: Request, res: Response) => {
  console.log('[BroadcastWorker] Starting tonight mass check-in broadcast for active WhatsApp users...');
  try {
    const activeUsers = await userRepository.getAllActiveUsers();
    const whatsappUsers = activeUsers.filter(u => u.platform === 'whatsapp');

    let sentCount = 0;
    for (const user of whatsappUsers) {
      console.log(`[BroadcastWorker] Sending tonight's interactive overall Isha check-in to ${user.chatId}...`);
      await sendWhatsAppInteractiveCheckin(user.chatId, 'Isha', true);
      sentCount++;
    }

    console.log(`[BroadcastWorker] Successfully broadcast tonight's check-in to ${sentCount} active WhatsApp users.`);
    res.status(200).json({ status: 'success', activeWhatsAppUsers: whatsappUsers.length, totalSent: sentCount });
  } catch (err) {
    console.error('[BroadcastWorker] Error during mass broadcast:', (err as Error).message);
    res.status(500).json({ error: (err as Error).message });
  }
};
