import mongoose from 'mongoose';
import { Feedback } from '../models';
import dotenv from 'dotenv';

dotenv.config();

const sampleFeedback = [
  {
    type: 'COMPLAINT',
    category: 'Service',
    message: 'The bus was late by 30 minutes and there was no announcement about the delay.',
    sentiment: 'NEGATIVE',
    status: 'PENDING',
    deviceId: 'PHONE-123',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
  },
  {
    type: 'SUGGESTION',
    category: 'Improvement',
    message: 'It would be great if we could have real-time bus tracking on the mobile app.',
    sentiment: 'POSITIVE',
    status: 'IN_PROGRESS',
    deviceId: 'PHONE-456',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
  },
  {
    type: 'PRAISE',
    category: 'Service',
    message: 'The driver was very professional and the bus was clean and comfortable.',
    sentiment: 'POSITIVE',
    status: 'RESOLVED',
    deviceId: 'PHONE-789',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
  },
  {
    type: 'COMPLAINT',
    category: 'Safety',
    message: 'The bus was overcrowded and some passengers were standing in the aisle.',
    sentiment: 'NEGATIVE',
    status: 'PENDING',
    deviceId: 'PHONE-101',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) // 4 days ago
  },
  {
    type: 'SUGGESTION',
    category: 'Technology',
    message: 'Please add contactless payment options for bus tickets.',
    sentiment: 'NEUTRAL',
    status: 'IN_PROGRESS',
    deviceId: 'PHONE-102',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
  }
];

const createSampleFeedback = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bus-tracking');
    console.log('Connected to MongoDB');

    // Clear existing feedback
    await Feedback.deleteMany({});
    console.log('Cleared existing feedback');

    // Insert sample feedback
    const feedback = await Feedback.insertMany(sampleFeedback);
    console.log('Created sample feedback:', feedback);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

createSampleFeedback(); 