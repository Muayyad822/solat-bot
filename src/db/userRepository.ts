import { getFirestore } from './firebase.js';

export interface UserProfile {
  id: string;                // e.g. "tg_12345678" or "wa_155501992"
  platform: 'telegram' | 'whatsapp';
  chatId: string;            // Telegram chatId or WhatsApp phone number
  latitude: number;
  longitude: number;
  timezone: string;          // e.g. "Africa/Lagos", "Asia/Kuala_Lumpur"
  calculationMethod: string; // e.g. "MuslimWorldLeague"
  leadTimeMinutes: number;   // 0 = exact time, 5 = 5 mins before
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// In-memory fallback map for offline / testing mode when Firestore is unavailable
const memoryUserStore = new Map<string, UserProfile>();

export class UserRepository {
  private collectionName = 'users';

  async saveUser(user: UserProfile): Promise<void> {
    try {
      const db = getFirestore();
      await db.collection(this.collectionName).doc(user.id).set(user, { merge: true });
    } catch (err) {
      console.warn('[UserRepository] Firestore write failed or uninitialized. Storing in memory fallback:', (err as Error).message);
    }
    memoryUserStore.set(user.id, user);
  }

  async getUserById(id: string): Promise<UserProfile | null> {
    try {
      const db = getFirestore();
      const doc = await db.collection(this.collectionName).doc(id).get();
      if (doc.exists) {
        return doc.data() as UserProfile;
      }
    } catch (err) {
      console.warn('[UserRepository] Firestore read failed or uninitialized. Fetching from memory fallback:', (err as Error).message);
    }
    return memoryUserStore.get(id) || null;
  }

  async getAllActiveUsers(): Promise<UserProfile[]> {
    const users: UserProfile[] = [];
    try {
      const db = getFirestore();
      const snapshot = await db.collection(this.collectionName).where('isActive', '==', true).get();
      snapshot.forEach(doc => {
        users.push(doc.data() as UserProfile);
      });
      if (users.length > 0) return users;
    } catch (err) {
      console.warn('[UserRepository] Firestore query failed. Returning memory users:', (err as Error).message);
    }
    
    // Return memory fallback if Firestore was empty or failed
    return Array.from(memoryUserStore.values()).filter(u => u.isActive);
  }
}

export const userRepository = new UserRepository();
