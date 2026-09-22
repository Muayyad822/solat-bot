import dns from 'dns';
import { getFirestore } from './firebase.js';
import { MongoClient, Db } from 'mongodb';
import { config } from '../config/env.js';

// Ensure reliable public DNS servers for MongoDB Atlas SRV lookups on Windows
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Ignore if DNS server override fails
}

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
  lastNotified: Record<string, string>; // e.g. { "Dhuhr": "2026-09-21" }
  createdAt: string;
  updatedAt: string;
}

export interface UserStats {
  totalUsers: number;
  telegramUsers: number;
  whatsappUsers: number;
  users: UserProfile[];
}

// In-memory fallback map for offline / testing mode when no DB is connected
const memoryUserStore = new Map<string, UserProfile>();

let mongoClient: MongoClient | null = null;
let mongoDb: Db | null = null;

function sanitizeMongoUri(uri: string): string {
  if (!uri) return '';
  let cleanUri = uri.trim();
  
  // If user pasted "MONGODB_URI=mongodb+srv://...", strip leading "MONGODB_URI="
  if (cleanUri.includes('=')) {
    const eqIdx = cleanUri.indexOf('=');
    const prefixKey = cleanUri.substring(0, eqIdx).trim();
    if (prefixKey.toUpperCase() === 'MONGODB_URI' || cleanUri.startsWith('MONGODB_URI=')) {
      cleanUri = cleanUri.substring(eqIdx + 1).trim();
    }
  }
  cleanUri = cleanUri.replace(/^["']|["']$/g, '');

  const schemeMatch = cleanUri.match(/^(mongodb(?:\+srv)?:\/\/)(.*)$/);
  if (!schemeMatch) return cleanUri;

  const [, scheme, rest] = schemeMatch;
  const slashIdx = rest.indexOf('/');
  const queryIdx = rest.indexOf('?');
  let pathStart = rest.length;
  if (slashIdx !== -1) pathStart = slashIdx;
  if (queryIdx !== -1 && queryIdx < pathStart) pathStart = queryIdx;

  const authority = rest.substring(0, pathStart);
  const pathAndQuery = rest.substring(pathStart);

  const lastAt = authority.lastIndexOf('@');
  if (lastAt === -1) return cleanUri;

  const userInfo = authority.substring(0, lastAt);
  const host = authority.substring(lastAt + 1);

  const colonIdx = userInfo.indexOf(':');
  if (colonIdx === -1) return cleanUri;

  const username = userInfo.substring(0, colonIdx);
  const rawPassword = userInfo.substring(colonIdx + 1);

  const encodedPassword = encodeURIComponent(decodeURIComponent(rawPassword));

  return `${scheme}${username}:${encodedPassword}@${host}${pathAndQuery}`;
}

async function getMongoDb(): Promise<Db | null> {
  const uri = config.mongodbUri || process.env.MONGODB_URI;
  if (!uri) {
    console.warn('[MongoDB] No MONGODB_URI configured.');
    return null;
  }
  if (mongoDb) return mongoDb;

  try {
    const fixedUri = sanitizeMongoUri(uri);
    mongoClient = new MongoClient(fixedUri);
    await mongoClient.connect();
    mongoDb = mongoClient.db('nidaa');
    console.log('[MongoDB] Connected to MongoDB Atlas successfully.');
    return mongoDb;
  } catch (err) {
    console.warn('[MongoDB] Failed to connect to MongoDB Atlas:', (err as Error).message);
    return null;
  }
}

export class UserRepository {
  private collectionName = 'users';

  async saveUser(user: UserProfile): Promise<void> {
    if (!user.lastNotified) user.lastNotified = {};
    
    // 1. Try MongoDB Atlas
    const mDb = await getMongoDb();
    if (mDb) {
      try {
        await mDb.collection(this.collectionName).updateOne(
          { id: user.id },
          { $set: user },
          { upsert: true }
        );
        memoryUserStore.set(user.id, user);
        console.log(`[UserRepository] User ${user.id} saved to MongoDB Atlas.`);
        return;
      } catch (err) {
        console.warn('[MongoDB] Write failed:', (err as Error).message);
      }
    }

    // 2. Try Firestore
    try {
      const db = getFirestore();
      await db.collection(this.collectionName).doc(user.id).set(user, { merge: true });
    } catch (err) {
      // In-memory fallback
    }

    memoryUserStore.set(user.id, user);
  }

  async getUserById(id: string): Promise<UserProfile | null> {
    // 1. Try MongoDB Atlas
    const mDb = await getMongoDb();
    if (mDb) {
      try {
        const doc = await mDb.collection(this.collectionName).findOne({ id });
        if (doc) return doc as unknown as UserProfile;
        return null;
      } catch (err) {
        // Fallback
      }
    }

    // 2. Try Firestore
    try {
      const db = getFirestore();
      const doc = await db.collection(this.collectionName).doc(id).get();
      if (doc.exists) {
        return doc.data() as UserProfile;
      }
    } catch (err) {
      // Fallback
    }

    return memoryUserStore.get(id) || null;
  }

  async getAllActiveUsers(): Promise<UserProfile[]> {
    // 1. Try MongoDB Atlas
    const mDb = await getMongoDb();
    if (mDb) {
      try {
        const docs = await mDb.collection(this.collectionName).find({ isActive: true }).toArray();
        return docs as unknown as UserProfile[];
      } catch (err) {
        // Fallback
      }
    }

    // 2. Try Firestore
    const users: UserProfile[] = [];
    try {
      const db = getFirestore();
      const snapshot = await db.collection(this.collectionName).where('isActive', '==', true).get();
      snapshot.forEach(doc => {
        users.push(doc.data() as UserProfile);
      });
      if (users.length > 0) return users;
    } catch (err) {
      // Return memory users
    }
    
    return Array.from(memoryUserStore.values()).filter(u => u.isActive);
  }

  async getAllUsers(): Promise<UserProfile[]> {
    // 1. Try MongoDB Atlas
    const mDb = await getMongoDb();
    if (mDb) {
      try {
        const docs = await mDb.collection(this.collectionName).find({}).toArray();
        return docs as unknown as UserProfile[];
      } catch (err) {
        // Fallback
      }
    }

    // 2. Try Firestore
    const users: UserProfile[] = [];
    try {
      const db = getFirestore();
      const snapshot = await db.collection(this.collectionName).get();
      snapshot.forEach(doc => {
        users.push(doc.data() as UserProfile);
      });
      if (users.length > 0) return users;
    } catch (err) {
      // Return memory users
    }
    return Array.from(memoryUserStore.values());
  }

  async markPrayerNotified(userId: string, prayerName: string, dateStr: string): Promise<void> {
    const user = await this.getUserById(userId);
    if (!user) return;
    if (!user.lastNotified) user.lastNotified = {};
    user.lastNotified[prayerName] = dateStr;
    await this.saveUser(user);
  }

  async getUserStats(): Promise<UserStats> {
    const allUsers = await this.getAllUsers();
    const telegramUsers = allUsers.filter(u => u.platform === 'telegram').length;
    const whatsappUsers = allUsers.filter(u => u.platform === 'whatsapp').length;
    return {
      totalUsers: allUsers.length,
      telegramUsers,
      whatsappUsers,
      users: allUsers,
    };
  }
}

export const userRepository = new UserRepository();
