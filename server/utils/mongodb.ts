import { attachDatabasePool } from '@vercel/functions';
import type { Db, MongoClient } from 'mongodb';
import { MongoClient as MongoClientCtor } from 'mongodb';

let dbPromise: Promise<Db> | null = null;

async function createCollectionsIfNotExist(db: Db) {
  const collections = await db.listCollections().toArray();
  const collectionNames = collections.map(col => col.name);

  if (!collectionNames.includes('users')) {
    await db.createCollection('users');
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ username: 1 }, { unique: true });
    console.log('Created users collection');
  }

  if (!collectionNames.includes('manhwas')) {
    await db.createCollection('manhwas');
    await db.collection('manhwas').createIndex({ id: 1 }, { unique: true });
    console.log('Created manhwas collection');
  }

  if (!collectionNames.includes('user_manhwas')) {
    await db.createCollection('user_manhwas');
    await db.collection('user_manhwas').createIndex({ userId: 1, manhwaId: 1 }, { unique: true });
    console.log('Created user_manhwas collection');
  }
}

async function connectDatabase(): Promise<Db> {
  const config = useRuntimeConfig();
  const mongoUri = config.mongodbUri || '';

  if (!mongoUri) {
    throw new Error('MONGODB_URI is not defined');
  }

  const mongoClient: MongoClient = new MongoClientCtor(mongoUri);
  attachDatabasePool(mongoClient);
  await mongoClient.connect();

  const db = mongoClient.db();
  await createCollectionsIfNotExist(db);
  console.log('Connected to MongoDB');

  return db;
}

export async function useDatabase(): Promise<Db> {
  if (!dbPromise) {
    dbPromise = connectDatabase().catch(error => {
      dbPromise = null;
      throw error;
    });
  }

  return await dbPromise;
}
