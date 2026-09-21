import * as admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { config } from '../config/env.js';

let dbInstance: admin.firestore.Firestore | null = null;

export function getFirestore(): admin.firestore.Firestore {
  if (dbInstance) return dbInstance;

  if (admin.apps.length === 0) {
    if (config.firebaseServiceAccountPath && fs.existsSync(config.firebaseServiceAccountPath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(config.firebaseServiceAccountPath, 'utf8'));
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } else {
      // Fallback to default application credentials or emulator
      admin.initializeApp({
        projectId: config.gcp.projectId,
      });
    }
  }

  dbInstance = admin.firestore();
  return dbInstance;
}
