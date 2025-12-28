import type { Db } from 'mongodb';
import { MongoClient } from 'mongodb';
import { setDatabase } from '../utils/mongodb';

export default defineNitroPlugin(async nitroApp => {
  const config = useRuntimeConfig();
  const mongoUri = config.mongodbUri || '';

  if (!mongoUri) {
    throw new Error('MONGODB_URI is not defined');
  }

  try {
    const mongoClient = new MongoClient(mongoUri);
    await mongoClient.connect();

    const db = mongoClient.db();
    setDatabase(db);

    await createCollectionsIfNotExist(db);

    console.log('Connected to MongoDB');

    nitroApp.hooks.hook('close', async () => {
      await mongoClient.close();
      console.log('MongoDB connection closed');
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
});

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
