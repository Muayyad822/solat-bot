import dns from 'dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);

import { MongoClient } from 'mongodb';

const uri = 'mongodb+srv://nidaa_admin:muayyad%40822@cluster0.fmsks83.mongodb.net/?appName=Cluster0';

async function seed() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log('Connected to MongoDB Atlas successfully.');
    const db = client.db('nidaa');
    const collection = db.collection('users');

    const users = [
      {
        id: 'wa_2348169017058',
        platform: 'whatsapp',
        chatId: '2348169017058',
        latitude: 6.5605,
        longitude: 3.3027,
        timezone: 'Africa/Lagos',
        calculationMethod: 'MuslimWorldLeague',
        leadTimeMinutes: 0,
        isActive: true,
        lastNotified: {},
        createdAt: '2026-09-21T17:46:39.000Z',
        updatedAt: '2026-09-21T17:46:39.000Z'
      },
      {
        id: 'wa_2348134883869',
        platform: 'whatsapp',
        chatId: '2348134883869',
        latitude: 6.6864,
        longitude: 3.2153,
        timezone: 'Africa/Lagos',
        calculationMethod: 'MuslimWorldLeague',
        leadTimeMinutes: 0,
        isActive: true,
        lastNotified: {},
        createdAt: '2026-09-21T16:57:36.000Z',
        updatedAt: '2026-09-21T16:57:36.000Z'
      },
      {
        id: 'tg_5894057860',
        platform: 'telegram',
        chatId: '5894057860',
        latitude: 6.5593,
        longitude: 3.3019,
        timezone: 'Africa/Lagos',
        calculationMethod: 'MuslimWorldLeague',
        leadTimeMinutes: 0,
        isActive: true,
        lastNotified: {},
        createdAt: '2026-09-21T17:43:44.000Z',
        updatedAt: '2026-09-21T17:43:44.000Z'
      },
      {
        id: 'tg_6026120179',
        platform: 'telegram',
        chatId: '6026120179',
        latitude: 6.5590,
        longitude: 3.3016,
        timezone: 'Africa/Lagos',
        calculationMethod: 'MuslimWorldLeague',
        leadTimeMinutes: 0,
        isActive: true,
        lastNotified: {},
        createdAt: '2026-09-21T19:28:15.000Z',
        updatedAt: '2026-09-21T19:28:15.000Z'
      }
    ];

    for (const u of users) {
      await collection.updateOne({ id: u.id }, { $set: u }, { upsert: true });
    }
    console.log('✅ Successfully seeded existing 4 user profiles into MongoDB Atlas!');
    const count = await collection.countDocuments();
    console.log(`Current document count in MongoDB Atlas: ${count}`);
    await client.close();
  } catch (err) {
    console.error('Error seeding users:', err);
  }
}

seed();
