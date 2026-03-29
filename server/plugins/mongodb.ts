import { useDatabase } from '../utils/mongodb';

export default defineNitroPlugin(async () => {
  try {
    await useDatabase();
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
});
