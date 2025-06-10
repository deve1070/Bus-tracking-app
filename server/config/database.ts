import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI is not defined in environment variables');
}

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 30000, // Increase timeout to 30 seconds
      socketTimeoutMS: 45000, // Increase socket timeout
      connectTimeoutMS: 30000, // Increase connection timeout
      maxPoolSize: 10, // Limit connection pool size
      minPoolSize: 5, // Maintain minimum connections
      retryWrites: true,
      retryReads: true,
      w: 'majority', // Write concern
      wtimeoutMS: 2500, // Write timeout
      family: 4 // Force IPv4
    });

    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}; 