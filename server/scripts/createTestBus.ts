import mongoose from 'mongoose';
import { Bus } from '../models';
import dotenv from 'dotenv';

dotenv.config();

const createTestBus = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bus-tracking');
    console.log('Connected to MongoDB');

    // Create test bus
    const testBus = new Bus({
      busNumber: 'BUS-001',
      routeNumber: 'ROUTE-001',
      capacity: 50,
      deviceId: 'PHONE-BUS-001', // This will match the device ID from the mobile app
      currentLocation: {
        type: 'Point',
        coordinates: [38.7468, 9.0227] // [longitude, latitude]
      },
      status: 'ACTIVE',
      route: {
        stations: [],
        estimatedTime: 30
      },
      schedule: {
        departureTime: new Date().toISOString(),
        arrivalTime: new Date(Date.now() + 3600000).toISOString() // 1 hour from now
      },
      isOnRoute: true,
      currentPassengerCount: 0,
      trackingData: {
        speed: 0,
        heading: 0,
        lastUpdate: new Date()
      }
    });

    await testBus.save();
    console.log('Test bus created successfully:', testBus);
  } catch (error) {
    console.error('Error creating test bus:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

createTestBus(); 