import { MongoClient, Db } from 'mongodb';

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectMongoDB(): Promise<Db> {
  if (db) return db;
  
  try {
    // Use a memory server for simplicity in this demo
    // In production, use a real MongoDB server
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/edunotes';
    
    client = new MongoClient(mongoUri);
    await client.connect();
    db = client.db();
    
    console.log('MongoDB connected successfully');
    
    // Create indexes
    await db.collection('notes').createIndex({ userId: 1 });
    await db.collection('notes').createIndex({ courseId: 1 });
    await db.collection('notes').createIndex({ userId: 1, courseId: 1 });
    await db.collection('notes').createIndex({ tags: 1 });
    
    return db;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

export async function getMongoDB(): Promise<Db> {
  if (!db) {
    return connectMongoDB();
  }
  return db;
}

export async function closeMongoDB(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}
